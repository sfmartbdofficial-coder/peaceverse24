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
  Info,
  Trash2,
  Mail,
  Award,
  BookOpen,
  Download,
  DollarSign,
  Globe,
  Smile,
  Gift,
  Calendar,
  Rss,
  Compass,
  Gamepad2,
  Shield,
  Hand,
  Pin,
  PinOff,
  Video,
  MessageCircle,
  Instagram,
  Send,
  Smartphone,
  Tag,
  CreditCard,
  Link,
  Moon,
  TrendingUp,
  Radio,
} from 'lucide-react';
import { UserProfile, FacebookMainTab } from '../../types';
import { LegalTabType } from '../legal/LegalModal';
import { useLanguage } from '../../context/LanguageContext';

// Import newly created interactive sub-modals
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

interface FbMenuViewProps {
  userProfile: UserProfile;
  onNavigateTab: (tab: FacebookMainTab) => void;
  onOpenProfile: () => void;
  onOpenHalalPolicy: () => void;
  onOpenAdminPortal?: () => void;
  onOpenMonetization?: () => void;
  onOpenLegalTab?: (tab: LegalTabType) => void;
  onOpenInstallModal?: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onBack: () => void;
}

export const FbMenuView: React.FC<FbMenuViewProps> = ({
  userProfile,
  onNavigateTab,
  onOpenProfile,
  onOpenHalalPolicy,
  onOpenAdminPortal,
  onOpenMonetization,
  onOpenLegalTab,
  onOpenInstallModal,
  onOpenAuth,
  onLogout,
  onBack,
}) => {
  const { t, currentLangInfo, setShowLanguageModal } = useLanguage();

  // Accordion toggles matching Screenshots 3 & 4
  const [showSettingsAccordion, setShowSettingsAccordion] = useState(true);
  const [showUpgradesAccordion, setShowUpgradesAccordion] = useState(true);
  const [showAlsoFromPeaceAccordion, setShowAlsoFromPeaceAccordion] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [seeMore, setSeeMore] = useState(true); // default true so user can see all A-Z menu items

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

  // Shortcuts matching Screenshot 1
  const [shortcuts, setShortcuts] = useState([
    {
      id: 'sc-1',
      name: "Sharif's Lif...",
      fullName: "Sharif's Life Story",
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      type: 'page' as const,
      isPinned: true,
      hasReelBadge: false,
    },
    {
      id: 'sc-2',
      name: 'Angel Mahi',
      fullName: 'Angel Mahi',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      type: 'page' as const,
      isPinned: false,
      hasReelBadge: true,
    },
    {
      id: 'sc-3',
      name: 'SF MART...',
      fullName: 'SF MART BD',
      image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=200&q=80',
      type: 'page' as const,
      isPinned: true,
      hasReelBadge: false,
    },
    {
      id: 'sc-4',
      name: 'Peace Deen...',
      fullName: 'Peace Deen Group',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      type: 'group' as const,
      isPinned: false,
      hasReelBadge: false,
    },
  ]);

  const togglePinShortcut = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShortcuts((prev) =>
      prev.map((sc) => (sc.id === id ? { ...sc, isPinned: !sc.isPinned } : sc))
    );
  };

  const handleShortcutClick = (sc: (typeof shortcuts)[0]) => {
    if (sc.type === 'page') {
      onNavigateTab('pages');
    } else {
      onNavigateTab('groups');
    }
  };

  return (
    <div className="max-w-[700px] mx-auto min-h-screen bg-[#18191a] text-[#e4e6eb] pb-24 p-3 sm:p-4 space-y-4 font-sans select-none">
      
      {/* 1. Header with Back button and Settings search */}
      <div className="flex items-center justify-between pb-1 border-b border-[#393a3b]/60">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-white transition-colors"
            title="পেছনে যান (Back)"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          <h1 className="font-bold text-2xl text-white">Menu</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsModalType('settings')}
            className="w-9 h-9 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] flex items-center justify-center transition-colors"
            title="সেটিংস"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigateTab('home')}
            className="px-3 py-1.5 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>হোমে ফিরুন</span>
          </button>
        </div>
      </div>

      {/* 2. Top Profile Card with Switch Profile & 9+ Badge (Exact Screenshot 1) */}
      <div
        onClick={onOpenProfile}
        className="p-3.5 rounded-2xl bg-[#242526] border border-[#393a3b] hover:bg-[#2e2f30] flex items-center justify-between cursor-pointer shadow-sm transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-12 h-12 rounded-full object-cover border border-[#393a3b]"
            />
            {/* Green active status dot */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-[#242526]" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white">{userProfile.name}</h2>
            <p className="text-xs text-[#b0b3b8]">প্রোফাইল দেখুন</p>
          </div>
        </div>

        {/* Switch Account button with circular badge and 9+ notification */}
        <div className="flex items-center gap-2">
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenAuth) onOpenAuth();
            }}
            className="w-9 h-9 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] flex items-center justify-center text-[#e4e6eb] transition-colors cursor-pointer"
            title="লগইন / একাউন্ট পরিবর্তন (Firebase Auth)"
          >
            <RefreshCw className="w-4 h-4" />
          </div>
          <div className="relative w-9 h-9 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] flex items-center justify-center text-[#e4e6eb] transition-colors">
            <ChevronDown className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] bg-[#e41e3f] text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-[#242526]">
              9+
            </span>
          </div>
        </div>
      </div>

      {/* 3. Section: Your shortcuts (Horizontal Scrollable with Pin/Unpin, Exact Screenshot 1) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm text-[#b0b3b8]">Your shortcuts</h3>
          <span className="text-[11px] text-[#8a8d91]">পিন করতে আইকনে চাপুন</span>
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {shortcuts.map((sc) => (
            <div
              key={sc.id}
              onClick={() => handleShortcutClick(sc)}
              className="w-20 sm:w-24 flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-neutral-800 border border-[#393a3b] shadow-sm group-hover:scale-105 transition-transform">
                <img
                  src={sc.image}
                  alt={sc.fullName}
                  className="w-full h-full object-cover"
                />

                {/* Reel icon badge overlay as in Screenshot 1 */}
                {sc.hasReelBadge && (
                  <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow">
                    <Video className="w-3 h-3" />
                  </span>
                )}

                {/* Pin toggle badge */}
                <button
                  onClick={(e) => togglePinShortcut(sc.id, e)}
                  className={`absolute top-1 right-1 p-1 rounded-full transition-colors ${
                    sc.isPinned
                      ? 'bg-[#1877F2] text-white shadow'
                      : 'bg-black/50 text-[#b0b3b8] hover:text-white'
                  }`}
                  title={sc.isPinned ? 'আনপিন করুন' : 'পিন করুন'}
                >
                  {sc.isPinned ? <Pin className="w-2.5 h-2.5" /> : <PinOff className="w-2.5 h-2.5" />}
                </button>
              </div>
              <p className="text-[11px] text-[#e4e6eb] font-medium text-center truncate w-full">
                {sc.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MAIN MENU ITEMS (A to Z From Screenshots 1 & 2) */}
      {/* ======================================================== */}
      <div className="space-y-1 pt-1">
        
        {/* 1. Pages */}
        <button
          onClick={() => onNavigateTab('pages')}
          className="w-full p-3 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] flex items-center gap-3.5 transition-colors text-left"
        >
          <div className="text-[#fa3e3e] shrink-0">
            <Flag className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Pages</p>
            <p className="text-[11px] text-[#b0b3b8]">SF MART BD ও আপনার পরিচালিত পেজসমূহ</p>
          </div>
        </button>

        {/* 2. Saved */}
        <button
          onClick={() => onNavigateTab('saved')}
          className="w-full p-3 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] flex items-center gap-3.5 transition-colors text-left"
        >
          <div className="text-[#a033ff] shrink-0">
            <Bookmark className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Saved</p>
            <p className="text-[11px] text-[#b0b3b8]">সংরক্ষিত পোস্ট, ভিডিও ও দ্বীনি তিলাওয়াত</p>
          </div>
        </button>

        {/* 3. Memories */}
        <button
          onClick={() => onNavigateTab('memories')}
          className="w-full p-3 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] flex items-center gap-3.5 transition-colors text-left"
        >
          <div className="text-[#1877F2] shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Memories</p>
            <p className="text-[11px] text-[#b0b3b8]">অতীতের স্মৃতি ও পূর্ববর্তী পোস্ট</p>
          </div>
        </button>

        {/* 4. Marketplace */}
        <button
          onClick={() => onNavigateTab('marketplace')}
          className="w-full p-3 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] flex items-center gap-3.5 transition-colors text-left"
        >
          <div className="text-[#00a400] shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Marketplace</p>
            <p className="text-[11px] text-[#b0b3b8]">হালাল কেনাকাটা ও সখীপুর লোকাল শপ</p>
          </div>
        </button>

        {/* 5. Groups */}
        <button
          onClick={() => onNavigateTab('groups')}
          className="w-full p-3 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] flex items-center gap-3.5 transition-colors text-left"
        >
          <div className="text-[#00c7be] shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Groups</p>
            <p className="text-[11px] text-[#b0b3b8]">কুরআন ও হাদিস পরিবার গ্রুপস</p>
          </div>
        </button>

        {/* 6. Avatars (Screenshot 1) */}
        <button
          onClick={() => setShowAvatarsModal(true)}
          className="w-full p-3 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] flex items-center gap-3.5 transition-colors text-left"
        >
          <div className="text-pink-500 shrink-0">
            <Smile className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Avatars</p>
            <p className="text-[11px] text-[#b0b3b8]">হালাল কার্টুন অ্যাভাটার ও ইসলামিক স্টিকার প্যাক</p>
          </div>
        </button>

        {/* 7. Birthdays (Screenshot 1) */}
        <button
          onClick={() => setShowBirthdaysModal(true)}
          className="w-full p-3 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] flex items-center gap-3.5 transition-colors text-left"
        >
          <div className="text-rose-400 shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Birthdays</p>
            <p className="text-[11px] text-[#b0b3b8]">আজকের জন্মদিন ও বরকতময় দোয়াপূর্ণ শুভেচ্ছা</p>
          </div>
        </button>

        {/* 8. Events (Screenshot 1) */}
        <button
          onClick={() => setShowEventsModal(true)}
          className="w-full p-3 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] flex items-center gap-3.5 transition-colors text-left"
        >
          <div className="text-sky-400 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Events</p>
            <p className="text-[11px] text-[#b0b3b8]">ইসলামিক মাহফিল, সম্মেলন ও চ্যারিটি ইভেন্ট</p>
          </div>
        </button>

        {/* 9. Feeds (Screenshot 1) */}
        <button
          onClick={() => setShowFeedsModal(true)}
          className="w-full p-3 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] flex items-center gap-3.5 transition-colors text-left"
        >
          <div className="text-cyan-400 shrink-0">
            <Rss className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Feeds</p>
            <p className="text-[11px] text-[#b0b3b8]">এলগরিদমিক ও সময়ানুক্রমিক ক্রমানুসারে সাজানো পোস্ট</p>
          </div>
        </button>

        {/* 10. Finds (Screenshot 1) */}
        <button
          onClick={() => setShowFindsModal(true)}
          className="w-full p-3 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] flex items-center gap-3.5 transition-colors text-left"
        >
          <div className="text-purple-400 shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Finds</p>
            <p className="text-[11px] text-[#b0b3b8]">ট্রেন্ডিং ইসলামিক বিষয় ও নতুন ক্রিয়েটর আবিষ্কার</p>
          </div>
        </button>

        {/* 11. Friends (18 online) (Exact Screenshot 1) */}
        <button
          onClick={() => onNavigateTab('friends')}
          className="w-full p-3 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] flex items-center gap-3.5 transition-colors text-left"
        >
          <div className="relative text-blue-400 shrink-0">
            <Users className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#242526] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm text-white">Friends (18 online)</p>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded-full font-bold">
                ১৮ জন লাইভ
              </span>
            </div>
            <p className="text-[11px] text-[#b0b3b8]">অনলাইন বন্ধুদের তালিকা, রিকোয়েস্ট ও পরামর্শ</p>
          </div>
        </button>

        {/* Collapsible Extended Items (Screenshot 2 items) */}
        {seeMore && (
          <div className="space-y-1 animate-in fade-in">
            {/* 12. Games */}
            <button
              onClick={() => setShowGamesModal(true)}
              className="w-full p-3 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] flex items-center gap-3.5 transition-colors text-left"
            >
              <div className="text-amber-400 shrink-0">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Games</p>
                <p className="text-[11px] text-[#b0b3b8]">ইসলামিক কুইজ, ব্রেইন ট্রেইনার ও শিক্ষণীয় গেম</p>
              </div>
            </button>

            {/* 13. Messenger Kids */}
            <button
              onClick={() => setShowKidsModal(true)}
              className="w-full p-3 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] flex items-center gap-3.5 transition-colors text-left"
            >
              <div className="text-emerald-400 shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-sm text-white">Messenger Kids</p>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                    নিরাপদ
                  </span>
                </div>
                <p className="text-[11px] text-[#b0b3b8]">পিতা-মাতার নিয়ন্ত্রণে শিশুদের জন্য নিরাপদ ইসলামিক চ্যাট</p>
              </div>
            </button>

            {/* 14. Meta AI -> Peace AI */}
            <button
              onClick={() => setShowPeaceAiModal(true)}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-blue-900/30 via-[#242526] to-[#242526] hover:bg-[#3a3b3c] border border-[#1877F2]/40 flex items-center gap-3.5 transition-colors text-left"
            >
              <div className="text-[#1877F2] shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-white">Peaceverse24 AI (Qalby - The Heart)</p>
                  <span className="text-[10px] bg-gradient-to-r from-[#1877F2] to-emerald-500 text-white px-1.5 py-0.2 rounded font-bold">
                    Official AI
                  </span>
                </div>
                <p className="text-[11px] text-[#b0b3b8]">পোস্ট রাইটার, হালাল রিরাইটার ও হার্ট হিলার (Peaceverse24.com)</p>
              </div>
            </button>

            {/* 15. Pokes */}
            <button
              onClick={() => setShowPokesModal(true)}
              className="w-full p-3 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] flex items-center gap-3.5 transition-colors text-left"
            >
              <div className="text-orange-400 shrink-0">
                <Hand className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Pokes</p>
                <p className="text-[11px] text-[#b0b3b8]">বন্ধুদের পোক করুন ও পোক ব্যাক (Poke back) পাঠান</p>
              </div>
            </button>

            {/* 16. Reels */}
            <button
              onClick={() => onNavigateTab('reels')}
              className="w-full p-3 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] flex items-center gap-3.5 transition-colors text-left"
            >
              <div className="text-rose-500 shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Reels</p>
                <p className="text-[11px] text-[#b0b3b8]">ইসলামিক শর্ট ভিডিও ও কুরআন তিলাওয়াত রিলস</p>
              </div>
            </button>
          </div>
        )}

        {/* See more / See less Toggle */}
        <button
          onClick={() => setSeeMore(!seeMore)}
          className="w-full py-2.5 mt-1 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] font-bold text-xs transition-colors text-center flex items-center justify-center gap-1.5"
        >
          <span>{seeMore ? 'See less' : 'See more'}</span>
          {seeMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 5. SETTINGS AND PRIVACY ACCORDION (Screenshot 3) */}
      {/* ======================================================== */}
      <div className="border-t border-[#393a3b] pt-3 space-y-1">
        <button
          onClick={() => setShowSettingsAccordion(!showSettingsAccordion)}
          className="w-full py-2 flex items-center justify-between text-[#e4e6eb] font-bold text-base hover:text-white"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-[#b0b3b8]" />
            <span className="text-white">Settings and privacy</span>
          </div>
          {showSettingsAccordion ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showSettingsAccordion && (
          <div className="space-y-1 pt-1 animate-in fade-in">
            {/* 1. Settings */}
            <button
              onClick={() => setSettingsModalType('settings')}
              className="w-full p-3 rounded-xl hover:bg-[#242526] flex items-center gap-3.5 transition-colors text-left text-white font-medium text-sm"
            >
              <Settings className="w-5 h-5 text-[#b0b3b8]" />
              <span>Settings</span>
            </button>

            {/* 2. Privacy Center */}
            <button
              onClick={() => setSettingsModalType('privacy_center')}
              className="w-full p-3 rounded-xl hover:bg-[#242526] flex items-center gap-3.5 transition-colors text-left text-white font-medium text-sm"
            >
              <Lock className="w-5 h-5 text-[#b0b3b8]" />
              <span>Privacy Center</span>
            </button>

            {/* 3. Time management */}
            <button
              onClick={() => setSettingsModalType('time_management')}
              className="w-full p-3 rounded-xl hover:bg-[#242526] flex items-center gap-3.5 transition-colors text-left text-white font-medium text-sm"
            >
              <Clock className="w-5 h-5 text-[#b0b3b8]" />
              <span>Time management</span>
            </button>

            {/* 4. Device requests */}
            <button
              onClick={() => setSettingsModalType('device_requests')}
              className="w-full p-3 rounded-xl hover:bg-[#242526] flex items-center gap-3.5 transition-colors text-left text-white font-medium text-sm"
            >
              <Smartphone className="w-5 h-5 text-[#b0b3b8]" />
              <span>Device requests</span>
            </button>

            {/* 5. Your Ad Activity */}
            <button
              onClick={() => setSettingsModalType('ad_activity')}
              className="w-full p-3 rounded-xl hover:bg-[#242526] flex items-center gap-3.5 transition-colors text-left text-white font-medium text-sm"
            >
              <Tag className="w-5 h-5 text-[#b0b3b8]" />
              <span>Your Ad Activity</span>
            </button>

            {/* 6. Orders and payments */}
            <button
              onClick={() => setSettingsModalType('orders_payments')}
              className="w-full p-3 rounded-xl hover:bg-[#242526] flex items-center gap-3.5 transition-colors text-left text-white font-medium text-sm"
            >
              <CreditCard className="w-5 h-5 text-[#b0b3b8]" />
              <span>Orders and payments</span>
            </button>

            {/* 7. Link history */}
            <button
              onClick={() => setSettingsModalType('link_history')}
              className="w-full p-3 rounded-xl hover:bg-[#242526] flex items-center gap-3.5 transition-colors text-left text-white font-medium text-sm"
            >
              <Link className="w-5 h-5 text-[#b0b3b8]" />
              <span>Link history</span>
            </button>

            {/* 8. Dark mode */}
            <button
              onClick={() => setSettingsModalType('dark_mode')}
              className="w-full p-3 rounded-xl hover:bg-[#242526] flex items-center gap-3.5 transition-colors text-left text-white font-medium text-sm"
            >
              <Moon className="w-5 h-5 text-[#b0b3b8]" />
              <span>Dark mode</span>
            </button>

            {/* 9. Language */}
            <button
              onClick={() => setShowLanguageModal(true)}
              className="w-full p-3 rounded-xl hover:bg-[#242526] flex items-center justify-between transition-colors text-left text-white font-medium text-sm"
            >
              <div className="flex items-center gap-3.5">
                <Globe className="w-5 h-5 text-[#b0b3b8]" />
                <span>Language</span>
              </div>
              <span className="text-xs text-[#b0b3b8]">{currentLangInfo.nativeName}</span>
            </button>

            {/* 10. App icon */}
            <button
              onClick={() => setSettingsModalType('app_icon')}
              className="w-full p-3 rounded-xl hover:bg-[#242526] flex items-center gap-3.5 transition-colors text-left text-white font-medium text-sm"
            >
              <Sparkles className="w-5 h-5 text-[#b0b3b8]" />
              <span>App icon</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 6. UPGRADES SECTION (Screenshot 3) */}
      {/* ======================================================== */}
      <div className="border-t border-[#393a3b] pt-3 space-y-3">
        <button
          onClick={() => setShowUpgradesAccordion(!showUpgradesAccordion)}
          className="w-full py-2 flex items-center justify-between text-[#e4e6eb] font-bold text-base hover:text-white"
        >
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-[#b0b3b8]" />
            <span className="text-white">Upgrades</span>
          </div>
          {showUpgradesAccordion ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showUpgradesAccordion && (
          <div className="grid grid-cols-2 gap-3 pt-1 animate-in fade-in">
            {/* Card 1: Public presence (Screenshot 3) */}
            <div
              onClick={() => setSettingsModalType('public_presence')}
              className="rounded-2xl bg-[#242526] border border-[#393a3b] overflow-hidden hover:border-[#1877F2] transition-all cursor-pointer group shadow-sm flex flex-col"
            >
              <div className="relative h-28 bg-gradient-to-tr from-purple-700 via-indigo-600 to-pink-500 overflow-hidden">
                {/* 3D spheres decorative mockup matching screenshot 3 */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-purple-400/40 blur-sm" />
                <div className="absolute top-2 left-6 w-14 h-14 rounded-full bg-pink-400/50 shadow-inner" />
                <div className="absolute bottom-2 left-10 w-8 h-8 rounded-full bg-fuchsia-300/60" />
                
                {/* Rocket badge at bottom-left */}
                <div className="absolute bottom-2.5 left-2.5 w-8 h-8 rounded-full bg-white text-[#1877F2] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">Public presence</h4>
                  <p className="text-[11px] text-[#b0b3b8] leading-tight mt-1">
                    Get tools to help you grow on Peaceverse.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Facebook Plus -> Peaceverse Plus (Screenshot 3) */}
            <div
              onClick={() => setSettingsModalType('peace_plus')}
              className="rounded-2xl bg-[#242526] border border-[#393a3b] overflow-hidden hover:border-[#1877F2] transition-all cursor-pointer group shadow-sm flex flex-col"
            >
              <div className="relative h-28 bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-700 overflow-hidden">
                {/* Visual decorative stories preview matching screenshot 3 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-16 h-16 rounded-full border-2 border-white/80 p-0.5">
                    <img
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80"
                      alt="Stories"
                      className="w-full h-full rounded-full object-cover"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-blue-500 text-white text-[9px] font-bold rounded-full">
                      48h
                    </span>
                  </div>
                </div>

                {/* Diamond/Star badge at bottom-left */}
                <div className="absolute bottom-2.5 left-2.5 w-8 h-8 rounded-full bg-white text-[#1877F2] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Award className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">Peaceverse Plus</h4>
                  <p className="text-[11px] text-[#b0b3b8] leading-tight mt-1">
                    Unlock exclusive features and more.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 7. ALSO FROM PEACEVERSE (Also from Meta - Screenshot 4) */}
      {/* ======================================================== */}
      <div className="border-t border-[#393a3b] pt-3 space-y-1">
        <button
          onClick={() => setShowAlsoFromPeaceAccordion(!showAlsoFromPeaceAccordion)}
          className="w-full py-2 flex items-center justify-between text-[#e4e6eb] font-bold text-base hover:text-white"
        >
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-2 gap-0.5 w-5 h-5 text-[#b0b3b8]">
              <span className="w-2 h-2 rounded-sm bg-[#b0b3b8]" />
              <span className="w-2 h-2 rounded-sm bg-[#b0b3b8]" />
              <span className="w-2 h-2 rounded-sm bg-[#b0b3b8]" />
              <span className="w-2 h-2 rounded-sm bg-[#b0b3b8]" />
            </div>
            <span className="text-white">Also from Peaceverse</span>
          </div>
          {showAlsoFromPeaceAccordion ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showAlsoFromPeaceAccordion && (
          <div className="space-y-1 pt-1 animate-in fade-in">
            {/* 1. Edits */}
            <button
              onClick={() => setAlsoAppType('edits')}
              className="w-full p-3 rounded-xl hover:bg-[#242526] flex items-center gap-3.5 transition-colors text-left text-white font-medium text-sm"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white">
                <Video className="w-3.5 h-3.5" />
              </div>
              <span>Edits</span>
            </button>

            {/* 2. Threads */}
            <button
              onClick={() => setAlsoAppType('threads')}
              className="w-full p-3 rounded-xl hover:bg-[#242526] flex items-center gap-3.5 transition-colors text-left text-white font-medium text-sm"
            >
              <div className="w-6 h-6 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <span>Threads</span>
            </button>

            {/* 3. Instagram */}
            <button
              onClick={() => setAlsoAppType('instagram')}
              className="w-full p-3 rounded-xl hover:bg-[#242526] flex items-center gap-3.5 transition-colors text-left text-white font-medium text-sm"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
                <Instagram className="w-3.5 h-3.5" />
              </div>
              <span>Instagram</span>
            </button>

            {/* 4. Messenger */}
            <button
              onClick={() => setAlsoAppType('messenger')}
              className="w-full p-3 rounded-xl hover:bg-[#242526] flex items-center gap-3.5 transition-colors text-left text-white font-medium text-sm"
            >
              <div className="w-6 h-6 rounded-lg bg-[#1877F2] flex items-center justify-center text-white">
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <span>Messenger</span>
            </button>

            {/* 5. WhatsApp */}
            <button
              onClick={() => setAlsoAppType('whatsapp')}
              className="w-full p-3 rounded-xl hover:bg-[#242526] flex items-center gap-3.5 transition-colors text-left text-white font-medium text-sm"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Send className="w-3.5 h-3.5" />
              </div>
              <span>WhatsApp</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 8. CREATOR MONETIZATION & ADMIN PORTAL BUTTONS */}
      {/* ======================================================== */}
      <div className="space-y-2 pt-2 border-t border-[#393a3b]">
        {/* Creator Monetization Studio Entry */}
        {onOpenMonetization && (
          <button
            onClick={onOpenMonetization}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#242526] to-[#242526] hover:bg-[#3a3b3c] border border-emerald-500/40 flex items-center justify-between transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="text-emerald-400 p-1.5 rounded-xl bg-emerald-500/20 font-black text-lg w-10 h-10 flex items-center justify-center flex-shrink-0">
                ৳
              </div>
              <div>
                <p className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span>ক্রিয়েটর মনিটাইজেশন ও আর্নিং স্টুডিও</span>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    সক্রিয়
                  </span>
                </p>
                <p className="text-[11px] text-[#b0b3b8]">ইন-স্ট্রিম ভিডিও বিজ্ঞাপন ও রেভিনিউ শেয়ার ৫৫/৪৫</p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-bold">ড্যাশবোর্ড →</span>
          </button>
        )}

        {/* Halal Guarantee Policy */}
        <button
          onClick={onOpenHalalPolicy}
          className="w-full p-3.5 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-emerald-500/40 flex items-center gap-3.5 transition-colors text-left"
        >
          <div className="text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">১০০% হালাল নীতি ও গ্যারান্টি</p>
            <p className="text-[11px] text-emerald-400">বাদ্যযন্ত্র ও অশ্লীলতামুক্ত প্ল্যাটফর্ম</p>
          </div>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 9. GOOGLE PLAY STORE & INTERNATIONAL LEGAL POLICIES */}
      {/* ======================================================== */}
      <div className="border-t border-[#393a3b] pt-3 space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400">
              আন্তর্জাতিক ও গুগল প্লে স্টোর পলিসি
            </h3>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
            v2.4.0 Compliant
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenLegalTab?.('about')}
            className="p-3 rounded-xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] text-left transition-colors flex items-center gap-2"
          >
            <Info className="w-4 h-4 text-[#1877F2] shrink-0" />
            <div>
              <p className="font-bold text-xs text-white">আমাদের সম্পর্কে</p>
              <p className="text-[10px] text-[#b0b3b8]">About Us</p>
            </div>
          </button>

          <button
            onClick={() => onOpenLegalTab?.('privacy')}
            className="p-3 rounded-xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] text-left transition-colors flex items-center gap-2"
          >
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-xs text-white">গোপনীয়তা নীতি</p>
              <p className="text-[10px] text-[#b0b3b8]">Privacy Policy</p>
            </div>
          </button>

          <button
            onClick={() => onOpenLegalTab?.('terms')}
            className="p-3 rounded-xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] text-left transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <p className="font-bold text-xs text-white">ব্যবহারের শর্তাবলী</p>
              <p className="text-[10px] text-[#b0b3b8]">Terms of Service</p>
            </div>
          </button>

          <button
            onClick={() => onOpenLegalTab?.('guidelines')}
            className="p-3 rounded-xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] text-left transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-xs text-white">হালাল গাইডলাইন</p>
              <p className="text-[10px] text-[#b0b3b8]">Community Code</p>
            </div>
          </button>

          <button
            onClick={() => onOpenLegalTab?.('delete-account')}
            className="p-3 rounded-xl bg-[#242526] hover:bg-rose-950/30 border border-[#393a3b] text-left transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-xs text-rose-300">অ্যাকাউন্ট ডিলিট</p>
              <p className="text-[10px] text-[#8a8d91]">Data Erasure</p>
            </div>
          </button>

          <button
            onClick={() => onOpenLegalTab?.('contact')}
            className="p-3 rounded-xl bg-[#242526] hover:bg-[#3a3b3c] border border-[#393a3b] text-left transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <p className="font-bold text-xs text-white">যোগাযোগ ও সাপোর্ট</p>
              <p className="text-[10px] text-[#b0b3b8]">Contact Us</p>
            </div>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 10. EXACT LOG OUT BUTTON & FIREBASE AUTH (Screenshot 4) */}
      {/* ======================================================== */}
      <div className="pt-2 space-y-2">
        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1877F2]/25 via-emerald-600/20 to-[#242526] hover:from-[#1877F2]/35 border border-[#1877F2]/40 text-white font-bold text-xs transition-colors flex items-center justify-between shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{userProfile.email ? `লগইন আছেন: ${userProfile.email}` : 'Firebase লগইন ও সাইন-আপ (Google / Email)'}</span>
            </div>
            <span className="text-[10px] bg-[#1877F2] text-white px-2 py-0.5 rounded-full font-bold">
              {userProfile.email ? 'অ্যাকাউন্ট সুইচ' : 'লগইন'}
            </span>
          </button>
        )}

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] font-bold text-sm transition-colors text-center cursor-pointer"
        >
          Log out
        </button>
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
                onClick={() => {
                  setShowLogoutConfirm(false);
                  if (onLogout) onLogout();
                  onNavigateTab('home');
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
      />

      <FbAlsoFromPeaceModal
        appType={alsoAppType}
        onClose={() => setAlsoAppType(null)}
      />

    </div>
  );
};
