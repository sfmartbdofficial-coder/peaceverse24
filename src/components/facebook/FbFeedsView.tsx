import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  Search,
  MoreHorizontal,
  X,
  Globe,
  ThumbsUp,
  MessageCircle,
  Share2,
  Check,
  Send,
} from 'lucide-react';
import { PostItem, ReactionType, UserProfile } from '../../types';
import { useHistoryBack } from '../../utils/backNavigation';

export type FeedsFilterTab = 'All' | 'Favorites' | 'Friends' | 'Groups' | 'Pages';

interface FeedPostEntry {
  id: string;
  authorName: string;
  authorAvatar: string;
  isAd?: boolean;
  subLabel?: string; // e.g., "Just now", "2h"
  timeText?: string;
  contentText: string;
  image?: string;
  adHeadline?: string;
  adCtaText?: string;
  adLink?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  sourceType: Exclude<FeedsFilterTab, 'All'>;
  originalPostId?: string;
  isUserLiked?: boolean;
  commentsList?: Array<{ id: string; author: string; text: string; time: string }>;
}

interface FbFeedsViewProps {
  posts: PostItem[];
  userProfile: UserProfile;
  onBack: () => void;
  onOpenProfile: () => void;
  onToggleReaction: (postId: string, reaction: ReactionType) => void;
  onAddComment: (postId: string, text: string) => void;
}

const FEED_TABS: FeedsFilterTab[] = ['All', 'Favorites', 'Friends', 'Groups', 'Pages'];

const SAMPLE_HALAL_FEEDS: FeedPostEntry[] = [];

export const FbFeedsView: React.FC<FbFeedsViewProps> = ({
  posts,
  userProfile,
  onBack,
  onOpenProfile,
  onToggleReaction,
  onAddComment,
}) => {
  const [activeTab, setActiveTab] = useState<FeedsFilterTab>('All');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [expandedTextIds, setExpandedTextIds] = useState<string[]>([]);
  const [localLikes, setLocalLikes] = useState<Record<string, boolean>>({});
  const [localShares, setLocalShares] = useState<Record<string, number>>({});
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [localComments, setLocalComments] = useState<
    Record<string, Array<{ id: string; author: string; text: string; time: string }>>
  >({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useHistoryBack(
    showSearchBar,
    () => {
      setSearchQuery('');
      setShowSearchBar(false);
    },
    'feeds-search'
  );
  useHistoryBack(Boolean(activeMenuId), () => setActiveMenuId(null), 'feeds-post-menu');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Combine real app posts + clean Facebook Feeds entries
  const combinedEntries = useMemo<FeedPostEntry[]>(() => {
    const mappedRealPosts: FeedPostEntry[] = posts
      .filter((p) => p.status !== 'blocked' && p.status !== 'rejected')
      .map((p) => {
        let sourceType: Exclude<FeedsFilterTab, 'All'> = 'Friends';
        if (p.category === 'Quran' || p.category === 'Hadith' || p.category === 'Dua') {
          sourceType = 'Favorites';
        } else if (p.category === 'Community' || p.category === 'Global Ummah') {
          sourceType = 'Groups';
        } else if (p.category === 'Lecture' || p.category === 'Nasheed' || p.category === 'Live') {
          sourceType = 'Pages';
        }

        return {
          id: `real-${p.id}`,
          originalPostId: p.id,
          authorName: p.author.name,
          authorAvatar: p.author.avatar,
          timeText: p.timeAgo || 'Just now',
          contentText: p.contentBangla || p.translation || '',
          image: p.mediaType === 'image' ? p.mediaUrl : undefined,
          likesCount: p.reactions?.total ?? 0,
          commentsCount: p.comments?.length ?? 0,
          sharesCount: p.sharesCount ?? 0,
          sourceType,
          isUserLiked: Boolean(p.userReaction),
          commentsList: (p.comments || []).map((c) => ({
            id: c.id,
            author: c.author,
            text: c.text,
            time: c.timeAgo,
          })),
        };
      });

    return mappedRealPosts;
  }, [posts]);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return combinedEntries.filter((item) => {
      if (hiddenIds.includes(item.id)) return false;
      if (activeTab !== 'All' && item.sourceType !== activeTab) return false;
      if (q) {
        return (
          item.authorName.toLowerCase().includes(q) ||
          item.contentText.toLowerCase().includes(q) ||
          (item.adHeadline && item.adHeadline.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [combinedEntries, hiddenIds, activeTab, searchQuery]);

  const handleLikeClick = (entry: FeedPostEntry) => {
    if (entry.originalPostId) {
      onToggleReaction(entry.originalPostId, 'like');
    } else {
      setLocalLikes((prev) => ({ ...prev, [entry.id]: !prev[entry.id] }));
    }
  };

  const handleShareClick = (entry: FeedPostEntry) => {
    setLocalShares((prev) => ({ ...prev, [entry.id]: (prev[entry.id] || 0) + 1 }));
    showToast('Post link copied to share');
  };

  const handleSubmitComment = (entry: FeedPostEntry) => {
    const text = (commentDrafts[entry.id] || '').trim();
    if (!text) return;

    if (entry.originalPostId) {
      onAddComment(entry.originalPostId, text);
    } else {
      setLocalComments((prev) => ({
        ...prev,
        [entry.id]: [
          ...(prev[entry.id] || []),
          {
            id: `lc-${Date.now()}`,
            author: userProfile.name || 'You',
            text,
            time: 'Just now',
          },
        ],
      }));
    }
    setCommentDrafts((prev) => ({ ...prev, [entry.id]: '' }));
  };

  return (
    <div className="min-h-screen bg-white text-[#050505] pb-20 font-sans max-w-[700px] mx-auto">
      {/* 1. TOP BAR: Left "<" | Center "Feeds" bold black | Right Search + Profile pic with blue tick */}
      <header className="sticky top-0 z-30 bg-white">
        <div className="h-[54px] px-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 -ml-1 rounded-full hover:bg-[#F0F2F5] active:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Back"
            title="Back"
          >
            <ChevronLeft className="w-7 h-7 stroke-[2.2]" />
          </button>

          <h1 className="text-[19px] font-bold text-[#050505] tracking-tight">Feeds</h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSearchBar((prev) => !prev)}
              className="w-9 h-9 rounded-full hover:bg-[#F0F2F5] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Search Feeds"
              title="Search Feeds"
            >
              <Search className="w-[22px] h-[22px] stroke-[2.2]" />
            </button>

            <button
              type="button"
              onClick={onOpenProfile}
              className="relative w-9 h-9 rounded-full shrink-0 cursor-pointer"
              aria-label="Open profile"
              title={userProfile.name}
            >
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-9 h-9 rounded-full object-cover border border-[#E4E6EB]"
              />
              <span
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#1877F2] border-2 border-white flex items-center justify-center"
                aria-label="Verified"
              >
                <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
              </span>
            </button>
          </div>
        </div>

        {/* Optional expandable Search Input */}
        {showSearchBar && (
          <div className="px-3.5 pb-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-[#65676B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts in Feeds..."
                className="w-full bg-[#F0F2F5] rounded-full pl-9 pr-9 py-2 text-[14px] text-[#050505] placeholder-[#65676B] focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65676B] hover:text-[#050505] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. FILTER TABS - Horizontal scrollable text tabs with underline on white background */}
        <nav
          className="flex items-center overflow-x-auto no-scrollbar bg-white border-b border-[#E4E6EB] px-2"
          aria-label="Feed filters"
        >
          {FEED_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-[15px] whitespace-nowrap border-b-[2.5px] transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#E7F3FF] text-[#1877F2] font-semibold border-[#1877F2]'
                    : 'bg-white text-[#65676B] font-medium border-transparent hover:bg-[#F0F2F5]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </nav>
      </header>

      {/* 3. POST FEED - Pure White Cards separated cleanly */}
      <div className="bg-[#E4E6EB] space-y-2">
        {filteredEntries.length === 0 ? (
          <div className="bg-white py-14 px-4 text-center space-y-2">
            <p className="text-[16px] font-bold text-[#050505]">No posts in {activeTab}</p>
            <p className="text-[13px] text-[#65676B]">
              Try switching back to All or clearing your search.
            </p>
            {activeTab !== 'All' && (
              <button
                type="button"
                onClick={() => setActiveTab('All')}
                className="mt-2 px-4 py-2 rounded-lg bg-[#1877F2] text-white text-[14px] font-semibold cursor-pointer"
              >
                Show All Posts
              </button>
            )}
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isLiked = entry.originalPostId
              ? Boolean(entry.isUserLiked)
              : Boolean(localLikes[entry.id]);
            const displayLikes =
              entry.likesCount + (!entry.originalPostId && isLiked ? 1 : 0);
            const mergedComments = [
              ...(entry.commentsList || []),
              ...(localComments[entry.id] || []),
            ];
            const displayCommentsCount = entry.originalPostId
              ? entry.commentsCount
              : entry.commentsCount + (localComments[entry.id]?.length || 0);
            const displayShares = entry.sharesCount + (localShares[entry.id] || 0);
            const isLong = entry.contentText.length > 135;
            const isExpanded = expandedTextIds.includes(entry.id);

            return (
              <article key={entry.id} className="bg-white relative">
                {/* Post Header */}
                <div className="px-3.5 pt-3 pb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={entry.authorAvatar}
                      alt={entry.authorName}
                      className="w-10 h-10 rounded-full object-cover shrink-0 bg-[#E4E6EB] border border-[#E4E6EB]"
                    />
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold text-[#050505] leading-snug truncate">
                        {entry.authorName}
                      </p>
                      <div className="flex items-center gap-1 text-[12px] text-[#65676B] leading-tight mt-0.5">
                        {entry.isAd ? (
                          <span>Ad</span>
                        ) : (
                          <span>
                            {entry.subLabel ? `${entry.subLabel} · ` : ''}
                            {entry.timeText || 'Just now'}
                          </span>
                        )}
                        <span>·</span>
                        <Globe className="w-3 h-3 text-[#65676B] inline-block shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Right Side: 3 dots + X close */}
                  <div className="flex items-center gap-1 shrink-0 relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenuId((prev) => (prev === entry.id ? null : entry.id))
                      }
                      className="w-8 h-8 rounded-full hover:bg-[#F0F2F5] text-[#65676B] flex items-center justify-center cursor-pointer"
                      aria-label="More options"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setHiddenIds((prev) => [...prev, entry.id])}
                      className="w-8 h-8 rounded-full hover:bg-[#F0F2F5] text-[#65676B] flex items-center justify-center cursor-pointer"
                      aria-label="Hide post"
                      title="Hide post"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {activeMenuId === entry.id && (
                      <div className="absolute right-0 top-9 z-20 w-44 bg-white border border-[#E4E6EB] rounded-lg shadow-lg py-1 text-[13px] text-[#050505]">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            showToast('Post saved');
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-[#F0F2F5] font-medium cursor-pointer"
                        >
                          Save post
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            setHiddenIds((prev) => [...prev, entry.id]);
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-[#F0F2F5] font-medium cursor-pointer"
                        >
                          Hide post
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Text */}
                {entry.contentText && (
                  <div className="px-3.5 pb-2.5 text-[15px] text-[#050505] leading-snug whitespace-pre-line">
                    {isLong && !isExpanded ? (
                      <>
                        {entry.contentText.slice(0, 135).trimEnd()}...{' '}
                        <button
                          type="button"
                          onClick={() => setExpandedTextIds((prev) => [...prev, entry.id])}
                          className="text-[#65676B] font-semibold hover:underline cursor-pointer"
                        >
                          more
                        </button>
                      </>
                    ) : (
                      entry.contentText
                    )}
                  </div>
                )}

                {/* Full-Width Image (Zero horizontal padding) */}
                {entry.image && (
                  <div className="w-full bg-[#F0F2F5]">
                    <img
                      src={entry.image}
                      alt={entry.authorName}
                      className="w-full max-h-[420px] object-cover block"
                    />
                  </div>
                )}

                {/* Bottom Ad CTA Bar ("Learn more" blue button) */}
                {entry.isAd && (
                  <div className="px-3.5 py-2.5 bg-white border-b border-[#E4E6EB] flex items-center justify-between gap-3">
                    <p className="text-[14px] font-medium text-[#050505] leading-snug flex-1 min-w-0">
                      {entry.adHeadline}
                    </p>
                    <button
                      type="button"
                      onClick={() => showToast(`Opening ${entry.authorName}...`)}
                      className="px-4 py-2 rounded-[6px] bg-[#1877F2] hover:bg-[#166FE5] text-white text-[14px] font-semibold shrink-0 cursor-pointer transition-colors"
                    >
                      {entry.adCtaText || 'Learn more'}
                    </button>
                  </div>
                )}

                {/* Reactions Row: Like icon 217, Comment 64, Share 1 - gray icons + right blue badge */}
                <div className="px-3.5 py-2.5 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-6">
                    <button
                      type="button"
                      onClick={() => handleLikeClick(entry)}
                      className={`flex items-center gap-1.5 text-[14px] font-medium cursor-pointer transition-colors ${
                        isLiked ? 'text-[#1877F2]' : 'text-[#65676B] hover:text-[#050505]'
                      }`}
                    >
                      <ThumbsUp
                        className={`w-[20px] h-[20px] ${
                          isLiked ? 'fill-[#1877F2] text-[#1877F2]' : ''
                        }`}
                      />
                      <span>{displayLikes}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setOpenCommentsId((prev) => (prev === entry.id ? null : entry.id))
                      }
                      className="flex items-center gap-1.5 text-[14px] font-medium text-[#65676B] hover:text-[#050505] cursor-pointer transition-colors"
                    >
                      <MessageCircle className="w-[20px] h-[20px]" />
                      <span>{displayCommentsCount}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareClick(entry)}
                      className="flex items-center gap-1.5 text-[14px] font-medium text-[#65676B] hover:text-[#050505] cursor-pointer transition-colors"
                    >
                      <Share2 className="w-[20px] h-[20px]" />
                      <span>{displayShares}</span>
                    </button>
                  </div>

                  {/* Subtle right blue reaction pill matching Facebook screenshot */}
                  <button
                    type="button"
                    onClick={() => handleLikeClick(entry)}
                    className="w-6 h-6 rounded-full bg-[#1877F2] flex items-center justify-center text-white shrink-0 cursor-pointer"
                    aria-label="Like"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 fill-white" />
                  </button>
                </div>

                {/* Inline Comment Drawer when Comment icon tapped */}
                {openCommentsId === entry.id && (
                  <div className="px-3.5 pb-3 pt-1 border-t border-[#E4E6EB] bg-white space-y-2.5">
                    {mergedComments.length > 0 && (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pt-1">
                        {mergedComments.map((c) => (
                          <div
                            key={c.id}
                            className="bg-[#F0F2F5] rounded-2xl px-3 py-1.5 text-[13px]"
                          >
                            <span className="font-bold text-[#050505] mr-1.5">{c.author}</span>
                            <span className="text-[#050505]">{c.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={userProfile.avatar}
                        alt={userProfile.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <input
                        type="text"
                        value={commentDrafts[entry.id] || ''}
                        onChange={(e) =>
                          setCommentDrafts((prev) => ({ ...prev, [entry.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSubmitComment(entry);
                          }
                        }}
                        placeholder="Write a comment..."
                        className="flex-1 bg-[#F0F2F5] rounded-full px-3.5 py-1.5 text-[13px] text-[#050505] placeholder-[#65676B] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSubmitComment(entry)}
                        className="p-1.5 text-[#1877F2] hover:bg-[#F0F2F5] rounded-full cursor-pointer"
                        aria-label="Send comment"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Subtle Toast */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#050505] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg">
          {toastMsg}
        </div>
      )}
    </div>
  );
};
