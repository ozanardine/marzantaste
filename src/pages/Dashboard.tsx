import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import ProgressTracker from '../components/ui/ProgressTracker';
import RewardBadge from '../components/ui/RewardBadge';
import { CreditCard, Calendar, Clock, PlusCircle, CoffeeIcon, History, Home, Receipt, Filter, User, Lock, Phone, MapPin } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { formatDateToBR, getCurrentDateTime } from '../lib/dateUtils';
import logger from '../lib/logger';

interface Purchase {
  id: string;
  transaction_id: string;
  amount: number;
  purchased_at: string;
}

interface Reward {
  id: string;
  reward_type: string;
  claimed_at: string | null;
  expiry_date: string | null;
  created_at: string;
}

interface LoyaltyCode {
  code: string;
  used_at: string;
}

interface UserProfile {
  id?: string;
  email?: string;
  full_name: string;
  phone?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  created_at?: string;
  updated_at?: string;
  is_admin?: boolean;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([]);
  const [loyaltyCodes, setLoyaltyCodes] = useState<LoyaltyCode[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'add-purchase' | 'profile'>(() => {
    const savedTab = localStorage.getItem('activeTab');
    return (savedTab as 'dashboard' | 'history' | 'add-purchase' | 'profile') || 'dashboard';
  });
  
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);
  
  // AddPurchase state
  const [loyaltyCode, setLoyaltyCode] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    full_name: user?.user_metadata?.full_name || '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // PurchaseHistory state
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [filterDate, setFilterDate] = useState<'all' | 'month' | 'year'>('all');

  useEffect(() => {
    if (user) {
      fetchData();
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    filterPurchases();
  }, [purchases, filterDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch purchases
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user?.id)
        .order('purchased_at', { ascending: false });

      if (purchaseError) throw purchaseError;
      setPurchases(purchaseData || []);
      setFilteredPurchases(purchaseData || []);
      
      // Set recent purchases (last 3)
      setRecentPurchases((purchaseData || []).slice(0, 3));

      // Fetch rewards
      const { data: rewardData, error: rewardError } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (rewardError) throw rewardError;
      setRewards(rewardData || []);

      // Fetch used loyalty codes
      const { data: codeData, error: codeError } = await supabase
        .from('loyalty_codes')
        .select('code, used_at')
        .eq('used_by', user?.id)
        .order('used_at', { ascending: false });

      if (codeError) throw codeError;
      setLoyaltyCodes(codeData || []);

    } catch (error) {
      logger.error('Erro ao carregar dados do usuário', error);
      toast.error('Falha ao carregar seus dados');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      toast.error('Erro ao carregar perfil');
      logger.error('Erro ao carregar perfil', error);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 0) {
      value = `(${value.slice(0, 2)}${value.length > 2 ? ') ' : ''}${value.slice(2, 7)}${value.length > 7 ? '-' : ''}${value.slice(7, 11)}`;
    }
    setProfile(prev => ({ ...prev, phone: value }));
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 5) {
      value = `${value.slice(0, 5)}-${value.slice(5, 8)}`;
    }
    setProfile(prev => ({ ...prev, cep: value }));
    
    if (value.replace(/\D/g, '').length === 8) {
      try {
        setLoadingCep(true);
        const response = await fetch(`https://viacep.com.br/ws/${value.replace(/\D/g, '')}/json/`);
        const data = await response.json();
        
        if (data.erro) {
          toast.error('CEP não encontrado');
        } else {
          setProfile(prev => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        }
      } catch (error) {
        toast.error('Erro ao buscar CEP');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    
    try {
      if (!profile.full_name) {
        throw new Error('O nome é obrigatório');
      }
      
      const { error } = await supabase
        .from('users')
        .update({
          ...profile,
          updated_at: getCurrentDateTime()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success('Perfil atualizado com sucesso!');
      await fetchProfile();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
      logger.error('Erro ao atualizar perfil', error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      toast.success('Senha atualizada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      logger.error('Erro ao atualizar senha', error);
      toast.error('Erro ao atualizar senha');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const filterPurchases = () => {
    const now = new Date();
    const filtered = purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.purchased_at);
      
      if (filterDate === 'month') {
        return purchaseDate.getMonth() === now.getMonth() &&
               purchaseDate.getFullYear() === now.getFullYear();
      } else if (filterDate === 'year') {
        return purchaseDate.getFullYear() === now.getFullYear();
      }
      
      return true;
    });
    
    setFilteredPurchases(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loyaltyCode || !purchaseDate) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data: codeData, error: codeError } = await supabase
        .from('loyalty_codes')
        .select('*')
        .eq('code', loyaltyCode.toUpperCase())
        .is('used_at', null)
        .single();

      if (codeError || !codeData) {
        toast.error('Código inválido ou já utilizado');
        return;
      }

      if (codeData.email !== user?.email) {
        toast.error('Este código não pertence ao seu e-mail');
        return;
      }

      const { error: updateError } = await supabase
        .from('loyalty_codes')
        .update({
          used_at: getCurrentDateTime(),
          used_by: user?.id
        })
        .eq('id', codeData.id);

      if (updateError) throw updateError;

      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert([
          {
            user_id: user?.id,
            transaction_id: loyaltyCode.toUpperCase(),
            amount: 0,
            purchased_at: getCurrentDateTime(),
            verified: true
          }
        ]);

      if (purchaseError) throw purchaseError;
      
      setIsSuccess(true);
      toast.success('Compra registrada com sucesso!');
      
      fetchData();
      
      setTimeout(() => {
        setLoyaltyCode('');
        setPurchaseDate(new Date().toISOString().split('T')[0]);
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      logger.error('Erro ao adicionar compra', error);
      toast.error('Falha ao adicionar compra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRewardComplete = async () => {
    if (purchases.length > 0 && purchases.length % 10 === 0) {
      const hasExistingReward = rewards.some(r => r.claimed_at === null);
      
      if (!hasExistingReward) {
        try {
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + 1);
          
          const { error } = await supabase
            .from('rewards')
            .insert([
              {
                user_id: user?.id,
                reward_type: 'Caixa Premium de Cookies',
                expiry_date: getCurrentDateTime(),
                created_at: getCurrentDateTime()
              }
            ]);

          if (error) throw error;
          
          toast.success('Parabéns! Você ganhou uma nova recompensa!', {
            icon: '🎉',
            duration: 5000
          });
          
          fetchData();
        } catch (error) {
          logger.error('Erro ao criar recompensa', error);
          toast.error('Falha ao criar sua recompensa');
        }
      }
    }
  };

  const getRewardStatus = () => {
    if (rewards.length === 0) return 'pending';
    const activeReward = rewards.find(r => r.claimed_at === null);
    return activeReward ? 'available' : 'claimed';
  };

  const getActiveReward = () => {
    return rewards.find(r => r.claimed_at === null);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-[calc(100vh-64px)] py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-6 sm:mb-10">
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
            Bem-vindo(a) de volta, {profile.full_name || 'Amigo(a)'}!
          </h1>
          <p className="text-primary/70 mt-2">
            Acompanhe suas compras e recompensas em um só lugar.
          </p>
        </header>
        
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'dashboard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-primary/60 hover:text-primary hover:border-primary/40'
              }`}
            >
              <Home className="w-5 h-5 mr-2" />
              Painel Principal
            </button>
            
            <button
              onClick={() => setActiveTab('add-purchase')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'add-purchase'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-primary/60 hover:text-primary hover:border-primary/40'
              }`}
            >
              <Receipt className="w-5 h-5 mr-2" />
              Adicionar Compra
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-primary/60 hover:text-primary hover:border-primary/40'
              }`}
            >
              <History className="w-5 h-5 mr-2" />
              Histórico de Compras
            </button>
            
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-primary/60 hover:text-primary hover:border-primary/40'
              }`}
            >
              <User className="w-5 h-5 mr-2" />
              Meu Perfil
            </button>
          </nav>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="card p-6">
                <ProgressTracker 
                  purchaseCount={purchases.length} 
                  totalNeeded={10}
                  onComplete={handleRewardComplete}
                />
                
                <div className="mt-6 text-center">
                  <p className="text-primary/70 mb-4">
                    Faltam {10 - (purchases.length % 10)} compras para sua próxima recompensa!
                  </p>
                  <button onClick={() => setActiveTab('add-purchase')} className="btn-primary">
                    Registrar Código de Compra
                  </button>
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-heading font-semibold text-primary">
                    Compras Recentes
                  </h2>
                  <button 
                    onClick={() => setActiveTab('history')} 
                    className="text-caramel hover:text-primary transition-colors text-sm font-medium"
                  >
                    Ver Todas
                  </button>
                </div>
                
                {recentPurchases.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {recentPurchases.map((purchase) => (
                      <div key={purchase.id} className="py-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-caramel/10 p-2 rounded-full mr-4">
                            <CoffeeIcon className="h-6 w-6 text-caramel" />
                          </div>
                          <div>
                            <p className="font-medium text-primary">
                              Código: {purchase.transaction_id}
                            </p>
                            <p className="text-sm text-primary/60">
                              {formatDateToBR(purchase.purchased_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-primary/70 mb-4">Nenhuma compra registrada ainda</p>
                    <button 
                      onClick={() => setActiveTab('add-purchase')} 
                      className="btn-outline inline-flex items-center"
                    >
                      <PlusCircle className="w-5 h-5 mr-2" />
                      Registrar Primeira Compra
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="card p-6">
                <h2 className="text-xl font-heading font-semibold text-primary mb-4">
                  Suas Recompensas
                </h2>
                
                <RewardBadge 
                  type={getRewardStatus()} 
                  rewardType={getActiveReward()?.reward_type || 'Caixa Premium de Cookies'}
                  expiryDate={getActiveReward()?.expiry_date || null}
                />
                
                {getRewardStatus() === 'available' && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-primary/70 mb-3">
                      Visite nossa loja e mostre esta tela para resgatar sua recompensa
                    </p>
                    <button className="btn-accent">
                      Mostrar Código de Verificação
                    </button>
                  </div>
                )}
              </div>
              
              <div className="card p-6">
                <h2 className="text-xl font-heading font-semibold text-primary mb-4">
                  Suas Estatísticas
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-primary/80">Total de Compras</span>
                    </div>
                    <span className="font-medium text-primary">{purchases.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-success/10 p-2 rounded-full mr-3">
                        <Calendar className="h-5 w-5 text-success" />
                      </div>
                      <span className="text-primary/80">Recompensas Resgatadas</span>
                    </div>
                    <span className="font-medium text-primary">
                      {rewards.filter(r => r.claimed_at !== null).length}
                    </span>
                  </div>
                  
                  {purchases.length > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-accent/10 p-2 rounded-full mr-3">
                          <Clock className="h-5 w-5 text-accent" />
                        </div>
                        <span className="text-primary/80">Membro Desde</span>
                      </div>
                      <span className="font-medium text-primary">
                        {formatDateToBR(purchases[purchases.length - 1].purchased_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card p-6">
                <h2 className="text-xl font-heading font-semibold text-primary mb-4">
                  Ações Rápidas
                </h2>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('add-purchase')} 
                    className="block w-full btn-outline text-center"
                  >
                    Registrar Código
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')} 
                    className="block w-full btn-outline text-center"
                  >
                    Ver Histórico Completo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h2 className="font-heading text-2xl font-bold text-primary">
                  Histórico de Compras
                </h2>
                <p className="text-primary/70 mt-2">
                  Visualize e acompanhe todas as suas compras
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <div className="flex items-center">
                    <Filter className="h-5 w-5 text-primary/70 mr-2" />
                    <select
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value as 'all' | 'month' | 'year')}
                      className="px-4 py-2 rounded-lg border border-gray-300 focus:border-caramel 
                              focus:outline-none focus:ring-2 focus:ring-caramel/50 bg-white"
                    >
                      <option value="all">Todas as Compras</option>
                      <option value="month">Este Mês</option>
                      <option value="year">Este Ano</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('add-purchase')} 
                  className="btn-primary inline-flex items-center justify-center"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Registrar Código
                </button>
              </div>
            </div>

            <div className="card overflow-hidden">
              {filteredPurchases.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                          Data
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                          Código da Compra
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPurchases.map((purchase) => (
                        <tr key={purchase.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-primary">
                              {formatDateToBR(purchase.purchased_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-caramel/10 p-2 rounded-full mr-3">
                                <CoffeeIcon className="h-5 w-5 text-caramel" />
                              </div>
                              <div className="text-sm font-medium text-primary">
                                {purchase.transaction_id}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="bg-caramel/10 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-4">
                    <CoffeeIcon className="h-8 w-8 text-caramel" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-primary mb-2">
                    Nenhuma compra encontrada
                  </h3>
                  <p className="text-primary/70 mb-6">
                    {filterDate !== 'all' 
                      ? `Nenhuma compra registrada ${filterDate === 'month' ? 'este mês' : 'este ano'}. Tente mudar o filtro.` 
                      : "Você ainda não registrou nenhuma compra."}
                  </p>
                  <button 
                    onClick={() => setActiveTab('add-purchase')} 
                    className="btn-primary inline-flex items-center"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Registrar Primeira Compra
                  </button>
                </div>
              )}
            </div>
            
            {filteredPurchases.length > 0 && (
              <div className="mt-8 text-center text-primary/70">
                <p>
                  Mostrando {filteredPurchases.length} de {purchases.length} compras
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'add-purchase' && (
          <div className="max-w-3xl mx-auto">
            <div className="card p-8">
              <h2 className="font-heading text-2xl font-bold text-primary mb-6 text-center">
                Adicionar Nova Compra
              </h2>
              
              {isSuccess ? (
                <div className="text-center py-10">
                  <div className="bg-success/10 p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6">
                    <Receipt className="h-10 w-10 text-success" />
                  </div>
                  <h3 className="text-2xl font-heading font-semibold text-primary mb-2">
                    Compra Registrada!
                  </h3>
                  <p className="text-primary/70 mb-6">
                    Sua compra foi registrada com sucesso.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        setLoyaltyCode('');
                        setPurchaseDate(new Date().toISOString().split('T')[0]);
                        setIsSuccess(false);
                      }}
                      className="btn-primary"
                    >
                      Adicionar Outra Compra
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="btn-outline"
                    >
                      Voltar ao Painel
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="loyaltyCode" className="label">
                      Código de Fidelidade
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCard className="h-5 w-5 text-primary/40" />
                      </div>
                      <input
                        id="loyaltyCode"
                        name="loyaltyCode"
                        type="text"
                        required
                        value={loyaltyCode}
                        onChange={(e) => setLoyaltyCode(e.target.value.toUpperCase())}
                        className="input pl-10"
                        placeholder="Digite o código recebido"
                        maxLength={6}
                      />
                    </div>
                    <p className="mt-1 text-xs text-primary/60">
                      Digite o código de 6 dígitos recebido na loja
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="purchaseDate" className="label">
                      Data da Compra
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-primary/40" />
                      </div>
                      <input
                        id="purchaseDate"
                        name="purchaseDate"
                        type="date"
                        required
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary w-full flex justify-center items-center"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        'Registrar Compra'
                      )}
                    </button>
                  </div>
                  
                  <div className="text-center mt-4">
                    <p className="text-sm text-primary/70">
                      O código será validado automaticamente e só pode ser usado uma vez.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-4xl">
            <div className="mb-10">
              <h2 className="font-heading text-2xl font-bold text-primary mb-2">
                Meus Dados
              </h2>
              <p className="text-primary/70">
                Visualize e atualize suas informações pessoais
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="card p-6">
                <h3 className="text-xl font-heading font-semibold text-primary mb-6 flex items-center">
                  <User className="h-5 w-5 mr-2 text-caramel" />
                  Informações Pessoais
                </h3>
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-primary/70 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="input bg-gray-100 cursor-not-allowed w-full"
                    />
                    <p className="mt-1 text-xs text-primary/60">
                      O e-mail não pode ser alterado
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-primary/70 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={profile.full_name}
                      onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                      required
                      className="input w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-primary/70 mb-1">
                      Telefone/Celular
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-primary/40" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        value={profile.phone || ''}
                        onChange={handlePhoneChange}
                        placeholder="(00) 00000-0000"
                        className="input pl-10 w-full"
                        maxLength={16}
                      />
                    </div>
                    <p className="mt-1 text-xs text-primary/60">
                      Formato: (XX) XXXXX-XXXX
                    </p>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
                    <h4 className="font-medium text-primary">Endereço</h4>
                    
                    <div>
                      <label htmlFor="cep" className="block text-sm font-medium text-primary/70 mb-1">
                        CEP
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-primary/40" />
                        </div>
                        <input
                          type="text"
                          id="cep"
                          value={profile.cep || ''}
                          onChange={handleCepChange}
                          placeholder="00000-000"
                          className="input pl-10 w-full"
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
                    
                    <div>
                      <label htmlFor="street" className="block text-sm font-medium text-primary/70 mb-1">
                        Rua
                      </label>
                      <input
                        type="text"
                        id="street"
                        value={profile.street || ''}
                        onChange={(e) => setProfile({...profile, street: e.target.value})}
                        placeholder="Rua, Avenida, etc."
                        className="input w-full"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="number" className="block text-sm font-medium text-primary/70 mb-1">
                          Número
                        </label>
                        <input
                          type="text"
                          id="number"
                          value={profile.number || ''}
                          onChange={(e) => setProfile({...profile, number: e.target.value})}
                          placeholder="123"
                          className="input w-full"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="complement" className="block text-sm font-medium text-primary/70 mb-1">
                          Complemento
                        </label>
                        <input
                          type="text"
                          id="complement"
                          value={profile.complement || ''}
                          onChange={(e) => setProfile({...profile, complement: e.target.value})}
                          placeholder="Apto, Bloco, etc."
                          className="input w-full"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="neighborhood" className="block text-sm font-medium text-primary/70 mb-1">
                        Bairro
                      </label>
                      <input
                        type="text"
                        id="neighborhood"
                        value={profile.neighborhood || ''}
                        onChange={(e) => setProfile({...profile, neighborhood: e.target.value})}
                        placeholder="Bairro"
                        className="input w-full"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-primary/70 mb-1">
                          Cidade
                        </label>
                        <input
                          type="text"
                          id="city"
                          value={profile.city || ''}
                          onChange={(e) => setProfile({...profile, city: e.target.value})}
                          placeholder="Cidade"
                          className="input w-full"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-primary/70 mb-1">
                          Estado
                        </label>
                        <input
                          type="text"
                          id="state"
                          value={profile.state || ''}
                          onChange={(e) => setProfile({...profile, state: e.target.value})}
                          placeholder="UF"
                          className="input w-full"
                          maxLength={2}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="btn-primary w-full flex justify-center items-center"
                  >
                    {isSavingProfile ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </button>
                </form>
              </div>
              
              <div className="card p-6">
                <h3 className="text-xl font-heading font-semibold text-primary mb-6 flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-caramel" />
                  Segurança
                </h3>
                
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-primary/70 mb-1">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="input w-full"
                      placeholder="Digite sua nova senha"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary/70 mb-1">
                      Confirmar Senha
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="input w-full"
                      placeholder="Confirme sua nova senha"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="btn-primary w-full flex justify-center items-center"
                    >
                      {isChangingPassword ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        'Atualizar Senha'
                      )}
                    </button>
                  </div>
                </form>
                
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <h4 className="text-sm font-medium text-primary/70 mb-2">Dicas de Segurança</h4>
                  <ul className="text-xs text-primary/60 space-y-1">
                    <li>• Use senhas fortes com pelo menos 8 caracteres</li>
                    <li>• Combine letras maiúsculas, minúsculas, números e símbolos</li>
                    <li>• Não use a mesma senha em sites diferentes</li>
                    <li>• Evite informações pessoais facilmente adivinháveis</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;