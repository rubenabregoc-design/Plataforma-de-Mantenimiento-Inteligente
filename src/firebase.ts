import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_D5hSU2YTOctVoWho64gK-l0MqBgFdtc",
  authDomain: "recordatoriostecnicos.firebaseapp.com",
  projectId: "recordatoriostecnicos",
  storageBucket: "recordatoriostecnicos.firebasestorage.app",
  messagingSenderId: "690946125913",
  appId: "1:690946125913:web:fb7f0d12a4aba192d18148",
  measurementId: "G-M2MSKJ0QWV"
};

import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Inicialización de Firebase App Check (Protección contra scraping y abuso de API)
if (typeof window !== 'undefined' && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
    console.log("🛡️ [SECURITY] Firebase App Check activado.");
  } catch (err: any) {
    console.warn("⚠️ [SECURITY] No se pudo inicializar App Check:", err.message);
  }
}

export { firebaseConfig };
