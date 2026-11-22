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
  Compass,
  Sun,
  Moon,
  Monitor,
  Check
} from 'lucide-react';
import { UserProfile, FacebookMainTab } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { useHistoryBack } from '../../utils/backNavigation';

export type FacebookTab = FacebookMainTab;

interface FbHeaderProps {
  userProfile: UserProfile;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
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
  onSearchSubmit,
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
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();
  const [isSearching, setIsSearching] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useHistoryBack(isSearching, () => {
    setIsSearching(false);
    onSearchChange('');
  }, 'header-search');
  useHistoryBack(showPlusMenu, () => setShowPlusMenu(false), 'header-plus-menu');
  useHistoryBack(showThemeMenu, () => setShowThemeMenu(false), 'header-theme-menu');

  useEffect(() => {
    if (isSearching && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearching]);

  // If in search mode or has active search query, render the Facebook search bar on top
  if (isSearching || searchQuery.trim().length > 0) {
    return (
      <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E4E6EB] px-3 sm:px-4 py-2 shadow-xs">
        <div className="max-w-[700px] mx-auto flex items-center gap-2.5">
          <button
            onClick={() => {
              setIsSearching(false);
              onSearchChange('');
            }}
            className="p-2 rounded-full text-[#050505] hover:bg-[#F0F2F5] transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <form
            className="flex-1 relative flex items-center"
            onSubmit={(e) => {
              e.preventDefault();
              inputRef.current?.blur();
              onSearchSubmit?.(searchQuery);
            }}
          >
            <Search className="w-4 h-4 text-[#65676B] absolute left-3 pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              placeholder="Search people or pages..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  inputRef.current?.blur();
                  onSearchSubmit?.(searchQuery);
                }
              }}
              className="w-full bg-[#F0F2F5] text-black text-xs sm:text-sm pl-9 pr-9 py-2 rounded-full placeholder-[#65676B] focus:outline-none focus:ring-1 focus:ring-[#0866FF]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setIsSearching(true);
                  onSearchChange('');
                  inputRef.current?.focus();
                }}
                className="absolute right-2.5 p-1 rounded-full text-[#65676B] hover:text-black hover:bg-[#E4E6EB] cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E4E6EB] shadow-xs">
      <div className="max-w-[700px] mx-auto px-2 sm:px-4 py-2 flex items-center justify-between gap-1 sm:gap-2">
        {/* Left: Optional Back Arrow or Menu + Logo */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full text-black hover:bg-[#F0F2F5] transition-colors cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          <button
            onClick={onOpenMenu}
            className="p-1 rounded-full text-black hover:bg-[#F0F2F5] transition-colors cursor-pointer shrink-0"
            title="Menu"
          >
            <Menu className="w-6 h-6 stroke-[2.5]" />
          </button>

          <span className="font-black text-[15px] min-[390px]:text-[17px] sm:text-2xl tracking-tight text-[#0866FF] flex items-center select-none font-sans whitespace-nowrap">
            Peaceverse24.com
          </span>
        </div>

        {/* Right: Qibla, Theme, Plus (+), Search, Messenger */}
        <div className="flex items-center gap-1 sm:gap-2 relative shrink-0">
          {onOpenQibla && (
            <button
              type="button"
              onClick={onOpenQibla}
              className="h-8 sm:h-9 px-2 sm:px-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              title="Global Qibla & Prayer Times"
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Qibla</span>
            </button>
          )}

          {/* Theme: Light / Dark / System */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowPlusMenu(false);
                setShowThemeMenu((prev) => !prev);
              }}
              className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-full transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap ${
                showThemeMenu
                  ? 'bg-[#0866FF] text-white'
                  : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-black'
              }`}
              title="Theme: Light / Dark / System"
              aria-label="Theme: Light / Dark / System"
            >
              {themeMode === 'system' ? (
                <Monitor className="w-4 h-4 shrink-0" />
              ) : resolvedTheme === 'dark' ? (
                <Moon className="w-4 h-4 shrink-0" />
              ) : (
                <Sun className="w-4 h-4 shrink-0 text-amber-500" />
              )}
              <span className="hidden md:inline capitalize">
                Theme: {themeMode}
              </span>
            </button>

            {showThemeMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowThemeMenu(false)}
                />
                <div className="absolute right-0 top-11 z-50 w-52 bg-white rounded-2xl shadow-2xl border border-[#E4E6EB] py-2 overflow-hidden animate-in fade-in zoom-in-95 text-black">
                  <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#65676B] border-b border-[#E4E6EB]">
                    Theme: Light / Dark / System
                  </div>
                  {(
                    [
                      { mode: 'light', label: 'Light', Icon: Sun },
                      { mode: 'dark', label: 'Dark', Icon: Moon },
                      { mode: 'system', label: 'System', Icon: Monitor },
                    ] as Array<{ mode: ThemeMode; label: string; Icon: React.ElementType }>
                  ).map(({ mode, label, Icon }) => {
                    const active = themeMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setThemeMode(mode);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full px-3.5 py-2.5 flex items-center justify-between transition-colors text-left cursor-pointer ${
                          active ? 'bg-[#E7F3FF] text-[#0866FF]' : 'hover:bg-[#F0F2F5]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 stroke-[2]" />
                          <span className="text-sm font-semibold">{label}</span>
                        </div>
                        {active && <Check className="w-4 h-4 text-[#0866FF]" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Create (+) */}
          <div className="relative">
            <button
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-colors flex items-center justify-center shadow-xs cursor-pointer ${
                showPlusMenu
                  ? 'bg-[#0866FF] text-white'
                  : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-black'
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
                  className="absolute right-0 top-11 z-50 w-48 bg-white rounded-2xl shadow-2xl border border-[#E4E6EB] py-2 overflow-hidden animate-in fade-in zoom-in-95 text-black"
                >
                  <button
                    onClick={() => {
                      setShowPlusMenu(false);
                      onOpenCreatePost();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3.5 hover:bg-[#F0F2F5] transition-colors text-left"
                  >
                    <Edit3 className="w-5 h-5 stroke-[2] text-black" />
                    <span className="text-sm font-semibold">{t.post || 'Post'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowPlusMenu(false);
                      if (onOpenCreateStory) onOpenCreateStory();
                      else onOpenCreatePost();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3.5 hover:bg-[#F0F2F5] transition-colors text-left"
                  >
                    <PlusCircle className="w-5 h-5 stroke-[2] text-black" />
                    <span className="text-sm font-semibold">{t.story || 'Story'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowPlusMenu(false);
                      if (onOpenCreateReel) onOpenCreateReel();
                      else onOpenCreatePost();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3.5 hover:bg-[#F0F2F5] transition-colors text-left"
                  >
                    <Film className="w-5 h-5 stroke-[2] text-black" />
                    <span className="text-sm font-semibold">{t.reel || 'Reel'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowPlusMenu(false);
                      if (onOpenLive) onOpenLive();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3.5 hover:bg-[#F0F2F5] transition-colors text-left border-t border-[#E4E6EB]"
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
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] text-black flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Messenger */}
          <button
            onClick={onOpenMessenger}
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] text-black flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            title="Messenger"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#e41e3f] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-xs ring-2 ring-white">
                {unreadMessagesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
