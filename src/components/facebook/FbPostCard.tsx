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
  Gift,
  Coins,
  Music,
  UserPlus,
} from 'lucide-react';
import {
  submitRealtimeAppeal,
  toggleFollowUser,
  subscribeToFollowStatus,
  isTargetFollowedLocally,
  isSameOwnerIdentity,
  getAuthorRelationshipKind,
  isFriendRequestSentLocally,
  toggleLocalFriendRequestAndSync,
} from '../../lib/firebase';
import { FbVideoPlayer } from './FbVideoPlayer';
import { FbPhotoLightboxModal } from './FbPhotoLightboxModal';
import { useLanguage } from '../../context/LanguageContext';
import { detectTextScript, shouldAutoTranslate, translateText } from '../../lib/translate';
import { signBunnyCdnUrl } from '../../lib/bunnyCdn';
import {
  FbBoostPostModal,
  getBoostedPostCampaign,
  BoostedCampaign,
} from './FbBoostPostModal';
import {
  FbCommentBottomSheet,
  readCommentLikesStore,
  toggleCommentLikeLocally,
} from './FbCommentBottomSheet';

interface HalalReactionMeta {
  type: ReactionType;
  emoji: string;
  label: string;
  textColor: string;
  bgTint: string;
}

const HALAL_REACTIONS: HalalReactionMeta[] = [
  { type: 'like', emoji: '🤲', label: 'Dua', textColor: 'text-[#1877F2]', bgTint: 'bg-[#1877F2]' },
  { type: 'love', emoji: '❤️', label: 'MashaAllah', textColor: 'text-[#FA3E3E]', bgTint: 'bg-[#FA3E3E]' },
  { type: 'subhanallah', emoji: '🕋', label: 'SubhanAllah', textColor: 'text-emerald-600', bgTint: 'bg-emerald-600' },
  { type: 'mashaallah', emoji: '🙏', label: 'Alhamdulillah', textColor: 'text-[#0866FF]', bgTint: 'bg-[#0866FF]' },
  { type: 'care', emoji: '🤝', label: 'InshaAllah', textColor: 'text-amber-500', bgTint: 'bg-amber-500' },
  { type: 'sad', emoji: '😢', label: 'Astagfirullah', textColor: 'text-[#65676B]', bgTint: 'bg-[#65676B]' },
];

interface FbPostCardProps {
  post: PostItem;
  onToggleReaction: (postId: string, reaction: ReactionType) => void;
  onToggleSave: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onEditPost?: (postId: string, newContent: string, newArabic?: string, newTranslation?: string) => void;
  onDeletePost?: (postId: string) => void;
  onOpenProfile?: (authorName?: string) => void;
  onTypingChange?: (postId: string, isTyping: boolean) => void;
  onOpenReel?: (post: PostItem) => void;
  onOpenGiftModal?: (post: PostItem) => void;
  onSharePost?: (postId: string) => void;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  showBoostControls?: boolean;
  onBoostPost?: (post: PostItem) => void;
  onSeeInsights?: (post: PostItem) => void;
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
  onOpenReel,
  onOpenGiftModal,
  onSharePost,
  currentUserId = 'user-me',
  currentUserName = 'User',
  currentUserAvatar,
  showBoostControls,
  onBoostPost,
  onSeeInsights,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.contentBangla);
  const [editArabic, setEditArabic] = useState(post.arabicVerse || '');
  const [editTranslation, setEditTranslation] = useState(post.translation || '');
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(null);
  const [flyingEmoji, setFlyingEmoji] = useState<{ id: number; emoji: string } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);
  const [showComments, setShowComments] = useState(() => (post.comments?.length || 0) > 0);
  const [showCommentSheet, setShowCommentSheet] = useState(false);
  const [commentLikesMap, setCommentLikesMap] = useState<Record<string, boolean>>(() =>
    readCommentLikesStore()
  );
  const [commentInput, setCommentInput] = useState('');
  const [isCommentExpanded, setIsCommentExpanded] = useState(false);
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [localShareDelta, setLocalShareDelta] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [showPhotoLightbox, setShowPhotoLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Appeal modal state for blocked posts
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [boostModalMode, setBoostModalMode] = useState<'boost' | 'insights' | null>(null);
  const [boostedCampaign, setBoostedCampaign] = useState<BoostedCampaign | null>(() =>
    getBoostedPostCampaign(post.id)
  );

  React.useEffect(() => {
    const syncBoost = () => {
      setBoostedCampaign(getBoostedPostCampaign(post.id));
    };
    syncBoost();
    window.addEventListener('peaceverse:boost-updated', syncBoost);
    window.addEventListener('storage', syncBoost);
    return () => {
      window.removeEventListener('peaceverse:boost-updated', syncBoost);
      window.removeEventListener('storage', syncBoost);
    };
  }, [post.id]);

  const { currentLang } = useLanguage();
  const authorTargetId = post.authorId || `author-${post.author.name}`;
  const [relSyncTick, setRelSyncTick] = useState(0);

  React.useEffect(() => {
    const syncRel = () => setRelSyncTick((t) => t + 1);
    const syncCommentLikes = () => setCommentLikesMap(readCommentLikesStore());
    window.addEventListener('peaceverse:friends-updated', syncRel);
    window.addEventListener('peaceverse:friend-requests-updated', syncRel);
    window.addEventListener('peaceverse:follows-updated', syncRel);
    window.addEventListener('peaceverse:comment-likes-updated', syncCommentLikes);
    window.addEventListener('storage', syncRel);
    return () => {
      window.removeEventListener('peaceverse:friends-updated', syncRel);
      window.removeEventListener('peaceverse:friend-requests-updated', syncRel);
      window.removeEventListener('peaceverse:follows-updated', syncRel);
      window.removeEventListener('peaceverse:comment-likes-updated', syncCommentLikes);
      window.removeEventListener('storage', syncRel);
    };
  }, []);

  const relationshipKind = React.useMemo(() => {
    void relSyncTick;
    return getAuthorRelationshipKind(post, currentUserId, currentUserName);
  }, [post, currentUserId, currentUserName, relSyncTick]);

  const isOwnAuthorPost =
    relationshipKind === 'self' ||
    isSameOwnerIdentity(post.authorId, post.author.name, currentUserId, currentUserName);

  const [isFollowingAuthor, setIsFollowingAuthor] = useState<boolean>(() =>
    relationshipKind === 'follow_only'
      ? isTargetFollowedLocally(authorTargetId, post.author.name)
      : false
  );
  const [isFriendReqSent, setIsFriendReqSent] = useState<boolean>(() =>
    relationshipKind === 'add_friend'
      ? isFriendRequestSentLocally(authorTargetId, post.author.name)
      : false
  );

  React.useEffect(() => {
    if (relationshipKind === 'add_friend') {
      setIsFriendReqSent(isFriendRequestSentLocally(authorTargetId, post.author.name));
    }
    if (relationshipKind === 'follow_only') {
      setIsFollowingAuthor(isTargetFollowedLocally(authorTargetId, post.author.name));
    }
  }, [relationshipKind, authorTargetId, post.author.name, relSyncTick]);

  // Auto-translate state (Google Translate API)
  const [translatedBody, setTranslatedBody] = useState<string | null>(null);
  const [translatedVerse, setTranslatedVerse] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginalText, setShowOriginalText] = useState(false);

  React.useEffect(() => {
    let active = true;
    const bodyText = post.contentBangla || '';
    const verseMeaning = post.translation || '';

    setShowOriginalText(false);

    if (!bodyText.trim()) {
      setTranslatedBody(null);
      return;
    }

    const needsBodyTranslate = shouldAutoTranslate(bodyText, currentLang);
    const needsVerseTranslate = Boolean(verseMeaning) && shouldAutoTranslate(verseMeaning, currentLang);

    if (!needsBodyTranslate && !needsVerseTranslate) {
      setTranslatedBody(null);
      setTranslatedVerse(null);
      return;
    }

    setIsTranslating(true);
    Promise.all([
      needsBodyTranslate ? translateText(bodyText, currentLang) : Promise.resolve(null),
      needsVerseTranslate ? translateText(verseMeaning, currentLang) : Promise.resolve(null),
    ])
      .then(([bodyRes, verseRes]) => {
        if (!active) return;
        setTranslatedBody(bodyRes && bodyRes.translatedText !== bodyText ? bodyRes.translatedText : null);
        setTranslatedVerse(verseRes && verseRes.translatedText !== verseMeaning ? verseRes.translatedText : null);
      })
      .finally(() => {
        if (active) setIsTranslating(false);
      });

    return () => {
      active = false;
    };
  }, [post.contentBangla, post.translation, currentLang]);

  const handleManualTranslate = async () => {
    setIsTranslating(true);
    setShowOriginalText(false);
    const res = await translateText(post.contentBangla, currentLang);
    setTranslatedBody(res.translatedText);
    setIsTranslating(false);
  };

  // Sync follow status (durable localStorage + Firestore real-time)
  React.useEffect(() => {
    if (relationshipKind !== 'follow_only' || isOwnAuthorPost || authorTargetId === currentUserId) {
      return;
    }
    const unsub = subscribeToFollowStatus(
      currentUserId || 'user-me',
      authorTargetId,
      (following) => {
        setIsFollowingAuthor(following);
      },
      post.author.name
    );
    return () => unsub();
  }, [relationshipKind, isOwnAuthorPost, currentUserId, authorTargetId, post.author.name]);

  const handleToggleFollowAuthor = async () => {
    const nextState = await toggleFollowUser(
      currentUserId || 'user-me',
      currentUserName,
      resolvedUserAvatar,
      authorTargetId,
      post.author.name,
      post.author.avatar
    );
    setIsFollowingAuthor(nextState);
  };

  const handleToggleAddFriendAuthor = async () => {
    const nextSent = await toggleLocalFriendRequestAndSync(
      currentUserId || 'user-me',
      currentUserName,
      resolvedUserAvatar,
      {
        id: authorTargetId,
        name: post.author.name,
        avatar: post.author.avatar,
      }
    );
    setIsFriendReqSent(nextSent);
  };

  const typingTimeoutRef = useRef<any>(null);

  const resolvedUserAvatar = React.useMemo(() => {
    if (currentUserAvatar) return currentUserAvatar;
    try {
      const raw =
        localStorage.getItem('qalby_user_profile') ||
        localStorage.getItem('peaceverse_user_profile');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.avatar) return String(parsed.avatar);
      }
    } catch {}
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      currentUserName || 'U'
    )}&backgroundColor=1877f2,0ea5e9,3b82f6`;
  }, [currentUserAvatar, currentUserName]);

  const handleCommentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      <article className="bg-white border border-amber-300 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>This post violates Peaceverse24.com guidelines</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
            ব্লক করা হয়েছে
          </span>
        </div>

        <p className="text-xs text-[#65676B] leading-relaxed">
          {post.moderationReason ||
            'পোস্টটি Peaceverse24.com ইসলামিক সোশ্যাল নেটওয়ার্কের শালীনতা ও গাইডলাইন লঙ্ঘনের কারণে প্রদর্শন স্থগিত রয়েছে।'}
        </p>

        {post.appealStatus === 'pending' || appealSubmitted ? (
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[#0866FF] text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-[#0866FF]" />
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
            <span className="text-[11px] text-[#65676B]">আইডি: {post.id}</span>
          </div>
        )}

        {/* Appeal Modal */}
        {showAppealModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-[#E4E6EB] rounded-2xl p-4 w-full max-w-md space-y-3 animate-in fade-in zoom-in-95 text-black">
              <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
                <h3 className="font-bold text-black text-sm">পোস্ট আনব্লক করার আপিল</h3>
                <button onClick={() => setShowAppealModal(false)} className="p-1 text-[#65676B] hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {appealSubmitted ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-black">আপিল সফলভাবে জমা হয়েছে</p>
                  <p className="text-xs text-[#65676B]">অ্যাডমিন টিম দ্রুত এটি রিভিউ করে সিদ্ধান্ত জানাবে।</p>
                </div>
              ) : (
                <form onSubmit={handleAppealSubmit} className="space-y-3">
                  <p className="text-xs text-[#65676B]">
                    আপনার পোস্টটি কেন ভুলবশত ব্লক হয়েছে বলে মনে করেন তা সংক্ষেপে লিখুন:
                  </p>
                  <textarea
                    rows={3}
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="আপনার আপিলের বিবরণ লিখুন..."
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl p-3 text-xs text-black outline-none focus:border-[#0866FF] resize-none"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAppealModal(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#65676B] hover:bg-[#F0F2F5]"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAppeal || !appealReason.trim()}
                      className="px-4 py-1.5 rounded-lg bg-[#0866FF] text-white font-bold text-xs flex items-center gap-1.5"
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
        `${post.arabicVerse}\n\n${post.translation || ''}\n\n— ${post.reference || ''} via Peaceverse24.com`
      );
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  const displaySharesCount = (post.sharesCount || 0) + localShareDelta;

  const handleShare = () => {
    if (onSharePost) {
      onSharePost(post.id);
    } else {
      setLocalShareDelta((c) => c + 1);
    }
    if (navigator.share) {
      navigator.share({
        title: post.author.name,
        text: `${post.contentBangla} — Peaceverse24.com`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      try {
        navigator.clipboard?.writeText(`${post.contentBangla}\n\n— ${post.author.name} via Peaceverse24.com`);
      } catch {}
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
    setMenuOpen(false);
  };

  const handleCommentSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(post.id, commentInput.trim());
    setCommentInput('');
    setShowComments(true);
  };

  const addQuickPraise = (phrase: string) => {
    setCommentInput((prev) => (prev ? `${prev} ${phrase}` : phrase));
    setShowComments(true);
    setIsCommentExpanded(true);
    setTimeout(() => commentTextareaRef.current?.focus(), 60);
  };

  const triggerReactionWithAnimation = (reaction: ReactionType) => {
    const isAddingOrChanging = post.userReaction !== reaction;
    if (isAddingOrChanging) {
      const meta = HALAL_REACTIONS.find((r) => r.type === reaction) || HALAL_REACTIONS[0];
      setFlyingEmoji({ id: Date.now(), emoji: meta.emoji });
      setTimeout(() => setFlyingEmoji(null), 850);
    }
    onToggleReaction(post.id, reaction);
    setShowReactionsMenu(false);
    setHoveredReaction(null);
  };

  const activeReactionMeta = post.userReaction
    ? HALAL_REACTIONS.find((r) => r.type === post.userReaction) || HALAL_REACTIONS[0]
    : null;

  const reactionSummaryItems = [
    { ...HALAL_REACTIONS[0], count: post.reactions.likeCount || 0 },
    { ...HALAL_REACTIONS[1], count: post.reactions.loveCount || 0 },
    { ...HALAL_REACTIONS[2], count: post.reactions.subhanallahCount || 0 },
    { ...HALAL_REACTIONS[3], count: post.reactions.mashaallahCount || 0 },
    { ...HALAL_REACTIONS[4], count: post.reactions.careCount || 0 },
    { ...HALAL_REACTIONS[5], count: post.reactions.sadCount || 0 },
  ].filter((item) => item.count > 0);

  const visibleSummaryItems = reactionSummaryItems.slice(0, 4);
  const hasSummaryEngagement =
    post.reactions.total > 0 ||
    post.comments.length > 0 ||
    displaySharesCount > 0 ||
    Boolean(activeReactionMeta);

  const normIdentity = (s?: string) =>
    (s || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();

  // Boosted / Manage ad / See insights and ads disabled on all posts until Ad system is ready
  const canShowBoostRow = false;

  return (
    <article className="bg-white border border-[#E4E6EB] rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.08)] space-y-2.5 text-black">
      {copiedToast && (
        <div className="mx-3 mt-2 py-1.5 px-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>✓ পোস্ট লিঙ্ক ও তথ্য কপি করা হয়েছে!</span>
        </div>
      )}
      {/* 1. Post Header with ••• and ✕ matching Screenshot 1 & 2 */}
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
              className="w-10 h-10 rounded-full object-cover border border-[#E4E6EB] group-hover:ring-2 group-hover:ring-[#0866FF] transition-all"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 leading-snug">
              <span className="font-bold text-[15px] text-black group-hover:underline">
                {post.author.name}
              </span>
              {post.author.verified && (
                <CheckCircle2 className="w-4 h-4 text-[#0866FF] flex-shrink-0 fill-[#0866FF] text-white" />
              )}
              {relationshipKind === 'follow_only' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFollowAuthor();
                  }}
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ml-1 shadow-xs ${
                    isFollowingAuthor
                      ? 'bg-[#F0F2F5] text-black border border-[#E4E6EB]'
                      : 'bg-[#E7F3FF] hover:bg-[#0866FF] text-[#0866FF] hover:text-white border border-[#0866FF]/20'
                  }`}
                  title={isFollowingAuthor ? 'Unfollow' : 'Follow'}
                >
                  {isFollowingAuthor ? '✓ Following' : '+ Follow'}
                </button>
              )}
              {relationshipKind === 'add_friend' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleToggleAddFriendAuthor();
                  }}
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ml-1 shadow-xs ${
                    isFriendReqSent
                      ? 'bg-[#F0F2F5] text-[#0866FF] border border-[#0866FF]/25'
                      : 'bg-[#E7F3FF] hover:bg-[#0866FF] text-[#0866FF] hover:text-white border border-[#0866FF]/20'
                  }`}
                  title={isFriendReqSent ? 'Cancel Friend Request' : 'Add Friend'}
                >
                  {isFriendReqSent ? (
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

            <div className="flex items-center gap-1 text-[13px] text-[#65676B] flex-wrap">
              {post.aiLabeled && (
                <>
                  <span className="font-medium text-[#65676B]">AI content</span>
                  <span>•</span>
                </>
              )}
              {post.author.subtitle && (
                <span>{post.author.subtitle}</span>
              )}
              {!post.author.subtitle && (
                <>
                  <span>{post.timeAgo || '1m'}</span>
                  <span>•</span>
                  {post.privacy === 'private' ? (
                    <span title="Only Me" className="flex items-center gap-1 text-amber-600 font-medium">
                      <Lock className="w-3 h-3" />
                      <span className="text-[11px]">Only Me</span>
                    </span>
                  ) : post.privacy === 'friends' ? (
                    <span title="Friends" className="flex items-center gap-1 text-emerald-600 font-medium">
                      <Users className="w-3 h-3" />
                      <span className="text-[11px]">Friends</span>
                    </span>
                  ) : (
                    <span title="Public" className="flex items-center gap-1 text-[#65676B]">
                      <Globe className="w-3 h-3" />
                      <span className="text-[11px]">Public</span>
                    </span>
                  )}
                </>
              )}
            </div>
            {post.musicTitle && (
              <p className="text-[11px] font-medium text-[#65676B] flex items-center gap-1 mt-0.5">
                <Music className="w-3 h-3 text-[#0866FF] shrink-0" />
                <span className="truncate max-w-[230px]">{post.musicTitle}</span>
              </p>
            )}
          </div>
        </div>

        {/* Top Right: ••• and ✕ buttons matching Screenshot 1 & 2 */}
        <div className="flex items-center gap-0.5 text-[#65676B]">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setHidden(true)}
            className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] transition-colors cursor-pointer"
            title="Hide post"
          >
            <X className="w-5 h-5" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-4 top-10 z-40 w-52 py-1.5 bg-white border border-[#E4E6EB] rounded-xl shadow-2xl text-xs text-black animate-in fade-in zoom-in-95">
                
                {/* Edit Post */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setIsEditing(true);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-[#F0F2F5] flex items-center gap-2.5 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-[#0866FF]" />
                  <span>Edit post</span>
                </button>

                {/* Save post */}
                <button
                  onClick={() => {
                    onToggleSave(post.id);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-[#F0F2F5] flex items-center gap-2.5 transition-colors"
                >
                  {post.isSaved ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                      <span>Unsave post</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 text-[#65676B]" />
                      <span>Save post</span>
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
                  className="w-full px-3 py-2 text-left hover:bg-[#F0F2F5] flex items-center gap-2.5 transition-colors"
                >
                  <Copy className="w-4 h-4 text-[#65676B]" />
                  <span>Copy text</span>
                </button>

                {/* Share link */}
                <button
                  onClick={handleShare}
                  className="w-full px-3 py-2 text-left hover:bg-[#F0F2F5] flex items-center gap-2.5 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-[#65676B]" />
                  <span>Share</span>
                </button>

                {/* Delete / Hide */}
                <div className="border-t border-[#E4E6EB] my-1" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (onDeletePost) {
                      onDeletePost(post.id);
                    } else {
                      setHidden(true);
                    }
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>Delete post</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Post Content Text (Auto-translated to user's selected language) */}
      {post.bgGradient ? (
        <div className={`${post.bgGradient} p-8 min-h-[180px] flex flex-col items-center justify-center text-center gap-2`}>
          <p className="text-xl sm:text-2xl font-bold text-white font-bengali leading-relaxed drop-shadow">
            {!showOriginalText && translatedBody ? translatedBody : post.contentBangla}
          </p>
          {translatedBody && (
            <button
              type="button"
              onClick={() => setShowOriginalText(!showOriginalText)}
              className="text-[11px] font-semibold text-white/90 underline cursor-pointer"
            >
              {showOriginalText ? `🌐 View ${currentLang.toUpperCase()} translation` : 'Show original'}
            </button>
          )}
        </div>
      ) : (
        <div className="px-3 sm:px-4 space-y-1.5">
          <div className="text-[15px] text-black font-bengali leading-relaxed whitespace-pre-line">
            <p>{!showOriginalText && translatedBody ? translatedBody : post.contentBangla}</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#65676B]">
            {isTranslating && (
              <span className="flex items-center gap-1 text-[#0866FF]">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Translating via Google Translate...</span>
              </span>
            )}
            {!isTranslating && translatedBody && (
              <button
                type="button"
                onClick={() => setShowOriginalText(!showOriginalText)}
                className="flex items-center gap-1 text-[#0866FF] hover:underline font-medium cursor-pointer"
              >
                <Globe className="w-3 h-3" />
                <span>
                  {showOriginalText
                    ? `Translate back to ${currentLang.toUpperCase()}`
                    : `Auto-translated (${detectTextScript(post.contentBangla).toUpperCase()} → ${currentLang.toUpperCase()}) · Show original`}
                </span>
              </button>
            )}
            {!isTranslating && !translatedBody && post.contentBangla.trim().length > 4 && (
              <button
                type="button"
                onClick={handleManualTranslate}
                className="flex items-center gap-1 hover:text-[#0866FF] cursor-pointer"
              >
                <Globe className="w-3 h-3" />
                <span>Translate ({currentLang.toUpperCase()})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Highlighted Arabic Verse Box if any */}
      {post.arabicVerse && (
        <div className="mx-3 sm:mx-4 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{post.reference || 'Holy Verse'}</span>
            </span>
            <button
              onClick={handleCopyAyah}
              className="px-2 py-0.5 rounded bg-white border border-[#E4E6EB] text-[10px] text-black hover:bg-[#F0F2F5] cursor-pointer"
            >
              {copiedToast ? 'Copied ✓' : 'Copy Verse'}
            </button>
          </div>
          <p className="text-base sm:text-lg font-arabic text-right text-emerald-950 leading-loose py-1" dir="rtl">
            {post.arabicVerse}
          </p>
          {(translatedVerse || post.translation) && (
            <p className="text-xs text-[#65676B] mt-1 font-bengali border-t border-emerald-200 pt-1">
              {!showOriginalText && translatedVerse ? translatedVerse : post.translation}
            </p>
          )}
        </div>
      )}

      {/* 4. Media Section (Single or Multi-Photo Grid up to 10 photos, or Video) */}
      {(() => {
        const postImages =
          post.mediaType === 'image'
            ? (Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0
                ? post.mediaUrls
                : post.mediaUrl
                ? [post.mediaUrl]
                : []
              ).map((u) => signBunnyCdnUrl(u))
            : [];

        if (postImages.length === 1) {
          return (
            <div
              onClick={() => {
                setLightboxIndex(0);
                setShowPhotoLightbox(true);
              }}
              className="w-full bg-[#F0F2F5] max-h-[560px] overflow-hidden cursor-pointer group relative select-none flex items-center justify-center"
              title="ছবিটি পুরো স্ক্রিনে বড় করে দেখুন (View Fullscreen)"
            >
              <img
                src={postImages[0]}
                alt="media"
                className="w-full h-auto object-contain max-h-[560px] group-hover:opacity-95 transition-all"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
            </div>
          );
        }

        if (postImages.length === 2) {
          return (
            <div className="grid grid-cols-2 gap-1 bg-[#E4E6EB] overflow-hidden">
              {postImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setLightboxIndex(idx);
                    setShowPhotoLightbox(true);
                  }}
                  className="aspect-[4/5] bg-black overflow-hidden cursor-pointer relative group"
                >
                  <img
                    src={imgUrl}
                    alt={`media ${idx + 1}`}
                    className="w-full h-full object-cover object-top group-hover:opacity-95 transition-opacity"
                  />
                </div>
              ))}
            </div>
          );
        }

        if (postImages.length >= 3) {
          const visibleImages = postImages.slice(0, 4);
          const extraCount = postImages.length - 4;
          return (
            <div className="grid grid-cols-2 gap-1 bg-[#E4E6EB] overflow-hidden">
              {visibleImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setLightboxIndex(idx);
                    setShowPhotoLightbox(true);
                  }}
                  className={`bg-black overflow-hidden cursor-pointer relative group ${
                    postImages.length === 3 && idx === 0 ? 'col-span-2 aspect-[16/10]' : 'aspect-square'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`media ${idx + 1}`}
                    className="w-full h-full object-cover object-top group-hover:opacity-95 transition-opacity"
                  />
                  {idx === 3 && extraCount > 0 && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                      <span className="text-white text-2xl font-extrabold">+{extraCount}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        }

        return null;
      })()}

      {/* Video: YouTube Embed */}
      {post.youtubeId && (
        <div className="relative aspect-video w-full bg-black border-y border-[#E4E6EB]">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${post.youtubeId}?rel=0&modestbranding=1`}
            title={post.contentBangla}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Video: Direct Uploaded Video Player */}
      {!post.youtubeId &&
        (post.mediaType === 'video' ||
          Boolean(post.mediaUrl && post.mediaUrl.match(/\.(mp4|webm|mov|ogg|m4v)($|\?)/i))) &&
        post.mediaUrl && (
          <FbVideoPlayer
            src={signBunnyCdnUrl(post.mediaUrl)}
            title={post.contentBangla}
            onOpenFullscreen={() => {
              if (onOpenReel) {
                onOpenReel(post);
              }
            }}
          />
        )}

      {/* 4.9 Facebook-style "See insights and ads" + "পোস্টটি বুস্ট করুন · Boost post" bar */}
      {canShowBoostRow && (
        <div className="px-3 sm:px-4 py-2 border-t border-[#E4E6EB] flex items-center justify-between gap-2 bg-white">
          <button
            type="button"
            onClick={() => {
              if (onSeeInsights) {
                onSeeInsights(post);
              } else {
                setBoostModalMode('insights');
              }
            }}
            className="text-[13px] sm:text-[13.5px] font-semibold text-[#0866FF] hover:underline text-left leading-snug cursor-pointer"
          >
            See insights and ads
          </button>

          <button
            type="button"
            onClick={() => {
              if (onBoostPost) {
                onBoostPost(post);
              } else {
                setBoostModalMode('boost');
              }
            }}
            className={`px-3 sm:px-3.5 py-2 rounded-[6px] text-[12.5px] sm:text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 max-w-[62%] sm:max-w-none truncate flex items-center gap-1.5 ${
              boostedCampaign
                ? 'bg-[#E7F3FF] hover:bg-[#DBEAFE] text-[#0866FF] border border-[#0866FF]/30'
                : 'bg-[#0866FF] hover:bg-[#1877F2] active:scale-[0.98] text-white shadow-xs'
            }`}
          >
            {boostedCampaign ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Boosted • Manage ad</span>
              </>
            ) : (
              <span className="truncate">পোস্টটি বুস্ট করুন · Boost post</span>
            )}
          </button>
        </div>
      )}

      {/* 5. Halal Reactions Summary Bar (hidden when all counts are 0) */}
      {hasSummaryEngagement && (
        <div className="px-3 sm:px-4 py-1.5 space-y-1 text-[13px] text-[#65676B] bg-white">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Overlapping Reaction Emojis + Counts */}
            <div className="flex items-center gap-1.5 min-w-0">
              {visibleSummaryItems.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap tabular-nums">
                  {visibleSummaryItems.map((item) => (
                    <span
                      key={item.type}
                      className="inline-flex items-center gap-0.5 text-xs font-medium text-black"
                      title={item.label}
                    >
                      <span className="text-sm">{item.emoji}</span>
                      <span className="text-[#65676B]">{item.count}</span>
                    </span>
                  ))}
                </div>
              )}
              {post.reactions.total > 0 && (
                <span className="text-xs text-[#65676B] tabular-nums hidden sm:inline">
                  · {post.reactions.total} total
                </span>
              )}
            </div>

            {/* Right: Comments & Shares (only show non-zero counts) */}
            {(post.comments.length > 0 || displaySharesCount > 0) && (
              <div className="flex items-center gap-1.5 text-[13px] text-[#65676B] shrink-0 tabular-nums">
                {post.comments.length > 0 && (
                  <button
                    onClick={() => setShowCommentSheet(true)}
                    className="hover:underline cursor-pointer"
                  >
                    {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                  </button>
                )}
                {post.comments.length > 0 && displaySharesCount > 0 && <span>•</span>}
                {displaySharesCount > 0 && (
                  <button onClick={handleShare} className="hover:underline cursor-pointer">
                    {displaySharesCount} {displaySharesCount === 1 ? 'share' : 'shares'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Personalized attribution line when user reacted */}
          {activeReactionMeta && (
            <p className="text-[11px] text-[#65676B] truncate">
              You{post.reactions.total > 1 ? ` and ${post.reactions.total - 1} others` : ''} reacted with {activeReactionMeta.emoji} {activeReactionMeta.label}
            </p>
          )}
        </div>
      )}

      {/* 6. Facebook Action Bar: Dua/Like (with 6 Halal Reactions popup), Comment, Share, Hadiya + live counts */}
      <div className="border-t border-[#E4E6EB] mx-2 sm:mx-3 py-1 bg-white rounded-b-[8px] flex items-center justify-between gap-0.5 relative">
        {/* Column 1: Halal Reaction Button (Tap = Dua, Hover/Long-Press = 6 Reactions Bar) */}
        <div
          className="relative flex-1 min-w-0"
          onMouseEnter={() => setShowReactionsMenu(true)}
          onMouseLeave={() => {
            setShowReactionsMenu(false);
            setHoveredReaction(null);
          }}
        >
          {/* Floating Emoji Animation when selected */}
          {flyingEmoji && (
            <span
              key={flyingEmoji.id}
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-2 z-50 text-3xl animate-peace-fly select-none"
            >
              {flyingEmoji.emoji}
            </span>
          )}

          {/* Long-press / Hover Backdrop for mobile dismissal */}
          {showReactionsMenu && (
            <div
              className="fixed inset-0 z-30 sm:hidden"
              onTouchStart={() => setShowReactionsMenu(false)}
              onClick={() => setShowReactionsMenu(false)}
            />
          )}

          {/* 6 Halal Reactions Popup Bar [ 🤲 ❤️ 🕋 🙏 🤝 😢 ] */}
          {showReactionsMenu && (
            <div className="absolute -top-14 left-0 z-40 bg-white border border-[#E4E6EB] rounded-full px-2.5 py-1.5 shadow-2xl flex items-center gap-1.5 sm:gap-2">
              {HALAL_REACTIONS.map((item, idx) => (
                <button
                  key={item.type}
                  type="button"
                  style={{ animationDelay: `${idx * 35}ms` }}
                  onMouseEnter={() => setHoveredReaction(item.type)}
                  onMouseLeave={() => setHoveredReaction(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerReactionWithAnimation(item.type);
                  }}
                  className="relative group/react w-9 h-9 rounded-full flex items-center justify-center text-2xl hover:scale-125 hover:-translate-y-1.5 active:scale-110 transition-transform cursor-pointer animate-reaction-pop"
                  title={item.label}
                >
                  {hoveredReaction === item.type && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-bold whitespace-nowrap shadow-md pointer-events-none">
                      {item.label}
                    </span>
                  )}
                  <span>{item.emoji}</span>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onTouchStart={() => {
              longPressTriggeredRef.current = false;
              longPressTimerRef.current = setTimeout(() => {
                longPressTriggeredRef.current = true;
                setShowReactionsMenu(true);
              }, 420);
            }}
            onTouchEnd={() => {
              if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
            }}
            onTouchMove={() => {
              if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowReactionsMenu(true);
            }}
            onClick={() => {
              if (longPressTriggeredRef.current) {
                longPressTriggeredRef.current = false;
                return;
              }
              triggerReactionWithAnimation(post.userReaction || 'like');
            }}
            className={`w-full py-1.5 px-1 rounded-md hover:bg-[#F0F2F5] flex items-center justify-center gap-1 transition-colors cursor-pointer select-none ${
              activeReactionMeta
                ? `${activeReactionMeta.textColor} font-bold`
                : 'text-[#65676B] font-medium'
            }`}
          >
            {activeReactionMeta ? (
              <span className="text-base sm:text-lg leading-none shrink-0">{activeReactionMeta.emoji}</span>
            ) : (
              <span className="text-base sm:text-lg leading-none shrink-0">🤲</span>
            )}
            <span className="text-[12px] sm:text-[14px] whitespace-nowrap truncate">
              {activeReactionMeta ? activeReactionMeta.label : 'Dua'}
            </span>
            <span className="text-[12px] sm:text-[13px] font-bold tabular-nums shrink-0">
              {post.reactions.total || 0}
            </span>
          </button>
        </div>

        {/* Column 2: Comment */}
        <button
          type="button"
          onClick={() => {
            setShowCommentSheet(true);
          }}
          className="flex-1 min-w-0 py-1.5 px-1 rounded-md hover:bg-[#F0F2F5] flex items-center justify-center gap-1 text-[#65676B] font-medium transition-colors cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#65676B] shrink-0" />
          <span className="text-[12px] sm:text-[14px] whitespace-nowrap">Comment</span>
          <span className="text-[12px] sm:text-[13px] font-bold tabular-nums shrink-0">
            {post.comments?.length || 0}
          </span>
        </button>

        {/* Column 3: Share */}
        <button
          onClick={handleShare}
          className="flex-1 min-w-0 py-1.5 px-1 rounded-md hover:bg-[#F0F2F5] flex items-center justify-center gap-1 text-[#65676B] font-medium transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#65676B] shrink-0" />
          <span className="text-[12px] sm:text-[14px] whitespace-nowrap">Share</span>
          <span className="text-[12px] sm:text-[13px] font-bold tabular-nums shrink-0">
            {displaySharesCount}
          </span>
        </button>

        {/* Column 4: Golden Hadia Gift */}
        <button
          onClick={() => onOpenGiftModal?.(post)}
          className="flex-1 min-w-0 py-1.5 px-1 rounded-md hover:bg-amber-50 flex items-center justify-center gap-1 text-amber-600 font-bold transition-colors cursor-pointer"
          title="গোল্ডেন হাদিয়া পাঠান (Gift Gold Coins)"
        >
          <Gift className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-[12px] sm:text-[13.5px] whitespace-nowrap">হাদিয়া</span>
          <span className="text-[12px] sm:text-[13px] font-bold tabular-nums shrink-0">
            {post.goldenGiftsCount || 0}
          </span>
        </button>
      </div>

      {/* 7. Comments Drawer */}
      {showComments && (
        <div className="px-3 sm:px-4 pb-3.5 space-y-3 border-t border-[#E4E6EB] pt-2.5 animate-in fade-in">
          {/* Quick Islamic Reactions */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {['আমিন 🤲', 'মাশাআল্লাহ ❤️', 'সুবহানাল্লাহ 🌸', 'আলহামদুলিল্লাহ ✨'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => addQuickPraise(r)}
                className="px-2.5 py-1 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black text-xs font-medium flex-shrink-0 cursor-pointer"
              >
                {r}
              </button>
            ))}
          </div>

          {/* Facebook-style Large 48px+ Rounded Comment Input with Profile Avatar */}
          <form onSubmit={handleCommentSubmit} className="flex items-start gap-2.5 w-full">
            <img
              src={resolvedUserAvatar}
              alt={currentUserName}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  currentUserName || 'U'
                )}&backgroundColor=1877f2,0ea5e9,3b82f6`;
              }}
              className="w-9 h-9 rounded-full object-cover border border-[#E4E6EB] bg-[#F0F2F5] shrink-0 mt-1.5"
            />
            <div
              className={`flex-1 flex items-end gap-2 bg-[#F0F2F5] border border-[#E4E6EB] focus-within:border-[#0866FF] focus-within:bg-white transition-all px-3.5 ${
                isCommentExpanded ? 'rounded-2xl py-2' : 'rounded-[24px] py-1'
              }`}
            >
              <textarea
                ref={commentTextareaRef}
                rows={isCommentExpanded ? 2 : 1}
                placeholder={`Comment as ${currentUserName || 'Member'}`}
                value={commentInput}
                onFocus={() => setIsCommentExpanded(true)}
                onClick={() => setIsCommentExpanded(true)}
                onChange={handleCommentInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
                className={`flex-1 w-full bg-transparent text-[16px] leading-snug text-black placeholder-[#65676B] focus:outline-none resize-none ${
                  isCommentExpanded ? 'min-h-[56px] py-1' : 'min-h-[40px] py-2'
                }`}
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                aria-label="Send comment"
                className="w-9 h-9 rounded-full bg-[#0866FF] hover:bg-[#166FE5] disabled:opacity-35 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 mb-0.5"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Realtime Typing Indicator */}
          {post.typingUsers && post.typingUsers.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#0866FF] px-2 py-0.5">
              <span>{post.typingUsers.map((u) => u.name).join(', ')} লিখছেন...</span>
            </div>
          )}

          {/* Existing comments list with name, photo, time, Like and Reply buttons */}
          {(post.comments || []).length > 0 && (
            <div className="space-y-2.5 pt-1">
              {(post.comments || []).map((c) => {
                const cFallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  c.author || 'U'
                )}&backgroundColor=1877f2,0ea5e9,3b82f6`;
                const likeKey = `${post.id}::${c.id}`;
                const isCommentLiked = Boolean(commentLikesMap[likeKey] ?? c.isLiked);
                const commentLikeCount =
                  Math.max(0, c.likes || 0) + (commentLikesMap[likeKey] && !c.isLiked ? 1 : 0);
                return (
                  <div key={c.id} className="flex gap-2.5 text-sm pt-0.5">
                    <img
                      src={c.avatar || cFallbackAvatar}
                      alt={c.author}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = cFallbackAvatar;
                      }}
                      className="w-8 h-8 rounded-full object-cover mt-0.5 border border-[#E4E6EB] shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="relative bg-[#F0F2F5] px-3.5 py-2 rounded-2xl max-w-[95%] inline-block">
                        <p className="font-bold text-black text-[13px] leading-tight">{c.author}</p>
                        <p className="text-black text-[14px] font-bengali leading-snug mt-0.5 break-words">
                          {c.text}
                        </p>
                        {commentLikeCount > 0 && (
                          <span className="absolute -bottom-2 -right-2 bg-white border border-[#E4E6EB] shadow-xs rounded-full px-1.5 py-0.5 text-[10px] font-bold text-[#050505] flex items-center gap-0.5">
                            <span className="w-3 h-3 rounded-full bg-[#0866FF] text-white inline-flex items-center justify-center">
                              <ThumbsUp className="w-2 h-2 fill-white stroke-white" />
                            </span>
                            <span className="tabular-nums">{commentLikeCount}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 px-2 text-xs text-[#65676B]">
                        <span>{c.timeAgo || 'Just now'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            toggleCommentLikeLocally(post.id, c.id);
                            setCommentLikesMap(readCommentLikesStore());
                          }}
                          className={`font-bold cursor-pointer ${
                            isCommentLiked
                              ? 'text-[#0866FF]'
                              : 'text-[#65676B] hover:text-[#0866FF]'
                          }`}
                        >
                          {isCommentLiked ? 'Liked' : 'Like'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowComments(true);
                            setIsCommentExpanded(true);
                            setCommentInput((prev) =>
                              prev.startsWith(`@${c.author}`) ? prev : `@${c.author} `
                            );
                            setTimeout(() => commentTextareaRef.current?.focus(), 60);
                          }}
                          className="font-bold text-[#65676B] hover:text-[#0866FF] cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 8. Edit Post Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E4E6EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 text-black">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E6EB] bg-white">
              <h3 className="font-bold text-black text-sm">Edit post</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-full text-[#65676B] hover:text-black hover:bg-[#F0F2F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto no-scrollbar bg-white">
              <div className="flex items-center gap-2.5">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-black text-xs">{post.author.name}</p>
                  <span className="text-[10px] text-[#65676B]">Public • 🌐</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#65676B]">পোস্টের মূল লেখা:</label>
                <textarea
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] focus:border-[#0866FF] rounded-xl p-3 text-sm text-black outline-none resize-none font-bengali"
                  placeholder="মনের কথা বা দ্বীনি উপদেশ..."
                />
              </div>

              {post.arabicVerse && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-emerald-700">আরবি আয়াত / হাদিস:</label>
                  <textarea
                    rows={2}
                    value={editArabic}
                    onChange={(e) => setEditArabic(e.target.value)}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] focus:border-emerald-500 rounded-xl p-2.5 text-right font-arabic text-sm text-black outline-none"
                  />
                  <input
                    type="text"
                    value={editTranslation}
                    onChange={(e) => setEditTranslation(e.target.value)}
                    placeholder="বাংলা অনুবাদ..."
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-black outline-none"
                  />
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t border-[#E4E6EB] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#65676B] hover:bg-[#F0F2F5]"
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
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Facebook Fullscreen Photo Viewer Lightbox */}
      {showPhotoLightbox && (
        <FbPhotoLightboxModal
          isOpen={showPhotoLightbox}
          onClose={() => setShowPhotoLightbox(false)}
          post={post}
          photoUrl={post.mediaUrl ? signBunnyCdnUrl(post.mediaUrl) : undefined}
          photos={
            Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0
              ? post.mediaUrls.map((u) => signBunnyCdnUrl(u))
              : post.mediaUrl
              ? [signBunnyCdnUrl(post.mediaUrl)]
              : undefined
          }
          initialIndex={lightboxIndex}
          onToggleReaction={onToggleReaction}
          onAddComment={onAddComment}
          onToggleSave={onToggleSave}
          onOpenGiftModal={onOpenGiftModal}
          currentUserName={currentUserName}
          currentUserAvatar={resolvedUserAvatar}
        />
      )}

      {/* 9. Facebook Boost Post & Insights Modal */}
      {boostModalMode && (
        <FbBoostPostModal
          post={post}
          initialMode={boostModalMode}
          onClose={() => setBoostModalMode(null)}
        />
      )}

      {/* 10. Facebook-Exact Comment Bottom Sheet */}
      <FbCommentBottomSheet
        isOpen={showCommentSheet}
        onClose={() => setShowCommentSheet(false)}
        postId={post.id}
        likesCount={post.reactions?.total || 0}
        hasUserReacted={Boolean(post.userReaction)}
        userReaction={post.userReaction || null}
        comments={post.comments || []}
        currentUserName={currentUserName}
        currentUserAvatar={resolvedUserAvatar}
        onAddComment={(text) => {
          onAddComment(post.id, text);
          setShowComments(true);
        }}
        onToggleReaction={(reaction) => triggerReactionWithAnimation(reaction)}
      />

    </article>
  );
};
