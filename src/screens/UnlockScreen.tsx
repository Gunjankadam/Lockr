import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NumericKeypad } from '@/components/lockr/NumericKeypad';
import { PasscodeDots } from '@/components/lockr/PasscodeDots';
import { LockrLogo } from '@/components/lockr/LockrLogo';
import { Fingerprint, ScanFace, ArrowLeft } from 'lucide-react';

interface UnlockScreenProps {
  onUnlock: (passcode: string) => boolean;
  biometricEnabled?: boolean;
  onBiometric?: () => void;
  biometricType?: 'face' | 'fingerprint' | 'none';
  onBack?: () => void;
  onForgotPasscode?: () => void;
}

export function UnlockScreen({
  onUnlock,
  biometricEnabled = false,
  onBiometric,
  biometricType = 'fingerprint',
  onBack,
  onForgotPasscode
}: UnlockScreenProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Auto-trigger biometric on mount if enabled
  useEffect(() => {
    if (biometricEnabled && onBiometric) {
      const timer = setTimeout(() => {
        onBiometric();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [biometricEnabled, onBiometric]);

  const handleKeyPress = (key: string) => {
    if (passcode.length < 6) {
      const newPasscode = passcode + key;
      setPasscode(newPasscode);
      setError(false);

      if (newPasscode.length === 6) {
        setTimeout(() => {
          const success = onUnlock(newPasscode);
          if (!success) {
            setError(true);
            setAttempts(prev => prev + 1);
            setTimeout(() => {
              setPasscode('');
              setError(false);
            }, 500);
          }
        }, 100);
      }
    }
  };

  const handleDelete = () => {
    setPasscode(passcode.slice(0, -1));
    setError(false);
  };

  const BiometricIcon = biometricType === 'face' ? ScanFace : Fingerprint;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative"
      style={{ paddingTop: 'calc(var(--safe-area-top) + 1.5rem)' }}
    >
      <div className="mb-12">
        <LockrLogo size="md" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-xl font-semibold text-foreground mb-1">
          Welcome Back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your passcode to unlock
        </p>
        {attempts > 2 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-destructive mt-2"
          >
            {attempts} failed attempts
          </motion.p>
        )}
      </motion.div>

      <div className="mb-10">
        <PasscodeDots
          length={6}
          filled={passcode.length}
          error={error}
        />
      </div>

      <NumericKeypad
        onKeyPress={handleKeyPress}
        onDelete={handleDelete}
        onBiometric={onBiometric}
        showBiometric={biometricEnabled}
        disabled={passcode.length >= 6}
      />

      <div className="mt-6">
        <button
          type="button"
          onClick={onForgotPasscode}
          className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
        >
          Forgot Passcode?
        </button>
      </div>

      {biometricEnabled && onBiometric && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBiometric}
          className="mt-8 flex items-center gap-3 px-6 py-3 bg-card border border-border 
                     rounded-2xl text-muted-foreground hover:text-foreground 
                     hover:border-primary transition-all"
        >
          <BiometricIcon size={22} className="text-primary" />
          <span className="font-medium">
            Use {biometricType === 'face' ? 'Face ID' : 'Fingerprint'}
          </span>
        </motion.button>
      )}

      {/* Logout option for stuck users */}
      <button
        onClick={() => {
          // Force logout
          localStorage.removeItem('lockr_userId');
          localStorage.removeItem('lockr_token');
          window.location.reload();
        }}
        className="mt-6 text-xs text-muted-foreground hover:text-destructive transition-colors"
      >
        Log Out / Switch Account
      </button>
    </motion.div>
  );
}
