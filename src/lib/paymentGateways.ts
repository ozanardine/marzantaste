import { supabase } from './supabaseClient';

interface PaymentValidationResult {
  isValid: boolean;
  amount?: number;
  error?: string;
}

export async function validateInfinitePay(transactionId: string): Promise<PaymentValidationResult> {
  try {
    // Call Infinite Pay API to validate transaction
    const response = await fetch(`${import.meta.env.VITE_INFINITE_PAY_API_URL}/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_INFINITE_PAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao validar transação no Infinite Pay');
    }

    const data = await response.json();
    
    return {
      isValid: data.status === 'approved',
      amount: data.amount,
    };
  } catch (error) {
    console.error('Erro ao validar Infinite Pay:', error);
    return {
      isValid: false,
      error: 'Não foi possível validar a transação no Infinite Pay',
    };
  }
}

export async function validateMercadoPago(transactionId: string): Promise<PaymentValidationResult> {
  try {
    // Call Mercado Pago API to validate transaction
    const response = await fetch(`${import.meta.env.VITE_MERCADO_PAGO_API_URL}/v1/payments/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao validar transação no Mercado Pago');
    }

    const data = await response.json();
    
    return {
      isValid: data.status === 'approved',
      amount: data.transaction_amount,
    };
  } catch (error) {
    console.error('Erro ao validar Mercado Pago:', error);
    return {
      isValid: false,
      error: 'Não foi possível validar a transação no Mercado Pago',
    };
  }
}

export async function validatePayment(
  transactionId: string,
  gateway: 'infinite_pay' | 'mercado_pago'
): Promise<PaymentValidationResult> {
  try {
    let validationResult: PaymentValidationResult;

    if (gateway === 'infinite_pay') {
      validationResult = await validateInfinitePay(transactionId);
    } else {
      validationResult = await validateMercadoPago(transactionId);
    }

    if (validationResult.isValid) {
      return {
        isValid: true,
        amount: validationResult.amount,
      };
    }

    return {
      isValid: false,
      error: 'Transação não encontrada ou não aprovada',
    };
  } catch (error) {
    console.error('Erro ao validar pagamento:', error);
    return {
      isValid: false,
      error: 'Erro ao validar pagamento',
    };
  }
}