import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';
import { initializeApp, getApps } from 'firebase/app';

// ⚠️ REEMPLAZA ESTE VALOR con tu clave VAPID de Firebase Console
// Firebase Console → Configuración del proyecto → Cloud Messaging → Certificados push web → Generar clave
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

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
 * Solicita permiso de notificaciones push, obtiene el token FCM
 * y lo guarda en Firestore bajo el documento del usuario.
 */
export async function registerPushToken(userId: string): Promise<void> {
  // Solo funciona en navegadores que soportan notificaciones
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.warn('🔕 Este navegador no soporta notificaciones push.');
    return;
  }

  try {
    // Registrar el Service Worker de Firebase Messaging
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    // Esperar a que el service worker esté listo y activo
    await navigator.serviceWorker.ready;

    const messaging = getMessaging(app);

    // Solicitar permiso al usuario
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('🔕 El usuario denegó el permiso de notificaciones.');
      return;
    }

    // Obtener el token FCM del dispositivo
    if (!VAPID_KEY) {
      console.error('❌ Error: Falta VAPID_KEY en las variables de entorno. Las notificaciones push no funcionarán.');
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      // Guardar el token en Firestore para que las Cloud Functions puedan usarlo
      await updateDoc(doc(db, 'users', userId), { pushToken: token });
      console.log('✅ Token FCM registrado en Firestore:', token.substring(0, 20) + '...');
    }

    // Escuchar mensajes cuando la app está en primer plano
    onMessage(messaging, (payload) => {
      console.log('📲 Notificación en primer plano:', payload);
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

  } catch (err) {
    console.error('❌ Error registrando push token:', err);
  }
}
