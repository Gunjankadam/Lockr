import { motion } from 'framer-motion';
import {
  Key, Fingerprint, ScanFace, Clock, Download, Info, ChevronRight, LogOut, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { UserSettings } from '@/types/lockr';
import { ScreenHeader } from '@/components/lockr/ScreenHeader';
import { Switch } from '@/components/ui/switch';

interface SettingsScreenProps {
  settings: UserSettings;
  onBack: () => void;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onLock: () => void;
  onChangePasscode: () => void;
  biometricAvailable?: boolean;
  biometricType?: 'face' | 'fingerprint' | 'none';
  biometricCheckEnrollment?: () => Promise<boolean>;
  onViewHealth: () => void;
  entries: any[]; // To export entries
}

const autoLockOptions = [
  { value: 1, label: '1 minute' },
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
];

export function SettingsScreen({
  settings,
  onBack,
  onUpdateSettings,
  onLock,
  onChangePasscode,
  biometricAvailable = false,
  biometricType = 'fingerprint',
  biometricCheckEnrollment,
  onViewHealth,
  entries,
}: SettingsScreenProps) {
  const handleAutoLockChange = () => {
    const currentIndex = autoLockOptions.findIndex(
      (opt) => opt.value === settings.autoLockTimer
    );
    const nextIndex = (currentIndex + 1) % autoLockOptions.length;
    onUpdateSettings({ autoLockTimer: autoLockOptions[nextIndex].value });
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        entries,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lockr_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Backup exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export backup');
    }
  };

  const currentAutoLock = autoLockOptions.find(
    (opt) => opt.value === settings.autoLockTimer
  );

  const BiometricIcon = biometricType === 'face' ? ScanFace : Fingerprint;
  const biometricLabel = biometricType === 'face' ? 'Face ID' : 'Fingerprint';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-background"
    >
      <ScreenHeader title="Settings" onBack={onBack} />

      <div className="p-4 space-y-6">
        {/* Security Section */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            Security
          </h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={onChangePasscode}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Key size={20} className="text-primary" />
                <span className="font-medium text-foreground">Change Passcode</span>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>

            <div className="border-t border-border" />

            <button
              type="button"
              onClick={onViewHealth}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-primary" />
                <span className="font-medium text-foreground">Security Health</span>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>

            <div className="border-t border-border" />

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BiometricIcon size={20} className="text-primary" />
                <div>
                  <span className="font-medium text-foreground block">{biometricLabel} Unlock</span>
                  {!biometricAvailable && (
                    <span className="text-xs text-muted-foreground">Available on native app</span>
                  )}
                </div>
              </div>
              <Switch
                checked={settings.biometricEnabled}
                onCheckedChange={async (checked) => {
                  if (checked && biometricAvailable && biometricCheckEnrollment) {
                    // When enabling, verify biometrics are actually enrolled
                    const isEnrolled = await biometricCheckEnrollment();
                    if (isEnrolled) {
                      onUpdateSettings({ biometricEnabled: checked });
                    }
                    // If not enrolled, the checkEnrollment function will show a prompt
                  } else {
                    onUpdateSettings({ biometricEnabled: checked });
                  }
                }}
                disabled={!biometricAvailable}
              />
            </div>

            <div className="border-t border-border" />

            <button
              onClick={handleAutoLockChange}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-primary" />
                <span className="font-medium text-foreground">Auto-Lock Timer</span>
              </div>
              <span className="text-muted-foreground text-sm">
                {currentAutoLock?.label}
              </span>
            </button>
          </div>
        </section>

        {/* Data Section */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            Data
          </h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <button
              onClick={handleExportBackup}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download size={20} className="text-primary" />
                <span className="font-medium text-foreground">Export Encrypted Backup</span>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* About Section */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            About
          </h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <Info size={20} className="text-primary" />
                <span className="font-medium text-foreground">About Lockr</span>
              </div>
              <span className="text-muted-foreground text-sm">v1.0.0</span>
            </button>
          </div>
        </section>

        {/* Lock Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onLock}
          className="w-full p-4 bg-destructive/10 hover:bg-destructive/20 
                     rounded-2xl flex items-center justify-center gap-3 transition-colors"
        >
          <LogOut size={20} className="text-destructive" />
          <span className="font-medium text-destructive">Lock Vault</span>
        </motion.button>

        <p className="text-center text-xs text-muted-foreground pt-4">
          Your data is encrypted and stored securely in the cloud.
        </p>
      </div>
    </motion.div>
  );
}
