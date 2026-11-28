import React from 'react';
import { Search, X, Film, Coins } from 'lucide-react';
import { Peaceverse24Logo } from './Peaceverse24Logo';
import { UserProfile } from '../../types';

interface YtTopHeaderProps {
  userProfile: UserProfile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit?: () => void;
  onLogoClick: () => void;
  onOpenShorts: () => void;
  isShortsActive?: boolean;
  onOpenWallet: () => void;
  onOpenProfile: () => void;
}

export const YtTopHeader: React.FC<YtTopHeaderProps> = ({
  userProfile,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onLogoClick,
  onOpenShorts,
  isShortsActive,
  onOpenWallet,
  onOpenProfile,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto h-14 px-3 sm:px-5 flex items-center justify-between gap-2.5">
        {!mobileSearchOpen ? (
          <>
            <Peaceverse24Logo compact onClick={onLogoClick} />

            {/* Desktop Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSearchSubmit?.();
              }}
              className="hidden sm:flex flex-1 max-w-md mx-3 items-center bg-zinc-100 border border-zinc-200 rounded-full px-3.5 h-10 focus-within:border-[#16A34A] focus-within:bg-white transition-colors"
            >
              <Search className="w-4 h-4 text-zinc-500 shrink-0 mr-2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Peaceverse24 videos, Quran, lectures..."
                className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="p-1 text-zinc-500 hover:text-zinc-900 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Right Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setMobileSearchOpen(true)}
                className="sm:hidden w-10 h-10 rounded-full flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                aria-label="Search videos"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onOpenShorts}
                className={`h-9 px-2.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isShortsActive
                    ? 'bg-[#DC2626] text-white'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                }`}
                aria-label="Peace Shorts"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Shorts</span>
              </button>

              <button
                type="button"
                onClick={onOpenWallet}
                className="h-9 px-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                aria-label="Coins Wallet"
              >
                <Coins className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>{(userProfile.goldenCoins ?? 0).toLocaleString()}</span>
              </button>

              <button
                type="button"
                onClick={onOpenProfile}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#16A34A]/40 hover:border-[#16A34A] transition-colors cursor-pointer shrink-0"
                aria-label="My Studio Profile"
              >
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                />
              </button>
            </div>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearchSubmit?.();
            }}
            className="flex flex-1 items-center gap-2"
          >
            <div className="flex flex-1 items-center bg-zinc-100 border border-zinc-200 rounded-full px-3.5 h-10 focus-within:border-[#16A34A] focus-within:bg-white">
              <Search className="w-4 h-4 text-zinc-500 shrink-0 mr-2" />
              <input
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Peaceverse24 videos..."
                className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="p-1 text-zinc-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="px-2.5 h-10 text-xs font-bold text-zinc-700 cursor-pointer"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </header>
  );
};
