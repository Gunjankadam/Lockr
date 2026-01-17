import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lockr.vault',
  appName: 'Lockr',
  webDir: 'dist',
  plugins: {
    NativeBiometric: {
      faceIdDescription: 'Use Face ID to unlock your vault',
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#030712",
      showSpinner: false,
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    },
  },
};

export default config;
