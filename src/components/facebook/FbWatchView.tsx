import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Menu,
  Search,
  MoreHorizontal,
  Plus,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Music,
  Check,
  X,
  Send,
  Radio,
  Clapperboard,
  ChevronUp,
  ChevronDown,
  Gift,
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  Heart,
  UserPlus,
  Globe,
  Smile,
  AtSign,
  BadgeCheck,
} from 'lucide-react';
import { PostItem, ReactionType } from '../../types';
import {
  isTargetFollowedLocally,
  subscribeToFollowStatus,
  toggleFollowUser,
  isSameOwnerIdentity,
  getAuthorRelationshipKind,
  isFriendRequestSentLocally,
  toggleLocalFriendRequestAndSync,
} from '../../lib/firebase';
import { useResolvedMediaUrl } from '../../lib/mediaStorage';
import { FbCommentBottomSheet } from './FbCommentBottomSheet';

interface FbWatchViewProps {
  posts: PostItem[];
  onToggleReaction: (postId: string, reaction: ReactionType) => void;
  onToggleSave: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onBack?: () => void;
  onOpenReel?: (post: PostItem) => void;
  onOpenGiftModal?: (post: PostItem) => void;
  onOpenLive?: () => void;
  onOpenMenu?: () => void;
  onOpenCreateReel?: () => void;
  onOpenProfile?: (authorName: string, authorAvatar: string, subtitle?: string) => void;
  currentUserName?: string;
  currentUserAvatar?: string;
}

const formatCount = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(num);
};

const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const getInitials = (name?: string): string => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'P';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

export const FbWatchView: React.FC<FbWatchViewProps> = ({
  posts,
  onToggleReaction,
  onToggleSave,
  onAddComment,
  onOpenGiftModal,
  onOpenLive,
  onOpenMenu,
  onOpenCreateReel,
  onOpenProfile,
  currentUserName = 'You',
  currentUserAvatar,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showCenterControls, setShowCenterControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [isLandscapeVideo, setIsLandscapeVideo] = useState(false);
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [followTick, setFollowTick] = useState(0);
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [heartBurst, setHeartBurst] = useState<{ x: number; y: number } | null>(null);
  const [sharedCounts, setSharedCounts] = useState<Record<string, number>>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);
  const lastWheelRef = useRef<number>(0);
  const hideControlsTimerRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 2200);
  };

  // Gather all video / reel posts newest-first
  const videoPosts = useMemo(() => {
    const matched = posts.filter(
      (p) =>
        p.mediaType === 'video' ||
        Boolean(p.youtubeId) ||
        Boolean(p.mediaUrl && /\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(p.mediaUrl))
    );
    return [...matched].sort(
      (a, b) => (b.createdAtMillis || 0) - (a.createdAtMillis || 0)
    );
  }, [posts]);

  const isLongVideoPost = (p: PostItem): boolean => {
    if (p.videoKind === 'long') return true;
    if (typeof p.durationSeconds === 'number' && p.durationSeconds > 180) return true;
    if (p.duration && p.duration.split(':').length === 3) return true;
    if (p.duration && p.duration.split(':').length === 2) {
      const [m, s] = p.duration.split(':').map((n) => Number(n) || 0);
      if (m * 60 + s > 180) return true;
    }
    return false;
  };

  const filteredVideos = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return videoPosts.filter((p) => {
      const text = `${p.contentBangla} ${p.author.name} ${p.author.subtitle || ''} ${p.musicTitle || ''}`.toLowerCase();
      if (q && !text.includes(q)) return false;
      if (filter === 'reels') return !isLongVideoPost(p);
      if (filter === 'long') return isLongVideoPost(p);
      if (filter === 'live') return Boolean(p.isLive);
      if (filter === 'makkah') return text.includes('makkah') || text.includes('মক্কা');
      if (filter === 'madinah') return text.includes('madinah') || text.includes('মদিনা');
      if (filter === 'quran') return p.category === 'Quran' || text.includes('তিলাওয়াত') || text.includes('কুরআন');
      return true;
    });
  }, [videoPosts, filter, searchTerm]);

  useEffect(() => {
    if (currentIndex >= filteredVideos.length) {
      setCurrentIndex(0);
    }
  }, [filteredVideos.length, currentIndex]);

  const currentPost: PostItem | undefined = filteredVideos[currentIndex];
  const resolvedCurrentMediaUrl = useResolvedMediaUrl(currentPost?.mediaUrl);

  const scheduleHideControls = useCallback(() => {
    if (hideControlsTimerRef.current) {
      window.clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowCenterControls(false);
      }
    }, 2200);
  }, []);

  // Auto-play active video on reel switch
  useEffect(() => {
    const video = videoRef.current;
    setProgress(0);
    setCurrentTimeSec(0);
    setDurationSec(0);
    setIsLandscapeVideo(false);
    setExpandedCaption(false);

    if (!currentPost || !video) {
      setShowCenterControls(true);
      return;
    }

    video.currentTime = 0;
    video.muted = isMuted;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setShowCenterControls(false);
        })
        .catch(() => {
          video.muted = true;
          setIsMuted(true);
          video
            .play()
            .then(() => {
              setIsPlaying(true);
              setShowCenterControls(false);
            })
            .catch(() => {
              setIsPlaying(false);
              setShowCenterControls(true);
            });
        });
    }
  }, [currentIndex, currentPost?.id, resolvedCurrentMediaUrl]);

  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) {
        window.clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, []);

  const goToNext = useCallback(() => {
    if (filteredVideos.length <= 1) return;
    setShowCommentDrawer(false);
    setCurrentIndex((prev) => (prev + 1) % filteredVideos.length);
  }, [filteredVideos.length]);

  const goToPrev = useCallback(() => {
    if (filteredVideos.length <= 1) return;
    setShowCommentDrawer(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredVideos.length - 1));
  }, [filteredVideos.length]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setShowCenterControls(true);
          scheduleHideControls();
        })
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
      setShowCenterControls(true);
      if (hideControlsTimerRef.current) {
        window.clearTimeout(hideControlsTimerRef.current);
      }
    }
  }, [scheduleHideControls]);

  const seekBy = (deltaSeconds: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    const next = Math.max(0, Math.min(video.duration, video.currentTime + deltaSeconds));
    video.currentTime = next;
    setCurrentTimeSec(next);
    setProgress(video.duration > 0 ? (next / video.duration) * 100 : 0);
    setShowCenterControls(true);
    if (!video.paused) scheduleHideControls();
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    const pct = Number(e.target.value);
    setProgress(pct);
    if (video && Number.isFinite(video.duration) && video.duration > 0) {
      const nextTime = (pct / 100) * video.duration;
      video.currentTime = nextTime;
      setCurrentTimeSec(nextTime);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const handleCanvasTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentPost) return;
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHeartBurst({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      window.setTimeout(() => setHeartBurst(null), 800);
      onToggleReaction(currentPost.id, 'love');
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      window.setTimeout(() => {
        if (Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY - 20) {
          if (videoRef.current) {
            togglePlayPause();
          } else {
            setShowCenterControls((prev) => !prev);
          }
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (showCommentDrawer || showMoreSheet) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null || showCommentDrawer || showMoreSheet) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;
    if (diff > 55) {
      goToNext();
    } else if (diff < -55) {
      goToPrev();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
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
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentPost) return;
    const shareUrl = `${window.location.origin}/?post=${currentPost.id}`;
    setSharedCounts((prev) => ({
      ...prev,
      [currentPost.id]: (prev[currentPost.id] || 0) + 1,
    }));
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentPost.author.name,
          text: currentPost.contentBangla || 'PeaceVerse24 Reel',
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      showToast('রিলসের লিংক কপি হয়েছে');
    } catch {
      showToast('রিলসের লিংক কপি হয়েছে');
    }
  };

  const totalReactions = currentPost ? currentPost.reactions.total || 0 : 0;
  const isLiked = Boolean(currentPost?.userReaction);
  const currentAuthorTargetId = currentPost
    ? currentPost.authorId || `author-${currentPost.author.name}`
    : '';
  const watchRelationshipKind = currentPost
    ? getAuthorRelationshipKind(currentPost, undefined, currentUserName)
    : 'self';
  const isOwnWatchAuthor =
    watchRelationshipKind === 'self' ||
    (currentPost
      ? isSameOwnerIdentity(currentPost.authorId, currentPost.author.name, undefined, currentUserName)
      : false);
  const isAuthorFollowed = React.useMemo(() => {
    void followTick;
    return currentPost && watchRelationshipKind === 'follow_only'
      ? isTargetFollowedLocally(currentAuthorTargetId, currentPost.author.name)
      : false;
  }, [currentPost, currentAuthorTargetId, followTick, watchRelationshipKind]);
  const isWatchFriendReqSent = React.useMemo(() => {
    void followTick;
    return currentPost && watchRelationshipKind === 'add_friend'
      ? isFriendRequestSentLocally(currentAuthorTargetId, currentPost.author.name)
      : false;
  }, [currentPost, currentAuthorTargetId, followTick, watchRelationshipKind]);

  useEffect(() => {
    if (!currentPost) return;
    const unsub = subscribeToFollowStatus(
      'user-me',
      currentAuthorTargetId,
      () => setFollowTick((t) => t + 1),
      currentPost.author.name
    );
    return () => unsub();
  }, [currentPost?.id, currentAuthorTargetId, currentPost?.author?.name]);

  return (
    <div
      className="fixed inset-x-0 top-0 bottom-[calc(52px+env(safe-area-inset-bottom))] z-20 bg-black text-white overflow-hidden select-none flex justify-center"
      onWheel={handleWheel}
    >
      {/* Centered Reels Canvas (full width mobile, 500px mobile frame on desktop) */}
      <div
        className="relative w-full max-w-[500px] h-full bg-black overflow-hidden flex flex-col justify-between"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleCanvasTap}
      >
        {/* TOP OVERLAY HEADER — Matches Facebook Reels (≡ Reels   + 🔍 •••) */}
        <header
          className="absolute top-0 inset-x-0 z-30 bg-gradient-to-b from-black/75 via-black/35 to-transparent px-3.5 pt-3 pb-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              {onOpenMenu && (
                <button
                  type="button"
                  onClick={onOpenMenu}
                  className="p-1.5 -ml-1.5 rounded-full hover:bg-white/15 text-white transition-colors cursor-pointer"
                  aria-label="Menu"
                >
                  <Menu className="w-6 h-6 stroke-[2.3]" />
                </button>
              )}
              <h1 className="text-[21px] font-bold tracking-tight text-white drop-shadow">
                Reels
              </h1>
              {filter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold text-white flex items-center gap-1 cursor-pointer"
                >
                  <span>{filter}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenCreateReel && (
                <button
                  type="button"
                  onClick={onOpenCreateReel}
                  className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
                  aria-label="Create Reel"
                  title="রিলস তৈরি করুন"
                >
                  <Plus className="w-6 h-6 stroke-[2.3]" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen((prev) => !prev)}
                className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Search Reels"
              >
                <Search className="w-[22px] h-[22px] stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={() => setShowMoreSheet(true)}
                className="w-7 h-7 rounded-full border-[1.8px] border-white/90 hover:bg-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="More Options"
              >
                <MoreHorizontal className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Expandable Inline Search Bar */}
          {searchOpen && (
            <div className="mt-2.5 flex items-center gap-2 bg-[#242526]/95 border border-white/20 rounded-full px-3.5 py-1.5 backdrop-blur-md">
              <Search className="w-4 h-4 text-[#B0B3B8] shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="রিলস বা ক্রিয়েটর খুঁজুন..."
                className="flex-1 bg-transparent text-sm text-white placeholder-[#B0B3B8] focus:outline-none"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-[#B0B3B8] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </header>

        {/* EMPTY STATE OR ACTIVE REEL PLAYER */}
        {!currentPost ? (
          <div
            className="flex-1 flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-[#111214] via-black to-[#111214]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 rounded-full bg-white/10 border border-white/15 flex items-center justify-center mb-4">
              <Clapperboard className="w-10 h-10 text-white/90" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1.5">
              {searchTerm || filter !== 'all'
                ? 'এই সার্চে কোনো রিলস পাওয়া যায়নি'
                : 'এখনো কোনো রিলস ভিডিও নেই'}
            </h2>
            <p className="text-xs text-[#B0B3B8] max-w-[280px] mb-5 leading-relaxed">
              {searchTerm || filter !== 'all'
                ? 'সব ভিডিও দেখতে ফিল্টার রিসেট করুন অথবা নতুন রিলস তৈরি করুন।'
                : 'প্রথম হালাল রিলস ভিডিও আপলোড করুন অথবা লাইভে যুক্ত হোন।'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {(searchTerm || filter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                  }}
                  className="px-4 py-2.5 rounded-lg bg-white/15 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  সব রিলস দেখুন
                </button>
              )}
              {onOpenCreateReel && (
                <button
                  type="button"
                  onClick={onOpenCreateReel}
                  className="px-5 py-2.5 rounded-lg bg-[#0866FF] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Reel</span>
                </button>
              )}
              {onOpenLive && (
                <button
                  type="button"
                  onClick={onOpenLive}
                  className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Radio className="w-4 h-4" />
                  <span>Go Live</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* VIDEO MEDIA LAYER */}
            <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden">
              {currentPost.youtubeId ? (
                <iframe
                  key={currentPost.id}
                  src={`https://www.youtube.com/embed/${currentPost.youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0`}
                  title={currentPost.contentBangla || 'Reel Video'}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={currentPost.id}
                  ref={videoRef}
                  src={resolvedCurrentMediaUrl || undefined}
                  poster={currentPost.author.avatar}
                  className={`w-full h-full ${
                    isLandscapeVideo ? 'object-contain' : 'object-cover'
                  }`}
                  playsInline
                  loop
                  muted={isMuted}
                  onLoadedMetadata={() => {
                    const video = videoRef.current;
                    if (!video) return;
                    setDurationSec(video.duration || 0);
                    if (video.videoWidth && video.videoHeight) {
                      setIsLandscapeVideo(video.videoWidth > video.videoHeight);
                    }
                  }}
                  onTimeUpdate={() => {
                    const video = videoRef.current;
                    if (!video || !video.duration) return;
                    setCurrentTimeSec(video.currentTime);
                    setDurationSec(video.duration);
                    setProgress((video.currentTime / video.duration) * 100);
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => {
                    setIsPlaying(false);
                    setShowCenterControls(true);
                  }}
                />
              )}

              {/* Subtle Top & Bottom Gradient Vignettes for Legibility */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              {/* DOUBLE-TAP HEART BURST */}
              {heartBurst && (
                <div
                  className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 animate-ping"
                  style={{ left: heartBurst.x, top: heartBurst.y }}
                >
                  <Heart className="w-16 h-16 text-rose-500 fill-rose-500 drop-shadow-lg" />
                </div>
              )}

              {/* CENTER PLAY / PAUSE / -5s / +5s CONTROLS (Exact Facebook Reels layout) */}
              {!currentPost.youtubeId && (showCenterControls || !isPlaying) && (
                <div className="absolute inset-0 z-20 flex items-center justify-center gap-6 pointer-events-none">
                  <button
                    type="button"
                    onClick={(e) => seekBy(-5, e)}
                    className="pointer-events-auto relative w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xs flex items-center justify-center text-white transition-transform active:scale-95 cursor-pointer"
                    aria-label="Rewind 5 seconds"
                  >
                    <RotateCcw className="w-7 h-7 stroke-[2]" />
                    <span className="absolute text-[9px] font-extrabold mt-0.5">5</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlayPause();
                    }}
                    className="pointer-events-auto w-16 h-16 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-xs flex items-center justify-center text-white transition-transform active:scale-95 cursor-pointer shadow-lg"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 fill-white text-white" />
                    ) : (
                      <Play className="w-8 h-8 fill-white text-white ml-1" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => seekBy(5, e)}
                    className="pointer-events-auto relative w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xs flex items-center justify-center text-white transition-transform active:scale-95 cursor-pointer"
                    aria-label="Forward 5 seconds"
                  >
                    <RotateCw className="w-7 h-7 stroke-[2]" />
                    <span className="absolute text-[9px] font-extrabold mt-0.5">5</span>
                  </button>
                </div>
              )}

              {/* DESKTOP UP / DOWN ARROWS */}
              {filteredVideos.length > 1 && (
                <div
                  className="hidden sm:flex flex-col gap-2 absolute right-3 top-20 z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={goToPrev}
                    className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 border border-white/20 flex items-center justify-center text-white cursor-pointer"
                    aria-label="Previous Reel"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 border border-white/20 flex items-center justify-center text-white cursor-pointer"
                    aria-label="Next Reel"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* RIGHT VERTICAL ACTION RAIL (Matches Facebook + Golden হাদিয়া) */}
              <div
                className="absolute right-2.5 bottom-20 z-20 flex flex-col items-center gap-3.5"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onToggleReaction(currentPost.id, 'like')}
                  className="flex flex-col items-center gap-0.5 cursor-pointer group"
                >
                  <ThumbsUp
                    className={`w-7 h-7 drop-shadow transition-transform active:scale-110 ${
                      isLiked
                        ? 'text-[#0866FF] fill-[#0866FF]'
                        : 'text-white group-hover:scale-105'
                    }`}
                  />
                  <span className="text-[12px] font-semibold text-white drop-shadow">
                    {formatCount(totalReactions)}
                  </span>
                </button>

                {/* Signature Golden Hadia Button */}
                <button
                  type="button"
                  onClick={() => onOpenGiftModal?.(currentPost)}
                  className="flex flex-col items-center gap-0.5 cursor-pointer group active:scale-90 transition-transform"
                  title="হাদিয়া পাঠান"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-500/40 border border-yellow-200">
                    <Gift className="w-4.5 h-4.5 stroke-[2.4]" />
                  </div>
                  <span className="text-[11px] font-extrabold text-amber-300 drop-shadow">
                    {currentPost.goldenGiftsCount ? `🪙 ${currentPost.goldenGiftsCount}` : 'হাদিয়া'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCommentDrawer(true)}
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                >
                  <MessageCircle className="w-7 h-7 text-white drop-shadow group-hover:scale-105 transition-transform" />
                  <span className="text-[12px] font-semibold text-white drop-shadow">
                    {formatCount(currentPost.comments.length)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                >
                  <Share2 className="w-7 h-7 text-white drop-shadow group-hover:scale-105 transition-transform" />
                  <span className="text-[12px] font-semibold text-white drop-shadow">
                    {formatCount((currentPost.sharesCount || 0) + (sharedCounts[currentPost.id] || 0))}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleSave(currentPost.id)}
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                >
                  <Bookmark
                    className={`w-7 h-7 drop-shadow transition-transform active:scale-110 ${
                      currentPost.isSaved
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-white group-hover:scale-105'
                    }`}
                  />
                  <span className="text-[12px] font-semibold text-white drop-shadow">
                    {currentPost.isSaved ? 'Saved' : 'Save'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMoreSheet(true)}
                  className="flex flex-col items-center justify-center py-0.5 cursor-pointer"
                  aria-label="Reel options"
                >
                  <MoreHorizontal className="w-6 h-6 text-white drop-shadow" />
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex flex-col items-center justify-center py-0.5 cursor-pointer"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-6 h-6 text-white drop-shadow" />
                  ) : (
                    <Volume2 className="w-6 h-6 text-white drop-shadow" />
                  )}
                </button>
              </div>

              {/* BOTTOM-LEFT AUTHOR, CAPTION + "Add a comment" BAR */}
              <div
                className="absolute left-3 right-16 bottom-16 z-20 text-left space-y-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Author + Verified + Globe + Follow Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenProfile &&
                      onOpenProfile(
                        currentPost.author.name,
                        currentPost.author.avatar || '',
                        currentPost.author.subtitle
                      )
                    }
                    className="flex items-center gap-2 min-w-0 cursor-pointer"
                  >
                    {currentPost.author.avatar ? (
                      <img
                        src={currentPost.author.avatar}
                        alt={currentPost.author.name}
                        className="w-9 h-9 rounded-full object-cover border border-white/40 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#3A3B3C] border border-white/40 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {getInitials(currentPost.author.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[15px] text-white truncate max-w-[165px] drop-shadow">
                          {currentPost.author.name}
                        </span>
                        {currentPost.author.verified && (
                          <BadgeCheck className="w-4 h-4 text-[#0866FF] fill-white shrink-0" />
                        )}
                        <Globe className="w-3.5 h-3.5 text-white/85 shrink-0" />
                      </div>
                    </div>
                  </button>

                  {watchRelationshipKind === 'follow_only' && !isOwnWatchAuthor && (
                    <button
                      type="button"
                      onClick={async () => {
                        await toggleFollowUser(
                          'user-me',
                          currentUserName || 'User',
                          currentUserAvatar ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80',
                          currentAuthorTargetId,
                          currentPost.author.name,
                          currentPost.author.avatar
                        );
                        setFollowTick((t) => t + 1);
                      }}
                      className={`px-3 py-1 rounded-[6px] text-[12px] font-semibold transition-colors cursor-pointer shrink-0 ${
                        isAuthorFollowed
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'border border-white/80 text-white hover:bg-white/15'
                      }`}
                    >
                      {isAuthorFollowed ? (
                        <span className="inline-flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Following
                        </span>
                      ) : (
                        'Follow'
                      )}
                    </button>
                  )}
                  {watchRelationshipKind === 'add_friend' && !isOwnWatchAuthor && (
                    <button
                      type="button"
                      onClick={async () => {
                        await toggleLocalFriendRequestAndSync(
                          'user-me',
                          currentUserName || 'User',
                          currentUserAvatar || '',
                          {
                            id: currentAuthorTargetId,
                            name: currentPost.author.name,
                            avatar: currentPost.author.avatar,
                          }
                        );
                        setFollowTick((t) => t + 1);
                      }}
                      className={`px-3 py-1 rounded-[6px] text-[12px] font-semibold transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1 ${
                        isWatchFriendReqSent
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-[#0866FF] text-white hover:bg-[#166FE5]'
                      }`}
                    >
                      {isWatchFriendReqSent ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Request sent</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          <span>Add Friend</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Caption with "... more" */}
                {currentPost.contentBangla && (
                  <div className="text-[13px] text-white/95 leading-snug drop-shadow">
                    <span className={expandedCaption ? 'whitespace-pre-line' : 'line-clamp-1'}>
                      {currentPost.contentBangla}
                    </span>
                    {currentPost.contentBangla.length > 48 && (
                      <button
                        type="button"
                        onClick={() => setExpandedCaption((prev) => !prev)}
                        className="text-white/80 font-semibold hover:underline text-[12px] cursor-pointer"
                      >
                        {expandedCaption ? 'less' : '... more'}
                      </button>
                    )}
                  </div>
                )}

                {currentPost.arabicVerse && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-950/75 border border-emerald-500/40 text-emerald-200 text-[11px] font-semibold">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span className="font-serif">{currentPost.arabicVerse}</span>
                  </div>
                )}
              </div>

              {/* Exact Facebook Bottom "Add a comment" Pill Bar */}
              <div
                className="absolute inset-x-3 bottom-3 z-25"
                onClick={(e) => e.stopPropagation()}
              >
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

              {/* BOTTOM INTERACTIVE SCRUBBER BAR (Flush above dark Bottom Nav) */}
              {!currentPost.youtubeId && (
                <div
                  className="absolute inset-x-0 bottom-0 z-30 px-2 pb-1.5 pt-2 flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative w-full h-3 flex items-center">
                    <div className="w-full h-[3px] bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      />
                    </div>
                    <div
                      className="pointer-events-none absolute w-3 h-3 rounded-full bg-white shadow"
                      style={{
                        left: `calc(${Math.min(100, Math.max(0, progress))}% - 6px)`,
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={0.5}
                      value={progress}
                      onChange={handleScrub}
                      aria-label="Video timeline"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* TOAST NOTIFICATION */}
        {toastMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-lg bg-[#242526]/95 border border-white/15 text-white text-xs font-semibold shadow-xl">
            {toastMsg}
          </div>
        )}

        {/* FACEBOOK-EXACT COMMENT BOTTOM SHEET */}
        {currentPost && (
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
        )}

        {/* MORE / FILTER SHEET (Opened via ••• button) */}
        {showMoreSheet && (
          <div
            className="absolute inset-0 z-40 bg-black/60 flex items-end justify-center"
            onClick={(e) => {
              e.stopPropagation();
              setShowMoreSheet(false);
            }}
          >
            <div
              className="w-full bg-[#242526] text-white rounded-t-2xl border-t border-white/15 p-4 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-white/30 mx-auto" />

              <div className="grid grid-cols-2 gap-2">
                {onOpenCreateReel && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreSheet(false);
                      onOpenCreateReel();
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0866FF] hover:bg-blue-600 text-white text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Reel</span>
                  </button>
                )}
                {onOpenLive && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreSheet(false);
                      onOpenLive();
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Go Live</span>
                  </button>
                )}
              </div>

              {currentPost && onOpenGiftModal && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreSheet(false);
                    onOpenGiftModal(currentPost);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#3A3B3C] hover:bg-white/15 text-xs font-semibold cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>ক্রিয়েটরকে স্টার্স / হাদিয়া পাঠান</span>
                </button>
              )}

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#B0B3B8] px-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>ক্যাটাগরি ফিল্টার</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'সব ভিডিও' },
                    { id: 'reels', label: 'রিলস / শর্টস (১০সে–৩মি)' },
                    { id: 'long', label: 'লং ভিডিও (৩মি+)' },
                    { id: 'live', label: 'লাইভ' },
                    { id: 'quran', label: 'কুরআন তিলাওয়াত' },
                    { id: 'makkah', label: 'মক্কা' },
                    { id: 'madinah', label: 'মদিনা' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setFilter(item.id);
                        setCurrentIndex(0);
                        setShowMoreSheet(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        filter === item.id
                          ? 'bg-[#0866FF] text-white'
                          : 'bg-[#3A3B3C] text-white/90 hover:bg-white/20'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
