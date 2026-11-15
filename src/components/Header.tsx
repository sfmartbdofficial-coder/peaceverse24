import React, { useState } from 'react';
import {
  Search,
  Mic,
  Bell,
  Menu,
  Plus,
  Video,
  Radio,
  User,
  ShieldCheck,
  Settings,
  X,
  Sparkles,
  CheckCircle2,
  Bookmark,
  Volume2
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSidebar: () => void;
  onOpenUploadModal: () => void;
  onOpenNotifications: () => void;
  savedCount: number;
  onOpenSavedTab: () => void;
  unreadNotifications: boolean;
  onOpenHalalPolicy: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onToggleSidebar,
  onOpenUploadModal,
  onOpenNotifications,
  savedCount,
  onOpenSavedTab,
  unreadNotifications,
  onOpenHalalPolicy,
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [showVoiceToast, setShowVoiceToast] = useState(false);
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleMicClick = () => {
    setMicActive(true);
    setShowVoiceToast(true);

    // Try web speech API if supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'bn-BD';
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            onSearchChange(transcript);
          }
          setMicActive(false);
          setShowVoiceToast(false);
        };
        recognition.onerror = () => {
          setMicActive(false);
          setShowVoiceToast(false);
        };
        recognition.start();
        return;
      } catch (err) {}
    }

    setTimeout(() => {
      setMicActive(false);
      setShowVoiceToast(false);
    }, 2800);
  };

  const sampleSearchSuggestions = [
    'সূরা আর-রহমান',
    'সহীহ বুখারী ১ম হাদিস',
    'মক্কা লাইভ ২৪/৭',
    'সকাল সন্ধ্যার জিকির',
    'হালাল নাশিদ',
    'মুফতি মেনক',
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E4E6EB] px-2 sm:px-4 py-2 transition-all">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Hamburger + Peaceverse24.com Logo */}
        <div className={`flex items-center gap-1.5 sm:gap-3 flex-shrink-0 ${isSearchExpanded ? 'hidden sm:flex' : 'flex'}`}>
          {/* Hamburger toggle button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-full hover:bg-[#F0F2F5] text-[#65676B] hover:text-black transition-colors"
            aria-label="Toggle Sidebar Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Peaceverse24.com Logo & Brand */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onSearchChange('')}
          >
            <div className="relative">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-[#E4E6EB] shadow-2xs p-0.5 bg-white">
                <img
                  src="/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg"
                  alt="Peaceverse24.com Logo"
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black text-lg sm:text-xl tracking-tight text-[#0866FF] flex items-center">
                  Peaceverse24.com
                </span>
                <span className="text-[9px] font-bold text-[#65676B] bg-[#F0F2F5] px-1.5 py-0.5 rounded hidden md:inline">
                  HALAL
                </span>
              </div>
              <span className="text-[9px] text-emerald-700 tracking-wider hidden sm:inline font-bengali">
                ১০০% হালাল ভিডিও প্ল্যাটফর্ম
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className={`flex-1 max-w-2xl mx-auto flex items-center gap-1.5 sm:gap-3 ${isSearchExpanded ? 'w-full' : 'max-w-md sm:max-w-xl'}`}>
          {isSearchExpanded && (
            <button
              onClick={() => {
                setIsSearchExpanded(false);
                onSearchChange('');
              }}
              className="p-2 text-[#65676B] hover:text-black rounded-full hover:bg-[#F0F2F5] sm:hidden flex-shrink-0"
              aria-label="Back"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="relative flex-1 flex items-center">
            <div className="relative w-full flex items-center">
              <input
                type="text"
                placeholder="কুরআন, হাদিস, দোয়া, নাশিদ বা বক্তা অনুসন্ধান..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchExpanded(true)}
                className="w-full bg-[#F0F2F5] text-xs sm:text-sm text-black placeholder-[#65676B] rounded-full pl-9 pr-9 py-2 sm:py-2.5 border border-[#E4E6EB] focus:outline-none focus:border-[#0866FF] focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-[#65676B] absolute left-3 pointer-events-none" />

              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 text-[#65676B] hover:text-black p-0.5"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Voice Search Mic Button */}
          <button
            onClick={handleMicClick}
            title="ভয়েস সার্চ (Voice Search)"
            className={`p-2 sm:p-2.5 rounded-full border transition-all flex-shrink-0 ${
              micActive
                ? 'bg-[#0866FF] border-[#0866FF] text-white animate-pulse'
                : 'bg-[#F0F2F5] border-[#E4E6EB] text-[#65676B] hover:bg-[#E4E6EB] hover:text-black'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions (Create +, Notifications, Profile) */}
        <div className={`flex items-center gap-1 sm:gap-2 flex-shrink-0 ${isSearchExpanded ? 'hidden sm:flex' : 'flex'}`}>
          {/* Create (+) Video Button */}
          <div className="relative">
            <button
              onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black text-xs font-semibold border border-[#E4E6EB] transition-colors"
              title="ভিডিও বা কন্টেন্ট তৈরি করুন"
            >
              <Plus className="w-4 h-4 text-[#0866FF]" />
              <span className="hidden sm:inline">Create</span>
            </button>

            {createDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setCreateDropdownOpen(false)}
                />
                <div className="absolute right-0 top-10 z-50 w-52 py-1.5 bg-white border border-[#E4E6EB] rounded-xl shadow-xl text-xs text-black animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setCreateDropdownOpen(false);
                      onOpenUploadModal();
                    }}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-[#F0F2F5] flex items-center gap-3 transition-colors"
                  >
                    <Video className="w-4 h-4 text-[#0866FF]" />
                    <div>
                      <p className="font-semibold text-black">Upload video</p>
                      <p className="text-[10px] text-[#65676B]">হালাল ভিডিও আপলোড করুন</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCreateDropdownOpen(false);
                      onSearchChange('মক্কা লাইভ');
                    }}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-[#F0F2F5] flex items-center gap-3 transition-colors border-t border-[#E4E6EB]"
                  >
                    <Radio className="w-4 h-4 text-rose-600" />
                    <div>
                      <p className="font-semibold text-black">Go live</p>
                      <p className="text-[10px] text-[#65676B]">২৪/৭ সরাসরি হারামাইন লাইভ</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            title="নোটিফিকেশন ও ওয়াক্ত"
            className="relative p-2 rounded-full hover:bg-[#F0F2F5] text-black transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Halal Guarantee Quick Badge */}
          <button
            onClick={onOpenHalalPolicy}
            title="১০০% হালাল নীতি"
            className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-emerald-600 transition-colors hidden sm:flex items-center"
          >
            <ShieldCheck className="w-5 h-5" />
          </button>

          {/* User Account / Profile Button */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-8 h-8 rounded-full bg-[#0866FF] p-0.5 cursor-pointer hover:opacity-90 transition-opacity"
              title="Peaceverse24.com অ্যাকাউন্ট"
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-[#0866FF]">
                P
              </div>
            </button>

            {profileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 top-10 z-50 w-60 py-2 bg-white border border-[#E4E6EB] rounded-2xl shadow-xl text-xs text-black animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-[#E4E6EB]">
                    <p className="font-bold text-black text-sm">Peaceverse24.com Member</p>
                    <p className="text-[11px] text-[#65676B]">Peaceverse24.com Account</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      <span>100% Halal Mode: Always ON</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenSavedTab();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[#F0F2F5] flex items-center gap-2.5 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-[#65676B]" />
                      <span>সংরক্ষিত তালিকা ({savedCount})</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenHalalPolicy();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[#F0F2F5] flex items-center gap-2.5 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>হালাল নিরাপত্তা ও নীতিমালা</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Voice Search Toast / Listening Modal */}
      {showVoiceToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0866FF] border border-blue-400 text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2.5 text-xs animate-in fade-in zoom-in-95">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <span>শুনছি... বলুন: &quot;সূরা আর-রহমান&quot; বা &quot;মক্কা লাইভ&quot;</span>
        </div>
      )}
    </header>
  );
};
