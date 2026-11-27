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
import Hls from 'hls.js';
import { RefObject, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { isSupabaseConfigured, supabase } from './supabase';
import { compressDataUrlUnderLimit } from '../utils/imageCompress';

const FIRESTORE_CHUNK_RAW_BYTES = 420 * 1024; // ~560 KB base64 per doc (well under Firestore 1 MB limit)
const MAX_FIRESTORE_REPLICATED_BYTES = 45 * 1024 * 1024; // Up to 45 MB (10s-3min Reels even without R2/Firebase Storage)
const MAX_SINGLE_SERVER_UPLOAD_BYTES = 4 * 1024 * 1024; // Single POST up to 4 MB
const EXPRESS_STREAM_CHUNK_BYTES = 6 * 1024 * 1024; // 6 MB chunks: safe for Cloud Run (32MB), Cloudflare (100MB), and R2 Multipart (5MB+ parts)
const EXPRESS_LARGE_STREAM_CHUNK_BYTES = 8 * 1024 * 1024; // 8 MB chunks for > 1 GB videos
const MAX_BUNNY_EDGE_SINGLE_BYTES = 90 * 1024 * 1024; // Safe under Cloudflare Workers 100 MB single-request limit
const BUNNY_TUS_CHUNK_BYTES = 5 * 1024 * 1024; // 5 MB TUS chunks for Bunny Stream (supports up to 2+ hour / 2 GB videos)
const MAX_DATA_URL_INLINE_BYTES = 240 * 1024;

let firebaseStorageUnavailable = false;
let cachedCapabilities: { data: MediaServerCapabilities | null; fetchedAt: number } = {
  data: null,
  fetchedAt: 0,
};

export interface MediaServerCapabilities {
  ok: boolean;
  expressDisk: boolean;
  r2: boolean;
  bunnyStorage: boolean;
  bunnyStream: boolean;
  maxEdgeSingleBytes: number;
}

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

async function getMediaCapabilities(): Promise<MediaServerCapabilities | null> {
  if (cachedCapabilities.data && Date.now() - cachedCapabilities.fetchedAt < 30_000) {
    return cachedCapabilities.data;
  }
  try {
    const resp = await fetchWithTimeout('/api/media/capabilities', { method: 'GET' }, 3500);
    const ct = (resp.headers.get('content-type') || '').toLowerCase();
    if (!resp.ok || !ct.includes('application/json')) {
      return null;
    }
    const json = await resp.json().catch(() => null);
    if (json && json.ok) {
      const caps: MediaServerCapabilities = {
        ok: true,
        expressDisk: Boolean(json.expressDisk),
        r2: Boolean(json.r2),
        bunnyStorage: Boolean(json.bunnyStorage),
        bunnyStream: Boolean(json.bunnyStream),
        maxEdgeSingleBytes: Number(json.maxEdgeSingleBytes) || MAX_BUNNY_EDGE_SINGLE_BYTES,
      };
      cachedCapabilities = { data: caps, fetchedAt: Date.now() };
      return caps;
    }
  } catch {}
  return null;
}

function sendXhrBinary(
  url: string,
  method: 'POST' | 'PATCH',
  headers: Record<string, string>,
  body: Blob,
  timeoutMs: number,
  onUploadProgress?: (loaded: number, total: number) => void
): Promise<{ status: number; contentType: string; responseText: string; locationHeader: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.timeout = timeoutMs;
    Object.entries(headers).forEach(([k, v]) => {
      xhr.setRequestHeader(k, v);
    });
    if (onUploadProgress) {
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable && evt.total > 0) {
          onUploadProgress(evt.loaded, evt.total);
        } else {
          onUploadProgress(evt.loaded, body.size || 1);
        }
      };
    }
    xhr.onload = () => {
      resolve({
        status: xhr.status,
        contentType: (xhr.getResponseHeader('content-type') || '').toLowerCase(),
        responseText: xhr.responseText || '',
        locationHeader: xhr.getResponseHeader('location') || xhr.getResponseHeader('Location') || '',
      });
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload request timed out'));
    xhr.onabort = () => reject(new Error('Upload aborted'));
    xhr.send(body);
  });
}

async function uploadSingleBlobWithProgress(
  blob: Blob,
  mediaId: string,
  ext: string,
  mimeType: string,
  initialIdToken: string,
  onProgress?: (pct: number) => void
): Promise<BackendStorageResult> {
  let activeToken = initialIdToken;
  const safeMime = mimeType || (ext === 'mp4' ? 'video/mp4' : 'image/jpeg');
  let lastStatus = 0;
  let lastMsg = '';
  let sawNetworkErr = false;

  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0 && auth.currentUser) {
      activeToken = await auth.currentUser.getIdToken(lastStatus === 401).catch(() => activeToken);
    }
    try {
      const res = await sendXhrBinary(
        '/api/media/upload',
        'POST',
        {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/octet-stream',
          'X-Media-Mime': safeMime,
          'X-Media-Id': mediaId,
          'X-Media-Ext': ext,
        },
        blob,
        180_000,
        (loaded, total) => {
          if (onProgress && total > 0) {
            onProgress(Math.min(96, Math.round((loaded / total) * 84) + 12));
          }
        }
      );
      lastStatus = res.status;
      let parsed: any = null;
      try {
        parsed = res.responseText ? JSON.parse(res.responseText) : null;
      } catch {}

      if (res.contentType.includes('text/html') || res.status === 501) {
        return {
          url: null,
          status: 501,
          code: parsed?.code || 'MEDIA_STORAGE_NOT_CONFIGURED',
          errorMessage: parsed?.error || 'Static edge host has no media bucket configured.',
        };
      }

      if (res.status >= 200 && res.status < 300 && typeof parsed?.url === 'string' && parsed.url) {
        return { url: parsed.url, status: res.status };
      }

      lastMsg = String(parsed?.error || '');
      if (res.status >= 400 && res.status < 429 && res.status !== 401 && res.status !== 408) {
        return { url: null, status: res.status, code: parsed?.code, errorMessage: lastMsg };
      }
    } catch (err: any) {
      lastMsg = String(err?.message || '');
      sawNetworkErr = true;
    }
    await new Promise((r) => window.setTimeout(r, 600 * (attempt + 1)));
  }

  return {
    url: null,
    status: lastStatus || undefined,
    errorMessage: lastMsg,
    isNetworkFailure: sawNetworkErr && !lastStatus,
  };
}

async function tryUploadToBunnyStreamTus(
  blob: Blob,
  title: string,
  mimeType: string,
  initialIdToken: string,
  onProgress?: (pct: number) => void
): Promise<BackendStorageResult> {
  let activeToken = initialIdToken;
  const safeTitle = (title || `PeaceVerse_${Date.now()}`).slice(0, 120);
  const safeMime = mimeType || 'video/mp4';

  let initData: any = null;
  let initStatus = 0;
  let initErr = '';

  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0 && auth.currentUser) {
      activeToken = await auth.currentUser.getIdToken(initStatus === 401).catch(() => activeToken);
    }
    try {
      const resp = await fetchWithTimeout(
        '/api/media/bunny-stream/init',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${activeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: safeTitle }),
        },
        15_000
      );
      initStatus = resp.status;
      const ct = (resp.headers.get('content-type') || '').toLowerCase();
      if (ct.includes('text/html') || resp.status === 501) {
        const json = await resp.json().catch(() => null);
        return {
          url: null,
          status: 501,
          code: json?.code || 'BUNNY_STREAM_NOT_CONFIGURED',
          errorMessage: json?.error || 'Bunny Stream is not configured.',
        };
      }
      const json = await resp.json().catch(() => null);
      if (resp.ok && json?.ok && json?.videoId && json?.signature) {
        initData = json;
        break;
      }
      initErr = String(json?.error || '');
      if (resp.status !== 401 && resp.status < 500) {
        return { url: null, status: resp.status, errorMessage: initErr };
      }
    } catch (err: any) {
      initErr = String(err?.message || '');
    }
  }

  if (!initData) {
    return {
      url: null,
      status: initStatus || undefined,
      errorMessage: initErr || 'Bunny Stream upload initialization failed.',
      isNetworkFailure: !initStatus,
    };
  }

  const tusEndpoint = String(initData.tusEndpoint || 'https://video.bunnycdn.com/tusupload');
  const libraryId = String(initData.libraryId);
  const videoId = String(initData.videoId);
  const expirationTime = String(initData.expirationTime);
  const signature = String(initData.signature);
  const playbackUrl = String(initData.playbackUrl || '');

  const encoder = new TextEncoder();
  const titleB64 = bytesToBase64(encoder.encode(safeTitle));
  const typeB64 = bytesToBase64(encoder.encode(safeMime));

  let uploadUrl = '';
  try {
    const createTus = await fetchWithTimeout(
      tusEndpoint,
      {
        method: 'POST',
        headers: {
          AuthorizationSignature: signature,
          AuthorizationExpire: expirationTime,
          VideoId: videoId,
          LibraryId: libraryId,
          'Tus-Resumable': '1.0.0',
          'Upload-Length': String(blob.size),
          'Upload-Metadata': `title ${titleB64},filetype ${typeB64}`,
        },
      },
      20_000
    );

    const loc = createTus.headers.get('location') || createTus.headers.get('Location');
    if (!createTus.ok || !loc) {
      const text = await createTus.text().catch(() => '');
      return {
        url: null,
        status: createTus.status,
        errorMessage: text || `Bunny Stream TUS create failed (${createTus.status}).`,
      };
    }
    uploadUrl = new URL(loc, tusEndpoint).toString();
  } catch (err: any) {
    return {
      url: null,
      errorMessage: String(err?.message || 'Failed to connect to Bunny Stream TUS server.'),
      isNetworkFailure: true,
    };
  }

  let offset = 0;
  while (offset < blob.size) {
    const end = Math.min(offset + BUNNY_TUS_CHUNK_BYTES, blob.size);
    const slice = blob.slice(offset, end);
    let chunkUploaded = false;
    let lastChunkErr = '';
    let lastChunkStatus = 0;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await sendXhrBinary(
          uploadUrl,
          'PATCH',
          {
            AuthorizationSignature: signature,
            AuthorizationExpire: expirationTime,
            VideoId: videoId,
            LibraryId: libraryId,
            'Tus-Resumable': '1.0.0',
            'Upload-Offset': String(offset),
            'Content-Type': 'application/offset+octet-stream',
          },
          slice,
          120_000,
          (loaded) => {
            if (onProgress && blob.size > 0) {
              const totalLoaded = Math.min(blob.size, offset + loaded);
              onProgress(Math.min(98, Math.round((totalLoaded / blob.size) * 86) + 12));
            }
          }
        );
        lastChunkStatus = res.status;
        if (res.status >= 200 && res.status < 300) {
          chunkUploaded = true;
          break;
        }
        lastChunkErr = res.responseText || `Bunny Stream chunk failed (${res.status})`;
      } catch (err: any) {
        lastChunkErr = String(err?.message || 'Bunny Stream chunk network error');
      }
      await new Promise((r) => window.setTimeout(r, 700 * (attempt + 1)));
    }

    if (!chunkUploaded) {
      return {
        url: null,
        status: lastChunkStatus || undefined,
        errorMessage: lastChunkErr,
        isNetworkFailure: !lastChunkStatus,
      };
    }

    offset = end;
    onProgress?.(Math.min(98, Math.round((offset / blob.size) * 86) + 12));
  }

  return playbackUrl ? { url: playbackUrl, status: 200 } : { url: null };
}

async function tryUploadToExpressServer(
  blob: Blob,
  mediaId: string,
  ext: string,
  mimeType: string,
  initialIdToken: string,
  onProgress?: (pct: number) => void,
  caps?: MediaServerCapabilities | null
): Promise<BackendStorageResult> {
  let activeToken = initialIdToken;
  const safeMime = mimeType || (ext === 'mp4' ? 'video/mp4' : 'image/jpeg');

  try {
    const singleLimit =
      caps?.bunnyStorage && caps?.expressDisk
        ? Math.min(25 * 1024 * 1024, caps.maxEdgeSingleBytes || 25 * 1024 * 1024)
        : MAX_SINGLE_SERVER_UPLOAD_BYTES;

    if (blob.size <= singleLimit) {
      if (blob.size > MAX_SINGLE_SERVER_UPLOAD_BYTES) {
        return await uploadSingleBlobWithProgress(blob, mediaId, ext, safeMime, initialIdToken, onProgress);
      }
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

  const isVideo = mimeType.startsWith('video/');
  const caps = await getMediaCapabilities();
  const baseTitle =
    options?.fileName ||
    (fileOrBlob instanceof File && fileOrBlob.name ? fileOrBlob.name : `PeaceVerse_${Date.now()}`);

  const cacheUploadedLocalUrl = (finalUrl: string) => {
    try {
      const localBlobUrl = URL.createObjectURL(fileOrBlob);
      resolvedMediaCache.set(mediaId, localBlobUrl);
      if (finalUrl) {
        resolvedMediaCache.set(finalUrl.trim(), localBlobUrl);
      }
    } catch {}
  };

  let serverResult: BackendStorageResult = { url: null };
  let storageResult: BackendStorageResult = { url: null };
  let firestoreResult: { ok: boolean; errorCode?: string; errorMessage?: string } = { ok: false };

  if (user) {
    let idToken = await user.getIdToken().catch(() => '');
    if (!idToken) {
      idToken = await user.getIdToken(true).catch(() => '');
    }

    if (idToken) {
      const shouldUseBunnyStreamTus =
        isVideo &&
        Boolean(caps?.bunnyStream) &&
        (fileOrBlob.size > MAX_SINGLE_SERVER_UPLOAD_BYTES ||
          (!caps?.expressDisk && !caps?.r2 && !caps?.bunnyStorage));

      if (shouldUseBunnyStreamTus) {
        serverResult = await tryUploadToBunnyStreamTus(
          fileOrBlob,
          baseTitle,
          mimeType,
          idToken,
          reportProgress
        );
      } else if (caps?.bunnyStorage && !caps.expressDisk && !caps.r2) {
        const edgeMax = Math.min(MAX_BUNNY_EDGE_SINGLE_BYTES, caps.maxEdgeSingleBytes || MAX_BUNNY_EDGE_SINGLE_BYTES);
        if (fileOrBlob.size <= edgeMax) {
          serverResult = await uploadSingleBlobWithProgress(
            fileOrBlob,
            mediaId,
            ext,
            mimeType,
            idToken,
            reportProgress
          );
        } else if (caps.bunnyStream) {
          serverResult = await tryUploadToBunnyStreamTus(
            fileOrBlob,
            baseTitle,
            mimeType,
            idToken,
            reportProgress
          );
        } else {
          serverResult = {
            url: null,
            status: 413,
            errorMessage:
              'Bunny Storage দিয়ে একবারে সর্বোচ্চ ৯০ MB পর্যন্ত আপলোড করা যায়। বড় (২ ঘণ্টা/২ GB) ভিডিওর জন্য Bunny Stream অথবা Cloudflare R2 চালু করুন।',
          };
        }
      } else {
        serverResult = await tryUploadToExpressServer(
          fileOrBlob,
          mediaId,
          ext,
          mimeType,
          idToken,
          reportProgress,
          caps
        );
      }

      if (serverResult.url) {
        cacheUploadedLocalUrl(serverResult.url);

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
      cacheUploadedLocalUrl(storageResult.url);
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
      cacheUploadedLocalUrl(`pv-media://${mediaId}`);
      reportProgress(100);
      return `pv-media://${mediaId}`;
    }

    // Fallback 3: Supabase Storage (if configured)
    const supaResult = await tryUploadToSupabaseStorage(fileOrBlob, mediaId, ext, mimeType, user.uid);
    if (supaResult.url) {
      cacheUploadedLocalUrl(supaResult.url);
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
    throw new Error(
      serverResult.errorMessage || 'ভিডিও ফাইলের সাইজ নির্ধারিত সীমার চেয়ে বড়। অনুগ্রহ করে ২ GB-এর কম ফাইল দিন।'
    );
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
      '৪৫ MB-এর চেয়ে বড় (লং) ভিডিও আপলোড করতে Bunny.net Storage/Stream (BUNNY_STORAGE_ZONE ও BUNNY_STORAGE_API_KEY অথবা BUNNY_STREAM_LIBRARY_ID ও BUNNY_STREAM_API_KEY), Cloudflare R2 বা Firebase Storage চালু থাকা প্রয়োজন।'
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
  const directCached = resolvedMediaCache.get(clean);
  if (directCached) return directCached;
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
  const directCached = clean ? resolvedMediaCache.get(clean) : undefined;
  const initial = directCached
    ? directCached
    : mediaId && resolvedMediaCache.has(mediaId)
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

    const cachedDirect = resolvedMediaCache.get(clean);
    if (cachedDirect) {
      setResolved(cachedDirect);
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
      const clean = (u || '').trim();
      if (clean && resolvedMediaCache.has(clean)) return resolvedMediaCache.get(clean)!;
      const id = extractMediaIdFromUrl(clean);
      if (id && resolvedMediaCache.has(id)) return resolvedMediaCache.get(id)!;
      return clean.startsWith('pv-media://') ? '' : u;
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
        const clean = (u || '').trim();
        if (clean && resolvedMediaCache.has(clean)) return resolvedMediaCache.get(clean)!;
        const id = extractMediaIdFromUrl(clean);
        if (id && resolvedMediaCache.has(id)) return resolvedMediaCache.get(id)!;
        return clean.startsWith('pv-media://') ? '' : u;
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

export function isHlsPlaylistUrl(url?: string | null): boolean {
  if (!url) return false;
  return /\.m3u8($|\?|#)/i.test(url.trim());
}

export function isBunnyEmbedUrl(url?: string | null): boolean {
  if (!url) return false;
  return /iframe\.mediadelivery\.net\/embed\//i.test(url.trim());
}

export function useAttachVideoSrc(
  videoRef: RefObject<HTMLVideoElement | null>,
  src?: string | null,
  reattachKey?: string | number | boolean
): void {
  useEffect(() => {
    const video = videoRef.current;
    const cleanSrc = (src || '').trim();
    if (!video) return;

    let hlsInstance: Hls | null = null;

    if (!cleanSrc || isBunnyEmbedUrl(cleanSrc)) {
      if (video.getAttribute('src')) {
        video.removeAttribute('src');
        video.load();
      }
      return;
    }

    if (isHlsPlaylistUrl(cleanSrc)) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = cleanSrc;
      } else if (Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        hlsInstance.loadSource(cleanSrc);
        hlsInstance.attachMedia(video);
      } else {
        video.src = cleanSrc;
      }
    } else if (video.src !== cleanSrc && video.getAttribute('src') !== cleanSrc) {
      video.src = cleanSrc;
    }

    return () => {
      if (hlsInstance) {
        try {
          hlsInstance.destroy();
        } catch {}
      }
    };
  }, [videoRef, src, reattachKey]);
}
