/* Peaceverse Firebase Cloud Messaging & Instant Push Service Worker */

const CACHE_NAME = 'peaceverse-push-v1';

// Attempt to initialize Firebase Messaging in background if CDN scripts are reachable
let messaging = null;
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: 'AIzaSyDqvbDypsSdmuIiu70qxPHo3103cNwLk54',
        authDomain: 'gen-lang-client-0936405543.firebaseapp.com',
        projectId: 'gen-lang-client-0936405543',
        storageBucket: 'gen-lang-client-0936405543.firebasestorage.app',
        messagingSenderId: '499589609756',
        appId: '1:499589609756:web:6b0e982f903121c07562d9',
      });
    }

    messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      const notif = payload.notification || {};
      const data = payload.data || {};
      const title = notif.title || data.title || 'Peaceverse24 নতুন আপডেট';
      const options = {
        body: notif.body || data.body || 'নতুন হালাল কনটেন্ট দেখুন',
        icon: data.icon || '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
        badge: '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
        image: notif.image || data.image || undefined,
        vibrate: data.vibrate === 'false' ? undefined : [200, 100, 200],
        tag: data.postId ? `peaceverse-${data.postId}` : `peaceverse-${Date.now()}`,
        renotify: true,
        data: {
          url: data.link || data.url || '/',
          postId: data.postId || '',
        },
      };
      return self.registration.showNotification(title, options);
    });
  }
} catch (_err) {
  // Fallback seamlessly to native Web Push API events below
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Standard Web Push handler (works even when app is closed)
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: 'Peaceverse24',
      body: event.data ? event.data.text() : 'নতুন নোটিফিকেশন এসেছে',
    };
  }

  const notif = payload.notification || payload;
  const title = notif.title || 'Peaceverse24 ব্রডকাস্ট';
  const options = {
    body: notif.body || '১০০% হালাল পণ্যের নতুন কালেকশন দেখুন',
    icon: notif.icon || '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
    badge: '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
    image: notif.image || undefined,
    vibrate: notif.vibrate === false ? undefined : [200, 100, 200],
    silent: notif.sound === false,
    tag: notif.postId ? `peaceverse-${notif.postId}` : `peaceverse-push-${Date.now()}`,
    renotify: true,
    data: {
      url: notif.link || notif.url || '/',
      postId: notif.postId || '',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Allow foreground/admin pages to display a real SW push notification immediately
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PEACEVERSE_SHOW_PUSH') {
    const { title, body, image, icon, link, postId, vibrate, sound } = event.data.payload || {};
    event.waitUntil(
      self.registration.showNotification(title || 'Peaceverse24', {
        body: body || '',
        icon: icon || '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
        badge: '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
        image: image || undefined,
        vibrate: vibrate === false ? undefined : [200, 100, 200],
        silent: sound === false,
        tag: postId ? `peaceverse-${postId}` : `peaceverse-${Date.now()}`,
        renotify: true,
        data: {
          url: link || '/',
          postId: postId || '',
        },
      })
    );
  }
});

// Notification click: focus existing Peaceverse tab or open target post
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = data.postId
    ? `/?postId=${encodeURIComponent(data.postId)}`
    : data.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({
            type: 'PEACEVERSE_OPEN_POST',
            postId: data.postId || '',
            url: targetUrl,
          });
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
