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
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { auth, db } from './firebase';

const FIRESTORE_CHUNK_RAW_BYTES = 420 * 1024; // ~560 KB base64 per doc (well under Firestore 1 MB limit)
const MAX_FIRESTORE_REPLICATED_BYTES = 18 * 1024 * 1024; // Replicate up to 18 MB cross-container via Firestore
const MAX_DATA_URL_INLINE_BYTES = 240 * 1024;

const resolvedMediaCache = new Map<string, string>();
const pendingResolutionMap = new Map<string, Promise<string>>();

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
  uid: string
): Promise<string | null> {
  try {
    const storage = getStorage(db.app);
    const storageRef = ref(storage, `users/${uid}/media/${mediaId}.${ext}`);
    const uploadPromise = uploadBytes(storageRef, blob, {
      contentType: mimeType || (ext === 'mp4' ? 'video/mp4' : 'image/jpeg'),
    }).then((snap) => getDownloadURL(snap.ref));

    const timeoutPromise = new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), 5000);
    });

    const url = await Promise.race([uploadPromise, timeoutPromise]);
    return typeof url === 'string' && url.startsWith('https://') ? url : null;
  } catch {
    return null;
  }
}

async function tryUploadToExpressServer(
  blob: Blob,
  mediaId: string,
  ext: string,
  mimeType: string,
  idToken: string
): Promise<string | null> {
  try {
    const resp = await fetch('/api/media/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': mimeType || (ext === 'mp4' ? 'video/mp4' : 'image/jpeg'),
        'X-Media-Id': mediaId,
        'X-Media-Ext': ext,
      },
      body: blob,
    });
    if (!resp.ok) return null;
    const data = await resp.json().catch(() => null);
    return typeof data?.url === 'string' && data.url ? data.url : null;
  } catch {
    return null;
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
        onProgress(Math.min(95, Math.round(((i + 1) / totalChunks) * 85) + 10));
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
 * Priority: Firebase Storage -> Same-origin /api/media streaming + Firestore cross-container chunk mirror.
 */
export async function uploadMediaFile(
  fileOrBlob: File | Blob,
  options?: {
    mimeType?: string;
    fileName?: string;
    onProgress?: (pct: number) => void;
  }
): Promise<string> {
  const user = auth.currentUser;
  const mimeType =
    options?.mimeType ||
    fileOrBlob.type ||
    (options?.fileName && /\.(mp4|webm|mov|m4v|ogg)$/i.test(options.fileName)
      ? 'video/mp4'
      : 'image/jpeg');
  const ext = inferExtension(mimeType, options?.fileName || (fileOrBlob instanceof File ? fileOrBlob.name : undefined));
  const mediaId = generateMediaId();

  options?.onProgress?.(10);

  if (user) {
    const storageUrl = await tryUploadToFirebaseStorage(
      fileOrBlob,
      mediaId,
      ext,
      mimeType,
      user.uid
    );
    if (storageUrl) {
      options?.onProgress?.(100);
      return storageUrl;
    }

    const idToken = await user.getIdToken().catch(() => '');
    const [serverUrl, firestoreOk] = await Promise.all([
      idToken
        ? tryUploadToExpressServer(fileOrBlob, mediaId, ext, mimeType, idToken)
        : Promise.resolve(null),
      tryReplicateToFirestoreChunks(
        fileOrBlob,
        mediaId,
        mimeType,
        user.uid,
        options?.onProgress
      ),
    ]);

    try {
      const localBlobUrl = URL.createObjectURL(fileOrBlob);
      resolvedMediaCache.set(mediaId, localBlobUrl);
    } catch {}

    options?.onProgress?.(100);

    if (serverUrl) return serverUrl;
    if (firestoreOk) return `pv-media://${mediaId}`;
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

  throw new Error('মিডিয়া ফাইল আপলোড করা যায়নি। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।');
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const resp = await fetch(dataUrl);
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
  const blob = await dataUrlToBlob(clean);
  const mimeType =
    blob.type || (kind === 'video' ? 'video/mp4' : 'image/jpeg');
  return uploadMediaFile(blob, { mimeType });
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
