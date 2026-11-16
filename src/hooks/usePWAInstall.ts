import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __peaceverseDeferredPrompt?: BeforeInstallPromptEvent | null;
    installApp?: (onFallbackOpenModal?: () => void) => Promise<'accepted' | 'dismissed' | 'modal'>;
  }
}

let deferredPrompt: BeforeInstallPromptEvent | null =
  typeof window !== 'undefined' ? window.__peaceverseDeferredPrompt || null : null;
let sharedIsInstalled = false;
const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach((cb) => cb());
}

function getSharedDeferredPrompt(): BeforeInstallPromptEvent | null {
  if (typeof window !== 'undefined' && window.__peaceverseDeferredPrompt && !deferredPrompt) {
    deferredPrompt = window.__peaceverseDeferredPrompt;
  }
  return deferredPrompt;
}

function setSharedDeferredPrompt(event: BeforeInstallPromptEvent | null) {
  deferredPrompt = event;
  if (typeof window !== 'undefined') {
    window.__peaceverseDeferredPrompt = event;
  }
  notifySubscribers();
}

function markSharedInstalled() {
  sharedIsInstalled = true;
  setSharedDeferredPrompt(null);
  try {
    localStorage.setItem('qalby_pwa_installed', 'true');
  } catch {}
}

export async function installApp(
  onFallbackOpenModal?: () => void
): Promise<'accepted' | 'dismissed' | 'modal'> {
  const promptEvent = getSharedDeferredPrompt();
  if (promptEvent) {
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      setSharedDeferredPrompt(null);
      if (choice.outcome === 'accepted') {
        markSharedInstalled();
        return 'accepted';
      }
      return 'dismissed';
    } catch (err) {
      console.warn('Install prompt error:', err);
      setSharedDeferredPrompt(null);
    }
  }

  if (onFallbackOpenModal) {
    onFallbackOpenModal();
  } else if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('peaceverse:open-install-modal'));
    const modalEl = document.getElementById('installModal');
    if (modalEl) {
      modalEl.style.display = 'flex';
    }
  }
  return 'modal';
}

// Register global listeners once at module initialization
if (typeof window !== 'undefined') {
  window.installApp = installApp;

  const isStandaloneInit =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://');
  if (isStandaloneInit) {
    sharedIsInstalled = true;
  }

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    setSharedDeferredPrompt(e as BeforeInstallPromptEvent);
  });

  window.addEventListener('peaceverse:beforeinstallprompt', () => {
    if (window.__peaceverseDeferredPrompt) {
      setSharedDeferredPrompt(window.__peaceverseDeferredPrompt);
    }
  });

  window.addEventListener('appinstalled', () => {
    markSharedInstalled();
  });

  window.addEventListener('peaceverse:appinstalled', () => {
    markSharedInstalled();
  });
}

export function usePWAInstall() {
  const [, forceUpdate] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const sync = () => forceUpdate((n) => n + 1);
    subscribers.add(sync);

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone && !sharedIsInstalled) {
      sharedIsInstalled = true;
      sync();
    } else if (window.__peaceverseDeferredPrompt && !deferredPrompt) {
      deferredPrompt = window.__peaceverseDeferredPrompt;
      sync();
    }

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));
    setIsAndroid(/android/.test(ua));

    return () => {
      subscribers.delete(sync);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual'> => {
    const promptEvent = getSharedDeferredPrompt();
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        setSharedDeferredPrompt(null);
        if (choice.outcome === 'accepted') {
          markSharedInstalled();
          return 'accepted';
        }
        return 'dismissed';
      } catch (err) {
        console.warn('Install prompt error:', err);
        setSharedDeferredPrompt(null);
        return 'manual';
      }
    }
    return 'manual';
  }, []);

  const activePrompt = getSharedDeferredPrompt();
  const canPromptDirectly = Boolean(activePrompt);

  return {
    isInstallable: canPromptDirectly || isIOS || !sharedIsInstalled,
    canPromptDirectly,
    isInstalled: sharedIsInstalled,
    isIOS,
    isAndroid,
    promptInstall,
    installApp,
  };
}
