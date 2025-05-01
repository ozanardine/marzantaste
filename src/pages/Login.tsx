import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Lock, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message || 'Falha ao entrar');
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
                <Link to="#" className="text-sm font-medium text-caramel hover:text-primary transition-colors">
                  Esqueceu sua senha?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-primary/40" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                />
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