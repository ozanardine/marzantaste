import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CookieIcon, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 font-heading text-2xl font-bold text-primary">
            <CookieIcon className="h-8 w-8 text-caramel" />
            <span>Marzan Taste</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/products" className="text-primary hover:text-caramel transition-colors px-3 py-2">
              Produtos
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-primary hover:text-caramel transition-colors px-3 py-2">
                  Minha Conta
                </Link>
                {isAdmin && (
                  <>
                    <div className="border-l border-gray-200 h-6 mx-2"></div>
                    <Link to="/admin" className="text-primary hover:text-caramel transition-colors px-3 py-2">
                      Administração
                    </Link>
                    <Link to="/admin/products" className="text-primary hover:text-caramel transition-colors px-3 py-2">
                      Gerenciar Produtos
                    </Link>
                    <Link to="/admin/users" className="text-primary hover:text-caramel transition-colors px-3 py-2">
                      Gerenciar Usuários
                    </Link>
                  </>
                )}
                <button 
                  onClick={handleSignOut}
                  className="btn-outline py-2"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-primary hover:text-caramel transition-colors px-3 py-2">
                  Entrar
                </Link>
                <Link to="/register" className="btn-primary py-2">
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden flex items-center" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-primary" />
            ) : (
              <Menu className="h-6 w-6 text-primary" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2 px-4 space-y-1">
          <Link 
            to="/products" 
            className="block px-3 py-2 text-primary hover:bg-cream rounded-md transition-colors"
            onClick={closeMenu}
          >
            Produtos
          </Link>
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className="block px-3 py-2 text-primary hover:bg-cream rounded-md transition-colors"
                onClick={closeMenu}
              >
                Minha Conta
              </Link>
              {isAdmin && (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <div className="px-3 py-1 text-xs font-medium text-primary/60 uppercase">
                    Administração
                  </div>
                  <Link 
                    to="/admin" 
                    className="block px-3 py-2 text-primary hover:bg-cream rounded-md transition-colors"
                    onClick={closeMenu}
                  >
                    Painel Admin
                  </Link>
                  <Link 
                    to="/admin/products" 
                    className="block px-3 py-2 text-primary hover:bg-cream rounded-md transition-colors"
                    onClick={closeMenu}
                  >
                    Gerenciar Produtos
                  </Link>
                  <Link 
                    to="/admin/users" 
                    className="block px-3 py-2 text-primary hover:bg-cream rounded-md transition-colors"
                    onClick={closeMenu}
                  >
                    Gerenciar Usuários
                  </Link>
                </>
              )}
              <button 
                onClick={handleSignOut}
                className="block w-full text-left px-3 py-2 text-primary hover:bg-cream rounded-md transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="block px-3 py-2 text-primary hover:bg-cream rounded-md transition-colors"
                onClick={closeMenu}
              >
                Entrar
              </Link>
              <Link 
                to="/register" 
                className="block px-3 py-2 text-primary hover:bg-cream rounded-md transition-colors"
                onClick={closeMenu}
              >
                Cadastrar
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;