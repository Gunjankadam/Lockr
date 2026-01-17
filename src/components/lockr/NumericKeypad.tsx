import { motion } from 'framer-motion';
import { Delete, Fingerprint } from 'lucide-react';

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onBiometric?: () => void;
  showBiometric?: boolean;
  disabled?: boolean;
}

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'bio', '0', 'del'];

export function NumericKeypad({
  onKeyPress,
  onDelete,
  onBiometric,
  showBiometric = false,
  disabled = false,
}: NumericKeypadProps) {
  const handlePress = (key: string) => {
    if (disabled) return;
    
    if (key === 'del') {
      onDelete();
    } else if (key === 'bio' && onBiometric) {
      onBiometric();
    } else if (key !== 'bio') {
      onKeyPress(key);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
      {keys.map((key, index) => {
        const isBio = key === 'bio';
        const isDel = key === 'del';
        const isEmpty = isBio && !showBiometric;

        if (isEmpty) {
          return <div key={index} className="w-20 h-20" />;
        }

        return (
          <motion.button
            key={index}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => handlePress(key)}
            disabled={disabled}
            className={`
              w-20 h-20 rounded-2xl flex items-center justify-center
              text-2xl font-semibold transition-all duration-200
              ${isBio || isDel
                ? 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                : 'bg-card hover:bg-card-elevated border border-border shadow-card'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              active:shadow-inner
            `}
          >
            {isDel ? (
              <Delete size={24} />
            ) : isBio ? (
              <Fingerprint size={28} className="text-primary" />
            ) : (
              key
            )}
          </motion.button>
        );
      })}
    </div>
  );
}