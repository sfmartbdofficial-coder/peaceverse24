import React, { useState, useEffect } from 'react';
import { Download, X, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onOpenGuide: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenGuide }) => {
  const { isInstalled, canPromptDirectly, promptInstall } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState(false);

  useEffect(() => {
    // If already running inside installed standalone app, do not show
    if (isInstalled) return;

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('qalby_pwa_banner_dismissed');
    if (dismissed) return;

    // Show after 1.5s delay for smooth non-intrusive entrance
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem('qalby_pwa_banner_dismissed', 'true');
    } catch {}
  };

  const handleInstallClick = async () => {
    if (canPromptDirectly) {
      const result = await promptInstall();
      if (result === 'accepted') {
        setInstalledSuccessfully(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      } else if (result === 'manual') {
        onOpenGuide();
      }
    } else {
      // Open detailed step-by-step installation guide
      onOpenGuide();
    }
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-50 animate-in slide-in-from-bottom-2 duration-200 pointer-events-auto">
      <div className="bg-[#242526]/95 backdrop-blur-md text-white rounded-full border border-[#393a3b] shadow-2xl py-1.5 px-2.5 sm:px-3 flex items-center justify-between gap-2">
        
        {installedSuccessfully ? (
          <div className="flex items-center justify-center gap-1.5 w-full py-0.5 text-emerald-400 text-xs font-semibold">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>মাশাআল্লাহ! ইন্সটল সম্পন্ন হয়েছে</span>
          </div>
        ) : (
          <>
            {/* Left: Tiny App Icon + Concise Text */}
            <div className="flex items-center gap-2 min-w-0 flex-1 pl-0.5">
              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-[#393a3b] bg-neutral-800">
                <img
                  src="/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg"
                  alt="Qalby"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-[#e4e6eb] truncate">
                Peaceverse অ্যাপ ফোনে ইন্সটল করুন
              </p>
            </div>

            {/* Right: Slim Install button + Compact Dismiss */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-2.5 sm:px-3 py-1 rounded-full bg-[#1877F2] hover:bg-[#166fe5] active:scale-95 text-white text-[11px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1"
                title="১ ক্লিকে অ্যাপ ইন্সটল করুন"
              >
                <Download className="w-3 h-3 stroke-[2.5]" />
                <span>ইন্সটল</span>
              </button>

              <button
                onClick={handleDismiss}
                className="p-1 rounded-full text-[#b0b3b8] hover:text-white hover:bg-[#3a3b3c] transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
