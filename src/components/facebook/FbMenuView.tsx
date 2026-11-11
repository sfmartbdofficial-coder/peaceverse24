import React, { useState } from 'react';
import {
  Search,
  Flag,
  Bookmark,
  Clock,
  Store,
  Users,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  HelpCircle,
  Settings,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Sparkles,
  Layers,
  ArrowLeft,
  FileText,
  Lock,
  Mail,
  BookOpen,
  Globe,
  Smile,
  Gift,
  Coins,
  Film,
  Newspaper,
  Play,
  UserCog,
  Radio,
  CreditCard,
  Link2,
  Moon,
  Smartphone,
  Tv,
  Home,
  Zap,
  Rocket,
  Award,
} from 'lucide-react';
import { UserProfile, FacebookMainTab } from '../../types';
import { LegalTabType } from '../legal/LegalModal';
import { useLanguage } from '../../context/LanguageContext';

// Import interactive sub-modals
import { FbAvatarsModal } from './FbAvatarsModal';
import { FbBirthdaysModal } from './FbBirthdaysModal';
import { FbEventsModal } from './FbEventsModal';
import { FbFeedsModal } from './FbFeedsModal';
import { FbFindsModal } from './FbFindsModal';
import { FbGamesModal } from './FbGamesModal';
import { FbMessengerKidsModal } from './FbMessengerKidsModal';
import { FbPeaceAiModal } from './FbPeaceAiModal';
import { FbPokesModal } from './FbPokesModal';
import { FbSettingsPrivacyModals, SettingsModalType } from './FbSettingsPrivacyModals';
import { FbAlsoFromPeaceModal, AlsoAppType } from './FbAlsoFromPeaceModal';
import { FbProfileSwitcherModal } from './FbProfileSwitcherModal';
import { FbSwitchToPageSheet } from './FbSwitchToPageSheet';
import { PageItem } from '../../types';

interface FbMenuViewProps {
  userProfile: UserProfile;
  activeSwitchedPage?: PageItem | null;
  onNavigateTab: (tab: FacebookMainTab) => void;
  onOpenProfile: () => void;
  onOpenHalalPolicy: () => void;
  onOpenAdminPortal?: () => void;
  onOpenMonetization?: () => void;
  onOpenGoldenWallet?: () => void;
  onOpenLegalTab?: (tab: LegalTabType) => void;
  onOpenInstallModal?: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onBack: () => void;
  onOpenMessenger?: () => void;
  onSwitchToPage?: (page: PageItem) => void;
  onSwitchToPersonal?: () => void;
  unreadMessagesCount?: number;
  isDarkMode?: boolean;
  onToggleDarkMode?: (isDark: boolean) => void;
}

export const FbMenuView: React.FC<FbMenuViewProps> = ({
  userProfile,
  activeSwitchedPage = null,
  onNavigateTab,
  onOpenProfile,
  onOpenHalalPolicy,
  onOpenAdminPortal,
  onOpenMonetization,
  onOpenGoldenWallet,
  onOpenLegalTab,
  onOpenInstallModal,
  onOpenAuth,
  onLogout,
  onBack,
  onOpenMessenger,
  onSwitchToPage,
  onSwitchToPersonal,
  unreadMessagesCount = 0,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const { t, currentLang, currentLangInfo, setShowLanguageModal } = useLanguage();

  // Accordion toggles: Settings and privacy & Upgrades OPEN BY DEFAULT per Screenshot 2 & 3
  const [showSettingsAccordion, setShowSettingsAccordion] = useState(true);
  const [showUpgradesAccordion, setShowUpgradesAccordion] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [seeMore, setSeeMore] = useState(false); // See more / See less toggle

  // Sub-modals state
  const [showAvatarsModal, setShowAvatarsModal] = useState(false);
  const [showBirthdaysModal, setShowBirthdaysModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showFeedsModal, setShowFeedsModal] = useState(false);
  const [showFindsModal, setShowFindsModal] = useState(false);
  const [showGamesModal, setShowGamesModal] = useState(false);
  const [showKidsModal, setShowKidsModal] = useState(false);
  const [showPeaceAiModal, setShowPeaceAiModal] = useState(false);
  const [showPokesModal, setShowPokesModal] = useState(false);
  const [settingsModalType, setSettingsModalType] = useState<SettingsModalType>(null);
  const [alsoAppType, setAlsoAppType] = useState<AlsoAppType>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [selectedSwitchPage, setSelectedSwitchPage] = useState<PageItem | null>(null);
  const [darkModeInline, setDarkModeInline] = useState(isDarkMode);

  // Load all pages for Your shortcuts row matching Screenshot 1
  const [menuPages, setMenuPages] = useState<PageItem[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_fb_pages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'page-sharif-story',
        name: "Sharif's Life Story",
        category: 'Public Figure • জীবনের গল্প',
        likes: '৪.২K লাইক',
        followersCount: 5300,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        cover: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
        role: 'Admin',
        isOwner: true,
        isLiked: true,
        description: 'দৈনন্দিন জীবনের শিক্ষণীয় অভিজ্ঞতা, তিলাওয়াত ও উম্মাহর জন্য দিকনির্দেশনা।',
        bio: 'সত্য ঘটনা থেকে শিক্ষা। জীবনের গল্প, সংগ্রাম আর ঘুরে দাঁড়ানোর কথা। - Sharif',
      },
      {
        id: 'page-sf-mart',
        name: 'SF MART BD',
        category: 'Shopping & Retail',
        likes: '১.৮K লাইক',
        followersCount: 2100,
        avatar: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=300&q=80',
        cover: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
        role: 'Admin',
        isOwner: true,
        isLiked: true,
        description: 'হালাল ই-কমার্স শপ।',
      },
      {
        id: 'page-angel-mahi',
        name: 'Angel Mahi',
        category: 'Creator • ইসলামিক কনটেন্ট',
        likes: '৯৮০ লাইক',
        followersCount: 1100,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1000&q=80',
        role: 'Admin',
        isOwner: true,
        isLiked: true,
        description: 'উম্মাহর জন্য শিক্ষণীয় ভিডিও।',
      },
    ];
  });

  const handleMessengerClick = () => {
    if (onOpenMessenger) {
      onOpenMessenger();
    } else {
      onNavigateTab('friends');
    }
  };

  return (
    <div className="max-w-[500px] mx-auto min-h-screen bg-[#F0F2F5] text-neutral-900 pb-24 p-3 sm:p-4 space-y-3 font-sans select-none">
      
      {/* 1. TOP HEADER: Back arrow, Menu title, Settings gear, Search, Messenger mail/lightning icon */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-full hover:bg-neutral-200 text-neutral-800 transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          <h1 className="font-bold text-2xl text-neutral-900">Menu</h1>
        </div>

        {/* Right side icons: Settings, Search, Messenger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsModalType('settings')}
            className="w-9 h-9 rounded-full bg-neutral-200/80 hover:bg-neutral-300 text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={() => onNavigateTab('home')}
            className="w-9 h-9 rounded-full bg-neutral-200/80 hover:bg-neutral-300 text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Messenger Icon: Blue dot with lightning bolt / chat like Facebook */}
          <button
            onClick={handleMessengerClick}
            className="relative w-9 h-9 rounded-full bg-[#0866FF] hover:bg-[#1877F2] text-white flex items-center justify-center transition-transform active:scale-95 shadow-xs cursor-pointer"
            title="Messenger Chat"
          >
            <Zap className="w-5 h-5 fill-white stroke-white" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-[#E41E3F] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 ring-2 ring-white">
                {unreadMessagesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 1. PROFILE CARD (Matching Facebook Screenshot 1):
          Left: User Profile or active Page card
          Right: Switch account icon and dropdown with 9+ red badge */}
      <div
        onClick={onOpenProfile}
        className="bg-white rounded-[12px] p-3 shadow-xs border border-neutral-200/80 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          {activeSwitchedPage ? (
            <img
              src={activeSwitchedPage.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
              alt={activeSwitchedPage.name}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80';
              }}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#0866FF] shadow-xs shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#0866FF] text-white font-bold text-base flex items-center justify-center shadow-xs shrink-0">
              SI
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-bold text-[16px] text-neutral-900 leading-tight truncate">
              {activeSwitchedPage
                ? activeSwitchedPage.name
                : userProfile.name && userProfile.name !== 'New Member'
                ? userProfile.name
                : 'Sharif Hasan'}
            </h2>
            {activeSwitchedPage && (
              <p className="text-[11px] text-[#0866FF] font-semibold mt-0.5">
                পেজ মোডে আছেন • প্রোফাইলে ফিরুন
              </p>
            )}
          </div>
        </div>

        {/* Right side: switch account icon (circular arrow) and dropdown arrow with 9+ red badge matching Screenshot 1 */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              if (activeSwitchedPage && onSwitchToPersonal) {
                onSwitchToPersonal();
              } else {
                setShowProfileSwitcher(true);
              }
            }}
            className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-800 transition-colors cursor-pointer"
            title="Switch account"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowProfileSwitcher(true)}
            className="relative w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-800 transition-colors cursor-pointer"
            title="Accounts"
          >
            <ChevronDown className="w-4 h-4" />
            {/* Red 9+ Badge from Screenshot 1 */}
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#E41E3F] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 ring-2 ring-white shadow-xs">
              9+
            </span>
          </button>
        </div>
      </div>

      {/* 1.5. YOUR SHORTCUTS (আপনার শর্টকাট - Exact Matching Facebook Screenshot 1) */}
      <div className="pt-0.5 pb-1">
        <h3 className="text-[15px] font-bold text-neutral-900 mb-2 px-1">Your shortcuts</h3>
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 px-1">
          {/* If currently switched to a page, show personal profile shortcut to switch back */}
          {activeSwitchedPage && (
            <div
              onClick={() => {
                if (onSwitchToPersonal) onSwitchToPersonal();
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
              style={{ width: '74px' }}
            >
              <div className="relative w-[68px] h-[68px] rounded-[20px] bg-[#0866FF] text-white flex items-center justify-center font-bold text-lg shadow-sm border border-neutral-200 group-hover:scale-105 transition-transform">
                SI
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs">
                  <RefreshCw className="w-3 h-3 text-white" />
                </div>
              </div>
              <p className="text-[12px] font-medium text-neutral-800 text-center truncate w-full group-hover:text-[#0866FF]">
                {userProfile.name?.split(' ')[0] || 'Sharif'}
              </p>
            </div>
          )}

          {/* Page Shortcuts from Screenshot 1: Sharif's Life Story, SF MART BD, Angel Mahi */}
          {menuPages.map((page) => (
            <div
              key={page.id}
              onClick={() => setSelectedSwitchPage(page)}
              className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
              style={{ width: '74px' }}
            >
              <div className="relative w-[68px] h-[68px] rounded-[20px] overflow-hidden bg-neutral-900 shadow-sm border border-neutral-200 group-hover:scale-105 transition-transform">
                <img
                  src={page.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
                  alt={page.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80';
                  }}
                  className="w-full h-full object-cover"
                />
                {/* Mini badge icon on bottom right */}
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white dark:bg-neutral-800 border border-neutral-300 flex items-center justify-center shadow-xs">
                  <Film className="w-3 h-3 text-red-500" />
                </div>
              </div>
              <p className="text-[12px] font-medium text-neutral-800 text-center truncate w-full group-hover:text-[#0866FF]">
                {page.name.length > 12 ? `${page.name.slice(0, 10)}...` : page.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN MENU (Genuine Facebook features in order: Pages, Saved, Memories, Marketplace, Groups, Reels, Feeds, Friends, Video) */}
      <div className="bg-white rounded-[12px] p-2 shadow-xs border border-neutral-200/80 space-y-0.5">
        
        {/* 1. Pages (flag icon) */}
        <button
          onClick={() => onNavigateTab('pages')}
          className="w-full h-[44px] flex items-center gap-3.5 px-3 hover:bg-neutral-50 active:bg-neutral-100 rounded-lg transition-colors text-left cursor-pointer"
        >
          <Flag className="w-6 h-6 text-black shrink-0" />
          <span className="text-[15px] font-semibold text-neutral-900">Pages</span>
        </button>

        {/* 1.5. Peace AI (Placed right under Pages as underlined by user) */}
        <button
          onClick={() => setShowPeaceAiModal(true)}
          className="w-full py-2 px-3 hover:bg-blue-50/70 active:bg-blue-100/70 rounded-xl transition-all text-left cursor-pointer flex items-center justify-between border border-blue-100/90 bg-gradient-to-r from-blue-50/60 via-sky-50/40 to-white my-1 group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0866FF] via-[#1877F2] to-sky-400 flex items-center justify-center text-white shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 fill-white/20 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-bold text-neutral-900 group-hover:text-[#0866FF] transition-colors leading-tight">
                  Peace AI
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#0866FF] text-white tracking-wider uppercase shadow-2xs">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium truncate mt-0.5">
                {currentLang === 'bn'
                  ? 'আপনার যেকোনো প্রশ্ন বা জিজ্ঞাসার সমাধান এখান থেকে নিন'
                  : 'Solve any of your queries and questions here'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#0866FF] shrink-0 ml-1.5" />
        </button>

        {/* 1.5. Golden Wallet & Cash Out Menu Item */}
        <button
          onClick={onOpenGoldenWallet}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent hover:from-amber-500/25 active:from-amber-500/30 rounded-xl transition-all border border-amber-500/30 text-left cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-neutral-950 font-black shadow-md shadow-amber-500/20 shrink-0">
              <Coins className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-bold text-neutral-900 dark:text-white group-hover:text-amber-500 transition-colors leading-tight">
                  গোল্ডেন ওয়ালেট ও ক্যাশ আউট
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 tracking-wider uppercase shadow-2xs">
                  bKash / নগদ
                </span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold truncate mt-0.5">
                কয়েন উপহার দিন • অর্জিত কয়েন বিকাশ ও নগদে ক্যাশ আউট করুন
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-500 shrink-0 ml-1.5" />
        </button>

        {/* 2. Saved (bookmark icon) */}
        <button
          onClick={() => onNavigateTab('saved')}
          className="w-full h-[44px] flex items-center gap-3.5 px-3 hover:bg-neutral-50 active:bg-neutral-100 rounded-lg transition-colors text-left cursor-pointer"
        >
          <Bookmark className="w-6 h-6 text-black shrink-0" />
          <span className="text-[15px] font-semibold text-neutral-900">Saved</span>
        </button>

        {/* 4. Memories (clock icon) */}
        <button
          onClick={() => onNavigateTab('memories')}
          className="w-full h-[44px] flex items-center gap-3.5 px-3 hover:bg-neutral-50 active:bg-neutral-100 rounded-lg transition-colors text-left cursor-pointer"
        >
          <Clock className="w-6 h-6 text-black shrink-0" />
          <span className="text-[15px] font-semibold text-neutral-900">Memories</span>
        </button>

        {/* 5. Marketplace (shop icon) */}
        <button
          onClick={() => onNavigateTab('marketplace')}
          className="w-full h-[44px] flex items-center gap-3.5 px-3 hover:bg-neutral-50 active:bg-neutral-100 rounded-lg transition-colors text-left cursor-pointer"
        >
          <Store className="w-6 h-6 text-black shrink-0" />
          <span className="text-[15px] font-semibold text-neutral-900">Marketplace</span>
        </button>

        {/* 6. Groups (people icon) */}
        <button
          onClick={() => onNavigateTab('groups')}
          className="w-full h-[44px] flex items-center gap-3.5 px-3 hover:bg-neutral-50 active:bg-neutral-100 rounded-lg transition-colors text-left cursor-pointer"
        >
          <Users className="w-6 h-6 text-black shrink-0" />
          <span className="text-[15px] font-semibold text-neutral-900">Groups</span>
        </button>

        {/* 7. Reels (film icon) */}
        <button
          onClick={() => onNavigateTab('reels')}
          className="w-full h-[44px] flex items-center gap-3.5 px-3 hover:bg-neutral-50 active:bg-neutral-100 rounded-lg transition-colors text-left cursor-pointer"
        >
          <Film className="w-6 h-6 text-black shrink-0" />
          <span className="text-[15px] font-semibold text-neutral-900">Reels</span>
        </button>

        {/* 8. Feeds (newspaper icon) */}
        <button
          onClick={() => setShowFeedsModal(true)}
          className="w-full h-[44px] flex items-center gap-3.5 px-3 hover:bg-neutral-50 active:bg-neutral-100 rounded-lg transition-colors text-left cursor-pointer"
        >
          <Newspaper className="w-6 h-6 text-black shrink-0" />
          <span className="text-[15px] font-semibold text-neutral-900">Feeds</span>
        </button>

        {/* 9. Friends (people icon) */}
        <button
          onClick={() => onNavigateTab('friends')}
          className="w-full h-[44px] flex items-center gap-3.5 px-3 hover:bg-neutral-50 active:bg-neutral-100 rounded-lg transition-colors text-left cursor-pointer"
        >
          <Users className="w-6 h-6 text-black shrink-0" />
          <span className="text-[15px] font-semibold text-neutral-900">Friends</span>
        </button>

        {/* 10. Video (play icon) */}
        <button
          onClick={() => onNavigateTab('reels')}
          className="w-full h-[44px] flex items-center gap-3.5 px-3 hover:bg-neutral-50 active:bg-neutral-100 rounded-lg transition-colors text-left cursor-pointer"
        >
          <Play className="w-6 h-6 text-black shrink-0" />
          <span className="text-[15px] font-semibold text-neutral-900">Video</span>
        </button>

        {/* Section 2: See More / See Less (Avatars, Birthdays) */}
        {seeMore && (
          <div className="space-y-0.5 pt-0.5 animate-in fade-in">
            {/* Avatars (smile icon) */}
            <button
              onClick={() => setShowAvatarsModal(true)}
              className="w-full h-[44px] flex items-center gap-3.5 px-3 hover:bg-neutral-50 active:bg-neutral-100 rounded-lg transition-colors text-left cursor-pointer"
            >
              <Smile className="w-6 h-6 text-black shrink-0" />
              <span className="text-[15px] font-semibold text-neutral-900">Avatars</span>
            </button>

            {/* Birthdays (gift icon) */}
            <button
              onClick={() => setShowBirthdaysModal(true)}
              className="w-full h-[44px] flex items-center gap-3.5 px-3 hover:bg-neutral-50 active:bg-neutral-100 rounded-lg transition-colors text-left cursor-pointer"
            >
              <Gift className="w-6 h-6 text-black shrink-0" />
              <span className="text-[15px] font-semibold text-neutral-900">Birthdays</span>
            </button>
          </div>
        )}

        {/* "See more" / "See less" Button */}
        <button
          onClick={() => setSeeMore(!seeMore)}
          className="w-full h-[36px] bg-[#F0F2F5] hover:bg-neutral-200 text-neutral-900 font-semibold text-[14px] rounded-[8px] flex items-center justify-center gap-1.5 transition-colors mt-2 cursor-pointer"
        >
          <span>{seeMore ? 'See less' : 'See more'}</span>
          {seeMore ? <ChevronUp className="w-4 h-4 text-neutral-700" /> : <ChevronDown className="w-4 h-4 text-neutral-700" />}
        </button>

      </div>

      {/* 3. SECTIONS: Help and support, Settings and privacy, Upgrades */}
      <div className="space-y-3 pt-2">
        
        {/* Section 3: Help and support (dropdown) */}
        <div className="bg-white rounded-[12px] shadow-xs border border-neutral-200/80 overflow-hidden">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-full p-3.5 flex items-center justify-between text-neutral-900 font-semibold text-[15px] hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-neutral-700" />
              <span>Help and support</span>
            </div>
            {showHelp ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
          </button>

          {showHelp && (
            <div className="px-3 pb-3 space-y-1 text-sm border-t border-neutral-100 pt-2 animate-in fade-in">
              <button
                onClick={() => onOpenLegalTab?.('guidelines')}
                className="w-full p-2.5 rounded-lg hover:bg-neutral-50 flex items-center gap-3 text-left font-medium text-neutral-800 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-neutral-600" />
                <span>Help Center</span>
              </button>
              <button
                onClick={() => onOpenLegalTab?.('contact')}
                className="w-full p-2.5 rounded-lg hover:bg-neutral-50 flex items-center gap-3 text-left font-medium text-neutral-800 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-neutral-600" />
                <span>Support Inbox</span>
              </button>
              <button
                onClick={() => onOpenLegalTab?.('terms')}
                className="w-full p-2.5 rounded-lg hover:bg-neutral-50 flex items-center gap-3 text-left font-medium text-neutral-800 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-neutral-600" />
                <span>Terms and Policies</span>
              </button>
              <button
                onClick={onOpenHalalPolicy}
                className="w-full p-2.5 rounded-lg hover:bg-neutral-50 flex items-center gap-3 text-left font-medium text-neutral-800 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Halal Safety & Community Standards</span>
              </button>
            </div>
          )}
        </div>

        {/* Section 4: Settings and privacy (OPEN BY DEFAULT - Exact 12 items from Screenshot 2) */}
        <div className="bg-white rounded-[12px] shadow-xs border border-neutral-200/80 overflow-hidden">
          <button
            onClick={() => setShowSettingsAccordion(!showSettingsAccordion)}
            className="w-full p-3.5 flex items-center justify-between text-neutral-900 font-semibold text-[15px] hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-neutral-700" />
              <span>Settings and privacy</span>
            </div>
            {showSettingsAccordion ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
          </button>

          {showSettingsAccordion && (
            <div className="px-2 pb-3 space-y-0.5 text-sm border-t border-neutral-100 pt-1.5 animate-in fade-in">
              {/* 1. Settings (gear with person) */}
              <button
                onClick={() => setSettingsModalType('settings')}
                className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center gap-3.5 text-left font-medium text-neutral-800 cursor-pointer"
              >
                <UserCog className="w-5 h-5 text-neutral-800 shrink-0" />
                <span className="text-[14.5px]">Settings</span>
              </button>

              {/* 2. Privacy Center (lock) */}
              <button
                onClick={() => setSettingsModalType('privacy_center')}
                className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center gap-3.5 text-left font-medium text-neutral-800 cursor-pointer"
              >
                <Lock className="w-5 h-5 text-neutral-800 shrink-0" />
                <span className="text-[14.5px]">Privacy Center</span>
              </button>

              {/* 3. Time management (clock) */}
              <button
                onClick={() => setSettingsModalType('time_management')}
                className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center gap-3.5 text-left font-medium text-neutral-800 cursor-pointer"
              >
                <Clock className="w-5 h-5 text-neutral-800 shrink-0" />
                <span className="text-[14.5px]">Time management</span>
              </button>

              {/* 4. Device requests (house with check) */}
              <button
                onClick={() => setSettingsModalType('device_requests')}
                className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center gap-3.5 text-left font-medium text-neutral-800 cursor-pointer"
              >
                <Home className="w-5 h-5 text-neutral-800 shrink-0" />
                <span className="text-[14.5px]">Device requests</span>
              </button>

              {/* 5. Your Ad Activity (ad/screen icon) */}
              <button
                onClick={() => setSettingsModalType('ad_activity')}
                className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center gap-3.5 text-left font-medium text-neutral-800 cursor-pointer"
              >
                <Tv className="w-5 h-5 text-neutral-800 shrink-0" />
                <span className="text-[14.5px]">Your Ad Activity</span>
              </button>

              {/* 6. Mobile Center · banglalink (antenna/signal icon) */}
              <button
                onClick={() => setSettingsModalType('mobile_center')}
                className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center gap-3.5 text-left font-medium text-neutral-800 cursor-pointer"
              >
                <Radio className="w-5 h-5 text-neutral-800 shrink-0" />
                <span className="text-[14.5px]">Mobile Center · banglalink</span>
              </button>

              {/* 7. Orders and payments (credit card) */}
              <button
                onClick={() => setSettingsModalType('orders_payments')}
                className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center gap-3.5 text-left font-medium text-neutral-800 cursor-pointer"
              >
                <CreditCard className="w-5 h-5 text-neutral-800 shrink-0" />
                <span className="text-[14.5px]">Orders and payments</span>
              </button>

              {/* 8. Link history (link) */}
              <button
                onClick={() => setSettingsModalType('link_history')}
                className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center gap-3.5 text-left font-medium text-neutral-800 cursor-pointer"
              >
                <Link2 className="w-5 h-5 text-neutral-800 shrink-0" />
                <span className="text-[14.5px]">Link history</span>
              </button>

              {/* 9. Dark mode (moon with toggle) */}
              <div
                onClick={() => {
                  const nextVal = !darkModeInline;
                  setDarkModeInline(nextVal);
                  if (onToggleDarkMode) onToggleDarkMode(nextVal);
                  setSettingsModalType('dark_mode');
                }}
                className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between font-medium text-neutral-800 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Moon className="w-5 h-5 text-neutral-800 shrink-0" />
                  <span className="text-[14.5px]">Dark mode</span>
                </div>
                <div className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${darkModeInline ? 'bg-[#0866FF] justify-end' : 'bg-neutral-300 justify-start'}`}>
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </div>
              </div>

              {/* 10. Language (globe - show বাংলা on right) */}
              <button
                onClick={() => setShowLanguageModal(true)}
                className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between font-medium text-neutral-800 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Globe className="w-5 h-5 text-neutral-800 shrink-0" />
                  <span className="text-[14.5px]">Language</span>
                </div>
                <span className="text-[13px] text-neutral-500 font-medium">বাংলা</span>
              </button>

              {/* 11. App icon (Peaceverse 'p' icon) */}
              <button
                onClick={() => setSettingsModalType('app_icon')}
                className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center gap-3.5 text-left font-medium text-neutral-800 cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-[#0866FF] text-white font-black text-xs flex items-center justify-center shrink-0 font-sans lowercase">
                  p
                </div>
                <span className="text-[14.5px]">App icon</span>
              </button>

              {/* 12. Cellular Data Usage (phone/smartphone icon) */}
              <button
                onClick={() => setSettingsModalType('cellular_data')}
                className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center gap-3.5 text-left font-medium text-neutral-800 cursor-pointer"
              >
                <Smartphone className="w-5 h-5 text-neutral-800 shrink-0" />
                <span className="text-[14.5px]">Cellular Data Usage</span>
              </button>
            </div>
          )}
        </div>

        {/* Section 5: Upgrades (OPEN BY DEFAULT - Two colorful cards matching Screenshot 2) */}
        <div className="bg-white rounded-[12px] shadow-xs border border-neutral-200/80 overflow-hidden">
          <button
            onClick={() => setShowUpgradesAccordion(!showUpgradesAccordion)}
            className="w-full p-3.5 flex items-center justify-between text-neutral-900 font-semibold text-[15px] hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-neutral-700" />
              <span>Upgrades</span>
            </div>
            {showUpgradesAccordion ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
          </button>

          {showUpgradesAccordion && (
            <div className="p-3 border-t border-neutral-100 grid grid-cols-2 gap-3 animate-in fade-in">
              {/* Public presence card with rocket badge */}
              <div
                onClick={() => setSettingsModalType('public_presence')}
                className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-tr from-purple-900 via-indigo-700 to-pink-500 shadow-sm cursor-pointer group hover:opacity-95 transition-all p-3 flex flex-col justify-between"
              >
                {/* Abstract colorful shapes */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-pink-400/40 rounded-full blur-md" />
                <div className="absolute bottom-2 right-2 w-16 h-16 bg-purple-500/40 rounded-full blur-sm" />

                <div className="relative z-10">
                  <span className="text-[11px] font-bold text-white/90 uppercase tracking-wider">Public presence</span>
                </div>

                {/* Rocket badge at bottom-left matching Screenshot 2 */}
                <div className="relative z-10 w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-md">
                  <Rocket className="w-4 h-4 fill-blue-600" />
                </div>
              </div>

              {/* Creator Studio card with star badge */}
              <div
                onClick={() => onOpenMonetization ? onOpenMonetization() : setSettingsModalType('peace_plus')}
                className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 shadow-sm cursor-pointer group hover:opacity-95 transition-all p-3 flex flex-col justify-between"
              >
                {/* Decorative badge and photo */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] text-white font-medium">
                  <Clock className="w-3 h-3" />
                  <span>48h</span>
                </div>

                <div className="relative z-10">
                  <span className="text-[11px] font-bold text-white/90 uppercase tracking-wider">Creator Studio</span>
                </div>

                {/* Star badge at bottom-left matching Screenshot 2 */}
                <div className="relative z-10 w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-md">
                  <Award className="w-4 h-4 fill-indigo-600" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Log out Button: clean light grey matching Facebook */}
        <div className="pt-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full h-[40px] bg-[#E4E6EB] hover:bg-neutral-300 text-neutral-900 font-semibold text-[15px] rounded-[8px] flex items-center justify-center transition-colors cursor-pointer"
          >
            Log out
          </button>
        </div>

      </div>

      {/* Log out confirmation dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#242526] border border-[#393a3b] rounded-2xl p-5 max-w-sm w-full space-y-4 text-[#e4e6eb] shadow-2xl animate-in fade-in">
            <h3 className="font-bold text-lg text-white">লগআউট নিশ্চিত করুন</h3>
            <p className="text-xs text-[#b0b3b8]">
              আপনি কি নিশ্চিত যে আপনার একাউন্ট ({userProfile.name}) থেকে লগআউট করতে চান?
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  if (onLogout) {
                    await onLogout();
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition-colors cursor-pointer"
              >
                লগআউট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* RENDER ACTIVE MODALS */}
      {/* ======================================================== */}
      <FbAvatarsModal
        isOpen={showAvatarsModal}
        onClose={() => setShowAvatarsModal(false)}
      />

      <FbBirthdaysModal
        isOpen={showBirthdaysModal}
        onClose={() => setShowBirthdaysModal(false)}
      />

      <FbEventsModal
        isOpen={showEventsModal}
        onClose={() => setShowEventsModal(false)}
      />

      <FbFeedsModal
        isOpen={showFeedsModal}
        onClose={() => setShowFeedsModal(false)}
      />

      <FbFindsModal
        isOpen={showFindsModal}
        onClose={() => setShowFindsModal(false)}
      />

      <FbGamesModal
        isOpen={showGamesModal}
        onClose={() => setShowGamesModal(false)}
      />

      <FbMessengerKidsModal
        isOpen={showKidsModal}
        onClose={() => setShowKidsModal(false)}
      />

      <FbPeaceAiModal
        isOpen={showPeaceAiModal}
        onClose={() => setShowPeaceAiModal(false)}
      />

      <FbPokesModal
        isOpen={showPokesModal}
        onClose={() => setShowPokesModal(false)}
      />

      <FbSettingsPrivacyModals
        modalType={settingsModalType}
        onClose={() => setSettingsModalType(null)}
        onToggleDarkMode={(dark) => {
          setDarkModeInline(dark);
          if (onToggleDarkMode) onToggleDarkMode(dark);
        }}
      />

      <FbAlsoFromPeaceModal
        appType={alsoAppType}
        onClose={() => setAlsoAppType(null)}
      />

      {showProfileSwitcher && (
        <FbProfileSwitcherModal
          userProfile={userProfile}
          onClose={() => setShowProfileSwitcher(false)}
          onCreatePage={() => onNavigateTab('pages')}
        />
      )}

      {/* Switch to Page Bottom Sheet (Matching Facebook Screenshot 2) */}
      <FbSwitchToPageSheet
        isOpen={Boolean(selectedSwitchPage)}
        onClose={() => setSelectedSwitchPage(null)}
        page={selectedSwitchPage}
        onConfirmSwitch={(page) => {
          if (onSwitchToPage) {
            onSwitchToPage(page);
          }
          setSelectedSwitchPage(null);
          onNavigateTab('home');
        }}
        onViewPageWithoutSwitch={(page) => {
          setSelectedSwitchPage(null);
          onNavigateTab('pages');
        }}
      />

    </div>
  );
};
