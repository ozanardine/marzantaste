import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { CreditCard, Calendar, ReceiptText } from 'lucide-react';

const AddPurchase: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loyaltyCode, setLoyaltyCode] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  return (
    <div className="bg-cream min-h-[calc(100vh-64px)] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <h1 className="font-heading text-3xl font-bold text-primary mb-6 text-center">
            Adicionar Nova Compra
          </h1>
          
          {isSuccess ? (
            <div className="text-center py-10">
              <div className="bg-success/10 p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6">
                <ReceiptText className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-2xl font-heading font-semibold text-primary mb-2">
                Compra Registrada!
              </h2>
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
                  onClick={() => navigate('/dashboard')}
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
    </div>
  );
};

export default AddPurchase;