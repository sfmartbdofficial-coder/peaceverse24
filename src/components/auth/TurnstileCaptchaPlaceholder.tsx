import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

interface TurnstileCaptchaPlaceholderProps {
  onVerifyChange: (verified: boolean, token?: string) => void;
  verified: boolean;
  siteKey?: string;
}

export const TurnstileCaptchaPlaceholder: React.FC<TurnstileCaptchaPlaceholderProps> = ({
  onVerifyChange,
  verified,
  siteKey = import.meta.env?.VITE_TURNSTILE_SITE_KEY || 'YOUR_KEY',
}) => {
  const [checking, setChecking] = useState(false);

  const handleToggleVerify = () => {
    if (checking) return;
    if (verified) {
      onVerifyChange(false, undefined);
      return;
    }
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      onVerifyChange(true, `cf-turnstile-verified-${Date.now()}`);
    }, 350);
  };

  return (
    <div
      className="cf-turnstile rounded-xl border border-[#DADDE1] bg-[#F9FAFB] px-3 py-2.5 flex items-center justify-between gap-2 select-none"
      data-sitekey={siteKey}
      data-theme="light"
    >
      <button
        type="button"
        onClick={handleToggleVerify}
        className="flex items-center gap-2.5 text-left cursor-pointer group"
        aria-pressed={verified}
      >
        <div
          className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
            verified
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'bg-white border-[#CBD5E1] group-hover:border-emerald-500'
          }`}
        >
          {checking ? (
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
          ) : verified ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : null}
        </div>
        <div className="leading-tight">
          <p className="text-xs font-bold text-[#1C1E21]">
            {checking
              ? 'Verifying browser...'
              : verified
              ? 'Verified human (Turnstile OK)'
              : 'Verify you are human'}
          </p>
          <p className="text-[10px] text-[#65676B]">
            Cloudflare Turnstile Protection • Bot Fight Shield
          </p>
        </div>
      </button>

      <div className="flex flex-col items-end shrink-0">
        <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Turnstile</span>
        </div>
        <span className="text-[9px] text-[#65676B]">Privacy • Terms</span>
      </div>
    </div>
  );
};
