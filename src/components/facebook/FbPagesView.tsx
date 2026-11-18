import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Flag,
  Plus,
  Search,
  Check,
  Compass,
  ThumbsUp,
  Mail,
  Share2,
  MessageCircle,
  Camera,
  Image as ImageIcon,
  MapPin,
  Globe,
  Phone,
  Sparkles,
  Send,
  MoreHorizontal,
  X,
  Building,
  ShieldCheck,
  Star,
  ChevronDown,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ShoppingBag,
  BookOpen,
  UserCheck,
  HeartHandshake,
  Utensils,
  Radio,
  Edit3,
  RefreshCw,
  Save,
  ExternalLink,
  Bell,
  Megaphone,
  Pin,
  SlidersHorizontal,
  Film,
  Calendar,
  AtSign,
  Trash2,
  Home,
  Heart,
  Clock,
  Video,
  ChevronLeft,
  Shield,
  BadgeCheck,
  Archive,
  FileText,
  Link2,
  KeyRound,
  Settings,
  UserPlus,
  List,
} from 'lucide-react';
import { NotificationItem, PageItem, UserProfile } from '../../types';
import { CreatorMonetizationModal } from '../monetization/CreatorMonetizationModal';
import { FbCreatePageLandingView } from './FbCreatePageLandingView';
import { FbSwitchToPageSheet } from './FbSwitchToPageSheet';
import {
  getWhatsAppUrl,
  getImoDeepLink,
  getViberDeepLink,
  openDeepLinkWithFallback,
  normalizePhoneNumber,
} from '../../utils/contactLinks';
import { broadcastCreatorNotification } from '../../lib/fcm';
import {
  loadPeaceSettings,
  savePeaceSettings,
  PeaceSettingsPrefs,
} from '../../utils/settingsStorage';
import { getPageMonetizationById } from '../../utils/adminControlStorage';

interface FbPagesViewProps {
  onBack: () => void;
  userProfile?: UserProfile;
  onSwitchToPage?: (page: PageItem) => void;
  activeSwitchedPageId?: string | null;
  embedded?: boolean;
  onBroadcastNotification?: (notif: NotificationItem) => void;
  initialSelectedPageId?: string | null;
  onClearInitialSelectedPageId?: () => void;
  openSwitchSheetOnInitialOpen?: boolean;
  onClearOpenSwitchSheet?: () => void;
  initialCreatePageName?: string | null;
  onClearInitialCreatePageName?: () => void;
}

const DEMO_PAGE_IDS = [
  'page-sharif-story',
  'page-sf-mart',
  'page-halal-bites',
  'page-angel-mahi',
  'page-noor-academy',
];

interface SuggestedIslamicPage {
  id: string;
  name: string;
  category: string;
  followers: number;
  avatar: string;
}

const SUGGESTED_ISLAMIC_PAGES: SuggestedIslamicPage[] = [
  {
    id: 'sug-alquran-daily',
    name: 'Al-Quran Daily',
    category: 'Education & Quran Academy',
    followers: 4651,
    avatar: 'https://images.unsplash.com/photo-1584281722572-8815151591f8?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'sug-deen-time',
    name: 'Deen Time',
    category: 'Media & Islamic Reminders',
    followers: 12840,
    avatar: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'sug-islamic-vibes',
    name: 'Islamic Vibes 1014',
    category: 'Digital Creator',
    followers: 8215,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'sug-ummah-reflections',
    name: 'Ummah Reflections',
    category: 'Mosque & Community',
    followers: 19320,
    avatar: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=240&q=80',
  },
];

const INITIAL_PAGE_INVITES: Array<{
  id: string;
  pageName: string;
  invitedBy: string;
  category: string;
  avatar: string;
  time: string;
}> = [
  {
    id: 'inv-sunnah-circle',
    pageName: 'Sunnah Study Circle',
    invitedBy: 'Abdullah Al Mamun invited you to like this Page',
    category: 'Education',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    time: '2h',
  },
];

const WhatsAppBrandIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.04c-.24.68-1.41 1.3-1.95 1.38-.52.08-1.18.11-1.9-.12-.44-.14-1-.33-1.72-.64-3.02-1.3-4.99-4.33-5.14-4.53-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.28-.3.61-.38.81-.38.2 0 .41.01.59.01.19 0 .44-.07.69.53.26.62.88 2.15.96 2.31.08.16.13.35.03.56-.1.2-.15.33-.3.51-.15.18-.32.4-.45.54-.15.15-.31.32-.13.63.18.31.8 1.32 1.71 2.13 1.18 1.05 2.17 1.38 2.48 1.53.31.15.49.13.67-.08.18-.21.78-.91.99-1.22.21-.31.42-.26.7-.15.28.1 1.79.84 2.1.99.31.15.51.23.59.35.08.12.08.71-.16 1.39z" />
  </svg>
);

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1584281722572-8815151591f8?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
];

const CATEGORIES_LIST = [
  'Shopping & Retail (হালাল শপ / ব্যবসা)',
  'Education (দ্বীনি ও কুরআন শিক্ষা)',
  'Public Figure (ইসলামিক বক্তা / আলোচক)',
  'Creator (কন্টেন্ট ক্রিয়েটর)',
  'Nonprofit & Charity (চ্যারিটি ও সেবা)',
  'Mosque & Community (মসজিদ ও সমাজ)',
  'Food & Restaurant (হালাল খাদ্য)',
  'Media & News (সংবাদ ও সংস্কৃতি)',
];

interface PageCategoryConfig {
  value: string;
  nameBangla: string;
  nameEnglish: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  cardBg: string;
  borderClass: string;
}

const PAGE_CATEGORIES_CONFIG: PageCategoryConfig[] = [
  {
    value: 'Shopping & Retail (হালাল শপ / ব্যবসা)',
    nameBangla: 'হালাল শপ / ব্যবসা প্রতিষ্ঠান',
    nameEnglish: 'Shopping & Retail (হালাল পণ্য)',
    icon: ShoppingBag,
    iconBg: 'bg-amber-100 text-amber-700 border border-amber-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-amber-400',
  },
  {
    value: 'Education (দ্বীনি ও কুরআন শিক্ষা)',
    nameBangla: 'দ্বীনি ও কুরআন শিক্ষা প্রতিষ্ঠান',
    nameEnglish: 'Education & Quran Academy',
    icon: BookOpen,
    iconBg: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-emerald-400',
  },
  {
    value: 'Public Figure (ইসলামিক বক্তা / আলোচক)',
    nameBangla: 'ইসলামিক আলোচক ও ব্যক্তিত্ব',
    nameEnglish: 'Public Figure & Speaker',
    icon: UserCheck,
    iconBg: 'bg-sky-100 text-sky-700 border border-sky-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-sky-400',
  },
  {
    value: 'Creator (কন্টেন্ট ক্রিয়েটর)',
    nameBangla: 'ডিজিটাল কনটেন্ট ক্রিয়েটর',
    nameEnglish: 'Video & Content Creator',
    icon: Sparkles,
    iconBg: 'bg-purple-100 text-purple-700 border border-purple-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-purple-400',
  },
  {
    value: 'Nonprofit & Charity (চ্যারিটি ও সেবা)',
    nameBangla: 'চ্যারিটি ও সমাজসেবা সংগঠন',
    nameEnglish: 'Nonprofit & Charity Org',
    icon: HeartHandshake,
    iconBg: 'bg-rose-100 text-rose-700 border border-rose-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-rose-400',
  },
  {
    value: 'Mosque & Community (মসজিদ ও সমাজ)',
    nameBangla: 'মসজিদ ও ইসলামিক সমাজ',
    nameEnglish: 'Mosque & Islamic Center',
    icon: Building,
    iconBg: 'bg-teal-100 text-teal-700 border border-teal-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-teal-400',
  },
  {
    value: 'Food & Restaurant (হালাল খাদ্য)',
    nameBangla: 'হালাল রেস্টুরেন্ট ও ফুড শপ',
    nameEnglish: 'Food & Halal Restaurant',
    icon: Utensils,
    iconBg: 'bg-orange-100 text-orange-700 border border-orange-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-orange-400',
  },
  {
    value: 'Media & News (সংবাদ ও সংস্কৃতি)',
    nameBangla: 'মিডিয়া ও সংবাদ প্রকাশনা',
    nameEnglish: 'Media & News Publishing',
    icon: Radio,
    iconBg: 'bg-blue-100 text-[#0866FF] border border-blue-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-[#0866FF]',
  },
];

// Helper to convert File to permanent Base64 data URL so localStorage never breaks on reload
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const FbPagesView: React.FC<FbPagesViewProps> = ({
  onBack,
  userProfile,
  onSwitchToPage,
  activeSwitchedPageId: _activeSwitchedPageId,
  embedded = false,
  onBroadcastNotification,
  initialSelectedPageId,
  onClearInitialSelectedPageId,
  openSwitchSheetOnInitialOpen,
  onClearOpenSwitchSheet,
  initialCreatePageName,
  onClearInitialCreatePageName,
}) => {
  const [creatorPrefs, setCreatorPrefs] = useState<PeaceSettingsPrefs>(() => loadPeaceSettings());
  const updateCreatorPref = (patch: Partial<PeaceSettingsPrefs>) => {
    setCreatorPrefs((prev) => savePeaceSettings({ ...prev, ...patch }));
  };
  // Load ONLY user-created pages (zero extra/demo pages) and preserve empty cover/avatar
  const [pages, setPages] = useState<PageItem[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_fb_pages');
      if (stored) {
        const parsed: PageItem[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((p) => Boolean(p?.isOwner) && !DEMO_PAGE_IDS.includes(p.id))
            .map((p) => ({
              ...p,
              avatar: p.avatar && !p.avatar.startsWith('blob:') ? p.avatar : '',
              cover: p.cover && !p.cover.startsWith('blob:') ? p.cover : '',
              followingCount: p.followingCount ?? 0,
              followedBy: p.followedBy || ['Abul Baser', 'Hassan Abdullah', 'MD Oli Ullah'],
            }));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('qalby_fb_pages', JSON.stringify(pages));
    } catch {}
  }, [pages]);

  // Hub sub-views (main Pages view, Invites, Followed Pages) & header search toggle
  const [hubSection, setHubSection] = useState<'home' | 'invites' | 'followed'>('home');
  const [showHubSearch, setShowHubSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [followedSuggestedIds, setFollowedSuggestedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('peace_followed_suggested_pages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [removedSuggestedIds, setRemovedSuggestedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('peace_removed_suggested_pages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [pageInvites, setPageInvites] = useState(INITIAL_PAGE_INVITES);

  useEffect(() => {
    try {
      localStorage.setItem('peace_followed_suggested_pages', JSON.stringify(followedSuggestedIds));
    } catch {}
  }, [followedSuggestedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('peace_removed_suggested_pages', JSON.stringify(removedSuggestedIds));
    } catch {}
  }, [removedSuggestedIds]);

  const [selectedPage, setSelectedPage] = useState<PageItem | null>(() => {
    if (!initialSelectedPageId) return null;
    return pages.find((p) => p.id === initialSelectedPageId) || null;
  });

  useEffect(() => {
    if (initialSelectedPageId) {
      const found = pages.find((p) => p.id === initialSelectedPageId);
      if (found) {
        setSelectedPage(found);
        if (openSwitchSheetOnInitialOpen) {
          setSheetPage(found);
          onClearOpenSwitchSheet?.();
        }
        onClearInitialSelectedPageId?.();
      }
    }
  }, [initialSelectedPageId, openSwitchSheetOnInitialOpen, onClearInitialSelectedPageId, onClearOpenSwitchSheet, pages]);

  const [pageSearchOpen, setPageSearchOpen] = useState(false);
  const [pageSearchQuery, setPageSearchQuery] = useState('');

  // Dedicated Landing Page Creation State
  const [showCreatePageLanding, setShowCreatePageLanding] = useState(Boolean(initialCreatePageName));
  const [sheetPage, setSheetPage] = useState<PageItem | null>(null);

  useEffect(() => {
    if (initialCreatePageName) {
      setShowCreatePageLanding(true);
    }
  }, [initialCreatePageName]);

  // Create Page Wizard Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);

  // Form State for new Page
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES_LIST[0]);
  const [newBio, setNewBio] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newImo, setNewImo] = useState('');
  const [newViber, setNewViber] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newLocation, setNewLocation] = useState('Dhaka, Bangladesh');
  const [newAvatar, setNewAvatar] = useState('');
  const [newCover, setNewCover] = useState('');

  // Edit Page Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editImo, setEditImo] = useState('');
  const [editViber, setEditViber] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editLocation, setEditLocation] = useState('');

  // Page Profile Tabs & In-Page Post Creation
  const [pageSubTab, setPageSubTab] = useState<'all' | 'photos' | 'reels' | 'events' | 'mentions'>('all');
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);
  const [showCreatorDashboard, setShowCreatorDashboard] = useState(false);
  const [creatorDashboardTab, setCreatorDashboardTab] = useState<'overview' | 'earnings' | 'reviews'>('overview');
  const [showAdvertiseModal, setShowAdvertiseModal] = useState(false);
  const [boostTargetPost, setBoostTargetPost] = useState<{ id: string; text: string } | null>(null);
  const [boostBudget, setBoostBudget] = useState<'500' | '1000' | '2500'>('1000');
  const [insightsPost, setInsightsPost] = useState<{
    id: string;
    text: string;
    time: string;
    dateLabel?: string;
    likes: number;
    comments: number;
    reach?: number;
    clicks?: number;
  } | null>(null);
  const [managePostsMode, setManagePostsMode] = useState(false);
  const [editingPageThought, setEditingPageThought] = useState(false);
  const [pageThoughtDraft, setPageThoughtDraft] = useState('');
  const [pageThoughts, setPageThoughts] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('peaceverse_page_thoughts_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [pageEventsList, setPageEventsList] = useState<
    Record<string, Array<{ id: string; title: string; date: string; location: string }>>
  >(() => {
    try {
      const saved = localStorage.getItem('peaceverse_page_events_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [pagePostText, setPagePostText] = useState('');
  const [showPageComposer, setShowPageComposer] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [showPostFilters, setShowPostFilters] = useState(false);
  const [postFilterMode, setPostFilterMode] = useState<'all' | 'pinned' | 'top'>('all');
  const [showExtraDetailsModal, setShowExtraDetailsModal] = useState(false);
  const [extraCurrentCity, setExtraCurrentCity] = useState('');
  const [extraHometown, setExtraHometown] = useState('');
  const [extraRelationship, setExtraRelationship] = useState('');
  const [extraHours, setExtraHours] = useState('');
  const [extraAddress, setExtraAddress] = useState('');
  const [showPageReelModal, setShowPageReelModal] = useState(false);
  const [pageReelTitle, setPageReelTitle] = useState('');
  const [showPageLiveModal, setShowPageLiveModal] = useState(false);
  const [pageLiveTitle, setPageLiveTitle] = useState('');
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [activeSettingKey, setActiveSettingKey] = useState<string | null>(null);
  const [pageActionButtonLabel, setPageActionButtonLabel] = useState<string>('WhatsApp');
  const [pageExtraDetails, setPageExtraDetails] = useState<
    Record<
      string,
      {
        currentCity?: string;
        hometown?: string;
        relationship?: string;
        hours?: string;
        address?: string;
      }
    >
  >(() => {
    try {
      const saved = localStorage.getItem('peaceverse_page_extra_details_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [pagePostsList, setPagePostsList] = useState<
    Record<
      string,
      Array<{
        id: string;
        text: string;
        time: string;
        dateLabel?: string;
        likes: number;
        comments: number;
        pinned?: boolean;
        reach?: number;
        clicks?: number;
      }>
    >
  >(() => {
    try {
      const saved = localStorage.getItem('peaceverse_page_posts_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('peaceverse_page_posts_v1', JSON.stringify(pagePostsList));
    } catch {}
  }, [pagePostsList]);

  useEffect(() => {
    try {
      localStorage.setItem('peaceverse_page_extra_details_v1', JSON.stringify(pageExtraDetails));
    } catch {}
  }, [pageExtraDetails]);

  useEffect(() => {
    try {
      localStorage.setItem('peaceverse_page_thoughts_v1', JSON.stringify(pageThoughts));
    } catch {}
  }, [pageThoughts]);

  useEffect(() => {
    try {
      localStorage.setItem('peaceverse_page_events_v1', JSON.stringify(pageEventsList));
    } catch {}
  }, [pageEventsList]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle Like / Follow on a page
  const handleToggleLike = (pageId: string) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id === pageId) {
          const nextLiked = !p.isLiked;
          const nextFollowers = nextLiked ? p.followersCount + 1 : Math.max(0, p.followersCount - 1);
          return {
            ...p,
            isLiked: nextLiked,
            followersCount: nextFollowers,
            likes: `${(nextFollowers / 1000).toFixed(1)}K লাইক`,
          };
        }
        return p;
      })
    );

    if (selectedPage && selectedPage.id === pageId) {
      setSelectedPage((prev) =>
        prev
          ? {
              ...prev,
              isLiked: !prev.isLiked,
              followersCount: !prev.isLiked ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1),
            }
          : null
      );
    }
    showToast('লাইক / ফলো স্ট্যাটাস আপডেট হয়েছে!');
  };

  // Create Page Handler (Triggered only on explicit step 3 submit)
  const handleCreatePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('দয়া করে পেজের নাম লিখুন');
      return;
    }

    const createdPage: PageItem = {
      id: `page-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      likes: '১ লাইক',
      followersCount: 1,
      avatar: newAvatar,
      cover: newCover,
      role: 'Admin',
      isOwner: true,
      isLiked: true,
      description: newBio.trim() || `${newName} - দ্বীনি ও হালাল প্ল্যাটফর্ম।`,
      bio: newBio.trim() || 'উম্মাহর সেবায় নিবেদিত।',
      phone: newPhone.trim() || undefined,
      whatsapp: newWhatsapp.trim() || newPhone.trim() || undefined,
      imo: newImo.trim() || undefined,
      viber: newViber.trim() || undefined,
      website: newWebsite.trim() || undefined,
      email: newEmail.trim() || undefined,
      location: newLocation.trim() || 'Dhaka, Bangladesh',
      rating: '5.0 ★ (New)',
      createdAt: 'এখনই',
    };

    setPages((prev) => [createdPage, ...prev]);
    setShowCreateModal(false);
    // Reset form
    setNewName('');
    setNewBio('');
    setNewPhone('');
    setNewWhatsapp('');
    setNewImo('');
    setNewViber('');
    setNewWebsite('');
    setNewEmail('');
    setCreateStep(1);

    // Open the newly created page immediately!
    setSelectedPage(createdPage);
    showToast(`🎉 "${createdPage.name}" পেজটি সফলভাবে সংরক্ষিত ও চালু হয়েছে!`);
  };

  // Add post directly to the active page
  const handlePublishPagePost = async () => {
    if (!pagePostText.trim() || !selectedPage) return;

    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newPost = {
      id: `pp-${Date.now()}`,
      text: pagePostText.trim(),
      time: 'এখনই',
      dateLabel: todayStr,
      likes: 1,
      comments: 0,
      pinned: false,
      reach: 128,
      clicks: 14,
    };

    setPagePostsList((prev) => ({
      ...prev,
      [selectedPage.id]: [newPost, ...(prev[selectedPage.id] || [])],
    }));

    setPagePostText('');

    if (creatorPrefs.creatorNotifyFollowersOnPost) {
      showToast('পেজে পোস্ট প্রকাশিত ও সব ফলোয়ারকে নোটিফিকেশন পাঠানো হচ্ছে!');
      await broadcastCreatorNotification({
        creatorId: selectedPage.id,
        creatorName: selectedPage.name,
        creatorAvatar: selectedPage.avatar,
        contentType: 'post',
        title: `${selectedPage.name} নতুন পোস্ট আপলোড করেছেন`,
        body: newPost.text.length > 90 ? newPost.text.slice(0, 90) + '...' : newPost.text,
        thumbnail: selectedPage.cover || selectedPage.avatar,
        postId: newPost.id,
        link: `/?tab=pages&pageId=${selectedPage.id}`,
        broadcastToAll: creatorPrefs.creatorSendPushToAllUsers,
        onLocalNotify: onBroadcastNotification,
      });
    } else {
      showToast('পেজে পোস্ট প্রকাশিত হয়েছে!');
    }
  };

  // Custom photo upload handlers with permanent Base64 conversion
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setNewAvatar(base64);
        showToast('প্রোফাইল ছবি সফলভাবে যুক্ত হয়েছে!');
      } catch {
        showToast('ছবি রূপান্তর করতে সমস্যা হয়েছে');
      }
    }
  };

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setNewCover(base64);
        showToast('কভার ছবি সফলভাবে যুক্ত হয়েছে!');
      } catch {
        showToast('কভার রূপান্তর করতে সমস্যা হয়েছে');
      }
    }
  };

  // Live in-page camera updater for Avatar
  const handleUpdatePageAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPage) return;
    try {
      const base64 = await fileToBase64(file);
      const updated = { ...selectedPage, avatar: base64 };
      setSelectedPage(updated);
      setPages((prev) => prev.map((p) => (p.id === selectedPage.id ? updated : p)));
      try {
        const switchedRaw = localStorage.getItem('qalby_switched_page');
        if (switchedRaw) {
          const switched = JSON.parse(switchedRaw);
          if (switched?.id === updated.id) {
            localStorage.setItem('qalby_switched_page', JSON.stringify(updated));
          }
        }
      } catch {}
      showToast('পেজের লোগো / প্রোফাইল ছবি আপডেট করা হয়েছে!');
    } catch {
      showToast('ছবি আপলোড করতে সমস্যা হয়েছে');
    }
  };

  // Live in-page camera updater for Cover
  const handleUpdatePageCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPage) return;
    try {
      const base64 = await fileToBase64(file);
      const updated = { ...selectedPage, cover: base64 };
      setSelectedPage(updated);
      setPages((prev) => prev.map((p) => (p.id === selectedPage.id ? updated : p)));
      try {
        const switchedRaw = localStorage.getItem('qalby_switched_page');
        if (switchedRaw) {
          const switched = JSON.parse(switchedRaw);
          if (switched?.id === updated.id) {
            localStorage.setItem('qalby_switched_page', JSON.stringify(updated));
          }
        }
      } catch {}
      showToast('পেজের কভার ফটো আপডেট করা হয়েছে!');
    } catch {
      showToast('কভার ফটো আপলোড করতে সমস্যা হয়েছে');
    }
  };

  // Open Edit Page Modal
  const handleOpenEditModal = (page: PageItem) => {
    setEditName(page.name);
    setEditCategory(page.category);
    setEditBio(page.bio || '');
    setEditPhone(page.phone || '');
    setEditWhatsapp(page.whatsapp || page.phone || '');
    setEditImo(page.imo || '');
    setEditViber(page.viber || '');
    setEditWebsite(page.website || '');
    setEditLocation(page.location || '');
    setShowEditModal(true);
  };

  // Save Edit Page Modal changes
  const handleSaveEditPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage || !editName.trim()) return;

    const updated: PageItem = {
      ...selectedPage,
      name: editName.trim(),
      category: editCategory.trim() || selectedPage.category,
      bio: editBio.trim(),
      description: editBio.trim() || selectedPage.description,
      phone: editPhone.trim() || undefined,
      whatsapp: editWhatsapp.trim() || undefined,
      imo: editImo.trim() || undefined,
      viber: editViber.trim() || undefined,
      website: editWebsite.trim() || undefined,
      location: editLocation.trim() || selectedPage.location,
    };

    setSelectedPage(updated);
    setPages((prev) => prev.map((p) => (p.id === selectedPage.id ? updated : p)));
    setShowEditModal(false);
    showToast('💾 পেজের তথ্য সফলভাবে সেভ করা হয়েছে!');
  };

  // Filtered user-managed pages & Islamic suggested pages
  const normalizedHubQuery = searchQuery.trim().toLowerCase();
  const managedPages = pages.filter((p) => Boolean(p.isOwner));
  const filteredManagedPages = managedPages.filter(
    (p) =>
      !normalizedHubQuery ||
      p.name.toLowerCase().includes(normalizedHubQuery) ||
      p.category.toLowerCase().includes(normalizedHubQuery)
  );
  const visibleSuggestedPages = SUGGESTED_ISLAMIC_PAGES.filter(
    (sp) =>
      !removedSuggestedIds.includes(sp.id) &&
      (!normalizedHubQuery ||
        sp.name.toLowerCase().includes(normalizedHubQuery) ||
        sp.category.toLowerCase().includes(normalizedHubQuery))
  );
  const followedSuggestedPages = SUGGESTED_ISLAMIC_PAGES.filter(
    (sp) =>
      followedSuggestedIds.includes(sp.id) &&
      (!normalizedHubQuery ||
        sp.name.toLowerCase().includes(normalizedHubQuery) ||
        sp.category.toLowerCase().includes(normalizedHubQuery))
  );

  // -------------------------------------------------------------
  // DEDICATED FULL-SCREEN LANDING VIEW FOR CREATING A FACEBOOK PAGE
  // -------------------------------------------------------------
  if (showCreatePageLanding) {
    return (
      <FbCreatePageLandingView
        initialPageName={initialCreatePageName || ''}
        onBack={() => {
          setShowCreatePageLanding(false);
          onClearInitialCreatePageName?.();
        }}
        onPageCreated={(newPage) => {
          setPages((prev) => [newPage, ...prev]);
          setShowCreatePageLanding(false);
          onClearInitialCreatePageName?.();
          setSelectedPage(newPage);
          showToast(`🎉 "${newPage.name}" পেজটি সফলভাবে তৈরি ও সংরক্ষিত হয়েছে!`);
        }}
        onCreateFirstPost={(newPage) => {
          setPages((prev) => [newPage, ...prev]);
          setShowCreatePageLanding(false);
          onClearInitialCreatePageName?.();
          setSelectedPage(newPage);
          setPageSubTab('all');
          showToast(`✍️ "${newPage.name}" পেজের প্রথম পোস্ট লিখুন!`);
        }}
      />
    );
  }

  // -------------------------------------------------------------
  // DETAIL VIEW FOR A SELECTED PAGE (Exact Facebook Clean White Page Profile)
  // -------------------------------------------------------------
  if (selectedPage) {
    const rawPosts = pagePostsList[selectedPage.id] || [];
    const activePosts = pageSearchQuery.trim()
      ? rawPosts.filter((p) => p.text.toLowerCase().includes(pageSearchQuery.trim().toLowerCase()))
      : rawPosts;
    const waUrl = getWhatsAppUrl(selectedPage.whatsapp || selectedPage.phone);

    return (
      <div className="max-w-[700px] mx-auto min-h-screen bg-white text-[#050505] pb-24 font-sans">
        {/* 1. Cover Photo with Overlay Top Controls (Back, Edit Pencil, Search, Circle More) & Bottom-Right Camera */}
        <div className="relative w-full h-56 sm:h-64 bg-[#E4E6EB] overflow-hidden flex items-center justify-center">
          {selectedPage.cover ? (
            <>
              <img
                src={selectedPage.cover}
                alt={selectedPage.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center px-4 pb-10">
              <label className="bg-white hover:bg-[#F7F8FA] active:scale-[0.98] text-[#050505] px-4 py-2.5 rounded-xl text-[13px] sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm border border-[#CED0D4] transition-all">
                <Camera className="w-4 h-4 text-[#0866FF]" />
                <span>+ কভার ফটো যোগ করুন (Add Cover Photo)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpdatePageCover}
                />
              </label>
            </div>
          )}

          {/* Top Overlay Controls directly over cover */}
          <div className="absolute top-0 inset-x-0 z-30 px-2.5 pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setPageSearchOpen(false);
                setPageSearchQuery('');
                setShowPageSettings(false);
                setSelectedPage(null);
              }}
              className="min-w-[42px] min-h-[42px] rounded-full hover:bg-black/25 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Back"
              aria-label="Back to pages"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.3] drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)]" />
            </button>

            <div className="flex items-center gap-1.5">
              {selectedPage.isOwner && (
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedPage)}
                  className="min-w-[40px] min-h-[40px] rounded-full hover:bg-black/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Edit page"
                  aria-label="Edit page"
                >
                  <Edit3 className="w-5 h-5 stroke-[2.2] drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)]" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setPageSearchOpen((prev) => !prev)}
                className="min-w-[40px] min-h-[40px] rounded-full hover:bg-black/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Search in page"
                aria-label="Search in page"
              >
                <Search className="w-5 h-5 stroke-[2.3] drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSettingKey(null);
                  setShowPageSettings(true);
                }}
                className="min-w-[42px] min-h-[42px] rounded-full hover:bg-black/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Page Settings"
                aria-label="Page Settings"
              >
                <span className="w-7 h-7 rounded-full border-[1.8px] border-white flex items-center justify-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)]">
                  <MoreHorizontal className="w-4 h-4 stroke-[2.4]" />
                </span>
              </button>
            </div>
          </div>

          {/* Bottom-right Cover Camera Icon positioned above curved white sheet */}
          {selectedPage.isOwner && (
            <label
              className="absolute bottom-7 right-3 w-9 h-9 rounded-full bg-white hover:bg-[#F0F2F5] text-[#050505] flex items-center justify-center cursor-pointer shadow-md border border-black/10 transition-all active:scale-95 z-20"
              title="Update cover photo"
              aria-label="Update cover photo"
            >
              <Camera className="w-4 h-4 text-[#050505]" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpdatePageCover}
              />
            </label>
          )}
        </div>

        {/* Inline Page Search Bar */}
        {pageSearchOpen && (
          <div className="px-4 py-2.5 bg-[#F0F2F5] border-b border-[#E4E6EB] flex items-center gap-2 relative z-30">
            <Search className="w-4 h-4 text-[#65676B] shrink-0" />
            <input
              type="text"
              value={pageSearchQuery}
              onChange={(e) => setPageSearchQuery(e.target.value)}
              placeholder={`${selectedPage.name} পেজে পোস্ট খুঁজুন...`}
              className="flex-1 bg-transparent text-sm text-[#050505] placeholder-[#65676B] focus:outline-none"
              autoFocus
            />
            {pageSearchQuery && (
              <button
                type="button"
                onClick={() => setPageSearchQuery('')}
                className="text-xs font-bold text-[#65676B] hover:text-[#050505] px-1.5 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* 2. Curved White Sheet + Overlapping Profile Photo + "Share a note..." Thought Bubble */}
        <div className="relative -mt-5 rounded-t-[22px] bg-white z-10 px-4 pt-2 pb-3">
          <div className="relative -mt-20 flex flex-col items-center justify-center">
            {selectedPage.isOwner && editingPageThought ? (
              <div className="mb-1.5 bg-white text-[#050505] p-1.5 rounded-full shadow-xl border border-[#E4E6EB] flex items-center gap-1.5 z-30">
                <input
                  type="text"
                  value={pageThoughtDraft}
                  onChange={(e) => setPageThoughtDraft(e.target.value)}
                  placeholder="Share a note..."
                  className="bg-[#F0F2F5] text-[#050505] text-xs px-3 py-1 rounded-full outline-none w-44"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setPageThoughts((prev) => ({
                      ...prev,
                      [selectedPage.id]: pageThoughtDraft.trim(),
                    }));
                    setEditingPageThought(false);
                  }}
                  className="p-1.5 rounded-full bg-[#0866FF] text-white cursor-pointer"
                  aria-label="Save note"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center mb-0.5 z-20">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedPage.isOwner) return;
                    setPageThoughtDraft(pageThoughts[selectedPage.id] || '');
                    setEditingPageThought(true);
                  }}
                  className={`bg-white text-[#65676B] text-[13px] font-medium px-4 py-1.5 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.16)] border border-[#E4E6EB] transition-transform ${
                    selectedPage.isOwner ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                  }`}
                  title={selectedPage.isOwner ? 'Share a note' : undefined}
                >
                  <span className="max-w-[190px] truncate block">
                    {pageThoughts[selectedPage.id] || 'Share a note...'}
                  </span>
                </button>
                {/* Classic thought-bubble dots leading into the avatar */}
                <div className="flex flex-col items-center -mt-1 pointer-events-none">
                  <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm border border-[#E4E6EB]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm border border-[#E4E6EB] mt-0.5" />
                </div>
              </div>
            )}

            <div className="relative -mt-1">
              {selectedPage.avatar ? (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-[0_2px_12px_rgba(0,0,0,0.16)] bg-[#E4E6EB] overflow-hidden relative">
                  <img
                    src={selectedPage.avatar}
                    alt={selectedPage.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <label
                  className="w-32 h-32 rounded-full border-4 border-white shadow-[0_2px_12px_rgba(0,0,0,0.16)] bg-[#E4E6EB] hover:bg-[#D8DADF] flex flex-col items-center justify-center text-center px-2 cursor-pointer transition-colors"
                  title="+ লোগো যোগ করুন (Add Logo)"
                >
                  <Camera className="w-5 h-5 text-[#0866FF] mb-1" />
                  <span className="text-[11px] font-extrabold text-[#050505] leading-tight">
                    + লোগো যোগ করুন
                  </span>
                  <span className="text-[10px] font-semibold text-[#65676B] leading-tight mt-0.5">
                    (Add Logo)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpdatePageAvatar}
                  />
                </label>
              )}

              {selectedPage.isOwner && (
                <label
                  className="absolute bottom-1 right-1 bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] p-2 rounded-full cursor-pointer shadow-md border-2 border-white transition-all active:scale-95"
                  title="লোগো / প্রোফাইল ছবি পরিবর্তন করুন"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpdatePageAvatar}
                  />
                </label>
              )}
            </div>
          </div>

          {/* 3. Centered Name + Badge + Right Switch Chevron Button (with red dot) */}
          <div className="relative text-center pt-2.5 space-y-1">
            <div className="inline-flex items-center justify-center gap-1.5 px-10">
              <h1 className="text-[22px] sm:text-[24px] font-extrabold text-[#050505] tracking-tight">
                {selectedPage.name}
              </h1>
              <ShieldCheck className="w-4 h-4 text-[#0866FF] shrink-0" />
            </div>

            <button
              type="button"
              onClick={() => setSheetPage(selectedPage)}
              className="absolute right-0 top-1.5 w-9 h-9 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
              title="Switch Page"
              aria-label="Switch Page"
            >
              <ChevronDown className="w-5 h-5 stroke-[2.2]" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#FA383E] border-2 border-white" />
            </button>

            {/* Stats: followers · following */}
            <p className="text-[14px] text-[#050505] font-normal tabular-nums">
              <span className="font-bold">
                {selectedPage.followersCount.toLocaleString('en-US')}
              </span>{' '}
              followers ·{' '}
              <span className="font-bold">
                {(selectedPage.followingCount ?? 0).toLocaleString('en-US')}
              </span>{' '}
              following
            </p>

            {/* Bio */}
            {(selectedPage.bio || selectedPage.description) && (
              <p className="text-[14px] text-[#050505] leading-snug max-w-md mx-auto pt-1.5">
                {selectedPage.bio || selectedPage.description}
              </p>
            )}

            {/* Category */}
            <div className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-[#050505] pt-1.5 pb-3">
              <span className="w-3 h-2.5 rounded-[2px] bg-[#050505] inline-block shrink-0" />
              <span>{selectedPage.category}</span>
            </div>
          </div>

          {/* 4. Primary Action Buttons: [🔵 Creator Dashboard] & [⚪ Advertise] */}
          {selectedPage.isOwner ? (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCreatorDashboardTab('overview');
                  setShowCreatorDashboard(true);
                }}
                className="h-10 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] active:scale-[0.98] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 fill-current shrink-0"
                  aria-hidden="true"
                >
                  <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5zm3 14a1 1 0 0 1-1-1v-4a1 1 0 1 1 2 0v4a1 1 0 0 1-1 1zm4 0a1 1 0 0 1-1-1V8a1 1 0 1 1 2 0v8a1 1 0 0 1-1 1zm4 0a1 1 0 0 1-1-1v-6a1 1 0 1 1 2 0v6a1 1 0 0 1-1 1z" />
                </svg>
                <span>Creator Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBoostTargetPost(null);
                  setShowAdvertiseModal(true);
                }}
                className="h-10 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] active:scale-[0.98] text-[#050505] font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Megaphone className="w-4 h-4" />
                <span>Advertise</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleToggleLike(selectedPage.id)}
                className={`h-10 rounded-lg font-bold text-[15px] flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98] transition-all cursor-pointer ${
                  selectedPage.isLiked
                    ? 'bg-[#E7F3FF] text-[#0866FF] hover:bg-[#DBE7F2]'
                    : 'bg-[#0866FF] hover:bg-[#1877F2] text-white'
                }`}
              >
                {selectedPage.isLiked ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.8]" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <ThumbsUp className="w-4 h-4 stroke-[2.2]" />
                    <span>Follow</span>
                  </>
                )}
              </button>

              {waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] active:scale-[0.98] text-[#050505] font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title="WhatsApp এ মেসেজ দিন"
                >
                  <WhatsAppBrandIcon className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => showToast('এই পেজে এখনো WhatsApp নম্বর যুক্ত করা হয়নি')}
                  className="h-10 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] active:scale-[0.98] text-[#050505] font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <WhatsAppBrandIcon className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 5. Pill Sub Navigation Tabs: All / Photos / Reels / Events / Mentions */}
        <div className="bg-white px-3 py-2 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar border-b border-[#F0F2F5]">
          {[
            { id: 'all', label: 'All' },
            { id: 'photos', label: 'Photos' },
            { id: 'reels', label: 'Reels' },
            { id: 'events', label: 'Events' },
            { id: 'mentions', label: 'Mentions' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPageSubTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-full text-[13.5px] transition-all whitespace-nowrap cursor-pointer ${
                pageSubTab === tab.id
                  ? 'bg-[#E7F3FF] text-[#0866FF] font-bold'
                  : 'text-[#65676B] font-semibold hover:bg-[#F0F2F5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* White Content Feed Canvas */}
        <div className="bg-white p-3 space-y-3 min-h-[360px]">
          {/* ALL TAB CONTENT */}
          {pageSubTab === 'all' && (() => {
            const extra = pageExtraDetails[selectedPage.id] || {};
            const openExtraEditor = () => {
              setExtraCurrentCity(extra.currentCity ?? selectedPage.location ?? '');
              setExtraHometown(extra.hometown ?? '');
              setExtraRelationship(extra.relationship ?? '');
              setExtraHours(extra.hours ?? 'Always open');
              setExtraAddress(extra.address ?? selectedPage.location ?? '');
              setShowExtraDetailsModal(true);
            };
            const filteredPosts = activePosts.filter((p) =>
              postFilterMode === 'pinned' ? Boolean(p.pinned) : true
            );
            const sortedPosts = [...filteredPosts].sort((a, b) => {
              if (postFilterMode === 'top') return b.likes + b.comments - (a.likes + a.comments);
              return a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1;
            });

            return (
            <div className="space-y-3.5">
              {/* 1. Personal details */}
              <div className="px-1 pt-1 pb-2.5 space-y-2.5 border-b border-[#E4E6EB]">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-[#050505]">Personal details</h3>
                  {selectedPage.isOwner && (
                    <button
                      type="button"
                      onClick={openExtraEditor}
                      className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] cursor-pointer"
                      title="Edit personal details"
                      aria-label="Edit personal details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 text-[14px] text-[#050505]">
                  {(extra.currentCity || selectedPage.location) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#050505] shrink-0" />
                      <span>{extra.currentCity || selectedPage.location}</span>
                    </div>
                  )}

                  {(extra.hometown || selectedPage.isOwner) && (
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-[#050505] shrink-0" />
                      {extra.hometown ? (
                        <span>{extra.hometown}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={openExtraEditor}
                          className="text-[#65676B] hover:underline text-left cursor-pointer"
                        >
                          Add hometown
                        </button>
                      )}
                    </div>
                  )}

                  {(extra.relationship || selectedPage.isOwner) && (
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-[#050505] shrink-0" />
                      {extra.relationship ? (
                        <span>{extra.relationship}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={openExtraEditor}
                          className="text-[#65676B] hover:underline text-left cursor-pointer"
                        >
                          Add relationship status
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowMoreDetails((prev) => !prev)}
                    className="pl-8 text-[13.5px] font-semibold text-[#65676B] hover:text-[#050505] cursor-pointer"
                  >
                    {showMoreDetails ? 'Hide extra details' : 'See more details'}
                  </button>

                  {showMoreDetails && (
                    <div className="pl-8 pt-1 space-y-1.5 text-[13px] text-[#65676B]">
                      <p>Category: {selectedPage.category}</p>
                      {selectedPage.website && (
                        <p className="text-[#0866FF] truncate">Website: {selectedPage.website}</p>
                      )}
                      {selectedPage.createdAt && <p>Created: {selectedPage.createdAt}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Details */}
              <div className="px-1 pt-0.5 pb-2.5 space-y-2.5 border-b border-[#E4E6EB]">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-[#050505]">Details</h3>
                  {selectedPage.isOwner && (
                    <button
                      type="button"
                      onClick={openExtraEditor}
                      className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] cursor-pointer"
                      title="Edit details"
                      aria-label="Edit details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 text-[14px] text-[#050505]">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#050505] shrink-0" />
                    <span>{extra.hours || 'Always open'}</span>
                  </div>
                  {(extra.address || selectedPage.location) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#050505] shrink-0" />
                      <span>{extra.address || selectedPage.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Contact info */}
              <div className="px-1 pt-0.5 pb-2.5 space-y-2.5 border-b border-[#E4E6EB]">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-[#050505]">Contact info</h3>
                  {selectedPage.isOwner && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(selectedPage)}
                      className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] cursor-pointer"
                      title="Edit contact info"
                      aria-label="Edit contact info"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 text-[14px] text-[#050505]">
                  {selectedPage.phone ? (
                    <a
                      href={`tel:${selectedPage.phone.replace(/\s+/g, '')}`}
                      className="flex items-center gap-3 hover:text-[#0866FF]"
                    >
                      <Phone className="w-5 h-5 text-[#050505] shrink-0" />
                      <span>{selectedPage.phone}</span>
                    </a>
                  ) : (
                    selectedPage.isOwner && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(selectedPage)}
                        className="flex items-center gap-3 text-[#65676B] hover:underline cursor-pointer"
                      >
                        <Phone className="w-5 h-5 text-[#050505] shrink-0" />
                        <span>Add phone number</span>
                      </button>
                    )
                  )}

                  {selectedPage.email && (
                    <a
                      href={`mailto:${selectedPage.email}`}
                      className="flex items-center gap-3 hover:text-[#0866FF]"
                    >
                      <Mail className="w-5 h-5 text-[#050505] shrink-0" />
                      <span className="truncate">{selectedPage.email}</span>
                    </a>
                  )}

                  {(selectedPage.whatsapp || selectedPage.phone) && (
                    <a
                      href={waUrl || '#'}
                      target={waUrl ? '_blank' : undefined}
                      rel={waUrl ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-3 hover:text-[#0866FF]"
                    >
                      <WhatsAppBrandIcon className="w-5 h-5 text-[#050505] shrink-0" />
                      <span>{selectedPage.whatsapp || selectedPage.phone}</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      try {
                        navigator.clipboard?.writeText(
                          `${window.location.origin}/?tab=pages&pageId=${selectedPage.id}`
                        );
                      } catch {}
                      showToast(`${selectedPage.name} মেসেজ লিংক কপি হয়েছে!`);
                    }}
                    className="flex items-center gap-3 text-[#65676B] hover:text-[#050505] cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 text-[#050505] shrink-0" />
                    <span>{selectedPage.name}</span>
                  </button>
                </div>
              </div>

              {/* 4. All posts header + Filters */}
              <div className="px-1 pt-0.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-[#050505]">All posts</h3>
                  <button
                    type="button"
                    onClick={() => setShowPostFilters((prev) => !prev)}
                    className="text-[14px] font-semibold text-[#0866FF] hover:bg-[#E7F3FF] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Filters
                  </button>
                </div>

                {showPostFilters && (
                  <div className="flex items-center gap-1.5 pb-1">
                    {[
                      { id: 'all', label: 'All posts' },
                      { id: 'pinned', label: 'Pinned' },
                      { id: 'top', label: 'Most engaged' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPostFilterMode(opt.id as any)}
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                          postFilterMode === opt.id
                            ? 'bg-[#E7F3FF] text-[#0866FF]'
                            : 'bg-[#F0F2F5] text-[#65676B]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Compact "What's on your mind?" Composer matching Facebook Page UI */}
              {selectedPage.isOwner && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 px-1">
                    {selectedPage.avatar ? (
                      <img
                        src={selectedPage.avatar}
                        alt={selectedPage.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#E4E6EB] bg-[#E4E6EB] shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#E7F3FF] text-[#0866FF] border border-[#0866FF]/30 flex items-center justify-center font-extrabold text-sm shrink-0">
                        {selectedPage.name.trim().charAt(0).toUpperCase()}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowPageComposer((prev) => !prev)}
                      className="flex-1 text-left px-3.5 py-2.5 rounded-full bg-white hover:bg-[#F0F2F5] text-[15px] text-[#65676B] transition-colors cursor-pointer"
                    >
                      What&apos;s on your mind?
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPageComposer(true)}
                      className="p-2 rounded-lg hover:bg-[#F0F2F5] text-[#65676B] cursor-pointer"
                      title="Add Photo"
                      aria-label="Add Photo"
                    >
                      <ImageIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {showPageComposer && (
                    <div className="bg-[#F7F8FA] rounded-xl border border-[#E4E6EB] p-3 space-y-2.5">
                      <textarea
                        rows={3}
                        value={pagePostText}
                        onChange={(e) => setPagePostText(e.target.value)}
                        placeholder="পেজের ফলোয়ারদের উদ্দেশ্যে কিছু লিখুন..."
                        className="w-full bg-white border border-[#E4E6EB] rounded-xl p-3 text-xs sm:text-sm text-[#050505] placeholder-[#65676B] focus:outline-none focus:border-[#0866FF] resize-none"
                        autoFocus
                      />
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => showToast('ফটো যোগ করা হয়েছে')}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-[#E4E6EB] text-emerald-600 flex items-center gap-1.5 cursor-pointer"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-xs font-semibold text-[#050505]">Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handlePublishPagePost();
                            setShowPageComposer(false);
                          }}
                          disabled={!pagePostText.trim()}
                          className="px-4 py-1.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Post</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reel + Live Action Pills */}
                  <div className="flex items-center gap-2 px-1 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPageReelModal(true)}
                      className="px-4 py-2 rounded-full bg-white border border-[#CED0D4] hover:bg-[#F0F2F5] text-[13.5px] font-bold text-[#050505] flex items-center gap-2 cursor-pointer"
                    >
                      <Film className="w-4 h-4 text-[#050505]" />
                      <span>Reel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPageLiveModal(true)}
                      className="px-4 py-2 rounded-full bg-white border border-[#CED0D4] hover:bg-[#F0F2F5] text-[13.5px] font-bold text-[#050505] flex items-center gap-2 cursor-pointer"
                    >
                      <Video className="w-4 h-4 text-[#050505]" />
                      <span>Live</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Full-width Manage posts button */}
              {selectedPage.isOwner && (
                <button
                  type="button"
                  onClick={() => setManagePostsMode((prev) => !prev)}
                  className={`w-full py-2.5 px-4 rounded-lg font-bold text-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    managePostsMode
                      ? 'bg-[#E7F3FF] text-[#0866FF] border border-[#0866FF]/30'
                      : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505]'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>{managePostsMode ? 'Done managing posts' : 'Manage posts'}</span>
                </button>
              )}

              {/* Creator Broadcast Notification Settings (Compact White Card - Preserved) */}
              {selectedPage.isOwner && (
                <div className="p-3.5 rounded-xl bg-white border border-[#E4E6EB] space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center shrink-0">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-[#050505]">Creator Broadcast Settings</h3>
                        <p className="text-[11px] text-[#65676B]">পোস্ট করলেই ফলোয়ারদের কাছে তাৎক্ষণিক নোটিফিকেশন</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      FCM Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <label className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#F0F2F5] cursor-pointer">
                      <span className="text-[11px] font-semibold text-[#050505] flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-[#0866FF]" />
                        <span>Notify all followers</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={creatorPrefs.creatorNotifyFollowersOnPost}
                        onChange={(e) => updateCreatorPref({ creatorNotifyFollowersOnPost: e.target.checked })}
                        className="w-4 h-4 accent-[#0866FF] cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#F0F2F5] cursor-pointer">
                      <span className="text-[11px] font-semibold text-[#050505] flex items-center gap-1.5">
                        <Megaphone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Push to all users</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={creatorPrefs.creatorSendPushToAllUsers}
                        onChange={(e) => updateCreatorPref({ creatorSendPushToAllUsers: e.target.checked })}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Feed of Posts for this Page (Pinned posts sorted first) */}
              <div className="space-y-3">
                {sortedPosts.length === 0 ? (
                  <div className="bg-white rounded-xl p-6 text-center border border-[#E4E6EB]">
                    <Flag className="w-8 h-8 text-[#65676B] mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-[#65676B]">
                      {postFilterMode === 'pinned'
                        ? 'কোনো পিন করা পোস্ট নেই।'
                        : 'এই পেজে এখনও কোনো পোস্ট নেই।'}
                    </p>
                  </div>
                ) : (
                  sortedPosts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-white rounded-xl border border-[#E4E6EB] p-3.5 space-y-2.5 shadow-2xs"
                      >
                        {post.pinned && (
                          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#65676B] pb-1 border-b border-[#F0F2F5]">
                            <Pin className="w-3.5 h-3.5 text-[#0866FF]" />
                            <span>Pinned • {post.dateLabel || post.time}</span>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            {selectedPage.avatar ? (
                              <img
                                src={selectedPage.avatar}
                                alt={selectedPage.name}
                                className="w-9 h-9 rounded-full object-cover border border-[#E4E6EB] bg-[#E4E6EB]"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#E7F3FF] text-[#0866FF] border border-[#0866FF]/30 flex items-center justify-center font-extrabold text-xs shrink-0">
                                {selectedPage.name.trim().charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1">
                                <h4 className="text-[13px] font-bold text-[#050505]">{selectedPage.name}</h4>
                                <ShieldCheck className="w-3.5 h-3.5 text-[#0866FF]" />
                              </div>
                              <p className="text-[11px] text-[#65676B]">
                                {post.pinned ? `Pinned • ${post.dateLabel || post.time}` : post.time} • 🌐
                              </p>
                            </div>
                          </div>

                          {selectedPage.isOwner && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setPagePostsList((prev) => ({
                                    ...prev,
                                    [selectedPage.id]: (prev[selectedPage.id] || []).map((item) =>
                                      item.id === post.id ? { ...item, pinned: !item.pinned } : item
                                    ),
                                  }));
                                  showToast(
                                    post.pinned ? 'পোস্ট থেকে পিন সরানো হয়েছে' : '📌 পোস্টটি পেজের উপরে পিন করা হয়েছে'
                                  );
                                }}
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                  post.pinned
                                    ? 'bg-[#E7F3FF] text-[#0866FF]'
                                    : 'bg-[#F0F2F5] text-[#65676B] hover:text-[#050505]'
                                }`}
                                title={post.pinned ? 'Unpin post' : 'Pin post'}
                              >
                                <Pin className="w-3 h-3" />
                                <span>{post.pinned ? 'Pinned' : 'Pin'}</span>
                              </button>

                              {managePostsMode && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPagePostsList((prev) => ({
                                      ...prev,
                                      [selectedPage.id]: (prev[selectedPage.id] || []).filter(
                                        (item) => item.id !== post.id
                                      ),
                                    }));
                                    showToast('পোস্টটি মুছে ফেলা হয়েছে');
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                                  title="Delete post"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <p className="text-[14px] text-[#050505] leading-relaxed whitespace-pre-wrap">
                          {post.text}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-[#E4E6EB] text-xs font-semibold text-[#65676B]">
                          <button
                            type="button"
                            onClick={() => showToast('পোস্টে লাইক দেওয়া হয়েছে')}
                            className="flex items-center gap-1.5 hover:text-[#0866FF] py-1 px-2 rounded-lg hover:bg-[#F0F2F5] cursor-pointer"
                          >
                            <ThumbsUp className="w-4 h-4 text-[#0866FF]" />
                            <span className="tabular-nums">{post.likes} Like</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast('মন্তব্য অপশন খোলা হয়েছে')}
                            className="flex items-center gap-1.5 hover:text-[#050505] py-1 px-2 rounded-lg hover:bg-[#F0F2F5] cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="tabular-nums">{post.comments} Comment</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast('পোস্ট শেয়ার করা হয়েছে')}
                            className="flex items-center gap-1.5 hover:text-[#050505] py-1 px-2 rounded-lg hover:bg-[#F0F2F5] cursor-pointer"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                        </div>

                        {/* Facebook-style See insights and ads + Boost post row below each post */}
                        {selectedPage.isOwner && (
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F0F2F5]">
                            <button
                              type="button"
                              onClick={() => setInsightsPost(post)}
                              className="text-[12.5px] font-semibold text-[#0866FF] hover:underline flex items-center gap-1.5 cursor-pointer"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>See insights and ads</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setBoostTargetPost({ id: post.id, text: post.text });
                                setShowAdvertiseModal(true);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white text-[12px] font-bold transition-colors cursor-pointer"
                            >
                              Boost post
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
            );
          })()}

          {/* PHOTOS TAB */}
          {pageSubTab === 'photos' && (
            <div className="bg-white rounded-xl border border-[#E4E6EB] p-3">
              {[selectedPage.cover, selectedPage.avatar].filter(Boolean).length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <ImageIcon className="w-8 h-8 text-[#65676B] mx-auto opacity-50" />
                  <p className="text-xs font-semibold text-[#65676B]">
                    এখনো কোনো কভার ফটো বা লোগো যোগ করা হয়নি।
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {[selectedPage.cover, selectedPage.avatar].filter(Boolean).map((imgUrl, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-[#F0F2F5]">
                      <img src={imgUrl} alt="Page photo" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REELS TAB */}
          {pageSubTab === 'reels' && (
            <div className="bg-white rounded-xl border border-[#E4E6EB] p-6 text-center space-y-2.5">
              <div className="w-11 h-11 rounded-full bg-[#F0F2F5] text-[#0866FF] flex items-center justify-center mx-auto">
                <Film className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#050505]">{selectedPage.name} • Reels</h3>
              <p className="text-xs text-[#65676B]">
                এখনো কোনো রিলস ভিডিও আপলোড করা হয়নি। শরিয়াহসম্মত শর্ট ভিডিও শেয়ার করুন।
              </p>
            </div>
          )}

          {/* EVENTS TAB */}
          {pageSubTab === 'events' && (
            <div className="bg-white rounded-xl border border-[#E4E6EB] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#050505] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#0866FF]" />
                  <span>Upcoming Events</span>
                </h3>
              </div>

              {selectedPage.isOwner && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="নতুন ইভেন্টের নাম লিখুন..."
                    className="flex-1 bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF]"
                  />
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newEventTitle.trim()) return;
                      setPageEventsList((prev) => ({
                        ...prev,
                        [selectedPage.id]: [
                          {
                            id: `ev-${Date.now()}`,
                            title: newEventTitle.trim(),
                            date: newEventDate || 'Upcoming',
                            location: selectedPage.location || 'Online / Peaceverse24',
                          },
                          ...(prev[selectedPage.id] || []),
                        ],
                      }));
                      setNewEventTitle('');
                      setNewEventDate('');
                      showToast('নতুন পেজ ইভেন্ট যোগ করা হয়েছে!');
                    }}
                    className="px-3.5 py-2 rounded-lg bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
                  >
                    + Create Event
                  </button>
                </div>
              )}

              {(pageEventsList[selectedPage.id] || []).length === 0 ? (
                <p className="text-xs text-[#65676B] text-center py-4">
                  এই মুহূর্তে কোনো আসন্ন ইভেন্ট নেই।
                </p>
              ) : (
                <div className="space-y-2">
                  {(pageEventsList[selectedPage.id] || []).map((ev) => (
                    <div key={ev.id} className="p-3 rounded-lg bg-[#F0F2F5] flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-[#050505]">{ev.title}</p>
                        <p className="text-[11px] text-[#65676B]">
                          {ev.date} • {ev.location}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-md bg-white text-[10px] font-bold text-[#0866FF] border border-[#E4E6EB]">
                        Event
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MENTIONS TAB */}
          {pageSubTab === 'mentions' && (
            <div className="bg-white rounded-xl border border-[#E4E6EB] p-6 text-center space-y-2.5">
              <div className="w-11 h-11 rounded-full bg-[#F0F2F5] text-[#0866FF] flex items-center justify-center mx-auto">
                <AtSign className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#050505]">Mentions</h3>
              <p className="text-xs text-[#65676B]">
                কেউ @{selectedPage.name} কে মেনশন করে পোস্ট করলে এখানে দেখাবে।
              </p>
            </div>
          )}
        </div>

        {/* CREATOR DASHBOARD MODAL (Includes Overview, Moved Earnings & Reviews) */}
        {showCreatorDashboard && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-[#E4E6EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in">
              <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#0866FF]" />
                  <div>
                    <h3 className="font-bold text-base text-[#050505]">Creator Dashboard</h3>
                    <p className="text-[11px] text-[#65676B]">{selectedPage.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreatorDashboard(false)}
                  className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Creator Dashboard Sub-Tabs: Overview / Earnings / Reviews */}
              <div className="flex border-b border-[#E4E6EB] px-3 bg-[#F8F9FA]">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'earnings', label: 'Earnings' },
                  { id: 'reviews', label: 'Reviews' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCreatorDashboardTab(t.id as any)}
                    className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                      creatorDashboardTab === t.id
                        ? 'border-[#0866FF] text-[#0866FF]'
                        : 'border-transparent text-[#65676B] hover:text-[#050505]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-3.5">
                {creatorDashboardTab === 'overview' && (
                  <>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-[#F0F2F5]">
                        <span className="text-[11px] text-[#65676B] block">Followers</span>
                        <span className="text-lg font-extrabold text-[#050505] tabular-nums">
                          {selectedPage.followersCount.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F0F2F5]">
                        <span className="text-[11px] text-[#65676B] block">Post Reach (28d)</span>
                        <span className="text-lg font-extrabold text-[#0866FF] tabular-nums">
                          {(activePosts.length * 142 + selectedPage.followersCount * 3).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F0F2F5]">
                        <span className="text-[11px] text-[#65676B] block">Total Posts</span>
                        <span className="text-lg font-extrabold text-[#050505] tabular-nums">
                          {activePosts.length}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F0F2F5]">
                        <span className="text-[11px] text-[#65676B] block">Engagement</span>
                        <span className="text-lg font-extrabold text-emerald-700 tabular-nums">
                          {activePosts.reduce((sum, p) => sum + p.likes + p.comments, 0)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreatorDashboard(false);
                          setSheetPage(selectedPage);
                        }}
                        className="py-2.5 px-3 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#0866FF]" />
                        <span>Switch to Page</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreatorDashboard(false);
                          handleOpenEditModal(selectedPage);
                        }}
                        className="py-2.5 px-3 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Page</span>
                      </button>
                    </div>
                  </>
                )}

                {creatorDashboardTab === 'earnings' && (() => {
                  const adminControl = getPageMonetizationById(selectedPage.id);
                  const status = adminControl?.status || (selectedPage.followersCount >= 5000 ? 'approved' : 'pending');
                  const sharePct = adminControl?.revenueShareCreatorPct || 55;
                  const totalEarned = adminControl?.totalEarnings ?? 0;
                  const pendingEarned = adminControl?.pendingBalance ?? 0;

                  return (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-200">
                            ৳
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[#050505]">পেইজ মনিটাইজেশন ও ক্রিয়েটর স্টুডিও</h3>
                            <p className="text-[11px] text-emerald-700">
                              শরিয়াহ সম্মত {sharePct}% ক্রিয়েটর রেভিনিউ শেয়ার
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : status === 'paused'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-[#0866FF] border-blue-200'
                          }`}
                        >
                          {status === 'approved'
                            ? 'Active ✓'
                            : status === 'paused'
                            ? 'Paused'
                            : status === 'rejected'
                            ? 'Rejected'
                            : 'Pending Review'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-[#F0F2F5] p-3 rounded-xl">
                          <span className="text-[10px] text-[#65676B] block">উত্তোলনযোগ্য ব্যালেন্স</span>
                          <span className="text-base font-bold text-emerald-700 tabular-nums">
                            ৳{pendingEarned.toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-[#F0F2F5] p-3 rounded-xl">
                          <span className="text-[10px] text-[#65676B] block">মোট অর্জিত আয়</span>
                          <span className="text-base font-bold text-[#050505] tabular-nums">
                            ৳{totalEarned.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowCreatorDashboard(false);
                          setShowMonetizationModal(true);
                        }}
                        className="w-full py-2.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Payout Studio (PayPal / bKash / Bank)</span>
                      </button>
                    </div>
                  );
                })()}

                {creatorDashboardTab === 'reviews' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3">
                      <div>
                        <div className="text-xl font-extrabold text-amber-500">4.9 ★★★★★</div>
                        <p className="text-xs text-[#65676B]">140 জনের মতামতের ভিত্তিতে</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast('ধন্যবাদ! আপনার ৫★ রিভিউ যুক্ত হয়েছে।')}
                        className="px-3.5 py-1.5 rounded-lg bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
                      >
                        রিভিউ দিন
                      </button>
                    </div>
                    <div className="bg-[#F0F2F5] p-3 rounded-xl">
                      <p className="text-xs font-bold text-[#050505]">মোহাম্মদ তৌফিক</p>
                      <p className="text-[11px] text-amber-600">★★★★★ ১০০% হালাল ও বিশ্বস্ত</p>
                      <p className="text-xs text-[#65676B] mt-1">
                        মাশাআল্লাহ! পেজের কনটেন্ট এবং সেবার মান অত্যন্ত প্রশংসনীয়।
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ADVERTISE / BOOST POST MODAL */}
        {showAdvertiseModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[#E4E6EB] shadow-2xl p-4 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-[#0866FF]" />
                  <h3 className="font-bold text-base text-[#050505]">
                    {boostTargetPost ? 'Boost Post' : `Advertise ${selectedPage.name}`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdvertiseModal(false)}
                  className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {boostTargetPost && (
                <div className="p-3 rounded-xl bg-[#F0F2F5] text-xs text-[#050505] line-clamp-2">
                  {boostTargetPost.text}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-bold text-[#050505]">বাজেট ও সময় নির্বাচন করুন (Halal Ad Reach)</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '500', label: '৳500 / 3d', reach: '1.2K–3.5K reach' },
                    { id: '1000', label: '৳1,000 / 5d', reach: '3K–8.5K reach' },
                    { id: '2500', label: '৳2,500 / 7d', reach: '8K–22K reach' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBoostBudget(opt.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        boostBudget === opt.id
                          ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF]'
                          : 'bg-white border-[#E4E6EB] text-[#050505]'
                      }`}
                    >
                      <span className="text-xs font-extrabold block">{opt.label}</span>
                      <span className="text-[10px] text-[#65676B]">{opt.reach}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAdvertiseModal(false);
                  showToast(
                    boostTargetPost
                      ? '🚀 আপনার পোস্ট বুস্ট ক্যাম্পেইন সাবমিট করা হয়েছে!'
                      : `📢 ${selectedPage.name} পেজের বিজ্ঞাপন চালু হয়েছে!`
                  );
                }}
                className="w-full py-2.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-sm cursor-pointer"
              >
                {boostTargetPost ? 'Boost post now' : 'Start Promotion'}
              </button>
            </div>
          </div>
        )}

        {/* POST INSIGHTS & ADS MODAL */}
        {insightsPost && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[#E4E6EB] shadow-2xl p-4 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
                <h3 className="font-bold text-base text-[#050505] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#0866FF]" />
                  <span>Post insights and ads</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setInsightsPost(null)}
                  className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#F0F2F5]">
                  <span className="text-[11px] text-[#65676B] block">People Reached</span>
                  <span className="text-lg font-extrabold text-[#050505] tabular-nums">
                    {(insightsPost.reach ?? 140).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F0F2F5]">
                  <span className="text-[11px] text-[#65676B] block">Engagement</span>
                  <span className="text-lg font-extrabold text-[#0866FF] tabular-nums">
                    {(insightsPost.likes + insightsPost.comments).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F0F2F5]">
                  <span className="text-[11px] text-[#65676B] block">Reactions</span>
                  <span className="text-base font-bold text-[#050505] tabular-nums">{insightsPost.likes}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F0F2F5]">
                  <span className="text-[11px] text-[#65676B] block">Link Clicks</span>
                  <span className="text-base font-bold text-[#050505] tabular-nums">{insightsPost.clicks ?? 14}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setBoostTargetPost({ id: insightsPost.id, text: insightsPost.text });
                  setInsightsPost(null);
                  setShowAdvertiseModal(true);
                }}
                className="w-full py-2.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-sm cursor-pointer"
              >
                Boost this post
              </button>
            </div>
          </div>
        )}

        {/* Creator Monetization Studio Modal */}
        {showMonetizationModal && (
          <CreatorMonetizationModal
            page={selectedPage}
            userProfile={
              userProfile || {
                name: selectedPage.name,
                avatar: selectedPage.avatar,
                coverPhoto: selectedPage.cover,
                bio: selectedPage.bio || '',
                location: selectedPage.location || 'Dhaka, Bangladesh',
                birthDate: '15 March 1995',
                friendsCount: 5400,
              }
            }
            onClose={() => setShowMonetizationModal(false)}
          />
        )}

        {/* Edit Page Modal for Owner */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E4E6EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#0866FF]" />
                  <h3 className="font-bold text-base text-[#050505]">পেজের তথ্য এডিট করুন (Edit Page)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditPage} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-left">
                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">পেজের নাম (Page Name)</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#050505] focus:outline-none focus:border-[#0866FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">ক্যাটাগরি (Category)</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#050505] focus:outline-none focus:border-[#0866FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">বায়ো / পরিচিতি (Bio)</label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl p-3 text-xs sm:text-sm text-[#050505] focus:outline-none focus:border-[#0866FF] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#050505] mb-1">ফোন নম্বর (Phone)</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+880..."
                      className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#050505] mb-1">অবস্থান / শহর</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="Dhaka, Bangladesh"
                      className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-[#25D366] mb-1">WhatsApp</label>
                    <input
                      type="tel"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      placeholder="+880..."
                      className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505] focus:outline-none focus:border-[#25D366]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sky-600 mb-1">IMO</label>
                    <input
                      type="tel"
                      value={editImo}
                      onChange={(e) => setEditImo(e.target.value)}
                      placeholder="+880..."
                      className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505] focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-600 mb-1">Viber</label>
                    <input
                      type="tel"
                      value={editViber}
                      onChange={(e) => setEditViber(e.target.value)}
                      placeholder="+880..."
                      className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505] focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">ওয়েবসাইট লিংক</label>
                  <input
                    type="text"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF]"
                  />
                </div>

                <div className="pt-3 border-t border-[#E4E6EB] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-xs font-bold text-[#050505] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Personal Details & Hours Modal */}
        {showExtraDetailsModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[#E4E6EB] shadow-2xl p-4 space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
                <h3 className="font-bold text-base text-[#050505]">Edit details</h3>
                <button
                  type="button"
                  onClick={() => setShowExtraDetailsModal(false)}
                  className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 text-left">
                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">Current city</label>
                  <input
                    type="text"
                    value={extraCurrentCity}
                    onChange={(e) => setExtraCurrentCity(e.target.value)}
                    placeholder="Dhaka, Bangladesh"
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">Hometown</label>
                  <input
                    type="text"
                    value={extraHometown}
                    onChange={(e) => setExtraHometown(e.target.value)}
                    placeholder="e.g. Phulpur, Mymensingh, Bangladesh"
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">Relationship</label>
                  <input
                    type="text"
                    value={extraRelationship}
                    onChange={(e) => setExtraRelationship(e.target.value)}
                    placeholder="e.g. Single / Married"
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">Hours</label>
                  <input
                    type="text"
                    value={extraHours}
                    onChange={(e) => setExtraHours(e.target.value)}
                    placeholder="Always open"
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">Address</label>
                  <input
                    type="text"
                    value={extraAddress}
                    onChange={(e) => setExtraAddress(e.target.value)}
                    placeholder="Dhaka, Bangladesh"
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPageExtraDetails((prev) => ({
                    ...prev,
                    [selectedPage.id]: {
                      currentCity: extraCurrentCity.trim(),
                      hometown: extraHometown.trim(),
                      relationship: extraRelationship.trim(),
                      hours: extraHours.trim() || 'Always open',
                      address: extraAddress.trim(),
                    },
                  }));
                  setShowExtraDetailsModal(false);
                  showToast('তথ্য আপডেট করা হয়েছে!');
                }}
                className="w-full py-2.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-sm cursor-pointer"
              >
                Save details
              </button>
            </div>
          </div>
        )}

        {/* Create Page Reel Modal */}
        {showPageReelModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[#E4E6EB] shadow-2xl p-4 space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
                <h3 className="font-bold text-base text-[#050505] flex items-center gap-2">
                  <Film className="w-5 h-5 text-[#0866FF]" />
                  <span>Create Page Reel</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPageReelModal(false)}
                  className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={pageReelTitle}
                onChange={(e) => setPageReelTitle(e.target.value)}
                placeholder="রিলসের শিরোনাম / ক্যাপশন লিখুন..."
                className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#050505] focus:outline-none focus:border-[#0866FF]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  const title = pageReelTitle.trim() || `${selectedPage.name} New Reel`;
                  const todayStr = new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  setPagePostsList((prev) => ({
                    ...prev,
                    [selectedPage.id]: [
                      {
                        id: `reel-${Date.now()}`,
                        text: `🎬 Reel: ${title}`,
                        time: 'এখনই',
                        dateLabel: todayStr,
                        likes: 1,
                        comments: 0,
                        reach: 185,
                        clicks: 21,
                      },
                      ...(prev[selectedPage.id] || []),
                    ],
                  }));
                  setPageReelTitle('');
                  setShowPageReelModal(false);
                  showToast('🎬 রিলস পেজে যুক্ত করা হয়েছে!');
                }}
                className="w-full py-2.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-sm cursor-pointer"
              >
                Publish Reel
              </button>
            </div>
          </div>
        )}

        {/* Go Live Modal */}
        {showPageLiveModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[#E4E6EB] shadow-2xl p-4 space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
                <h3 className="font-bold text-base text-[#050505] flex items-center gap-2">
                  <Video className="w-5 h-5 text-rose-600" />
                  <span>Go Live as {selectedPage.name}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPageLiveModal(false)}
                  className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={pageLiveTitle}
                onChange={(e) => setPageLiveTitle(e.target.value)}
                placeholder="লাইভ ভিডিওর বিষয় লিখুন..."
                className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#050505] focus:outline-none focus:border-rose-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  const title = pageLiveTitle.trim() || `${selectedPage.name} Live Session`;
                  const todayStr = new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  setPagePostsList((prev) => ({
                    ...prev,
                    [selectedPage.id]: [
                      {
                        id: `live-${Date.now()}`,
                        text: `🔴 LIVE NOW: ${title}`,
                        time: 'এখনই',
                        dateLabel: todayStr,
                        likes: 1,
                        comments: 0,
                        reach: 240,
                        clicks: 34,
                      },
                      ...(prev[selectedPage.id] || []),
                    ],
                  }));
                  setPageLiveTitle('');
                  setShowPageLiveModal(false);
                  showToast('🔴 পেজ লাইভ সেশন শুরু হয়েছে!');
                }}
                className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm cursor-pointer"
              >
                Start Live Video
              </button>
            </div>
          </div>
        )}

        {/* FULL-SCREEN PAGE SETTINGS OVERLAY (Exact Facebook Page Settings Screen) */}
        {showPageSettings && (
          <div className="fixed inset-0 z-[120] bg-white text-[#050505] overflow-y-auto pb-20 font-sans animate-in fade-in">
            <div className="max-w-[700px] mx-auto min-h-screen bg-white">
              {/* Top Sticky Header: <  |  Page Settings  |  Page Avatar + Chevron */}
              <div className="sticky top-0 z-20 bg-white border-b border-[#E4E6EB] h-[54px] px-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (activeSettingKey) {
                      setActiveSettingKey(null);
                    } else {
                      setShowPageSettings(false);
                    }
                  }}
                  className="w-10 h-10 -ml-1 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center cursor-pointer"
                  aria-label="Back from Page Settings"
                >
                  <ChevronLeft className="w-7 h-7 text-[#050505] stroke-[2.2]" />
                </button>

                <h2 className="text-[18px] font-bold text-[#050505]">Page Settings</h2>

                <button
                  type="button"
                  onClick={() => setSheetPage(selectedPage)}
                  className="relative w-9 h-9 rounded-full cursor-pointer"
                  title="Switch Page"
                  aria-label="Switch Page"
                >
                  {selectedPage.avatar ? (
                    <img
                      src={selectedPage.avatar}
                      alt={selectedPage.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#E4E6EB]"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center font-bold text-sm border border-[#E4E6EB]">
                      {selectedPage.name.trim().charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#E4E6EB] border border-white flex items-center justify-center">
                    <ChevronDown className="w-2.5 h-2.5 text-[#050505]" />
                  </span>
                </button>
              </div>

              {/* Detail Sub-view when a setting item is tapped */}
              {activeSettingKey ? (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
                    <h3 className="text-base font-bold text-[#050505]">{activeSettingKey}</h3>
                    <button
                      type="button"
                      onClick={() => setActiveSettingKey(null)}
                      className="text-xs font-bold text-[#0866FF] cursor-pointer"
                    >
                      Done
                    </button>
                  </div>

                  {activeSettingKey === 'Page status' && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                      <p className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        <span>Page has no issues</span>
                      </p>
                      <p className="text-xs text-emerald-700">
                        {selectedPage.name} পেজটি সম্পূর্ণ হালাল নীতিমালা মেনে চলছে এবং সক্রিয় রয়েছে।
                      </p>
                    </div>
                  )}

                  {activeSettingKey === 'Verify your Page' && (
                    <div className="p-4 rounded-xl bg-[#F0F2F5] space-y-3">
                      <p className="text-sm font-bold text-[#050505]">
                        Blue Verification Badge ({selectedPage.name})
                      </p>
                      <p className="text-xs text-[#65676B]">
                        পেজ ভেরিফিকেশনের জন্য আবেদন করলে অ্যাডমিন টিম আপনার পেজের তথ্য যাচাই করবে।
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          showToast('✅ ভেরিফিকেশন আবেদন জমা দেওয়া হয়েছে!');
                          setActiveSettingKey(null);
                        }}
                        className="px-4 py-2 rounded-lg bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
                      >
                        Request Verification
                      </button>
                    </div>
                  )}

                  {activeSettingKey === 'Action Button' && (
                    <div className="space-y-2.5">
                      <p className="text-xs text-[#65676B]">
                        ভিজিটরদের জন্য প্রাইমারি অ্যাকশন বাটন নির্বাচন করুন:
                      </p>
                      {['WhatsApp', 'Call Now', 'Send Message', 'Follow Page'].map((btnOpt) => (
                        <button
                          key={btnOpt}
                          type="button"
                          onClick={() => {
                            setPageActionButtonLabel(btnOpt);
                            showToast(`Action button "${btnOpt}" সেট করা হয়েছে!`);
                          }}
                          className={`w-full p-3 rounded-xl border text-left text-sm font-semibold flex items-center justify-between cursor-pointer ${
                            pageActionButtonLabel === btnOpt
                              ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF]'
                              : 'bg-white border-[#E4E6EB] text-[#050505]'
                          }`}
                        >
                          <span>{btnOpt}</span>
                          {pageActionButtonLabel === btnOpt && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeSettingKey === 'Add highlights' && (
                    <div className="space-y-2.5">
                      <p className="text-xs text-[#65676B]">
                        পিন করা পোস্টগুলো হাইলাইট হিসেবে পেজের উপরে দেখানো হয় (মোট{' '}
                        {rawPosts.filter((p) => p.pinned).length}টি)।
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPageSettings(false);
                          setActiveSettingKey(null);
                          setPostFilterMode('pinned');
                        }}
                        className="px-4 py-2 rounded-lg bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
                      >
                        Manage highlighted posts
                      </button>
                    </div>
                  )}

                  {activeSettingKey === 'Archive' && (
                    <div className="p-6 rounded-xl bg-[#F0F2F5] text-center space-y-1.5">
                      <Archive className="w-7 h-7 text-[#65676B] mx-auto" />
                      <p className="text-sm font-bold text-[#050505]">No archived items</p>
                      <p className="text-xs text-[#65676B]">আর্কাইভ করা কোনো পোস্ট বা স্টোরি নেই।</p>
                    </div>
                  )}

                  {activeSettingKey === 'Posts and tags' && (
                    <div className="space-y-3">
                      <p className="text-xs text-[#65676B]">
                        অন্যান্য ইউজাররা @{selectedPage.name} কে পোস্টে মেনশন ও ট্যাগ করতে পারবেন।
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPageSettings(false);
                          setActiveSettingKey(null);
                          setPageSubTab('mentions');
                        }}
                        className="px-4 py-2 rounded-lg bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
                      >
                        View Mentions & Tags
                      </button>
                    </div>
                  )}

                  {activeSettingKey === 'Connected experiences' && (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-[#F0F2F5] space-y-1.5 text-xs">
                        <p className="font-bold text-[#050505]">
                          WhatsApp: {selectedPage.whatsapp || selectedPage.phone || 'Not linked'}
                        </p>
                        <p className="text-[#65676B]">
                          Website: {selectedPage.website || 'Not linked'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPageSettings(false);
                          setActiveSettingKey(null);
                          handleOpenEditModal(selectedPage);
                        }}
                        className="px-4 py-2 rounded-lg bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
                      >
                        Update Connected Accounts
                      </button>
                    </div>
                  )}

                  {activeSettingKey === 'Admins' && (
                    <div className="p-3.5 rounded-xl bg-[#F0F2F5] flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#050505]">
                          {userProfile?.name || 'Page Owner'}
                        </p>
                        <p className="text-xs text-[#65676B]">Admin • Full control</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                        Active
                      </span>
                    </div>
                  )}

                  {activeSettingKey === 'Settings & privacy' && (
                    <div className="space-y-2.5">
                      <label className="flex items-center justify-between p-3 rounded-xl bg-[#F0F2F5] cursor-pointer">
                        <span className="text-xs font-bold text-[#050505]">Notify all followers on post</span>
                        <input
                          type="checkbox"
                          checked={creatorPrefs.creatorNotifyFollowersOnPost}
                          onChange={(e) =>
                            updateCreatorPref({ creatorNotifyFollowersOnPost: e.target.checked })
                          }
                          className="w-4 h-4 accent-[#0866FF]"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3 rounded-xl bg-[#F0F2F5] cursor-pointer">
                        <span className="text-xs font-bold text-[#050505]">Push notifications to all users</span>
                        <input
                          type="checkbox"
                          checked={creatorPrefs.creatorSendPushToAllUsers}
                          onChange={(e) =>
                            updateCreatorPref({ creatorSendPushToAllUsers: e.target.checked })
                          }
                          className="w-4 h-4 accent-emerald-600"
                        />
                      </label>
                    </div>
                  )}

                  {activeSettingKey === 'Activity log' && (
                    <div className="space-y-2">
                      {rawPosts.length === 0 ? (
                        <p className="text-xs text-[#65676B] py-4 text-center">
                          এখনো কোনো অ্যাক্টিভিটি রেকর্ড নেই।
                        </p>
                      ) : (
                        rawPosts.map((p) => (
                          <div key={p.id} className="p-3 rounded-xl bg-[#F0F2F5] text-xs space-y-1">
                            <p className="font-bold text-[#050505] line-clamp-2">{p.text}</p>
                            <p className="text-[11px] text-[#65676B]">
                              {p.dateLabel || p.time} • {p.likes} likes
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-4 py-4 space-y-6">
                  {/* Manage Section */}
                  <div className="space-y-1">
                    <h3 className="text-[19px] font-bold text-[#050505] mb-2">Manage</h3>

                    {[
                      { label: 'Page status', icon: Shield },
                      { label: 'Verify your Page', icon: BadgeCheck },
                      { label: 'Action Button', icon: Edit3 },
                      { label: 'Add highlights', icon: Heart },
                      { label: 'Archive', icon: Archive },
                      { label: 'Posts and tags', icon: FileText },
                      { label: 'Connected experiences', icon: Link2 },
                      { label: 'Admins', icon: KeyRound },
                      { label: 'Settings & privacy', icon: Settings },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setActiveSettingKey(item.label)}
                          className="w-full py-3 px-1 flex items-center gap-4 hover:bg-[#F0F2F5] rounded-xl text-left transition-colors cursor-pointer"
                        >
                          <Icon className="w-6 h-6 text-[#050505] shrink-0 stroke-[1.9]" />
                          <span className="text-[16px] font-medium text-[#050505]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Share Section */}
                  <div className="space-y-1">
                    <h3 className="text-[19px] font-bold text-[#050505] mb-2">Share</h3>

                    <button
                      type="button"
                      onClick={() => {
                        const pageUrl = `${window.location.origin}/?tab=pages&pageId=${selectedPage.id}`;
                        if (navigator.share) {
                          navigator.share({
                            title: `Follow ${selectedPage.name} on Peaceverse24`,
                            url: pageUrl,
                          }).catch(() => {});
                        } else {
                          try {
                            navigator.clipboard?.writeText(pageUrl);
                          } catch {}
                          showToast('ইনভাইট লিংক কপি করা হয়েছে!');
                        }
                      }}
                      className="w-full py-3 px-1 flex items-center gap-4 hover:bg-[#F0F2F5] rounded-xl text-left transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-6 h-6 text-[#050505] shrink-0 stroke-[1.9]" />
                      <span className="text-[16px] font-medium text-[#050505]">
                        Invite people to connect
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const pageUrl = `${window.location.origin}/?tab=pages&pageId=${selectedPage.id}`;
                        if (navigator.share) {
                          navigator.share({
                            title: selectedPage.name,
                            text: selectedPage.bio || selectedPage.description || selectedPage.name,
                            url: pageUrl,
                          }).catch(() => {});
                        } else {
                          try {
                            navigator.clipboard?.writeText(pageUrl);
                          } catch {}
                          showToast(`${selectedPage.name} পেজের শেয়ার লিংক কপি হয়েছে!`);
                        }
                      }}
                      className="w-full py-3 px-1 flex items-center gap-4 hover:bg-[#F0F2F5] rounded-xl text-left transition-colors cursor-pointer"
                    >
                      <Share2 className="w-6 h-6 text-[#050505] shrink-0 stroke-[1.9]" />
                      <span className="text-[16px] font-medium text-[#050505]">Share Page</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const pageUrl = `${window.location.origin}/?tab=pages&pageId=${selectedPage.id}`;
                        try {
                          navigator.clipboard?.writeText(pageUrl);
                        } catch {}
                        showToast(`Page link কপি হয়েছে: ${pageUrl}`);
                      }}
                      className="w-full py-3 px-1 flex items-center gap-4 hover:bg-[#F0F2F5] rounded-xl text-left transition-colors cursor-pointer"
                    >
                      <Link2 className="w-6 h-6 text-[#050505] shrink-0 stroke-[1.9]" />
                      <span className="text-[16px] font-medium text-[#050505]">Page link</span>
                    </button>
                  </div>

                  {/* View Section */}
                  <div className="space-y-1">
                    <h3 className="text-[19px] font-bold text-[#050505] mb-2">View</h3>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPageSettings(false);
                        setPageSearchOpen(true);
                      }}
                      className="w-full py-3 px-1 flex items-center gap-4 hover:bg-[#F0F2F5] rounded-xl text-left transition-colors cursor-pointer"
                    >
                      <Search className="w-6 h-6 text-[#050505] shrink-0 stroke-[1.9]" />
                      <span className="text-[16px] font-medium text-[#050505]">Search this Page</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSettingKey('Activity log')}
                      className="w-full py-3 px-1 flex items-center gap-4 hover:bg-[#F0F2F5] rounded-xl text-left transition-colors cursor-pointer"
                    >
                      <List className="w-6 h-6 text-[#050505] shrink-0 stroke-[1.9]" />
                      <span className="text-[16px] font-medium text-[#050505]">Activity log</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* White Facebook Native Switch to Page Bottom Sheet */}
        <FbSwitchToPageSheet
          isOpen={Boolean(sheetPage)}
          onClose={() => setSheetPage(null)}
          page={sheetPage}
          onConfirmSwitch={(page) => {
            if (onSwitchToPage) onSwitchToPage(page);
            setSheetPage(null);
          }}
          onViewPageWithoutSwitch={() => {
            setSheetPage(null);
          }}
          onEditPage={(page) => {
            handleOpenEditModal(page);
          }}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN PAGES HUB (100% Facebook Pages Mobile Reference - White UI)
  // -------------------------------------------------------------
  return (
    <div
      className={
        embedded
          ? 'space-y-3 p-3.5 pb-12 rounded-2xl bg-white text-[#050505]'
          : 'max-w-[700px] mx-auto min-h-screen bg-white text-[#050505] pb-24 font-sans'
      }
    >
      {/* 1. HEADER: Left < Back | Center Pages (bold black) | Right Search icon */}
      {!embedded && (
        <header className="sticky top-0 z-30 bg-white border-b border-[#E4E6EB]">
          <div className="h-[54px] px-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (hubSection !== 'home') {
                  setHubSection('home');
                } else {
                  onBack();
                }
              }}
              className="w-10 h-10 -ml-1 rounded-full hover:bg-[#F0F2F5] active:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
            </button>

            <h1 className="text-[18px] font-bold text-[#050505] tracking-tight">
              Pages
            </h1>

            <button
              type="button"
              onClick={() => setShowHubSearch((prev) => !prev)}
              className="w-9 h-9 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
              title="Search Pages"
              aria-label="Search Pages"
            >
              <Search className="w-[18px] h-[18px] stroke-[2.3]" />
            </button>
          </div>

          {showHubSearch && (
            <div className="px-4 pb-3 pt-1">
              <div className="relative">
                <Search className="w-4 h-4 text-[#65676B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search Pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F0F2F5] rounded-full pl-9 pr-9 py-2 text-[14px] text-[#050505] placeholder-[#65676B] focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65676B] hover:text-[#050505] cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </header>
      )}

      {/* 2. TOP TABS (3 Light-Gray Pills matching Facebook Reference) */}
      <div className="px-4 pt-3 pb-2 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setShowCreatePageLanding(true)}
          className="px-4 py-2 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] active:scale-[0.98] text-[14px] font-semibold text-[#050505] whitespace-nowrap transition-all cursor-pointer shrink-0"
        >
          Create
        </button>

        <button
          type="button"
          onClick={() => setHubSection((prev) => (prev === 'invites' ? 'home' : 'invites'))}
          className={`relative px-4 py-2 rounded-full text-[14px] font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
            hubSection === 'invites'
              ? 'bg-[#E7F3FF] text-[#1877F2]'
              : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505]'
          }`}
        >
          <span>Invites</span>
          {pageInvites.length > 0 && (
            <span
              className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#1877F2]"
              aria-label="Unread invites"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setHubSection((prev) => (prev === 'followed' ? 'home' : 'followed'))}
          className={`px-4 py-2 rounded-full text-[14px] font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
            hubSection === 'followed'
              ? 'bg-[#E7F3FF] text-[#1877F2]'
              : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505]'
          }`}
        >
          Followed Pages
        </button>
      </div>

      {/* SUB-VIEW: INVITES */}
      {hubSection === 'invites' && (
        <div className="px-4 pt-2 pb-6 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#050505]">Page Invites</h2>
            <button
              type="button"
              onClick={() => setHubSection('home')}
              className="text-[13px] font-semibold text-[#1877F2] hover:underline cursor-pointer"
            >
              Back to Pages
            </button>
          </div>

          {pageInvites.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Flag className="w-10 h-10 text-[#65676B] mx-auto opacity-60" />
              <p className="text-[15px] font-semibold text-[#050505]">No Page invites right now</p>
              <p className="text-[13px] text-[#65676B]">
                When friends invite you to follow a Page, it will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E4E6EB]">
              {pageInvites.map((invite) => (
                <div key={invite.id} className="py-3 flex items-start gap-3">
                  <img
                    src={invite.avatar}
                    alt={invite.pageName}
                    className="w-[60px] h-[60px] rounded-full object-cover shrink-0 bg-[#E4E6EB]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-[#050505] leading-snug">
                      {invite.pageName}
                    </p>
                    <p className="text-[13px] text-[#65676B] mt-0.5">
                      {invite.invitedBy} · {invite.time}
                    </p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPageInvites((prev) => prev.filter((item) => item.id !== invite.id));
                          showToast(`Accepted invite to ${invite.pageName}`);
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white text-[14px] font-semibold cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPageInvites((prev) => prev.filter((item) => item.id !== invite.id));
                          showToast('Invite removed');
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-[14px] font-semibold cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW: FOLLOWED PAGES */}
      {hubSection === 'followed' && (
        <div className="px-4 pt-2 pb-6 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#050505]">
              Followed Pages ({followedSuggestedPages.length})
            </h2>
            <button
              type="button"
              onClick={() => setHubSection('home')}
              className="text-[13px] font-semibold text-[#1877F2] hover:underline cursor-pointer"
            >
              Back to Pages
            </button>
          </div>

          {followedSuggestedPages.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <ThumbsUp className="w-10 h-10 text-[#65676B] mx-auto opacity-60" />
              <p className="text-[15px] font-semibold text-[#050505]">No followed Pages yet</p>
              <p className="text-[13px] text-[#65676B]">
                Tap + Follow on Suggested Pages to see them listed here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E4E6EB]">
              {followedSuggestedPages.map((sp) => (
                <div key={sp.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={sp.avatar}
                      alt={sp.name}
                      className="w-[52px] h-[52px] rounded-full object-cover shrink-0 bg-[#E4E6EB]"
                    />
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold text-[#050505] truncate">{sp.name}</p>
                      <p className="text-[13px] text-[#65676B] truncate">
                        {(sp.followers + 1).toLocaleString()} people follow this
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFollowedSuggestedIds((prev) => prev.filter((id) => id !== sp.id));
                      showToast(`Unfollowed ${sp.name}`);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-[13px] font-semibold shrink-0 cursor-pointer"
                  >
                    Following
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DEFAULT VIEW: SECTION 1 (Pages you manage) + SECTION 2 (Suggested Pages) */}
      {hubSection === 'home' && (
        <div className="bg-white">
          {/* SECTION 1: Pages you manage */}
          <section className="px-4 pt-3 pb-4">
            <h2 className="text-[18px] font-bold text-[#050505] mb-3">
              Pages you manage
            </h2>

            {filteredManagedPages.length === 0 ? (
              <div className="py-4 text-center space-y-2.5">
                <p className="text-[14px] text-[#65676B]">
                  {searchQuery
                    ? 'No managed Pages match your search.'
                    : 'আপনি এখনো কোনো পেজ তৈরি করেননি।'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreatePageLanding(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white text-[14px] font-semibold cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Page</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredManagedPages.map((page, index) => {
                  const unreadNewCount = index === 0 ? 50 : 1;
                  return (
                    <div
                      key={page.id}
                      onClick={() => setSelectedPage(page)}
                      className="flex items-center justify-between gap-3 py-1 bg-white hover:bg-[#F7F8FA] rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {page.avatar ? (
                          <img
                            src={page.avatar}
                            alt={page.name}
                            className="w-12 h-12 rounded-full object-cover shrink-0 bg-[#E4E6EB] border border-[#E4E6EB]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full shrink-0 bg-[#E4E6EB] text-[#050505] flex items-center justify-center font-bold text-lg">
                            {page.name.trim().charAt(0).toUpperCase() || <Camera className="w-5 h-5 text-[#65676B]" />}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-[15px] font-bold text-[#050505] truncate leading-snug">
                            {page.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1877F2] mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-[#1877F2] inline-block shrink-0" />
                            <span>{unreadNewCount} new</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSheetPage(page);
                        }}
                        className="w-9 h-9 rounded-full hover:bg-[#F0F2F5] text-[#65676B] flex items-center justify-center shrink-0 cursor-pointer"
                        title="Page options"
                        aria-label={`Options for ${page.name}`}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="h-[1px] bg-[#E4E6EB] mx-4" />

          {/* SECTION 2: Suggested Pages */}
          <section className="px-4 pt-4 pb-6">
            <h2 className="text-[18px] font-bold text-[#050505] mb-3">
              Suggested Pages
            </h2>

            {visibleSuggestedPages.length === 0 ? (
              <p className="text-[14px] text-[#65676B] py-4">
                No suggested Pages available right now.
              </p>
            ) : (
              <div className="space-y-4">
                {visibleSuggestedPages.map((sp) => {
                  const isFollowed = followedSuggestedIds.includes(sp.id);
                  const displayFollowers = isFollowed ? sp.followers + 1 : sp.followers;
                  return (
                    <div key={sp.id} className="flex items-start gap-3">
                      <img
                        src={sp.avatar}
                        alt={sp.name}
                        className="w-[60px] h-[60px] rounded-full object-cover shrink-0 bg-[#E4E6EB]"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-[#050505] leading-snug truncate">
                          {sp.name}
                        </p>
                        <p className="text-[13px] text-[#65676B] mt-0.5">
                          {displayFollowers.toLocaleString()} people follow this
                        </p>

                        <div className="flex items-center gap-2 mt-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setFollowedSuggestedIds((prev) =>
                                prev.includes(sp.id)
                                  ? prev.filter((id) => id !== sp.id)
                                  : [...prev, sp.id]
                              );
                              showToast(
                                isFollowed ? `Unfollowed ${sp.name}` : `Following ${sp.name}`
                              );
                            }}
                            className={`flex-1 py-2 px-3 rounded-lg text-[14px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                              isFollowed
                                ? 'bg-[#E7F3FF] text-[#1877F2]'
                                : 'bg-[#1877F2] hover:bg-[#166FE5] text-white'
                            }`}
                          >
                            {isFollowed ? (
                              <>
                                <Check className="w-4 h-4 stroke-[2.5]" />
                                <span>Following</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 stroke-[2.5]" />
                                <span>Follow</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRemovedSuggestedIds((prev) => [...prev, sp.id]);
                            }}
                            className="flex-1 py-2 px-3 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-[14px] font-semibold flex items-center justify-center transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FACEBOOK CREATE PAGE WIZARD MODAL */}
      {/* ------------------------------------------------------------- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E4E6EB] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 text-black">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#E7F3FF] text-[#0866FF]">
                  <Flag className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black">নতুন পেজ তৈরি করুন (Create Page)</h3>
                  <p className="text-[10px] text-[#65676B]">ধাপ {createStep} / ৩</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="w-full bg-[#E4E6EB] h-1.5">
              <div
                className="bg-[#0866FF] h-full transition-all duration-300"
                style={{ width: `${(createStep / 3) * 100}%` }}
              />
            </div>

            {/* Modal Form Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (createStep === 3) {
                  handleCreatePageSubmit(e);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && createStep < 3) {
                  e.preventDefault();
                  if (!newName.trim()) {
                    showToast('দয়া করে পেজের নাম লিখুন');
                    return;
                  }
                  setCreateStep((prev) => (prev + 1) as any);
                }
              }}
              className="p-4 overflow-y-auto space-y-4 flex-1 bg-white"
            >
              {/* STEP 1: Basic Info */}
              {createStep === 1 && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-[#E7F3FF] border border-[#0866FF]/20 text-xs text-black">
                    💡 <span className="font-bold">পেজ কী?</span> পেজ হলো এমন একটি প্ল্যাটফর্ম যেখানে আপনার দ্বীনি প্রতিষ্ঠান, ব্যবসা, ইউটিউব চ্যানেল বা ব্যক্তিত্বের মাধ্যমে মানুষের সাথে প্রকাশ্যে যুক্ত হতে পারেন।
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      পেজের নাম (Page Name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: SF MART BD / Peace Mart Global / Halal Food Kitchen"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-3 text-xs sm:text-sm text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF] transition-colors"
                    />
                    <p className="text-[11px] text-[#65676B] mt-1">
                      আপনার প্রতিষ্ঠান বা উদ্যোগের নাম ব্যবহার করুন।
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-black">
                        ক্যাটাগরি নির্বাচন করুন <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-[#0866FF] font-semibold">
                        যেকোনো একটি বেছে নিন
                      </span>
                    </div>
                    <div className="space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-2.5 max-h-[330px] overflow-y-auto pr-1 pb-1">
                      {PAGE_CATEGORIES_CONFIG.map((item) => {
                        const Icon = item.icon;
                        const isSelected = newCategory === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setNewCategory(item.value)}
                            className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer shadow-xs ${
                              isSelected
                                ? 'bg-gradient-to-r from-[#0866FF] via-blue-600 to-sky-600 border-[#0866FF] text-white shadow-md ring-2 ring-blue-300'
                                : `${item.cardBg} ${item.borderClass} text-black`
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                                  isSelected ? 'bg-white/20 text-white ring-1 ring-white/30' : item.iconBg
                                }`}
                              >
                                <Icon className="w-5 h-5 stroke-[2.2]" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm leading-snug truncate">
                                  {item.nameBangla}
                                </p>
                                <p
                                  className={`text-xs mt-0.5 truncate font-medium ${
                                    isSelected ? 'text-blue-100' : 'text-[#65676B]'
                                  }`}
                                >
                                  {item.nameEnglish}
                                </p>
                              </div>
                            </div>

                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                                isSelected
                                  ? 'bg-white text-[#0866FF] border-white shadow-xs'
                                  : 'border-[#CCD0D5] bg-[#F0F2F5] text-transparent'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      বায়ো / সংক্ষিপ্ত পরিচিতি (Bio)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="আপনার পেজ বা উদ্যোগের মূল উদ্দেশ্য ও কার্যক্রম লিখুন..."
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                      className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl p-3 text-xs sm:text-sm text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF] transition-colors resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Contact Details */}
              {createStep === 2 && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    📞 <span className="font-bold">যোগাযোগের তথ্য:</span> ফলোয়াররা কীভাবে আপনার সাথে যোগাযোগ করবে তা উল্লেখ করুন (ঐচ্ছিক)।
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>মোবাইল নম্বর (Phone)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+880 17XXXXXXXX"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF] transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="text-[11px] font-bold text-[#65676B]">Direct Chat (Optional)</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Recommended for Global Business</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-[#25D366] mb-1">WhatsApp</label>
                        <input
                          type="tel"
                          placeholder="+880 17XXXXXXXX"
                          value={newWhatsapp}
                          onChange={(e) => setNewWhatsapp(e.target.value)}
                          className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-black placeholder-[#65676B] focus:outline-none focus:border-[#25D366]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-sky-600 mb-1">IMO</label>
                        <input
                          type="tel"
                          placeholder="+880 17XXXXXXXX"
                          value={newImo}
                          onChange={(e) => setNewImo(e.target.value)}
                          className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-black placeholder-[#65676B] focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-purple-600 mb-1">Viber</label>
                        <input
                          type="tel"
                          placeholder="+880 17XXXXXXXX"
                          value={newViber}
                          onChange={(e) => setNewViber(e.target.value)}
                          className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-black placeholder-[#65676B] focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#0866FF]" />
                      <span>ওয়েবসাইট লিংক</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={newWebsite}
                      onChange={(e) => setNewWebsite(e.target.value)}
                      className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>অবস্থান / শহর (City / Location)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Dhaka, Bangladesh"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF] transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Images & Preview */}
              {createStep === 3 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
                    🎨 <span className="font-bold">প্রোফাইল ও কভার ফটো:</span> আপনার নিজস্ব ছবি আপলোড করুন অথবা নিচের ডিজাইন থেকে একটি বেছে নিন।
                  </div>

                  {/* Live Card Preview */}
                  <div className="bg-white rounded-xl border border-[#E4E6EB] overflow-hidden">
                    <div className="h-24 w-full relative bg-[#F0F2F5] flex items-center justify-center">
                      {newCover ? (
                        <>
                          <img src={newCover} alt="Cover" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </>
                      ) : (
                        <span className="text-xs text-[#65676B] font-semibold">কভার ফটো (পরেও যোগ করা যাবে)</span>
                      )}
                    </div>
                    <div className="p-3 flex items-center gap-3">
                      {newAvatar ? (
                        <img
                          src={newAvatar}
                          alt="Avatar"
                          className="w-12 h-12 rounded-xl object-cover border-2 border-white -mt-8 shadow-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#E4E6EB] border-2 border-white -mt-8 shadow-lg flex items-center justify-center text-black font-bold text-sm">
                          <Camera className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-xs text-black">{newName || 'আপনার পেজের নাম'}</p>
                        <p className="text-[10px] text-[#65676B]">{newCategory}</p>
                      </div>
                    </div>
                  </div>

                  {/* Avatar Picker & Device Upload */}
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">
                      প্রোফাইল লোগো / ছবি নির্বাচন করুন:
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      <label className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#F0F2F5] border border-dashed border-[#0866FF] text-[#0866FF] cursor-pointer hover:bg-[#E7F3FF] shrink-0">
                        <Camera className="w-5 h-5" />
                        <span className="text-[8px] font-bold mt-0.5">আপলোড</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarFile}
                        />
                      </label>
                      {PRESET_AVATARS.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Preset"
                          onClick={() => setNewAvatar(url)}
                          className={`w-12 h-12 rounded-xl object-cover cursor-pointer shrink-0 border-2 transition-all ${
                            newAvatar === url ? 'border-[#0866FF] scale-105' : 'border-transparent opacity-70'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Cover Photo Picker & Device Upload */}
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">
                      কভার ফটো নির্বাচন করুন:
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      <label className="flex flex-col items-center justify-center w-20 h-12 rounded-xl bg-[#F0F2F5] border border-dashed border-[#0866FF] text-[#0866FF] cursor-pointer hover:bg-[#E7F3FF] shrink-0">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-[8px] font-bold mt-0.5">আপলোড</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverFile}
                        />
                      </label>
                      {PRESET_COVERS.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Cover preset"
                          onClick={() => setNewCover(url)}
                          className={`w-20 h-12 rounded-xl object-cover cursor-pointer shrink-0 border-2 transition-all ${
                            newCover === url ? 'border-[#0866FF] scale-105' : 'border-transparent opacity-70'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-3 border-t border-[#E4E6EB] flex items-center justify-between">
                {createStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCreateStep((prev) => (prev - 1) as any)}
                    className="px-5 py-2.5 rounded-xl bg-[#E4E6EB] hover:bg-[#D8DADF] text-xs sm:text-sm font-bold text-black transition-colors cursor-pointer"
                  >
                    ← আগের ধাপ
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#E4E6EB] hover:bg-[#D8DADF] text-xs sm:text-sm font-bold text-black transition-colors cursor-pointer"
                  >
                    বাতিল
                  </button>
                )}

                {createStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!newName.trim()) {
                        showToast('দয়া করে পেজের নাম লিখুন');
                        return;
                      }
                      setCreateStep((prev) => (prev + 1) as any);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#166fe5] active:scale-[0.99] text-xs sm:text-sm font-bold text-white transition-all shadow-md shadow-blue-500/30 cursor-pointer"
                  >
                    পরবর্তী ধাপ →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-xs sm:text-sm font-bold text-white transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 stroke-[2.5]" />
                    <span>💾 পেজটি সেভ করুন ও চালু করুন (Save Page)</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1877F2] text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Facebook Native Switch to Page Sheet */}
      <FbSwitchToPageSheet
        isOpen={Boolean(sheetPage)}
        onClose={() => setSheetPage(null)}
        page={sheetPage}
        onConfirmSwitch={(page) => {
          if (onSwitchToPage) onSwitchToPage(page);
          setSheetPage(null);
        }}
        onViewPageWithoutSwitch={(page) => {
          setSheetPage(null);
          setSelectedPage(page);
        }}
      />
    </div>
  );
};
