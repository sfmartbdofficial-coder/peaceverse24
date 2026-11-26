import React, { useState, useEffect, useRef } from 'react';
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
  Copy,
  Download,
  RotateCcw,
  ChevronRight,
  UserCircle2,
  CircleDollarSign,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { NotificationItem, PageItem, PostItem, ReactionType, UserProfile } from '../../types';
import { CreatorMonetizationModal } from '../monetization/CreatorMonetizationModal';
import { FbCreatePageLandingView } from './FbCreatePageLandingView';
import { FbSwitchToPageSheet } from './FbSwitchToPageSheet';
import { FbPostCard } from './FbPostCard';
import { FbCreateReelModal } from './FbCreateReelModal';
import { FbBoostPostModal, getBoostedPostCampaign } from './FbBoostPostModal';
import {
  FbCommentBottomSheet,
  readCommentLikesStore,
  toggleCommentLikeLocally,
} from './FbCommentBottomSheet';
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
import { loadDeedsLog, saveDeedsLog, DeedLogItem } from '../../utils/privacyMask';
import { sanitizeInput, validateMediaUpload } from '../../utils/security';
import { useHistoryBack } from '../../utils/backNavigation';
import { FACEBOOK_PAGE_CATEGORIES } from '../../utils/categories';
import {
  ADULT_BLOCK_MESSAGE,
  checkMediaFilenamesSafe,
  checkMediaVisualSafety,
  checkPost,
} from '../../lib/halalFilter';
import {
  syncPageToFirestore,
  fetchPageByIdFromFirestore,
  fetchOwnedPagesFromFirestore,
  searchPagesFromFirestore,
  isTargetFollowedLocally,
  setTargetFollowedLocally,
  toggleFollowUser,
  subscribeToFollowStatus,
  isSameOwnerIdentity,
  sanitizePageBioValue,
  deactivatePageInFirestore,
  schedulePageDeletionInFirestore,
  cancelPageDeletionInFirestore,
  permanentlyDeletePageFromFirestore,
  PAGE_DELETION_GRACE_DAYS,
} from '../../lib/firebase';
import { compressImageForFirestore } from '../../utils/imageCompress';
import { uploadDataUrlIfOversized, useResolvedMediaUrl } from '../../lib/mediaStorage';

interface FbPagesViewProps {
  onBack: () => void;
  userProfile?: UserProfile;
  onSwitchToPage?: (page: PageItem, options?: { stayInPage?: boolean }) => void;
  activeSwitchedPageId?: string | null;
  embedded?: boolean;
  onBroadcastNotification?: (notif: NotificationItem) => void;
  initialSelectedPageId?: string | null;
  onClearInitialSelectedPageId?: () => void;
  openSwitchSheetOnInitialOpen?: boolean;
  onClearOpenSwitchSheet?: () => void;
  initialCreatePageName?: string | null;
  onClearInitialCreatePageName?: () => void;
  feedPosts?: PostItem[];
  onToggleFeedReaction?: (postId: string, reaction: ReactionType) => void;
  onToggleFeedSave?: (postId: string) => void;
  onAddFeedComment?: (postId: string, text: string) => void;
  onEditFeedPost?: (postId: string, newContent: string, newArabic?: string, newTranslation?: string) => void;
  onDeleteFeedPost?: (postId: string) => void;
  onOpenFeedReel?: (post: PostItem) => void;
  onOpenFeedGiftModal?: (post: PostItem) => void;
  onPublishFeedPost?: (post: PostItem) => void;
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

const SUGGESTED_ISLAMIC_PAGES: SuggestedIslamicPage[] = [];

const INITIAL_PAGE_INVITES: Array<{
  id: string;
  pageName: string;
  invitedBy: string;
  category: string;
  avatar: string;
  time: string;
}> = [];

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

const CATEGORIES_LIST = FACEBOOK_PAGE_CATEGORIES.map((c) => c.value);

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
    value: 'Digital Creator (ডিজিটাল ক্রিয়েটর)',
    nameBangla: 'ডিজিটাল কনটেন্ট ক্রিয়েটর',
    nameEnglish: 'Digital Creator',
    icon: Sparkles,
    iconBg: 'bg-purple-100 text-purple-700 border border-purple-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-purple-400',
  },
  {
    value: 'Public Figure (পাবলিক ফিগার)',
    nameBangla: 'পাবলিক ফিগার ও ব্যক্তিত্ব',
    nameEnglish: 'Public Figure',
    icon: UserCheck,
    iconBg: 'bg-sky-100 text-sky-700 border border-sky-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-sky-400',
  },
  {
    value: 'Shopping & Retail (শপিং ও রিটেইল)',
    nameBangla: 'শপিং ও রিটেইল / হালাল শপ',
    nameEnglish: 'Shopping & Retail',
    icon: ShoppingBag,
    iconBg: 'bg-amber-100 text-amber-700 border border-amber-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-amber-400',
  },
  {
    value: 'Entrepreneur & Business (ব্যবসা ও উদ্যোক্তা)',
    nameBangla: 'ব্যবসা ও উদ্যোক্তা প্রতিষ্ঠান',
    nameEnglish: 'Entrepreneur & Business',
    icon: Building,
    iconBg: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-indigo-400',
  },
  {
    value: 'Education & Academy (শিক্ষা ও একাডেমি)',
    nameBangla: 'শিক্ষা, কোচিং ও একাডেমি',
    nameEnglish: 'Education & Academy',
    icon: BookOpen,
    iconBg: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-emerald-400',
  },
  {
    value: 'Media & News Company (মিডিয়া ও নিউজ)',
    nameBangla: 'মিডিয়া ও সংবাদ প্রকাশনা',
    nameEnglish: 'Media & News Company',
    icon: Radio,
    iconBg: 'bg-blue-100 text-[#0866FF] border border-blue-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-[#0866FF]',
  },
  {
    value: 'Video & Entertainment (ভিডিও ও বিনোদন)',
    nameBangla: 'ভিডিও ও বিনোদন ক্রিয়েটর',
    nameEnglish: 'Video & Entertainment',
    icon: Video,
    iconBg: 'bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-fuchsia-400',
  },
  {
    value: 'Food & Restaurant (খাবার ও রেস্তোরাঁ)',
    nameBangla: 'খাবার ও রেস্তোরাঁ শপ',
    nameEnglish: 'Food & Restaurant',
    icon: Utensils,
    iconBg: 'bg-orange-100 text-orange-700 border border-orange-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-orange-400',
  },
  {
    value: 'Community Organization (কমিউনিটি সংগঠন)',
    nameBangla: 'কমিউনিটি ও সমাজ সংগঠন',
    nameEnglish: 'Community Organization',
    icon: Users,
    iconBg: 'bg-teal-100 text-teal-700 border border-teal-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-teal-400',
  },
  {
    value: 'Religious & Islamic Center (ধর্মীয় ও ইসলামিক প্রতিষ্ঠান)',
    nameBangla: 'মসজিদ ও ইসলামিক প্রতিষ্ঠান',
    nameEnglish: 'Religious & Islamic Center',
    icon: Building,
    iconBg: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-emerald-500',
  },
  {
    value: 'Nonprofit & Charity (চ্যারিটি ও সেবা)',
    nameBangla: 'চ্যারিটি ও সমাজসেবা সংস্থা',
    nameEnglish: 'Nonprofit & Charity',
    icon: HeartHandshake,
    iconBg: 'bg-rose-100 text-rose-700 border border-rose-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-rose-400',
  },
  {
    value: 'Health & Wellness (স্বাস্থ্য ও সুস্থতা)',
    nameBangla: 'স্বাস্থ্য ও সুস্থতা কেন্দ্র',
    nameEnglish: 'Health & Wellness',
    icon: Heart,
    iconBg: 'bg-pink-100 text-pink-700 border border-pink-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-pink-400',
  },
  {
    value: 'Personal Blog (পার্সোনাল ব্লগ)',
    nameBangla: 'পার্সোনাল ব্লগ ও লেখালেখি',
    nameEnglish: 'Personal Blog',
    icon: FileText,
    iconBg: 'bg-slate-100 text-slate-700 border border-slate-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-slate-400',
  },
  {
    value: 'Local Business & Service (লোকাল বিজনেস)',
    nameBangla: 'লোকাল বিজনেস ও সার্ভিস',
    nameEnglish: 'Local Business & Service',
    icon: MapPin,
    iconBg: 'bg-amber-100 text-amber-800 border border-amber-200',
    cardBg: 'bg-white hover:bg-[#F0F2F5]',
    borderClass: 'border-[#E4E6EB] hover:border-amber-500',
  },
];

interface PageAdminMember {
  id: string;
  name: string;
  contact: string;
  role: 'Full control' | 'Partial control' | 'Task access' | 'Community manager';
  addedAt: string;
}

interface PageHighlightItem {
  id: string;
  title: string;
  note?: string;
  image?: string;
  createdAt: string;
}

interface PageActivityItem {
  id: string;
  category: 'post' | 'settings' | 'archive' | 'invite';
  title: string;
  detail?: string;
  time: string;
}

interface ArchivedPagePost {
  id: string;
  text: string;
  time: string;
  dateLabel?: string;
  likes: number;
  comments: number;
  pinned?: boolean;
  reach?: number;
  clicks?: number;
  archivedAt?: string;
}

interface PageSettingsData {
  allowRecommendations: boolean;
  verificationStatus: 'none' | 'pending' | 'verified';
  verificationCategory: string;
  verificationNote: string;
  verificationDocType: string;
  verificationDocName: string;
  verificationCountry: string;
  verificationReason: string;
  actionButtonType: string;
  actionButtonValue: string;
  whoCanPost: 'admins' | 'everyone';
  whoCanSeeOthersPosts: 'everyone' | 'admins';
  reviewTagsBeforeShowing: boolean;
  allowMentions: boolean;
  allowComments: boolean;
  isPublished: boolean;
  searchEngineVisible: boolean;
  allowDirectMessages: boolean;
  halalFilterLevel: 'strong' | 'standard';
  modHideLinks: boolean;
  modHideProfanity: boolean;
  modNoAvatarBlock: boolean;
  modBlockedWords: string[];
  blockedUsers: string[];
  statusFeedbackGiven: boolean;
  customSlug: string;
  invitedNames: string[];
  admins: PageAdminMember[];
  highlights: PageHighlightItem[];
  archivedPosts: ArchivedPagePost[];
  trashedPosts: ArchivedPagePost[];
  activityLog: PageActivityItem[];
}

const DEFAULT_PAGE_SETTINGS: PageSettingsData = {
  allowRecommendations: true,
  verificationStatus: 'none',
  verificationCategory: 'Creator / Public Figure',
  verificationNote: '',
  verificationDocType: 'National Identity Card (NID)',
  verificationDocName: '',
  verificationCountry: 'Bangladesh',
  verificationReason: '',
  actionButtonType: 'WhatsApp',
  actionButtonValue: '',
  whoCanPost: 'admins',
  whoCanSeeOthersPosts: 'everyone',
  reviewTagsBeforeShowing: false,
  allowMentions: true,
  allowComments: true,
  isPublished: true,
  searchEngineVisible: true,
  allowDirectMessages: true,
  halalFilterLevel: 'strong',
  modHideLinks: true,
  modHideProfanity: true,
  modNoAvatarBlock: false,
  modBlockedWords: ['spam', 'scam'],
  blockedUsers: [],
  statusFeedbackGiven: false,
  customSlug: '',
  invitedNames: [],
  admins: [],
  highlights: [],
  archivedPosts: [],
  trashedPosts: [],
  activityLog: [],
};

const INVITABLE_CONTACTS: string[] = [];

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
  feedPosts = [],
  onToggleFeedReaction,
  onToggleFeedSave,
  onAddFeedComment,
  onEditFeedPost,
  onDeleteFeedPost,
  onOpenFeedReel,
  onOpenFeedGiftModal,
  onPublishFeedPost,
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
              bio: sanitizePageBioValue(p.bio),
              description: sanitizePageBioValue(p.description),
              avatar: p.avatar && !p.avatar.startsWith('blob:') ? p.avatar : '',
              cover: p.cover && !p.cover.startsWith('blob:') ? p.cover : '',
              followingCount: p.followingCount ?? 0,
              followedBy: Array.isArray(p.followedBy) ? p.followedBy : [],
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
    pages.forEach((p) => {
      if (p?.isOwner) {
        void syncPageToFirestore(p, userProfile?.id);
      }
    });
  }, [pages, userProfile?.id]);

  // Hydrate owned pages from Firestore & cross-tab sync so page logos/covers survive updates
  useEffect(() => {
    const mergeRemotePages = async () => {
      if (!userProfile?.id || userProfile.id === 'user-me') return;
      const remotePages = await fetchOwnedPagesFromFirestore(userProfile.id);
      if (remotePages.length === 0) return;
      setPages((prev) => {
        const byId = new Map<string, PageItem>();
        remotePages.forEach((rp) => {
          if (rp?.id) byId.set(rp.id, rp);
        });
        prev.forEach((lp) => {
          if (!lp?.id) return;
          const rp = byId.get(lp.id);
          if (!rp) {
            byId.set(lp.id, lp);
          } else {
            byId.set(lp.id, {
              ...rp,
              ...lp,
              avatar: (lp.avatar && !lp.avatar.startsWith('blob:') ? lp.avatar : '') || rp.avatar || '',
              cover: (lp.cover && !lp.cover.startsWith('blob:') ? lp.cover : '') || rp.cover || '',
              bio: lp.bio || rp.bio || '',
              description: lp.description || rp.description || '',
            });
          }
        });
        return Array.from(byId.values());
      });
      setSelectedPage((cur) => {
        if (!cur) return cur;
        const rp = remotePages.find((p) => p.id === cur.id);
        if (!rp) return cur;
        return {
          ...rp,
          ...cur,
          avatar: (cur.avatar && !cur.avatar.startsWith('blob:') ? cur.avatar : '') || rp.avatar || '',
          cover: (cur.cover && !cur.cover.startsWith('blob:') ? cur.cover : '') || rp.cover || '',
          bio: cur.bio || rp.bio || '',
          description: cur.description || rp.description || '',
        };
      });
    };
    void mergeRemotePages();
    const onHydrated = () => {
      try {
        const raw = localStorage.getItem('qalby_fb_pages');
        if (!raw) return;
        const parsed: PageItem[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPages(parsed.filter((p) => Boolean(p?.isOwner) && !DEMO_PAGE_IDS.includes(p.id)));
        }
      } catch {}
    };
    window.addEventListener('peaceverse:pages-hydrated', onHydrated);
    return () => window.removeEventListener('peaceverse:pages-hydrated', onHydrated);
  }, [userProfile?.id]);

  // Hub sub-views (main Pages view, Invites, Followed Pages) & header search toggle
  const [hubSection, setHubSection] = useState<'home' | 'invites' | 'followed'>('home');
  const [showHubSearch, setShowHubSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [remoteHubPages, setRemoteHubPages] = useState<PageItem[]>([]);
  const [followedSuggestedIds, setFollowedSuggestedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('peace_followed_suggested_pages');
      const parsed: string[] = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? parsed.filter((id) => isTargetFollowedLocally(id) || parsed.includes(id))
        : [];
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
    const q = searchQuery.trim();
    if (!q) {
      setRemoteHubPages([]);
      return;
    }
    let active = true;
    const timer = window.setTimeout(async () => {
      const found = await searchPagesFromFirestore(q, false);
      if (active) {
        setRemoteHubPages(found);
      }
    }, 200);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    try {
      localStorage.setItem('peace_removed_suggested_pages', JSON.stringify(removedSuggestedIds));
    } catch {}
  }, [removedSuggestedIds]);

  const [selectedPage, setSelectedPage] = useState<PageItem | null>(() => {
    try {
      const targetId =
        initialSelectedPageId || localStorage.getItem('peaceverse_selected_page_id_v1');
      if (!targetId) return null;
      const owned = pages.find((p) => p.id === targetId);
      if (owned) return owned;
      const visitedRaw = localStorage.getItem('peaceverse_visited_page_v1');
      if (visitedRaw) {
        const visited: PageItem = JSON.parse(visitedRaw);
        if (visited?.id === targetId) {
          return {
            ...visited,
            bio: sanitizePageBioValue(visited.bio),
            description: sanitizePageBioValue(visited.description),
            isLiked: isTargetFollowedLocally(visited.id, visited.name) || Boolean(visited.isLiked),
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const resolvedSelectedPageCover = useResolvedMediaUrl(selectedPage?.cover);
  const resolvedSelectedPageAvatar = useResolvedMediaUrl(selectedPage?.avatar);

  useEffect(() => {
    try {
      if (selectedPage) {
        localStorage.setItem('peaceverse_selected_page_id_v1', selectedPage.id);
      } else {
        localStorage.removeItem('peaceverse_selected_page_id_v1');
      }
    } catch {}
    setPageSearchQuery('');
    setPostFilterMode('all');
    setBioExpanded(false);
  }, [selectedPage?.id]);

  // Hydrate missing bio/details from Firestore when opening a page after refresh or across devices
  useEffect(() => {
    const pageId = selectedPage?.id;
    if (!pageId) return;
    let active = true;
    const localHasBio = Boolean(
      sanitizePageBioValue(selectedPage?.bio) || sanitizePageBioValue(selectedPage?.description)
    );
    if (localHasBio) return;
    fetchPageByIdFromFirestore(pageId).then((remote) => {
      if (!active || !remote) return;
      const remoteBio = sanitizePageBioValue(remote.bio) || sanitizePageBioValue(remote.description);
      if (!remoteBio) return;
      setSelectedPage((prev) =>
        prev && prev.id === pageId
          ? {
              ...prev,
              bio: sanitizePageBioValue(prev.bio) || remoteBio,
              description: sanitizePageBioValue(prev.description) || remoteBio,
            }
          : prev
      );
      setPages((prev) =>
        prev.map((p) =>
          p.id === pageId
            ? {
                ...p,
                bio: sanitizePageBioValue(p.bio) || remoteBio,
                description: sanitizePageBioValue(p.description) || remoteBio,
              }
            : p
        )
      );
    });
    return () => {
      active = false;
    };
  }, [selectedPage?.id]);

  // Keep selectedPage follow status permanently synced with localStorage + Firestore
  useEffect(() => {
    if (!selectedPage?.id) return;
    const unsub = subscribeToFollowStatus(
      userProfile?.id || 'user-me',
      selectedPage.id,
      (following) => {
        setSelectedPage((prev) =>
          prev && prev.id === selectedPage.id && Boolean(prev.isLiked) !== following
            ? { ...prev, isLiked: following }
            : prev
        );
      },
      selectedPage.name
    );
    return () => unsub();
  }, [selectedPage?.id, selectedPage?.name, userProfile?.id]);

  useEffect(() => {
    if (!initialSelectedPageId) return;
    let active = true;
    const owned = pages.find((p) => p.id === initialSelectedPageId);
    if (owned) {
      setSelectedPage(owned);
      if (openSwitchSheetOnInitialOpen) {
        setSheetPage(owned);
        onClearOpenSwitchSheet?.();
      }
      onClearInitialSelectedPageId?.();
      return;
    }

    try {
      const visitedRaw = localStorage.getItem('peaceverse_visited_page_v1');
      if (visitedRaw) {
        const visited: PageItem = JSON.parse(visitedRaw);
        if (visited?.id === initialSelectedPageId) {
          setSelectedPage({
            ...visited,
            bio: sanitizePageBioValue(visited.bio),
            description: sanitizePageBioValue(visited.description),
            isLiked: isTargetFollowedLocally(visited.id, visited.name) || Boolean(visited.isLiked),
          });
          onClearInitialSelectedPageId?.();
          return;
        }
      }
    } catch {}

    fetchPageByIdFromFirestore(initialSelectedPageId).then((remote) => {
      if (!active) return;
      if (remote) {
        try {
          localStorage.setItem('peaceverse_visited_page_v1', JSON.stringify(remote));
        } catch {}
        setSelectedPage(remote);
      }
      onClearInitialSelectedPageId?.();
    });

    return () => {
      active = false;
    };
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

  // Edit Page Modal State & Direct Bio Editor State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditBioModal, setShowEditBioModal] = useState(false);
  const [bioModalDraft, setBioModalDraft] = useState('');
  const [bioExpanded, setBioExpanded] = useState(false);
  useHistoryBack(showEditBioModal, () => setShowEditBioModal(false), 'page-edit-bio');
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
  const [pageSubTab, setPageSubTab] = useState<'all' | 'photos' | 'reels' | 'events' | 'mentions' | 'deeds'>(() => {
    try {
      const saved = localStorage.getItem('peaceverse_page_subtab_v1');
      if (
        saved === 'all' ||
        saved === 'photos' ||
        saved === 'reels' ||
        saved === 'events' ||
        saved === 'mentions' ||
        saved === 'deeds'
      ) {
        return saved;
      }
    } catch {}
    return 'all';
  });
  const [pageDeedsLog, setPageDeedsLog] = useState<DeedLogItem[]>(() => loadDeedsLog());

  useEffect(() => {
    try {
      localStorage.setItem('peaceverse_page_subtab_v1', pageSubTab);
    } catch {}
  }, [pageSubTab]);
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
  const [pageEventRsvps, setPageEventRsvps] = useState<Record<string, 'going' | 'interested'>>(() => {
    try {
      const saved = localStorage.getItem('peaceverse_page_event_rsvps_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [pageReviewsMap, setPageReviewsMap] = useState<
    Record<string, Array<{ id: string; author: string; rating: number; text: string; time: string }>>
  >(() => {
    try {
      const saved = localStorage.getItem('peaceverse_page_reviews_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [reviewRatingDraft, setReviewRatingDraft] = useState<number>(5);
  const [reviewTextDraft, setReviewTextDraft] = useState('');
  const [pagePostText, setPagePostText] = useState('');
  const [pagePostImage, setPagePostImage] = useState('');
  const [showPageComposer, setShowPageComposer] = useState(false);
  const [pendingPageUpload, setPendingPageUpload] = useState<{
    pageId: string;
    id: string;
    text: string;
    image?: string;
    progress: number;
  } | null>(null);
  const [pageFreshNowTick, setPageFreshNowTick] = useState<number>(() => Date.now());
  const [viewAsVisitor, setViewAsVisitor] = useState(false);
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [activeCommentSheetPostId, setActiveCommentSheetPostId] = useState<string | null>(null);
  const [pageCommentLikesMap, setPageCommentLikesMap] = useState<Record<string, boolean>>(() =>
    readCommentLikesStore()
  );
  const [postCommentDrafts, setPostCommentDrafts] = useState<Record<string, string>>({});
  const [expandedInlineCommentPostId, setExpandedInlineCommentPostId] = useState<string | null>(null);
  const inlineCommentTextareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostText, setEditingPostText] = useState('');
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
  const [pendingPageBoostDraft, setPendingPageBoostDraft] = useState<{
    localPost: {
      id: string;
      text: string;
      image?: string;
      time: string;
      dateLabel: string;
      createdAtMillis: number;
      likes: number;
      isLikedByMe: boolean;
      comments: number;
      shares: number;
      commentsList: any[];
      pinned: boolean;
      reach: number;
      clicks: number;
    };
    feedPost: PostItem;
  } | null>(null);
  const [showPagePostBoostPrompt, setShowPagePostBoostPrompt] = useState(false);
  const [showPagePostBoostSetup, setShowPagePostBoostSetup] = useState(false);
  const [inlineBoostModalState, setInlineBoostModalState] = useState<{
    post: PostItem;
    mode: 'boost' | 'insights';
  } | null>(null);
  const [, setInlineBoostTick] = useState(0);
  useEffect(() => {
    const refresh = () => setInlineBoostTick((t) => t + 1);
    window.addEventListener('peaceverse:boost-updated', refresh);
    return () => window.removeEventListener('peaceverse:boost-updated', refresh);
  }, []);
  const [showPageLiveModal, setShowPageLiveModal] = useState(false);
  const [pageLiveTitle, setPageLiveTitle] = useState('');
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [activeSettingKey, setActiveSettingKey] = useState<string | null>(null);
  const [pageSettingsMap, setPageSettingsMap] = useState<Record<string, PageSettingsData>>(() => {
    try {
      const saved = localStorage.getItem('peaceverse_page_settings_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [newHighlightTitle, setNewHighlightTitle] = useState('');
  const [newHighlightNote, setNewHighlightNote] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminContact, setNewAdminContact] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'Full control' | 'Partial control' | 'Task access' | 'Community manager'>('Full control');
  const [inviteSearch, setInviteSearch] = useState('');
  const [confirmDeletePage, setConfirmDeletePage] = useState(false);
  const [deletePageMode, setDeletePageMode] = useState<'schedule_14d' | 'immediate'>('schedule_14d');
  const [pageLifecycleBusy, setPageLifecycleBusy] = useState(false);
  const [activityFilter, setActivityFilter] = useState<'all' | 'post' | 'settings' | 'archive' | 'invite'>('all');
  const [actionBtnTypeDraft, setActionBtnTypeDraft] = useState('WhatsApp');
  const [actionBtnValueDraft, setActionBtnValueDraft] = useState('');
  const [verifyCategoryDraft, setVerifyCategoryDraft] = useState('Creator / Public Figure');
  const [verifyNoteDraft, setVerifyNoteDraft] = useState('');
  const [verifyDocTypeDraft, setVerifyDocTypeDraft] = useState('National Identity Card (NID)');
  const [verifyDocNameDraft, setVerifyDocNameDraft] = useState('');
  const [verifyCountryDraft, setVerifyCountryDraft] = useState('Bangladesh');
  const [verifyReasonDraft, setVerifyReasonDraft] = useState('');
  const [newHighlightImage, setNewHighlightImage] = useState('');
  const [archiveTab, setArchiveTab] = useState<'archive' | 'trash'>('archive');
  const [privacySubView, setPrivacySubView] = useState<
    null | 'setup' | 'privacy' | 'notifications' | 'blocking' | 'info' | 'deletion'
  >(null);
  const [setupNameDraft, setSetupNameDraft] = useState('');
  const [setupBioDraft, setSetupBioDraft] = useState('');
  const [newBlockedUserName, setNewBlockedUserName] = useState('');

  // Hardware & browser Back button stack for FbPagesView hierarchy
  useHistoryBack(hubSection !== 'home', () => setHubSection('home'), 'pages-hub-section');
  useHistoryBack(showHubSearch, () => {
    setShowHubSearch(false);
    setSearchQuery('');
  }, 'pages-hub-search');
  useHistoryBack(Boolean(selectedPage), () => setSelectedPage(null), 'pages-selected-page');
  useHistoryBack(pageSearchOpen, () => {
    setPageSearchOpen(false);
    setPageSearchQuery('');
  }, 'pages-page-search');
  useHistoryBack(showPageSettings, () => setShowPageSettings(false), 'pages-settings');
  useHistoryBack(Boolean(activeSettingKey), () => setActiveSettingKey(null), 'pages-setting-detail');
  useHistoryBack(Boolean(privacySubView), () => setPrivacySubView(null), 'pages-privacy-sub');
  useHistoryBack(showCreatePageLanding, () => setShowCreatePageLanding(false), 'pages-create-landing');
  useHistoryBack(Boolean(sheetPage), () => setSheetPage(null), 'pages-switch-sheet');
  useHistoryBack(showCreateModal, () => setShowCreateModal(false), 'pages-create-modal');
  useHistoryBack(showEditModal, () => setShowEditModal(false), 'pages-edit-modal');
  useHistoryBack(showCreatorDashboard, () => setShowCreatorDashboard(false), 'pages-creator-dashboard');
  useHistoryBack(showMonetizationModal, () => setShowMonetizationModal(false), 'pages-monetization');
  useHistoryBack(showAdvertiseModal, () => setShowAdvertiseModal(false), 'pages-advertise');
  useHistoryBack(Boolean(boostTargetPost), () => setBoostTargetPost(null), 'pages-boost-post');
  useHistoryBack(Boolean(insightsPost), () => setInsightsPost(null), 'pages-post-insights');
  useHistoryBack(showPageComposer, () => setShowPageComposer(false), 'pages-composer');
  useHistoryBack(showExtraDetailsModal, () => setShowExtraDetailsModal(false), 'pages-extra-details');
  useHistoryBack(showPageReelModal, () => setShowPageReelModal(false), 'pages-reel-modal');
  useHistoryBack(showPageLiveModal, () => setShowPageLiveModal(false), 'pages-live-modal');
  useHistoryBack(confirmDeletePage, () => setConfirmDeletePage(false), 'pages-confirm-delete');
  const [customSlugDraft, setCustomSlugDraft] = useState('');
  const [connWhatsapp, setConnWhatsapp] = useState('');
  const [connPhone, setConnPhone] = useState('');
  const [connEmail, setConnEmail] = useState('');
  const [connWebsite, setConnWebsite] = useState('');
  const [connImo, setConnImo] = useState('');
  const [connViber, setConnViber] = useState('');
  const [pageStatusSubView, setPageStatusSubView] = useState<
    | null
    | 'recommendations'
    | 'moderation'
    | 'updates'
    | 'guide_intro'
    | 'guide_enforce'
    | 'guide_tips'
    | 'feedback'
  >(null);
  const [modNewWord, setModNewWord] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<'satisfied' | 'neutral' | 'dissatisfied'>('satisfied');
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('peaceverse_page_settings_v1', JSON.stringify(pageSettingsMap));
    } catch {}
  }, [pageSettingsMap]);

  const getPageSettings = (pageId: string): PageSettingsData => ({
    ...DEFAULT_PAGE_SETTINGS,
    ...(pageSettingsMap[pageId] || {}),
  });

  const updatePageSettings = (
    pageId: string,
    updater: Partial<PageSettingsData> | ((prev: PageSettingsData) => PageSettingsData)
  ) => {
    setPageSettingsMap((prev) => {
      const current: PageSettingsData = {
        ...DEFAULT_PAGE_SETTINGS,
        ...(prev[pageId] || {}),
      };
      const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
      return { ...prev, [pageId]: next };
    });
  };

  const logPageActivity = (
    pageId: string,
    category: PageActivityItem['category'],
    title: string,
    detail?: string
  ) => {
    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    updatePageSettings(pageId, (cur) => ({
      ...cur,
      activityLog: [
        {
          id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          category,
          title,
          detail,
          time: `${dateStr} • ${timeStr}`,
        },
        ...(cur.activityLog || []).slice(0, 49),
      ],
    }));
  };

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
        image?: string;
        time: string;
        dateLabel?: string;
        createdAtMillis?: number;
        likes: number;
        isLikedByMe?: boolean;
        comments: number;
        shares?: number;
        commentsList?: Array<{ id: string; author: string; avatar?: string; text: string; time: string }>;
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
    const allPosts = Object.values(pagePostsList).flat();
    const hasFresh = allPosts.some(
      (p) => (p.createdAtMillis || 0) > 0 && Date.now() - (p.createdAtMillis || 0) < 3 * 60 * 1000
    );
    if (!hasFresh) return;
    const timer = window.setInterval(() => {
      setPageFreshNowTick(Date.now());
    }, 20000);
    return () => window.clearInterval(timer);
  }, [pagePostsList]);

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

  useEffect(() => {
    try {
      localStorage.setItem('peaceverse_page_event_rsvps_v1', JSON.stringify(pageEventRsvps));
    } catch {}
  }, [pageEventRsvps]);

  useEffect(() => {
    try {
      localStorage.setItem('peaceverse_page_reviews_v1', JSON.stringify(pageReviewsMap));
    } catch {}
  }, [pageReviewsMap]);

  const syncUpdatedPageToSwitchedStorage = (updated: PageItem | null, deletedId?: string) => {
    try {
      const switchedRaw = localStorage.getItem('qalby_switched_page');
      if (!switchedRaw) return;
      const switched = JSON.parse(switchedRaw);
      if (deletedId && switched?.id === deletedId) {
        localStorage.removeItem('qalby_switched_page');
        window.dispatchEvent(new Event('peaceverse:switched-page-updated'));
      } else if (updated && switched?.id === updated.id) {
        localStorage.setItem('qalby_switched_page', JSON.stringify(updated));
        window.dispatchEvent(new Event('peaceverse:switched-page-updated'));
      }
    } catch {}
  };

  const persistUpdatedPage = (updated: PageItem) => {
    const cleanUpdated: PageItem = {
      ...updated,
      bio: sanitizePageBioValue(updated.bio),
      description: sanitizePageBioValue(updated.description),
    };
    setSelectedPage(cleanUpdated);
    setPages((prev) => {
      const exists = prev.some((p) => p.id === cleanUpdated.id);
      const next = exists
        ? prev.map((p) => (p.id === cleanUpdated.id ? cleanUpdated : p))
        : cleanUpdated.isOwner
        ? [cleanUpdated, ...prev]
        : prev;
      try {
        localStorage.setItem('qalby_fb_pages', JSON.stringify(next));
      } catch {}
      return next;
    });
    try {
      localStorage.setItem('peaceverse_visited_page_v1', JSON.stringify(cleanUpdated));
    } catch {}
    syncUpdatedPageToSwitchedStorage(cleanUpdated);
    void syncPageToFirestore(cleanUpdated, userProfile?.id);
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle Like / Follow on a page (persisted permanently in localStorage + Firestore)
  const handleToggleLike = async (pageId: string) => {
    const targetPage =
      (selectedPage && selectedPage.id === pageId ? selectedPage : null) ||
      pages.find((p) => p.id === pageId) ||
      remoteHubPages.find((p) => p.id === pageId);

    const targetName = targetPage?.name || 'Page';
    const targetAvatar = targetPage?.avatar || '';

    const nextLiked = await toggleFollowUser(
      userProfile?.id || 'user-me',
      userProfile?.name || 'User',
      userProfile?.avatar || '',
      pageId,
      targetName,
      targetAvatar
    );

    setPages((prev) =>
      prev.map((p) => {
        if (p.id === pageId) {
          const nextFollowers = nextLiked
            ? p.followersCount + (p.isLiked ? 0 : 1)
            : Math.max(0, p.followersCount - (p.isLiked ? 1 : 0));
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
      const nextFollowers = nextLiked
        ? selectedPage.followersCount + (selectedPage.isLiked ? 0 : 1)
        : Math.max(0, selectedPage.followersCount - (selectedPage.isLiked ? 1 : 0));
      const updatedSelected: PageItem = {
        ...selectedPage,
        isLiked: nextLiked,
        followersCount: nextFollowers,
      };
      setSelectedPage(updatedSelected);
      try {
        localStorage.setItem('peaceverse_visited_page_v1', JSON.stringify(updatedSelected));
      } catch {}
    }

    showToast(nextLiked ? `Following ${targetName}` : `Unfollowed ${targetName}`);
  };

  // Create Page Handler (Triggered only on explicit step 3 submit)
  const handleCreatePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('দয়া করে পেজের নাম লিখুন');
      return;
    }

    const safeName = sanitizeInput(newName.trim());
    const safeBio = sanitizeInput(newBio.trim());
    const createdPage: PageItem = {
      id: `page-${Date.now()}`,
      name: safeName,
      category: sanitizeInput(newCategory),
      likes: '১ লাইক',
      followersCount: 1,
      avatar: newAvatar,
      cover: newCover,
      role: 'Admin',
      isOwner: true,
      isLiked: true,
      description: safeBio,
      bio: safeBio,
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

  // Finalize & publish a prepared Page post (with optional Boost confirmation)
  const finalizePublishPagePost = async (
    newPost: {
      id: string;
      text: string;
      image?: string;
      time: string;
      dateLabel: string;
      createdAtMillis: number;
      likes: number;
      isLikedByMe: boolean;
      comments: number;
      shares: number;
      commentsList: any[];
      pinned: boolean;
      reach: number;
      clicks: number;
    },
    feedPost: PostItem,
    boosted?: boolean
  ) => {
    if (!selectedPage) return;
    const currentPageId = selectedPage.id;
    setPagePostText('');
    setPagePostImage('');
    setShowPageComposer(false);
    setPendingPageUpload({
      pageId: currentPageId,
      id: newPost.id,
      text: newPost.text,
      image: newPost.image,
      progress: 16,
    });

    const t1 = window.setTimeout(() => {
      setPendingPageUpload((cur) => (cur?.id === newPost.id ? { ...cur, progress: 48 } : cur));
    }, 260);
    const t2 = window.setTimeout(() => {
      setPendingPageUpload((cur) => (cur?.id === newPost.id ? { ...cur, progress: 82 } : cur));
    }, 680);

    await new Promise<void>((resolve) => window.setTimeout(resolve, 1150));
    window.clearTimeout(t1);
    window.clearTimeout(t2);

    setPendingPageUpload((cur) => (cur?.id === newPost.id ? { ...cur, progress: 100 } : cur));
    await new Promise<void>((resolve) => window.setTimeout(resolve, 180));
    setPendingPageUpload((cur) => (cur?.id === newPost.id ? null : cur));

    setPageFreshNowTick(Date.now());
    setPagePostsList((prev) => ({
      ...prev,
      [currentPageId]: [newPost, ...(prev[currentPageId] || [])],
    }));

    if (onPublishFeedPost) {
      onPublishFeedPost(feedPost);
    }

    logPageActivity(
      selectedPage.id,
      'post',
      boosted ? 'Published & boosted a post' : 'Published a new post',
      newPost.text ? newPost.text.slice(0, 80) : 'Photo post'
    );

    if (creatorPrefs.creatorNotifyFollowersOnPost) {
      showToast(
        boosted
          ? '🚀 পোস্ট প্রকাশিত ও বুস্ট চালু হয়েছে! ফলোয়ারদের নোটিফিকেশন পাঠানো হচ্ছে!'
          : 'পেজে পোস্ট প্রকাশিত ও সব ফলোয়ারকে নোটিফিকেশন পাঠানো হচ্ছে!'
      );
      await broadcastCreatorNotification({
        creatorId: selectedPage.id,
        creatorName: selectedPage.name,
        creatorAvatar: selectedPage.avatar,
        contentType: 'post',
        title: `${selectedPage.name} নতুন পোস্ট আপলোড করেছেন`,
        body: newPost.text
          ? newPost.text.length > 90
            ? newPost.text.slice(0, 90) + '...'
            : newPost.text
          : 'নতুন ছবি পোস্ট করা হয়েছে',
        thumbnail: newPost.image || selectedPage.cover || selectedPage.avatar,
        postId: newPost.id,
        link: `/?tab=pages&pageId=${selectedPage.id}`,
        broadcastToAll: creatorPrefs.creatorSendPushToAllUsers,
        onLocalNotify: onBroadcastNotification,
      });
    } else {
      showToast(boosted ? '🚀 পোস্ট প্রকাশিত ও বুস্ট করা হয়েছে!' : 'পেজে পোস্ট প্রকাশিত হয়েছে!');
    }
  };

  // Validate Page post & ask "Apni ki eti Boost korte chan?" before publishing
  const handlePublishPagePost = async () => {
    if ((!pagePostText.trim() && !pagePostImage) || !selectedPage) return;

    const textCheck = checkPost(pagePostText);
    if (!textCheck.isApproved) {
      showToast(textCheck.reason || ADULT_BLOCK_MESSAGE);
      return;
    }

    if (pagePostImage && pagePostImage.startsWith('data:image/')) {
      const visualCheck = await checkMediaVisualSafety({
        mediaDataUrls: [pagePostImage],
        caption: pagePostText,
      });
      if (!visualCheck.safe) {
        showToast(visualCheck.reason || ADULT_BLOCK_MESSAGE);
        return;
      }
    }

    const nowMillis = Date.now();
    const todayStr = new Date(nowMillis).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newPost = {
      id: `pp-${nowMillis}`,
      text: sanitizeInput(pagePostText.trim()),
      image: pagePostImage || undefined,
      time: 'Just now',
      dateLabel: todayStr,
      createdAtMillis: nowMillis,
      likes: 1,
      isLikedByMe: false,
      comments: 0,
      shares: 0,
      commentsList: [],
      pinned: false,
      reach: 128,
      clicks: 14,
    };

    const feedPost: PostItem = {
      id: newPost.id,
      authorId: selectedPage.id,
      author: {
        name: selectedPage.name,
        avatar: selectedPage.avatar,
        subtitle: selectedPage.category,
        verified: true,
      },
      timeAgo: 'Just now',
      isPublic: true,
      createdAtMillis: newPost.createdAtMillis,
      privacy: 'public',
      contentBangla: newPost.text,
      mediaType: newPost.image ? 'image' : 'none',
      mediaUrl: newPost.image || undefined,
      category: 'Community',
      reactions: {
        total: 0,
        likeCount: 0,
        loveCount: 0,
        subhanallahCount: 0,
        mashaallahCount: 0,
      },
      comments: [],
      sharesCount: 0,
      isFreshUpload: true,
    };

    setPendingPageBoostDraft({ localPost: newPost, feedPost });
    setShowPagePostBoostPrompt(true);
  };

  // Custom photo upload handlers with Firestore-safe compression + cloud persistence
  const processAndPersistPagePhoto = async (
    file: File,
    kind: 'avatar' | 'cover'
  ): Promise<string | null> => {
    const check = validateMediaUpload(file, ['image']);
    if (!check.valid) {
      showToast(check.error || 'অবৈধ ছবি ফাইল (সর্বোচ্চ ৫ মেগাবাইট)।');
      return null;
    }
    const nameCheck = checkMediaFilenamesSafe([file]);
    if (!nameCheck.safe) {
      showToast(nameCheck.reason || ADULT_BLOCK_MESSAGE);
      return null;
    }
    const compressed = await compressImageForFirestore(file, kind);
    const visual = await checkMediaVisualSafety({
      mediaDataUrls: [compressed],
      fileNames: [file.name],
    });
    if (!visual.safe) {
      showToast(visual.reason || ADULT_BLOCK_MESSAGE);
      return null;
    }
    const persisted = await uploadDataUrlIfOversized(compressed, 'image', false);
    return persisted || compressed;
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const url = await processAndPersistPagePhoto(file, 'avatar');
      if (!url) return;
      setNewAvatar(url);
      showToast('প্রোফাইল ছবি সফলভাবে যুক্ত হয়েছে!');
    } catch {
      showToast('ছবি রূপান্তর করতে সমস্যা হয়েছে');
    }
  };

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const url = await processAndPersistPagePhoto(file, 'cover');
      if (!url) return;
      setNewCover(url);
      showToast('কভার ছবি সফলভাবে যুক্ত হয়েছে!');
    } catch {
      showToast('কভার রূপান্তর করতে সমস্যা হয়েছে');
    }
  };

  // Live in-page camera updater for Avatar
  const handleUpdatePageAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !selectedPage) return;
    try {
      const url = await processAndPersistPagePhoto(file, 'avatar');
      if (!url) return;
      const updated = { ...selectedPage, avatar: url };
      persistUpdatedPage(updated);
      showToast('পেজের লোগো / প্রোফাইল ছবি আপডেট করা হয়েছে!');
    } catch {
      showToast('ছবি আপলোড করতে সমস্যা হয়েছে');
    }
  };

  // Live in-page camera updater for Cover
  const handleUpdatePageCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !selectedPage) return;
    try {
      const url = await processAndPersistPagePhoto(file, 'cover');
      if (!url) return;
      const updated = { ...selectedPage, cover: url };
      persistUpdatedPage(updated);
      showToast('পেজের কভার ফটো আপডেট করা হয়েছে!');
    } catch {
      showToast('কভার ফটো আপলোড করতে সমস্যা হয়েছে');
    }
  };

  // Open Edit Page Modal
  const handleOpenEditModal = (page: PageItem) => {
    setEditName(page.name);
    setEditCategory(page.category);
    setEditBio(sanitizePageBioValue(page.bio) || sanitizePageBioValue(page.description));
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

    const cleanBio = sanitizePageBioValue(editBio);
    const updated: PageItem = {
      ...selectedPage,
      name: editName.trim(),
      category: editCategory.trim() || selectedPage.category,
      bio: cleanBio,
      description: cleanBio,
      phone: editPhone.trim() || undefined,
      whatsapp: editWhatsapp.trim() || undefined,
      imo: editImo.trim() || undefined,
      viber: editViber.trim() || undefined,
      website: editWebsite.trim() || undefined,
      location: editLocation.trim() || selectedPage.location,
    };

    persistUpdatedPage(updated);
    setShowEditModal(false);
    showToast('💾 পেজের তথ্য সফলভাবে সেভ করা হয়েছে!');
  };

  const handleSaveDirectBio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;
    const cleanBio = sanitizePageBioValue(bioModalDraft);
    const updated: PageItem = {
      ...selectedPage,
      bio: cleanBio,
      description: cleanBio,
    };
    persistUpdatedPage(updated);
    setShowEditBioModal(false);
    showToast(cleanBio ? '💾 পেজের বায়ো সেভ করা হয়েছে!' : 'পেজের বায়ো সরানো হয়েছে');
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
    const isOwnerView =
      (selectedPage.isOwner ||
        isSameOwnerIdentity(
          selectedPage.id,
          selectedPage.name,
          userProfile?.id,
          userProfile?.name
        )) &&
      !viewAsVisitor;
    const rawPosts = pagePostsList[selectedPage.id] || [];
    const rawIds = new Set(rawPosts.map((rp) => rp.id));
    const normStr = (val?: string) =>
      (val || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
    const normPageName = normStr(selectedPage.name);
    const normPersonalName = normStr(userProfile?.name);
    const matchedFeedPosts = feedPosts.filter((fp) => {
      if (rawIds.has(fp.id)) return false;
      const byId = Boolean(fp.authorId && fp.authorId === selectedPage.id);
      const normAuthorName = normStr(fp.author?.name);
      const byName = Boolean(normAuthorName && normPageName && normAuthorName === normPageName);
      const byAvatar = Boolean(
        selectedPage.avatar &&
          fp.author?.avatar &&
          fp.author.avatar === selectedPage.avatar &&
          (!normPersonalName || normAuthorName !== normPersonalName)
      );
      if (!byId && !byName && !byAvatar) return false;
      if (pageSearchQuery.trim()) {
        const q = pageSearchQuery.trim().toLowerCase();
        return (fp.contentBangla || '').toLowerCase().includes(q);
      }
      return true;
    });
    const activePosts = pageSearchQuery.trim()
      ? rawPosts.filter((p) => p.text.toLowerCase().includes(pageSearchQuery.trim().toLowerCase()))
      : rawPosts;
    const waUrl = getWhatsAppUrl(selectedPage.whatsapp || selectedPage.phone);

    return (
      <div className="max-w-[700px] mx-auto min-h-screen bg-white text-[#050505] pb-24 font-sans">
        {/* Sticky View as Visitor Banner */}
        {selectedPage.isOwner && viewAsVisitor && (
          <div className="sticky top-0 z-40 bg-[#0866FF] text-white px-3.5 py-2 flex items-center justify-between gap-2 text-xs font-bold shadow-md">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 shrink-0" />
              <span>Viewing Page as Visitor</span>
            </span>
            <button
              type="button"
              onClick={() => setViewAsVisitor(false)}
              className="px-2.5 py-1 rounded-md bg-white text-[#0866FF] text-[11px] font-bold hover:bg-[#F0F2F5] cursor-pointer"
            >
              Exit View As
            </button>
          </div>
        )}

        {/* 1. Cover Photo with Overlay Top Controls (Back, Edit Pencil, Search, Circle More) & Bottom-Right Camera */}
        <div className="relative w-full h-56 sm:h-64 bg-[#E4E6EB] overflow-hidden flex items-center justify-center">
          {resolvedSelectedPageCover ? (
            <>
              <img
                src={resolvedSelectedPageCover}
                alt={selectedPage.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
            </>
          ) : isOwnerView ? (
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
          ) : (
            <div className="w-full h-full bg-[#E4E6EB]" />
          )}

          {/* Top Overlay Controls directly over cover */}
          <div className="absolute top-0 inset-x-0 z-30 px-2.5 pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setPageSearchOpen(false);
                setPageSearchQuery('');
                setShowPageSettings(false);
                setViewAsVisitor(false);
                setSelectedPage(null);
              }}
              className="min-w-[42px] min-h-[42px] rounded-full hover:bg-black/25 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Back"
              aria-label="Back to pages"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.3] drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)]" />
            </button>

            <div className="flex items-center gap-1.5">
              {isOwnerView && (
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
          {isOwnerView && (
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
            {isOwnerView && editingPageThought ? (
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
            ) : (isOwnerView || pageThoughts[selectedPage.id]) ? (
              <div className="flex flex-col items-center mb-0.5 z-20">
                <button
                  type="button"
                  onClick={() => {
                    if (!isOwnerView) return;
                    setPageThoughtDraft(pageThoughts[selectedPage.id] || '');
                    setEditingPageThought(true);
                  }}
                  className={`bg-white text-[#65676B] text-[13px] font-medium px-4 py-1.5 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.16)] border border-[#E4E6EB] transition-transform ${
                    isOwnerView ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                  }`}
                  title={isOwnerView ? 'Share a note' : undefined}
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
            ) : null}

            <div className="relative -mt-1">
              {resolvedSelectedPageAvatar ? (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-[0_2px_12px_rgba(0,0,0,0.16)] bg-[#E4E6EB] overflow-hidden relative">
                  <img
                    src={resolvedSelectedPageAvatar}
                    alt={selectedPage.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : isOwnerView ? (
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
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-[0_2px_12px_rgba(0,0,0,0.16)] bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center font-extrabold text-3xl">
                  {selectedPage.name.trim().charAt(0).toUpperCase()}
                </div>
              )}

              {isOwnerView && (
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

            {isOwnerView && (
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
            )}

            {/* Stats: followers · following */}
            <p className="text-[14px] text-[#050505] font-normal tabular-nums">
              <span className="font-bold">
                {selectedPage.followersCount.toLocaleString('en-US')}
              </span>{' '}
              {selectedPage.followersCount === 1 ? 'follower' : 'followers'} ·{' '}
              <span className="font-bold">
                {(selectedPage.followingCount ?? 0).toLocaleString('en-US')}
              </span>{' '}
              following
            </p>

            {/* Bio (Full visible 3 lines + See more, clickable to edit like Facebook) */}
            {(() => {
              const displayBio =
                sanitizePageBioValue(selectedPage.bio) ||
                sanitizePageBioValue(selectedPage.description);
              const isLongBio = displayBio.length > 125 || displayBio.split('\n').length > 3;
              if (displayBio) {
                return (
                  <div className="max-w-md mx-auto pt-1.5 px-2">
                    <div
                      role={isOwnerView ? 'button' : undefined}
                      tabIndex={isOwnerView ? 0 : undefined}
                      onClick={() => {
                        if (isOwnerView) {
                          setBioModalDraft(displayBio);
                          setShowEditBioModal(true);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (isOwnerView && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          setBioModalDraft(displayBio);
                          setShowEditBioModal(true);
                        }
                      }}
                      title={isOwnerView ? 'Click to edit Bio' : undefined}
                      className={`text-[14px] text-[#050505] leading-relaxed whitespace-pre-line break-words inline-block ${
                        isOwnerView
                          ? 'cursor-pointer hover:bg-[#F0F2F5] rounded-xl px-3 py-1 transition-colors'
                          : ''
                      } ${!bioExpanded && isLongBio ? 'line-clamp-3' : ''}`}
                    >
                      {displayBio}
                    </div>
                    <div className="flex items-center justify-center gap-3 mt-0.5">
                      {isLongBio && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBioExpanded((prev) => !prev);
                          }}
                          className="text-[13px] font-bold text-[#65676B] hover:text-[#050505] hover:underline cursor-pointer"
                        >
                          {bioExpanded ? 'See less' : 'See more'}
                        </button>
                      )}
                      {isOwnerView && (
                        <button
                          type="button"
                          onClick={() => {
                            setBioModalDraft(displayBio);
                            setShowEditBioModal(true);
                          }}
                          className="text-[11px] font-semibold text-[#65676B] hover:text-[#0866FF] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit bio</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
              if (isOwnerView) {
                return (
                  <div className="pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setBioModalDraft('');
                        setShowEditBioModal(true);
                      }}
                      className="text-[14px] font-semibold text-[#0866FF] hover:bg-[#E7F3FF] px-3 py-1 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Add bio</span>
                    </button>
                  </div>
                );
              }
              return null;
            })()}

            {/* Category */}
            <div className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-[#050505] pt-1.5 pb-3">
              <span className="w-3 h-2.5 rounded-[2px] bg-[#050505] inline-block shrink-0" />
              <span>{selectedPage.category}</span>
            </div>
          </div>

          {/* 4. Primary Action Buttons: [🔵 Creator Dashboard] & [⚪ Advertise] */}
          {isOwnerView ? (
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
          ) : (() => {
            const visitorSettings = getPageSettings(selectedPage.id);
            const btnType = visitorSettings.actionButtonType || 'WhatsApp';
            const btnValue =
              visitorSettings.actionButtonValue ||
              (btnType === 'Call Now'
                ? selectedPage.phone
                : btnType === 'Send Email'
                ? selectedPage.email
                : btnType === 'Visit Website'
                ? selectedPage.website
                : selectedPage.whatsapp || selectedPage.phone) ||
              '';

            return (
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

                {btnType === 'WhatsApp' ? (
                  getWhatsAppUrl(btnValue) ? (
                    <a
                      href={getWhatsAppUrl(btnValue)!}
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
                  )
                ) : btnType === 'Call Now' && btnValue ? (
                  <a
                    href={`tel:${btnValue.replace(/\s+/g, '')}`}
                    className="h-10 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] active:scale-[0.98] text-[#050505] font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-[#0866FF]" />
                    <span>Call Now</span>
                  </a>
                ) : btnType === 'Send Email' && btnValue ? (
                  <a
                    href={`mailto:${btnValue}`}
                    className="h-10 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] active:scale-[0.98] text-[#050505] font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-[#0866FF]" />
                    <span>Send Email</span>
                  </a>
                ) : btnType === 'Visit Website' && btnValue ? (
                  <a
                    href={btnValue.startsWith('http') ? btnValue : `https://${btnValue}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] active:scale-[0.98] text-[#050505] font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-[#0866FF]" />
                    <span>Visit Website</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!visitorSettings.allowDirectMessages && btnType === 'Send Message') {
                        showToast('এই পেজে সরাসরি মেসেজ বর্তমানে বন্ধ আছে');
                        return;
                      }
                      showToast(`${btnType}: ${btnValue || selectedPage.name}`);
                    }}
                    className="h-10 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] active:scale-[0.98] text-[#050505] font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-[#0866FF]" />
                    <span>{btnType}</span>
                  </button>
                )}
              </div>
            );
          })()}
        </div>

        {/* 5. Pill Sub Navigation Tabs: All / Photos / Reels / Events / Mentions / Deeds Log */}
        <div className="bg-white px-3 py-2 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar border-b border-[#F0F2F5]">
          {[
            { id: 'all', label: 'All' },
            { id: 'photos', label: 'Photos' },
            { id: 'reels', label: 'Reels' },
            { id: 'events', label: 'Events' },
            { id: 'mentions', label: 'Mentions' },
            { id: 'deeds', label: 'Deeds Log' },
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
            const currentSettings = getPageSettings(selectedPage.id);
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
            const PAGE_FRESH_MS = 3 * 60 * 1000;
            const sortedPosts = [...filteredPosts].sort((a, b) => {
              const aFresh =
                (a.createdAtMillis || 0) > 0 && pageFreshNowTick - (a.createdAtMillis || 0) < PAGE_FRESH_MS;
              const bFresh =
                (b.createdAtMillis || 0) > 0 && pageFreshNowTick - (b.createdAtMillis || 0) < PAGE_FRESH_MS;
              if (aFresh && !bFresh) return -1;
              if (!aFresh && bFresh) return 1;
              if (aFresh && bFresh) return (b.createdAtMillis || 0) - (a.createdAtMillis || 0);

              if (postFilterMode === 'top') return b.likes + b.comments - (a.likes + a.comments);
              return a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1;
            });

            type UnifiedPageEntry =
              | { kind: 'feed'; post: PostItem; sortTime: number; fresh: boolean; score: number }
              | { kind: 'local'; post: (typeof sortedPosts)[number]; sortTime: number; fresh: boolean; score: number };

            const unifiedPageFeed: UnifiedPageEntry[] = [
              ...(postFilterMode === 'pinned'
                ? []
                : matchedFeedPosts.map((fp) => ({
                    kind: 'feed' as const,
                    post: fp,
                    sortTime: fp.createdAtMillis || 0,
                    fresh:
                      (fp.createdAtMillis || 0) > 0 &&
                      pageFreshNowTick - (fp.createdAtMillis || 0) < PAGE_FRESH_MS,
                    score: (fp.reactions?.total || 0) + fp.comments.length,
                  }))),
              ...sortedPosts.map((lp) => ({
                kind: 'local' as const,
                post: lp,
                sortTime: lp.createdAtMillis || 0,
                fresh:
                  (lp.createdAtMillis || 0) > 0 &&
                  pageFreshNowTick - (lp.createdAtMillis || 0) < PAGE_FRESH_MS,
                score: lp.likes + lp.comments,
              })),
            ].sort((a, b) => {
              if (a.fresh && !b.fresh) return -1;
              if (!a.fresh && b.fresh) return 1;
              if (a.fresh && b.fresh) return b.sortTime - a.sortTime;

              const aPinned = a.kind === 'local' ? Boolean(a.post.pinned) : false;
              const bPinned = b.kind === 'local' ? Boolean(b.post.pinned) : false;
              if (aPinned !== bPinned) return aPinned ? -1 : 1;

              if (postFilterMode === 'top') return b.score - a.score;
              return b.sortTime - a.sortTime;
            });

            return (
            <div className="space-y-3.5">
              {/* Unpublished Page Banner if toggled off in Settings & privacy */}
              {isOwnerView && !currentSettings.isPublished && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-amber-900">Unpublished Draft</p>
                    <p className="text-[11px] text-amber-700">এই পেজটি এখন শুধুমাত্র অ্যাডমিন দেখতে পাচ্ছেন।</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updatePageSettings(selectedPage.id, { isPublished: true });
                      logPageActivity(selectedPage.id, 'settings', 'Published page publicly');
                      showToast('পেজটি পাবলিক করা হয়েছে!');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#0866FF] text-white text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Publish
                  </button>
                </div>
              )}

              {/* Highlights Strip if highlights added */}
              {currentSettings.highlights.length > 0 && (
                <div className="px-1 pt-1 pb-2 border-b border-[#E4E6EB] space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-bold text-[#050505]">Highlights</h3>
                    {isOwnerView && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSettingKey('Add highlights');
                          setShowPageSettings(true);
                        }}
                        className="text-xs font-bold text-[#0866FF] cursor-pointer"
                      >
                        + Edit
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {currentSettings.highlights.map((hl) => (
                      <div
                        key={hl.id}
                        className="min-w-[130px] max-w-[160px] rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] shrink-0 overflow-hidden"
                      >
                        {hl.image && (
                          <img src={hl.image} alt={hl.title} className="w-full h-20 object-cover" />
                        )}
                        <div className="p-2.5 space-y-1">
                          <div className="flex items-center gap-1.5 text-[#0866FF]">
                            <Heart className="w-3.5 h-3.5 fill-current shrink-0" />
                            <span className="text-xs font-bold text-[#050505] truncate">{hl.title}</span>
                          </div>
                          {hl.note && (
                            <p className="text-[11px] text-[#65676B] line-clamp-2">{hl.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1. Personal details */}
              <div className="px-1 pt-1 pb-2.5 space-y-2.5 border-b border-[#E4E6EB]">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-[#050505]">Personal details</h3>
                  {isOwnerView && (
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
                  {(() => {
                    const aboutBio =
                      sanitizePageBioValue(selectedPage.bio) ||
                      sanitizePageBioValue(selectedPage.description);
                    if (aboutBio) {
                      return (
                        <div
                          onClick={() => {
                            if (isOwnerView) {
                              setBioModalDraft(aboutBio);
                              setShowEditBioModal(true);
                            }
                          }}
                          className={`flex items-start gap-3 ${
                            isOwnerView ? 'cursor-pointer hover:bg-[#F0F2F5] rounded-lg p-1 -mx-1' : ''
                          }`}
                        >
                          <FileText className="w-5 h-5 text-[#050505] shrink-0 mt-0.5" />
                          <span className="whitespace-pre-line break-words">{aboutBio}</span>
                        </div>
                      );
                    }
                    if (isOwnerView) {
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setBioModalDraft('');
                            setShowEditBioModal(true);
                          }}
                          className="flex items-center gap-3 text-[#0866FF] font-semibold hover:underline cursor-pointer"
                        >
                          <FileText className="w-5 h-5 text-[#0866FF] shrink-0" />
                          <span>Add bio / intro</span>
                        </button>
                      );
                    }
                    return null;
                  })()}
                  {(extra.currentCity || selectedPage.location) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#050505] shrink-0" />
                      <span>{extra.currentCity || selectedPage.location}</span>
                    </div>
                  )}

                  {(extra.hometown || isOwnerView) && (
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

                  {(extra.relationship || isOwnerView) && (
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
                  {isOwnerView && (
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
                  {isOwnerView && (
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
                    isOwnerView && (
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
              {(isOwnerView || currentSettings.whoCanPost === 'everyone') && (
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

                    <label
                      className="p-2 rounded-lg hover:bg-[#F0F2F5] text-[#65676B] cursor-pointer"
                      title="Add Photo"
                      aria-label="Add Photo"
                    >
                      <ImageIcon className="w-6 h-6" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (!file) return;
                          const check = validateMediaUpload(file, ['image']);
                          if (!check.valid) {
                            showToast(check.error || 'অবৈধ ছবি ফাইল (সর্বোচ্চ ৫ মেগাবাইট)।');
                            return;
                          }
                          const nameCheck = checkMediaFilenamesSafe([file]);
                          if (!nameCheck.safe) {
                            showToast(nameCheck.reason || ADULT_BLOCK_MESSAGE);
                            return;
                          }
                          try {
                            const b64 = await fileToBase64(file);
                            const visualCheck = await checkMediaVisualSafety({
                              mediaDataUrls: [b64],
                              fileNames: [file.name],
                            });
                            if (!visualCheck.safe) {
                              showToast(visualCheck.reason || ADULT_BLOCK_MESSAGE);
                              return;
                            }
                            setPagePostImage(b64);
                            setShowPageComposer(true);
                            showToast('ফটো যুক্ত করা হয়েছে!');
                          } catch {}
                        }}
                      />
                    </label>
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

                      {pagePostImage && (
                        <div className="relative rounded-xl overflow-hidden border border-[#E4E6EB] bg-[#F7F8FA]">
                          <img
                            src={pagePostImage}
                            alt="Selected attachment"
                            className="w-full h-auto max-h-[400px] object-contain mx-auto"
                          />
                          <button
                            type="button"
                            onClick={() => setPagePostImage('')}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer"
                            aria-label="Remove photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <label className="px-2.5 py-1.5 rounded-lg hover:bg-[#E4E6EB] text-emerald-600 flex items-center gap-1.5 cursor-pointer">
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-xs font-semibold text-[#050505]">
                            {pagePostImage ? 'Change Photo' : 'Photo'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              e.target.value = '';
                              if (!file) return;
                              const check = validateMediaUpload(file, ['image']);
                              if (!check.valid) {
                                showToast(check.error || 'অবৈধ ছবি ফাইল (সর্বোচ্চ ৫ মেগাবাইট)।');
                                return;
                              }
                              const nameCheck = checkMediaFilenamesSafe([file]);
                              if (!nameCheck.safe) {
                                showToast(nameCheck.reason || ADULT_BLOCK_MESSAGE);
                                return;
                              }
                              try {
                                const b64 = await fileToBase64(file);
                                const visualCheck = await checkMediaVisualSafety({
                                  mediaDataUrls: [b64],
                                  fileNames: [file.name],
                                });
                                if (!visualCheck.safe) {
                                  showToast(visualCheck.reason || ADULT_BLOCK_MESSAGE);
                                  return;
                                }
                                setPagePostImage(b64);
                                showToast('ফটো যুক্ত করা হয়েছে!');
                              } catch {}
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            void handlePublishPagePost();
                          }}
                          disabled={!pagePostText.trim() && !pagePostImage}
                          className="px-4 py-1.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Post</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reel + Live Action Pills */}
                  {isOwnerView && (
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
                  )}
                </div>
              )}

              {/* Full-width Manage posts button */}
              {isOwnerView && (
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
              {isOwnerView && (
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

              {/* Facebook-identical "Posting..." Charging Progress Card at Top of Page Posts */}
              {pendingPageUpload && pendingPageUpload.pageId === selectedPage.id && (
                <>
                  <div className="bg-white border border-[#E4E6EB] rounded-xl px-3 py-2.5 shadow-2xs flex items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-[6px] overflow-hidden bg-[#F0F2F5] border border-[#E4E6EB] shrink-0">
                        <img
                          src={pendingPageUpload.image || selectedPage.avatar}
                          alt={selectedPage.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-[#050505] leading-tight">
                          Posting...
                        </p>
                        <p className="text-[12px] text-[#65676B] truncate mt-0.5">
                          Keep PeaceVerse open.
                        </p>
                      </div>
                    </div>

                    <svg
                      className="w-6 h-6 -rotate-90 shrink-0"
                      viewBox="0 0 24 24"
                      aria-label="Page post upload progress"
                    >
                      <circle cx="12" cy="12" r="9.5" fill="none" stroke="#E4E6EB" strokeWidth="2.5" />
                      <circle
                        cx="12"
                        cy="12"
                        r="9.5"
                        fill="none"
                        stroke="#0866FF"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 9.5}
                        strokeDashoffset={
                          2 * Math.PI * 9.5 * (1 - pendingPageUpload.progress / 100)
                        }
                        className="transition-all duration-300 ease-out"
                      />
                    </svg>
                  </div>

                  <div className="fixed bottom-16 inset-x-3 max-w-[660px] mx-auto z-40 bg-[#242526] text-white text-[13px] font-medium px-4 py-3 rounded-[8px] shadow-xl animate-in fade-in">
                    Posting...
                  </div>
                </>
              )}

              {/* Feed of Posts for this Page (Unified Feed & Page Posts, Fresh < 3 mins #1 at top) */}
              <div className="space-y-3">
                {unifiedPageFeed.length === 0 && !(pendingPageUpload && pendingPageUpload.pageId === selectedPage.id) ? (
                  <div className="bg-white rounded-xl p-6 text-center border border-[#E4E6EB]">
                    <Flag className="w-8 h-8 text-[#65676B] mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-[#65676B]">
                      {postFilterMode === 'pinned'
                        ? 'কোনো পিন করা পোস্ট নেই।'
                        : 'এই পেজে এখনও কোনো পোস্ট নেই।'}
                    </p>
                  </div>
                ) : (
                  unifiedPageFeed.map((entry) => {
                    if (entry.kind === 'feed') {
                      const fp = entry.post;
                      return (
                        <FbPostCard
                          key={`feed-${fp.id}`}
                          post={fp}
                          onToggleReaction={onToggleFeedReaction || (() => {})}
                          onToggleSave={onToggleFeedSave || (() => {})}
                          onAddComment={onAddFeedComment || (() => {})}
                          onEditPost={isOwnerView ? onEditFeedPost : undefined}
                          onDeletePost={isOwnerView ? onDeleteFeedPost : undefined}
                          onOpenReel={onOpenFeedReel}
                          onOpenGiftModal={onOpenFeedGiftModal}
                          currentUserId={selectedPage.id}
                          currentUserName={selectedPage.name}
                          currentUserAvatar={
                            isOwnerView
                              ? selectedPage.avatar || userProfile?.avatar
                              : userProfile?.avatar
                          }
                          showBoostControls={isOwnerView}
                        />
                      );
                    }
                    const post = entry.post;
                    const matchingFeedPost = feedPosts.find((fp) => fp.id === post.id);
                    const baseComments = post.commentsList || [];
                    const feedMappedComments = (matchingFeedPost?.comments || []).map((fc) => ({
                      id: fc.id,
                      author: fc.author,
                      avatar: fc.avatar,
                      text: fc.text,
                      time: fc.timeAgo || 'Just now',
                    }));
                    const feedSeenIds = new Set(feedMappedComments.map((fc) => fc.id));
                    const feedSeenAlt = new Set(
                      feedMappedComments.map(
                        (fc) => `${fc.author.trim().toLowerCase()}::${fc.text.trim()}`
                      )
                    );
                    const mergedCommentsList = [
                      ...feedMappedComments,
                      ...baseComments.filter(
                        (bc) =>
                          !feedSeenIds.has(bc.id) &&
                          !feedSeenAlt.has(`${bc.author.trim().toLowerCase()}::${bc.text.trim()}`)
                      ),
                    ];
                    const displayCommentCount = Math.max(
                      post.comments || 0,
                      mergedCommentsList.length
                    );
                    const commenterAvatar = userProfile?.avatar || selectedPage.avatar || '';
                    const commenterName = userProfile?.name || selectedPage.name || 'Member';
                    const draftText = postCommentDrafts[post.id] || '';
                    const isCommentInputExpanded = expandedInlineCommentPostId === post.id;

                    const submitInlinePageComment = (overrideText?: string) => {
                      const rawText = (overrideText ?? draftText).trim();
                      if (!rawText) return;
                      if (
                        currentSettings.blockedUsers.some(
                          (u) => u.toLowerCase() === commenterName.toLowerCase()
                        )
                      ) {
                        showToast('এই অ্যাকাউন্টটি পেজ থেকে ব্লক করা আছে');
                        return;
                      }
                      if (
                        currentSettings.modHideLinks &&
                        /(https?:\/\/|www\.)/i.test(rawText)
                      ) {
                        showToast('Moderation Assist: লিংকযুক্ত কমেন্ট হাইড করা হয়েছে');
                        return;
                      }
                      const matchedWord = currentSettings.modBlockedWords.find((w) =>
                        rawText.toLowerCase().includes(w.toLowerCase())
                      );
                      if (matchedWord) {
                        showToast(`Moderation Assist: "${matchedWord}" শব্দটি ব্লক করা আছে`);
                        return;
                      }
                      const newComment = {
                        id: `cmt-${Date.now()}`,
                        author: commenterName,
                        avatar: commenterAvatar,
                        text: rawText,
                        time: 'Just now',
                      };
                      setPagePostsList((prev) => ({
                        ...prev,
                        [selectedPage.id]: (prev[selectedPage.id] || []).map((item) =>
                          item.id === post.id
                            ? {
                                ...item,
                                comments: Math.max(
                                  item.comments || 0,
                                  (item.commentsList || []).length
                                ) + 1,
                                commentsList: [newComment, ...(item.commentsList || [])],
                              }
                            : item
                        ),
                      }));
                      onAddFeedComment?.(post.id, rawText);
                      setPostCommentDrafts((prev) => ({ ...prev, [post.id]: '' }));
                      setOpenCommentPostId(post.id);
                    };
                    return (
                      <div
                        key={post.id}
                        className="bg-white rounded-xl border border-[#E4E6EB] p-3.5 space-y-2.5 shadow-2xs relative"
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

                          {isOwnerView && (
                            <div className="flex items-center gap-1 relative">
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
                                  logPageActivity(
                                    selectedPage.id,
                                    'post',
                                    post.pinned ? 'Unpinned a post' : 'Pinned a post',
                                    post.text.slice(0, 60)
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
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPagePostsList((prev) => ({
                                        ...prev,
                                        [selectedPage.id]: (prev[selectedPage.id] || []).filter(
                                          (item) => item.id !== post.id
                                        ),
                                      }));
                                      updatePageSettings(selectedPage.id, (cur) => ({
                                        ...cur,
                                        archivedPosts: [
                                          { ...post, archivedAt: 'এখনই' },
                                          ...(cur.archivedPosts || []),
                                        ],
                                      }));
                                      logPageActivity(
                                        selectedPage.id,
                                        'archive',
                                        'Moved post to Archive',
                                        post.text.slice(0, 60)
                                      );
                                      showToast('পোস্টটি Archive-এ সরানো হয়েছে');
                                    }}
                                    className="p-1.5 rounded-lg bg-[#F0F2F5] text-[#050505] hover:bg-[#E4E6EB] cursor-pointer"
                                    title="Move to archive"
                                  >
                                    <Archive className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPagePostsList((prev) => ({
                                        ...prev,
                                        [selectedPage.id]: (prev[selectedPage.id] || []).filter(
                                          (item) => item.id !== post.id
                                        ),
                                      }));
                                      updatePageSettings(selectedPage.id, (cur) => ({
                                        ...cur,
                                        trashedPosts: [
                                          { ...post, archivedAt: '30 days left' },
                                          ...(cur.trashedPosts || []),
                                        ],
                                      }));
                                      logPageActivity(
                                        selectedPage.id,
                                        'archive',
                                        'Moved post to Trash',
                                        post.text.slice(0, 60)
                                      );
                                      showToast('পোস্টটি Trash-এ পাঠানো হয়েছে (৩০ দিন সংরক্ষিত থাকবে)');
                                    }}
                                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                                    title="Move to Trash"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  setOpenPostMenuId((prev) => (prev === post.id ? null : post.id))
                                }
                                className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] cursor-pointer"
                                title="Post options"
                                aria-label="Post options"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>

                              {openPostMenuId === post.id && (
                                <div className="absolute right-0 top-8 z-30 w-48 bg-white rounded-xl border border-[#E4E6EB] shadow-xl py-1 text-left">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingPostId(post.id);
                                      setEditingPostText(post.text);
                                      setOpenPostMenuId(null);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold text-[#050505] hover:bg-[#F0F2F5] flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Edit post</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPagePostsList((prev) => ({
                                        ...prev,
                                        [selectedPage.id]: (prev[selectedPage.id] || []).map((item) =>
                                          item.id === post.id ? { ...item, pinned: !item.pinned } : item
                                        ),
                                      }));
                                      setOpenPostMenuId(null);
                                      showToast(post.pinned ? 'পিন সরানো হয়েছে' : 'পোস্ট পিন করা হয়েছে');
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold text-[#050505] hover:bg-[#F0F2F5] flex items-center gap-2 cursor-pointer"
                                  >
                                    <Pin className="w-3.5 h-3.5" />
                                    <span>{post.pinned ? 'Unpin post' : 'Pin post'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPagePostsList((prev) => ({
                                        ...prev,
                                        [selectedPage.id]: (prev[selectedPage.id] || []).filter(
                                          (item) => item.id !== post.id
                                        ),
                                      }));
                                      updatePageSettings(selectedPage.id, (cur) => ({
                                        ...cur,
                                        archivedPosts: [
                                          { ...post, archivedAt: 'এখনই' },
                                          ...(cur.archivedPosts || []),
                                        ],
                                      }));
                                      logPageActivity(
                                        selectedPage.id,
                                        'archive',
                                        'Moved post to Archive',
                                        post.text.slice(0, 60)
                                      );
                                      setOpenPostMenuId(null);
                                      showToast('পোস্টটি Archive-এ সরানো হয়েছে');
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold text-[#050505] hover:bg-[#F0F2F5] flex items-center gap-2 cursor-pointer"
                                  >
                                    <Archive className="w-3.5 h-3.5" />
                                    <span>Move to archive</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      try {
                                        navigator.clipboard?.writeText(
                                          `${window.location.origin}/?tab=pages&pageId=${selectedPage.id}&post=${post.id}`
                                        );
                                      } catch {}
                                      setOpenPostMenuId(null);
                                      showToast('পোস্টের লিংক কপি হয়েছে');
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold text-[#050505] hover:bg-[#F0F2F5] flex items-center gap-2 cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy link</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPagePostsList((prev) => ({
                                        ...prev,
                                        [selectedPage.id]: (prev[selectedPage.id] || []).filter(
                                          (item) => item.id !== post.id
                                        ),
                                      }));
                                      updatePageSettings(selectedPage.id, (cur) => ({
                                        ...cur,
                                        trashedPosts: [
                                          { ...post, archivedAt: '30 days left' },
                                          ...(cur.trashedPosts || []),
                                        ],
                                      }));
                                      logPageActivity(
                                        selectedPage.id,
                                        'archive',
                                        'Moved post to Trash',
                                        post.text.slice(0, 60)
                                      );
                                      setOpenPostMenuId(null);
                                      showToast('পোস্টটি Trash-এ পাঠানো হয়েছে');
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Move to trash</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {editingPostId === post.id ? (
                          <div className="space-y-2 bg-[#F7F8FA] p-2.5 rounded-xl border border-[#E4E6EB]">
                            <textarea
                              rows={3}
                              value={editingPostText}
                              onChange={(e) => setEditingPostText(e.target.value)}
                              className="w-full bg-white border border-[#E4E6EB] rounded-lg p-2 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF] resize-none"
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingPostId(null)}
                                className="px-3 py-1 rounded-lg bg-[#E4E6EB] text-xs font-bold text-[#050505] cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setPagePostsList((prev) => ({
                                    ...prev,
                                    [selectedPage.id]: (prev[selectedPage.id] || []).map((item) =>
                                      item.id === post.id ? { ...item, text: editingPostText.trim() } : item
                                    ),
                                  }));
                                  logPageActivity(
                                    selectedPage.id,
                                    'post',
                                    'Edited post',
                                    editingPostText.trim().slice(0, 60)
                                  );
                                  setEditingPostId(null);
                                  showToast('পোস্ট আপডেট করা হয়েছে!');
                                }}
                                className="px-3 py-1 rounded-lg bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          post.text && (
                            <p className="text-[14px] text-[#050505] leading-relaxed whitespace-pre-wrap">
                              {post.text}
                            </p>
                          )
                        )}

                        {post.image && (
                          <div className="rounded-xl overflow-hidden bg-[#F0F2F5] border border-[#E4E6EB]">
                            <img
                              src={post.image}
                              alt="Post photo"
                              className="w-full max-h-[420px] object-cover"
                            />
                          </div>
                        )}

                        {isOwnerView && (() => {
                          const existingBoost = getBoostedPostCampaign(post.id);
                          const adapterPost: PostItem = {
                            id: post.id,
                            authorId: selectedPage.id,
                            author: {
                              name: selectedPage.name,
                              avatar: selectedPage.avatar,
                              verified: true,
                              subtitle: selectedPage.category,
                            },
                            timeAgo: post.time || 'Just now',
                            isPublic: true,
                            contentBangla: post.text || '',
                            mediaType: post.image ? 'image' : 'none',
                            mediaUrl: post.image,
                            category: 'Community',
                            reactions: {
                              total: post.likes || 0,
                              likeCount: post.likes || 0,
                              loveCount: 0,
                              subhanallahCount: 0,
                              mashaallahCount: 0,
                            },
                            comments: mergedCommentsList.map((c) => ({
                              id: c.id,
                              author: c.author,
                              avatar: c.avatar || '',
                              text: c.text,
                              timeAgo: c.time,
                              likes: 0,
                            })),
                            sharesCount: post.shares || 0,
                            createdAtMillis: post.createdAtMillis,
                          };
                          return (
                            <div className="px-1 py-2 border-t border-[#E4E6EB] flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setInlineBoostModalState({ post: adapterPost, mode: 'insights' })
                                }
                                className="text-[13px] font-semibold text-[#0866FF] hover:underline flex items-center gap-1.5 cursor-pointer"
                              >
                                <TrendingUp className="w-4 h-4 shrink-0" />
                                <span>See insights</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setInlineBoostModalState({ post: adapterPost, mode: 'boost' })
                                }
                                className={`px-3.5 py-2 rounded-[8px] text-[12.5px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  existingBoost
                                    ? 'bg-[#E7F3FF] hover:bg-[#DBEAFE] text-[#0866FF] border border-[#0866FF]/30'
                                    : 'bg-[#0866FF] hover:bg-[#1877F2] text-white shadow-xs'
                                }`}
                              >
                                {existingBoost ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>Boosted • Manage ad</span>
                                  </>
                                ) : (
                                  <>
                                    <Megaphone className="w-3.5 h-3.5 shrink-0" />
                                    <span>Boost post</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })()}

                        <div className="flex items-center justify-between pt-2 border-t border-[#E4E6EB] text-xs font-semibold text-[#65676B]">
                          <button
                            type="button"
                            onClick={() => {
                              setPagePostsList((prev) => ({
                                ...prev,
                                [selectedPage.id]: (prev[selectedPage.id] || []).map((item) => {
                                  if (item.id !== post.id) return item;
                                  const nextLiked = !item.isLikedByMe;
                                  return {
                                    ...item,
                                    isLikedByMe: nextLiked,
                                    likes: nextLiked ? item.likes + 1 : Math.max(0, item.likes - 1),
                                  };
                                }),
                              }));
                            }}
                            className={`flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-[#F0F2F5] cursor-pointer ${
                              post.isLikedByMe ? 'text-[#0866FF] font-bold' : 'hover:text-[#0866FF]'
                            }`}
                          >
                            <ThumbsUp className={`w-4 h-4 ${post.isLikedByMe ? 'fill-[#0866FF] text-[#0866FF]' : 'text-[#0866FF]'}`} />
                            <span className="tabular-nums">{post.likes} Like</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveCommentSheetPostId(post.id);
                            }}
                            className={`flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-[#F0F2F5] cursor-pointer ${
                              openCommentPostId === post.id || activeCommentSheetPostId === post.id
                                ? 'text-[#0866FF]'
                                : 'hover:text-[#050505]'
                            }`}
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="tabular-nums">{displayCommentCount} Comment</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPagePostsList((prev) => ({
                                ...prev,
                                [selectedPage.id]: (prev[selectedPage.id] || []).map((item) =>
                                  item.id === post.id
                                    ? { ...item, shares: (item.shares || 0) + 1 }
                                    : item
                                ),
                              }));
                              try {
                                navigator.clipboard?.writeText(
                                  `${window.location.origin}/?tab=pages&pageId=${selectedPage.id}&post=${post.id}`
                                );
                              } catch {}
                              logPageActivity(
                                selectedPage.id,
                                'post',
                                'Shared post',
                                post.text ? post.text.slice(0, 60) : 'Photo post'
                              );
                              showToast('পোস্টের লিংক কপি ও শেয়ার হয়েছে!');
                            }}
                            className="flex items-center gap-1.5 hover:text-[#050505] py-1 px-2 rounded-lg hover:bg-[#F0F2F5] cursor-pointer"
                          >
                            <Share2 className="w-4 h-4" />
                            <span className="tabular-nums">{post.shares || 0} Share</span>
                          </button>
                        </div>

                        {/* Facebook-style Interactive Comments List + 48px Expandable Input */}
                        <div className="pt-2.5 border-t border-[#F0F2F5] space-y-3">
                          {!currentSettings.allowComments ? (
                            <p className="text-[11px] text-[#65676B] bg-[#F7F8FA] p-2 rounded-lg text-center">
                              এই পেজে মন্তব্য সীমিত করা হয়েছে (Page Settings -&gt; Posts and tags)।
                            </p>
                          ) : (
                            <div className="flex items-start gap-2.5 w-full">
                              {commenterAvatar ? (
                                <img
                                  src={commenterAvatar}
                                  alt={commenterName}
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                      commenterName || 'U'
                                    )}&backgroundColor=0866ff,1877f2`;
                                  }}
                                  className="w-9 h-9 rounded-full object-cover border border-[#E4E6EB] bg-[#F0F2F5] shrink-0 mt-1.5"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-[#0866FF] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1.5">
                                  {commenterName.trim().charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div
                                className={`flex-1 flex items-end gap-2 bg-[#F0F2F5] border border-[#E4E6EB] focus-within:border-[#0866FF] focus-within:bg-white transition-all px-3.5 ${
                                  isCommentInputExpanded
                                    ? 'rounded-2xl py-2 min-h-[68px]'
                                    : 'rounded-[24px] py-1 min-h-[48px]'
                                }`}
                              >
                                <textarea
                                  ref={(el) => {
                                    inlineCommentTextareaRefs.current[post.id] = el;
                                  }}
                                  rows={isCommentInputExpanded ? 2 : 1}
                                  value={draftText}
                                  onFocus={() => setExpandedInlineCommentPostId(post.id)}
                                  onClick={() => setExpandedInlineCommentPostId(post.id)}
                                  onChange={(e) =>
                                    setPostCommentDrafts((prev) => ({
                                      ...prev,
                                      [post.id]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && draftText.trim()) {
                                      e.preventDefault();
                                      submitInlinePageComment();
                                    }
                                  }}
                                  placeholder={`Comment as ${commenterName}`}
                                  className={`flex-1 w-full bg-transparent text-[16px] leading-snug text-[#050505] placeholder-[#65676B] focus:outline-none resize-none ${
                                    isCommentInputExpanded ? 'min-h-[52px] py-1' : 'min-h-[40px] py-2'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => submitInlinePageComment()}
                                  className="w-9 h-9 rounded-full bg-[#0866FF] hover:bg-[#166FE5] text-white flex items-center justify-center cursor-pointer disabled:opacity-35 shrink-0 mb-0.5"
                                  disabled={!draftText.trim()}
                                  aria-label="Send comment"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}

                          {mergedCommentsList.length > 0 && (
                            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-0.5">
                              {mergedCommentsList.map((c) => {
                                const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                  c.author || 'U'
                                )}&backgroundColor=1877f2,0ea5e9,3b82f6`;
                                const likeKey = `${post.id}::${c.id}`;
                                const isCommentLiked = Boolean(pageCommentLikesMap[likeKey]);
                                return (
                                  <div key={c.id} className="flex items-start gap-2.5">
                                    <img
                                      src={c.avatar || fallbackAvatar}
                                      alt={c.author}
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = fallbackAvatar;
                                      }}
                                      className="w-8 h-8 rounded-full object-cover border border-[#E4E6EB] shrink-0 mt-0.5"
                                    />
                                    <div className="flex-1 min-w-0 space-y-1">
                                      <div className="relative inline-block max-w-[95%] px-3.5 py-2 rounded-2xl bg-[#F0F2F5]">
                                        <p className="text-[13px] font-bold text-[#050505] leading-tight">
                                          {c.author}
                                        </p>
                                        <p className="text-[14px] text-[#050505] mt-0.5 break-words leading-snug">
                                          {c.text}
                                        </p>
                                        {isCommentLiked && (
                                          <span className="absolute -bottom-2 -right-2 bg-white border border-[#E4E6EB] shadow-xs rounded-full px-1.5 py-0.5 text-[10px] font-bold text-[#050505] flex items-center gap-0.5">
                                            <span className="w-3 h-3 rounded-full bg-[#0866FF] text-white inline-flex items-center justify-center">
                                              <ThumbsUp className="w-2 h-2 fill-white stroke-white" />
                                            </span>
                                            <span>1</span>
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-4 px-2 text-xs text-[#65676B]">
                                        <span>{c.time || 'Just now'}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            toggleCommentLikeLocally(post.id, c.id);
                                            setPageCommentLikesMap(readCommentLikesStore());
                                          }}
                                          className={`font-bold cursor-pointer ${
                                            isCommentLiked
                                              ? 'text-[#0866FF]'
                                              : 'text-[#65676B] hover:text-[#0866FF]'
                                          }`}
                                        >
                                          {isCommentLiked ? 'Liked' : 'Like'}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenCommentPostId(post.id);
                                            setExpandedInlineCommentPostId(post.id);
                                            setPostCommentDrafts((prev) => ({
                                              ...prev,
                                              [post.id]: (prev[post.id] || '').startsWith(`@${c.author}`)
                                                ? prev[post.id] || ''
                                                : `@${c.author} `,
                                            }));
                                            setTimeout(() => {
                                              inlineCommentTextareaRefs.current[post.id]?.focus();
                                            }, 60);
                                          }}
                                          className="font-bold text-[#65676B] hover:text-[#0866FF] cursor-pointer"
                                        >
                                          Reply
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <FbCommentBottomSheet
                          isOpen={activeCommentSheetPostId === post.id}
                          onClose={() => setActiveCommentSheetPostId(null)}
                          postId={post.id}
                          likesCount={post.likes || 0}
                          hasUserReacted={Boolean(post.isLikedByMe)}
                          userReaction={post.isLikedByMe ? 'like' : null}
                          comments={mergedCommentsList.map((c) => ({
                            id: c.id,
                            author: c.author,
                            avatar: c.avatar,
                            text: c.text,
                            timeAgo: c.time,
                          }))}
                          currentUserName={commenterName}
                          currentUserAvatar={commenterAvatar}
                          onAddComment={(text) => submitInlinePageComment(text)}
                          onToggleReaction={() => {
                            setPagePostsList((prev) => ({
                              ...prev,
                              [selectedPage.id]: (prev[selectedPage.id] || []).map((item) => {
                                if (item.id !== post.id) return item;
                                const nextLiked = !item.isLikedByMe;
                                return {
                                  ...item,
                                  isLikedByMe: nextLiked,
                                  likes: nextLiked ? item.likes + 1 : Math.max(0, item.likes - 1),
                                };
                              }),
                            }));
                          }}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            );
          })()}

          {/* PHOTOS TAB (Synced with Cover, Avatar, Page Posts & Feed Posts) */}
          {pageSubTab === 'photos' && (() => {
            const feedPhotoUrls = matchedFeedPosts.flatMap((fp) => {
              if (fp.mediaType === 'video') return [];
              const list: string[] = [];
              if (Array.isArray(fp.mediaUrls)) list.push(...fp.mediaUrls);
              if (fp.mediaUrl && !list.includes(fp.mediaUrl)) list.push(fp.mediaUrl);
              return list;
            });
            const allPagePhotos = Array.from(
              new Set(
                [
                  ...feedPhotoUrls,
                  ...rawPosts.map((p) => p.image).filter((img): img is string => Boolean(img)),
                  selectedPage.cover,
                  selectedPage.avatar,
                ].filter(Boolean) as string[]
              )
            );
            return (
              <div className="bg-white rounded-xl border border-[#E4E6EB] p-3">
                {allPagePhotos.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <ImageIcon className="w-8 h-8 text-[#65676B] mx-auto opacity-50" />
                    <p className="text-xs font-semibold text-[#65676B]">
                      এখনো কোনো কভার ফটো, লোগো বা পোস্টের ছবি যোগ করা হয়নি।
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {allPagePhotos.map((imgUrl, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden bg-[#F0F2F5]">
                        <img src={imgUrl} alt={`Page photo ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* REELS TAB (Synced with Page Reels & Feed Video Posts) */}
          {pageSubTab === 'reels' && (() => {
            const pageReels = rawPosts.filter((p) => p.text.startsWith('🎬 Reel:'));
            const feedVideoReels = matchedFeedPosts.filter(
              (fp) => fp.mediaType === 'video' || Boolean(fp.youtubeId)
            );
            const totalReelsCount = pageReels.length + feedVideoReels.length;
            return (
              <div className="bg-white rounded-xl border border-[#E4E6EB] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#050505] flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-[#0866FF]" />
                    <span>{selectedPage.name} • Reels ({totalReelsCount})</span>
                  </h3>
                  {isOwnerView && (
                    <button
                      type="button"
                      onClick={() => setShowPageReelModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold cursor-pointer"
                    >
                      + Create Reel
                    </button>
                  )}
                </div>

                {totalReelsCount === 0 ? (
                  <div className="py-6 text-center space-y-2">
                    <div className="w-11 h-11 rounded-full bg-[#F0F2F5] text-[#0866FF] flex items-center justify-center mx-auto">
                      <Film className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-[#65676B]">
                      এখনো কোনো রিলস ভিডিও আপলোড করা হয়নি। শরিয়াহসম্মত শর্ট ভিডিও শেয়ার করুন।
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {feedVideoReels.map((reel) => (
                      <div
                        key={`reel-feed-${reel.id}`}
                        onClick={() => onOpenFeedReel && onOpenFeedReel(reel)}
                        className="p-3 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] flex items-center gap-3 cursor-pointer transition-colors"
                      >
                        <div className="w-14 h-20 rounded-lg bg-black overflow-hidden shrink-0 flex items-center justify-center">
                          {reel.mediaUrl ? (
                            <video src={reel.mediaUrl} className="w-full h-full object-cover" muted />
                          ) : (
                            <Film className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#050505] line-clamp-2">
                            {reel.contentBangla || `${selectedPage.name} Reel`}
                          </p>
                          <p className="text-[11px] text-[#65676B] mt-1">
                            {reel.timeAgo} • {reel.reactions?.total || 0} likes
                          </p>
                        </div>
                      </div>
                    ))}
                    {pageReels.map((reel) => (
                      <div key={reel.id} className="p-3 rounded-xl bg-[#F0F2F5] space-y-1">
                        <p className="text-xs font-bold text-[#050505]">{reel.text}</p>
                        <p className="text-[11px] text-[#65676B]">
                          {reel.dateLabel || reel.time} • {reel.likes} likes
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* EVENTS TAB */}
          {pageSubTab === 'events' && (
            <div className="bg-white rounded-xl border border-[#E4E6EB] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#050505] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#0866FF]" />
                  <span>Upcoming Events</span>
                </h3>
              </div>

              {isOwnerView && (
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
                  {(pageEventsList[selectedPage.id] || []).map((ev) => {
                    const rsvp = pageEventRsvps[ev.id];
                    return (
                      <div key={ev.id} className="p-3 rounded-lg bg-[#F0F2F5] flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#050505] truncate">{ev.title}</p>
                          <p className="text-[11px] text-[#65676B] truncate">
                            {ev.date} • {ev.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setPageEventRsvps((prev) => {
                                const nextState =
                                  prev[ev.id] === 'going'
                                    ? 'interested'
                                    : prev[ev.id] === 'interested'
                                    ? undefined
                                    : 'going';
                                const copy = { ...prev };
                                if (nextState) copy[ev.id] = nextState;
                                else delete copy[ev.id];
                                return copy;
                              });
                              showToast(
                                rsvp === 'going'
                                  ? 'Interested হিসেবে চিহ্নিত হয়েছে'
                                  : rsvp === 'interested'
                                  ? 'RSVP সরানো হয়েছে'
                                  : 'Going ✓ হিসেবে নিশ্চিত হয়েছে'
                              );
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border cursor-pointer transition-colors ${
                              rsvp === 'going'
                                ? 'bg-[#0866FF] text-white border-[#0866FF]'
                                : rsvp === 'interested'
                                ? 'bg-[#E7F3FF] text-[#0866FF] border-[#0866FF]/30'
                                : 'bg-white text-[#050505] border-[#E4E6EB]'
                            }`}
                          >
                            {rsvp === 'going' ? 'Going ✓' : rsvp === 'interested' ? 'Interested ★' : 'Going'}
                          </button>
                          {isOwnerView && (
                            <button
                              type="button"
                              onClick={() => {
                                setPageEventsList((prev) => ({
                                  ...prev,
                                  [selectedPage.id]: (prev[selectedPage.id] || []).filter((x) => x.id !== ev.id),
                                }));
                                showToast('ইভেন্ট মুছে ফেলা হয়েছে');
                              }}
                              className="p-1.5 rounded-md bg-white text-rose-600 border border-[#E4E6EB] hover:bg-rose-50 cursor-pointer"
                              title="Delete event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MENTIONS TAB */}
          {pageSubTab === 'mentions' && (() => {
            const mentionSettings = getPageSettings(selectedPage.id);
            const mentionedPosts = rawPosts.filter(
              (p) =>
                p.text.includes(`@${selectedPage.name}`) ||
                (mentionSettings.customSlug && p.text.includes(`@${mentionSettings.customSlug}`))
            );
            return (
              <div className="bg-white rounded-xl border border-[#E4E6EB] p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#050505] flex items-center gap-1.5">
                    <AtSign className="w-4 h-4 text-[#0866FF]" />
                    <span>Mentions ({mentionedPosts.length})</span>
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      mentionSettings.allowMentions
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {mentionSettings.allowMentions ? 'Mentions Allowed' : 'Mentions Restricted'}
                  </span>
                </div>

                {mentionedPosts.length === 0 ? (
                  <div className="py-5 text-center space-y-2">
                    <div className="w-11 h-11 rounded-full bg-[#F0F2F5] text-[#0866FF] flex items-center justify-center mx-auto">
                      <AtSign className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-[#65676B]">
                      {mentionSettings.allowMentions
                        ? `কেউ @${selectedPage.name} কে মেনশন করে পোস্ট করলে এখানে দেখাবে।`
                        : 'এই পেজে মেনশন ও ট্যাগিং সীমিত করা হয়েছে (Page Settings -> Posts and tags)।'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mentionedPosts.map((mp) => (
                      <div key={mp.id} className="p-3 rounded-xl bg-[#F0F2F5] space-y-1">
                        <p className="text-xs text-[#050505] whitespace-pre-wrap">{mp.text}</p>
                        <p className="text-[11px] text-[#65676B]">{mp.dateLabel || mp.time}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* DEEDS LOG TAB (Halal Deeds Tracker) */}
          {pageSubTab === 'deeds' && (
            <div className="bg-white rounded-xl border border-[#E4E6EB] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#050505] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>{selectedPage.name} — Deeds Log</span>
                  </h3>
                  <p className="text-[11px] text-[#65676B]">
                    দৈনিক সালাত, কুরআন, যিকির ও সদকার আমল ট্র্যাক করুন
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tabular-nums">
                  {pageDeedsLog.filter((d) => d.completed).length}/{pageDeedsLog.length} Done
                </span>
              </div>

              <div className="space-y-2">
                {pageDeedsLog.map((deed) => (
                  <div
                    key={deed.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                      deed.completed
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-[#F7F8FA] border-[#E4E6EB]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setPageDeedsLog((prev) => {
                          const next = prev.map((d) =>
                            d.id === deed.id
                              ? { ...d, completed: !d.completed, count: d.completed ? d.count : Math.max(1, d.count) }
                              : d
                          );
                          saveDeedsLog(next);
                          return next;
                        });
                      }}
                      className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                          deed.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-[#CED0D4]'
                        }`}
                      >
                        {deed.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#050505] truncate">{deed.title}</p>
                        <p className="text-[11px] text-[#65676B] tabular-nums">
                          Recorded count: {deed.count}
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPageDeedsLog((prev) => {
                          const next = prev.map((d) =>
                            d.id === deed.id ? { ...d, count: d.count + 1, completed: true } : d
                          );
                          saveDeedsLog(next);
                          return next;
                        });
                        showToast('আলহামদুলিল্লাহ! আমল রেকর্ড আপডেট হয়েছে ✓');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#E4E6EB] hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-xs font-bold text-[#050505] transition-colors cursor-pointer shrink-0 tabular-nums"
                    >
                      +1
                    </button>
                  </div>
                ))}
              </div>
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
                {creatorDashboardTab === 'overview' && (() => {
                  const dashSettings = getPageSettings(selectedPage.id);
                  const setupChecks = [
                    {
                      label: 'Profile photo',
                      done: Boolean(selectedPage.avatar),
                      action: () => {
                        setShowCreatorDashboard(false);
                        showToast('লোগো ক্যামেরা আইকন থেকে প্রোফাইল ছবি যুক্ত করুন');
                      },
                    },
                    {
                      label: 'Cover photo',
                      done: Boolean(selectedPage.cover),
                      action: () => {
                        setShowCreatorDashboard(false);
                        showToast('কভার ফটোর ডানদিকের ক্যামেরা আইকন থেকে ছবি যুক্ত করুন');
                      },
                    },
                    {
                      label: 'Action button',
                      done: Boolean(dashSettings.actionButtonValue || selectedPage.whatsapp || selectedPage.phone),
                      action: () => {
                        setShowCreatorDashboard(false);
                        setActionBtnTypeDraft(dashSettings.actionButtonType || 'WhatsApp');
                        setActionBtnValueDraft(dashSettings.actionButtonValue || selectedPage.whatsapp || selectedPage.phone || '');
                        setActiveSettingKey('Action Button');
                        setShowPageSettings(true);
                      },
                    },
                    {
                      label: 'First post',
                      done: rawPosts.length > 0,
                      action: () => {
                        setShowCreatorDashboard(false);
                        setPageSubTab('all');
                        setShowPageComposer(true);
                      },
                    },
                    {
                      label: 'Invite friends',
                      done: dashSettings.invitedNames.length > 0,
                      action: () => {
                        setShowCreatorDashboard(false);
                        setActiveSettingKey('Invite people to connect');
                        setShowPageSettings(true);
                      },
                    },
                  ];
                  const completedCount = setupChecks.filter((s) => s.done).length;

                  return (
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

                      {/* Page Setup Progress */}
                      <div className="p-3 rounded-xl border border-[#E4E6EB] bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#050505]">Page setup progress</h4>
                          <span className="text-[11px] font-bold text-[#0866FF]">
                            {completedCount}/{setupChecks.length} completed
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#F0F2F5] overflow-hidden">
                          <div
                            className="h-full bg-[#0866FF] transition-all"
                            style={{ width: `${(completedCount / setupChecks.length) * 100}%` }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {setupChecks.map((step) => (
                            <button
                              key={step.label}
                              type="button"
                              onClick={step.action}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                                step.done
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-[#F0F2F5] text-[#050505] hover:bg-[#E4E6EB]'
                              }`}
                            >
                              {step.done && <Check className="w-3 h-3" />}
                              <span>{step.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Professional Tools Grid */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-[#050505]">Tools</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowCreatorDashboard(false);
                              setBoostTargetPost(null);
                              setShowAdvertiseModal(true);
                            }}
                            className="p-2.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-left space-y-1 cursor-pointer"
                          >
                            <Megaphone className="w-4 h-4 text-[#0866FF]" />
                            <p className="text-xs font-bold text-[#050505]">Ad Center</p>
                            <p className="text-[10px] text-[#65676B]">Promote Page & Posts</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCreatorDashboardTab('earnings')}
                            className="p-2.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-left space-y-1 cursor-pointer"
                          >
                            <CircleDollarSign className="w-4 h-4 text-emerald-600" />
                            <p className="text-xs font-bold text-[#050505]">Monetization</p>
                            <p className="text-[10px] text-[#65676B]">Halal Payout & Studio</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowCreatorDashboard(false);
                              setActiveSettingKey('Admins');
                              setShowPageSettings(true);
                            }}
                            className="p-2.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-left space-y-1 cursor-pointer"
                          >
                            <KeyRound className="w-4 h-4 text-[#0866FF]" />
                            <p className="text-xs font-bold text-[#050505]">Page access</p>
                            <p className="text-[10px] text-[#65676B]">Manage Admins & Roles</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowCreatorDashboard(false);
                              setActiveSettingKey('Page status');
                              setPageStatusSubView('moderation');
                              setShowPageSettings(true);
                            }}
                            className="p-2.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-left space-y-1 cursor-pointer"
                          >
                            <Shield className="w-4 h-4 text-[#0866FF]" />
                            <p className="text-xs font-bold text-[#050505]">Moderation Assist</p>
                            <p className="text-[10px] text-[#65676B]">Comment & Link Filters</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowCreatorDashboard(false);
                              setPageSubTab('events');
                            }}
                            className="p-2.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-left space-y-1 cursor-pointer"
                          >
                            <Calendar className="w-4 h-4 text-[#0866FF]" />
                            <p className="text-xs font-bold text-[#050505]">Events</p>
                            <p className="text-[10px] text-[#65676B]">Manage Page Events</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowCreatorDashboard(false);
                              setActiveSettingKey(null);
                              setShowPageSettings(true);
                            }}
                            className="p-2.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-left space-y-1 cursor-pointer"
                          >
                            <Settings className="w-4 h-4 text-[#050505]" />
                            <p className="text-xs font-bold text-[#050505]">Page Settings</p>
                            <p className="text-[10px] text-[#65676B]">All 14 Settings Tools</p>
                          </button>
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
                  );
                })()}

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

                {creatorDashboardTab === 'reviews' && (() => {
                  const defaultReview = {
                    id: 'rev-default-1',
                    author: 'মোহাম্মদ তৌফিক',
                    rating: 5,
                    text: 'মাশাআল্লাহ! পেজের কনটেন্ট এবং সেবার মান অত্যন্ত প্রশংসনীয়।',
                    time: 'Verified Reviewer',
                  };
                  const userReviews = pageReviewsMap[selectedPage.id] || [];
                  const allReviews = [...userReviews, defaultReview];
                  const avgRating = (
                    allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
                  ).toFixed(1);

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3">
                        <div>
                          <div className="text-xl font-extrabold text-amber-500">
                            {avgRating} {'★'.repeat(Math.round(Number(avgRating)))}
                          </div>
                          <p className="text-xs text-[#65676B]">
                            {139 + allReviews.length} জনের মতামতের ভিত্তিতে
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                          Recommended ✓
                        </span>
                      </div>

                      <div className="p-3 rounded-xl border border-[#E4E6EB] space-y-2 bg-[#F8F9FA]">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#050505]">আপনার রিভিউ যোগ করুন</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRatingDraft(star)}
                                className={`text-base leading-none cursor-pointer ${
                                  star <= reviewRatingDraft ? 'text-amber-500' : 'text-[#CED0D4]'
                                }`}
                                aria-label={`${star} stars`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={reviewTextDraft}
                            onChange={(e) => setReviewTextDraft(e.target.value)}
                            placeholder="পেজ সম্পর্কে আপনার মতামত লিখুন..."
                            className="flex-1 bg-white border border-[#E4E6EB] rounded-lg px-3 py-1.5 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const txt = reviewTextDraft.trim() || 'মাশাআল্লাহ, অসাধারণ পেজ!';
                              const entry = {
                                id: `rev-${Date.now()}`,
                                author: userProfile?.name || 'Follower',
                                rating: reviewRatingDraft,
                                text: txt,
                                time: 'এখনই',
                              };
                              setPageReviewsMap((prev) => ({
                                ...prev,
                                [selectedPage.id]: [entry, ...(prev[selectedPage.id] || [])],
                              }));
                              setReviewTextDraft('');
                              logPageActivity(
                                selectedPage.id,
                                'post',
                                `Submitted ${reviewRatingDraft}★ review`
                              );
                              showToast(`ধন্যবাদ! আপনার ${reviewRatingDraft}★ রিভিউ যুক্ত হয়েছে।`);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-[#0866FF] text-white text-xs font-bold cursor-pointer shrink-0"
                          >
                            রিভিউ দিন
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-52 overflow-y-auto">
                        {allReviews.map((rev) => (
                          <div key={rev.id} className="bg-[#F0F2F5] p-3 rounded-xl">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-[#050505]">{rev.author}</p>
                              <span className="text-[10px] text-[#65676B]">{rev.time}</span>
                            </div>
                            <p className="text-[11px] text-amber-600">
                              {'★'.repeat(rev.rating)} ১০০% হালাল ও বিশ্বস্ত
                            </p>
                            <p className="text-xs text-[#65676B] mt-1">{rev.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
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

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#050505]">ফেসবুক পেজ ক্যাটাগরি (Category)</label>
                  <select
                    value={
                      FACEBOOK_PAGE_CATEGORIES.some((c) => c.value === editCategory)
                        ? editCategory
                        : '__custom__'
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val !== '__custom__') {
                        setEditCategory(val);
                      }
                    }}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#050505] font-semibold focus:outline-none focus:border-[#0866FF] cursor-pointer"
                  >
                    {FACEBOOK_PAGE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.value}
                      </option>
                    ))}
                    {!FACEBOOK_PAGE_CATEGORIES.some((c) => c.value === editCategory) && (
                      <option value="__custom__">{editCategory || 'Custom Category'}</option>
                    )}
                  </select>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="অথবা কাস্টম ক্যাটাগরি লিখুন..."
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF]"
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

        {/* Click-to-Edit Page Bio Modal */}
        {showEditBioModal && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowEditBioModal(false)}
          >
            <div
              className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[#E4E6EB] shadow-2xl p-4 space-y-3.5 animate-in fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-[#E4E6EB]">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#0866FF]" />
                  <h3 className="font-bold text-base text-[#050505]">Edit Bio</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditBioModal(false)}
                  className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDirectBio} className="space-y-3 text-left">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#050505]">
                      Page Bio / পরিচিতি
                    </label>
                    <span className="text-[11px] text-[#65676B]">
                      {bioModalDraft.length}/500
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={500}
                    autoFocus
                    value={bioModalDraft}
                    onChange={(e) => setBioModalDraft(e.target.value)}
                    placeholder="আপনার পেজ সম্পর্কে লিখুন... (Describe your Page)"
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] focus:border-[#0866FF] focus:bg-white rounded-xl p-3 text-[15px] text-[#050505] placeholder-[#65676B] focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowEditBioModal(false)}
                    className="px-4 py-2 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-xs font-bold text-[#050505] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Bio</span>
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

        {/* Full Gallery -> Preview -> Boost Prompt Page Reel Flow */}
        {showPageReelModal && (
          <FbCreateReelModal
            userProfile={{
              ...(userProfile || {
                name: selectedPage.name,
                avatar: selectedPage.avatar,
                coverPhoto: selectedPage.cover,
                bio: selectedPage.bio || '',
                location: selectedPage.location || 'Dhaka, Bangladesh',
                birthDate: '',
                friendsCount: 0,
              }),
              id: selectedPage.id,
              name: selectedPage.name,
              avatar: selectedPage.avatar || userProfile?.avatar || '',
            }}
            isPageAccount={true}
            pageId={selectedPage.id}
            onClose={() => {
              setPageReelTitle('');
              setShowPageReelModal(false);
            }}
            onReelCreated={async (newReel, options) => {
              const pageTaggedReel: PostItem = {
                ...newReel,
                authorId: selectedPage.id,
                author: {
                  name: selectedPage.name,
                  avatar: selectedPage.avatar || userProfile?.avatar || '',
                  verified: true,
                  subtitle: `Reels • ${selectedPage.category}`,
                },
                isFreshUpload: true,
              };
              setPageFreshNowTick(Date.now());
              if (onPublishFeedPost) {
                onPublishFeedPost(pageTaggedReel);
              } else {
                const todayStr = new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                setPagePostsList((prev) => ({
                  ...prev,
                  [selectedPage.id]: [
                    {
                      id: pageTaggedReel.id,
                      text: pageTaggedReel.contentBangla || 'PeaceVerse Reels',
                      time: 'Just now',
                      dateLabel: todayStr,
                      createdAtMillis: pageTaggedReel.createdAtMillis || Date.now(),
                      likes: 0,
                      comments: 0,
                      reach: 185,
                      clicks: 21,
                    },
                    ...(prev[selectedPage.id] || []),
                  ],
                }));
              }
              logPageActivity(
                selectedPage.id,
                'post',
                options?.boosted ? 'Published & boosted a Page Reel' : 'Published a Page Reel',
                pageTaggedReel.contentBangla.slice(0, 80)
              );
              setShowPageReelModal(false);
              showToast(
                options?.boosted
                  ? '🚀 আপনার পেজ রিলস পোস্ট ও বুস্ট করা হয়েছে!'
                  : '🎬 রিলস পেজে প্রকাশিত হয়েছে!'
              );
              if (creatorPrefs.creatorNotifyFollowersOnPost) {
                await broadcastCreatorNotification({
                  creatorId: selectedPage.id,
                  creatorName: selectedPage.name,
                  creatorAvatar: selectedPage.avatar,
                  contentType: 'video',
                  title: `${selectedPage.name} নতুন রিলস আপলোড করেছেন`,
                  body: pageTaggedReel.contentBangla.slice(0, 95) || 'PeaceVerse Reels',
                  thumbnail: pageTaggedReel.mediaUrl || selectedPage.avatar,
                  postId: pageTaggedReel.id,
                  link: `/?tab=pages&pageId=${selectedPage.id}`,
                  broadcastToAll: creatorPrefs.creatorSendPushToAllUsers,
                  onLocalNotify: onBroadcastNotification,
                });
              }
            }}
          />
        )}

        {/* Boost Confirmation Popup for Regular Page Posts ("Apni ki eti Boost korte chan?") */}
        {showPagePostBoostPrompt && pendingPageBoostDraft && (
          <div
            className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
            onClick={() => setShowPagePostBoostPrompt(false)}
          >
            <div
              className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[#E4E6EB] shadow-2xl p-5 space-y-4 text-[#050505]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center shrink-0">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-extrabold text-[#050505] leading-snug">
                    Apni ki eti Boost korte chan?
                  </h3>
                  <p className="text-xs text-[#65676B] mt-1 leading-relaxed">
                    আপনি কি আপনার পেজের এই পোস্টটি Boost করে আরও বেশি মানুষের কাছে পৌঁছাতে চান?
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowPagePostBoostPrompt(false);
                    setShowPagePostBoostSetup(true);
                  }}
                  className="w-full py-3 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-extrabold text-sm cursor-pointer"
                >
                  YES, BOOST KORUN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const draft = pendingPageBoostDraft;
                    setShowPagePostBoostPrompt(false);
                    setPendingPageBoostDraft(null);
                    void finalizePublishPagePost(draft.localPost, draft.feedPost, false);
                  }}
                  className="w-full py-3 rounded-xl bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] font-bold text-sm cursor-pointer"
                >
                  NOT NOW / EKHON NA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Boost Page Modal for Newly Submitted Page Post */}
        {showPagePostBoostSetup && pendingPageBoostDraft && (
          <FbBoostPostModal
            post={pendingPageBoostDraft.feedPost}
            initialMode="boost"
            onClose={() => setShowPagePostBoostSetup(false)}
            onBoostConfirmed={() => {
              const draft = pendingPageBoostDraft;
              setShowPagePostBoostSetup(false);
              setPendingPageBoostDraft(null);
              void finalizePublishPagePost(draft.localPost, draft.feedPost, true);
            }}
          />
        )}

        {/* Boost / Insights Modal for Inline Page Posts */}
        {inlineBoostModalState && (
          <FbBoostPostModal
            post={inlineBoostModalState.post}
            initialMode={inlineBoostModalState.mode}
            onClose={() => setInlineBoostModalState(null)}
          />
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
                  logPageActivity(selectedPage.id, 'post', 'Started a Live video', title);
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

        {/* FULL-SCREEN PAGE SETTINGS OVERLAY (100% Working Facebook Page Settings) */}
        {showPageSettings && (() => {
          const settings = getPageSettings(selectedPage.id);
          const pageShareUrl = `${window.location.origin}/?tab=pages&pageId=${selectedPage.id}`;
          const monetizationInfo = getPageMonetizationById(selectedPage.id);

          const openSetting = (key: string) => {
            if (key === 'Action Button') {
              setActionBtnTypeDraft(settings.actionButtonType || 'WhatsApp');
              setActionBtnValueDraft(
                settings.actionButtonValue || selectedPage.whatsapp || selectedPage.phone || selectedPage.website || ''
              );
            } else if (key === 'Verify your Page') {
              setVerifyCategoryDraft(settings.verificationCategory || 'Creator / Public Figure');
              setVerifyNoteDraft(settings.verificationNote || '');
              setVerifyDocTypeDraft(settings.verificationDocType || 'National Identity Card (NID)');
              setVerifyDocNameDraft(settings.verificationDocName || '');
              setVerifyCountryDraft(settings.verificationCountry || 'Bangladesh');
              setVerifyReasonDraft(settings.verificationReason || '');
            } else if (key === 'Page link') {
              setCustomSlugDraft(
                settings.customSlug ||
                  selectedPage.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '')
                    .slice(0, 24) ||
                  selectedPage.id
              );
            } else if (key === 'Connected experiences') {
              setConnWhatsapp(selectedPage.whatsapp || '');
              setConnPhone(selectedPage.phone || '');
              setConnEmail(selectedPage.email || '');
              setConnWebsite(selectedPage.website || '');
              setConnImo(selectedPage.imo || '');
              setConnViber(selectedPage.viber || '');
            } else if (key === 'Settings & privacy') {
              setConfirmDeletePage(false);
              setPrivacySubView(null);
              setSetupNameDraft(selectedPage.name);
              setSetupBioDraft(
                sanitizePageBioValue(selectedPage.bio) ||
                  sanitizePageBioValue(selectedPage.description)
              );
            } else if (key === 'Page status') {
              setPageStatusSubView(null);
            } else if (key === 'Archive') {
              setArchiveTab('archive');
            }
            setActiveSettingKey(key);
          };

          const filteredInviteContacts = INVITABLE_CONTACTS.filter(
            (name) => !inviteSearch.trim() || name.toLowerCase().includes(inviteSearch.trim().toLowerCase())
          );

          const filteredLog = (settings.activityLog || []).filter(
            (entry) => activityFilter === 'all' || entry.category === activityFilter
          );

          const pageStatusHeaderTitle =
            activeSettingKey === 'Page status' && pageStatusSubView
              ? pageStatusSubView === 'recommendations'
                ? 'Recommendations'
                : pageStatusSubView === 'moderation'
                ? 'Moderation Assist'
                : pageStatusSubView === 'updates'
                ? 'Other updates'
                : pageStatusSubView === 'guide_intro'
                ? 'Community Standards'
                : pageStatusSubView === 'guide_enforce'
                ? 'How we enforce'
                : pageStatusSubView === 'guide_tips'
                ? 'Creator Tips'
                : 'Give feedback'
              : activeSettingKey === 'Settings & privacy' && privacySubView
              ? privacySubView === 'setup'
                ? 'Page setup'
                : privacySubView === 'privacy'
                ? 'Privacy'
                : privacySubView === 'notifications'
                ? 'Notifications'
                : privacySubView === 'blocking'
                ? 'Blocking'
                : privacySubView === 'info'
                ? 'Your Page information'
                : 'Deactivation & deletion'
              : activeSettingKey === 'Admins'
              ? 'Page access'
              : activeSettingKey === 'Posts and tags'
              ? 'Page and tagging'
              : activeSettingKey || 'Page Settings';

          return (
          <div className="fixed inset-0 z-[120] bg-white text-[#050505] overflow-y-auto pb-20 font-sans animate-in fade-in">
            <div className="max-w-[700px] mx-auto min-h-screen bg-white">
              {/* Top Sticky Header: <  |  Page Settings / Sub-Title  |  Profile Icon + Page Avatar Chevron */}
              <div className="sticky top-0 z-20 bg-white border-b border-[#E4E6EB] h-[54px] px-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (activeSettingKey === 'Page status' && pageStatusSubView) {
                      setPageStatusSubView(null);
                    } else if (activeSettingKey === 'Settings & privacy' && privacySubView) {
                      setPrivacySubView(null);
                    } else if (activeSettingKey) {
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

                <h2 className="text-[18px] font-bold text-[#050505]">
                  {pageStatusHeaderTitle}
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSheetPage(selectedPage)}
                    className="w-8 h-8 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center text-[#050505] cursor-pointer"
                    title="Personal Profile / Account"
                    aria-label="Account"
                  >
                    <UserCircle2 className="w-6 h-6 stroke-[1.7]" />
                  </button>

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
              </div>

              {/* Detail Sub-view when any setting item is tapped */}
              {activeSettingKey ? (
                <div className="p-4 space-y-4">
                  {/* 1. PAGE STATUS (Exact Facebook Page status layout + A-to-Z working sub-panels) */}
                  {activeSettingKey === 'Page status' && (
                    pageStatusSubView === 'recommendations' ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-[#F0F2F5] space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-[15px] font-bold text-[#050505]">Recommendable</h4>
                              <p className="text-xs text-[#65676B]">
                                {settings.allowRecommendations
                                  ? 'Active • আপনার পেজটি নতুন ইউজারদের ফিডে রিকমেন্ড করা হচ্ছে'
                                  : 'Off • রিকমেন্ডেশন সাময়িকভাবে বন্ধ রাখা হয়েছে'}
                              </p>
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                settings.allowRecommendations
                                  ? 'bg-[#31A24C] text-white'
                                  : 'bg-[#E4E6EB] text-[#65676B]'
                              }`}
                            >
                              {settings.allowRecommendations ? 'Active' : 'Off'}
                            </span>
                          </div>
                        </div>

                        <label className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-[#E4E6EB] cursor-pointer">
                          <div>
                            <p className="text-sm font-bold text-[#050505]">Allow Page recommendations</p>
                            <p className="text-xs text-[#65676B]">অন্যদের সামনে এই পেজটি সাজেস্ট করা চালু বা বন্ধ করুন</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.allowRecommendations}
                            onChange={(e) => {
                              updatePageSettings(selectedPage.id, { allowRecommendations: e.target.checked });
                              logPageActivity(
                                selectedPage.id,
                                'settings',
                                e.target.checked ? 'Enabled Page recommendations' : 'Disabled Page recommendations'
                              );
                              showToast(
                                e.target.checked ? 'Recommendations সক্রিয় করা হয়েছে' : 'Recommendations বন্ধ করা হয়েছে'
                              );
                            }}
                            className="w-5 h-5 accent-[#0866FF]"
                          />
                        </label>

                        <div className="p-4 rounded-2xl border border-[#E4E6EB] space-y-2 text-xs text-[#050505]">
                          <p className="font-bold text-sm">Why this Page is eligible:</p>
                          <p className="flex items-center gap-2 text-emerald-700 font-medium">
                            <Check className="w-4 h-4 shrink-0" />
                            <span>No Community Standards violations</span>
                          </p>
                          <p className="flex items-center gap-2 text-emerald-700 font-medium">
                            <Check className="w-4 h-4 shrink-0" />
                            <span>Original Halal & educational content shared</span>
                          </p>
                        </div>
                      </div>
                    ) : pageStatusSubView === 'moderation' ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-[#E7F3FF] border border-[#0866FF]/20 space-y-1">
                          <h4 className="text-sm font-bold text-[#050505]">Moderation Assist</h4>
                          <p className="text-xs text-[#65676B]">
                            আপনার পেজের কমেন্ট সেকশন স্বয়ংক্রিয়ভাবে নিরাপদ ও পরিচ্ছন্ন রাখতে রুলস সেট করুন।
                          </p>
                        </div>

                        <label className="flex items-center justify-between gap-2 p-3.5 rounded-xl bg-[#F0F2F5] cursor-pointer">
                          <div>
                            <p className="text-xs font-bold text-[#050505]">Hide comments with external links</p>
                            <p className="text-[11px] text-[#65676B]">অপ্রত্যাশিত লিংকযুক্ত কমেন্ট হাইড করুন</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.modHideLinks}
                            onChange={(e) => {
                              updatePageSettings(selectedPage.id, { modHideLinks: e.target.checked });
                              logPageActivity(selectedPage.id, 'settings', 'Updated Moderation Assist link filter');
                            }}
                            className="w-4 h-4 accent-[#0866FF]"
                          />
                        </label>

                        <label className="flex items-center justify-between gap-2 p-3.5 rounded-xl bg-[#F0F2F5] cursor-pointer">
                          <div>
                            <p className="text-xs font-bold text-[#050505]">Filter profanity & abusive words</p>
                            <p className="text-[11px] text-[#65676B]">খারাপ বা অশালীন শব্দ স্বয়ংক্রিয়ভাবে ফিল্টার করুন</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.modHideProfanity}
                            onChange={(e) => {
                              updatePageSettings(selectedPage.id, { modHideProfanity: e.target.checked });
                              logPageActivity(selectedPage.id, 'settings', 'Updated Moderation Assist profanity filter');
                            }}
                            className="w-4 h-4 accent-[#0866FF]"
                          />
                        </label>

                        <label className="flex items-center justify-between gap-2 p-3.5 rounded-xl bg-[#F0F2F5] cursor-pointer">
                          <div>
                            <p className="text-xs font-bold text-[#050505]">Limit accounts with no profile picture</p>
                            <p className="text-[11px] text-[#65676B]">সন্দেহজনক ফেক আইডি থেকে কমেন্ট সীমিত করুন</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.modNoAvatarBlock}
                            onChange={(e) =>
                              updatePageSettings(selectedPage.id, { modNoAvatarBlock: e.target.checked })
                            }
                            className="w-4 h-4 accent-[#0866FF]"
                          />
                        </label>

                        <div className="p-3.5 rounded-2xl border border-[#E4E6EB] space-y-2.5">
                          <p className="text-xs font-bold text-[#050505]">Blocked keywords in comments</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={modNewWord}
                              onChange={(e) => setModNewWord(e.target.value)}
                              placeholder="নতুন ব্লক শব্দ লিখুন..."
                              className="flex-1 bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const w = modNewWord.trim();
                                if (!w) return;
                                updatePageSettings(selectedPage.id, (cur) => ({
                                  ...cur,
                                  modBlockedWords: Array.from(new Set([...(cur.modBlockedWords || []), w])),
                                }));
                                setModNewWord('');
                                logPageActivity(selectedPage.id, 'settings', `Added blocked word "${w}"`);
                                showToast(`"${w}" ব্লক তালিকায় যুক্ত হয়েছে`);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(settings.modBlockedWords || []).map((word) => (
                              <span
                                key={word}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0F2F5] text-xs font-medium text-[#050505]"
                              >
                                <span>{word}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updatePageSettings(selectedPage.id, (cur) => ({
                                      ...cur,
                                      modBlockedWords: (cur.modBlockedWords || []).filter((x) => x !== word),
                                    }))
                                  }
                                  className="text-[#65676B] hover:text-rose-600 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : pageStatusSubView === 'updates' ? (
                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-[#F0F2F5] text-center space-y-2">
                          <Bell className="w-8 h-8 text-[#0866FF] mx-auto" />
                          <h4 className="text-sm font-bold text-[#050505]">No other updates or warnings</h4>
                          <p className="text-xs text-[#65676B] leading-relaxed">
                            এই মুহূর্তে আপনার {selectedPage.name} পেজের বিরুদ্ধে কোনো অজানা বা সাধারণ নীতিমালা সতর্কতা নেই।
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl border border-[#E4E6EB] space-y-1">
                          <p className="text-xs font-bold text-[#050505]">Halal & Community Guidelines 2026</p>
                          <p className="text-[11px] text-[#65676B]">
                            সব নিয়ম সক্রিয় আছে এবং আপনার পেজটি সম্পূর্ণ নিরাপদ অবস্থায় রয়েছে।
                          </p>
                        </div>
                      </div>
                    ) : pageStatusSubView === 'guide_intro' ||
                      pageStatusSubView === 'guide_enforce' ||
                      pageStatusSubView === 'guide_tips' ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-[#F0F2F5] space-y-2">
                          <h4 className="text-base font-bold text-[#050505]">
                            {pageStatusSubView === 'guide_intro'
                              ? 'Introduction to Community Standards'
                              : pageStatusSubView === 'guide_enforce'
                              ? 'How we enforce Standards'
                              : 'Tips for great Halal content'}
                          </h4>
                          <p className="text-xs text-[#050505] leading-relaxed">
                            {pageStatusSubView === 'guide_intro'
                              ? 'Peaceverse24 কমিউনিটি স্ট্যান্ডার্ডস প্রত্যেকটি পেজ ও ক্রিয়েটরকে একটি নিরাপদ, সম্মানজনক ও হালাল পরিবেশ বজায় রাখতে সহায়তা করে। সত্য তথ্য, পারস্পরিক শ্রদ্ধা ও কপিরাইট-মুক্ত কনটেন্ট সর্বদা উৎসাহিত করা হয়।'
                              : pageStatusSubView === 'guide_enforce'
                              ? 'কোনো পোস্ট বা কমেন্ট নীতিমালা ভঙ্গ করলে স্বয়ংক্রিয় সিস্টেম ও রিভিউ টিম তা যাচাই করে। গুরুতর সমস্যা হলে এখানে Page status-এ বিস্তারিত দেখাবে এবং আপিল করার সুযোগ থাকবে।'
                              : 'নিয়মিত মূল ইসলামিক ও শিক্ষামূলক পোস্ট, সংক্ষিপ্ত Reels, স্পষ্ট প্রোফাইল ছবি এবং ফলোয়ারদের সাথে ইতিবাচক যোগাযোগ পেজের অর্গানিক রিচ বাড়াতে সাহায্য করে।'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPageStatusSubView(null)}
                          className="w-full py-2.5 rounded-lg bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
                        >
                          Back to Page status
                        </button>
                      </div>
                    ) : pageStatusSubView === 'feedback' ? (
                      <div className="space-y-4">
                        <h4 className="text-base font-bold text-[#050505]">Tell us how we&apos;re doing</h4>
                        <p className="text-xs text-[#65676B]">
                          Page status অভিজ্ঞতা সম্পর্কে আপনার মতামত জানান:
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'satisfied', label: '😊 Satisfied' },
                            { id: 'neutral', label: '😐 Neutral' },
                            { id: 'dissatisfied', label: '😞 Dissatisfied' },
                          ].map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setFeedbackRating(r.id as any)}
                              className={`py-2.5 px-2 rounded-xl border text-xs font-bold cursor-pointer ${
                                feedbackRating === r.id
                                  ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF]'
                                  : 'bg-[#F0F2F5] border-transparent text-[#050505]'
                              }`}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                        <textarea
                          rows={4}
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="আপনার মতামত বা পরামর্শ লিখুন..."
                          className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl p-3 text-xs text-[#050505]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updatePageSettings(selectedPage.id, { statusFeedbackGiven: true });
                            logPageActivity(selectedPage.id, 'settings', `Submitted Page status feedback (${feedbackRating})`);
                            setFeedbackText('');
                            setPageStatusSubView(null);
                            showToast('🙏 আপনার মূল্যবান মতামতের জন্য ধন্যবাদ!');
                          }}
                          className="w-full py-2.5 rounded-lg bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
                        >
                          Submit feedback
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6 pb-4">
                        {/* Centered Hero: Avatar + Green Check + Page Name + Page has no issues */}
                        <div className="flex flex-col items-center text-center pt-2 space-y-2.5">
                          <div className="relative">
                            {selectedPage.avatar ? (
                              <img
                                src={selectedPage.avatar}
                                alt={selectedPage.name}
                                className="w-24 h-24 rounded-full object-cover border border-[#E4E6EB] shadow-xs"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center font-extrabold text-3xl border border-[#E4E6EB]">
                                {selectedPage.name.trim().charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#31A24C] border-2 border-white flex items-center justify-center shadow-xs">
                              <Check className="w-4 h-4 text-white stroke-[3]" />
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <h3 className="text-[22px] font-bold text-[#050505] tracking-tight">
                              {selectedPage.name}
                            </h3>
                            <p className="text-[14.5px] text-[#65676B]">Page has no issues</p>
                          </div>

                          <p className="text-[14px] text-[#65676B] leading-snug text-left w-full pt-1">
                            Your Page is in good standing. If there are any issues, you will be able to see what happened and what you can do about it here.
                          </p>
                        </div>

                        {/* Section 1: Page features */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-[18px] font-bold text-[#050505]">Page features</h4>
                            <p className="text-[13.5px] text-[#65676B] mt-0.5 leading-snug">
                              To use these features, you must be eligible and avoid breaking any rules.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setPageStatusSubView('recommendations')}
                            className="w-full py-2 flex items-center justify-between gap-3 hover:bg-[#F0F2F5] rounded-xl px-1 text-left transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3.5">
                              <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#050505] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="m12 8.2 1.15 2.33 2.57.37-1.86 1.81.44 2.56L12 14.06l-2.3 1.21.44-2.56-1.86-1.81 2.57-.37L12 8.2z" fill="currentColor" stroke="none" />
                              </svg>
                              <div>
                                <p className="text-[15.5px] font-medium text-[#050505]">Recommendations</p>
                                <p className="text-[13px] text-[#65676B]">
                                  {settings.allowRecommendations ? 'Active' : 'Off'}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#65676B] shrink-0" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowPageSettings(false);
                              setCreatorDashboardTab('earnings');
                              setShowCreatorDashboard(true);
                            }}
                            className="w-full py-2 flex items-center justify-between gap-3 hover:bg-[#F0F2F5] rounded-xl px-1 text-left transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3.5">
                              <CircleDollarSign className="w-6 h-6 text-[#050505] shrink-0 stroke-[1.9]" />
                              <div>
                                <p className="text-[15.5px] font-medium text-[#050505]">Monetization</p>
                                <p className="text-[13px] text-[#65676B]">
                                  {monetizationInfo?.status === 'approved'
                                    ? 'Active'
                                    : selectedPage.followersCount >= 100
                                    ? 'Eligible'
                                    : 'Not eligible'}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#65676B] shrink-0" />
                          </button>
                        </div>

                        {/* Section 2: More about your Page */}
                        <div className="space-y-2.5">
                          <h4 className="text-[18px] font-bold text-[#050505]">More about your Page</h4>

                          <button
                            type="button"
                            onClick={() => setActiveSettingKey('Admins')}
                            className="w-full py-2.5 flex items-center justify-between gap-3 hover:bg-[#F0F2F5] rounded-xl px-1 text-left transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3.5">
                              <Shield className="w-6 h-6 text-[#050505] shrink-0 stroke-[1.9]" />
                              <span className="text-[15.5px] font-medium text-[#050505]">Manage admins</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#65676B] shrink-0" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setPageStatusSubView('moderation')}
                            className="w-full py-2.5 flex items-center justify-between gap-3 hover:bg-[#F0F2F5] rounded-xl px-1 text-left transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3.5">
                              <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#050505] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)" />
                                <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)" />
                                <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(90 12 12)" />
                                <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
                              </svg>
                              <span className="text-[15.5px] font-medium text-[#050505]">Moderation Assist</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#65676B] shrink-0" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setPageStatusSubView('updates')}
                            className="w-full py-2.5 flex items-center justify-between gap-3 hover:bg-[#F0F2F5] rounded-xl px-1 text-left transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3.5">
                              <Bell className="w-6 h-6 text-[#050505] shrink-0 stroke-[1.9]" />
                              <div>
                                <p className="text-[15.5px] font-medium text-[#050505]">Other updates</p>
                                <p className="text-[13px] text-[#65676B] leading-snug">
                                  These issues don&apos;t hurt your Page, but you should still know about them.
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#65676B] shrink-0" />
                          </button>
                        </div>

                        {/* Section 3: Find out more */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-[18px] font-bold text-[#050505]">Find out more</h4>
                            <p className="text-[13.5px] text-[#65676B] mt-0.5 leading-snug">
                              See our Community Standards and get tips for great content.
                            </p>
                          </div>

                          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                            <button
                              type="button"
                              onClick={() => setPageStatusSubView('guide_intro')}
                              className="w-[210px] shrink-0 rounded-2xl border border-[#E4E6EB] bg-white overflow-hidden text-left shadow-2xs hover:shadow-sm transition-shadow cursor-pointer"
                            >
                              <div className="h-[118px] bg-[#DCEFE3] flex items-center justify-center px-4">
                                <svg viewBox="0 0 180 100" className="w-full h-full">
                                  <rect x="0" y="72" width="180" height="28" fill="#B5DFC4" rx="4" />
                                  <rect x="44" y="64" width="92" height="12" fill="#F29F67" rx="3" />
                                  <circle cx="90" cy="34" r="14" fill="#E8B89A" />
                                  <path d="M62 72 C62 50 118 50 118 72 Z" fill="#C4DF76" />
                                  <rect x="76" y="62" width="28" height="14" fill="#FFFDF8" rx="2" />
                                </svg>
                              </div>
                              <div className="p-3">
                                <p className="text-[14px] font-semibold text-[#050505] leading-snug">
                                  Introduction to Community Standards
                                </p>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPageStatusSubView('guide_enforce')}
                              className="w-[210px] shrink-0 rounded-2xl border border-[#E4E6EB] bg-white overflow-hidden text-left shadow-2xs hover:shadow-sm transition-shadow cursor-pointer"
                            >
                              <div className="h-[118px] bg-[#F7CFD7] flex items-center justify-center px-4">
                                <svg viewBox="0 0 180 100" className="w-full h-full">
                                  <rect x="0" y="74" width="180" height="26" fill="#EFB2BF" rx="4" />
                                  <circle cx="88" cy="34" r="14" fill="#F1C5AB" />
                                  <path d="M58 76 C58 50 118 50 118 76 Z" fill="#6374E6" />
                                  <rect x="112" y="48" width="22" height="28" fill="#5D6B7E" rx="3" />
                                </svg>
                              </div>
                              <div className="p-3">
                                <p className="text-[14px] font-semibold text-[#050505] leading-snug">
                                  How we enforce Standards
                                </p>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPageStatusSubView('guide_tips')}
                              className="w-[210px] shrink-0 rounded-2xl border border-[#E4E6EB] bg-white overflow-hidden text-left shadow-2xs hover:shadow-sm transition-shadow cursor-pointer"
                            >
                              <div className="h-[118px] bg-[#DCEAFE] flex items-center justify-center px-4">
                                <svg viewBox="0 0 180 100" className="w-full h-full">
                                  <rect x="28" y="20" width="124" height="62" fill="#FFFFFF" rx="10" />
                                  <circle cx="90" cy="48" r="16" fill="#0866FF" opacity="0.16" />
                                  <path d="M84 48 L89 53 L98 42" stroke="#0866FF" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                              <div className="p-3">
                                <p className="text-[14px] font-semibold text-[#050505] leading-snug">
                                  Tips for great Halal content
                                </p>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Section 4: Tell us how we're doing + Give feedback */}
                        <div className="p-4 rounded-2xl border border-[#E4E6EB] bg-white space-y-3 shadow-2xs">
                          <div className="space-y-1">
                            <h4 className="text-[16px] font-bold text-[#050505]">
                              Tell us how we&apos;re doing
                            </h4>
                            <p className="text-[13px] text-[#65676B] leading-snug">
                              How satisfied or dissatisfied are you with the help you received for this issue?
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setPageStatusSubView('feedback')}
                            className="w-full py-2.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-[14px] font-bold flex items-center justify-center cursor-pointer"
                          >
                            <span>
                              {settings.statusFeedbackGiven ? 'Edit feedback' : 'Give feedback'}
                            </span>
                          </button>
                        </div>

                        {/* Sticky Floating Give feedback Pill CTA matching Facebook Page status screenshot */}
                        <div className="sticky bottom-5 flex justify-center pointer-events-none pt-1">
                          <button
                            type="button"
                            onClick={() => setPageStatusSubView('feedback')}
                            className="pointer-events-auto px-5 py-2.5 rounded-full bg-white hover:bg-[#F7F8FA] text-[#050505] text-[14px] font-semibold border border-[#E4E6EB] shadow-[0_6px_20px_rgba(0,0,0,0.18)] flex items-center gap-2 transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                          >
                            <MessageCircle className="w-4 h-4 text-[#050505] stroke-[2.2]" />
                            <span>Give feedback</span>
                          </button>
                        </div>
                      </div>
                    )
                  )}

                  {/* 2. VERIFY YOUR PAGE (Facebook Request a Verified Badge flow) */}
                  {activeSettingKey === 'Verify your Page' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-[#E7F3FF] border border-[#0866FF]/20 space-y-1.5">
                        <p className="text-sm font-extrabold text-[#050505] flex items-center gap-2">
                          <BadgeCheck className="w-5 h-5 text-[#0866FF]" />
                          <span>
                            Status:{' '}
                            {settings.verificationStatus === 'verified'
                              ? 'Verified ✓'
                              : settings.verificationStatus === 'pending'
                              ? 'Under Review (Pending)'
                              : 'Apply for Verification'}
                          </span>
                        </p>
                        <p className="text-xs text-[#65676B] leading-relaxed">
                          ভেরিফায়েড ব্যাজ মানে হলো আপনার পেজটি একটি আসল পাবলিক ফিগার, ব্র্যান্ড বা ইসলামিক অর্গানাইজেশন।
                        </p>
                      </div>

                      {/* Eligibility Checklist */}
                      <div className="p-4 rounded-2xl border border-[#E4E6EB] space-y-2">
                        <h4 className="text-xs font-bold text-[#65676B] uppercase tracking-wide">
                          Page Authenticity Checklist
                        </h4>
                        {[
                          { label: 'Profile Photo / Logo uploaded', ok: Boolean(selectedPage.avatar) },
                          { label: 'Cover Photo uploaded', ok: Boolean(selectedPage.cover) },
                          { label: 'Bio & Category completed', ok: Boolean(selectedPage.bio && selectedPage.category) },
                          {
                            label: 'Contact info (Phone / WhatsApp / Web)',
                            ok: Boolean(selectedPage.phone || selectedPage.whatsapp || selectedPage.website),
                          },
                        ].map((chk) => (
                          <div key={chk.label} className="flex items-center justify-between text-xs py-1">
                            <span className="text-[#050505]">{chk.label}</span>
                            <span className={`font-bold ${chk.ok ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {chk.ok ? 'Complete ✓' : 'Missing'}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Step 1: Confirm Authenticity */}
                      <div className="p-4 rounded-2xl border border-[#E4E6EB] space-y-2.5">
                        <h4 className="text-sm font-bold text-[#050505]">Step 1: Confirm authenticity</h4>
                        <label className="block text-xs font-bold text-[#050505]">Document Type</label>
                        <select
                          value={verifyDocTypeDraft}
                          onChange={(e) => setVerifyDocTypeDraft(e.target.value)}
                          className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2.5 text-xs text-[#050505]"
                        >
                          <option value="National Identity Card (NID)">National Identity Card (NID)</option>
                          <option value="Passport">Passport</option>
                          <option value="Driver's License">Driver&apos;s License</option>
                          <option value="Business License / Registration">Business License / Registration</option>
                          <option value="Tax Filing / Utility Bill">Tax Filing / Utility Bill</option>
                        </select>

                        <label className="w-full py-2.5 px-3 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] border border-dashed border-[#CED0D4] flex items-center justify-between text-xs cursor-pointer">
                          <span className="font-semibold text-[#050505] truncate">
                            {verifyDocNameDraft ? `📎 ${verifyDocNameDraft}` : 'Upload Official Document / ID Photo'}
                          </span>
                          <span className="text-[#0866FF] font-bold shrink-0">Choose File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              e.target.value = '';
                              if (!file) return;
                              const check = validateMediaUpload(file, ['image']);
                              if (!check.valid) {
                                showToast(check.error || 'অবৈধ ছবি ফাইল (সর্বোচ্চ ৫ মেগাবাইট)।');
                                return;
                              }
                              setVerifyDocNameDraft(sanitizeInput(file.name));
                              showToast(`ডকুমেন্ট যুক্ত হয়েছে: ${sanitizeInput(file.name)}`);
                            }}
                          />
                        </label>
                      </div>

                      {/* Step 2: Confirm Notability */}
                      <div className="p-4 rounded-2xl border border-[#E4E6EB] space-y-2.5">
                        <h4 className="text-sm font-bold text-[#050505]">Step 2: Confirm notability</h4>

                        <label className="block text-xs font-bold text-[#050505]">Category</label>
                        <select
                          value={verifyCategoryDraft}
                          onChange={(e) => setVerifyCategoryDraft(e.target.value)}
                          className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2.5 text-xs text-[#050505]"
                        >
                          <option value="Creator / Public Figure">Digital Creator / Public Figure</option>
                          <option value="Islamic Organization / Mosque">Islamic Organization / Mosque</option>
                          <option value="Business / Brand">Business / Brand / Organization</option>
                          <option value="News / Media">News / Media</option>
                          <option value="Entertainment / Education">Entertainment / Education</option>
                        </select>

                        <label className="block text-xs font-bold text-[#050505]">Country / Region</label>
                        <select
                          value={verifyCountryDraft}
                          onChange={(e) => setVerifyCountryDraft(e.target.value)}
                          className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2.5 text-xs text-[#050505]"
                        >
                          <option value="Bangladesh">Bangladesh</option>
                          <option value="India">India</option>
                          <option value="Saudi Arabia">Saudi Arabia</option>
                          <option value="United Arab Emirates">United Arab Emirates</option>
                          <option value="Malaysia">Malaysia</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="United States">United States</option>
                          <option value="Global">Global</option>
                        </select>

                        <label className="block text-xs font-bold text-[#050505]">
                          Audience &amp; Notability Description
                        </label>
                        <textarea
                          rows={2}
                          value={verifyReasonDraft}
                          onChange={(e) => setVerifyReasonDraft(e.target.value)}
                          placeholder="আপনার পেজের ফলোয়ার কারা এবং কেন এটি ভেরিফিকেশন পাওয়া উচিত..."
                          className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl p-3 text-xs text-[#050505]"
                        />

                        <label className="block text-xs font-bold text-[#050505]">
                          Official Website / Reference Links (Optional)
                        </label>
                        <input
                          type="text"
                          value={verifyNoteDraft}
                          onChange={(e) => setVerifyNoteDraft(e.target.value)}
                          placeholder="https://... অথবা মিডিয়া/অন্যান্য সোশ্যাল লিংক"
                          className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2.5 text-xs text-[#050505]"
                        />

                        {settings.verificationStatus === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => {
                              updatePageSettings(selectedPage.id, { verificationStatus: 'none' });
                              logPageActivity(selectedPage.id, 'settings', 'Withdrew verification request');
                              showToast('ভেরিফিকেশন আবেদন প্রত্যাহার করা হয়েছে');
                            }}
                            className="w-full py-2.5 rounded-lg bg-[#E4E6EB] text-[#050505] text-xs font-bold cursor-pointer"
                          >
                            Withdraw Request
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              updatePageSettings(selectedPage.id, {
                                verificationStatus: 'pending',
                                verificationCategory: verifyCategoryDraft,
                                verificationNote: verifyNoteDraft.trim(),
                                verificationDocType: verifyDocTypeDraft,
                                verificationDocName: verifyDocNameDraft,
                                verificationCountry: verifyCountryDraft,
                                verificationReason: verifyReasonDraft.trim(),
                              });
                              logPageActivity(
                                selectedPage.id,
                                'settings',
                                'Submitted verification request',
                                `${verifyCategoryDraft} • ${verifyCountryDraft}`
                              );
                              showToast('✅ ভেরিফিকেশন আবেদন সফলভাবে জমা হয়েছে!');
                            }}
                            className="w-full py-2.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold cursor-pointer"
                          >
                            Submit Verification Request
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3. ACTION BUTTON (Facebook Categorized Action Button Picker) */}
                  {activeSettingKey === 'Action Button' && (
                    <div className="space-y-4">
                      <div className="p-3.5 rounded-2xl bg-[#F0F2F5] flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-[#65676B] uppercase">Current Active Button</span>
                          <p className="text-sm font-bold text-[#050505]">{settings.actionButtonType || 'WhatsApp'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActionBtnTypeDraft('Follow Page');
                            setActionBtnValueDraft('');
                            updatePageSettings(selectedPage.id, {
                              actionButtonType: 'Follow Page',
                              actionButtonValue: '',
                            });
                            logPageActivity(selectedPage.id, 'settings', 'Reset Action Button to Follow Page');
                            showToast('অ্যাকশন বাটন রিসেট করা হয়েছে');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white text-rose-600 text-xs font-bold border border-[#E4E6EB] cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      {[
                        {
                          group: 'Help people get in touch',
                          items: [
                            { id: 'WhatsApp', desc: 'Send WhatsApp message directly' },
                            { id: 'Send Message', desc: 'Open Page direct message' },
                            { id: 'Call Now', desc: 'Dial your Page phone number' },
                            { id: 'Send Email', desc: 'Send an email to your Page' },
                          ],
                        },
                        {
                          group: 'Reserve or Learn more',
                          items: [
                            { id: 'Book Now', desc: 'Schedule appointments / consultations' },
                            { id: 'Visit Website', desc: 'Open your website or online store' },
                            { id: 'Watch Video', desc: 'Highlight video / YouTube channel' },
                            { id: 'Follow Page', desc: 'Default Follow button' },
                          ],
                        },
                      ].map((grp) => (
                        <div key={grp.group} className="space-y-2">
                          <h4 className="text-xs font-bold text-[#65676B] uppercase tracking-wide">{grp.group}</h4>
                          {grp.items.map((btnOpt) => (
                            <button
                              key={btnOpt.id}
                              type="button"
                              onClick={() => setActionBtnTypeDraft(btnOpt.id)}
                              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer ${
                                actionBtnTypeDraft === btnOpt.id
                                  ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF]'
                                  : 'bg-white border-[#E4E6EB] text-[#050505]'
                              }`}
                            >
                              <div>
                                <span className="text-sm font-bold block">{btnOpt.id}</span>
                                <span className="text-[11px] text-[#65676B]">{btnOpt.desc}</span>
                              </div>
                              {actionBtnTypeDraft === btnOpt.id && <Check className="w-4 h-4 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      ))}

                      {actionBtnTypeDraft !== 'Follow Page' && (
                        <div>
                          <label className="block text-xs font-bold text-[#050505] mb-1">
                            Destination ({actionBtnTypeDraft})
                          </label>
                          <input
                            type="text"
                            value={actionBtnValueDraft}
                            onChange={(e) => setActionBtnValueDraft(e.target.value)}
                            placeholder={
                              actionBtnTypeDraft === 'Visit Website' ||
                              actionBtnTypeDraft === 'Watch Video' ||
                              actionBtnTypeDraft === 'Book Now'
                                ? 'https://peaceverse24.com'
                                : actionBtnTypeDraft === 'Send Email'
                                ? 'email@example.com'
                                : '+8801...'
                            }
                            className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2.5 text-xs text-[#050505]"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const updatedPage: PageItem = {
                              ...selectedPage,
                              whatsapp:
                                actionBtnTypeDraft === 'WhatsApp' && actionBtnValueDraft.trim()
                                  ? actionBtnValueDraft.trim()
                                  : selectedPage.whatsapp,
                              phone:
                                actionBtnTypeDraft === 'Call Now' && actionBtnValueDraft.trim()
                                  ? actionBtnValueDraft.trim()
                                  : selectedPage.phone,
                              email:
                                actionBtnTypeDraft === 'Send Email' && actionBtnValueDraft.trim()
                                  ? actionBtnValueDraft.trim()
                                  : selectedPage.email,
                              website:
                                (actionBtnTypeDraft === 'Visit Website' ||
                                  actionBtnTypeDraft === 'Watch Video' ||
                                  actionBtnTypeDraft === 'Book Now') &&
                                actionBtnValueDraft.trim()
                                  ? actionBtnValueDraft.trim()
                                  : selectedPage.website,
                            };
                            setSelectedPage(updatedPage);
                            setPages((prev) => prev.map((p) => (p.id === updatedPage.id ? updatedPage : p)));
                            updatePageSettings(selectedPage.id, {
                              actionButtonType: actionBtnTypeDraft,
                              actionButtonValue: actionBtnValueDraft.trim(),
                            });
                            logPageActivity(
                              selectedPage.id,
                              'settings',
                              `Updated Action Button to "${actionBtnTypeDraft}"`,
                              actionBtnValueDraft.trim()
                            );
                            showToast(`Action button "${actionBtnTypeDraft}" সেভ করা হয়েছে!`);
                          }}
                          className="py-2.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold cursor-pointer"
                        >
                          Save
                        </button>

                        {actionBtnTypeDraft === 'WhatsApp' &&
                        getWhatsAppUrl(actionBtnValueDraft || selectedPage.whatsapp || selectedPage.phone) ? (
                          <a
                            href={getWhatsAppUrl(actionBtnValueDraft || selectedPage.whatsapp || selectedPage.phone)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold flex items-center justify-center cursor-pointer"
                          >
                            Test Button
                          </a>
                        ) : actionBtnTypeDraft === 'Call Now' && (actionBtnValueDraft || selectedPage.phone) ? (
                          <a
                            href={`tel:${(actionBtnValueDraft || selectedPage.phone || '').replace(/\s+/g, '')}`}
                            className="py-2.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold flex items-center justify-center cursor-pointer"
                          >
                            Test Button
                          </a>
                        ) : actionBtnTypeDraft === 'Send Email' && (actionBtnValueDraft || selectedPage.email) ? (
                          <a
                            href={`mailto:${actionBtnValueDraft || selectedPage.email}`}
                            className="py-2.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold flex items-center justify-center cursor-pointer"
                          >
                            Test Button
                          </a>
                        ) : (actionBtnTypeDraft === 'Visit Website' ||
                            actionBtnTypeDraft === 'Watch Video' ||
                            actionBtnTypeDraft === 'Book Now') &&
                          (actionBtnValueDraft || selectedPage.website) ? (
                          <a
                            href={
                              (actionBtnValueDraft || selectedPage.website || '').startsWith('http')
                                ? actionBtnValueDraft || selectedPage.website
                                : `https://${actionBtnValueDraft || selectedPage.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold flex items-center justify-center cursor-pointer"
                          >
                            Test Button
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => showToast(`Preview: "${actionBtnTypeDraft}" অ্যাকশন সক্রিয় আছে!`)}
                            className="py-2.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold cursor-pointer"
                          >
                            Test Button
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 4. ADD HIGHLIGHTS (Facebook Featured / Highlights with Photo Upload) */}
                  {activeSettingKey === 'Add highlights' && (
                    <div className="space-y-4">
                      <div className="p-3.5 rounded-2xl border border-[#E4E6EB] space-y-2.5">
                        <h4 className="text-sm font-bold text-[#050505]">Create Page Highlight</h4>
                        <input
                          type="text"
                          value={newHighlightTitle}
                          onChange={(e) => setNewHighlightTitle(e.target.value)}
                          placeholder="হাইলাইট শিরোনাম (যেমন: গুরুত্বপূর্ণ বয়ান / নতুন আপডেট)"
                          className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505]"
                        />
                        <input
                          type="text"
                          value={newHighlightNote}
                          onChange={(e) => setNewHighlightNote(e.target.value)}
                          placeholder="সংক্ষিপ্ত বিবরণ লিখুন..."
                          className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505]"
                        />
                        <label className="w-full py-2 px-3 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] border border-dashed border-[#CED0D4] flex items-center justify-between text-xs cursor-pointer">
                          <span className="font-semibold text-[#050505]">
                            {newHighlightImage ? '🖼️ Photo attached ✓' : 'Add Highlight Photo (Optional)'}
                          </span>
                          <span className="text-[#0866FF] font-bold">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              e.target.value = '';
                              if (!file) return;
                              const check = validateMediaUpload(file, ['image']);
                              if (!check.valid) {
                                showToast(check.error || 'অবৈধ ছবি ফাইল (সর্বোচ্চ ৫ মেগাবাইট)।');
                                return;
                              }
                              try {
                                const b64 = await fileToBase64(file);
                                setNewHighlightImage(b64);
                              } catch {}
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newHighlightTitle.trim()) {
                              showToast('দয়া করে হাইলাইটের শিরোনাম লিখুন');
                              return;
                            }
                            const hlItem: PageHighlightItem = {
                              id: `hl-${Date.now()}`,
                              title: newHighlightTitle.trim(),
                              note: newHighlightNote.trim() || undefined,
                              image: newHighlightImage || undefined,
                              createdAt: 'এখনই',
                            };
                            updatePageSettings(selectedPage.id, (cur) => ({
                              ...cur,
                              highlights: [hlItem, ...(cur.highlights || [])],
                            }));
                            logPageActivity(selectedPage.id, 'settings', 'Added a Page highlight', hlItem.title);
                            setNewHighlightTitle('');
                            setNewHighlightNote('');
                            setNewHighlightImage('');
                            showToast('❤️ হাইলাইট পেজে যুক্ত করা হয়েছে!');
                          }}
                          className="w-full py-2.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold cursor-pointer"
                        >
                          + Add Highlight to Page
                        </button>
                      </div>

                      {rawPosts.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-[#65676B] uppercase">Quick Pin Post as Highlight</h4>
                          {rawPosts.slice(0, 4).map((p) => (
                            <div
                              key={p.id}
                              className="p-3 rounded-xl bg-[#F0F2F5] flex items-center justify-between gap-2"
                            >
                              <p className="text-xs text-[#050505] line-clamp-1 flex-1">{p.text}</p>
                              <button
                                type="button"
                                onClick={() => {
                                  updatePageSettings(selectedPage.id, (cur) => ({
                                    ...cur,
                                    highlights: [
                                      {
                                        id: `hl-post-${p.id}`,
                                        title: p.text.slice(0, 32),
                                        note: p.dateLabel || p.time,
                                        createdAt: p.time,
                                      },
                                      ...(cur.highlights || []).filter((h) => h.id !== `hl-post-${p.id}`),
                                    ],
                                  }));
                                  showToast('পোস্টটি হাইলাইটে যুক্ত করা হয়েছে!');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-white text-[#0866FF] text-[11px] font-bold border border-[#E4E6EB] shrink-0 cursor-pointer"
                              >
                                Highlight
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {settings.highlights.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-[#65676B] uppercase">
                            Active Highlights ({settings.highlights.length})
                          </h4>
                          {settings.highlights.map((hl) => (
                            <div
                              key={hl.id}
                              className="p-3 rounded-xl border border-[#E4E6EB] flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {hl.image && (
                                  <img
                                    src={hl.image}
                                    alt={hl.title}
                                    className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#E4E6EB]"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-[#050505] truncate">{hl.title}</p>
                                  {hl.note && <p className="text-[11px] text-[#65676B] truncate">{hl.note}</p>}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  updatePageSettings(selectedPage.id, (cur) => ({
                                    ...cur,
                                    highlights: (cur.highlights || []).filter((x) => x.id !== hl.id),
                                  }));
                                  showToast('হাইলাইট সরানো হয়েছে');
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 cursor-pointer shrink-0"
                                title="Remove highlight"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5. ARCHIVE & TRASH (Facebook Archive + 30-day Trash bin) */}
                  {activeSettingKey === 'Archive' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F0F2F5]">
                        <button
                          type="button"
                          onClick={() => setArchiveTab('archive')}
                          className={`py-2 rounded-lg text-xs font-bold cursor-pointer ${
                            archiveTab === 'archive' ? 'bg-white text-[#0866FF] shadow-2xs' : 'text-[#65676B]'
                          }`}
                        >
                          Archive ({settings.archivedPosts.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setArchiveTab('trash')}
                          className={`py-2 rounded-lg text-xs font-bold cursor-pointer ${
                            archiveTab === 'trash' ? 'bg-white text-[#0866FF] shadow-2xs' : 'text-[#65676B]'
                          }`}
                        >
                          Trash ({(settings.trashedPosts || []).length})
                        </button>
                      </div>

                      {archiveTab === 'archive' ? (
                        settings.archivedPosts.length === 0 ? (
                          <div className="p-6 rounded-2xl bg-[#F0F2F5] text-center space-y-2">
                            <Archive className="w-8 h-8 text-[#65676B] mx-auto" />
                            <p className="text-sm font-bold text-[#050505]">No archived items</p>
                            <p className="text-xs text-[#65676B]">
                              পেজের Manage posts বাটন অন করে যেকোনো পোস্টে Archive চাপলে তা এখানে সংরক্ষিত থাকবে।
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {settings.archivedPosts.map((arch) => (
                              <div
                                key={arch.id}
                                className="p-3.5 rounded-xl border border-[#E4E6EB] space-y-2 bg-white"
                              >
                                <div className="flex items-center justify-between text-[11px] text-[#65676B]">
                                  <span>Archived • {arch.archivedAt || arch.time}</span>
                                  <span>{arch.likes} likes</span>
                                </div>
                                <p className="text-xs text-[#050505] whitespace-pre-wrap">{arch.text}</p>
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updatePageSettings(selectedPage.id, (cur) => ({
                                        ...cur,
                                        archivedPosts: (cur.archivedPosts || []).filter((x) => x.id !== arch.id),
                                      }));
                                      setPagePostsList((prev) => ({
                                        ...prev,
                                        [selectedPage.id]: [
                                          {
                                            id: arch.id,
                                            text: arch.text,
                                            time: arch.time,
                                            dateLabel: arch.dateLabel,
                                            likes: arch.likes,
                                            comments: arch.comments,
                                            pinned: arch.pinned,
                                            reach: arch.reach,
                                            clicks: arch.clicks,
                                          },
                                          ...(prev[selectedPage.id] || []),
                                        ],
                                      }));
                                      logPageActivity(
                                        selectedPage.id,
                                        'archive',
                                        'Restored post from Archive',
                                        arch.text.slice(0, 60)
                                      );
                                      showToast('পোস্টটি পেজে পুনরায় প্রকাশ করা হয়েছে!');
                                    }}
                                    className="flex-1 py-2 rounded-lg bg-[#E7F3FF] text-[#0866FF] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Restore</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updatePageSettings(selectedPage.id, (cur) => ({
                                        ...cur,
                                        archivedPosts: (cur.archivedPosts || []).filter((x) => x.id !== arch.id),
                                        trashedPosts: [
                                          { ...arch, archivedAt: '30 days left' },
                                          ...(cur.trashedPosts || []),
                                        ],
                                      }));
                                      logPageActivity(selectedPage.id, 'archive', 'Moved archived post to Trash');
                                      showToast('Trash-এ সরানো হয়েছে');
                                    }}
                                    className="px-3 py-2 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold cursor-pointer"
                                  >
                                    Move to Trash
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      ) : (settings.trashedPosts || []).length === 0 ? (
                        <div className="p-6 rounded-2xl bg-[#F0F2F5] text-center space-y-2">
                          <Trash2 className="w-8 h-8 text-[#65676B] mx-auto" />
                          <p className="text-sm font-bold text-[#050505]">Trash is empty</p>
                          <p className="text-xs text-[#65676B]">
                            মুছে ফেলা পোস্ট ৩০ দিন পর্যন্ত এখানে থাকে, চাইলে আবার Restore করতে পারবেন।
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-[#65676B]">Items are automatically deleted after 30 days</p>
                            <button
                              type="button"
                              onClick={() => {
                                updatePageSettings(selectedPage.id, { trashedPosts: [] });
                                logPageActivity(selectedPage.id, 'archive', 'Emptied Page Trash');
                                showToast('Trash খালি করা হয়েছে');
                              }}
                              className="text-xs font-bold text-rose-600 cursor-pointer"
                            >
                              Empty Trash
                            </button>
                          </div>
                          {(settings.trashedPosts || []).map((tr) => (
                            <div
                              key={tr.id}
                              className="p-3.5 rounded-xl border border-[#E4E6EB] space-y-2 bg-white"
                            >
                              <div className="flex items-center justify-between text-[11px] text-[#65676B]">
                                <span className="text-amber-700 font-semibold">{tr.archivedAt || '30 days left'}</span>
                                <span>{tr.likes} likes</span>
                              </div>
                              <p className="text-xs text-[#050505] whitespace-pre-wrap">{tr.text}</p>
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    updatePageSettings(selectedPage.id, (cur) => ({
                                      ...cur,
                                      trashedPosts: (cur.trashedPosts || []).filter((x) => x.id !== tr.id),
                                    }));
                                    setPagePostsList((prev) => ({
                                      ...prev,
                                      [selectedPage.id]: [
                                        {
                                          id: tr.id,
                                          text: tr.text,
                                          time: tr.time,
                                          dateLabel: tr.dateLabel,
                                          likes: tr.likes,
                                          comments: tr.comments,
                                          pinned: tr.pinned,
                                          reach: tr.reach,
                                          clicks: tr.clicks,
                                        },
                                        ...(prev[selectedPage.id] || []),
                                      ],
                                    }));
                                    logPageActivity(selectedPage.id, 'archive', 'Restored post from Trash', tr.text.slice(0, 60));
                                    showToast('পোস্টটি Restore করা হয়েছে!');
                                  }}
                                  className="flex-1 py-2 rounded-lg bg-[#E7F3FF] text-[#0866FF] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Restore</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updatePageSettings(selectedPage.id, (cur) => ({
                                      ...cur,
                                      trashedPosts: (cur.trashedPosts || []).filter((x) => x.id !== tr.id),
                                    }));
                                    logPageActivity(selectedPage.id, 'archive', 'Permanently deleted post');
                                    showToast('স্থায়ীভাবে মুছে ফেলা হয়েছে');
                                  }}
                                  className="px-3 py-2 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold cursor-pointer"
                                >
                                  Delete Permanently
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 6. POSTS AND TAGS (Facebook Page and Tagging 4 sections) */}
                  {activeSettingKey === 'Posts and tags' && (
                    <div className="space-y-4">
                      <div className="space-y-2.5">
                        <h4 className="text-sm font-bold text-[#050505]">Viewing and sharing</h4>
                        <div className="p-3.5 rounded-2xl border border-[#E4E6EB] space-y-2">
                          <p className="text-xs font-bold text-[#050505]">Who can post on your Page?</p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'admins', label: 'Only Admins' },
                              { id: 'everyone', label: 'Everyone' },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  updatePageSettings(selectedPage.id, { whoCanPost: opt.id as any });
                                  logPageActivity(selectedPage.id, 'settings', `Set who can post to ${opt.label}`);
                                  showToast(`Who can post: ${opt.label}`);
                                }}
                                className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer ${
                                  settings.whoCanPost === opt.id
                                    ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF]'
                                    : 'bg-[#F0F2F5] border-transparent text-[#050505]'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl border border-[#E4E6EB] space-y-2">
                          <p className="text-xs font-bold text-[#050505]">Who can see what others post on your Page?</p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'everyone', label: 'Everyone' },
                              { id: 'admins', label: 'Only Admins' },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  updatePageSettings(selectedPage.id, { whoCanSeeOthersPosts: opt.id as any });
                                  logPageActivity(selectedPage.id, 'settings', `Visitor posts visible to: ${opt.label}`);
                                  showToast(`Visibility: ${opt.label}`);
                                }}
                                className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer ${
                                  settings.whoCanSeeOthersPosts === opt.id
                                    ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF]'
                                    : 'bg-[#F0F2F5] border-transparent text-[#050505]'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F0F2F5] cursor-pointer">
                          <div>
                            <p className="text-xs font-bold text-[#050505]">Allow comments on Page posts</p>
                            <p className="text-[11px] text-[#65676B]">পেজের সব পোস্টে ভিজিটররা মন্তব্য করতে পারবে</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.allowComments}
                            onChange={(e) =>
                              updatePageSettings(selectedPage.id, { allowComments: e.target.checked })
                            }
                            className="w-4 h-4 accent-[#0866FF]"
                          />
                        </label>
                      </div>

                      <div className="space-y-2.5">
                        <h4 className="text-sm font-bold text-[#050505]">Tagging &amp; Reviewing</h4>

                        <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F0F2F5] cursor-pointer">
                          <div>
                            <p className="text-xs font-bold text-[#050505]">Allow others to mention &amp; tag this Page</p>
                            <p className="text-[11px] text-[#65676B]">অন্যান্য ইউজার @{selectedPage.name} মেনশন করতে পারবে</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.allowMentions}
                            onChange={(e) => {
                              updatePageSettings(selectedPage.id, { allowMentions: e.target.checked });
                              logPageActivity(
                                selectedPage.id,
                                'settings',
                                e.target.checked ? 'Allowed mentions & tagging' : 'Restricted mentions & tagging'
                              );
                            }}
                            className="w-4 h-4 accent-[#0866FF]"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F0F2F5] cursor-pointer">
                          <div>
                            <p className="text-xs font-bold text-[#050505]">
                              Review tags people add to your posts before appearing
                            </p>
                            <p className="text-[11px] text-[#65676B]">ট্যাগ করা পোস্ট প্রকাশের আগে অ্যাডমিন রিভিউ করবে</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.reviewTagsBeforeShowing}
                            onChange={(e) =>
                              updatePageSettings(selectedPage.id, { reviewTagsBeforeShowing: e.target.checked })
                            }
                            className="w-4 h-4 accent-[#0866FF]"
                          />
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowPageSettings(false);
                          setActiveSettingKey(null);
                          setPageSubTab('mentions');
                        }}
                        className="w-full py-2.5 rounded-lg bg-[#E4E6EB] text-[#050505] text-xs font-bold cursor-pointer"
                      >
                        Go to Mentions Tab
                      </button>
                    </div>
                  )}

                  {/* 7. CONNECTED EXPERIENCES (Facebook Linked Accounts) */}
                  {activeSettingKey === 'Connected experiences' && (
                    <div className="space-y-3">
                      <p className="text-xs text-[#65676B]">
                        WhatsApp, Phone, Email, Website, IMO এবং Viber অ্যাকাউন্ট পেজের সাথে যুক্ত ও পরিচালনা করুন:
                      </p>

                      {[
                        { label: 'WhatsApp Business / Personal', val: connWhatsapp, set: setConnWhatsapp, ph: '+8801...' },
                        { label: 'Official Phone Number', val: connPhone, set: setConnPhone, ph: '+8801...' },
                        { label: 'Business Email Address', val: connEmail, set: setConnEmail, ph: 'contact@example.com' },
                        { label: 'Official Website URL', val: connWebsite, set: setConnWebsite, ph: 'https://...' },
                        { label: 'IMO Account', val: connImo, set: setConnImo, ph: '+8801...' },
                        { label: 'Viber Account', val: connViber, set: setConnViber, ph: '+8801...' },
                      ].map((field) => (
                        <div key={field.label} className="p-3 rounded-xl border border-[#E4E6EB] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-[#050505]">{field.label}</label>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold ${
                                  field.val.trim() ? 'text-emerald-600' : 'text-[#65676B]'
                                }`}
                              >
                                {field.val.trim() ? 'Connected ✓' : 'Not linked'}
                              </span>
                              {field.val.trim() && (
                                <button
                                  type="button"
                                  onClick={() => field.set('')}
                                  className="text-[10px] font-bold text-rose-600 cursor-pointer"
                                >
                                  Disconnect
                                </button>
                              )}
                            </div>
                          </div>
                          <input
                            type="text"
                            value={field.val}
                            onChange={(e) => field.set(e.target.value)}
                            placeholder={field.ph}
                            className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-[#050505]"
                          />
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          const updatedPage: PageItem = {
                            ...selectedPage,
                            whatsapp: connWhatsapp.trim() || undefined,
                            phone: connPhone.trim() || undefined,
                            email: connEmail.trim() || undefined,
                            website: connWebsite.trim() || undefined,
                            imo: connImo.trim() || undefined,
                            viber: connViber.trim() || undefined,
                          };
                          setSelectedPage(updatedPage);
                          setPages((prev) => prev.map((p) => (p.id === updatedPage.id ? updatedPage : p)));
                          syncUpdatedPageToSwitchedStorage(updatedPage);
                          logPageActivity(selectedPage.id, 'settings', 'Updated Connected experiences');
                          showToast('✅ Connected accounts সফলভাবে সেভ হয়েছে!');
                        }}
                        className="w-full py-2.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold cursor-pointer"
                      >
                        Save Connected Accounts
                      </button>
                    </div>
                  )}

                  {/* 8. ADMINS / PAGE ACCESS (Facebook New Pages Experience 3-Tier Access) */}
                  {activeSettingKey === 'Admins' && (
                    <div className="space-y-4">
                      {/* Section 1: People with Facebook access */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-[#050505]">People with Page access</h4>
                        <p className="text-[11px] text-[#65676B]">
                          যাদের ফুল বা পারশিয়াল কন্ট্রোল থাকবে তারা সরাসরি পেজে সুইচ করে পোস্ট, মেসেজ, অ্যাড ও সেটিংস ম্যানেজ করতে পারবে।
                        </p>

                        <div className="p-3.5 rounded-xl bg-[#F0F2F5] flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-[#050505]">
                              {userProfile?.name || 'Page Owner'}
                            </p>
                            <p className="text-xs text-[#65676B]">Primary Owner • Full control</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                            Owner
                          </span>
                        </div>

                        {settings.admins
                          .filter((a) => a.role === 'Full control' || a.role === 'Partial control')
                          .map((adm) => (
                            <div
                              key={adm.id}
                              className="p-3 rounded-xl border border-[#E4E6EB] flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#050505] truncate">{adm.name}</p>
                                <p className="text-[11px] text-[#65676B] truncate">
                                  {adm.role} • {adm.contact}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  updatePageSettings(selectedPage.id, (cur) => ({
                                    ...cur,
                                    admins: (cur.admins || []).filter((x) => x.id !== adm.id),
                                  }));
                                  logPageActivity(selectedPage.id, 'settings', `Removed access for ${adm.name}`);
                                  showToast(`${adm.name} কে সরানো হয়েছে`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 text-[11px] font-bold shrink-0 cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                      </div>

                      {/* Section 2: People with task access */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-[#050505]">People with task access</h4>
                        <p className="text-[11px] text-[#65676B]">
                          টাস্ক অ্যাক্সেস থাকলে পেজ প্রোফাইলে সুইচ না করেই কন্টেন্ট, অ্যাড ও ইনসাইটস পরিচালনা করতে পারবে।
                        </p>
                        {settings.admins.filter((a) => a.role === 'Task access').length === 0 ? (
                          <p className="text-xs text-[#65676B] py-1">No task access members added yet.</p>
                        ) : (
                          settings.admins
                            .filter((a) => a.role === 'Task access')
                            .map((adm) => (
                              <div
                                key={adm.id}
                                className="p-3 rounded-xl border border-[#E4E6EB] flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-[#050505] truncate">{adm.name}</p>
                                  <p className="text-[11px] text-[#65676B] truncate">Task access • {adm.contact}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updatePageSettings(selectedPage.id, (cur) => ({
                                      ...cur,
                                      admins: (cur.admins || []).filter((x) => x.id !== adm.id),
                                    }));
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 text-[11px] font-bold shrink-0 cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            ))
                        )}
                      </div>

                      {/* Section 3: Community managers */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-[#050505]">Community managers</h4>
                        <p className="text-[11px] text-[#65676B]">
                          কমেন্ট মডারেট করা, লাইভ চ্যাট ও স্প্যাম রিমুভ করার জন্য।
                        </p>
                        {settings.admins.filter((a) => a.role === 'Community manager').length === 0 ? (
                          <p className="text-xs text-[#65676B] py-1">No community managers added yet.</p>
                        ) : (
                          settings.admins
                            .filter((a) => a.role === 'Community manager')
                            .map((adm) => (
                              <div
                                key={adm.id}
                                className="p-3 rounded-xl border border-[#E4E6EB] flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-[#050505] truncate">{adm.name}</p>
                                  <p className="text-[11px] text-[#65676B] truncate">
                                    Community manager • {adm.contact}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updatePageSettings(selectedPage.id, (cur) => ({
                                      ...cur,
                                      admins: (cur.admins || []).filter((x) => x.id !== adm.id),
                                    }));
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 text-[11px] font-bold shrink-0 cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            ))
                        )}
                      </div>

                      {/* Add New Person Form */}
                      <div className="p-3.5 rounded-2xl border border-[#E4E6EB] space-y-2.5">
                        <h4 className="text-xs font-bold text-[#050505]">+ Add New Page Access</h4>
                        <input
                          type="text"
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                          placeholder="নাম লিখুন..."
                          className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505]"
                        />
                        <input
                          type="text"
                          value={newAdminContact}
                          onChange={(e) => setNewAdminContact(e.target.value)}
                          placeholder="ইমেইল বা ফোন নম্বর..."
                          className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505]"
                        />
                        <select
                          value={newAdminRole}
                          onChange={(e) => setNewAdminRole(e.target.value as any)}
                          className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505]"
                        >
                          <option value="Full control">Facebook access (Full control)</option>
                          <option value="Partial control">Facebook access (Partial control)</option>
                          <option value="Task access">Task access (Content, Ads &amp; Insights)</option>
                          <option value="Community manager">Community manager (Moderate comments)</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newAdminName.trim()) {
                              showToast('নাম লিখুন');
                              return;
                            }
                            const member: PageAdminMember = {
                              id: `adm-${Date.now()}`,
                              name: newAdminName.trim(),
                              contact: newAdminContact.trim() || 'Peaceverse User',
                              role: newAdminRole,
                              addedAt: 'এখনই',
                            };
                            updatePageSettings(selectedPage.id, (cur) => ({
                              ...cur,
                              admins: [...(cur.admins || []), member],
                            }));
                            logPageActivity(selectedPage.id, 'settings', `Added ${member.name} as ${member.role}`);
                            setNewAdminName('');
                            setNewAdminContact('');
                            showToast(`✅ ${member.name} কে ${member.role} হিসেবে যুক্ত করা হয়েছে!`);
                          }}
                          className="w-full py-2.5 rounded-lg bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
                        >
                          Give Access
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 9. SETTINGS & PRIVACY (Facebook Page Settings inner sub-menu + all 6 real sub-screens) */}
                  {activeSettingKey === 'Settings & privacy' && (
                    privacySubView === 'setup' ? (
                      <div className="space-y-4">
                        <div className="p-3.5 rounded-xl bg-[#F0F2F5] flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#050505]">Page Visibility</p>
                            <p className="text-[11px] text-[#65676B]">
                              {settings.isPublished ? 'Published (Public)' : 'Unpublished (Private draft)'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const nextPub = !settings.isPublished;
                              updatePageSettings(selectedPage.id, { isPublished: nextPub });
                              logPageActivity(
                                selectedPage.id,
                                'settings',
                                nextPub ? 'Published Page publicly' : 'Unpublished Page (Draft)'
                              );
                              showToast(nextPub ? 'পেজটি পাবলিক করা হয়েছে' : 'পেজটি আনপাবলিশ করা হয়েছে');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                              settings.isPublished ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                            }`}
                          >
                            {settings.isPublished ? 'Published' : 'Unpublished'}
                          </button>
                        </div>

                        <div className="space-y-2.5 p-3.5 rounded-2xl border border-[#E4E6EB]">
                          <label className="block text-xs font-bold text-[#050505]">Page Name</label>
                          <input
                            type="text"
                            value={setupNameDraft}
                            onChange={(e) => setSetupNameDraft(e.target.value)}
                            className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505]"
                          />
                          <label className="block text-xs font-bold text-[#050505]">Page Bio / Intro</label>
                          <textarea
                            rows={2}
                            value={setupBioDraft}
                            onChange={(e) => setSetupBioDraft(e.target.value)}
                            className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl p-2.5 text-xs text-[#050505]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!setupNameDraft.trim()) return;
                              const cleanBio = sanitizePageBioValue(setupBioDraft);
                              const upd = {
                                ...selectedPage,
                                name: setupNameDraft.trim(),
                                bio: cleanBio,
                                description: cleanBio,
                              };
                              persistUpdatedPage(upd);
                              logPageActivity(selectedPage.id, 'settings', 'Updated Page setup details');
                              showToast('Page setup সেভ করা হয়েছে!');
                            }}
                            className="w-full py-2.5 rounded-lg bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
                          >
                            Save Page Setup
                          </button>
                        </div>
                      </div>
                    ) : privacySubView === 'privacy' ? (
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F0F2F5] cursor-pointer">
                          <div>
                            <p className="text-xs font-bold text-[#050505]">Allow direct messages to Page</p>
                            <p className="text-[11px] text-[#65676B]">ভিজিটররা পেজে সরাসরি মেসেজ পাঠাতে পারবে</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.allowDirectMessages}
                            onChange={(e) =>
                              updatePageSettings(selectedPage.id, { allowDirectMessages: e.target.checked })
                            }
                            className="w-4 h-4 accent-[#0866FF]"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F0F2F5] cursor-pointer">
                          <div>
                            <p className="text-xs font-bold text-[#050505]">
                              Allow search engines outside to link to your Page
                            </p>
                            <p className="text-[11px] text-[#65676B]">সার্চ ইঞ্জিনে পেজ খুঁজে পাওয়া যাবে</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.searchEngineVisible}
                            onChange={(e) =>
                              updatePageSettings(selectedPage.id, { searchEngineVisible: e.target.checked })
                            }
                            className="w-4 h-4 accent-[#0866FF]"
                          />
                        </label>
                      </div>
                    ) : privacySubView === 'notifications' ? (
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F0F2F5] cursor-pointer">
                          <div>
                            <p className="text-xs font-bold text-[#050505]">Notify all followers on post</p>
                            <p className="text-[11px] text-[#65676B]">পোস্ট করলে সকল ফলোয়ারের কাছে নোটিফিকেশন যাবে</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={creatorPrefs.creatorNotifyFollowersOnPost}
                            onChange={(e) =>
                              updateCreatorPref({ creatorNotifyFollowersOnPost: e.target.checked })
                            }
                            className="w-4 h-4 accent-[#0866FF]"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F0F2F5] cursor-pointer">
                          <div>
                            <p className="text-xs font-bold text-[#050505]">Push notifications to all users</p>
                            <p className="text-[11px] text-[#65676B]">সকল ইউজারের ডিভাইসে পুশ নোটিফিকেশন পাঠান</p>
                          </div>
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
                    ) : privacySubView === 'blocking' ? (
                      <div className="space-y-3">
                        <p className="text-xs text-[#65676B]">
                          ব্লক করা ইউজাররা আপনার পেজে কমেন্ট করতে বা মেসেজ পাঠাতে পারবে না:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newBlockedUserName}
                            onChange={(e) => setNewBlockedUserName(e.target.value)}
                            placeholder="ইউজারের নাম লিখুন..."
                            className="flex-1 bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const u = newBlockedUserName.trim();
                              if (!u) return;
                              updatePageSettings(selectedPage.id, (cur) => ({
                                ...cur,
                                blockedUsers: Array.from(new Set([...(cur.blockedUsers || []), u])),
                              }));
                              setNewBlockedUserName('');
                              logPageActivity(selectedPage.id, 'settings', `Blocked user ${u}`);
                              showToast(`${u} কে ব্লক করা হয়েছে`);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
                          >
                            Block
                          </button>
                        </div>

                        {(settings.blockedUsers || []).length === 0 ? (
                          <p className="text-xs text-[#65676B] text-center py-4">কোনো ইউজার ব্লক করা নেই।</p>
                        ) : (
                          <div className="space-y-2">
                            {(settings.blockedUsers || []).map((bu) => (
                              <div
                                key={bu}
                                className="p-3 rounded-xl border border-[#E4E6EB] flex items-center justify-between"
                              >
                                <span className="text-xs font-bold text-[#050505]">{bu}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updatePageSettings(selectedPage.id, (cur) => ({
                                      ...cur,
                                      blockedUsers: (cur.blockedUsers || []).filter((x) => x !== bu),
                                    }))
                                  }
                                  className="text-xs font-bold text-[#0866FF] cursor-pointer"
                                >
                                  Unblock
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : privacySubView === 'info' ? (
                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-[#F0F2F5] space-y-1">
                          <h4 className="text-sm font-bold text-[#050505]">Download Page Information</h4>
                          <p className="text-xs text-[#65676B]">
                            আপনার পেজের সকল পোস্ট, ইভেন্ট, সেটিংস ও অ্যাক্টিভিটির ব্যাকআপ JSON ফাইল হিসেবে ডাউনলোড করুন।
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              const payload = {
                                page: selectedPage,
                                posts: rawPosts,
                                events: pageEventsList[selectedPage.id] || [],
                                settings,
                                exportedAt: new Date().toISOString(),
                              };
                              const blob = new Blob([JSON.stringify(payload, null, 2)], {
                                type: 'application/json',
                              });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${selectedPage.name.replace(/\s+/g, '-').toLowerCase()}-page-data.json`;
                              a.click();
                              URL.revokeObjectURL(url);
                              logPageActivity(selectedPage.id, 'settings', 'Downloaded Page information export');
                              showToast('📥 পেজের তথ্য ডাউনলোড হয়েছে!');
                            } catch {
                              showToast('এক্সপোর্ট করতে সমস্যা হয়েছে');
                            }
                          }}
                          className="w-full py-2.5 rounded-lg bg-[#0866FF] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download JSON Archive</span>
                        </button>
                      </div>
                    ) : privacySubView === 'deletion' ? (
                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl border border-[#E4E6EB] space-y-2">
                          <h4 className="text-sm font-bold text-[#050505]">Deactivate Page (সাময়িক বন্ধ)</h4>
                          <p className="text-xs text-[#65676B]">
                            সাময়িকভাবে পেজটি লুকিয়ে রাখুন; চাইলে যেকোনো সময় আবার Publish করতে পারবেন।
                          </p>
                          <button
                            type="button"
                            disabled={pageLifecycleBusy}
                            onClick={async () => {
                              const nextPub = selectedPage.isPublished === false || selectedPage.status === 'deactivated'
                                ? true
                                : !settings.isPublished;
                              setPageLifecycleBusy(true);
                              try {
                                updatePageSettings(selectedPage.id, { isPublished: nextPub });
                                const updatedPage: PageItem = {
                                  ...selectedPage,
                                  isPublished: nextPub,
                                  status: nextPub ? 'active' : 'deactivated',
                                  deletionScheduledAt: undefined,
                                  deletionExecuteAt: undefined,
                                };
                                persistUpdatedPage(updatedPage);
                                await deactivatePageInFirestore(selectedPage.id, nextPub);
                                logPageActivity(
                                  selectedPage.id,
                                  'settings',
                                  nextPub ? 'Reactivated Page' : 'Deactivated Page temporarily'
                                );
                                showToast(
                                  nextPub
                                    ? 'পেজটি পুনরায় সক্রিয় হয়েছে!'
                                    : 'পেজটি সাময়িকভাবে ডিঅ্যাক্টিভেট করা হয়েছে (পাবলিক সার্চ থেকে লুকানো)।'
                                );
                              } finally {
                                setPageLifecycleBusy(false);
                              }
                            }}
                            className="w-full py-2.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold cursor-pointer disabled:opacity-60"
                          >
                            {selectedPage.status === 'deactivated' || selectedPage.isPublished === false || !settings.isPublished
                              ? 'Reactivate Page Now'
                              : 'Deactivate Page Temporarily'}
                          </button>
                        </div>

                        {selectedPage.status === 'pending_deletion' ? (
                          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5">
                            <h4 className="text-sm font-bold text-amber-900">
                              পেজ ডিলিট শিডিউল করা রয়েছে ({PAGE_DELETION_GRACE_DAYS} দিনের নিয়ম)
                            </h4>
                            <p className="text-xs text-amber-800 leading-relaxed">
                              এই পেজটি{' '}
                              <strong>
                                {selectedPage.deletionExecuteAt
                                  ? new Date(selectedPage.deletionExecuteAt).toLocaleDateString('bn-BD', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    })
                                  : `${PAGE_DELETION_GRACE_DAYS} দিন পর`}
                              </strong>{' '}
                              স্থায়ীভাবে ডিলিট হবে। চাইলে এখনই বাতিল করে পেজটি ফিরিয়ে আনতে পারেন।
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <button
                                type="button"
                                disabled={pageLifecycleBusy}
                                onClick={async () => {
                                  setPageLifecycleBusy(true);
                                  try {
                                    await cancelPageDeletionInFirestore(selectedPage.id);
                                    updatePageSettings(selectedPage.id, { isPublished: true });
                                    persistUpdatedPage({
                                      ...selectedPage,
                                      isPublished: true,
                                      status: 'active',
                                      deletionScheduledAt: undefined,
                                      deletionExecuteAt: undefined,
                                    });
                                    showToast(`"${selectedPage.name}" পেজ ডিলিট বাতিল করা হয়েছে!`);
                                  } finally {
                                    setPageLifecycleBusy(false);
                                  }
                                }}
                                className="py-2 rounded-lg bg-[#0866FF] hover:bg-[#166FE5] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                              >
                                ডিলিট বাতিল করুন (Cancel Deletion)
                              </button>
                              <button
                                type="button"
                                disabled={pageLifecycleBusy}
                                onClick={async () => {
                                  const delId = selectedPage.id;
                                  const delName = selectedPage.name;
                                  setPageLifecycleBusy(true);
                                  try {
                                    await permanentlyDeletePageFromFirestore(delId);
                                    setConfirmDeletePage(false);
                                    setShowPageSettings(false);
                                    setActiveSettingKey(null);
                                    setSelectedPage(null);
                                    setPages((prev) => {
                                      const next = prev.filter((p) => p.id !== delId);
                                      try {
                                        localStorage.setItem('qalby_fb_pages', JSON.stringify(next));
                                      } catch {}
                                      return next;
                                    });
                                    syncUpdatedPageToSwitchedStorage(null, delId);
                                    showToast(`"${delName}" পেজটি চিরতরে মুছে ফেলা হয়েছে`);
                                  } finally {
                                    setPageLifecycleBusy(false);
                                  }
                                }}
                                className="py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                              >
                                এখনই চিরতরে মুছুন
                              </button>
                            </div>
                          </div>
                        ) : !confirmDeletePage ? (
                          <button
                            type="button"
                            onClick={() => {
                              setDeletePageMode('schedule_14d');
                              setConfirmDeletePage(true);
                            }}
                            className="w-full py-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold cursor-pointer"
                          >
                            Delete Page permanently (Facebook নিয়ম)
                          </button>
                        ) : (
                          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2.5">
                            <p className="text-xs font-bold text-rose-900">
                              &ldquo;{selectedPage.name}&rdquo; পেজ ডিলিট অপশন নির্বাচন করুন:
                            </p>

                            <div className="space-y-1.5">
                              <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E4E6EB] cursor-pointer">
                                <input
                                  type="radio"
                                  name="page-delete-mode"
                                  checked={deletePageMode === 'schedule_14d'}
                                  onChange={() => setDeletePageMode('schedule_14d')}
                                  className="mt-0.5 accent-[#0866FF]"
                                />
                                <span className="text-[11px] text-[#1C1E21]">
                                  <strong className="block">১৪ দিন পর স্থায়ী ডিলিট (Facebook নিয়ম — প্রস্তাবিত)</strong>
                                  পেজটি এখনই অদৃশ্য হবে, তবে ১৪ দিনের মধ্যে চাইলে ডিলিট বাতিল করতে পারবেন।
                                </span>
                              </label>
                              <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E4E6EB] cursor-pointer">
                                <input
                                  type="radio"
                                  name="page-delete-mode"
                                  checked={deletePageMode === 'immediate'}
                                  onChange={() => setDeletePageMode('immediate')}
                                  className="mt-0.5 accent-rose-600"
                                />
                                <span className="text-[11px] text-[#1C1E21]">
                                  <strong className="block text-rose-700">এখনই স্থায়ীভাবে মুছুন</strong>
                                  অপেক্ষা ছাড়াই পেজ ও পেজের সব পোস্ট সাথে সাথে ডিলিট হবে।
                                </span>
                              </label>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                disabled={pageLifecycleBusy}
                                onClick={() => setConfirmDeletePage(false)}
                                className="py-2 rounded-lg bg-white border border-[#E4E6EB] text-[#050505] text-xs font-bold cursor-pointer disabled:opacity-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={pageLifecycleBusy}
                                onClick={async () => {
                                  const delId = selectedPage.id;
                                  const delName = selectedPage.name;
                                  setPageLifecycleBusy(true);
                                  try {
                                    if (deletePageMode === 'schedule_14d') {
                                      const { deletionExecuteAt, deletionScheduledAt } =
                                        await schedulePageDeletionInFirestore(delId);
                                      updatePageSettings(delId, { isPublished: false });
                                      const updated: PageItem = {
                                        ...selectedPage,
                                        isPublished: false,
                                        status: 'pending_deletion',
                                        deletionScheduledAt,
                                        deletionExecuteAt,
                                      };
                                      setPages((prev) => {
                                        const next = prev.map((p) => (p.id === delId ? updated : p));
                                        try {
                                          localStorage.setItem('qalby_fb_pages', JSON.stringify(next));
                                        } catch {}
                                        return next;
                                      });
                                      syncUpdatedPageToSwitchedStorage(null, delId);
                                      setConfirmDeletePage(false);
                                      setShowPageSettings(false);
                                      setActiveSettingKey(null);
                                      setSelectedPage(null);
                                      showToast(
                                        `"${delName}" ১৪ দিনের জন্য ডিলিট শিডিউল করা হয়েছে (চাইলে বাতিল করতে পারবেন)`
                                      );
                                    } else {
                                      await permanentlyDeletePageFromFirestore(delId);
                                      setConfirmDeletePage(false);
                                      setShowPageSettings(false);
                                      setActiveSettingKey(null);
                                      setSelectedPage(null);
                                      setPages((prev) => {
                                        const next = prev.filter((p) => p.id !== delId);
                                        try {
                                          localStorage.setItem('qalby_fb_pages', JSON.stringify(next));
                                        } catch {}
                                        return next;
                                      });
                                      syncUpdatedPageToSwitchedStorage(null, delId);
                                      showToast(`"${delName}" পেজটি স্থায়ীভাবে মুছে ফেলা হয়েছে`);
                                    }
                                  } finally {
                                    setPageLifecycleBusy(false);
                                  }
                                }}
                                className="py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                              >
                                {pageLifecycleBusy
                                  ? 'অপেক্ষা করুন...'
                                  : deletePageMode === 'schedule_14d'
                                  ? 'Schedule Delete'
                                  : 'Confirm Delete'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {[
                          {
                            id: 'setup',
                            title: 'Page setup',
                            sub: `Name, Bio • ${settings.isPublished ? 'Published' : 'Unpublished Draft'}`,
                            icon: Building,
                          },
                          {
                            id: 'privacy',
                            title: 'Privacy',
                            sub: 'Messaging, search engines & audience',
                            icon: Shield,
                          },
                          {
                            id: 'notifications',
                            title: 'Notifications',
                            sub: 'Creator Broadcast, follower & push alerts',
                            icon: Bell,
                          },
                          {
                            id: 'blocking',
                            title: 'Blocking',
                            sub: `${(settings.blockedUsers || []).length} blocked profiles`,
                            icon: Users,
                          },
                          {
                            id: 'info',
                            title: 'Your Page information',
                            sub: 'Download a copy of your Page data',
                            icon: Download,
                          },
                          {
                            id: 'deletion',
                            title: 'Deactivation and deletion',
                            sub: 'Temporarily deactivate or permanently delete Page',
                            icon: Trash2,
                          },
                        ].map((row) => {
                          const RowIcon = row.icon;
                          return (
                            <button
                              key={row.id}
                              type="button"
                              onClick={() => setPrivacySubView(row.id as any)}
                              className="w-full py-3 px-2 rounded-xl hover:bg-[#F0F2F5] flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3.5">
                                <RowIcon className="w-5 h-5 text-[#050505] shrink-0" />
                                <div>
                                  <p className="text-[15px] font-semibold text-[#050505]">{row.title}</p>
                                  <p className="text-[12px] text-[#65676B]">{row.sub}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-[#65676B] shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    )
                  )}

                  {/* 10. INVITE PEOPLE TO CONNECT */}
                  {activeSettingKey === 'Invite people to connect' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-[#65676B]">
                          বন্ধুদের {selectedPage.name} পেজ ফলো করার আমন্ত্রণ পাঠান ({settings.invitedNames.length} invited)
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            updatePageSettings(selectedPage.id, { invitedNames: [...INVITABLE_CONTACTS] });
                            logPageActivity(selectedPage.id, 'invite', 'Invited all suggested friends');
                            showToast('সকলকে আমন্ত্রণ পাঠানো হয়েছে!');
                          }}
                          className="px-3 py-1 rounded-lg bg-[#E7F3FF] text-[#0866FF] text-xs font-bold shrink-0 cursor-pointer"
                        >
                          Invite All
                        </button>
                      </div>

                      <input
                        type="text"
                        value={inviteSearch}
                        onChange={(e) => setInviteSearch(e.target.value)}
                        placeholder="বন্ধুর নাম খুঁজুন..."
                        className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505]"
                      />

                      <div className="space-y-2">
                        {filteredInviteContacts.map((friendName) => {
                          const isInvited = settings.invitedNames.includes(friendName);
                          return (
                            <div
                              key={friendName}
                              className="p-2.5 rounded-xl border border-[#E4E6EB] flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center font-bold text-xs">
                                  {friendName.charAt(0)}
                                </div>
                                <span className="text-xs font-bold text-[#050505]">{friendName}</span>
                              </div>
                              <button
                                type="button"
                                disabled={isInvited}
                                onClick={() => {
                                  updatePageSettings(selectedPage.id, (cur) => ({
                                    ...cur,
                                    invitedNames: [...(cur.invitedNames || []), friendName],
                                  }));
                                  logPageActivity(selectedPage.id, 'invite', `Invited ${friendName} to like Page`);
                                  showToast(`${friendName} কে ইনভাইট পাঠানো হয়েছে!`);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                                  isInvited
                                    ? 'bg-[#E4E6EB] text-[#65676B]'
                                    : 'bg-[#0866FF] text-white hover:bg-[#1877F2]'
                                }`}
                              >
                                {isInvited ? 'Invited ✓' : 'Invite'}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: `Follow ${selectedPage.name}`,
                              url: pageShareUrl,
                            }).catch(() => {});
                          } else {
                            try {
                              navigator.clipboard?.writeText(pageShareUrl);
                            } catch {}
                            showToast('ইনভাইট লিংক কপি হয়েছে!');
                          }
                        }}
                        className="w-full py-2.5 rounded-lg bg-[#E4E6EB] text-[#050505] text-xs font-bold cursor-pointer"
                      >
                        Share External Invite Link
                      </button>
                    </div>
                  )}

                  {/* 11. SHARE PAGE */}
                  {activeSettingKey === 'Share Page' && (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl bg-[#F0F2F5] space-y-1">
                        <p className="text-sm font-bold text-[#050505]">{selectedPage.name}</p>
                        <p className="text-xs text-[#65676B] line-clamp-2">
                          {selectedPage.bio || selectedPage.description || selectedPage.category}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const todayStr = new Date().toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          });
                          setPagePostsList((prev) => ({
                            ...prev,
                            [selectedPage.id]: [
                              {
                                id: `share-${Date.now()}`,
                                text: `📢 Follow & Share ${selectedPage.name}: ${selectedPage.bio || selectedPage.category}`,
                                time: 'এখনই',
                                dateLabel: todayStr,
                                likes: 1,
                                comments: 0,
                                reach: 165,
                                clicks: 18,
                              },
                              ...(prev[selectedPage.id] || []),
                            ],
                          }));
                          logPageActivity(selectedPage.id, 'post', 'Shared Page update as post');
                          showToast('📢 পেজটি পোস্ট হিসেবে শেয়ার করা হয়েছে!');
                        }}
                        className="w-full py-2.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold cursor-pointer"
                      >
                        Share to Feed (Page Update Post)
                      </button>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Follow ${selectedPage.name} on Peaceverse24: ${pageShareUrl}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          logPageActivity(selectedPage.id, 'invite', 'Shared Page on WhatsApp');
                        }}
                        className="w-full py-2.5 rounded-lg bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <WhatsAppBrandIcon className="w-4 h-4 text-white" />
                        <span>Send via WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: selectedPage.name,
                              text: selectedPage.bio || selectedPage.name,
                              url: pageShareUrl,
                            }).catch(() => {});
                          } else {
                            try {
                              navigator.clipboard?.writeText(pageShareUrl);
                            } catch {}
                            showToast('শেয়ার লিংক কপি হয়েছে!');
                          }
                        }}
                        className="w-full py-2.5 rounded-lg bg-[#E4E6EB] text-[#050505] text-xs font-bold cursor-pointer"
                      >
                        More Share Options / Copy Link
                      </button>
                    </div>
                  )}

                  {/* 12. PAGE LINK */}
                  {activeSettingKey === 'Page link' && (
                    <div className="space-y-3.5">
                      <div className="p-3.5 rounded-2xl bg-[#F0F2F5] space-y-1.5">
                        <span className="text-[11px] font-bold text-[#65676B] uppercase">Direct Page URL</span>
                        <p className="text-xs font-semibold text-[#0866FF] break-all">{pageShareUrl}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#050505] mb-1">
                          Custom Page Username (@handle)
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#65676B]">@</span>
                          <input
                            type="text"
                            value={customSlugDraft}
                            onChange={(e) => setCustomSlugDraft(e.target.value.replace(/\s+/g, ''))}
                            placeholder="akherath24"
                            className="flex-1 bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-[#050505]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            updatePageSettings(selectedPage.id, { customSlug: customSlugDraft.trim() });
                            logPageActivity(selectedPage.id, 'settings', `Updated Page handle to @${customSlugDraft.trim()}`);
                            showToast(`@${customSlugDraft.trim()} হ্যান্ডেল সেভ হয়েছে!`);
                          }}
                          className="py-2.5 rounded-lg bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
                        >
                          Save Handle
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              navigator.clipboard?.writeText(pageShareUrl);
                            } catch {}
                            showToast('🔗 Page link কপি করা হয়েছে!');
                          }}
                          className="py-2.5 rounded-lg bg-[#E4E6EB] text-[#050505] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 13. ACTIVITY LOG (Facebook Manage Activity with Filters & Archive/Trash links) */}
                  {activeSettingKey === 'Activity log' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F0F2F5]">
                        <button
                          type="button"
                          onClick={() => {
                            setArchiveTab('archive');
                            setActiveSettingKey('Archive');
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-white text-xs font-bold text-[#050505] border border-[#E4E6EB] cursor-pointer"
                        >
                          Archive ({settings.archivedPosts.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setArchiveTab('trash');
                            setActiveSettingKey('Archive');
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-white text-xs font-bold text-[#050505] border border-[#E4E6EB] cursor-pointer"
                        >
                          Trash ({(settings.trashedPosts || []).length})
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-1.5">
                          {[
                            { id: 'all', label: 'All' },
                            { id: 'post', label: 'Posts' },
                            { id: 'settings', label: 'Settings' },
                            { id: 'archive', label: 'Archive & Trash' },
                            { id: 'invite', label: 'Invites' },
                          ].map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setActivityFilter(f.id as any)}
                              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer ${
                                activityFilter === f.id
                                  ? 'bg-[#E7F3FF] text-[#0866FF]'
                                  : 'bg-[#F0F2F5] text-[#65676B]'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>

                        {filteredLog.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              updatePageSettings(selectedPage.id, { activityLog: [] });
                              showToast('অ্যাক্টিভিটি লগ পরিষ্কার করা হয়েছে');
                            }}
                            className="text-[11px] font-bold text-rose-600 shrink-0 cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {filteredLog.length === 0 && rawPosts.length === 0 ? (
                        <p className="text-xs text-[#65676B] py-6 text-center">
                          এখনো কোনো অ্যাক্টিভিটি রেকর্ড নেই।
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {filteredLog.map((act) => (
                            <div key={act.id} className="p-3 rounded-xl bg-[#F0F2F5] text-xs space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-[#050505]">{act.title}</span>
                                <span className="text-[10px] text-[#65676B] shrink-0">{act.time}</span>
                              </div>
                              {act.detail && (
                                <p className="text-[11px] text-[#65676B] line-clamp-2">{act.detail}</p>
                              )}
                            </div>
                          ))}
                          {activityFilter === 'all' &&
                            filteredLog.length === 0 &&
                            rawPosts.map((p) => (
                              <div key={p.id} className="p-3 rounded-xl bg-[#F0F2F5] text-xs space-y-1">
                                <p className="font-bold text-[#050505] line-clamp-2">Post: {p.text}</p>
                                <p className="text-[11px] text-[#65676B]">
                                  {p.dateLabel || p.time} • {p.likes} likes
                                </p>
                              </div>
                            ))}
                        </div>
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
                          onClick={() => openSetting(item.label)}
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
                      onClick={() => openSetting('Invite people to connect')}
                      className="w-full py-3 px-1 flex items-center gap-4 hover:bg-[#F0F2F5] rounded-xl text-left transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-6 h-6 text-[#050505] shrink-0 stroke-[1.9]" />
                      <span className="text-[16px] font-medium text-[#050505]">
                        Invite people to connect
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openSetting('Share Page')}
                      className="w-full py-3 px-1 flex items-center gap-4 hover:bg-[#F0F2F5] rounded-xl text-left transition-colors cursor-pointer"
                    >
                      <Share2 className="w-6 h-6 text-[#050505] shrink-0 stroke-[1.9]" />
                      <span className="text-[16px] font-medium text-[#050505]">Share Page</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openSetting('Page link')}
                      className="w-full py-3 px-1 flex items-center gap-4 hover:bg-[#F0F2F5] rounded-xl text-left transition-colors cursor-pointer"
                    >
                      <Link2 className="w-6 h-6 text-[#050505] shrink-0 stroke-[1.9]" />
                      <span className="text-[16px] font-medium text-[#050505]">Page link</span>
                    </button>
                  </div>

                  {/* View Section */}
                  <div className="space-y-1">
                    <h3 className="text-[19px] font-bold text-[#050505] mb-2">View</h3>

                    {selectedPage.isOwner && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowPageSettings(false);
                          setActiveSettingKey(null);
                          setViewAsVisitor(true);
                          showToast('Visitor হিসেবে পেজ প্রিভিউ চালু হয়েছে');
                        }}
                        className="w-full py-3 px-1 flex items-center gap-4 hover:bg-[#F0F2F5] rounded-xl text-left transition-colors cursor-pointer"
                      >
                        <Eye className="w-6 h-6 text-[#050505] shrink-0 stroke-[1.9]" />
                        <span className="text-[16px] font-medium text-[#050505]">View as visitor</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowPageSettings(false);
                        setPageSubTab('all');
                        setPageSearchOpen(true);
                      }}
                      className="w-full py-3 px-1 flex items-center gap-4 hover:bg-[#F0F2F5] rounded-xl text-left transition-colors cursor-pointer"
                    >
                      <Search className="w-6 h-6 text-[#050505] shrink-0 stroke-[1.9]" />
                      <span className="text-[16px] font-medium text-[#050505]">Search this Page</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openSetting('Activity log')}
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
          );
        })()}

        {/* White Facebook Native Switch to Page Bottom Sheet */}
        <FbSwitchToPageSheet
          isOpen={Boolean(sheetPage)}
          onClose={() => setSheetPage(null)}
          page={sheetPage}
          onConfirmSwitch={(page) => {
            if (onSwitchToPage) onSwitchToPage(page, { stayInPage: true });
            setSheetPage(null);
            showToast(`"${page.name}" পেজ মোডে সুইচ করা হয়েছে`);
          }}
          onViewPageWithoutSwitch={() => {
            setSheetPage(null);
          }}
          onEditPage={(page) => {
            handleOpenEditModal(page);
          }}
        />

        {/* Floating Toast Notification inside Page View */}
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[160] bg-[#1877F2] text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-bottom-2">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        )}
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
                {filteredManagedPages.map((page) => {
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
                          {page.status === 'pending_deletion' ? (
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[12px] font-semibold text-rose-600">
                                ডিলিট শিডিউল করা (১৪ দিন)
                              </span>
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await cancelPageDeletionInFirestore(page.id);
                                  updatePageSettings(page.id, { isPublished: true });
                                  const restored: PageItem = {
                                    ...page,
                                    isPublished: true,
                                    status: 'active',
                                    deletionScheduledAt: undefined,
                                    deletionExecuteAt: undefined,
                                  };
                                  setPages((prev) => {
                                    const next = prev.map((p) => (p.id === page.id ? restored : p));
                                    try {
                                      localStorage.setItem('qalby_fb_pages', JSON.stringify(next));
                                    } catch {}
                                    return next;
                                  });
                                  showToast(`"${page.name}" পেজের ডিলিট বাতিল হয়েছে!`);
                                }}
                                className="px-2 py-0.5 rounded bg-[#E7F3FF] text-[#0866FF] text-[11px] font-bold cursor-pointer"
                              >
                                Cancel Deletion
                              </button>
                            </div>
                          ) : page.status === 'deactivated' || page.isPublished === false ? (
                            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-700 mt-0.5">
                              <span>Deactivated (Hidden)</span>
                            </div>
                          ) : (
                            <div className="text-[12px] text-[#65676B] mt-0.5 truncate">
                              {page.category || 'Page'} · {(page.followersCount || 0).toLocaleString()} followers
                            </div>
                          )}
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

          {/* SECTION 1.5: Public Pages Search Results (when searching inside Pages Hub) */}
          {searchQuery.trim().length > 0 &&
            remoteHubPages.filter((rp) => !managedPages.some((mp) => mp.id === rp.id)).length > 0 && (
              <>
                <div className="h-[1px] bg-[#E4E6EB] mx-4" />
                <section className="px-4 pt-4 pb-4">
                  <h2 className="text-[18px] font-bold text-[#050505] mb-3">
                    Pages matching &ldquo;{searchQuery.trim()}&rdquo;
                  </h2>
                  <div className="space-y-3">
                    {remoteHubPages
                      .filter((rp) => !managedPages.some((mp) => mp.id === rp.id))
                      .map((rp) => {
                        const isFollowed = isTargetFollowedLocally(rp.id, rp.name);
                        return (
                          <div key={rp.id} className="flex items-center justify-between gap-3 py-1">
                            <button
                              type="button"
                              onClick={() => {
                                try {
                                  localStorage.setItem('peaceverse_visited_page_v1', JSON.stringify(rp));
                                } catch {}
                                setSelectedPage({ ...rp, isLiked: isFollowed });
                              }}
                              className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                            >
                              {rp.avatar ? (
                                <img
                                  src={rp.avatar}
                                  alt={rp.name}
                                  className="w-12 h-12 rounded-full object-cover shrink-0 bg-[#E4E6EB]"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full shrink-0 bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center font-bold text-lg">
                                  {rp.name.trim().charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-[15px] font-bold text-[#050505] truncate">
                                  {rp.name}
                                </p>
                                <p className="text-[12px] text-[#65676B] truncate">
                                  {rp.category} · {(rp.followersCount || 1).toLocaleString()} followers
                                </p>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleLike(rp.id)}
                              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold shrink-0 cursor-pointer ${
                                isFollowed
                                  ? 'bg-[#E7F3FF] text-[#1877F2]'
                                  : 'bg-[#1877F2] hover:bg-[#166FE5] text-white'
                              }`}
                            >
                              {isFollowed ? 'Following' : '+ Follow'}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </section>
              </>
            )}

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
                              const nextFollowed = !isFollowed;
                              setTargetFollowedLocally(nextFollowed, sp.id, sp.name);
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
          setSelectedPage(page);
          if (onSwitchToPage) onSwitchToPage(page, { stayInPage: true });
          setSheetPage(null);
          showToast(`"${page.name}" পেজ মোডে সুইচ করা হয়েছে`);
        }}
        onViewPageWithoutSwitch={(page) => {
          setSheetPage(null);
          setSelectedPage(page);
        }}
      />
    </div>
  );
};
