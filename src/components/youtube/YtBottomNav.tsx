import React from 'react';
import { Home, Plus, Radio } from 'lucide-react';

interface YtBottomNavProps {
  activeTab: 'home' | 'shorts' | 'live' | 'profile';
  liveRoomsCount?: number;
  onSelectHome: () => void;
  onOpenCreate: () => void;
  onSelectLive: () => void;
}

/**
 * STRICTLY 3 BUTTONS Bottom Navigation:
 * 1. Home - Video Feed
 * 2. + (Center Big Button) - Upload Video / Go Live
 * 3. Live - Peace Live Rooms
 */
export const YtBottomNav: React.FC<YtBottomNavProps> = ({
  activeTab,
  liveRoomsCount = 0,
  onSelectHome,
  onOpenCreate,
  onSelectLive,
}) => {
  return (
    <nav
      aria-label="Primary Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-xl mx-auto h-16 px-6 grid grid-cols-3 items-center">
        {/* 1. Home */}
        <button
          type="button"
          onClick={onSelectHome}
          className={`flex flex-col items-center justify-center gap-0.5 h-12 cursor-pointer transition-colors ${
            activeTab === 'home' ? 'text-[#DC2626]' : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <Home className="w-6 h-6" strokeWidth={activeTab === 'home' ? 2.4 : 2} />
          <span className="text-[11px] font-bold leading-none">Home</span>
        </button>

        {/* 2. Center Big + Button */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenCreate}
            aria-label="Upload Video or Go Live"
            className="w-13 h-13 -mt-3 rounded-full bg-gradient-to-tr from-[#DC2626] via-[#EF4444] to-[#16A34A] text-white shadow-lg shadow-red-500/25 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center border-4 border-white cursor-pointer"
          >
            <Plus className="w-7 h-7" strokeWidth={2.75} />
          </button>
        </div>

        {/* 3. Live */}
        <button
          type="button"
          onClick={onSelectLive}
          className={`relative flex flex-col items-center justify-center gap-0.5 h-12 cursor-pointer transition-colors ${
            activeTab === 'live' ? 'text-[#16A34A]' : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <div className="relative">
            <Radio className="w-6 h-6" strokeWidth={activeTab === 'live' ? 2.4 : 2} />
            {liveRoomsCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#DC2626] text-white text-[9px] font-extrabold flex items-center justify-center">
                {liveRoomsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold leading-none">Live</span>
        </button>
      </div>
    </nav>
  );
};
