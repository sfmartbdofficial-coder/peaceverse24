import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  Gift,
  MoreVertical,
  Check,
  UserPlus,
  Send,
  X,
  Plus,
} from 'lucide-react';
import { PostItem, UserProfile } from '../../types';
import { useResolvedMediaUrl, useAttachVideoSrc, isBunnyEmbedUrl } from '../../lib/mediaStorage';
import { isTargetFollowedLocally } from '../../lib/firebase';

interface YtShortsViewProps {
  posts: PostItem[];
  initialShortId?: string | null;
  userProfile: UserProfile;
  blockedCreatorIds: string[];
  followsTick: number;
  onBack: () => void;
  onOpenUploadShort: () => void;
  onToggleSubscribe: (post: PostItem) => void;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onShare: (post: PostItem) => void;
  onAddComment: (postId: string, text: string) => void;
  onOpenGift: (post: PostItem) => void;
  onOpenReportBlock: (post: PostItem) => void;
}

const ShortSlide: React.FC<{
  post: PostItem;
  isActive: boolean;
  isSubscribed: boolean;
  onToggleSubscribe: () => void;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onShare: () => void;
  onOpenComments: () => void;
  onOpenGift: () => void;
  onOpenReportBlock: () => void;
}> = ({
  post,
  isActive,
  isSubscribed,
  onToggleSubscribe,
  onToggleLike,
  onToggleSave,
  onShare,
  onOpenComments,
  onOpenGift,
  onOpenReportBlock,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const resolvedMedia = useResolvedMediaUrl(post.mediaUrl);
  const resolvedThumb = useResolvedMediaUrl(post.thumbnailUrl);
  const isBunny = isBunnyEmbedUrl(resolvedMedia || post.mediaUrl || '');

  useAttachVideoSrc(
    videoRef,
    !isBunny && !post.youtubeId && post.mediaType === 'video' ? resolvedMedia : undefined
  );

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isActive) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [isActive]);

  const isLiked = Boolean(post.userReaction);
  const likesCount = post.reactions?.total ?? 0;
  const commentsCount = post.comments?.length ?? 0;

  return (
    <div className="relative w-full h-[calc(100dvh-4rem)] snap-start snap-always flex items-center justify-center bg-black overflow-hidden">
      <div className="relative w-full max-w-[440px] h-full bg-zinc-950 overflow-hidden">
        {isBunny ? (
          <iframe
            src={resolvedMedia || post.mediaUrl}
            title={post.contentBangla || 'Peace Short'}
            className="w-full h-full border-0"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : post.youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${post.youtubeId}?autoplay=${isActive ? 1 : 0}&loop=1&playlist=${post.youtubeId}&rel=0`}
            title={post.contentBangla || 'Peace Short'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : post.mediaType === 'video' && resolvedMedia ? (
          <video
            ref={videoRef}
            poster={resolvedThumb || undefined}
            loop
            playsInline
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={resolvedThumb || resolvedMedia || post.author.avatar}
            alt={post.contentBangla}
            className="w-full h-full object-cover"
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        {/* Right Side YouTube Shorts Action Buttons */}
        <div className="absolute right-3 bottom-6 z-20 flex flex-col items-center gap-4 text-white">
          <button
            type="button"
            onClick={onToggleLike}
            className="flex flex-col items-center gap-1 cursor-pointer"
          >
            <span
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
                isLiked ? 'bg-[#DC2626]' : 'bg-black/45 hover:bg-black/65'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
            </span>
            <span className="text-[11px] font-bold">{likesCount}</span>
          </button>

          <button
            type="button"
            onClick={onOpenComments}
            className="flex flex-col items-center gap-1 cursor-pointer"
          >
            <span className="w-11 h-11 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold">{commentsCount}</span>
          </button>

          <button
            type="button"
            onClick={onShare}
            className="flex flex-col items-center gap-1 cursor-pointer"
          >
            <span className="w-11 h-11 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold">Share</span>
          </button>

          <button
            type="button"
            onClick={onToggleSave}
            className="flex flex-col items-center gap-1 cursor-pointer"
          >
            <span
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md ${
                post.isSaved ? 'bg-[#16A34A]' : 'bg-black/45 hover:bg-black/65'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${post.isSaved ? 'fill-white' : ''}`} />
            </span>
            <span className="text-[11px] font-bold">Save</span>
          </button>

          <button
            type="button"
            onClick={onOpenGift}
            className="flex flex-col items-center gap-1 cursor-pointer"
          >
            <span className="w-11 h-11 rounded-full bg-[#16A34A] hover:bg-[#15803D] flex items-center justify-center shadow-lg">
              <Gift className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold">Gift</span>
          </button>

          <button
            type="button"
            onClick={onOpenReportBlock}
            className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 flex items-center justify-center cursor-pointer"
            aria-label="Report or Block"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom-Left Info */}
        <div className="absolute left-3.5 right-16 bottom-6 z-20 text-white space-y-2">
          <div className="flex items-center gap-2">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-9 h-9 rounded-full object-cover border border-white/40 shrink-0"
            />
            <span className="text-xs font-extrabold truncate">{post.author.name}</span>
            <button
              type="button"
              onClick={onToggleSubscribe}
              className={`h-7 px-3 rounded-full text-[11px] font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer ${
                isSubscribed ? 'bg-white/20 text-white' : 'bg-[#DC2626] text-white'
              }`}
            >
              {isSubscribed ? <Check className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
              <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
            </button>
          </div>

          <p className="text-sm font-bold leading-snug line-clamp-2">
            {post.contentBangla || 'Peaceverse24 Short'}
          </p>

          <p className="text-[11px] text-emerald-300 font-semibold">
            {(post.hashtags && post.hashtags.length > 0
              ? post.hashtags
              : ['#Peaceverse24', '#PeaceShorts']
            )
              .map((t) => (t.startsWith('#') ? t : `#${t}`))
              .join(' ')}{' '}
            · {post.duration || '0:45'}
          </p>
        </div>
      </div>
    </div>
  );
};

export const YtShortsView: React.FC<YtShortsViewProps> = ({
  posts,
  initialShortId,
  userProfile,
  blockedCreatorIds,
  followsTick,
  onBack,
  onOpenUploadShort,
  onToggleSubscribe,
  onToggleLike,
  onToggleSave,
  onShare,
  onAddComment,
  onOpenGift,
  onOpenReportBlock,
}) => {
  const blockedSet = useMemo(() => new Set(blockedCreatorIds), [blockedCreatorIds]);
  const shorts = useMemo(() => {
    const list = posts.filter((p) => {
      if (p.status === 'blocked' || p.status === 'rejected') return false;
      if (blockedSet.has(p.authorId || p.author.name) || blockedSet.has(p.author.name)) return false;
      return (
        p.isShort ||
        p.videoKind === 'reel' ||
        p.mediaType === 'video'
      );
    });
    if (initialShortId) {
      const idx = list.findIndex((s) => s.id === initialShortId);
      if (idx > 0) {
        const picked = list[idx];
        return [picked, ...list.slice(0, idx), ...list.slice(idx + 1)];
      }
    }
    return list;
  }, [posts, initialShortId, blockedSet]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [commentDrawerPost, setCommentDrawerPost] = useState<PostItem | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || el.clientHeight === 0) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    if (idx !== activeIndex) setActiveIndex(idx);
  };

  return (
    <div className="relative bg-black min-h-[calc(100dvh-4rem)] text-white">
      {/* Top Overlay Controls */}
      <div className="fixed top-3 inset-x-3 z-30 max-w-[440px] mx-auto flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={onBack}
          className="pointer-events-auto h-10 px-3 rounded-full bg-black/55 backdrop-blur-md text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>

        <span className="px-3 py-1 rounded-full bg-black/55 backdrop-blur-md text-xs font-extrabold">
          Peace Shorts (15s–1m)
        </span>

        <button
          type="button"
          onClick={onOpenUploadShort}
          className="pointer-events-auto h-10 px-3 rounded-full bg-[#DC2626] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Short</span>
        </button>
      </div>

      {/* Vertical Swipe Snap Feed */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-[calc(100dvh-4rem)] overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {shorts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
            <p className="text-base font-bold">No Peace Shorts yet</p>
            <p className="text-xs text-zinc-400">Upload a 15 sec – 1 min peaceful video to begin.</p>
            <button
              type="button"
              onClick={onOpenUploadShort}
              className="px-5 py-2.5 rounded-full bg-[#DC2626] text-white text-xs font-bold cursor-pointer"
            >
              Upload Peace Short
            </button>
          </div>
        ) : (
          shorts.map((shortPost, idx) => {
            void followsTick;
            return (
              <ShortSlide
                key={shortPost.id}
                post={shortPost}
                isActive={idx === activeIndex}
                isSubscribed={isTargetFollowedLocally(shortPost.authorId, shortPost.author.name)}
                onToggleSubscribe={() => onToggleSubscribe(shortPost)}
                onToggleLike={() => onToggleLike(shortPost.id)}
                onToggleSave={() => onToggleSave(shortPost.id)}
                onShare={() => onShare(shortPost)}
                onOpenComments={() => setCommentDrawerPost(shortPost)}
                onOpenGift={() => onOpenGift(shortPost)}
                onOpenReportBlock={() => onOpenReportBlock(shortPost)}
              />
            );
          })
        )}
      </div>

      {/* Comments Drawer */}
      {commentDrawerPost && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="w-full max-w-[440px] bg-white text-zinc-950 rounded-t-3xl max-h-[70vh] flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
              <span className="text-sm font-extrabold">
                Comments ({(posts.find((p) => p.id === commentDrawerPost.id)?.comments || []).length})
              </span>
              <button
                type="button"
                onClick={() => setCommentDrawerPost(null)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(posts.find((p) => p.id === commentDrawerPost.id)?.comments || []).map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <img src={c.avatar} alt={c.author} className="w-8 h-8 rounded-full object-cover" />
                  <div className="bg-zinc-100 rounded-2xl px-3 py-2 flex-1">
                    <p className="text-xs font-bold">{c.author}</p>
                    <p className="text-xs text-zinc-800">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!commentInput.trim()) return;
                onAddComment(commentDrawerPost.id, commentInput.trim());
                setCommentInput('');
              }}
              className="p-3 border-t border-zinc-200 flex items-center gap-2"
            >
              <img src={userProfile.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a peaceful comment..."
                className="flex-1 h-10 px-3.5 rounded-full bg-zinc-100 text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-[#16A34A] text-white flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
