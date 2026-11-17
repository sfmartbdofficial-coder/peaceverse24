import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Key,
  LogOut,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Users,
  MousePointer,
  Sparkles,
  Bot,
  Send,
  Plus,
  Settings,
  Tag,
  CreditCard,
  Check,
  RefreshCw,
  ExternalLink,
  Trash2,
  Megaphone,
  Bell,
  Image as ImageIcon,
  Flag,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  PauseCircle,
  Ban,
  Sliders,
  Globe,
} from 'lucide-react';
import { AdSlot, MonetizedCreator, PayoutRequest } from '../../types/admin';
import { INITIAL_CREATORS, INITIAL_PAYOUTS } from '../../data/adminData';
import { PostItem, GoldenCashoutRequest, NotificationItem, UserProfile } from '../../types';
import { broadcastCreatorNotification } from '../../lib/fcm';
import {
  loadPeaceSettings,
  savePeaceSettings,
  PeaceSettingsPrefs,
} from '../../utils/settingsStorage';
import {
  fetchAdminPlatformData,
  AdminPlatformStats,
} from '../../lib/firebase';
import {
  verifyAdminCredentials,
  loadAdminCredentials,
  updateAdminCredentials,
  loadAdPlacementConfig,
  saveAdPlacementConfig,
  AdPlacementConfig,
  loadAdminAds,
  saveAdminAds,
  loadPageMonetizationList,
  savePageMonetizationList,
  PageMonetizationControl,
  loadAdminUserOverrides,
  saveAdminUserOverrides,
  AdminUserOverride,
} from '../../utils/adminControlStorage';

interface AdminPortalProps {
  onBackToApp: () => void;
  posts: PostItem[];
  onAddPostToFeed: (post: PostItem) => void;
  onDeletePostFromFeed: (postId: string) => void;
  onModeratePost?: (postId: string, status: 'approved' | 'blocked' | 'rejected', reason: string) => void;
  goldenCashoutRequests?: GoldenCashoutRequest[];
  onApproveGoldenCashout?: (id: string) => void;
  onRejectGoldenCashout?: (id: string) => void;
  userProfile?: UserProfile;
  onBroadcastNotification?: (notif: NotificationItem) => void;
}

type AdminTab =
  | 'dashboard'
  | 'users'
  | 'pages'
  | 'ads'
  | 'monetization'
  | 'payouts'
  | 'moderation'
  | 'broadcast'
  | 'ai'
  | 'settings';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onBackToApp,
  posts,
  onAddPostToFeed,
  onDeletePostFromFeed,
  onModeratePost,
  goldenCashoutRequests = [],
  onApproveGoldenCashout,
  onRejectGoldenCashout,
  userProfile,
  onBroadcastNotification,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('qalby_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Admin Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [moderationFilter, setModerationFilter] = useState<'all' | 'blocked' | 'rejected' | 'appeals'>('all');
  const [moderatingPost, setModeratingPost] = useState<{ id: string; action: 'blocked' | 'rejected'; author: string } | null>(null);
  const [moderationReasonInput, setModerationReasonInput] = useState('');

  // Live Firestore Platform Data (Users, Active counts, Posts, Follows)
  const [platformStats, setPlatformStats] = useState<AdminPlatformStats>({
    totalUsers: 0,
    activeUsers24h: 0,
    activeUsers7d: 0,
    totalPosts: posts.length,
    totalFollows: 0,
    totalNotifications: 0,
    users: [],
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'active24h' | 'active7d' | 'verified' | 'suspended'>('all');
  const [userOverrides, setUserOverrides] = useState<Record<string, AdminUserOverride>>(() => loadAdminUserOverrides());

  // Pages & Page Monetization Registry
  const [pageControls, setPageControls] = useState<PageMonetizationControl[]>(() => loadPageMonetizationList());
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [pageStatusFilter, setPageStatusFilter] = useState<'all' | 'approved' | 'pending' | 'paused' | 'rejected'>('all');
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageCategory, setNewPageCategory] = useState('Education & Quran Academy');
  const [newPageFollowers, setNewPageFollowers] = useState('5000');

  // Ad Placement Config ("কোথায় অ্যাড বসাবো") + Ads List
  const [placementConfig, setPlacementConfig] = useState<AdPlacementConfig>(() => loadAdPlacementConfig());
  const [ads, setAds] = useState<AdSlot[]>(() => loadAdminAds());

  // Creator Broadcast State
  const [broadcastCreatorName, setBroadcastCreatorName] = useState('Peaceverse24 Official');
  const [broadcastTitle, setBroadcastTitle] = useState('Peaceverse24.com নতুন আপডেট ও বিশেষ বার্তা');
  const [broadcastMessage, setBroadcastMessage] = useState('১০০% হালাল কমিউনিটি ও ক্রিয়েটর মনিটাইজেশন চালু হয়েছে।');
  const [broadcastImage, setBroadcastImage] = useState(
    'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80'
  );
  const [broadcastLink, setBroadcastLink] = useState('/home');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState<{ sent: number; total: number } | null>(null);
  const [broadcastHistory, setBroadcastHistory] = useState<
    Array<{
      id: string;
      title: string;
      message: string;
      sent: number;
      total: number;
      time: string;
    }>
  >([]);
  const [creatorPrefs, setCreatorPrefs] = useState<PeaceSettingsPrefs>(() => loadPeaceSettings());

  // Creators monetization state
  const [creators, setCreators] = useState<MonetizedCreator[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_admin_creators');
      return stored ? JSON.parse(stored) : INITIAL_CREATORS;
    } catch {
      return INITIAL_CREATORS;
    }
  });

  // Payout requests state
  const [payouts, setPayouts] = useState<PayoutRequest[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_admin_payouts');
      return stored ? JSON.parse(stored) : INITIAL_PAYOUTS;
    } catch {
      return INITIAL_PAYOUTS;
    }
  });

  // Admin Credentials Update State
  const [settingsUsername, setSettingsUsername] = useState(() => loadAdminCredentials().username);
  const [settingsPassword, setSettingsPassword] = useState('');
  const [settingsConfirmPassword, setSettingsConfirmPassword] = useState('');

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [lastSubmittedPrompt, setLastSubmittedPrompt] = useState<string | null>(null);
  const [aiHistory, setAiHistory] = useState<
    Array<{ id: string; prompt: string; response: string; time: string }>
  >(() => {
    try {
      const saved = localStorage.getItem('peaceverse_admin_ai_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [aiGeneratedPostDraft, setAiGeneratedPostDraft] = useState<{ title: string; content: string } | null>(null);

  // New Ad Slot Modal
  const [showNewAdModal, setShowNewAdModal] = useState(false);
  const [newSponsor, setNewSponsor] = useState('');
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdDesc, setNewAdDesc] = useState('');
  const [newAdPlacement, setNewAdPlacement] = useState<'home_feed' | 'reels_preroll' | 'marketplace_top' | 'story_ad'>('home_feed');
  const [newAdImage, setNewAdImage] = useState('https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80');
  const [newAdTargetUrl, setNewAdTargetUrl] = useState('https://peaceverse24.com');
  const [newAdCpm, setNewAdCpm] = useState('150');
  const [newAdCpc, setNewAdCpc] = useState('6.0');

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const refreshLiveStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const stats = await fetchAdminPlatformData();
      setPlatformStats(stats);
      setPageControls(loadPageMonetizationList());
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshLiveStats();
    }
  }, [isAuthenticated, refreshLiveStats]);

  // Persist Ads, Placements, Pages, Creators, Payouts, User Overrides
  useEffect(() => {
    saveAdminAds(ads);
  }, [ads]);

  useEffect(() => {
    saveAdPlacementConfig(placementConfig);
  }, [placementConfig]);

  useEffect(() => {
    savePageMonetizationList(pageControls);
  }, [pageControls]);

  useEffect(() => {
    saveAdminUserOverrides(userOverrides);
  }, [userOverrides]);

  useEffect(() => {
    try {
      localStorage.setItem('qalby_admin_creators', JSON.stringify(creators));
    } catch {}
  }, [creators]);

  useEffect(() => {
    try {
      localStorage.setItem('qalby_admin_payouts', JSON.stringify(payouts));
    } catch {}
  }, [payouts]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminCredentials(usernameInput, passwordInput)) {
      setIsAuthenticated(true);
      setLoginError(null);
      try {
        localStorage.setItem('qalby_admin_authenticated', 'true');
      } catch {}
      showToast('Peaceverse24.com অ্যাডমিন প্যানেলে স্বাগতম!');
    } else {
      setLoginError('ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে সঠিক তথ্য দিন।');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
    try {
      localStorage.removeItem('qalby_admin_authenticated');
    } catch {}
    showToast('অ্যাডমিন সেশন লগআউট হয়েছে');
  };

  // Update Admin Credentials
  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsUsername.trim()) {
      showToast('অ্যাডমিন ইউজারনেম খালি রাখা যাবে না');
      return;
    }
    if (!settingsPassword.trim() || settingsPassword.trim().length < 6) {
      showToast('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }
    if (settingsPassword !== settingsConfirmPassword) {
      showToast('পাসওয়ার্ড দুটি মিলছে না');
      return;
    }
    updateAdminCredentials(settingsUsername.trim(), settingsPassword.trim());
    setSettingsPassword('');
    setSettingsConfirmPassword('');
    showToast('✅ অ্যাডমিন ইউজারনেম ও পাসওয়ার্ড আপডেট হয়েছে!');
  };

  // User Controls (Verify / Suspend)
  const toggleUserOverride = (uid: string, field: 'verifiedOverride' | 'suspended') => {
    setUserOverrides((prev) => {
      const current = prev[uid] || { uid };
      return {
        ...prev,
        [uid]: {
          ...current,
          [field]: !current[field],
          updatedAt: new Date().toISOString(),
        },
      };
    });
    showToast('ইউজারের স্ট্যাটাস আপডেট করা হয়েছে ✓');
  };

  // Page Monetization Controls
  const updatePageMonetizationStatus = (
    pageId: string,
    status: 'approved' | 'pending' | 'paused' | 'rejected'
  ) => {
    setPageControls((prev) =>
      prev.map((p) =>
        p.pageId === pageId
          ? { ...p, status, updatedAt: new Date().toISOString() }
          : p
      )
    );
    showToast(
      status === 'approved'
        ? '✅ পেজের মনিটাইজেশন অনুমোদন ও চালু করা হয়েছে!'
        : status === 'paused'
        ? '⏸️ পেজের মনিটাইজেশন সাময়িকভাবে স্থগিত করা হয়েছে'
        : '❌ পেজের মনিটাইজেশন বাতিল করা হয়েছে'
    );
  };

  const togglePageAdFormat = (
    pageId: string,
    field: 'inStreamAdsEnabled' | 'reelsAdsEnabled' | 'starsEnabled'
  ) => {
    setPageControls((prev) =>
      prev.map((p) =>
        p.pageId === pageId
          ? { ...p, [field]: !p[field], updatedAt: new Date().toISOString() }
          : p
      )
    );
    showToast('পেজের বিজ্ঞাপন সেটিংস আপডেট হয়েছে ✓');
  };

  const updatePageRevenueShare = (pageId: string, pct: number) => {
    const safePct = Math.min(90, Math.max(10, pct));
    setPageControls((prev) =>
      prev.map((p) =>
        p.pageId === pageId
          ? { ...p, revenueShareCreatorPct: safePct, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const handleCreateAdminPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) {
      showToast('পেজের নাম লিখুন');
      return;
    }
    const pageId = `page-admin-${Date.now()}`;
    const followers = Math.max(0, Number(newPageFollowers) || 0);
    const newEntry: PageMonetizationControl = {
      pageId,
      pageName: newPageName.trim(),
      category: newPageCategory,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newPageName.trim())}&backgroundColor=0866ff,10b981`,
      followersCount: followers,
      status: 'approved',
      inStreamAdsEnabled: true,
      reelsAdsEnabled: true,
      starsEnabled: true,
      revenueShareCreatorPct: 55,
      totalEarnings: 0,
      pendingBalance: 0,
      updatedAt: new Date().toISOString(),
    };
    setPageControls((prev) => [newEntry, ...prev]);
    setNewPageName('');
    setNewPageFollowers('5000');
    setShowAddPageModal(false);
    showToast(`✅ "${newEntry.pageName}" পেজ যুক্ত ও মনিটাইজেশন চালু হয়েছে!`);
  };

  // Broadcast Handler
  const handleSendBroadcastNow = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showToast('অনুগ্রহ করে টাইটেল ও মেসেজ লিখুন');
      return;
    }

    setBroadcastSending(true);
    const totalUsers = Math.max(platformStats.totalUsers, 1);
    setBroadcastProgress({ sent: 0, total: totalUsers });

    try {
      const result = await broadcastCreatorNotification({
        creatorId: userProfile?.id || 'peaceverse-admin',
        creatorName: broadcastCreatorName.trim() || 'Peaceverse24 Official',
        creatorAvatar: userProfile?.avatar || '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
        contentType: 'broadcast',
        title: broadcastTitle.trim(),
        body: broadcastMessage.trim(),
        thumbnail: broadcastImage.trim() || undefined,
        postId: posts[0]?.id,
        link: broadcastLink.trim() || '/home',
        broadcastToAll: true,
        onLocalNotify: onBroadcastNotification,
      });

      setBroadcastProgress({ sent: totalUsers, total: totalUsers });
      setBroadcastSending(false);
      setBroadcastHistory((prev) => [
        {
          id: result.notification.id,
          title: broadcastTitle.trim(),
          message: broadcastMessage.trim(),
          sent: totalUsers,
          total: totalUsers,
          time: 'Just now',
        },
        ...prev,
      ]);
      showToast('📢 সফলভাবে সকল ব্যবহারকারীর কাছে ব্রডকাস্ট পাঠানো হয়েছে!');
    } catch {
      setBroadcastSending(false);
      showToast('ব্রডকাস্ট পাঠানো হয়েছে');
    }
  };

  // AI Assistant Call
  const handleAskAI = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || aiPrompt).trim();
    if (!promptToSend) return;

    setAiLoading(true);
    setAiResponse(null);
    setLastSubmittedPrompt(promptToSend);

    const recordHistory = (replyText: string) => {
      const entry = {
        id: `ai-${Date.now()}`,
        prompt: promptToSend,
        response: replyText,
        time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      };
      setAiHistory((prev) => {
        const next = [entry, ...prev].slice(0, 30);
        try {
          localStorage.setItem('peaceverse_admin_ai_history', JSON.stringify(next));
        } catch {}
        return next;
      });
    };

    try {
      const res = await fetch('/api/ai/admin-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToSend }),
      });

      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();
      const replyText = data.text || 'কোনো উত্তর পাওয়া যায়নি';
      setAiResponse(replyText);
      recordHistory(replyText);

      if (
        promptToSend.includes('পোস্ট') ||
        promptToSend.includes('জুমার') ||
        promptToSend.includes('নোটিশ') ||
        promptToSend.includes('মেসেজ') ||
        promptToSend.includes('ওয়েলকাম') ||
        promptToSend.toLowerCase().includes('welcome')
      ) {
        setAiGeneratedPostDraft({
          title: 'অ্যাডমিন অফিসিয়াল বার্তা',
          content: replyText,
        });
      }
    } catch {
      const qLower = promptToSend.toLowerCase();
      let fallbackText = '';

      if (promptToSend.includes('ওয়েলকাম') || promptToSend.includes('স্বাগত') || qLower.includes('welcome')) {
        fallbackText = `আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ! 🌙✨\n\nPeaceverse24.com পরিবারের পক্ষ থেকে আপনাকে আন্তরিক স্বাগতম (Welcome)!\n\n✅ এখানে আপনি পাচ্ছেন:\n• ১০০% হালাল ও শালীন সামাজিক যোগাযোগ মাধ্যম\n• গ্লোবাল নামাজের সময়সূচী, কুরআন ও কিবলা কম্পাস\n• পেইজ তৈরি ও শরিয়াহ সম্মত ক্রিয়েটর মনিটাইজেশন\n• হালাল মার্কেটপ্লেস ও বিশ্বব্যাপী উম্মাহর সাথে সংযোগ\n\nআপনার সুন্দর ও কল্যাণকর কনটেন্ট শেয়ার করে আমাদের সাথেই থাকুন। জাজাকাল্লাহু খাইরান! 🤍`;
      } else if (promptToSend.includes('জুমার')) {
        fallbackText = `আলহামদুলিল্লাহ! জুমার দিনের বিশেষ আমলসমূহ:\n\n১. বেশি বেশি দরুদ শরিফ পাঠ করুন।\n২. সূরা আল-কাহাফ তিলাওয়াত করুন।\n৩. উত্তম পোশাক পরিধান ও আতর ব্যবহার করুন।\n৪. খুতবা মনোযোগ সহকারে শ্রবণ করুন।\n\n— Peaceverse24.com এডমিন বার্তা 🕌`;
      } else if (promptToSend.includes('বিজ্ঞাপন')) {
        fallbackText = `💡 Peaceverse24.com বিজ্ঞাপন আয় বৃদ্ধির জন্য ৫টি কৌশল:\n\n১. হোম ফিডে প্রতি ৩টি পোস্ট পর পর ১টি ভেরিফাইড হালাল স্পন্সর প্রদর্শন।\n২. রিলস ও ওয়াচ ট্যাবে স্পন্সরশিপ ব্যানার চালু রাখা।\n৩. মার্কেটপ্লেস টপ ব্যানারে হালাল শপগুলোর প্রিমিয়াম স্লট বরাদ্দ।\n৪. স্টোরি বারের নিচে স্পন্সরড হাইলাইট চালু রাখা।\n৫. ক্রিয়েটরদের জন্য ৫৫% স্বচ্ছ রেভিনিউ শেয়ার বজায় রাখা।`;
      } else if (promptToSend.includes('মনিটাইজেশন') || promptToSend.includes('আয়')) {
        fallbackText = `💰 Peaceverse24.com পেইজ ও ক্রিয়েটর মনিটাইজেশন গাইড:\n\n১. পেইজে নিয়মিত মানসম্মত, অরিজিনাল ও হালাল ভিডিও/পোস্ট আপলোড করুন।\n২. ৫,০০০ ফলোয়ার্স পূর্ণ হলে অ্যাডমিন প্যানেল থেকে মনিটাইজেশন চালু করে দেওয়া হয়।\n৩. আয়ের ৫৫% ক্রিয়েটর পাবেন এবং বিকাশ/নগদ/ব্যাংক/PayPal-এর মাধ্যমে পেআউট নিতে পারবেন।`;
      } else {
        fallbackText = `আলহামদুলিল্লাহ! আপনার লেখা ("${promptToSend}") গ্রহণ করা হয়েছে।\n\nPeaceverse24.com অ্যাডমিন প্যানেল থেকে আপনি সরাসরি ইউজার কন্ট্রোল, পেইজ মনিটাইজেশন, বিজ্ঞাপন প্লেসমেন্ট এবং ব্রডকাস্ট নোটিফিকেশন পরিচালনা করতে পারবেন।`;
      }

      setAiResponse(fallbackText);
      recordHistory(fallbackText);
      if (
        promptToSend.includes('পোস্ট') ||
        promptToSend.includes('জুমার') ||
        promptToSend.includes('মেসেজ') ||
        promptToSend.includes('ওয়েলকাম') ||
        qLower.includes('welcome')
      ) {
        setAiGeneratedPostDraft({
          title: 'অ্যাডমিন অফিসিয়াল বার্তা',
          content: fallbackText,
        });
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Publish AI draft to Main Feed
  const handlePublishAIDraftToFeed = () => {
    if (!aiGeneratedPostDraft) return;

    const newPost: PostItem = {
      id: `post-admin-${Date.now()}`,
      author: {
        name: 'Peaceverse24.com Official Admin',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        verified: true,
        subtitle: 'অফিসিয়াল বার্তা • 🌐',
      },
      timeAgo: 'এখনই',
      isPublic: true,
      contentBangla: aiGeneratedPostDraft.content,
      category: 'Community',
      mediaType: 'none',
      reactions: {
        total: 1,
        likeCount: 1,
        loveCount: 0,
        subhanallahCount: 0,
        mashaallahCount: 0,
      },
      userReaction: 'like',
      comments: [],
      sharesCount: 0,
    };

    onAddPostToFeed(newPost);
    setAiGeneratedPostDraft(null);
    showToast('🎉 পোস্টটি মূল ফিডে সফলভাবে প্রকাশিত হয়েছে!');
  };

  // Toggle Ad Slot Active
  const handleToggleAd = (adId: string) => {
    setAds((prev) =>
      prev.map((a) => (a.id === adId ? { ...a, isActive: !a.isActive } : a))
    );
    showToast('বিজ্ঞাপন স্ট্যাটাস পরিবর্তন করা হয়েছে');
  };

  // Delete Ad Slot
  const handleDeleteAd = (adId: string) => {
    setAds((prev) => prev.filter((a) => a.id !== adId));
    showToast('বিজ্ঞাপন স্লট ডিলিট করা হয়েছে');
  };

  // Create New Ad Campaign
  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSponsor.trim() || !newAdTitle.trim()) {
      showToast('দয়া করে স্পন্সর ও বিজ্ঞাপনের শিরোনাম লিখুন');
      return;
    }

    const created: AdSlot = {
      id: `ad-slot-${Date.now()}`,
      slotName: `${newSponsor} (${newAdPlacement})`,
      placement: newAdPlacement,
      sponsorName: newSponsor.trim(),
      adTitle: newAdTitle.trim(),
      adDescription: newAdDesc.trim() || '১০০% হালাল ভেরিফাইড ক্যাম্পেইন',
      imageUrl: newAdImage.trim(),
      targetUrl: newAdTargetUrl.trim() || 'https://peaceverse24.com',
      cpmRate: Number(newAdCpm) || 150,
      cpcRate: Number(newAdCpc) || 6.0,
      impressions: 0,
      clicks: 0,
      totalEarnings: 0,
      isActive: true,
      category: 'স্পন্সরড ক্যাম্পেইন',
    };

    setAds((prev) => [created, ...prev]);
    setShowNewAdModal(false);
    setNewSponsor('');
    setNewAdTitle('');
    setNewAdDesc('');
    setNewAdTargetUrl('https://peaceverse24.com');
    showToast(`🎉 "${created.adTitle}" বিজ্ঞাপনটি লাইভ প্লেসমেন্টে যুক্ত হয়েছে!`);
  };

  // Approve / Reject Creator Monetization
  const handleCreatorStatus = (creatorId: string, status: 'approved' | 'rejected') => {
    setCreators((prev) =>
      prev.map((c) => (c.id === creatorId ? { ...c, status } : c))
    );
    showToast(status === 'approved' ? 'ক্রিয়েটর মনিটাইজেশন অনুমোদন করা হয়েছে! ✓' : 'আবেদন বাতিল করা হয়েছে');
  };

  // Approve Payout Request
  const handleApprovePayout = (payoutId: string) => {
    setPayouts((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? { ...p, status: 'paid', transactionId: `TXN${Math.floor(10000000 + Math.random() * 90000000)}` }
          : p
      )
    );
    showToast('টাকা সফলভাবে প্রদান ও অনুমোদন করা হয়েছে! ✓');
  };

  // Calculations
  const totalAdRevenue = ads.reduce((sum, a) => sum + a.totalEarnings, 0);
  const totalCreatorPaid = creators.reduce((sum, c) => sum + c.paidEarnings, 0);
  const totalPendingPayouts = payouts.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const netPlatformProfit = totalAdRevenue - totalCreatorPaid;
  const totalImpressions = ads.reduce((sum, a) => sum + a.impressions, 0);
  const totalClicks = ads.reduce((sum, a) => sum + a.clicks, 0);

  const filteredUsers = platformStats.users.filter((u) => {
    const ov = userOverrides[u.uid];
    const isVerified = ov?.verifiedOverride !== undefined ? ov.verifiedOverride : u.verified;
    const isSuspended = Boolean(ov?.suspended);

    if (userFilter === 'active24h' && !u.isActive24h) return false;
    if (userFilter === 'active7d' && !u.isActive7d) return false;
    if (userFilter === 'verified' && !isVerified) return false;
    if (userFilter === 'suspended' && !isSuspended) return false;

    const q = userSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const filteredPages = pageControls.filter((p) => {
    if (pageStatusFilter !== 'all' && p.status !== pageStatusFilter) return false;
    const q = pageSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.pageName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const approvedPagesCount = pageControls.filter((p) => p.status === 'approved').length;
  const pendingPagesCount = pageControls.filter((p) => p.status === 'pending').length;

  // -------------------------------------------------------------
  // LOGIN SCREEN (Standalone Security Gate - NO public credentials hint)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] text-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E4E6EB] shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0866FF] to-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-9 h-9 text-white stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-black text-black tracking-tight">Peaceverse24.com</h1>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0866FF]">
              Standalone Master Admin Panel
            </p>
            <p className="text-xs text-[#65676B]">
              ইউজার, পেজ, মনিটাইজেশন ও বিজ্ঞাপন প্লেসমেন্ট কন্ট্রোল সেন্টার
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1">অ্যাডমিন ইউজারনেম (Admin Username)</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Enter admin username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl pl-9 pr-4 py-2.5 text-sm text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF] focus:bg-white"
                />
                <User className="w-4 h-4 text-[#65676B] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">অ্যাডমিন পাসওয়ার্ড (Password)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter admin password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl pl-9 pr-10 py-2.5 text-sm text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF] focus:bg-white"
                />
                <Lock className="w-4 h-4 text-[#65676B] absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-[#65676B] hover:text-black cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-rose-700 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-sm shadow-md active:scale-98 transition-all cursor-pointer"
            >
              অ্যাডমিন প্যানেলে প্রবেশ করুন (Sign In)
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[#E4E6EB]">
            <button
              onClick={onBackToApp}
              className="text-xs font-bold text-[#65676B] hover:text-black flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Peaceverse24.com মূল সাইটে ফিরে যান</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED STANDALONE MASTER ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black font-sans pb-24">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E6EB] px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBackToApp}
              className="p-2 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black transition-colors cursor-pointer shrink-0"
              title="মূল অ্যাপে ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0866FF] to-emerald-500 flex items-center justify-center text-white shadow shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-black text-black flex items-center gap-2 truncate">
                  <span>Peaceverse24.com Admin</span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    Live Control
                  </span>
                </h1>
                <p className="text-[10px] text-[#65676B] truncate">
                  Users · Pages · Monetization · Ad Placements · Moderation
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={refreshLiveStats}
              disabled={loadingStats}
              className="px-3 py-1.5 rounded-xl bg-[#E7F3FF] hover:bg-[#D8EAFE] text-[#0866FF] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">রিফ্রেশ</span>
            </button>

            <button
              onClick={onBackToApp}
              className="px-3 py-1.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-xs font-bold text-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">মূল সাইট</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 border-t border-[#E4E6EB] mt-2">
          {[
            { id: 'dashboard', label: '📊 ওভারভিউ' },
            { id: 'users', label: `👥 ইউজার (${platformStats.totalUsers})` },
            { id: 'pages', label: `📄 পেইজ ও মনিটাইজেশন (${pageControls.length})` },
            { id: 'ads', label: `📢 অ্যাড প্লেসমেন্ট (${ads.filter((a) => a.isActive).length})` },
            { id: 'monetization', label: '💰 ক্রিয়েটর আয়' },
            {
              id: 'payouts',
              label: `💸 পেআউট (${goldenCashoutRequests.filter((r) => r.status === 'pending').length})`,
            },
            { id: 'moderation', label: `📝 মডারেশন (${posts.length})` },
            { id: 'broadcast', label: '📣 ব্রডকাস্ট' },
            { id: 'ai', label: '🤖 এআই সহকারী' },
            { id: 'settings', label: '⚙️ পাসওয়ার্ড ও সেটিংস' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#0866FF] text-white shadow-sm'
                  : 'bg-[#F0F2F5] text-black hover:bg-[#E4E6EB] border border-[#E4E6EB]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Real-Time Platform Health Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveTab('users')}
                className="bg-white p-4 rounded-2xl border border-[#E4E6EB] shadow-2xs space-y-1.5 cursor-pointer hover:border-[#0866FF] transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-[#65676B]">
                  <span>মোট ও অ্যাক্টিভ ইউজার (Live Firestore)</span>
                  <Users className="w-4 h-4 text-[#0866FF]" />
                </div>
                <div className="text-2xl font-black text-black">
                  {platformStats.totalUsers.toLocaleString()} জন
                </div>
                <p className="text-[11px] text-emerald-600 font-bold">
                  🟢 আজ অ্যাক্টিভ (24h): {platformStats.activeUsers24h} • 7d: {platformStats.activeUsers7d}
                </p>
              </div>

              <div
                onClick={() => setActiveTab('pages')}
                className="bg-white p-4 rounded-2xl border border-[#E4E6EB] shadow-2xs space-y-1.5 cursor-pointer hover:border-emerald-500 transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-[#65676B]">
                  <span>মোট পেইজ ও মনিটাইজেশন</span>
                  <Flag className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-black">
                  {pageControls.length} টি পেইজ
                </div>
                <p className="text-[11px] text-emerald-700 font-bold">
                  ✓ মনিটাইজড: {approvedPagesCount} • ⏳ পেন্ডিং: {pendingPagesCount}
                </p>
              </div>

              <div
                onClick={() => setActiveTab('ads')}
                className="bg-white p-4 rounded-2xl border border-[#E4E6EB] shadow-2xs space-y-1.5 cursor-pointer hover:border-amber-500 transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-[#65676B]">
                  <span>মোট বিজ্ঞাপন আয় (Ad Revenue)</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-black">৳ {totalAdRevenue.toLocaleString()}</div>
                <p className="text-[11px] text-[#0866FF] font-bold">
                  সক্রিয় অ্যাড: {ads.filter((a) => a.isActive).length}টি • {totalClicks.toLocaleString()} ক্লিক
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB] shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#65676B]">
                  <span>নেট প্রফিট ও পোস্ট (Posts & Profit)</span>
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-black">৳ {netPlatformProfit.toLocaleString()}</div>
                <p className="text-[11px] text-[#65676B] font-semibold">
                  মোট পোস্ট: {Math.max(platformStats.totalPosts, posts.length)} • ফলো/ফ্রেন্ড: {platformStats.totalFollows}
                </p>
              </div>
            </div>

            {/* Ad Placement Quick Overview Banner */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E4E6EB] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-black">কোথায় কোথায় বিজ্ঞাপন চালু আছে (Active Ad Placements)</h3>
                  <p className="text-xs text-[#65676B]">যেকোনো জায়গার বিজ্ঞাপন এক ক্লিকে অন/অফ করুন</p>
                </div>
                <button
                  onClick={() => setActiveTab('ads')}
                  className="text-xs font-bold text-[#0866FF] hover:underline cursor-pointer"
                >
                  বিস্তারিত কন্ট্রোল →
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {[
                  { key: 'home_feed_enabled' as const, title: 'হোম ফিড (Home Feed)' },
                  { key: 'reels_preroll_enabled' as const, title: 'রিলস ও ওয়াচ (Reels)' },
                  { key: 'marketplace_top_enabled' as const, title: 'মার্কেটপ্লেস (Marketplace)' },
                  { key: 'story_ad_enabled' as const, title: 'স্টোরি ব্যানার (Story Bar)' },
                ].map((slot) => {
                  const enabled = placementConfig[slot.key];
                  return (
                    <button
                      key={slot.key}
                      type="button"
                      onClick={() => {
                        setPlacementConfig((prev) => ({ ...prev, [slot.key]: !prev[slot.key] }));
                        showToast(`${slot.title} ${enabled ? 'বন্ধ' : 'চালু'} করা হয়েছে`);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        enabled
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-[#F0F2F5] border-[#E4E6EB] text-[#65676B]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{slot.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${enabled ? 'bg-emerald-600 text-white' : 'bg-[#D8DADF] text-black'}`}>
                          {enabled ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('users')}
                className="p-4 rounded-2xl bg-white border border-[#E4E6EB] hover:border-[#0866FF] text-left space-y-2 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-black">ইউজার লিস্ট ও অ্যাক্টিভ স্ট্যাটাস</h3>
                <p className="text-xs text-[#65676B]">সকল রেজিস্টার্ড ইউজার দেখুন, ভেরিফাই বা সাসপেন্ড করুন</p>
              </button>

              <button
                onClick={() => setActiveTab('pages')}
                className="p-4 rounded-2xl bg-white border border-[#E4E6EB] hover:border-emerald-500 text-left space-y-2 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Flag className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-black">পেইজ ও পেইজ মনিটাইজেশন</h3>
                <p className="text-xs text-[#65676B]">পেইজের মনিটাইজেশন অনুমোদন, পজ ও রেভিনিউ শেয়ার নিয়ন্ত্রণ</p>
              </button>

              <button
                onClick={() => {
                  setActiveTab('ads');
                  setShowNewAdModal(true);
                }}
                className="p-4 rounded-2xl bg-white border border-[#E4E6EB] hover:border-[#0866FF] text-left space-y-2 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-sm text-black">নতুন বিজ্ঞাপন বসান</h3>
                <p className="text-xs text-[#65676B]">হোম ফিড, রিলস, মার্কেটপ্লেস বা স্টোরিতে নতুন অ্যাড সেট করুন</p>
              </button>

              <button
                onClick={() => setActiveTab('broadcast')}
                className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-left space-y-2 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-black">সকল ইউজারকে ব্রডকাস্ট</h3>
                <p className="text-xs text-[#65676B]">এক ক্লিকে সকল ইউজারের নোটিফিকেশন বেল ও পুশে বার্তা পাঠান</p>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: USERS & ACTIVE USERS DIRECTORY */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB]">
                <span className="text-xs text-[#65676B]">মোট রেজিস্টার্ড ইউজার</span>
                <p className="text-2xl font-black text-black mt-1">{platformStats.totalUsers}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-200">
                <span className="text-xs text-emerald-700 font-bold">গত ২৪ ঘণ্টায় অ্যাক্টিভ</span>
                <p className="text-2xl font-black text-emerald-700 mt-1">{platformStats.activeUsers24h}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB]">
                <span className="text-xs text-[#0866FF] font-bold">গত ৭ দিনে অ্যাক্টিভ</span>
                <p className="text-2xl font-black text-[#0866FF] mt-1">{platformStats.activeUsers7d}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB]">
                <span className="text-xs text-[#65676B]">মোট ফ্রেন্ড / ফলো কানেকশন</span>
                <p className="text-2xl font-black text-black mt-1">{platformStats.totalFollows}</p>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-black">ইউজার ডিরেক্টরি ও কন্ট্রোল (Firestore Live Users)</h2>
                  <p className="text-xs text-[#65676B]">
                    যেকোনো ইউজার খুঁজুন, অ্যাক্টিভ সময় দেখুন এবং ভেরিফাই বা সাসপেন্ড করুন
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#65676B] absolute left-3 top-2.5" />
                  <input
                    type="search"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="নাম, @username বা ইমেইল লিখুন..."
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl pl-9 pr-3 py-2 text-xs text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
                {[
                  { id: 'all', label: `সকল ইউজার (${platformStats.totalUsers})` },
                  { id: 'active24h', label: `🟢 ২৪ ঘণ্টায় অ্যাক্টিভ (${platformStats.activeUsers24h})` },
                  { id: 'active7d', label: `📅 ৭ দিনে অ্যাক্টিভ (${platformStats.activeUsers7d})` },
                  { id: 'verified', label: '✓ ভেরিফায়েড' },
                  { id: 'suspended', label: '🚫 সাসপেন্ডেড' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setUserFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer ${
                      userFilter === f.id
                        ? 'bg-[#0866FF] text-white'
                        : 'bg-[#F0F2F5] text-black hover:bg-[#E4E6EB] border border-[#E4E6EB]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {loadingStats ? (
                <div className="py-10 text-center text-xs text-[#65676B]">
                  Firestore থেকে ইউজার তথ্য লোড হচ্ছে...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#65676B] bg-[#F0F2F5] rounded-xl">
                  কোনো ইউজার পাওয়া যায়নি।
                </div>
              ) : (
                <div className="divide-y divide-[#E4E6EB]">
                  {filteredUsers.map((usr) => {
                    const ov = userOverrides[usr.uid];
                    const isVerified = ov?.verifiedOverride !== undefined ? ov.verifiedOverride : usr.verified;
                    const isSuspended = Boolean(ov?.suspended);

                    return (
                      <div
                        key={usr.uid}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={usr.avatar}
                              alt={usr.displayName}
                              className="w-11 h-11 rounded-full object-cover border border-[#E4E6EB]"
                            />
                            {usr.isActive24h && (
                              <span
                                className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"
                                title="Active within 24h"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-black flex items-center gap-1.5 truncate">
                              <span className="truncate">{usr.displayName}</span>
                              {isVerified && (
                                <span className="px-1.5 py-0.5 rounded-full bg-[#E7F3FF] text-[#0866FF] text-[10px] font-bold">
                                  ✓ Verified
                                </span>
                              )}
                              {isSuspended && (
                                <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                                  Suspended
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-[#65676B] truncate">
                              {usr.username ? `@${usr.username}` : usr.uid}
                              {usr.email ? ` • ${usr.email}` : ''}
                            </p>
                            <p className="text-[10px] text-[#65676B]">
                              শেষ অ্যাক্টিভিটি:{' '}
                              {usr.updatedAt
                                ? new Date(usr.updatedAt).toLocaleString('bn-BD')
                                : 'তথ্য নেই'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleUserOverride(usr.uid, 'verifiedOverride')}
                            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer border ${
                              isVerified
                                ? 'bg-[#E7F3FF] text-[#0866FF] border-[#0866FF]/30'
                                : 'bg-[#F0F2F5] text-black border-[#E4E6EB] hover:bg-[#E4E6EB]'
                            }`}
                          >
                            {isVerified ? '✓ ভেরিফায়েড' : 'ভেরিফাই দিন'}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleUserOverride(usr.uid, 'suspended')}
                            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer border ${
                              isSuspended
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            {isSuspended ? 'আনব্লক করুন' : 'সাসপেন্ড'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: PAGES & PAGE MONETIZATION CONTROL */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'pages' && (
          <div className="space-y-5">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB]">
                <span className="text-xs text-[#65676B]">মোট পেইজ সংখ্যা</span>
                <p className="text-2xl font-black text-black mt-1">{pageControls.length}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-200">
                <span className="text-xs text-emerald-700 font-bold">মনিটাইজেশন চালু (Approved)</span>
                <p className="text-2xl font-black text-emerald-700 mt-1">{approvedPagesCount}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-amber-200">
                <span className="text-xs text-amber-700 font-bold">আবেদন অপেক্ষমাণ (Pending)</span>
                <p className="text-2xl font-black text-amber-700 mt-1">{pendingPagesCount}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB]">
                <span className="text-xs text-[#65676B]">সকল পেইজের মোট ফলোয়ার্স</span>
                <p className="text-2xl font-black text-[#0866FF] mt-1">
                  {pageControls.reduce((sum, p) => sum + (p.followersCount || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Page Controls Panel */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E4E6EB] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-black">
                    পেইজ ও পেইজ মনিটাইজেশন কন্ট্রোল (Pages & Monetization)
                  </h2>
                  <p className="text-xs text-[#65676B]">
                    পেইজগুলোর মনিটাইজেশন চালু/স্থগিত/বাতিল করুন, ইন-স্ট্রিম ও রিলস অ্যাড নিয়ন্ত্রণ করুন এবং রেভিনিউ শেয়ার % সেট করুন
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddPageModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>নতুন পেইজ নিবন্ধন</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
                  {[
                    { id: 'all', label: `সব পেইজ (${pageControls.length})` },
                    { id: 'approved', label: `✓ চালু (${approvedPagesCount})` },
                    { id: 'pending', label: `⏳ পেন্ডিং (${pendingPagesCount})` },
                    { id: 'paused', label: '⏸️ পজড' },
                    { id: 'rejected', label: '✕ বাতিল' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setPageStatusFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer ${
                        pageStatusFilter === f.id
                          ? 'bg-[#0866FF] text-white'
                          : 'bg-[#F0F2F5] text-black hover:bg-[#E4E6EB] border border-[#E4E6EB]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#65676B] absolute left-3 top-2" />
                  <input
                    type="search"
                    value={pageSearchQuery}
                    onChange={(e) => setPageSearchQuery(e.target.value)}
                    placeholder="পেইজের নাম খুঁজুন..."
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl pl-9 pr-3 py-1.5 text-xs text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                  />
                </div>
              </div>

              {filteredPages.length === 0 ? (
                <div className="py-10 text-center bg-[#F0F2F5] rounded-2xl border border-[#E4E6EB] space-y-2">
                  <Flag className="w-8 h-8 text-[#65676B] mx-auto" />
                  <p className="text-xs font-bold text-black">এখনো কোনো পেইজ যুক্ত হয়নি</p>
                  <p className="text-[11px] text-[#65676B]">
                    অ্যাপে নতুন পেইজ তৈরি করলে অথবা উপরের "নতুন পেইজ নিবন্ধন" বাটনে ক্লিক করলে এখানে দেখাবে।
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPages.map((pg) => (
                    <div
                      key={pg.pageId}
                      className="p-4 rounded-2xl bg-[#F0F2F5] border border-[#E4E6EB] space-y-3 text-xs"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              pg.avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(pg.pageName)}&backgroundColor=0866ff,10b981`
                            }
                            alt={pg.pageName}
                            className="w-12 h-12 rounded-xl object-cover border border-[#E4E6EB] bg-white shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-black truncate">{pg.pageName}</h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  pg.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : pg.status === 'paused'
                                    ? 'bg-amber-100 text-amber-800'
                                    : pg.status === 'rejected'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-blue-100 text-[#0866FF]'
                                }`}
                              >
                                {pg.status === 'approved'
                                  ? 'মনিটাইজেশন চালু ✓'
                                  : pg.status === 'paused'
                                  ? 'স্থগিত (Paused)'
                                  : pg.status === 'rejected'
                                  ? 'বাতিল (Rejected)'
                                  : 'অপেক্ষমাণ (Pending)'}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#65676B] truncate">
                              {pg.category} • {pg.followersCount.toLocaleString()} ফলোয়ার্স
                            </p>
                          </div>
                        </div>

                        {/* Status Controls */}
                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updatePageMonetizationStatus(pg.pageId, 'approved')}
                            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer ${
                              pg.status === 'approved'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>চালু / Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => updatePageMonetizationStatus(pg.pageId, 'paused')}
                            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer ${
                              pg.status === 'paused'
                                ? 'bg-amber-600 text-white'
                                : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50'
                            }`}
                          >
                            <PauseCircle className="w-3.5 h-3.5" />
                            <span>পজ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => updatePageMonetizationStatus(pg.pageId, 'rejected')}
                            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer ${
                              pg.status === 'rejected'
                                ? 'bg-rose-600 text-white'
                                : 'bg-white border border-rose-300 text-rose-700 hover:bg-rose-50'
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>বাতিল</span>
                          </button>
                        </div>
                      </div>

                      {/* Ad Formats & Revenue Share Controls */}
                      <div className="pt-3 border-t border-[#E4E6EB] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-[#E4E6EB] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pg.inStreamAdsEnabled}
                              onChange={() => togglePageAdFormat(pg.pageId, 'inStreamAdsEnabled')}
                              className="accent-[#0866FF]"
                            />
                            <span className="font-semibold text-black">In-Stream Ads</span>
                          </label>
                          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-[#E4E6EB] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pg.reelsAdsEnabled}
                              onChange={() => togglePageAdFormat(pg.pageId, 'reelsAdsEnabled')}
                              className="accent-[#0866FF]"
                            />
                            <span className="font-semibold text-black">Reels Ads</span>
                          </label>
                          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-[#E4E6EB] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pg.starsEnabled}
                              onChange={() => togglePageAdFormat(pg.pageId, 'starsEnabled')}
                              className="accent-amber-500"
                            />
                            <span className="font-semibold text-black">Golden Stars</span>
                          </label>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E4E6EB]">
                            <span className="text-[#65676B] font-semibold">পেইজ শেয়ার:</span>
                            <select
                              value={pg.revenueShareCreatorPct}
                              onChange={(e) => updatePageRevenueShare(pg.pageId, Number(e.target.value))}
                              className="font-bold text-[#0866FF] bg-transparent focus:outline-none cursor-pointer"
                            >
                              <option value={50}>50% Creator / 50% Admin</option>
                              <option value={55}>55% Creator / 45% Admin</option>
                              <option value={60}>60% Creator / 40% Admin</option>
                              <option value={70}>70% Creator / 30% Admin</option>
                            </select>
                          </div>
                          <div className="bg-white px-3 py-1.5 rounded-xl border border-[#E4E6EB] font-mono">
                            <span className="text-[#65676B]">আয়: </span>
                            <span className="font-bold text-emerald-700">৳{pg.totalEarnings.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: ADS & PLACEMENTS ("কোথায় অ্যাড বসাবো") */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            {/* Section A: Global Ad Placement Map ("কোথায় কোথায় অ্যাড বসবে") */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E4E6EB] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-black flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#0866FF]" />
                    <span>কোথায় বিজ্ঞাপন বসাবেন (Ad Placement Controls)</span>
                  </h2>
                  <p className="text-xs text-[#65676B]">
                    Peaceverse24.com এর কোন কোন অংশে লাইভ বিজ্ঞাপন প্রদর্শিত হবে তা এখান থেকে নিয়ন্ত্রণ করুন
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-[#F0F2F5] px-3 py-1.5 rounded-xl border border-[#E4E6EB] text-xs">
                  <span className="font-semibold text-black">ফিডে অ্যাড গ্যাপ:</span>
                  <select
                    value={placementConfig.home_feed_frequency}
                    onChange={(e) =>
                      setPlacementConfig((prev) => ({
                        ...prev,
                        home_feed_frequency: Number(e.target.value) || 3,
                      }))
                    }
                    className="font-bold text-[#0866FF] bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value={2}>প্রতি ২টি পোস্ট পর</option>
                    <option value={3}>প্রতি ৩টি পোস্ট পর</option>
                    <option value={4}>প্রতি ৪টি পোস্ট পর</option>
                    <option value={5}>প্রতি ৫টি পোস্ট পর</option>
                    <option value={8}>প্রতি ৮টি পোস্ট পর</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {[
                  {
                    key: 'home_feed_enabled' as const,
                    placement: 'home_feed',
                    title: '১. হোম ফিড (Home Feed)',
                    desc: `প্রতি ${placementConfig.home_feed_frequency}টি পোস্ট পর স্পন্সরড কার্ড দেখাবে`,
                  },
                  {
                    key: 'reels_preroll_enabled' as const,
                    placement: 'reels_preroll',
                    title: '২. রিলস ও ওয়াচ (Reels/Watch)',
                    desc: 'ভিডিও ও রিলস সেকশনের উপরে ব্যানার অ্যাড দেখাবে',
                  },
                  {
                    key: 'marketplace_top_enabled' as const,
                    placement: 'marketplace_top',
                    title: '৩. মার্কেটপ্লেস টপ (Marketplace)',
                    desc: 'মার্কেটপ্লেসের প্রোডাক্ট গ্রিডের উপরে প্রদর্শিত হবে',
                  },
                  {
                    key: 'story_ad_enabled' as const,
                    placement: 'story_ad',
                    title: '৪. স্টোরি ব্যানার (Story Bar)',
                    desc: 'হোম পেজের স্টোরি সেকশনের নিচে হাইলাইট হবে',
                  },
                ].map((slot) => {
                  const isOn = placementConfig[slot.key];
                  const activeCount = ads.filter((a) => a.placement === slot.placement && a.isActive).length;
                  return (
                    <div
                      key={slot.key}
                      className={`p-4 rounded-2xl border space-y-2.5 transition-all ${
                        isOn ? 'bg-emerald-50/70 border-emerald-200' : 'bg-[#F0F2F5] border-[#E4E6EB]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-black">{slot.title}</h4>
                        <button
                          type="button"
                          onClick={() => {
                            setPlacementConfig((prev) => ({ ...prev, [slot.key]: !prev[slot.key] }));
                            showToast(`${slot.title} ${isOn ? 'বন্ধ' : 'চালু'} করা হয়েছে`);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                            isOn ? 'bg-emerald-600 text-white' : 'bg-[#D8DADF] text-black'
                          }`}
                        >
                          {isOn ? 'চালু (ON)' : 'বন্ধ (OFF)'}
                        </button>
                      </div>
                      <p className="text-[11px] text-[#65676B]">{slot.desc}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-[#E4E6EB]/70">
                        <span className="text-[10px] font-bold text-[#0866FF]">
                          সক্রিয় অ্যাড: {activeCount}টি
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setNewAdPlacement(slot.placement as any);
                            setShowNewAdModal(true);
                          }}
                          className="text-[11px] font-bold text-black hover:text-[#0866FF] cursor-pointer"
                        >
                          + অ্যাড বসান
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section B: Ads Table & Campaign Ledger */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E4E6EB] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-black">বিজ্ঞাপন স্লট ও সম্পূর্ণ হিসাব (Ad Campaigns Ledger)</h2>
                  <p className="text-xs text-[#65676B]">
                    স্লট প্রতি ইমপ্রেশন, ক্লিক, CPM/CPC রেট ও অর্জিত মোট রাজস্বের হিসাব
                  </p>
                </div>
                <button
                  onClick={() => setShowNewAdModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>নতুন বিজ্ঞাপন যোগ করুন</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F0F2F5] text-[#65676B] uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3 rounded-l-xl">বিজ্ঞাপন / স্পন্সর</th>
                      <th className="p-3">প্লেসমেন্ট (কোথায় বসবে)</th>
                      <th className="p-3">ভিউ / ক্লিক</th>
                      <th className="p-3">CPM / CPC</th>
                      <th className="p-3">মোট আয় (৳)</th>
                      <th className="p-3 rounded-r-xl">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E6EB] text-black">
                    {ads.map((ad) => (
                      <tr key={ad.id} className="hover:bg-[#F0F2F5]/60 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img src={ad.imageUrl} alt={ad.adTitle} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            <div>
                              <p className="font-bold text-black">{ad.adTitle}</p>
                              <p className="text-[10px] text-[#65676B]">{ad.sponsorName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-md bg-[#F0F2F5] border border-[#E4E6EB] text-black text-[10px] font-mono">
                            {ad.placement}
                          </span>
                        </td>
                        <td className="p-3 font-mono">
                          {ad.impressions.toLocaleString()} / {ad.clicks.toLocaleString()}
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          ৳{ad.cpmRate}/1k <br />
                          <span className="text-[#65676B]">৳{ad.cpcRate}/click</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-700 text-sm">
                          ৳ {ad.totalEarnings.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleAd(ad.id)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                                ad.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-[#F0F2F5] text-[#65676B] border border-[#E4E6EB] hover:bg-[#E4E6EB]'
                              }`}
                            >
                              {ad.isActive ? 'সক্রিয় ✓' : 'পজ ✕'}
                            </button>
                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              className="p-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                              title="ডিলিট"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[#65676B]">সর্বমোট বিজ্ঞাপন রাজস্ব আয়:</span>
                  <p className="text-xl font-black text-emerald-700">৳ {totalAdRevenue.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[#65676B] block">ক্রিয়েটর শেয়ার (৫৫%):</span>
                    <span className="font-bold text-[#0866FF]">৳ {(totalAdRevenue * 0.55).toFixed(0)}</span>
                  </div>
                  <div>
                    <span className="text-[#65676B] block">প্ল্যাটফর্ম শেয়ার (৪৫%):</span>
                    <span className="font-bold text-purple-700">৳ {(totalAdRevenue * 0.45).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: CREATOR MONETIZATION */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'monetization' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-black flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>ক্রিয়েটর মনিটাইজেশন পলিসি ও রেভিনিউ শেয়ার</span>
                </h3>
                <p className="text-xs text-[#65676B] mt-0.5">
                  শর্ত: কমপক্ষে ৫,০০০ ফলোয়ার্স / ৯৫%+ হালাল স্কোর এবং অরিজিনাল কনটেন্ট।
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700">৫৫% ক্রিয়েটর / ৪৫% প্ল্যাটফর্ম</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E4E6EB] space-y-4">
              <h3 className="font-bold text-sm text-black">মনিটাইজেশন আবেদন ও ক্রিয়েটর আর্নিং তালিকা</h3>
              <div className="space-y-3">
                {creators.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 bg-[#F0F2F5] rounded-xl border border-[#E4E6EB] flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-black">{c.name}</h4>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                            হালাল স্কোর: {c.halalScore}%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#65676B]">{c.category}</p>
                        <p className="text-[10px] text-[#65676B]">
                          {c.followersCount} ফলোয়ার্স • {c.totalViews.toLocaleString()} মোট ভিউ • {c.payoutMethod}: {c.accountNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-[#E4E6EB]">
                      <div className="text-right">
                        <span className="text-[10px] text-[#65676B] block">মোট আয়</span>
                        <span className="font-bold text-xs sm:text-sm text-emerald-700 font-mono">
                          ৳ {c.totalEarnings.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#65676B] block">পরিশোধিত</span>
                        <span className="font-bold text-xs text-black font-mono">
                          ৳ {c.paidEarnings.toLocaleString()}
                        </span>
                      </div>
                      {c.status === 'approved' ? (
                        <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                          অনুমোদিত ✓
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCreatorStatus(c.id, 'approved')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                          >
                            অনুমোদন দিন
                          </button>
                          <button
                            onClick={() => handleCreatorStatus(c.id, 'rejected')}
                            className="px-2.5 py-1.5 rounded-xl bg-[#E4E6EB] hover:bg-[#D8DADF] text-black text-xs font-bold cursor-pointer"
                          >
                            বাতিল
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 6: PAYOUT REQUESTS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'payouts' && (
          <div className="space-y-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E4E6EB] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-black flex items-center gap-2">
                    <span>💸 গোল্ডেন কয়েন ক্যাশআউট ও পেআউট আবেদন</span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                      {goldenCashoutRequests.filter((r) => r.status === 'pending').length} অপেক্ষমাণ
                    </span>
                  </h3>
                  <p className="text-xs text-[#65676B] mt-0.5">
                    ইউজারদের গোল্ডেন কয়েন ক্যাশআউট ও ক্রিয়েটর পেমেন্ট আবেদন অনুমোদন করুন
                  </p>
                </div>
              </div>

              {goldenCashoutRequests.length === 0 ? (
                <div className="bg-[#F0F2F5] rounded-2xl border border-[#E4E6EB] p-6 text-center text-xs text-[#65676B]">
                  এখনো কোনো গোল্ডেন কয়েন ক্যাশআউট আবেদন জমা পড়েনি।
                </div>
              ) : (
                <div className="divide-y divide-[#E4E6EB]">
                  {goldenCashoutRequests.map((req) => (
                    <div
                      key={req.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 font-black shrink-0">
                          🪙
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-black text-sm">{req.userName}</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                              {req.coinsAmount} coins
                            </span>
                            <span className="font-mono font-bold text-emerald-700">৳{req.moneyAmount}</span>
                          </div>
                          <p className="text-[11px] text-[#65676B] mt-0.5">
                            <span className="capitalize font-semibold text-black">{req.paymentMethod}</span> • {req.accountNumber}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-end">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            req.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : req.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {req.status === 'approved' ? 'Approved ✓' : req.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>

                        {req.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                onApproveGoldenCashout?.(req.id);
                                showToast('পayout অনুমোদন করা হয়েছে ✓');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onRejectGoldenCashout?.(req.id);
                                showToast('Payout বাতিল করা হয়েছে');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#E4E6EB] hover:bg-[#D8DADF] text-black font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E4E6EB] space-y-4">
              <h3 className="font-bold text-sm text-black">ক্রিয়েটর উত্তোলন রেজিস্টার (Creator Payouts)</h3>
              <div className="space-y-2.5">
                {payouts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-[#F0F2F5] rounded-xl border border-[#E4E6EB] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.creatorAvatar} alt={p.creatorName} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-black">{p.creatorName}</p>
                        <p className="text-[10px] text-[#65676B]">
                          {p.method} • {p.accountNumber} • {p.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-emerald-700 text-sm">৳ {p.amount.toLocaleString()}</span>
                      {p.status === 'paid' ? (
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                            পরিশোধিত ✓
                          </span>
                          {p.transactionId && (
                            <p className="text-[9px] text-[#65676B] font-mono mt-0.5">{p.transactionId}</p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApprovePayout(p.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs shadow-sm cursor-pointer"
                        >
                          টাকা প্রদান করুন
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 7: POST MODERATION */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-black">পোস্ট ও কনটেন্ট মডারেশন ({posts.length})</h3>
                <p className="text-xs text-[#65676B]">ব্লক, বাতিল, অনুমোদন, ডিলিট ও আপিল পরিচালনা</p>
              </div>
              <button
                onClick={() => {
                  handleAskAI('সমস্ত পোস্টের হালাল অডিট ও রিপোর্ট প্রস্তুত করুন');
                  setActiveTab('ai');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>এআই দিয়ে অডিট করুন</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
              {[
                { id: 'all', label: `সব পোস্ট (${posts.length})` },
                { id: 'blocked', label: `🚫 ব্লকড (${posts.filter((p) => p.status === 'blocked').length})` },
                { id: 'rejected', label: `⚠️ বাতিল (${posts.filter((p) => p.status === 'rejected').length})` },
                { id: 'appeals', label: `⚖️ আপিলসমূহ (${posts.filter((p) => p.appealStatus === 'pending').length})` },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setModerationFilter(btn.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer ${
                    moderationFilter === btn.id
                      ? 'bg-[#0866FF] text-white'
                      : 'bg-white text-black hover:bg-[#E4E6EB] border border-[#E4E6EB]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {posts
                .filter((p) => {
                  if (moderationFilter === 'blocked') return p.status === 'blocked';
                  if (moderationFilter === 'rejected') return p.status === 'rejected';
                  if (moderationFilter === 'appeals') return p.appealStatus === 'pending';
                  return true;
                })
                .map((post) => {
                  const isBlocked = post.status === 'blocked';
                  const isRejected = post.status === 'rejected';
                  const isApproved = !isBlocked && !isRejected;

                  return (
                    <div
                      key={post.id}
                      className={`p-4 rounded-2xl border space-y-3 text-xs ${
                        isBlocked
                          ? 'bg-rose-50 border-rose-200'
                          : isRejected
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-white border-[#E4E6EB]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E6EB] pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <img src={post.author.avatar} alt={post.author.name} className="w-9 h-9 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-black">{post.author.name}</p>
                            <p className="text-[10px] text-[#65676B]">
                              {post.timeAgo} • {post.category} • {post.privacy || 'public'}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            isBlocked
                              ? 'bg-rose-100 text-rose-700'
                              : isRejected
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isBlocked ? '🚫 ব্লকড' : isRejected ? '⚠️ বাতিল' : isApproved ? '✓ অনুমোদিত' : ''}
                        </span>
                      </div>

                      <p className="text-black leading-relaxed bg-[#F0F2F5] p-3 rounded-xl border border-[#E4E6EB]">
                        {post.contentBangla}
                      </p>

                      {post.moderationReason && (
                        <p className="text-[11px] text-amber-800 font-medium bg-amber-50 p-2 rounded-lg border border-amber-200">
                          মডারেশন কারণ: {post.moderationReason}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E4E6EB]">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              onModeratePost?.(post.id, 'approved', 'অনুমোদিত');
                              showToast('পোস্টটি অনুমোদিত ও আনব্লক করা হয়েছে');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>অনুমোদন</span>
                          </button>

                          <button
                            onClick={() => {
                              setModeratingPost({ id: post.id, action: 'blocked', author: post.author.name });
                              setModerationReasonInput('ইসলামিক শালীনতা ও Peaceverse24.com গাইডলাইন লঙ্ঘন');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                          >
                            🚫 ব্লক
                          </button>

                          <button
                            onClick={() => {
                              setModeratingPost({ id: post.id, action: 'rejected', author: post.author.name });
                              setModerationReasonInput('অনৈসলামিক বা অনুপযুক্ত কনটেন্ট হওয়ায় বাতিল');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer"
                          >
                            ⚠️ বাতিল
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            if (window.confirm('আপনি কি নিশ্চিত এই পোস্টটি চিরতরে মুছে ফেলতে চান?')) {
                              onDeletePostFromFeed(post.id);
                              showToast('পোস্ট মুছে ফেলা হয়েছে');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>মুছুন</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {moderatingPost && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-[#E4E6EB] rounded-2xl p-4 w-full max-w-md space-y-3 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
                    <h3 className="font-bold text-black text-sm">
                      পোস্ট {moderatingPost.action === 'blocked' ? 'ব্লক' : 'বাতিল'} করার কারণ
                    </h3>
                    <button onClick={() => setModeratingPost(null)} className="p-1 text-[#65676B] hover:text-black cursor-pointer">✕</button>
                  </div>
                  <textarea
                    rows={3}
                    value={moderationReasonInput}
                    onChange={(e) => setModerationReasonInput(e.target.value)}
                    placeholder="মডারেশনের কারণ লিখুন..."
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl p-3 text-xs text-black outline-none focus:border-rose-500 focus:bg-white resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModeratingPost(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#65676B] hover:bg-[#F0F2F5] cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onModeratePost?.(moderatingPost.id, moderatingPost.action, moderationReasonInput.trim());
                        showToast(`পোস্টটি সফলভাবে ${moderatingPost.action === 'blocked' ? 'ব্লক' : 'বাতিল'} করা হয়েছে`);
                        setModeratingPost(null);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                    >
                      নিশ্চিত করুন
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 8: BROADCAST */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'broadcast' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <form
              onSubmit={handleSendBroadcastNow}
              className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-[#E4E6EB] space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-[#E4E6EB] pb-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0866FF] to-emerald-500 flex items-center justify-center text-white">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-black">Send Global Broadcast</h2>
                  <p className="text-xs text-[#65676B]">
                    সব ইউজারের বেল নোটিফিকেশন ও ফিড অ্যালার্টে বার্তা পাঠান
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black mb-1">Creator / Admin Name</label>
                  <input
                    type="text"
                    value={broadcastCreatorName}
                    onChange={(e) => setBroadcastCreatorName(e.target.value)}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black mb-1">Link Route</label>
                  <input
                    type="text"
                    value={broadcastLink}
                    onChange={(e) => setBroadcastLink(e.target.value)}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Notification Title *</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Broadcast Message *</label>
                <textarea
                  rows={3}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-[#0866FF] focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Thumbnail Image URL</span>
                </label>
                <input
                  type="url"
                  value={broadcastImage}
                  onChange={(e) => setBroadcastImage(e.target.value)}
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                />
              </div>

              {broadcastProgress && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span>
                    Sent to {broadcastProgress.sent}/{broadcastProgress.total} users
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={broadcastSending}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0866FF] to-emerald-600 hover:opacity-95 disabled:opacity-60 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Megaphone className="w-5 h-5" />
                <span>{broadcastSending ? 'পাঠানো হচ্ছে...' : '📢 Send Broadcast Now'}</span>
              </button>
            </form>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-3xl border border-[#E4E6EB] space-y-3">
                <h3 className="text-xs font-bold text-black">Auto-Broadcast Controls</h3>
                <label className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] cursor-pointer">
                  <span className="text-xs font-medium text-black">Notify followers on post</span>
                  <input
                    type="checkbox"
                    checked={creatorPrefs.creatorNotifyFollowersOnPost}
                    onChange={(e) =>
                      setCreatorPrefs((prev) =>
                        savePeaceSettings({ ...prev, creatorNotifyFollowersOnPost: e.target.checked })
                      )
                    }
                    className="w-4 h-4 accent-[#0866FF]"
                  />
                </label>
                <label className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] cursor-pointer">
                  <span className="text-xs font-medium text-black">Push alert to all users</span>
                  <input
                    type="checkbox"
                    checked={creatorPrefs.creatorSendPushToAllUsers}
                    onChange={(e) =>
                      setCreatorPrefs((prev) =>
                        savePeaceSettings({ ...prev, creatorSendPushToAllUsers: e.target.checked })
                      )
                    }
                    className="w-4 h-4 accent-emerald-600"
                  />
                </label>
              </div>

              {broadcastHistory.length > 0 && (
                <div className="bg-white p-4 rounded-3xl border border-[#E4E6EB] space-y-2">
                  <h3 className="text-xs font-bold text-black">সাম্প্রতিক ব্রডকাস্ট</h3>
                  {broadcastHistory.slice(0, 4).map((b) => (
                    <div key={b.id} className="p-2.5 rounded-xl bg-[#F0F2F5] text-xs">
                      <p className="font-bold text-black truncate">{b.title}</p>
                      <p className="text-[11px] text-emerald-700 font-semibold">✓ Sent ({b.time})</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 9: AI ADMIN ASSISTANT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'ai' && (
          <div className="space-y-5">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E4E6EB] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-white shrink-0">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-black">Gemini AI এডমিন সহকারী</h2>
                  <p className="text-xs text-[#65676B]">
                    আপনার প্রশ্ন, ওয়েলকাম মেসেজ, নোটিশ বা নির্দেশনা নিচের বড় ঘরে লিখুন
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  '✨ নতুন ইউজারদের জন্য ওয়েলকাম মেসেজ লিখে দিন',
                  '🕌 জুমার দিনের বিশেষ নোটিশ পোস্ট ড্রাফট করুন',
                  '📈 বিজ্ঞাপন আয় বাড়ানোর কৌশল বলুন',
                  '📜 ক্রিয়েটর ও পেইজ মনিটাইজেশন গাইড তৈরি করুন',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAiPrompt(preset);
                      handleAskAI(preset);
                    }}
                    disabled={aiLoading}
                    className="px-3 py-1.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] border border-[#E4E6EB] text-xs font-medium text-black cursor-pointer text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Spacious Multi-Line Prompt Input Box */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black">
                    আপনার কথা / প্রশ্ন / নির্দেশ এখানে বিস্তারিত লিখুন:
                  </label>
                  <span className="text-[11px] text-[#65676B]">
                    {aiPrompt.length} অক্ষর
                  </span>
                </div>
                <textarea
                  rows={5}
                  placeholder="এখানে আপনার সমস্ত কথা, প্রশ্ন বা যেকোনো মেসেজ বিস্তারিত লিখুন... (লেখা বড় হলেও সম্পূর্ণ দেখা যাবে)"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full min-h-[140px] bg-[#F0F2F5] border-2 border-[#E4E6EB] rounded-2xl p-4 text-sm text-black leading-relaxed placeholder-[#65676B] focus:outline-none focus:border-emerald-600 focus:bg-white resize-y"
                />
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setAiPrompt('')}
                    disabled={!aiPrompt}
                    className="px-4 py-2.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] disabled:opacity-40 text-black font-bold text-xs cursor-pointer"
                  >
                    লেখা মুছুন (Clear)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAskAI()}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{aiLoading ? 'জেনারেট হচ্ছে...' : 'পাঠান (Send)'}</span>
                  </button>
                </div>
              </div>

              {/* Latest AI Result with Submitted Prompt Echo */}
              {aiResponse && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                  {lastSubmittedPrompt && (
                    <div className="bg-white/90 p-3 rounded-xl border border-emerald-200/80">
                      <span className="text-[10px] font-bold text-[#65676B] block mb-1">
                        আপনি যা লিখেছিলেন:
                      </span>
                      <p className="text-xs text-black whitespace-pre-wrap leading-relaxed">
                        {lastSubmittedPrompt}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> এআই ফলাফল:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(aiResponse);
                        showToast('টেক্সট কপি করা হয়েছে!');
                      }}
                      className="text-xs font-bold text-[#0866FF] hover:underline cursor-pointer"
                    >
                      কপি করুন
                    </button>
                  </div>
                  <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                  {aiGeneratedPostDraft && (
                    <div className="pt-2 flex items-center justify-between border-t border-emerald-200">
                      <span className="text-[11px] text-[#65676B]">পোস্টটি ফিডে প্রকাশ করতে চান?</span>
                      <button
                        type="button"
                        onClick={handlePublishAIDraftToFeed}
                        className="px-4 py-2 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>ফিডে প্রকাশ করুন</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Saved History of Everything Asked & Answered */}
            {aiHistory.length > 0 && (
              <div className="bg-white p-5 rounded-3xl border border-[#E4E6EB] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2.5">
                  <h3 className="text-sm font-bold text-black">
                    আপনার পূর্বের সমস্ত কথা ও উত্তর ({aiHistory.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setAiHistory([]);
                      try {
                        localStorage.removeItem('peaceverse_admin_ai_history');
                      } catch {}
                      showToast('হিস্ট্রি মুছে ফেলা হয়েছে');
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    হিস্ট্রি মুছুন
                  </button>
                </div>

                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {aiHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-[#F0F2F5] border border-[#E4E6EB] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#0866FF]">আপনার লেখা ({item.time}):</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAiPrompt(item.prompt);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-[11px] font-bold text-[#0866FF] hover:underline cursor-pointer"
                        >
                          আবার বক্সে আনুন ↑
                        </button>
                      </div>
                      <p className="text-black bg-white p-2.5 rounded-xl border border-[#E4E6EB] whitespace-pre-wrap leading-relaxed">
                        {item.prompt}
                      </p>
                      <div className="pt-1">
                        <span className="font-bold text-emerald-700 block mb-1">এআই উত্তর:</span>
                        <p className="text-[#050505] whitespace-pre-wrap leading-relaxed">
                          {item.response}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 10: ADMIN SETTINGS & CREDENTIALS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-[#E4E6EB] space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#E4E6EB] pb-3">
                <Globe className="w-5 h-5 text-[#0866FF]" />
                <div>
                  <h3 className="text-sm font-bold text-black">আলাদা অ্যাডমিন প্যানেল লিংক (Direct Admin URLs)</h3>
                  <p className="text-xs text-[#65676B]">যেকোনো ব্রাউজার থেকে সরাসরি অ্যাডমিন প্যানেলে প্রবেশ করুন</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#65676B] block">Primary Standalone URL:</span>
                    <code className="font-mono font-bold text-[#0866FF]">https://peaceverse24.com/admin</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('https://peaceverse24.com/admin');
                      showToast('লিংক কপি করা হয়েছে!');
                    }}
                    className="px-3 py-1 rounded-lg bg-white border border-[#E4E6EB] font-bold text-black cursor-pointer"
                  >
                    Copy
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#65676B] block">Alternate Direct Hash URL:</span>
                    <code className="font-mono font-bold text-emerald-700">https://peaceverse24.com/#admin</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('https://peaceverse24.com/#admin');
                      showToast('লিংক কপি করা হয়েছে!');
                    }}
                    className="px-3 py-1 rounded-lg bg-white border border-[#E4E6EB] font-bold text-black cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleUpdateCredentials}
              className="bg-white p-5 rounded-2xl border border-[#E4E6EB] space-y-4"
            >
              <div className="flex items-center gap-2.5 border-b border-[#E4E6EB] pb-3">
                <Key className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-black">অ্যাডমিন ইউজারনেম ও পাসওয়ার্ড পরিবর্তন</h3>
                  <p className="text-xs text-[#65676B]">আপনার পছন্দমতো নতুন ইউজারনেম ও পাসওয়ার্ড সেট করুন</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-black mb-1">অ্যাডমিন ইউজারনেম</label>
                  <input
                    type="text"
                    required
                    value={settingsUsername}
                    onChange={(e) => setSettingsUsername(e.target.value)}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-black mb-1">নতুন পাসওয়ার্ড</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="কমপক্ষে ৬ অক্ষর লিখুন"
                    value={settingsPassword}
                    onChange={(e) => setSettingsPassword(e.target.value)}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-black mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                    value={settingsConfirmPassword}
                    onChange={(e) => setSettingsConfirmPassword(e.target.value)}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold shadow-sm cursor-pointer"
                >
                  সেভ ও আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* ADD PAGE FOR ADMIN MONETIZATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {showAddPageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-[#E4E6EB] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3">
              <h3 className="font-bold text-sm text-black flex items-center gap-2">
                <Flag className="w-4 h-4 text-[#0866FF]" />
                <span>পেইজ ও মনিটাইজেশন যুক্ত করুন</span>
              </h3>
              <button onClick={() => setShowAddPageModal(false)} className="text-[#65676B] hover:text-black cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateAdminPage} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-black mb-1">পেইজের নাম *</label>
                <input
                  type="text"
                  required
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="যেমন: Peaceverse Official Media"
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2 text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-black mb-1">ক্যাটাগরি</label>
                <input
                  type="text"
                  value={newPageCategory}
                  onChange={(e) => setNewPageCategory(e.target.value)}
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2 text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-black mb-1">ফলোয়ার্স সংখ্যা</label>
                <input
                  type="number"
                  min={0}
                  value={newPageFollowers}
                  onChange={(e) => setNewPageFollowers(e.target.value)}
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2 text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPageModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#E4E6EB] text-black font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold cursor-pointer"
                >
                  যুক্ত ও চালু করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* NEW AD CAMPAIGN MODAL */}
      {/* ------------------------------------------------------------- */}
      {showNewAdModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E4E6EB] shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3">
              <h3 className="font-bold text-sm text-black flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#0866FF]" />
                <span>নতুন বিজ্ঞাপন ক্যাম্পেইন যুক্ত করুন</span>
              </h3>
              <button onClick={() => setShowNewAdModal(false)} className="text-[#65676B] hover:text-black cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateAd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-black mb-1">স্পন্সর / ব্র্যান্ডের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আল-মদিনা আতর ও ফুডস..."
                  value={newSponsor}
                  onChange={(e) => setNewSponsor(e.target.value)}
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2 text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-black mb-1">বিজ্ঞাপনের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: জুমার স্পেশাল আতর প্যাকেজে ৫০% ছাড়..."
                  value={newAdTitle}
                  onChange={(e) => setNewAdTitle(e.target.value)}
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2 text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-black mb-1">কোথায় বিজ্ঞাপন বসবে (Placement)</label>
                <select
                  value={newAdPlacement}
                  onChange={(e) => setNewAdPlacement(e.target.value as any)}
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2 text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                >
                  <option value="home_feed">হোম ফিড স্পন্সরড কার্ড (Home Feed In-Stream)</option>
                  <option value="reels_preroll">রিলস ও ওয়াচ ব্যানার (Reels / Watch)</option>
                  <option value="marketplace_top">মার্কেটপ্লেস টপ ব্যানার (Marketplace Top)</option>
                  <option value="story_ad">স্টোরি ব্যানার অ্যাড (Story Ad)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-black mb-1">CPM রেট (৳/1k)</label>
                  <input
                    type="number"
                    value={newAdCpm}
                    onChange={(e) => setNewAdCpm(e.target.value)}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-black mb-1">CPC রেট (৳/click)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newAdCpc}
                    onChange={(e) => setNewAdCpc(e.target.value)}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-black mb-1">বিজ্ঞাপনের ছবি / ব্যানার URL</label>
                <input
                  type="url"
                  value={newAdImage}
                  onChange={(e) => setNewAdImage(e.target.value)}
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-black mb-1">ক্লিক লিংক (Target URL)</label>
                <input
                  type="url"
                  value={newAdTargetUrl}
                  onChange={(e) => setNewAdTargetUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-black mb-1">বিজ্ঞাপনের সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  rows={2}
                  value={newAdDesc}
                  onChange={(e) => setNewAdDesc(e.target.value)}
                  placeholder="বিজ্ঞাপনের বিবরণ ও যোগাযোগের উপায় লিখুন..."
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl p-2.5 text-black focus:outline-none focus:border-[#0866FF] focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAdModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#E4E6EB] text-black font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold shadow-sm cursor-pointer"
                >
                  ক্যাম্পেইন সেভ ও চালু করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#0866FF] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};
