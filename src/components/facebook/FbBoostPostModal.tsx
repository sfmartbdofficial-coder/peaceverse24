import React, { useState, useEffect } from 'react';
import {
  X,
  Megaphone,
  TrendingUp,
  CheckCircle2,
  Users,
  MessageCircle,
  Globe,
  ShieldCheck,
  Coins,
  PauseCircle,
  Sparkles,
} from 'lucide-react';
import { PostItem } from '../../types';

export interface BoostedCampaign {
  postId: string;
  budget: '500' | '1000' | '2500' | '5000';
  goal: 'engagement' | 'messages' | 'visits';
  audience: 'bangladesh' | 'global' | 'followers';
  startedAt: number;
  status: 'active';
}

const BOOST_STORAGE_KEY = 'peaceverse_boosted_posts_v1';

export const getBoostedPostsMap = (): Record<string, BoostedCampaign> => {
  try {
    const raw = localStorage.getItem(BOOST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const getBoostedPostCampaign = (postId: string): BoostedCampaign | null => {
  const map = getBoostedPostsMap();
  return map[postId] || null;
};

export const saveBoostedPostCampaign = (campaign: BoostedCampaign) => {
  try {
    const map = getBoostedPostsMap();
    map[campaign.postId] = campaign;
    localStorage.setItem(BOOST_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event('peaceverse:boost-updated'));
  } catch {}
};

export const removeBoostedPostCampaign = (postId: string) => {
  try {
    const map = getBoostedPostsMap();
    delete map[postId];
    localStorage.setItem(BOOST_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event('peaceverse:boost-updated'));
  } catch {}
};

interface FbBoostPostModalProps {
  post: PostItem;
  initialMode: 'boost' | 'insights';
  onClose: () => void;
}

const BUDGET_OPTIONS: Array<{
  id: BoostedCampaign['budget'];
  label: string;
  duration: string;
  reach: string;
}> = [
  { id: '500', label: '৳500', duration: '3 দিন', reach: '1.4K – 3.8K reach' },
  { id: '1000', label: '৳1,000', duration: '5 দিন', reach: '3.2K – 9.0K reach' },
  { id: '2500', label: '৳2,500', duration: '7 দিন', reach: '8.5K – 24K reach' },
  { id: '5000', label: '৳5,000', duration: '14 দিন', reach: '18K – 52K reach' },
];

export const FbBoostPostModal: React.FC<FbBoostPostModalProps> = ({
  post,
  initialMode,
  onClose,
}) => {
  const existing = getBoostedPostCampaign(post.id);
  const [mode, setMode] = useState<'boost' | 'insights'>(initialMode);
  const [budget, setBudget] = useState<BoostedCampaign['budget']>(existing?.budget || '1000');
  const [goal, setGoal] = useState<BoostedCampaign['goal']>(existing?.goal || 'engagement');
  const [audience, setAudience] = useState<BoostedCampaign['audience']>(
    existing?.audience || 'bangladesh'
  );
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);
  const [isBoosted, setIsBoosted] = useState<boolean>(Boolean(existing));

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const reactionsTotal = post.reactions?.total || 0;
  const commentsTotal = post.comments?.length || 0;
  const sharesTotal = post.sharesCount || 0;
  const engagementTotal = reactionsTotal + commentsTotal + sharesTotal;
  const estimatedReach =
    (isBoosted ? 1850 : 180) + reactionsTotal * 26 + commentsTotal * 35 + sharesTotal * 48;
  const estimatedClicks = Math.max(8, Math.round(estimatedReach * 0.085));

  const previewImage =
    post.mediaType !== 'video'
      ? (Array.isArray(post.mediaUrls) && post.mediaUrls[0]) || post.mediaUrl
      : undefined;

  const handleSubmitBoost = () => {
    saveBoostedPostCampaign({
      postId: post.id,
      budget,
      goal,
      audience,
      startedAt: existing?.startedAt || Date.now(),
      status: 'active',
    });
    setIsBoosted(true);
    setSubmittedNotice(
      existing
        ? 'আপনার বুস্ট ক্যাম্পেইন আপডেট করা হয়েছে!'
        : '🚀 আপনার পোস্টটি সফলভাবে বুস্ট করা হয়েছে!'
    );
    setTimeout(() => {
      onClose();
    }, 1100);
  };

  const handlePauseBoost = () => {
    removeBoostedPostCampaign(post.id);
    setIsBoosted(false);
    setSubmittedNotice('⏸️ পোস্ট বুস্ট বন্ধ করা হয়েছে।');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[#E4E6EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in text-[#050505]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E6EB] bg-white shrink-0">
          <div className="flex items-center gap-2">
            {mode === 'boost' ? (
              <Megaphone className="w-5 h-5 text-[#0866FF]" />
            ) : (
              <TrendingUp className="w-5 h-5 text-[#0866FF]" />
            )}
            <h3 className="font-bold text-[15px] text-[#050505]">
              {mode === 'boost' ? 'পোস্ট বুস্ট করুন • Boost Post' : 'Post insights and ads'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 border-b border-[#E4E6EB] bg-[#F7F8FA] text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setMode('boost')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              mode === 'boost'
                ? 'border-[#0866FF] text-[#0866FF] bg-white'
                : 'border-transparent text-[#65676B] hover:text-[#050505]'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Boost post</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('insights')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              mode === 'insights'
                ? 'border-[#0866FF] text-[#0866FF] bg-white'
                : 'border-transparent text-[#65676B] hover:text-[#050505]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Insights & Ads</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-4 overflow-y-auto no-scrollbar flex-1">
          {submittedNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{submittedNotice}</span>
            </div>
          )}

          {/* Post Preview Card */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB]">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover border border-[#E4E6EB] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-[#050505] truncate">{post.author.name}</p>
                {isBoosted && (
                  <span className="px-1.5 py-0.5 rounded bg-[#E7F3FF] text-[#0866FF] text-[10px] font-bold">
                    Boosted
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#65676B] line-clamp-2 mt-0.5">
                {post.contentBangla || post.arabicVerse || 'মিডিয়া পোস্ট'}
              </p>
            </div>
            {previewImage && (
              <img
                src={previewImage}
                alt="Post media"
                className="w-12 h-12 rounded-lg object-cover border border-[#E4E6EB] shrink-0"
              />
            )}
          </div>

          {mode === 'insights' ? (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#F0F2F5]">
                  <span className="text-[11px] text-[#65676B] block">People Reached</span>
                  <span className="text-lg font-extrabold text-[#050505] tabular-nums">
                    {estimatedReach.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F0F2F5]">
                  <span className="text-[11px] text-[#65676B] block">Post Engagement</span>
                  <span className="text-lg font-extrabold text-[#0866FF] tabular-nums">
                    {engagementTotal.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F0F2F5]">
                  <span className="text-[11px] text-[#65676B] block">Reactions & Comments</span>
                  <span className="text-base font-bold text-[#050505] tabular-nums">
                    {reactionsTotal} • {commentsTotal}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F0F2F5]">
                  <span className="text-[11px] text-[#65676B] block">Link & Media Clicks</span>
                  <span className="text-base font-bold text-[#050505] tabular-nums">
                    {estimatedClicks.toLocaleString()}
                  </span>
                </div>
              </div>

              {(post.goldenGiftsCount || 0) > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-800 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>প্রাপ্ত গোল্ডেন হাদিয়া</span>
                  </span>
                  <span className="font-extrabold text-amber-700 tabular-nums">
                    🪙 {post.goldenGiftsCount}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setMode('boost')}
                className="w-full py-2.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-sm cursor-pointer transition-colors"
              >
                পোস্টটি বুস্ট করুন · Boost this post
              </button>
            </>
          ) : (
            <>
              {/* Goal */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-[#050505]">লক্ষ্য নির্বাচন করুন (Goal)</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'engagement', label: 'বেশি রিয়েকশন ও রিচ', icon: Sparkles },
                    { id: 'messages', label: 'মেসেজ পান', icon: MessageCircle },
                    { id: 'visits', label: 'পেইজ ভিজিট', icon: Users },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setGoal(opt.id as BoostedCampaign['goal'])}
                        className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          goal === opt.id
                            ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF]'
                            : 'bg-white border-[#E4E6EB] text-[#050505] hover:bg-[#F7F8FA]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10.5px] font-bold leading-tight">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audience */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-[#050505]">অডিয়েন্স (Audience)</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'bangladesh', label: 'বাংলাদেশ (18–65+)' },
                    { id: 'global', label: 'গ্লোবাল উম্মাহ' },
                    { id: 'followers', label: 'ফলোয়ার ও বন্ধু' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAudience(opt.id as BoostedCampaign['audience'])}
                      className={`px-2 py-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        audience === opt.id
                          ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF]'
                          : 'bg-white border-[#E4E6EB] text-[#050505] hover:bg-[#F7F8FA]'
                      }`}
                    >
                      <Globe className="w-3 h-3 shrink-0" />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget & Duration */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-[#050505]">
                  বাজেট ও সময় (Total Budget & Duration)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {BUDGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBudget(opt.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        budget === opt.id
                          ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF]'
                          : 'bg-white border-[#E4E6EB] text-[#050505] hover:bg-[#F7F8FA]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold">{opt.label}</span>
                        <span className="text-[10.5px] font-semibold text-[#65676B]">
                          {opt.duration}
                        </span>
                      </div>
                      <span className="text-[10.5px] text-[#65676B] block mt-0.5">
                        {opt.reach}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Halal Ad Guarantee */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-[11px] text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>১০০% হালাল ও শালীন বিজ্ঞাপন নীতিমালার আওতায় বুস্ট প্রদর্শিত হবে।</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                {isBoosted && (
                  <button
                    type="button"
                    onClick={handlePauseBoost}
                    className="px-3.5 py-2.5 rounded-lg bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <PauseCircle className="w-4 h-4 text-rose-600" />
                    <span>বন্ধ করুন</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmitBoost}
                  className="flex-1 py-2.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] active:scale-[0.99] text-white font-bold text-sm cursor-pointer transition-all"
                >
                  {isBoosted ? 'বুস্ট আপডেট করুন · Update boost' : 'পোস্ট বুস্ট করুন · Boost post now'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
