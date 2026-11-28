import React, { useState } from 'react';
import {
  ArrowLeft,
  Video,
  Coins,
  ShieldCheck,
  Ban,
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  LogOut,
  Shield,
  FileText,
  Sparkles,
  Play,
} from 'lucide-react';
import { PostItem, UserProfile, NidVerificationData } from '../../types';
import { uploadMediaFile } from '../../lib/mediaStorage';
import { submitContentReportToFirestore } from '../../lib/firebase';
import { useLanguage } from '../../context/LanguageContext';

export type StudioTab = 'videos' | 'wallet' | 'nid' | 'safety' | 'settings';

interface YtStudioProfileViewProps {
  userProfile: UserProfile;
  myPosts: PostItem[];
  initialTab?: StudioTab;
  blockedCreatorIds: string[];
  isAdmin?: boolean;
  onBack: () => void;
  onWatchVideo: (post: PostItem) => void;
  onOpenWallet: () => void;
  onSaveNidVerification: (nid: NidVerificationData) => Promise<void> | void;
  onUnblockCreator: (creatorId: string) => void;
  onOpenAdminPortal?: () => void;
  onOpenLegalTab?: (tab: 'privacy' | 'terms' | 'guidelines') => void;
  onLogout: () => void;
}

export const YtStudioProfileView: React.FC<YtStudioProfileViewProps> = ({
  userProfile,
  myPosts,
  initialTab = 'videos',
  blockedCreatorIds,
  isAdmin,
  onBack,
  onWatchVideo,
  onOpenWallet,
  onSaveNidVerification,
  onUnblockCreator,
  onOpenAdminPortal,
  onOpenLegalTab,
  onLogout,
}) => {
  const { currentLang, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<StudioTab>(initialTab);

  // NID 18+ Verification State
  const [fullName, setFullName] = useState(
    userProfile.nidVerification?.fullName || userProfile.name || ''
  );
  const [nidNumber, setNidNumber] = useState(
    userProfile.nidVerification?.nidNumber || ''
  );
  const [dob, setDob] = useState(userProfile.nidVerification?.dateOfBirth || '');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [nidSaving, setNidSaving] = useState(false);
  const [nidError, setNidError] = useState<string | null>(null);
  const [nidSuccess, setNidSuccess] = useState<string | null>(null);

  // Safety report form
  const [safetyReportText, setSafetyReportText] = useState('');
  const [safetyReportSent, setSafetyReportSent] = useState(false);

  const isVerified = userProfile.nidVerification?.status === 'verified';
  const totalViews = myPosts.reduce((sum, p) => sum + (p.viewsCount || 1), 0);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleSubmitNid = async (e: React.FormEvent) => {
    e.preventDefault();
    setNidError(null);
    setNidSuccess(null);

    if (!fullName.trim() || nidNumber.replace(/\D/g, '').length < 10) {
      setNidError('Please enter your full legal name and a valid 10–17 digit NID number.');
      return;
    }
    if (!dob) {
      setNidError('Please enter your Date of Birth (must be 18+).');
      return;
    }
    const birthYear = new Date(dob).getFullYear();
    const age = new Date().getFullYear() - birthYear;
    if (!Number.isFinite(age) || age < 18) {
      setNidError('You must be 18+ years old to verify NID for Peace Live.');
      return;
    }

    setNidSaving(true);
    try {
      let frontUrl = userProfile.nidVerification?.frontImageUrl;
      let backUrl = userProfile.nidVerification?.backImageUrl;
      if (frontFile) {
        frontUrl = await uploadMediaFile(frontFile, {
          mimeType: frontFile.type || 'image/jpeg',
          fileName: 'nid-front',
        });
      }
      if (backFile) {
        backUrl = await uploadMediaFile(backFile, {
          mimeType: backFile.type || 'image/jpeg',
          fileName: 'nid-back',
        });
      }
      const payload: NidVerificationData = {
        status: 'verified',
        fullName: fullName.trim(),
        nidNumber: nidNumber.trim(),
        dateOfBirth: dob,
        isAdult18Plus: true,
        frontImageUrl: frontUrl,
        backImageUrl: backUrl,
        verifiedAt: new Date().toISOString(),
      };
      await onSaveNidVerification(payload);
      setNidSuccess('18+ NID Verified! You can now host 6-Seat Peace Live rooms.');
    } catch (err: any) {
      setNidError(err?.message || 'Could not save verification. Please try again.');
    } finally {
      setNidSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 px-3 sm:px-5 pt-4 space-y-5">
      {/* Studio Channel Header */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="h-9 px-3 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xs font-bold inline-flex items-center gap-1.5 text-zinc-800 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Feed</span>
          </button>
          <span className="text-xs font-extrabold text-[#16A34A] uppercase tracking-wider">
            YouTube Studio
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#16A34A]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-zinc-950">{userProfile.name}</h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16A34A]">
                    <ShieldCheck className="w-4 h-4" />
                    18+ Live
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {myPosts.length} videos · {totalViews.toLocaleString()} views ·{' '}
                {userProfile.location || 'Bangladesh & Global'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenWallet}
              className="h-10 px-4 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold cursor-pointer"
            >
              Buy / Withdraw
            </button>
          </div>
        </div>

        {/* Studio Quick Metrics */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
            <p className="text-[11px] font-bold text-zinc-500">My Videos</p>
            <p className="text-base font-extrabold text-zinc-950 mt-0.5">{myPosts.length}</p>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
            <p className="text-[11px] font-bold text-zinc-500">My Coins</p>
            <p className="text-base font-extrabold text-[#DC2626] mt-0.5">
              {(userProfile.goldenCoins ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
            <p className="text-[11px] font-bold text-[#16A34A]">My Beans (60%)</p>
            <p className="text-base font-extrabold text-zinc-950 mt-0.5">
              {(userProfile.beansBalance ?? userProfile.earnedCoins ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Studio Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {(
          [
            { id: 'videos', label: 'My Videos', icon: Video },
            { id: 'wallet', label: 'Coins & Beans', icon: Coins },
            { id: 'nid', label: 'NID 18+ Live', icon: ShieldCheck },
            { id: 'safety', label: 'Report & Block', icon: Ban },
            { id: 'settings', label: 'Settings', icon: Settings },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`h-10 px-4 rounded-full text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                active
                  ? 'bg-zinc-950 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: My Videos */}
      {activeTab === 'videos' && (
        <div className="space-y-3">
          {myPosts.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center space-y-2">
              <Video className="w-8 h-8 text-zinc-400 mx-auto" />
              <p className="text-sm font-extrabold text-zinc-900">No uploaded videos yet</p>
              <p className="text-xs text-zinc-500">
                Press the center + button at the bottom to upload a Video or Peace Short.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => onWatchVideo(post)}
                  className="bg-white border border-zinc-200 hover:border-[#DC2626] rounded-2xl p-3 flex items-center gap-3 text-left cursor-pointer transition-colors"
                >
                  <div className="w-28 aspect-video rounded-xl bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {post.thumbnailUrl ? (
                      <img src={post.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Play className="w-5 h-5 text-white fill-white" />
                    )}
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold">
                      {post.duration || '01:00'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-zinc-950 line-clamp-2">
                      {post.contentBangla}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      {(post.viewsCount || 1).toLocaleString()} views · {post.reactions.total} likes
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Coins & Beans */}
      {activeTab === 'wallet' && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-zinc-950">
                Creator Earnings &amp; Coins
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                1 Coin = ৳2 / $0.015 · Host keeps 60% as Beans · App receives 40%
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-[#16A34A]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
              <p className="text-xs font-bold text-zinc-500">Available Coins</p>
              <p className="text-2xl font-extrabold text-zinc-950 mt-1">
                {(userProfile.goldenCoins ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs font-bold text-[#16A34A]">Withdrawable Beans (60%)</p>
              <p className="text-2xl font-extrabold text-zinc-950 mt-1">
                {(userProfile.beansBalance ?? userProfile.earnedCoins ?? 0).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenWallet}
            className="w-full h-11 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-sm cursor-pointer"
          >
            Open Buy Coins &amp; Withdraw (bKash / Nagad / Visa)
          </button>
        </div>
      )}

      {/* TAB 3: NID Verification 18+ for Live */}
      {activeTab === 'nid' && (
        <form
          onSubmit={handleSubmitNid}
          className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-zinc-950">
                NID Verification (18+ for Peace Live)
              </h3>
              <p className="text-xs text-zinc-500">
                Required to host 6-Seat Peace Live rooms &amp; receive creator Beans.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                isVerified
                  ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                  : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {isVerified ? 'Verified 18+' : 'Unverified'}
            </span>
          </div>

          {nidError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#DC2626] text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{nidError}</span>
            </div>
          )}
          {nidSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#16A34A] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{nidSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#16A34A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">NID / Passport Number</label>
              <input
                type="text"
                required
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value)}
                placeholder="10–17 digit NID"
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Date of Birth (18+)</label>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#16A34A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="p-3 rounded-xl border border-dashed border-zinc-300 text-xs font-bold text-zinc-700 flex items-center justify-center gap-2 cursor-pointer hover:border-[#16A34A]">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Upload className="w-4 h-4 text-[#16A34A]" />
              <span className="truncate">{frontFile ? frontFile.name : 'Upload NID Front'}</span>
            </label>
            <label className="p-3 rounded-xl border border-dashed border-zinc-300 text-xs font-bold text-zinc-700 flex items-center justify-center gap-2 cursor-pointer hover:border-[#16A34A]">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBackFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Upload className="w-4 h-4 text-[#16A34A]" />
              <span className="truncate">{backFile ? backFile.name : 'Upload NID Back'}</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={nidSaving}
            className="w-full h-11 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {nidSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isVerified ? 'Update 18+ Verification' : 'Verify 18+ NID Now'}</span>
          </button>
        </form>
      )}

      {/* TAB 4: Report & Block */}
      {activeTab === 'safety' && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-base font-extrabold text-zinc-950">Blocked Channels</h3>
            {blockedCreatorIds.length === 0 ? (
              <p className="text-xs text-zinc-500">You have not blocked any channels.</p>
            ) : (
              <div className="space-y-2">
                {blockedCreatorIds.map((id) => (
                  <div
                    key={id}
                    className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-zinc-900">{id}</span>
                    <button
                      type="button"
                      onClick={() => onUnblockCreator(id)}
                      className="px-3 py-1 rounded-full bg-[#16A34A] text-white font-bold cursor-pointer"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!safetyReportText.trim()) return;
              await submitContentReportToFirestore({
                reporterId: userProfile.id || 'guest-user',
                targetType: 'channel',
                targetId: 'platform-safety',
                reason: 'User safety / Halal feedback',
                details: safetyReportText.trim(),
              });
              setSafetyReportText('');
              setSafetyReportSent(true);
              setTimeout(() => setSafetyReportSent(false), 3000);
            }}
            className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3"
          >
            <h3 className="text-base font-extrabold text-zinc-950">Report Content or Issue</h3>
            <textarea
              rows={3}
              value={safetyReportText}
              onChange={(e) => setSafetyReportText(e.target.value)}
              placeholder="Describe any non-Halal video, live room, or user..."
              className="w-full rounded-xl border border-zinc-200 p-3 text-xs focus:outline-none focus:border-[#DC2626]"
            />
            {safetyReportSent && (
              <p className="text-xs font-bold text-[#16A34A]">
                Report submitted to Peaceverse24 Halal Safety Team.
              </p>
            )}
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-[#DC2626] text-white text-xs font-extrabold cursor-pointer"
            >
              Submit Report
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold text-zinc-950">App Language</p>
              <p className="text-xs text-zinc-500">Bangladesh + International</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer ${
                  currentLang === 'en' ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer ${
                  currentLang === 'bn' ? 'bg-[#16A34A] text-white' : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>

          {onOpenLegalTab && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => onOpenLegalTab('guidelines')}
                className="h-9 px-3.5 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-800 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Halal Guidelines</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenLegalTab('privacy')}
                className="h-9 px-3.5 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-800 cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => onOpenLegalTab('terms')}
                className="h-9 px-3.5 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-800 cursor-pointer"
              >
                Terms
              </button>
            </div>
          )}

          {isAdmin && onOpenAdminPortal && (
            <button
              type="button"
              onClick={onOpenAdminPortal}
              className="w-full h-10 rounded-xl bg-zinc-900 text-white text-xs font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Open Admin Portal</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="w-full h-10 rounded-xl bg-red-50 hover:bg-red-100 text-[#DC2626] text-xs font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
