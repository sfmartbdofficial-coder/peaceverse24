/* Peaceverse24 Offline Caching + Firebase Cloud Messaging & Instant Push Service Worker */

const STATIC_CACHE = 'peaceverse24-shell-v4';
const RUNTIME_CACHE = 'peaceverse24-runtime-v4';
const ACTIVE_CACHES = [STATIC_CACHE, RUNTIME_CACHE];

const SHELL_ASSETS = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-512-maskable.png',
  '/apple-touch-icon.png',
  '/icon.svg',
];

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
        icon: data.icon || '/icon-192.png',
        badge: '/icon-192.png',
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

// Install: precache essential static icons/manifest & activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        Promise.allSettled(
          SHELL_ASSETS.map((asset) =>
            cache.add(new Request(asset, { cache: 'reload' })).catch(() => null)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

// Activate: remove outdated caches and claim all open clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (!ACTIVE_CACHES.includes(key)) {
              return caches.delete(key);
            }
            return Promise.resolve();
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: always fetch fresh HTML (no-store) for navigations, bypass SW cache for /admin
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip browser-extension, Vite internal dev HMR sockets, and third-party/API calls
  if (!url.protocol.startsWith('http')) return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.includes('/@vite/') || url.pathname.includes('__vite')) return;

  // Navigation requests (SPA pages): Always bypass HTTP cache to pick up new deployments immediately
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(new Request(request.url, { cache: 'no-store' }))
        .then((response) => {
          if (response && response.ok && !url.pathname.startsWith('/admin')) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put('/index.html', copy)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) return cachedIndex;
          const cachedRoot = await caches.match('/');
          if (cachedRoot) return cachedRoot;
          return new Response(
            '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Peaceverse24 Offline</title></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fff;color:#000;text-align:center;padding:24px"><div><h2 style="color:#0a8a4b;margin-bottom:8px">Peaceverse24.com</h2><p>ইন্টারনেট সংযোগ নেই। অনুগ্রহ করে সংযোগ চালু করে পুনরায় চেষ্টা করুন।</p></div></body></html>',
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Same-origin hashed assets & icons: Stale-While-Revalidate
  const isStaticDestination =
    ['script', 'style', 'image', 'font', 'manifest'].includes(request.destination) ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.json');

  if (isStaticDestination) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.ok && response.type === 'basic') {
              const copy = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
            }
            return response;
          })
          .catch(() => cached || Response.error());

        return cached || networkFetch;
      })
    );
  }
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
    icon: notif.icon || '/icon-192.png',
    badge: '/icon-192.png',
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
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (event.data && event.data.type === 'PEACEVERSE_SYNC_PRAYER_SCHEDULE') {
    const { schedule, city, enabled } = event.data.payload || {};
    if (Array.isArray(schedule) && schedule.length > 0) {
      globalPrayerSchedule = schedule;
    }
    if (typeof city === 'string' && city.trim()) {
      adhanCity = city.trim();
    }
    if (typeof enabled === 'boolean') {
      adhanEnabled = enabled;
    }
    return;
  }

  if (event.data && event.data.type === 'PEACEVERSE_TRIGGER_ADHAN_TEST') {
    const { prayerName = 'Maghrib', time = '17:15', city } = event.data.payload || {};
    if (typeof city === 'string' && city.trim()) {
      adhanCity = city.trim();
    }
    event.waitUntil(showAdhanSwNotification(prayerName, time));
    return;
  }

  if (event.data && event.data.type === 'PEACEVERSE_SHOW_PUSH') {
    const { title, body, image, icon, link, postId, vibrate, sound } = event.data.payload || {};
    event.waitUntil(
      self.registration.showNotification(title || 'Peaceverse24', {
        body: body || '',
        icon: icon || '/icon-192.png',
        badge: '/icon-192.png',
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

// ==========================================
// ADHAN PRAYER TIME PUSH SCHEDULER (60s CHECK)
// ==========================================
let adhanEnabled = true;
let adhanCity = 'Dhaka';
let globalPrayerSchedule = [
  { name: 'Fajr', time: '04:55' },
  { name: 'Dhuhr', time: '11:45' },
  { name: 'Asr', time: '15:02' },
  { name: 'Maghrib', time: '17:15' },
  { name: 'Isha', time: '18:32' },
];
let lastAdhanNotifiedKey = '';

function getCurrentHHMM() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return hh + ':' + mm;
}

function showAdhanSwNotification(prayerName, time) {
  const cityLabel = adhanCity || 'Dhaka';
  return self.registration.showNotification('🕌 ' + prayerName + ' Adhan', {
    body: cityLabel + ' • ' + prayerName + ' (' + time + ') • Time to pray. May Allah accept it.',
    icon: '/icon-512.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'adhan-' + prayerName,
    renotify: true,
    requireInteraction: true,
    data: {
      url: '/qibla',
      prayerName: prayerName,
      time: time,
    },
  });
}

function checkSwPrayerTime() {
  if (!adhanEnabled || !Array.isArray(globalPrayerSchedule)) return;
  const currentHHMM = getCurrentHHMM();
  const todayKey = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < globalPrayerSchedule.length; i++) {
    const entry = globalPrayerSchedule[i];
    if (!entry || !entry.name || !entry.time) continue;
    const cleanTime = String(entry.time).split(' ')[0].slice(0, 5);
    if (currentHHMM === cleanTime) {
      const dedupeKey = todayKey + '-' + entry.name + '-' + cleanTime;
      if (lastAdhanNotifiedKey === dedupeKey) return;
      lastAdhanNotifiedKey = dedupeKey;

      showAdhanSwNotification(entry.name, cleanTime).catch(() => {});

      self.clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'PEACEVERSE_ADHAN_TRIGGERED',
              prayerName: entry.name,
              time: cleanTime,
            });
          });
        })
        .catch(() => {});
      break;
    }
  }
}

setInterval(checkSwPrayerTime, 60 * 1000);

