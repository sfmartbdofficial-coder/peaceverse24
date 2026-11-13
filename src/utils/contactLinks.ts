export function normalizePhoneNumber(raw?: string): string {
  if (!raw) return '';
  let digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';

  // Strip international 00 prefix (e.g. 0088017...)
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  // Convert Bangladeshi 11-digit local number (01XXXXXXXXX) to 8801XXXXXXXXX
  if (digits.startsWith('01') && digits.length === 11) {
    digits = `88${digits}`;
  } else if (digits.startsWith('0') && digits.length >= 10 && !digits.startsWith('88')) {
    digits = `88${digits}`;
  }

  return digits;
}

export function getWhatsAppUrl(raw?: string): string | null {
  const digits = normalizePhoneNumber(raw);
  return digits ? `https://wa.me/${digits}` : null;
}

export function getImoDeepLink(raw?: string): string | null {
  const digits = normalizePhoneNumber(raw);
  return digits ? `imo://contact?number=${digits}` : null;
}

export function getViberDeepLink(raw?: string): string | null {
  const digits = normalizePhoneNumber(raw);
  return digits ? `viber://contact?number=${digits}` : null;
}

export function getMessengerUrl(raw?: string): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (
    trimmed.includes('facebook.com/') ||
    trimmed.includes('fb.com/') ||
    trimmed.includes('m.me/')
  ) {
    return `https://${trimmed.replace(/^\/+/, '')}`;
  }
  return `https://m.me/${trimmed.replace(/^@/, '')}`;
}

/**
 * Attempts to launch a native app URI (imo:// or viber://) without window.open/alert,
 * falling back cleanly to the web URL if the app is not installed.
 */
export function openDeepLinkWithFallback(deepLink: string, fallbackUrl: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  let handled = false;
  const cleanup = () => {
    window.removeEventListener('blur', onLeave);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };

  const onLeave = () => {
    handled = true;
    cleanup();
  };

  const onVisibilityChange = () => {
    if (document.hidden) {
      handled = true;
      cleanup();
    }
  };

  window.addEventListener('blur', onLeave);
  document.addEventListener('visibilitychange', onVisibilityChange);

  const link = document.createElement('a');
  link.href = deepLink;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => {
    cleanup();
    if (!handled && !document.hidden) {
      const fbLink = document.createElement('a');
      fbLink.href = fallbackUrl;
      fbLink.target = '_blank';
      fbLink.rel = 'noopener noreferrer';
      fbLink.style.display = 'none';
      document.body.appendChild(fbLink);
      fbLink.click();
      document.body.removeChild(fbLink);
    }
  }, 1100);
}
