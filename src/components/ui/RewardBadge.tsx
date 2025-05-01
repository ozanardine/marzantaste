import React from 'react';
import { Award, Gift } from 'lucide-react';

interface RewardBadgeProps {
  type: 'pending' | 'available' | 'claimed';
  rewardType?: string;
  expiryDate?: string | null;
}

const RewardBadge: React.FC<RewardBadgeProps> = ({ 
  type, 
  rewardType = 'Caixa Premium de Cookies', 
  expiryDate = null 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getBadgeContent = () => {
    switch (type) {
      case 'pending':
        return {
          icon: <Award className="w-8 h-8 text-secondary mr-2" />,
          title: 'Recompensa Pendente',
          description: `Faça mais compras para ganhar ${rewardType}`,
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
        };
      case 'available':
        return {
          icon: <Gift className="w-8 h-8 text-success mr-2 animate-float" />,
          title: 'Recompensa Disponível!',
          description: `Resgate seu ${rewardType} grátis na loja`,
          footer: expiryDate ? `Válido até: ${formatDate(expiryDate)}` : undefined,
          bgColor: 'bg-success/10',
          borderColor: 'border-success',
        };
      case 'claimed':
        return {
          icon: <Gift className="w-8 h-8 text-primary/70 mr-2" />,
          title: 'Recompensa Resgatada',
          description: `Você resgatou seu ${rewardType}`,
          footer: 'Obrigado pela sua fidelidade!',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
        };
      default:
        return {
          icon: <Award className="w-8 h-8 text-secondary mr-2" />,
          title: 'Status da Recompensa',
          description: 'Continue acompanhando suas compras',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
        };
    }
  };

  const { icon, title, description, footer, bgColor, borderColor } = getBadgeContent();

  return (
    <div className={`p-4 rounded-lg ${bgColor} border ${borderColor} transition-all duration-300`}>
      <div className="flex items-center">
        {icon}
        <div>
          <h4 className="font-medium text-lg">{title}</h4>
          <p className="text-sm text-primary/80">{description}</p>
          {footer && <p className="text-xs mt-1 text-primary/60">{footer}</p>}
        </div>
      </div>
    </div>
  );
};

export default RewardBadge;