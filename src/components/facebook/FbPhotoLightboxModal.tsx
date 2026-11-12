import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  X,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Download,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ShieldCheck,
  Send,
  Gift,
  ThumbsUp,
  Globe,
  Check,
  BookOpen,
} from 'lucide-react';
import { PostItem, ReactionType } from '../../types';

interface FbPhotoLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostItem;
  photoUrl?: string;
  onToggleReaction: (postId: string, reaction: ReactionType) => void;
  onAddComment: (postId: string, text: string) => void;
  onToggleSave?: (postId: string) => void;
  onOpenGiftModal?: (post: PostItem) => void;
  currentUserName?: string;
  currentUserAvatar?: string;
}

export const FbPhotoLightboxModal: React.FC<FbPhotoLightboxModalProps> = ({
  isOpen,
  onClose,
  post,
  photoUrl,
  onToggleReaction,
  onAddComment,
  onToggleSave,
  onOpenGiftModal,
  currentUserName = 'You',
  currentUserAvatar,
}) => {
  const [zoomLevel, setZoomLevel] = useState<1 | 1.5 | 2>(1);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedCaption, setExpandedCaption] = useState(false);

  const displayPhoto = photoUrl || post.mediaUrl;

  // Lock body scroll while open & attach Esc key listener
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !displayPhoto) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleZoomToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    try {
      const link = document.createElement('a');
      link.href = displayPhoto;
      link.download = `peaceverse-photo-${post.id}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('ছবি ডাউনলোড শুরু হয়েছে...');
    } catch {
      showToast('ছবি সংরক্ষণ করা হয়েছে');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (navigator.share) {
      navigator
        .share({
          title: post.author.name,
          text: post.contentBangla || 'Peaceverse Photo',
          url: displayPhoto,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(displayPhoto);
      showToast('ছবির লিংক কপি করা হয়েছে!');
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(post.id, commentInput.trim());
    setCommentInput('');
    showToast('মন্তব্য যুক্ত করা হয়েছে!');
  };

  const isLiked = Boolean(post.userReaction);

  return (
    <div
      className="fixed inset-0 z-[120] bg-black text-white flex flex-col justify-between select-none animate-in fade-in duration-200 overflow-hidden font-sans"
    >
      {/* ========================================================= */}
      {/* 1. TOP HEADER (Dedicated bar so photo never goes behind buttons) */}
      {/* ========================================================= */}
      {showOverlays && (
        <div
          className="relative z-30 shrink-0 h-14 sm:h-16 px-3 sm:px-4 bg-black/95 sm:bg-black border-b border-white/10 flex items-center justify-between transition-opacity duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left: Back / Close button & Author Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              title="ফিরে যান (Back)"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <img
                src={
                  post.author.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                }
                alt={post.author.name}
                className="w-9 h-9 rounded-full object-cover border border-white/30 shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
                }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white truncate drop-shadow">
                    {post.author.name}
                  </span>
                  {post.author.verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1877F2] fill-[#1877F2]/20 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                  <span>{post.timeAgo || 'কিছুক্ষণ আগে'}</span>
                  <span>•</span>
                  <Globe className="w-3 h-3 text-white/60" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Zoom, Share, More Options, Close */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Zoom Toggle */}
            <button
              onClick={handleZoomToggle}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              title={zoomLevel > 1 ? 'আসল সাইজ' : 'বড় করে দেখুন (Zoom)'}
            >
              {zoomLevel > 1 ? (
                <ZoomOut className="w-5 h-5" />
              ) : (
                <ZoomIn className="w-5 h-5" />
              )}
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              title="ছবি ডাউনলোড করুন"
            >
              <Download className="w-5 h-5" />
            </button>

            {/* Three Dots Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                title="আরও অপশন"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-11 z-50 w-48 bg-[#242526] rounded-2xl border border-[#393a3b] shadow-2xl py-1 text-xs font-semibold overflow-hidden animate-in fade-in zoom-in-95">
                  <button
                    onClick={handleDownload}
                    className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-[#3a3b3c] text-left text-white transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-sky-400" />
                    <span>ছবি ফোনে সংরক্ষণ করুন</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-[#3a3b3c] text-left text-white transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <span>শেয়ার করুন</span>
                  </button>
                  {onToggleSave && (
                    <button
                      onClick={() => {
                        onToggleSave(post.id);
                        setShowMenu(false);
                        showToast(post.isSaved ? 'সেভ থেকে সরানো হয়েছে' : 'পোস্টটি সেভ করা হয়েছে');
                      }}
                      className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-[#3a3b3c] text-left text-white transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-amber-400" />
                      <span>{post.isSaved ? 'সেভ তালিকা থেকে মুছুন' : 'ফেসবুকে সেভ করুন'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Close X Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              title="বন্ধ করুন (Close)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CENTER IMAGE DISPLAY AREA (Vertically & horizontally centered) */}
      {/* ========================================================= */}
      <div
        className="flex-1 min-h-0 w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden relative cursor-pointer select-none"
        onClick={() => setShowOverlays(!showOverlays)}
      >
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setZoomLevel((prev) => (prev === 1 ? 2 : 1));
          }}
        >
          <img
            src={displayPhoto}
            alt={post.contentBangla || 'Fullscreen Photo'}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80';
            }}
            className="w-auto h-auto max-w-full max-h-full object-contain shadow-2xl select-none mx-auto my-auto"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. BOTTOM OVERLAY BAR (Caption, Reactions, Actions & Quick Comment) */}
      {/* ========================================================= */}
      {showOverlays && (
        <div
          className="relative z-30 shrink-0 bg-black/95 sm:bg-black/90 border-t border-white/10 pt-2.5 pb-3 px-3 sm:px-4 space-y-2 transition-opacity duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Post Caption / Text */}
          {post.contentBangla && (
            <div className="max-w-2xl text-xs sm:text-sm text-white/95 leading-relaxed drop-shadow max-h-20 overflow-y-auto">
              <p className={expandedCaption ? 'whitespace-pre-line' : 'line-clamp-2'}>
                {post.contentBangla}
              </p>
            {post.contentBangla.length > 90 && (
              <button
                onClick={() => setExpandedCaption(!expandedCaption)}
                className="text-sky-400 font-bold hover:underline mt-0.5 inline-block cursor-pointer"
              >
                {expandedCaption ? 'সংক্ষেপ করুন' : '...আরও দেখুন'}
              </button>
            )}
          </div>
        )}

        {/* Arabic Verse if present */}
        {post.arabicVerse && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold backdrop-blur-md">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-serif">{post.arabicVerse}</span>
          </div>
        )}

        {/* Reaction Stats Row (Thumbs/Heart Count + Comments Count) */}
        <div className="flex items-center justify-between text-xs text-white/75 border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] shadow-xs">
                👍
              </span>
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] shadow-xs">
                ❤️
              </span>
            </div>
            <span className="font-semibold text-white">
              {post.reactions?.total || 1}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>{post.comments?.length || 0}টি মন্তব্য</span>
            <span>•</span>
            <span>{post.sharesCount || 1}টি শেয়ার</span>
          </div>
        </div>

        {/* Facebook Interactive Action Row: Like, Comment, Gift, Share */}
        <div className="grid grid-cols-4 gap-1 pt-0.5">
          {/* Like Button */}
          <button
            onClick={() => onToggleReaction(post.id, isLiked ? 'like' : 'love')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              isLiked
                ? 'bg-blue-600/30 text-[#1877F2] border border-blue-500/40'
                : 'hover:bg-white/10 text-white/90'
            }`}
          >
            <ThumbsUp
              className={`w-4 h-4 ${isLiked ? 'fill-[#1877F2] stroke-[#1877F2]' : 'stroke-current'}`}
            />
            <span>{isLiked ? 'লাইকড' : 'লাইক'}</span>
          </button>

          {/* Comment Button (Toggles comment drawer) */}
          <button
            onClick={() => setShowCommentsDrawer(!showCommentsDrawer)}
            className="py-2 rounded-xl hover:bg-white/10 text-white/90 flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>মন্তব্য</span>
          </button>

          {/* Golden Hadia / Gift Button */}
          <button
            onClick={() => onOpenGiftModal?.(post)}
            className="py-2 rounded-xl hover:bg-white/10 text-amber-300 flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            title="গোল্ডেন কয়েন উপহার দিন"
          >
            <Gift className="w-4 h-4 text-amber-400 stroke-[2.2]" />
            <span>হাদিয়া</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="py-2 rounded-xl hover:bg-white/10 text-white/90 flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>শেয়ার</span>
          </button>
        </div>

        {/* Quick Comment Input Form directly inside Lightbox */}
        <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
          <div className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs font-bold shrink-0">
            SI
          </div>
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              placeholder="একটি মন্তব্য লিখুন..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="w-full bg-white/15 hover:bg-white/20 focus:bg-white/25 text-white placeholder-white/50 text-xs sm:text-sm rounded-full pl-3.5 pr-9 py-2 outline-none border border-white/20 focus:border-[#1877F2] transition-colors"
            />
            {commentInput.trim() && (
              <button
                type="submit"
                className="absolute right-2 p-1 text-[#1877F2] hover:text-white transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </form>

        {/* Expandable Comments Drawer if opened */}
        {showCommentsDrawer && (
          <div className="max-h-48 overflow-y-auto space-y-2 bg-[#18191a]/95 rounded-2xl p-3 border border-white/10 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="font-bold text-xs text-white">মন্তব্যসমূহ ({post.comments?.length || 0})</span>
              <button
                onClick={() => setShowCommentsDrawer(false)}
                className="text-white/60 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            {(!post.comments || post.comments.length === 0) ? (
              <p className="text-xs text-white/50 text-center py-2">
                এখনও কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনি করুন!
              </p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2 text-xs">
                  {comment.avatar ? (
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-neutral-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      {(comment.author || 'U')[0]}
                    </div>
                  )}
                  <div className="bg-white/10 rounded-xl px-2.5 py-1.5 flex-1">
                    <p className="font-bold text-white text-[11px]">{comment.author || 'ব্যবহারকারী'}</p>
                    <p className="text-white/90 text-xs mt-0.5">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#1877F2] text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/20 animate-in fade-in">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
