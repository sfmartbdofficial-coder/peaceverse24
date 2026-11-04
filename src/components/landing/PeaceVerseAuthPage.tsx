import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  resetPassword,
  activeFirebaseProjectId,
} from '../../lib/firebase';
import { PeaceDoveEmblem } from './PeaceDoveEmblem';

interface PeaceVerseAuthPageProps {
  initialMode?: 'login' | 'signup' | 'forgot';
  onNavigateHome: () => void;
  onNavigateTo: (path: string) => void;
}

export const PeaceVerseAuthPage: React.FC<PeaceVerseAuthPageProps> = ({
  initialMode = 'login',
  onNavigateHome,
  onNavigateTo,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await loginWithEmail(email.trim(), password);
        if (user) {
          setSuccessMsg('Successfully signed in! Redirecting to home...');
          setTimeout(() => {
            onNavigateHome();
          }, 600);
        }
      } else if (mode === 'signup') {
        if (!displayName.trim()) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const cleanName = displayName.trim();
        try {
          localStorage.setItem('peaceverse_registered_name', cleanName);
        } catch {}
        const user = await registerWithEmail(email.trim(), password, cleanName);
        if (user) {
          setSuccessMsg('Account created successfully! Verification email sent.');
          setTimeout(() => {
            onNavigateHome();
          }, 800);
        }
      } else if (mode === 'forgot') {
        await resetPassword(email.trim());
        setSuccessMsg('Password reset link sent to your email! Please check your inbox.');
      }
    } catch (err: any) {
      let msg = err?.message || 'An error occurred during authentication.';
      if (msg.includes('auth/operation-not-allowed')) {
        msg = `Firebase Email/Password সাইন-আপ এই প্রজেক্টে (${activeFirebaseProjectId || 'Unknown'}) চালু নেই। Firebase Console > Authentication > Sign-in method-এ গিয়ে Email/Password এনাবল করুন।`;
      } else if (msg.includes('auth/invalid-email')) {
        msg = 'Invalid email address.';
      } else if (msg.includes('auth/user-not-found') || msg.includes('auth/invalid-credential')) {
        msg = 'Incorrect email or password.';
      } else if (msg.includes('auth/wrong-password')) {
        msg = 'Incorrect password.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Try signing in.';
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

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950/70 border border-slate-700/60 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
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
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-950/70 border border-slate-700/60 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
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
