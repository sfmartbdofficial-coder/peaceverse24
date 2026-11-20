import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, ShieldCheck, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, logoutUser } from '../../lib/firebase';
import { TurnstileCaptchaPlaceholder } from './TurnstileCaptchaPlaceholder';
import { StepByStepSignUpForm, StepSignUpPayload } from './StepByStepSignUpForm';
import { sanitizeInput } from '../../utils/security';
import { requestEmailOtp, verifyEmailOtp } from '../../utils/emailOtp';

interface FirebaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

export const FirebaseAuthModal: React.FC<FirebaseAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [pendingSignUpData, setPendingSignUpData] = useState<StepSignUpPayload | null>(null);
  const [otpInputCode, setOtpInputCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [turnstileVerified, setTurnstileVerified] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const normalizeIdentifierToEmail = (input: string) => {
    const trimmed = input.trim();
    if (trimmed.includes('@')) return trimmed;
    const digits = trimmed.replace(/[^0-9+]/g, '');
    if (digits.length >= 6) {
      return `${digits.replace(/\+/g, '')}@phone.peaceverse.app`;
    }
    return trimmed;
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        setSuccessMsg(`স্বাগতম, ${user.displayName || 'সম্মানিত ভাই/বোন'}!`);
        setTimeout(() => {
          onSuccess?.(user);
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'গুগল সাইন-ইন সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleWizardRegister = async (payload: StepSignUpPayload) => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const cleanDisplayName = sanitizeInput(`${payload.firstName} ${payload.lastName}`);
      const otpRes = await requestEmailOtp({
        email: payload.contact,
        fullName: cleanDisplayName,
        purpose: 'signup',
        allowExisting: true,
      });
      setPendingSignUpData(payload);
      setOtpInputCode('');
      setResendCooldown(otpRes.resendCooldownSeconds || 45);
    } catch (err: any) {
      setErrorMsg(err?.message || 'ইমেইলে ৬ ডিজিটের কোড পাঠানো যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleResendModalOtp = async () => {
    if (!pendingSignUpData || resendCooldown > 0 || loading) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const cleanDisplayName = sanitizeInput(`${pendingSignUpData.firstName} ${pendingSignUpData.lastName}`);
      const otpRes = await requestEmailOtp({
        email: pendingSignUpData.contact,
        fullName: cleanDisplayName,
        purpose: 'signup',
      });
      setResendCooldown(otpRes.resendCooldownSeconds || 45);
    } catch (err: any) {
      setErrorMsg(err?.message || 'আবার কোড পাঠানো যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyModalOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!pendingSignUpData) return;

    const cleanCode = otpInputCode.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      setErrorMsg('আপনার ইমেইলে পাঠানো সঠিক ৬ ডিজিটের কোডটি লিখুন।');
      return;
    }

    setLoading(true);
    try {
      const verifiedRes = await verifyEmailOtp({
        email: pendingSignUpData.contact,
        code: cleanCode,
        purpose: 'signup',
      });

      const cleanDisplayName = sanitizeInput(`${pendingSignUpData.firstName} ${pendingSignUpData.lastName}`);
      const resolvedEmail = pendingSignUpData.contact.trim().toLowerCase();
      try {
        localStorage.setItem(
          'peaceverse_signup_meta',
          JSON.stringify({
            name: cleanDisplayName,
            birthDate: `${pendingSignUpData.dobDay} ${pendingSignUpData.dobMonth} ${pendingSignUpData.dobYear}`,
            gender: pendingSignUpData.gender,
            contact: resolvedEmail,
            verifiedChannel: 'email',
          })
        );
        localStorage.setItem('peaceverse_registered_name', cleanDisplayName);
      } catch {}

      const user = await registerWithEmail(
        resolvedEmail,
        pendingSignUpData.password,
        cleanDisplayName,
        verifiedRes.verificationToken
      );
      if (user) {
        setSuccessMsg('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে এবং ইমেইল ভেরিফিকেশন সম্পন্ন হয়েছে!');
        setTimeout(() => {
          setPendingSignUpData(null);
          setOtpInputCode('');
          setWizardStep(1);
          onSuccess?.(user);
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      let msg = err?.message || 'একটি ত্রুটি ঘটেছে।';
      const code = err?.code || '';
      if (code === 'auth/invalid-email' || msg.includes('auth/invalid-email')) {
        msg = 'ইমেইল ঠিকানাটি সঠিক নয়।';
      } else if (code === 'auth/email-already-in-use' || msg.includes('auth/email-already-in-use')) {
        msg = 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (tab === 'login' && !turnstileVerified) {
      setErrorMsg('অনুগ্রহ করে Turnstile মানব যাচাইকরণ সম্পূর্ণ করুন।');
      return;
    }
    setLoading(true);

    try {
      if (tab === 'login') {
        try {
          await logoutUser();
        } catch {}

        const user = await loginWithEmail(email.trim(), password);
        if (user) {
          setSuccessMsg('সফলভাবে লগইন হয়েছে!');
          setTimeout(() => {
            onSuccess?.(user);
            onClose();
          }, 1000);
        }
      } else if (tab === 'forgot') {
        await resetPassword(email.trim());
        setSuccessMsg('পাসওয়ার্ড রিসেটের লিংক আপনার ইমেইলে পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স চেক করুন।');
      }
    } catch (err: any) {
      let msg = err?.message || 'একটি ত্রুটি ঘটেছে।';
      const code = err?.code || '';
      if (
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential' ||
        msg.includes('auth/invalid-credential') ||
        msg.includes('auth/wrong-password')
      ) {
        msg = 'ভুল পাসওয়ার্ড অথবা ভুল ইমেইল! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।';
      } else if (code === 'auth/user-not-found' || msg.includes('auth/user-not-found')) {
        msg = 'এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।';
      } else if (code === 'auth/too-many-requests' || msg.includes('auth/too-many-requests')) {
        msg = 'অনেকবার ভুল চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
      } else if (code === 'auth/invalid-email' || msg.includes('auth/invalid-email')) {
        msg = 'ইমেইল অ্যাড্রেসটি সঠিক নয়।';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white border border-[#E4E6EB] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-black flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E4E6EB] bg-white relative">
          <button
            onClick={() => {
              setTab('login');
              setWizardStep(1);
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0866FF] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-black">
                {tab === 'login' ? 'Peaceverse24.com-এ লগইন করুন' : tab === 'register' ? 'Sign Up — নতুন অ্যাকাউন্ট খুলুন' : 'পাসওয়ার্ড পুনরুদ্ধার'}
              </h2>
              <p className="text-xs text-[#65676B]">
                {tab === 'register' ? 'ধাপে ধাপে আপনার তথ্য দিন' : '১০০% সুরক্ষিত ফায়ারবেস অথেনটিকেশন'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 bg-white">
          
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Google Sign-In (Login Only) */}
          {tab === 'login' && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] text-black hover:bg-[#E4E6EB] font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google একাউন্ট দিয়ে এক ক্লিকে প্রবেশ করুন</span>
              </button>

              <div className="flex items-center gap-3 my-2 text-[11px] text-[#65676B]">
                <div className="flex-1 h-[1px] bg-[#E4E6EB]" />
                <span>অথবা ইমেইল ব্যবহার করুন</span>
                <div className="flex-1 h-[1px] bg-[#E4E6EB]" />
              </div>
            </>
          )}

          {tab === 'register' ? (
            pendingSignUpData ? (
              <form onSubmit={handleVerifyModalOtpAndRegister} className="space-y-3">
                <div className="p-3 rounded-xl bg-[#E7F3FF] border border-blue-200 space-y-2">
                  <p className="text-xs font-bold text-[#0866FF]">Email Code Verification</p>
                  <p className="text-[11px] text-[#4B4F56]">
                    আপনার <strong>{pendingSignUpData.contact}</strong> ইমেইলে ৬ ডিজিটের ভেরিফিকেশন কোড পাঠানো হয়েছে। ইনবক্স বা Spam ফোল্ডার চেক করে কোডটি লিখুন।
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    value={otpInputCode}
                    onChange={(e) => {
                      setOtpInputCode(e.target.value.replace(/\D/g, ''));
                      setErrorMsg('');
                    }}
                    placeholder="Enter 6-digit Email OTP"
                    className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-center font-mono tracking-widest text-sm text-black outline-none focus:border-[#0866FF]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#65676B]">কোড পাননি?</span>
                  <button
                    type="button"
                    onClick={handleResendModalOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="font-bold text-[#0866FF] hover:underline disabled:text-[#8D949E] cursor-pointer"
                  >
                    {resendCooldown > 0 ? `আবার পাঠান (${resendCooldown}s)` : 'আবার কোড পাঠান'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingSignUpData(null);
                      setOtpInputCode('');
                      setErrorMsg('');
                    }}
                    disabled={loading}
                    className="px-4 py-2.5 bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#1C1E21] font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-[#00A400] hover:bg-[#008C00] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>যাচাই করা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify &amp; Create Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <StepByStepSignUpForm
                step={wizardStep}
                onStepChange={setWizardStep}
                onComplete={handleWizardRegister}
                loading={loading}
                compact
              />
            )
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-black mb-1 block">ইমেইল ঠিকানা</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-[#65676B] absolute left-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl pl-9 pr-3 py-2 text-xs text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF]"
                  />
                </div>
              </div>

              {tab === 'login' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-black">পাসওয়ার্ড</label>
                    <button
                      type="button"
                      onClick={() => { setTab('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-[10px] text-[#0866FF] hover:underline font-semibold cursor-pointer"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#65676B] absolute left-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl pl-9 pr-9 py-2 text-xs text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 p-1 text-[#65676B] hover:text-black transition-colors cursor-pointer"
                      title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {tab === 'login' && (
                <TurnstileCaptchaPlaceholder
                  verified={turnstileVerified}
                  onVerifyChange={(v) => setTurnstileVerified(v)}
                />
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#166fe5] active:scale-[0.99] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>অনুগ্রহ করে অপেক্ষা করুন...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {tab === 'login' ? 'লগইন করুন' : 'রিসেট লিংক পাঠান'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom Switcher */}
          <div className="pt-3 border-t border-[#E4E6EB] text-center text-xs text-[#65676B]">
            {tab === 'login' ? (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setSuccessMsg('');
                  setPendingSignUpData(null);
                  setOtpInputCode('');
                  setWizardStep(1);
                  setTab('register');
                }}
                className="px-5 py-2 bg-[#42B72A] hover:bg-[#36A420] text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Create new account
              </button>
            ) : tab === 'register' ? (
              <p>
                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setTab('login');
                  }}
                  className="text-[#0866FF] font-bold hover:underline cursor-pointer"
                >
                  লগইন করুন
                </button>
              </p>
            ) : (
              <p>
                পাসওয়ার্ড মনে পড়েছে?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setTab('login');
                  }}
                  className="text-[#0866FF] font-bold hover:underline cursor-pointer"
                >
                  লগইনে ফিরে যান
                </button>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
