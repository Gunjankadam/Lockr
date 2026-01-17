import { useState, useEffect, useCallback } from 'react';
import { Category, Entry, UserSettings } from '@/types/lockr';
import { apiClient, removeToken } from '@/utils/api';
import { encryptData, decryptData } from '@/utils/crypto';


const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Email', icon: 'Mail', entryCount: 0 },
  { id: '2', name: 'Social', icon: 'Users', entryCount: 0 },
  { id: '3', name: 'Banking', icon: 'CreditCard', entryCount: 0 },
  { id: '4', name: 'Work', icon: 'Briefcase', entryCount: 0 },
  { id: '5', name: 'Personal', icon: 'User', entryCount: 0 },
];

const DEFAULT_SETTINGS: UserSettings = {
  biometricEnabled: false,
  autoLockTimer: 5,
  hasCompletedOnboarding: false,
  isLoggedIn: false,
};

export function useLockr() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    // Try to restore settings from localStorage?
    // Actually, 'isLoggedIn' is the key.
    // If 'lockr_userId' exists, we are logged in.
    const hasUser = !!localStorage.getItem('lockr_userId');
    const userId = localStorage.getItem('lockr_userId');
    let cachedSettings = {};
    if (userId) {
      try {
        cachedSettings = JSON.parse(localStorage.getItem(`lockr_settings_${userId}`) || '{}');
      } catch (e) { console.error(e); }
    }

    return {
      ...DEFAULT_SETTINGS,
      ...cachedSettings,
      isLoggedIn: hasUser,
    };
  });
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sessionPasscode, setSessionPasscode] = useState<string | null>(null);

  // Initialize userId from localStorage or decode from token if missing
  const [userId, setUserId] = useState<string | null>(() => {
    const savedId = localStorage.getItem('lockr_userId');
    if (savedId) return savedId;

    // Try to recover from token
    const token = localStorage.getItem('lockr_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userId) {
          localStorage.setItem('lockr_userId', payload.userId);
          return payload.userId;
        }
      } catch (e) {
        console.error('Failed to decode token', e);
      }
    }
    return null;
  });

  // Fetch Data on Init/Login
  const fetchData = useCallback(async (uid: string) => {
    try {
      const [settingsRes, catsRes, entriesRes] = await Promise.all([
        apiClient.get(`/users/${uid}/settings`),
        apiClient.get(`/categories/${uid}`),
        apiClient.get(`/entries/${uid}`)
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(prev => ({ ...prev, ...data, isLoggedIn: true }));
      }

      if (catsRes.ok) {
        const data = await catsRes.json();
        if (data.length > 0) {
          setCategories(data.map((c: any) => ({ ...c, id: c._id })));
        } else {
          // SEEDING: If no categories exist, add them to DB for this user
          setCategories(DEFAULT_CATEGORIES);
          DEFAULT_CATEGORIES.forEach(async (cat) => {
            try {
              await apiClient.post('/categories', {
                name: cat.name,
                icon: cat.icon,
                userId: uid
              });
            } catch (e) {
              console.error('Failed to seed category', e);
            }
          });
        }
      }

      if (entriesRes.ok) {
        const data = await entriesRes.json();
        // Decrypt entries if we have the passcode
        const decryptedEntries = await Promise.all(data.map(async (e: any) => {
          const entry = { ...e, id: e._id };
          if (sessionPasscode) {
            try {
              entry.password = await decryptData(entry.password, sessionPasscode);
              if (entry.notes) entry.notes = await decryptData(entry.notes, sessionPasscode);

              // Decrypt custom fields
              if (entry.customFields) {
                entry.customFields = await Promise.all(entry.customFields.map(async (field: any) => {
                  if (field.isEncrypted) {
                    return { ...field, value: await decryptData(field.value, sessionPasscode) };
                  }
                  return field;
                }));
              }
            } catch (err) {
              console.warn('Failed to decrypt entry:', entry.id);
            }
          }
          return entry;
        }));
        setEntries(decryptedEntries);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  }, [sessionPasscode]); // Now depends on sessionPasscode to trigger re-decryption on unlock

  useEffect(() => {
    if (userId) {
      fetchData(userId);
    }
  }, [userId, fetchData]);

  // Save settings
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      // Save minimal subset to local storage for quick boot
      if (userId) {
        const cached = JSON.parse(localStorage.getItem(`lockr_settings_${userId}`) || '{}');
        localStorage.setItem(`lockr_settings_${userId}`, JSON.stringify({ ...cached, ...newSettings }));
      }
      return updated;
    });

    if (userId) {
      try {
        await apiClient.put(`/users/${userId}/settings`, newSettings);
      } catch (error) {
        console.error('Failed to save settings', error);
      }
    }
  }, [userId]);

  // Create passcode
  const createPasscode = useCallback(async (passcode: string) => {
    const hash = btoa(passcode);
    const updates = { masterPasscodeHash: hash, hasCompletedOnboarding: true };
    await updateSettings(updates);
    setSessionPasscode(passcode);
    setIsUnlocked(true);
  }, [updateSettings]);

  // Verify passcode
  const verifyPasscode = useCallback((passcode: string): boolean => {
    const hash = btoa(passcode);
    // Prefer local state, but check if we have a hash
    const isValid = hash === settings.masterPasscodeHash;
    if (isValid) {
      setSessionPasscode(passcode);
      setIsUnlocked(true);
    }
    return isValid;
  }, [settings.masterPasscodeHash]);

  // Lock app
  const lockApp = useCallback(() => {
    setIsUnlocked(false);
    setSessionPasscode(null);
  }, []);

  const login = useCallback((user?: any) => {
    const uid = user?._id || user?.id; // Accept user object from LoginScreen
    if (uid) {
      setUserId(uid);
      localStorage.setItem('lockr_userId', uid);

      // Sync settings from user object if available
      const userSettings = user.settings || {};
      const newSettings = {
        ...userSettings,
        isLoggedIn: true
      };

      setSettings(prev => ({ ...prev, ...newSettings }));

      // Save to localStorage for quick boot next time
      const cached = JSON.parse(localStorage.getItem(`lockr_settings_${uid}`) || '{}');
      localStorage.setItem(`lockr_settings_${uid}`, JSON.stringify({ ...cached, ...newSettings }));

      // After a fresh login (email OTP), we trust this session
      setIsUnlocked(true);
    } else {
      // Force generic isLoggedIn true for UI flow fallback
      setSettings(prev => ({ ...prev, isLoggedIn: true }));
      setIsUnlocked(true);
    }
  }, []);

  const logout = useCallback(() => {
    updateSettings({ isLoggedIn: false });
    setIsUnlocked(false);
    setSessionPasscode(null);
    setUserId(null);
    removeToken();
    setCategories(DEFAULT_CATEGORIES);
    setEntries([]);
  }, [updateSettings]);

  // Category operations
  const addCategory = useCallback(async (category: Omit<Category, 'id' | 'entryCount'>) => {
    if (!userId) return;

    // Optimistic update
    const tempId = Date.now().toString();
    const newCategory = { ...category, id: tempId, entryCount: 0 };
    setCategories(prev => [...prev, newCategory]);

    try {
      const res = await apiClient.post('/categories', { ...category, userId });
      if (res.ok) {
        const saved = await res.json();
        setCategories(prev => prev.map(c => c.id === tempId ? { ...saved, id: saved._id } : c));
      }
    } catch (error) {
      console.error('Failed to add category', error);
      // Revert?
    }
  }, [userId]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    try {
      await apiClient.put(`/categories/${id}`, updates);
    } catch (error) {
      console.error('Failed to update category', error);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setEntries(prev => prev.filter(e => e.categoryId !== id));
    try {
      await apiClient.delete(`/categories/${id}`);
    } catch (error) {
      console.error('Failed to delete category', error);
    }
  }, []);

  // Entry operations
  const addEntry = useCallback(async (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId || !sessionPasscode) return;

    // Encrypt sensitive data locally before sending
    const encryptedCustomFields = entry.customFields ? await Promise.all(entry.customFields.map(async (f) => {
      if (f.isEncrypted) {
        return { ...f, value: await encryptData(f.value, sessionPasscode) };
      }
      return f;
    })) : [];

    const encryptedEntry = {
      ...entry,
      password: await encryptData(entry.password, sessionPasscode),
      notes: entry.notes ? await encryptData(entry.notes, sessionPasscode) : undefined,
      customFields: encryptedCustomFields
    };

    const tempId = Date.now().toString();
    const newEntry = {
      ...entry,
      id: tempId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setEntries(prev => [...prev, newEntry]);
    setCategories(prev => prev.map(c => c.id === entry.categoryId ? { ...c, entryCount: c.entryCount + 1 } : c));

    try {
      const res = await apiClient.post('/entries', { ...encryptedEntry, userId });
      if (res.ok) {
        const saved = await res.json();
        // Keep local plaintext version in state for immediate use
        setEntries(prev => prev.map(e => e.id === tempId ? { ...saved, id: saved._id, password: entry.password, notes: entry.notes, customFields: entry.customFields } : e));
      }
    } catch (error) {
      console.error('Failed to add entry', error);
    }
  }, [userId, sessionPasscode]);

  const updateEntry = useCallback(async (id: string, updates: Partial<Entry>) => {
    if (!sessionPasscode) return;

    // Encrypt updates if they contain sensitive data
    const encryptedUpdates = { ...updates };
    if (updates.password) encryptedUpdates.password = await encryptData(updates.password, sessionPasscode);
    if (updates.notes) encryptedUpdates.notes = await encryptData(updates.notes, sessionPasscode);

    if (updates.customFields) {
      encryptedUpdates.customFields = await Promise.all(updates.customFields.map(async (f) => {
        if (f.isEncrypted) {
          return { ...f, value: await encryptData(f.value, sessionPasscode) };
        }
        return f;
      }));
    }

    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e));
    try {
      await apiClient.put(`/entries/${id}`, encryptedUpdates);
    } catch (error) {
      console.error('Failed to update entry', error);
    }
  }, [sessionPasscode]);

  const deleteEntry = useCallback(async (id: string) => {
    const entry = entries.find(e => e.id === id);
    setEntries(prev => prev.filter(e => e.id !== id));
    if (entry) {
      setCategories(prev => prev.map(c => c.id === entry.categoryId ? { ...c, entryCount: Math.max(0, c.entryCount - 1) } : c));
    }

    try {
      await apiClient.delete(`/entries/${id}`);
    } catch (error) {
      console.error('Failed to delete entry', error);
    }
  }, [entries]);

  const getEntriesByCategory = useCallback((categoryId: string) => {
    return entries.filter(entry => entry.categoryId === categoryId);
  }, [entries]);

  const searchEntries = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return entries.filter(entry =>
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.username.toLowerCase().includes(lowerQuery) ||
      entry.notes?.toLowerCase().includes(lowerQuery)
    );
  }, [entries]);

  return {
    settings,
    categories,
    entries,
    isUnlocked,
    updateSettings,
    createPasscode,
    verifyPasscode,
    lockApp,
    addCategory,
    updateCategory,
    deleteCategory,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesByCategory,
    searchEntries,
    login,
    logout,
  };
}