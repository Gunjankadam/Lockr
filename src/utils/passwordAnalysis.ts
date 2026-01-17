import { Entry } from '@/types/lockr';

export interface PasswordHealth {
    score: number; // 0-100
    weakPasswords: Entry[];
    reusedPasswords: { password: string; entries: Entry[] }[];
    oldPasswords: Entry[];
    totalPasswords: number;
    strongPasswords: number;
}

export function analyzePasswordHealth(entries: Entry[]): PasswordHealth {
    const weakPasswords: Entry[] = [];
    const reusedPasswords: { password: string; entries: Entry[] }[] = [];
    const oldPasswords: Entry[] = [];
    let strongPasswords = 0;

    // Analyze password strength
    entries.forEach(entry => {
        const strength = getPasswordStrength(entry.password);

        if (strength < 3) {
            weakPasswords.push(entry);
        } else if (strength >= 4) {
            strongPasswords++;
        }
    });

    // Detect reused passwords
    const passwordMap = new Map<string, Entry[]>();
    entries.forEach(entry => {
        const existing = passwordMap.get(entry.password) || [];
        passwordMap.set(entry.password, [...existing, entry]);
    });

    passwordMap.forEach((entryList, password) => {
        if (entryList.length > 1) {
            reusedPasswords.push({ password, entries: entryList });
        }
    });

    // Detect old passwords (>90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    entries.forEach(entry => {
        const updatedDate = new Date(entry.updatedAt);
        if (updatedDate < ninetyDaysAgo) {
            oldPasswords.push(entry);
        }
    });

    // Calculate overall score
    const totalPasswords = entries.length;
    const weakCount = weakPasswords.length;
    const reusedCount = reusedPasswords.reduce((sum, group) => sum + group.entries.length, 0);
    const oldCount = oldPasswords.length;

    let score = 100;
    if (totalPasswords > 0) {
        score -= (weakCount / totalPasswords) * 40;
        score -= (reusedCount / totalPasswords) * 40;
        score -= (oldCount / totalPasswords) * 20;
        score = Math.max(0, Math.round(score));
    }

    return {
        score,
        weakPasswords,
        reusedPasswords,
        oldPasswords,
        totalPasswords,
        strongPasswords,
    };
}

function getPasswordStrength(password: string): number {
    let strength = 0;

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (password.length >= 16) strength++;

    // Character variety
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    return Math.min(strength, 5);
}

export function getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
}

export function getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
}
