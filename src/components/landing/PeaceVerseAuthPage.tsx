import React, { useState, useMemo } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
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
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const emailValidation = useMemo(() => validateEmail(email), [email]);
  const showEmailError = emailTouched && email.trim().length > 0 && !emailValidation.isValid;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Instant AI / pattern email validation check
    setEmailTouched(true);
    if (!emailValidation.isValid) {
      setErrorMsg(emailValidation.message || 'আপনার ইমেইলটি সঠিক নয়');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        // Clear any prior stale session to guarantee password verification
        try {
          await logoutUser();
        } catch {}

        const user = await loginWithEmail(email.trim(), password);
        if (user) {
          setSuccessMsg('সফলভাবে লগইন হয়েছে! হোম পেজে প্রবেশ করা হচ্ছে...');
          setTimeout(() => {
            onNavigateHome();
          }, 600);
        }
      } else if (mode === 'signup') {
        if (!displayName.trim()) {
          setErrorMsg('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
          setLoading(false);
          return;
        }
        const cleanName = displayName.trim();
        try {
          localStorage.setItem('peaceverse_registered_name', cleanName);
        } catch {}
        const user = await registerWithEmail(email.trim(), password, cleanName);
        if (user) {
          setSuccessMsg('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! হোমে নিয়ে যাওয়া হচ্ছে...');
          setTimeout(() => {
            onNavigateHome();
          }, 800);
        }
      } else if (mode === 'forgot') {
        await resetPassword(email.trim());
        setSuccessMsg('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে! অনুগ্রহ করে ইনবক্স চেক করুন।');
      }
    } catch (err: any) {
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
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white flex flex-col justify-between py-6 px-4 sm:px-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full blur-[100px] opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.45) 0%, rgba(14, 165, 233, 0.2) 50%, transparent 80%)',
        }}
      />

      {/* Top Bar with Back to Landing Page */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between z-10">
        <button
          onClick={() => onNavigateTo('/')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-blue-500/25 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Stylized Logo mark */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center p-1 shadow-[0_0_12px_rgba(56,189,248,0.4)]">
            <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" />
            </svg>
          </div>
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-sky-200 to-blue-400 bg-clip-text text-transparent">
            PeaceVerse
          </span>
        </div>
      </header>

      {/* Main Auth Card Container */}
      <main className="w-full max-w-md mx-auto my-auto z-10 pt-4 pb-6">
        <div className="relative rounded-3xl p-6 sm:p-8 bg-slate-900/75 border border-blue-500/30 backdrop-blur-xl shadow-[0_0_40px_rgba(37,99,235,0.22)]">
          
          {/* Glowing Top Dove Icon Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <PeaceDoveEmblem size={88} className="mb-3" />
            <span className="text-[10px] tracking-wider uppercase font-bold text-sky-400 bg-blue-950/70 border border-sky-400/30 px-3 py-0.5 rounded-full mb-2">
              Positive Global Community
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {mode === 'login' && 'Sign in to PeaceVerse'}
              {mode === 'signup' && 'Create Your PeaceVerse Account'}
              {mode === 'forgot' && 'Reset Your Password'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xs">
              {mode === 'login' && 'Welcome back! Connect with your peaceful community worldwide.'}
              {mode === 'signup' && 'Join millions sharing positive, safe, and helpful content.'}
              {mode === 'forgot' && 'Enter your registered email to receive recovery instructions.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-950/80 rounded-2xl border border-blue-500/20 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Active Logged-In User Banner (if opened while already signed in) */}
          {currentUser && (
            <div className="mb-5 p-3 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block">বর্তমানে সাইন-ইন আছেন:</span>
                <p className="font-bold text-white truncate text-xs">{currentUser.displayName || currentUser.email}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow transition-colors cursor-pointer"
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
                  className="px-2.5 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
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
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1-Click Google Sign-In */}
          {mode !== 'forgot' && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-800 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
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
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-4 text-[11px] text-slate-400">
                <div className="flex-1 h-[1px] bg-slate-800" />
                <span>or use email</span>
                <div className="flex-1 h-[1px] bg-slate-800" />
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">Full Name</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full bg-slate-950/70 border border-slate-700/60 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-slate-300 mb-1 block">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
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
                  className={`w-full bg-slate-950/70 border rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    showEmailError
                      ? 'border-rose-500/80 focus:border-rose-500 bg-rose-950/25 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                      : 'border-slate-700/60 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Real-time Email Validation: Shows immediately under the email input */}
              {showEmailError && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-400 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span className="font-semibold">{emailValidation.message || 'আপনার ইমেইলটি সঠিক নয়'}</span>
                </div>
              )}
              {emailTouched && email.trim().length > 0 && emailValidation.isValid && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>ইমেইলটি সঠিক ও সক্রিয় ✓</span>
                </div>
              )}
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-300">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] text-sky-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                    className="w-full bg-slate-950/70 border border-slate-700/60 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In to PeaceVerse'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Card Footer Switcher */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            {mode === 'login' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                  }}
                  className="text-sky-400 font-bold hover:underline"
                >
                  Sign Up for Free
                </button>
              </p>
            ) : mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="text-sky-400 font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="text-sky-400 font-bold hover:underline"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center text-[11px] text-slate-500 z-10">
        <p>© 2024 PeaceVerse24. All rights reserved.</p>
        <p className="mt-0.5">Secure Firebase Authentication • Privacy Protected</p>
      </footer>
    </div>
  );
};
