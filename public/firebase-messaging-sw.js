// Firebase Messaging Service Worker - MantechPro
// IMPORTANTE: Este archivo debe estar en /public para que el browser lo registre correctamente.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB_D5hSU2YTOctVoWho64gK-l0MqBgFdtc",
  authDomain: "recordatoriostecnicos.firebaseapp.com",
  projectId: "recordatoriostecnicos",
  storageBucket: "recordatoriostecnicos.firebasestorage.app",
  messagingSenderId: "690946125913",
  appId: "1:690946125913:web:fb7f0d12a4aba192d18148"
});

const messaging = firebase.messaging();

// Manejo de mensajes en segundo plano (app cerrada o minimizada)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notificación en segundo plano recibida:', payload);

  const { title, body, icon } = payload.notification || {};

  self.registration.showNotification(title || 'MantechPro', {
    body: body || 'Tienes una nueva notificación.',
    icon: icon || '/logo.svg',
    badge: '/logo.svg',
    data: payload.data || {}
  });
});
