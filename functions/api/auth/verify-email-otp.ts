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

export async function onRequestPost(context: {
  request: Request;
  env: Record<string, string | undefined>;
}): Promise<Response> {
  const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8' };

  try {
    const body: any = await context.request.json().catch(() => ({}));
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
        { status: 400, headers: jsonHeaders }
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
        { status: 400, headers: jsonHeaders }
      );
    }

    if (Date.now() > parsed.exp) {
      return new Response(
        JSON.stringify({
          verified: false,
          error: 'কোডটির মেয়াদ শেষ হয়ে গেছে। দয়া করে নতুন কোড পাঠান।',
        }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const secret =
      context.env?.OTP_SIGNING_SECRET?.trim() ||
      context.env?.RESEND_API_KEY?.trim() ||
      'peaceverse-otp-secret';
    const expectedSig = await signChallenge(secret, `${payloadB64}:${code}`);

    if (!constantTimeEqual(sigB64, expectedSig)) {
      return new Response(
        JSON.stringify({
          verified: false,
          error: 'ভুল কোড! আপনার ইমেইলে পাঠানো ৬ ডিজিটের কোডটি সঠিকভাবে লিখুন।',
        }),
        { status: 400, headers: jsonHeaders }
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
      { status: 200, headers: jsonHeaders }
    );
  } catch {
    return new Response(
      JSON.stringify({
        verified: false,
        error: 'কোড যাচাই করা যায়নি। আবার চেষ্টা করুন।',
      }),
      { status: 500, headers: jsonHeaders }
    );
  }
}
