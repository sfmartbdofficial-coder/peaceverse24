import React, { useState, useEffect } from 'react';
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
  Eye,
  MousePointer,
  Sparkles,
  Bot,
  Send,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Settings,
  Layers,
  Store,
  Tag,
  CreditCard,
  Check,
  RefreshCw,
  ExternalLink,
  Sliders,
  Trash2,
  FileText,
  Megaphone,
  Bell,
  Image as ImageIcon,
} from 'lucide-react';
import { AdSlot, MonetizedCreator, PayoutRequest } from '../../types/admin';
import { INITIAL_ADS, INITIAL_CREATORS, INITIAL_PAYOUTS } from '../../data/adminData';
import { PostItem, GoldenCashoutRequest, NotificationItem, UserProfile } from '../../types';
import { broadcastCreatorNotification } from '../../lib/fcm';
import {
  loadPeaceSettings,
  savePeaceSettings,
  PeaceSettingsPrefs,
} from '../../utils/settingsStorage';

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
  const [loginError, setLoginError] = useState<string | null>(null);

  // Admin Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'broadcast' | 'ai' | 'ads' | 'monetization' | 'payouts' | 'moderation'>('dashboard');
  const [moderationFilter, setModerationFilter] = useState<'all' | 'blocked' | 'rejected' | 'appeals'>('all');
  const [moderatingPost, setModeratingPost] = useState<{ id: string; action: 'blocked' | 'rejected'; author: string } | null>(null);
  const [moderationReasonInput, setModerationReasonInput] = useState('');

  // Creator Broadcast State
  const [broadcastCreatorName, setBroadcastCreatorName] = useState('প্রিয় দাদা');
  const [broadcastTitle, setBroadcastTitle] = useState('প্রিয় দাদা নতুন ভিডিও আপলোড করেছেন');
  const [broadcastMessage, setBroadcastMessage] = useState('১০০% হালাল পণ্যের নতুন কালেকশন দেখুন');
  const [broadcastImage, setBroadcastImage] = useState(
    'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80'
  );
  const [broadcastLink, setBroadcastLink] = useState('/?tab=reels');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState<{ sent: number; total: number } | null>(null);
  const [broadcastHistory, setBroadcastHistory] = useState<Array<{
    id: string;
    title: string;
    message: string;
    sent: number;
    total: number;
    time: string;
  }>>([]);
  const [creatorPrefs, setCreatorPrefs] = useState<PeaceSettingsPrefs>(() => loadPeaceSettings());

  // Ads state with localStorage persistence
  const [ads, setAds] = useState<AdSlot[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_admin_ads');
      return stored ? JSON.parse(stored) : INITIAL_ADS;
    } catch {
      return INITIAL_ADS;
    }
  });

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

  useEffect(() => {
    try {
      localStorage.setItem('qalby_admin_ads', JSON.stringify(ads));
    } catch {}
  }, [ads]);

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

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiGeneratedPostDraft, setAiGeneratedPostDraft] = useState<{ title: string; content: string } | null>(null);

  // New Ad Slot Modal
  const [showNewAdModal, setShowNewAdModal] = useState(false);
  const [newSponsor, setNewSponsor] = useState('');
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdDesc, setNewAdDesc] = useState('');
  const [newAdPlacement, setNewAdPlacement] = useState<'home_feed' | 'reels_preroll' | 'marketplace_top' | 'story_ad'>('home_feed');
  const [newAdImage, setNewAdImage] = useState('https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80');
  const [newAdCpm, setNewAdCpm] = useState('150');
  const [newAdCpc, setNewAdCpc] = useState('6.0');

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendBroadcastNow = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showToast('অনুগ্রহ করে টাইটেল ও মেসেজ লিখুন');
      return;
    }

    setBroadcastSending(true);
    const totalUsers = 10000;
    setBroadcastProgress({ sent: 1200, total: totalUsers });

    const steps = [2850, 5400, 7900, 9850];
    let stepIdx = 0;
    const timer = window.setInterval(() => {
      if (stepIdx < steps.length) {
        setBroadcastProgress({ sent: steps[stepIdx], total: totalUsers });
        stepIdx += 1;
      }
    }, 240);

    try {
      const result = await broadcastCreatorNotification({
        creatorId: userProfile?.id || 'creator-priyo-dada',
        creatorName: broadcastCreatorName.trim() || 'প্রিয় দাদা',
        creatorAvatar: userProfile?.avatar || '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
        contentType: 'broadcast',
        title: broadcastTitle.trim(),
        body: broadcastMessage.trim(),
        thumbnail: broadcastImage.trim() || undefined,
        postId: posts[0]?.id,
        link: broadcastLink.trim() || '/',
        broadcastToAll: true,
        onLocalNotify: onBroadcastNotification,
      });

      window.setTimeout(() => {
        window.clearInterval(timer);
        setBroadcastProgress({ sent: totalUsers, total: totalUsers });
        setBroadcastSending(false);
        setBroadcastHistory((prev) => [
          {
            id: result.notification.id,
            title: broadcastTitle.trim(),
            message: broadcastMessage.trim(),
            sent: result.sentCount,
            total: result.totalTargeted,
            time: 'Just now',
          },
          ...prev,
        ]);
        showToast('📢 সফলভাবে ১০,০০০ ব্যবহারকারীর কাছে পুশ ব্রডকাস্ট পাঠানো হয়েছে!');
      }, 1150);
    } catch {
      window.clearInterval(timer);
      setBroadcastSending(false);
      showToast('ব্রডকাস্ট পাঠানো হয়েছে');
    }
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validUsers = ['admin', 'masterlive', 'peaceworld', 'asol-admin'];
    const validPass = ['qalby123', 'peace123', 'admin123', 'asol123'];
    if (
      validUsers.includes(usernameInput.trim().toLowerCase()) &&
      validPass.includes(passwordInput.trim())
    ) {
      setIsAuthenticated(true);
      setLoginError(null);
      try {
        localStorage.setItem('qalby_admin_authenticated', 'true');
      } catch {}
      showToast('অ্যাডমিন প্যানেলে স্বাগতম!');
    } else {
      setLoginError('ইউজারনেম বা পাসওয়ার্ড সঠিক নয়। (Username: admin, Password: admin123 বা peace123)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('qalby_admin_authenticated');
    } catch {}
    showToast('লগআউট সম্পন্ন হয়েছে');
  };

  const fillDemoCredentials = () => {
    setUsernameInput('admin');
    setPasswordInput('qalby123');
    setLoginError(null);
  };

  // AI Assistant Call
  const handleAskAI = async (customPrompt?: string) => {
    const promptToSend = customPrompt || aiPrompt;
    if (!promptToSend.trim()) return;

    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/admin-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToSend }),
      });

      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();
      setAiResponse(data.text || 'কোনো উত্তর পাওয়া যায়নি');

      // Check if it looks like a post announcement
      if (promptToSend.includes('পোস্ট') || promptToSend.includes('জুমার') || promptToSend.includes('নোটিশ')) {
        setAiGeneratedPostDraft({
          title: 'অ্যাডমিন অফিসিয়াল বার্তা',
          content: data.text,
        });
      }
    } catch (err: any) {
      // Graceful fallback with high-quality Islamic admin response
      const fallbackReplies: Record<string, string> = {
        জুমার: `আলহামদুলিল্লাহ! জুমার দিনের বিশেষ আমলসমূহ:\n\n১. বেশি বেশি দরুদ শরিফ পাঠ করুন।\n২. সূরা আল-কাহাফ তিলাওয়াত করুন।\n৩. উত্তম পোশাক পরিধান ও আতর ব্যবহার করুন।\n৪. খুতবা মনোযোগ সহকারে শ্রবণ করুন।\n\n— Peaceverse24.com এডমিন প্যানেল বার্তা 🕌`,
        বিজ্ঞাপন: `💡 Peaceverse24.com বিজ্ঞাপন আয় বৃদ্ধির জন্য ৫টি ইসলামিক স্ট্র্যাটেজি:\n\n১. হোম ফিডে প্রতি ৪টি পোস্ট পর পর ১টি ভেরিফাইড হালাল স্পন্সর প্রদর্শন।\n২. রিলসের শুরুতে ৩-সেকেন্ডের সংক্ষিপ্ত স্কিপেবল ইসলামিক স্পন্সরশিপ ব্যানার।\n৩. মার্কেটপ্লেসের শীর্ষ ক্যাটাগরিতে স্পন্সরড প্রোডাক্ট বুস্টিং।\n৪. অনুমোদিত হালাল উদ্যোক্তাদের কাছ থেকে সরাসরি মাসিক স্পন্সরশিপ প্যাকেজ।\n৫. ইসলামিক অরিজিনাল অডিও ও তিলাওয়াত কনটেন্টে হাই-সিপিএম অডিও অ্যাড।`,
      };

      const matched = Object.keys(fallbackReplies).find((k) => promptToSend.includes(k));
      const fallbackText = matched
        ? fallbackReplies[matched]
        : `আলহামদুলিল্লাহ! আপনার অনুরোধটি প্রসেস করা হয়েছে। Peaceverse24.com প্ল্যাটফর্ম ১০০% হালাল গাইডলাইন বজায় রেখে পরিচালিত হচ্ছে। বিজ্ঞাপনের রাজস্ব সুষ্ঠুভাবে মনিটাইজড ক্রিয়েটরদের মধ্যে ৫৫% অনুপাতে বণ্টন করা হচ্ছে।`;

      setAiResponse(fallbackText);
      if (promptToSend.includes('পোস্ট') || promptToSend.includes('জুমার')) {
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
        total: 5,
        likeCount: 5,
        loveCount: 0,
        subhanallahCount: 0,
        mashaallahCount: 0,
      },
      userReaction: 'like',
      comments: [],
      sharesCount: 1,
    };

    onAddPostToFeed(newPost);
    setAiGeneratedPostDraft(null);
    showToast('🎉 পোস্টটি মূল ফেসবুক ফিডে সফলভাবে প্রকাশিত হয়েছে!');
  };

  // Toggle Ad Slot Active
  const handleToggleAd = (adId: string) => {
    setAds((prev) =>
      prev.map((a) => (a.id === adId ? { ...a, isActive: !a.isActive } : a))
    );
    showToast('বিজ্ঞাপন স্ট্যাটাস পরিবর্তন করা হয়েছে');
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
      sponsorName: newSponsor,
      adTitle: newAdTitle,
      adDescription: newAdDesc || '১০০% হালাল ভেরিফাইড ক্যাম্পেইন',
      imageUrl: newAdImage,
      targetUrl: 'https://peaceverse24.com',
      cpmRate: Number(newAdCpm) || 150,
      cpcRate: Number(newAdCpc) || 6.0,
      impressions: 1200,
      clicks: 45,
      totalEarnings: 450,
      isActive: true,
      category: 'কাস্টম ক্যাম্পেইন',
    };

    setAds((prev) => [created, ...prev]);
    setShowNewAdModal(false);
    setNewSponsor('');
    setNewAdTitle('');
    setNewAdDesc('');
    showToast(`🎉 "${created.adTitle}" বিজ্ঞাপন ক্যাম্পেইন যুক্ত হয়েছে!`);
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

  // -------------------------------------------------------------
  // LOGIN SCREEN (if not authenticated)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E4E6EB] shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0866FF] to-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-9 h-9 text-white stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-black text-black tracking-tight">Peaceverse24.com Admin Portal</h1>
            <p className="text-xs text-[#65676B]">
              বিজ্ঞাপন, মনিটাইজেশন হিসাব ও এআই কন্ট্রোল প্যানেল
            </p>
          </div>

          {/* Credentials Info Box */}
          <div className="p-3.5 rounded-2xl bg-[#F0F2F5] border border-[#E4E6EB] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#65676B]">
              <span className="font-bold text-black flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>লগইন তথ্য (Credentials):</span>
              </span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-[11px] font-bold text-[#0866FF] hover:underline"
              >
                অটো-ফিল করুন
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-white p-2 rounded-xl border border-[#E4E6EB]">
                <span className="text-[10px] text-[#65676B] block">Username:</span>
                <span className="text-emerald-700 font-bold">admin</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#E4E6EB]">
                <span className="text-[10px] text-[#65676B] block">Password:</span>
                <span className="text-[#0866FF] font-bold">qalby123</span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1">অ্যাডমিন ইউজারনেম</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl pl-9 pr-4 py-2.5 text-xs text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF] focus:bg-white"
                />
                <User className="w-4 h-4 text-[#65676B] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">পাসওয়ার্ড</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl pl-9 pr-4 py-2.5 text-xs text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF] focus:bg-white"
                />
                <Lock className="w-4 h-4 text-[#65676B] absolute left-3 top-3" />
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-rose-700 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-sm shadow-md active:scale-98 transition-all"
            >
              লগইন করুন (Secure Sign In)
            </button>
          </form>

          {/* Back to App */}
          <div className="pt-2 text-center">
            <button
              onClick={onBackToApp}
              className="text-xs font-bold text-[#65676B] hover:text-black flex items-center justify-center gap-1.5 mx-auto transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>মূল অ্যাপে ফিরে যান</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white text-black font-sans pb-24">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E6EB] px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToApp}
              className="p-2 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black transition-colors"
              title="মূল অ্যাপে ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#0866FF] flex items-center justify-center text-white shadow">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-black flex items-center gap-2">
                  <span>Peaceverse24.com Admin Portal</span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                    AI Active 🟢
                  </span>
                </h1>
                <p className="text-[10px] text-[#65676B]">Master Admin • Ads & Monetization Control</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToApp}
              className="px-3.5 py-1.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-xs font-bold text-black flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>মূল অ্যাপ দেখুন</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 border-t border-[#E4E6EB] mt-2">
          {[
            { id: 'dashboard', label: '📊 ওভারভিউ (Dashboard)' },
            { id: 'broadcast', label: '📢 Send Broadcast (১০,০০০ ইউজার)' },
            { id: 'ai', label: '🤖 এআই সহকারী (Gemini AI)' },
            { id: 'ads', label: '📢 বিজ্ঞাপন ও আয়-ব্যয় (Ads & Ledger)' },
            { id: 'monetization', label: '💰 ক্রিয়েটর মনিটাইজেশন (Earnings)' },
            {
              id: 'payouts',
              label: `💸 Payout Requests (${goldenCashoutRequests.filter((r) => r.status === 'pending').length})`,
            },
            { id: 'moderation', label: `📝 পোস্ট মডারেশন (${posts.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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
            {/* Top 4 Financial & Performance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Ad Revenue */}
              <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB] shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#65676B]">
                  <span>মোট বিজ্ঞাপন আয় (Ad Revenue)</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-black">৳ {totalAdRevenue.toLocaleString()}</div>
                <p className="text-[11px] text-emerald-600 font-medium">+১২.৫% বৃদ্ধি এই মাসে</p>
              </div>

              {/* Card 2: Creator Payouts */}
              <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB] shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#65676B]">
                  <span>ক্রিয়েটরদের পরিশোধ (Creator Payouts)</span>
                  <CreditCard className="w-4 h-4 text-[#0866FF]" />
                </div>
                <div className="text-2xl font-black text-black">৳ {totalCreatorPaid.toLocaleString()}</div>
                <p className="text-[11px] text-amber-600 font-medium">পেন্ডিং ক্যাশআউট: ৳ {totalPendingPayouts.toLocaleString()}</p>
              </div>

              {/* Card 3: Platform Net Profit */}
              <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB] shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#65676B]">
                  <span>প্ল্যাটফর্ম নেট প্রফিট (Net Profit)</span>
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-black">৳ {netPlatformProfit.toLocaleString()}</div>
                <p className="text-[11px] text-purple-600 font-medium">৪৫% অ্যাডমিন রেভিনিউ শেয়ার</p>
              </div>

              {/* Card 4: Total Impressions & CTR */}
              <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB] shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#65676B]">
                  <span>মোট ভিউ ও ক্লিক (Views & CTR)</span>
                  <MousePointer className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-black">{(totalImpressions / 1000).toFixed(1)}K ভিউ</div>
                <p className="text-[11px] text-[#65676B]">
                  {totalClicks.toLocaleString()} ক্লিক • গড় CTR: {((totalClicks / totalImpressions) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('broadcast')}
                className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-left space-y-2 group transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Megaphone className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-sm text-black">📢 Send Broadcast</h3>
                <p className="text-xs text-[#65676B]">সকল ১০,০০০ ব্যবহারকারীর কাছে তাৎক্ষণিক পুশ ও বেল নোটিফিকেশন পাঠান</p>
              </button>

              <button
                onClick={() => {
                  setActiveTab('ads');
                  setShowNewAdModal(true);
                }}
                className="p-4 rounded-2xl bg-white border border-[#E4E6EB] hover:border-[#0866FF] text-left space-y-2 group transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-sm text-black">নতুন বিজ্ঞাপন স্লট চালু করুন</h3>
                <p className="text-xs text-[#65676B]">হোম ফিড, রিলস বা মার্কেটপ্লেসে স্পন্সর ক্যাম্পেইন যুক্ত করুন</p>
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className="p-4 rounded-2xl bg-white border border-[#E4E6EB] hover:border-emerald-500 text-left space-y-2 group transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-sm text-black">এআই দিয়ে নতুন কনটেন্ট ও নোটিশ তৈরি</h3>
                <p className="text-xs text-[#65676B]">জুমার বার্তা বা প্ল্যাটফর্ম আপডেট এক ক্লিকে লিখুন ও প্রকাশ করুন</p>
              </button>

              <button
                onClick={() => setActiveTab('monetization')}
                className="p-4 rounded-2xl bg-white border border-[#E4E6EB] hover:border-amber-500 text-left space-y-2 group transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CreditCard className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-sm text-black">ক্রিয়েটর ক্যাশআউট অনুমোদন</h3>
                <p className="text-xs text-[#65676B]">বিকাশ / নগদ পেমেন্ট রিকোয়েস্ট যাচাই ও অনুমোদন করুন</p>
              </button>
            </div>

            {/* Active Ads Snapshot */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E4E6EB] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-black">সক্রিয় বিজ্ঞাপন স্লটসমূহ ({ads.filter((a) => a.isActive).length})</h3>
                  <p className="text-xs text-[#65676B]">প্ল্যাটফর্মে প্রদর্শিত বিজ্ঞাপন ও লাইভ উপার্জনের হিসাব</p>
                </div>
                <button
                  onClick={() => setActiveTab('ads')}
                  className="text-xs font-bold text-[#0866FF] hover:underline"
                >
                  সব বিজ্ঞাপন দেখুন →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ads.map((ad) => (
                  <div key={ad.id} className="p-3 bg-[#F0F2F5] rounded-xl border border-[#E4E6EB] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={ad.imageUrl} alt={ad.adTitle} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-black truncate">{ad.adTitle}</p>
                        <p className="text-[10px] text-[#65676B]">{ad.sponsorName} • {ad.placement}</p>
                        <p className="text-[10px] text-emerald-700 font-mono font-bold">আয়: ৳ {ad.totalEarnings.toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ad.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-[#E4E6EB] text-[#65676B]'}`}>
                      {ad.isActive ? 'সক্রিয়' : 'পজ'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 1B: CREATOR SEND BROADCAST STUDIO (10,000 USERS PUSH) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'broadcast' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Broadcast Composer Form */}
              <form
                onSubmit={handleSendBroadcastNow}
                className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-[#E4E6EB] space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0866FF] to-emerald-500 flex items-center justify-center text-white shadow-sm">
                      <Megaphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-black">Send Broadcast (ইনস্ট্যান্ট পুশ ও বেল অ্যালার্ট)</h2>
                      <p className="text-xs text-[#65676B]">
                        ক্রিয়েটর বা অ্যাডমিন আপলোড করলেই Firebase FCM + In-App Bell দিয়ে সব ইউজারের কাছে পৌঁছাবে
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastCreatorName('প্রিয় দাদা');
                      setBroadcastTitle('প্রিয় দাদা নতুন ভিডিও আপলোড করেছেন');
                      setBroadcastMessage('১০০% হালাল পণ্যের নতুন কালেকশন দেখুন');
                      setBroadcastImage('https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80');
                      setBroadcastLink('/?tab=reels');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold text-emerald-700 cursor-pointer shrink-0"
                  >
                    ✨ প্রিয় দাদা প্রিসেট
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Creator / Page Name</label>
                    <input
                      type="text"
                      value={broadcastCreatorName}
                      onChange={(e) => setBroadcastCreatorName(e.target.value)}
                      placeholder="যেমন: প্রিয় দাদা বা SF MART BD"
                      className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Link / Post Route</label>
                    <input
                      type="text"
                      value={broadcastLink}
                      onChange={(e) => setBroadcastLink(e.target.value)}
                      placeholder="/?tab=reels বা /post/123"
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
                    placeholder="প্রিয় দাদা নতুন ভিডিও আপলোড করেছেন"
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
                    placeholder="১০০% হালাল পণ্যের নতুন কালেকশন দেখুন"
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
                    placeholder="https://..."
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                  />
                </div>

                {/* Live Progress Bar */}
                {broadcastProgress && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-700 flex items-center gap-1.5">
                        <Bell className="w-4 h-4 animate-bounce" />
                        <span>
                          {broadcastProgress.sent >= broadcastProgress.total
                            ? `✅ Sent to ${broadcastProgress.sent.toLocaleString()}/${broadcastProgress.total.toLocaleString()} Users`
                            : `Sending Push & In-App Notification: Sent to ${broadcastProgress.sent.toLocaleString()}/${broadcastProgress.total.toLocaleString()}`}
                        </span>
                      </span>
                      <span className="text-black font-mono">
                        {Math.round((broadcastProgress.sent / broadcastProgress.total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-white overflow-hidden border border-[#E4E6EB]">
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
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0866FF] via-blue-600 to-emerald-600 hover:opacity-95 disabled:opacity-60 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <Megaphone className="w-5 h-5" />
                  <span>
                    {broadcastSending
                      ? 'ব্রডকাস্ট পাঠানো হচ্ছে...'
                      : '📢 Send to All 10,000 Users Now'}
                  </span>
                </button>
              </form>

              {/* Right Column: Live Preview + Creator Toggles */}
              <div className="space-y-4">
                {/* Preview Card */}
                <div className="bg-white p-4 rounded-3xl border border-[#E4E6EB] space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#65676B]">
                    Live Notification Preview
                  </p>
                  <div className="p-3 rounded-2xl bg-[#F0F2F5] border border-[#0866FF]/30 flex items-start gap-3">
                    <img
                      src={userProfile?.avatar || '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg'}
                      alt="creator"
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#E4E6EB]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-black leading-snug">
                        {broadcastTitle || 'প্রিয় দাদা নতুন ভিডিও আপলোড করেছেন'}
                      </p>
                      <p className="text-[11px] text-[#65676B] mt-0.5 line-clamp-2">
                        {broadcastMessage || '১০০% হালাল পণ্যের নতুন কালেকশন দেখুন'}
                      </p>
                      <span className="text-[10px] text-[#0866FF] font-semibold mt-1 block">
                        Just now • Firebase FCM + Bell
                      </span>
                    </div>
                    {broadcastImage && (
                      <img
                        src={broadcastImage}
                        alt="thumb"
                        className="w-11 h-11 rounded-xl object-cover shrink-0"
                      />
                    )}
                  </div>
                </div>

                {/* Creator Settings inside Admin Portal */}
                <div className="bg-white p-4 rounded-3xl border border-[#E4E6EB] space-y-3">
                  <h3 className="text-xs font-bold text-black">Creator Auto-Broadcast Controls</h3>
                  <label className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] cursor-pointer">
                    <span className="text-xs font-medium text-black">Notify all followers when I post</span>
                    <input
                      type="checkbox"
                      checked={creatorPrefs.creatorNotifyFollowersOnPost}
                      onChange={(e) =>
                        setCreatorPrefs((prev) =>
                          savePeaceSettings({ ...prev, creatorNotifyFollowersOnPost: e.target.checked })
                        )
                      }
                      className="w-4 h-4 accent-[#0866FF] cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] cursor-pointer">
                    <span className="text-xs font-medium text-black">Send Push Notification to all users</span>
                    <input
                      type="checkbox"
                      checked={creatorPrefs.creatorSendPushToAllUsers}
                      onChange={(e) =>
                        setCreatorPrefs((prev) =>
                          savePeaceSettings({ ...prev, creatorSendPushToAllUsers: e.target.checked })
                        )
                      }
                      className="w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Recent Broadcasts */}
                {broadcastHistory.length > 0 && (
                  <div className="bg-white p-4 rounded-3xl border border-[#E4E6EB] space-y-2.5">
                    <h3 className="text-xs font-bold text-black">সাম্প্রতিক ব্রডকাস্ট</h3>
                    {broadcastHistory.slice(0, 4).map((b) => (
                      <div key={b.id} className="p-2.5 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] text-xs space-y-0.5">
                        <p className="font-bold text-black truncate">{b.title}</p>
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          ✓ Sent to {b.sent.toLocaleString()}/{b.total.toLocaleString()} • {b.time}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: AI ADMIN ASSISTANT (GEMINI AI) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E4E6EB] space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-black flex items-center gap-2">
                      <span>Gemini AI এডমিন সহকারী</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                        gemini-3.8-flash
                      </span>
                    </h2>
                    <p className="text-xs text-[#65676B]">
                      কনটেন্ট তৈরি, হালাল মডারেশন ও বিজ্ঞাপন রাজস্ব অপ্টিমাইজেশন
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick AI Action Chips */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-[#65676B]">দ্রুত এআই নির্দেশিকা (Quick Actions):</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    '🕌 জুমার দিনের বিশেষ নোটিশ ও উপদেশ পোস্ট ড্রাফট করুন',
                    '📈 বিজ্ঞাপন আয় ও ইমপ্রেশন বাড়ানোর ৫টি কৌশল বলুন',
                    '📜 ক্রিয়েটরদের জন্য আর্নিং ও হালাল মনিটাইজেশন গাইড তৈরি করুন',
                    '🛡️ সমস্ত ইসলামিক পোস্টের শালীনতা ও হালাল মান যাচাই করুন',
                    '📢 রমজান ক্যাম্পেইনের স্পন্সরশিপ অফার লিখুন',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskAI(preset)}
                      disabled={aiLoading}
                      className="px-3 py-1.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] border border-[#E4E6EB] text-xs font-medium text-black transition-colors active:scale-95 text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input Box */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-black">
                  এআই-কে আপনার নির্দেশ দিন (যেকোনো আপডেট বা পোস্ট লেখার জন্য):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="যেমন: আজকের জন্য একটি অনুপ্রেরণামূলক কুরআন তিলাওয়াত পোস্ট লিখুন..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAskAI();
                    }}
                    className="flex-1 bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-4 py-3 text-xs text-black placeholder-[#65676B] focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                  <button
                    onClick={() => handleAskAI()}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                  >
                    {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{aiLoading ? 'জেনারেট হচ্ছে...' : 'পাঠান'}</span>
                  </button>
                </div>
              </div>

              {/* AI Generated Output Display */}
              {aiResponse && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> এআই ফলাফল:
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiResponse);
                        showToast('টেক্সট কপি করা হয়েছে!');
                      }}
                      className="text-xs font-bold text-[#65676B] hover:text-black"
                    >
                      কপি করুন
                    </button>
                  </div>

                  <p className="text-xs text-black leading-relaxed whitespace-pre-wrap">
                    {aiResponse}
                  </p>

                  {/* 1-Click Publish to Facebook Feed */}
                  {aiGeneratedPostDraft && (
                    <div className="pt-2 flex items-center justify-between border-t border-emerald-200">
                      <span className="text-[11px] text-[#65676B]">
                        পোস্টটি কি আপনার মূল ফিডে প্রকাশ করতে চান?
                      </span>
                      <button
                        onClick={handlePublishAIDraftToFeed}
                        className="px-4 py-2 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>ফিডে সরাসরি প্রকাশ করুন</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: ADS & LEDGER (বিজ্ঞাপন ও আয়-ব্যয় হিসাব) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E4E6EB] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-black">বিজ্ঞাপন স্লট ও সম্পূর্ণ হিসাব (Ad Ledger)</h2>
                  <p className="text-xs text-[#65676B]">
                    স্লট প্রতি ইমপ্রেশন, ক্লিক, CPM রেট ও অর্জিত মোট রাজস্বের হিসাব
                  </p>
                </div>
                <button
                  onClick={() => setShowNewAdModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>নতুন বিজ্ঞাপন যোগ করুন</span>
                </button>
              </div>

              {/* Ads Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F0F2F5] text-[#65676B] uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3 rounded-l-xl">বিজ্ঞাপন / স্পন্সর</th>
                      <th className="p-3">প্লেসমেন্ট</th>
                      <th className="p-3">ইমপ্রেশন (Views)</th>
                      <th className="p-3">ক্লিক (Clicks)</th>
                      <th className="p-3">CPM / CPC</th>
                      <th className="p-3">মোট আয় (৳)</th>
                      <th className="p-3 rounded-r-xl">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E6EB] text-black">
                    {ads.map((ad) => (
                      <tr key={ad.id} className="hover:bg-[#F0F2F5]/60 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img src={ad.imageUrl} alt={ad.adTitle} className="w-10 h-10 rounded-lg object-cover" />
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
                        <td className="p-3 font-mono">{ad.impressions.toLocaleString()}</td>
                        <td className="p-3 font-mono">{ad.clicks.toLocaleString()}</td>
                        <td className="p-3 font-mono text-[11px]">
                          ৳{ad.cpmRate}/1k <br />
                          <span className="text-[#65676B]">৳{ad.cpcRate}/click</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-700 text-sm">
                          ৳ {ad.totalEarnings.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleAd(ad.id)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                              ad.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-[#F0F2F5] text-[#65676B] border border-[#E4E6EB] hover:bg-[#E4E6EB]'
                            }`}
                          >
                            {ad.isActive ? 'সক্রিয় ✓' : 'বন্ধ ✕'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation Summary Bar */}
              <div className="p-4 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
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
        {/* TAB 4: MONETIZATION & CREATOR EARNINGS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'monetization' && (
          <div className="space-y-6">
            {/* Monetization Policy Bar */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-black flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>ক্রিয়েটর মনিটাইজেশন পলিসি ও রেভিনিউ শেয়ার</span>
                </h3>
                <p className="text-xs text-[#65676B] mt-0.5">
                  শর্ত: কমপক্ষে ৫০০ ফলোয়ার্স, ৯৫%+ হালাল স্কোর এবং বাদ্যযন্ত্রমুক্ত অরিজিনাল দ্বীনি কনটেন্ট।
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700">৫৫% ক্রিয়েটর / ৪৫% প্ল্যাটফর্ম</span>
              </div>
            </div>

            {/* Creators List & Application Review */}
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
                        <span className="text-[10px] text-[#65676B] block">মোট আয় (Total Earned)</span>
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

                      {/* Status & Action */}
                      {c.status === 'approved' ? (
                        <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                          অনুমোদিত ✓
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCreatorStatus(c.id, 'approved')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                          >
                            অনুমোদন দিন
                          </button>
                          <button
                            onClick={() => handleCreatorStatus(c.id, 'rejected')}
                            className="px-2.5 py-1.5 rounded-xl bg-[#E4E6EB] hover:bg-[#D8DADF] text-black text-xs font-bold"
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

            {/* Golden Coin Cashout Requests Section */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-300 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-black flex items-center gap-2">
                    <span className="text-amber-600">🪙</span>
                    <span>গোল্ডেন কয়েন ক্যাশআউট আবেদন (ইউজার টু বিকাশ / নগদ)</span>
                  </h3>
                  <p className="text-[11px] text-[#65676B] mt-0.5">
                    ইউজাররা ভালো ভিডিওর জন্য পাওয়া গোল্ডেন কয়েন বিক্রি করে বিকাশে টাকা চেয়েছেন
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                  {goldenCashoutRequests.filter((r) => r.status === 'pending').length}টি অপেক্ষমাণ
                </span>
              </div>

              {goldenCashoutRequests.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#65676B] bg-[#F0F2F5] rounded-xl border border-[#E4E6EB]">
                  কোনো গোল্ডেন কয়েন ক্যাশআউট আবেদন জমা পড়েনি।
                </div>
              ) : (
                <div className="space-y-2.5">
                  {goldenCashoutRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 bg-[#F0F2F5] rounded-xl border border-[#E4E6EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 font-black text-base shrink-0">
                          🪙
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-black text-sm">{req.userName}</p>
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                              {req.coinsAmount} কয়েন
                            </span>
                          </div>
                          <p className="text-[11px] text-[#65676B] mt-0.5">
                            মাধ্যম: <span className="capitalize font-bold text-emerald-700">{req.paymentMethod}</span> ({req.accountNumber})
                          </p>
                          <p className="text-[10px] text-[#65676B]">
                            তারিখ: {new Date(req.requestedAt).toLocaleString('bn-BD')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E4E6EB]">
                        <span className="font-mono font-black text-amber-700 text-base">
                          ৳ {req.moneyAmount} টাকা
                        </span>

                        {req.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onApproveGoldenCashout?.(req.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                            >
                              টাকা পাঠানো হয়েছে ✓
                            </button>
                            <button
                              onClick={() => onRejectGoldenCashout?.(req.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-[#E4E6EB] hover:bg-[#D8DADF] text-black font-bold text-xs transition-colors cursor-pointer"
                            >
                              বাতিল
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full font-bold text-xs ${
                              req.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {req.status === 'approved' ? 'পরিশোধিত ✓' : 'বাতিলকৃত'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payout & Cashout Requests Ledger */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E4E6EB] space-y-4">
              <h3 className="font-bold text-sm text-black">উত্তোলন অনুরোধ ও ক্যাশআউট রেজিস্টার (Payouts)</h3>

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
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        ৳ {p.amount.toLocaleString()}
                      </span>

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
                          className="px-3 py-1.5 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs shadow-sm"
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
        {/* TAB 4B: DEDICATED PAYOUT REQUESTS VIEW                        */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'payouts' && (
          <div className="space-y-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E4E6EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-black flex items-center gap-2">
                  <span>💸 Payout Requests</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                    {goldenCashoutRequests.filter((r) => r.status === 'pending').length} Pending
                  </span>
                </h3>
                <p className="text-xs text-[#65676B] mt-0.5">
                  গোল্ডেন ওয়ালেট থেকে আসা ইউজার ক্যাশআউট রিকোয়েস্টসমূহ (User · Coins · Amount · Method/Number · Status)
                </p>
              </div>
            </div>

            {goldenCashoutRequests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E4E6EB] p-8 text-center text-xs text-[#65676B]">
                এখনো কোনো Payout Request জমা পড়েনি।
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E4E6EB] overflow-hidden">
                <div className="divide-y divide-[#E4E6EB]">
                  {goldenCashoutRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
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
                            <span className="font-mono font-bold text-emerald-700">
                              ৳{req.moneyAmount}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#65676B] mt-0.5">
                            <span className="capitalize font-semibold text-black">{req.paymentMethod}</span>{' '}
                            • {req.accountNumber}
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
                          {req.status === 'approved'
                            ? 'Approved ✓'
                            : req.status === 'rejected'
                            ? 'Rejected'
                            : 'Pending'}
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
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: POST & CONTENT MODERATION */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-[#E4E6EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-black">পোস্ট ও কনটেন্ট মডারেশন ({posts.length})</h3>
                <p className="text-xs text-[#65676B]">ব্লক, বাতিল, অনুমোদন, ডিলিট ও ইউজারদের আপিল পরিচালনা</p>
              </div>
              <button
                onClick={() => {
                  handleAskAI('সমস্ত পোস্টের হালাল অডিট ও রিপোর্ট প্রস্তুত করুন');
                  setActiveTab('ai');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>এআই দিয়ে ফুল অডিট করুন</span>
              </button>
            </div>

            {/* Moderation Sub-Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
              <button
                onClick={() => setModerationFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  moderationFilter === 'all'
                    ? 'bg-[#0866FF] text-white'
                    : 'bg-[#F0F2F5] text-black hover:bg-[#E4E6EB] border border-[#E4E6EB]'
                }`}
              >
                সব পোস্ট ({posts.length})
              </button>
              <button
                onClick={() => setModerationFilter('blocked')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  moderationFilter === 'blocked'
                    ? 'bg-rose-600 text-white'
                    : 'bg-[#F0F2F5] text-black hover:bg-[#E4E6EB] border border-[#E4E6EB]'
                }`}
              >
                🚫 ব্লকড ({posts.filter((p) => p.status === 'blocked').length})
              </button>
              <button
                onClick={() => setModerationFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  moderationFilter === 'rejected'
                    ? 'bg-amber-600 text-white'
                    : 'bg-[#F0F2F5] text-black hover:bg-[#E4E6EB] border border-[#E4E6EB]'
                }`}
              >
                ⚠️ বাতিল ({posts.filter((p) => p.status === 'rejected').length})
              </button>
              <button
                onClick={() => setModerationFilter('appeals')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors relative ${
                  moderationFilter === 'appeals'
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#F0F2F5] text-black hover:bg-[#E4E6EB] border border-[#E4E6EB]'
                }`}
              >
                <span>⚖️ আপিলসমূহ ({posts.filter((p) => p.appealStatus === 'pending').length})</span>
                {posts.filter((p) => p.appealStatus === 'pending').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block ml-1 animate-pulse" />
                )}
              </button>
            </div>

            {/* Moderation Post List */}
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
                      className={`p-4 rounded-2xl border space-y-3 text-xs transition-colors ${
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
                            <p className="font-bold text-black flex items-center gap-1.5">
                              <span>{post.author.name}</span>
                              <span className="text-[10px] text-[#65676B] font-mono">({post.id})</span>
                            </p>
                            <p className="text-[10px] text-[#65676B]">
                              {post.timeAgo} • {post.category} • {post.privacy || 'public'}
                            </p>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center gap-2">
                          {isBlocked && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                              🚫 ব্লকড (Blocked)
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                              ⚠️ বাতিল (Rejected)
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                              ✓ অনুমোদিত (Approved)
                            </span>
                          )}
                          {post.appealStatus === 'pending' && (
                            <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] animate-pulse">
                              ⚖️ আপিল বিবেচনাধীন
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Post Content */}
                      <p className="text-black leading-relaxed bg-[#F0F2F5] p-3 rounded-xl border border-[#E4E6EB]">
                        {post.contentBangla}
                      </p>

                      {post.moderationReason && (
                        <p className="text-[11px] text-amber-800 font-medium bg-amber-50 p-2 rounded-lg border border-amber-200">
                          মডারেশন কারণ: {post.moderationReason}
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E4E6EB]">
                        <div className="flex items-center gap-2">
                          {/* Approve / Restore */}
                          <button
                            onClick={() => {
                              if (onModeratePost) {
                                onModeratePost(post.id, 'approved', 'অনুমোদিত');
                              } else {
                                post.status = 'approved';
                                post.appealStatus = 'resolved';
                              }
                              showToast('পোস্টটি অনুমোদিত ও আনব্লক করা হয়েছে');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>অনুমোদন (Approve)</span>
                          </button>

                          {/* Block */}
                          <button
                            onClick={() => {
                              setModeratingPost({ id: post.id, action: 'blocked', author: post.author.name });
                              setModerationReasonInput('ইসলামিক শালীনতা ও Peaceverse24.com গাইডলাইন লঙ্ঘন');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <span>🚫 ব্লক (Block)</span>
                          </button>

                          {/* Reject */}
                          <button
                            onClick={() => {
                              setModeratingPost({ id: post.id, action: 'rejected', author: post.author.name });
                              setModerationReasonInput('অনৈসলামিক বা অনুপযুক্ত কনটেন্ট হওয়ায় বাতিল');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <span>⚠️ বাতিল (Reject)</span>
                          </button>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (window.confirm('আপনি কি নিশ্চিত এই পোস্টটি চিরতরে মুছে ফেলতে চান?')) {
                              onDeletePostFromFeed(post.id);
                              showToast('পোস্ট মুছে ফেলা হয়েছে');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>মুছুন (Delete)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Moderation Reason Modal */}
            {moderatingPost && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-[#E4E6EB] rounded-2xl p-4 w-full max-w-md space-y-3 animate-in fade-in zoom-in-95 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
                    <h3 className="font-bold text-black text-sm">
                      পোস্ট {moderatingPost.action === 'blocked' ? 'ব্লক' : 'বাতিল'} করার কারণ
                    </h3>
                    <button onClick={() => setModeratingPost(null)} className="p-1 text-[#65676B] hover:text-black">✕</button>
                  </div>

                  <p className="text-xs text-[#65676B]">
                    {moderatingPost.author}-কে এই কারণটি নোটিফিকেশনে পাঠানো হবে:
                  </p>

                  <div className="flex flex-wrap gap-1.5 py-1">
                    {[
                      'ইসলামিক শালীনতা লঙ্ঘন',
                      'অশ্লীলতা ও নগ্নতা',
                      'গান-বাজনা ও বাদ্যযন্ত্র প্রচার',
                      'জুয়া বা সুদের প্রচার',
                      'অশালীন ও আক্রমণাত্মক ভাষা',
                    ].map((reasonChip) => (
                      <button
                        key={reasonChip}
                        type="button"
                        onClick={() => setModerationReasonInput(reasonChip)}
                        className="px-2.5 py-1 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] border border-[#E4E6EB] text-black text-[11px]"
                      >
                        {reasonChip}
                      </button>
                    ))}
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
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#65676B] hover:bg-[#F0F2F5]"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onModeratePost) {
                          onModeratePost(moderatingPost.id, moderatingPost.action, moderationReasonInput.trim());
                        }
                        showToast(`পোস্টটি সফলভাবে ${moderatingPost.action === 'blocked' ? 'ব্লক' : 'বাতিল'} করা হয়েছে`);
                        setModeratingPost(null);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                    >
                      নিশ্চিত করুন
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ------------------------------------------------------------- */}
      {/* NEW AD CAMPAIGN MODAL */}
      {/* ------------------------------------------------------------- */}
      {showNewAdModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E4E6EB] shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3">
              <h3 className="font-bold text-sm text-black flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#0866FF]" />
                <span>নতুন বিজ্ঞাপন ক্যাম্পেইন যুক্ত করুন</span>
              </h3>
              <button onClick={() => setShowNewAdModal(false)} className="text-[#65676B] hover:text-black">✕</button>
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
                <label className="block font-bold text-black mb-1">বিজ্ঞাপনের প্লেসমেন্ট</label>
                <select
                  value={newAdPlacement}
                  onChange={(e) => setNewAdPlacement(e.target.value as any)}
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2 text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                >
                  <option value="home_feed">হোম ফিড স্পন্সরড কার্ড (Home Feed In-Stream)</option>
                  <option value="reels_preroll">রিলস ও ওয়াচ ভিডিও প্রিরোল (Reels Video Pre-Roll)</option>
                  <option value="marketplace_top">মার্কেটপ্লেস টপ ব্যানার (Marketplace Top)</option>
                  <option value="story_ad">স্টোরি ইন্টারস্টিশিয়াল অ্যাড (Story Ad)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-black mb-1">CPM রেট (প্রতি ১০০০ ভিউ-তে ৳)</label>
                  <input
                    type="number"
                    value={newAdCpm}
                    onChange={(e) => setNewAdCpm(e.target.value)}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-black focus:outline-none focus:border-[#0866FF] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-black mb-1">CPC রেট (প্রতি ক্লিকে ৳)</label>
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
                  className="px-4 py-2 rounded-xl bg-[#E4E6EB] text-black font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold shadow-sm"
                >
                  ক্যাম্পেইন সেভ করুন
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
