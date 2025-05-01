import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HomeIcon, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Redirecionar após 5 segundos
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirecionar para dashboard se autenticado, ou para home se não
          navigate(user ? '/dashboard' : '/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, user]);

  return (
    <div className="bg-cream min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center card p-8">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-heading font-semibold text-primary/80 mb-4">
          Página não encontrada
        </h2>
        <p className="text-primary/70 mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <p className="text-sm text-primary/60 mb-8">
          Redirecionando em <span className="font-bold">{countdown}</span> segundos...
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-outline flex items-center justify-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            Voltar para a Página Inicial
          </Link>
          {user && (
            <Link to="/dashboard" className="btn-primary flex items-center justify-center gap-2">
              <HomeIcon className="h-5 w-5" />
              Ir para o Painel
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound; 