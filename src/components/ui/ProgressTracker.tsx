import React, { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';

interface ProgressTrackerProps {
  purchaseCount: number;
  totalNeeded: number;
  onComplete?: () => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ 
  purchaseCount, 
  totalNeeded = 10,
  onComplete 
}) => {
  const [animate, setAnimate] = useState(false);
  const percentage = Math.min((purchaseCount / totalNeeded) * 100, 100);
  const isComplete = purchaseCount >= totalNeeded;

  useEffect(() => {
    if (isComplete && onComplete) {
      setAnimate(true);
      onComplete();
      
      const timer = setTimeout(() => {
        setAnimate(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isComplete, onComplete]);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2 items-center">
        <h3 className="text-lg font-medium text-primary">Seu Progresso</h3>
        <span className="text-primary font-medium">
          {purchaseCount}/{totalNeeded} Compras
        </span>
      </div>
      
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="mt-4 flex justify-between">
        {Array.from({ length: totalNeeded }).map((_, index) => (
          <div 
            key={index}
            className={`relative transition-all duration-300 ${
              index < purchaseCount 
                ? 'opacity-100 scale-100' 
                : 'opacity-50 scale-90'
            }`}
          >
            <Cookie 
              className={`h-6 w-6 sm:h-8 sm:w-8 ${
                index < purchaseCount 
                  ? 'text-caramel' 
                  : 'text-gray-300'
              } ${
                animate && index === totalNeeded - 1 
                  ? 'animate-celebrate' 
                  : ''
              }`}
            />
            {index < purchaseCount && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-success"></span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;