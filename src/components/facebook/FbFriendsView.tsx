import React, { useState, useEffect } from 'react';
import { UserCheck, Check, Trash2, Search, UserPlus, ArrowLeft, Users, Sparkles, UserMinus } from 'lucide-react';
import { toggleFollowUser, subscribeToUserFollowsList } from '../../lib/firebase';

interface FbFriendsViewProps {
  onBack?: () => void;
  onConfirmRequest?: (id: string) => void;
  onDeleteRequest?: (id: string) => void;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
}

export const FbFriendsView: React.FC<FbFriendsViewProps> = ({
  onBack,
  onConfirmRequest,
  onDeleteRequest,
  currentUserId = 'user-me',
  currentUserName = 'Sharif Hasan',
  currentUserAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80',
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'friends' | 'creators'>('requests');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Friend Requests
  const [requests, setRequests] = useState([
    {
      id: 'req-1',
      name: 'Sujon Ahme',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      timeAgo: '1d',
      mutualFriend: 'আমার বাংলাদেশ is a mutual friend.',
      status: 'pending',
    },
    {
      id: 'req-2',
      name: 'Karan Viswakarma',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      timeAgo: '1d',
      mutualFriend: 'Karan Singh is a mutual friend.',
      status: 'pending',
    },
    {
      id: 'req-3',
      name: 'Md Sojibur Rahman',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      timeAgo: '17h',
      mutualFriend: 'Sk Anowar is a mutual friend.',
      status: 'pending',
    },
    {
      id: 'req-4',
      name: 'Hassan Abdullah',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
      timeAgo: '2d',
      mutualFriend: '৫ জন মিউচুয়াল ফ্রেন্ড',
      status: 'pending',
    },
    {
      id: 'req-5',
      name: 'Robel M',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
      timeAgo: '3d',
      mutualFriend: '১২ জন মিউচুয়াল ফ্রেন্ড',
      status: 'pending',
    },
  ]);

  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [deleted, setDeleted] = useState<Record<string, boolean>>({});

  // 2. Discover Creators & Influencers (Follow / Unfollow)
  const [creators, setCreators] = useState([
    {
      id: 'creator-1',
      name: 'হাফেজ ক্বারী আনাস আল-হুসাইনি',
      handle: '@anas_reciter',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      bio: 'পবিত্র কুরআন তিলাওয়াত ও তাজবীদ শিক্ষক • Peaceverse Verified',
      followers: 14250,
      isFollowing: false,
    },
    {
      id: 'creator-2',
      name: 'ড. আহমাদুল্লাহ ইসলামিক ফাউন্ডেশন',
      handle: '@dr_ahmadullah',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      bio: 'দৈনন্দিন ফতোয়া, উম্মাহর ঐক্য ও দাওয়াতি প্ল্যাটফর্ম',
      followers: 98400,
      isFollowing: true,
    },
    {
      id: 'creator-3',
      name: 'নূরুল কুরআন স্টুডিও (Nurul Quran)',
      handle: '@nurul_quran_media',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
      bio: 'অর্থসহ আল-কুরআনের পূর্ণাঙ্গ ভিজ্যুয়াল তিলাওয়াত ও শর্টস',
      followers: 32600,
      isFollowing: false,
    },
    {
      id: 'creator-4',
      name: 'মাওলানা তারিক জামিল বাণী',
      handle: '@tariqjameel_bn',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      bio: 'আত্মশুদ্ধি, আখলাক ও চরিত্র গঠনমূলক নসিহত',
      followers: 67300,
      isFollowing: true,
    },
    {
      id: 'creator-5',
      name: 'ইসলামিক ক্যালিগ্রাফি আর্ট বিডি',
      handle: '@arabic_calligraphy_art',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      bio: 'হাতে আঁকা কুরআনিক আরবি ক্যালিগ্রাফি ও আর্ট প্রদর্শনী',
      followers: 8900,
      isFollowing: false,
    },
  ]);

  // 3. Existing Friends List
  const [friendsList, setFriendsList] = useState([
    {
      id: 'fr-1',
      name: 'আরিফুল ইসলাম',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      mutualCount: 14,
      isOnline: true,
    },
    {
      id: 'fr-2',
      name: 'তানভীর হাসান',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80',
      mutualCount: 8,
      isOnline: true,
    },
    {
      id: 'fr-3',
      name: 'মাহমুদ ইকবাল',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=160&q=80',
      mutualCount: 22,
      isOnline: false,
    },
    {
      id: 'fr-4',
      name: 'জাহিদুল ইসলাম',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
      mutualCount: 5,
      isOnline: false,
    },
  ]);

  // Sync real-time follow status from Firebase
  useEffect(() => {
    const unsub = subscribeToUserFollowsList(currentUserId, (followingIds) => {
      if (followingIds && followingIds.length > 0) {
        setCreators((prev) =>
          prev.map((c) => ({
            ...c,
            isFollowing: followingIds.includes(c.id),
          }))
        );
      }
    });
    return () => unsub();
  }, [currentUserId]);

  const handleConfirm = (id: string) => {
    setConfirmed((prev) => ({ ...prev, [id]: true }));
    if (onConfirmRequest) onConfirmRequest(id);
  };

  const handleDelete = (id: string) => {
    setDeleted((prev) => ({ ...prev, [id]: true }));
    if (onDeleteRequest) onDeleteRequest(id);
  };

  // Toggle Follow / Unfollow
  const handleToggleFollow = async (creator: (typeof creators)[0]) => {
    const nextFollowingState = !creator.isFollowing;

    // Optimistic UI update
    setCreators((prev) =>
      prev.map((c) =>
        c.id === creator.id
          ? {
              ...c,
              isFollowing: nextFollowingState,
              followers: nextFollowingState ? c.followers + 1 : Math.max(0, c.followers - 1),
            }
          : c
      )
    );

    // Sync to Firestore
    await toggleFollowUser(
      currentUserId,
      currentUserName,
      currentUserAvatar,
      creator.id,
      creator.name,
      creator.avatar
    );
  };

  return (
    <div className="max-w-[700px] mx-auto min-h-screen bg-[#18191a] text-[#e4e6eb] pb-24 p-3 sm:p-4 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#393a3b]/60">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-white transition-colors cursor-pointer"
              title="পেছনে যান (Back)"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
          )}
          <h1 className="font-bold text-2xl text-white">Friends & Follow</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search friends & creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-44 sm:w-56 bg-[#242526] border border-[#393a3b] rounded-full pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2]"
          />
          <Search className="w-3.5 h-3.5 text-[#8a8d91] absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-full font-bold text-xs shadow transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'requests'
              ? 'bg-[#1877F2] text-white'
              : 'bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb]'
          }`}
        >
          Friend requests ({requests.filter((r) => !deleted[r.id] && !confirmed[r.id]).length})
        </button>

        <button
          onClick={() => setActiveTab('creators')}
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'creators'
              ? 'bg-[#1877F2] text-white'
              : 'bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Follow & Creators (অনুসরণ)</span>
        </button>

        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'friends'
              ? 'bg-[#1877F2] text-white'
              : 'bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb]'
          }`}
        >
          Your friends ({friendsList.length})
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: FRIEND REQUESTS */}
      {/* ======================================================== */}
      {activeTab === 'requests' && (
        <div className="space-y-3 pt-2">
          <h2 className="text-base font-bold text-white">
            Friend Requests ({requests.filter((r) => !deleted[r.id] && !confirmed[r.id]).length})
          </h2>

          {requests
            .filter((req) => req.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((req) => {
              if (deleted[req.id]) return null;
              const isConf = confirmed[req.id];

              return (
                <div
                  key={req.id}
                  className="p-3 rounded-2xl bg-[#242526] border border-[#393a3b] flex items-center gap-3 shadow-sm"
                >
                  <img
                    src={req.avatar}
                    alt={req.name}
                    className="w-16 h-16 rounded-full object-cover border border-[#393a3b] flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-white truncate">{req.name}</p>
                      <span className="text-xs text-[#b0b3b8]">{req.timeAgo}</span>
                    </div>
                    <p className="text-xs text-[#b0b3b8] truncate">{req.mutualFriend}</p>

                    <div className="mt-2 flex items-center gap-2">
                      {isConf ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Request confirmed
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleConfirm(req.id)}
                            className="flex-1 py-1.5 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleDelete(req.id)}
                            className="flex-1 py-1.5 rounded-lg bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] text-xs font-bold transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: FOLLOW & UNFOLLOW CREATORS */}
      {/* ======================================================== */}
      {activeTab === 'creators' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>জনপ্রিয় ইসলামিক ক্রিয়েটর ও পেজ</span>
            </h2>
            <span className="text-xs text-emerald-400 font-bold">রিয়েল-টাইম ফলো/আনফলো</span>
          </div>

          <div className="space-y-3">
            {creators
              .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.handle.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((creator) => (
                <div
                  key={creator.id}
                  className="p-3.5 rounded-2xl bg-[#242526] border border-[#393a3b] flex items-center justify-between gap-3 shadow-sm hover:border-[#1877F2]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-[#393a3b] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm text-white truncate">{creator.name}</p>
                        <span className="w-3.5 h-3.5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-black shrink-0">
                          ✓
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8a8d91]">{creator.handle} • {creator.followers.toLocaleString()} ফলোয়ার</p>
                      <p className="text-xs text-[#b0b3b8] truncate mt-0.5">{creator.bio}</p>
                    </div>
                  </div>

                  {/* Follow / Following Button */}
                  <button
                    onClick={() => handleToggleFollow(creator)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer ${
                      creator.isFollowing
                        ? 'bg-emerald-600 hover:bg-rose-600 hover:content-["Unfollow"] text-white group'
                        : 'bg-[#1877F2] hover:bg-[#166fe5] text-white active:scale-95'
                    }`}
                  >
                    {creator.isFollowing ? (
                      <>
                        <Check className="w-3.5 h-3.5 group-hover:hidden" />
                        <span className="group-hover:hidden">Following</span>
                        <UserMinus className="w-3.5 h-3.5 hidden group-hover:inline" />
                        <span className="hidden group-hover:inline">Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: YOUR FRIENDS */}
      {/* ======================================================== */}
      {activeTab === 'friends' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">আপনার বন্ধু তালিকা ({friendsList.length})</h2>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {friendsList.filter((f) => f.isOnline).length} জন অনলাইন
            </span>
          </div>

          <div className="space-y-2.5">
            {friendsList
              .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((friend) => (
                <div
                  key={friend.id}
                  className="p-3 rounded-2xl bg-[#242526] border border-[#393a3b] flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-12 h-12 rounded-full object-cover border border-[#393a3b]"
                      />
                      {friend.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#242526]" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{friend.name}</p>
                      <p className="text-xs text-[#b0b3b8]">{friend.mutualCount} জন মিউচুয়াল ফ্রেন্ড</p>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-xs font-bold text-[#e4e6eb] transition-colors cursor-pointer">
                    Message
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
};
