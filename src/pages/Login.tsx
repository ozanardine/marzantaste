import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Lock, Mail, RefreshCw, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const { signIn, resendConfirmationEmail, forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error('Por favor, insira seu e-mail');
      return;
    }

    setResendingEmail(true);
    try {
      const { error } = await resendConfirmationEmail(email);
      
      if (error) {
        toast.error('Erro ao reenviar e-mail de confirmação');
      } else {
        toast.success('E-mail de confirmação reenviado com sucesso! Por favor, verifique sua caixa de entrada.');
      }
    } catch (error) {
      toast.error('Ocorreu um erro inesperado');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      toast.error('Por favor, insira seu e-mail');
      return;
    }

    setIsSendingReset(true);
    try {
      const { error } = await forgotPassword(forgotPasswordEmail);
      
      if (error) {
        toast.error('Erro ao enviar e-mail de recuperação de senha');
      } else {
        toast.success('E-mail de recuperação de senha enviado com sucesso! Por favor, verifique sua caixa de entrada.');
        setIsForgotPassword(false);
        setForgotPasswordEmail('');
      }
    } catch (error) {
      toast.error('Ocorreu um erro inesperado');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error, needsEmailConfirmation } = await signIn(email, password);
      
      if (error) {
        if (needsEmailConfirmation) {
          toast((t) => (
            <div className="flex flex-col gap-2">
              <p>{error.message}</p>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  handleResendConfirmation();
                }}
                disabled={resendingEmail}
                className="btn-secondary text-sm py-1 flex items-center justify-center gap-2"
              >
                {resendingEmail ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  'Reenviar e-mail de confirmação'
                )}
              </button>
            </div>
          ), {
            duration: 10000
          });
        } else {
          toast.error(error.message || 'Falha ao entrar');
        }
      } else {
        toast.success('Login realizado com sucesso');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error('Ocorreu um erro inesperado');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isForgotPassword) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
          <div className="text-center">
            <h2 className="text-3xl font-heading font-bold text-primary">
              Recuperar Senha
            </h2>
            <p className="mt-2 text-primary/70">
              Digite seu e-mail para receber as instruções
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label htmlFor="forgotPasswordEmail" className="label">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-primary/40" />
                </div>
                <input
                  id="forgotPasswordEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isSendingReset}
                className="btn-primary w-full flex justify-center items-center"
              >
                {isSendingReset ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Enviar instruções'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-[calc(100vh-64px)] bg-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-heading font-bold text-primary">
            Bem-vindo de Volta
          </h2>
          <p className="mt-2 text-primary/70">
            Entre para acessar suas recompensas
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-primary/40" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm font-medium text-caramel hover:text-primary transition-colors"
                >
                  Esqueceu sua senha?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-primary/40" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary/40 hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex justify-center items-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Entrar'
            )}
          </button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-primary/70">
              Não tem uma conta?{' '}
              <Link to="/register" className="font-medium text-caramel hover:text-primary transition-colors">
                Cadastre-se agora
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;