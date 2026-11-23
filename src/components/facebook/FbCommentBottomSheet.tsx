import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, ThumbsUp, X } from 'lucide-react';
import { ReactionType } from '../../types';
import { useHistoryBack } from '../../utils/backNavigation';

export interface CommentSheetItem {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  timeAgo?: string;
  likes?: number;
  isLiked?: boolean;
}

const COMMENT_LIKES_STORAGE_KEY = 'peaceverse_comment_likes_v1';
const QUICK_POST_REACTIONS_STORAGE_KEY = 'peaceverse_quick_emoji_reactions_v1';

export interface QuickReactionOption {
  emoji: string;
  label: string;
  reactionType: ReactionType;
}

export const FACEBOOK_QUICK_REACTIONS: QuickReactionOption[] = [
  { emoji: '❤️', label: 'Love', reactionType: 'love' },
  { emoji: '👏', label: 'Clap', reactionType: 'mashaallah' },
  { emoji: '🔥', label: 'Fire', reactionType: 'like' },
  { emoji: '🙌', label: 'Praise', reactionType: 'subhanallah' },
  { emoji: '🥺', label: 'Moved', reactionType: 'sad' },
  { emoji: '😍', label: 'Adore', reactionType: 'love' },
  { emoji: '😮', label: 'Wow', reactionType: 'care' },
  { emoji: '😂', label: 'Haha', reactionType: 'care' },
];

export function readCommentLikesStore(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(COMMENT_LIKES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function toggleCommentLikeLocally(postId: string, commentId: string): boolean {
  const key = `${postId}::${commentId}`;
  const store = readCommentLikesStore();
  const nextLiked = !Boolean(store[key]);
  store[key] = nextLiked;
  try {
    localStorage.setItem(COMMENT_LIKES_STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent('peaceverse:comment-likes-updated'));
  } catch {}
  return nextLiked;
}

function readQuickEmojiStore(): Record<string, string> {
  try {
    const raw = localStorage.getItem(QUICK_POST_REACTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeQuickEmojiForPost(postId: string, emoji: string | null) {
  try {
    const store = readQuickEmojiStore();
    if (emoji) {
      store[postId] = emoji;
    } else {
      delete store[postId];
    }
    localStorage.setItem(QUICK_POST_REACTIONS_STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

interface FbCommentBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  likesCount: number;
  hasUserReacted?: boolean;
  userReaction?: ReactionType | null;
  comments: CommentSheetItem[];
  currentUserName: string;
  currentUserAvatar?: string;
  onAddComment: (text: string) => void;
  onToggleReaction?: (reaction: ReactionType) => void;
  autoFocusInput?: boolean;
  initialDraftText?: string;
}

export const FbCommentBottomSheet: React.FC<FbCommentBottomSheetProps> = ({
  isOpen,
  onClose,
  postId,
  likesCount,
  hasUserReacted = false,
  userReaction = null,
  comments,
  currentUserName,
  currentUserAvatar,
  onAddComment,
  onToggleReaction,
  autoFocusInput = true,
  initialDraftText = '',
}) => {
  const [commentInput, setCommentInput] = useState(initialDraftText);
  const [replyingToAuthor, setReplyingToAuthor] = useState<string | null>(null);
  const [commentLikesMap, setCommentLikesMap] = useState<Record<string, boolean>>(() =>
    readCommentLikesStore()
  );
  const [selectedQuickEmoji, setSelectedQuickEmoji] = useState<string | null>(() => {
    const store = readQuickEmojiStore();
    return store[postId] || null;
  });
  const [flyingReaction, setFlyingReaction] = useState<{ id: number; emoji: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const listScrollRef = useRef<HTMLDivElement | null>(null);

  useHistoryBack(isOpen, onClose, `comment-sheet-${postId}`);

  const myDisplayName = (currentUserName || 'Member').trim() || 'Member';
  const resolvedMyAvatar = useMemo(() => {
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
      myDisplayName
    )}&backgroundColor=0866ff,1877f2,0ea5e9`;
  }, [currentUserAvatar, myDisplayName]);

  useEffect(() => {
    if (!isOpen) return;
    setCommentLikesMap(readCommentLikesStore());
    setSelectedQuickEmoji(readQuickEmojiStore()[postId] || null);
    if (initialDraftText) {
      setCommentInput(initialDraftText);
    }
    if (autoFocusInput) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen, postId, autoFocusInput, initialDraftText]);

  useEffect(() => {
    const sync = () => setCommentLikesMap(readCommentLikesStore());
    window.addEventListener('peaceverse:comment-likes-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('peaceverse:comment-likes-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (!isOpen) return null;

  const isLikedTop = Boolean(hasUserReacted || userReaction || selectedQuickEmoji);

  const handleQuickEmojiTap = (option: QuickReactionOption) => {
    const isSameEmoji = selectedQuickEmoji === option.emoji && isLikedTop;

    setFlyingReaction({ id: Date.now(), emoji: option.emoji });
    setTimeout(() => setFlyingReaction(null), 700);

    if (isSameEmoji) {
      setSelectedQuickEmoji(null);
      writeQuickEmojiForPost(postId, null);
      if (userReaction && onToggleReaction) {
        onToggleReaction(userReaction);
      } else if (onToggleReaction) {
        onToggleReaction(option.reactionType);
      }
      return;
    }

    setSelectedQuickEmoji(option.emoji);
    writeQuickEmojiForPost(postId, option.emoji);

    if (onToggleReaction) {
      // Only toggle if user wasn't already reacted with the exact same underlying type
      // (otherwise switching from ❤️ to 😍 should keep the reaction active instead of toggling off)
      if (!userReaction || userReaction !== option.reactionType) {
        onToggleReaction(option.reactionType);
      }
    }
  };

  const handleHeaderLikeTap = () => {
    if (!onToggleReaction) return;
    if (isLikedTop) {
      setSelectedQuickEmoji(null);
      writeQuickEmojiForPost(postId, null);
      onToggleReaction(userReaction || 'like');
    } else {
      setSelectedQuickEmoji('👍');
      writeQuickEmojiForPost(postId, '👍');
      onToggleReaction('like');
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    onAddComment(trimmed);
    setCommentInput('');
    setReplyingToAuthor(null);
    setTimeout(() => {
      listScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 60);
  };

  const handleReplyClick = (authorName: string) => {
    setReplyingToAuthor(authorName);
    setCommentInput((prev) =>
      prev.startsWith(`@${authorName}`) ? prev : `@${authorName} `
    );
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 60);
  };

  const handleCommentLikeToggle = (commentId: string) => {
    toggleCommentLikeLocally(postId, commentId);
    setCommentLikesMap(readCommentLikesStore());
  };

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/55 backdrop-blur-[1px] flex items-end sm:items-center justify-center animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] h-[84vh] sm:h-[78vh] max-h-[700px] bg-white text-[#050505] rounded-t-[20px] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="pt-2 pb-0.5 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#CED0D4]" />
        </div>

        {/* 1. TOP BAR: "Be the first to like this" OR like count */}
        <div className="px-4 py-2.5 border-b border-[#E4E6EB] flex items-center justify-between gap-2 shrink-0 bg-white">
          <button
            type="button"
            onClick={handleHeaderLikeTap}
            className="flex items-center gap-2 min-w-0 text-left cursor-pointer group"
          >
            {likesCount === 0 ? (
              <>
                <span className="w-6 h-6 rounded-full bg-[#0866FF] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ThumbsUp className="w-3.5 h-3.5 fill-white stroke-white" />
                </span>
                <span className="text-[14px] font-semibold text-[#050505] group-hover:underline truncate">
                  Be the first to like this
                </span>
              </>
            ) : (
              <>
                <div className="flex items-center -space-x-1 shrink-0">
                  <span className="w-5.5 h-5.5 rounded-full bg-[#0866FF] border border-white text-white flex items-center justify-center">
                    <ThumbsUp className="w-3 h-3 fill-white stroke-white" />
                  </span>
                  {selectedQuickEmoji && selectedQuickEmoji !== '👍' ? (
                    <span className="w-5.5 h-5.5 rounded-full bg-white border border-[#E4E6EB] flex items-center justify-center text-[13px] leading-none">
                      {selectedQuickEmoji}
                    </span>
                  ) : (
                    <span className="w-5.5 h-5.5 rounded-full bg-[#FA3E3E] border border-white text-white flex items-center justify-center text-[10px]">
                      ❤️
                    </span>
                  )}
                </div>
                <span className="text-[14px] font-bold text-[#050505] truncate tabular-nums">
                  {isLikedTop && likesCount > 1
                    ? `You and ${(likesCount - 1).toLocaleString()} others`
                    : isLikedTop && likesCount === 1
                    ? 'You liked this (1)'
                    : `${likesCount.toLocaleString()} ${likesCount === 1 ? 'like' : 'likes'}`}
                </span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleHeaderLikeTap}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isLikedTop
                  ? 'bg-[#E7F3FF] text-[#0866FF]'
                  : 'hover:bg-[#F0F2F5] text-[#65676B]'
              }`}
              title={isLikedTop ? 'Unlike' : 'Like'}
              aria-label={isLikedTop ? 'Unlike' : 'Like'}
            >
              <ThumbsUp className={`w-4.5 h-4.5 ${isLikedTop ? 'fill-[#0866FF]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#F0F2F5] text-[#65676B] hover:text-[#050505] transition-colors cursor-pointer"
              aria-label="Close comments"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Emoji Burst when quick reaction tapped */}
        {flyingReaction && (
          <div
            key={flyingReaction.id}
            className="pointer-events-none absolute bottom-32 left-1/2 -translate-x-1/2 z-30 text-4xl animate-bounce drop-shadow-lg select-none"
          >
            {flyingReaction.emoji}
          </div>
        )}

        {/* 2 & 5. MIDDLE SCROLL AREA: Empty state OR Comments list */}
        <div ref={listScrollRef} className="flex-1 overflow-y-auto px-4 py-3 bg-white">
          {comments.length === 0 ? (
            <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center px-4 py-6">
              {/* Big Facebook-style Comment Bubble Icon */}
              <div className="relative w-20 h-20 rounded-full bg-[#F0F2F5] flex items-center justify-center mb-3.5">
                <MessageCircle className="w-11 h-11 text-[#8A8D91] stroke-[1.7]" />
                <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-white border border-[#E4E6EB] flex items-center justify-center shadow-xs">
                  <span className="text-sm leading-none">💬</span>
                </div>
              </div>

              <h3 className="text-[19px] font-extrabold text-[#050505] leading-snug">
                Crickets over here
              </h3>
              <p className="text-[15px] font-bold text-[#050505] mt-0.5">
                এখানে এখনো কেউ কমেন্ট করেনি
              </p>

              <p className="text-[14px] text-[#65676B] mt-2 max-w-[290px] leading-snug">
                Care to break the silence? Leave a comment.
              </p>
              <p className="text-[13px] text-[#65676B] mt-0.5">
                প্রথম কমেন্টটি আপনি করুন
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 py-1">
              {comments.map((c) => {
                const likeKey = `${postId}::${c.id}`;
                const isCommentLiked = Boolean(commentLikesMap[likeKey] ?? c.isLiked);
                const commentLikeCount =
                  Math.max(0, c.likes || 0) + (commentLikesMap[likeKey] && !c.isLiked ? 1 : 0);
                const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  c.author || 'U'
                )}&backgroundColor=0866ff,1877f2,0ea5e9`;

                return (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <img
                      src={c.avatar || fallbackAvatar}
                      alt={c.author}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = fallbackAvatar;
                      }}
                      className="w-9 h-9 rounded-full object-cover border border-[#E4E6EB] bg-[#F0F2F5] shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="relative inline-block max-w-[94%] bg-[#F0F2F5] rounded-[18px] px-3.5 py-2">
                        <p className="text-[13px] font-bold text-[#050505] leading-tight">
                          {c.author}
                        </p>
                        <p className="text-[14.5px] text-[#050505] mt-0.5 break-words leading-snug whitespace-pre-wrap">
                          {c.text}
                        </p>

                        {commentLikeCount > 0 && (
                          <span className="absolute -bottom-2 -right-2 bg-white border border-[#E4E6EB] shadow-xs rounded-full px-1.5 py-0.5 text-[11px] font-bold text-[#050505] flex items-center gap-0.5">
                            <span className="w-3.5 h-3.5 rounded-full bg-[#0866FF] text-white inline-flex items-center justify-center">
                              <ThumbsUp className="w-2 h-2 fill-white stroke-white" />
                            </span>
                            <span className="tabular-nums">{commentLikeCount}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 px-2 mt-1.5 text-[12px] text-[#65676B]">
                        <span>{c.timeAgo || 'Just now'}</span>
                        <button
                          type="button"
                          onClick={() => handleCommentLikeToggle(c.id)}
                          className={`font-bold cursor-pointer transition-colors ${
                            isCommentLiked
                              ? 'text-[#0866FF]'
                              : 'text-[#65676B] hover:text-[#0866FF]'
                          }`}
                        >
                          {isCommentLiked ? 'Liked' : 'Like'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReplyClick(c.author)}
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

        {/* 3. REACTION ROW ABOVE COMMENT BOX: ❤️ 👏 🔥 🙌 🥺 😍 😮 😂 */}
        <div className="px-3 py-2 border-t border-[#E4E6EB] bg-white shrink-0">
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
            {FACEBOOK_QUICK_REACTIONS.map((item) => {
              const isSelected = selectedQuickEmoji === item.emoji && isLikedTop;
              return (
                <button
                  key={item.emoji}
                  type="button"
                  onClick={() => handleQuickEmojiTap(item)}
                  title={item.label}
                  aria-label={`React with ${item.label}`}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-[23px] leading-none transition-transform active:scale-125 hover:scale-115 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#E7F3FF] ring-2 ring-[#0866FF]/50 scale-110'
                      : 'hover:bg-[#F0F2F5]'
                  }`}
                >
                  <span>{item.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. BOTTOM BIG COMMENT BOX: "Comment as [My Name]" + MY profile photo on left */}
        <div className="px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] border-t border-[#F0F2F5] bg-white shrink-0 space-y-1.5">
          {replyingToAuthor && (
            <div className="flex items-center justify-between px-3 py-1 rounded-lg bg-[#E7F3FF] text-[#0866FF] text-xs font-semibold">
              <span>Replying to {replyingToAuthor}</span>
              <button
                type="button"
                onClick={() => setReplyingToAuthor(null)}
                className="text-[#0866FF] hover:underline font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2.5 w-full">
            <img
              src={resolvedMyAvatar}
              alt={myDisplayName}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  myDisplayName
                )}&backgroundColor=0866ff,1877f2,0ea5e9`;
              }}
              className="w-9 h-9 rounded-full object-cover border border-[#E4E6EB] bg-[#F0F2F5] shrink-0 mb-1"
            />
            <div className="flex-1 min-h-[48px] bg-[#F0F2F5] border border-[#E4E6EB] focus-within:border-[#0866FF] focus-within:bg-white rounded-[24px] px-3.5 py-1 flex items-end gap-2 transition-all">
              <textarea
                ref={textareaRef}
                rows={commentInput.includes('\n') || commentInput.length > 42 ? 2 : 1}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && commentInput.trim()) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder={`Comment as ${myDisplayName}`}
                className="flex-1 w-full bg-transparent text-[16px] leading-snug text-[#050505] placeholder-[#65676B] focus:outline-none resize-none min-h-[40px] py-2"
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
        </div>
      </div>
    </div>
  );
};
