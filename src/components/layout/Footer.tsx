import React from 'react';
import { Link } from 'react-router-dom';
import { CookieIcon, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-heading text-2xl font-bold text-cream">
              <CookieIcon className="h-8 w-8 text-accent" />
              <span>Marzan Taste</span>
            </Link>
            <p className="mt-4 text-cream/80 max-w-md">
              Delicie-se com nossa seleção exclusiva de cookies e chocolates artesanais, e ganhe recompensas a cada compra através do nosso programa de fidelidade.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-cream hover:text-accent transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-cream hover:text-accent transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-cream hover:text-accent transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-heading font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-cream/80 hover:text-accent transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-cream/80 hover:text-accent transition-colors">
                  Entrar
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-cream/80 hover:text-accent transition-colors">
                  Cadastrar
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-cream/80 hover:text-accent transition-colors">
                  Minha Conta
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-heading font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-cream/80 hover:text-accent transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-cream/80 hover:text-accent transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/20 text-center text-cream/60">
          <p>&copy; {currentYear} Marzan Taste. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;