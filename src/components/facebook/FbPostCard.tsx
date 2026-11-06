import React, { useState, useRef } from 'react';
import { PostItem, ReactionType } from '../../types';
import {
  MoreHorizontal,
  X,
  ThumbsUp,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Copy,
  Check,
  Send,
  BookOpen,
  Globe,
  Edit3,
  Trash2,
  Lock,
  Users,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { submitRealtimeAppeal, toggleFollowUser, subscribeToFollowStatus } from '../../lib/firebase';
import { FbVideoPlayer } from './FbVideoPlayer';

interface FbPostCardProps {
  post: PostItem;
  onToggleReaction: (postId: string, reaction: ReactionType) => void;
  onToggleSave: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onEditPost?: (postId: string, newContent: string, newArabic?: string, newTranslation?: string) => void;
  onDeletePost?: (postId: string) => void;
  onOpenProfile?: (authorName?: string) => void;
  onTypingChange?: (postId: string, isTyping: boolean) => void;
  currentUserId?: string;
  currentUserName?: string;
}

export const FbPostCard: React.FC<FbPostCardProps> = ({
  post,
  onToggleReaction,
  onToggleSave,
  onAddComment,
  onEditPost,
  onDeletePost,
  onOpenProfile,
  onTypingChange,
  currentUserId = 'user-me',
  currentUserName = 'User',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.contentBangla);
  const [editArabic, setEditArabic] = useState(post.arabicVerse || '');
  const [editTranslation, setEditTranslation] = useState(post.translation || '');
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Appeal modal state for blocked posts
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [appealSubmitted, setAppealSubmitted] = useState(false);

  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);

  // Sync follow status
  React.useEffect(() => {
    const authorTargetId = post.authorId || `author-${post.author.name}`;
    if (!currentUserId || authorTargetId === currentUserId) return;
    const unsub = subscribeToFollowStatus(currentUserId, authorTargetId, (following) => {
      setIsFollowingAuthor(following);
    });
    return () => unsub();
  }, [currentUserId, post.authorId, post.author.name]);

  const handleToggleFollowAuthor = async () => {
    const authorTargetId = post.authorId || `author-${post.author.name}`;
    setIsFollowingAuthor(!isFollowingAuthor);
    await toggleFollowUser(
      currentUserId,
      currentUserName,
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80',
      authorTargetId,
      post.author.name,
      post.author.avatar
    );
  };

  const typingTimeoutRef = useRef<any>(null);

  const handleCommentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentInput(e.target.value);
    if (onTypingChange) {
      onTypingChange(post.id, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTypingChange(post.id, false);
      }, 1800);
    }
  };

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealReason.trim()) return;
    setIsSubmittingAppeal(true);
    await submitRealtimeAppeal(post.id, currentUserId, currentUserName, appealReason.trim());
    setIsSubmittingAppeal(false);
    setAppealSubmitted(true);
    setTimeout(() => {
      setShowAppealModal(false);
    }, 2000);
  };

  if (hidden) return null;

  // BLOCK GUARD: If post violates guidelines, render blocked state with appeal option
  if (post.status === 'blocked') {
    return (
      <article className="bg-[#242526] border border-amber-900/60 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>This post violates Peaceverse guidelines</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
            ব্লক করা হয়েছে
          </span>
        </div>

        <p className="text-xs text-[#b0b3b8] leading-relaxed">
          {post.moderationReason ||
            'পোস্টটি Peaceverse ইসলামিক সোশ্যাল নেটওয়ার্কের শালীনতা ও গাইডলাইন লঙ্ঘনের কারণে প্রদর্শন স্থগিত রয়েছে।'}
        </p>

        {post.appealStatus === 'pending' || appealSubmitted ? (
          <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-400" />
            <span>আপনার আপিলটি সফলভাবে গৃহীত হয়েছে এবং অ্যাডমিন প্যানেলে পর্যালোচনাধীন রয়েছে।</span>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setShowAppealModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-colors"
            >
              আপিল করুন (Appeal)
            </button>
            <span className="text-[11px] text-[#8a8d91]">আইডি: {post.id}</span>
          </div>
        )}

        {/* Appeal Modal */}
        {showAppealModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#242526] border border-[#393a3b] rounded-2xl p-4 w-full max-w-md space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-[#393a3b] pb-2">
                <h3 className="font-bold text-white text-sm">পোস্ট আনব্লক করার আপিল</h3>
                <button onClick={() => setShowAppealModal(false)} className="p-1 text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {appealSubmitted ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-white">আপিল সফলভাবে জমা হয়েছে</p>
                  <p className="text-xs text-[#b0b3b8]">অ্যাডমিন টিম দ্রুত এটি রিভিউ করে সিদ্ধান্ত জানাবে।</p>
                </div>
              ) : (
                <form onSubmit={handleAppealSubmit} className="space-y-3">
                  <p className="text-xs text-[#b0b3b8]">
                    আপনার পোস্টটি কেন ভুলবশত ব্লক হয়েছে বলে মনে করেন তা সংক্ষেপে লিখুন:
                  </p>
                  <textarea
                    rows={3}
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="আপনার আপিলের বিবরণ লিখুন..."
                    className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl p-3 text-xs text-white outline-none focus:border-[#1877F2] resize-none"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAppealModal(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#b0b3b8] hover:bg-[#3a3b3c]"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAppeal || !appealReason.trim()}
                      className="px-4 py-1.5 rounded-lg bg-[#1877F2] text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      {isSubmittingAppeal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>আপিল জমা দিন</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </article>
    );
  }

  const handleCopyAyah = () => {
    if (post.arabicVerse) {
      navigator.clipboard.writeText(
        `${post.arabicVerse}\n\n${post.translation || ''}\n\n— ${post.reference || ''} via Qalby`
      );
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.author.name,
        text: `${post.contentBangla} — Qalby`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${post.contentBangla}\n\n— ${post.author.name} via Qalby`);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
    setMenuOpen(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(post.id, commentInput.trim());
    setCommentInput('');
  };

  const addQuickPraise = (phrase: string) => {
    setCommentInput((prev) => (prev ? `${prev} ${phrase}` : phrase));
  };

  const getReactionDisplay = () => {
    switch (post.userReaction) {
      case 'love':
        return { text: 'Love', color: 'text-[#fa3e3e]', icon: <Heart className="w-4 h-4 fill-current text-[#fa3e3e]" /> };
      case 'subhanallah':
        return { text: 'SubhanAllah', color: 'text-emerald-400', icon: <span className="text-sm">🤲</span> };
      case 'mashaallah':
        return { text: 'MashaAllah', color: 'text-teal-400', icon: <span className="text-sm">🌸</span> };
      case 'care':
        return { text: 'Care', color: 'text-amber-400', icon: <span className="text-sm">🤍</span> };
      case 'like':
        return { text: 'Like', color: 'text-[#1877F2]', icon: <ThumbsUp className="w-4 h-4 fill-current text-[#1877F2]" /> };
      default:
        return { text: 'Like', color: 'text-[#b0b3b8]', icon: <ThumbsUp className="w-4 h-4" /> };
    }
  };

  const reactionInfo = getReactionDisplay();

  return (
    <article className="bg-[#1C1C1D] border border-[#222222] rounded-[10px] shadow-sm overflow-hidden space-y-2.5 transition-all">
      {copiedToast && (
        <div className="mx-3 mt-2 py-1.5 px-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>✓ পোস্ট লিঙ্ক ও তথ্য কপি করা হয়েছে!</span>
        </div>
      )}
      {/* 1. Post Header with ••• and ✕ matching Screenshot 1 */}
      <div className="flex items-center justify-between px-3 sm:px-4 pt-3">
        <div
          onClick={() => onOpenProfile?.(post.author.name)}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          title={`${post.author.name} এর প্রোফাইল দেখুন`}
        >
          <div className="relative">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover border border-[#393a3b] group-hover:ring-2 group-hover:ring-[#1877F2] transition-all"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 leading-snug">
              <span className="font-bold text-sm text-white group-hover:underline">
                {post.author.name}
              </span>
              {post.author.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1877F2] flex-shrink-0" />
              )}
              {post.author.name !== currentUserName && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFollowAuthor();
                  }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ml-1 shadow-sm ${
                    isFollowingAuthor
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-300'
                      : 'bg-[#1877F2]/20 hover:bg-[#1877F2] text-[#2e89ff] hover:text-white border border-[#1877F2]/40'
                  }`}
                  title={isFollowingAuthor ? 'Unfollow this creator' : 'Follow this creator'}
                >
                  {isFollowingAuthor ? '✓ Following' : '+ Follow'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#b0b3b8]">
              {post.author.subtitle && (
                <span>{post.author.subtitle}</span>
              )}
              {!post.author.subtitle && (
                <>
                  <span>{post.timeAgo}</span>
                  <span>•</span>
                  {post.privacy === 'private' ? (
                    <span title="Only Me" className="flex items-center gap-1 text-amber-400 font-medium">
                      <Lock className="w-3 h-3" />
                      <span className="text-[11px]">Only Me</span>
                    </span>
                  ) : post.privacy === 'friends' ? (
                    <span title="Friends" className="flex items-center gap-1 text-emerald-400 font-medium">
                      <Users className="w-3 h-3" />
                      <span className="text-[11px]">Friends</span>
                    </span>
                  ) : (
                    <span title="Public" className="flex items-center gap-1 text-[#b0b3b8]">
                      <Globe className="w-3 h-3" />
                      <span className="text-[11px]">Public</span>
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Top Right: ••• and ✕ buttons matching Screenshot 1 */}
        <div className="flex items-center gap-1 text-[#b0b3b8]">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-full hover:bg-[#3a3b3c] hover:text-white transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setHidden(true)}
            className="p-1 rounded-full hover:bg-[#3a3b3c] hover:text-white transition-colors"
            title="Hide post"
          >
            <X className="w-5 h-5" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-4 top-10 z-40 w-52 py-1.5 bg-[#242526] border border-[#393a3b] rounded-xl shadow-2xl text-xs text-[#e4e6eb] animate-in fade-in zoom-in-95">
                
                {/* Edit Post */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setIsEditing(true);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-[#3a3b3c] flex items-center gap-2.5 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-blue-400" />
                  <span>Edit post (পোস্ট এডিট করুন)</span>
                </button>

                {/* Save post */}
                <button
                  onClick={() => {
                    onToggleSave(post.id);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-[#3a3b3c] flex items-center gap-2.5 transition-colors"
                >
                  {post.isSaved ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                      <span>সংরক্ষিত তালিকা থেকে মুছুন</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 text-[#b0b3b8]" />
                      <span>Save post (সংরক্ষণ করুন)</span>
                    </>
                  )}
                </button>

                {/* Copy post text */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(post.contentBangla);
                    setCopiedToast(true);
                    setTimeout(() => setCopiedToast(false), 2000);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-[#3a3b3c] flex items-center gap-2.5 transition-colors"
                >
                  <Copy className="w-4 h-4 text-[#b0b3b8]" />
                  <span>Copy text (লেখা কপি করুন)</span>
                </button>

                {/* Share link */}
                <button
                  onClick={handleShare}
                  className="w-full px-3 py-2 text-left hover:bg-[#3a3b3c] flex items-center gap-2.5 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-[#b0b3b8]" />
                  <span>Share (শেয়ার করুন)</span>
                </button>

                {/* Delete / Hide */}
                <div className="border-t border-[#393a3b] my-1" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (onDeletePost) {
                      onDeletePost(post.id);
                    } else {
                      setHidden(true);
                    }
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-red-950/60 text-red-400 flex items-center gap-2.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>Delete post (পোস্টটি মুছুন)</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Post Content Text (or Colorful background text if set) */}
      {post.bgGradient ? (
        <div className={`${post.bgGradient} p-8 min-h-[180px] flex items-center justify-center text-center`}>
          <p className="text-xl sm:text-2xl font-bold text-white font-bengali leading-relaxed drop-shadow">
            {post.contentBangla}
          </p>
        </div>
      ) : (
        <div className="px-3 sm:px-4 text-sm text-[#e4e6eb] font-bengali leading-relaxed whitespace-pre-line">
          <p>{post.contentBangla}</p>
        </div>
      )}

      {/* 3. Highlighted Arabic Verse Box if any */}
      {post.arabicVerse && (
        <div className="mx-3 sm:mx-4 p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-[#18191a] to-black border border-emerald-500/30">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{post.reference || 'পবিত্র আয়াত'}</span>
            </span>
            <button
              onClick={handleCopyAyah}
              className="px-2 py-0.5 rounded bg-[#3a3b3c] text-[10px] text-[#e4e6eb] hover:bg-[#4e4f50]"
            >
              {copiedToast ? 'কপি হয়েছে ✓' : 'কপি আয়াত'}
            </button>
          </div>
          <p className="text-base sm:text-lg font-arabic text-right text-emerald-100 leading-loose py-1">
            {post.arabicVerse}
          </p>
          {post.translation && (
            <p className="text-xs text-[#b0b3b8] mt-1 font-bengali border-t border-[#393a3b] pt-1">
              {post.translation}
            </p>
          )}
        </div>
      )}

      {/* 4. Media Section (Image or Video) */}
      {post.mediaType === 'image' && post.mediaUrl && (
        <div className="w-full bg-black max-h-[500px] overflow-hidden">
          <img
            src={post.mediaUrl}
            alt="media"
            className="w-full h-auto object-cover max-h-[500px]"
          />
        </div>
      )}

      {/* Video: YouTube Embed */}
      {post.youtubeId && (
        <div className="relative aspect-video w-full bg-black border-y border-[#393a3b]">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${post.youtubeId}?rel=0&modestbranding=1`}
            title={post.contentBangla}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Video: Direct Uploaded Video Player with Viewport Autoplay/Pause (Facebook style) */}
      {!post.youtubeId &&
        (post.mediaType === 'video' ||
          Boolean(post.mediaUrl && post.mediaUrl.match(/\.(mp4|webm|mov|ogg|m4v)($|\?)/i))) &&
        post.mediaUrl && (
          <FbVideoPlayer
            src={post.mediaUrl}
            title={post.contentBangla}
          />
        )}

      {/* 5. Reactions Summary Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-1 text-xs text-[#b0b3b8] border-b border-[#393a3b]/60">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center -space-x-1">
            <span className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center text-[10px] text-white shadow">
              👍
            </span>
            <span className="w-5 h-5 rounded-full bg-[#fa3e3e] flex items-center justify-center text-[10px] text-white shadow">
              ❤️
            </span>
          </div>
          <span className="font-medium hover:underline cursor-pointer">
            {post.reactions.total.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:underline cursor-pointer"
          >
            {post.comments.length} comments
          </button>
          <span>•</span>
          <button onClick={handleShare} className="hover:underline cursor-pointer">
            {post.sharesCount} shares
          </button>
        </div>
      </div>

      {/* 6. Facebook 3 Primary Action Buttons: Like, Comment, Share */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-0.5 text-xs font-semibold relative">
        {/* Like */}
        <div
          className="relative flex-1"
          onMouseEnter={() => setShowReactionsMenu(true)}
          onMouseLeave={() => setShowReactionsMenu(false)}
        >
          {showReactionsMenu && (
            <div className="absolute -top-11 left-0 z-40 bg-[#242526] border border-[#393a3b] rounded-full px-2 py-1 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <button
                onClick={() => {
                  onToggleReaction(post.id, 'like');
                  setShowReactionsMenu(false);
                }}
                className="hover:scale-125 transition-transform text-lg"
              >
                👍
              </button>
              <button
                onClick={() => {
                  onToggleReaction(post.id, 'love');
                  setShowReactionsMenu(false);
                }}
                className="hover:scale-125 transition-transform text-lg"
              >
                ❤️
              </button>
              <button
                onClick={() => {
                  onToggleReaction(post.id, 'subhanallah');
                  setShowReactionsMenu(false);
                }}
                className="hover:scale-125 transition-transform text-lg"
              >
                🤲
              </button>
              <button
                onClick={() => {
                  onToggleReaction(post.id, 'mashaallah');
                  setShowReactionsMenu(false);
                }}
                className="hover:scale-125 transition-transform text-lg"
              >
                🌸
              </button>
            </div>
          )}

          <button
            onClick={() => onToggleReaction(post.id, post.userReaction ? 'like' : 'like')}
            className={`w-full py-2 rounded-lg hover:bg-[#3a3b3c] flex items-center justify-center gap-1.5 transition-colors ${reactionInfo.color}`}
          >
            {reactionInfo.icon}
            <span>{reactionInfo.text}</span>
          </button>
        </div>

        {/* Comment */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 py-2 rounded-lg hover:bg-[#3a3b3c] flex items-center justify-center gap-1.5 text-[#b0b3b8] hover:text-white transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex-1 py-2 rounded-lg hover:bg-[#3a3b3c] flex items-center justify-center gap-1.5 text-[#b0b3b8] hover:text-white transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* 7. Comments Drawer */}
      {showComments && (
        <div className="px-3 sm:px-4 pb-3 space-y-2.5 border-t border-[#393a3b]/60 pt-2 animate-in fade-in">
          {/* Quick Islamic Reactions */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {['আমিন 🤲', 'মাশাআল্লাহ ❤️', 'সুবহানাল্লাহ 🌸', 'আলহামদুলিল্লাহ ✨'].map((r) => (
              <button
                key={r}
                onClick={() => addQuickPraise(r)}
                className="px-2.5 py-0.5 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] text-[11px] flex-shrink-0"
              >
                {r}
              </button>
            ))}
          </div>

          {/* Add comment input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentInput}
              onChange={handleCommentInputChange}
              className="flex-1 bg-[#3a3b3c] rounded-full px-4 py-2 text-xs text-[#e4e6eb] placeholder-[#b0b3b8] focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="p-2 rounded-full bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-30 text-white transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Realtime Typing Indicator */}
          {post.typingUsers && post.typingUsers.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#1877F2] animate-pulse px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] animate-ping" />
              <span>{post.typingUsers.map((u) => u.name).join(', ')} লিখছেন... (typing)</span>
            </div>
          )}

          {/* Existing comments */}
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-2 text-xs pt-1">
              <img
                src={c.avatar}
                alt={c.author}
                className="w-7 h-7 rounded-full object-cover mt-0.5"
              />
              <div className="bg-[#3a3b3c] px-3 py-2 rounded-2xl max-w-[90%]">
                <p className="font-bold text-white text-[11px]">{c.author}</p>
                <p className="text-[#e4e6eb] text-xs font-bengali">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 8. Edit Post Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#242526] w-full max-w-lg rounded-2xl border border-[#393a3b] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#393a3b]">
              <h3 className="font-bold text-white text-sm">Edit post</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-[#3a3b3c]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto no-scrollbar">
              <div className="flex items-center gap-2.5">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-white text-xs">{post.author.name}</p>
                  <span className="text-[10px] text-[#b0b3b8]">Public • 🌐</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#b0b3b8]">পোস্টের মূল লেখা:</label>
                <textarea
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-[#18191a] border border-[#393a3b] focus:border-[#1877F2] rounded-xl p-3 text-sm text-[#e4e6eb] outline-none resize-none font-bengali"
                  placeholder="মনের কথা বা দ্বীনি উপদেশ..."
                />
              </div>

              {post.arabicVerse && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-emerald-400">আরবি আয়াত / হাদিস:</label>
                  <textarea
                    rows={2}
                    value={editArabic}
                    onChange={(e) => setEditArabic(e.target.value)}
                    className="w-full bg-[#18191a] border border-[#393a3b] focus:border-emerald-500 rounded-xl p-2.5 text-right font-arabic text-sm text-emerald-100 outline-none"
                  />
                  <input
                    type="text"
                    value={editTranslation}
                    onChange={(e) => setEditTranslation(e.target.value)}
                    placeholder="বাংলা অনুবাদ..."
                    className="w-full bg-[#18191a] border border-[#393a3b] focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-[#e4e6eb] outline-none"
                  />
                </div>
              )}
            </div>

            <div className="p-3 bg-[#18191a] border-t border-[#393a3b] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#b0b3b8] hover:bg-[#3a3b3c]"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  if (onEditPost) {
                    onEditPost(post.id, editContent, editArabic, editTranslation);
                  } else {
                    post.contentBangla = editContent;
                    if (editArabic) post.arabicVerse = editArabic;
                    if (editTranslation) post.translation = editTranslation;
                  }
                  setIsEditing(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-sm"
              >
                Save (সংরক্ষণ)
              </button>
            </div>
          </div>
        </div>
      )}

    </article>
  );
};
