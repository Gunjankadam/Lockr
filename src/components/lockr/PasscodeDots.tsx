import { motion } from 'framer-motion';

interface PasscodeDotsProps {
  length: number;
  filled: number;
  error?: boolean;
  maxLength?: number;
}

export function PasscodeDots({ 
  length = 6, 
  filled, 
  error = false,
  maxLength = 6 
}: PasscodeDotsProps) {
  return (
    <motion.div
      className="flex gap-4 justify-center"
      animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {Array.from({ length: maxLength }).map((_, index) => (
        <motion.div
          key={index}
          initial={false}
          animate={{
            scale: index < filled ? 1.1 : 1,
            backgroundColor: error 
              ? 'hsl(var(--destructive))'
              : index < filled 
                ? 'hsl(var(--primary))' 
                : 'hsl(var(--muted))',
          }}
          transition={{ duration: 0.15 }}
          className={`
            w-4 h-4 rounded-full transition-all duration-200
            ${index < filled ? 'shadow-glow' : ''}
          `}
        />
      ))}
    </motion.div>
  );
}