// Bunny.net CDN Token Authentication, Security Headers, and Media Upload Firewall
// Enforce: 5MB max image, 2GB max video (unlimited duration), block .exe .php and dangerous extensions

export const BUNNY_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB max for images
export const BUNNY_VIDEO_MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2GB max for long videos
export const BUNNY_AUDIO_MAX_BYTES = 5 * 1024 * 1024; // 5MB max for audio

export const BLOCKED_UPLOAD_EXTENSIONS = [
  '.exe',
  '.php',
  '.phtml',
  '.php3',
  '.php4',
  '.php5',
  '.phar',
  '.sh',
  '.bat',
  '.cmd',
  '.msi',
  '.dll',
  '.com',
  '.scr',
  '.svg',
  '.html',
  '.htm',
  '.js',
  '.mjs',
  '.cjs',
  '.vbs',
  '.ps1',
];

class BunnyNetSecurityClient {
  private headers: Record<string, string> = {};

  addHeader(headerLine: string): void {
    const colonIdx = headerLine.indexOf(':');
    if (colonIdx === -1) return;
    const key = headerLine.slice(0, colonIdx).trim();
    const val = headerLine.slice(colonIdx + 1).trim();
    if (key && val) {
      this.headers[key] = val;
    }
  }

  getHeaders(): Record<string, string> {
    return { ...this.headers };
  }
}

export const bunnynet = new BunnyNetSecurityClient();
bunnynet.addHeader('X-Content-Type-Options: nosniff');

// Bunny.net Token Authentication for private videos/images
// Uses VITE_BUNNY_TOKEN from environment variables, falling back to ?token={BUNNY_TOKEN} placeholder
export function signBunnyCdnUrl(
  mediaUrl: string,
  options?: { isPrivate?: boolean; ttlSeconds?: number }
): string {
  const cleanUrl = (mediaUrl || '').trim();
  if (!cleanUrl || cleanUrl.startsWith('blob:') || cleanUrl.startsWith('data:')) {
    return cleanUrl;
  }

  const isBunnyHost = /b-cdn\.net|bunnycdn\.com|mediadelivery\.net/i.test(cleanUrl);
  if (!options?.isPrivate && !isBunnyHost) {
    return cleanUrl;
  }

  try {
    const envToken =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BUNNY_TOKEN) || '';
    const tokenValue = envToken || '{BUNNY_TOKEN}';
    const expires = Math.floor(Date.now() / 1000) + (options?.ttlSeconds || 3600);
    const separator = cleanUrl.includes('?') ? '&' : '?';
    if (cleanUrl.includes('token=')) return cleanUrl;
    return `${cleanUrl}${separator}token=${encodeURIComponent(tokenValue)}&expires=${expires}`;
  } catch {
    return cleanUrl;
  }
}

export function validateBunnyUpload(
  file: File | null | undefined,
  allowedCategories: Array<'image' | 'video' | 'audio'> = ['image', 'video', 'audio']
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const lowerName = (file.name || '').toLowerCase().trim();
  const hasBlockedExt = BLOCKED_UPLOAD_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  if (hasBlockedExt) {
    return {
      valid: false,
      error: 'Security Block: .exe, .php, .svg, and script files are strictly blocked.',
    };
  }

  const rawMime = (file.type || '').toLowerCase();
  const mime =
    rawMime ||
    (/\.(mp4|mov|webm|m4v|3gp|mkv|ogg)$/i.test(lowerName)
      ? 'video/mp4'
      : /\.(jpg|jpeg|png|webp|gif)$/i.test(lowerName)
      ? 'image/jpeg'
      : /\.(mp3|m4a|wav|aac)$/i.test(lowerName)
      ? 'audio/mpeg'
      : '');
  const isBlockedMime =
    mime.includes('x-msdownload') ||
    mime.includes('x-httpd-php') ||
    mime.includes('application/x-php') ||
    mime === 'image/svg+xml' ||
    mime.includes('javascript') ||
    mime.includes('text/html');

  if (isBlockedMime) {
    return {
      valid: false,
      error: 'Security Block: Executable, PHP, HTML, and SVG MIME types are blocked.',
    };
  }

  const matchesAllowedPrefix = allowedCategories.some((cat) => mime.startsWith(`${cat}/`));
  if (!matchesAllowedPrefix) {
    return {
      valid: false,
      error: `Security Block: Only ${allowedCategories.join(', ')} files are allowed.`,
    };
  }

  if (mime.startsWith('image/') && file.size > BUNNY_IMAGE_MAX_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `Image too large (${sizeMb} MB). Maximum allowed size for images is 5 MB.`,
    };
  }

  if (mime.startsWith('video/') && file.size > BUNNY_VIDEO_MAX_BYTES) {
    const sizeGb = (file.size / (1024 * 1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `Video too large (${sizeGb} GB). Maximum allowed size per upload is 2 GB.`,
    };
  }

  if (mime.startsWith('audio/') && file.size > BUNNY_AUDIO_MAX_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `Audio too large (${sizeMb} MB). Maximum allowed size for audio is 5 MB.`,
    };
  }

  return { valid: true };
}
