import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLockr } from '@/hooks/useLockr';
import { useBiometric } from '@/hooks/useBiometric';
import { useAutoLock } from '@/hooks/useAutoLock';
import { AppScreen, Category, Entry } from '@/types/lockr';
import { SplashScreen } from '@/screens/SplashScreen';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { CreatePasscodeScreen } from '@/screens/CreatePasscodeScreen';
import { ForgotPasscodeScreen } from '@/screens/ForgotPasscodeScreen';
import { UnlockScreen } from '@/screens/UnlockScreen';
import { VaultScreen } from '@/screens/VaultScreen';
import { CategoryFormScreen } from '@/screens/CategoryFormScreen';
import { EntryListScreen } from '@/screens/EntryListScreen';
import { EntryFormScreen } from '@/screens/EntryFormScreen';
import { EntryViewScreen } from '@/screens/EntryViewScreen';
import { SearchScreen } from '@/screens/SearchScreen';
import { HealthDashboardScreen } from '@/screens/HealthDashboardScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

const BIOMETRIC_SERVER = 'lockr-vault';

const Index = () => {
  const {
    settings, categories, entries, isUnlocked,
    updateSettings, createPasscode, verifyPasscode, lockApp,
    addCategory, updateCategory, deleteCategory,
    addEntry, updateEntry, deleteEntry, getEntriesByCategory,
    login,
  } = useLockr();

  const biometric = useBiometric();

  const [screen, setScreen] = useState<AppScreen>(() => {
    const userId = localStorage.getItem('lockr_userId');
    if (!userId) return 'welcome';

    // Check cached onboarding status to avoid flickering/wrong screens on boot
    try {
      const cached = JSON.parse(localStorage.getItem(`lockr_settings_${userId}`) || '{}');
      if (cached.hasCompletedOnboarding === false) {
        return 'create-passcode';
      }
    } catch (e) { }

    return 'unlock';
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Check if biometric is truly available (native + hardware)
  const biometricAvailable = biometric.isNative && biometric.isAvailable && settings.biometricEnabled;

  // Handle auto-lock when app goes to background or after inactivity
  const handleAutoLock = useCallback(() => {
    if (isUnlocked && settings.hasCompletedOnboarding) {
      lockApp();
      setScreen('unlock');
    }
  }, [isUnlocked, settings.hasCompletedOnboarding, lockApp]);

  // Setup auto-lock hook
  useAutoLock({
    enabled: isUnlocked && settings.hasCompletedOnboarding,
    timeout: settings.autoLockTimer,
    onLock: handleAutoLock,
  });

  useEffect(() => {
    if (!settings.isLoggedIn) {
      if (['vault', 'unlock', 'settings', 'search', 'add-category', 'edit-category', 'entry-list', 'add-entry', 'edit-entry', 'view-entry', 'change-passcode'].includes(screen)) {
        setScreen('welcome');
      }
    } else {
      // Logged in
      if (isUnlocked && ['welcome', 'login', 'register', 'unlock', 'forgot-passcode'].includes(screen)) {
        setScreen('vault');
      } else if (!isUnlocked && screen === 'vault') {
        // Fallback: if we are in vault but somehow locked, go to unlock
        setScreen('unlock');
      }
    }
  }, [isUnlocked, settings.isLoggedIn, settings.hasCompletedOnboarding, screen]);

  // Handle biometric authentication
  const handleBiometricAuth = useCallback(async () => {
    if (!biometricAvailable) return;

    try {
      const success = await biometric.authenticate();
      if (success) {
        // Get stored passcode and verify
        const credentials = await biometric.getCredentials(BIOMETRIC_SERVER);
        if (credentials?.password) {
          const valid = verifyPasscode(credentials.password);
          if (!valid) {
            console.error('Biometric credentials mismatch with current hash');
          }
        } else {
          console.warn('Biometric success but no credentials found in store');
        }
      }
    } catch (error) {
      console.error('Biometric auth failed:', error);
    }
  }, [biometricAvailable, biometric, verifyPasscode]);

  // Store passcode for biometric after creation
  const handleCreatePasscode = useCallback(async (passcode: string, enableBiometric: boolean) => {
    // createPasscode already calls updateSettings({ hasCompletedOnboarding: true })
    await createPasscode(passcode);

    // Update biometric preference
    await updateSettings({ biometricEnabled: enableBiometric });

    // If biometric is available and enabled, store the passcode native-side
    if (enableBiometric && biometric.isAvailable) {
      await biometric.setCredentials(BIOMETRIC_SERVER, 'lockr-user', passcode);
    }
  }, [createPasscode, updateSettings, biometric]);

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onGetStarted={() => setScreen('register')}
            onLogin={() => setScreen('login')}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onBack={() => setScreen('welcome')}
            onSuccess={(user) => {
              login(user); // Sets isLoggedIn=true AND isUnlocked=true AND syncs settings

              if (user.settings?.hasCompletedOnboarding) {
                setScreen('vault');
              } else {
                setScreen('create-passcode');
              }
            }}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onBack={() => setScreen('welcome')}
            // After email/otp verification in Register, go to Login to actually sign in? 
            // Or direct to create-passcode if we auto-login?
            // Current RegisterScreen calls 'onContinue' which we mapped to 'login'.
            // Let's map it to 'create-passcode' if we want seamless flow?
            // BUT RegisterScreen DOES NOT return a token/user object in 'onContinue',
            // it just finishes the OTP flow. The backend verify-otp returns token though.
            // We should probably update RegisterScreen to pass the user/token back if it logs them in properly.

            // For now, consistent flow: Register -> Login Screen (to enter password/email again to sign in)
            onContinue={() => setScreen('login')}
          />
        );
      case 'create-passcode':
        return (
          <CreatePasscodeScreen
            onBack={() => {
              // If logged in, backing out of create-passcode is tricky. 
              // Maybe logout?
              setScreen('welcome');
            }}
            onComplete={async (code, bio) => {
              await handleCreatePasscode(code, bio);
              // FORCE navigation to vault immediately after passcode is created
              setScreen('vault');
            }}
            biometricAvailable={biometric.isAvailable}
            biometricType={biometric.biometryType}
          />
        );
      case 'unlock':
        return (
          <UnlockScreen
            onUnlock={verifyPasscode}
            biometricEnabled={biometricAvailable}
            onBiometric={handleBiometricAuth}
            biometricType={biometric.biometryType}
            onBack={() => setScreen('welcome')}
            onForgotPasscode={() => setScreen('forgot-passcode')}
          />
        );
      case 'forgot-passcode':
        return (
          <ForgotPasscodeScreen
            onBack={() => setScreen('unlock')}
            onSuccess={() => {
              updateSettings({
                masterPasscodeHash: undefined,
                hasCompletedOnboarding: false,
                biometricEnabled: false
              });
              setScreen('create-passcode');
            }}
          />
        );
      case 'vault':
        return (
          <VaultScreen
            categories={categories}
            onCategoryClick={(cat) => { setSelectedCategory(cat); setScreen('entry-list'); }}
            onAddCategory={() => { setEditingCategory(null); setScreen('add-category'); }}
            onSearch={() => setScreen('search')}
            onSettings={() => setScreen('settings')}
          />
        );
      case 'add-category':
      case 'edit-category':
        return (
          <CategoryFormScreen
            category={editingCategory || undefined}
            onBack={() => setScreen(selectedCategory ? 'entry-list' : 'vault')}
            onSave={(data) => {
              editingCategory ? updateCategory(editingCategory.id, data) : addCategory(data);
              setScreen(selectedCategory ? 'entry-list' : 'vault');
            }}
            onDelete={editingCategory ? () => { deleteCategory(editingCategory.id); setSelectedCategory(null); setScreen('vault'); } : undefined}
          />
        );
      case 'entry-list':
        return selectedCategory ? (
          <EntryListScreen
            category={selectedCategory}
            entries={getEntriesByCategory(selectedCategory.id)}
            onBack={() => { setSelectedCategory(null); setScreen('vault'); }}
            onEntryClick={(entry) => { setSelectedEntry(entry); setScreen('view-entry'); }}
            onAddEntry={() => { setSelectedEntry(null); setScreen('add-entry'); }}
            onEditCategory={() => { setEditingCategory(selectedCategory); setScreen('edit-category'); }}
          />
        ) : null;
      case 'add-entry':
      case 'edit-entry':
        return selectedCategory ? (
          <EntryFormScreen
            entry={selectedEntry || undefined}
            categoryId={selectedCategory.id}
            onBack={() => setScreen(selectedEntry ? 'view-entry' : 'entry-list')}
            onSave={(data) => {
              selectedEntry ? updateEntry(selectedEntry.id, data) : addEntry(data);
              setScreen('entry-list');
            }}
            onDelete={selectedEntry ? () => { deleteEntry(selectedEntry.id); setSelectedEntry(null); setScreen('entry-list'); } : undefined}
          />
        ) : null;
      case 'view-entry':
        return selectedEntry ? (
          <EntryViewScreen
            entry={selectedEntry}
            onBack={() => { setSelectedEntry(null); setScreen('entry-list'); }}
            onEdit={() => setScreen('edit-entry')}
          />
        ) : null;
      case 'search':
        return (
          <SearchScreen
            entries={entries}
            categories={categories}
            onBack={() => setScreen('vault')}
            onEntryClick={(entry) => {
              const cat = categories.find(c => c.id === entry.categoryId);
              if (cat) { setSelectedCategory(cat); setSelectedEntry(entry); setScreen('view-entry'); }
            }}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            settings={settings}
            entries={entries}
            onBack={() => setScreen('vault')}
            onUpdateSettings={updateSettings}
            onLock={() => { lockApp(); setScreen('unlock'); }}
            onChangePasscode={() => setScreen('change-passcode')}
            biometricAvailable={biometric.isAvailable}
            biometricType={biometric.biometryType}
            biometricCheckEnrollment={biometric.checkEnrollment}
            onViewHealth={() => setScreen('health-dashboard')}
          />
        );
      case 'health-dashboard':
        return (
          <HealthDashboardScreen
            entries={entries}
            onBack={() => setScreen('settings')}
            onEntryClick={(entry) => {
              const cat = categories.find(c => c.id === entry.categoryId);
              if (cat) {
                setSelectedCategory(cat);
                setSelectedEntry(entry);
                setScreen('view-entry');
              }
            }}
          />
        );
      case 'change-passcode':
        return (
          <CreatePasscodeScreen
            onBack={() => setScreen('settings')}
            onComplete={async (passcode) => {
              await handleCreatePasscode(passcode, settings.biometricEnabled);
              setScreen('settings');
            }}
            biometricAvailable={false} // Disable biometric for change passcode flow (optional, prevents confusion)
            biometricType="none"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative overflow-hidden">
      <AnimatePresence mode="wait">{renderScreen()}</AnimatePresence>
    </div>
  );
};

export default Index;
