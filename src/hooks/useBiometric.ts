import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

// Dynamic import for native biometric - only available on native platforms
let NativeBiometric: any = null;

interface BiometricState {
  isAvailable: boolean;
  biometryType: 'face' | 'fingerprint' | 'none';
  isNative: boolean;
}

export function useBiometric() {
  const [state, setState] = useState<BiometricState>({
    isAvailable: false,
    biometryType: 'none',
    isNative: false,
  });

  useEffect(() => {
    const checkBiometric = async () => {
      const isNative = Capacitor.isNativePlatform();

      if (!isNative) {
        setState({ isAvailable: false, biometryType: 'none', isNative: false });
        return;
      }

      try {
        // Dynamically import native biometric plugin
        const module = await import('capacitor-native-biometric');
        NativeBiometric = module.NativeBiometric;

        const result = await NativeBiometric.isAvailable();

        let biometryType: 'face' | 'fingerprint' | 'none' = 'none';
        if (result.biometryType === 1) {
          biometryType = 'fingerprint';
        } else if (result.biometryType === 2) {
          biometryType = 'face';
        }

        setState({
          isAvailable: result.isAvailable,
          biometryType,
          isNative: true,
        });
      } catch (error) {
        console.log('Biometric not available:', error);
        setState({ isAvailable: false, biometryType: 'none', isNative: true });
      }
    };

    checkBiometric();
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!state.isAvailable || !NativeBiometric) {
      return false;
    }

    try {
      await NativeBiometric.verifyIdentity({
        reason: 'Unlock your Lockr vault',
        title: 'Biometric Authentication',
        subtitle: 'Use biometrics to access your passwords',
        description: 'Place your finger on the sensor or look at the camera',
        negativeButtonText: 'Use Passcode',
        maxAttempts: 3,
      });
      return true;
    } catch (error) {
      console.log('Biometric authentication failed:', error);
      return false;
    }
  }, [state.isAvailable]);

  // Store credentials securely using biometric
  const setCredentials = useCallback(async (server: string, username: string, password: string): Promise<boolean> => {
    if (!state.isAvailable || !NativeBiometric) {
      return false;
    }

    try {
      await NativeBiometric.setCredentials({
        server,
        username,
        password,
      });
      return true;
    } catch (error) {
      console.log('Failed to store credentials:', error);
      return false;
    }
  }, [state.isAvailable]);

  // Get stored credentials
  const getCredentials = useCallback(async (server: string): Promise<{ username: string; password: string } | null> => {
    if (!state.isAvailable || !NativeBiometric) {
      return null;
    }

    try {
      const credentials = await NativeBiometric.getCredentials({ server });
      return credentials;
    } catch (error) {
      console.log('Failed to get credentials:', error);
      return null;
    }
  }, [state.isAvailable]);

  // Delete stored credentials
  const deleteCredentials = useCallback(async (server: string): Promise<boolean> => {
    if (!NativeBiometric) {
      return false;
    }

    try {
      await NativeBiometric.deleteCredentials({ server });
      return true;
    } catch (error) {
      console.log('Failed to delete credentials:', error);
      return false;
    }
  }, []);

  // Check if biometrics are enrolled and prompt user to add them
  const checkEnrollment = useCallback(async (): Promise<boolean> => {
    if (!state.isAvailable || !NativeBiometric) {
      return false;
    }

    try {
      // Try to verify - this will fail if no biometrics are enrolled
      const result = await NativeBiometric.isAvailable();

      if (!result.isAvailable) {
        // Show alert prompting user to add biometrics
        const biometricName = state.biometryType === 'face' ? 'Face ID' : 'fingerprint';

        if (Capacitor.isNativePlatform()) {
          const { Dialog } = await import('@capacitor/dialog');
          const { value } = await Dialog.confirm({
            title: 'No Biometrics Enrolled',
            message: `No ${biometricName} enrolled. Please add ${biometricName} in your device settings to use biometric unlock.\n\nWould you like to open device settings?`,
            okButtonTitle: 'Open Settings',
            cancelButtonTitle: 'Skip'
          });

          if (value) {
            // Ideally use AppLauncher or similar to open settings
          }
        } else {
          window.confirm(
            `No ${biometricName} enrolled. Please add ${biometricName} in your device settings to use biometric unlock.`
          );
        }
        return false;
      }

      return true;
    } catch (error) {
      console.log('Biometric enrollment check failed:', error);
      return false;
    }
  }, [state.isAvailable, state.biometryType]);

  return {
    ...state,
    authenticate,
    setCredentials,
    getCredentials,
    deleteCredentials,
    checkEnrollment,
  };
}
