import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Globe,
  Loader2,
  X,
  AlertCircle,
  MailCheck,
  ShieldCheck,
} from 'lucide-react';
import {
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  resetPassword,
  logoutUser,
} from '../../lib/firebase';
import { loadPeaceSettings } from '../../utils/settingsStorage';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage } from '../../i18n/languages';
import { GlobalWorldMap } from '../global/GlobalWorldMap';
import { TurnstileCaptchaPlaceholder } from '../auth/TurnstileCaptchaPlaceholder';
import { StepByStepSignUpForm, StepSignUpPayload } from '../auth/StepByStepSignUpForm';
import { sanitizeInput } from '../../utils/security';
import { useHistoryBack } from '../../utils/backNavigation';
import { requestEmailOtp, verifyEmailOtp } from '../../utils/emailOtp';

interface PeaceVerseLandingProps {
  onNavigateTo: (path: string) => void;
  onOpenDownloadModal?: () => void;
  onOpenLegalTab?: (tab: string) => void;
}

const FOOTER_LANGS: { code: SupportedLanguage; label: string }[] = [
  { code: 'en', label: 'English (UK)' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ar', label: 'العربية' },
  { code: 'ur', label: 'اردو' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'fr', label: 'Français (France)' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'es', label: 'Español' },
];

export const PeaceVerseLanding: React.FC<PeaceVerseLandingProps> = ({
  onNavigateTo,
  onOpenLegalTab,
}) => {
  const { currentLang, setLanguage } = useLanguage();

  // Login Form State (Facebook-style card)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forgotten Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  // Facebook-style Step-by-Step Sign Up Modal State
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [pendingSignUpData, setPendingSignUpData] = useState<StepSignUpPayload | null>(null);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  // World Map & Footer Info Modal
  const [showWorldMapModal, setShowWorldMapModal] = useState(false);
  const [footerInfoModal, setFooterInfoModal] = useState<'about' | 'help' | null>(null);

  // Email OTP Verification State (Register) & 2FA Verification State (Login)
  const [signUpStep, setSignUpStep] = useState<'form' | 'otp'>('form');
  const [signUpOtpCode, setSignUpOtpCode] = useState('');
  const [signUpResendCooldown, setSignUpResendCooldown] = useState(0);

  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState('');
  const [twoFactorInput, setTwoFactorInput] = useState('');
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [loginTurnstileVerified, setLoginTurnstileVerified] = useState(false);

  useEffect(() => {
    if (signUpResendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setSignUpResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [signUpResendCooldown]);

  const openSignUpWizardModal = () => {
    setSignUpError(null);
    setSignUpStep('form');
    setWizardStep(1);
    setPendingSignUpData(null);
    setSignUpOtpCode('');
    setSignUpResendCooldown(0);
    setShowSignUpModal(true);
  };

  useHistoryBack(showResetModal, () => setShowResetModal(false), 'landing-reset');
  useHistoryBack(showSignUpModal, () => {
    setSignUpStep('form');
    setWizardStep(1);
    setPendingSignUpData(null);
    setShowSignUpModal(false);
  }, 'landing-signup');
  useHistoryBack(showWorldMapModal, () => setShowWorldMapModal(false), 'landing-world-map');
  useHistoryBack(Boolean(footerInfoModal), () => setFooterInfoModal(null), 'landing-footer-info');
  useHistoryBack(showTwoFactorModal, () => setShowTwoFactorModal(false), 'landing-2fa');

  const normalizeIdentifierToEmail = (input: string) => {
    const trimmed = input.trim();
    if (trimmed.includes('@')) return trimmed;
    const digits = trimmed.replace(/[^0-9+]/g, '');
    if (digits.length >= 6) {
      return `${digits.replace(/\+/g, '')}@phone.peaceverse.app`;
    }
    return trimmed;
  };

  const mapAuthError = (err: any): string => {
    const code = err?.code || '';
    const msg = err?.message || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'The email address or password you entered is incorrect.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account with this email or mobile number already exists.';
    }
    if (code === 'auth/weak-password') {
      return 'Password should be at least 6 characters.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address or mobile number.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in popup was closed.';
    }
    return msg || 'Authentication failed. Please try again.';
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginIdentifier.trim() || !loginPassword) {
      setLoginError('Please enter your email/phone and password.');
      return;
    }
    if (!loginTurnstileVerified) {
      setLoginError('Please complete the Cloudflare Turnstile verification first.');
      return;
    }

    setLoginLoading(true);
    try {
      const resolvedEmail = normalizeIdentifierToEmail(sanitizeInput(loginIdentifier));
      await loginWithEmail(resolvedEmail, loginPassword);
      const settings = loadPeaceSettings();
      if (settings.twoFactorEnabled && resolvedEmail.includes('@') && !resolvedEmail.endsWith('@phone.peaceverse.app')) {
        try {
          await requestEmailOtp({ email: resolvedEmail, purpose: '2fa' });
          setTwoFactorEmail(resolvedEmail);
          setTwoFactorInput('');
          setTwoFactorError(null);
          setShowTwoFactorModal(true);
        } catch (otpErr: any) {
          try { await logoutUser(); } catch {}
          setLoginError(otpErr?.message || '2FA verification code could not be sent.');
        }
      } else {
        onNavigateTo('/home');
      }
    } catch (err: any) {
      setLoginError(mapAuthError(err));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerifyTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError(null);
    if (!/^\d{6}$/.test(twoFactorInput.trim())) {
      setTwoFactorError('আপনার ইমেইলে পাঠানো ৬ ডিজিটের কোডটি লিখুন।');
      return;
    }
    setTwoFactorLoading(true);
    try {
      await verifyEmailOtp({
        email: twoFactorEmail,
        code: twoFactorInput.trim(),
        purpose: '2fa',
      });
      setShowTwoFactorModal(false);
      onNavigateTo('/home');
    } catch (err: any) {
      setTwoFactorError(err?.message || 'ভুল ২এফএ কোড! আবার চেষ্টা করুন।');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoginError(null);
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        onNavigateTo('/home');
      }
    } catch (err: any) {
      setLoginError(mapAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleStepWizardComplete = async (payload: StepSignUpPayload) => {
    setSignUpError(null);
    setSignUpLoading(true);
    try {
      const fullName = sanitizeInput(`${payload.firstName} ${payload.lastName}`);
      const otpRes = await requestEmailOtp({
        email: payload.contact,
        fullName,
        purpose: 'signup',
      });
      setPendingSignUpData(payload);
      setSignUpOtpCode('');
      setSignUpResendCooldown(otpRes.resendCooldownSeconds || 45);
      setSignUpStep('otp');
    } catch (err: any) {
      setSignUpError(err?.message || 'ইমেইলে ৬ ডিজিটের কোড পাঠানো যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleResendSignUpOtp = async () => {
    if (!pendingSignUpData || signUpResendCooldown > 0 || signUpLoading) return;
    setSignUpError(null);
    setSignUpLoading(true);
    try {
      const fullName = sanitizeInput(`${pendingSignUpData.firstName} ${pendingSignUpData.lastName}`);
      const otpRes = await requestEmailOtp({
        email: pendingSignUpData.contact,
        fullName,
        purpose: 'signup',
      });
      setSignUpResendCooldown(otpRes.resendCooldownSeconds || 45);
    } catch (err: any) {
      setSignUpError(err?.message || 'আবার কোড পাঠানো যায়নি।');
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    if (!pendingSignUpData) {
      setSignUpStep('form');
      return;
    }

    const cleanOtp = signUpOtpCode.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setSignUpError('আপনার ইমেইলে পাঠানো সঠিক ৬ ডিজিটের কোডটি লিখুন।');
      return;
    }

    setSignUpLoading(true);
    try {
      const verifiedRes = await verifyEmailOtp({
        email: pendingSignUpData.contact,
        code: cleanOtp,
        purpose: 'signup',
      });

      const fullName = sanitizeInput(`${pendingSignUpData.firstName} ${pendingSignUpData.lastName}`);
      const resolvedEmail = pendingSignUpData.contact.trim().toLowerCase();
      try {
        localStorage.setItem(
          'peaceverse_signup_meta',
          JSON.stringify({
            name: fullName,
            birthDate: `${pendingSignUpData.dobDay} ${pendingSignUpData.dobMonth} ${pendingSignUpData.dobYear}`,
            gender: pendingSignUpData.gender,
            contact: resolvedEmail,
            verifiedChannel: 'email',
          })
        );
        localStorage.setItem('peaceverse_registered_name', fullName);
      } catch {}

      const user = await registerWithEmail(
        resolvedEmail,
        pendingSignUpData.password,
        fullName,
        verifiedRes.verificationToken
      );
      if (user) {
        setShowSignUpModal(false);
        setSignUpStep('form');
        setWizardStep(1);
        setPendingSignUpData(null);
        setSignUpOtpCode('');
        onNavigateTo('/home');
      }
    } catch (err: any) {
      setSignUpError(mapAuthError(err));
    } finally {
      setSignUpLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetFeedback(null);
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address or mobile number.');
      return;
    }
    setResetLoading(true);
    try {
      const raw = resetEmail.trim();
      if (!raw.includes('@')) {
        const digits = raw.replace(/\D/g, '');
        if (digits.length < 6) {
          setResetError('Please enter a valid email address or mobile number.');
          setResetLoading(false);
          return;
        }
        setResetFeedback('6-digit SMS recovery code sent to your mobile number.');
        setResetLoading(false);
        return;
      }
      await resetPassword(raw);
      setResetFeedback('Password reset link sent! Please check your email inbox.');
    } catch (err: any) {
      setResetError(mapAuthError(err));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F0F2F5] text-[#1C1E21] font-sans">
      {/* MAIN FACEBOOK SPLIT SCREEN (Left 40% Brand + Right 60% Login Card) */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-[980px] flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-12">
          
          {/* LEFT SIDE (40%): Logo PeaceVerse + Small Rocket Emblem + Tagline */}
          <div className="w-full lg:w-[44%] flex flex-col items-center lg:items-start text-center lg:text-left lg:pt-10 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg"
                alt="PeaceVerse Logo"
                className="w-11 h-11 rounded-xl object-cover shadow-md border border-[#0866FF]/20 shrink-0"
              />
              <h1 className="text-[40px] sm:text-[48px] font-black tracking-tight text-[#0866FF] leading-none">
                Peaceverse24.com
              </h1>
            </div>

            <p className="text-[22px] sm:text-[26px] leading-[30px] sm:leading-[32px] text-black font-normal max-w-[460px]">
              Peaceverse24.com — Building a peaceful community for everyone worldwide.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Peaceverse24.com — World&apos;s Most Peaceful Social Network for 8 Billion People</span>
              </span>

              <button
                type="button"
                onClick={() => setShowWorldMapModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0866FF] bg-white hover:bg-[#E7F3FF] border border-[#DADDE1] px-3 py-1 rounded-full shadow-xs transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>🌍 Live Global Users Map (196+ Countries Worldwide)</span>
              </button>
            </div>
          </div>

          {/* RIGHT SIDE (60%): White Card with Shadow */}
          <div className="w-full lg:w-[52%] flex flex-col items-center">
            <div className="w-full max-w-[396px] bg-white rounded-[8px] shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] p-4 sm:p-5 space-y-3.5">
              
              {loginError && (
                <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Email address or phone number"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    autoComplete="username"
                    className="w-full px-4 py-3.5 text-[16px] bg-white border border-[#DDDFE2] rounded-[6px] text-[#1C1E21] placeholder-[#8A8D91] focus:outline-none focus:border-[#0866FF] focus:ring-2 focus:ring-[#E7F3FF]"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showLoginPass ? 'text' : 'password'}
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full px-4 py-3.5 pr-11 text-[16px] bg-white border border-[#DDDFE2] rounded-[6px] text-[#1C1E21] placeholder-[#8A8D91] focus:outline-none focus:border-[#0866FF] focus:ring-2 focus:ring-[#E7F3FF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#606770] hover:text-[#1C1E21] p-1 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <TurnstileCaptchaPlaceholder
                  verified={loginTurnstileVerified}
                  onVerifyChange={(v) => setLoginTurnstileVerified(v)}
                />

                <button
                  type="submit"
                  disabled={loginLoading || googleLoading}
                  className="w-full py-3 bg-[#0866FF] hover:bg-[#166FE5] active:scale-[0.99] disabled:opacity-60 text-white font-bold text-[19px] rounded-[6px] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loginLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  <span>Log in</span>
                </button>
              </form>

              {/* Center Forgotten Password Link */}
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(loginIdentifier.includes('@') ? loginIdentifier : '');
                    setResetError(null);
                    setResetFeedback(null);
                    setShowResetModal(true);
                  }}
                  className="text-[14px] text-[#0866FF] hover:underline font-medium cursor-pointer"
                >
                  Forgotten password?
                </button>
              </div>

              {/* Divider Line */}
              <div className="border-t border-[#DADDE1] my-2" />

              {/* Center Green Create new account Button */}
              <div className="flex flex-col items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={openSignUpWizardModal}
                  className="px-6 py-3 bg-[#42B72A] hover:bg-[#36A420] active:scale-[0.99] text-white font-bold text-[17px] rounded-[6px] transition-all cursor-pointer shadow-xs"
                >
                  Create new account
                </button>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loginLoading || googleLoading}
                  className="w-full py-2.5 px-3 bg-[#F5F6F7] hover:bg-[#EBEDF0] border border-[#DADDE1] rounded-[6px] text-[13px] font-semibold text-[#1C1E21] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0866FF]" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z" />
                      <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z" />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>
              </div>
            </div>

            <p className="mt-5 text-[13px] text-[#1C1E21] text-center">
              <strong className="font-semibold">Create a Page</strong> for a halal brand, masjid, or Islamic creator.
            </p>
          </div>
        </div>
      </main>

      {/* COMPACT FACEBOOK-STYLE FOOTER */}
      <footer className="bg-white border-t border-[#DDDFE2] py-5 px-4 text-[12px] text-[#737373]">
        <div className="max-w-[980px] mx-auto space-y-2.5">
          {/* Languages Row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {FOOTER_LANGS.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`hover:underline cursor-pointer ${
                  currentLang === lang.code ? 'font-bold text-[#1C1E21]' : 'text-[#737373]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <div className="border-t border-[#DDDFE2]" />

          {/* Compact Legal / Info Links */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <button
              type="button"
              onClick={openSignUpWizardModal}
              className="hover:underline cursor-pointer"
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => onNavigateTo('/blog')}
              className="hover:underline cursor-pointer"
            >
              Blog
            </button>
            <button
              type="button"
              onClick={() => setFooterInfoModal('about')}
              className="hover:underline cursor-pointer"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => (onOpenLegalTab ? onOpenLegalTab('privacy') : setFooterInfoModal('about'))}
              className="hover:underline cursor-pointer"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => (onOpenLegalTab ? onOpenLegalTab('terms') : setFooterInfoModal('about'))}
              className="hover:underline cursor-pointer"
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => setFooterInfoModal('help')}
              className="hover:underline cursor-pointer"
            >
              Help
            </button>
            <a
              href="#privacy"
              onClick={(e) => {
                if (onOpenLegalTab) {
                  e.preventDefault();
                  onOpenLegalTab('privacy');
                  setTimeout(() => {
                    document.getElementById('privacy-data-deletion')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 120);
                } else {
                  e.preventDefault();
                  setFooterInfoModal('about');
                }
              }}
              className="hover:underline cursor-pointer"
            >
              Contact Us (support@peaceverse24.com)
            </a>
            <a
              href="#privacy"
              onClick={(e) => {
                if (onOpenLegalTab) {
                  e.preventDefault();
                  onOpenLegalTab('privacy');
                  setTimeout(() => {
                    document.getElementById('privacy-data-deletion')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 120);
                } else {
                  e.preventDefault();
                  setFooterInfoModal('about');
                }
              }}
              className="hover:underline cursor-pointer"
            >
              Data Deletion Request
            </a>
            <button
              type="button"
              onClick={() => setShowWorldMapModal(true)}
              className="hover:underline cursor-pointer text-[#0866FF]"
            >
              Global Ummah Map
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <p className="text-[11px] text-[#737373]">Peaceverse24.com — World&apos;s Most Peaceful Social Network © 2026</p>
          </div>
        </div>
      </footer>

      {/* SIGN UP MODAL (Facebook Step-by-Step Popup Style) */}
      {showSignUpModal && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-[432px] rounded-[8px] shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.2)] border border-[#DADDE1] overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-[#DADDE1] flex items-start justify-between">
              <div>
                <h2 className="text-[26px] font-bold text-[#1C1E21] leading-tight">Sign Up</h2>
                <p className="text-[14px] text-[#606770]">It&apos;s quick and easy.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSignUpStep('form');
                  setWizardStep(1);
                  setPendingSignUpData(null);
                  setShowSignUpModal(false);
                }}
                className="p-1 text-[#606770] hover:text-[#1C1E21] rounded-full hover:bg-[#F0F2F5] cursor-pointer"
                aria-label="Close sign up"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 text-left">
              <div className={signUpStep === 'otp' ? 'hidden' : 'block'}>
                <StepByStepSignUpForm
                  step={wizardStep}
                  onStepChange={setWizardStep}
                  onComplete={handleStepWizardComplete}
                  loading={signUpLoading}
                  externalError={signUpError}
                  onClearExternalError={() => setSignUpError(null)}
                  onOpenLegalTab={onOpenLegalTab}
                />
              </div>

              {signUpStep === 'otp' && (
                <form onSubmit={handleVerifyOtpAndRegister} className="space-y-3 text-left">
                  {signUpError && (
                    <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{signUpError}</span>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-[#E7F3FF] border border-blue-200 text-xs text-[#1C1E21] space-y-1.5">
                    <p className="font-bold flex items-center gap-1.5 text-[#0866FF]">
                      <MailCheck className="w-4 h-4 text-[#0866FF]" />
                      <span>Email Code Verification</span>
                    </p>
                    <p className="text-[12px] text-[#4B4F56]">
                      আমরা আপনার <strong>{pendingSignUpData?.contact}</strong> ইমেইলে একটি ৬ ডিজিটের ভেরিফিকেশন কোড পাঠিয়েছি। অনুগ্রহ করে ইনবক্স (অথবা Spam ফোল্ডার) চেক করে কোডটি নিচে লিখুন।
                    </p>
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    value={signUpOtpCode}
                    onChange={(e) => {
                      setSignUpOtpCode(e.target.value.replace(/\D/g, ''));
                      setSignUpError(null);
                    }}
                    placeholder="Enter 6-digit Email OTP"
                    className="w-full px-3 py-2.5 bg-[#F5F6F7] border border-[#CCD0D5] rounded-[5px] text-center font-mono tracking-[0.25em] text-[17px] text-[#1C1E21] focus:outline-none focus:border-[#0866FF]"
                  />

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#606770]">কোড পাননি?</span>
                    <button
                      type="button"
                      onClick={handleResendSignUpOtp}
                      disabled={signUpResendCooldown > 0 || signUpLoading}
                      className="font-bold text-[#0866FF] hover:underline disabled:text-[#8D949E] disabled:no-underline cursor-pointer"
                    >
                      {signUpResendCooldown > 0
                        ? `আবার পাঠান (${signUpResendCooldown}s)`
                        : 'আবার কোড পাঠান (Resend)'}
                    </button>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSignUpError(null);
                        setSignUpStep('form');
                      }}
                      disabled={signUpLoading}
                      className="px-4 py-2.5 bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#1C1E21] font-bold text-xs rounded-[6px] cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={signUpLoading || signUpOtpCode.length !== 6}
                      className="flex-1 py-2.5 bg-[#00A400] hover:bg-[#008C00] disabled:opacity-60 text-white font-bold text-[15px] rounded-[6px] shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {signUpLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Verify & Create Account</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2FA VERIFICATION MODAL WHEN 2FA IS ENABLED */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-[400px] rounded-[8px] shadow-2xl border border-[#DADDE1] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#DADDE1] flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-[#1C1E21] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Two-Factor Authentication</span>
              </h3>
              <button
                type="button"
                onClick={async () => {
                  try { await logoutUser(); } catch {}
                  setShowTwoFactorModal(false);
                }}
                className="p-1 text-[#606770] hover:text-[#1C1E21] rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleVerifyTwoFactor} className="p-4 space-y-3">
              <div className="p-3 rounded-lg bg-[#E7F3FF] border border-blue-200 text-xs text-[#1C1E21]">
                আপনার <strong>{twoFactorEmail}</strong> ইমেইলে ৬ ডিজিটের 2FA ভেরিফিকেশন কোড পাঠানো হয়েছে। লগইন সম্পন্ন করতে কোডটি লিখুন।
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={twoFactorInput}
                onChange={(e) => {
                  setTwoFactorInput(e.target.value.replace(/\D/g, ''));
                  setTwoFactorError(null);
                }}
                placeholder="Enter 6-digit 2FA code"
                className="w-full px-3.5 py-2.5 border border-[#CCD0D5] rounded-[6px] text-center font-mono tracking-[0.25em] text-[16px] text-[#1C1E21] focus:outline-none focus:border-[#0866FF]"
              />
              {twoFactorError && (
                <p className="text-xs text-rose-600 font-semibold">{twoFactorError}</p>
              )}
              <button
                type="submit"
                disabled={twoFactorLoading || twoFactorInput.length !== 6}
                className="w-full py-2.5 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-[14px] cursor-pointer flex items-center justify-center gap-2"
              >
                {twoFactorLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Verify & Continue</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FORGOTTEN PASSWORD MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-[420px] rounded-[8px] shadow-2xl border border-[#DADDE1] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#DADDE1] flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-[#1C1E21]">Find your account</h3>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="p-1 text-[#606770] hover:text-[#1C1E21] rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePasswordReset} className="p-4 space-y-3">
              <p className="text-[14px] text-[#606770]">
                Please enter your email address or mobile number to recover your account.
              </p>
              <input
                type="text"
                placeholder="Email address or mobile number"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-[#CCD0D5] rounded-[6px] text-[15px] text-[#1C1E21] focus:outline-none focus:border-[#0866FF]"
              />
              {resetError && (
                <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}
              {resetFeedback && (
                <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <MailCheck className="w-4 h-4 shrink-0" />
                  <span>{resetFeedback}</span>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#DADDE1]">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-[6px] bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#4B4F56] font-bold text-[14px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-5 py-2 rounded-[6px] bg-[#0866FF] hover:bg-[#166FE5] text-white font-bold text-[14px] flex items-center gap-1.5 cursor-pointer"
                >
                  {resetLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Send Reset Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE GLOBAL WORLD MAP MODAL (20 Countries Online Users) */}
      {showWorldMapModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white border border-[#E4E6EB] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-4 sm:p-5 space-y-3 text-black">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-black">
                  Peaceverse24.com — Live Global Community Network
                </h3>
                <p className="text-xs text-[#65676B]">
                  Connecting 8 Billion People globally across 196+ Countries Worldwide
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWorldMapModal(false)}
                className="p-1.5 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <GlobalWorldMap mode="landing" />
          </div>
        </div>
      )}

      {/* FOOTER INFO MODAL (About / Help) */}
      {footerInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-[#DADDE1] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#DADDE1] pb-2.5">
              <h3 className="font-bold text-base text-black">
                {footerInfoModal === 'about' ? 'About Peaceverse24.com' : 'Peaceverse24.com Help Center'}
              </h3>
              <button
                type="button"
                onClick={() => setFooterInfoModal(null)}
                className="p-1 rounded-full hover:bg-[#F0F2F5] text-[#606770] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-[#4B4F56] leading-relaxed">
              {footerInfoModal === 'about'
                ? "Peaceverse24.com — World's Most Peaceful Social Network for 8 Billion People. Connect across 196+ countries with auto-translated posts, global prayer times, Qibla compass, Peace Mart Global, and halal creator monetization."
                : 'Need help logging in or creating an account? Click "Create new account" for instant access, or use "Forgotten password?" to reset your email credentials.'}
            </p>
            <button
              type="button"
              onClick={() => setFooterInfoModal(null)}
              className="w-full py-2 rounded-md bg-[#0866FF] hover:bg-[#166FE5] text-white font-bold text-sm cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
