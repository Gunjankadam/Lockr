import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface PasswordGeneratorProps {
    onClose: () => void;
    onUsePassword: (password: string) => void;
}

export function PasswordGenerator({ onClose, onUsePassword }: PasswordGeneratorProps) {
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [copied, setCopied] = useState(false);

    const generatePassword = () => {
        let charset = '';
        if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (includeNumbers) charset += '0123456789';
        if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (charset === '') {
            charset = 'abcdefghijklmnopqrstuvwxyz'; // Fallback
        }

        let password = '';
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            password += charset[array[i] % charset.length];
        }

        setGeneratedPassword(password);
        setCopied(false);
    };

    const copyToClipboard = async () => {
        if (generatedPassword) {
            await navigator.clipboard.writeText(generatedPassword);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleUsePassword = () => {
        if (generatedPassword) {
            onUsePassword(generatedPassword);
            onClose();
        }
    };

    // Generate initial password
    useState(() => {
        generatePassword();
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-background border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Password Generator</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-secondary transition-colors"
                    >
                        <X size={20} className="text-muted-foreground" />
                    </button>
                </div>

                {/* Generated Password Display */}
                <div className="mb-6">
                    <div className="relative">
                        <Input
                            type="text"
                            value={generatedPassword}
                            readOnly
                            className="h-14 pr-24 bg-card border-border rounded-xl text-foreground font-mono text-lg"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            <button
                                onClick={copyToClipboard}
                                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                            >
                                {copied ? (
                                    <Check size={18} className="text-green-500" />
                                ) : (
                                    <Copy size={18} className="text-muted-foreground" />
                                )}
                            </button>
                            <button
                                onClick={generatePassword}
                                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                            >
                                <RefreshCw size={18} className="text-muted-foreground" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Length Slider */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-foreground">Length</label>
                        <span className="text-sm font-bold text-primary">{length}</span>
                    </div>
                    <input
                        type="range"
                        min="8"
                        max="32"
                        value={length}
                        onChange={(e) => {
                            setLength(parseInt(e.target.value));
                            setTimeout(generatePassword, 100);
                        }}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between p-3 bg-card rounded-xl">
                        <span className="text-sm text-foreground">Uppercase (A-Z)</span>
                        <Switch
                            checked={includeUppercase}
                            onCheckedChange={(checked) => {
                                setIncludeUppercase(checked);
                                setTimeout(generatePassword, 100);
                            }}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card rounded-xl">
                        <span className="text-sm text-foreground">Lowercase (a-z)</span>
                        <Switch
                            checked={includeLowercase}
                            onCheckedChange={(checked) => {
                                setIncludeLowercase(checked);
                                setTimeout(generatePassword, 100);
                            }}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card rounded-xl">
                        <span className="text-sm text-foreground">Numbers (0-9)</span>
                        <Switch
                            checked={includeNumbers}
                            onCheckedChange={(checked) => {
                                setIncludeNumbers(checked);
                                setTimeout(generatePassword, 100);
                            }}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card rounded-xl">
                        <span className="text-sm text-foreground">Symbols (!@#$...)</span>
                        <Switch
                            checked={includeSymbols}
                            onCheckedChange={(checked) => {
                                setIncludeSymbols(checked);
                                setTimeout(generatePassword, 100);
                            }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        onClick={handleUsePassword}
                        className="flex-1 h-12 bg-primary hover:bg-primary-glow text-primary-foreground rounded-xl"
                    >
                        Use Password
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="flex-1 h-12 rounded-xl"
                    >
                        Cancel
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}
