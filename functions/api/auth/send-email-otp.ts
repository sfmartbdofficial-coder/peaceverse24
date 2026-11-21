function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
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

export async function onRequestPost(context: {
  request: Request;
  env: Record<string, string | undefined>;
}): Promise<Response> {
  const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8' };

  try {
    const body: any = await context.request.json().catch(() => ({}));
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
        { status: 400, headers: jsonHeaders }
      );
    }

    const resendKey = context.env?.RESEND_API_KEY?.trim();
    if (!resendKey || resendKey === 're_YOUR_RESEND_API_KEY') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ইমেইল সার্ভিস কনফিগার করা হয়নি। Cloudflare Pages Environment Variables-এ RESEND_API_KEY সেট করুন।',
        }),
        { status: 503, headers: jsonHeaders }
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
      context.env?.RESEND_FROM_EMAIL?.trim() || 'PeaceVerse24 <noreply@peaceverse24.com>';

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
        { status: 502, headers: jsonHeaders }
      );
    }

    const expiresAt = Date.now() + 10 * 60 * 1000;
    const payloadJson = JSON.stringify({ email: rawEmail, purpose, exp: expiresAt });
    const payloadB64 = toBase64Url(new TextEncoder().encode(payloadJson));
    const secret = context.env?.OTP_SIGNING_SECRET?.trim() || resendKey;
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
      { status: 200, headers: jsonHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'ইমেইলে ভেরিফিকেশন কোড পাঠানো যায়নি।',
      }),
      { status: 500, headers: jsonHeaders }
    );
  }
}
