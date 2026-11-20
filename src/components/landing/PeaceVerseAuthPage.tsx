import React, { useState, useMemo, useEffect } from 'react';
import {
  Mail,
  Lock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
  LogOut,
} from 'lucide-react';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  resetPassword,
  logoutUser,
  activeFirebaseProjectId,
} from '../../lib/firebase';
import { PeaceDoveEmblem } from './PeaceDoveEmblem';
import { maskEmailAddress } from '../../utils/privacyMask';
import { loadPeaceSettings } from '../../utils/settingsStorage';
import { TurnstileCaptchaPlaceholder } from '../auth/TurnstileCaptchaPlaceholder';
import { StepByStepSignUpForm, StepSignUpPayload } from '../auth/StepByStepSignUpForm';
import { sanitizeInput } from '../../utils/security';

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'yopmail.com',
  'fake.com',
  'fakeemail.com',
  'dispostable.com',
  'trashmail.com',
  'guerrillamail.com',
  'generator.email',
  'sharklasers.com',
  'getairmail.com',
  'throwawaymail.com',
]);

const COMMON_TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
};

function validateEmail(rawEmail: string): { isValid: boolean; message: string | null } {
  const val = rawEmail.trim();
  if (!val) return { isValid: true, message: null };

  if (!val.includes('@')) {
    return { isValid: false, message: 'আপনার ইমেইলটি সঠিক নয় (@ চিহ্ন নেই)' };
  }

  const parts = val.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { isValid: false, message: 'আপনার ইমেইলটি সঠিক নয়' };
  }

  const [username, domain] = parts;
  const domainLower = domain.toLowerCase();

  if (username.length < 2) {
    return { isValid: false, message: 'আপনার ইমেইলটি সঠিক নয় (ইউজারনেম খুব ছোট)' };
  }

  if (!domain.includes('.')) {
    return { isValid: false, message: 'আপনার ইমেইলটি সঠিক নয় (ডোমেইন অসম্পূর্ণ)' };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) {
    return { isValid: false, message: 'আপনার ইমেইলটি সঠিক নয় (ভুল ডোমেইন এক্সটেনশন)' };
  }

  if (DISPOSABLE_EMAIL_DOMAINS.has(domainLower)) {
    return { isValid: false, message: 'আপনার ইমেইলটি সঠিক নয় (অস্থায়ী বা ভুয়া ইমেইল গ্রহণযোগ্য নয়)' };
  }

  if (COMMON_TYPOS[domainLower]) {
    return { isValid: false, message: `আপনার ইমেইলটি সঠিক নয় (আপনি কি @${COMMON_TYPOS[domainLower]} বোঝাতে চেয়েছেন?)` };
  }

  // Standard email format
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(val)) {
    return { isValid: false, message: 'আপনার ইমেইলটি সঠিক নয়' };
  }

  return { isValid: true, message: null };
}

interface PeaceVerseAuthPageProps {
  initialMode?: 'login' | 'signup' | 'forgot';
  currentUser?: any;
  onNavigateHome: () => void;
  onNavigateTo: (path: string) => void;
  onLogout?: () => void;
}

export const PeaceVerseAuthPage: React.FC<PeaceVerseAuthPageProps> = ({
  initialMode = 'login',
  currentUser,
  onNavigateHome,
  onNavigateTo,
  onLogout,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [pendingSignUpData, setPendingSignUpData] = useState<StepSignUpPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpChallenge, setOtpChallenge] = useState<{
    purpose: 'signup' | '2fa';
    expectedCode: string;
    inputCode: string;
  } | null>(null);
  const [turnstileVerified, setTurnstileVerified] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
    setSuccessMsg('');
    setOtpChallenge(null);
    setWizardStep(1);
    setPendingSignUpData(null);
  }, [initialMode]);

  const normalizeIdentifierToEmail = (input: string) => {
    const trimmed = input.trim();
    if (trimmed.includes('@')) return trimmed;
    const digits = trimmed.replace(/[^0-9+]/g, '');
    if (digits.length >= 6) {
      return `${digits.replace(/\+/g, '')}@phone.peaceverse.app`;
    }
    return trimmed;
  };

  const emailValidation = useMemo(() => validateEmail(email), [email]);
  const showEmailError = emailTouched && email.trim().length > 0 && !emailValidation.isValid;

  const mapFirebaseAuthError = (err: any): string => {
    let msg = err?.message || 'লগইন করার সময় একটি সমস্যা হয়েছে।';
    const code = err?.code || '';
    if (
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential' ||
      msg.includes('auth/invalid-credential') ||
      msg.includes('auth/wrong-password')
    ) {
      msg = 'ভুল পাসওয়ার্ড অথবা ভুল ইমেইল! অনুগ্রহ করে আপনার সঠিক পাসওয়ার্ডটি দিন।';
    } else if (code === 'auth/user-not-found' || msg.includes('auth/user-not-found')) {
      msg = 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সাইন-আপ করুন।';
    } else if (code === 'auth/too-many-requests' || msg.includes('auth/too-many-requests')) {
      msg = 'অনেকবার ভুল পাসওয়ার্ড দেওয়া হয়েছে। সাময়িকভাবে অ্যাকাউন্ট লক করা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন।';
    } else if (code === 'auth/invalid-email' || msg.includes('auth/invalid-email')) {
      msg = 'আপনার ইমেইল অ্যাড্রেসটি সঠিক নয়।';
    } else if (code === 'auth/email-already-in-use' || msg.includes('auth/email-already-in-use')) {
      msg = 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে। অনুগ্রহ করে লগইন করুন।';
    } else if (msg.includes('auth/operation-not-allowed')) {
      msg = `Firebase Email/Password সাইন-ইন চালু নেই। Firebase Console-এ গিয়ে Email/Password এনাবল করুন।`;
    }
    return msg;
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        setSuccessMsg(`Welcome, ${user.displayName || 'friend'}!`);
        setTimeout(() => {
          onNavigateHome();
        }, 800);
      }
    } catch (err: any) {
      let msg = err?.message || 'Google Sign-In could not be completed. Please try again.';
      if (msg.includes('auth/operation-not-allowed')) {
        msg = `Google Sign-In এই প্রজেক্টে (${activeFirebaseProjectId || 'Unknown'}) চালু নেই। Firebase Console > Authentication > Sign-in method-এ গিয়ে Google এনাবল করুন।`;
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStepSignUpComplete = (payload: StepSignUpPayload) => {
    setErrorMsg('');
    setSuccessMsg('');
    setPendingSignUpData(payload);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtpChallenge({ purpose: 'signup', expectedCode: code, inputCode: '' });
  };

  const handleCompleteSignUpOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!pendingSignUpData || !otpChallenge) return;

    if (otpChallenge.inputCode.trim() !== otpChallenge.expectedCode) {
      setErrorMsg(`Invalid OTP code. Enter ${otpChallenge.expectedCode}.`);
      return;
    }

    setLoading(true);
    try {
      const cleanName = sanitizeInput(`${pendingSignUpData.firstName} ${pendingSignUpData.lastName}`);
      const resolvedEmail = normalizeIdentifierToEmail(pendingSignUpData.contact);
      try {
        localStorage.setItem(
          'peaceverse_signup_meta',
          JSON.stringify({
            name: cleanName,
            birthDate: `${pendingSignUpData.dobDay} ${pendingSignUpData.dobMonth} ${pendingSignUpData.dobYear}`,
            gender: pendingSignUpData.gender,
            contact: pendingSignUpData.contact,
            verifiedChannel: pendingSignUpData.contact.includes('@') ? 'email' : 'sms',
          })
        );
        localStorage.setItem('peaceverse_registered_name', cleanName);
      } catch {}

      const user = await registerWithEmail(resolvedEmail, pendingSignUpData.password, cleanName);
      if (user) {
        setOtpChallenge(null);
        setPendingSignUpData(null);
        setWizardStep(1);
        setSuccessMsg('Account created successfully. Opening Home...');
        setTimeout(() => {
          onNavigateHome();
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    setEmailTouched(true);
    if (!emailValidation.isValid) {
      setErrorMsg(emailValidation.message || 'আপনার ইমেইলটি সঠিক নয়');
      return;
    }
    if (mode === 'login' && !turnstileVerified) {
      setErrorMsg('Please verify the Cloudflare Turnstile human check first.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        if (!otpChallenge) {
          try {
            await logoutUser();
          } catch {}

          const user = await loginWithEmail(email.trim(), password);
          if (user) {
            if (loadPeaceSettings().twoFactorEnabled) {
              const code = String(Math.floor(100000 + Math.random() * 900000));
              setOtpChallenge({ purpose: '2fa', expectedCode: code, inputCode: '' });
              setLoading(false);
              return;
            }
            setSuccessMsg('Signed in successfully. Opening Home...');
            setTimeout(() => {
              onNavigateHome();
            }, 600);
          }
        } else {
          if (otpChallenge.inputCode.trim() !== otpChallenge.expectedCode) {
            setErrorMsg(`Invalid 2FA code. Enter ${otpChallenge.expectedCode}.`);
            setLoading(false);
            return;
          }
          setOtpChallenge(null);
          setSuccessMsg('2FA verified! Opening Home...');
          setTimeout(() => {
            onNavigateHome();
          }, 500);
        }
      } else if (mode === 'forgot') {
        await resetPassword(email.trim());
        setSuccessMsg('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে! অনুগ্রহ করে ইনবক্স চেক করুন।');
      }
    } catch (err: any) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between py-6 px-4 sm:px-6 relative overflow-hidden">
      {/* Top Bar with Back to Landing Page */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between z-10">
        <button
          onClick={() => onNavigateTo('/')}
          className="flex items-center gap-1.5 text-xs font-semibold text-black bg-[#F0F2F5] hover:bg-[#E4E6EB] px-3.5 py-1.5 rounded-full border border-[#E4E6EB] transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Stylized Logo mark */}
          <div className="w-7 h-7 rounded-lg bg-[#0866FF] flex items-center justify-center p-1 shadow-xs">
            <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" />
            </svg>
          </div>
          <span className="font-extrabold text-base tracking-tight text-[#0866FF]">
            Peaceverse24.com
          </span>
        </div>
      </header>

      {/* Main Auth Card Container */}
      <main className="w-full max-w-md mx-auto my-auto z-10 pt-4 pb-6">
        <div className="relative rounded-3xl p-6 sm:p-8 bg-white border border-[#E4E6EB] shadow-lg">
          
          {/* Top Dove Icon Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <PeaceDoveEmblem size={88} className="mb-3" />
            <span className="text-[10px] tracking-wider uppercase font-bold text-[#0866FF] bg-[#E7F3FF] border border-blue-200 px-3 py-0.5 rounded-full mb-2">
              Positive Global Community
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
              {mode === 'login' && 'Sign in to Peaceverse24.com'}
              {mode === 'signup' && 'Create a new account'}
              {mode === 'forgot' && 'Reset Your Password'}
            </h1>
            <p className="text-xs text-[#65676B] mt-1 max-w-xs">
              {mode === 'login' && 'Welcome back! Connect with your peaceful community worldwide.'}
              {mode === 'signup' && 'ধাপে ধাপে আপনার নতুন Peaceverse24 অ্যাকাউন্ট তৈরি করুন।'}
              {mode === 'forgot' && 'Enter your registered email to receive recovery instructions.'}
            </p>
          </div>

          {/* Active Logged-In User Banner (if opened while already signed in) */}
          {currentUser && (
            <div className="mb-5 p-3 rounded-2xl bg-[#E7F3FF] border border-blue-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-[#0866FF] tracking-wider block">বর্তমানে সাইন-ইন আছেন:</span>
                <p className="font-bold text-black truncate text-xs">
                  {currentUser.displayName || maskEmailAddress(currentUser.email, true)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="px-3 py-1.5 rounded-xl bg-[#0866FF] hover:bg-blue-600 text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer"
                >
                  হোমে যান
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (onLogout) {
                      await onLogout();
                    } else {
                      await logoutUser();
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                  title="অন্য আইডি দিয়ে লগইন করতে লগআউট করুন"
                >
                  <LogOut className="w-3 h-3" />
                  <span>লগআউট</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1-Click Google Sign-In (Login Page Only) */}
          {mode === 'login' && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#E4E6EB] text-black hover:bg-[#F0F2F5] font-bold text-xs flex items-center justify-center gap-2.5 shadow-xs active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.7-.06-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
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
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-4 text-[11px] text-[#65676B]">
                <div className="flex-1 h-[1px] bg-[#E4E6EB]" />
                <span>or use email</span>
                <div className="flex-1 h-[1px] bg-[#E4E6EB]" />
              </div>
            </div>
          )}

          {/* SEPARATE SIGN UP PAGE: 5-STEP WIZARD */}
          {mode === 'signup' ? (
            <div className="space-y-4">
              <div className={otpChallenge?.purpose === 'signup' ? 'hidden' : 'block'}>
                <StepByStepSignUpForm
                  step={wizardStep}
                  onStepChange={setWizardStep}
                  onComplete={handleStepSignUpComplete}
                  loading={loading}
                  externalError={errorMsg || null}
                  onClearExternalError={() => setErrorMsg('')}
                />
              </div>

              {otpChallenge?.purpose === 'signup' && (
                <form onSubmit={handleCompleteSignUpOtp} className="space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <p className="text-xs font-bold text-emerald-800">
                      OTP Verification Required ({pendingSignUpData?.contact}) — Code:{' '}
                      <span className="font-mono font-black bg-white px-1.5 py-0.5 rounded border border-emerald-300">
                        {otpChallenge.expectedCode}
                      </span>
                    </p>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpChallenge.inputCode}
                      onChange={(e) =>
                        setOtpChallenge((prev) =>
                          prev ? { ...prev, inputCode: e.target.value.replace(/\D/g, '') } : prev
                        )
                      }
                      placeholder="Enter 6-digit verification code"
                      className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-center font-mono tracking-widest text-sm text-black outline-none focus:border-[#0866FF]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpChallenge(null);
                        setErrorMsg('');
                      }}
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
                          <span>Creating Account...</span>
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
              )}

              <div className="mt-5 pt-4 border-t border-[#E4E6EB] text-center text-xs text-[#65676B]">
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setOtpChallenge(null);
                      setMode('login');
                      onNavigateTo('/login');
                    }}
                    className="text-[#0866FF] font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* SEPARATE LOGIN / FORGOT FORM */
            <>
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-black mb-1 block">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-[#65676B] absolute left-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (!emailTouched) setEmailTouched(true);
                      }}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="name@example.com"
                      className={`w-full bg-[#F0F2F5] border rounded-xl pl-10 pr-3 py-2.5 text-xs text-black placeholder-[#65676B] focus:outline-none transition-colors ${
                        showEmailError
                          ? 'border-rose-500 focus:border-rose-600 bg-rose-50'
                          : 'border-[#E4E6EB] focus:border-[#0866FF]'
                      }`}
                    />
                  </div>

                  {showEmailError && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                      <span className="font-semibold">{emailValidation.message || 'আপনার ইমেইলটি সঠিক নয়'}</span>
                    </div>
                  )}
                  {emailTouched && email.trim().length > 0 && emailValidation.isValid && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-700 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      <span>ইমেইলটি সঠিক ও সক্রিয় ✓</span>
                    </div>
                  )}
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-black">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg('');
                          setMode('forgot');
                        }}
                        className="text-[10px] text-[#0866FF] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-[#65676B] absolute left-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                        className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl pl-10 pr-10 py-2.5 text-xs text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 p-1 text-[#65676B] hover:text-black transition-colors cursor-pointer"
                        title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {otpChallenge && otpChallenge.purpose === '2fa' && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <p className="text-xs font-bold text-emerald-800">
                      2FA Verification Required — Code:{' '}
                      <span className="font-mono font-black bg-white px-1.5 py-0.5 rounded border border-emerald-300">
                        {otpChallenge.expectedCode}
                      </span>
                    </p>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpChallenge.inputCode}
                      onChange={(e) =>
                        setOtpChallenge((prev) =>
                          prev ? { ...prev, inputCode: e.target.value.replace(/\D/g, '') } : prev
                        )
                      }
                      placeholder="Enter 6-digit verification code"
                      className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-center font-mono tracking-widest text-sm text-black outline-none focus:border-[#0866FF]"
                    />
                  </div>
                )}

                {mode === 'login' && (
                  <TurnstileCaptchaPlaceholder
                    verified={turnstileVerified}
                    onVerifyChange={(v) => setTurnstileVerified(v)}
                  />
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#0866FF] hover:bg-blue-600 active:scale-[0.99] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {otpChallenge
                          ? 'Verify Code'
                          : mode === 'login'
                          ? 'Sign In'
                          : 'Send Reset Link'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-[#E4E6EB] text-center space-y-3">
                {mode === 'login' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setWizardStep(1);
                      setMode('signup');
                      onNavigateTo('/signup');
                    }}
                    className="px-5 py-2.5 bg-[#42B72A] hover:bg-[#36A420] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Create new account
                  </button>
                ) : (
                  <p className="text-xs text-[#65676B]">
                    Remembered your password?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMsg('');
                      }}
                      className="text-[#0866FF] font-bold hover:underline cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center text-[11px] text-[#65676B] z-10 space-y-2">
        <p>© 2026 Peaceverse24.com — World&apos;s Most Peaceful Social Network. All rights reserved.</p>
      </footer>
    </div>
  );
};
