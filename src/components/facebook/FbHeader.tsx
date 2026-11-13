import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Plus,
  Search,
  MessageCircle,
  ArrowLeft,
  X,
  Edit3,
  PlusCircle,
  Film,
  Video,
  Compass
} from 'lucide-react';
import { UserProfile, FacebookMainTab } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export type FacebookTab = FacebookMainTab;

interface FbHeaderProps {
  userProfile: UserProfile;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreatePost: () => void;
  onOpenCreateStory?: () => void;
  onOpenCreateReel?: () => void;
  onOpenLive?: () => void;
  onOpenMessenger: () => void;
  onOpenMenu: () => void;
  onOpenQibla?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
  unreadMessagesCount: number;
}

export const FbHeader: React.FC<FbHeaderProps> = ({
  userProfile: _userProfile,
  searchQuery,
  onSearchChange,
  onOpenCreatePost,
  onOpenCreateStory,
  onOpenCreateReel,
  onOpenLive,
  onOpenMessenger,
  onOpenMenu,
  onOpenQibla,
  onBack,
  showBackButton,
  unreadMessagesCount,
}) => {
  const { t } = useLanguage();
  const [isSearching, setIsSearching] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearching && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearching]);

  // If in search mode, render the Facebook search bar
  if (isSearching) {
    return (
      <header className="sticky top-0 z-40 bg-white dark:bg-[#242526] border-b border-[#E4E6EB] dark:border-[#393a3b] px-3 sm:px-4 py-2 shadow-xs">
        <div className="max-w-[700px] mx-auto flex items-center gap-2.5">
          <button
            onClick={() => {
              setIsSearching(false);
              onSearchChange('');
            }}
            className="p-2 rounded-full text-black dark:text-[#e4e6eb] hover:bg-[#F0F2F5] dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-[#65676B] dark:text-[#b0b3b8] absolute left-3 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder={t.searchPlaceholder || 'Search Peace World (posts, verses, global)...'}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#F0F2F5] dark:bg-[#3a3b3c] text-black dark:text-white text-xs sm:text-sm pl-9 pr-9 py-2 rounded-full placeholder-[#65676B] dark:placeholder-[#b0b3b8] focus:outline-none focus:ring-1 focus:ring-[#0866FF]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 p-1 rounded-full text-[#65676B] hover:text-black dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#242526] border-b border-[#E4E6EB] dark:border-[#393a3b] shadow-xs">
      <div className="max-w-[700px] mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        {/* Left: Optional Back Arrow or Menu + Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full text-black dark:text-[#e4e6eb] hover:bg-[#F0F2F5] dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          <button
            onClick={onOpenMenu}
            className="p-1 rounded-full text-black dark:text-[#e4e6eb] hover:bg-[#F0F2F5] dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer shrink-0"
            title="Menu"
          >
            <Menu className="w-6 h-6 stroke-[2.5]" />
          </button>

          <span className="font-black text-xl sm:text-2xl tracking-tight text-[#0866FF] flex items-center select-none font-sans whitespace-nowrap shrink-0">
            Peace World
          </span>
        </div>

        {/* Right: Qibla, Plus (+), Search, Messenger */}
        <div className="flex items-center gap-1.5 sm:gap-2 relative shrink-0">
          {onOpenQibla && (
            <button
              type="button"
              onClick={onOpenQibla}
              className="h-9 px-2.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              title="Global Qibla & Prayer Times"
            >
              <Compass className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Qibla</span>
            </button>
          )}

          {/* Create (+) */}
          <div className="relative">
            <button
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              className={`w-9 h-9 rounded-full transition-colors flex items-center justify-center shadow-xs cursor-pointer ${
                showPlusMenu
                  ? 'bg-[#0866FF] text-white'
                  : 'bg-[#E4E6EB] hover:bg-[#D8DADF] dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-[#050505] dark:text-[#e4e6eb]'
              }`}
              title="Create"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>

            {showPlusMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPlusMenu(false)}
                />
                <div
                  ref={menuRef}
                  className="absolute right-0 top-11 z-50 w-48 bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-neutral-200 dark:border-[#393a3b] py-2 overflow-hidden animate-in fade-in zoom-in-95 text-neutral-900 dark:text-white"
                >
                  <button
                    onClick={() => {
                      setShowPlusMenu(false);
                      onOpenCreatePost();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3.5 hover:bg-neutral-100 dark:hover:bg-[#3a3b3c] transition-colors text-left"
                  >
                    <Edit3 className="w-5 h-5 stroke-[2] text-neutral-800 dark:text-white" />
                    <span className="text-sm font-semibold">{t.post || 'Post'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowPlusMenu(false);
                      if (onOpenCreateStory) onOpenCreateStory();
                      else onOpenCreatePost();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3.5 hover:bg-neutral-100 dark:hover:bg-[#3a3b3c] transition-colors text-left"
                  >
                    <PlusCircle className="w-5 h-5 stroke-[2] text-neutral-800 dark:text-white" />
                    <span className="text-sm font-semibold">{t.story || 'Story'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowPlusMenu(false);
                      if (onOpenCreateReel) onOpenCreateReel();
                      else onOpenCreatePost();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3.5 hover:bg-neutral-100 dark:hover:bg-[#3a3b3c] transition-colors text-left"
                  >
                    <Film className="w-5 h-5 stroke-[2] text-neutral-800 dark:text-white" />
                    <span className="text-sm font-semibold">{t.reel || 'Reel'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowPlusMenu(false);
                      if (onOpenLive) onOpenLive();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3.5 hover:bg-neutral-100 dark:hover:bg-[#3a3b3c] transition-colors text-left border-t border-neutral-100 dark:border-[#393a3b]"
                  >
                    <Video className="w-5 h-5 stroke-[2] text-red-500" />
                    <span className="text-sm font-semibold text-red-500">{t.live || 'Live'}</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Search */}
          <button
            onClick={() => setIsSearching(true)}
            className="w-9 h-9 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-[#050505] dark:text-[#e4e6eb] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Messenger */}
          <button
            onClick={onOpenMessenger}
            className="relative w-9 h-9 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-[#050505] dark:text-[#e4e6eb] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            title="Messenger"
          >
            <MessageCircle className="w-5 h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#e41e3f] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-xs ring-2 ring-white dark:ring-[#242526]">
                {unreadMessagesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
