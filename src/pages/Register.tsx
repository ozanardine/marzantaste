import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Lock, Mail, User, Phone } from 'lucide-react';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !fullName || !phone) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, fullName, phone);
      
      if (error) {
        toast.error(error.message || 'Falha ao criar conta');
      } else {
        toast.success('Conta criada com sucesso! Você já pode entrar.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
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
            Crie sua Conta
          </h2>
          <p className="mt-2 text-primary/70">
            Participe do nosso programa de fidelidade e comece a ganhar recompensas doces
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="label">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-primary/40" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input pl-10"
                  placeholder="João Silva"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phone" className="label">
                Celular
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-primary/40" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input pl-10"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            
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
              <label htmlFor="password" className="label">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-primary/40" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-primary/60">
                A senha deve ter pelo menos 6 caracteres
              </p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirmar Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-primary/40" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-caramel focus:ring-caramel border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-primary/70">
              Eu concordo com os{' '}
              <Link to="/terms" className="font-medium text-caramel hover:text-primary transition-colors">
                Termos de Serviço
              </Link>{' '}
              e{' '}
              <Link to="/privacy" className="font-medium text-caramel hover:text-primary transition-colors">
                Política de Privacidade
              </Link>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex justify-center items-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Criar Conta'
            )}
          </button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-primary/70">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium text-caramel hover:text-primary transition-colors">
                Entre aqui
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;