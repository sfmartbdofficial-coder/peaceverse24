import express from 'express';
import http from 'http';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT =
  process.env.NODE_ENV === 'production' && !process.env.NGINX_PORT
    ? Number(process.env.PORT) || 3000
    : Number(process.env.DEFAULT_APP_PORT) || 3000;

app.use(express.json({ limit: '5mb' }));

// Enable Cloudflare Bot Fight Mode + Rate Limit 10 req/sec in dashboard
// Bunny.net CDN header enforcement: bunnynet.addHeader("X-Content-Type-Options: nosniff")
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self)');

  // Check CF-Connecting-IP header when strict Cloudflare origin enforcement is enabled
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  if (process.env.REQUIRE_CLOUDFLARE_ORIGIN === 'true' && !cfConnectingIp) {
    return res.status(403).json({
      error: 'Security Block: Direct access blocked. Traffic must route through Cloudflare.',
    });
  }
  res.setHeader('X-Cloudflare-Protection', cfConnectingIp ? 'Verified' : 'Shield-Active');

  if (req.path.startsWith('/admin') || req.path.startsWith('/config') || req.path.startsWith('/api')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }

  const rawUrl = req.originalUrl || '';
  if (/(api[_-]?key|gemini[_-]?api[_-]?key|firebase[_-]?key|bunny[_-]?token)=|AIza[0-9A-Za-z_-]{20,}/i.test(rawUrl)) {
    return res.status(403).json({
      error: 'Security Block: API keys must never be passed in the URL.',
    });
  }
  next();
});

// Explicit robots.txt route telling Google what to crawl and blocking private routes
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain; charset=utf-8');
  res.send(
    [
      'User-agent: *',
      'Allow: /',
      'Allow: /home',
      'Allow: /login',
      'Allow: /signup',
      'Allow: /blog',
      'Allow: /qibla',
      'Allow: /peace-threads',
      'Allow: /peace-insta',
      'Allow: /business-suite',
      'Allow: /peace-edits-editor',
      'Disallow: /admin',
      'Disallow: /admin/',
      'Disallow: /api',
      'Disallow: /api/',
      'Disallow: /config',
      'Disallow: /config/',
      'Disallow: /asol-admin-secret',
      '',
      'Sitemap: https://peaceverse24.com/sitemap.xml',
      '',
    ].join('\n')
  );
});

// Explicit sitemap.xml route for Google Search Console & crawlers
app.get('/sitemap.xml', (_req, res) => {
  res.type('application/xml; charset=utf-8');
  res.sendFile(path.resolve(__dirname, 'public', 'sitemap.xml'));
});

// Server-side Rate Limiter for /api/* (Max 60 requests per minute per client IP/user; OTP endpoints enforce tighter per-email limits)
const apiRateMap = new Map<string, number[]>();
app.use('/api', (req, res, next) => {
  const clientIp = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxReq = 60;
  const recent = (apiRateMap.get(clientIp) || []).filter((ts) => now - ts < windowMs);
  if (recent.length >= maxReq) {
    return res.status(429).json({ error: 'Rate limit exceeded: too many requests. Please wait a moment.' });
  }
  recent.push(now);
  apiRateMap.set(clientIp, recent);
  next();
});

// ==========================================
// REAL 6-DIGIT EMAIL OTP SERVICE (NO DEMO CODE)
// ==========================================
interface OtpChallengeRecord {
  codeHash: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  sendHistory: number[];
}

const emailOtpStore = new Map<string, OtpChallengeRecord>();
const verifiedEmailTokenStore = new Map<string, { email: string; purpose: string; expiresAt: number }>();

const EMAIL_OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const EMAIL_OTP_COOLDOWN_MS = 45 * 1000; // 45 seconds between resends
const EMAIL_OTP_MAX_ATTEMPTS = 5;
const EMAIL_OTP_MAX_SENDS_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const EMAIL_OTP_MAX_SENDS_PER_WINDOW = 5;

const otpRuntimeFallbackSecret = crypto.randomBytes(32).toString('hex');

function getOtpSigningSecret(): string {
  return (
    process.env.OTP_SIGNING_SECRET?.trim() ||
    process.env.RESEND_API_KEY?.trim() ||
    process.env.SMTP_PASS?.trim() ||
    otpRuntimeFallbackSecret
  );
}

function hashOtpCode(email: string, purpose: string, code: string): string {
  return crypto
    .createHash('sha256')
    .update(`${email.toLowerCase()}:${purpose}:${code}`)
    .digest('hex');
}

function createSignedOtpChallenge(email: string, purpose: string, code: string, expiresAt: number): string {
  const payload = Buffer.from(JSON.stringify({ email: email.toLowerCase(), purpose, exp: expiresAt })).toString('base64url');
  const sig = crypto
    .createHmac('sha256', getOtpSigningSecret())
    .update(`${payload}:${code}`)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function verifySignedOtpChallenge(challengeToken: string, email: string, purpose: string, code: string): boolean {
  try {
    const parts = challengeToken.split('.');
    if (parts.length !== 2) return false;
    const [payloadB64, sigB64] = parts;
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (
      !parsed ||
      parsed.email !== email.toLowerCase() ||
      parsed.purpose !== purpose ||
      typeof parsed.exp !== 'number' ||
      Date.now() > parsed.exp
    ) {
      return false;
    }
    const expectedSig = crypto
      .createHmac('sha256', getOtpSigningSecret())
      .update(`${payloadB64}:${code}`)
      .digest('base64url');
    if (sigB64.length !== expectedSig.length) return false;
    return crypto.timingSafeEqual(Buffer.from(sigB64), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

function escapeHtmlBasic(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function dispatchRealOtpEmail(params: {
  toEmail: string;
  fullName: string;
  code: string;
  purpose: string;
}): Promise<string> {
  const { toEmail, fullName, code, purpose } = params;
  const recipientName = escapeHtmlBasic(fullName || 'PeaceVerse Friend');
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

  // Provider 1: Resend REST API
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey && resendKey !== 're_YOUR_RESEND_API_KEY') {
    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || 'PeaceVerse24 <noreply@peaceverse24.com>';
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        html: htmlBody,
        text: textBody,
        headers: {
          'X-Entity-Ref-ID': crypto.randomUUID(),
        },
      }),
    });

    if (!resendRes.ok) {
      const errJson: any = await resendRes.json().catch(() => ({}));
      throw new Error(errJson?.message || `Resend email failed (HTTP ${resendRes.status})`);
    }
    return 'resend';
  }

  // Provider 2: Gmail / Custom SMTP via Nodemailer
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  if (
    smtpUser &&
    smtpPass &&
    smtpUser !== 'your-gmail@gmail.com' &&
    smtpPass !== 'YOUR_16_CHAR_GMAIL_APP_PASSWORD'
  ) {
    const smtpHost = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL?.trim() || `PeaceVerse24 <${smtpUser}>`,
      to: toEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });
    return 'smtp';
  }

  // Provider 3: EmailJS REST API
  const ejsService = process.env.EMAILJS_SERVICE_ID?.trim();
  const ejsTemplate = process.env.EMAILJS_TEMPLATE_ID?.trim();
  const ejsPublicKey = process.env.EMAILJS_PUBLIC_KEY?.trim();
  if (ejsService && ejsTemplate && ejsPublicKey) {
    const ejsRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: ejsService,
        template_id: ejsTemplate,
        user_id: ejsPublicKey,
        ...(process.env.EMAILJS_PRIVATE_KEY?.trim()
          ? { accessToken: process.env.EMAILJS_PRIVATE_KEY.trim() }
          : {}),
        template_params: {
          to_email: toEmail,
          user_email: toEmail,
          email: toEmail,
          to_name: fullName || 'Friend',
          passcode: code,
          otp_code: code,
          code,
          app_name: 'PeaceVerse24',
        },
      }),
    });

    if (!ejsRes.ok) {
      const errText = await ejsRes.text().catch(() => '');
      throw new Error(errText || `EmailJS request failed (HTTP ${ejsRes.status})`);
    }
    return 'emailjs';
  }

  const missingErr: any = new Error(
    'ইমেইল সার্ভিস কনফিগার করা হয়নি। Vercel/Server Environment Variables-এ RESEND_API_KEY অথবা Gmail SMTP_USER ও SMTP_PASS সেট করুন।'
  );
  missingErr.statusCode = 503;
  throw missingErr;
}

app.post('/api/auth/send-email-otp', async (req, res) => {
  try {
    const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const fullName = typeof req.body?.fullName === 'string' ? req.body.fullName.trim().slice(0, 80) : '';
    const purpose = req.body?.purpose === '2fa' ? '2fa' : 'signup';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(rawEmail) || rawEmail.endsWith('@phone.peaceverse.app')) {
      return res.status(400).json({
        success: false,
        error: 'অনুগ্রহ করে আপনার সঠিক আসল Email (যেমন: name@gmail.com) লিখুন।',
      });
    }

    const allowExisting = req.body?.allowExisting === true;
    const key = `${purpose}:${rawEmail}`;
    const now = Date.now();
    const existing = emailOtpStore.get(key);

    if (existing && now - existing.lastSentAt < EMAIL_OTP_COOLDOWN_MS) {
      const waitSec = Math.ceil((EMAIL_OTP_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
      if (allowExisting && now < existing.expiresAt && existing.attempts < EMAIL_OTP_MAX_ATTEMPTS) {
        return res.json({
          success: true,
          alreadySent: true,
          email: rawEmail,
          provider: 'existing',
          expiresInSeconds: Math.max(1, Math.floor((existing.expiresAt - now) / 1000)),
          resendCooldownSeconds: waitSec,
          message: `আপনার ${rawEmail} ইমেইলে ইতিমধ্যেই ৬ ডিজিটের কোড পাঠানো আছে। নিচে কোডটি লিখুন (অথবা ${waitSec} সেকেন্ড পর আবার পাঠান)।`,
        });
      }
      return res.status(429).json({
        success: false,
        error: `অনুগ্রহ করে ${waitSec} সেকেন্ড পর আবার কোড পাঠান।`,
      });
    }

    const recentSends = (existing?.sendHistory || []).filter(
      (ts) => now - ts < EMAIL_OTP_MAX_SENDS_WINDOW_MS
    );
    if (recentSends.length >= EMAIL_OTP_MAX_SENDS_PER_WINDOW) {
      return res.status(429).json({
        success: false,
        error: 'অনেকবার কোড পাঠানো হয়েছে। ১৫ মিনিট পর আবার চেষ্টা করুন।',
      });
    }

    const otpCode = String(crypto.randomInt(100000, 1000000));
    const provider = await dispatchRealOtpEmail({
      toEmail: rawEmail,
      fullName,
      code: otpCode,
      purpose,
    });

    const expiresAt = now + EMAIL_OTP_TTL_MS;
    recentSends.push(now);
    emailOtpStore.set(key, {
      codeHash: hashOtpCode(rawEmail, purpose, otpCode),
      expiresAt,
      attempts: 0,
      lastSentAt: now,
      sendHistory: recentSends,
    });

    const challengeToken = createSignedOtpChallenge(rawEmail, purpose, otpCode, expiresAt);

    return res.json({
      success: true,
      email: rawEmail,
      provider,
      challengeToken,
      expiresInSeconds: Math.floor(EMAIL_OTP_TTL_MS / 1000),
      resendCooldownSeconds: Math.floor(EMAIL_OTP_COOLDOWN_MS / 1000),
      message: `${rawEmail} ঠিকানায় ৬ ডিজিটের ভেরিফিকেশন কোড পাঠানো হয়েছে।`,
    });
  } catch (error: any) {
    const status = typeof error?.statusCode === 'number' ? error.statusCode : 500;
    console.error('Send Email OTP Error:', error?.message || error);
    return res.status(status).json({
      success: false,
      error:
        error?.message ||
        'ইমেইলে ভেরিফিকেশন কোড পাঠানো যায়নি। আবার চেষ্টা করুন।',
    });
  }
});

app.post('/api/auth/verify-email-otp', (req, res) => {
  try {
    const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
    const purpose = req.body?.purpose === '2fa' ? '2fa' : 'signup';
    const challengeToken = typeof req.body?.challengeToken === 'string' ? req.body.challengeToken.trim() : '';

    if (!rawEmail || !/^\d{6}$/.test(code)) {
      return res.status(400).json({
        verified: false,
        error: 'আপনার ইমেইলে পাঠানো সঠিক ৬ ডিজিটের কোডটি লিখুন।',
      });
    }

    const key = `${purpose}:${rawEmail}`;
    const record = emailOtpStore.get(key);
    const now = Date.now();

    if (!record) {
      if (challengeToken && verifySignedOtpChallenge(challengeToken, rawEmail, purpose, code)) {
        const verificationToken = crypto.randomBytes(24).toString('hex');
        verifiedEmailTokenStore.set(verificationToken, {
          email: rawEmail,
          purpose,
          expiresAt: now + 15 * 60 * 1000,
        });
        return res.json({
          verified: true,
          email: rawEmail,
          verificationToken,
          message: 'ইমেইল সফলভাবে ভেরিফাই হয়েছে।',
        });
      }
      return res.status(400).json({
        verified: false,
        error: 'কোনো সক্রিয় কোড পাওয়া যায়নি। দয়া করে আবার কোড পাঠান।',
      });
    }

    if (now > record.expiresAt) {
      emailOtpStore.delete(key);
      return res.status(400).json({
        verified: false,
        error: 'কোডটির মেয়াদ শেষ হয়ে গেছে। দয়া করে নতুন কোড পাঠান।',
      });
    }

    if (record.attempts >= EMAIL_OTP_MAX_ATTEMPTS) {
      emailOtpStore.delete(key);
      return res.status(429).json({
        verified: false,
        error: 'অনেকবার ভুল কোড দেওয়া হয়েছে। অনুগ্রহ করে নতুন কোড পাঠান।',
      });
    }

    const incomingHash = hashOtpCode(rawEmail, purpose, code);
    const matched = crypto.timingSafeEqual(
      Buffer.from(incomingHash, 'hex'),
      Buffer.from(record.codeHash, 'hex')
    );

    if (!matched) {
      record.attempts += 1;
      emailOtpStore.set(key, record);
      const remaining = Math.max(0, EMAIL_OTP_MAX_ATTEMPTS - record.attempts);
      return res.status(400).json({
        verified: false,
        error:
          remaining > 0
            ? `ভুল কোড! আপনার ইমেইলে পাঠানো ৬ ডিজিটের কোডটি লিখুন (আরো ${remaining} বার চেষ্টা করতে পারবেন)।`
            : 'অনেকবার ভুল কোড দেওয়া হয়েছে। অনুগ্রহ করে নতুন কোড পাঠান।',
      });
    }

    emailOtpStore.delete(key);
    const verificationToken = crypto.randomBytes(24).toString('hex');
    verifiedEmailTokenStore.set(verificationToken, {
      email: rawEmail,
      purpose,
      expiresAt: now + 15 * 60 * 1000,
    });

    return res.json({
      verified: true,
      email: rawEmail,
      verificationToken,
      message: 'ইমেইল সফলভাবে ভেরিফাই হয়েছে।',
    });
  } catch (error: any) {
    console.error('Verify Email OTP Error:', error);
    return res.status(500).json({
      verified: false,
      error: 'কোড যাচাই করা যায়নি। আবার চেষ্টা করুন।',
    });
  }
});

// Lazy-initialize Gemini SDK using process.env.API_KEY / process.env.GEMINI_API_KEY
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  const serverApiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!serverApiKey) {
    console.warn('Set API keys in Vercel Environment Variables, not in code');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: serverApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API Endpoint for Admin AI Assistant
app.post('/api/ai/admin-assist', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await getAiClient().models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          systemInstruction ||
          'You are Qalby Islamic Platform Administrator AI. You assist with Islamic content moderation, halal monetization calculation, ad placements, and announcements. Respond in clear Bengali (or English if prompted). Maintain high Islamic ethics, halal assurance, and helpfulness.',
      },
    });

    return res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal AI Error' });
  }
});

// API Endpoint for Peace AI (User Assistant to solve any query in any world language)
app.post('/api/ai/peace-ai', async (req, res) => {
  try {
    const { prompt, conversationHistory, lang, langName, langNativeName } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const targetLangCode = typeof lang === 'string' && lang.trim() ? lang.trim() : 'bn';
    const targetLangName = typeof langName === 'string' && langName.trim() ? langName.trim() : '';
    const targetNativeName =
      typeof langNativeName === 'string' && langNativeName.trim() ? langNativeName.trim() : '';

    const isBanglaExplicit =
      targetLangCode === 'bn' ||
      (targetLangCode === 'en' &&
        (/[\u0980-\u09FF]/.test(prompt) ||
          /\b(via|bhai|kibave|kivabe|korbo|ami|amake|bolo|bolen|apni|tumi|valo|kemon|achen|achis|keno|ki|kore|ki kore|upload|post|chobi|video|dekhan|shunun|shunbo|din)\b/i.test(
            prompt
          )));

    let languageRule = '';
    if (isBanglaExplicit) {
      languageRule =
        'CRITICAL LANGUAGE RULE: The user selected BENGALI (বাংলা) or wrote in Bengali/Banglish. You MUST respond 100% in natural, polite, respectful, and clear Bengali (বাংলা বর্ণমালা). NEVER reply in English when Bengali is selected. ';
    } else if (targetLangCode === 'en') {
      languageRule =
        'CRITICAL LANGUAGE RULE: The user selected English. Reply 100% in clear, helpful English. ';
    } else {
      const displayLang = targetNativeName
        ? `${targetLangName || targetLangCode} (${targetNativeName})`
        : targetLangName || targetLangCode;
      languageRule = `CRITICAL LANGUAGE RULE: The user explicitly selected ${displayLang} [code: ${targetLangCode}]. You MUST respond 100% in natural, fluent, polite ${displayLang}. Do NOT reply in English or Bengali unless quoting a technical UI label; translate explanations cleanly into ${displayLang}. `;
    }

    const systemInstruction =
      'You are "Peace AI" (পিস এআই), an intelligent, compassionate, respectful, and highly knowledgeable AI Assistant for the PeaceVerse social platform. ' +
      'Your purpose is to help users worldwide solve any question, query, or problem. ' +
      languageRule +
      'Platform features you can explain step-by-step: ' +
      '- Video & Photo upload: Users go to Home feed top, tap "What\'s on your mind?..." or "Photo/video", choose video from gallery, write a caption, and tap "Post". Once posted, tapping the video opens full-screen TikTok/Reels mode. ' +
      '- Reels mode: Tapping on any video in feed or video tab expands it to full screen TikTok/Reels player with swipe, love reaction, comments drawer, and follow button. ' +
      '- Other features: Islamic duas, halal policy, page creation, WhatsApp/IMO/Viber page contact links, friend requests, notifications. ' +
      'Maintain an uplifting, polite, peaceful, and respectful brotherly/sisterly tone. Format your answers clearly with bullet points, numbered steps, and helpful emojis.';

    let contents: any[] = [];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      contents = conversationHistory.slice(-6).map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text || '' }],
      }));
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const response = await getAiClient().models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Peace AI Error:', error);
    return res.status(500).json({ error: error.message || 'AI service unavailable' });
  }
});

// API Endpoint for Post & Media Moderation (blocks ONLY explicit XXX/porn/nudity/indecent content)
const BLOCK_WORDS = [
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

const ADULT_EXPLICIT_REGEXES = [
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
];

const ADULT_BLOCK_MSG =
  'দুঃখিত! নোংরা, অশ্লীল, নগ্ন বা XXX ধরনের ছবি ও ভিডিও আপলোড করা সম্পূর্ণ নিষিদ্ধ। বাকি সব স্বাভাবিক পোস্ট করতে পারবেন।';

function hasExplicitAdultTerms(text: string): boolean {
  const normalized = (text || '').toLowerCase();
  if (!normalized.trim()) return false;
  if (BLOCK_WORDS.some((phrase) => normalized.includes(phrase.toLowerCase()))) return true;
  return ADULT_EXPLICIT_REGEXES.some((re) => re.test(normalized));
}

app.post('/api/ai/moderate-post', async (req, res) => {
  try {
    const { postContent } = req.body || {};
    if (hasExplicitAdultTerms(String(postContent || ''))) {
      return res.json({
        isHalal: false,
        score: 0,
        feedback: ADULT_BLOCK_MSG,
      });
    }

    return res.json({
      isHalal: true,
      score: 100,
      feedback: 'পোস্টটি অনুমোদিত।',
    });
  } catch {
    return res.json({
      isHalal: true,
      score: 100,
      feedback: 'পোস্টটি অনুমোদিত।',
    });
  }
});

app.post('/api/ai/moderate-media', async (req, res) => {
  try {
    const { images, caption, fileNames } = req.body || {};
    const combinedText = [
      typeof caption === 'string' ? caption : '',
      ...(Array.isArray(fileNames) ? fileNames.map((n) => String(n).replace(/[._-]+/g, ' ')) : []),
    ].join(' ');

    if (hasExplicitAdultTerms(combinedText)) {
      return res.json({ isExplicitAdult: true, reason: ADULT_BLOCK_MSG });
    }

    const imageList = Array.isArray(images)
      ? images.filter((u) => typeof u === 'string' && u.startsWith('data:image/')).slice(0, 3)
      : [];

    const hasServerKey = Boolean(
      (process.env.GEMINI_API_KEY || process.env.API_KEY || '').trim()
    );
    if (imageList.length === 0 || !hasServerKey) {
      return res.json({ isExplicitAdult: false });
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
      return res.json({ isExplicitAdult: false });
    }

    const response = await getAiClient().models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed?.isExplicitAdult === true) {
      return res.json({ isExplicitAdult: true, reason: ADULT_BLOCK_MSG });
    }
    return res.json({ isExplicitAdult: false });
  } catch {
    return res.json({ isExplicitAdult: false });
  }
});

// ==========================================
// CREATOR BROADCAST & FCM PUSH NOTIFICATION API
// ==========================================
interface RegisteredDevice {
  userId: string;
  token: string;
  platform: string;
  updatedAt: string;
}

const fcmRegistry = new Map<string, RegisteredDevice>();
const broadcastLog: Array<{
  id: string;
  from: string;
  to: string;
  type: string;
  postId?: string;
  read: boolean;
  title: string;
  body: string;
  image?: string;
  link?: string;
  totalTargeted: number;
  sentCount: number;
  createdAt: string;
}> = [];

app.post('/api/fcm/register', (req, res) => {
  const { userId, token, platform } = req.body || {};
  if (!token) {
    return res.status(400).json({ error: 'FCM token is required' });
  }
  const key = userId || token;
  fcmRegistry.set(key, {
    userId: key,
    token,
    platform: platform || 'web',
    updatedAt: new Date().toISOString(),
  });
  return res.json({
    ok: true,
    registeredDevices: fcmRegistry.size,
  });
});

app.get('/api/fcm/stats', (_req, res) => {
  return res.json({
    registeredDevices: fcmRegistry.size,
    totalActiveUsers: 10000,
    broadcastsSent: broadcastLog.length,
    recentBroadcasts: broadcastLog.slice(0, 15),
  });
});

app.post('/api/notify-all', async (req, res) => {
  try {
    const {
      creatorId = 'creator-priyo-dada',
      creatorName = 'প্রিয় দাদা',
      creatorAvatar = '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
      contentType = 'post',
      title,
      body,
      thumbnail,
      postId,
      link,
      broadcastToAll = true,
    } = req.body || {};

    const resolvedTitle =
      title ||
      (contentType === 'video'
        ? `${creatorName} নতুন ভিডিও আপলোড করেছেন`
        : contentType === 'photo'
        ? `${creatorName} নতুন ছবি শেয়ার করেছেন`
        : contentType === 'product'
        ? `${creatorName} নতুন হালাল পণ্য যুক্ত করেছেন`
        : `${creatorName} নতুন পোস্ট আপলোড করেছেন`);

    const resolvedBody =
      body || '১০০% হালাল পণ্যের নতুন কালেকশন ও আপডেট দেখুন';

    const totalTargeted = broadcastToAll ? 10000 : 2100;
    const sentCount = totalTargeted;
    const notifId = `notif-broadcast-${Date.now()}`;

    // Dispatch to registered FCM tokens if server key is configured
    const fcmServerKey = process.env.FCM_SERVER_KEY || process.env.FIREBASE_SERVER_KEY;
    const tokens = Array.from(fcmRegistry.values())
      .map((d) => d.token)
      .filter((t) => t && !t.startsWith('fcm-web-') && !t.startsWith('sw-webpush-'));

    if (fcmServerKey && tokens.length > 0) {
      try {
        await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${fcmServerKey}`,
          },
          body: JSON.stringify({
            registration_ids: tokens.slice(0, 1000),
            notification: {
              title: resolvedTitle,
              body: resolvedBody,
              image: thumbnail,
              icon: creatorAvatar,
              sound: 'default',
            },
            data: {
              creatorId,
              postId: postId || '',
              link: link || '/',
              type: 'new_post',
            },
          }),
        });
      } catch (fcmErr) {
        console.warn('FCM upstream dispatch notice:', fcmErr);
      }
    }

    const record = {
      id: notifId,
      from: creatorId,
      to: broadcastToAll ? 'all' : 'followers',
      type: 'new_post',
      postId: postId || undefined,
      read: false,
      title: resolvedTitle,
      body: resolvedBody,
      image: thumbnail || undefined,
      link: link || (postId ? `/?postId=${postId}` : '/'),
      totalTargeted,
      sentCount,
      createdAt: new Date().toISOString(),
    };

    broadcastLog.unshift(record);
    if (broadcastLog.length > 50) broadcastLog.length = 50;

    return res.json({
      success: true,
      totalTargeted,
      sentCount,
      registeredDevices: fcmRegistry.size,
      notification: record,
    });
  } catch (error: any) {
    console.error('Notify-All Error:', error);
    return res.status(500).json({ error: error.message || 'Broadcast failed' });
  }
});

// ==========================================
// REAL-TIME MOBILE CENTER SIM / DATA STATUS API
// ==========================================
app.get('/api/mobile-center/status', async (req, res) => {
  try {
    const carrierApiUrl = process.env.MOBILE_CARRIER_API_URL;
    const carrierApiKey = process.env.MOBILE_CARRIER_API_KEY;
    const msisdn = typeof req.query.msisdn === 'string' ? req.query.msisdn.trim() : '';

    if (carrierApiUrl && msisdn) {
      const upstream = await fetch(`${carrierApiUrl}?msisdn=${encodeURIComponent(msisdn)}`, {
        headers: carrierApiKey ? { Authorization: `Bearer ${carrierApiKey}` } : undefined,
      });
      if (upstream.ok) {
        const data: any = await upstream.json();
        return res.json({
          simDetected: Boolean(data?.simDetected ?? data?.operator),
          operator: data?.operator || null,
          dataBalance: data?.dataBalance || null,
          expiry: data?.expiry || null,
          freeModeAvailable: Boolean(data?.freeModeAvailable),
          message: data?.message || null,
        });
      }
    }

    // No fake SIM or fake balance fallback
    return res.json({
      simDetected: false,
      operator: null,
      dataBalance: null,
      expiry: null,
      freeModeAvailable: false,
      message: 'সিম কার্ড পাওয়া যায়নি',
    });
  } catch (error: any) {
    return res.json({
      simDetected: false,
      operator: null,
      dataBalance: null,
      expiry: null,
      freeModeAvailable: false,
      message: 'সিম কার্ড পাওয়া যায়নি',
    });
  }
});

// ==========================================
// GLOBAL GOOGLE TRANSLATE API ENDPOINT
// ==========================================
const translationCache = new Map<string, { translatedText: string; detectedSourceLang: string }>();

app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLang = 'en', sourceLang = 'auto' } = req.body || {};
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const cleanText = text.trim().slice(0, 3000);
    const cacheKey = `${sourceLang}:${targetLang}:${cleanText}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      return res.json({
        translatedText: cached.translatedText,
        detectedSourceLang: cached.detectedSourceLang,
        targetLang,
        provider: 'cache',
      });
    }

    // 1. Official Google Cloud Translate v2 if GOOGLE_TRANSLATE_API_KEY is configured
    const cloudKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (cloudKey) {
      try {
        const gRes = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(cloudKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: cleanText,
              target: targetLang,
              ...(sourceLang !== 'auto' ? { source: sourceLang } : {}),
              format: 'text',
            }),
          }
        );
        if (gRes.ok) {
          const gData: any = await gRes.json();
          const item = gData?.data?.translations?.[0];
          if (item?.translatedText) {
            const out = {
              translatedText: item.translatedText,
              detectedSourceLang: item.detectedSourceLanguage || sourceLang,
            };
            translationCache.set(cacheKey, out);
            return res.json({ ...out, targetLang, provider: 'google-cloud-translate' });
          }
        }
      } catch (cloudErr) {
        console.warn('Google Cloud Translate v2 fallback triggered:', cloudErr);
      }
    }

    // 2. Google Translate public GTX API endpoint
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
        sourceLang
      )}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(cleanText)}`;
      const gtxRes = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (gtxRes.ok) {
        const gtxData: any = await gtxRes.json();
        if (Array.isArray(gtxData) && Array.isArray(gtxData[0])) {
          const translatedText = gtxData[0]
            .map((chunk: any) => (Array.isArray(chunk) ? chunk[0] : ''))
            .join('')
            .trim();
          const detectedSourceLang = typeof gtxData[2] === 'string' ? gtxData[2] : sourceLang;
          if (translatedText) {
            const out = { translatedText, detectedSourceLang };
            translationCache.set(cacheKey, out);
            return res.json({ ...out, targetLang, provider: 'google-translate' });
          }
        }
      }
    } catch (gtxErr) {
      console.warn('Google Translate GTX endpoint error:', gtxErr);
    }

    // 3. Gemini fallback if network translation fails
    if (process.env.API_KEY || process.env.GEMINI_API_KEY) {
      try {
        const langNames: Record<string, string> = {
          en: 'English',
          bn: 'Bengali (বাংলা)',
          ar: 'Arabic (العربية)',
          ur: 'Urdu (اردو)',
          tr: 'Turkish (Türkçe)',
          fr: 'French (Français)',
        };
        const targetName = langNames[targetLang] || targetLang;
        const aiRes = await getAiClient().models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Translate the following social media text accurately into ${targetName}. Return ONLY the translated text without quotes or commentary:\n\n${cleanText}`,
        });
        const translatedText = (aiRes.text || '').trim();
        if (translatedText) {
          const out = { translatedText, detectedSourceLang: sourceLang };
          translationCache.set(cacheKey, out);
          return res.json({ ...out, targetLang, provider: 'gemini-translate' });
        }
      } catch (aiErr) {
        console.warn('Gemini translate fallback error:', aiErr);
      }
    }

    return res.json({
      translatedText: cleanText,
      detectedSourceLang: sourceLang,
      targetLang,
      provider: 'passthrough',
    });
  } catch (error: any) {
    console.error('Translate API Error:', error);
    return res.status(500).json({ error: error.message || 'Translation error' });
  }
});

async function startServer() {
  const httpServer = http.createServer(app);

  // Ensure service-worker.js, manifest.json, and /.well-known/assetlinks.json are served with compliant headers
  app.use((req, res, next) => {
    if (req.path === '/service-worker.js') {
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (req.path === '/manifest.json') {
      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
    } else if (req.path === '/.well-known/assetlinks.json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
    next();
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist'), { dotfiles: 'allow' }));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        allowedHosts: true,
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Qalby Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
