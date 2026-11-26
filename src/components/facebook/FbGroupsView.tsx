import React, { useState, useEffect, useMemo } from 'react';
import { IslamicGroup, UserProfile } from '../../types';
import {
  Users,
  Check,
  Plus,
  MessageSquare,
  ArrowLeft,
  Search,
  Lock,
  Globe,
  Send,
  Share2,
  ThumbsUp,
  X,
  Pin,
  Menu,
  MoreHorizontal,
  ArrowUpDown,
  MessageCircle,
} from 'lucide-react';
import { useHistoryBack } from '../../utils/backNavigation';

interface FbGroupsViewProps {
  onBack?: () => void;
  onOpenMenu?: () => void;
  userProfile?: UserProfile;
}

interface GroupItemExtended extends IslamicGroup {
  newPostsCount?: number;
  isPinned?: boolean;
  visits?: number;
  memberHint?: string;
}

interface RecommendedFeedPost {
  id: string;
  groupId: string;
  groupName: string;
  groupAvatar: string;
  authorName: string;
  authorAvatar: string;
  timeAgo: string;
  text: string;
  images: string[];
  likes: number;
  comments: number;
  isLiked?: boolean;
}

interface ActivityCardItem {
  id: string;
  groupId: string;
  groupName: string;
  image: string;
  snippet: string;
  countLabel: string;
}

const PRESET_GROUP_COVERS = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
];

const LEGACY_DUMMY_GROUP_IDS = new Set([
  'grp-abul',
  'grp-deen-dawat',
  'grp-quran-tafsir',
  'grp-halal-biz',
  'grp-deen-circle',
]);

const STARTER_YOUR_GROUPS: GroupItemExtended[] = [];

const SUGGESTED_DISCOVER_GROUPS: GroupItemExtended[] = [];

const INITIAL_RECOMMENDED_POSTS: RecommendedFeedPost[] = [];

const INITIAL_ACTIVITY_CARDS: ActivityCardItem[] = [];

export const FbGroupsView: React.FC<FbGroupsViewProps> = ({
  onBack,
  onOpenMenu,
  userProfile,
}) => {
  const [groups, setGroups] = useState<GroupItemExtended[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_fb_groups');
      if (stored) {
        const parsed: GroupItemExtended[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((g) => g && g.id && !LEGACY_DUMMY_GROUP_IDS.has(g.id));
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('qalby_fb_groups', JSON.stringify(groups));
    } catch {
      // ignore
    }
  }, [groups]);

  const [activeTab, setActiveTab] = useState<'for_you' | 'your_groups' | 'your_activity' | 'discover'>('for_you');
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [yourGroupsSearch, setYourGroupsSearch] = useState('');
  const [sortBy, setSortBy] = useState<'Most visited' | 'Recently active' | 'A–Z'>('Most visited');
  const [dismissedIds, setDismissedIds] = useState<Record<string, boolean>>({});
  const [selectedGroup, setSelectedGroup] = useState<GroupItemExtended | null>(null);

  // Recommended feed posts
  const [recommendedPosts, setRecommendedPosts] = useState<RecommendedFeedPost[]>(INITIAL_RECOMMENDED_POSTS);
  // Activity cards
  const [activityCards, setActivityCards] = useState<ActivityCardItem[]>(INITIAL_ACTIVITY_CARDS);

  // Create Group Modal
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  useHistoryBack(activeTab !== 'for_you', () => setActiveTab('for_you'), 'groups-tab');
  useHistoryBack(showHeaderSearch, () => {
    setShowHeaderSearch(false);
    setHeaderSearch('');
  }, 'groups-search');
  useHistoryBack(Boolean(selectedGroup), () => setSelectedGroup(null), 'groups-detail');
  useHistoryBack(showCreateGroupModal, () => setShowCreateGroupModal(false), 'groups-create');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupPrivacy, setNewGroupPrivacy] = useState<'public' | 'private'>('public');
  const [newGroupCategory, setNewGroupCategory] = useState('Islamic Group');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCover, setNewGroupCover] = useState(PRESET_GROUP_COVERS[0]);

  // Group Posts inside Detail View
  const [groupPosts, setGroupPosts] = useState<
    Record<string, Array<{ id: string; author: string; avatar: string; text: string; time: string; likes: number }>>
  >({
    'grp-deen-dawat': [
      {
        id: 'gp-1',
        author: 'মাওলানা মাহমুদ হাসান',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        text: 'আলহামদুলিল্লাহ! আজকের তাজবীদ ক্লাসে সূরা আল-ফাতিহার মাখরাজ আলোচনা করা হয়েছে। যারা যুক্ত হতে চান কমেন্ট করুন।',
        time: '১ ঘণ্টা আগে',
        likes: 38,
      },
    ],
  });
  const [newPostText, setNewPostText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const toggleJoin = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const next = !g.isJoined;
          showToast(next ? `"${g.name}" গ্রুপে যোগ দিয়েছেন ✓` : `"${g.name}" থেকে লিভ নিয়েছেন`);
          return { ...g, isJoined: next, visits: (g.visits || 0) + 1 };
        }
        return g;
      })
    );

    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup((prev) => (prev ? { ...prev, isJoined: !prev.isJoined } : null));
    }
  };

  const togglePin = (groupId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const next = !g.isPinned;
          showToast(next ? `"${g.name}" পিন করা হয়েছে 📌` : `"${g.name}" আনপিন করা হয়েছে`);
          return { ...g, isPinned: next };
        }
        return g;
      })
    );
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      showToast('দয়া করে গ্রুপের নাম লিখুন');
      return;
    }

    const created: GroupItemExtended = {
      id: `grp-${Date.now()}`,
      name: newGroupName.trim(),
      avatar: newGroupCover,
      coverImage: newGroupCover,
      membersCount: '1 member',
      description: newGroupDesc.trim() || `${newGroupName.trim()} - Peaceverse24.com ইসলামিক গ্রুপ।`,
      postsPerDay: '0 new posts',
      newPostsCount: 0,
      isJoined: true,
      isPinned: true,
      visits: 1,
      category: newGroupCategory,
      privacy: newGroupPrivacy,
    };

    setGroups((prev) => [created, ...prev]);
    setShowCreateGroupModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
    setSelectedGroup(created);
    showToast(`🎉 "${created.name}" গ্রুপ তৈরি হয়েছে!`);
  };

  const handleAddGroupPost = () => {
    if (!newPostText.trim() || !selectedGroup) return;

    const text = newPostText.trim();
    const post = {
      id: `gp-${Date.now()}`,
      author: userProfile?.name || 'Member',
      avatar:
        userProfile?.avatar ||
        `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(userProfile?.name || 'Member')}`,
      text,
      time: 'Just now',
      likes: 0,
    };

    setGroupPosts((prev) => ({
      ...prev,
      [selectedGroup.id]: [post, ...(prev[selectedGroup.id] || [])],
    }));

    setActivityCards((prev) => [
      {
        id: `act-${Date.now()}`,
        groupId: selectedGroup.id,
        groupName: selectedGroup.name,
        image: selectedGroup.coverImage || PRESET_GROUP_COVERS[0],
        snippet: text,
        countLabel: '0/0',
      },
      ...prev,
    ]);

    setNewPostText('');
    showToast('গ্রুপে পোস্ট করা হয়েছে ✓');
  };

  const handleToggleRecLike = (postId: string) => {
    setRecommendedPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const yourGroups = useMemo(() => {
    const joined = groups.filter((g) => g.isJoined);
    const activeSearch = (activeTab === 'your_groups' ? yourGroupsSearch : headerSearch)
      .trim()
      .toLowerCase();

    const filtered = activeSearch
      ? joined.filter(
          (g) =>
            g.name.toLowerCase().includes(activeSearch) ||
            g.category.toLowerCase().includes(activeSearch)
        )
      : joined;

    return [...filtered].sort((a, b) => {
      if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
        return a.isPinned ? -1 : 1;
      }
      if (sortBy === 'A–Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Recently active') return (b.newPostsCount || 0) - (a.newPostsCount || 0);
      return (b.visits || 0) - (a.visits || 0);
    });
  }, [groups, activeTab, yourGroupsSearch, headerSearch, sortBy]);

  const discoverGroups = useMemo(() => {
    const activeSearch = headerSearch.trim().toLowerCase();
    return groups.filter((g) => {
      if (dismissedIds[g.id]) return false;
      if (activeSearch) {
        return (
          g.name.toLowerCase().includes(activeSearch) ||
          g.category.toLowerCase().includes(activeSearch)
        );
      }
      return !g.isJoined || SUGGESTED_DISCOVER_GROUPS.some((s) => s.id === g.id);
    });
  }, [groups, dismissedIds, headerSearch]);

  // =========================================================================
  // GROUP DETAIL VIEW (PURE WHITE FACEBOOK DESIGN)
  // =========================================================================
  if (selectedGroup) {
    const posts = groupPosts[selectedGroup.id] || [];

    return (
      <div className="max-w-[700px] mx-auto min-h-screen bg-white text-[#050505] pb-24 font-sans">
        {/* Sticky White Top Bar */}
        <div className="sticky top-0 z-30 bg-white px-3 py-2.5 flex items-center justify-between border-b border-[#E4E6EB]">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setSelectedGroup(null)}
              className="p-2 rounded-full hover:bg-[#F0F2F5] text-[#050505] cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="min-w-0">
              <h2 className="font-bold text-sm text-[#050505] truncate">{selectedGroup.name}</h2>
              <p className="text-[11px] text-[#65676B] flex items-center gap-1">
                {selectedGroup.privacy === 'private' ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  <Globe className="w-3 h-3" />
                )}
                <span>{selectedGroup.membersCount}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleJoin(selectedGroup.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              selectedGroup.isJoined
                ? 'bg-[#E4E6EB] text-[#050505]'
                : 'bg-[#0866FF] text-white'
            }`}
          >
            {selectedGroup.isJoined ? 'Joined ✓' : 'Join'}
          </button>
        </div>

        {/* Cover */}
        <div className="h-44 w-full relative overflow-hidden bg-[#F0F2F5]">
          <img
            src={selectedGroup.coverImage}
            alt={selectedGroup.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Group Summary */}
        <div className="p-4 bg-white border-b border-[#E4E6EB] space-y-2.5">
          <h1 className="text-xl font-extrabold text-[#050505]">{selectedGroup.name}</h1>
          <p className="text-xs text-[#65676B] flex items-center gap-1.5">
            {selectedGroup.privacy === 'private' ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <Globe className="w-3.5 h-3.5" />
            )}
            <span>
              {selectedGroup.privacy === 'private' ? 'Private group' : 'Public group'} ·{' '}
              {selectedGroup.membersCount}
            </span>
          </p>
          <p className="text-xs text-[#050505] bg-[#F0F2F5] p-3 rounded-xl leading-relaxed">
            {selectedGroup.description}
          </p>
        </div>

        {/* Post Composer */}
        {selectedGroup.isJoined && (
          <div className="p-3.5 bg-white border-b border-[#E4E6EB] space-y-2.5">
            <textarea
              rows={2}
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="Write something in this group..."
              className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl p-3 text-xs text-[#050505] placeholder-[#65676B] focus:outline-none focus:border-[#0866FF] resize-none"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddGroupPost}
                disabled={!newPostText.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] disabled:opacity-45 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </div>
          </div>
        )}

        {/* Group Feed */}
        <div className="bg-[#F0F2F5] p-3 space-y-3 min-h-[260px]">
          {posts.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-[#E4E6EB] text-xs text-[#65676B]">
              এই গ্রুপে এখনো কোনো পোস্ট নেই। প্রথম পোস্টটি লিখুন!
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-[#E4E6EB] p-3.5 space-y-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.avatar}
                    alt={post.author}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#050505]">{post.author}</h4>
                    <p className="text-[10px] text-[#65676B]">{post.time}</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-[#050505] leading-relaxed whitespace-pre-wrap">
                  {post.text}
                </p>
                <div className="flex items-center gap-6 pt-2 border-t border-[#E4E6EB] text-xs text-[#65676B] font-semibold">
                  <button
                    type="button"
                    onClick={() => showToast('Like দেওয়া হয়েছে')}
                    className="flex items-center gap-1.5 hover:text-[#0866FF] cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Comment করুন')}
                    className="flex items-center gap-1.5 hover:text-[#050505] cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Comment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Share করা হয়েছে')}
                    className="flex items-center gap-1.5 hover:text-[#050505] cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN FACEBOOK GROUPS 4-TAB VIEW (PURE WHITE)
  // =========================================================================
  return (
    <div className="max-w-[700px] mx-auto min-h-screen bg-white text-[#050505] pb-24 font-sans">
      {/* HEADER: Groups + (+) Create + Search + Menu (7 notif) */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E4E6EB]">
        <div className="px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#050505] cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
            <h1 className="text-[24px] font-extrabold text-[#050505] tracking-tight">
              Groups
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* + Create Group */}
            <button
              type="button"
              onClick={() => setShowCreateGroupModal(true)}
              className="w-9 h-9 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
              title="Create group"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Search */}
            <button
              type="button"
              onClick={() => setShowHeaderSearch((prev) => !prev)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                showHeaderSearch
                  ? 'bg-[#E7F3FF] text-[#0866FF]'
                  : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505]'
              }`}
              title="Search groups"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Menu (7 notif) */}
            <button
              type="button"
              onClick={() => (onOpenMenu ? onOpenMenu() : setActiveTab('discover'))}
              className="relative w-9 h-9 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
              title="Menu"
            >
              <Menu className="w-4 h-4 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#E41E3F] text-white text-[10px] font-black flex items-center justify-center px-1 ring-2 ring-white">
                7
              </span>
            </button>
          </div>
        </div>

        {/* Optional expandable search bar */}
        {showHeaderSearch && (
          <div className="px-3.5 pb-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-[#65676B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search groups..."
                className="w-full bg-[#F0F2F5] rounded-full pl-9 pr-8 py-2 text-xs text-[#050505] placeholder-[#65676B] focus:outline-none focus:ring-1 focus:ring-[#0866FF]"
              />
              {headerSearch && (
                <button
                  type="button"
                  onClick={() => setHeaderSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#65676B] hover:text-[#050505]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 4 TABS: For you | Your groups | Your activity | Discover */}
        <div className="px-3 pb-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'for_you', label: 'For you' },
            { id: 'your_groups', label: 'Your groups' },
            { id: 'your_activity', label: 'Your activity' },
            { id: 'discover', label: 'Discover' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#E7F3FF] text-[#0866FF]'
                    : 'bg-white text-[#050505] hover:bg-[#F0F2F5]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* TAB 1: FOR YOU                                                    */}
      {/* ================================================================= */}
      {activeTab === 'for_you' && (
        <div className="divide-y divide-[#E4E6EB]">
          {/* Section: Your groups + See all */}
          <div className="p-3.5 space-y-2.5 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#050505]">Your groups</h2>
              <button
                type="button"
                onClick={() => setActiveTab('your_groups')}
                className="text-[13px] font-semibold text-[#0866FF] hover:underline cursor-pointer"
              >
                See all
              </button>
            </div>

            {yourGroups.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#F0F2F5] text-center text-xs text-[#65676B]">
                No groups yet - Create or Join
              </div>
            ) : (
              <div className="space-y-2">
                {yourGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-[#F0F2F5] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={group.avatar}
                        alt={group.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#E4E6EB] shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-bold text-[#050505] truncate">
                          {group.name}
                        </h3>
                        <p className="text-[12px] text-[#65676B] flex items-center gap-1.5">
                          <span>{group.membersCount}</span>
                          <span>·</span>
                          {(group.newPostsCount || 0) > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[#0866FF] font-semibold">
                              <span className="w-2 h-2 rounded-full bg-[#0866FF] inline-block" />
                              {group.postsPerDay}
                            </span>
                          ) : (
                            <span>{group.postsPerDay}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => togglePin(group.id, e)}
                      className={`p-2 rounded-full hover:bg-[#E4E6EB] transition-colors cursor-pointer shrink-0 ${
                        group.isPinned ? 'text-[#0866FF]' : 'text-[#B0B3B8]'
                      }`}
                      title={group.isPinned ? 'Unpin group' : 'Pin group'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Recommended for you (FB Post Feed) */}
          <div className="bg-white pt-3">
            <div className="px-3.5 pb-2">
              <h2 className="text-[16px] font-bold text-[#050505]">Recommended for you</h2>
            </div>

            <div className="divide-y divide-[#E4E6EB]">
              {recommendedPosts.map((post) => {
                const groupObj = groups.find((g) => g.id === post.groupId);
                const isJoined = Boolean(groupObj?.isJoined);

                return (
                  <div key={post.id} className="bg-white py-3 space-y-2.5">
                    {/* Post Header */}
                    <div className="px-3.5 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={post.groupAvatar}
                            alt={post.groupName}
                            className="w-10 h-10 rounded-xl object-cover border border-[#E4E6EB]"
                          />
                          <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            className="w-5 h-5 rounded-full object-cover border-2 border-white absolute -bottom-1 -right-1"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              onClick={() => groupObj && setSelectedGroup(groupObj)}
                              className="text-[13px] font-bold text-[#050505] hover:underline cursor-pointer truncate"
                            >
                              {post.groupName}
                            </span>
                            {!isJoined && (
                              <>
                                <span className="text-[#65676B]">·</span>
                                <button
                                  type="button"
                                  onClick={() => toggleJoin(post.groupId)}
                                  className="text-[13px] font-bold text-[#0866FF] hover:underline cursor-pointer"
                                >
                                  Join
                                </button>
                              </>
                            )}
                          </div>
                          <p className="text-[12px] text-[#65676B]">
                            {post.authorName} · {post.timeAgo} · <Globe className="w-3 h-3 inline" />
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[#65676B] shrink-0">
                        <button
                          type="button"
                          onClick={() => showToast('পোস্ট অপশন')}
                          className="p-1.5 rounded-full hover:bg-[#F0F2F5]"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Text */}
                    <p className="px-3.5 text-[14px] text-[#050505] leading-relaxed">
                      {post.text}
                    </p>

                    {/* Image(s) Grid */}
                    {post.images.length > 0 && (
                      <div
                        className={`grid gap-1 ${
                          post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                        }`}
                      >
                        {post.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt="Group post"
                            className="w-full h-52 object-cover bg-[#F0F2F5]"
                          />
                        ))}
                      </div>
                    )}

                    {/* Reactions & Actions */}
                    <div className="px-3.5 pt-1 flex items-center justify-between text-[12px] text-[#65676B]">
                      <span>👍 ❤️ {post.likes}</span>
                      <span>{post.comments} comments</span>
                    </div>

                    <div className="mx-3.5 pt-2 border-t border-[#E4E6EB] grid grid-cols-3 text-xs font-bold text-[#65676B]">
                      <button
                        type="button"
                        onClick={() => handleToggleRecLike(post.id)}
                        className={`py-1.5 rounded-lg hover:bg-[#F0F2F5] flex items-center justify-center gap-1.5 cursor-pointer ${
                          post.isLiked ? 'text-[#0866FF]' : 'text-[#65676B]'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Like</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => groupObj && setSelectedGroup(groupObj)}
                        className="py-1.5 rounded-lg hover:bg-[#F0F2F5] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Comment</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast('পোস্ট শেয়ার করা হয়েছে ✓')}
                        className="py-1.5 rounded-lg hover:bg-[#F0F2F5] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: YOUR GROUPS                                                */}
      {/* ================================================================= */}
      {activeTab === 'your_groups' && (
        <div className="p-3.5 space-y-3.5 bg-white">
          {/* + Create a group button */}
          <button
            type="button"
            onClick={() => setShowCreateGroupModal(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#E7F3FF] hover:bg-[#DBE7F2] text-[#0866FF] font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create a group</span>
          </button>

          {/* Search your groups by name */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#65676B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={yourGroupsSearch}
              onChange={(e) => setYourGroupsSearch(e.target.value)}
              placeholder="Search your groups by name"
              className="w-full bg-[#F0F2F5] rounded-full pl-9 pr-4 py-2 text-xs sm:text-sm text-[#050505] placeholder-[#65676B] focus:outline-none focus:ring-1 focus:ring-[#0866FF]"
            />
          </div>

          {/* Sort by: Most visited + sort icon */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-[#65676B]">
              Sort by: <span className="text-[#050505]">{sortBy}</span>
            </span>
            <button
              type="button"
              onClick={() =>
                setSortBy((prev) =>
                  prev === 'Most visited'
                    ? 'Recently active'
                    : prev === 'Recently active'
                    ? 'A–Z'
                    : 'Most visited'
                )
              }
              className="p-1.5 rounded-lg hover:bg-[#F0F2F5] text-[#050505] flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Change sort"
            >
              <ArrowUpDown className="w-4 h-4 text-[#65676B]" />
            </button>
          </div>

          {/* Groups List */}
          {yourGroups.length === 0 ? (
            <div className="py-10 px-4 text-center rounded-2xl bg-[#F0F2F5] border border-[#E4E6EB] space-y-2">
              <Users className="w-8 h-8 text-[#65676B] mx-auto" />
              <p className="text-sm font-bold text-[#050505]">No groups yet - Create or Join</p>
              <button
                type="button"
                onClick={() => setActiveTab('discover')}
                className="px-4 py-2 rounded-lg bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
              >
                Discover groups
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {yourGroups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-[#F0F2F5] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={group.avatar}
                      alt={group.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#E4E6EB] shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-bold text-[#050505] truncate">
                        {group.name}
                      </h3>
                      <p className="text-[12px] text-[#65676B] flex items-center gap-1.5">
                        <span>{group.membersCount}</span>
                        <span>·</span>
                        {(group.newPostsCount || 0) > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[#0866FF] font-semibold">
                            <span className="w-2 h-2 rounded-full bg-[#0866FF] inline-block" />
                            {group.postsPerDay}
                          </span>
                        ) : (
                          <span>{group.postsPerDay}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => togglePin(group.id, e)}
                    className={`p-2 rounded-full hover:bg-[#E4E6EB] transition-colors cursor-pointer shrink-0 ${
                      group.isPinned ? 'text-[#0866FF]' : 'text-[#B0B3B8]'
                    }`}
                    title={group.isPinned ? 'Unpin group' : 'Pin group'}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: YOUR ACTIVITY (2-COLUMN GRID LIKE FB REFERENCE)            */}
      {/* ================================================================= */}
      {activeTab === 'your_activity' && (
        <div className="p-3.5 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#050505]">Your activity</h2>
            <span className="text-xs text-[#65676B]">{activityCards.length} updates</span>
          </div>

          {activityCards.length === 0 ? (
            <div className="py-10 text-center bg-[#F0F2F5] rounded-2xl border border-[#E4E6EB] text-xs text-[#65676B]">
              এখনো কোনো গ্রুপ অ্যাক্টিভিটি নেই।
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {activityCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => {
                    const matched = groups.find((g) => g.id === card.groupId);
                    if (matched) setSelectedGroup(matched);
                  }}
                  className="bg-white rounded-xl border border-[#E4E6EB] overflow-hidden shadow-2xs hover:shadow-sm transition-shadow cursor-pointer flex flex-col"
                >
                  <img
                    src={card.image}
                    alt={card.groupName}
                    className="w-full h-28 object-cover bg-[#F0F2F5]"
                  />
                  <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1.5">
                    <div>
                      <h3 className="text-[13px] font-bold text-[#050505] truncate">
                        {card.groupName}
                      </h3>
                      <p className="text-[12px] text-[#65676B] line-clamp-2 mt-0.5 leading-snug">
                        {card.snippet}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#65676B] pt-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{card.countLabel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 4: DISCOVER (SUGGESTED FOR YOU - 2-COLUMN GRID)               */}
      {/* ================================================================= */}
      {activeTab === 'discover' && (
        <div className="p-3.5 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#050505]">Suggested for you</h2>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {discoverGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-xl border border-[#E4E6EB] overflow-hidden shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-28 bg-[#F0F2F5]">
                    <img
                      src={group.coverImage}
                      alt={group.name}
                      onClick={() => setSelectedGroup(group)}
                      className="w-full h-full object-cover cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDismissedIds((prev) => ({ ...prev, [group.id]: true }))
                      }
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center cursor-pointer"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-2.5 space-y-1">
                    <h3
                      onClick={() => setSelectedGroup(group)}
                      className="text-[14px] font-bold text-[#050505] leading-tight line-clamp-1 cursor-pointer hover:underline"
                    >
                      {group.name}
                    </h3>
                    <p className="text-[11px] text-[#65676B]">
                      {group.privacy === 'private' ? 'Private group' : 'Public group'} ·{' '}
                      {group.membersCount}
                    </p>
                    {group.memberHint && (
                      <p className="text-[11px] text-[#65676B] truncate pt-0.5">
                        {group.memberHint}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-2.5 pb-2.5">
                  <button
                    type="button"
                    onClick={() => toggleJoin(group.id)}
                    className={`w-full py-1.5 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${
                      group.isJoined
                        ? 'bg-[#E4E6EB] text-[#050505]'
                        : 'bg-[#0866FF] hover:bg-[#1877F2] text-white'
                    }`}
                  >
                    {group.isJoined ? 'Joined ✓' : 'Join'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* CREATE GROUP MODAL (PURE WHITE)                                   */}
      {/* ================================================================= */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E4E6EB] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-[#050505]">
            <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0866FF]" />
                <h3 className="font-bold text-sm text-[#050505]">Create a group</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateGroupModal(false)}
                className="p-1 rounded-full text-[#65676B] hover:bg-[#F0F2F5] hover:text-[#050505] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#050505] mb-1">
                  Group name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Name your group..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-white border border-[#CED0D4] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#050505] focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#050505] mb-1">
                  Choose privacy
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewGroupPrivacy('public')}
                    className={`p-2.5 rounded-xl text-left border-2 text-xs cursor-pointer bg-white ${
                      newGroupPrivacy === 'public'
                        ? 'border-[#0866FF] bg-[#E7F3FF]/40 text-[#050505] font-bold'
                        : 'border-[#E4E6EB] text-[#65676B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[#050505]">
                      <Globe className="w-3.5 h-3.5 text-[#0866FF]" />
                      <span>Public</span>
                    </div>
                    <p className="text-[10px] text-[#65676B] mt-1 font-normal">
                      Anyone can see who&apos;s in the group
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewGroupPrivacy('private')}
                    className={`p-2.5 rounded-xl text-left border-2 text-xs cursor-pointer bg-white ${
                      newGroupPrivacy === 'private'
                        ? 'border-[#0866FF] bg-[#E7F3FF]/40 text-[#050505] font-bold'
                        : 'border-[#E4E6EB] text-[#65676B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[#050505]">
                      <Lock className="w-3.5 h-3.5 text-[#65676B]" />
                      <span>Private</span>
                    </div>
                    <p className="text-[10px] text-[#65676B] mt-1 font-normal">
                      Only members can see posts
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#050505] mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newGroupCategory}
                  onChange={(e) => setNewGroupCategory(e.target.value)}
                  className="w-full bg-white border border-[#CED0D4] rounded-xl px-3.5 py-2 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#050505] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe your group..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full bg-white border border-[#CED0D4] rounded-xl p-2.5 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#050505] mb-1">
                  Cover photo
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_GROUP_COVERS.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Cover"
                      onClick={() => setNewGroupCover(url)}
                      className={`w-20 h-12 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                        newGroupCover === url
                          ? 'border-[#0866FF] scale-105'
                          : 'border-transparent opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#E4E6EB] text-xs font-bold text-[#050505] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-xs font-bold text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Create group</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#050505] text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl flex items-center gap-1.5">
          <Check className="w-4 h-4 text-[#00A651]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
