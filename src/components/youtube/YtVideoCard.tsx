import React, { useState } from 'react';
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Play,
  Gift,
  Check,
  UserPlus,
  Flag,
  Ban,
} from 'lucide-react';
import { PostItem } from '../../types';
import { useResolvedMediaUrl, isBunnyEmbedUrl } from '../../lib/mediaStorage';

interface YtVideoCardProps {
  post: PostItem;
  isSubscribed: boolean;
  onToggleSubscribe: (post: PostItem) => void;
  onWatchVideo: (post: PostItem) => void;
  onToggleLike: (postId: string) => void;
  onOpenComments: (post: PostItem) => void;
  onShare: (post: PostItem) => void;
  onToggleSave: (postId: string) => void;
  onOpenGift: (post: PostItem) => void;
  onOpenReportBlock: (post: PostItem) => void;
}

function formatCompactViews(views?: number): string {
  const n = typeof views === 'number' ? views : 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K views`;
  return `${Math.max(1, n)} views`;
}

export const YtVideoCard: React.FC<YtVideoCardProps> = ({
  post,
  isSubscribed,
  onToggleSubscribe,
  onWatchVideo,
  onToggleLike,
  onOpenComments,
  onShare,
  onToggleSave,
  onOpenGift,
  onOpenReportBlock,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const rawThumb =
    post.thumbnailUrl ||
    (post.mediaType === 'image' ? post.mediaUrl || post.mediaUrls?.[0] : undefined) ||
    (post.youtubeId ? `https://i.ytimg.com/vi/${post.youtubeId}/hqdefault.jpg` : undefined);

  const resolvedThumb = useResolvedMediaUrl(rawThumb);
  const resolvedMedia = useResolvedMediaUrl(post.mediaUrl);
  const isBunnyVideo = isBunnyEmbedUrl(resolvedMedia || post.mediaUrl || '');
  const isDirectVideoFile =
    post.mediaType === 'video' &&
    Boolean(resolvedMedia) &&
    !isBunnyVideo &&
    !post.youtubeId &&
    !resolvedThumb;

  const isLiked = Boolean(post.userReaction);
  const likesCount = post.reactions?.total ?? 0;
  const commentsCount = post.comments?.length ?? 0;

  return (
    <article className="bg-white border-b sm:border sm:border-zinc-200 sm:rounded-2xl overflow-hidden flex flex-col">
      {/* 16:9 Video Thumbnail */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onWatchVideo(post)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onWatchVideo(post);
          }
        }}
        className="relative aspect-video w-full bg-zinc-950 overflow-hidden cursor-pointer group"
      >
        {resolvedThumb ? (
          <img
            src={resolvedThumb}
            alt={post.contentBangla || 'Peaceverse24 Video'}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        ) : isDirectVideoFile ? (
          <video
            src={resolvedMedia}
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-emerald-950 flex flex-col items-center justify-center p-4 text-center">
            <span className="w-14 h-14 rounded-full bg-[#DC2626] text-white flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </span>
            <span className="mt-2 text-xs font-bold text-white/80 line-clamp-2 max-w-xs">
              {post.contentBangla || 'Peaceverse24 Video'}
            </span>
          </div>
        )}

        {/* Center Play Overlay on hover */}
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="w-12 h-12 rounded-full bg-[#DC2626]/95 text-white flex items-center justify-center shadow-xl">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </span>
        </div>

        {/* Duration / Live badge */}
        <span
          className={`absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide text-white ${
            post.isLive ? 'bg-[#DC2626]' : 'bg-black/80'
          }`}
        >
          {post.isLive ? 'LIVE' : post.duration || '04:20'}
        </span>

        {post.isShort && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#DC2626] text-white text-[10px] font-extrabold uppercase tracking-wider">
            Short
          </span>
        )}
      </div>

      {/* Video Info Row: Channel Avatar + Title + Channel Name + Views + Subscribe + 3-dot Menu */}
      <div className="px-3.5 pt-3 pb-2 flex items-start gap-3">
        <img
          src={post.author.avatar}
          alt={post.author.name}
          className="w-10 h-10 rounded-full object-cover border border-zinc-200 shrink-0 mt-0.5"
        />

        <div className="flex-1 min-w-0">
          <h3
            onClick={() => onWatchVideo(post)}
            className="text-[15px] font-bold text-zinc-950 leading-snug line-clamp-2 cursor-pointer hover:text-[#DC2626] transition-colors"
          >
            {post.contentBangla || 'Peaceverse24 Peaceful Video'}
          </h3>

          <p className="text-xs text-zinc-600 mt-1 truncate">
            <span className="font-semibold text-zinc-800">{post.author.name}</span>
            {' · '}
            <span>{formatCompactViews(post.viewsCount)}</span>
            {' · '}
            <span>{post.timeAgo || 'Just now'}</span>
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0 relative">
          <button
            type="button"
            onClick={() => onToggleSubscribe(post)}
            className={`h-8 px-3 rounded-full text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
              isSubscribed
                ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                : 'bg-[#16A34A] text-white hover:bg-[#15803D]'
            }`}
          >
            {isSubscribed ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Subscribed</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Subscribe</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500 cursor-pointer"
            aria-label="Video options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-30 w-44 bg-white rounded-xl shadow-xl border border-zinc-200 py-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenReportBlock(post);
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-zinc-800 hover:bg-zinc-50 flex items-center gap-2 font-semibold cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>Report Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenReportBlock(post);
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-zinc-800 hover:bg-zinc-50 flex items-center gap-2 font-semibold cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5 text-zinc-700" />
                  <span>Block Channel</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Bar Below Video: Like, Comment, Share, Save (+ Gift) */}
      <div className="px-3 pb-3 pt-1 flex items-center justify-between gap-1 border-t border-zinc-100 mt-1">
        <button
          type="button"
          onClick={() => onToggleLike(post.id)}
          className={`flex-1 h-9 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            isLiked
              ? 'bg-red-50 text-[#DC2626]'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-[#DC2626]' : ''}`} />
          <span>{likesCount > 0 ? likesCount.toLocaleString() : 'Like'}</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenComments(post)}
          className="flex-1 h-9 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{commentsCount > 0 ? commentsCount : 'Comment'}</span>
        </button>

        <button
          type="button"
          onClick={() => onShare(post)}
          className="flex-1 h-9 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleSave(post.id)}
          className={`flex-1 h-9 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            post.isSaved
              ? 'bg-emerald-50 text-[#16A34A]'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-[#16A34A]' : ''}`} />
          <span>{post.isSaved ? 'Saved' : 'Save'}</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenGift(post)}
          className="h-9 px-2.5 rounded-xl text-xs font-bold text-[#16A34A] hover:bg-emerald-50 inline-flex items-center justify-center gap-1 cursor-pointer transition-colors"
          aria-label="Send Gift"
        >
          <Gift className="w-4 h-4" />
          <span className="hidden sm:inline">Gift</span>
        </button>
      </div>
    </article>
  );
};
