import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  X,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Music,
  Send,
  Check,
  Copy,
  Sparkles,
  UserPlus,
  ShieldCheck,
  Flame,
  Gift,
  Coins,
} from 'lucide-react';
import { PostItem, ReactionType } from '../../types';

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
  // 1. Gather all video / reel posts
  const videoPosts = posts.filter(
    (p) =>
      p.mediaType === 'video' ||
      Boolean(p.mediaUrl && p.mediaUrl.match(/\.(mp4|webm|mov|ogg|m4v)($|\?)/i))
  );

  // Fallback: If no video posts found in filtered list, find the initial post if it has video
  const activeList =
    videoPosts.length > 0
      ? videoPosts
      : posts.filter((p) => p.id === initialPostId && p.mediaUrl);

  const initialIndex = Math.max(
    0,
    activeList.findIndex((p) => p.id === initialPostId)
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [durationTime, setDurationTime] = useState('0:00');
  const [showPlayPauseAnim, setShowPlayPauseAnim] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [heartAnimPos, setHeartAnimPos] = useState({ x: 0, y: 0 });
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [followedAuthors, setFollowedAuthors] = useState<Record<string, boolean>>({});
  const [expandedCaption, setExpandedCaption] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);

  // Sync index when initialPostId changes
  useEffect(() => {
    if (initialPostId && activeList.length > 0) {
      const idx = activeList.findIndex((p) => p.id === initialPostId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [initialPostId, activeList.length]);

  const currentPost: PostItem | undefined = activeList[currentIndex];

  // Auto-play and reset video on index change
  useEffect(() => {
    if (!isOpen) return;
    const video = videoRef.current;
    if (!video) return;

    setProgress(0);
    video.currentTime = 0;
    video.muted = isMuted;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Fallback if browser requires muted autoplay
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });
    }
  }, [currentIndex, isOpen]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
    setCurrentTime(formatTime(video.currentTime));
    setDurationTime(formatTime(video.duration));
  };

  const goToNext = useCallback(() => {
    if (currentIndex < activeList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowCommentDrawer(false);
      setExpandedCaption(false);
    } else {
      // Loop back to first video
      setCurrentIndex(0);
      setShowCommentDrawer(false);
    }
  }, [currentIndex, activeList.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowCommentDrawer(false);
      setExpandedCaption(false);
    }
  }, [currentIndex]);

  // Keyboard navigation (ArrowUp, ArrowDown, Space, Escape)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === ' ' && !showCommentDrawer) {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToNext, goToPrev, showCommentDrawer]);

  if (!isOpen || !currentPost) return null;

  // Single / Double tap handler
  const handleVideoTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 320;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // DOUBLE TAP DETECTED -> Trigger Heart Animation & Like
      const rect = e.currentTarget.getBoundingClientRect();
      setHeartAnimPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 900);

      // Trigger love/like reaction
      onToggleReaction(currentPost.id, 'love');
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      // Delay single tap to differentiate from double tap
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
    setTimeout(() => setShowPlayPauseAnim(false), 800);

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  // Mobile Swipe Up / Down
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    const SWIPE_THRESHOLD = 50;

    if (diff > SWIPE_THRESHOLD) {
      // Swiped Up -> Next Reel
      goToNext();
    } else if (diff < -SWIPE_THRESHOLD) {
      // Swiped Down -> Previous Reel
      goToPrev();
    }
    touchStartY.current = null;
  };

  // Comment submission
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(currentPost.id, commentInput.trim());
    setCommentInput('');
  };

  // Copy link / share
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1800);
  };

  const isLiked =
    currentPost.userReaction === 'like' ||
    currentPost.userReaction === 'love' ||
    currentPost.reactions.total > 0;

  const isSaved = currentPost.isSaved || false;
  const isAuthorFollowed = Boolean(followedAuthors[currentPost.author.name]);

  const toggleFollow = (authorName: string) => {
    setFollowedAuthors((prev) => ({
      ...prev,
      [authorName]: !prev[authorName],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden font-sans">
      
      {/* Background blurred ambient lighting */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 scale-110 pointer-events-none"
        style={{
          backgroundImage: `url(${currentPost.author.avatar})`,
        }}
      />

      {/* Main TikTok / Reels Phone Frame Container */}
      <div
        className="relative w-full h-full sm:max-w-[440px] sm:h-[94vh] sm:rounded-3xl sm:border sm:border-white/10 sm:shadow-2xl overflow-hidden bg-black flex flex-col justify-between"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ========================================================= */}
        {/* TOP OVERLAY HEADER BAR */}
        {/* ========================================================= */}
        <div className="absolute top-0 inset-x-0 z-30 px-3.5 pt-3.5 pb-8 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between pointer-events-auto">
          {/* Back Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/15 transition-all active:scale-95 cursor-pointer shadow-lg"
            title="ফিডে ফিরে যান (Back to feed)"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            <span className="text-xs font-bold pr-1">ফিডে ফিরুন</span>
          </button>

          {/* Center Title Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white shadow-xs">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span className="text-xs font-extrabold tracking-wide uppercase">
              Reels
            </span>
            <span className="text-[10px] text-sky-400 font-bold ml-0.5">
              {currentIndex + 1}/{activeList.length}
            </span>
          </div>

          {/* Close X Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/15 transition-all active:scale-95 cursor-pointer shadow-lg"
            title="বন্ধ করুন (Close)"
          >
            <X className="w-5 h-5" />
          </button>
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
            src={currentPost.mediaUrl}
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

          {/* Center Play / Pause Animated Icon */}
          {showPlayPauseAnim && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 z-20">
              <div className="w-20 h-20 rounded-full bg-black/70 backdrop-blur-lg flex items-center justify-center text-white shadow-2xl animate-in zoom-in-75 duration-150">
                {isPlaying ? (
                  <Pause className="w-10 h-10 fill-white" />
                ) : (
                  <Play className="w-10 h-10 fill-white translate-x-1" />
                )}
              </div>
            </div>
          )}

          {/* Floating Center Play Button when video is paused */}
          {!isPlaying && !showPlayPauseAnim && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25 z-10">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl">
                <Play className="w-8 h-8 fill-white translate-x-0.5" />
              </div>
            </div>
          )}

          {/* Double Tap TikTok Heart Animation */}
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
        {/* RIGHT FLOATING ACTION COLUMN (CLASSIC TIKTOK / REELS) */}
        {/* ========================================================= */}
        {/* ========================================================= */}
        {/* RIGHT FLOATING ACTION COLUMN (COMPACT & BALANCED) */}
        {/* ========================================================= */}
        <div className="absolute right-2 sm:right-3.5 bottom-4 sm:bottom-8 z-30 flex flex-col items-center gap-1.5 sm:gap-2 text-white pointer-events-auto select-none max-h-[72vh] justify-end">
          {/* 1. Like Button (Heart) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleReaction(currentPost.id, isLiked ? 'like' : 'love');
            }}
            className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border shadow-lg transition-colors ${
                isLiked
                  ? 'bg-rose-600/90 text-white border-rose-400 shadow-rose-600/40'
                  : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-all ${
                  isLiked ? 'fill-white stroke-white scale-110' : 'fill-none stroke-white'
                }`}
              />
            </div>
            <span className="text-[10px] font-bold drop-shadow">
              {currentPost.reactions.total || 1}
            </span>
          </button>

          {/* 1.5. Golden Hadia / Gift Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenGiftModal?.(currentPost);
            }}
            className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform cursor-pointer"
            title="গোল্ডেন হাদিয়া পাঠান (Gift Gold)"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-500/40 border border-yellow-200">
              <Gift className="w-4.5 h-4.5 stroke-[2.4]" />
            </div>
            <span className="text-[10px] font-black text-amber-300 drop-shadow">
              {currentPost.goldenGiftsCount ? `🪙 ${currentPost.goldenGiftsCount}` : 'হাদিয়া'}
            </span>
          </button>

          {/* 2. Comment Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCommentDrawer(!showCommentDrawer);
            }}
            className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition-colors">
              <MessageCircle className="w-5 h-5 fill-white/15 stroke-white" />
            </div>
            <span className="text-[10px] font-bold drop-shadow">
              {currentPost.comments.length || 0}
            </span>
          </button>

          {/* 3. Share Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition-colors">
              {isCopied ? (
                <Check className="w-4.5 h-4.5 text-emerald-400 stroke-[3]" />
              ) : (
                <Share2 className="w-4.5 h-4.5 stroke-[2.2]" />
              )}
            </div>
            <span className="text-[10px] font-bold drop-shadow">
              {isCopied ? 'কপি!' : currentPost.sharesCount || 'শেয়ার'}
            </span>
          </button>

          {/* 4. Bookmark / Save Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(currentPost.id);
            }}
            className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border shadow-lg transition-colors ${
                isSaved
                  ? 'bg-amber-500/90 text-white border-amber-300'
                  : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
              }`}
            >
              <Bookmark
                className={`w-4.5 h-4.5 ${isSaved ? 'fill-white' : 'fill-none'}`}
              />
            </div>
            <span className="text-[10px] font-bold drop-shadow">
              {isSaved ? 'সংরক্ষিত' : 'সেভ'}
            </span>
          </button>

          {/* 5. Sound Mute Toggle Button */}
          <button
            onClick={toggleMute}
            className="w-8.5 h-8.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer"
            title={isMuted ? 'আনমিউট করুন' : 'মিউট করুন'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-sky-400" />
            )}
          </button>

          {/* 6. Up / Down Navigation Controls (Compact Horizontal Pair) */}
          <div className="flex items-center gap-1 pt-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              disabled={currentIndex === 0}
              className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 disabled:opacity-25 text-white backdrop-blur-md border border-white/20 shadow-sm flex items-center justify-center active:scale-90 transition-all cursor-pointer"
              title="পূর্ববর্তী রিলস"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-sm flex items-center justify-center active:scale-90 transition-all cursor-pointer"
              title="পরবর্তী রিলস"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM METADATA & AUTHOR INFO OVERLAY */}
        {/* ========================================================= */}
        <div className="absolute bottom-0 inset-x-0 z-20 pb-3 pt-14 px-3.5 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-auto pr-16 sm:pr-20">
          {/* Author Avatar, Name + Follow Pill */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/60 shadow-md bg-neutral-800 shrink-0">
              <img
                src={currentPost.author.avatar}
                alt={currentPost.author.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-extrabold text-sm text-white drop-shadow flex items-center gap-1.5">
              <span>{currentPost.author.name}</span>
              {currentPost.author.verified && (
                <ShieldCheck className="w-4 h-4 text-sky-400 fill-sky-400/20" />
              )}
            </span>

            <button
              onClick={() => toggleFollow(currentPost.author.name)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-xs cursor-pointer ${
                isAuthorFollowed
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-[#1877F2] text-white hover:bg-blue-600'
              }`}
            >
              {isAuthorFollowed ? 'অনুসরণ করছেন ✓' : '+ অনুসরণ করুন'}
            </button>
          </div>

          {/* Post Caption with "more" expander */}
          <div className="text-xs text-white/95 leading-relaxed drop-shadow mb-2">
            <p className={expandedCaption ? 'whitespace-pre-line' : 'line-clamp-2'}>
              {currentPost.contentBangla}
            </p>
            {currentPost.contentBangla.length > 80 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedCaption(!expandedCaption);
                }}
                className="text-sky-300 font-bold hover:underline ml-1"
              >
                {expandedCaption ? 'সংক্ষেপ করুন' : '...আরও দেখুন'}
              </button>
            )}
          </div>

          {/* Quranic Verse / Arabic Pill if present */}
          {currentPost.arabicVerse && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs font-semibold mb-2 shadow-xs backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-serif">{currentPost.arabicVerse}</span>
            </div>
          )}

          {/* Halal Audio Marquee Track */}
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <Music className="w-3.5 h-3.5 text-sky-400 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="truncate">
              {currentPost.author.name} • Original Audio (Halal Sound)
            </span>
            <span className="text-[10px] text-slate-400 shrink-0 font-mono">
              {currentTime} / {durationTime}
            </span>
          </div>

          {/* Slim Bottom Timeline Scrub Bar */}
          <div className="mt-2.5 w-full bg-white/25 h-1 rounded-full overflow-hidden">
            <div
              className="bg-[#1877F2] h-full transition-all duration-100 rounded-full shadow-[0_0_8px_rgba(24,119,242,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE COMMENT DRAWER (SLIDES UP FROM BOTTOM) */}
        {/* ========================================================= */}
        {showCommentDrawer && (
          <div
            className="absolute inset-x-0 bottom-0 z-40 bg-[#1c1e21] rounded-t-3xl border-t border-white/15 max-h-[65%] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">মন্তব্যসমূহ</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[11px] font-bold text-slate-300">
                  {currentPost.comments.length}
                </span>
              </div>
              <button
                onClick={() => setShowCommentDrawer(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {currentPost.comments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <p>এখনো কোনো মন্তব্য নেই।</p>
                  <p className="text-[11px] text-slate-500 mt-1">প্রথম মন্তব্যটি আপনিই করুন!</p>
                </div>
              ) : (
                currentPost.comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5 items-start">
                    <img
                      src={c.avatar}
                      alt={c.author}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
                    />
                    <div className="flex-1 min-w-0 bg-[#2d3035] rounded-2xl p-2.5 text-xs text-white">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-white text-xs">{c.author}</span>
                        <span className="text-[10px] text-slate-400">{c.timeAgo}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed break-words">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input Bar */}
            <form
              onSubmit={handleCommentSubmit}
              className="p-3 border-t border-white/10 bg-[#18191a] flex items-center gap-2"
            >
              {currentUserAvatar && (
                <img
                  src={currentUserAvatar}
                  alt={currentUserName}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/15"
                />
              )}
              <input
                type="text"
                placeholder="একটি সুন্দর মন্তব্য লিখুন..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 bg-[#242526] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#1877F2] transition-colors"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="p-2 rounded-full bg-[#1877F2] hover:bg-blue-600 disabled:opacity-40 text-white transition-all cursor-pointer shrink-0 shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
