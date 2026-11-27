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
import { isSupabaseConfigured, supabase } from './supabase';
import { compressDataUrlUnderLimit } from '../utils/imageCompress';

const FIRESTORE_CHUNK_RAW_BYTES = 420 * 1024; // ~560 KB base64 per doc (well under Firestore 1 MB limit)
const MAX_FIRESTORE_REPLICATED_BYTES = 45 * 1024 * 1024; // Up to 45 MB (10s-3min Reels even without R2/Firebase Storage)
const MAX_SINGLE_SERVER_UPLOAD_BYTES = 4 * 1024 * 1024; // Single POST up to 4 MB
const EXPRESS_STREAM_CHUNK_BYTES = 6 * 1024 * 1024; // 6 MB chunks: safe for Cloud Run (32MB), Cloudflare (100MB), and R2 Multipart (5MB+ parts)
const EXPRESS_LARGE_STREAM_CHUNK_BYTES = 8 * 1024 * 1024; // 8 MB chunks for > 1 GB videos
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
  if (cleanMime.includes('3gp')) return '3gp';
  if (cleanMime.includes('matroska') || cleanMime.includes('mkv')) return 'mkv';
  if (cleanMime.includes('png')) return 'png';
  if (cleanMime.includes('webp')) return 'webp';
  if (cleanMime.includes('gif')) return 'gif';
  if (cleanMime.includes('jpeg') || cleanMime.includes('jpg')) return 'jpg';
  if (cleanMime.includes('mpeg')) return 'mp3';
  if (cleanMime.includes('audio/mp4')) return 'm4a';

  const extMatch = (fileName || '').toLowerCase().match(/\.([a-z0-9]+)$/);
  if (extMatch && ['mp4', 'webm', 'mov', 'm4v', 'ogg', '3gp', 'mkv', 'jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extMatch[1])) {
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

interface BackendStorageResult {
  url: string | null;
  status?: number;
  code?: string;
  errorMessage?: string;
  isNetworkFailure?: boolean;
}

async function tryUploadToFirebaseStorage(
  blob: Blob,
  mediaId: string,
  ext: string,
  mimeType: string,
  uid: string,
  onProgress?: (pct: number) => void
): Promise<BackendStorageResult> {
  if (firebaseStorageUnavailable) {
    return { url: null, code: 'storage/unavailable', errorMessage: 'Firebase Storage bucket not provisioned.' };
  }
  try {
    const storage = getStorage(db.app);
    const storageRef = ref(storage, `users/${uid}/media/${mediaId}.${ext}`);
    const contentType = mimeType || (ext === 'mp4' ? 'video/mp4' : 'image/jpeg');

    if (blob.size <= 12 * 1024 * 1024) {
      let errCode = '';
      let errMsg = '';
      const uploadPromise = uploadBytes(storageRef, blob, { contentType })
        .then((snap) => getDownloadURL(snap.ref))
        .catch((err: any) => {
          errCode = String(err?.code || 'storage/error');
          errMsg = String(err?.message || '');
          firebaseStorageUnavailable = true;
          return null;
        });
      const timeoutPromise = new Promise<null>((resolve) => {
        window.setTimeout(() => {
          errCode = errCode || 'storage/timeout';
          firebaseStorageUnavailable = true;
          resolve(null);
        }, 6000);
      });
      const url = await Promise.race([uploadPromise, timeoutPromise]);
      if (typeof url === 'string' && url.startsWith('https://')) {
        return { url };
      }
      return { url: null, code: errCode, errorMessage: errMsg };
    }

    return await new Promise<BackendStorageResult>((resolve) => {
      const task = uploadBytesResumable(storageRef, blob, { contentType });
      let lastMovedAt = Date.now();
      let settled = false;

      const finish = (res: BackendStorageResult) => {
        if (settled) return;
        settled = true;
        window.clearInterval(stallTimer);
        if (!res.url) {
          firebaseStorageUnavailable = true;
        }
        resolve(res);
      };

      const stallTimer = window.setInterval(() => {
        if (Date.now() - lastMovedAt > 6000) {
          try {
            task.cancel();
          } catch {}
          finish({ url: null, code: 'storage/timeout', errorMessage: 'Firebase Storage stalled' });
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
        (err: any) => finish({ url: null, code: String(err?.code || 'storage/error'), errorMessage: String(err?.message || '') }),
        async () => {
          try {
            const dlUrl = await getDownloadURL(task.snapshot.ref);
            finish(
              typeof dlUrl === 'string' && dlUrl.startsWith('https://')
                ? { url: dlUrl }
                : { url: null, code: 'storage/no-url' }
            );
          } catch (err: any) {
            finish({ url: null, code: String(err?.code || 'storage/error'), errorMessage: String(err?.message || '') });
          }
        }
      );
    });
  } catch (err: any) {
    firebaseStorageUnavailable = true;
    return { url: null, code: String(err?.code || 'storage/unavailable'), errorMessage: String(err?.message || '') };
  }
}

async function tryUploadToSupabaseStorage(
  blob: Blob,
  mediaId: string,
  ext: string,
  mimeType: string,
  uid: string
): Promise<BackendStorageResult> {
  if (!isSupabaseConfigured || !supabase || blob.size > 50 * 1024 * 1024) {
    return { url: null };
  }
  try {
    const objectPath = `${uid}/${mediaId}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(objectPath, blob, {
      contentType: mimeType || 'video/mp4',
      upsert: true,
    });
    if (error) {
      return { url: null, code: 'supabase/error', errorMessage: error.message };
    }
    const { data } = supabase.storage.from('media').getPublicUrl(objectPath);
    if (data?.publicUrl && data.publicUrl.startsWith('https://')) {
      return { url: data.publicUrl };
    }
    return { url: null };
  } catch (err: any) {
    return { url: null, errorMessage: String(err?.message || '') };
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 75_000
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
): Promise<BackendStorageResult> {
  let activeToken = initialIdToken;
  const safeMime = mimeType || (ext === 'mp4' ? 'video/mp4' : 'image/jpeg');

  try {
    if (blob.size <= MAX_SINGLE_SERVER_UPLOAD_BYTES) {
      const payloadBytes = await blob.arrayBuffer();
      let lastStatus = 0;
      let lastMsg = '';
      let sawNetworkErr = false;

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
            75_000
          );
          lastStatus = resp.status;
          const respContentType = (resp.headers.get('content-type') || '').toLowerCase();

          // Static/SPA hosts without /api/media handler return HTML index.html or 501 immediately
          if (respContentType.includes('text/html') || resp.status === 501) {
            const errJson = await resp.json().catch(() => null);
            return {
              url: null,
              status: 501,
              code: errJson?.code || 'MEDIA_STORAGE_NOT_CONFIGURED',
              errorMessage: errJson?.error || 'Static edge host has no media bucket configured.',
            };
          }

          if (resp.ok) {
            const data = await resp.json().catch(() => null);
            const url = typeof data?.url === 'string' && data.url ? data.url : null;
            if (url) return { url, status: resp.status };
          }
          const errJson = await resp.json().catch(() => null);
          lastMsg = String(errJson?.error || '');
          if (resp.status >= 400 && resp.status < 429 && resp.status !== 401 && resp.status !== 408) {
            return { url: null, status: resp.status, code: errJson?.code, errorMessage: lastMsg };
          }
        } catch (err: any) {
          lastMsg = String(err?.message || '');
          sawNetworkErr = true;
        }
        await new Promise((r) => window.setTimeout(r, 500 * (attempt + 1)));
      }
      return {
        url: null,
        status: lastStatus || undefined,
        errorMessage: lastMsg,
        isNetworkFailure: sawNetworkErr && !lastStatus,
      };
    }

    // Chunked streaming upload (6 MB / 8 MB chunks — compatible with Cloud Run 32MB, Cloudflare Workers, & R2 Multipart 5MB+)
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
      let sawNetworkErr = false;

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
            75_000
          );
          lastStatus = resp.status;
          const respContentType = (resp.headers.get('content-type') || '').toLowerCase();

          if (respContentType.includes('text/html') || resp.status === 501) {
            const errJson = await resp.json().catch(() => null);
            return {
              url: null,
              status: 501,
              code: errJson?.code || 'MEDIA_STORAGE_NOT_CONFIGURED',
              errorMessage: errJson?.error || 'Static edge host has no media bucket configured.',
            };
          }

          if (resp.ok) {
            chunkData = await resp.json().catch(() => null);
            if (chunkData?.ok) break;
          } else {
            const errJson = await resp.json().catch(() => null);
            lastMsg = String(errJson?.error || '');
            if (resp.status >= 400 && resp.status < 429 && resp.status !== 401 && resp.status !== 408) {
              return { url: null, status: resp.status, code: errJson?.code, errorMessage: lastMsg };
            }
          }
        } catch (err: any) {
          lastMsg = String(err?.message || '');
          sawNetworkErr = true;
        }
        await new Promise((r) => window.setTimeout(r, 600 * (attempt + 1)));
      }

      if (!chunkData?.ok) {
        return {
          url: null,
          status: lastStatus || undefined,
          errorMessage: lastMsg,
          isNetworkFailure: sawNetworkErr && !lastStatus,
        };
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
    return { url: null, errorMessage: String(err?.message || ''), isNetworkFailure: true };
  }
}

async function tryReplicateToFirestoreChunks(
  blob: Blob,
  mediaId: string,
  mimeType: string,
  uid: string,
  onProgress?: (pct: number) => void
): Promise<{ ok: boolean; errorCode?: string; errorMessage?: string }> {
  if (blob.size > MAX_FIRESTORE_REPLICATED_BYTES) {
    return { ok: false, errorCode: 'firestore/too-large' };
  }
  try {
    const buf = await blob.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const totalChunks = Math.max(1, Math.ceil(bytes.length / FIRESTORE_CHUNK_RAW_BYTES));
    let completed = 0;
    let nextIdx = 0;
    const concurrency = Math.min(4, totalChunks);

    const writeChunkWithRetry = async (i: number) => {
      const start = i * FIRESTORE_CHUNK_RAW_BYTES;
      const end = Math.min(start + FIRESTORE_CHUNK_RAW_BYTES, bytes.length);
      const chunkBytes = bytes.subarray(start, end);
      const chunkB64 = bytesToBase64(chunkBytes);
      const chunkId = String(i).padStart(5, '0');

      let lastErr: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await setDoc(doc(db, 'media_files', mediaId, 'chunks', chunkId), {
            index: i,
            data: chunkB64,
            bytes: chunkBytes.length,
          });
          return;
        } catch (err: any) {
          lastErr = err;
          if (String(err?.code || '').includes('permission-denied')) throw err;
          await new Promise((r) => window.setTimeout(r, 400 * (attempt + 1)));
        }
      }
      throw lastErr;
    };

    const workers = Array.from({ length: concurrency }, async () => {
      while (true) {
        const idx = nextIdx++;
        if (idx >= totalChunks) break;
        await writeChunkWithRetry(idx);
        completed += 1;
        if (onProgress) {
          onProgress(Math.min(95, Math.round((completed / totalChunks) * 82) + 12));
        }
      }
    });

    await Promise.all(workers);

    await setDoc(doc(db, 'media_files', mediaId), {
      id: mediaId,
      ownerUid: uid,
      mimeType: mimeType || 'video/mp4',
      totalBytes: bytes.length,
      totalChunks,
      createdAt: new Date().toISOString(),
      createdAtMillis: Date.now(),
    });
    return { ok: true };
  } catch (err: any) {
    console.warn('Firestore media chunk replication notice:', err);
    return {
      ok: false,
      errorCode: String(err?.code || 'firestore/error'),
      errorMessage: String(err?.message || ''),
    };
  }
}

/**
 * Uploads any image or video File/Blob so it persists cleanly across devices, Cloud Run, & Cloudflare Workers.
 * Primary: Same-origin chunked streaming (/api/media/upload-chunk -> Express disk or Cloudflare R2 Multipart).
 * Fallbacks: Firebase Storage -> Firestore chunks (<= 45 MB) -> Supabase Storage -> small inline DataURL.
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

  let serverResult: BackendStorageResult = { url: null };
  let storageResult: BackendStorageResult = { url: null };
  let firestoreResult: { ok: boolean; errorCode?: string; errorMessage?: string } = { ok: false };

  if (user) {
    let idToken = await user.getIdToken().catch(() => '');
    if (!idToken) {
      idToken = await user.getIdToken(true).catch(() => '');
    }

    if (idToken) {
      serverResult = await tryUploadToExpressServer(
        fileOrBlob,
        mediaId,
        ext,
        mimeType,
        idToken,
        reportProgress
      );

      if (serverResult.url) {
        try {
          const localBlobUrl = URL.createObjectURL(fileOrBlob);
          resolvedMediaCache.set(mediaId, localBlobUrl);
        } catch {}

        // Mirror <= 18 MB media to Firestore in background for cross-container redundancy
        if (fileOrBlob.size <= 18 * 1024 * 1024) {
          void tryReplicateToFirestoreChunks(fileOrBlob, mediaId, mimeType, user.uid);
        }

        reportProgress(100);
        return serverResult.url;
      }
    }

    // Fallback 1: Firebase Storage (when bucket exists)
    storageResult = await tryUploadToFirebaseStorage(
      fileOrBlob,
      mediaId,
      ext,
      mimeType,
      user.uid,
      reportProgress
    );
    if (storageResult.url) {
      reportProgress(100);
      return storageResult.url;
    }

    // Fallback 2: Firestore chunk storage (works up to 45 MB even without R2/Firebase Storage)
    firestoreResult = await tryReplicateToFirestoreChunks(
      fileOrBlob,
      mediaId,
      mimeType,
      user.uid,
      reportProgress
    );

    if (firestoreResult.ok) {
      try {
        const localBlobUrl = URL.createObjectURL(fileOrBlob);
        resolvedMediaCache.set(mediaId, localBlobUrl);
      } catch {}
      reportProgress(100);
      return `pv-media://${mediaId}`;
    }

    // Fallback 3: Supabase Storage (if configured)
    const supaResult = await tryUploadToSupabaseStorage(fileOrBlob, mediaId, ext, mimeType, user.uid);
    if (supaResult.url) {
      reportProgress(100);
      return supaResult.url;
    }
  }

  // Last-resort fallback for small blobs
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
  if (serverResult.status === 401) {
    throw new Error('লগইন সেশন রিফ্রেশ করা যায়নি। অনুগ্রহ করে আবার লগইন করে চেষ্টা করুন।');
  }
  if (serverResult.status === 413) {
    throw new Error('ভিডিও ফাইলের সাইজ নির্ধারিত সীমার চেয়ে বড়। অনুগ্রহ করে ২ GB-এর কম ফাইল দিন।');
  }
  if (serverResult.status === 415) {
    throw new Error('এই ভিডিও ফরম্যাটটি সাপোর্টেড নয়। অনুগ্রহ করে MP4, MOV বা WebM ভিডিও দিন।');
  }
  if (firestoreResult.errorCode?.includes('permission-denied')) {
    throw new Error(
      'ফায়ারবেস মিডিয়া স্টোরেজ পারমিশন পাওয়া যায়নি (permission-denied)। অনুগ্রহ করে পুনরায় লগইন করুন বা R2/Storage চালু করুন।'
    );
  }
  if (serverResult.status === 501 && fileOrBlob.size > MAX_FIRESTORE_REPLICATED_BYTES) {
    throw new Error(
      '৪৫ MB-এর চেয়ে বড় (লং) ভিডিও আপলোড করতে Cloudflare R2 বা Firebase Storage চালু থাকা প্রয়োজন।'
    );
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('আপনার ডিভাইসে ইন্টারনেট সংযোগ বন্ধ রয়েছে। সংযোগ চালু করে আবার চেষ্টা করুন।');
  }
  if (serverResult.isNetworkFailure) {
    throw new Error('আপলোড করার সময় সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে। অনুগ্রহ করে আবার POST চাপুন।');
  }

  throw new Error(
    serverResult.errorMessage ||
      storageResult.errorMessage ||
      'ভিডিওটি এই মুহূর্তে আপলোড করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।'
  );
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
        query(collection(db, 'media_files', mediaId, 'chunks'), orderBy('index', 'asc'), limit(250))
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
