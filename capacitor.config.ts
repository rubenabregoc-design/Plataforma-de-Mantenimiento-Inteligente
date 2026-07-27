import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mantech.pro',
  appName: 'MantechPro',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_stat_mantech",
      iconColor: "#5d3cfe",
      sound: "radio_beep.wav",
    },
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
  }
};

export default config;
