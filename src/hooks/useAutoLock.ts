import { useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';

interface UseAutoLockOptions {
  enabled: boolean;
  timeout: number; // in minutes
  onLock: () => void;
}

export function useAutoLock({ enabled, timeout, onLock }: UseAutoLockOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const clearAutoLockTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startAutoLockTimeout = useCallback(() => {
    clearAutoLockTimeout();
    if (enabled && timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        onLock();
      }, timeout * 60 * 1000);
    }
  }, [enabled, timeout, onLock, clearAutoLockTimeout]);

  // Handle native app state changes
  useEffect(() => {
    if (!isNative) {
      // For web, use visibility API
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden' && enabled) {
          // Immediate lock when going to background
          onLock();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }

    // For native platforms, use Capacitor App plugin
    const setupNativeListeners = async () => {
      try {
        const { App } = await import('@capacitor/app');
        
        const stateListener = await App.addListener('appStateChange', ({ isActive }) => {
          if (!isActive && enabled) {
            // App went to background - lock immediately
            onLock();
          } else if (isActive) {
            // App came to foreground - reset timeout
            startAutoLockTimeout();
          }
        });

        return () => {
          stateListener.remove();
        };
      } catch (error) {
        console.log('App plugin not available:', error);
      }
    };

    const cleanup = setupNativeListeners();
    return () => {
      cleanup.then((remove) => remove?.());
    };
  }, [isNative, enabled, onLock, startAutoLockTimeout]);

  // Handle user activity (reset timeout on interaction)
  useEffect(() => {
    if (!enabled) return;

    const resetTimeout = () => {
      startAutoLockTimeout();
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((event) => {
      document.addEventListener(event, resetTimeout, { passive: true });
    });

    // Start initial timeout
    startAutoLockTimeout();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout);
      });
      clearAutoLockTimeout();
    };
  }, [enabled, startAutoLockTimeout, clearAutoLockTimeout]);

  return {
    resetTimeout: startAutoLockTimeout,
    clearTimeout: clearAutoLockTimeout,
  };
}
