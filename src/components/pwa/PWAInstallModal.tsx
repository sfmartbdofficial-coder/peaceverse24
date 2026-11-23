import React, { useState } from 'react';
import { X, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ onClose }) => {
  const { canPromptDirectly, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const [showCompactHint, setShowCompactHint] = useState(false);

  const handleDirectInstall = async () => {
    if (isPrompting) return;
    setIsPrompting(true);
    try {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1400);
        return;
      }
      if (outcome === 'manual') {
        setShowCompactHint(true);
      }
    } finally {
      setIsPrompting(false);
    }
  };

  return (
    <div
      id="installModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[340px] bg-white text-black rounded-2xl border border-[#E4E6EB] shadow-2xl p-5 text-center space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] hover:text-black flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0a0a0f] p-0.5 shadow-md border border-[#E4E6EB]">
          <img
            src="/icon-192.png"
            alt="Peaceverse24.com"
            className="w-full h-full object-cover rounded-[14px]"
          />
        </div>

        {installSuccess || isInstalled ? (
          <div className="space-y-2 py-1">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-black">ইন্সটল সম্পন্ন হয়েছে</h3>
            <p className="text-xs text-[#65676B]">
              আপনার হোম স্ক্রিনে Peaceverse24.com অ্যাপ যোগ হয়েছে।
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h2 className="text-[17px] font-bold text-black">Peaceverse24.com অ্যাপ</h2>
              <p className="text-xs text-[#65676B]">
                সরাসরি আপনার ডিভাইসে ইন্সটল করুন
              </p>
            </div>

            <button
              type="button"
              onClick={handleDirectInstall}
              disabled={isPrompting}
              className="w-full py-3 px-4 rounded-xl bg-[#0866FF] hover:bg-[#166FE5] active:scale-[0.98] disabled:opacity-70 text-white font-bold text-[15px] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isPrompting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5 stroke-[2.5]" />
              )}
              <span>ইন্সটল</span>
            </button>

            {showCompactHint && !canPromptDirectly && (
              <p className="text-[11px] text-[#65676B] bg-[#F0F2F5] rounded-lg px-3 py-2 leading-snug">
                {isIOS
                  ? 'সাফারি Share (📤) → "Add to Home Screen" ট্যাপ করুন।'
                  : 'ব্রাউজার মেনু (⋮) → "Install app" বা "Add to Home screen" এ ট্যাপ করুন।'}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
