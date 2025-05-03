import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton: React.FC = () => {
  const phoneNumber = '5511999999999'; // Substitua pelo número correto
  const message = 'Olá! Gostaria de fazer um pedido.';

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50 flex items-center justify-center"
      aria-label="Fazer pedido pelo WhatsApp"
    >
      <FaWhatsapp className="w-6 h-6" />
    </a>
  );
};

export default WhatsAppButton;