import { BUILD_RESEND_API_KEY, BUILD_RESEND_FROM_EMAIL } from './build-env';

interface WorkerAssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface WorkerEnv {
  ASSETS: WorkerAssetsBinding;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  OTP_SIGNING_SECRET?: string;
}

const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

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
      }),
    });

    if (!resendRes.ok) {
      const errJson: any = await resendRes.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          success: false,
          error: errJson?.message || `Resend email failed (HTTP ${resendRes.status})`,
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
    }

    return env.ASSETS.fetch(request);
  },
};
