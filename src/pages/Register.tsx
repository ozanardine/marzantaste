import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Lock, Mail, User, Phone, MapPin, Home } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove tudo que não for número
    let value = e.target.value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (DDD + 9 dígitos para celular)
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    // Formata conforme vai digitando
    if (value.length > 0) {
      value = `(${value.slice(0, 2)}${value.length > 2 ? ') ' : ''}${value.slice(2, 7)}${value.length > 7 ? '-' : ''}${value.slice(7, 11)}`;
    }
    
    setPhone(value);
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Limita a 8 dígitos
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    
    // Formata conforme vai digitando
    if (value.length > 5) {
      value = `${value.slice(0, 5)}-${value.slice(5, 8)}`;
    }
    
    setCep(value);
    
    // Busca CEP quando tiver 8 dígitos
    if (value.replace(/\D/g, '').length === 8) {
      try {
        setLoadingCep(true);
        const response = await fetch(`https://viacep.com.br/ws/${value.replace(/\D/g, '')}/json/`);
        const data = await response.json();
        
        if (data.erro) {
          toast.error('CEP não encontrado');
        } else {
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
          // Foca no campo de número após preencher o endereço
          document.getElementById('number')?.focus();
        }
      } catch (error) {
        toast.error('Erro ao buscar CEP');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const formatAddress = () => {
    const address = [
      street,
      number ? `nº ${number}` : '',
      complement ? `${complement}` : '',
      neighborhood,
      city ? `${city}/${state}` : '',
      cep ? `CEP: ${cep}` : ''
    ].filter(Boolean).join(', ');
    
    return address;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !fullName || !phone) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
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
    
    // Valida o CEP se foi preenchido
    if (cep && cep.replace(/\D/g, '').length !== 8) {
      toast.error('CEP inválido');
      return;
    }
    
    // Valida o telefone (deve ter pelo menos 10 dígitos - DDD + número)
    if (phone.replace(/\D/g, '').length < 10) {
      toast.error('Telefone inválido');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            cep: cep,
            street: street,
            number: number,
            complement: complement,
            neighborhood: neighborhood,
            city: city,
            state: state
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
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
                Nome Completo <span className="text-red-500">*</span>
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
                Celular <span className="text-red-500">*</span>
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
                  onChange={handlePhoneChange}
                  className="input pl-10"
                  placeholder="(11) 99999-9999"
                  maxLength={16}
                />
              </div>
              <p className="mt-1 text-xs text-primary/60">
                Formato: (XX) XXXXX-XXXX
              </p>
            </div>
            
            <div>
              <label htmlFor="email" className="label">
                E-mail <span className="text-red-500">*</span>
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
            
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-lg font-medium text-primary mb-3">Endereço</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="cep" className="label">CEP</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-primary/40" />
                    </div>
                    <input
                      id="cep"
                      name="cep"
                      type="text"
                      value={cep}
                      onChange={handleCepChange}
                      className="input pl-10"
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {loadingCep && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-primary/60">
                    Digite o CEP para autocompletar o endereço
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="street" className="label">Rua</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Home className="h-5 w-5 text-primary/40" />
                    </div>
                    <input
                      id="street"
                      name="street"
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="input pl-10"
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="number" className="label">Número</label>
                    <input
                      id="number"
                      name="number"
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="input"
                      placeholder="123"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="complement" className="label">Complemento</label>
                    <input
                      id="complement"
                      name="complement"
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="input"
                      placeholder="Apto, Bloco, etc."
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="neighborhood" className="label">Bairro</label>
                  <input
                    id="neighborhood"
                    name="neighborhood"
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="input"
                    placeholder="Bairro"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="label">Cidade</label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input"
                      placeholder="Cidade"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="label">Estado</label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="input"
                      placeholder="UF"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-lg font-medium text-primary mb-3">Senha</h3>
              
              <div>
                <label htmlFor="password" className="label">
                  Senha <span className="text-red-500">*</span>
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
                  Confirmar Senha <span className="text-red-500">*</span>
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