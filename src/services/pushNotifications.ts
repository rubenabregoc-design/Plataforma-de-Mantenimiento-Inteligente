import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';
import { initializeApp, getApps } from 'firebase/app';
import { triggerHaptic } from '../hooks/useAndroidNative';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BDjB4bJgCIbGeHWbAG9DTCcoZ1f8p8Krbx6zCbDn5DaK23O4mPOdTRewqbjqx4R7QUbSm3j6WuZPlaTtg4GOxWw';

const firebaseConfig = {
  apiKey: "AIzaSyB_D5hSU2YTOctVoWho64gK-l0MqBgFdtc",
  authDomain: "recordatoriostecnicos.firebaseapp.com",
  projectId: "recordatoriostecnicos",
  storageBucket: "recordatoriostecnicos.firebasestorage.app",
  messagingSenderId: "690946125913",
  appId: "1:690946125913:web:fb7f0d12a4aba192d18148"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * Registra el dispositivo para notificaciones push.
 * Detecta automáticamente si está en Android Nativo (Capacitor) o Web.
 */
export async function registerPushToken(userId: string): Promise<void> {
  // ==========================================
  // RUTA 1: ANDROID NATIVO (Capacitor)
  // ==========================================
  if (Capacitor.isNativePlatform()) {
    try {
      // 1. Crear canal de notificación prioritario para Android 8+
      if (Capacitor.getPlatform() === 'android') {
        await PushNotifications.createChannel({
          id: 'mantech_alerts',
          name: 'Alertas Operativas MantechPro',
          description: 'Notificaciones de órdenes, emergencias y garantías',
          importance: 5,
          visibility: 1,
          sound: 'radio_beep.wav',
          vibration: true,
          lights: true,
          lightColor: '#5d3cfe'
        }).catch(err => console.warn('Channel creation warning:', err));
      }

      // 2. Solicitar permisos nativos de Android 13+ (POST_NOTIFICATIONS)
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('🔕 Permiso de notificaciones nativas denegado por el usuario.');
        return;
      }

      // 3. Registrar con Firebase FCM Nativo
      await PushNotifications.register();

      // 4. Escuchar evento de token recibido
      PushNotifications.addListener('registration', async (token) => {
        console.log('✅ Token FCM Nativo Android:', token.value);
        try {
          await updateDoc(doc(db, 'users', userId), {
            pushToken: token.value,
            platform: 'android',
            lastTokenUpdate: serverTimestamp()
          });
        } catch (e) {
          console.error('Error guardando token nativo en Firestore:', e);
        }
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('❌ Error de registro FCM nativo:', error);
      });

      // 5. Escuchar notificación recibida con la app abierta (Foreground)
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('📲 Notificación Nativa en Primer Plano:', notification);
        triggerHaptic('medium');
        toast(notification.body || notification.title || 'Nueva alerta MantechPro', {
          icon: '🔔',
          duration: 5000,
          style: {
            background: '#16171d',
            color: '#fff',
            border: '1px solid #5d3cfe',
            borderRadius: '1rem',
            fontSize: '11px',
            fontWeight: '800'
          }
        });
      });

      // 6. Escuchar cuando el usuario toca la notificación en la barra de Android
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('👆 Usuario interactuó con notificación:', notification);
        triggerHaptic('light');
      });

      return;
    } catch (nativeErr) {
      console.error('❌ Error inicializando notificaciones nativas Android:', nativeErr);
      return;
    }
  }

  // ==========================================
  // RUTA 2: NAVEGADOR WEB (Fallback PWA)
  // ==========================================
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.warn('🔕 Entorno web sin soporte de notificaciones push.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;

    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    if (!VAPID_KEY) {
      console.warn('⚠️ Falta VAPID_KEY en el entorno para Web Push.');
      return;
    }

    let token = '';
    try {
      token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });
    } catch (pushErr: any) {
      if (pushErr.name === 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, 3000));
        token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });
      } else {
        throw pushErr;
      }
    }

    if (token) {
      await updateDoc(doc(db, 'users', userId), {
        pushToken: token,
        platform: 'web',
        lastTokenUpdate: serverTimestamp()
      });
      console.log('✅ Token Web FCM sincronizado.');
    }

    onMessage(messaging, (payload) => {
      const { title, body } = payload.notification || {};
      if (title) {
        toast(body || '', {
          icon: '🔔',
          duration: 5000,
          style: {
            background: '#16171d',
            color: '#fff',
            border: '1px solid #5d3cfe'
          }
        });
      }
    });
  } catch (err: any) {
    console.warn('ℹ️ Servicio de notificaciones Push Web no disponible en este entorno/navegador:', err?.message || err);
  }
}
