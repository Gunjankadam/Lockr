import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Fingerprint, ScanFace } from 'lucide-react';
import { NumericKeypad } from '@/components/lockr/NumericKeypad';
import { PasscodeDots } from '@/components/lockr/PasscodeDots';
import { Switch } from '@/components/ui/switch';

interface CreatePasscodeScreenProps {
  onBack: () => void;
  onComplete: (passcode: string, biometricEnabled: boolean) => void;
  biometricAvailable?: boolean;
  biometricType?: 'face' | 'fingerprint' | 'none';
}

type Step = 'create' | 'confirm';

export function CreatePasscodeScreen({
  onBack,
  onComplete,
  biometricAvailable = false,
  biometricType = 'fingerprint'
}: CreatePasscodeScreenProps) {
  const [step, setStep] = useState<Step>('create');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(biometricAvailable);
  const [error, setError] = useState(false);

  const currentPasscode = step === 'create' ? passcode : confirmPasscode;
  const setCurrentPasscode = step === 'create' ? setPasscode : setConfirmPasscode;

  const BiometricIcon = biometricType === 'face' ? ScanFace : Fingerprint;
  const biometricLabel = biometricType === 'face' ? 'Face ID' : 'Fingerprint';

  // Removed isProcessing state to prevent locking the UI inside component

  const handleKeyPress = (key: string) => {
    if (currentPasscode.length < 6) {
      const newPasscode = currentPasscode + key;
      setCurrentPasscode(newPasscode);
      setError(false);

      if (newPasscode.length === 6) {
        if (step === 'create') {
          // Transition to confirm step
          setTimeout(() => {
            setStep('confirm');
            setConfirmPasscode('');
          }, 300);
        } else {
          // Confirm step
          if (newPasscode === passcode) {
            // Success! Call onComplete immediately
            onComplete(newPasscode, biometricEnabled);
          } else {
            // Mismatch
            setError(true);
            setTimeout(() => {
              setConfirmPasscode('');
              setError(false);
            }, 500);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    setCurrentPasscode(currentPasscode.slice(0, -1));
    setError(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen flex flex-col bg-background p-6"
      style={{ paddingTop: 'calc(var(--safe-area-top) + 1.5rem)' }}
    >
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={step === 'create' ? onBack : () => { setStep('create'); setConfirmPasscode(''); }}
        className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors w-fit"
      >
        <ArrowLeft size={24} className="text-foreground" />
      </motion.button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {step === 'create' ? 'Create Master Passcode' : 'Confirm Passcode'}
          </h1>
          <p className="text-muted-foreground">
            {step === 'create'
              ? 'Enter a 6-digit passcode'
              : 'Re-enter your passcode to confirm'}
          </p>
        </motion.div>

        <div className="mb-12">
          <PasscodeDots
            length={6}
            filled={currentPasscode.length}
            error={error}
          />
        </div>

        <NumericKeypad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          disabled={false}
        />

        {step === 'create' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 w-full max-w-xs"
          >
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <BiometricIcon size={22} className="text-primary" />
                <div>
                  <span className="text-sm font-medium text-foreground block">
                    Enable {biometricLabel}
                  </span>
                  {!biometricAvailable && (
                    <span className="text-xs text-muted-foreground">
                      Available on native app
                    </span>
                  )}
                </div>
              </div>
              <Switch
                checked={biometricEnabled}
                onCheckedChange={setBiometricEnabled}
                disabled={!biometricAvailable}
              />
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-3 p-4 rounded-xl mb-8"
      >
        {/* Warning Removed */}
      </motion.div>
    </motion.div>
  );
}
