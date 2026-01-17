export interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
  entryCount: number;
}

export interface CustomField {
  id: string;
  name: string;
  value: string;
  isEncrypted?: boolean;
}

export interface Entry {
  id: string;
  categoryId: string;
  title: string;
  username: string;
  password: string;
  notes?: string;
  customFields: CustomField[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  biometricEnabled: boolean;
  autoLockTimer: number; // in minutes
  hasCompletedOnboarding: boolean;
  masterPasscodeHash?: string;
  isLoggedIn?: boolean;
}

export type AppScreen =
  | 'splash'
  | 'welcome'
  | 'login'
  | 'register'
  | 'create-passcode'
  | 'unlock'
  | 'vault'
  | 'category'
  | 'add-category'
  | 'edit-category'
  | 'entry-list'
  | 'add-entry'
  | 'edit-entry'
  | 'view-entry'
  | 'search'
  | 'forgot-passcode'
  | 'change-passcode'
  | 'settings'
  | 'health-dashboard';