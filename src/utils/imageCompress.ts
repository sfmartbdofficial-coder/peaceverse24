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
 * Extracts a single lightweight JPEG frame from a local video File so visual
 * explicit/adult-content safety checks can inspect video uploads cleanly.
 */
export function extractVideoFrameDataUrl(file: File): Promise<string | null> {
  if (typeof document === 'undefined' || !file.type.startsWith('video/')) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    let settled = false;

    const finish = (result: string | null) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve(result);
    };

    const timer = window.setTimeout(() => finish(null), 2500);

    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(1, (video.duration || 1) / 3);
      } catch {
        window.clearTimeout(timer);
        finish(null);
      }
    };

    video.onseeked = () => {
      window.clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        const w = Math.min(480, video.videoWidth || 320);
        const h = Math.max(
          1,
          Math.round(((video.videoHeight || 240) / (video.videoWidth || 320)) * w)
        );
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          finish(null);
          return;
        }
        ctx.drawImage(video, 0, 0, w, h);
        finish(canvas.toDataURL('image/jpeg', 0.65));
      } catch {
        finish(null);
      }
    };

    video.onerror = () => {
      window.clearTimeout(timer);
      finish(null);
    };

    video.src = url;
  });
}
