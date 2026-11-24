import React, { useState, useEffect, useRef } from 'react';
import { Check, Search, ArrowLeft, Users, X, BadgeCheck, Loader2, Plus, UserPlus, UserCheck } from 'lucide-react';
import { FbSearchEmptyState } from './FbSearchEmptyState';
import { FbPeopleYouMayKnowSection } from './FbPeopleYouMayKnowSection';
import { SearchedUserProfile } from '../../types';
import {
  addLocalFriend,
  searchUsersFromFirestore,
  isSameOwnerIdentity,
  isTargetFriendLocally,
  isFriendRequestSentLocally,
  toggleLocalFriendRequestAndSync,
  isTargetFollowedLocally,
  toggleFollowUser,
} from '../../lib/firebase';

interface FbFriendsViewProps {
  onBack?: () => void;
  onConfirmRequest?: (id: string) => void;
  onDeleteRequest?: (id: string) => void;
  onCreatePageWithName?: (name: string) => void;
  onOpenProfile?: () => void;
  onOpenUserProfile?: (user: SearchedUserProfile) => void;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
}

interface FriendRequestCardItem {
  id: string;
  name: string;
  avatar: string;
  timeAgo: string;
  mutualText: string;
  mutualAvatar?: string;
  isOnline: boolean;
}

interface FriendItem {
  id: string;
  name: string;
  avatar: string;
  mutualCount: number;
  isOnline: boolean;
}

const INITIAL_REQUESTS: FriendRequestCardItem[] = [
  {
    id: 'req-ujjol',
    name: 'Md Ujjol',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
    timeAgo: '5d',
    mutualText: '1 mutual friend · 2w',
    mutualAvatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
    isOnline: true,
  },
  {
    id: 'req-abul-baser',
    name: 'Abul Baser',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    timeAgo: '2w',
    mutualText: '3 mutual friends · 2w',
    mutualAvatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
    isOnline: true,
  },
  {
    id: 'req-hassan',
    name: 'Hassan Abdullah',
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80',
    timeAgo: '1h',
    mutualText: '2 mutual friends · 1h',
    mutualAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
    isOnline: true,
  },
  {
    id: 'req-oli-ullah',
    name: 'MD Oli Ullah',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=240&q=80',
    timeAgo: '45m',
    mutualText: '1 mutual friend · 45m',
    mutualAvatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
    isOnline: true,
  },
  {
    id: 'req-tariqul',
    name: 'Tariqul Islam',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80',
    timeAgo: '5w',
    mutualText: '4 mutual friends · 5w',
    mutualAvatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&q=80',
    isOnline: false,
  },
  {
    id: 'req-sabbir',
    name: 'Sabbir Ahmed',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80',
    timeAgo: '2d',
    mutualText: '1 mutual friend · 2d',
    mutualAvatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80',
    isOnline: true,
  },
];

const INITIAL_ONLINE_FRIENDS: FriendItem[] = [
  {
    id: 'on-1',
    name: 'নিস্তব্ধ হৃদয়',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
    mutualCount: 8,
    isOnline: true,
  },
  {
    id: 'on-2',
    name: 'সুনামগঞ্জ রাজনৈতিক',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    mutualCount: 5,
    isOnline: true,
  },
  {
    id: 'on-3',
    name: 'Sujon Ahmed',
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80',
    mutualCount: 12,
    isOnline: true,
  },
  {
    id: 'user-fatima-zahra',
    name: 'Fatima Zahra',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    mutualCount: 6,
    isOnline: true,
  },
  {
    id: 'user-nusrat-jahan',
    name: 'Nusrat Jahan',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    mutualCount: 4,
    isOnline: false,
  },
];

export const FbFriendsView: React.FC<FbFriendsViewProps> = ({
  onBack,
  onConfirmRequest,
  onDeleteRequest,
  onCreatePageWithName,
  onOpenProfile,
  onOpenUserProfile,
  currentUserId = 'user-me',
  currentUserName = 'Member',
  currentUserAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80',
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'online' | 'suggestions' | 'friends'>('requests');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifBar, setShowNotifBar] = useState(true);
  const [directoryResults, setDirectoryResults] = useState<SearchedUserProfile[]>([]);
  const [isSearchingDirectory, setIsSearchingDirectory] = useState(false);
  const [, setSyncTick] = useState(0);
  const searchSeqRef = useRef(0);

  const [confirmed, setConfirmed] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('peace_friends_confirmed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [deleted, setDeleted] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('peace_friends_deleted');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('peace_friends_confirmed', JSON.stringify(confirmed));
    } catch {
      // ignore
    }
  }, [confirmed]);

  useEffect(() => {
    try {
      localStorage.setItem('peace_friends_deleted', JSON.stringify(deleted));
    } catch {
      // ignore
    }
  }, [deleted]);

  const [friendsList, setFriendsList] = useState<FriendItem[]>(() => {
    try {
      const saved = localStorage.getItem('peace_friends_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_ONLINE_FRIENDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('peace_friends_list', JSON.stringify(friendsList));
    } catch {
      // ignore
    }
  }, [friendsList]);

  const handleConfirm = (req: FriendRequestCardItem) => {
    setConfirmed((prev) => ({ ...prev, [req.id]: true }));
    addLocalFriend({
      id: req.id,
      name: req.name,
      avatar: req.avatar,
    });
    setFriendsList((prev) => {
      if (prev.some((f) => f.id === req.id)) return prev;
      return [
        {
          id: req.id,
          name: req.name,
          avatar: req.avatar,
          mutualCount: 1,
          isOnline: req.isOnline,
        },
        ...prev,
      ];
    });
    if (onConfirmRequest) onConfirmRequest(req.id);
  };

  const handleDelete = (id: string) => {
    setDeleted((prev) => ({ ...prev, [id]: true }));
    if (onDeleteRequest) onDeleteRequest(id);
  };

  useEffect(() => {
    const bump = () => setSyncTick((t) => t + 1);
    window.addEventListener('peaceverse:friends-updated', bump);
    window.addEventListener('peaceverse:friend-requests-updated', bump);
    window.addEventListener('peaceverse:follows-updated', bump);
    window.addEventListener('storage', bump);
    return () => {
      window.removeEventListener('peaceverse:friends-updated', bump);
      window.removeEventListener('peaceverse:friend-requests-updated', bump);
      window.removeEventListener('peaceverse:follows-updated', bump);
      window.removeEventListener('storage', bump);
    };
  }, []);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    const seq = ++searchSeqRef.current;
    if (!trimmed) {
      setDirectoryResults([]);
      setIsSearchingDirectory(false);
      return;
    }

    setIsSearchingDirectory(true);
    const timer = window.setTimeout(async () => {
      try {
        const matches = await searchUsersFromFirestore(trimmed, false);
        if (searchSeqRef.current !== seq) return;
        setDirectoryResults(matches);
      } catch {
        if (searchSeqRef.current !== seq) return;
        setDirectoryResults([]);
      } finally {
        if (searchSeqRef.current === seq) {
          setIsSearchingDirectory(false);
        }
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const pendingRequests = INITIAL_REQUESTS.filter((r) => !deleted[r.id] && !confirmed[r.id]);
  const onlineCount = Math.max(34, friendsList.filter((f) => f.isOnline).length + 31);

  const q = searchQuery.trim().toLowerCase();
  const visibleRequests = q
    ? pendingRequests.filter((r) => r.name.toLowerCase().includes(q))
    : pendingRequests;
  const visibleFriends = q
    ? friendsList.filter((f) => f.name.toLowerCase().includes(q))
    : friendsList;
  const visibleOnline = q
    ? friendsList.filter((f) => f.isOnline && f.name.toLowerCase().includes(q))
    : friendsList.filter((f) => f.isOnline);
  const noDirectoryMatches = Boolean(q) && !isSearchingDirectory && directoryResults.length === 0;

  return (
    <div className="max-w-[700px] mx-auto min-h-screen bg-white text-[#050505] pb-24 font-sans">
      {/* HEADER: Friends - Search icon + Profile — Pure #FFFFFF white, black text */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E4E6EB]">
        <div className="px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#050505] transition-colors cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
            <h1 className="text-[24px] font-extrabold text-[#050505] tracking-tight">
              Friends
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                searchOpen
                  ? 'bg-[#E7F3FF] text-[#1877F2]'
                  : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505]'
              }`}
              title="Search friends"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => onOpenProfile?.()}
              className="w-9 h-9 rounded-full overflow-hidden border border-[#E4E6EB] shrink-0 cursor-pointer"
              title="Profile"
            >
              <img
                src={currentUserAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="px-3.5 pb-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-[#65676B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Friends..."
                className="w-full bg-[#F0F2F5] text-sm text-[#050505] rounded-full pl-9 pr-8 py-2 placeholder-[#65676B] focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#65676B] hover:text-[#050505] cursor-pointer"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* TOP TABS (like FB): 34 online ● | Suggestions | Your friends | Friend requests */}
        <div className="px-3.5 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('online')}
            className={`px-3.5 py-2 rounded-full text-[13px] whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'online'
                ? 'bg-[#D8DADF] text-[#050505] font-bold'
                : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] font-semibold'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#31A24C] inline-block shrink-0" />
            <span>{onlineCount} online</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('suggestions')}
            className={`px-3.5 py-2 rounded-full text-[13px] whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'suggestions'
                ? 'bg-[#D8DADF] text-[#050505] font-bold'
                : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] font-semibold'
            }`}
          >
            Suggestions
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('friends')}
            className={`px-3.5 py-2 rounded-full text-[13px] whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-[#D8DADF] text-[#050505] font-bold'
                : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] font-semibold'
            }`}
          >
            Your friends ({friendsList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-3.5 py-2 rounded-full text-[13px] whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-[#D8DADF] text-[#050505] font-bold'
                : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] font-semibold'
            }`}
          >
            Friend requests ({pendingRequests.length})
          </button>
        </div>
      </div>

      {/* LIVE CROSS-DEVICE PEOPLE DIRECTORY RESULTS WHEN SEARCHING */}
      {q && (isSearchingDirectory || directoryResults.length > 0) && (
        <div className="mx-3.5 mt-3 bg-white rounded-xl border border-[#E4E6EB] overflow-hidden shadow-2xs">
          <div className="px-3.5 py-2.5 bg-[#F7F8FA] border-b border-[#E4E6EB] flex items-center justify-between">
            <span className="text-xs font-bold text-[#050505] uppercase tracking-wide flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#1877F2]" />
              People on Peaceverse24 {directoryResults.length > 0 ? `(${directoryResults.length})` : ''}
            </span>
            {isSearchingDirectory && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1877F2]" />}
          </div>
          {directoryResults.length > 0 && (
            <div className="divide-y divide-[#E4E6EB]">
              {directoryResults.map((user) => {
                const isSelf = isSameOwnerIdentity(
                  user.id,
                  user.displayName,
                  currentUserId,
                  currentUserName
                );
                const isFriend = !isSelf && isTargetFriendLocally(user.id, user.displayName);
                const isFollowOnly = !isSelf && !isFriend && user.allowFriendRequests === false;
                const isRequested = isFriendRequestSentLocally(user.id, user.displayName);
                const isFollowed = isTargetFollowedLocally(user.id, user.displayName);
                const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  user.displayName || 'User'
                )}&backgroundColor=1877f2,0ea5e9,3b82f6`;

                return (
                  <div
                    key={user.id}
                    className="p-3 flex items-center justify-between gap-2.5 hover:bg-[#F7F8FA] transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenUserProfile?.(user)}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer group"
                    >
                      <img
                        src={user.avatar || fallbackAvatar}
                        alt={user.displayName}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = fallbackAvatar;
                        }}
                        className="w-12 h-12 rounded-full object-cover border border-[#E4E6EB] bg-[#F0F2F5] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-[14.5px] font-bold text-[#050505] group-hover:underline truncate">
                            {user.displayName}
                          </span>
                          {user.verified && (
                            <BadgeCheck className="w-4 h-4 text-[#1877F2] shrink-0" />
                          )}
                        </div>
                        {user.username && (
                          <p className="text-xs text-[#65676B] truncate">@{user.username}</p>
                        )}
                        {(user.bio || user.location) && (
                          <p className="text-xs text-[#65676B] truncate mt-0.5">
                            {user.bio || user.location}
                          </p>
                        )}
                      </div>
                    </button>

                    <div className="shrink-0">
                      {isSelf ? (
                        <button
                          type="button"
                          onClick={() => onOpenUserProfile?.(user)}
                          className="px-3 py-1.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>You</span>
                        </button>
                      ) : isFriend ? (
                        <button
                          type="button"
                          onClick={() => onOpenUserProfile?.(user)}
                          className="px-3 py-1.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Friends</span>
                        </button>
                      ) : isFollowOnly ? (
                        <button
                          type="button"
                          onClick={async () => {
                            await toggleFollowUser(
                              currentUserId,
                              currentUserName,
                              currentUserAvatar,
                              user.id,
                              user.displayName,
                              user.avatar || ''
                            );
                            setSyncTick((t) => t + 1);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            isFollowed
                              ? 'bg-[#E7F3FF] text-[#1877F2]'
                              : 'bg-[#1877F2] hover:bg-[#166fe5] text-white'
                          }`}
                        >
                          {isFollowed ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            await toggleLocalFriendRequestAndSync(
                              currentUserId,
                              currentUserName,
                              currentUserAvatar,
                              {
                                id: user.id,
                                name: user.displayName,
                                avatar: user.avatar,
                              }
                            );
                            setSyncTick((t) => t + 1);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            isRequested
                              ? 'bg-[#E7F3FF] text-[#1877F2]'
                              : 'bg-[#1877F2] hover:bg-[#166fe5] text-white'
                          }`}
                        >
                          {isRequested ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Request sent</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Add Friend</span>
                            </>
                          )}
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

      {/* NOTIFICATION BAR */}
      {showNotifBar && activeTab === 'requests' && (
        <div className="mx-3.5 mt-3 p-3 rounded-xl bg-white border border-[#E4E6EB] flex items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center shrink-0">
              <img
                src={INITIAL_ONLINE_FRIENDS[0].avatar}
                alt="নিস্তব্ধ হৃদয়"
                className="w-8 h-8 rounded-full object-cover border-2 border-white"
              />
              <img
                src={INITIAL_ONLINE_FRIENDS[1].avatar}
                alt="সুনামগঞ্জ রাজনৈতিক"
                className="w-8 h-8 rounded-full object-cover border-2 border-white -ml-2"
              />
            </div>
            <p className="text-[13px] text-[#050505] leading-snug">
              <span className="font-bold">নিস্তব্ধ হৃদয়</span> and{' '}
              <span className="font-bold">সুনামগঞ্জ রাজনৈতিক</span> accepted your friend requests.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNotifBar(false)}
            className="p-1 rounded-full hover:bg-[#F0F2F5] text-[#65676B] shrink-0 cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: FRIEND REQUESTS (DEFAULT FB LANDING)              */}
      {/* ======================================================== */}
      {activeTab === 'requests' && (
        <div className="px-3.5 pt-4 space-y-3 bg-white">
          {/* SECTION HEADER: Friend requests 6 (red) — See all blue right */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-extrabold text-[#050505]">
                Friend requests
              </h2>
              <span className="text-[18px] font-extrabold text-[#E41E3F] tabular-nums">
                {pendingRequests.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('suggestions')}
              className="text-[14px] font-semibold text-[#1877F2] hover:underline cursor-pointer"
            >
              See all
            </button>
          </div>

          {q && visibleRequests.length === 0 && noDirectoryMatches ? (
            <FbSearchEmptyState query={searchQuery} onCreatePageWithName={onCreatePageWithName} />
          ) : q && visibleRequests.length === 0 ? null : visibleRequests.length === 0 ? (
            /* Exact Empty state when 0 requests */
            <div className="bg-white rounded-xl border border-[#E4E6EB] p-8 text-center space-y-3 shadow-2xs my-2">
              <div className="w-14 h-14 rounded-full bg-[#E7F3FF] flex items-center justify-center text-[#1877F2] mx-auto">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#050505]">
                কোনো ফ্রেন্ড রিকোয়েস্ট নেই (0 Requests)
              </h3>
              <p className="text-xs text-[#65676B] max-w-sm mx-auto leading-relaxed">
                আপনার অ্যাকাউন্ট নতুন খোলা হয়েছে। অন্য সদস্যরা ফ্রেন্ড রিকোয়েস্ট পাঠালে তা এখানে সরাসরি দেখতে পাবেন।
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl py-2 flex items-center gap-3.5"
                >
                  {/* Left: Circular Profile Pic with Green Online Dot bottom-right */}
                  <div className="relative shrink-0">
                    <img
                      src={req.avatar}
                      alt={req.name}
                      className="w-20 h-20 rounded-full object-cover border border-[#E4E6EB]"
                    />
                    {req.isOnline && (
                      <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#31A24C] border-2 border-white" />
                    )}
                  </div>

                  {/* Right: Name, Time, Mutual friend, Confirm / Delete */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-[16px] text-[#050505] truncate">
                        {req.name}
                      </p>
                      <span className="text-xs text-[#65676B] shrink-0">
                        {req.timeAgo}
                      </span>
                    </div>

                    {/* Mutual Friend Line */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {req.mutualAvatar && (
                        <img
                          src={req.mutualAvatar}
                          alt="Mutual"
                          className="w-4 h-4 rounded-full object-cover border border-white shrink-0"
                        />
                      )}
                      <p className="text-xs text-[#65676B] truncate">{req.mutualText}</p>
                    </div>

                    {/* Side-by-side Confirm (#1877F2) and Delete (#E4E6EB) */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleConfirm(req)}
                        className="flex-1 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-[14px] font-bold transition-colors cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(req.id)}
                        className="flex-1 py-2 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-[14px] font-bold transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* People you may know below Friend Requests */}
          <div className="pt-4 border-t border-[#E4E6EB] space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-extrabold text-[#050505]">
                People you may know
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('suggestions')}
                className="text-[13px] font-semibold text-[#1877F2] hover:underline cursor-pointer"
              >
                See all
              </button>
            </div>
            <FbPeopleYouMayKnowSection
              variant="list"
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
              searchQuery={searchQuery}
              onOpenUserProfile={onOpenUserProfile}
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: 34 ONLINE                                         */}
      {/* ======================================================== */}
      {activeTab === 'online' && (
        <div className="px-3.5 pt-4 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-extrabold text-[#050505] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#31A24C] inline-block" />
              <span>Active Friends ({onlineCount} online)</span>
            </h2>
          </div>

          {q && visibleOnline.length === 0 && noDirectoryMatches ? (
            <FbSearchEmptyState query={searchQuery} onCreatePageWithName={onCreatePageWithName} />
          ) : (
            <div className="space-y-2.5">
              {visibleOnline.map((friend) => (
                <div
                  key={friend.id}
                  className="p-2.5 rounded-xl bg-white border border-[#E4E6EB] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-12 h-12 rounded-full object-cover border border-[#E4E6EB]"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#31A24C] border-2 border-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#050505]">{friend.name}</p>
                      <p className="text-xs text-[#31A24C] font-semibold">Active now</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-xs font-bold text-[#050505] cursor-pointer"
                  >
                    Message
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SUGGESTIONS (PEOPLE YOU MAY KNOW)                 */}
      {/* ======================================================== */}
      {activeTab === 'suggestions' && (
        <div className="px-3.5 pt-4 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-extrabold text-[#050505]">
              People you may know
            </h2>
          </div>

          <FbPeopleYouMayKnowSection
            variant="list"
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserAvatar={currentUserAvatar}
            searchQuery={searchQuery}
            onOpenUserProfile={onOpenUserProfile}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: YOUR FRIENDS                                      */}
      {/* ======================================================== */}
      {activeTab === 'friends' && (
        <div className="px-3.5 pt-4 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-extrabold text-[#050505]">
              {friendsList.length} friends
            </h2>
            <span className="text-xs text-[#31A24C] font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#31A24C]" />
              {friendsList.filter((f) => f.isOnline).length} online
            </span>
          </div>

          {q && visibleFriends.length === 0 && noDirectoryMatches ? (
            <FbSearchEmptyState query={searchQuery} onCreatePageWithName={onCreatePageWithName} />
          ) : q && visibleFriends.length === 0 ? null : visibleFriends.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E4E6EB] p-8 text-center space-y-3 shadow-2xs my-2">
              <div className="w-14 h-14 rounded-full bg-[#E7F3FF] flex items-center justify-center text-[#1877F2] mx-auto">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#050505]">
                এখনও কোনো বন্ধু যুক্ত নেই (0 Friends)
              </h3>
              <p className="text-xs text-[#65676B] max-w-sm mx-auto">
                ফ্রেন্ড রিকোয়েস্ট কনফার্ম করলে আপনার বন্ধুরা এখানে যুক্ত হবে।
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {visibleFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-2.5 rounded-xl bg-white border border-[#E4E6EB] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-14 h-14 rounded-full object-cover border border-[#E4E6EB]"
                      />
                      {friend.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#31A24C] border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#050505]">{friend.name}</p>
                      <p className="text-xs text-[#65676B]">
                        {friend.mutualCount} mutual friends
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-xs font-bold text-[#050505] transition-colors cursor-pointer"
                  >
                    Message
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
