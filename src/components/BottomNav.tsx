import React from 'react';
import { Home, Flame, Tv, FolderHeart, Plus, Bookmark } from 'lucide-react';

export type NavTab = 'home' | 'shorts' | 'subscriptions' | 'saved' | 'library' | 'quran';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  savedCount: number;
  onOpenUploadModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  savedCount,
  onOpenUploadModal,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-md border-t border-neutral-800/80 px-2 py-1.5 transition-all lg:hidden">
      <div className="max-w-md mx-auto flex items-center justify-between">
        
        {/* 1. Home */}
        <button
          onClick={() => {
            onTabChange('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
            currentTab === 'home' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {currentTab === 'home' && (
            <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">হোম</span>
        </button>

        {/* 2. Shorts */}
        <button
          onClick={() => {
            onTabChange('shorts');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
            currentTab === 'shorts' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {currentTab === 'shorts' && (
            <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
          <Flame className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">শর্টস</span>
        </button>

        {/* 3. Center Create (+) Button like YouTube Mobile */}
        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={onOpenUploadModal}
            className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            title="Create Halal Video"
          >
            <Plus className="w-5 h-5 text-emerald-400" />
          </button>
        </div>

        {/* 4. Subscriptions */}
        <button
          onClick={() => {
            onTabChange('subscriptions');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
            currentTab === 'subscriptions' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {currentTab === 'subscriptions' && (
            <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
          <Tv className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">সাবস্ক্রিপশন</span>
        </button>

        {/* 5. You (Library & Saved) */}
        <button
          onClick={() => {
            onTabChange('library');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
            currentTab === 'library' || currentTab === 'saved'
              ? 'text-emerald-400 font-bold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {(currentTab === 'library' || currentTab === 'saved') && (
            <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
          <FolderHeart className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">আপনি</span>
        </button>

      </div>
    </nav>
  );
};
