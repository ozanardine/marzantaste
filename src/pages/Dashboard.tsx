import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import ProgressTracker from '../components/ui/ProgressTracker';
import RewardBadge from '../components/ui/RewardBadge';
import { CreditCard, Calendar, Clock, PlusCircle, CoffeeIcon } from 'lucide-react';

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

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-[calc(100vh-64px)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary">
            Bem-vindo(a) de volta, {user?.user_metadata?.full_name || 'Amigo(a)'}!
          </h1>
          <p className="text-primary/70 mt-2">
            Acompanhe suas compras e recompensas em um só lugar.
          </p>
        </header>

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
                <Link to="/add-purchase" className="btn-primary">
                  Registrar Código de Compra
                </Link>
              </div>
            </div>
            
            {/* Recent transactions */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-heading font-semibold text-primary">
                  Compras Recentes
                </h2>
                <Link to="/purchase-history" className="text-caramel hover:text-primary transition-colors text-sm font-medium">
                  Ver Todas
                </Link>
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
                  <Link to="/add-purchase" className="btn-outline inline-flex items-center">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Registrar Primeira Compra
                  </Link>
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
                <Link to="/add-purchase" className="block w-full btn-outline text-center">
                  Registrar Código
                </Link>
                <Link to="/purchase-history" className="block w-full btn-outline text-center">
                  Ver Histórico
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;