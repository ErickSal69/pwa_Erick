
// firebase-messaging-sw.js - Service Worker para FCM (background messages)
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

// Inicializar la app solo si no está inicializada
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyDnxvo-5hC-6zL0qf2hFuhYSF4KkP5RmN4",
    authDomain: "gymfull-9f61b.firebaseapp.com",
    databaseURL: "https://gymfull-9f61b-default-rtdb.firebaseio.com",
    projectId: "gymfull-9f61b",
    storageBucket: "gymfull-9f61b.firebasestorage.app",
    messagingSenderId: "387939028982",
    appId: "1:387939028982:web:67c09d09d5c7ffe557c1d7",
    measurementId: "G-Y3YPVTMQZ0"
  });
}

const messaging = firebase.messaging();

// Manejo de mensajes en background
messaging.onBackgroundMessage((payload) => {
  try {
    const title = payload.notification?.title || 'Nueva notificación';
    const options = {
      body: payload.notification?.body || '',
      icon: payload.notification?.icon || '/img/favicon-96x96.png',
      badge: payload.notification?.badge || '/img/favicon-96x96.png',
      data: payload.data || {}
    };

    self.registration.showNotification(title, options);
  } catch (err) {
    console.error('Error mostrando notificación en background:', err);
  }
});

// Manejo de clic en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

