import crypto from 'crypto';

function getSigningSecret(): string {
  return (
    process.env.OTP_SIGNING_SECRET?.trim() ||
    process.env.RESEND_API_KEY?.trim() ||
    process.env.SMTP_PASS?.trim() ||
    process.env.EMAILJS_PRIVATE_KEY?.trim() ||
    'peaceverse-otp-secret'
  );
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ verified: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    const purpose = body.purpose === '2fa' ? '2fa' : 'signup';
    const challengeToken = typeof body.challengeToken === 'string' ? body.challengeToken.trim() : '';

    if (!rawEmail || !/^\d{6}$/.test(code) || !challengeToken.includes('.')) {
      return res.status(400).json({
        verified: false,
        error: 'আপনার ইমেইলে পাঠানো সঠিক ৬ ডিজিটের কোডটি লিখুন।',
      });
    }

    const [payloadB64, sigB64] = challengeToken.split('.');
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!parsed || parsed.email !== rawEmail || parsed.purpose !== purpose || typeof parsed.exp !== 'number') {
      return res.status(400).json({
        verified: false,
        error: 'কোডটি সঠিক নয়। অনুগ্রহ করে আবার চেষ্টা করুন।',
      });
    }

    if (Date.now() > parsed.exp) {
      return res.status(400).json({
        verified: false,
        error: 'কোডটির মেয়াদ শেষ হয়ে গেছে। দয়া করে নতুন কোড পাঠান।',
      });
    }

    const expectedSig = crypto
      .createHmac('sha256', getSigningSecret())
      .update(`${payloadB64}:${code}`)
      .digest('base64url');

    const valid =
      sigB64.length === expectedSig.length &&
      crypto.timingSafeEqual(Buffer.from(sigB64), Buffer.from(expectedSig));

    if (!valid) {
      return res.status(400).json({
        verified: false,
        error: 'ভুল কোড! আপনার ইমেইলে পাঠানো ৬ ডিজিটের কোডটি সঠিকভাবে লিখুন।',
      });
    }

    const verificationToken = crypto.randomBytes(24).toString('hex');
    return res.status(200).json({
      verified: true,
      email: rawEmail,
      verificationToken,
      message: 'ইমেইল সফলভাবে ভেরিফাই হয়েছে।',
    });
  } catch {
    return res.status(500).json({
      verified: false,
      error: 'কোড যাচাই করা যায়নি। আবার চেষ্টা করুন।',
    });
  }
}
