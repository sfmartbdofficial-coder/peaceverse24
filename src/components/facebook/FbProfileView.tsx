import React, { useState } from 'react';
import {
  Menu,
  Edit2,
  Search,
  MoreHorizontal,
  Camera,
  MapPin,
  Home,
  Cake,
  Plus,
  ChevronDown,
  ArrowLeft,
  Check,
  Briefcase,
  GraduationCap,
  Heart,
  Globe,
  SlidersHorizontal,
  Flag,
  DollarSign,
  ShieldCheck,
  Activity,
  Copy,
  X,
  Music,
  Phone,
  Coins,
  ArrowDownLeft,
  MessageCircle,
  Lock,
  Users,
  Send,
  Eye,
  ExternalLink,
  BadgeCheck,
  BookOpen,
  UserPlus,
} from 'lucide-react';
import { UserProfile, PostItem, PageItem } from '../../types';
import { FbPostCard } from './FbPostCard';
import { FbEditProfileModal } from './FbEditProfileModal';
import { CreatorMonetizationModal } from '../monetization/CreatorMonetizationModal';
import { FbProfileSwitcherModal } from './FbProfileSwitcherModal';
import { loadDeedsLog, saveDeedsLog, DeedLogItem } from '../../utils/privacyMask';
import { useHistoryBack } from '../../utils/backNavigation';
import {
  getWhatsAppUrl,
  getImoDeepLink,
  getViberDeepLink,
  getMessengerUrl,
  openDeepLinkWithFallback,
  normalizePhoneNumber,
} from '../../utils/contactLinks';
import {
  subscribeToUserFriendsFromFirestore,
  UserFriendItem,
  isTargetFollowedLocally,
  subscribeToFollowStatus,
  toggleFollowUser,
  isSameOwnerIdentity,
  isTargetFriendLocally,
  isFriendRequestSentLocally,
  toggleLocalFriendRequestAndSync,
} from '../../lib/firebase';

interface FbProfileViewProps {
  userProfile: UserProfile;
  userPosts: PostItem[];
  onOpenMenu: () => void;
  onOpenPages?: () => void;
  onBack: () => void;
  onAddStory: () => void;
  onToggleReaction: (postId: string, reaction: any) => void;
  onToggleSave: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onEditPost?: (postId: string, newContent: string, newArabic?: string, newTranslation?: string) => void;
  onDeletePost?: (postId: string) => void;
  onOpenReel?: (post: PostItem) => void;
  onOpenGoldenWallet?: () => void;
  viewedProfile?: UserProfile | null;
  onBackToOwnProfile?: () => void;
  activeSwitchedPageId?: string | null;
  onSwitchToPage?: (page: PageItem) => void;
  onSwitchToPersonal?: () => void;
  onMessageUser?: (target: { id: string; name: string; avatar: string }) => void;
}

export const FbProfileView: React.FC<FbProfileViewProps> = ({
  userProfile,
  userPosts,
  onOpenMenu,
  onOpenPages,
  onBack,
  onAddStory,
  onToggleReaction,
  onToggleSave,
  onAddComment,
  onUpdateProfile,
  onEditPost,
  onDeletePost,
  onOpenReel,
  onOpenGoldenWallet,
  viewedProfile,
  onBackToOwnProfile,
  activeSwitchedPageId = null,
  onSwitchToPage,
  onSwitchToPersonal,
  onMessageUser,
}) => {
  const activeProfile = viewedProfile || userProfile;
  const isOwnProfile =
    !viewedProfile ||
    isSameOwnerIdentity(viewedProfile.id, viewedProfile.name, userProfile.id, userProfile.name);
  const targetFollowId = activeProfile.id || `author-${activeProfile.name}`;
  const [, setFriendStateTick] = useState(0);
  const isFriendViewed = !isOwnProfile && isTargetFriendLocally(targetFollowId, activeProfile.name);
  const isFollowOnlyViewed =
    !isOwnProfile &&
    (targetFollowId.startsWith('page-') || activeProfile.isCreator === true);
  const [isFollowingViewed, setIsFollowingViewed] = useState<boolean>(() =>
    !isOwnProfile && isFollowOnlyViewed
      ? isTargetFollowedLocally(targetFollowId, activeProfile.name)
      : false
  );
  const [isFriendReqSentViewed, setIsFriendReqSentViewed] = useState<boolean>(() =>
    !isOwnProfile && !isFriendViewed && !isFollowOnlyViewed
      ? isFriendRequestSentLocally(targetFollowId, activeProfile.name)
      : false
  );

  React.useEffect(() => {
    const syncState = () => {
      setFriendStateTick((t) => t + 1);
      if (!isOwnProfile && !isFollowOnlyViewed) {
        setIsFriendReqSentViewed(isFriendRequestSentLocally(targetFollowId, activeProfile.name));
      } else {
        setIsFriendReqSentViewed(false);
      }
    };
    syncState();
    window.addEventListener('peaceverse:friends-updated', syncState);
    window.addEventListener('peaceverse:friend-requests-updated', syncState);
    window.addEventListener('storage', syncState);
    return () => {
      window.removeEventListener('peaceverse:friends-updated', syncState);
      window.removeEventListener('peaceverse:friend-requests-updated', syncState);
      window.removeEventListener('storage', syncState);
    };
  }, [isOwnProfile, isFollowOnlyViewed, targetFollowId, activeProfile.name]);

  React.useEffect(() => {
    if (isOwnProfile || isFriendViewed || !isFollowOnlyViewed) {
      setIsFollowingViewed(false);
      return;
    }
    const unsub = subscribeToFollowStatus(
      userProfile.id || 'user-me',
      targetFollowId,
      (following) => setIsFollowingViewed(following),
      activeProfile.name
    );
    return () => unsub();
  }, [isOwnProfile, isFriendViewed, isFollowOnlyViewed, userProfile.id, targetFollowId, activeProfile.name]);

  const handleToggleFollowProfile = async () => {
    if (isFollowOnlyViewed) {
      const next = await toggleFollowUser(
        userProfile.id || 'user-me',
        userProfile.name,
        userProfile.avatar,
        targetFollowId,
        activeProfile.name,
        activeProfile.avatar
      );
      setIsFollowingViewed(next);
    } else if (!isFriendViewed) {
      const nextSent = await toggleLocalFriendRequestAndSync(
        userProfile.id || 'user-me',
        userProfile.name,
        userProfile.avatar,
        {
          id: targetFollowId,
          name: activeProfile.name,
          avatar: activeProfile.avatar,
        }
      );
      setIsFriendReqSentViewed(nextSent);
    }
  };
  const [viewAsMode, setViewAsMode] = useState<'owner' | 'friend' | 'public'>('owner');
  const [profileTab, setProfileTab] = useState<'all' | 'photos' | 'reels'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState<string>('main');
  const [extraProfiles, setExtraProfiles] = useState<Array<{
    id: string;
    name: string;
    avatar: string;
    type: 'page' | 'profile';
    notifications?: number;
  }>>(() => {
    try {
      const stored = localStorage.getItem('qalby_fb_pages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const demoIds = ['page-sf-mart', 'page-sharif-story', 'page-halal-bites', 'page-angel-mahi', 'page-noor-academy'];
          const userPages = parsed.filter((p: any) => p.isOwner && !demoIds.includes(p.id));
          if (userPages.length > 0) {
            return userPages.map((p: any) => ({
              id: p.id,
              name: p.name,
              avatar: p.avatar,
              type: 'page' as const,
              notifications: 2,
            }));
          }
        }
      }
    } catch {}
    return [];
  });

  const [otherProfiles, setOtherProfiles] = useState<Array<{
    id: string;
    name: string;
    avatar: string;
    badgeIcon?: 'instagram' | 'whatsapp';
    notifications?: number;
  }>>(() => {
    try {
      const stored = localStorage.getItem('peaceverse_other_profiles');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showAccountsCenterModal, setShowAccountsCenterModal] = useState(false);
  const [switchFeedback, setSwitchFeedback] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [editingThought, setEditingThought] = useState(false);

  useHistoryBack(profileTab !== 'all', () => setProfileTab('all'), 'profile-subtab');
  useHistoryBack(showEditModal, () => setShowEditModal(false), 'profile-edit');
  useHistoryBack(showMonetizationModal, () => setShowMonetizationModal(false), 'profile-monetization');
  useHistoryBack(showSettingsSheet, () => setShowSettingsSheet(false), 'profile-settings');
  useHistoryBack(showProfileSwitcher, () => setShowProfileSwitcher(false), 'profile-switcher');
  useHistoryBack(showAccountsCenterModal, () => setShowAccountsCenterModal(false), 'profile-accounts-center');
  const [isProfileLocked, setIsProfileLocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('peaceverse_profile_locked') === 'true';
    } catch {
      return false;
    }
  });
  const [deedsLog, setDeedsLog] = useState<DeedLogItem[]>(() => loadDeedsLog());

  const handleToggleDeed = (id: string) => {
    setDeedsLog((prev) => {
      const next = prev.map((d) =>
        d.id === id ? { ...d, completed: !d.completed, count: d.completed ? d.count : Math.max(1, d.count) } : d
      );
      saveDeedsLog(next);
      return next;
    });
  };

  const handleIncrementDeed = (id: string) => {
    setDeedsLog((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, count: d.count + 1, completed: true } : d));
      saveDeedsLog(next);
      return next;
    });
  };

  const handleToggleOwnProfileLock = () => {
    const next = !isProfileLocked;
    setIsProfileLocked(next);
    try {
      localStorage.setItem('peaceverse_profile_locked', String(next));
      window.dispatchEvent(new Event('peaceverse_profile_lock_changed'));
    } catch {}
  };

  const [realFriendsCount, setRealFriendsCount] = useState<number>(0);
  const [realFriends, setRealFriends] = useState<UserFriendItem[]>([]);
  const [realFriendsLoaded, setRealFriendsLoaded] = useState<boolean>(false);

  React.useEffect(() => {
    const targetUserId =
      activeProfile.id &&
      activeProfile.id !== 'user-me' &&
      !activeProfile.id.startsWith('author-')
        ? activeProfile.id
        : '';
    if (!targetUserId) {
      setRealFriendsCount(0);
      setRealFriends([]);
      setRealFriendsLoaded(true);
      return;
    }
    setRealFriendsLoaded(false);
    const unsub = subscribeToUserFriendsFromFirestore(targetUserId, ({ count, friends }) => {
      setRealFriendsCount(count);
      setRealFriends(friends);
      setRealFriendsLoaded(true);
    });
    return () => unsub();
  }, [activeProfile.id]);

  React.useEffect(() => {
    const handleLockChange = () => {
      try {
        setIsProfileLocked(localStorage.getItem('peaceverse_profile_locked') === 'true');
      } catch {}
    };
    window.addEventListener('peaceverse_profile_lock_changed', handleLockChange);
    return () => window.removeEventListener('peaceverse_profile_lock_changed', handleLockChange);
  }, []);
  const [thought, setThought] = useState(
    userProfile.thoughtBubble && userProfile.thoughtBubble !== 'Share a song...'
      ? userProfile.thoughtBubble
      : 'Drop a thought...'
  );

  const handleSaveThought = (newThought: string) => {
    setThought(newThought);
    setEditingThought(false);
    onUpdateProfile({
      ...userProfile,
      thoughtBubble: newThought,
    });
  };

  const handleCopyProfileLink = () => {
    const link = `${window.location.origin}/user/${encodeURIComponent(userProfile.name)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const profileInitials = (() => {
    const parts = (activeProfile.name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  })();

  return (
    <div className="max-w-[500px] mx-auto min-h-screen bg-white text-black pb-24 font-sans selection:bg-[#0866FF]/30">
      
      {/* 1 & 2. Cover Photo with Transparent Facebook-Style Overlay Top Bar (≡, ✏️, 🔍, •••) */}
      <div className="relative h-[210px] w-full bg-[#E4E6EB] rounded-none overflow-hidden">
        {activeProfile.coverPhoto ? (
          <img
            src={activeProfile.coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#D8EAFE] via-[#EEF3F8] to-[#E4E6EB]" />
        )}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 via-black/15 to-transparent pointer-events-none" />

        {/* Overlay Header Icons matching Screenshot 4 */}
        <div className="absolute top-0 inset-x-0 z-30 px-2.5 pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenMenu}
            className="p-2 rounded-full text-white hover:bg-black/25 transition-colors cursor-pointer"
            title="Menu"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6 stroke-[2.3] drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]" />
          </button>

          <div className="flex items-center gap-1 text-white">
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="p-2 rounded-full hover:bg-black/25 transition-colors cursor-pointer"
                title="Edit profile"
                aria-label="Edit profile"
              >
                <Edit2 className="w-5 h-5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]" />
              </button>
            )}

            <button
              type="button"
              onClick={onOpenMenu}
              className="p-2 rounded-full hover:bg-black/25 transition-colors cursor-pointer"
              title="Search & Menu"
              aria-label="Search"
            >
              <Search className="w-5 h-5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]" />
            </button>

            <button
              type="button"
              onClick={() => setShowSettingsSheet(true)}
              className="p-2 rounded-full hover:bg-black/25 transition-colors cursor-pointer"
              title="Profile settings"
              aria-label="Profile settings"
            >
              <span className="w-7 h-7 rounded-full border-[1.8px] border-white flex items-center justify-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
                <MoreHorizontal className="w-4 h-4 stroke-[2.3]" />
              </span>
            </button>
          </div>
        </div>

        {/* White circle, black camera icon bottom-right above curved white sheet */}
        {isOwnProfile && (
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="absolute bottom-7 right-3 z-20 w-9 h-9 rounded-full bg-white flex items-center justify-center text-black shadow-md hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Update cover photo"
            aria-label="Update cover photo"
          >
            <Camera className="w-4 h-4 text-black" />
          </button>
        )}
      </div>

      {/* 3. Curved White Card Overlapping Cover + Centered Profile Picture & Thought Bubble */}
      <div className="relative z-10 -mt-4 rounded-t-[18px] bg-white px-4 pb-4 pt-1">
        <div className="relative flex flex-col items-center -mt-[86px]">
          
          {/* "Drop a thought..." bubble sitting neatly at top of avatar like Facebook's "Share a song..." */}
          {isOwnProfile && (
            editingThought ? (
              <div className="mb-1.5 bg-white text-neutral-800 p-1.5 rounded-[20px] shadow-xl border border-[#E4E6EB] flex items-center gap-1.5 z-20">
                <input
                  type="text"
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  placeholder="Drop a thought..."
                  className="bg-neutral-100 text-neutral-900 text-xs px-3 py-1 rounded-full outline-none w-44"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleSaveThought(thought)}
                  className="p-1 rounded-full bg-[#0866FF] text-white cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setEditingThought(true)}
                className="-mb-3 z-20 cursor-pointer bg-white text-[#65676B] text-[12px] font-medium px-3.5 py-1.5 rounded-[20px] shadow-md border border-[#E4E6EB] flex items-center gap-1.5 relative hover:scale-105 transition-transform"
                title="Click to drop a thought"
              >
                <span>{thought || "Drop a thought..."}</span>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-r border-b border-[#E4E6EB] rotate-45" />
              </div>
            )
          )}

          {/* Profile Picture: circular with white outer border & blue inner ring */}
          <div className="relative">
            <div
              onClick={() => isOwnProfile && setShowEditModal(true)}
              className="w-[152px] h-[152px] min-w-[152px] min-h-[152px] rounded-full border-4 border-white ring-2 ring-[#E4E6EB] overflow-hidden bg-[#0866FF] text-white flex items-center justify-center font-black text-4xl shadow-xl cursor-pointer"
            >
              {activeProfile.avatar ? (
                <img
                  src={activeProfile.avatar}
                  alt={activeProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{profileInitials}</span>
              )}
            </div>
            {/* Small camera icon bottom-right of profile pic */}
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-1.5 right-1.5 w-9 h-9 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] flex items-center justify-center text-black border-2 border-white shadow-md transition-colors cursor-pointer"
                title="Change profile picture"
                aria-label="Change profile picture"
              >
                <Camera className="w-4 h-4 text-black" />
              </button>
            )}
          </div>
        </div>

        {/* Banner when visiting another user's profile */}
        {!isOwnProfile && onBackToOwnProfile && (
          <div className="mt-2 mb-1 p-2.5 rounded-xl bg-[#E7F3FF] border border-[#1877F2]/30 flex items-center justify-between">
            <span className="text-xs font-semibold text-black flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#0866FF]" />
              আপনি {activeProfile.name}-এর প্রোফাইল দেখছেন
            </span>
            <button
              onClick={onBackToOwnProfile}
              className="px-2.5 py-1 rounded-lg bg-[#0866FF] text-white text-[11px] font-bold cursor-pointer"
            >
              নিজের প্রোফাইলে ফিরুন
            </button>
          </div>
        )}

        {/* 4. NAME SECTION: */}
        <div className="mt-3 text-center space-y-1">
          <div className="relative flex items-center justify-center px-2">
            <div className="inline-flex items-center gap-1.5">
              <h1 className="text-[24px] font-bold text-black tracking-tight leading-tight">
                {!isOwnProfile
                  ? activeProfile.name
                  : activeProfileId === 'main'
                  ? (activeProfile.name && activeProfile.name !== 'New Member' ? activeProfile.name : 'Member')
                  : (extraProfiles.find((p) => p.id === activeProfileId)?.name || (activeProfile.name || 'Member'))}
              </h1>
              {(activeProfile.verified || (activeProfile.goldenCoins ?? 0) >= 100) && (
                <span
                  title="Verified Halal Creator"
                  className="inline-flex items-center justify-center text-[#0866FF] shrink-0"
                >
                  <BadgeCheck className="w-5 h-5 fill-[#0866FF] text-white" />
                </span>
              )}
            </div>

            {/* Right side dropdown arrow button */}
            {isOwnProfile && (
              <button
                onClick={() => setShowProfileSwitcher(true)}
                className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer p-0 rounded-full hover:opacity-95 active:scale-95 transition-all group"
                title="Switch profile or page"
              >
                <div className="w-9 h-9 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] flex items-center justify-center text-black shadow-xs transition-colors border border-neutral-200/50">
                  <ChevronDown className="w-5 h-5 stroke-[2.2]" />
                </div>
                {extraProfiles.some((p) => (p.notifications || 0) > 0) && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#E41E3F] ring-2 ring-white" />
                )}
              </button>
            )}
          </div>

          {/* Profile / Mail ID Category Badge */}
          <div className="flex items-center justify-center pt-0.5">
            <button
              type="button"
              onClick={() => isOwnProfile && setShowEditModal(true)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0F2F5] border border-[#E4E6EB] text-[12px] font-semibold text-[#050505] ${
                isOwnProfile ? 'hover:bg-[#E4E6EB] cursor-pointer' : ''
              }`}
              title={isOwnProfile ? 'প্রোফাইল ক্যাটাগরি পরিবর্তন করুন' : 'Profile Category'}
            >
              <Briefcase className="w-3.5 h-3.5 text-[#0866FF]" />
              <span>
                Profile · {activeProfile.profileCategory || 'Personal Account (সাধারণ প্রোফাইল)'}
              </span>
            </button>
          </div>

          {/* Real Firestore friends count from users/{userId}/friends */}
          {(() => {
            const count = realFriendsLoaded
              ? realFriendsCount
              : typeof activeProfile.friendsCount === 'number' &&
                activeProfile.friendsCount !== 331 &&
                activeProfile.friendsCount !== 330
              ? activeProfile.friendsCount
              : 0;
            return (
              <p className="text-[14px] text-[#65676B] font-normal">
                {count === 0 ? '0 friends' : count === 1 ? '1 friend' : `${count} friends`}
              </p>
            );
          })()}

          {/* Show friend avatars only when real friend documents exist */}
          {realFriends.length > 0 && (
            <div className="flex items-center justify-center gap-2 pt-1">
              <div className="flex -space-x-2 overflow-hidden">
                {realFriends.slice(0, 3).map((friend) =>
                  friend.avatar ? (
                    <img
                      key={friend.id}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                      src={friend.avatar}
                      alt={friend.name}
                    />
                  ) : (
                    <span
                      key={friend.id}
                      className="inline-flex h-6 w-6 rounded-full ring-2 ring-white bg-[#E4E6EB] text-[#050505] text-[10px] font-bold items-center justify-center"
                    >
                      {friend.name.charAt(0).toUpperCase()}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons + Public/Private Toggle */}
        {isOwnProfile ? (
          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={onAddStory}
                className="flex-1 h-[36px] rounded-[8px] bg-[#0866FF] hover:bg-[#1877F2] text-white font-semibold text-[14px] flex items-center justify-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add to story</span>
              </button>

              <button
                onClick={() => setShowEditModal(true)}
                className="flex-1 h-[36px] rounded-[8px] bg-[#E4E6EB] hover:bg-[#D8DADF] text-black font-semibold text-[14px] flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit profile</span>
              </button>

              <button
                type="button"
                onClick={handleToggleOwnProfileLock}
                title={isProfileLocked ? 'Switch to Public Profile' : 'Lock Profile (Private)'}
                className={`h-[36px] px-3 rounded-[8px] font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  isProfileLocked
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-black'
                }`}
              >
                {isProfileLocked ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                <span>{isProfileLocked ? 'Private' : 'Public'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full mt-4">
            {isFriendViewed ? (
              <div className="flex-1 h-[38px] rounded-[8px] bg-[#E4E6EB] text-[#050505] font-bold text-[14px] flex items-center justify-center gap-1.5 whitespace-nowrap">
                <Check className="w-4 h-4 stroke-[2.75]" />
                <span>Friends</span>
              </div>
            ) : isFollowOnlyViewed ? (
              <button
                type="button"
                onClick={handleToggleFollowProfile}
                className={`flex-1 h-[38px] rounded-[8px] font-bold text-[14px] flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isFollowingViewed
                    ? 'bg-[#E7F3FF] hover:bg-[#DBE7F2] text-[#0866FF] border border-[#0866FF]/25'
                    : 'bg-[#0866FF] hover:bg-[#166FE5] text-white shadow-sm'
                }`}
              >
                {isFollowingViewed ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.75]" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[2.75]" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggleFollowProfile}
                className={`flex-1 h-[38px] rounded-[8px] font-bold text-[14px] flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isFriendReqSentViewed
                    ? 'bg-[#E7F3FF] hover:bg-[#DBE7F2] text-[#0866FF] border border-[#0866FF]/25'
                    : 'bg-[#0866FF] hover:bg-[#166FE5] text-white shadow-sm'
                }`}
              >
                {isFriendReqSentViewed ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.75]" />
                    <span>Request sent</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 stroke-[2.25]" />
                    <span>Add Friend</span>
                  </>
                )}
              </button>
            )}

            {onMessageUser && (
              <button
                type="button"
                onClick={() =>
                  onMessageUser({
                    id: targetFollowId,
                    name: activeProfile.name,
                    avatar: activeProfile.avatar,
                  })
                }
                className="flex-1 h-[38px] rounded-[8px] bg-[#E4E6EB] hover:bg-[#D8DADF] text-black font-bold text-[14px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 stroke-[2.25]" />
                <span>Message</span>
              </button>
            )}

            {onBackToOwnProfile && (
              <button
                type="button"
                onClick={onBackToOwnProfile}
                title="My Profile"
                className="h-[38px] px-3 rounded-[8px] bg-[#E4E6EB] hover:bg-[#D8DADF] text-black font-semibold text-[13px] flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">My Profile</span>
              </button>
            )}
          </div>
        )}

        {/* Golden Wallet Banner in Profile */}
        <div
          onClick={onOpenGoldenWallet}
          className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-emerald-500/10 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-500/60 transition-all shadow-2xs group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-neutral-950 flex items-center justify-center font-black shadow-sm shadow-amber-500/30">
              <Coins className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-black group-hover:text-amber-500 transition-colors">
                  গোল্ডেন ওয়ালেট
                </span>
                <span className="text-[9px] bg-amber-500/20 text-amber-700 px-1.5 py-0.2 rounded-full font-bold">
                  বিকাশ / নগদ
                </span>
              </div>
              <p className="text-[10px] text-[#65676B]">
                ব্যালেন্স: <span className="font-bold text-amber-600">🪙 {userProfile.goldenCoins ?? 120}</span> • অর্জিত: <span className="font-bold text-emerald-600">৳ {userProfile.earnedCoins ?? 65}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-xs flex items-center gap-1 transition-colors"
          >
            <span>ক্যাশ আউট</span>
            <ArrowDownLeft className="w-3 h-3" />
          </button>
        </div>

        {/* Real Facebook Profile Locked Banner */}
        {isProfileLocked && (
          <div className="mt-3.5 p-3 rounded-xl bg-[#E7F3FF] border border-[#1877F2]/30 flex items-center gap-3 text-left shadow-xs">
            <div className="w-9 h-9 rounded-full bg-[#0866FF] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[13px] text-black leading-tight">
                You locked your profile
              </p>
              <p className="text-[12px] text-[#65676B] leading-tight mt-0.5">
                Only your friends can see the photos, posts and stories on your profile.
              </p>
            </div>
          </div>
        )}

        {/* 5. TABS:
            Tabs: All, Photos, Reels.
            All is selected with light blue background #E7F3FF, blue text. Others grey #E4E6EB background.
            Height 32px, border-radius 20px */}
        <div className="flex items-center gap-2 mt-4">
          {(['all', 'photos', 'reels'] as const).map((tab) => {
            const isSelected = profileTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setProfileTab(tab)}
                className={`h-[32px] rounded-[20px] px-4 text-[13px] font-semibold flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-[#E7F3FF] text-[#0866FF] font-bold'
                    : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-black'
                }`}
              >
                {tab === 'all' ? 'All' : tab === 'photos' ? 'Photos' : 'Reels'}
              </button>
            );
          })}
        </div>

        {/* 6. PERSONAL DETAILS SECTION matching Facebook Profile Screenshot 4 */}
        <div className="mt-5 pt-4 border-t border-[#E4E6EB] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[16px] text-black">Personal details</h3>
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] hover:text-black transition-colors cursor-pointer"
                title="Edit personal details"
                aria-label="Edit personal details"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-3 pt-1">
            {/* 0. Profile / Mail ID Category */}
            <div className="flex items-center gap-3 text-[15px] text-[#65676B]">
              <Briefcase className="w-5 h-5 text-[#65676B] shrink-0" />
              <span>
                Profile ·{' '}
                <span className="font-semibold text-black">
                  {activeProfile.profileCategory || 'Personal Account (সাধারণ প্রোফাইল)'}
                </span>
              </span>
            </div>

            {/* 1. Location: Lives in Dhaka, Bangladesh */}
            <div className="flex items-center gap-3 text-[15px] text-[#65676B]">
              <MapPin className="w-5 h-5 text-[#65676B] shrink-0" />
              <span>
                Lives in <span className="font-semibold text-black">{activeProfile.location || 'Dhaka, Bangladesh'}</span>
              </span>
            </div>

            {/* 2. Home: From Dhaka, Bangladesh */}
            <div className="flex items-center gap-3 text-[15px] text-[#65676B]">
              <Home className="w-5 h-5 text-[#65676B] shrink-0" />
              <span>
                From <span className="font-semibold text-black">{activeProfile.hometown || 'Dhaka, Bangladesh'}</span>
              </span>
            </div>

            {/* 3. Birthday cake: Born August 17, 1991 */}
            <div className="flex items-center gap-3 text-[15px] text-[#65676B]">
              <Cake className="w-5 h-5 text-[#65676B] shrink-0" />
              <span>
                Born <span className="font-semibold text-black">{activeProfile.birthDate || 'August 17, 1991'}</span>
              </span>
            </div>

            {/* 4. Heart: Married */}
            <div className="flex items-center gap-3 text-[15px] text-[#65676B]">
              <Heart className="w-5 h-5 text-[#65676B] shrink-0" />
              <span>
                <span className="font-semibold text-black">{activeProfile.relationship || 'Married'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 6.2 INTERACTIVE HALAL DEEDS LOG (আমলনামা) */}
        <div className="mt-5 pt-4 border-t border-[#E4E6EB] space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[16px] text-black flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>দৈনিক আমলনামা</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full tabular-nums">
              {deedsLog.filter((d) => d.completed).length}/{deedsLog.length} সম্পন্ন
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {deedsLog.map((deed) => (
              <div
                key={deed.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                  deed.completed
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-[#F7F8FA] border-[#E4E6EB]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggleDeed(deed.id)}
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
                    <p className="text-xs font-bold text-black truncate">{deed.title}</p>
                    <p className="text-[11px] text-[#65676B] tabular-nums">
                      মোট রেকর্ড: {deed.count}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleIncrementDeed(deed.id)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#E4E6EB] hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-xs font-bold text-[#050505] transition-colors cursor-pointer shrink-0 tabular-nums"
                >
                  +১
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 6.5 CONTACT SECTION ("যোগাযোগ করুন" - WhatsApp, IMO, Viber, Messenger with Privacy) */}
        {(() => {
          const waUrl = getWhatsAppUrl(activeProfile.whatsapp);
          const imoLink = getImoDeepLink(activeProfile.imo);
          const viberLink = getViberDeepLink(activeProfile.viber);
          const messengerUrl = getMessengerUrl(activeProfile.messengerLink);
          const hasAnyContact = Boolean(waUrl || imoLink || viberLink || messengerUrl);
          const privacy = activeProfile.contactPrivacy || 'public';

          // Determine effective viewer role
          const effectiveViewer = isOwnProfile ? viewAsMode : 'public';
          const canSeeContacts =
            effectiveViewer === 'owner' ||
            privacy === 'public' ||
            (privacy === 'friends' && effectiveViewer === 'friend');

          if (!hasAnyContact && !isOwnProfile) return null;

          return (
            <div className="mt-5 pt-4 border-t border-[#E4E6EB] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[16px] text-black">
                    যোগাযোগ করুন
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F2F5] text-[#65676B] border border-[#E4E6EB]">
                    {privacy === 'public' && <><Globe className="w-3 h-3 text-emerald-500" /> Public</>}
                    {privacy === 'friends' && <><Users className="w-3 h-3 text-blue-500" /> Friends</>}
                    {privacy === 'private' && <><Lock className="w-3 h-3 text-amber-500" /> Only me</>}
                  </span>
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="text-[#0866FF] hover:underline font-semibold text-[13px] cursor-pointer"
                  >
                    {hasAnyContact ? 'Edit' : '+ Add Contact'}
                  </button>
                )}
              </div>

              {isOwnProfile && hasAnyContact && (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-[#65676B]">Preview as:</span>
                  {(['owner', 'friend', 'public'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setViewAsMode(m)}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        viewAsMode === m
                          ? 'bg-[#0866FF] text-white'
                          : 'bg-[#F0F2F5] text-[#65676B]'
                      }`}
                    >
                      {m === 'owner' ? 'নিজে' : m === 'friend' ? 'Friend' : 'Public'}
                    </button>
                  ))}
                </div>
              )}

              {hasAnyContact ? (
                canSeeContacts ? (
                  <div className="space-y-2.5">
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-between shadow-sm transition-all"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 fill-current" />
                          </span>
                          <span className="text-left">
                            <span className="block leading-tight">WhatsApp এ মেসেজ দিন</span>
                            <span className="text-[11px] font-medium text-white/90 block">
                              wa.me/{normalizePhoneNumber(activeProfile.whatsapp)}
                            </span>
                          </span>
                        </span>
                        <ExternalLink className="w-4 h-4 opacity-90 shrink-0" />
                      </a>
                    )}

                    {(imoLink || viberLink || messengerUrl) && (
                      <div className="flex flex-wrap gap-2">
                        {imoLink && (
                          <button
                            type="button"
                            onClick={() => openDeepLinkWithFallback(imoLink, 'https://imo.im/')}
                            className="flex-1 min-w-[120px] px-3.5 py-2.5 rounded-xl bg-[#0088CC] hover:bg-[#0077b5] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                          >
                            <Phone className="w-4 h-4" />
                            <span>IMO</span>
                          </button>
                        )}

                        {viberLink && (
                          <button
                            type="button"
                            onClick={() => openDeepLinkWithFallback(viberLink, 'https://www.viber.com/')}
                            className="flex-1 min-w-[120px] px-3.5 py-2.5 rounded-xl bg-[#7360F2] hover:bg-[#614ce0] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Viber</span>
                          </button>
                        )}

                        {messengerUrl && (
                          <a
                            href={messengerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-[120px] px-3.5 py-2.5 rounded-xl bg-[#0084FF] hover:bg-[#0073e6] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                          >
                            <Send className="w-4 h-4" />
                            <span>Messenger</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] text-xs text-[#65676B] flex items-center gap-2">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>
                      {privacy === 'friends'
                        ? 'এই যোগাযোগ তথ্য শুধুমাত্র বন্ধুদের (Friends only) জন্য সংরক্ষিত।'
                        : 'এই যোগাযোগ তথ্য ব্যক্তিগত (Only me) হিসেবে সেট করা আছে।'}
                    </span>
                  </div>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="w-full p-3.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] border border-dashed border-[#1877F2]/40 text-left transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-bold text-black">
                      WhatsApp, IMO ও Viber নম্বর যোগ করুন
                    </p>
                    <p className="text-[11px] text-[#65676B] mt-0.5">
                      ভিজিটররা সরাসরি আপনার প্রোফাইল থেকে এক ক্লিকে চ্যাট করতে পারবে
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-[#0866FF] text-white text-xs font-bold shrink-0">
                    + যোগ করুন
                  </span>
                </button>
              )}
            </div>
          );
        })()}

      </div>

      {/* 7. User's Posts Feed */}
      <div className="p-3 sm:p-4 space-y-3 border-t border-[#E4E6EB] bg-white">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-[16px] text-black">Posts</h3>
          <button
            onClick={() => setShowEditModal(true)}
            className="text-xs text-[#65676B] hover:text-black font-medium"
          >
            Manage posts
          </button>
        </div>
        {userPosts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-[8px] border border-[#E4E6EB] space-y-2 shadow-xs">
            <p className="text-sm font-semibold text-black">এখনও কোনো পোস্ট নেই</p>
            <p className="text-xs text-[#65676B]">নতুন কিছু শেয়ার করুন</p>
            <button
              onClick={onAddStory}
              className="px-4 py-1.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold"
            >
              পোস্ট তৈরি করুন
            </button>
          </div>
        ) : (
          userPosts.map((post) => (
            <FbPostCard
              key={post.id}
              post={post}
              onToggleReaction={onToggleReaction}
              onToggleSave={onToggleSave}
              onAddComment={onAddComment}
              onEditPost={onEditPost}
              onDeletePost={onDeletePost}
              onOpenReel={onOpenReel}
              currentUserId={userProfile.id}
              currentUserName={userProfile.name}
              currentUserAvatar={userProfile.avatar}
              showBoostControls={false}
            />
          ))
        )}
      </div>

      {/* 5. Complete Edit Profile Modal */}
      {showEditModal && (
        <FbEditProfileModal
          userProfile={userProfile}
          onClose={() => setShowEditModal(false)}
          onSave={onUpdateProfile}
        />
      )}

      {/* 6. Creator Monetization Studio Modal */}
      {showMonetizationModal && (
        <CreatorMonetizationModal
          userProfile={userProfile}
          onClose={() => setShowMonetizationModal(false)}
        />
      )}

      {/* 7. Facebook Profile Settings Action Sheet (Triggered by ⋯ or Dropdown) */}
      {showSettingsSheet && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-[#E4E6EB] rounded-t-2xl sm:rounded-2xl p-4 text-black shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
              <h2 className="font-bold text-base text-black">Profile settings</h2>
              <button
                onClick={() => setShowSettingsSheet(false)}
                className="p-1 rounded-full text-[#65676B] hover:bg-[#F0F2F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 text-sm font-medium">
              {/* Pages & Followers */}
              <button
                onClick={() => {
                  setShowSettingsSheet(false);
                  if (onOpenPages) onOpenPages();
                  else onOpenMenu();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F0F2F5] text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-black">পেইজসমূহ</p>
                  <p className="text-xs text-[#65676B]">পেইজ তৈরি, ফলোয়ার ও ভিডিও পরিচালনা করুন</p>
                </div>
              </button>

              {/* Creator Monetization */}
              <button
                onClick={() => {
                  setShowSettingsSheet(false);
                  setShowMonetizationModal(true);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F0F2F5] text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-black">Professional dashboard & Monetization</p>
                  <p className="text-xs text-[#65676B]">আর্নিং, স্টারস ও পেআউট বিবরণ</p>
                </div>
              </button>

              {/* Profile Status */}
              <button
                onClick={() => {
                  setShowSettingsSheet(false);
                  setShowEditModal(true);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F0F2F5] text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-blue-500/15 text-[#0866FF] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-black">Profile status</p>
                  <p className="text-xs text-[#65676B]">Good standing • ইসলামিক গাইডলাইন ভেরিফাইড</p>
                </div>
              </button>

              {/* Activity Log */}
              <button
                onClick={() => {
                  setShowSettingsSheet(false);
                  onOpenMenu();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F0F2F5] text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-black">Activity log</p>
                  <p className="text-xs text-[#65676B]">আপনার পোস্ট ও লাইক হিস্টোরি</p>
                </div>
              </button>

              {/* Copy Profile Link */}
              <button
                onClick={handleCopyProfileLink}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F0F2F5] text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#E4E6EB] text-black flex items-center justify-center shrink-0">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-black">
                    {copyFeedback ? '✓ লিংক কপি হয়েছে!' : 'Copy link to profile'}
                  </p>
                  <p className="text-xs text-[#65676B]">আপনার প্রোফাইলের সরাসরি শেয়ারযোগ্য লিংক</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Facebook Profile & Page Switcher Bottom Sheet */}
      {showProfileSwitcher && (
        <FbProfileSwitcherModal
          userProfile={userProfile}
          activeProfileId={activeSwitchedPageId || activeProfileId}
          onSelectProfile={(id) => {
            setActiveProfileId(id);
            if (id === 'main') {
              onSwitchToPersonal?.();
              return;
            }
            try {
              const stored = localStorage.getItem('qalby_fb_pages');
              if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                  const found = parsed.find((p: PageItem) => p.id === id);
                  if (found && onSwitchToPage) {
                    onSwitchToPage(found);
                  }
                }
              }
            } catch {}
          }}
          onClose={() => setShowProfileSwitcher(false)}
          onCreatePage={() => {
            if (onOpenPages) onOpenPages();
            else onOpenMenu();
          }}
          onOpenAccountsCenter={() => {
            setShowProfileSwitcher(false);
            setShowAccountsCenterModal(true);
          }}
        />
      )}

      {/* 9. Accounts Center Modal */}
      {showAccountsCenterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 text-black shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-[#0866FF] font-black text-lg">Peaceverse24.com</span>
                <span className="font-bold text-base text-black">Accounts Center</span>
              </div>
              <button
                onClick={() => setShowAccountsCenterModal(false)}
                className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Manage your connected experiences and account settings across Peaceverse24.com.
            </p>

            <div className="space-y-2 text-sm font-medium">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-black">Profiles & Accounts</p>
                  <p className="text-xs text-neutral-500">Peaceverse24.com</p>
                </div>
                <span className="text-xs text-[#0866FF] font-bold">
                  {1 + extraProfiles.length} connected
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-900">Password & Security</p>
                  <p className="text-xs text-neutral-500">Two-factor auth, saved logins</p>
                </div>
                <span className="text-xs text-emerald-600 font-bold">Secured ✓</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-900">Personal Details</p>
                  <p className="text-xs text-neutral-500">Contact info, birthday, identity verification</p>
                </div>
                <span className="text-xs text-[#0866FF] font-bold">Edit</span>
              </div>
            </div>

            <button
              onClick={() => setShowAccountsCenterModal(false)}
              className="w-full py-2.5 rounded-full bg-[#0866FF] text-white font-semibold text-sm hover:bg-[#1877F2] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
