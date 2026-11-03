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
  FileText
} from 'lucide-react';
import { AdSlot, MonetizedCreator, PayoutRequest } from '../../types/admin';
import { INITIAL_ADS, INITIAL_CREATORS, INITIAL_PAYOUTS } from '../../data/adminData';
import { PostItem } from '../../types';

interface AdminPortalProps {
  onBackToApp: () => void;
  posts: PostItem[];
  onAddPostToFeed: (post: PostItem) => void;
  onDeletePostFromFeed: (postId: string) => void;
  onModeratePost?: (postId: string, status: 'approved' | 'blocked' | 'rejected', reason: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onBackToApp,
  posts,
  onAddPostToFeed,
  onDeletePostFromFeed,
  onModeratePost,
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'ads' | 'monetization' | 'moderation'>('dashboard');
  const [moderationFilter, setModerationFilter] = useState<'all' | 'blocked' | 'rejected' | 'appeals'>('all');
  const [moderatingPost, setModeratingPost] = useState<{ id: string; action: 'blocked' | 'rejected'; author: string } | null>(null);
  const [moderationReasonInput, setModerationReasonInput] = useState('');

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
        জুমার: `আলহামদুলিল্লাহ! জুমার দিনের বিশেষ আমলসমূহ:\n\n১. বেশি বেশি দরুদ শরিফ পাঠ করুন।\n২. সূরা আল-কাহাফ তিলাওয়াত করুন।\n৩. উত্তম পোশাক পরিধান ও আতর ব্যবহার করুন।\n৪. খুতবা মনোযোগ সহকারে শ্রবণ করুন।\n\n— Qalby এডমিন প্যানেল বার্তা 🕌`,
        বিজ্ঞাপন: `💡 Qalby বিজ্ঞাপন আয় বৃদ্ধির জন্য ৫টি ইসলামিক স্ট্র্যাটেজি:\n\n১. হোম ফিডে প্রতি ৪টি পোস্ট পর পর ১টি ভেরিফাইড হালাল স্পন্সর প্রদর্শন।\n২. রিলসের শুরুতে ৩-সেকেন্ডের সংক্ষিপ্ত স্কিপেবল ইসলামিক স্পন্সরশিপ ব্যানার।\n৩. মার্কেটপ্লেসের শীর্ষ ক্যাটাগরিতে স্পন্সরড প্রোডাক্ট বুস্টিং।\n৪. অনুমোদিত হালাল উদ্যোক্তাদের কাছ থেকে সরাসরি মাসিক স্পন্সরশিপ প্যাকেজ।\n৫. ইসলামিক অরিজিনাল অডিও ও তিলাওয়াত কনটেন্টে হাই-সিপিএম অডিও অ্যাড।`,
      };

      const matched = Object.keys(fallbackReplies).find((k) => promptToSend.includes(k));
      const fallbackText = matched
        ? fallbackReplies[matched]
        : `আলহামদুলিল্লাহ! আপনার অনুরোধটি প্রসেস করা হয়েছে। Qalby প্ল্যাটফর্ম ১০০% হালাল গাইডলাইন বজায় রেখে পরিচালিত হচ্ছে। বিজ্ঞাপনের রাজস্ব সুষ্ঠুভাবে মনিটাইজড ক্রিয়েটরদের মধ্যে ৫5% অনুপাতে বণ্টন করা হচ্ছে।`;

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
        name: 'Qalby Official Admin',
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
      targetUrl: 'https://qalby.islamic.app',
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
      <div className="min-h-screen bg-[#111213] text-[#e4e6eb] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#242526] rounded-3xl border border-[#393a3b] shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1877F2] to-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-9 h-9 text-white stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Qalby Admin Portal</h1>
            <p className="text-xs text-[#b0b3b8]">
              বিজ্ঞাপন, মনিটাইজেশন হিসাব ও এআই কন্ট্রোল প্যানেল
            </p>
          </div>

          {/* Credentials Info Box */}
          <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#b0b3b8]">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>লগইন তথ্য (Credentials):</span>
              </span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-[11px] font-bold text-[#1877F2] hover:underline"
              >
                অটো-ফিল করুন
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-[#242526] p-2 rounded-xl border border-[#393a3b]">
                <span className="text-[10px] text-[#8a8d91] block">Username:</span>
                <span className="text-emerald-400 font-bold">admin</span>
              </div>
              <div className="bg-[#242526] p-2 rounded-xl border border-[#393a3b]">
                <span className="text-[10px] text-[#8a8d91] block">Password:</span>
                <span className="text-blue-400 font-bold">qalby123</span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white mb-1">অ্যাডমিন ইউজারনেম</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2]"
                />
                <User className="w-4 h-4 text-[#8a8d91] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1">পাসওয়ার্ড</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2]"
                />
                <Lock className="w-4 h-4 text-[#8a8d91] absolute left-3 top-3" />
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-rose-400 font-semibold bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1877F2] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-sm shadow-xl active:scale-98 transition-all"
            >
              লগইন করুন (Secure Sign In)
            </button>
          </form>

          {/* Back to App */}
          <div className="pt-2 text-center">
            <button
              onClick={onBackToApp}
              className="text-xs font-bold text-[#b0b3b8] hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>মূল ফেসবুক অ্যাপে ফিরে যান</span>
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
    <div className="min-h-screen bg-[#111213] text-[#e4e6eb] font-sans pb-24">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#1e1f20]/95 backdrop-blur-md border-b border-[#393a3b] px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToApp}
              className="p-2 rounded-xl bg-[#2a2b2c] hover:bg-[#3a3b3c] text-white transition-colors"
              title="মূল অ্যাপে ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shadow">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-white flex items-center gap-2">
                  <span>Qalby Admin Portal</span>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    AI Active 🟢
                  </span>
                </h1>
                <p className="text-[10px] text-[#b0b3b8]">Master Admin • Ads & Monetization Control</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToApp}
              className="px-3.5 py-1.5 rounded-xl bg-[#2a2b2c] hover:bg-[#3a3b3c] text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>মূল অ্যাপ দেখুন</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 border-t border-[#393a3b]/60 mt-2">
          {[
            { id: 'dashboard', label: '📊 ওভারভিউ (Dashboard)' },
            { id: 'ai', label: '🤖 এআই সহকারী (Gemini AI)' },
            { id: 'ads', label: '📢 বিজ্ঞাপন ও আয়-ব্যয় (Ads & Ledger)' },
            { id: 'monetization', label: '💰 ক্রিয়েটর মনিটাইজেশন (Earnings)' },
            { id: 'moderation', label: `📝 পোস্ট মডারেশন (${posts.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#1877F2] text-white shadow-md'
                  : 'bg-[#242526] text-[#b0b3b8] hover:text-white border border-[#393a3b]'
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
              <div className="bg-[#242526] p-4 rounded-2xl border border-[#393a3b] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#b0b3b8]">
                  <span>মোট বিজ্ঞাপন আয় (Ad Revenue)</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">৳ {totalAdRevenue.toLocaleString()}</div>
                <p className="text-[11px] text-emerald-400 font-medium">+১২.৫% বৃদ্ধি এই মাসে</p>
              </div>

              {/* Card 2: Creator Payouts */}
              <div className="bg-[#242526] p-4 rounded-2xl border border-[#393a3b] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#b0b3b8]">
                  <span>ক্রিয়েটরদের পরিশোধ (Creator Payouts)</span>
                  <CreditCard className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white">৳ {totalCreatorPaid.toLocaleString()}</div>
                <p className="text-[11px] text-amber-400 font-medium">পেন্ডিং ক্যাশআউট: ৳ {totalPendingPayouts.toLocaleString()}</p>
              </div>

              {/* Card 3: Platform Net Profit */}
              <div className="bg-[#242526] p-4 rounded-2xl border border-[#393a3b] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#b0b3b8]">
                  <span>প্ল্যাটফর্ম নেট প্রফিট (Net Profit)</span>
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white">৳ {netPlatformProfit.toLocaleString()}</div>
                <p className="text-[11px] text-purple-400 font-medium">৪৫% অ্যাডমিন রেভিনিউ শেয়ার</p>
              </div>

              {/* Card 4: Total Impressions & CTR */}
              <div className="bg-[#242526] p-4 rounded-2xl border border-[#393a3b] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#b0b3b8]">
                  <span>মোট ভিউ ও ক্লিক (Views & CTR)</span>
                  <MousePointer className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white">{(totalImpressions / 1000).toFixed(1)}K ভিউ</div>
                <p className="text-[11px] text-[#b0b3b8]">
                  {totalClicks.toLocaleString()} ক্লিক • গড় CTR: {((totalClicks / totalImpressions) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setActiveTab('ads');
                  setShowNewAdModal(true);
                }}
                className="p-4 rounded-2xl bg-[#242526] border border-[#393a3b] hover:border-[#1877F2] text-left space-y-2 group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1877F2]/20 text-[#1877F2] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-sm text-white">নতুন বিজ্ঞাপন স্লট চালু করুন</h3>
                <p className="text-xs text-[#b0b3b8]">হোম ফিড, রিলস বা মার্কেটপ্লেসে স্পন্সর ক্যাম্পেইন যুক্ত করুন</p>
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className="p-4 rounded-2xl bg-[#242526] border border-[#393a3b] hover:border-emerald-500 text-left space-y-2 group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-sm text-white">এআই দিয়ে নতুন কনটেন্ট ও নোটিশ তৈরি</h3>
                <p className="text-xs text-[#b0b3b8]">জুমার বার্তা বা প্ল্যাটফর্ম আপডেট এক ক্লিকে লিখুন ও প্রকাশ করুন</p>
              </button>

              <button
                onClick={() => setActiveTab('monetization')}
                className="p-4 rounded-2xl bg-[#242526] border border-[#393a3b] hover:border-amber-500 text-left space-y-2 group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CreditCard className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-sm text-white">ক্রিয়েটর ক্যাশআউট অনুমোদন</h3>
                <p className="text-xs text-[#b0b3b8]">বিকাশ / নগদ পেমেন্ট রিকোয়েস্ট যাচাই ও অনুমোদন করুন</p>
              </button>
            </div>

            {/* Active Ads Snapshot */}
            <div className="bg-[#242526] p-4 sm:p-5 rounded-2xl border border-[#393a3b] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">সক্রিয় বিজ্ঞাপন স্লটসমূহ ({ads.filter((a) => a.isActive).length})</h3>
                  <p className="text-xs text-[#b0b3b8]">প্ল্যাটফর্মে প্রদর্শিত বিজ্ঞাপন ও লাইভ উপার্জনের হিসাব</p>
                </div>
                <button
                  onClick={() => setActiveTab('ads')}
                  className="text-xs font-bold text-[#1877F2] hover:underline"
                >
                  সব বিজ্ঞাপন দেখুন →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ads.map((ad) => (
                  <div key={ad.id} className="p-3 bg-[#18191a] rounded-xl border border-[#393a3b] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={ad.imageUrl} alt={ad.adTitle} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{ad.adTitle}</p>
                        <p className="text-[10px] text-[#b0b3b8]">{ad.sponsorName} • {ad.placement}</p>
                        <p className="text-[10px] text-emerald-400 font-mono font-bold">আয়: ৳ {ad.totalEarnings.toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ad.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'}`}>
                      {ad.isActive ? 'সক্রিয়' : 'পজ'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: AI ADMIN ASSISTANT (GEMINI AI) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-[#242526] p-5 sm:p-6 rounded-3xl border border-[#393a3b] space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Gemini AI এডমিন সহকারী</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        gemini-3.8-flash
                      </span>
                    </h2>
                    <p className="text-xs text-[#b0b3b8]">
                      কনটেন্ট তৈরি, হালাল মডারেশন ও বিজ্ঞাপন রাজস্ব অপ্টিমাইজেশন
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick AI Action Chips */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-[#b0b3b8]">দ্রুত এআই নির্দেশিকা (Quick Actions):</p>
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
                      className="px-3 py-1.5 rounded-xl bg-[#18191a] hover:bg-[#3a3b3c] border border-[#393a3b] text-xs font-medium text-[#e4e6eb] transition-colors active:scale-95 text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input Box */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-white">
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
                    className="flex-1 bg-[#18191a] border border-[#393a3b] rounded-xl px-4 py-3 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleAskAI()}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                  >
                    {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{aiLoading ? 'জেনারেট হচ্ছে...' : 'পাঠান'}</span>
                  </button>
                </div>
              </div>

              {/* AI Generated Output Display */}
              {aiResponse && (
                <div className="mt-4 p-4 rounded-2xl bg-[#18191a] border border-emerald-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#393a3b] pb-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> এআই ফলাফল:
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiResponse);
                        showToast('টেক্সট কপি করা হয়েছে!');
                      }}
                      className="text-xs font-bold text-[#b0b3b8] hover:text-white"
                    >
                      কপি করুন
                    </button>
                  </div>

                  <p className="text-xs text-[#e4e6eb] leading-relaxed whitespace-pre-wrap">
                    {aiResponse}
                  </p>

                  {/* 1-Click Publish to Facebook Feed */}
                  {aiGeneratedPostDraft && (
                    <div className="pt-2 flex items-center justify-between border-t border-[#393a3b]/60">
                      <span className="text-[11px] text-[#b0b3b8]">
                        পোস্টটি কি আপনার মূল ফেসবুক ফিডে প্রকাশ করতে চান?
                      </span>
                      <button
                        onClick={handlePublishAIDraftToFeed}
                        className="px-4 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
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
            <div className="bg-[#242526] p-4 sm:p-5 rounded-2xl border border-[#393a3b] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">বিজ্ঞাপন স্লট ও সম্পূর্ণ হিসাব (Ad Ledger)</h2>
                  <p className="text-xs text-[#b0b3b8]">
                    স্লট প্রতি ইমপ্রেশন, ক্লিক, CPM রেট ও অর্জিত মোট রাজস্বের হিসাব
                  </p>
                </div>
                <button
                  onClick={() => setShowNewAdModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center gap-1.5 shadow-md self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>নতুন বিজ্ঞাপন যোগ করুন</span>
                </button>
              </div>

              {/* Ads Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#18191a] text-[#b0b3b8] uppercase text-[10px] tracking-wider">
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
                  <tbody className="divide-y divide-[#393a3b]/60 text-[#e4e6eb]">
                    {ads.map((ad) => (
                      <tr key={ad.id} className="hover:bg-[#18191a]/40 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img src={ad.imageUrl} alt={ad.adTitle} className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <p className="font-bold text-white">{ad.adTitle}</p>
                              <p className="text-[10px] text-[#b0b3b8]">{ad.sponsorName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-md bg-[#3a3b3c] text-[10px] font-mono">
                            {ad.placement}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{ad.impressions.toLocaleString()}</td>
                        <td className="p-3 font-mono">{ad.clicks.toLocaleString()}</td>
                        <td className="p-3 font-mono text-[11px]">
                          ৳{ad.cpmRate}/1k <br />
                          <span className="text-[#8a8d91]">৳{ad.cpcRate}/click</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-400 text-sm">
                          ৳ {ad.totalEarnings.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleAd(ad.id)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                              ad.isActive
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
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
              <div className="p-4 rounded-xl bg-[#18191a] border border-[#393a3b] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[#b0b3b8]">সর্বমোট বিজ্ঞাপন রাজস্ব আয়:</span>
                  <p className="text-xl font-black text-emerald-400">৳ {totalAdRevenue.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[#8a8d91] block">ক্রিয়েটর শেয়ার (৫৫%):</span>
                    <span className="font-bold text-blue-400">৳ {(totalAdRevenue * 0.55).toFixed(0)}</span>
                  </div>
                  <div>
                    <span className="text-[#8a8d91] block">প্ল্যাটফর্ম শেয়ার (৪৫%):</span>
                    <span className="font-bold text-purple-400">৳ {(totalAdRevenue * 0.45).toFixed(0)}</span>
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
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-blue-950/60 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>ক্রিয়েটর মনিটাইজেশন পলিসি ও রেভিনিউ শেয়ার</span>
                </h3>
                <p className="text-xs text-[#b0b3b8] mt-0.5">
                  শর্ত: কমপক্ষে ৫০০ ফলোয়ার্স, ৯৫%+ হালাল স্কোর এবং বাদ্যযন্ত্রমুক্ত অরিজিনাল দ্বীনি কনটেন্ট।
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400">৫৫% ক্রিয়েটর / ৪৫% প্ল্যাটফর্ম</span>
              </div>
            </div>

            {/* Creators List & Application Review */}
            <div className="bg-[#242526] p-4 sm:p-5 rounded-2xl border border-[#393a3b] space-y-4">
              <h3 className="font-bold text-sm text-white">মনিটাইজেশন আবেদন ও ক্রিয়েটর আর্নিং তালিকা</h3>
              
              <div className="space-y-3">
                {creators.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 bg-[#18191a] rounded-xl border border-[#393a3b] flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-white">{c.name}</h4>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                            হালাল স্কোর: {c.halalScore}%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#b0b3b8]">{c.category}</p>
                        <p className="text-[10px] text-[#8a8d91]">
                          {c.followersCount} ফলোয়ার্স • {c.totalViews.toLocaleString()} মোট ভিউ • {c.payoutMethod}: {c.accountNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-[#393a3b]/60">
                      <div className="text-right">
                        <span className="text-[10px] text-[#8a8d91] block">মোট আয় (Total Earned)</span>
                        <span className="font-bold text-xs sm:text-sm text-emerald-400 font-mono">
                          ৳ {c.totalEarnings.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#8a8d91] block">পরিশোধিত</span>
                        <span className="font-bold text-xs text-white font-mono">
                          ৳ {c.paidEarnings.toLocaleString()}
                        </span>
                      </div>

                      {/* Status & Action */}
                      {c.status === 'approved' ? (
                        <span className="px-3 py-1 rounded-xl bg-emerald-600/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                          অনুমোদিত ✓
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCreatorStatus(c.id, 'approved')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                          >
                            অনুমোদন দিন
                          </button>
                          <button
                            onClick={() => handleCreatorStatus(c.id, 'rejected')}
                            className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold"
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

            {/* Payout & Cashout Requests Ledger */}
            <div className="bg-[#242526] p-4 sm:p-5 rounded-2xl border border-[#393a3b] space-y-4">
              <h3 className="font-bold text-sm text-white">উত্তোলন অনুরোধ ও ক্যাশআউট রেজিস্টার (Payouts)</h3>

              <div className="space-y-2.5">
                {payouts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-[#18191a] rounded-xl border border-[#393a3b] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.creatorAvatar} alt={p.creatorName} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-white">{p.creatorName}</p>
                        <p className="text-[10px] text-[#b0b3b8]">
                          {p.method} • {p.accountNumber} • {p.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        ৳ {p.amount.toLocaleString()}
                      </span>

                      {p.status === 'paid' ? (
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                            পরিশোধিত ✓
                          </span>
                          {p.transactionId && (
                            <p className="text-[9px] text-[#8a8d91] font-mono mt-0.5">{p.transactionId}</p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApprovePayout(p.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-md"
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
        {/* TAB 5: POST & CONTENT MODERATION */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <div className="bg-[#242526] p-4 rounded-2xl border border-[#393a3b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-white">পোস্ট ও কনটেন্ট মডারেশন ({posts.length})</h3>
                <p className="text-xs text-[#b0b3b8]">ব্লক, বাতিল, অনুমোদন, ডিলিট ও ইউজারদের আপিল পরিচালনা</p>
              </div>
              <button
                onClick={() => {
                  handleAskAI('সমস্ত পোস্টের হালাল অডিট ও রিপোর্ট প্রস্তুত করুন');
                  setActiveTab('ai');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto transition-colors"
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
                    ? 'bg-[#1877F2] text-white'
                    : 'bg-[#242526] text-[#b0b3b8] hover:bg-[#3a3b3c] border border-[#393a3b]'
                }`}
              >
                সব পোস্ট ({posts.length})
              </button>
              <button
                onClick={() => setModerationFilter('blocked')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  moderationFilter === 'blocked'
                    ? 'bg-rose-600 text-white'
                    : 'bg-[#242526] text-[#b0b3b8] hover:bg-[#3a3b3c] border border-[#393a3b]'
                }`}
              >
                🚫 ব্লকড ({posts.filter((p) => p.status === 'blocked').length})
              </button>
              <button
                onClick={() => setModerationFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  moderationFilter === 'rejected'
                    ? 'bg-amber-600 text-white'
                    : 'bg-[#242526] text-[#b0b3b8] hover:bg-[#3a3b3c] border border-[#393a3b]'
                }`}
              >
                ⚠️ বাতিল ({posts.filter((p) => p.status === 'rejected').length})
              </button>
              <button
                onClick={() => setModerationFilter('appeals')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors relative ${
                  moderationFilter === 'appeals'
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#242526] text-[#b0b3b8] hover:bg-[#3a3b3c] border border-[#393a3b]'
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
                          ? 'bg-rose-950/20 border-rose-900/50'
                          : isRejected
                          ? 'bg-amber-950/20 border-amber-900/50'
                          : 'bg-[#242526] border-[#393a3b]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#393a3b]/60 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <img src={post.author.avatar} alt={post.author.name} className="w-9 h-9 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-white flex items-center gap-1.5">
                              <span>{post.author.name}</span>
                              <span className="text-[10px] text-[#8a8d91] font-mono">({post.id})</span>
                            </p>
                            <p className="text-[10px] text-[#b0b3b8]">
                              {post.timeAgo} • {post.category} • {post.privacy || 'public'}
                            </p>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center gap-2">
                          {isBlocked && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px]">
                              🚫 ব্লকড (Blocked)
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                              ⚠️ বাতিল (Rejected)
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                              ✓ অনুমোদিত (Approved)
                            </span>
                          )}
                          {post.appealStatus === 'pending' && (
                            <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] animate-pulse">
                              ⚖️ আপিল বিবেচনাধীন
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Post Content */}
                      <p className="text-[#e4e6eb] leading-relaxed bg-[#18191a] p-3 rounded-xl border border-[#393a3b]/60">
                        {post.contentBangla}
                      </p>

                      {post.moderationReason && (
                        <p className="text-[11px] text-amber-400/90 font-medium bg-amber-950/30 p-2 rounded-lg border border-amber-900/40">
                          মডারেশন কারণ: {post.moderationReason}
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#393a3b]/40">
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
                            className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>অনুমোদন (Approve)</span>
                          </button>

                          {/* Block */}
                          <button
                            onClick={() => {
                              setModeratingPost({ id: post.id, action: 'blocked', author: post.author.name });
                              setModerationReasonInput('ইসলামিক শালীনতা ও Peace World গাইডলাইন লঙ্ঘন');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <span>🚫 ব্লক (Block)</span>
                          </button>

                          {/* Reject */}
                          <button
                            onClick={() => {
                              setModeratingPost({ id: post.id, action: 'rejected', author: post.author.name });
                              setModerationReasonInput('অনৈসলামিক বা অনুপযুক্ত কনটেন্ট হওয়ায় বাতিল');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 transition-colors"
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
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 font-semibold text-xs flex items-center gap-1 transition-colors"
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
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#242526] border border-[#393a3b] rounded-2xl p-4 w-full max-w-md space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-[#393a3b] pb-2">
                    <h3 className="font-bold text-white text-sm">
                      পোস্ট {moderatingPost.action === 'blocked' ? 'ব্লক' : 'বাতিল'} করার কারণ
                    </h3>
                    <button onClick={() => setModeratingPost(null)} className="p-1 text-neutral-400 hover:text-white">✕</button>
                  </div>

                  <p className="text-xs text-[#b0b3b8]">
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
                        className="px-2.5 py-1 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] text-[11px]"
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
                    className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl p-3 text-xs text-white outline-none focus:border-rose-500 resize-none"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModeratingPost(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#b0b3b8] hover:bg-[#3a3b3c]"
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
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#242526] w-full max-w-lg rounded-2xl border border-[#393a3b] shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#393a3b] pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#1877F2]" />
                <span>নতুন বিজ্ঞাপন ক্যাম্পেইন যুক্ত করুন</span>
              </h3>
              <button onClick={() => setShowNewAdModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-white mb-1">স্পন্সর / ব্র্যান্ডের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আল-মদিনা আতর ও ফুডস..."
                  value={newSponsor}
                  onChange={(e) => setNewSponsor(e.target.value)}
                  className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#1877F2]"
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">বিজ্ঞাপনের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: জুমার স্পেশাল আতর প্যাকেজে ৫০% ছাড়..."
                  value={newAdTitle}
                  onChange={(e) => setNewAdTitle(e.target.value)}
                  className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#1877F2]"
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">বিজ্ঞাপনের প্লেসমেন্ট</label>
                <select
                  value={newAdPlacement}
                  onChange={(e) => setNewAdPlacement(e.target.value as any)}
                  className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1877F2]"
                >
                  <option value="home_feed">হোম ফিড স্পন্সরড কার্ড (Home Feed In-Stream)</option>
                  <option value="reels_preroll">রিলস ও ওয়াচ ভিডিও প্রিরোল (Reels Video Pre-Roll)</option>
                  <option value="marketplace_top">মার্কেটপ্লেস টপ ব্যানার (Marketplace Top)</option>
                  <option value="story_ad">স্টোরি ইন্টারস্টিশিয়াল অ্যাড (Story Ad)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-white mb-1">CPM রেট (প্রতি ১০০০ ভিউ-তে ৳)</label>
                  <input
                    type="number"
                    value={newAdCpm}
                    onChange={(e) => setNewAdCpm(e.target.value)}
                    className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1877F2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-white mb-1">CPC রেট (প্রতি ক্লিকে ৳)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newAdCpc}
                    onChange={(e) => setNewAdCpc(e.target.value)}
                    className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1877F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-white mb-1">বিজ্ঞাপনের ছবি / ব্যানার URL</label>
                <input
                  type="url"
                  value={newAdImage}
                  onChange={(e) => setNewAdImage(e.target.value)}
                  className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1877F2]"
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">বিজ্ঞাপনের সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  rows={2}
                  value={newAdDesc}
                  onChange={(e) => setNewAdDesc(e.target.value)}
                  placeholder="বিজ্ঞাপনের বিবরণ ও যোগাযোগের উপায় লিখুন..."
                  className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#1877F2] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAdModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#3a3b3c] text-white font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold shadow-lg"
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
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#1877F2] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};
