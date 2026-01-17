import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Clock, Copy, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Entry } from '@/types/lockr';
import { ScreenHeader } from '@/components/lockr/ScreenHeader';
import { analyzePasswordHealth, getScoreColor, getScoreLabel } from '@/utils/passwordAnalysis';

interface HealthDashboardScreenProps {
    entries: Entry[];
    onBack: () => void;
    onEntryClick: (entry: Entry) => void;
}

export function HealthDashboardScreen({ entries, onBack, onEntryClick }: HealthDashboardScreenProps) {
    const health = analyzePasswordHealth(entries);

    const stats = [
        {
            icon: Shield,
            label: 'Total Passwords',
            value: health.totalPasswords,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            icon: CheckCircle2,
            label: 'Strong Passwords',
            value: health.strongPasswords,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            icon: AlertTriangle,
            label: 'Weak Passwords',
            value: health.weakPasswords.length,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
        {
            icon: Copy,
            label: 'Reused Passwords',
            value: health.reusedPasswords.reduce((sum, group) => sum + group.entries.length, 0),
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
        },
        {
            icon: Clock,
            label: 'Old Passwords',
            value: health.oldPasswords.length,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen bg-background pb-20"
        >
            <ScreenHeader title="Security Health" onBack={onBack} />

            <div className="p-4 space-y-6">
                {/* Overall Score */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-2xl p-6 text-center"
                >
                    <div className="flex items-center justify-center mb-4">
                        <TrendingUp className={`${getScoreColor(health.score)} mr-2`} size={32} />
                    </div>
                    <h2 className="text-sm text-muted-foreground mb-2">Security Score</h2>
                    <div className={`text-6xl font-bold ${getScoreColor(health.score)} mb-2`}>
                        {health.score}
                    </div>
                    <p className={`text-lg font-semibold ${getScoreColor(health.score)}`}>
                        {getScoreLabel(health.score)}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-4 w-full bg-secondary rounded-full h-3 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${health.score}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full ${health.score >= 80 ? 'bg-green-500' :
                                    health.score >= 60 ? 'bg-yellow-500' :
                                        health.score >= 40 ? 'bg-orange-500' :
                                            'bg-red-500'
                                }`}
                        />
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-card border border-border rounded-xl p-4"
                        >
                            <div className={`${stat.bgColor} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                                <stat.icon className={stat.color} size={20} />
                            </div>
                            <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                                {stat.value}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Action Items */}
                {health.weakPasswords.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-3"
                    >
                        <h3 className="text-sm font-semibold text-foreground flex items-center">
                            <AlertTriangle size={16} className="text-red-500 mr-2" />
                            Weak Passwords ({health.weakPasswords.length})
                        </h3>
                        {health.weakPasswords.slice(0, 5).map((entry) => (
                            <button
                                key={entry.id}
                                onClick={() => onEntryClick(entry)}
                                className="w-full p-3 bg-card border border-border rounded-xl hover:bg-secondary/50 transition-colors text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">{entry.title}</p>
                                        <p className="text-xs text-muted-foreground">{entry.username}</p>
                                    </div>
                                    <span className="text-xs text-red-500 font-medium">Update</span>
                                </div>
                            </button>
                        ))}
                        {health.weakPasswords.length > 5 && (
                            <p className="text-xs text-muted-foreground text-center">
                                +{health.weakPasswords.length - 5} more
                            </p>
                        )}
                    </motion.div>
                )}

                {/* Reused Passwords */}
                {health.reusedPasswords.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-3"
                    >
                        <h3 className="text-sm font-semibold text-foreground flex items-center">
                            <Copy size={16} className="text-orange-500 mr-2" />
                            Reused Passwords ({health.reusedPasswords.length} groups)
                        </h3>
                        {health.reusedPasswords.slice(0, 3).map((group, index) => (
                            <div
                                key={index}
                                className="p-3 bg-card border border-border rounded-xl"
                            >
                                <p className="text-xs text-muted-foreground mb-2">
                                    Used in {group.entries.length} accounts:
                                </p>
                                <div className="space-y-1">
                                    {group.entries.map((entry) => (
                                        <button
                                            key={entry.id}
                                            onClick={() => onEntryClick(entry)}
                                            className="w-full text-left px-2 py-1 rounded hover:bg-secondary/50 transition-colors"
                                        >
                                            <p className="text-sm text-foreground">{entry.title}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Old Passwords */}
                {health.oldPasswords.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-3"
                    >
                        <h3 className="text-sm font-semibold text-foreground flex items-center">
                            <Clock size={16} className="text-yellow-500 mr-2" />
                            Old Passwords ({health.oldPasswords.length})
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Not updated in over 90 days
                        </p>
                        {health.oldPasswords.slice(0, 5).map((entry) => (
                            <button
                                key={entry.id}
                                onClick={() => onEntryClick(entry)}
                                className="w-full p-3 bg-card border border-border rounded-xl hover:bg-secondary/50 transition-colors text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">{entry.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Last updated: {new Date(entry.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="text-xs text-yellow-500 font-medium">Review</span>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* All Good Message */}
                {health.score >= 80 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-center"
                    >
                        <CheckCircle2 className="text-green-500 mx-auto mb-3" size={48} />
                        <h3 className="text-lg font-semibold text-green-500 mb-2">
                            Excellent Security!
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Your passwords are in great shape. Keep up the good work!
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
