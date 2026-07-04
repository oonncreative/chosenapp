import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oonn.chosen',
  appName: 'Chosen',
  webDir: 'dist/client',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Light',
      backgroundColor: '#ffffff',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_chosen',
      iconColor: '#f1f26c',
    },
    AppShortcuts: {
      // Atalhos padrão exibidos já no primeiro long-press, antes do JS rodar.
      // O useAppShortcuts sobrescreve depois com a mesma lista (idempotente).
      shortcuts: [
        { id: 'mensagem', shortLabel: 'Preciso de mensagem', title: 'Preciso de mensagem', description: 'Uma palavra pra agora' },
        { id: 'motivacao', shortLabel: 'Uma motivação', title: 'Uma motivação', description: 'Um empurrão pro seu dia' },
        { id: 'salmo', shortLabel: 'Um salmo', title: 'Um salmo', description: 'Palavra do Senhor' },
        { id: 'oracoes', shortLabel: 'Orações', title: 'Orações', description: 'Fale com Deus' },
      ],
    },
  },
};

export default config;