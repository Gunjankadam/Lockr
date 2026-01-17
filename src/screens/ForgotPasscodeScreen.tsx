import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from 'sonner';
import { API_URL } from '@/utils/api';

interface ForgotPasscodeScreenProps {
    onBack: () => void;
    onSuccess: () => void;
}

export function ForgotPasscodeScreen({ onBack, onSuccess }: ForgotPasscodeScreenProps) {
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!email.trim()) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), type: 'reset-passcode' }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to send OTP');
            }

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
                body: JSON.stringify({ email: email.trim(), otp, type: 'reset-passcode' }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Invalid OTP');

            toast.success('Passcode reset approved. Please set a new passcode.');
            onSuccess();
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

            <div className="flex-1 flex flex-col justify-center">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                        <Mail className="text-primary" size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Reset Passcode
                    </h1>
                    <p className="text-muted-foreground">
                        {step === 'email' ? 'Enter your email to verify identity' : `Enter code sent to ${email}`}
                    </p>
                </motion.div>

                {step === 'email' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
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
                                className="h-14 bg-card border-border rounded-xl text-foreground"
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center space-y-6">
                        <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={isLoading}>
                            <InputOTPGroup className="gap-2">
                                <InputOTPSlot index={0} className="rounded-l-lg border-primary" />
                                <InputOTPSlot index={1} className="border-primary" />
                                <InputOTPSlot index={2} className="border-primary" />
                                <InputOTPSlot index={3} className="border-primary" />
                                <InputOTPSlot index={4} className="border-primary" />
                                <InputOTPSlot index={5} className="rounded-r-lg border-primary" />
                            </InputOTPGroup>
                        </InputOTP>

                        <p className="text-sm text-muted-foreground mt-4">
                            We sent a code to {email}.
                        </p>
                        <button onClick={handleSendOtp} className="text-primary hover:underline text-sm">Resend Code</button>
                    </motion.div>
                )}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pb-8"
            >
                <Button
                    onClick={step === 'email' ? handleSendOtp : handleVerifyOtp}
                    disabled={isLoading || (step === 'email' ? !email : otp.length !== 6)}
                    className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary-glow 
                     text-primary-foreground rounded-2xl shadow-glow transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Processing...' : (step === 'email' ? 'Send Code' : 'Verify & Reset')}
                </Button>
            </motion.div>
        </motion.div>
    );
}
