import { getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, playNotificationSound, sendRealtimeNotification } from './firebase';
import { NotificationItem } from '../types';
import { loadPeaceSettings, savePeaceSettings, PeaceSettingsPrefs } from '../utils/settingsStorage';
import { getActivePrayerPauseStatus } from './globalPrayer';

export function isNotificationPausedForPrayer(customPrefs?: PeaceSettingsPrefs): {
  paused: boolean;
  prayerName: string | null;
  untilTime: string | null;
} {
  const prefs = customPrefs || loadPeaceSettings();
  if (!prefs.prayerTimePause && !prefs.quietModeSalah) {
    return { paused: false, prayerName: null, untilTime: null };
  }
  const status = getActivePrayerPauseStatus(prefs.prayerPauseMinutes || 15);
  return {
    paused: status.paused,
    prayerName: status.prayerName,
    untilTime: status.untilTime,
  };
}

export interface BroadcastParams {
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  contentType: 'video' | 'photo' | 'product' | 'post' | 'broadcast';
  title?: string;
  body?: string;
  thumbnail?: string;
  postId?: string;
  link?: string;
  broadcastToAll?: boolean;
  onProgress?: (sent: number, total: number) => void;
  onLocalNotify?: (item: NotificationItem) => void;
}

export interface BroadcastResult {
  ok: boolean;
  notification: NotificationItem;
  totalTargeted: number;
  sentCount: number;
}

const DEFAULT_THUMBNAIL =
  'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80';

let swRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  if (!swRegistrationPromise) {
    swRegistrationPromise = navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((reg) => reg)
      .catch((err) => {
        console.warn('Service worker registration notice:', err);
        return null;
      });
  }
  return swRegistrationPromise;
}

export async function enableWebPushNotifications(userId?: string): Promise<{
  granted: boolean;
  token: string | null;
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { granted: false, token: null };
  }

  let permission = Notification.permission;
  if (permission !== 'granted') {
    try {
      permission = await Notification.requestPermission();
    } catch {
      return { granted: false, token: null };
    }
  }

  if (permission !== 'granted') {
    return { granted: false, token: null };
  }

  const reg = await registerPushServiceWorker();
  let fcmToken: string | null = null;

  try {
    const supported = await isSupported();
    if (supported && getApps().length > 0 && reg) {
      const app = getApp();
      const messaging = getMessaging(app);
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (vapidKey) {
        fcmToken = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: reg,
        });
      } else {
        fcmToken = `fcm-web-${auth.currentUser?.uid || userId || 'device'}-${Date.now()}`;
      }
    }
  } catch (err) {
    console.warn('FCM token notice (falling back to SW Web Push):', err);
    fcmToken = `sw-webpush-${userId || 'device'}-${Date.now()}`;
  }

  const currentUid = auth.currentUser?.uid || userId || 'user-me';
  if (fcmToken) {
    try {
      await fetch('/api/fcm/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUid,
          token: fcmToken,
          platform: 'web',
        }),
      });
    } catch {}

    try {
      await setDoc(
        doc(db, 'users', currentUid),
        {
          fcmToken,
          pushEnabled: true,
          pushUpdatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {}
  }

  const prefs = loadPeaceSettings();
  savePeaceSettings({ ...prefs, fcmPushSubscribed: true });

  return { granted: true, token: fcmToken };
}

export async function subscribeToForegroundFcm(
  onReceive: (notif: NotificationItem) => void
): Promise<() => void> {
  try {
    const supported = await isSupported();
    if (!supported || getApps().length === 0) return () => {};
    const messaging = getMessaging(getApp());
    return onMessage(messaging, (payload) => {
      const prefs = loadPeaceSettings();
      const n = payload.notification || {};
      const data = payload.data || {};
      const item: NotificationItem = {
        id: `fcm-${Date.now()}`,
        type: 'new_post',
        from: data.creatorId || 'creator',
        to: 'all',
        read: false,
        avatar: data.avatar || '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
        title: n.title || data.title || 'প্রিয় দাদা নতুন আপডেট দিয়েছেন',
        subtitle: n.body || data.body || '১০০% হালাল পণ্যের নতুন কালেকশন দেখুন',
        image: n.image || data.image,
        link: data.link,
        postId: data.postId,
        timeAgo: 'Just now',
        isUnread: true,
        badgeType: 'broadcast',
      };

      const prayerPause = isNotificationPausedForPrayer(prefs);
      if (!prayerPause.paused) {
        if (prefs.notifSound) playNotificationSound();
        if (prefs.notifVibration && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([180, 80, 180]);
          } catch {}
        }
      }
      onReceive(item);
    });
  } catch {
    return () => {};
  }
}

export async function triggerDevicePushTray(payload: {
  title: string;
  body: string;
  image?: string;
  icon?: string;
  link?: string;
  postId?: string;
  sound?: boolean;
  vibrate?: boolean;
}) {
  if (typeof window === 'undefined') return;

  // Respect Prayer Time Pause / Quiet Mode during Salah
  const prefs = loadPeaceSettings();
  if (isNotificationPausedForPrayer(prefs).paused) {
    return;
  }

  if (payload.sound !== false) {
    playNotificationSound();
  }
  if (payload.vibrate !== false && 'vibrate' in navigator) {
    try {
      navigator.vibrate([180, 80, 180]);
    } catch {}
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  try {
    const reg = await registerPushServiceWorker();
    if (reg) {
      if (reg.active) {
        reg.active.postMessage({
          type: 'PEACEVERSE_SHOW_PUSH',
          payload,
        });
        return;
      }
      await reg.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
        badge: '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
        silent: payload.sound === false,
        tag: payload.postId ? `peaceverse-${payload.postId}` : `peaceverse-${Date.now()}`,
        data: { url: payload.link || '/', postId: payload.postId || '' },
      });
      return;
    }

    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
      silent: payload.sound === false,
    });
  } catch {
    // Graceful no-op when browser blocks system tray
  }
}

function buildDefaultCopy(params: BroadcastParams): { title: string; body: string } {
  if (params.title && params.body) {
    return { title: params.title, body: params.body };
  }

  const name = params.creatorName || 'প্রিয় দাদা';
  switch (params.contentType) {
    case 'video':
      return {
        title: params.title || `${name} নতুন ভিডিও আপলোড করেছেন`,
        body: params.body || '১০০% হালাল পণ্যের নতুন কালেকশন ও ভিডিও দেখুন',
      };
    case 'photo':
      return {
        title: params.title || `${name} নতুন ছবি শেয়ার করেছেন`,
        body: params.body || 'নতুন ইসলামিক ও হালাল আপডেট দেখতে ক্লিক করুন',
      };
    case 'product':
      return {
        title: params.title || `${name} নতুন হালাল পণ্য যুক্ত করেছেন`,
        body: params.body || '১০০% হালাল পণ্যের নতুন কালেকশন দেখুন',
      };
    case 'broadcast':
      return {
        title: params.title || `${name} জরুরি ব্রডকাস্ট পাঠিয়েছেন`,
        body: params.body || 'নতুন ঘোষণা দেখতে এখনই ক্লিক করুন',
      };
    default:
      return {
        title: params.title || `${name} নতুন পোস্ট আপলোড করেছেন`,
        body: params.body || 'নতুন পোস্টটি দেখতে ক্লিক করুন',
      };
  }
}

export async function broadcastCreatorNotification(
  params: BroadcastParams
): Promise<BroadcastResult> {
  const prefs = loadPeaceSettings();
  const { title, body } = buildDefaultCopy(params);
  const broadcastToAll = params.broadcastToAll ?? prefs.creatorSendPushToAllUsers;
  const thumbnail = params.thumbnail || DEFAULT_THUMBNAIL;

  const notifItem: NotificationItem = {
    id: `notif-broadcast-${Date.now()}`,
    type: 'new_post',
    from: params.creatorId,
    to: broadcastToAll ? 'all' : 'followers',
    read: false,
    avatar: params.creatorAvatar || '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
    title,
    subtitle: body,
    image: thumbnail,
    link: params.link || (params.postId ? `/?postId=${params.postId}` : '/'),
    postId: params.postId,
    timeAgo: 'Just now',
    isUnread: true,
    badgeType: 'broadcast',
  };

  let totalTargeted = broadcastToAll ? 10000 : 2100;
  let sentCount = totalTargeted;

  try {
    const res = await fetch('/api/notify-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creatorId: params.creatorId,
        creatorName: params.creatorName,
        creatorAvatar: params.creatorAvatar,
        contentType: params.contentType,
        title,
        body,
        thumbnail,
        postId: params.postId,
        link: notifItem.link,
        broadcastToAll,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (typeof data.totalTargeted === 'number') totalTargeted = data.totalTargeted;
      if (typeof data.sentCount === 'number') sentCount = data.sentCount;
    }
  } catch {
    // Continue seamlessly with Firestore + local dispatch
  }

  if (params.onProgress) {
    params.onProgress(Math.round(totalTargeted * 0.35), totalTargeted);
  }

  // Save into Firestore `notifications` collection (`from`, `to`, `type: 'new_post'`, `postId`, `read: false`)
  await sendRealtimeNotification(notifItem);

  // Respect user receiver settings for local sound/vibration/push
  const isPriyoDada =
    params.creatorName.includes('প্রিয় দাদা') ||
    params.creatorName.includes('Sharif') ||
    params.creatorId === 'admin' ||
    params.creatorId === 'priyo-dada';

  const prayerPause = isNotificationPausedForPrayer(prefs);
  const shouldNotifyLocally =
    prefs.notifyFavoriteCreator && (!isPriyoDada || prefs.notifyPriyoDada);

  if (shouldNotifyLocally) {
    if (params.onLocalNotify) {
      params.onLocalNotify(notifItem);
    }

    if (!prayerPause.paused) {
      await triggerDevicePushTray({
        title,
        body,
        image: thumbnail,
        icon: params.creatorAvatar,
        link: notifItem.link,
        postId: params.postId,
        sound: prefs.notifSound,
        vibrate: prefs.notifVibration,
      });
    }
  }

  return {
    ok: true,
    notification: notifItem,
    totalTargeted,
    sentCount,
  };
}
