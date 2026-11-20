export interface SendEmailOtpResponse {
  success: boolean;
  email: string;
  provider?: string;
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

export async function requestEmailOtp(params: {
  email: string;
  fullName?: string;
  purpose?: 'signup' | '2fa';
}): Promise<SendEmailOtpResponse> {
  const res = await fetch('/api/auth/send-email-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email.trim(),
      fullName: params.fullName?.trim() || '',
      purpose: params.purpose || 'signup',
    }),
  });

  const data: any = await res.json().catch(() => ({}));
  if (!res.ok || !data?.success) {
    throw new Error(
      data?.error ||
        'আপনার ইমেইলে ভেরিফিকেশন কোড পাঠানো যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।'
    );
  }

  return data as SendEmailOtpResponse;
}

export async function verifyEmailOtp(params: {
  email: string;
  code: string;
  purpose?: 'signup' | '2fa';
}): Promise<VerifyEmailOtpResponse> {
  const res = await fetch('/api/auth/verify-email-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email.trim(),
      code: params.code.trim(),
      purpose: params.purpose || 'signup',
    }),
  });

  const data: any = await res.json().catch(() => ({}));
  if (!res.ok || !data?.verified || !data?.verificationToken) {
    throw new Error(
      data?.error ||
        'ভুল কোড! আপনার ইমেইলে পাঠানো ৬ ডিজিটের কোডটি সঠিকভাবে লিখুন।'
    );
  }

  return data as VerifyEmailOtpResponse;
}
