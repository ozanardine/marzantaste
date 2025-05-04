import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import logger from '../lib/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string, addressData: AddressData) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: any | null }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: any | null }>;
  checkEmailExists: (email: string) => Promise<{ exists: boolean; error: any | null }>;
}

// Interface para os dados de endereço
interface AddressData {
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRole(session.user.id);
      }
      
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          checkUserRole(session.user.id);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Erro ao verificar papel do usuário', error);
        setIsAdmin(false);
        return false;
      }

      setIsAdmin(data?.is_admin || false);
      return data?.is_admin || false;
    } catch (error) {
      logger.error('Erro inesperado ao verificar papel do usuário', error);
      setIsAdmin(false);
      return false;
    }
  };

  const checkEmailExists = async (email: string) => {
    try {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        return { 
          exists: false, 
          error: new Error('Formato de e-mail inválido') 
        };
      }

      // Verificar usando a tabela users
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao verificar e-mail', error);
        return { exists: false, error };
      }

      return { exists: !!data, error: null };
    } catch (error) {
      logger.error('Erro ao verificar e-mail', error);
      return { exists: false, error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string, addressData: AddressData) => {
    try {
      // Input validation
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        return { error: new Error('Formato de e-mail inválido') };
      }

      if (!fullName.trim() || fullName.trim().split(' ').length < 2) {
        return { error: new Error('Por favor, insira seu nome completo') };
      }

      const phoneRegex = /^[0-9()+\- ]{8,20}$/;
      if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        return { error: new Error('Formato de telefone inválido. Use apenas números, parênteses, hífen e espaços.') };
      }

      // Create auth user with all metadata fields
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone.trim(),
            cep: addressData.cep || null,
            street: addressData.street || null,
            number: addressData.number || null,
            complement: addressData.complement || null,
            neighborhood: addressData.neighborhood || null,
            city: addressData.city || null,
            state: addressData.state || null
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (authError) {
        logger.error('Erro ao criar usuário na autenticação', { error: authError, email });
        return { error: authError };
      }

      if (!authData.user) {
        return { error: new Error('Falha ao criar usuário') };
      }

      logger.info('Usuário criado com sucesso', { 
        userId: authData.user.id,
        email 
      });

      return { error: null };
    } catch (error) {
      logger.error('Erro inesperado durante o cadastro', error);
      return { error: new Error('Ocorreu um erro inesperado durante o cadastro. Por favor, tente novamente.') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        return { error: new Error('Formato de e-mail inválido') };
      }

      // Login direto com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          return { 
            error: new Error('Por favor, confirme seu e-mail antes de fazer login. Caso não tenha recebido o e-mail de confirmação, você pode solicitar um novo.'),
            needsEmailConfirmation: true
          };
        }
        if (error.message.includes('Invalid login credentials')) {
          return { 
            error: new Error('Credenciais inválidas. Por favor, verifique seu e-mail e senha.') 
          };
        }
        throw error;
      }

      // Update last_login
      if (data.user) {
        try {
          await supabase
            .from('users')
            .update({ 
              last_login: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', data.user.id);
        } catch (updateError) {
          // Registrar o erro, mas não falhar o login
          logger.error('Erro ao atualizar último login', updateError);
        }
      }
      
      return { error: null };
    } catch (error) {
      logger.error('Erro durante o login', error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const forgotPassword = async (email: string) => {
    try {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        return { error: new Error('Formato de e-mail inválido') };
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      logger.error('Erro durante redefinição de senha', error);
      return { error };
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        return { error: new Error('Formato de e-mail inválido') };
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      logger.error('Erro ao reenviar e-mail de confirmação', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    forgotPassword,
    resendConfirmationEmail,
    checkEmailExists
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}