import {
  BUILD_RESEND_API_KEY,
  BUILD_RESEND_FROM_EMAIL,
  BUILD_BUNNY_STORAGE_ZONE,
  BUILD_BUNNY_STORAGE_API_KEY,
  BUILD_BUNNY_STORAGE_REGION,
  BUILD_BUNNY_CDN_URL,
  BUILD_BUNNY_STREAM_LIBRARY_ID,
  BUILD_BUNNY_STREAM_API_KEY,
  BUILD_BUNNY_STREAM_CDN_HOST,
} from './build-env';

interface WorkerAssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface WorkerR2Range {
  offset?: number;
  length?: number;
}

interface WorkerR2Object {
  body: ReadableStream | null;
  size: number;
  etag: string;
  httpMetadata?: {
    contentType?: string;
    cacheControl?: string;
  };
  text(): Promise<string>;
}

interface WorkerR2UploadedPart {
  partNumber: number;
  etag: string;
}

interface WorkerR2MultipartUpload {
  uploadId: string;
  uploadPart(partNumber: number, value: ArrayBuffer | Uint8Array): Promise<WorkerR2UploadedPart>;
  complete(parts: WorkerR2UploadedPart[]): Promise<WorkerR2Object>;
  abort(): Promise<void>;
}

interface WorkerR2Bucket {
  get(key: string, options?: { range?: WorkerR2Range }): Promise<WorkerR2Object | null>;
  head(key: string): Promise<WorkerR2Object | null>;
  put(
    key: string,
    value: ArrayBuffer | Uint8Array | string,
    options?: {
      httpMetadata?: {
        contentType?: string;
        cacheControl?: string;
      };
    }
  ): Promise<WorkerR2Object | null>;
  delete(key: string): Promise<void>;
  createMultipartUpload(
    key: string,
    options?: {
      httpMetadata?: {
        contentType?: string;
        cacheControl?: string;
      };
    }
  ): Promise<WorkerR2MultipartUpload>;
  resumeMultipartUpload(key: string, uploadId: string): WorkerR2MultipartUpload;
}

interface WorkerEnv {
  ASSETS: WorkerAssetsBinding;
  MEDIA_BUCKET?: WorkerR2Bucket;
  ORIGIN_API_URL?: string;
  FIREBASE_PROJECT_ID?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  OTP_SIGNING_SECRET?: string;
  GEMINI_API_KEY?: string;
  BUNNY_STORAGE_ZONE?: string;
  BUNNY_STORAGE_ZONE_NAME?: string;
  BUNNY_STORAGE_API_KEY?: string;
  BUNNY_STORAGE_PASSWORD?: string;
  BUNNY_ACCESS_KEY?: string;
  BUNNY_STORAGE_REGION?: string;
  BUNNY_STORAGE_ENDPOINT?: string;
  BUNNY_CDN_URL?: string;
  BUNNY_CDN_HOSTNAME?: string;
  BUNNY_PULL_ZONE_URL?: string;
  BUNNY_STREAM_LIBRARY_ID?: string;
  BUNNY_LIBRARY_ID?: string;
  BUNNY_STREAM_API_KEY?: string;
  BUNNY_STREAM_CDN_HOST?: string;
  BUNNY_STREAM_CDN_HOSTNAME?: string;
}

const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
};

const WORKER_ALLOWED_EXT_TO_MIME: Record<string, string> = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  ogg: 'video/ogg',
  '3gp': 'video/3gpp',
  mkv: 'video/x-matroska',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
};

let cachedWorkerJwks: { keys: Record<string, JsonWebKey>; expiresAt: number } | null = null;

async function getFirebasePublicJwks(): Promise<Record<string, JsonWebKey>> {
  const now = Date.now();
  if (cachedWorkerJwks && now < cachedWorkerJwks.expiresAt) {
    return cachedWorkerJwks.keys;
  }
  const resp = await fetch(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  );
  if (!resp.ok) {
    throw new Error(`JWK fetch failed (${resp.status})`);
  }
  const payload: any = await resp.json();
  const keys: Record<string, JsonWebKey> = {};
  if (Array.isArray(payload?.keys)) {
    for (const k of payload.keys) {
      if (k && typeof k.kid === 'string') {
        keys[k.kid] = k;
      }
    }
  }
  const cacheControl = resp.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const ttlMs = maxAgeMatch ? Math.min(Number(maxAgeMatch[1]) * 1000, 6 * 3600 * 1000) : 3600 * 1000;
  cachedWorkerJwks = { keys, expiresAt: now + ttlMs };
  return keys;
}

async function verifyWorkerFirebaseToken(
  authHeader: string | null,
  projectId: string
): Promise<{ uid: string } | null> {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/);
  if (!match) return null;
  const token = match[1];
  const [headerB64, payloadB64, sigB64] = token.split('.');

  try {
    const decoder = new TextDecoder();
    const header = JSON.parse(decoder.decode(fromBase64Url(headerB64)));
    const payload = JSON.parse(decoder.decode(fromBase64Url(payloadB64)));
    if (header?.alg !== 'RS256' || typeof header?.kid !== 'string') return null;

    const nowSec = Math.floor(Date.now() / 1000);
    if (
      typeof payload?.sub !== 'string' ||
      !payload.sub ||
      payload.aud !== projectId ||
      payload.iss !== `https://securetoken.google.com/${projectId}` ||
      typeof payload.exp !== 'number' ||
      payload.exp <= nowSec
    ) {
      return null;
    }

    let jwks = await getFirebasePublicJwks();
    let jwk = jwks[header.kid];
    if (!jwk) {
      cachedWorkerJwks = null;
      jwks = await getFirebasePublicJwks();
      jwk = jwks[header.kid];
    }
    if (!jwk) return null;

    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigBytes = fromBase64Url(sigB64);
    const dataBytes = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const sigCopy = new Uint8Array(sigBytes.length);
    sigCopy.set(sigBytes);
    const dataCopy = new Uint8Array(dataBytes.length);
    dataCopy.set(dataBytes);

    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, sigCopy.buffer, dataCopy.buffer);
    return ok ? { uid: payload.sub } : null;
  } catch {
    return null;
  }
}

function resolveWorkerMediaExt(mimeType: string, requestedExt?: string): string | null {
  const cleanMime = (mimeType || '').split(';')[0].trim().toLowerCase();
  if (
    cleanMime.includes('svg') ||
    cleanMime.includes('html') ||
    cleanMime.includes('javascript') ||
    cleanMime.includes('php') ||
    cleanMime.includes('msdownload')
  ) {
    return null;
  }
  const safeReqExt = (requestedExt || '').trim().toLowerCase();
  const normalizedReqExt = safeReqExt === 'jpeg' ? 'jpg' : safeReqExt;

  if (cleanMime === 'video/mp4' || cleanMime === 'video/x-m4v' || cleanMime === 'application/mp4') return 'mp4';
  if (cleanMime === 'video/webm') return 'webm';
  if (cleanMime === 'video/quicktime') return 'mov';
  if (cleanMime === 'video/ogg') return 'ogg';
  if (cleanMime === 'video/3gpp') return '3gp';
  if (cleanMime === 'video/x-matroska') return 'mkv';
  if (cleanMime === 'image/jpeg' || cleanMime === 'image/jpg') return 'jpg';
  if (cleanMime === 'image/png') return 'png';
  if (cleanMime === 'image/webp') return 'webp';
  if (cleanMime === 'image/gif') return 'gif';
  if (cleanMime === 'audio/mpeg') return 'mp3';
  if (cleanMime === 'audio/mp4') return 'm4a';
  if (normalizedReqExt && WORKER_ALLOWED_EXT_TO_MIME[normalizedReqExt]) return normalizedReqExt;
  if (cleanMime.startsWith('video/')) return 'mp4';
  if (cleanMime.startsWith('image/')) return 'jpg';
  if (cleanMime.startsWith('audio/')) return 'mp3';
  return null;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function signChallenge(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return toBase64Url(new Uint8Array(sig));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateSixDigitOtp(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(100000 + (buf[0] % 900000));
}

async function handleSendEmailOtp(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    const body: any = await request.json().catch(() => ({}));
    const rawEmail = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const fullName = typeof body?.fullName === 'string' ? body.fullName.trim().slice(0, 80) : '';
    const purpose = body?.purpose === '2fa' ? '2fa' : 'signup';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(rawEmail) || rawEmail.endsWith('@phone.peaceverse.app')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'অনুগ্রহ করে আপনার সঠিক আসল Email (যেমন: name@gmail.com) লিখুন।',
        }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const resendKey = (env.RESEND_API_KEY || BUILD_RESEND_API_KEY || '').trim();
    if (!resendKey || resendKey === 're_YOUR_RESEND_API_KEY') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ইমেইল সার্ভিস কনফিগার করা হয়নি। Cloudflare Settings > Builds > Variables-এ RESEND_API_KEY সেট করুন।',
        }),
        { status: 503, headers: JSON_HEADERS }
      );
    }

    const code = generateSixDigitOtp();
    const recipientName = escapeHtml(fullName || 'PeaceVerse Friend');
    const isTwoFactor = purpose === '2fa';
    const subject = isTwoFactor
      ? `PeaceVerse24 Login Verification Code: ${code}`
      : `PeaceVerse24 Sign Up Verification Code: ${code}`;

    const textBody = [
      `Assalamu Alaikum ${fullName || 'Friend'},`,
      '',
      `Your PeaceVerse24 6-digit verification code is: ${code}`,
      '',
      'এই কোডটি আগামী ১০ মিনিট পর্যন্ত কার্যকর থাকবে। নিরাপত্তার জন্য এই কোডটি কারো সাথে শেয়ার করবেন না।',
      'This code expires in 10 minutes. Do not share it with anyone.',
      '',
      '— PeaceVerse24.com Security Team',
    ].join('\n');

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#F0F2F5; padding:24px;">
        <div style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:14px; border:1px solid #DADDE1; overflow:hidden;">
          <div style="background:#0866FF; padding:20px 24px; color:#ffffff;">
            <h1 style="margin:0; font-size:20px; font-weight:800;">PeaceVerse24.com</h1>
            <p style="margin:4px 0 0; font-size:12px; opacity:0.9;">শান্তি, ভালোবাসা আর পজিটিভ কমিউনিটি</p>
          </div>
          <div style="padding:24px; color:#1C1E21;">
            <p style="margin:0 0 12px; font-size:14px;">আসসালামু আলাইকুম <strong>${recipientName}</strong>,</p>
            <p style="margin:0 0 16px; font-size:14px; color:#4B4F56;">
              ${
                isTwoFactor
                  ? 'আপনার PeaceVerse24 অ্যাকাউন্টে লগইন সম্পন্ন করতে নিচের ৬ ডিজিটের ভেরিফিকেশন কোডটি ব্যবহার করুন:'
                  : 'PeaceVerse24.com-এ নতুন অ্যাকাউন্ট খুলতে নিচের ৬ ডিজিটের ইমেইল ভেরিফিকেশন কোডটি দিন:'
              }
            </p>
            <div style="background:#F0F7FF; border:2px dashed #0866FF; border-radius:10px; padding:16px; text-align:center; margin:16px 0;">
              <span style="font-family:monospace; font-size:32px; font-weight:900; letter-spacing:8px; color:#0866FF;">${code}</span>
            </div>
            <p style="margin:16px 0 0; font-size:12px; color:#65676B;">
              এই কোডটি <strong>১০ মিনিট</strong> পর্যন্ত কার্যকর থাকবে। কোডটি কারো সাথে শেয়ার করবেন না।
            </p>
          </div>
        </div>
      </div>
    `;

    const fromEmail =
      (env.RESEND_FROM_EMAIL || BUILD_RESEND_FROM_EMAIL || 'PeaceVerse24 <noreply@peaceverse24.com>').trim();

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [rawEmail],
        subject,
        html: htmlBody,
        text: textBody,
        headers: {
          'X-Entity-Ref-ID': crypto.randomUUID(),
        },
      }),
    });

    const resendData: any = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: resendData?.message || `Resend email failed (HTTP ${resendRes.status})`,
        }),
        { status: 502, headers: JSON_HEADERS }
      );
    }

    const expiresAt = Date.now() + 10 * 60 * 1000;
    const payloadJson = JSON.stringify({ email: rawEmail, purpose, exp: expiresAt });
    const payloadB64 = toBase64Url(new TextEncoder().encode(payloadJson));
    const secret = env.OTP_SIGNING_SECRET?.trim() || resendKey;
    const sig = await signChallenge(secret, `${payloadB64}:${code}`);

    return new Response(
      JSON.stringify({
        success: true,
        email: rawEmail,
        provider: 'resend',
        emailId: typeof resendData?.id === 'string' ? resendData.id : undefined,
        challengeToken: `${payloadB64}.${sig}`,
        expiresInSeconds: 600,
        resendCooldownSeconds: 45,
        message: `${rawEmail} ঠিকানায় ৬ ডিজিটের ভেরিফিকেশন কোড পাঠানো হয়েছে।`,
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'ইমেইলে ভেরিফিকেশন কোড পাঠানো যায়নি।',
      }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

async function handleVerifyEmailOtp(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    const body: any = await request.json().catch(() => ({}));
    const rawEmail = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const code = typeof body?.code === 'string' ? body.code.trim() : '';
    const purpose = body?.purpose === '2fa' ? '2fa' : 'signup';
    const challengeToken = typeof body?.challengeToken === 'string' ? body.challengeToken.trim() : '';

    if (!rawEmail || !/^\d{6}$/.test(code) || !challengeToken.includes('.')) {
      return new Response(
        JSON.stringify({
          verified: false,
          error: 'আপনার ইমেইলে পাঠানো সঠিক ৬ ডিজিটের কোডটি লিখুন।',
        }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const [payloadB64, sigB64] = challengeToken.split('.');
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)));
    if (!parsed || parsed.email !== rawEmail || parsed.purpose !== purpose || typeof parsed.exp !== 'number') {
      return new Response(
        JSON.stringify({
          verified: false,
          error: 'কোডটি সঠিক নয়। অনুগ্রহ করে আবার চেষ্টা করুন।',
        }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    if (Date.now() > parsed.exp) {
      return new Response(
        JSON.stringify({
          verified: false,
          error: 'কোডটির মেয়াদ শেষ হয়ে গেছে। দয়া করে নতুন কোড পাঠান।',
        }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const secret =
      env.OTP_SIGNING_SECRET?.trim() ||
      env.RESEND_API_KEY?.trim() ||
      BUILD_RESEND_API_KEY.trim() ||
      'peaceverse-otp-secret';
    const expectedSig = await signChallenge(secret, `${payloadB64}:${code}`);

    if (!constantTimeEqual(sigB64, expectedSig)) {
      return new Response(
        JSON.stringify({
          verified: false,
          error: 'ভুল কোড! আপনার ইমেইলে পাঠানো ৬ ডিজিটের কোডটি সঠিকভাবে লিখুন।',
        }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const tokenBytes = new Uint8Array(24);
    crypto.getRandomValues(tokenBytes);
    const verificationToken = toBase64Url(tokenBytes);

    return new Response(
      JSON.stringify({
        verified: true,
        email: rawEmail,
        verificationToken,
        message: 'ইমেইল সফলভাবে ভেরিফাই হয়েছে।',
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch {
    return new Response(
      JSON.stringify({
        verified: false,
        error: 'কোড যাচাই করা যায়নি। আবার চেষ্টা করুন।',
      }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

const WORKER_ADULT_BLOCK_WORDS = [
  'নগ্ন ছবি',
  'নগ্ন ভিডিও',
  'উলঙ্গ ছবি',
  'উলঙ্গ ভিডিও',
  'উলঙ্গ',
  'পর্ন',
  'পর্নোগ্রাফি',
  'অশ্লীল ছবি',
  'অশ্লীল ভিডিও',
  'যৌন ভিডিও',
  'যৌন ছবি',
  'সেক্স ভিডিও',
  'ব্লু ফিল্ম',
  'এক্স এক্স এক্স',
  'নটি ভিডিও',
  'চটি গল্প',
  'sex video',
  'porn video',
  'pornography',
  'pornhub',
  'xvideos',
  'xnxx',
  'xhamster',
  'redtube',
  'youporn',
  'brazzers',
  'onlyfans',
  'blue film',
  'nude photo',
  'nude video',
  'naked video',
  'hentai',
  'nsfw',
];

const WORKER_ADULT_REGEXES = [
  /\bxxx+\b/i,
  /\bxnxx\b/i,
  /\bxvideos\b/i,
  /\bxhamster\b/i,
  /\bporn(?:o|ography|hub|star)?\b/i,
  /\bsex[\s._-]*(?:video|clip|movie|tape|chat|cam)\b/i,
  /\bnude(?:s)?\b/i,
  /\bnaked\b/i,
  /\bhentai\b/i,
  /\berotic(?:a)?\b/i,
  /\bbdsm\b/i,
  /\bonlyfans\b/i,
  /\bblowjob\b/i,
  /\bhandjob\b/i,
  /\bgangbang\b/i,
  /\bmilf\b/i,
  /\bmasturbat(?:e|ion)\b/i,
];

const WORKER_ADULT_BLOCK_MSG =
  'দুঃখিত! নোংরা, অশ্লীল, নগ্ন বা XXX ধরনের ছবি ও ভিডিও আপলোড করা সম্পূর্ণ নিষিদ্ধ। বাকি সব স্বাভাবিক পোস্ট করতে পারবেন।';

function hasExplicitAdultTerms(text: string): boolean {
  const normalized = (text || '').toLowerCase();
  if (!normalized.trim()) return false;
  if (WORKER_ADULT_BLOCK_WORDS.some((phrase) => normalized.includes(phrase.toLowerCase()))) return true;
  return WORKER_ADULT_REGEXES.some((re) => re.test(normalized));
}

async function handleModeratePost(request: Request): Promise<Response> {
  try {
    const body: any = await request.json().catch(() => ({}));
    const postContent = typeof body?.postContent === 'string' ? body.postContent : '';
    if (hasExplicitAdultTerms(postContent)) {
      return new Response(
        JSON.stringify({ isHalal: false, score: 0, feedback: WORKER_ADULT_BLOCK_MSG }),
        { status: 200, headers: JSON_HEADERS }
      );
    }
    return new Response(
      JSON.stringify({ isHalal: true, score: 100, feedback: 'পোস্টটি অনুমোদিত।' }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch {
    return new Response(
      JSON.stringify({ isHalal: true, score: 100, feedback: 'পোস্টটি অনুমোদিত।' }),
      { status: 200, headers: JSON_HEADERS }
    );
  }
}

async function handleModerateMedia(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    const body: any = await request.json().catch(() => ({}));
    const caption = typeof body?.caption === 'string' ? body.caption : '';
    const fileNames = Array.isArray(body?.fileNames)
      ? body.fileNames.map((n: unknown) => String(n).replace(/[._-]+/g, ' '))
      : [];

    if (hasExplicitAdultTerms([caption, ...fileNames].join(' '))) {
      return new Response(
        JSON.stringify({ isExplicitAdult: true, reason: WORKER_ADULT_BLOCK_MSG }),
        { status: 200, headers: JSON_HEADERS }
      );
    }

    const imageList = Array.isArray(body?.images)
      ? body.images.filter((u: unknown) => typeof u === 'string' && u.startsWith('data:image/')).slice(0, 3)
      : [];

    const geminiKey = (env.GEMINI_API_KEY || '').trim();
    if (imageList.length === 0 || !geminiKey) {
      return new Response(JSON.stringify({ isExplicitAdult: false }), {
        status: 200,
        headers: JSON_HEADERS,
      });
    }

    const parts: any[] = [
      {
        text:
          'You are a strict explicit-adult-content-only safety classifier. ' +
          'ONLY flag explicit pornography, XXX sexual acts, exposed genitalia, or explicit nudity. ' +
          'Allow ALL normal photos/videos including selfies, portraits, sports, music, comedy, food, nature, news, business, and family photos. ' +
          'Respond strictly in JSON: {"isExplicitAdult": boolean}',
      },
    ];

    for (const dataUrl of imageList) {
      const commaIdx = dataUrl.indexOf(',');
      if (commaIdx <= 0) continue;
      const meta = dataUrl.slice(0, commaIdx);
      const base64Data = dataUrl.slice(commaIdx + 1);
      const mimeMatch = meta.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64$/);
      if (mimeMatch && base64Data) {
        parts.push({
          inlineData: {
            mimeType: mimeMatch[1],
            data: base64Data,
          },
        });
      }
    }

    if (parts.length <= 1) {
      return new Response(JSON.stringify({ isExplicitAdult: false }), {
        status: 200,
        headers: JSON_HEADERS,
      });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!geminiRes.ok) {
      return new Response(JSON.stringify({ isExplicitAdult: false }), {
        status: 200,
        headers: JSON_HEADERS,
      });
    }

    const geminiJson: any = await geminiRes.json().catch(() => null);
    const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(rawText);
    if (parsed?.isExplicitAdult === true) {
      return new Response(
        JSON.stringify({ isExplicitAdult: true, reason: WORKER_ADULT_BLOCK_MSG }),
        { status: 200, headers: JSON_HEADERS }
      );
    }

    return new Response(JSON.stringify({ isExplicitAdult: false }), {
      status: 200,
      headers: JSON_HEADERS,
    });
  } catch {
    return new Response(JSON.stringify({ isExplicitAdult: false }), {
      status: 200,
      headers: JSON_HEADERS,
    });
  }
}

async function proxyMediaToOrigin(request: Request, url: URL, originBase: string): Promise<Response> {
  const cleanOrigin = originBase.replace(/\/+$/, '');
  const targetUrl = `${cleanOrigin}${url.pathname}${url.search}`;
  const proxiedReq = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
  });
  return fetch(proxiedReq);
}

const BUNNY_REGION_ENDPOINTS: Record<string, string> = {
  de: 'storage.bunnycdn.com',
  default: 'storage.bunnycdn.com',
  ny: 'ny.storage.bunnycdn.com',
  la: 'la.storage.bunnycdn.com',
  sg: 'sg.storage.bunnycdn.com',
  syd: 'syd.storage.bunnycdn.com',
  uk: 'uk.storage.bunnycdn.com',
  se: 'se.storage.bunnycdn.com',
  br: 'br.storage.bunnycdn.com',
  jh: 'jh.storage.bunnycdn.com',
};

function resolveWorkerBunnyStorage(env: WorkerEnv): {
  zone: string;
  apiKey: string;
  endpoint: string;
  cdnBase: string;
} | null {
  const zone = (env.BUNNY_STORAGE_ZONE || env.BUNNY_STORAGE_ZONE_NAME || BUILD_BUNNY_STORAGE_ZONE || '').trim();
  const apiKey = (
    env.BUNNY_STORAGE_API_KEY ||
    env.BUNNY_STORAGE_PASSWORD ||
    env.BUNNY_ACCESS_KEY ||
    BUILD_BUNNY_STORAGE_API_KEY ||
    ''
  ).trim();
  if (!zone || !apiKey) return null;

  const rawRegion = (env.BUNNY_STORAGE_ENDPOINT || env.BUNNY_STORAGE_REGION || BUILD_BUNNY_STORAGE_REGION || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');
  const endpoint = !rawRegion
    ? 'storage.bunnycdn.com'
    : BUNNY_REGION_ENDPOINTS[rawRegion] || (rawRegion.includes('.') ? rawRegion : `${rawRegion}.storage.bunnycdn.com`);

  const rawCdn = (
    env.BUNNY_CDN_URL ||
    env.BUNNY_CDN_HOSTNAME ||
    env.BUNNY_PULL_ZONE_URL ||
    BUILD_BUNNY_CDN_URL ||
    ''
  )
    .trim()
    .replace(/\/+$/, '');
  const cdnBase = rawCdn
    ? rawCdn.startsWith('http://') || rawCdn.startsWith('https://')
      ? rawCdn
      : `https://${rawCdn}`
    : '';

  return { zone, apiKey, endpoint, cdnBase };
}

function resolveWorkerBunnyStream(env: WorkerEnv): {
  libraryId: string;
  apiKey: string;
  cdnHost: string;
} | null {
  const libraryId = (env.BUNNY_STREAM_LIBRARY_ID || env.BUNNY_LIBRARY_ID || BUILD_BUNNY_STREAM_LIBRARY_ID || '').trim();
  const apiKey = (env.BUNNY_STREAM_API_KEY || BUILD_BUNNY_STREAM_API_KEY || '').trim();
  if (!libraryId || !apiKey) return null;

  const rawHost = (
    env.BUNNY_STREAM_CDN_HOST ||
    env.BUNNY_STREAM_CDN_HOSTNAME ||
    BUILD_BUNNY_STREAM_CDN_HOST ||
    ''
  )
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');

  return { libraryId, apiKey, cdnHost: rawHost };
}

async function sha256HexWorker(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function handleWorkerBunnyStreamInit(request: Request, env: WorkerEnv): Promise<Response> {
  const streamCfg = resolveWorkerBunnyStream(env);
  if (!streamCfg) {
    return new Response(
      JSON.stringify({
        ok: false,
        code: 'BUNNY_STREAM_NOT_CONFIGURED',
        error: 'Bunny Stream credentials are not configured.',
      }),
      { status: 501, headers: JSON_HEADERS }
    );
  }

  const projectId = env.FIREBASE_PROJECT_ID?.trim() || 'gen-lang-client-0936405543';
  const verified = await verifyWorkerFirebaseToken(request.headers.get('authorization'), projectId);
  if (!verified) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Authentication required to upload media.' }),
      { status: 401, headers: JSON_HEADERS }
    );
  }

  const body: any = await request.json().catch(() => ({}));
  const safeTitle =
    typeof body?.title === 'string' && body.title.trim()
      ? body.title.trim().slice(0, 120)
      : `PeaceVerse_${Date.now()}`;

  const createResp = await fetch(
    `https://video.bunnycdn.com/library/${encodeURIComponent(streamCfg.libraryId)}/videos`,
    {
      method: 'POST',
      headers: {
        AccessKey: streamCfg.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ title: safeTitle }),
    }
  );
  const created: any = await createResp.json().catch(() => null);
  const videoId = typeof created?.guid === 'string' ? created.guid : '';
  if (!createResp.ok || !videoId) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: created?.Message || created?.message || `Bunny Stream init failed (${createResp.status}).`,
      }),
      { status: 502, headers: JSON_HEADERS }
    );
  }

  const expirationTime = Math.floor(Date.now() / 1000) + 7200;
  const signature = await sha256HexWorker(
    `${streamCfg.libraryId}${streamCfg.apiKey}${expirationTime}${videoId}`
  );
  const playbackUrl = streamCfg.cdnHost
    ? `https://${streamCfg.cdnHost}/${videoId}/playlist.m3u8`
    : `https://iframe.mediadelivery.net/embed/${streamCfg.libraryId}/${videoId}?autoplay=true&preload=true`;

  return new Response(
    JSON.stringify({
      ok: true,
      libraryId: streamCfg.libraryId,
      videoId,
      expirationTime,
      signature,
      tusEndpoint: 'https://video.bunnycdn.com/tusupload',
      playbackUrl,
    }),
    { status: 200, headers: JSON_HEADERS }
  );
}

async function handleWorkerMediaUpload(request: Request, env: WorkerEnv): Promise<Response> {
  // BUNNY_TEMPORARILY_DISABLED_FOR_TEST_MODE:
  // const storageCfg = resolveWorkerBunnyStorage(env);
  if (!env.MEDIA_BUCKET /* && !storageCfg */) {
    return new Response(
      JSON.stringify({
        ok: false,
        code: 'MEDIA_STORAGE_NOT_CONFIGURED',
        error: 'Cloudflare R2 is not configured on this worker (Bunny.net is temporarily disabled in Test Mode).',
      }),
      { status: 501, headers: JSON_HEADERS }
    );
  }

  const projectId = env.FIREBASE_PROJECT_ID?.trim() || 'gen-lang-client-0936405543';
  const verified = await verifyWorkerFirebaseToken(request.headers.get('authorization'), projectId);
  if (!verified) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Authentication required to upload media.' }),
      { status: 401, headers: JSON_HEADERS }
    );
  }

  const declaredMime = String(
    request.headers.get('x-media-mime') || request.headers.get('content-type') || ''
  ).toLowerCase();
  const requestedExt = String(request.headers.get('x-media-ext') || '').replace(/[^a-z0-9]/gi, '');
  const ext = resolveWorkerMediaExt(declaredMime, requestedExt);
  if (!ext) {
    return new Response(JSON.stringify({ ok: false, error: 'Unsupported or blocked media type.' }), {
      status: 415,
      headers: JSON_HEADERS,
    });
  }

  const rawId = String(request.headers.get('x-media-id') || '').trim();
  const mediaId = /^[a-zA-Z0-9_-]{8,64}$/.test(rawId)
    ? rawId
    : `pv_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  const filename = `${mediaId}.${ext}`;
  const mimeType = WORKER_ALLOWED_EXT_TO_MIME[ext] || 'application/octet-stream';

  const bodyBuf = await request.arrayBuffer();
  if (!bodyBuf || bodyBuf.byteLength === 0) {
    return new Response(JSON.stringify({ ok: false, error: 'Empty media payload.' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }
  await env.MEDIA_BUCKET.put(`media/${filename}`, bodyBuf, {
    httpMetadata: {
      contentType: mimeType,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });
  return new Response(
    JSON.stringify({
      ok: true,
      provider: 'r2',
      mediaId,
      filename,
      url: `/api/media/${filename}`,
      size: bodyBuf.byteLength,
    }),
    { status: 200, headers: JSON_HEADERS }
  );

  /* BUNNY_TEMPORARILY_DISABLED_FOR_TEST_MODE: Re-enable Bunny Storage direct streaming upload when going live
  if (!storageCfg || !request.body) {
    return new Response(JSON.stringify({ ok: false, error: 'Empty media payload.' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const contentLength = request.headers.get('content-length');
  const bunnyPutHeaders: Record<string, string> = {
    AccessKey: storageCfg.apiKey,
    'Content-Type': 'application/octet-stream',
  };
  if (contentLength) {
    bunnyPutHeaders['Content-Length'] = contentLength;
  }

  const bunnyRes = await fetch(
    `https://${storageCfg.endpoint}/${encodeURIComponent(storageCfg.zone)}/media/${encodeURIComponent(filename)}`,
    {
      method: 'PUT',
      headers: bunnyPutHeaders,
      body: request.body,
    }
  );
  if (!bunnyRes.ok) {
    const errText = await bunnyRes.text().catch(() => '');
    return new Response(
      JSON.stringify({
        ok: false,
        error: `Bunny Storage upload failed (${bunnyRes.status})${errText ? `: ${errText.slice(0, 120)}` : ''}`,
      }),
      { status: 502, headers: JSON_HEADERS }
    );
  }

  const publicUrl = storageCfg.cdnBase
    ? `${storageCfg.cdnBase}/media/${filename}`
    : `/api/media/${filename}`;

  return new Response(
    JSON.stringify({
      ok: true,
      provider: 'bunny-storage',
      mediaId,
      filename,
      url: publicUrl,
      size: contentLength ? Number(contentLength) : undefined,
    }),
    { status: 200, headers: JSON_HEADERS }
  );
  */
}

interface WorkerChunkMeta {
  ownerUid: string;
  ext: string;
  totalChunks: number;
  uploadId: string;
  parts: WorkerR2UploadedPart[];
  totalBytes: number;
}

async function handleWorkerMediaUploadChunk(request: Request, env: WorkerEnv): Promise<Response> {
  if (!env.MEDIA_BUCKET) {
    return new Response(
      JSON.stringify({
        ok: false,
        code: 'MEDIA_STORAGE_NOT_CONFIGURED',
        error: 'Cloudflare R2 MEDIA_BUCKET is not bound on this worker.',
      }),
      { status: 501, headers: JSON_HEADERS }
    );
  }

  const projectId = env.FIREBASE_PROJECT_ID?.trim() || 'gen-lang-client-0936405543';
  const verified = await verifyWorkerFirebaseToken(request.headers.get('authorization'), projectId);
  if (!verified) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Authentication required to upload media.' }),
      { status: 401, headers: JSON_HEADERS }
    );
  }

  const rawId = String(request.headers.get('x-media-id') || '').trim();
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(rawId)) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid media ID.' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const declaredMime = String(
    request.headers.get('x-media-mime') || request.headers.get('content-type') || ''
  ).toLowerCase();
  const requestedExt = String(request.headers.get('x-media-ext') || '').replace(/[^a-z0-9]/gi, '');
  const ext = resolveWorkerMediaExt(declaredMime, requestedExt);
  if (!ext) {
    return new Response(JSON.stringify({ ok: false, error: 'Unsupported or blocked media type.' }), {
      status: 415,
      headers: JSON_HEADERS,
    });
  }

  const chunkIndex = Number(request.headers.get('x-chunk-index'));
  const totalChunks = Number(request.headers.get('x-total-chunks'));
  if (
    !Number.isInteger(chunkIndex) ||
    !Number.isInteger(totalChunks) ||
    totalChunks < 1 ||
    totalChunks > 2048 ||
    chunkIndex < 0 ||
    chunkIndex >= totalChunks
  ) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid chunk index metadata.' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const bodyBuf = await request.arrayBuffer();
  if (!bodyBuf || bodyBuf.byteLength === 0) {
    return new Response(JSON.stringify({ ok: false, error: 'Empty chunk payload.' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const finalFilename = `${rawId}.${ext}`;
  const objectKey = `media/${finalFilename}`;
  const metaKey = `chunks-meta/${rawId}.json`;
  const mimeType = WORKER_ALLOWED_EXT_TO_MIME[ext] || 'application/octet-stream';

  if (totalChunks === 1) {
    await env.MEDIA_BUCKET.put(objectKey, bodyBuf, {
      httpMetadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });
    return new Response(
      JSON.stringify({
        ok: true,
        completed: true,
        mediaId: rawId,
        filename: finalFilename,
        url: `/api/media/${finalFilename}`,
        size: bodyBuf.byteLength,
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  }

  let meta: WorkerChunkMeta | null = null;
  if (chunkIndex === 0) {
    const existingObj = await env.MEDIA_BUCKET.get(metaKey);
    if (existingObj) {
      try {
        const parsed = JSON.parse(await existingObj.text()) as WorkerChunkMeta;
        if (parsed.ownerUid !== verified.uid) {
          return new Response(JSON.stringify({ ok: false, error: 'Media ID belongs to another user.' }), {
            status: 403,
            headers: JSON_HEADERS,
          });
        }
        if (parsed.parts.some((p) => p.partNumber === 1)) {
          return new Response(
            JSON.stringify({ ok: true, completed: false, mediaId: rawId, chunkIndex: 0 }),
            { status: 200, headers: JSON_HEADERS }
          );
        }
      } catch {}
    }

    const multipart = await env.MEDIA_BUCKET.createMultipartUpload(objectKey, {
      httpMetadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });
    const part1 = await multipart.uploadPart(1, bodyBuf);
    meta = {
      ownerUid: verified.uid,
      ext,
      totalChunks,
      uploadId: multipart.uploadId,
      parts: [part1],
      totalBytes: bodyBuf.byteLength,
    };
    await env.MEDIA_BUCKET.put(metaKey, JSON.stringify(meta));
  } else {
    const metaObj = await env.MEDIA_BUCKET.get(metaKey);
    if (!metaObj) {
      const doneHead = await env.MEDIA_BUCKET.head(objectKey);
      if (chunkIndex === totalChunks - 1 && doneHead) {
        return new Response(
          JSON.stringify({
            ok: true,
            completed: true,
            mediaId: rawId,
            filename: finalFilename,
            url: `/api/media/${finalFilename}`,
            size: doneHead.size,
          }),
          { status: 200, headers: JSON_HEADERS }
        );
      }
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid or expired upload session.' }),
        { status: 403, headers: JSON_HEADERS }
      );
    }

    meta = JSON.parse(await metaObj.text()) as WorkerChunkMeta;
    if (meta.ownerUid !== verified.uid || meta.ext !== ext || meta.totalChunks !== totalChunks) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized upload session.' }),
        { status: 403, headers: JSON_HEADERS }
      );
    }

    const partNumber = chunkIndex + 1;
    const alreadyUploaded = meta.parts.find((p) => p.partNumber === partNumber);
    if (!alreadyUploaded) {
      const nextTotal = meta.totalBytes + bodyBuf.byteLength;
      if (nextTotal > 2 * 1024 * 1024 * 1024) {
        await env.MEDIA_BUCKET.delete(metaKey).catch(() => {});
        return new Response(
          JSON.stringify({ ok: false, error: 'Video exceeds maximum 2GB size limit.' }),
          { status: 413, headers: JSON_HEADERS }
        );
      }
      const multipart = env.MEDIA_BUCKET.resumeMultipartUpload(objectKey, meta.uploadId);
      const uploadedPart = await multipart.uploadPart(partNumber, bodyBuf);
      meta.parts.push(uploadedPart);
      meta.totalBytes = nextTotal;
      await env.MEDIA_BUCKET.put(metaKey, JSON.stringify(meta));
    }
  }

  if (chunkIndex === totalChunks - 1 && meta) {
    const multipart = env.MEDIA_BUCKET.resumeMultipartUpload(objectKey, meta.uploadId);
    const orderedParts = [...meta.parts].sort((a, b) => a.partNumber - b.partNumber);
    await multipart.complete(orderedParts);
    await env.MEDIA_BUCKET.delete(metaKey).catch(() => {});
    return new Response(
      JSON.stringify({
        ok: true,
        completed: true,
        mediaId: rawId,
        filename: finalFilename,
        url: `/api/media/${finalFilename}`,
        size: meta.totalBytes,
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      completed: false,
      mediaId: rawId,
      chunkIndex,
    }),
    { status: 200, headers: JSON_HEADERS }
  );
}

async function handleWorkerMediaGet(
  request: Request,
  filename: string,
  env: WorkerEnv
): Promise<Response> {
  const storageCfg = resolveWorkerBunnyStorage(env);
  if (!env.MEDIA_BUCKET && !storageCfg) {
    return new Response(JSON.stringify({ ok: false, error: 'Media not found.' }), {
      status: 404,
      headers: JSON_HEADERS,
    });
  }

  const extMatch = filename.match(
    /^[a-zA-Z0-9_-]{4,80}\.(mp4|m4v|webm|mov|ogg|3gp|mkv|jpg|jpeg|png|webp|gif|mp3|m4a)$/i
  );
  if (!extMatch) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid media filename.' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const ext = extMatch[1].toLowerCase();

  if (!env.MEDIA_BUCKET && storageCfg) {
    const bunnyHeaders: Record<string, string> = {
      AccessKey: storageCfg.apiKey,
    };
    const rangeReq = request.headers.get('range');
    if (rangeReq) {
      bunnyHeaders['Range'] = rangeReq;
    }
    const upstream = await fetch(
      `https://${storageCfg.endpoint}/${encodeURIComponent(storageCfg.zone)}/media/${encodeURIComponent(filename)}`,
      {
        method: request.method === 'HEAD' ? 'HEAD' : 'GET',
        headers: bunnyHeaders,
      }
    );
    if (!upstream.ok && upstream.status !== 206) {
      return new Response(JSON.stringify({ ok: false, error: 'Media not found on Bunny Storage.' }), {
        status: upstream.status === 404 ? 404 : 502,
        headers: JSON_HEADERS,
      });
    }
    const respHeaders = new Headers();
    respHeaders.set('Content-Type', WORKER_ALLOWED_EXT_TO_MIME[ext] || 'application/octet-stream');
    respHeaders.set('Accept-Ranges', 'bytes');
    respHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
    respHeaders.set('X-Content-Type-Options', 'nosniff');
    const cr = upstream.headers.get('content-range');
    const cl = upstream.headers.get('content-length');
    if (cr) respHeaders.set('Content-Range', cr);
    if (cl) respHeaders.set('Content-Length', cl);
    return new Response(request.method === 'HEAD' ? null : upstream.body, {
      status: upstream.status,
      headers: respHeaders,
    });
  }

  const bucket = env.MEDIA_BUCKET;
  if (!bucket) {
    return new Response(JSON.stringify({ ok: false, error: 'Media not found on this server.' }), {
      status: 404,
      headers: JSON_HEADERS,
    });
  }

  const key = `media/${filename}`;
  const headObj = await bucket.head(key);
  if (!headObj) {
    return new Response(JSON.stringify({ ok: false, error: 'Media not found on this server.' }), {
      status: 404,
      headers: JSON_HEADERS,
    });
  }

  const mimeType = headObj.httpMetadata?.contentType || WORKER_ALLOWED_EXT_TO_MIME[ext] || 'application/octet-stream';
  const totalSize = headObj.size;
  const baseHeaders: Record<string, string> = {
    'Content-Type': mimeType,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  };

  const rangeHeader = request.headers.get('range');
  if (rangeHeader && rangeHeader.startsWith('bytes=')) {
    const parts = rangeHeader.replace(/bytes=/, '').split('-');
    const start = Math.max(0, parseInt(parts[0], 10) || 0);
    const end = parts[1] ? Math.min(totalSize - 1, parseInt(parts[1], 10)) : totalSize - 1;
    if (start >= totalSize || start > end) {
      return new Response(null, {
        status: 416,
        headers: { 'Content-Range': `bytes */${totalSize}` },
      });
    }
    const length = end - start + 1;
    if (request.method === 'HEAD') {
      return new Response(null, {
        status: 206,
        headers: {
          ...baseHeaders,
          'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          'Content-Length': String(length),
        },
      });
    }
    const rangedObj = await bucket.get(key, { range: { offset: start, length } });
    if (!rangedObj || !rangedObj.body) {
      return new Response(null, { status: 404 });
    }
    return new Response(rangedObj.body, {
      status: 206,
      headers: {
        ...baseHeaders,
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Content-Length': String(length),
      },
    });
  }

  if (request.method === 'HEAD') {
    return new Response(null, {
      status: 200,
      headers: { ...baseHeaders, 'Content-Length': String(totalSize) },
    });
  }

  const obj = await bucket.get(key);
  if (!obj || !obj.body) {
    return new Response(null, { status: 404 });
  }
  return new Response(obj.body, {
    status: 200,
    headers: { ...baseHeaders, 'Content-Length': String(totalSize) },
  });
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204 });
      }

      if (url.pathname === '/api/auth/send-email-otp' && request.method === 'POST') {
        return handleSendEmailOtp(request, env);
      }

      if (url.pathname === '/api/auth/verify-email-otp' && request.method === 'POST') {
        return handleVerifyEmailOtp(request, env);
      }

      if (url.pathname === '/api/ai/moderate-post' && request.method === 'POST') {
        return handleModeratePost(request);
      }

      if (url.pathname === '/api/ai/moderate-media' && request.method === 'POST') {
        return handleModerateMedia(request, env);
      }

      if (url.pathname.startsWith('/api/media/')) {
        if (url.pathname === '/api/media/capabilities' && request.method === 'GET') {
          return new Response(
            JSON.stringify({
              ok: true,
              expressDisk: false,
              r2: Boolean(env.MEDIA_BUCKET),
              // BUNNY_TEMPORARILY_DISABLED_FOR_TEST_MODE:
              // bunnyStorage: Boolean(resolveWorkerBunnyStorage(env)),
              // bunnyStream: Boolean(resolveWorkerBunnyStream(env)),
              bunnyStorage: false,
              bunnyStream: false,
              testModeFirebaseStorageVideo: true,
              maxEdgeSingleBytes: 95 * 1024 * 1024,
            }),
            { status: 200, headers: JSON_HEADERS }
          );
        }
        if (url.pathname === '/api/media/bunny-stream/init' && request.method === 'POST') {
          // BUNNY_TEMPORARILY_DISABLED_FOR_TEST_MODE:
          // return handleWorkerBunnyStreamInit(request, env);
          void handleWorkerBunnyStreamInit;
          void resolveWorkerBunnyStream;
          return new Response(
            JSON.stringify({
              ok: false,
              code: 'BUNNY_TEMPORARILY_DISABLED',
              error: 'Bunny.net Stream is temporarily disabled in Test Mode. Using Firebase Storage.',
            }),
            { status: 501, headers: JSON_HEADERS }
          );
        }
        if (!env.MEDIA_BUCKET /* && !resolveWorkerBunnyStorage(env) */ && env.ORIGIN_API_URL?.trim()) {
          return proxyMediaToOrigin(request, url, env.ORIGIN_API_URL.trim());
        }
        if (url.pathname === '/api/media/upload' && request.method === 'POST') {
          return handleWorkerMediaUpload(request, env);
        }
        if (url.pathname === '/api/media/upload-chunk' && request.method === 'POST') {
          return handleWorkerMediaUploadChunk(request, env);
        }
        const mediaFilename = decodeURIComponent(url.pathname.slice('/api/media/'.length));
        if (mediaFilename && (request.method === 'GET' || request.method === 'HEAD')) {
          return handleWorkerMediaGet(request, mediaFilename, env);
        }
      }

      if (url.pathname === '/api/users/directory' && request.method === 'GET') {
        return new Response(JSON.stringify({ users: [] }), {
          status: 200,
          headers: JSON_HEADERS,
        });
      }

      if (url.pathname === '/api/users/search' && request.method === 'GET') {
        return new Response(JSON.stringify({ users: [] }), {
          status: 200,
          headers: JSON_HEADERS,
        });
      }

      if (url.pathname === '/api/users/sync' && request.method === 'POST') {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: JSON_HEADERS,
        });
      }

      if (url.pathname === '/api/mobile-center/status' && request.method === 'GET') {
        return new Response(
          JSON.stringify({
            simDetected: false,
            operator: null,
            dataBalance: null,
            expiry: null,
            freeModeAvailable: false,
            message: 'সিম কার্ড পাওয়া যায়নি',
          }),
          { status: 200, headers: JSON_HEADERS }
        );
      }

      return new Response(JSON.stringify({ ok: false, error: 'API route not found.' }), {
        status: 404,
        headers: JSON_HEADERS,
      });
    }

    return env.ASSETS.fetch(request);
  },
};
