import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CookieIcon, ShoppingBag, Award, Heart, Star, Truck, Clock, Gift } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  // Featured Products section
  const FeaturedProducts = () => (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
            Nossos Produtos Mais Amados
          </h2>
          <p className="text-lg text-primary/70 max-w-2xl mx-auto">
            Descubra nossa seleção de cookies e chocolates artesanais, feitos com ingredientes selecionados e muito amor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cookie Box */}
          <div className="card overflow-hidden group">
            <div className="aspect-square relative overflow-hidden">
              <img 
                src="https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg"
                alt="Cookie Box Premium"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
                Mais Vendido
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-heading text-xl font-semibold text-primary mb-2">Cookie Box Premium</h3>
              <p className="text-primary/70 mb-4">12 cookies artesanais sortidos em uma caixa elegante.</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-primary">R$ 59,90</span>
                <Link to="/products" className="btn-primary py-2">Ver Detalhes</Link>
              </div>
            </div>
          </div>

          {/* Chocolate Truffles */}
          <div className="card overflow-hidden group">
            <div className="aspect-square relative overflow-hidden">
              <img 
                src="https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg"
                alt="Trufas Especiais"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-6">
              <h3 className="font-heading text-xl font-semibold text-primary mb-2">Trufas Especiais</h3>
              <p className="text-primary/70 mb-4">Caixa com 15 trufas artesanais em sabores exclusivos.</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-primary">R$ 75,90</span>
                <Link to="/products" className="btn-primary py-2">Ver Detalhes</Link>
              </div>
            </div>
          </div>

          {/* Brownie Box */}
          <div className="card overflow-hidden group">
            <div className="aspect-square relative overflow-hidden">
              <img 
                src="https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg"
                alt="Brownie Box"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 bg-success text-white px-3 py-1 rounded-full text-sm font-medium">
                Novo
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-heading text-xl font-semibold text-primary mb-2">Brownie Box</h3>
              <p className="text-primary/70 mb-4">6 brownies recheados em uma caixa especial.</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-primary">R$ 45,90</span>
                <Link to="/products" className="btn-primary py-2">Ver Detalhes</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/products" className="btn-primary inline-flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Ver Todos os Produtos
          </Link>
        </div>
      </div>
    </section>
  );

  // Features section
  const Features = () => (
    <section className="py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-primary mb-2">Qualidade Premium</h3>
            <p className="text-primary/70">Ingredientes selecionados e receitas exclusivas</p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-primary mb-2">Entrega Rápida</h3>
            <p className="text-primary/70">Entregamos em toda a cidade</p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-primary mb-2">Sempre Fresquinho</h3>
            <p className="text-primary/70">Produção diária e artesanal</p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-primary mb-2">Programa Fidelidade</h3>
            <p className="text-primary/70">Ganhe recompensas a cada compra</p>
          </div>
        </div>
      </div>
    </section>
  );

  // Hero section with animated elements
  const HeroSection = () => (
    <section className="relative bg-gradient-to-r from-primary/90 to-secondary/90 text-cream py-20">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-cookie-pattern"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              Doces Artesanais
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Cookies e Chocolates <span className="text-accent">Irresistíveis</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-cream/90">
              Descubra o sabor único dos nossos doces artesanais e participe do nosso programa de fidelidade para ganhar recompensas deliciosas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products" className="btn bg-accent text-primary hover:bg-accent/90 focus:ring-accent/70">
                Ver Produtos
              </Link>
              {!user && (
                <Link to="/register" className="btn border-2 border-cream text-cream hover:bg-cream/10 focus:ring-cream/30">
                  Cadastrar
                </Link>
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

  // Loyalty Program section
  const LoyaltyProgram = () => (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
            Programa de Fidelidade
          </h2>
          <p className="text-lg text-primary/70 max-w-2xl mx-auto">
            A cada compra você está mais perto de ganhar recompensas deliciosas.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
      </div>
    </section>
  );

  // Testimonials section
  const TestimonialsSection = () => (
    <section className="py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
            O que Nossos Clientes Dizem
          </h2>
          <p className="text-lg text-primary/70 max-w-2xl mx-auto">
            A opinião de quem já experimentou nossas delícias.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              "Os cookies são simplesmente divinos! Já experimentei várias opções do cardápio e todas são incríveis. O programa de fidelidade então é um plus maravilhoso!"
            </p>
            <div className="mt-4 flex text-accent">
              {[...Array(5)].map((_, i) => (
                <Heart key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
          </div>
          
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
              "As trufas são de outro mundo! Cada sabor é uma experiência única. Sempre que posso, passo na loja para experimentar as novidades."
            </p>
            <div className="mt-4 flex text-accent">
              {[...Array(5)].map((_, i) => (
                <Heart key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
          </div>
          
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
              "Os brownies são irresistíveis! Sempre peço para entrega e chegam super fresquinhos. O atendimento é excelente e os preços são justos."
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
          Experimente Nossas Delícias
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Faça seu pedido agora e comece a acumular pontos no nosso programa de fidelidade.
        </p>
        <Link 
          to={user ? "/products" : "/register"} 
          className="btn bg-cream text-primary hover:bg-cream/90 focus:ring-cream/30 text-lg px-8 py-4"
        >
          {user ? "Ver Produtos" : "Cadastrar e Comprar"}
        </Link>
      </div>
    </section>
  );

  return (
    <div>
      <HeroSection />
      <Features />
      <FeaturedProducts />
      <LoyaltyProgram />
      <TestimonialsSection />
      <JoinCTA />
    </div>
  );
};

export default Home;