import React, { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Send,
  Building,
  Smartphone,
  Sparkles,
  Award,
  Video,
  Users,
  Eye,
  AlertCircle,
  HelpCircle,
  Check,
  Globe,
} from 'lucide-react';
import { UserProfile, PageItem } from '../../types';
import { PayoutRequest, MonetizedCreator } from '../../types/admin';
import { INITIAL_CREATORS, INITIAL_PAYOUTS } from '../../data/adminData';
import { useLanguage } from '../../context/LanguageContext';
import { GlobalWorldMap } from '../global/GlobalWorldMap';

interface CreatorMonetizationModalProps {
  userProfile: UserProfile;
  page?: PageItem;
  onClose: () => void;
}

export const CreatorMonetizationModal: React.FC<CreatorMonetizationModalProps> = ({
  userProfile,
  page,
  onClose,
}) => {
  const { t } = useLanguage();

  // Load or initialize creators from localStorage
  const [creators, setCreators] = useState<MonetizedCreator[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_admin_creators');
      return stored ? JSON.parse(stored) : INITIAL_CREATORS;
    } catch {
      return INITIAL_CREATORS;
    }
  });

  // Current creator profile (matches either page or user)
  const creatorId = page ? page.id : 'c-1';
  const creatorName = page ? page.name : userProfile.name;
  const creatorAvatar = page ? page.avatar : userProfile.avatar;

  const currentCreatorData = creators.find((c) => c.id === creatorId || c.name === creatorName) || {
    id: creatorId,
    name: creatorName,
    avatar: creatorAvatar,
    category: page?.category || 'ইসলামিক কন্টেন্ট ও নসিহত',
    followersCount: page ? page.followersCount : 5400,
    totalViews: 312000,
    halalScore: 100,
    status: (page ? (page.followersCount >= 5000 ? 'approved' : 'pending') : 'approved') as 'approved' | 'pending' | 'rejected',
    totalEarnings: 24500,
    paidEarnings: 15000,
    pendingBalance: 9500,
    appliedDate: '15 Oct 2026',
    payoutMethod: 'bKash' as const,
    accountNumber: '01711-234567',
  };

  // Payout requests
  const [payouts, setPayouts] = useState<PayoutRequest[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_admin_payouts');
      return stored ? JSON.parse(stored) : INITIAL_PAYOUTS;
    } catch {
      return INITIAL_PAYOUTS;
    }
  });

  // Active view tab
  const [activeTab, setActiveTab] = useState<'overview' | 'global_hadiya' | 'eligibility' | 'withdraw' | 'history'>('overview');

  // Withdrawal form state
  const [payoutMethod, setPayoutMethod] = useState<'PayPal' | 'Stripe' | 'Payoneer' | 'bKash' | 'Nagad' | 'Bank'>('PayPal');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('5000');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);
  const [payoutErrorMsg, setPayoutErrorMsg] = useState<string | null>(null);

  // Ad streams toggle
  const [inStreamEnabled, setInStreamEnabled] = useState(true);
  const [reelsAdsEnabled, setReelsAdsEnabled] = useState(true);
  const [starsEnabled, setStarsEnabled] = useState(true);

  // Eligibility calculation (Facebook criteria: 5,000 followers, 60,000 watch minutes)
  const requiredFollowers = 5000;
  const currentFollowers = currentCreatorData.followersCount;
  const followersPercentage = Math.min(100, Math.round((currentFollowers / requiredFollowers) * 100));

  const requiredMinutes = 60000;
  const currentMinutes = 78400; // minutes viewed
  const minutesPercentage = Math.min(100, Math.round((currentMinutes / requiredMinutes) * 100));

  const isEligible = currentFollowers >= requiredFollowers && currentMinutes >= requiredMinutes;
  const isApproved = currentCreatorData.status === 'approved';

  // Handle Payout Request Submission
  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutErrorMsg(null);
    setPayoutSuccessMsg(null);
    const amountNum = Number(payoutAmount);
    if (!amountNum || amountNum <= 0) {
      setPayoutErrorMsg('সঠিক উত্তোলনের পরিমাণ লিখুন (Enter a valid payout amount).');
      return;
    }
    if (amountNum > currentCreatorData.pendingBalance) {
      setPayoutErrorMsg(`আপনার বর্তমান উত্তোলনযোগ্য ব্যালেন্স ৳${currentCreatorData.pendingBalance} ($${(currentCreatorData.pendingBalance / 115).toFixed(2)} USD)। এর বেশি তোলা সম্ভব নয়।`);
      return;
    }
    if (!payoutAccount.trim()) {
      setPayoutErrorMsg(`আপনার ${payoutMethod} একাউন্ট / ইমেইল / নম্বর লিখুন।`);
      return;
    }

    setSubmittingPayout(true);

    setTimeout(() => {
      const newPayout: PayoutRequest = {
        id: `payout-${Date.now()}`,
        creatorId: currentCreatorData.id,
        creatorName: currentCreatorData.name,
        creatorAvatar: currentCreatorData.avatar,
        amount: amountNum,
        method: payoutMethod,
        accountNumber: payoutAccount,
        date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'pending',
        transactionId: `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      const updatedPayouts = [newPayout, ...payouts];
      setPayouts(updatedPayouts);

      // Deduct from pending balance
      const updatedCreators = creators.map((c) => {
        if (c.id === currentCreatorData.id || c.name === currentCreatorData.name) {
          return {
            ...c,
            pendingBalance: Math.max(0, c.pendingBalance - amountNum),
          };
        }
        return c;
      });
      setCreators(updatedCreators);

      try {
        localStorage.setItem('qalby_admin_payouts', JSON.stringify(updatedPayouts));
        localStorage.setItem('qalby_admin_creators', JSON.stringify(updatedCreators));
      } catch {}

      setSubmittingPayout(false);
      setPayoutSuccessMsg(`মাশাআল্লাহ! ৳${amountNum} উত্তোলনের আবেদন সফলভাবে গ্রহণ করা হয়েছে (ID: ${newPayout.transactionId})। অ্যাডমিন ভেরিফিকেশনের পর আপনার ${payoutMethod}-এ টাকা পাঠানো হবে।`);
      setPayoutAmount('');
      setPayoutAccount('');
    }, 1200);
  };

  // Quick Approval trigger for testing
  const handleToggleApproval = () => {
    const nextStatus: 'approved' | 'pending' = currentCreatorData.status === 'approved' ? 'pending' : 'approved';
    const updated: MonetizedCreator[] = creators.map((c) => {
      if (c.id === currentCreatorData.id || c.name === currentCreatorData.name) {
        return { ...c, status: nextStatus, followersCount: Math.max(c.followersCount, 5400) };
      }
      return c;
    });
    setCreators(updated);
    try {
      localStorage.setItem('qalby_admin_creators', JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#242526] text-white rounded-3xl border border-[#393a3b] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600/25 via-[#242526] to-[#1877F2]/20 border-b border-[#393a3b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md">
              <img src={creatorAvatar} alt={creatorName} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-bold text-white">{creatorName}</h2>
                <ShieldCheck className="w-4 h-4 text-[#1877F2] fill-[#1877F2]/20" />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isApproved
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {isApproved ? 'মনিটাইজেশন সক্রিয় (Active)' : 'আবেদন পর্যালোচনায়'}
                </span>
              </div>
              <p className="text-xs text-[#b0b3b8]">
                {page ? 'পেজ ক্রিয়েটর স্টুডিও' : 'মূল আইডি প্রফেশনাল ড্যাশবোর্ড'} • ৫৫/৪৫ শরিয়াহ রেভিনিউ শেয়ার
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#393a3b] bg-[#18191a] px-2 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 min-w-[100px] py-3 border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap px-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>উপার্জন ড্যাশবোর্ড</span>
          </button>

          <button
            onClick={() => setActiveTab('global_hadiya')}
            className={`flex-1 min-w-[125px] py-3 border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap px-2 cursor-pointer ${
              activeTab === 'global_hadiya'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Global Hadiya (20 Countries)</span>
          </button>

          <button
            onClick={() => setActiveTab('eligibility')}
            className={`flex-1 min-w-[110px] py-3 border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap px-2 cursor-pointer ${
              activeTab === 'eligibility'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>শর্ত ({followersPercentage}%)</span>
          </button>

          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 min-w-[110px] py-3 border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap px-2 cursor-pointer ${
              activeTab === 'withdraw'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>PayPal / Withdraw</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 min-w-[95px] py-3 border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap px-2 cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>হিস্ট্রি</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              
              {/* Halal Guarantee Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[#242526] to-[#242526] border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">১০০% হালাল অ্যাডভার্টাইজিং নেটওয়ার্ক</h4>
                    <p className="text-[11px] text-[#b0b3b8]">কোনো সুদ, বাদ্যযন্ত্র বা অশ্লীল বিজ্ঞাপন আপনার কনটেন্টে চলবে না।</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  শরিয়াহ সম্মত
                </span>
              </div>

              {/* Earnings Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#18191a] p-3.5 rounded-2xl border border-[#393a3b] space-y-1">
                  <div className="flex items-center justify-between text-[#b0b3b8] text-xs">
                    <span>উত্তোলনযোগ্য ব্যালেন্স</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-400">
                    ৳{currentCreatorData.pendingBalance.toLocaleString('bn-BD')}
                  </p>
                  <p className="text-[10px] text-[#8a8d91]">(${(currentCreatorData.pendingBalance / 115).toFixed(2)} USD)</p>
                </div>

                <div className="bg-[#18191a] p-3.5 rounded-2xl border border-[#393a3b] space-y-1">
                  <div className="flex items-center justify-between text-[#b0b3b8] text-xs">
                    <span>সর্বমোট অর্জিত আয়</span>
                    <TrendingUp className="w-4 h-4 text-[#1877F2]" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-white">
                    ৳{currentCreatorData.totalEarnings.toLocaleString('bn-BD')}
                  </p>
                  <p className="text-[10px] text-[#8a8d91]">(${(currentCreatorData.totalEarnings / 115).toFixed(2)} USD)</p>
                </div>

                <div className="bg-[#18191a] p-3.5 rounded-2xl border border-[#393a3b] space-y-1">
                  <div className="flex items-center justify-between text-[#b0b3b8] text-xs">
                    <span>পরিশোধিত অর্থ (Paid)</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#b0b3b8]">
                    ৳{currentCreatorData.paidEarnings.toLocaleString('bn-BD')}
                  </p>
                  <p className="text-[10px] text-[#8a8d91]">সরাসরি বিকাশ/ব্যাংকে প্রেরিত</p>
                </div>
              </div>

              {/* In-Stream Ads & Revenue Channels */}
              <div className="bg-[#18191a] rounded-2xl border border-[#393a3b] p-4 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                  <span>বিজ্ঞাপন চ্যানেল ও মনিটাইজেশন টুলস</span>
                  <span className="text-emerald-400 normal-case font-semibold text-[11px]">৫৫% ক্রিয়েটর শেয়ার সক্রিয়</span>
                </h3>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#242526] border border-[#393a3b]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1877F2]/20 text-[#1877F2] flex items-center justify-center">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">ইন-স্ট্রিম ভিডিও বিজ্ঞাপন (In-Stream Ads)</p>
                        <p className="text-[10px] text-[#b0b3b8]">প্রতি ১,০০০ ভিউয়ে আনুমানিক ৳১৫০ - ৳১৮০ আয়</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inStreamEnabled}
                        onChange={() => setInStreamEnabled(!inStreamEnabled)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#3a3b3c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1877F2]" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#242526] border border-[#393a3b]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">রিলস ওভারলে অ্যাড (Reels Overlay Ads)</p>
                        <p className="text-[10px] text-[#b0b3b8]">শর্ট ভিডিওতে ৩-সেকেন্ডের হালাল স্পন্সর ব্যানার</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reelsAdsEnabled}
                        onChange={() => setReelsAdsEnabled(!reelsAdsEnabled)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#3a3b3c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1877F2]" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#242526] border border-[#393a3b]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">স্টার্স ও হাদিয়া (Stars & Gifts)</p>
                        <p className="text-[10px] text-[#b0b3b8]">দর্শকদের পক্ষ থেকে সরাসরি ইসলামিক উপহার ও হাদিয়া</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={starsEnabled}
                        onChange={() => setStarsEnabled(!starsEnabled)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#3a3b3c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1877F2]" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Quick Action Button to Global Map & Withdraw */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => setActiveTab('global_hadiya')}
                  className="py-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>🌍 Hadiya from 20 Countries Map</span>
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className="py-3 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>PayPal Global Payout (৳{currentCreatorData.pendingBalance})</span>
                </button>
              </div>

            </div>
          )}

          {/* GLOBAL HADIYA 20-COUNTRY MAP TAB */}
          {activeTab === 'global_hadiya' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#1877F2]" />
                    <span>Global Creator Hadiya — 20 Countries</span>
                  </h3>
                  <p className="text-[11px] text-[#b0b3b8]">
                    Receive halal Hadiya worldwide from USA, UK, Saudi Arabia, Indonesia, Bangladesh &amp; payout via PayPal Global.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('withdraw')}
                  className="px-3 py-1.5 rounded-lg bg-[#0866FF] hover:bg-[#166fe5] text-white text-xs font-bold cursor-pointer"
                >
                  Payout via PayPal
                </button>
              </div>
              <GlobalWorldMap mode="creator" />
            </div>
          )}

          {/* TAB 2: ELIGIBILITY & CRITERIA */}
          {activeTab === 'eligibility' && (
            <div className="space-y-4">
              
              <div className="bg-[#18191a] p-4 rounded-2xl border border-[#393a3b] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">মনিটাইজেশন পাওয়ার নিয়ম ও শর্তাবলী</h3>
                  <button
                    onClick={handleToggleApproval}
                    className="text-[11px] font-bold text-[#1877F2] hover:underline"
                    title="টেস্টিংয়ের জন্য স্ট্যাটাস পরিবর্তন করুন"
                  >
                    [ডেভ/টেস্ট টগল]
                  </button>
                </div>

                {/* Criterion 1: Followers */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[#e4e6eb] font-semibold">
                      <Users className="w-3.5 h-3.5 text-[#1877F2]" />
                      ন্যূনতম ৫,০০০ ফলোয়ার প্রয়োজন
                    </span>
                    <span className="font-bold text-white">
                      {currentFollowers.toLocaleString('bn-BD')} / ৫,০০০ ({followersPercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#242526] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        currentFollowers >= requiredFollowers ? 'bg-emerald-500' : 'bg-[#1877F2]'
                      }`}
                      style={{ width: `${followersPercentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#8a8d91]">
                    {currentFollowers >= requiredFollowers
                      ? '✓ এই শর্তটি সফলভাবে পূরণ হয়েছে।'
                      : `আর মাত্র ${(requiredFollowers - currentFollowers).toLocaleString('bn-BD')} জন ফলোয়ার প্রয়োজন।`}
                  </p>
                </div>

                {/* Criterion 2: Watch Time */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[#e4e6eb] font-semibold">
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      ৬০ দিনে ৬০,০০০ ভিউ মিনিট
                    </span>
                    <span className="font-bold text-white">
                      {currentMinutes.toLocaleString('bn-BD')} / ৬০,০০০ ({minutesPercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#242526] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        currentMinutes >= requiredMinutes ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${minutesPercentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#8a8d91]">
                    {currentMinutes >= requiredMinutes
                      ? '✓ মোট ভিউ মিনিটের শর্ত সম্পন্ন হয়েছে।'
                      : 'নিয়মিত নতুন ভিডিও আপলোড করে ওয়াচ মিনিট বাড়ান।'}
                  </p>
                </div>

                {/* Criterion 3: Halal Policy */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#242526] border border-[#393a3b]">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">১০০% হালাল কনটেন্ট নীতি মেনে চলা</h4>
                    <p className="text-[11px] text-[#b0b3b8] mt-0.5 leading-relaxed">
                      বাদ্যযন্ত্রমুক্ত, শালীন পোশাক, সহিহ দ্বীনি জ্ঞান এবং কোনো কপিরাইট লঙ্ঘন ছাড়া মৌলিক কনটেন্ট তৈরি করা।
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-400">
                      আপনার প্রোফাইল হালাল স্কোর: ১০০% কমপ্লায়েন্ট
                    </span>
                  </div>
                </div>

                {/* Eligibility Result Banner */}
                {isApproved ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white">মাশাআল্লাহ! আপনি মনিটাইজেশন পাওয়ার যোগ্য!</h4>
                    <p className="text-xs text-[#b0b3b8]">
                      আপনার পেজ/আইডিতে ইন-স্ট্রিম বিজ্ঞাপন সক্রিয় করা হয়েছে। নিয়মিত ভিডিও ও পোস্টের ভিউ অনুযায়ী স্বয়ংক্রিয়ভাবে আয় যোগ হবে।
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white">মনিটাইজেশনের শর্তগুলো পূরণ করুন</h4>
                    <p className="text-xs text-[#b0b3b8]">
                      আপনার পেজে আরও ভিডিও আপলোড করুন এবং ফলোয়ার বৃদ্ধি করুন। ৫,০০০ ফলোয়ার পূর্ণ হলেই স্বয়ংক্রিয়ভাবে আবেদন সক্রিয় হবে।
                    </p>
                    <button
                      onClick={handleToggleApproval}
                      className="px-4 py-1.5 rounded-xl bg-[#1877F2] text-white text-xs font-bold shadow"
                    >
                      এখনই আবেদন সাবমিট করুন (Apply Now)
                    </button>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB 3: WITHDRAWAL FORM */}
          {activeTab === 'withdraw' && (
            <div className="space-y-4">
              
              {payoutErrorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{payoutErrorMsg}</span>
                </div>
              )}

              {payoutSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{payoutSuccessMsg}</p>
                </div>
              )}

              <form onSubmit={handleRequestPayout} className="bg-[#18191a] p-4 rounded-2xl border border-[#393a3b] space-y-4">
                <div className="flex items-center justify-between border-b border-[#393a3b] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">Global &amp; Local Payout Request</h3>
                    <p className="text-xs text-[#b0b3b8]">
                      PayPal Global / Stripe / Payoneer / bKash / Nagad • Max: ৳{currentCreatorData.pendingBalance} (${(currentCreatorData.pendingBalance / 115).toFixed(2)} USD)
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    ${(currentCreatorData.pendingBalance / 115).toFixed(2)} USD
                  </span>
                </div>

                {/* Payout Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white block">Select Global or Local Payout Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('PayPal')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        payoutMethod === 'PayPal'
                          ? 'border-[#0070BA] bg-[#0070BA]/20 text-white font-bold'
                          : 'border-[#393a3b] bg-[#242526] text-[#b0b3b8] hover:text-white'
                      }`}
                    >
                      <Globe className="w-4 h-4 text-[#00AEEF]" />
                      <span className="text-xs">PayPal Global</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayoutMethod('Stripe')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        payoutMethod === 'Stripe'
                          ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold'
                          : 'border-[#393a3b] bg-[#242526] text-[#b0b3b8] hover:text-white'
                      }`}
                    >
                      <DollarSign className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs">Stripe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayoutMethod('Payoneer')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        payoutMethod === 'Payoneer'
                          ? 'border-orange-500 bg-orange-500/20 text-white font-bold'
                          : 'border-[#393a3b] bg-[#242526] text-[#b0b3b8] hover:text-white'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4 text-orange-400" />
                      <span className="text-xs">Payoneer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayoutMethod('bKash')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        payoutMethod === 'bKash'
                          ? 'border-[#E2136E] bg-[#E2136E]/15 text-white font-bold'
                          : 'border-[#393a3b] bg-[#242526] text-[#b0b3b8] hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-[#E2136E]" />
                      <span className="text-xs">বিকাশ (bKash)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayoutMethod('Nagad')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        payoutMethod === 'Nagad'
                          ? 'border-[#F7941D] bg-[#F7941D]/15 text-white font-bold'
                          : 'border-[#393a3b] bg-[#242526] text-[#b0b3b8] hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-[#F7941D]" />
                      <span className="text-xs">নগদ (Nagad)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayoutMethod('Bank')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        payoutMethod === 'Bank'
                          ? 'border-[#1877F2] bg-[#1877F2]/15 text-white font-bold'
                          : 'border-[#393a3b] bg-[#242526] text-[#b0b3b8] hover:text-white'
                      }`}
                    >
                      <Building className="w-4 h-4 text-[#1877F2]" />
                      <span className="text-xs">Global Bank</span>
                    </button>
                  </div>
                </div>

                {/* Account Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block">
                    {payoutMethod === 'PayPal' || payoutMethod === 'Payoneer' || payoutMethod === 'Stripe'
                      ? `${payoutMethod} Email or Connected Account ID`
                      : payoutMethod === 'Bank'
                      ? 'SWIFT / IBAN / Bank Account Number'
                      : `${payoutMethod} মোবাইল নম্বর`}
                  </label>
                  <input
                    type="text"
                    required
                    value={payoutAccount}
                    onChange={(e) => setPayoutAccount(e.target.value)}
                    placeholder={
                      payoutMethod === 'PayPal'
                        ? 'creator@paypal-email.com'
                        : payoutMethod === 'Stripe' || payoutMethod === 'Payoneer'
                        ? 'creator@global-account.com'
                        : payoutMethod === 'Bank'
                        ? 'IBAN / SWIFT / Bank Account'
                        : '01711234567'
                    }
                    className="w-full bg-[#242526] border border-[#393a3b] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2]"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-white">উত্তোলনের পরিমাণ (টাকায়)</label>
                    <button
                      type="button"
                      onClick={() => setPayoutAmount(String(currentCreatorData.pendingBalance))}
                      className="text-[#1877F2] font-semibold hover:underline"
                    >
                      সম্পূর্ণ ব্যালেন্স (৳{currentCreatorData.pendingBalance})
                    </button>
                  </div>
                  <input
                    type="number"
                    required
                    min={1000}
                    max={currentCreatorData.pendingBalance}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full bg-[#242526] border border-[#393a3b] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingPayout || currentCreatorData.pendingBalance < 1000}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {submittingPayout ? 'আবেদন পাঠানো হচ্ছে...' : `উত্তোলনের আবেদন জমা দিন (৳${payoutAmount || 0})`}
                  </span>
                </button>

                <p className="text-[11px] text-[#8a8d91] text-center">
                  * পেমেন্ট রিকোয়েস্ট সাধারণত ১২ থেকে ২৪ ঘণ্টার মধ্যে অ্যাডমিন ভেরিফিকেশন শেষে সরাসরি প্রেরণ করা হয়।
                </p>
              </form>

            </div>
          )}

          {/* TAB 4: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#b0b3b8] uppercase tracking-wider">সর্বশেষ পেমেন্ট রিকোয়েস্ট হিস্ট্রি</h3>

              {payouts.length === 0 ? (
                <div className="bg-[#18191a] p-6 rounded-2xl text-center border border-[#393a3b] text-xs text-[#b0b3b8]">
                  এখনও কোনো পেমেন্ট উত্তোলনের আবেদন করা হয়নি।
                </div>
              ) : (
                payouts.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                        item.method === 'bKash'
                          ? 'bg-[#E2136E]/20 text-[#E2136E]'
                          : item.method === 'Nagad'
                          ? 'bg-[#F7941D]/20 text-[#F7941D]'
                          : 'bg-[#1877F2]/20 text-[#1877F2]'
                      }`}>
                        {item.method === 'bKash' ? 'bK' : item.method === 'Nagad' ? 'NG' : '🏦'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white">৳{item.amount.toLocaleString('bn-BD')}</p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            item.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {item.status === 'paid' ? 'পরিশোধিত (Paid)' : 'পেন্ডিং (Processing)'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#b0b3b8]">
                          {item.method} ({item.accountNumber}) • {item.date}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#8a8d91] block">
                        {item.transactionId || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
