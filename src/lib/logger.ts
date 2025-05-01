/// <reference types="vite/client" />
import { toast } from 'react-hot-toast';

const isProduction = import.meta.env.PROD;
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

const formatMessage = (message: string, data?: any): string => {
  if (data) {
    return `${message} ${JSON.stringify(data, null, 2)}`;
  }
  return message;
};

/**
 * Utilitário de logging que só exibe mensagens detalhadas no ambiente Vercel
 */
export const logger = {
  /**
   * Loga informações (apenas visível no Vercel)
   */
  info: (message: string, data?: any): void => {
    if (isProduction && isVercel) {
      // Em produção no Vercel, mantenha logs para debugging
      console.info(`[INFO] ${formatMessage(message, data)}`);
    }
  },
  
  /**
   * Loga alertas (apenas visível no Vercel)
   */
  warn: (message: string, data?: any): void => {
    if (isProduction && isVercel) {
      console.warn(`[WARN] ${formatMessage(message, data)}`);
    }
  },
  
  /**
   * Loga erros (apenas visível no Vercel)
   * Em produção, mostra apenas toast para o usuário
   */
  error: (message: string, error?: any, showToast = true): void => {
    // Em produção no Vercel, mantenha logs detalhados
    if (isProduction && isVercel) {
      console.error(`[ERROR] ${message}`, error);
    }
    
    // Em produção, mostre um toast genérico para o usuário, sem detalhes técnicos
    if (isProduction && showToast) {
      toast.error('Ocorreu um erro. Tente novamente mais tarde.');
    }
    
    // Durante desenvolvimento local, mantenha logs detalhados
    if (!isProduction) {
      console.error(`[DEV] ${message}`, error);
    }
  },
  
  /**
   * Loga mensagens críticas (sempre visível em todos ambientes)
   */
  critical: (message: string, error?: any, showToast = true): void => {
    // Sempre loga erros críticos
    console.error(`[CRITICAL] ${message}`, error);
    
    // Em produção, mostre um toast mais genérico para o usuário
    if (isProduction && showToast) {
      toast.error('Erro crítico. Entre em contato com o suporte.');
    }
  }
};

export default logger; 