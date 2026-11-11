import React from 'react';
import { X, RefreshCw, ChevronRight, ShieldCheck, ArrowRight, Bell } from 'lucide-react';
import { PageItem } from '../../types';

interface FbSwitchToPageSheetProps {
  isOpen: boolean;
  onClose: () => void;
  page: PageItem | null;
  onConfirmSwitch: (page: PageItem) => void;
  onViewPageWithoutSwitch?: (page: PageItem) => void;
}

export const FbSwitchToPageSheet: React.FC<FbSwitchToPageSheetProps> = ({
  isOpen,
  onClose,
  page,
  onConfirmSwitch,
  onViewPageWithoutSwitch,
}) => {
  if (!isOpen || !page) return null;

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#242526] rounded-t-[28px] p-5 text-[#050505] dark:text-white shadow-2xl animate-in slide-in-from-bottom duration-200 select-none font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full mx-auto mb-4" />

        {/* Centered Large Circular Page Avatar (Matching Screenshot 2) */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-xl mb-3">
            <img
              src={page.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
              alt={page.name}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80';
              }}
              className="w-full h-full rounded-full object-cover bg-neutral-900 border-2 border-white dark:border-[#242526]"
            />
          </div>

          <h2 className="text-xl font-extrabold text-[#050505] dark:text-white leading-tight">
            Switch to <span className="text-[#0866FF]">{page.name}</span>.
          </h2>
          <p className="text-xs text-[#65676B] dark:text-[#b0b3b8] mt-1 max-w-xs">
            এই পেজে সুইচ করলে আপনি পেজ হিসেবে পোস্ট, রিলস তৈরি ও পরিচালনা করতে পারবেন। যেকোনো সময় ব্যক্তিগত আইডিতে ফিরতে পারবেন।
          </p>
        </div>

        {/* Middle Card with Page Avatar, Name, Notifications and Blue Switch Button */}
        <div className="bg-[#F0F2F5] dark:bg-[#18191a] rounded-2xl p-3.5 border border-[#E4E6EB] dark:border-[#393a3b] flex items-center justify-between gap-3 mb-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={page.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
              alt={page.name}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80';
              }}
              className="w-12 h-12 rounded-full object-cover shrink-0 border border-neutral-300 dark:border-neutral-700 shadow-xs"
            />
            <div className="min-w-0">
              <h3 className="font-bold text-[15px] text-[#050505] dark:text-white truncate">
                {page.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#65676B] dark:text-[#b0b3b8] mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#0866FF] shrink-0" />
                <span className="font-medium">৫২টি নতুন নোটিফিকেশন</span>
              </div>
            </div>
          </div>

          {/* Bright Blue Switch Button (Matching Screenshot 2) */}
          <button
            onClick={() => {
              onConfirmSwitch(page);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 shrink-0 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Switch</span>
            <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Action: See all options / View Page Profile directly */}
        <div className="space-y-2">
          {onViewPageWithoutSwitch && (
            <button
              onClick={() => {
                onViewPageWithoutSwitch(page);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-[#050505] dark:text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              সুইচ না করে পেজ প্রোফাইল দেখুন (View Page)
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 text-center text-xs font-semibold text-[#65676B] dark:text-[#b0b3b8] hover:text-[#050505] dark:hover:text-white transition-colors cursor-pointer"
          >
            বাতিল করুন (Cancel)
          </button>
        </div>
      </div>
    </div>
  );
};
