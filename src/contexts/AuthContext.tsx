import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import logger from '../lib/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string, address?: string) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: any | null }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: any | null }>;
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
        throw error;
      }

      setIsAdmin(data?.is_admin || false);
      return data?.is_admin || false;
    } catch (error) {
      logger.error('Erro inesperado ao verificar papel do usuário', error);
      return false;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string, address?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            address: address || ''
          }
        }
      });

      if (error) throw error;

      if (data?.user?.identities?.length === 0) {
        return { error: new Error('Um e-mail de confirmação foi enviado. Por favor, verifique sua caixa de entrada e confirme seu e-mail antes de fazer login.') };
      }

      return { error: null };
    } catch (error) {
      logger.error('Erro durante o cadastro', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          return { 
            error: new Error('Por favor, confirme seu e-mail antes de fazer login. Caso não tenha recebido o e-mail de confirmação, você pode solicitar um novo.'),
            needsEmailConfirmation: true
          };
        }
        if (error.message.includes('Invalid login credentials')) {
          return { 
            error: new Error('E-mail ou senha incorretos. Por favor, verifique suas credenciais.') 
          };
        }
        throw error;
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
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
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
    resendConfirmationEmail
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