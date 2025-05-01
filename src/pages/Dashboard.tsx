import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import ProgressTracker from '../components/ui/ProgressTracker';
import RewardBadge from '../components/ui/RewardBadge';
import { CreditCard, Calendar, Clock, PlusCircle, CoffeeIcon, History, Home, Receipt, Filter } from 'lucide-react';

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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([]);
  const [loyaltyCodes, setLoyaltyCodes] = useState<LoyaltyCode[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'add-purchase'>(() => {
    // Recuperar a aba ativa do localStorage ou usar 'dashboard' como padrão
    const savedTab = localStorage.getItem('activeTab');
    return (savedTab as 'dashboard' | 'history' | 'add-purchase') || 'dashboard';
  });
  
  // Salvar a aba ativa no localStorage sempre que ela mudar
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
  
  // PurchaseHistory state
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [filterDate, setFilterDate] = useState<'all' | 'month' | 'year'>('all');

  useEffect(() => {
    if (user) {
      fetchData();
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
      console.error('Erro ao carregar dados:', error);
      toast.error('Falha ao carregar seus dados');
    } finally {
      setLoading(false);
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

  const handleRewardComplete = async () => {
    // Check if a reward should be created
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
                expiry_date: expiryDate.toISOString(),
              }
            ]);

          if (error) throw error;
          
          toast.success('Parabéns! Você ganhou uma nova recompensa!', {
            icon: '🎉',
            duration: 5000
          });
          
          // Refresh rewards
          fetchData();
        } catch (error) {
          console.error('Erro ao criar recompensa:', error);
          toast.error('Falha ao criar sua recompensa');
        }
      }
    }
  };

  const getRewardStatus = () => {
    if (rewards.length === 0) {
      return 'pending';
    }
    
    const activeReward = rewards.find(r => r.claimed_at === null);
    if (activeReward) {
      return 'available';
    }
    
    return 'claimed';
  };

  const getActiveReward = () => {
    return rewards.find(r => r.claimed_at === null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  // AddPurchase functionality
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loyaltyCode || !purchaseDate) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if code exists and is unused
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

      // Verify if code belongs to user's email
      if (codeData.email !== user?.email) {
        toast.error('Este código não pertence ao seu e-mail');
        return;
      }

      // Mark code as used
      const { error: updateError } = await supabase
        .from('loyalty_codes')
        .update({
          used_at: new Date().toISOString(),
          used_by: user?.id
        })
        .eq('id', codeData.id);

      if (updateError) throw updateError;

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert([
          {
            user_id: user?.id,
            transaction_id: loyaltyCode.toUpperCase(),
            amount: 0, // Amount not needed for loyalty codes
            purchased_at: new Date(purchaseDate).toISOString(),
            verified: true // Auto-verified since it's a valid loyalty code
          }
        ]);

      if (purchaseError) throw purchaseError;
      
      // Show success state
      setIsSuccess(true);
      toast.success('Compra registrada com sucesso!');
      
      // Refresh data
      fetchData();
      
      // Reset form after delay
      setTimeout(() => {
        setLoyaltyCode('');
        setPurchaseDate(new Date().toISOString().split('T')[0]);
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao adicionar compra:', error);
      toast.error('Falha ao adicionar compra');
    } finally {
      setIsLoading(false);
    }
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
            Bem-vindo(a) de volta, {user?.user_metadata?.full_name || 'Amigo(a)'}!
          </h1>
          <p className="text-primary/70 mt-2">
            Acompanhe suas compras e recompensas em um só lugar.
          </p>
        </header>
        
        {/* Tabs Navigation */}
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
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content - left 2/3 */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress tracker */}
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
              
              {/* Recent transactions */}
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
                              {formatDate(purchase.purchased_at)}
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
            
            {/* Sidebar - right 1/3 */}
            <div className="space-y-8">
              {/* Reward status */}
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
              
              {/* Stats card */}
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
                        {formatDate(purchases[purchases.length - 1].purchased_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick actions */}
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

        {/* History Tab */}
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
                              {formatDate(purchase.purchased_at)}
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

        {/* Add Purchase Tab */}
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
      </div>
    </div>
  );
};

export default Dashboard;