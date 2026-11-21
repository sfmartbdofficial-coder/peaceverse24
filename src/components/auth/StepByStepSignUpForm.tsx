import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
} from 'lucide-react';
import { TurnstileCaptchaPlaceholder } from './TurnstileCaptchaPlaceholder';
import { requestEmailOtp } from '../../utils/emailOtp';

export type SignUpGender = 'Male' | 'Female' | 'Custom' | '';
export type SignUpWizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface StepSignUpPayload {
  firstName: string;
  lastName: string;
  contact: string;
  password: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  gender: 'Male' | 'Female' | 'Custom';
  otpCode: string;
}

interface StepByStepSignUpFormProps {
  onComplete: (payload: StepSignUpPayload) => Promise<void> | void;
  loading?: boolean;
  externalError?: string | null;
  onClearExternalError?: () => void;
  onOpenLegalTab?: (tab: string) => void;
  step?: SignUpWizardStep;
  onStepChange?: (step: SignUpWizardStep) => void;
  compact?: boolean;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const CURRENT_YEAR = 2026;
const YEARS = Array.from({ length: 90 }, (_, i) => String(CURRENT_YEAR - 13 - i));

const STEP_META: Record<SignUpWizardStep, { title: string; subtitle: string }> = {
  1: { title: 'Step 1 - নাম', subtitle: 'আপনার First Name এবং Last Name দিন' },
  2: { title: 'Step 2 - ইমেইল', subtitle: 'আপনার আসল Email ঠিকানা দিন (৬ ডিজিটের কোড যাবে)' },
  3: { title: 'Step 3 - পাসওয়ার্ড', subtitle: 'একটি শক্তিশালী Password দিন' },
  4: { title: 'Step 4 - জন্ম তারিখ', subtitle: 'আপনার জন্ম তারিখ নির্বাচন করুন' },
  5: { title: 'Step 5 - Gender', subtitle: 'আপনার Gender নির্বাচন করুন এবং Next চাপুন' },
  6: { title: 'Step 6 - কোড ভেরিফিকেশন', subtitle: 'আপনার ইমেইলে ৬ সংখ্যার কোডটি পাঠানো হয়েছে, অনুগ্রহপূর্বক এখানে ফিলাপ করুন' },
};

const REQUIRED_MSG = 'এইটা লাগবে';

export const StepByStepSignUpForm: React.FC<StepByStepSignUpFormProps> = ({
  onComplete,
  loading = false,
  externalError = null,
  onClearExternalError,
  onOpenLegalTab,
  step: controlledStep,
  onStepChange,
  compact = false,
}) => {
  const [internalStep, setInternalStep] = useState<SignUpWizardStep>(1);
  const currentStep = controlledStep ?? internalStep;

  const setCurrentStep = (next: SignUpWizardStep) => {
    if (onStepChange) {
      onStepChange(next);
    } else {
      setInternalStep(next);
    }
  };

  // Step 1: First Name + Last Name
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Step 2: Email Address
  const [contact, setContact] = useState('');

  // Step 3: Password + Eye Toggle
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 4: Date of Birth (Day / Month / Year)
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  // Step 5: Gender + Turnstile
  const [gender, setGender] = useState<SignUpGender>('');
  const [turnstileVerified, setTurnstileVerified] = useState(false);

  // Step 6: 6-digit Email OTP Code
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Field-level error map for literal "এইটা লাগবে" & format errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [stepBannerError, setStepBannerError] = useState<string | null>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const clearFieldError = (key: string) => {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (stepBannerError) setStepBannerError(null);
    onClearExternalError?.();
  };

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};
    setStepBannerError(null);
    onClearExternalError?.();

    if (currentStep === 1) {
      if (!firstName.trim()) errors.firstName = REQUIRED_MSG;
      if (!lastName.trim()) errors.lastName = REQUIRED_MSG;
    } else if (currentStep === 2) {
      const trimmed = contact.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!trimmed) {
        errors.contact = REQUIRED_MSG;
      } else if (!emailRegex.test(trimmed)) {
        errors.contact = 'সঠিক Email ঠিকানা দিন (যেমন: name@gmail.com)';
      }
    } else if (currentStep === 3) {
      if (!password) {
        errors.password = REQUIRED_MSG;
      } else if (password.length < 6) {
        errors.password = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে';
      }
    } else if (currentStep === 4) {
      if (!dobDay) errors.dobDay = REQUIRED_MSG;
      if (!dobMonth) errors.dobMonth = REQUIRED_MSG;
      if (!dobYear) errors.dobYear = REQUIRED_MSG;
    } else if (currentStep === 5) {
      if (!gender) errors.gender = REQUIRED_MSG;
    } else if (currentStep === 6) {
      const cleanOtp = otpCode.trim();
      if (!cleanOtp) {
        errors.otpCode = REQUIRED_MSG;
      } else if (!/^\d{6}$/.test(cleanOtp)) {
        errors.otpCode = 'আপনার ইমেইলে পাঠানো সঠিক ৬ ডিজিটের কোডটি লিখুন';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const sendOtpAndGoToStep6 = async () => {
    if (!validateCurrentStep()) return;

    if (!turnstileVerified) {
      setStepBannerError('অনুগ্রহ করে Turnstile মানব যাচাইকরণ সম্পূর্ণ করুন।');
      return;
    }

    setSendingOtp(true);
    setStepBannerError(null);
    onClearExternalError?.();
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const otpRes = await requestEmailOtp({
        email: contact.trim(),
        fullName,
        purpose: 'signup',
        allowExisting: true,
      });
      setOtpCode('');
      setResendCooldown(otpRes.resendCooldownSeconds || 45);
      setCurrentStep(6);
    } catch (err: any) {
      setStepBannerError(err?.message || 'ইমেইলে ৬ ডিজিটের কোড পাঠানো যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || sendingOtp || loading) return;
    setSendingOtp(true);
    setStepBannerError(null);
    onClearExternalError?.();
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const otpRes = await requestEmailOtp({
        email: contact.trim(),
        fullName,
        purpose: 'signup',
        allowExisting: false,
      });
      setResendCooldown(otpRes.resendCooldownSeconds || 45);
    } catch (err: any) {
      setStepBannerError(err?.message || 'আবার কোড পাঠানো যায়নি।');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 5) {
      await sendOtpAndGoToStep6();
      return;
    }
    if (!validateCurrentStep()) return;
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as SignUpWizardStep);
    }
  };

  const handleBack = () => {
    setFieldErrors({});
    setStepBannerError(null);
    onClearExternalError?.();
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as SignUpWizardStep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 6) {
      await handleNext();
      return;
    }

    if (!validateCurrentStep()) return;

    await onComplete({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      contact: contact.trim(),
      password,
      dobDay,
      dobMonth,
      dobYear,
      gender: gender as 'Male' | 'Female' | 'Custom',
      otpCode: otpCode.trim(),
    });
  };

  const isBusy = loading || sendingOtp;
  const progressPercent = (currentStep / 6) * 100;
  const activeMeta = STEP_META[currentStep];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
      {/* Top 1-2-3-4-5-6 Progress Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-[#606770]">
          <span className="text-[#0866FF]">{activeMeta.title}</span>
          <span>ধাপ {currentStep} / 6</span>
        </div>

        {/* 1 - 2 - 3 - 4 - 5 - 6 Stepper Pills */}
        <div className="relative flex items-center justify-between">
          {/* Background Track */}
          <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-1 bg-[#E4E6EB] rounded-full" />
          {/* Active Fill Track */}
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 h-1 bg-[#0866FF] rounded-full transition-all duration-300"
            style={{ width: `calc(${((currentStep - 1) / 5) * 100}% - 12px)` }}
          />

          {([1, 2, 3, 4, 5, 6] as const).map((num) => {
            const isCompleted = num < currentStep;
            const isActive = num === currentStep;
            return (
              <div
                key={num}
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all ${
                  isCompleted
                    ? 'bg-[#42B72A] border-[#42B72A] text-white'
                    : isActive
                    ? 'bg-[#0866FF] border-[#0866FF] text-white scale-110 shadow-sm'
                    : 'bg-white border-[#CCD0D5] text-[#606770]'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : num}
              </div>
            );
          })}
        </div>

        {/* Progress Bar Fill */}
        <div className="w-full h-1.5 bg-[#E4E6EB] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0866FF] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-[13px] text-[#606770] font-medium">{activeMeta.subtitle}</p>
      </div>

      {/* External or Banner Error */}
      {(externalError || stepBannerError) && (
        <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{externalError || stepBannerError}</span>
        </div>
      )}

      {/* ONLY ONE STEP VISIBLE AT A TIME */}
      {currentStep === 1 && (
        <div className="space-y-3 animate-in fade-in">
          <div className={compact ? 'space-y-2.5' : 'grid grid-cols-1 sm:grid-cols-2 gap-2.5'}>
            <div>
              <label className="block text-xs font-bold text-[#1C1E21] mb-1">First Name</label>
              <input
                type="text"
                autoFocus
                placeholder="First name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  clearFieldError('firstName');
                }}
                className={`w-full px-3 py-2.5 bg-[#F5F6F7] border rounded-[6px] text-[15px] text-[#1C1E21] placeholder-[#8D949E] focus:outline-none ${
                  fieldErrors.firstName
                    ? 'border-rose-600 focus:border-rose-600 bg-rose-50/40'
                    : 'border-[#CCD0D5] focus:border-[#0866FF]'
                }`}
              />
              {fieldErrors.firstName && (
                <p className="mt-1 text-xs font-bold text-rose-600">{fieldErrors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1E21] mb-1">Last Name</label>
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  clearFieldError('lastName');
                }}
                className={`w-full px-3 py-2.5 bg-[#F5F6F7] border rounded-[6px] text-[15px] text-[#1C1E21] placeholder-[#8D949E] focus:outline-none ${
                  fieldErrors.lastName
                    ? 'border-rose-600 focus:border-rose-600 bg-rose-50/40'
                    : 'border-[#CCD0D5] focus:border-[#0866FF]'
                }`}
              />
              {fieldErrors.lastName && (
                <p className="mt-1 text-xs font-bold text-rose-600">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-2 animate-in fade-in">
          <label className="block text-xs font-bold text-[#1C1E21]">
            Email Address
          </label>
          <input
            type="email"
            autoFocus
            placeholder="name@gmail.com"
            value={contact}
            onChange={(e) => {
              setContact(e.target.value);
              clearFieldError('contact');
            }}
            className={`w-full px-3 py-2.5 bg-[#F5F6F7] border rounded-[6px] text-[15px] text-[#1C1E21] placeholder-[#8D949E] focus:outline-none ${
              fieldErrors.contact
                ? 'border-rose-600 focus:border-rose-600 bg-rose-50/40'
                : 'border-[#CCD0D5] focus:border-[#0866FF]'
            }`}
          />
          {fieldErrors.contact && (
            <p className="text-xs font-bold text-rose-600">{fieldErrors.contact}</p>
          )}
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-2 animate-in fade-in">
          <label className="block text-xs font-bold text-[#1C1E21]">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoFocus
              placeholder="New password (কমপক্ষে ৬ অক্ষর)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError('password');
              }}
              className={`w-full px-3 py-2.5 pr-10 bg-[#F5F6F7] border rounded-[6px] text-[15px] text-[#1C1E21] placeholder-[#8D949E] focus:outline-none ${
                fieldErrors.password
                  ? 'border-rose-600 focus:border-rose-600 bg-rose-50/40'
                  : 'border-[#CCD0D5] focus:border-[#0866FF]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#606770] hover:text-[#1C1E21] cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs font-bold text-rose-600">{fieldErrors.password}</p>
          )}
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-2 animate-in fade-in">
          <label className="block text-xs font-bold text-[#1C1E21]">
            জন্ম তারিখ (Day / Month / Year)
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <select
                value={dobDay}
                onChange={(e) => {
                  setDobDay(e.target.value);
                  clearFieldError('dobDay');
                }}
                aria-label="Day"
                className={`w-full px-2.5 py-2.5 bg-white border rounded-[6px] text-[15px] text-[#1C1E21] focus:outline-none ${
                  fieldErrors.dobDay ? 'border-rose-600 bg-rose-50/40' : 'border-[#CCD0D5] focus:border-[#0866FF]'
                }`}
              >
                <option value="">Day</option>
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {fieldErrors.dobDay && (
                <p className="mt-1 text-[11px] font-bold text-rose-600">{fieldErrors.dobDay}</p>
              )}
            </div>

            <div>
              <select
                value={dobMonth}
                onChange={(e) => {
                  setDobMonth(e.target.value);
                  clearFieldError('dobMonth');
                }}
                aria-label="Month"
                className={`w-full px-2.5 py-2.5 bg-white border rounded-[6px] text-[15px] text-[#1C1E21] focus:outline-none ${
                  fieldErrors.dobMonth ? 'border-rose-600 bg-rose-50/40' : 'border-[#CCD0D5] focus:border-[#0866FF]'
                }`}
              >
                <option value="">Month</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {fieldErrors.dobMonth && (
                <p className="mt-1 text-[11px] font-bold text-rose-600">{fieldErrors.dobMonth}</p>
              )}
            </div>

            <div>
              <select
                value={dobYear}
                onChange={(e) => {
                  setDobYear(e.target.value);
                  clearFieldError('dobYear');
                }}
                aria-label="Year"
                className={`w-full px-2.5 py-2.5 bg-white border rounded-[6px] text-[15px] text-[#1C1E21] focus:outline-none ${
                  fieldErrors.dobYear ? 'border-rose-600 bg-rose-50/40' : 'border-[#CCD0D5] focus:border-[#0866FF]'
                }`}
              >
                <option value="">Year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {fieldErrors.dobYear && (
                <p className="mt-1 text-[11px] font-bold text-rose-600">{fieldErrors.dobYear}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {currentStep === 5 && (
        <div className="space-y-3 animate-in fade-in">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1C1E21]">Gender</label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['Male', 'Female', 'Custom'] as const).map((g) => (
                <label
                  key={g}
                  className={`flex items-center justify-between px-2.5 py-2.5 bg-white border rounded-[6px] text-[14px] font-medium text-[#1C1E21] cursor-pointer transition-colors ${
                    gender === g
                      ? 'border-[#0866FF] bg-[#E7F3FF]/50'
                      : fieldErrors.gender
                      ? 'border-rose-600 bg-rose-50/40'
                      : 'border-[#CCD0D5] hover:border-[#8D949E]'
                  }`}
                >
                  <span>{g}</span>
                  <input
                    type="radio"
                    name="step-signup-gender"
                    value={g}
                    checked={gender === g}
                    onChange={() => {
                      setGender(g);
                      clearFieldError('gender');
                    }}
                    className="accent-[#0866FF]"
                  />
                </label>
              ))}
            </div>
            {fieldErrors.gender && (
              <p className="text-xs font-bold text-rose-600">{fieldErrors.gender}</p>
            )}
          </div>

          <p className="text-[11px] text-[#777777] leading-snug">
            By clicking Next &amp; Sign Up, you agree to our{' '}
            <button
              type="button"
              onClick={() => onOpenLegalTab?.('terms')}
              className="text-[#385898] hover:underline cursor-pointer"
            >
              Halal Terms
            </button>
            ,{' '}
            <button
              type="button"
              onClick={() => onOpenLegalTab?.('privacy')}
              className="text-[#385898] hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>{' '}
            and Community Guidelines.
          </p>

          <TurnstileCaptchaPlaceholder
            verified={turnstileVerified}
            onVerifyChange={(v) => {
              setTurnstileVerified(v);
              setStepBannerError(null);
            }}
          />
        </div>
      )}

      {currentStep === 6 && (
        <div className="space-y-3 animate-in fade-in">
          <div className="p-3 rounded-lg bg-[#E7F3FF] border border-blue-200 text-xs text-[#1C1E21] space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-[#0866FF]">
              <MailCheck className="w-4 h-4 text-[#0866FF]" />
              <span>Email Code Verification</span>
            </p>
            <p className="text-[12px] text-[#4B4F56]">
              আপনার <strong>{contact.trim()}</strong> ইমেইলে ৬ সংখ্যার কোডটি পাঠানো হয়েছে। অনুগ্রহপূর্বক এখানে কোডটি ফিলাপ করুন এবং নিচে <strong>Sign Up</strong> চাপুন (ইনবক্সে না পেলে Spam ফোল্ডার চেক করুন)।
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1C1E21] mb-1.5">
              আপনার ইমেইলে পাঠানো ৬ সংখ্যার কোডটি এখানে ফিলাপ করুন
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              value={otpCode}
              onChange={(e) => {
                setOtpCode(e.target.value.replace(/\D/g, ''));
                clearFieldError('otpCode');
              }}
              placeholder="______"
              className={`w-full px-3 py-3 bg-[#F5F6F7] border-2 rounded-[6px] text-center font-mono tracking-[0.35em] text-[20px] font-bold text-[#1C1E21] focus:outline-none ${
                fieldErrors.otpCode
                  ? 'border-rose-600 focus:border-rose-600 bg-rose-50/40'
                  : 'border-[#CCD0D5] focus:border-[#0866FF]'
              }`}
            />
            {fieldErrors.otpCode && (
              <p className="mt-1 text-xs font-bold text-rose-600">{fieldErrors.otpCode}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#606770]">কোড পাননি?</span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || isBusy}
              className="font-bold text-[#0866FF] hover:underline disabled:text-[#8D949E] disabled:no-underline cursor-pointer"
            >
              {resendCooldown > 0
                ? `আবার পাঠান (${resendCooldown}s)`
                : 'আবার কোড পাঠান (Resend)'}
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons (Step 1-5: Next, Step 6: Sign Up) */}
      <div className="flex items-center gap-2.5 pt-2">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handleBack}
            disabled={isBusy}
            className="px-4 py-2.5 bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#1C1E21] font-bold text-[14px] rounded-[6px] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}

        {currentStep < 6 ? (
          <button
            type="submit"
            disabled={isBusy}
            className="flex-1 py-2.5 bg-[#0866FF] hover:bg-[#166FE5] active:scale-[0.99] disabled:opacity-60 text-white font-bold text-[15px] rounded-[6px] shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {sendingOtp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>কোড পাঠানো হচ্ছে...</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <button
            type="submit"
            disabled={isBusy}
            className="flex-1 py-2.5 bg-[#00A400] hover:bg-[#008C00] active:scale-[0.99] disabled:opacity-60 text-white font-bold text-[16px] rounded-[6px] shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Sign Up</span>
          </button>
        )}
      </div>
    </form>
  );
};
