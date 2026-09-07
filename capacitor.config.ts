import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mantech.pro',
  appName: 'MantechPro',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      style: 'DARK' as any,
      backgroundColor: '#0d0e12',
      overlaysWebView: false,
    },
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#0d0e12',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    Keyboard: {
      resize: 'body' as any,
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_stat_mantech",
      iconColor: "#5d3cfe",
    },
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: '#0d0e12',
  }
};

export default config;

