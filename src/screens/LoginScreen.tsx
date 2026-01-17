import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Mail, CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from 'sonner';
import { setToken, setUserId, API_URL } from '@/utils/api';

interface LoginScreenProps {
    onBack: () => void;
    onSuccess: (user: any) => void;
}

type Step = 'email' | 'otp';

export function LoginScreen({ onBack, onSuccess }: LoginScreenProps) {
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
    const [view, setView] = useState<'login' | 'forgot-password'>('login');

    // OTP State
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    // Password State
    const [password, setPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!email.trim()) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    type: view === 'forgot-password' ? 'forgot-password' : 'login'
                }),
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
        if (view === 'forgot-password' && !password) return; // Require new password for reset

        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    otp,
                    type: view === 'forgot-password' ? 'forgot-password' : undefined,
                    password: view === 'forgot-password' ? password : undefined
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Invalid OTP');

            if (data.token) {
                setToken(data.token);
            }
            if (data.user && data.user._id) {
                setUserId(data.user._id);
            }

            if (view === 'forgot-password') {
                toast.success('Password reset successfully! Please login.');
                setView('login');
                setLoginMethod('password');
                setStep('email');
                setPassword('');
                setOtp('');
            } else {
                toast.success('Logged in successfully!');
                onSuccess(data.user);
            }
        } catch (error) {
            // @ts-ignore
            toast.error(error.message || 'Invalid verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordLogin = async () => {
        if (!email.trim() || !password) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/login-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            if (data.token) {
                setToken(data.token);
            }
            if (data.user && data.user._id) {
                setUserId(data.user._id);
            }

            toast.success('Welcome back!');
            onSuccess(data.user);
        } catch (error) {
            // @ts-ignore
            toast.error(error.message || 'Invalid credentials');
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
                onClick={step === 'email' && view === 'login' ? onBack : () => {
                    if (view === 'forgot-password' && step === 'email') {
                        setView('login');
                        setLoginMethod('password');
                    } else {
                        setStep('email');
                    }
                }}
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
                            {loginMethod === 'password' ? <KeyRound className="text-primary" size={24} /> : <Mail className="text-primary" size={24} />}
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            {view === 'forgot-password' ? 'Reset Password' : 'Welcome Back'}
                        </h1>
                        <p className="text-muted-foreground">
                            {view === 'forgot-password' ? 'Enter your email to reset password' : 'Sign in to continue'}
                        </p>
                    </motion.div>

                    {view === 'login' && (
                        <Tabs defaultValue="password" value={loginMethod} onValueChange={(v) => { setLoginMethod(v as any); setStep('email'); }} className="w-full mb-6">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="password">Password</TabsTrigger>
                                <TabsTrigger value="otp">Email OTP</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    )}

                    {loginMethod === 'password' ? (
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
                                    className="h-14 bg-card border-border rounded-xl text-foreground"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-foreground block">
                                        Password
                                    </label>
                                    <button
                                        onClick={() => { setView('forgot-password'); setStep('email'); setOtp(''); setPassword(''); }}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="h-14 bg-card border-border rounded-xl text-foreground"
                                />
                            </div>
                        </motion.div>
                    ) : (
                        /* OTP Flow OR Forgot Password Flow (which uses OTP) */
                        step === 'email' ? (
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

                                {view === 'forgot-password' && (
                                    <div className="w-full">
                                        <label className="text-sm font-medium text-foreground mb-2 block">
                                            New Password
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder="Create a new password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLoading}
                                            className="h-14 bg-card border-border rounded-xl text-foreground"
                                        />
                                    </div>
                                )}

                                <p className="text-sm text-muted-foreground mt-4">
                                    We sent a code to {email}.
                                </p>
                                <button onClick={handleSendOtp} className="text-primary hover:underline text-sm">Resend Code</button>
                            </motion.div>
                        )
                    )}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pb-8"
                >
                    <Button
                        onClick={
                            view === 'login' && loginMethod === 'password' ? handlePasswordLogin :
                                (step === 'email' ? handleSendOtp : handleVerifyOtp)
                        }
                        disabled={isLoading || (
                            view === 'login' && loginMethod === 'password' ? (!email || !password) :
                                (step === 'email' ? !email :
                                    (view === 'forgot-password' ? (!otp || otp.length !== 6 || !password) : otp.length !== 6)
                                )
                        )}
                        className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary-glow 
                     text-primary-foreground rounded-2xl shadow-glow transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : (
                            loginMethod === 'password' ? 'Log in' :
                                (step === 'email' ? 'Send Code' : (view === 'forgot-password' ? 'Reset Password' : 'Verify & Login'))
                        )}
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    );
}
