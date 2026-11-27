import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { compressDataUrlUnderLimit } from '../utils/imageCompress';

const FIRESTORE_CHUNK_RAW_BYTES = 420 * 1024; // ~560 KB base64 per doc (well under Firestore 1 MB limit)
const MAX_FIRESTORE_REPLICATED_BYTES = 18 * 1024 * 1024; // Replicate up to 18 MB cross-container via Firestore
const MAX_SINGLE_SERVER_UPLOAD_BYTES = 2 * 1024 * 1024; // Anything > 2 MB uses resilient chunked streaming
const EXPRESS_STREAM_CHUNK_BYTES = 2 * 1024 * 1024; // 2 MB chunks (well below Cloud Run 32 MB & mobile timeouts)
const EXPRESS_LARGE_STREAM_CHUNK_BYTES = 4 * 1024 * 1024; // 4 MB chunks for > 1 GB videos
const MAX_DATA_URL_INLINE_BYTES = 240 * 1024;

let firebaseStorageUnavailable = false;

const resolvedMediaCache = new Map<string, string>();
const pendingResolutionMap = new Map<string, Promise<string>>();

export interface PendingBlobMeta {
  file: File;
  durationSeconds?: number;
  durationText?: string;
  frames?: string[];
}

const pendingBlobRegistry = new Map<string, PendingBlobMeta>();

export function registerPendingBlobFile(blobUrl: string, meta: PendingBlobMeta): void {
  if (!blobUrl) return;
  pendingBlobRegistry.set(blobUrl, meta);
}

export function getPendingBlobMetadata(blobUrl?: string | null): PendingBlobMeta | null {
  if (!blobUrl) return null;
  return pendingBlobRegistry.get(blobUrl) || null;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    const slice = bytes.subarray(i, Math.min(i + step, bytes.length));
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function inferExtension(mimeType: string, fileName?: string): string {
  const cleanMime = (mimeType || '').toLowerCase();
  if (cleanMime.includes('mp4') || cleanMime.includes('m4v')) return 'mp4';
  if (cleanMime.includes('webm')) return 'webm';
  if (cleanMime.includes('quicktime')) return 'mov';
  if (cleanMime.includes('ogg')) return 'ogg';
  if (cleanMime.includes('png')) return 'png';
  if (cleanMime.includes('webp')) return 'webp';
  if (cleanMime.includes('gif')) return 'gif';
  if (cleanMime.includes('jpeg') || cleanMime.includes('jpg')) return 'jpg';
  if (cleanMime.includes('mpeg')) return 'mp3';
  if (cleanMime.includes('audio/mp4')) return 'm4a';

  const extMatch = (fileName || '').toLowerCase().match(/\.([a-z0-9]+)$/);
  if (extMatch && ['mp4', 'webm', 'mov', 'm4v', 'ogg', 'jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extMatch[1])) {
    return extMatch[1] === 'jpeg' ? 'jpg' : extMatch[1];
  }
  return cleanMime.startsWith('video/') ? 'mp4' : 'jpg';
}

function generateMediaId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `pv_${Date.now()}_${rand}`;
}

export function extractMediaIdFromUrl(url?: string): string | null {
  const clean = (url || '').trim();
  if (!clean) return null;
  if (clean.startsWith('pv-media://')) {
    const id = clean.slice('pv-media://'.length).split(/[/?#]/)[0];
    return id || null;
  }
  const match = clean.match(/^\/api\/media\/([a-zA-Z0-9_-]+)(?:\.[a-zA-Z0-9]+)?/);
  return match ? match[1] : null;
}

async function tryUploadToFirebaseStorage(
  blob: Blob,
  mediaId: string,
  ext: string,
  mimeType: string,
  uid: string,
  onProgress?: (pct: number) => void
): Promise<string | null> {
  if (firebaseStorageUnavailable) return null;
  try {
    const storage = getStorage(db.app);
    const storageRef = ref(storage, `users/${uid}/media/${mediaId}.${ext}`);
    const contentType = mimeType || (ext === 'mp4' ? 'video/mp4' : 'image/jpeg');

    if (blob.size <= 12 * 1024 * 1024) {
      const uploadPromise = uploadBytes(storageRef, blob, { contentType })
        .then((snap) => getDownloadURL(snap.ref))
        .catch(() => {
          firebaseStorageUnavailable = true;
          return null;
        });
      const timeoutPromise = new Promise<null>((resolve) => {
        window.setTimeout(() => {
          firebaseStorageUnavailable = true;
          resolve(null);
        }, 5000);
      });
      const url = await Promise.race([uploadPromise, timeoutPromise]);
      return typeof url === 'string' && url.startsWith('https://') ? url : null;
    }

    // For large videos (>12MB), use resumable upload with stall detection (never emit 0-byte 5% stall)
    return await new Promise<string | null>((resolve) => {
      const task = uploadBytesResumable(storageRef, blob, { contentType });
      let lastMovedAt = Date.now();
      let settled = false;

      const finish = (res: string | null) => {
        if (settled) return;
        settled = true;
        window.clearInterval(stallTimer);
        if (!res) {
          firebaseStorageUnavailable = true;
        }
        resolve(res);
      };

      const stallTimer = window.setInterval(() => {
        if (Date.now() - lastMovedAt > 5000) {
          try {
            task.cancel();
          } catch {}
          finish(null);
        }
      }, 1500);

      task.on(
        'state_changed',
        (snap) => {
          if (snap.bytesTransferred > 0) {
            lastMovedAt = Date.now();
            if (snap.totalBytes > 0 && onProgress) {
              onProgress(Math.min(98, Math.round((snap.bytesTransferred / snap.totalBytes) * 86) + 12));
            }
          }
        },
        () => finish(null),
        async () => {
          try {
            const dlUrl = await getDownloadURL(task.snapshot.ref);
            finish(typeof dlUrl === 'string' && dlUrl.startsWith('https://') ? dlUrl : null);
          } catch {
            finish(null);
          }
        }
      );
    });
  } catch {
    firebaseStorageUnavailable = true;
    return null;
  }
}

interface ExpressUploadResult {
  url: string | null;
  status?: number;
  errorMessage?: string;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 45_000
): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

async function tryUploadToExpressServer(
  blob: Blob,
  mediaId: string,
  ext: string,
  mimeType: string,
  initialIdToken: string,
  onProgress?: (pct: number) => void
): Promise<ExpressUploadResult> {
  let activeToken = initialIdToken;
  const safeMime = mimeType || (ext === 'mp4' ? 'video/mp4' : 'image/jpeg');

  try {
    if (blob.size <= MAX_SINGLE_SERVER_UPLOAD_BYTES) {
      const payloadBytes = await blob.arrayBuffer();
      let lastStatus = 0;
      let lastMsg = '';
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0 && auth.currentUser) {
          activeToken = await auth.currentUser.getIdToken(attempt === 1 && lastStatus === 401).catch(() => activeToken);
        }
        try {
          onProgress?.(Math.min(90, 20 + attempt * 15));
          const resp = await fetchWithTimeout(
            '/api/media/upload',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${activeToken}`,
                'Content-Type': 'application/octet-stream',
                'X-Media-Mime': safeMime,
                'X-Media-Id': mediaId,
                'X-Media-Ext': ext,
              },
              body: payloadBytes,
            },
            45_000
          );
          lastStatus = resp.status;
          if (resp.ok) {
            const data = await resp.json().catch(() => null);
            const url = typeof data?.url === 'string' && data.url ? data.url : null;
            if (url) return { url, status: resp.status };
          }
          const errJson = await resp.json().catch(() => null);
          lastMsg = String(errJson?.error || '');
          // Retry on 401 (with refreshed token), 429, or 5xx; abort early on other 4xx
          if (resp.status >= 400 && resp.status < 429 && resp.status !== 401 && resp.status !== 408) {
            return { url: null, status: resp.status, errorMessage: lastMsg };
          }
        } catch (err: any) {
          lastMsg = String(err?.message || '');
        }
        await new Promise((r) => window.setTimeout(r, 500 * (attempt + 1)));
      }
      return { url: null, status: lastStatus || undefined, errorMessage: lastMsg };
    }

    // Chunked streaming upload for videos/media > 2 MB (supports up to 2 GB smoothly on mobile & Cloud Run)
    const chunkSize =
      blob.size > 1024 * 1024 * 1024 ? EXPRESS_LARGE_STREAM_CHUNK_BYTES : EXPRESS_STREAM_CHUNK_BYTES;
    const totalChunks = Math.max(1, Math.ceil(blob.size / chunkSize));
    let finalUrl: string | null = null;

    for (let idx = 0; idx < totalChunks; idx++) {
      const start = idx * chunkSize;
      const end = Math.min(start + chunkSize, blob.size);
      const chunkBytes = await blob.slice(start, end).arrayBuffer();

      let chunkData: any = null;
      let lastStatus = 0;
      let lastMsg = '';

      for (let attempt = 0; attempt < 4; attempt++) {
        if (attempt > 0 && auth.currentUser) {
          activeToken = await auth.currentUser
            .getIdToken(lastStatus === 401 || attempt >= 2)
            .catch(() => activeToken);
        }

        try {
          const resp = await fetchWithTimeout(
            '/api/media/upload-chunk',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${activeToken}`,
                'Content-Type': 'application/octet-stream',
                'X-Media-Mime': safeMime,
                'X-Media-Id': mediaId,
                'X-Media-Ext': ext,
                'X-Chunk-Index': String(idx),
                'X-Total-Chunks': String(totalChunks),
              },
              body: chunkBytes,
            },
            45_000
          );
          lastStatus = resp.status;
          if (resp.ok) {
            chunkData = await resp.json().catch(() => null);
            if (chunkData?.ok) break;
          } else {
            const errJson = await resp.json().catch(() => null);
            lastMsg = String(errJson?.error || '');
            // Retry on 401 (token refresh), 408, 429, or 5xx; abort early on other 4xx (like 413/415/403)
            if (resp.status >= 400 && resp.status < 429 && resp.status !== 401 && resp.status !== 408) {
              return { url: null, status: resp.status, errorMessage: lastMsg };
            }
          }
        } catch (err: any) {
          lastMsg = String(err?.message || '');
        }
        await new Promise((r) => window.setTimeout(r, 600 * (attempt + 1)));
      }

      if (!chunkData?.ok) {
        return { url: null, status: lastStatus || undefined, errorMessage: lastMsg };
      }
      if (onProgress) {
        onProgress(Math.min(96, Math.round(((idx + 1) / totalChunks) * 84) + 12));
      }
      if (typeof chunkData.url === 'string' && chunkData.url) {
        finalUrl = chunkData.url;
      }
    }

    return { url: finalUrl, status: 200 };
  } catch (err: any) {
    return { url: null, errorMessage: String(err?.message || '') };
  }
}

async function tryReplicateToFirestoreChunks(
  blob: Blob,
  mediaId: string,
  mimeType: string,
  uid: string,
  onProgress?: (pct: number) => void
): Promise<boolean> {
  if (blob.size > MAX_FIRESTORE_REPLICATED_BYTES) return false;
  try {
    const buf = await blob.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const totalChunks = Math.max(1, Math.ceil(bytes.length / FIRESTORE_CHUNK_RAW_BYTES));

    for (let i = 0; i < totalChunks; i++) {
      const start = i * FIRESTORE_CHUNK_RAW_BYTES;
      const end = Math.min(start + FIRESTORE_CHUNK_RAW_BYTES, bytes.length);
      const chunkBytes = bytes.subarray(start, end);
      const chunkB64 = bytesToBase64(chunkBytes);
      const chunkId = String(i).padStart(5, '0');
      await setDoc(doc(db, 'media_files', mediaId, 'chunks', chunkId), {
        index: i,
        data: chunkB64,
        bytes: chunkBytes.length,
      });
      if (onProgress) {
        onProgress(Math.min(95, Math.round(((i + 1) / totalChunks) * 82) + 12));
      }
    }

    await setDoc(doc(db, 'media_files', mediaId), {
      id: mediaId,
      ownerUid: uid,
      mimeType: mimeType || 'video/mp4',
      totalBytes: bytes.length,
      totalChunks,
      createdAt: new Date().toISOString(),
      createdAtMillis: Date.now(),
    });
    return true;
  } catch (err) {
    console.warn('Firestore media chunk replication notice:', err);
    return false;
  }
}

/**
 * Uploads any image or video File/Blob so it persists cleanly across devices & Cloud Run instances.
 * Primary: Fast same-origin 2 MB chunked streaming (/api/media/upload-chunk) + background Firestore mirror.
 * Fallback: Firebase Storage -> Firestore chunks -> small inline DataURL.
 */
export async function uploadMediaFile(
  fileOrBlob: File | Blob,
  options?: {
    mimeType?: string;
    fileName?: string;
    onProgress?: (pct: number) => void;
  }
): Promise<string> {
  if (!auth.currentUser && typeof auth.authStateReady === 'function') {
    await auth.authStateReady().catch(() => {});
  }
  const user = auth.currentUser;
  const mimeType =
    options?.mimeType ||
    fileOrBlob.type ||
    (options?.fileName && /\.(mp4|webm|mov|m4v|ogg|3gp|mkv)$/i.test(options.fileName)
      ? 'video/mp4'
      : 'image/jpeg');
  const ext = inferExtension(mimeType, options?.fileName || (fileOrBlob instanceof File ? fileOrBlob.name : undefined));
  const mediaId = generateMediaId();

  let highestProgress = 0;
  const reportProgress = (pct: number) => {
    const clamped = Math.max(highestProgress, Math.min(100, Math.round(pct)));
    highestProgress = clamped;
    options?.onProgress?.(clamped);
  };

  reportProgress(10);

  let lastServerStatus: number | undefined;

  if (user) {
    let idToken = await user.getIdToken().catch(() => '');
    if (!idToken) {
      idToken = await user.getIdToken(true).catch(() => '');
    }

    if (idToken) {
      const serverResult = await tryUploadToExpressServer(
        fileOrBlob,
        mediaId,
        ext,
        mimeType,
        idToken,
        reportProgress
      );
      lastServerStatus = serverResult.status;

      if (serverResult.url) {
        try {
          const localBlobUrl = URL.createObjectURL(fileOrBlob);
          resolvedMediaCache.set(mediaId, localBlobUrl);
        } catch {}

        // Mirror <= 18 MB media to Firestore in background for cross-container redundancy without blocking UI
        if (fileOrBlob.size <= MAX_FIRESTORE_REPLICATED_BYTES) {
          void tryReplicateToFirestoreChunks(fileOrBlob, mediaId, mimeType, user.uid);
        }

        reportProgress(100);
        return serverResult.url;
      }
    }

    // Fallback when same-origin server storage is unavailable (e.g. static edge hosting)
    const storageUrl = await tryUploadToFirebaseStorage(
      fileOrBlob,
      mediaId,
      ext,
      mimeType,
      user.uid,
      reportProgress
    );
    if (storageUrl) {
      reportProgress(100);
      return storageUrl;
    }

    const firestoreOk = await tryReplicateToFirestoreChunks(
      fileOrBlob,
      mediaId,
      mimeType,
      user.uid,
      reportProgress
    );

    if (firestoreOk) {
      try {
        const localBlobUrl = URL.createObjectURL(fileOrBlob);
        resolvedMediaCache.set(mediaId, localBlobUrl);
      } catch {}
      reportProgress(100);
      return `pv-media://${mediaId}`;
    }
  }

  // Last-resort fallback for small blobs when offline
  if (fileOrBlob.size <= 650 * 1024) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(typeof reader.result === 'string' ? reader.result : '');
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(fileOrBlob);
    });
  }

  if (!user) {
    throw new Error('ভিডিও আপলোড করতে অনুগ্রহ করে আগে আপনার অ্যাকাউন্টে লগইন করুন।');
  }
  if (lastServerStatus === 401) {
    throw new Error('লগইন সেশন রিফ্রেশ করা যায়নি। অনুগ্রহ করে আবার লগইন করে চেষ্টা করুন।');
  }
  if (lastServerStatus === 413) {
    throw new Error('ভিডিও ফাইলের সাইজ নির্ধারিত সীমার চেয়ে বড়। অনুগ্রহ করে ২ GB-এর কম ফাইল দিন।');
  }

  throw new Error('মিডিয়া ফাইল আপলোড করা যায়নি। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।');
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const clean = (dataUrl || '').trim();
  const commaIdx = clean.indexOf(',');
  if (clean.startsWith('data:') && commaIdx !== -1) {
    const header = clean.slice(5, commaIdx);
    const body = clean.slice(commaIdx + 1);
    const mimeMatch = header.match(/^([^;]+)/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const isBase64 = /;base64/i.test(header);
    if (isBase64) {
      const byteStr = atob(body.replace(/\s+/g, ''));
      const bytes = new Uint8Array(byteStr.length);
      for (let i = 0; i < byteStr.length; i++) {
        bytes[i] = byteStr.charCodeAt(i);
      }
      return new Blob([bytes], { type: mimeType });
    }
    const decoded = decodeURIComponent(body);
    return new Blob([decoded], { type: mimeType });
  }
  const resp = await fetch(clean);
  return resp.blob();
}

export async function uploadDataUrlIfOversized(
  url: string,
  kind: 'image' | 'video',
  forceUpload = false
): Promise<string> {
  const clean = (url || '').trim();
  if (!clean) return '';
  if (!clean.startsWith('data:')) {
    return clean;
  }
  if (!forceUpload && kind === 'image' && clean.length <= MAX_DATA_URL_INLINE_BYTES) {
    return clean;
  }
  try {
    const blob = await dataUrlToBlob(clean);
    const mimeType =
      blob.type || (kind === 'video' ? 'video/mp4' : 'image/jpeg');
    const uploaded = await uploadMediaFile(blob, { mimeType });
    if (uploaded) return uploaded;
  } catch (err) {
    if (kind !== 'image') throw err;
  }
  // Safe fallback for images: re-compress under inline Firestore limit so valid posts never fail
  if (kind === 'image') {
    return compressDataUrlUnderLimit(clean, MAX_DATA_URL_INLINE_BYTES, 900);
  }
  return clean;
}

async function fetchBlobUrlFromFirestoreChunks(mediaId: string): Promise<string> {
  const cached = resolvedMediaCache.get(mediaId);
  if (cached) return cached;

  const existingPending = pendingResolutionMap.get(mediaId);
  if (existingPending) return existingPending;

  const task = (async () => {
    try {
      const metaSnap = await getDoc(doc(db, 'media_files', mediaId));
      const meta = metaSnap.exists() ? metaSnap.data() : null;
      const mimeType = String(meta?.mimeType || 'video/mp4');

      const chunksSnap = await getDocs(
        query(collection(db, 'media_files', mediaId, 'chunks'), orderBy('index', 'asc'), limit(200))
      );
      if (chunksSnap.empty) return '';

      const sortedDocs = [...chunksSnap.docs].sort(
        (a, b) => Number(a.data()?.index ?? 0) - Number(b.data()?.index ?? 0)
      );
      const byteArrays = sortedDocs
        .map((d) => {
          const b64 = String(d.data()?.data || '');
          return b64 ? base64ToBytes(b64) : new Uint8Array(0);
        })
        .filter((arr) => arr.length > 0);

      if (byteArrays.length === 0) return '';
      const blobParts = byteArrays.map((arr) => arr.buffer as ArrayBuffer);
      const blob = new Blob(blobParts, { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      resolvedMediaCache.set(mediaId, blobUrl);
      return blobUrl;
    } catch {
      return '';
    } finally {
      pendingResolutionMap.delete(mediaId);
    }
  })();

  pendingResolutionMap.set(mediaId, task);
  return task;
}

export async function resolvePlayableMediaUrl(src?: string): Promise<string> {
  const clean = (src || '').trim();
  if (!clean) return '';
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:') || clean.startsWith('blob:')) {
    return clean;
  }

  const mediaId = extractMediaIdFromUrl(clean);
  if (!mediaId) return clean;

  const cached = resolvedMediaCache.get(mediaId);
  if (cached) return cached;

  if (clean.startsWith('pv-media://')) {
    const resolved = await fetchBlobUrlFromFirestoreChunks(mediaId);
    return resolved || clean;
  }

  if (clean.startsWith('/api/media/')) {
    try {
      const headRes = await fetch(clean, { method: 'HEAD' });
      if (headRes.ok) {
        return clean;
      }
    } catch {}
    const fallbackUrl = await fetchBlobUrlFromFirestoreChunks(mediaId);
    return fallbackUrl || clean;
  }

  return clean;
}

export function useResolvedMediaUrl(src?: string): string {
  const clean = (src || '').trim();
  const mediaId = extractMediaIdFromUrl(clean);
  const initial = mediaId && resolvedMediaCache.has(mediaId)
    ? resolvedMediaCache.get(mediaId)!
    : clean.startsWith('pv-media://')
    ? ''
    : clean;

  const [resolved, setResolved] = useState<string>(initial);

  useEffect(() => {
    let active = true;
    if (!clean) {
      setResolved('');
      return;
    }

    if (
      clean.startsWith('http://') ||
      clean.startsWith('https://') ||
      clean.startsWith('data:') ||
      clean.startsWith('blob:')
    ) {
      setResolved(clean);
      return;
    }

    if (mediaId && resolvedMediaCache.has(mediaId)) {
      setResolved(resolvedMediaCache.get(mediaId)!);
      return;
    }

    if (!clean.startsWith('pv-media://')) {
      setResolved(clean);
    }

    void resolvePlayableMediaUrl(clean).then((nextUrl) => {
      if (active && nextUrl) {
        setResolved(nextUrl);
      }
    });

    return () => {
      active = false;
    };
  }, [clean, mediaId]);

  return resolved;
}

export function useResolvedMediaUrls(urls: string[]): string[] {
  const key = urls.join('|');
  const [resolvedUrls, setResolvedUrls] = useState<string[]>(() =>
    urls.map((u) => {
      const id = extractMediaIdFromUrl(u);
      if (id && resolvedMediaCache.has(id)) return resolvedMediaCache.get(id)!;
      return u.startsWith('pv-media://') ? '' : u;
    })
  );

  useEffect(() => {
    let active = true;
    if (urls.length === 0) {
      setResolvedUrls([]);
      return;
    }
    setResolvedUrls(
      urls.map((u) => {
        const id = extractMediaIdFromUrl(u);
        if (id && resolvedMediaCache.has(id)) return resolvedMediaCache.get(id)!;
        return u.startsWith('pv-media://') ? '' : u;
      })
    );

    Promise.all(urls.map((u) => resolvePlayableMediaUrl(u))).then((nextList) => {
      if (active) {
        setResolvedUrls(nextList);
      }
    });

    return () => {
      active = false;
    };
  }, [key]);

  return resolvedUrls;
}
