export const MAX_POST_PHOTOS = 10;

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('ফাইল পড়া যায়নি।'));
      }
    };
    reader.onerror = () => reject(new Error('ফাইল পড়া যায়নি।'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image file via an offscreen canvas so up to 10 photos fit cleanly
 * within mobile memory and Firestore's 1 MB document limit.
 */
export async function compressImageFileToDataUrl(
  file: File,
  options?: { maxDimension?: number; quality?: number }
): Promise<string> {
  const maxDimension = options?.maxDimension ?? 960;
  const quality = options?.quality ?? 0.72;

  const rawDataUrl = await readFileAsDataUrl(file);
  if (typeof document === 'undefined') return rawDataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;
        if (!origW || !origH) {
          resolve(rawDataUrl);
          return;
        }

        const scale = Math.min(1, maxDimension / Math.max(origW, origH));
        const targetW = Math.max(1, Math.round(origW * scale));
        const targetH = Math.max(1, Math.round(origH * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        // Use compressed version when smaller or when resized
        resolve(compressed.length < rawDataUrl.length || scale < 1 ? compressed : rawDataUrl);
      } catch {
        resolve(rawDataUrl);
      }
    };
    img.onerror = () => resolve(rawDataUrl);
    img.src = rawDataUrl;
  });
}

/**
 * Compresses a batch of up to 10 image files, dynamically adjusting target size
 * so total combined payload fits comfortably under 750 KB for real-time Firestore sync.
 */
export async function compressPostImagesBatch(
  files: File[],
  totalFinalCount: number
): Promise<string[]> {
  const count = Math.max(files.length, totalFinalCount, 1);
  const maxDimension = count >= 7 ? 720 : count >= 4 ? 820 : 960;
  const quality = count >= 7 ? 0.62 : count >= 4 ? 0.68 : 0.74;

  const results: string[] = [];
  for (const file of files) {
    const dataUrl = await compressImageFileToDataUrl(file, { maxDimension, quality });
    results.push(dataUrl);
  }
  return results;
}

/**
 * Re-compresses a JPEG/PNG data URL through an offscreen canvas until its length
 * fits comfortably inside a Firestore document (default <= 240 KB base64).
 */
export async function compressDataUrlUnderLimit(
  dataUrl: string,
  maxChars = 240_000,
  initialMaxDim = 960
): Promise<string> {
  const clean = (dataUrl || '').trim();
  if (!clean || !clean.startsWith('data:image/') || clean.length <= maxChars) {
    return clean;
  }
  if (typeof document === 'undefined') return clean;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;
        if (!origW || !origH) {
          resolve(clean);
          return;
        }

        const attempts = [
          { maxDim: initialMaxDim, quality: 0.72 },
          { maxDim: Math.min(initialMaxDim, 820), quality: 0.62 },
          { maxDim: Math.min(initialMaxDim, 640), quality: 0.54 },
          { maxDim: 480, quality: 0.48 },
        ];

        let best = clean;
        for (const step of attempts) {
          const scale = Math.min(1, step.maxDim / Math.max(origW, origH));
          const targetW = Math.max(1, Math.round(origW * scale));
          const targetH = Math.max(1, Math.round(origH * scale));
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) break;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(img, 0, 0, targetW, targetH);
          const candidate = canvas.toDataURL('image/jpeg', step.quality);
          if (candidate.length < best.length) {
            best = candidate;
          }
          if (best.length <= maxChars) {
            break;
          }
        }
        resolve(best);
      } catch {
        resolve(clean);
      }
    };
    img.onerror = () => resolve(clean);
    img.src = clean;
  });
}

export async function compressImageForFirestore(
  file: File,
  kind: 'avatar' | 'cover'
): Promise<string> {
  const initialMaxDim = kind === 'cover' ? 1080 : 512;
  const initialQuality = kind === 'cover' ? 0.74 : 0.78;
  const targetMaxChars = kind === 'cover' ? 240_000 : 180_000;
  const firstPass = await compressImageFileToDataUrl(file, {
    maxDimension: initialMaxDim,
    quality: initialQuality,
  });
  return compressDataUrlUnderLimit(firstPass, targetMaxChars, initialMaxDim);
}

export const SHORT_REEL_MIN_SECONDS = 10;
export const SHORT_REEL_MAX_SECONDS = 180; // 3 minutes

export function formatVideoDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:30';
  const totalSec = Math.round(seconds);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hours > 0) {
    return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function classifyVideoDuration(seconds: number): {
  kind: 'reel' | 'long';
  labelBn: string;
  badgeText: string;
  isShortClipUnderMin: boolean;
} {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return {
      kind: 'reel',
      labelBn: 'শর্ট ভিডিও / রিলস',
      badgeText: 'শর্ট ভিডিও / রিলস',
      isShortClipUnderMin: false,
    };
  }
  if (seconds > SHORT_REEL_MAX_SECONDS) {
    return {
      kind: 'long',
      labelBn: 'লং ভিডিও (৩মি+)',
      badgeText: `লং ভিডিও (${formatVideoDuration(seconds)}) • আনলিমিটেড`,
      isShortClipUnderMin: false,
    };
  }
  if (seconds < SHORT_REEL_MIN_SECONDS) {
    return {
      kind: 'reel',
      labelBn: 'শর্ট ক্লিপ / রিলস',
      badgeText: `শর্ট ভিডিও (${formatVideoDuration(seconds)})`,
      isShortClipUnderMin: true,
    };
  }
  return {
    kind: 'reel',
    labelBn: 'শর্ট ভিডিও / রিলস',
    badgeText: `রিলস / শর্ট ভিডিও (${formatVideoDuration(seconds)})`,
    isShortClipUnderMin: false,
  };
}

export interface VideoMetadataAndFrames {
  durationSeconds: number;
  durationText: string;
  frames: string[];
}

/**
 * Extracts real duration and up to 4 representative JPEG frames across the video timeline
 * (start, early-mid, late-mid, end) for XXX / explicit adult-content visual safety inspection.
 */
export function extractVideoMetadataAndFrames(
  file: File,
  maxFrames = 4
): Promise<VideoMetadataAndFrames> {
  if (typeof document === 'undefined' || (!file.type.startsWith('video/') && !/\.(mp4|mov|webm|m4v|3gp|mkv|ogg)$/i.test(file.name || ''))) {
    return Promise.resolve({ durationSeconds: 0, durationText: '0:30', frames: [] });
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    let settled = false;
    const capturedFrames: string[] = [];
    let detectedDuration = 0;

    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(hardTimer);
      try {
        video.removeAttribute('src');
        video.load();
      } catch {}
      URL.revokeObjectURL(url);
      resolve({
        durationSeconds: detectedDuration,
        durationText: formatVideoDuration(detectedDuration),
        frames: capturedFrames,
      });
    };

    const hardTimer = window.setTimeout(finish, 7500);

    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    let seekTargets: number[] = [];
    let seekCursor = 0;

    const captureCurrentFrame = () => {
      try {
        const w = Math.min(480, video.videoWidth || 320);
        const h = Math.max(
          1,
          Math.round(((video.videoHeight || 240) / (video.videoWidth || 320)) * w)
        );
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          capturedFrames.push(canvas.toDataURL('image/jpeg', 0.62));
        }
      } catch {}
    };

    const seekNext = () => {
      if (seekCursor >= seekTargets.length) {
        finish();
        return;
      }
      const nextTime = seekTargets[seekCursor++];
      try {
        video.currentTime = nextTime;
      } catch {
        finish();
      }
    };

    video.onloadedmetadata = () => {
      detectedDuration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
      const safeDur = detectedDuration > 0 ? detectedDuration : 3;
      const ratios =
        maxFrames <= 1
          ? [0.33]
          : maxFrames === 2
          ? [0.15, 0.7]
          : maxFrames === 3
          ? [0.1, 0.5, 0.85]
          : [0.08, 0.34, 0.62, 0.88];
      seekTargets = ratios.map((r) => Math.max(0.1, Math.min(Math.max(0.2, safeDur - 0.2), safeDur * r)));
    };

    video.onloadeddata = () => {
      if (seekTargets.length === 0) {
        seekTargets = [0.3];
      }
      seekNext();
    };

    video.onseeked = () => {
      captureCurrentFrame();
      seekNext();
    };

    video.onerror = finish;
    video.src = url;
  });
}

/**
 * Extracts a single lightweight JPEG frame from a local video File so visual
 * explicit/adult-content safety checks can inspect video uploads cleanly.
 */
export async function extractVideoFrameDataUrl(file: File): Promise<string | null> {
  const { frames } = await extractVideoMetadataAndFrames(file, 1);
  return frames[0] || null;
}
