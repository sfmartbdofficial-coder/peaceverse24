import React, { useState, useEffect } from 'react';
import { Download, X, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onOpenGuide: () => void;
}

const HIDE_BANNER_KEY = 'hideInstallBanner';
const HIDE_BANNER_AT_KEY = 'hideInstallBannerAt';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenGuide }) => {
  const { isInstalled, canPromptDirectly, promptInstall } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState(false);

  useEffect(() => {
    // If already running inside installed standalone app, do not show
    if (isInstalled) return;

    try {
      if (localStorage.getItem(HIDE_BANNER_KEY) === 'true') {
        const hiddenAt = Number(localStorage.getItem(HIDE_BANNER_AT_KEY) || '0');
        // Stay hidden unless 7 days have passed since dismissal
        if (!hiddenAt || Date.now() - hiddenAt < SEVEN_DAYS_MS) {
          return;
        }
        // 7 days elapsed -> allow showing again once
        localStorage.removeItem(HIDE_BANNER_KEY);
        localStorage.removeItem(HIDE_BANNER_AT_KEY);
      }
    } catch {}

    // Show after 1.5s delay for smooth non-intrusive entrance
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleDismiss = () => {
    // Persist dismissal immediately so even instant refresh keeps it hidden
    try {
      localStorage.setItem(HIDE_BANNER_KEY, 'true');
      localStorage.setItem(HIDE_BANNER_AT_KEY, String(Date.now()));
    } catch {}

    // Slide up and disappear with smooth animation
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 260);
  };

  const handleInstallClick = async () => {
    if (canPromptDirectly) {
      const result = await promptInstall();
      if (result === 'accepted') {
        setInstalledSuccessfully(true);
        try {
          localStorage.setItem(HIDE_BANNER_KEY, 'true');
          localStorage.setItem(HIDE_BANNER_AT_KEY, String(Date.now()));
        } catch {}
        setTimeout(() => {
          setIsClosing(true);
          setTimeout(() => setIsVisible(false), 260);
        }, 1800);
      } else if (result === 'manual') {
        onOpenGuide();
      }
    } else {
      onOpenGuide();
    }
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div
      className={`fixed bottom-16 left-1/2 -translate-x-1/2 w-[94%] max-w-[430px] z-50 pointer-events-auto transition-all duration-250 ease-out ${
        isClosing
          ? '-translate-y-4 opacity-0 scale-95'
          : 'translate-y-0 opacity-100 scale-100 animate-in slide-in-from-bottom-2 duration-200'
      }`}
    >
      <div className="bg-[#242526]/95 backdrop-blur-md text-white rounded-2xl border border-[#3E4042] shadow-2xl py-2 px-3 flex items-center justify-between gap-2.5">
        {installedSuccessfully ? (
          <div className="flex items-center justify-center gap-1.5 w-full py-1 text-emerald-400 text-xs font-semibold">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>মাশাআল্লাহ! ইন্সটল সম্পন্ন হয়েছে</span>
          </div>
        ) : (
          <>
            {/* Left: App Icon + Clear Install Prompt */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 border border-[#3E4042] bg-neutral-800 shadow-xs">
                <img
                  src="/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg"
                  alt="Peaceverse"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs sm:text-[13px] font-semibold text-[#E4E6EB] truncate">
                Peaceverse অ্যাপ ফোনে ইন্সটল করুন
              </p>
            </div>

            {/* Right: Install Button + Big, Clear Facebook-Style Dismiss [X] */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-full bg-[#0866FF] hover:bg-[#166FE5] active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1"
                title="১ ক্লিকে অ্যাপ ইন্সটল করুন"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>ইন্সটল</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Close install banner"
                title="বন্ধ করুন (Close)"
                className="w-8 h-8 rounded-full bg-[#3A3B3C] hover:bg-[#4E4F50] active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
              >
                <X className="w-4 h-4 stroke-[2.75]" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
