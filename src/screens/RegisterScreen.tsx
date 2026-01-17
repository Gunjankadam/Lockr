import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from 'sonner';
import { API_URL } from '@/utils/api';

interface RegisterScreenProps {
  onBack: () => void;
  onContinue: (email: string, username?: string) => void;
}

type Step = 'email' | 'otp';

export function RegisterScreen({ onBack, onContinue }: RegisterScreenProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); // Optional, kept if needed later
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), type: 'register' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      toast.success('Verification code sent to your email');
      setStep('otp');
    } catch (error) {
      // @ts-ignore
      toast.error(error.message || 'Failed to send verification code. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      toast.success('Email verified successfully!');
      // Proceed to next step (Create Passcode)
      onContinue(email.trim(), username || undefined);
    } catch (error) {
      // @ts-ignore
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
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
        onClick={step === 'email' ? onBack : () => setStep('email')}
        className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors w-fit"
      >
        <ArrowLeft size={24} className="text-foreground" />
      </motion.button>

      <div className="flex-1 overflow-y-auto -mx-6 px-6">
        <div className="min-h-full flex flex-col justify-center py-6">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              {step === 'email' ? (
                <Mail className="text-primary" size={24} />
              ) : (
                <CheckCircle2 className="text-primary" size={24} />
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {step === 'email' ? 'Create Account' : 'Check your email'}
            </h1>
            <p className="text-muted-foreground">
              {step === 'email'
                ? 'Enter your details to get started'
                : `We sent a code to ${email}`}
            </p>
          </motion.div>

          {step === 'email' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-14 bg-card border-border rounded-xl text-foreground 
                           placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center space-y-6"
            >
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isLoading}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="rounded-l-lg border-primary" />
                  <InputOTPSlot index={1} className="border-primary" />
                  <InputOTPSlot index={2} className="border-primary" />
                  <InputOTPSlot index={3} className="border-primary" />
                  <InputOTPSlot index={4} className="border-primary" />
                  <InputOTPSlot index={5} className="rounded-r-lg border-primary" />
                </InputOTPGroup>
              </InputOTP>

              <div className="w-full">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Create Password
                </label>
                <Input
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-14 bg-card border-border rounded-xl text-foreground 
                             placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                />
              </div>

              <p className="text-sm text-muted-foreground">
                Didn't receive code? <button onClick={handleSendOtp} className="text-primary hover:underline">Resend</button>
              </p>
            </motion.div>
          )}

          {step === 'email' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 mt-8 p-4 bg-secondary/50 rounded-xl"
            >
              <Shield size={20} className="text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                We never store or see your secrets. Your data is encrypted in the cloud.
              </p>
            </motion.div>
          )}


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-8"
          >
            <Button
              onClick={step === 'email' ? handleSendOtp : handleVerifyOtp}
              disabled={isLoading || (step === 'email' ? !email.trim() : otp.length !== 6)}
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary-glow 
                     text-primary-foreground rounded-2xl shadow-glow transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : (step === 'email' ? 'Send Code' : 'Verify & Continue')}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}