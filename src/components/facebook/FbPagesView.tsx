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
} from 'lucide-react';
import { PageItem, PostItem, UserProfile } from '../../types';
import { CreatorMonetizationModal } from '../monetization/CreatorMonetizationModal';

interface FbPagesViewProps {
  onBack: () => void;
  userProfile?: UserProfile;
  onSwitchToPage?: (page: PageItem) => void;
}

const DEFAULT_PAGES: PageItem[] = [
  {
    id: 'page-sf-mart',
    name: 'SF MART BD',
    category: 'Shopping & Retail • ১০০% হালাল পণ্য',
    likes: '১.৮K লাইক',
    followersCount: 2100,
    avatar: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=300&q=80',
    cover: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
    views: '2 new views this week',
    role: 'Visitor',
    isOwner: false,
    isLiked: false,
    description: 'SF MART BD - প্রিমিয়াম ইসলামিক জায়নামাজ, সুগন্ধি আতর, খাঁটি মধু ও ১০০% হালাল খাদ্যসামগ্রী।',
    bio: 'সততা ও সুন্নাহ ভিত্তিক বিশ্বস্ত হালাল ই-কমার্স শপ।',
    phone: '+880 1711-234567',
    website: 'https://sfmartbd.com',
    email: 'info@sfmartbd.com',
    location: 'Mirpur-10, Dhaka, Bangladesh',
    rating: '4.9 ★ (140+ Reviews)',
    createdAt: '2023',
  },
  {
    id: 'page-sharif-story',
    name: "Sharif's Life Story",
    category: 'Public Figure • ইসলামিক অনুপ্রেরণা',
    likes: '৪.২K লাইক',
    followersCount: 5300,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    cover: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
    views: '9 new views this week',
    role: 'Visitor',
    isOwner: false,
    isLiked: false,
    description: 'দৈনন্দিন জীবনের শিক্ষণীয় অভিজ্ঞতা, তিলাওয়াত ও উম্মাহর জন্য দিকনির্দেশনা।',
    bio: 'দ্বীনের পথে অবিচল থাকার আত্মিক অভিযাত্রা।',
    phone: '+880 1822-987654',
    website: 'https://sharifstory.com',
    location: 'Dhaka, Bangladesh',
    rating: '5.0 ★ (320+ Reviews)',
    createdAt: '2022',
  },
  {
    id: 'page-angel-mahi',
    name: 'Angel Mahi',
    category: 'Creator • ইসলামিক কনটেন্ট',
    likes: '৯৮০ লাইক',
    followersCount: 1100,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1000&q=80',
    views: 'Active today',
    role: 'Visitor',
    isOwner: false,
    isLiked: false,
    description: 'উম্মাহর জন্য শিক্ষণীয় ইসলামিক শর্ট ভিডিও ও সুন্নাহ উপদেশ।',
    bio: 'জ্ঞান ও হিকমাহ প্রচারের ক্ষুদ্র প্রয়াস।',
    location: 'Sylhet, Bangladesh',
    rating: '4.8 ★ (85+ Reviews)',
    createdAt: '2024',
  },
  {
    id: 'page-noor-academy',
    name: 'নূর কুরআন একাডেমি (Noor Quran)',
    category: 'Education • হিফজ ও তাজবীদ',
    likes: '১২.৫K লাইক',
    followersCount: 15400,
    avatar: 'https://images.unsplash.com/photo-1584281722572-8815151591f8?auto=format&fit=crop&w=300&q=80',
    cover: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1000&q=80',
    role: 'Follower',
    isOwner: false,
    isLiked: false,
    description: 'সহিহ তাজবীদের সাথে আল-কুরআন শিক্ষা এবং দৈনন্দিন জীবনের মাসআলা-মাসায়েল।',
    bio: 'ঘরে বসেই কুরআন শিক্ষার এক নির্ভরযোগ্য একাডেমি।',
    location: 'Chittagong, Bangladesh',
    rating: '4.9 ★ (510+ Reviews)',
    createdAt: '2021',
  },
  {
    id: 'page-halal-bites',
    name: 'হালাল ফুড কিচেন (Halal Bites)',
    category: 'Restaurant & Halal Food',
    likes: '৮.৯K লাইক',
    followersCount: 10200,
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    cover: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80',
    role: 'Follower',
    isOwner: false,
    isLiked: false,
    description: '১০০% জবেহকৃত হালাল মাংস ও দেশীয় ঐতিহ্যবাহী খাবারের স্বাদ।',
    bio: 'স্বাস্থ্যকর ও পুষ্টিকর হালাল খাবার আপনার দোরগোড়ায়।',
    location: 'Gulshan-2, Dhaka',
    rating: '4.7 ★ (210+ Reviews)',
    createdAt: '2023',
  },
];

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

export const FbPagesView: React.FC<FbPagesViewProps> = ({ onBack, userProfile, onSwitchToPage }) => {
  // Persistence with localStorage & sanitizing old temporary blob URLs to prevent broken images
  const [pages, setPages] = useState<PageItem[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_fb_pages');
      if (stored) {
        const parsed: PageItem[] = JSON.parse(stored);
        return parsed.map((p) => {
          let avatar = p.avatar;
          let cover = p.cover;
          if (!avatar || avatar.startsWith('blob:')) {
            avatar = PRESET_AVATARS[0];
          }
          if (!cover || cover.startsWith('blob:')) {
            cover = PRESET_COVERS[0];
          }
          if (['page-sf-mart', 'page-sharif-story', 'page-angel-mahi', 'page-noor-academy'].includes(p.id)) {
            return { ...p, avatar, cover, isOwner: false, role: 'Visitor' };
          }
          return { ...p, avatar, cover };
        });
      }
      return DEFAULT_PAGES;
    } catch {
      return DEFAULT_PAGES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('qalby_fb_pages', JSON.stringify(pages));
    } catch {}
  }, [pages]);

  // Tab filters
  const [activeTab, setActiveTab] = useState<'all' | 'manage' | 'liked' | 'discover'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState<PageItem | null>(null);

  // Create Page Wizard Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);

  // Form State for new Page
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES_LIST[0]);
  const [newBio, setNewBio] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newLocation, setNewLocation] = useState('Dhaka, Bangladesh');
  const [newAvatar, setNewAvatar] = useState(PRESET_AVATARS[0]);
  const [newCover, setNewCover] = useState(PRESET_COVERS[0]);

  // Edit Page Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editLocation, setEditLocation] = useState('');

  // Page Profile Tabs & In-Page Post Creation
  const [pageSubTab, setPageSubTab] = useState<'posts' | 'about' | 'monetization' | 'photos' | 'reviews'>('posts');
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);
  const [pagePostText, setPagePostText] = useState('');
  const [pagePostsList, setPagePostsList] = useState<Record<string, Array<{ id: string; text: string; time: string; likes: number; comments: number }>>>({
    'page-sf-mart': [
      {
        id: 'pp-1',
        text: 'আলহামদুলিল্লাহ! মদীনার প্রিমিয়াম আতর ও খাস খাঁটি সুন্দরবনের মধুর নতুন স্টক এখন উপলভ্য। অর্ডার করতে মেসেজ করুন বা ইনবক্স করুন।',
        time: '২ ঘণ্টা আগে',
        likes: 42,
        comments: 7,
      },
      {
        id: 'pp-2',
        text: 'জুম্মার দিনের সুন্নত আমলগুলো বেশি বেশি পালন করুন। দরুদ শরিফ পাঠ করুন। জুম্মা মোবারক সবাইকে!',
        time: 'গতকাল',
        likes: 128,
        comments: 14,
      },
    ],
  });

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
    setNewWebsite('');
    setNewEmail('');
    setCreateStep(1);

    // Open the newly created page immediately!
    setSelectedPage(createdPage);
    showToast(`🎉 "${createdPage.name}" পেজটি সফলভাবে সংরক্ষিত ও চালু হয়েছে!`);
  };

  // Add post directly to the active page
  const handlePublishPagePost = () => {
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
    showToast('পেজে পোস্ট প্রকাশিত হয়েছে!');
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
      website: editWebsite.trim() || undefined,
      location: editLocation.trim() || selectedPage.location,
    };

    setSelectedPage(updated);
    setPages((prev) => prev.map((p) => (p.id === selectedPage.id ? updated : p)));
    setShowEditModal(false);
    showToast('💾 পেজের তথ্য সফলভাবে সেভ করা হয়েছে!');
  };

  // Filtered pages
  const filteredPages = pages.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (activeTab === 'manage') return p.isOwner;
    if (activeTab === 'liked') return p.isLiked;
    if (activeTab === 'discover') return !p.isOwner;
    return true;
  });

  const managedPages = pages.filter((p) => p.isOwner);

  // -------------------------------------------------------------
  // DETAIL VIEW FOR A SELECTED PAGE
  // -------------------------------------------------------------
  if (selectedPage) {
    const activePosts = pagePostsList[selectedPage.id] || [];

    return (
      <div className="max-w-[700px] mx-auto min-h-screen bg-[#F5F7FB] text-[#e4e6eb] pb-24">
        {/* Sticky Top Bar for Page */}
        <div className="sticky top-0 z-30 bg-[#242526]/95 backdrop-blur-md px-3 py-2.5 flex items-center justify-between border-b border-[#393a3b]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedPage(null)}
              className="p-2 rounded-full hover:bg-[#3a3b3c] text-white transition-colors"
              title="সব পেজে ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-1.5 line-clamp-1">
                {selectedPage.name}
                <ShieldCheck className="w-4 h-4 text-[#1877F2] fill-[#1877F2]/20 shrink-0" />
              </h2>
              <p className="text-[11px] text-[#b0b3b8]">{selectedPage.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('পেজের লিংক কপি করা হয়েছে!')}
              className="p-2 rounded-full hover:bg-[#3a3b3c] text-white"
              title="শেয়ার করুন"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedPage(null)}
              className="px-3 py-1.5 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] text-xs font-bold text-white transition-colors"
            >
              ব্যাক
            </button>
          </div>
        </div>

        {/* Cover Photo with Owner Camera Updater */}
        <div className="relative w-full h-44 sm:h-56 bg-neutral-900 group">
          <img
            src={selectedPage.cover || PRESET_COVERS[0]}
            alt={selectedPage.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = PRESET_COVERS[0];
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

          {/* Camera upload button on Cover Photo for Owner */}
          {selectedPage.isOwner && (
            <label className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition-colors shadow-md border border-white/20 active:scale-95">
              <Camera className="w-3.5 h-3.5" />
              <span>কভার পরিবর্তন</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpdatePageCover}
              />
            </label>
          )}
        </div>

        {/* Profile Card Header (Matching Facebook Screenshot 2) */}
        <div className="px-4 -mt-14 relative z-10 space-y-3">
          <div className="flex items-end justify-between">
            {/* Circular Avatar with Camera button for Owner */}
            <div className="relative group">
              <img
                src={selectedPage.avatar || PRESET_AVATARS[0]}
                alt={selectedPage.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = PRESET_AVATARS[0];
                }}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#242526] shadow-2xl bg-neutral-900 ring-2 ring-amber-500/50"
              />
              {selectedPage.isOwner && (
                <label className="absolute bottom-0 right-0 bg-[#0866FF] hover:bg-[#1877F2] text-white p-2 rounded-full cursor-pointer shadow-lg border-2 border-[#242526] transition-all active:scale-95" title="লোগো / ছবি পরিবর্তন">
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

            {/* Quick Actions (Switch, Like, Message, Edit) */}
            <div className="flex items-center gap-2 pb-1">
              {onSwitchToPage && (
                <button
                  onClick={() => onSwitchToPage(selectedPage)}
                  className="px-4 py-2 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                  title="এই পেজ হিসেবে ফেসবুক ব্রাউজ করুন"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>পেজে সুইচ করুন</span>
                </button>
              )}

              {selectedPage.isOwner ? (
                <button
                  onClick={() => handleOpenEditModal(selectedPage)}
                  className="px-3.5 py-2 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>পেজ এডিট</span>
                </button>
              ) : (
                <button
                  onClick={() => handleToggleLike(selectedPage.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                    selectedPage.isLiked
                      ? 'bg-[#3a3b3c] hover:bg-[#4e4f50] text-white'
                      : 'bg-[#1877F2] hover:bg-[#166fe5] text-white'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${selectedPage.isLiked ? 'fill-current text-[#1877F2]' : ''}`} />
                  <span>{selectedPage.isLiked ? 'ফলো করা আছে ✓' : 'Follow'}</span>
                </button>
              )}

              <button
                onClick={() => showToast('হোয়াটসঅ্যাপে পেজের সাথে যুক্ত হচ্ছেন...')}
                className="px-3 py-2 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{selectedPage.name}</h1>
              <ShieldCheck className="w-5 h-5 text-[#1877F2]" />
            </div>
            <p className="text-xs text-[#b0b3b8]">{selectedPage.category}</p>
            <p className="text-xs text-emerald-400 font-medium pt-0.5">
              {selectedPage.followersCount} জন ফলোয়ার্স • {selectedPage.likes}
            </p>
          </div>

          {selectedPage.bio && (
            <p className="text-xs text-[#e4e6eb] bg-[#242526] p-3 rounded-xl border border-[#393a3b] leading-relaxed">
              {selectedPage.bio}
            </p>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#b0b3b8] bg-[#242526] p-3 rounded-xl border border-[#393a3b]">
            {selectedPage.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">{selectedPage.location}</span>
              </div>
            )}
            {selectedPage.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{selectedPage.phone}</span>
              </div>
            )}
            {selectedPage.website && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{selectedPage.website}</span>
              </div>
            )}
            {selectedPage.rating && (
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                <span className="truncate">{selectedPage.rating}</span>
              </div>
            )}
          </div>

          {/* Creator Monetization Status Card for Page Owners */}
          {selectedPage.isOwner && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[#242526] to-[#1877F2]/15 border border-emerald-500/30 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base shadow-sm">
                  ৳
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-white">পেজ মনিটাইজেশন ও ক্রিয়েটর আর্নিং</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      সক্রিয়
                    </span>
                  </div>
                  <p className="text-[11px] text-[#b0b3b8]">ইন-স্ট্রিম ভিডিও বিজ্ঞাপন ও রেভিনিউ শেয়ার ৫৫/৪৫</p>
                </div>
              </div>
              <button
                onClick={() => setShowMonetizationModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>আর্নিং স্টুডিও</span>
              </button>
            </div>
          )}

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-[#393a3b] pt-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'posts', label: 'পোস্টসমূহ (Posts)' },
              { id: 'about', label: 'সম্পর্কে (About)' },
              { id: 'monetization', label: '💰 মনিটাইজেশন (Earnings)' },
              { id: 'photos', label: 'ছবি (Photos)' },
              { id: 'reviews', label: 'রিভিউ (Reviews)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPageSubTab(tab.id as any)}
                className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap px-2 ${
                  pageSubTab === tab.id
                    ? 'border-[#1877F2] text-[#1877F2]'
                    : 'border-transparent text-[#b0b3b8] hover:text-[#e4e6eb]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* POSTS TAB CONTENT */}
          {pageSubTab === 'posts' && (
            <div className="space-y-3 pt-2">
              {/* If owner/admin: Write Post as Page Box */}
              {selectedPage.isOwner && (
                <div className="bg-[#242526] rounded-2xl border border-[#393a3b] p-3.5 space-y-3 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={selectedPage.avatar}
                      alt={selectedPage.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#393a3b]"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">
                        {selectedPage.name} হিসেবে পোস্ট করুন
                      </p>
                      <span className="text-[10px] text-emerald-400">Public • Page Post</span>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={pagePostText}
                    onChange={(e) => setPagePostText(e.target.value)}
                    placeholder={`পেজের ফলোয়ারদের উদ্দেশ্যে কিছু লিখুন...`}
                    className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl p-3 text-xs text-[#e4e6eb] placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2] resize-none"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-xs text-[#b0b3b8]">
                      <button
                        type="button"
                        onClick={() => showToast('ফটো যোগ করা হয়েছে')}
                        className="p-1.5 rounded-lg hover:bg-[#3a3b3c] text-emerald-400 flex items-center gap-1"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-[11px]">ছবি</span>
                      </button>
                    </div>

                    <button
                      onClick={handlePublishPagePost}
                      disabled={!pagePostText.trim()}
                      className="px-4 py-1.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>পোস্ট করুন</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Feed of Posts for this Page */}
              <div className="space-y-3">
                {activePosts.length === 0 ? (
                  <div className="bg-[#242526] rounded-2xl p-6 text-center border border-[#393a3b]">
                    <Flag className="w-8 h-8 text-[#b0b3b8] mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-[#b0b3b8]">এই পেজে এখনও কোনো পোস্ট নেই।</p>
                    {selectedPage.isOwner && (
                      <p className="text-[11px] text-emerald-400 mt-1">
                        উপরে লিখে প্রথম পোস্টটি প্রকাশ করুন!
                      </p>
                    )}
                  </div>
                ) : (
                  activePosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-[#242526] rounded-2xl border border-[#393a3b] p-3.5 space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={selectedPage.avatar}
                          alt={selectedPage.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#393a3b]"
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="text-xs font-bold text-white">{selectedPage.name}</h4>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#1877F2]" />
                          </div>
                          <p className="text-[10px] text-[#b0b3b8]">{post.time} • 🌐</p>
                        </div>
                      </div>

                      <p className="text-xs text-[#e4e6eb] leading-relaxed whitespace-pre-wrap">
                        {post.text}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#393a3b]/60 text-xs text-[#b0b3b8]">
                        <button
                          onClick={() => showToast('পোস্টে লাইক দেওয়া হয়েছে')}
                          className="flex items-center gap-1.5 hover:text-white"
                        >
                          <ThumbsUp className="w-4 h-4 text-[#1877F2]" />
                          <span>{post.likes} লাইক</span>
                        </button>
                        <button
                          onClick={() => showToast('মন্তব্য অপশন খোলা হয়েছে')}
                          className="flex items-center gap-1.5 hover:text-white"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments} মন্তব্য</span>
                        </button>
                        <button
                          onClick={() => showToast('পোস্ট শেয়ার করা হয়েছে')}
                          className="flex items-center gap-1.5 hover:text-white"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>শেয়ার</span>
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
            <div className="bg-[#242526] rounded-2xl border border-[#393a3b] p-4 space-y-4">
              <h3 className="text-sm font-bold text-white">পেজ সম্পর্কে বিস্তারিত</h3>
              <div className="space-y-3 text-xs text-[#e4e6eb]">
                <div>
                  <span className="text-[11px] text-[#b0b3b8] block">বিবরণ (Description)</span>
                  <p className="mt-0.5">{selectedPage.description}</p>
                </div>
                <div>
                  <span className="text-[11px] text-[#b0b3b8] block">ক্যাটাগরি</span>
                  <p className="mt-0.5">{selectedPage.category}</p>
                </div>
                {selectedPage.location && (
                  <div>
                    <span className="text-[11px] text-[#b0b3b8] block">ঠিকানা</span>
                    <p className="mt-0.5">{selectedPage.location}</p>
                  </div>
                )}
                {selectedPage.phone && (
                  <div>
                    <span className="text-[11px] text-[#b0b3b8] block">মোবাইল / হোয়াটসঅ্যাপ</span>
                    <p className="mt-0.5 text-emerald-400">{selectedPage.phone}</p>
                  </div>
                )}
                {selectedPage.website && (
                  <div>
                    <span className="text-[11px] text-[#b0b3b8] block">ওয়েবসাইট</span>
                    <p className="mt-0.5 text-[#1877F2]">{selectedPage.website}</p>
                  </div>
                )}
                <div>
                  <span className="text-[11px] text-[#b0b3b8] block">পেজ তৈরির তারিখ</span>
                  <p className="mt-0.5">{selectedPage.createdAt || '২০২৩'}</p>
                </div>
              </div>
            </div>
          )}

          {/* MONETIZATION & CREATOR STUDIO TAB */}
          {pageSubTab === 'monetization' && (
            <div className="space-y-3">
              {/* Top Summary Card */}
              <div className="bg-[#242526] rounded-2xl border border-emerald-500/40 p-4 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                      ৳
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">ক্রিয়েটর ইন-স্ট্রিম মনিটাইজেশন</h3>
                      <p className="text-[11px] text-emerald-400">শরিয়াহ সম্মত ৫৫% ক্রিয়েটর রেভিনিউ শেয়ার</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {selectedPage.followersCount >= 5000 ? 'সক্রিয় (Active)' : 'আবেদন পর্যালোচনা'}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-[#18191a] p-3 rounded-xl border border-[#393a3b]">
                    <span className="text-[10px] text-[#b0b3b8] block">উত্তোলনযোগ্য ব্যালেন্স</span>
                    <span className="text-base font-bold text-emerald-400">৳৯,৫০০</span>
                    <span className="text-[9px] text-[#8a8d91] block">($৮২.৬০ USD)</span>
                  </div>
                  <div className="bg-[#18191a] p-3 rounded-xl border border-[#393a3b]">
                    <span className="text-[10px] text-[#b0b3b8] block">মোট অর্জিত আয়</span>
                    <span className="text-base font-bold text-white">৳২৪,৫০০</span>
                    <span className="text-[9px] text-[#8a8d91] block">ইন-স্ট্রিম ও রিলস বিজ্ঞাপন</span>
                  </div>
                </div>

                {/* Eligibility checklist */}
                <div className="space-y-2 pt-1 border-t border-[#393a3b] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#b0b3b8] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#1877F2]" />
                      ফলোয়ার সংখ্যা (টার্গেট ৫,০০০)
                    </span>
                    <span className="font-bold text-white">
                      {selectedPage.followersCount.toLocaleString('bn-BD')} / ৫,০০০
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#b0b3b8] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      ভিডিও ভিউ ওয়াচ মিনিট
                    </span>
                    <span className="font-bold text-emerald-400">
                      ৭৮,৪০০ / ৬০,০০০ মিনিট (১০০%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#b0b3b8] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      ১০০% বাদ্যযন্ত্র ও অশ্লীলতামুক্ত কনটেন্ট
                    </span>
                    <span className="font-bold text-emerald-400">✓ অনুমোদিত</span>
                  </div>
                </div>

                {/* Action button to open full studio */}
                <button
                  onClick={() => setShowMonetizationModal(true)}
                  className="w-full py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>টাকা উত্তোলনের আবেদন করুন (বিকাশ / নগদ / ব্যাংক)</span>
                </button>
              </div>
            </div>
          )}

          {/* PHOTOS TAB */}
          {pageSubTab === 'photos' && (
            <div className="grid grid-cols-3 gap-2">
              {[selectedPage.cover, selectedPage.avatar, ...PRESET_COVERS].map((imgUrl, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-neutral-800">
                  <img src={imgUrl} alt="Photo" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* REVIEWS TAB */}
          {pageSubTab === 'reviews' && (
            <div className="bg-[#242526] rounded-2xl border border-[#393a3b] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#393a3b] pb-3">
                <div>
                  <div className="text-2xl font-black text-amber-400">4.9 ★★★★★</div>
                  <p className="text-xs text-[#b0b3b8]">140 জনের মতামতের ভিত্তিতে</p>
                </div>
                <button
                  onClick={() => showToast('ধন্যবাদ! আপনার ৫★ রিভিউ যুক্ত হয়েছে।')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1877F2] text-white text-xs font-bold"
                >
                  রিভিউ দিন
                </button>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="bg-[#18191a] p-3 rounded-xl border border-[#393a3b]">
                  <p className="text-xs font-bold text-white">মোহাম্মদ তৌফিক</p>
                  <p className="text-[11px] text-amber-400">★★★★★ ১০০% হালাল ও বিশ্বস্ত</p>
                  <p className="text-xs text-[#b0b3b8] mt-1">
                    মাশাআল্লাহ! পেজের কনটেন্ট এবং সেবার মান অত্যন্ত প্রশংসনীয়। আল্লাহ বরকত দান করুন।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Creator Monetization Studio Modal for this Page */}
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

          {/* Edit Page Modal for Owner with Prominent "💾 পরিবর্তন সেভ করুন" Button */}
          {showEditModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
              <div className="bg-[#242526] w-full max-w-lg rounded-2xl border border-[#393a3b] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 border-b border-[#393a3b] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-[#0866FF]" />
                    <h3 className="font-bold text-base text-white">পেজের তথ্য এডিট করুন (Edit Page)</h3>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-1 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditPage} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-left">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">পেজের নাম (Page Name)</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#0866FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">ক্যাটাগরি (Category)</label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#0866FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">বায়ো / পরিচিতি (Bio)</label>
                    <textarea
                      rows={3}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#0866FF] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">মোবাইল / হোয়াটসঅ্যাপ</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+880..."
                        className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0866FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">অবস্থান / শহর</label>
                      <input
                        type="text"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        placeholder="Dhaka, Bangladesh"
                        className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0866FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">ওয়েবসাইট লিংক</label>
                    <input
                      type="text"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0866FF]"
                    />
                  </div>

                  <div className="pt-3 border-t border-[#393a3b] flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-xs font-bold text-white cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] active:scale-95 text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>💾 পরিবর্তন সেভ করুন (Save Changes)</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN PAGES HUB (Matching Facebook Native App)
  // -------------------------------------------------------------
  return (
    <div className="max-w-[700px] mx-auto min-h-screen bg-[#F5F7FB] text-[#e4e6eb] pb-24 p-3 sm:p-4 space-y-4">
      {/* Top Header with Back button & "+ Create" */}
      <div className="flex items-center justify-between pb-2 border-b border-[#393a3b]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-[#3a3b3c] text-white transition-colors"
            title="পেছনে যান (Back)"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/20 text-[#fa3e3e]">
              <Flag className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white">Pages</h1>
              <p className="text-xs text-[#b0b3b8]">পেইজ ব্যবস্থাপনা ও ইসলামিক কমিউনিটি</p>
            </div>
          </div>
        </div>

        {/* Big Prominent "+ Create (নতুন পেজ খুলুন)" Button */}
        <button
          onClick={() => {
            setShowCreateModal(true);
            setCreateStep(1);
          }}
          className="px-3.5 py-2 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>পেজ খুলুন (Create)</span>
        </button>
      </div>

      {/* Facebook Native Action Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => {
            setShowCreateModal(true);
            setCreateStep(1);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#1877F2]/20 border border-[#1877F2]/40 text-[#1877F2] hover:bg-[#1877F2] hover:text-white text-xs font-bold whitespace-nowrap transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ তৈরি করুন (Create)</span>
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'discover'
              ? 'bg-[#3a3b3c] text-white'
              : 'bg-[#242526] border border-[#393a3b] text-[#b0b3b8] hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>আবিষ্কার (Discover)</span>
        </button>

        <button
          onClick={() => setActiveTab('liked')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'liked'
              ? 'bg-[#3a3b3c] text-white'
              : 'bg-[#242526] border border-[#393a3b] text-[#b0b3b8] hover:text-white'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>পছন্দের পেজ (Liked)</span>
        </button>

        <button
          onClick={() => showToast('আপনার কোনো নতুন পেজ আমন্ত্রণ নেই')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#242526] border border-[#393a3b] text-[#b0b3b8] hover:text-white text-xs font-bold whitespace-nowrap transition-colors"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>আমন্ত্রণ (Invites)</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="পেইজ খুঁজুন (নাম বা ক্যাটাগরি)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#242526] border border-[#393a3b] rounded-full pl-9 pr-4 py-2 text-xs text-[#e4e6eb] placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2]"
        />
        <Search className="w-4 h-4 text-[#b0b3b8] absolute left-3 top-2.5" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2 text-[#b0b3b8] hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#393a3b]/60 pb-2">
        {[
          { id: 'all', label: `সব পেজ (${pages.length})` },
          { id: 'manage', label: `আপনার পরিচালিত (${managedPages.length})` },
          { id: 'liked', label: `লাইক করা` },
          { id: 'discover', label: `নতুন পেজ খুঁজুন` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-[#1877F2] text-white font-bold shadow-sm'
                : 'bg-[#242526] text-[#b0b3b8] hover:text-[#e4e6eb]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* "Pages you manage" Highlight Banner (if in all or manage tab) */}
      {(activeTab === 'all' || activeTab === 'manage') && managedPages.length > 0 && !searchQuery && (
        <div className="bg-[#242526] rounded-2xl border border-[#393a3b] p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#1877F2]" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                আপনার পরিচালিত পেইজসমূহ ({managedPages.length})
              </h2>
            </div>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setCreateStep(1);
              }}
              className="text-xs font-bold text-[#1877F2] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন পেজ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {managedPages.map((page) => (
              <div
                key={page.id}
                onClick={() => setSelectedPage(page)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#18191a] border border-[#393a3b]/60 hover:border-[#1877F2] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={page.avatar || PRESET_AVATARS[0]}
                    alt={page.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = PRESET_AVATARS[0];
                    }}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#393a3b]"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-white truncate group-hover:text-[#1877F2]">
                      {page.name}
                    </p>
                    <p className="text-[10px] text-[#b0b3b8] truncate">{page.category}</p>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      {page.views || 'Active'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSwitchToPage) {
                      onSwitchToPage(page);
                    } else {
                      setSelectedPage(page);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] active:scale-95 text-[11px] font-bold text-white transition-all shrink-0 ml-2 shadow-xs cursor-pointer"
                >
                  সুইচ করুন
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pages List */}
      <div className="space-y-4">
        {filteredPages.length === 0 ? (
          <div className="bg-[#242526] rounded-2xl p-8 text-center border border-[#393a3b] space-y-3">
            <Flag className="w-10 h-10 text-[#b0b3b8] mx-auto opacity-40" />
            <p className="text-sm font-semibold text-white">কোনো পেইজ খুঁজে পাওয়া যায়নি</p>
            <p className="text-xs text-[#b0b3b8]">নতুন পেজ তৈরি করুন অথবা ফিল্টার পরিবর্তন করুন।</p>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setCreateStep(1);
              }}
              className="px-4 py-2 rounded-xl bg-[#1877F2] text-white font-bold text-xs"
            >
              + নতুন পেজ তৈরি করুন
            </button>
          </div>
        ) : (
          filteredPages.map((page) => (
            <div
              key={page.id}
              className="bg-[#242526] rounded-2xl border border-[#393a3b] overflow-hidden shadow-md hover:border-[#1877F2]/60 transition-all"
            >
              {/* Cover image */}
              <div
                onClick={() => setSelectedPage(page)}
                className="h-28 w-full overflow-hidden relative cursor-pointer group"
              >
                <img
                  src={page.cover || PRESET_COVERS[0]}
                  alt={page.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = PRESET_COVERS[0];
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                {page.isOwner && (
                  <span className="absolute top-2 left-2 bg-[#1877F2] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    আপনার পেজ (Admin)
                  </span>
                )}
                {page.views && (
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                    <span>{page.views}</span>
                  </div>
                )}
              </div>

              {/* Profile Row */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => setSelectedPage(page)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={page.avatar || PRESET_AVATARS[0]}
                      alt={page.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = PRESET_AVATARS[0];
                      }}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#242526] -mt-9 shadow-lg z-10 bg-neutral-900 group-hover:border-[#1877F2] transition-colors"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-[#1877F2] transition-colors">
                          {page.name}
                        </h3>
                        <ShieldCheck className="w-4 h-4 text-[#1877F2]" />
                      </div>
                      <p className="text-xs text-[#b0b3b8]">{page.category}</p>
                      <p className="text-[11px] text-emerald-400 font-medium">{page.likes} • {page.followersCount} ফলোয়ার্স</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-[#3a3b3c] text-xs font-semibold text-[#e4e6eb]">
                    {page.role || (page.isOwner ? 'Admin' : 'Public')}
                  </span>
                </div>

                <p className="text-xs text-[#b0b3b8] leading-relaxed bg-[#18191a] p-2.5 rounded-xl border border-[#393a3b]/50">
                  {page.description}
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedPage(page)}
                    className="flex-1 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>পেজ দেখুন (Visit Page)</span>
                  </button>

                  <button
                    onClick={() => handleToggleLike(page.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      page.isLiked
                        ? 'bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#1877F2]'
                        : 'bg-[#242526] border border-[#393a3b] hover:bg-[#3a3b3c] text-[#e4e6eb]'
                    }`}
                    title={page.isLiked ? 'লাইক প্রত্যাহার করুন' : 'লাইক দিন'}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${page.isLiked ? 'fill-[#1877F2]' : ''}`} />
                    <span>{page.isLiked ? 'লাইকড ✓' : 'লাইক'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
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
                      placeholder="যেমন: আল-হিকমাহ একাডেমি, সুন্নতি পোশাক..."
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
                      <span>মোবাইল বা হোয়াটসঅ্যাপ নম্বর</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+880 17XXXXXXXX"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2] transition-colors"
                    />
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
                    <div className="h-24 w-full relative">
                      <img src={newCover} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                    <div className="p-3 flex items-center gap-3">
                      <img
                        src={newAvatar}
                        alt="Avatar"
                        className="w-12 h-12 rounded-xl object-cover border-2 border-[#242526] -mt-8 shadow-lg"
                      />
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
    </div>
  );
};
