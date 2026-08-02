import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3db66d0e639a481fa5b463bb8f9e93ba',
  appName: 'Roomie Finder',
  webDir: 'dist',
  server: {
    url: 'https://3db66d0e-639a-481f-a5b4-63bb8f9e93ba.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0f2647',
      showSpinner: false,
    },
  },
};

export default config;