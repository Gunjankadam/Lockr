import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Edit2 } from 'lucide-react';
import { Entry } from '@/types/lockr';
import { ScreenHeader } from '@/components/lockr/ScreenHeader';
import { CopyButton } from '@/components/lockr/CopyButton';
import { Button } from '@/components/ui/button';

interface EntryViewScreenProps {
  entry: Entry;
  onBack: () => void;
  onEdit: () => void;
}

export function EntryViewScreen({ entry, onBack, onEdit }: EntryViewScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [visibleEncryptedFields, setVisibleEncryptedFields] = useState<Set<string>>(new Set());

  // Auto-hide password after 10 seconds
  useEffect(() => {
    if (showPassword) {
      const timer = setTimeout(() => setShowPassword(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showPassword]);

  const maskedPassword = '•'.repeat(Math.min(12, entry.password.length));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-background"
    >
      <ScreenHeader
        title={entry.title}
        onBack={onBack}
      />

      <div className="p-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Username / Email</span>
            <CopyButton value={entry.username} />
          </div>
          <p className="text-foreground font-medium">{entry.username}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Password</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-muted-foreground" />
                ) : (
                  <Eye size={18} className="text-muted-foreground" />
                )}
              </button>
              <CopyButton value={entry.password} />
            </div>
          </div>
          <p className="text-foreground font-medium font-mono">
            {showPassword ? entry.password : maskedPassword}
          </p>
          {showPassword && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground mt-2"
            >
              Auto-hiding in 10 seconds
            </motion.p>
          )}
        </motion.div>

        {entry.tags && entry.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <span className="text-sm text-muted-foreground block mb-2">Tags</span>
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {entry.notes && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <span className="text-sm text-muted-foreground block mb-2">Notes</span>
            <p className="text-foreground text-sm whitespace-pre-wrap">{entry.notes}</p>
          </motion.div>
        )}

        {entry.customFields.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-muted-foreground">
              Custom Fields
            </h3>
            {entry.customFields.map((field) => {
              const isVisible = visibleEncryptedFields.has(field.id);
              const maskedValue = '•'.repeat(Math.min(12, field.value.length));

              return (
                <div
                  key={field.id}
                  className="bg-card border border-border rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{field.name}</span>
                    <div className="flex items-center gap-1">
                      {field.isEncrypted && (
                        <button
                          type="button"
                          onClick={() => {
                            const newVisible = new Set(visibleEncryptedFields);
                            if (isVisible) {
                              newVisible.delete(field.id);
                            } else {
                              newVisible.add(field.id);
                            }
                            setVisibleEncryptedFields(newVisible);
                          }}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors"
                        >
                          {isVisible ? (
                            <EyeOff size={18} className="text-muted-foreground" />
                          ) : (
                            <Eye size={18} className="text-muted-foreground" />
                          )}
                        </button>
                      )}
                      <CopyButton value={field.value} />
                    </div>
                  </div>
                  <p className="text-foreground font-medium">
                    {field.isEncrypted && !isVisible ? maskedValue : field.value}
                  </p>
                </div>
              );
            })}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <Button
            onClick={onEdit}
            className="w-full h-14 text-lg font-semibold bg-secondary hover:bg-secondary/80 
                       text-foreground rounded-2xl transition-all"
          >
            <Edit2 size={20} className="mr-2" />
            Edit Entry
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}