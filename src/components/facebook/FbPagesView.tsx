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

interface FbPagesViewProps {
  onBack: () => void;
  userProfile?: UserProfile;
  onSwitchToPage?: (page: PageItem) => void;
  embedded?: boolean;
  onBroadcastNotification?: (notif: NotificationItem) => void;
  initialSelectedPageId?: string | null;
}

const FOLLOWER_PREVIEW_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
];

const DEMO_PAGE_IDS = [
  'page-sharif-story',
  'page-sf-mart',
  'page-halal-bites',
  'page-angel-mahi',
  'page-noor-academy',
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
    iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    cardBg: 'bg-gradient-to-r from-[#1e293b] to-[#1e2330] hover:from-[#253347] hover:to-[#242b3b]',
    borderClass: 'border-amber-500/30 hover:border-amber-400/50',
  },
  {
    value: 'Education (দ্বীনি ও কুরআন শিক্ষা)',
    nameBangla: 'দ্বীনি ও কুরআন শিক্ষা প্রতিষ্ঠান',
    nameEnglish: 'Education & Quran Academy',
    icon: BookOpen,
    iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    cardBg: 'bg-gradient-to-r from-[#132e2b]/80 to-[#1e293b] hover:from-[#173a36] hover:to-[#253347]',
    borderClass: 'border-emerald-500/30 hover:border-emerald-400/50',
  },
  {
    value: 'Public Figure (ইসলামিক বক্তা / আলোচক)',
    nameBangla: 'ইসলামিক আলোচক ও ব্যক্তিত্ব',
    nameEnglish: 'Public Figure & Speaker',
    icon: UserCheck,
    iconBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
    cardBg: 'bg-gradient-to-r from-[#172554]/70 to-[#1e293b] hover:from-[#1e3a8a]/60 hover:to-[#253347]',
    borderClass: 'border-sky-500/30 hover:border-sky-400/50',
  },
  {
    value: 'Creator (কন্টেন্ট ক্রিয়েটর)',
    nameBangla: 'ডিজিটাল কনটেন্ট ক্রিয়েটর',
    nameEnglish: 'Video & Content Creator',
    icon: Sparkles,
    iconBg: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    cardBg: 'bg-gradient-to-r from-[#3b0764]/50 to-[#1e293b] hover:from-[#581c87]/50 hover:to-[#253347]',
    borderClass: 'border-purple-500/30 hover:border-purple-400/50',
  },
  {
    value: 'Nonprofit & Charity (চ্যারিটি ও সেবা)',
    nameBangla: 'চ্যারিটি ও সমাজসেবা সংগঠন',
    nameEnglish: 'Nonprofit & Charity Org',
    icon: HeartHandshake,
    iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    cardBg: 'bg-gradient-to-r from-[#4c0519]/50 to-[#1e293b] hover:from-[#881337]/50 hover:to-[#253347]',
    borderClass: 'border-rose-500/30 hover:border-rose-400/50',
  },
  {
    value: 'Mosque & Community (মসজিদ ও সমাজ)',
    nameBangla: 'মসজিদ ও ইসলামিক সমাজ',
    nameEnglish: 'Mosque & Islamic Center',
    icon: Building,
    iconBg: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
    cardBg: 'bg-gradient-to-r from-[#042f2e]/60 to-[#1e293b] hover:from-[#115e59]/50 hover:to-[#253347]',
    borderClass: 'border-teal-500/30 hover:border-teal-400/50',
  },
  {
    value: 'Food & Restaurant (হালাল খাদ্য)',
    nameBangla: 'হালাল রেস্টুরেন্ট ও ফুড শপ',
    nameEnglish: 'Food & Halal Restaurant',
    icon: Utensils,
    iconBg: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    cardBg: 'bg-gradient-to-r from-[#431407]/50 to-[#1e293b] hover:from-[#7c2d12]/50 hover:to-[#253347]',
    borderClass: 'border-orange-500/30 hover:border-orange-400/50',
  },
  {
    value: 'Media & News (সংবাদ ও সংস্কৃতি)',
    nameBangla: 'মিডিয়া ও সংবাদ প্রকাশনা',
    nameEnglish: 'Media & News Publishing',
    icon: Radio,
    iconBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    cardBg: 'bg-gradient-to-r from-[#1e1b4b]/60 to-[#1e293b] hover:from-[#312e81]/60 hover:to-[#253347]',
    borderClass: 'border-blue-500/30 hover:border-blue-400/50',
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
  embedded = false,
  onBroadcastNotification,
  initialSelectedPageId,
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

  // Tab filters (only user's pages: সব পেজ & আপনার পরিচালিত)
  const [activeTab, setActiveTab] = useState<'all' | 'manage'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState<PageItem | null>(() => {
    if (!initialSelectedPageId) return null;
    return pages.find((p) => p.id === initialSelectedPageId) || null;
  });

  useEffect(() => {
    if (initialSelectedPageId) {
      const found = pages.find((p) => p.id === initialSelectedPageId);
      if (found) setSelectedPage(found);
    }
  }, [initialSelectedPageId, pages]);

  const [pageSearchOpen, setPageSearchOpen] = useState(false);
  const [pageSearchQuery, setPageSearchQuery] = useState('');

  // Dedicated Landing Page Creation State
  const [showCreatePageLanding, setShowCreatePageLanding] = useState(false);
  const [sheetPage, setSheetPage] = useState<PageItem | null>(null);

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
  const [pageSubTab, setPageSubTab] = useState<'posts' | 'about' | 'monetization' | 'photos' | 'reviews'>('posts');
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);
  const [pagePostText, setPagePostText] = useState('');
  const [pagePostsList, setPagePostsList] = useState<
    Record<string, Array<{ id: string; text: string; time: string; likes: number; comments: number }>>
  >({});

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

    const newPost = {
      id: `pp-${Date.now()}`,
      text: pagePostText.trim(),
      time: 'এখনই',
      likes: 1,
      comments: 0,
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

  // Filtered pages (only user-created pages)
  const filteredPages = pages.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (activeTab === 'manage') return Boolean(p.isOwner);
    return true;
  });

  const managedPages = pages.filter((p) => Boolean(p.isOwner));

  // -------------------------------------------------------------
  // DEDICATED FULL-SCREEN LANDING VIEW FOR CREATING A FACEBOOK PAGE
  // -------------------------------------------------------------
  if (showCreatePageLanding) {
    return (
      <FbCreatePageLandingView
        onBack={() => setShowCreatePageLanding(false)}
        onPageCreated={(newPage) => {
          setPages((prev) => [newPage, ...prev]);
          setShowCreatePageLanding(false);
          setSelectedPage(newPage);
          showToast(`🎉 "${newPage.name}" পেজটি সফলভাবে তৈরি ও সংরক্ষিত হয়েছে!`);
        }}
        onCreateFirstPost={(newPage) => {
          setPages((prev) => [newPage, ...prev]);
          setShowCreatePageLanding(false);
          setSelectedPage(newPage);
          setPageSubTab('posts');
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
    const followedByList =
      selectedPage.followedBy && selectedPage.followedBy.length > 0
        ? selectedPage.followedBy
        : ['Abul Baser', 'Hassan Abdullah', 'MD Oli Ullah'];

    return (
      <div className="max-w-[700px] mx-auto min-h-screen bg-white text-[#050505] pb-24 font-sans">
        {/* 1. Top Navigation: < Back, Search icon, 3 dots, Share icon */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-2.5 h-[52px] flex items-center justify-between border-b border-[#E4E6EB]">
          <button
            type="button"
            onClick={() => {
              setPageSearchOpen(false);
              setPageSearchQuery('');
              setSelectedPage(null);
            }}
            className="min-w-[44px] min-h-[44px] rounded-full hover:bg-[#F0F2F5] active:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
            title="Back"
            aria-label="Back to pages"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
          </button>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setPageSearchOpen((prev) => !prev)}
              className="min-w-[44px] min-h-[44px] rounded-full hover:bg-[#F0F2F5] active:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
              title="Search in page"
              aria-label="Search in page"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>

            <button
              type="button"
              onClick={() => setSheetPage(selectedPage)}
              className="min-w-[44px] min-h-[44px] rounded-full hover:bg-[#F0F2F5] active:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
              title="More options & Switch to Page"
              aria-label="Page options"
            >
              <MoreHorizontal className="w-5 h-5 stroke-[2.2]" />
            </button>

            <button
              type="button"
              onClick={() => {
                try {
                  navigator.clipboard?.writeText(
                    `${window.location.origin}/?tab=pages&pageId=${selectedPage.id}`
                  );
                } catch {}
                showToast(`${selectedPage.name} পেজের লিংক কপি করা হয়েছে!`);
              }}
              className="min-w-[44px] min-h-[44px] rounded-full hover:bg-[#F0F2F5] active:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
              title="Share page"
              aria-label="Share page"
            >
              <Share2 className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Inline Page Search Bar */}
        {pageSearchOpen && (
          <div className="px-4 py-2.5 bg-[#F0F2F5] border-b border-[#E4E6EB] flex items-center gap-2">
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

        {/* 2. Cover Photo: Big Clear Gray Placeholder if empty, or Full-Width Cover Photo */}
        <div className="relative w-full h-48 sm:h-56 bg-[#E4E6EB] border-b border-[#D8DADF] overflow-hidden flex items-center justify-center">
          {selectedPage.cover ? (
            <>
              <img
                src={selectedPage.cover}
                alt={selectedPage.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/30 to-black/55" />

              {/* Text Overlay on Cover Image */}
              <div className="absolute inset-0 flex items-center justify-center px-6 pb-6 pointer-events-none">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white/95 text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                  {selectedPage.name}
                </span>
              </div>

              {selectedPage.isOwner && (
                <label className="absolute bottom-3 right-3 bg-white/95 hover:bg-white text-[#050505] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md border border-[#E4E6EB] transition-all active:scale-95">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Edit cover</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpdatePageCover}
                  />
                </label>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center px-4 pb-8">
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
        </div>

        {/* 3. Profile Photo / Logo: Clear Gray Circle with "+ লোগো যোগ করুন (Add Logo)" if empty */}
        <div className="relative -mt-16 flex justify-center z-10 px-4">
          <div className="relative">
            {selectedPage.avatar ? (
              <div className="w-32 h-32 rounded-full border-4 border-white ring-[3px] ring-[#0866FF] shadow-lg bg-[#E4E6EB] overflow-hidden relative">
                <img
                  src={selectedPage.avatar}
                  alt={selectedPage.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <label
                className="w-32 h-32 rounded-full border-4 border-white ring-[3px] ring-[#0866FF] shadow-lg bg-[#E4E6EB] hover:bg-[#D8DADF] flex flex-col items-center justify-center text-center px-2 cursor-pointer transition-colors"
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

        {/* 4. Centered Profile Title, Stats, Bio, Category & 5. Followed by & 6. Two 50/50 Buttons */}
        <div className="px-4 pt-3 pb-4 bg-white">
          <div className="text-center space-y-1.5">
            {/* Title */}
            <h1 className="text-[22px] sm:text-[24px] font-extrabold text-[#050505] tracking-tight inline-flex items-center justify-center gap-1.5">
              <span>{selectedPage.name}</span>
              <ShieldCheck className="w-4 h-4 text-[#0866FF] shrink-0" />
            </h1>

            {/* Stats: 18 followers · 47 following */}
            <p className="text-[14px] text-[#65676B] font-medium tabular-nums">
              <span className="font-bold text-[#050505]">
                {selectedPage.followersCount.toLocaleString('en-US')}
              </span>{' '}
              followers ·{' '}
              <span className="font-bold text-[#050505]">
                {(selectedPage.followingCount ?? 47).toLocaleString('en-US')}
              </span>{' '}
              following
            </p>

            {/* Bio */}
            {(selectedPage.bio || selectedPage.description) && (
              <p className="text-[14px] text-[#050505] leading-relaxed max-w-md mx-auto pt-1">
                {selectedPage.bio || selectedPage.description}
              </p>
            )}

            {/* Category: ■ Personal blog */}
            <div className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#65676B] pt-0.5">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#65676B] inline-block shrink-0" />
              <span>{selectedPage.category}</span>
            </div>
          </div>

          {/* 5. Followed by Row: 3 small circular avatars + text */}
          <div className="flex items-center justify-center gap-2 pt-3 pb-3.5">
            <div className="flex items-center shrink-0">
              {FOLLOWER_PREVIEW_AVATARS.map((av, idx) => (
                <img
                  key={idx}
                  src={av}
                  alt="Follower"
                  className={`w-6 h-6 rounded-full object-cover border-2 border-white bg-[#E4E6EB] ${
                    idx > 0 ? '-ml-1.5' : ''
                  }`}
                />
              ))}
            </div>
            <p className="text-[12.5px] text-[#65676B] leading-snug">
              Followed by{' '}
              <span className="font-semibold text-[#050505]">{followedByList[0]}</span>,{' '}
              <span className="font-semibold text-[#050505]">{followedByList[1]}</span>,{' '}
              <span className="font-semibold text-[#050505]">{followedByList[2]}</span> and 1 other
            </p>
          </div>

          {/* 6. Two Equal 50% Action Buttons: [🔵 Follow] & [⚪ WhatsApp] */}
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
                onClick={() => {
                  if (selectedPage.isOwner) {
                    handleOpenEditModal(selectedPage);
                    showToast('পেজের WhatsApp নম্বর যুক্ত করুন');
                  } else {
                    showToast('এই পেজে এখনো WhatsApp নম্বর যুক্ত করা হয়নি');
                  }
                }}
                className="h-10 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] active:scale-[0.98] text-[#050505] font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <WhatsAppBrandIcon className="w-4 h-4 text-[#25D366]" />
                <span>WhatsApp</span>
              </button>
            )}
          </div>

          {/* Subtle Switch / Edit Controls Strip for Page Admins */}
          <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-[#E4E6EB]">
            <button
              type="button"
              onClick={() => setSheetPage(selectedPage)}
              className="flex-1 py-2 px-3 rounded-lg bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#0866FF]" />
              <span>Switch to {selectedPage.name}</span>
            </button>
            {selectedPage.isOwner && (
              <button
                type="button"
                onClick={() => handleOpenEditModal(selectedPage)}
                className="py-2 px-3.5 rounded-lg bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#65676B]" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>

        {/* Clean White Sub Navigation Tabs */}
        <div className="bg-white border-y border-[#E4E6EB] px-2 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'posts', label: 'Posts' },
            { id: 'about', label: 'About' },
            { id: 'photos', label: 'Photos' },
            { id: 'monetization', label: 'Earnings' },
            { id: 'reviews', label: 'Reviews' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPageSubTab(tab.id as any)}
              className={`flex-1 py-3 px-3 text-[13px] font-bold border-b-[3px] transition-all whitespace-nowrap cursor-pointer ${
                pageSubTab === tab.id
                  ? 'border-[#0866FF] text-[#0866FF]'
                  : 'border-transparent text-[#65676B] hover:bg-[#F0F2F5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Light Facebook Content Feed Canvas */}
        <div className="bg-[#F0F2F5] p-3 space-y-3 min-h-[360px]">
          {/* POSTS TAB CONTENT */}
          {pageSubTab === 'posts' && (
            <div className="space-y-3">
              {/* Creator Broadcast Notification Settings (Compact White Card) */}
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

              {/* Owner Write Post Composer */}
              {selectedPage.isOwner && (
                <div className="bg-white rounded-xl border border-[#E4E6EB] p-3.5 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    {selectedPage.avatar ? (
                      <img
                        src={selectedPage.avatar}
                        alt={selectedPage.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#E4E6EB] bg-[#E4E6EB]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#E7F3FF] text-[#0866FF] border border-[#0866FF]/30 flex items-center justify-center font-extrabold text-sm shrink-0">
                        {selectedPage.name.trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#050505]">
                        {selectedPage.name} হিসেবে পোস্ট করুন
                      </p>
                      <span className="text-[11px] text-[#65676B]">Public • Page Post</span>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={pagePostText}
                    onChange={(e) => setPagePostText(e.target.value)}
                    placeholder="পেজের ফলোয়ারদের উদ্দেশ্যে কিছু লিখুন..."
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl p-3 text-xs sm:text-sm text-[#050505] placeholder-[#65676B] focus:outline-none focus:border-[#0866FF] resize-none"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => showToast('ফটো যোগ করা হয়েছে')}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-[#F0F2F5] text-emerald-600 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-xs font-semibold text-[#050505]">Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePublishPagePost}
                      disabled={!pagePostText.trim()}
                      className="px-4 py-1.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Feed of Posts for this Page */}
              <div className="space-y-3">
                {activePosts.length === 0 ? (
                  <div className="bg-white rounded-xl p-6 text-center border border-[#E4E6EB]">
                    <Flag className="w-8 h-8 text-[#65676B] mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-[#65676B]">এই পেজে এখনও কোনো পোস্ট নেই।</p>
                  </div>
                ) : (
                  activePosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-xl border border-[#E4E6EB] p-3.5 space-y-2.5 shadow-2xs"
                    >
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
                          <p className="text-[11px] text-[#65676B]">{post.time} • 🌐</p>
                        </div>
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
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ABOUT TAB */}
          {pageSubTab === 'about' && (
            <div className="bg-white rounded-xl border border-[#E4E6EB] p-4 space-y-3.5 shadow-2xs">
              <h3 className="text-sm font-bold text-[#050505]">About {selectedPage.name}</h3>
              <div className="space-y-3 text-xs text-[#050505]">
                <div>
                  <span className="text-[11px] font-semibold text-[#65676B] block">Bio</span>
                  <p className="mt-0.5 leading-relaxed">{selectedPage.bio || selectedPage.description}</p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#65676B] block">Category</span>
                  <p className="mt-0.5 font-semibold">{selectedPage.category}</p>
                </div>
                {selectedPage.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#65676B]" />
                    <span>{selectedPage.location}</span>
                  </div>
                )}
                {(selectedPage.whatsapp || selectedPage.phone) && (
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <WhatsAppBrandIcon className="w-4 h-4 text-[#25D366]" />
                    <span>
                      {selectedPage.whatsapp || selectedPage.phone} (wa.me/{normalizePhoneNumber(selectedPage.whatsapp || selectedPage.phone)})
                    </span>
                  </div>
                )}
                {selectedPage.imo && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-sky-600" />
                    <button
                      type="button"
                      onClick={() => openDeepLinkWithFallback(getImoDeepLink(selectedPage.imo)!, 'https://imo.im/')}
                      className="text-sky-600 font-semibold hover:underline cursor-pointer"
                    >
                      IMO: {selectedPage.imo}
                    </button>
                  </div>
                )}
                {selectedPage.viber && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-600" />
                    <button
                      type="button"
                      onClick={() => openDeepLinkWithFallback(getViberDeepLink(selectedPage.viber)!, 'https://www.viber.com/')}
                      className="text-purple-600 font-semibold hover:underline cursor-pointer"
                    >
                      Viber: {selectedPage.viber}
                    </button>
                  </div>
                )}
                {selectedPage.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#0866FF]" />
                    <a
                      href={selectedPage.website.startsWith('http') ? selectedPage.website : `https://${selectedPage.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0866FF] font-semibold hover:underline"
                    >
                      {selectedPage.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

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

          {/* MONETIZATION & CREATOR STUDIO TAB */}
          {pageSubTab === 'monetization' && (
            <div className="bg-white rounded-xl border border-[#E4E6EB] p-4 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-200">
                    ৳
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#050505]">ক্রিয়েটর ইন-স্ট্রিম মনিটাইজেশন</h3>
                    <p className="text-[11px] text-emerald-700">শরিয়াহ সম্মত ৫৫% ক্রিয়েটর রেভিনিউ শেয়ার</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedPage.followersCount >= 5000 ? 'Active' : 'Eligible'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#F0F2F5] p-3 rounded-xl">
                  <span className="text-[10px] text-[#65676B] block">উত্তোলনযোগ্য ব্যালেন্স</span>
                  <span className="text-base font-bold text-emerald-700 tabular-nums">৳৯,৫০০</span>
                </div>
                <div className="bg-[#F0F2F5] p-3 rounded-xl">
                  <span className="text-[10px] text-[#65676B] block">মোট অর্জিত আয়</span>
                  <span className="text-base font-bold text-[#050505] tabular-nums">৳২৪,৫০০</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMonetizationModal(true)}
                className="w-full py-2.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>Payout Studio (PayPal / bKash / Bank)</span>
              </button>
            </div>
          )}

          {/* REVIEWS TAB */}
          {pageSubTab === 'reviews' && (
            <div className="bg-white rounded-xl border border-[#E4E6EB] p-4 space-y-3 shadow-2xs">
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
  // MAIN PAGES HUB (Genuine Clean White Facebook Style)
  // -------------------------------------------------------------
  return (
    <div
      className={
        embedded
          ? 'space-y-3.5 p-3.5 pb-12 rounded-2xl bg-white text-[#050505]'
          : 'max-w-[700px] mx-auto min-h-screen bg-white text-[#050505] pb-24 px-3.5 py-3 space-y-3.5 font-sans'
      }
    >
      {/* 1. Simple White Header with Back button & Single "+ পেজ খুলুন (Create)" Button */}
      {!embedded && (
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E4E6EB]">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="min-w-[40px] min-h-[40px] rounded-full hover:bg-[#F0F2F5] active:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <div className="min-w-0">
              <h1 className="font-extrabold text-[20px] text-[#050505] leading-tight">Pages</h1>
              <p className="text-[12px] text-[#65676B] truncate">
                পেইজ ব্যবস্থাপনা ও ইসলামিক কমিউনিটি
              </p>
            </div>
          </div>

          {/* Single Create Page Button */}
          <button
            type="button"
            onClick={() => setShowCreatePageLanding(true)}
            className="px-3.5 py-2 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] active:scale-[0.98] text-xs font-bold text-white transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>পেজ খুলুন (Create)</span>
          </button>
        </div>
      )}

      {/* 2. Simple Gray Search Box */}
      <div className="relative">
        <input
          type="text"
          placeholder="পেইজ খুঁজুন (নাম বা ক্যাটাগরি)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#F0F2F5] border border-transparent focus:border-[#0866FF]/40 focus:bg-white rounded-full pl-10 pr-9 py-2.5 text-[13px] text-[#050505] placeholder-[#65676B] focus:outline-none transition-colors"
        />
        <Search className="w-4 h-4 text-[#65676B] absolute left-3.5 top-1/2 -translate-y-1/2" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65676B] hover:text-[#050505] text-xs font-bold px-1 cursor-pointer"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* 3. Simple 2 Tabs Only: সব পেজ + আপনার পরিচালিত */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: `সব পেজ (${pages.length})` },
          { id: 'manage', label: `আপনার পরিচালিত (${managedPages.length})` },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'all' | 'manage')}
              className={`px-3.5 py-2 rounded-full text-[13px] whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#E7F3FF] text-[#0866FF] font-bold'
                  : 'bg-[#F0F2F5] text-[#050505] hover:bg-[#E4E6EB] font-semibold'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. User Created Pages List Only (No Demo Pages, Clean White Facebook List) */}
      <div className="space-y-2.5 pt-1">
        <h2 className="text-[15px] font-bold text-[#050505]">
          আপনার পরিচালিত পেইজসমূহ ({filteredPages.length})
        </h2>

        {filteredPages.length === 0 ? (
          <div className="bg-[#F0F2F5] rounded-xl p-6 text-center space-y-2.5 border border-[#E4E6EB]">
            <Flag className="w-8 h-8 text-[#65676B] mx-auto opacity-60" />
            <p className="text-sm font-bold text-[#050505]">
              {searchQuery ? 'কোনো পেইজ খুঁজে পাওয়া যায়নি' : 'আপনি এখনো কোনো পেইজ তৈরি করেননি'}
            </p>
            <p className="text-xs text-[#65676B]">
              {searchQuery
                ? 'অন্য নাম লিখে খুঁজে দেখুন অথবা নতুন পেইজ তৈরি করুন।'
                : 'আপনার নিজস্ব ব্যবসা, ব্লগ বা কমিউনিটি পেইজ খুলতে নিচের বাটনে ক্লিক করুন।'}
            </p>
            <button
              type="button"
              onClick={() => setShowCreatePageLanding(true)}
              className="px-4 py-2 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs cursor-pointer transition-colors"
            >
              + পেজ খুলুন (Create)
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPages.map((page) => (
              <div
                key={page.id}
                onClick={() => setSelectedPage(page)}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-[#E4E6EB] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {page.avatar ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[#E4E6EB] bg-[#E4E6EB]">
                      <img
                        src={page.avatar}
                        alt={page.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full shrink-0 border border-dashed border-[#0866FF]/60 bg-[#E4E6EB] text-[#050505] flex flex-col items-center justify-center">
                      <Camera className="w-4 h-4 text-[#0866FF]" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-[15px] text-[#050505] truncate">
                        {page.name}
                      </p>
                      <ShieldCheck className="w-4 h-4 text-[#0866FF] shrink-0" />
                    </div>
                    <p className="text-[12px] text-[#65676B] truncate">
                      {page.category} · <span className="text-emerald-600 font-semibold">Active</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPage(page);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] active:scale-[0.98] text-[13px] font-bold text-white transition-all shrink-0 cursor-pointer"
                >
                  সুইচ করুন
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FACEBOOK CREATE PAGE WIZARD MODAL */}
      {/* ------------------------------------------------------------- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#242526] w-full max-w-lg rounded-2xl border border-[#393a3b] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-[#393a3b] flex items-center justify-between bg-[#242526]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#1877F2]/20 text-[#1877F2]">
                  <Flag className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">নতুন পেজ তৈরি করুন (Create Page)</h3>
                  <p className="text-[10px] text-[#b0b3b8]">ধাপ {createStep} / ৩</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="w-full bg-[#18191a] h-1.5">
              <div
                className="bg-[#1877F2] h-full transition-all duration-300"
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
              className="p-4 overflow-y-auto space-y-4 flex-1"
            >
              {/* STEP 1: Basic Info */}
              {createStep === 1 && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs text-blue-200">
                    💡 <span className="font-bold">পেজ কী?</span> পেজ হলো এমন একটি প্ল্যাটফর্ম যেখানে আপনার দ্বীনি প্রতিষ্ঠান, ব্যবসা, ইউটিউব চ্যানেল বা ব্যক্তিত্বের মাধ্যমে মানুষের সাথে প্রকাশ্যে যুক্ত হতে পারেন।
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      পেজের নাম (Page Name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: SF MART BD / Peace Mart Global / Halal Food Kitchen"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2] transition-colors"
                    />
                    <p className="text-[11px] text-[#94a3b8] mt-1">
                      আপনার প্রতিষ্ঠান বা উদ্যোগের নাম ব্যবহার করুন।
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-white">
                        ক্যাটাগরি নির্বাচন করুন <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-sky-400 font-semibold">
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
                            className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer shadow-sm ${
                              isSelected
                                ? 'bg-gradient-to-r from-[#1877F2] via-blue-600 to-sky-600 border-white/50 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/50'
                                : `${item.cardBg} ${item.borderClass} text-white`
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
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
                                    isSelected ? 'text-blue-100' : 'text-slate-300'
                                  }`}
                                >
                                  {item.nameEnglish}
                                </p>
                              </div>
                            </div>

                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                                isSelected
                                  ? 'bg-white text-blue-600 border-white shadow-xs'
                                  : 'border-slate-500 bg-slate-800/80 text-transparent'
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
                    <label className="block text-xs font-bold text-white mb-1">
                      বায়ো / সংক্ষিপ্ত পরিচিতি (Bio)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="আপনার পেজ বা উদ্যোগের মূল উদ্দেশ্য ও কার্যক্রম লিখুন..."
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-xl p-3 text-xs sm:text-sm text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2] transition-colors resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Contact Details */}
              {createStep === 2 && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200">
                    📞 <span className="font-bold">যোগাযোগের তথ্য:</span> ফলোয়াররা কীভাবে আপনার সাথে যোগাযোগ করবে তা উল্লেখ করুন (ঐচ্ছিক)।
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>মোবাইল নম্বর (Phone)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+880 17XXXXXXXX"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2] transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="text-[11px] font-bold text-[#b0b3b8]">Direct Chat (Optional)</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
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
                          className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#25D366]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-sky-400 mb-1">IMO</label>
                        <input
                          type="tel"
                          placeholder="+880 17XXXXXXXX"
                          value={newImo}
                          onChange={(e) => setNewImo(e.target.value)}
                          className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-sky-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-purple-400 mb-1">Viber</label>
                        <input
                          type="tel"
                          placeholder="+880 17XXXXXXXX"
                          value={newViber}
                          onChange={(e) => setNewViber(e.target.value)}
                          className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      <span>ওয়েবসাইট লিংক</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={newWebsite}
                      onChange={(e) => setNewWebsite(e.target.value)}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>অবস্থান / শহর (City / Location)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Dhaka, Bangladesh"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2] transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Images & Preview */}
              {createStep === 3 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200">
                    🎨 <span className="font-bold">প্রোফাইল ও কভার ফটো:</span> আপনার নিজস্ব ছবি আপলোড করুন অথবা নিচের ডিজাইন থেকে একটি বেছে নিন।
                  </div>

                  {/* Live Card Preview */}
                  <div className="bg-[#18191a] rounded-xl border border-[#393a3b] overflow-hidden">
                    <div className="h-24 w-full relative bg-[#242526] flex items-center justify-center">
                      {newCover ? (
                        <>
                          <img src={newCover} alt="Cover" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        </>
                      ) : (
                        <span className="text-xs text-[#b0b3b8] font-semibold">কভার ফটো (পরেও যোগ করা যাবে)</span>
                      )}
                    </div>
                    <div className="p-3 flex items-center gap-3">
                      {newAvatar ? (
                        <img
                          src={newAvatar}
                          alt="Avatar"
                          className="w-12 h-12 rounded-xl object-cover border-2 border-[#242526] -mt-8 shadow-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#3a3b3c] border-2 border-[#242526] -mt-8 shadow-lg flex items-center justify-center text-white font-bold text-sm">
                          <Camera className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-xs text-white">{newName || 'আপনার পেজের নাম'}</p>
                        <p className="text-[10px] text-[#b0b3b8]">{newCategory}</p>
                      </div>
                    </div>
                  </div>

                  {/* Avatar Picker & Device Upload */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">
                      প্রোফাইল লোগো / ছবি নির্বাচন করুন:
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      <label className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#18191a] border border-dashed border-[#1877F2] text-[#1877F2] cursor-pointer hover:bg-[#1877F2]/10 shrink-0">
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
                            newAvatar === url ? 'border-[#1877F2] scale-105' : 'border-transparent opacity-70'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Cover Photo Picker & Device Upload */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">
                      কভার ফটো নির্বাচন করুন:
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      <label className="flex flex-col items-center justify-center w-20 h-12 rounded-xl bg-[#18191a] border border-dashed border-[#1877F2] text-[#1877F2] cursor-pointer hover:bg-[#1877F2]/10 shrink-0">
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
                            newCover === url ? 'border-[#1877F2] scale-105' : 'border-transparent opacity-70'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-3 border-t border-[#393a3b] flex items-center justify-between">
                {createStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCreateStep((prev) => (prev - 1) as any)}
                    className="px-5 py-2.5 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer"
                  >
                    ← আগের ধাপ
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer"
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
                    className="px-6 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] active:scale-[0.99] text-xs sm:text-sm font-bold text-white transition-all shadow-md shadow-blue-500/30 cursor-pointer"
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
