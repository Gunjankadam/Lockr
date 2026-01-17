import { motion } from 'framer-motion';
import { Shield, Lock, Eye } from 'lucide-react';
import { LockrLogo } from '@/components/lockr/LockrLogo';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const features = [
  { icon: Shield, text: 'Military-grade encryption' },
  { icon: Lock, text: 'Secure passcode protection' },
  { icon: Eye, text: 'Zero-knowledge architecture' },
];

export function WelcomeScreen({ onGetStarted, onLogin }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-background p-6"
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <LockrLogo size="lg" animated />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome to Lockr
          </h2>
          <p className="text-muted-foreground">
            Secure everything that matters
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 space-y-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <feature.icon size={18} className="text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="space-y-3 pb-8"
      >
        <Button
          onClick={onGetStarted}
          className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary-glow 
                     text-primary-foreground rounded-2xl shadow-glow transition-all"
        >
          Get Started
        </Button>

        <Button
          onClick={onLogin}
          variant="ghost"
          className="w-full h-12 text-muted-foreground hover:text-foreground 
                     hover:bg-secondary rounded-xl transition-all"
        >
          Already have an account? Log in
        </Button>
      </motion.div>
    </motion.div>
  );
}