import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oonn.chosen',
  appName: 'Chosen',
  webDir: 'dist/client',
  server: {
    url: 'https://chosen.oonn.com.br',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#ffffff',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_chosen',
      iconColor: '#f1f26c',
    },
  },
};

export default config;