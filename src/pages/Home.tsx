import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CookieIcon, ShoppingBag, Award, Heart } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  // Hero section with animated elements
  const HeroSection = () => (
    <section className="relative bg-gradient-to-r from-primary/90 to-secondary/90 text-cream py-20">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-cookie-pattern"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Recompensas tão <span className="text-accent">Doces</span> quanto nossos Produtos
            </h1>
            <p className="text-lg md:text-xl mb-8 text-cream/90">
              Participe do nosso programa de fidelidade e ganhe recompensas deliciosas a cada compra. Quanto mais você compra, mais doce fica!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link to="/dashboard" className="btn bg-accent text-primary hover:bg-accent/90 focus:ring-accent/70">
                  Ver Minhas Recompensas
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn bg-accent text-primary hover:bg-accent/90 focus:ring-accent/70">
                    Cadastrar Agora
                  </Link>
                  <Link to="/login" className="btn border-2 border-cream text-cream hover:bg-cream/10 focus:ring-cream/30">
                    Entrar
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 bg-caramel rounded-full opacity-20 absolute top-0 left-0 transform -translate-x-1/4 -translate-y-1/4"></div>
              <div className="relative z-10 animate-float">
                <CookieIcon className="w-64 h-64 text-accent" />
              </div>
              <div className="w-48 h-48 bg-accent rounded-full opacity-20 absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // How it works section
  const HowItWorksSection = () => (
    <section className="py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
            Como Funciona
          </h2>
          <p className="text-lg text-primary/70 max-w-2xl mx-auto">
            Nosso programa de fidelidade é simples, direto e deliciosamente recompensador.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="card flex flex-col items-center text-center p-8 hover:translate-y-[-4px]">
            <div className="bg-caramel/10 p-4 rounded-full mb-6">
              <ShoppingBag className="w-10 h-10 text-caramel" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-primary mb-3">
              Faça uma Compra
            </h3>
            <p className="text-primary/70">
              Compre qualquer item da nossa deliciosa seleção de cookies e chocolates.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="card flex flex-col items-center text-center p-8 hover:translate-y-[-4px]">
            <div className="bg-secondary/10 p-4 rounded-full mb-6">
              <CookieIcon className="w-10 h-10 text-secondary" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-primary mb-3">
              Registre sua Compra
            </h3>
            <p className="text-primary/70">
              Digite o código da sua transação em nosso sistema para acompanhar suas compras.
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="card flex flex-col items-center text-center p-8 hover:translate-y-[-4px]">
            <div className="bg-accent/10 p-4 rounded-full mb-6">
              <Award className="w-10 h-10 text-accent" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-primary mb-3">
              Ganhe Recompensas
            </h3>
            <p className="text-primary/70">
              Após 10 compras, resgate sua caixa premium de cookies ou chocolates grátis.
            </p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <Link to={user ? "/dashboard" : "/register"} className="btn-primary">
            {user ? "Ver Meu Progresso" : "Começar a Ganhar Recompensas"}
          </Link>
        </div>
      </div>
    </section>
  );

  // Testimonials section
  const TestimonialsSection = () => (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
            O que Nossos Clientes Dizem
          </h2>
          <p className="text-lg text-primary/70 max-w-2xl mx-auto">
            Nossos clientes fiéis adoram nossos produtos e programa de recompensas.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="card p-8">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center">
                <span className="text-primary font-medium">MC</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-primary">Maria Cruz</h4>
                <p className="text-primary/60 text-sm">Cliente Fiel</p>
              </div>
            </div>
            <p className="text-primary/80 italic">
              "O programa de fidelidade é incrível! Já ganhei três caixas de cookies grátis, e são absolutamente deliciosos. O aplicativo torna super fácil acompanhar minhas compras."
            </p>
            <div className="mt-4 flex text-accent">
              {[...Array(5)].map((_, i) => (
                <Heart key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
          </div>
          
          {/* Testimonial 2 */}
          <div className="card p-8">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center">
                <span className="text-primary font-medium">JL</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-primary">João Lima</h4>
                <p className="text-primary/60 text-sm">Amante de Chocolate</p>
              </div>
            </div>
            <p className="text-primary/80 italic">
              "A seleção de chocolates é divina, e ganhar uma caixa grátis após minha 10ª compra torna tudo ainda mais doce. A equipe é sempre simpática e o programa de recompensas é super simples de usar."
            </p>
            <div className="mt-4 flex text-accent">
              {[...Array(5)].map((_, i) => (
                <Heart key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
          </div>
          
          {/* Testimonial 3 */}
          <div className="card p-8">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center">
                <span className="text-primary font-medium">AS</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-primary">Ana Silva</h4>
                <p className="text-primary/60 text-sm">Cliente Regular</p>
              </div>
            </div>
            <p className="text-primary/80 italic">
              "Adoro acompanhar meu progresso no aplicativo e ver o quanto falta para minha próxima recompensa. Os cookies são os melhores da cidade, e o sistema de recompensas me faz sentir valorizada como cliente."
            </p>
            <div className="mt-4 flex text-accent">
              {[...Array(5)].map((_, i) => (
                <Heart key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Join now CTA
  const JoinCTA = () => (
    <section className="py-16 bg-gradient-to-r from-caramel/90 to-accent/90 text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
          Pronto para Ganhar Recompensas Doces?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Participe do nosso programa de fidelidade hoje e comece a ganhar recompensas deliciosas a cada compra. É grátis para participar!
        </p>
        <Link to={user ? "/dashboard" : "/register"} className="btn bg-cream text-primary hover:bg-cream/90 focus:ring-cream/30 text-lg px-8 py-4">
          {user ? "Ver Minhas Recompensas" : "Participar Agora"}
        </Link>
      </div>
    </section>
  );

  return (
    <div>
      <HeroSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <JoinCTA />
    </div>
  );
};

export default Home;