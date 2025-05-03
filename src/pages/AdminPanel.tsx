import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { Search, User, Gift, Plus, Copy, Mail } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { formatDateToBR, getCurrentDateTime } from '../lib/dateUtils';
import logger from '../lib/logger';

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

interface LoyaltyCode {
  id: string;
  code: string;
  email: string;
  created_at: string;
  used_at: string | null;
  used_by: string | null;
}

interface Reward {
  id: string;
  user_id: string;
  reward_type: string;
  claimed_at: string | null;
  expiry_date: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

const AdminPanel: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rewards' | 'users' | 'loyalty-codes'>('loyalty-codes');
  const [activeRewards, setActiveRewards] = useState<Reward[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loyaltyCodes, setLoyaltyCodes] = useState<LoyaltyCode[]>([]);
  const [newCodeEmail, setNewCodeEmail] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: rewardData, error: rewardError } = await supabase
        .from('rewards')
        .select(`
          *,
          user:users(email, full_name)
        `)
        .is('claimed_at', null)
        .order('created_at', { ascending: false });

      if (rewardError) throw rewardError;
      
      const formattedRewards = (rewardData || []).map((reward: any) => ({
        ...reward,
        user_email: reward.user?.email,
        user_name: reward.user?.full_name,
      }));
      
      setActiveRewards(formattedRewards);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (userError) throw userError;
      setUsers(userData || []);

      const { data: loyaltyData, error: loyaltyError } = await supabase
        .from('loyalty_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (loyaltyError) throw loyaltyError;
      setLoyaltyCodes(loyaltyData || []);

    } catch (error) {
      logger.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRewardClaimed = async (rewardId: string) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update({ claimed_at: getCurrentDateTime() })
        .eq('id', rewardId);

      if (error) throw error;
      
      toast.success('Reward marked as claimed');
      
      fetchData();
    } catch (error) {
      logger.error('Error updating reward:', error);
      toast.error('Failed to update reward');
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateCode = async () => {
    if (!newCodeEmail) {
      toast.error('Por favor, insira um e-mail válido');
      return;
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(newCodeEmail)) {
      toast.error('Por favor, insira um e-mail válido');
      return;
    }

    setIsGeneratingCode(true);

    try {
      const code = generateRandomCode();
      
      const { error } = await supabase
        .from('loyalty_codes')
        .insert([
          {
            code,
            email: newCodeEmail,
            created_by: user?.id,
            created_at: getCurrentDateTime()
          }
        ]);

      if (error) throw error;

      await sendCodeEmail(code, newCodeEmail);

      toast.success('Código gerado e enviado por e-mail!');
      setNewCodeEmail('');
      fetchData();
    } catch (error) {
      logger.error('Error generating code:', error);
      toast.error('Falha ao gerar código');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const sendCodeEmail = async (code: string, email: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-code-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      logger.error('Error sending email:', error);
      toast.error('Falha ao enviar e-mail');
    }
  };

  const openWhatsAppModal = (code: string) => {
    setSelectedCode(code);
    setPhoneNumber('');
    setShowWhatsAppModal(true);
  };

  const shareViaWhatsApp = () => {
    if (!phoneNumber) {
      toast.error('Por favor, insira um número de telefone');
      return;
    }

    const formattedPhone = phoneNumber.replace(/\D/g, '');
    const message = `Seu código de fidelidade Marzan Taste: ${selectedCode}\n\nResgate em: https://marzantaste.com`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    setShowWhatsAppModal(false);
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Código copiado para a área de transferência!');
    } catch (error) {
      logger.error('Error copying to clipboard:', error);
      toast.error('Falha ao copiar código');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold text-primary mb-4">
            Acesso Negado
          </h1>
          <p className="text-primary/70">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-[calc(100vh-64px)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-primary">
            Painel Administrativo
          </h1>
          <p className="text-primary/70 mt-2">
            Gerencie recompensas, usuários e códigos de fidelidade
          </p>
        </header>

        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('rewards')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rewards'
                  ? 'border-caramel text-caramel'
                  : 'border-transparent text-primary/60 hover:text-primary/80 hover:border-gray-300'
              }`}
            >
              Recompensas Ativas ({activeRewards.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-caramel text-caramel'
                  : 'border-transparent text-primary/60 hover:text-primary/80 hover:border-gray-300'
              }`}
            >
              Usuários ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('loyalty-codes')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'loyalty-codes'
                  ? 'border-caramel text-caramel'
                  : 'border-transparent text-primary/60 hover:text-primary/80 hover:border-gray-300'
              }`}
            >
              Códigos de Fidelidade ({loyaltyCodes.length})
            </button>
          </nav>
        </div>

        <div className="card overflow-hidden">
          {activeTab === 'rewards' && (
            <div>
              <h2 className="px-6 py-4 text-xl font-heading font-semibold text-primary border-b border-gray-200">
                Recompensas Ativas
              </h2>
              
              {activeRewards.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                          Reward Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                          Created At
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                          Expiry Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeRewards.map((reward) => (
                        <tr key={reward.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-primary">
                                  {reward.user_name}
                                </div>
                                <div className="text-sm text-primary/60">
                                  {reward.user_email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Gift className="h-5 w-5 text-accent mr-2" />
                              <span className="text-sm font-medium text-primary">
                                {reward.reward_type}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-primary">
                              {formatDateToBR(reward.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-primary">
                              {reward.expiry_date ? formatDateToBR(reward.expiry_date) : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleMarkRewardClaimed(reward.id)}
                              className="btn-accent py-1 px-3 text-xs inline-flex items-center"
                            >
                              <Gift className="h-4 w-4 mr-1" />
                              Mark Claimed
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="bg-accent/10 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-4">
                    <Gift className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-primary mb-2">
                    No active rewards
                  </h3>
                  <p className="text-primary/70">
                    All rewards have been claimed
                  </p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'users' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-heading font-semibold text-primary mb-4">
                  Users
                </h2>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-primary/40" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              
              {filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                          Joined
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-primary">
                                  {user.full_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-primary">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-primary">
                              {formatDateToBR(user.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.id === user.id ? (
                              <span className="badge-primary">
                                Admin (You)
                              </span>
                            ) : (
                              <span className="badge-caramel">
                                Customer
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <h3 className="text-xl font-heading font-semibold text-primary mb-2">
                    No users found
                  </h3>
                  <p className="text-primary/70">
                    Try adjusting your search
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'loyalty-codes' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-heading font-semibold text-primary mb-4">
                  Códigos de Fidelidade
                </h2>
                <div className="flex gap-4">
                  <input
                    type="email"
                    placeholder="E-mail do cliente"
                    value={newCodeEmail}
                    onChange={(e) => setNewCodeEmail(e.target.value)}
                    className="input flex-1"
                  />
                  <button
                    onClick={handleGenerateCode}
                    disabled={isGeneratingCode}
                    className="btn-primary flex items-center"
                  >
                    {isGeneratingCode ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Gerar Código
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {loyaltyCodes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                          Código
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                          E-mail
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                          Criado em
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loyaltyCodes.map((code) => (
                        <tr key={code.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-primary">
                              {code.code}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-primary">
                              {code.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-primary">
                              {formatDateToBR(code.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {code.used_at ? (
                              <span className="badge-success">
                                Utilizado
                              </span>
                            ) : (
                              <span className="badge-warning">
                                Disponível
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {!code.used_at && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => copyToClipboard(code.code)}
                                  className="text-primary hover:text-caramel transition-colors"
                                  title="Copiar código"
                                >
                                  <Copy className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => sendCodeEmail(code.code, code.email)}
                                  className="text-primary hover:text-caramel transition-colors"
                                  title="Reenviar por e-mail"
                                >
                                  <Mail className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => openWhatsAppModal(code.code)}
                                  className="text-primary hover:text-caramel transition-colors"
                                  title="Compartilhar via WhatsApp"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="h-5 w-5 fill-current"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                  </svg>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="bg-primary/10 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-4">
                    <Gift className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-primary mb-2">
                    Nenhum código gerado
                  </h3>
                  <p className="text-primary/70">
                    Gere códigos de fidelidade para seus clientes
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-heading font-semibold text-primary mb-4">
              Compartilhar via WhatsApp
            </h3>
            <div className="mb-4">
              <label className="label">Número do WhatsApp</label>
              <PhoneInput
                international
                defaultCountry="BR"
                value={phoneNumber}
                onChange={setPhoneNumber}
                className="input"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="btn-outline"
              >
                Cancelar
              </button>
              <button
                onClick={shareViaWhatsApp}
                className="btn-primary"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;