import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { CoffeeIcon, Filter, PlusCircle } from 'lucide-react';

interface Purchase {
  id: string;
  transaction_id: string;
  purchased_at: string;
}

const PurchaseHistory: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [filterDate, setFilterDate] = useState<'all' | 'month' | 'year'>('all');

  useEffect(() => {
    if (user) {
      fetchPurchases();
    }
  }, [user]);

  useEffect(() => {
    filterPurchases();
  }, [purchases, filterDate]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user?.id)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      
      setPurchases(data || []);
      setFilteredPurchases(data || []);
    } catch (error) {
      console.error('Erro ao buscar compras:', error);
      toast.error('Falha ao carregar histórico de compras');
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-primary">
              Histórico de Compras
            </h1>
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
            <Link to="/add-purchase" className="btn-primary inline-flex items-center justify-center">
              <PlusCircle className="w-5 h-5 mr-2" />
              Registrar Código
            </Link>
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
              <Link to="/add-purchase" className="btn-primary inline-flex items-center">
                <PlusCircle className="w-5 h-5 mr-2" />
                Registrar Primeira Compra
              </Link>
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
    </div>
  );
};

export default PurchaseHistory;