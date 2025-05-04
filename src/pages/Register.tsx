import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Lock, Mail, User, Phone, MapPin, Home, Eye, EyeOff, Check, X } from 'lucide-react';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    number: false,
    special: false,
    uppercase: false,
    lowercase: false,
    match: false
  });

  const validatePassword = (password: string, confirmPassword: string = '') => {
    setPasswordValidation({
      length: password.length >= 8,
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      match: password === confirmPassword && password !== ''
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword, confirmPassword);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    validatePassword(password, newConfirmPassword);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 0) {
      value = `(${value.slice(0, 2)}${value.length > 2 ? ') ' : ''}${value.slice(2, 7)}${value.length > 7 ? '-' : ''}${value.slice(7, 11)}`;
    }
    setPhone(value);
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 5) {
      value = `${value.slice(0, 5)}-${value.slice(5, 8)}`;
    }
    setCep(value);
    
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
          document.getElementById('number')?.focus();
        }
      } catch (error) {
        toast.error('Erro ao buscar CEP');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const getAddressData = () => {
    return {
      cep: cep.replace(/\D/g, ''),
      street,
      number,
      complement,
      neighborhood,
      city,
      state
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !fullName || !phone) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    if (!Object.values(passwordValidation).every(Boolean)) {
      toast.error('Por favor, atenda a todos os requisitos de senha');
      return;
    }
    
    if (cep && cep.replace(/\D/g, '').length !== 8) {
      toast.error('CEP inválido');
      return;
    }
    
    if (phone.replace(/\D/g, '').length < 10) {
      toast.error('Telefone inválido');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Enviar dados de endereço utilizando o novo formato de objeto
      const addressData = getAddressData();
      
      // Log para debug
      console.log('Enviando dados de cadastro:', {
        email,
        fullName,
        phone,
        addressData
      });
      
      const { error } = await signUp(email, password, fullName, phone, addressData);
      
      if (error) {
        if (error.message?.includes('already registered') || error.message?.includes('já está')) {
          toast.error('Este e-mail já está cadastrado. Por favor, use outro e-mail ou faça login.');
        } else {
          toast.error(error.message || 'Erro ao criar conta');
        }
      } else {
        toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
      console.error('Erro durante cadastro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${valid ? 'text-success' : 'text-primary/60'}`}>
      {valid ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      {text}
    </div>
  );
  
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
                  placeholder="(00) 00000-0000"
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
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={handlePasswordChange}
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
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary/40 hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                <h4 className="text-sm font-medium text-primary mb-2">Requisitos de senha:</h4>
                <ValidationItem valid={passwordValidation.length} text="Mínimo de 8 caracteres" />
                <ValidationItem valid={passwordValidation.lowercase} text="Pelo menos uma letra minúscula" />
                <ValidationItem valid={passwordValidation.uppercase} text="Pelo menos uma letra maiúscula" />
                <ValidationItem valid={passwordValidation.number} text="Pelo menos um número" />
                <ValidationItem valid={passwordValidation.special} text="Pelo menos um caractere especial" />
                <ValidationItem valid={passwordValidation.match} text="As senhas coincidem" />
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