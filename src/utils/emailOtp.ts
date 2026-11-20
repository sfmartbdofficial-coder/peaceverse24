export interface SendEmailOtpResponse {
  success: boolean;
  email: string;
  provider?: string;
  challengeToken?: string;
  expiresInSeconds?: number;
  resendCooldownSeconds?: number;
  message?: string;
}

export interface VerifyEmailOtpResponse {
  verified: boolean;
  email: string;
  verificationToken: string;
  message?: string;
}

const challengeTokenStore = new Map<string, string>();

function makeChallengeKey(email: string, purpose: 'signup' | '2fa'): string {
  return `${purpose}:${email.trim().toLowerCase()}`;
}

export async function requestEmailOtp(params: {
  email: string;
  fullName?: string;
  purpose?: 'signup' | '2fa';
  allowExisting?: boolean;
}): Promise<SendEmailOtpResponse> {
  const purpose = params.purpose || 'signup';
  const normalizedEmail = params.email.trim().toLowerCase();

  let res: Response;
  try {
    res = await fetch('/api/auth/send-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        fullName: params.fullName?.trim() || '',
        purpose,
        allowExisting: params.allowExisting === true,
      }),
    });
  } catch (networkErr: any) {
    throw new Error(
      `সার্ভারের সাথে সংযোগ করা যায়নি (${networkErr?.message || 'Network error'})। ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।`
    );
  }

  const rawText = await res.text().catch(() => '');
  let data: any = {};
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    data = {};
  }

  if (!res.ok || !data?.success) {
    if (res.status === 404 || res.status === 405) {
      throw new Error(
        `OTP API এন্ডপয়েন্ট পাওয়া যায়নি (HTTP ${res.status})। হোস্টিং সার্ভারে /api/auth/send-email-otp চালু আছে কিনা চেক করুন।`
      );
    }
    throw new Error(
      data?.error ||
        `আপনার ইমেইলে ভেরিফিকেশন কোড পাঠানো যায়নি (HTTP ${res.status})। কিছুক্ষণ পর আবার চেষ্টা করুন।`
    );
  }

  if (typeof data.challengeToken === 'string' && data.challengeToken) {
    challengeTokenStore.set(makeChallengeKey(normalizedEmail, purpose), data.challengeToken);
  }

  return data as SendEmailOtpResponse;
}

export async function verifyEmailOtp(params: {
  email: string;
  code: string;
  purpose?: 'signup' | '2fa';
}): Promise<VerifyEmailOtpResponse> {
  const purpose = params.purpose || 'signup';
  const normalizedEmail = params.email.trim().toLowerCase();
  const challengeToken = challengeTokenStore.get(makeChallengeKey(normalizedEmail, purpose)) || '';

  let res: Response;
  try {
    res = await fetch('/api/auth/verify-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        code: params.code.trim(),
        purpose,
        challengeToken,
      }),
    });
  } catch (networkErr: any) {
    throw new Error(
      `সার্ভারের সাথে সংযোগ করা যায়নি (${networkErr?.message || 'Network error'})।`
    );
  }

  const rawText = await res.text().catch(() => '');
  let data: any = {};
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    data = {};
  }

  if (!res.ok || !data?.verified || !data?.verificationToken) {
    throw new Error(
      data?.error ||
        `ভুল কোড অথবা যাচাই করা যায়নি (HTTP ${res.status})। আপনার ইমেইলে পাঠানো ৬ ডিজিটের কোডটি সঠিকভাবে লিখুন।`
    );
  }

  challengeTokenStore.delete(makeChallengeKey(normalizedEmail, purpose));
  return data as VerifyEmailOtpResponse;
}
