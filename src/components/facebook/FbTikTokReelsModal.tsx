import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  X,
  ThumbsUp,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Check,
  Copy,
  Sparkles,
  UserPlus,
  BadgeCheck,
  Gift,
  Search,
  MoreHorizontal,
  Globe,
  Smile,
  AtSign,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { PostItem, ReactionType } from '../../types';
import {
  getAuthorRelationshipKind,
  isFriendRequestSentLocally,
  toggleLocalFriendRequestAndSync,
  isTargetFollowedLocally,
  toggleFollowUser,
} from '../../lib/firebase';
import { useResolvedMediaUrl } from '../../lib/mediaStorage';
import { FbCommentBottomSheet } from './FbCommentBottomSheet';
import { useHistoryBack } from '../../utils/backNavigation';

interface FbTikTokReelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPostId?: string;
  posts: PostItem[];
  onToggleReaction: (postId: string, reaction: ReactionType) => void;
  onToggleSave: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  currentUserName?: string;
  currentUserAvatar?: string;
  onOpenGiftModal?: (post: PostItem) => void;
}

export const FbTikTokReelsModal: React.FC<FbTikTokReelsModalProps> = ({
  isOpen,
  onClose,
  initialPostId,
  posts,
  onToggleReaction,
  onToggleSave,
  onAddComment,
  currentUserName = 'You',
  currentUserAvatar,
  onOpenGiftModal,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Gather all video / reel posts
  const videoPosts = useMemo(
    () =>
      posts.filter(
        (p) =>
          p.mediaType === 'video' ||
          Boolean(p.mediaUrl && p.mediaUrl.match(/\.(mp4|webm|mov|ogg|m4v)($|\?)/i))
      ),
    [posts]
  );

  // Fallback: If no video posts found in filtered list, find the initial post if it has mediaUrl
  const baseList = useMemo(
    () =>
      videoPosts.length > 0
        ? videoPosts
        : posts.filter((p) => p.id === initialPostId && p.mediaUrl),
    [videoPosts, posts, initialPostId]
  );

  const activeList = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return baseList;
    const filtered = baseList.filter(
      (p) =>
        (p.contentBangla || '').toLowerCase().includes(q) ||
        (p.author?.name || '').toLowerCase().includes(q)
    );
    return filtered.length > 0 ? filtered : baseList;
  }, [baseList, searchTerm]);

  const initialIndex = Math.max(
    0,
    activeList.findIndex((p) => p.id === initialPostId)
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPlayPauseAnim, setShowPlayPauseAnim] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [heartAnimPos, setHeartAnimPos] = useState({ x: 0, y: 0 });
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [followedAuthors, setFollowedAuthors] = useState<Record<string, boolean>>({});
  const [reelSyncTick, setReelSyncTick] = useState(0);
  const [expandedCaption, setExpandedCaption] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);
  const lastWheelRef = useRef<number>(0);

  useHistoryBack(
    isOpen && searchOpen,
    () => {
      setSearchTerm('');
      setSearchOpen(false);
    },
    'reels-search'
  );
  useHistoryBack(
    isOpen && showMoreSheet,
    () => setShowMoreSheet(false),
    'reels-more-sheet'
  );

  useEffect(() => {
    if (!isOpen) {
      setShowCommentDrawer(false);
      setShowMoreSheet(false);
      setSearchOpen(false);
      setSearchTerm('');
      setExpandedCaption(false);
      if (typeof document !== 'undefined' && document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  }, [isOpen]);

  // Sync index when initialPostId changes
  useEffect(() => {
    if (initialPostId && activeList.length > 0) {
      const idx = activeList.findIndex((p) => p.id === initialPostId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [initialPostId, activeList.length]);

  const currentPost: PostItem | undefined = activeList[currentIndex] || activeList[0];
  const resolvedCurrentMediaUrl = useResolvedMediaUrl(currentPost?.mediaUrl);

  // Auto-play and reset video on index change
  useEffect(() => {
    if (!isOpen) return;
    const video = videoRef.current;
    if (!video || !resolvedCurrentMediaUrl) return;

    setProgress(0);
    video.currentTime = 0;
    video.muted = isMuted;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });
    }
  }, [currentIndex, isOpen, resolvedCurrentMediaUrl]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  const goToNext = useCallback(() => {
    if (activeList.length === 0) return;
    if (currentIndex < activeList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
    setShowCommentDrawer(false);
    setShowMoreSheet(false);
    setExpandedCaption(false);
  }, [currentIndex, activeList.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowCommentDrawer(false);
      setShowMoreSheet(false);
      setExpandedCaption(false);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showMoreSheet) {
          setShowMoreSheet(false);
        } else if (showCommentDrawer) {
          setShowCommentDrawer(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowDown' && !showCommentDrawer) {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowUp' && !showCommentDrawer) {
        e.preventDefault();
        goToPrev();
      } else if (e.key === ' ' && !showCommentDrawer && !searchOpen) {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToNext, goToPrev, showCommentDrawer, showMoreSheet, searchOpen, onClose]);

  if (!isOpen || !currentPost) return null;

  const handleVideoTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 320;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHeartAnimPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 900);

      onToggleReaction(currentPost.id, 'like');
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY - 20) {
          togglePlayPause();
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    setShowPlayPauseAnim(true);
    setTimeout(() => setShowPlayPauseAnim(false), 700);

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (showCommentDrawer || showMoreSheet) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null || showCommentDrawer || showMoreSheet) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    const SWIPE_THRESHOLD = 50;

    if (diff > SWIPE_THRESHOLD) {
      goToNext();
    } else if (diff < -SWIPE_THRESHOLD) {
      goToPrev();
    }
    touchStartY.current = null;
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?tab=reels&postId=${currentPost.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentPost.author.name,
          text: currentPost.contentBangla || 'PeaceVerse Reels',
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch {}
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1800);
  };

  const isLiked = Boolean(currentPost.userReaction);
  const isSaved = currentPost.isSaved || false;

  const toggleFollow = (authorName: string) => {
    setFollowedAuthors((prev) => ({
      ...prev,
      [authorName]: !prev[authorName],
    }));
  };

  const formatCount = (n: number) => {
    if (!n) return '0';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return String(n);
  };

  const captionText = (currentPost.contentBangla || '').trim();
  const isLongCaption = captionText.length > 48 || captionText.includes('\n');

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden font-sans">
      {/* Ambient background blur on desktop */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 scale-110 pointer-events-none"
        style={{
          backgroundImage: `url(${currentPost.author.avatar})`,
        }}
      />

      {/* Main Facebook Reels Frame */}
      <div
        className="relative w-full h-full sm:max-w-[440px] sm:h-[94vh] sm:rounded-3xl sm:border sm:border-white/10 sm:shadow-2xl overflow-hidden bg-black flex flex-col justify-between will-change-transform"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={(e) => {
          if (showCommentDrawer || showMoreSheet) return;
          const now = Date.now();
          if (now - lastWheelRef.current < 450) return;
          if (e.deltaY > 40) {
            lastWheelRef.current = now;
            goToNext();
          } else if (e.deltaY < -40) {
            lastWheelRef.current = now;
            goToPrev();
          }
        }}
      >
        {/* ========================================================= */}
        {/* TOP BAR — Clean Facebook Reels Header (<         🔍  •••) */}
        {/* ========================================================= */}
        <div
          className="absolute top-0 inset-x-0 z-30 px-3 pt-3 pb-8 bg-gradient-to-b from-black/70 via-black/25 to-transparent pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -ml-1 rounded-full hover:bg-white/15 text-white transition-colors active:scale-95 cursor-pointer"
              aria-label="Back"
            >
              <ChevronLeft className="w-7 h-7 stroke-[2.3] drop-shadow" />
            </button>

            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => setSearchOpen((prev) => !prev)}
                className="p-1.5 rounded-full hover:bg-white/15 text-white transition-colors active:scale-95 cursor-pointer"
                aria-label="Search reels"
              >
                <Search className="w-6 h-6 stroke-[2.2] drop-shadow" />
              </button>

              <button
                type="button"
                onClick={() => setShowMoreSheet(true)}
                className="w-7 h-7 rounded-full border-[1.8px] border-white/95 hover:bg-white/15 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer drop-shadow"
                aria-label="More options"
              >
                <MoreHorizontal className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="mt-2.5 flex items-center gap-2 bg-[#242526]/95 border border-white/20 rounded-full px-3.5 py-1.5 backdrop-blur-md">
              <Search className="w-4 h-4 text-[#B0B3B8] shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reels..."
                className="flex-1 bg-transparent text-sm text-white placeholder-[#B0B3B8] focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSearchOpen(false);
                }}
                className="text-[#B0B3B8] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* VIDEO DISPLAY CONTAINER */}
        {/* ========================================================= */}
        <div
          onClick={handleVideoTap}
          className="relative w-full h-full flex items-center justify-center cursor-pointer bg-black overflow-hidden"
        >
          <video
            ref={videoRef}
            src={resolvedCurrentMediaUrl || undefined}
            playsInline
            muted={isMuted}
            loop
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onEnded={goToNext}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-contain sm:object-cover"
          />
          {activeList[currentIndex + 1]?.mediaUrl &&
            !activeList[currentIndex + 1].mediaUrl?.startsWith('pv-media://') && (
              <video
                src={activeList[currentIndex + 1].mediaUrl}
                preload="metadata"
                muted
                className="hidden"
                aria-hidden="true"
              />
            )}

          {showPlayPauseAnim && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15 z-20">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-2xl animate-in zoom-in-75 duration-150">
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-white" />
                ) : (
                  <Play className="w-8 h-8 fill-white translate-x-0.5" />
                )}
              </div>
            </div>
          )}

          {!isPlaying && !showPlayPauseAnim && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 z-10">
              <div className="w-16 h-16 rounded-full bg-black/55 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl">
                <Play className="w-8 h-8 fill-white translate-x-0.5" />
              </div>
            </div>
          )}

          {showHeartAnim && (
            <div
              className="pointer-events-none absolute z-30 text-rose-500 animate-in zoom-in-50 fade-out-down duration-700 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${heartAnimPos.x}px`,
                top: `${heartAnimPos.y}px`,
              }}
            >
              <Heart className="w-24 h-24 fill-rose-500 stroke-white drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT VERTICAL ACTION COLUMN (Exact FB Reels + Golden হাদিয়া) */}
        {/* ========================================================= */}
        <div
          className="absolute right-3 bottom-20 z-30 flex flex-col items-center gap-4 text-white pointer-events-auto select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Like (Facebook ThumbsUp) */}
          <button
            type="button"
            onClick={() => onToggleReaction(currentPost.id, 'like')}
            className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform cursor-pointer"
          >
            <ThumbsUp
              className={`w-7 h-7 drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)] transition-colors ${
                isLiked ? 'text-[#0866FF] fill-[#0866FF]' : 'text-white stroke-[2]'
              }`}
            />
            <span className="text-[12px] font-semibold drop-shadow">
              {formatCount(currentPost.reactions.total || 0)}
            </span>
          </button>

          {/* 2. Signature Golden Hadia Button */}
          <button
            type="button"
            onClick={() => onOpenGiftModal?.(currentPost)}
            className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform cursor-pointer"
            title="হাদিয়া পাঠান"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-500/40 border border-yellow-200">
              <Gift className="w-4.5 h-4.5 stroke-[2.4]" />
            </div>
            <span className="text-[11px] font-extrabold text-amber-300 drop-shadow">
              {currentPost.goldenGiftsCount ? `🪙 ${currentPost.goldenGiftsCount}` : 'হাদিয়া'}
            </span>
          </button>

          {/* 3. Comment */}
          <button
            type="button"
            onClick={() => setShowCommentDrawer(true)}
            className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform cursor-pointer"
          >
            <MessageCircle className="w-7 h-7 text-white stroke-[2] drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]" />
            <span className="text-[12px] font-semibold drop-shadow">
              {formatCount(currentPost.comments.length || 0)}
            </span>
          </button>

          {/* 4. Share */}
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform cursor-pointer"
          >
            {isCopied ? (
              <Check className="w-7 h-7 text-emerald-400 stroke-[2.6] drop-shadow" />
            ) : (
              <Share2 className="w-7 h-7 text-white stroke-[2] drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]" />
            )}
            <span className="text-[12px] font-semibold drop-shadow">
              {isCopied ? 'Copied' : formatCount(currentPost.sharesCount || 0)}
            </span>
          </button>

          {/* 5. Bookmark / Save */}
          <button
            type="button"
            onClick={() => onToggleSave(currentPost.id)}
            className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform cursor-pointer"
          >
            <Bookmark
              className={`w-7 h-7 drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)] transition-colors ${
                isSaved ? 'fill-amber-400 text-amber-400' : 'text-white stroke-[2]'
              }`}
            />
            <span className="text-[12px] font-semibold drop-shadow">
              {isSaved ? 'Saved' : 'Save'}
            </span>
          </button>

          {/* 6. More (•••) */}
          <button
            type="button"
            onClick={() => setShowMoreSheet(true)}
            className="flex items-center justify-center py-0.5 active:scale-90 transition-transform cursor-pointer"
            aria-label="More actions"
          >
            <MoreHorizontal className="w-6 h-6 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM AUTHOR + CAPTION + "Add a comment" PILL BAR */}
        {/* ========================================================= */}
        <div
          className="absolute bottom-0 inset-x-0 z-20 pt-14 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Author + Verified + Globe + Follow + Caption */}
          <div className="px-3.5 pb-2.5 pr-16 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/50 bg-neutral-800 shrink-0">
                <img
                  src={currentPost.author.avatar}
                  alt={currentPost.author.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-[15px] text-white drop-shadow truncate max-w-[165px]">
                  {currentPost.author.name}
                </span>
                {currentPost.author.verified && (
                  <BadgeCheck className="w-4 h-4 text-[#0866FF] fill-white shrink-0" />
                )}
                <Globe className="w-3.5 h-3.5 text-white/85 shrink-0" />
              </div>

              {(() => {
                void reelSyncTick;
                const relKind = getAuthorRelationshipKind(currentPost, undefined, currentUserName);
                if (relKind === 'self' || relKind === 'friend') return null;
                const targetId = currentPost.authorId || `author-${currentPost.author.name}`;
                if (relKind === 'add_friend') {
                  const reqSent = isFriendRequestSentLocally(targetId, currentPost.author.name);
                  return (
                    <button
                      type="button"
                      onClick={async () => {
                        await toggleLocalFriendRequestAndSync(
                          'user-me',
                          currentUserName || 'Member',
                          currentUserAvatar || '',
                          {
                            id: targetId,
                            name: currentPost.author.name,
                            avatar: currentPost.author.avatar,
                          }
                        );
                        setReelSyncTick((t) => t + 1);
                      }}
                      className={`px-3 py-1 rounded-[8px] text-[12.5px] font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                        reqSent
                          ? 'bg-white/20 text-white border-white/40'
                          : 'bg-black/25 text-white border-white/75 hover:bg-white/15'
                      }`}
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>{reqSent ? 'Request sent' : 'Add Friend'}</span>
                    </button>
                  );
                }
                const followed =
                  Boolean(followedAuthors[currentPost.author.name]) ||
                  isTargetFollowedLocally(targetId, currentPost.author.name);
                return (
                  <button
                    type="button"
                    onClick={async () => {
                      await toggleFollowUser(
                        'user-me',
                        currentUserName || 'Member',
                        currentUserAvatar || '',
                        targetId,
                        currentPost.author.name,
                        currentPost.author.avatar
                      );
                      toggleFollow(currentPost.author.name);
                      setReelSyncTick((t) => t + 1);
                    }}
                    className={`px-3 py-1 rounded-[8px] text-[12.5px] font-semibold border transition-colors cursor-pointer ${
                      followed
                        ? 'bg-white/20 text-white border-white/40'
                        : 'bg-black/25 text-white border-white/75 hover:bg-white/15'
                    }`}
                  >
                    {followed ? 'Following' : 'Follow'}
                  </button>
                );
              })()}
            </div>

            {captionText && (
              <div className="text-[13px] text-white/95 leading-snug drop-shadow">
                <span className={expandedCaption ? 'whitespace-pre-line' : 'line-clamp-1 inline'}>
                  {captionText}
                </span>
                {isLongCaption && (
                  <button
                    type="button"
                    onClick={() => setExpandedCaption((prev) => !prev)}
                    className="text-white/80 font-semibold hover:underline ml-1 cursor-pointer"
                  >
                    {expandedCaption ? 'less' : '... more'}
                  </button>
                )}
              </div>
            )}

            {currentPost.arabicVerse && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-950/75 border border-emerald-500/40 text-emerald-200 text-[11px] font-semibold">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span className="font-serif">{currentPost.arabicVerse}</span>
              </div>
            )}
          </div>

          {/* Exact Facebook Bottom "Add a comment" Pill Bar */}
          <div className="px-3 pb-2.5">
            <button
              type="button"
              onClick={() => setShowCommentDrawer(true)}
              className="w-full h-11 rounded-full bg-[#1C1E21]/90 border border-white/25 px-4 flex items-center justify-between gap-2 text-left hover:border-white/45 transition-colors cursor-pointer"
            >
              <span className="text-[14px] text-[#B0B3B8] font-normal truncate">
                Add a comment
              </span>
              <div className="flex items-center gap-3 text-white/90 shrink-0">
                <AtSign className="w-4.5 h-4.5 stroke-[2]" />
                <Smile className="w-4.5 h-4.5 stroke-[2]" />
                <span className="px-1.5 py-0.5 rounded border border-white/80 text-[9px] font-extrabold leading-none tracking-tight">
                  GIF
                </span>
              </div>
            </button>
          </div>

          {/* Slim edge timeline progress */}
          <div className="w-full bg-white/20 h-[2px] overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* MORE OPTIONS BOTTOM SHEET (from top-right or bottom-right •••) */}
        {showMoreSheet && (
          <div
            className="fixed inset-0 z-40 bg-black/60 flex items-end justify-center animate-in fade-in"
            onClick={() => setShowMoreSheet(false)}
          >
            <div
              className="w-full max-w-[440px] bg-[#242526] text-white rounded-t-2xl border-t border-white/15 p-4 space-y-2 pb-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-white/25 mx-auto mb-2" />

              <button
                type="button"
                onClick={() => {
                  toggleMute();
                  setShowMoreSheet(false);
                }}
                className="w-full px-3.5 py-3 rounded-xl hover:bg-white/10 flex items-center justify-between text-sm font-semibold cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-sky-400" />
                  )}
                  <span>{isMuted ? 'Unmute audio' : 'Mute audio'}</span>
                </span>
                <span className="text-xs text-[#B0B3B8]">{isMuted ? 'Muted' : 'On'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleSave(currentPost.id);
                  setShowMoreSheet(false);
                }}
                className="w-full px-3.5 py-3 rounded-xl hover:bg-white/10 flex items-center gap-3 text-sm font-semibold cursor-pointer"
              >
                <Bookmark
                  className={`w-5 h-5 ${isSaved ? 'fill-amber-400 text-amber-400' : 'text-white'}`}
                />
                <span>{isSaved ? 'Remove from Saved' : 'Save reel'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  void handleShare();
                  setShowMoreSheet(false);
                }}
                className="w-full px-3.5 py-3 rounded-xl hover:bg-white/10 flex items-center gap-3 text-sm font-semibold cursor-pointer"
              >
                <Copy className="w-5 h-5 text-white" />
                <span>Copy link</span>
              </button>

              {activeList.length > 1 && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      goToPrev();
                      setShowMoreSheet(false);
                    }}
                    disabled={currentIndex === 0}
                    className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-35 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ChevronUp className="w-4 h-4" />
                    <span>Previous reel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      goToNext();
                      setShowMoreSheet(false);
                    }}
                    className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                    <span>Next reel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FACEBOOK-EXACT COMMENT BOTTOM SHEET */}
        <FbCommentBottomSheet
          isOpen={showCommentDrawer}
          onClose={() => setShowCommentDrawer(false)}
          postId={currentPost.id}
          likesCount={currentPost.reactions?.total || 0}
          hasUserReacted={Boolean(currentPost.userReaction)}
          userReaction={currentPost.userReaction || null}
          comments={currentPost.comments || []}
          currentUserName={currentUserName}
          currentUserAvatar={currentUserAvatar}
          onAddComment={(text) => onAddComment(currentPost.id, text)}
          onToggleReaction={(reaction) => onToggleReaction(currentPost.id, reaction)}
        />
      </div>
    </div>
  );
};
