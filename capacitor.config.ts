import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mantech.pro',
  appName: 'MantechPro',
  webDir: 'dist',
  server: {
    url: 'https://recordatoriostecnicos.web.app',
    cleartext: true,
  },
  plugins: {
    StatusBar: {
      style: 'DARK' as any,
      backgroundColor: '#020521',
      overlaysWebView: false,
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#020521',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    Keyboard: {
      resize: 'native' as any,
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
    backgroundColor: '#020521',
  }
};

export default config;
