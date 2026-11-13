import React, { useState, useEffect } from 'react';
import {
  Search,
  Flag,
  Bookmark,
  Clock,
  Store,
  Users,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  HelpCircle,
  Settings,
  ShieldCheck,
  ShieldAlert,
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
  Home,
  Zap,
  Rocket,
  Award,
  LayoutGrid,
  Video,
  Instagram,
  Briefcase,
  MessageCircle,
  AtSign,
  PhoneCall,
  BellOff,
  Ban,
  AlertTriangle,
  Info,
  Activity,
  Phone,
  Bell,
  Megaphone,
  Compass,
  X,
  Image as ImageIcon,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import { UserProfile, FacebookMainTab, NotificationItem, PageItem, PostItem } from '../../types';
import { LegalTabType } from '../legal/LegalModal';
import { useLanguage } from '../../context/LanguageContext';
import {
  loadPeaceSettings,
  savePeaceSettings,
  PeaceSettingsPrefs,
} from '../../utils/settingsStorage';
import { broadcastCreatorNotification } from '../../lib/fcm';
import { getActivePrayerPauseStatus } from '../../lib/globalPrayer';

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
import { PeaceEditsModal } from './PeaceEditsModal';
import { FbProfileSwitcherModal } from './FbProfileSwitcherModal';
import { FbSwitchToPageSheet } from './FbSwitchToPageSheet';
import { FbCreatePageLandingView } from './FbCreatePageLandingView';

interface FbMenuViewProps {
  userProfile: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
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
  onPublishReel?: (newReel: PostItem) => void;
  onNavigatePath?: (path: string) => void;
  onBroadcastNotification?: (notif: NotificationItem) => void;
}

export const FbMenuView: React.FC<FbMenuViewProps> = ({
  userProfile,
  onUpdateProfile,
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
  onPublishReel,
  onNavigatePath,
  onBroadcastNotification,
}) => {
  const { currentLang, setLanguage, setShowLanguageModal } = useLanguage();

  // Accordion toggles: Settings and privacy & Upgrades OPEN BY DEFAULT
  const [showSettingsAccordion, setShowSettingsAccordion] = useState(true);
  const [showUpgradesAccordion, setShowUpgradesAccordion] = useState(true);
  const [showAlsoAccordion, setShowAlsoAccordion] = useState(true);
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
  const [showPeaceEdits, setShowPeaceEdits] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [selectedSwitchPage, setSelectedSwitchPage] = useState<PageItem | null>(null);
  const [darkModeInline, setDarkModeInline] = useState(isDarkMode);
  const [showCreatePageLanding, setShowCreatePageLanding] = useState(false);
  const [peacePrefs, setPeacePrefs] = useState<PeaceSettingsPrefs>(() => loadPeaceSettings());

  // Creator Broadcast Modal State (Opened on [Send All])
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('প্রিয় দাদা নতুন ভিডিও আপলোড করেছেন');
  const [broadcastMessage, setBroadcastMessage] = useState('১০০% হালাল পণ্যের নতুন কালেকশন দেখুন');
  const [broadcastImage, setBroadcastImage] = useState(
    'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80'
  );
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState<{ sent: number; total: number } | null>(null);
  const [broadcastDone, setBroadcastDone] = useState(false);

  useEffect(() => {
    setDarkModeInline(isDarkMode);
  }, [isDarkMode]);

  const handleUpdatePrefs = (patch: Partial<PeaceSettingsPrefs>) => {
    setPeacePrefs((prev) => savePeaceSettings({ ...prev, ...patch }));
  };

  const prayerStatus = getActivePrayerPauseStatus(peacePrefs.prayerPauseMinutes);

  const handleSendMenuBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim() || broadcastSending) return;

    setBroadcastSending(true);
    setBroadcastDone(false);
    const totalUsers = 10000;
    setBroadcastProgress({ sent: 1200, total: totalUsers });

    const steps = [2850, 5400, 7900, 9600];
    let stepIdx = 0;
    const timer = window.setInterval(() => {
      if (stepIdx < steps.length) {
        setBroadcastProgress({ sent: steps[stepIdx], total: totalUsers });
        stepIdx += 1;
      }
    }, 220);

    try {
      await broadcastCreatorNotification({
        creatorId: userProfile?.id || 'creator-priyo-dada',
        creatorName:
          userProfile?.name && userProfile.name !== 'New Member'
            ? userProfile.name
            : 'প্রিয় দাদা',
        creatorAvatar:
          userProfile?.avatar || '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
        contentType: 'broadcast',
        title: broadcastTitle.trim(),
        body: broadcastMessage.trim(),
        thumbnail: broadcastImage.trim() || undefined,
        link: '/',
        broadcastToAll: true,
        onLocalNotify: onBroadcastNotification,
      });

      window.setTimeout(() => {
        window.clearInterval(timer);
        setBroadcastProgress({ sent: totalUsers, total: totalUsers });
        setBroadcastSending(false);
        setBroadcastDone(true);
      }, 1050);
    } catch {
      window.clearInterval(timer);
      setBroadcastProgress({ sent: totalUsers, total: totalUsers });
      setBroadcastSending(false);
      setBroadcastDone(true);
    }
  };

  // Load ONLY user-created pages for Your shortcuts (excluding demo mock pages)
  const [menuPages, setMenuPages] = useState<PageItem[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_fb_pages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const demoIds = ['page-sf-mart', 'page-sharif-story', 'page-halal-bites', 'page-angel-mahi', 'page-noor-academy'];
          return parsed.filter((p: PageItem) => p.isOwner && !demoIds.includes(p.id));
        }
      }
    } catch {}
    return [];
  });

  const handleMessengerClick = () => {
    if (onOpenMessenger) {
      onOpenMessenger();
    } else {
      onNavigateTab('friends');
    }
  };

  if (showCreatePageLanding) {
    return (
      <FbCreatePageLandingView
        onBack={() => setShowCreatePageLanding(false)}
        onPageCreated={(newPage) => {
          setMenuPages((prev) => [newPage, ...prev]);
          setShowCreatePageLanding(false);
          if (onSwitchToPage) {
            onSwitchToPage(newPage);
          }
          onNavigateTab('pages');
        }}
        onCreateFirstPost={(newPage) => {
          setMenuPages((prev) => [newPage, ...prev]);
          setShowCreatePageLanding(false);
          if (onSwitchToPage) {
            onSwitchToPage(newPage);
          }
          onNavigateTab('home');
        }}
      />
    );
  }

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
            activeSwitchedPage.avatar ? (
              <img
                src={activeSwitchedPage.avatar}
                alt={activeSwitchedPage.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#0866FF] shadow-xs shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#E7F3FF] text-[#0866FF] font-extrabold text-base flex items-center justify-center border-2 border-[#0866FF] shadow-xs shrink-0">
                {activeSwitchedPage.name.trim().charAt(0).toUpperCase()}
              </div>
            )
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

      {/* 1.2. (+) CREATE PEACEVERSE24 PAGE BUTTON */}
      <div
        onClick={() => setShowCreatePageLanding(true)}
        className="flex items-center gap-3 p-3 sm:p-3.5 bg-white rounded-2xl hover:bg-neutral-50 cursor-pointer transition-all border border-neutral-200/80 shadow-xs active:scale-[0.99] group"
        title="নতুন peaceverse24 পেজ খুলুন"
      >
        <div className="w-10 h-10 rounded-full bg-neutral-100 group-hover:bg-[#0866FF]/15 text-neutral-800 group-hover:text-[#0866FF] flex items-center justify-center shrink-0 transition-colors">
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[15px] text-neutral-900 leading-tight">
            Create peaceverse24 Page
          </p>
          <p className="text-[11px] text-neutral-500 truncate">
            ব্যবসা, ব্র্যান্ড বা ব্যক্তিত্বের জন্য নতুন পেজ তৈরি করুন
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
      </div>

      {/* 1.5. YOUR SHORTCUTS (আপনার শর্টকাট - Authentic Facebook Shortcuts) */}
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
              title="ব্যক্তিগত প্রোফাইলে ফিরুন"
            >
              <div className="relative w-[68px] h-[68px] rounded-[20px] bg-[#0866FF] text-white flex items-center justify-center font-bold text-lg shadow-sm border border-neutral-200 group-hover:scale-105 transition-transform overflow-hidden">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>SI</span>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs">
                  <RefreshCw className="w-3 h-3 text-white" />
                </div>
              </div>
              <p className="text-[12px] font-medium text-neutral-800 text-center truncate w-full group-hover:text-[#0866FF]">
                {userProfile.name?.split(' ')[0] || 'Siddik'}
              </p>
            </div>
          )}

          {/* User's Created Pages (e.g. হালাল ফুড কিচেন) */}
          {menuPages
            .filter((page) => !activeSwitchedPage || page.id !== activeSwitchedPage.id)
            .map((page) => (
              <div
                key={page.id}
                onClick={() => setSelectedSwitchPage(page)}
                className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
                style={{ width: '74px' }}
                title={`${page.name} পেজে সুইচ করুন`}
              >
                <div className="relative w-[68px] h-[68px] rounded-[20px] overflow-hidden bg-[#E4E6EB] shadow-sm border border-neutral-200 group-hover:scale-105 transition-transform flex items-center justify-center">
                  {page.avatar ? (
                    <img
                      src={page.avatar}
                      alt={page.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-extrabold text-[#0866FF]">
                      {page.name.trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white dark:bg-neutral-800 border border-neutral-300 flex items-center justify-center shadow-xs">
                    <Flag className="w-3 h-3 text-[#1877F2]" />
                  </div>
                </div>
                <p className="text-[12px] font-medium text-neutral-800 text-center truncate w-full group-hover:text-[#0866FF]">
                  {page.name.length > 12 ? `${page.name.slice(0, 10)}...` : page.name}
                </p>
              </div>
            ))}

          {/* If on personal profile and no pages created yet, provide a quick create button */}
          {!activeSwitchedPage && menuPages.length === 0 && (
            <div
              onClick={() => onNavigateTab('pages')}
              className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
              style={{ width: '74px' }}
              title="নতুন পেজ তৈরি করুন"
            >
              <div className="w-[68px] h-[68px] rounded-[20px] bg-neutral-100 hover:bg-[#1877F2]/10 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-[#1877F2] transition-colors group-hover:scale-105">
                <Plus className="w-6 h-6" />
              </div>
              <p className="text-[12px] font-medium text-neutral-700 text-center truncate w-full">
                পেইজ তৈরি
              </p>
            </div>
          )}
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

        {/* Global Qibla Compass & Worldwide Prayer Times (/qibla) */}
        <button
          onClick={() => onNavigatePath?.('/qibla')}
          className="w-full h-[46px] flex items-center justify-between px-3 hover:bg-emerald-50/70 active:bg-emerald-100/70 rounded-lg transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <Compass className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-[15px] font-semibold text-neutral-900 block leading-tight">
                Qibla Compass &amp; Global Prayer
              </span>
              <span className="text-[11px] text-neutral-500 block truncate">
                Worldwide Salah times, Daily Quran &amp; live Kaaba direction
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
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

        {/* Section 4: Settings and privacy (COMPLETE 5 SECTIONS FOR PEACE WORLD - Clean White Card UI) */}
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
            <div className="px-2 pb-3 text-sm border-t border-neutral-100 pt-2 space-y-2.5 animate-in fade-in">
              {/* --- SECTION 1: ACCOUNT --- */}
              <div className="space-y-0.5">
                <p className="px-3 pt-1 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Account
                </p>

                {/* 1.1 Settings */}
                <button
                  onClick={() => setSettingsModalType('settings')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <UserCog className="w-5 h-5 text-[#0866FF] shrink-0" />
                    <span className="text-[14.5px]">Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>

                {/* 1.2 Privacy Center */}
                <button
                  onClick={() => setSettingsModalType('privacy_center')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-[14.5px]">Privacy Center</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>

                {/* 1.3 Time management (saves in localStorage and pauses notifications during Salah) */}
                <div
                  onClick={() => setSettingsModalType('time_management')}
                  className="w-full min-h-[44px] px-3 py-1.5 rounded-lg hover:bg-neutral-50 flex items-center justify-between font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Clock className="w-5 h-5 text-sky-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[14.5px] block leading-tight">Time management</span>
                      <span className="text-[11px] text-emerald-700 font-medium block truncate">
                        {peacePrefs.salahReminder && (peacePrefs.prayerTimePause || peacePrefs.quietModeSalah)
                          ? prayerStatus.paused
                            ? `🕌 Paused now (${prayerStatus.prayerName} until ${prayerStatus.untilTime})`
                            : `Salah Pause ON • Next ${prayerStatus.schedule.nextPrayer.name} ${prayerStatus.schedule.nextPrayer.time}`
                          : peacePrefs.salahReminder
                          ? 'Salah Reminder ON'
                          : 'Salah Pause & Reminder OFF'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Toggle Time Management & Prayer Pause"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextVal = !peacePrefs.salahReminder;
                      handleUpdatePrefs({
                        salahReminder: nextVal,
                        prayerTimePause: nextVal,
                        quietModeSalah: nextVal,
                      });
                    }}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                      peacePrefs.salahReminder ? 'bg-emerald-600 justify-end' : 'bg-neutral-300 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </button>
                </div>

                {/* 1.4 Device requests */}
                <button
                  onClick={() => setSettingsModalType('device_requests')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Home className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span className="text-[14.5px]">Device requests</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>
              </div>

              {/* --- SECTION 2: PREFERENCES --- */}
              <div className="space-y-0.5 pt-2 border-t border-neutral-100">
                <p className="px-3 pt-1 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Preferences
                </p>

                {/* 2.1 Your Activity Log (Renamed from Your Ad Activity) */}
                <button
                  onClick={() => setSettingsModalType('activity_log')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Activity className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="text-[14.5px]">Your Activity Log</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>

                {/* 2.2 Mobile Center · banglalink */}
                <button
                  onClick={() => setSettingsModalType('mobile_center')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Radio className="w-5 h-5 text-orange-500 shrink-0" />
                    <span className="text-[14.5px]">Mobile Center · banglalink</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>

                {/* 2.3 Orders and payments (bKash, Nagad) */}
                <button
                  onClick={() => setSettingsModalType('orders_payments')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <CreditCard className="w-5 h-5 text-pink-600 shrink-0" />
                    <span className="text-[14.5px]">Orders and payments</span>
                  </div>
                  <span className="text-[11px] font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                    bKash · নগদ
                  </span>
                </button>

                {/* 2.4 Link history */}
                <button
                  onClick={() => setSettingsModalType('link_history')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Link2 className="w-5 h-5 text-neutral-700 shrink-0" />
                    <span className="text-[14.5px]">Link history</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>

                {/* 2.5 Dark mode */}
                <div
                  onClick={() => {
                    const nextVal = !darkModeInline;
                    setDarkModeInline(nextVal);
                    if (onToggleDarkMode) onToggleDarkMode(nextVal);
                  }}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Moon className="w-5 h-5 text-indigo-700 shrink-0" />
                    <span className="text-[14.5px]">Dark mode</span>
                  </div>
                  <div
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      darkModeInline ? 'bg-[#0866FF] justify-end' : 'bg-neutral-300 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </div>
                </div>

                {/* 2.6 Language -> বাংলা / English / العربية + All 18+ Global Languages */}
                <div
                  onClick={() => setShowLanguageModal(true)}
                  className="w-full min-h-[44px] px-3 py-1.5 rounded-lg hover:bg-neutral-50 flex items-center justify-between font-medium text-neutral-800 cursor-pointer gap-2"
                >
                  <div className="flex items-center gap-3.5 shrink-0">
                    <Globe className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-[14.5px]">Language</span>
                  </div>
                  <div
                    className="flex items-center gap-1 flex-wrap justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(['bn', 'en', 'ar'] as const).map((code) => {
                      const label = code === 'bn' ? 'বাংলা' : code === 'en' ? 'English' : 'العربية';
                      const active = currentLang === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setLanguage(code)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#0866FF] text-white'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setShowLanguageModal(true)}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
                      title="All 18+ Languages"
                    >
                      18+ ▾
                    </button>
                  </div>
                </div>

                {/* 2.7 App icon */}
                <button
                  onClick={() => setSettingsModalType('app_icon')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-5 h-5 rounded-full bg-[#0866FF] text-white font-black text-xs flex items-center justify-center shrink-0 font-sans lowercase">
                      p
                    </div>
                    <span className="text-[14.5px]">App icon</span>
                  </div>
                  <span className="text-[11px] text-neutral-500 capitalize">{peacePrefs.selectedAppIcon}</span>
                </button>

                {/* 2.8 Cellular Data Usage */}
                <button
                  onClick={() => setSettingsModalType('cellular_data')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Smartphone className="w-5 h-5 text-cyan-600 shrink-0" />
                    <span className="text-[14.5px]">Cellular Data Usage</span>
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    {peacePrefs.dataSaver ? 'Data Saver ON' : 'Standard'}
                  </span>
                </button>

                {/* 2.9 Notification Settings */}
                <button
                  onClick={() => setSettingsModalType('notification_settings')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Bell className="w-5 h-5 text-[#0866FF] shrink-0" />
                    <span className="text-[14.5px]">Notification Settings</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {peacePrefs.notifyPriyoDada ? 'Push ON' : 'Muted'}
                  </span>
                </button>
              </div>

              {/* --- SECTION 3: CONTACT & PEACE APPS --- */}
              <div className="space-y-0.5 pt-2 border-t border-neutral-100">
                <p className="px-3 pt-1 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Contact & Peace Apps
                </p>

                {/* 3.1 Contact Info: WhatsApp, IMO, Viber, Email, Website */}
                <button
                  onClick={() => setSettingsModalType('contact_info')}
                  className="w-full min-h-[48px] px-3 py-1.5 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Phone className="w-5 h-5 text-[#25D366] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[14.5px] block leading-tight">Contact Info</span>
                      <span className="text-[11px] text-neutral-500 truncate block">
                        WhatsApp · IMO · Viber · Email · Website
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0 ml-2">
                    {[
                      userProfile.whatsapp,
                      userProfile.imo,
                      userProfile.viber,
                      userProfile.email,
                      userProfile.website,
                    ].filter(Boolean).length > 0
                      ? `${[
                          userProfile.whatsapp,
                          userProfile.imo,
                          userProfile.viber,
                          userProfile.email,
                          userProfile.website,
                        ].filter(Boolean).length} যুক্ত`
                      : 'যোগ করুন'}
                  </span>
                </button>

                {/* 3.2 Peace Message Settings */}
                <button
                  onClick={() => setSettingsModalType('peace_message_settings')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <MessageCircle className="w-5 h-5 text-[#0866FF] shrink-0" />
                    <span className="text-[14.5px]">Peace Message Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>

                {/* 3.3 Peace Edits Settings */}
                <button
                  onClick={() => setSettingsModalType('peace_edits_settings')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Video className="w-5 h-5 text-purple-600 shrink-0" />
                    <span className="text-[14.5px]">Peace Edits Settings</span>
                  </div>
                  <span className="text-[11px] text-neutral-500">{peacePrefs.editsDefaultQuality}</span>
                </button>

                {/* 3.4 Business Suite Settings */}
                <button
                  onClick={() => setSettingsModalType('business_suite_settings')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Briefcase className="w-5 h-5 text-sky-600 shrink-0" />
                    <span className="text-[14.5px]">Business Suite Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>

                {/* 3.5 Creator Broadcast Dashboard (Clickable -> Opens Send All Modal) */}
                <button
                  type="button"
                  onClick={() => {
                    setBroadcastDone(false);
                    setBroadcastProgress(null);
                    setShowBroadcastModal(true);
                  }}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-emerald-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Megaphone className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-[14.5px]">Creator Broadcast Dashboard</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Send All
                  </span>
                </button>
              </div>

              {/* --- SECTION 4: HALAL SAFETY --- */}
              <div className="space-y-0.5 pt-2 border-t border-neutral-100">
                <p className="px-3 pt-1 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Halal Safety
                </p>

                {/* 4.1 Halal Content Filter */}
                <div
                  onClick={() => setSettingsModalType('halal_content_filter')}
                  className="w-full min-h-[44px] px-3 py-1.5 rounded-lg hover:bg-neutral-50 flex items-center justify-between font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[14.5px] block leading-tight">Halal Content Filter</span>
                      <span className="text-[11px] text-neutral-500 block">হারাম কনটেন্ট ও মিউজিক ব্লক</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Toggle Halal Content Filter"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdatePrefs({ halalContentFilter: !peacePrefs.halalContentFilter });
                    }}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                      peacePrefs.halalContentFilter ? 'bg-emerald-600 justify-end' : 'bg-neutral-300 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </button>
                </div>

                {/* 4.2 Prayer Time Pause */}
                <div
                  onClick={() => setSettingsModalType('prayer_time_pause')}
                  className="w-full min-h-[44px] px-3 py-1.5 rounded-lg hover:bg-neutral-50 flex items-center justify-between font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <BellOff className="w-5 h-5 text-amber-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[14.5px] block leading-tight">Prayer Time Pause</span>
                      <span className="text-[11px] text-neutral-500 block">নামাজের সময় নোটিফিকেশন বিরতি</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Toggle Prayer Time Pause"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdatePrefs({ prayerTimePause: !peacePrefs.prayerTimePause });
                    }}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                      peacePrefs.prayerTimePause ? 'bg-emerald-600 justify-end' : 'bg-neutral-300 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </button>
                </div>

                {/* 4.3 Family Safety */}
                <button
                  onClick={() => setSettingsModalType('family_safety')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <ShieldAlert className="w-5 h-5 text-teal-600 shrink-0" />
                    <span className="text-[14.5px]">Family Safety</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    {peacePrefs.familyBlock18Plus ? '18+ Blocked' : 'Custom'}
                  </span>
                </button>

                {/* 4.4 Blocked Users & Keywords */}
                <button
                  onClick={() => setSettingsModalType('blocked_users_keywords')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Ban className="w-5 h-5 text-rose-600 shrink-0" />
                    <span className="text-[14.5px]">Blocked Users & Keywords</span>
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    {peacePrefs.blockedUsers.length + peacePrefs.blockedKeywords.length} active
                  </span>
                </button>
              </div>

              {/* --- SECTION 5: SUPPORT & ABOUT --- */}
              <div className="space-y-0.5 pt-2 border-t border-neutral-100">
                <p className="px-3 pt-1 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Support & About
                </p>

                {/* 5.1 Help Center */}
                <button
                  onClick={() => setSettingsModalType('help_center')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="text-[14.5px]">Help Center</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>

                {/* 5.2 Report a Problem */}
                <button
                  onClick={() => setSettingsModalType('report_problem')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span className="text-[14.5px]">Report a Problem</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>

                {/* 5.3 About Peace World */}
                <button
                  onClick={() => setSettingsModalType('about_peace_world')}
                  className="w-full h-[42px] px-3 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-left font-medium text-neutral-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Info className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-[14.5px]">About Peace World</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    v1.0 Global Launch
                  </span>
                </button>
              </div>
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

        {/* Section 6: Also from Peaceverse (OPEN BY DEFAULT - Matching Facebook's "Also from Meta" layout) */}
        <div className="bg-white rounded-[12px] shadow-xs border border-neutral-200/80 overflow-hidden">
          <button
            onClick={() => setShowAlsoAccordion(!showAlsoAccordion)}
            className="w-full p-3.5 flex items-center justify-between text-neutral-900 font-semibold text-[15px] hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-5 h-5 text-neutral-700" />
              <span>Also from Peaceverse</span>
            </div>
            {showAlsoAccordion ? (
              <ChevronUp className="w-5 h-5 text-neutral-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral-500" />
            )}
          </button>

          {showAlsoAccordion && (
            <div className="border-t border-neutral-100 py-1.5 px-2 space-y-0.5 animate-in fade-in">
              {/* 1. Peace Edits */}
              <button
                onClick={() => setAlsoAppType('edits')}
                className="w-full px-3 py-2.5 rounded-lg hover:bg-neutral-100 active:bg-neutral-200/70 flex items-center gap-3.5 text-left transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0866FF] via-purple-600 to-rose-500 flex items-center justify-center text-white shadow-xs shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-[16px] font-medium text-neutral-900">Peace Edits</span>
              </button>

              {/* 2. Peace Threads */}
              <button
                onClick={() => setAlsoAppType('threads')}
                className="w-full px-3 py-2.5 rounded-lg hover:bg-neutral-100 active:bg-neutral-200/70 flex items-center gap-3.5 text-left transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-neutral-950 flex items-center justify-center text-white shadow-xs shrink-0">
                  <AtSign className="w-5 h-5 stroke-[2.4]" />
                </div>
                <span className="text-[16px] font-medium text-neutral-900">Peace Threads</span>
              </button>

              {/* 3. Peace Insta */}
              <button
                onClick={() => setAlsoAppType('instagram')}
                className="w-full px-3 py-2.5 rounded-lg hover:bg-neutral-100 active:bg-neutral-200/70 flex items-center gap-3.5 text-left transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-xs shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <span className="text-[16px] font-medium text-neutral-900">Peace Insta</span>
              </button>

              {/* 4. Peace Business Suite */}
              <button
                onClick={() => setAlsoAppType('business_suite')}
                className="w-full px-3 py-2.5 rounded-lg hover:bg-neutral-100 active:bg-neutral-200/70 flex items-center gap-3.5 text-left transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0866FF] to-sky-400 flex items-center justify-center text-white shadow-xs shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-[16px] font-medium text-neutral-900">Peace Business Suite</span>
              </button>

              {/* 5. WhatsApp */}
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-3 py-2.5 rounded-lg hover:bg-neutral-100 active:bg-neutral-200/70 flex items-center gap-3.5 text-left transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-xs shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <span className="text-[16px] font-medium text-neutral-900">WhatsApp</span>
              </a>

              {/* 6. Messenger */}
              <a
                href="https://www.messenger.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-3 py-2.5 rounded-lg hover:bg-neutral-100 active:bg-neutral-200/70 flex items-center gap-3.5 text-left transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0084FF] via-[#0099FF] to-[#A033FF] flex items-center justify-center text-white shadow-xs shrink-0">
                  <MessageCircle className="w-5 h-5 fill-white/20" />
                </div>
                <span className="text-[16px] font-medium text-neutral-900">Messenger</span>
              </a>

              {/* 7. Imo */}
              <a
                href="https://imo.im/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-3 py-2.5 rounded-lg hover:bg-neutral-100 active:bg-neutral-200/70 flex items-center gap-3.5 text-left transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center text-white font-extrabold text-sm shadow-xs shrink-0">
                  imo
                </div>
                <span className="text-[16px] font-medium text-neutral-900">Imo</span>
              </a>

              {/* 8. Viber */}
              <a
                href="https://www.viber.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-3 py-2.5 rounded-lg hover:bg-neutral-100 active:bg-neutral-200/70 flex items-center gap-3.5 text-left transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#7360F2] flex items-center justify-center text-white shadow-xs shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <span className="text-[16px] font-medium text-neutral-900">Viber</span>
              </a>
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
        userProfile={userProfile}
        onUpdateProfile={onUpdateProfile}
        prefs={peacePrefs}
        onUpdatePrefs={handleUpdatePrefs}
        isDarkMode={darkModeInline}
        onOpenLegalTab={onOpenLegalTab}
        onLogout={onLogout}
        onToggleDarkMode={(dark) => {
          setDarkModeInline(dark);
          if (onToggleDarkMode) onToggleDarkMode(dark);
        }}
      />

      <FbAlsoFromPeaceModal
        appType={alsoAppType}
        onClose={() => setAlsoAppType(null)}
        onOpenPeaceEdits={() => {
          setAlsoAppType(null);
          if (onNavigatePath) {
            onNavigatePath('/peace-edits-editor');
          } else {
            setShowPeaceEdits(true);
          }
        }}
        onOpenPeaceThreads={() => {
          setAlsoAppType(null);
          if (onNavigatePath) {
            onNavigatePath('/peace-threads');
          }
        }}
        onOpenPeaceInsta={() => {
          setAlsoAppType(null);
          if (onNavigatePath) {
            onNavigatePath('/peace-insta');
          }
        }}
        onOpenBusinessSuite={() => {
          setAlsoAppType(null);
          if (onNavigatePath) {
            onNavigatePath('/business-suite');
          } else {
            onNavigateTab('pages');
          }
        }}
        onOpenMessenger={() => {
          setAlsoAppType(null);
          handleMessengerClick();
        }}
      />

      <PeaceEditsModal
        isOpen={showPeaceEdits}
        onClose={() => setShowPeaceEdits(false)}
        userProfile={userProfile}
        onPublishReel={onPublishReel}
      />

      {showProfileSwitcher && (
        <FbProfileSwitcherModal
          userProfile={userProfile}
          onClose={() => setShowProfileSwitcher(false)}
          onCreatePage={() => {
            setShowProfileSwitcher(false);
            setShowCreatePageLanding(true);
          }}
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

      {/* Creator Broadcast Dashboard Modal (Opened on [Send All]) */}
      {showBroadcastModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => !broadcastSending && setShowBroadcastModal(false)}
        >
          <div
            className="bg-white dark:bg-[#242526] border border-neutral-200 dark:border-[#393a3b] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-200 dark:border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0866FF] to-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-neutral-900 dark:text-white leading-tight">
                    Creator Broadcast Dashboard
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-[#b0b3b8]">
                    Instant Push &amp; Bell Notification to All Users
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={broadcastSending}
                onClick={() => setShowBroadcastModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-neutral-700 dark:text-[#e4e6eb] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendMenuBroadcast} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-[#e4e6eb] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="প্রিয় দাদা নতুন ভিডিও আপলোড করেছেন"
                  className="w-full rounded-xl border border-neutral-300 dark:border-[#393a3b] bg-neutral-50 dark:bg-[#18191a] px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-[#e4e6eb] mb-1">
                  Message
                </label>
                <textarea
                  rows={3}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="১০০% হালাল পণ্যের নতুন কালেকশন দেখুন"
                  className="w-full rounded-xl border border-neutral-300 dark:border-[#393a3b] bg-neutral-50 dark:bg-[#18191a] px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0866FF] resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-[#e4e6eb] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Image</span>
                  </label>
                  <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0866FF] hover:underline cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            setBroadcastImage(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={broadcastImage}
                  onChange={(e) => setBroadcastImage(e.target.value)}
                  placeholder="https://... or upload image"
                  className="w-full rounded-xl border border-neutral-300 dark:border-[#393a3b] bg-neutral-50 dark:bg-[#18191a] px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0866FF]"
                />
                {broadcastImage && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-neutral-200 dark:border-[#393a3b] h-28 bg-neutral-100 dark:bg-[#18191a]">
                    <img
                      src={broadcastImage}
                      alt="Broadcast preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {broadcastProgress && (
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#18191a] border border-emerald-500/40 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      {broadcastDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Bell className="w-4 h-4 animate-bounce text-[#0866FF]" />
                      )}
                      <span>
                        {broadcastDone
                          ? `Sent to ${broadcastProgress.sent.toLocaleString()}/${broadcastProgress.total.toLocaleString()} users`
                          : `Broadcasting: ${broadcastProgress.sent.toLocaleString()}/${broadcastProgress.total.toLocaleString()}...`}
                      </span>
                    </span>
                    <span className="text-neutral-900 dark:text-white font-mono tabular-nums">
                      {Math.min(100, Math.round((broadcastProgress.sent / broadcastProgress.total) * 100))}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-neutral-200 dark:bg-[#2a2b2d] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0866FF] via-sky-500 to-emerald-500 transition-all duration-200 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((broadcastProgress.sent / broadcastProgress.total) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={broadcastSending}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0866FF] to-emerald-600 hover:opacity-95 disabled:opacity-60 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                <span>
                  {broadcastSending
                    ? 'Sending Broadcast...'
                    : '📢 Broadcast to All Users Now'}
                </span>
              </button>

              {onOpenAdminPortal && (
                <button
                  type="button"
                  onClick={() => {
                    setShowBroadcastModal(false);
                    onOpenAdminPortal();
                  }}
                  className="w-full text-center text-[11px] font-semibold text-neutral-500 hover:text-[#0866FF] py-1 cursor-pointer"
                >
                  Open Full Admin Dashboard →
                </button>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
