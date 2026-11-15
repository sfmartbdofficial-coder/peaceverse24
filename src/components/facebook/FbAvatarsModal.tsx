import React, { useState } from 'react';
import { ChevronLeft, RefreshCw, X } from 'lucide-react';
import avatarSelfieImg from '../../assets/images/avatar_selfie_3d_1794670053647.jpg';

interface FbAvatarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarCreated?: (avatarUrl: string) => void;
}

export const FbAvatarsModal: React.FC<FbAvatarsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [noticeText, setNoticeText] = useState<string | null>(null);
  const [showTermsSheet, setShowTermsSheet] = useState(false);

  if (!isOpen) return null;

  const showNotice = (msg: string) => {
    setNoticeText(msg);
    setTimeout(() => setNoticeText(null), 2600);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden font-sans bg-gradient-to-b from-[#E9D5FF] to-[#DBEAFE]">
      {/* Top 60%: Full-screen Light Purple-to-Blue Gradient with Top-Left Back Button & Centered 3D Selfie Avatar */}
      <div className="relative flex-1 min-h-[55%] w-full flex items-end justify-center overflow-hidden">
        {/* Top-left white circle with black "<" back arrow */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-4 z-20 w-11 h-11 rounded-full bg-white hover:bg-[#F0F2F5] active:scale-95 shadow-md flex items-center justify-center text-[#050505] transition-all cursor-pointer"
          aria-label="Back"
          title="Back"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5] -ml-0.5" />
        </button>

        {/* Centered 3D Cartoon Girl with Red Hair Taking Selfie */}
        <img
          src={avatarSelfieImg}
          alt="3D Halal Avatar taking a selfie"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.fallback) {
              target.dataset.fallback = '1';
              target.src = '/assets/images/avatar_selfie_3d.jpg';
            }
          }}
          className="h-full max-h-[540px] w-auto max-w-full object-contain object-bottom select-none pointer-events-none [mask-image:linear-gradient(to_right,transparent_0%,black_14%,black_86%,transparent_100%)]"
        />
      </div>

      {/* Bottom Sheet: Pure White with Top 32px Rounded Corners */}
      <div className="relative z-10 w-full bg-white rounded-t-[32px] px-6 pt-7 pb-8 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
        <div className="max-w-[420px] mx-auto flex flex-col items-center text-center">
          {/* Title: bold black 24px centered */}
          <h2 className="text-[24px] font-bold text-[#050505] leading-tight tracking-tight">
            Create your Halal Avatar with AI
          </h2>

          {/* Subtitle: gray 14px centered, 2 lines */}
          <p className="mt-2.5 text-[14px] text-[#65676B] leading-[1.45] max-w-[340px]">
            Express yourself with your halal avatar! Create your avatar with a photo – only in the Peace app.
          </p>

          {/* Main Button: Blue #0064E0, rounded 12px, full width */}
          <button
            type="button"
            onClick={() =>
              showNotice('Opening Peace Studio to create your Halal Avatar with AI.')
            }
            className="mt-6 w-full py-3.5 px-4 rounded-[12px] bg-[#0064E0] hover:bg-[#0055BF] active:scale-[0.99] text-white text-[16px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-[18px] h-[18px] stroke-[2.4]" />
            <span>Go to Peace</span>
          </button>

          {/* Secondary Text Button: black bold 16px centered, no background */}
          <button
            type="button"
            onClick={() =>
              showNotice('Peace Kufi & Hijab manual avatar studio is opening soon.')
            }
            className="mt-4 py-2 px-4 bg-transparent text-[#050505] hover:opacity-70 text-[16px] font-bold text-center transition-opacity cursor-pointer"
          >
            Create Manually with Kufi &amp; Hijab
          </button>

          {/* Footer */}
          <p className="mt-5 text-[13px] text-[#65676B]">
            Avatars are subject to our{' '}
            <button
              type="button"
              onClick={() => setShowTermsSheet(true)}
              className="text-[#0064E0] font-medium hover:underline cursor-pointer"
            >
              terms of service
            </button>
            .
          </p>
        </div>
      </div>

      {/* Subtle White Toast Notification */}
      {noticeText && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white text-[#050505] border border-[#E4E6EB] px-4 py-2.5 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap max-w-[90vw] truncate">
          {noticeText}
        </div>
      )}

      {/* Clean White Terms of Service Sheet */}
      {showTermsSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/30 flex items-end justify-center"
          onClick={() => setShowTermsSheet(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-[24px] p-5 space-y-3 text-[#050505] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-[#050505]">Avatars Terms of Service</h3>
              <button
                type="button"
                onClick={() => setShowTermsSheet(false)}
                className="w-8 h-8 rounded-full bg-[#F0F2F5] flex items-center justify-center text-[#050505] cursor-pointer"
                aria-label="Close terms"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[13px] text-[#65676B] leading-relaxed">
              Your avatar representation is private to your account controls and follows our community safety and privacy guidelines. You can update or delete your avatar anytime.
            </p>
            <button
              type="button"
              onClick={() => setShowTermsSheet(false)}
              className="w-full py-2.5 rounded-[10px] bg-[#0064E0] text-white text-[14px] font-semibold cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
