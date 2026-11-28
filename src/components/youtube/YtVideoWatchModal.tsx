import React, { useState, useRef } from 'react';
import {
  X,
  ThumbsUp,
  Share2,
  Bookmark,
  Gift,
  Check,
  UserPlus,
  Send,
  Flag,
  MessageCircle,
  Play,
} from 'lucide-react';
import { PostItem, UserProfile } from '../../types';
import { useResolvedMediaUrl, useAttachVideoSrc, isBunnyEmbedUrl } from '../../lib/mediaStorage';

interface YtVideoWatchModalProps {
  post: PostItem | null;
  onClose: () => void;
  userProfile: UserProfile;
  isSubscribed: boolean;
  onToggleSubscribe: (post: PostItem) => void;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onShare: (post: PostItem) => void;
  onAddComment: (postId: string, text: string) => void;
  onOpenGift: (post: PostItem) => void;
  onOpenReportBlock: (post: PostItem) => void;
}

export const YtVideoWatchModal: React.FC<YtVideoWatchModalProps> = ({
  post,
  onClose,
  userProfile,
  isSubscribed,
  onToggleSubscribe,
  onToggleLike,
  onToggleSave,
  onShare,
  onAddComment,
  onOpenGift,
  onOpenReportBlock,
}) => {
  const [commentText, setCommentText] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const resolvedMedia = useResolvedMediaUrl(post?.mediaUrl);
  const resolvedThumb = useResolvedMediaUrl(post?.thumbnailUrl);
  const isBunny = isBunnyEmbedUrl(resolvedMedia || post?.mediaUrl || '');

  useAttachVideoSrc(
    videoRef,
    !isBunny && post?.mediaType === 'video' && !post?.youtubeId ? resolvedMedia : undefined
  );

  if (!post) return null;

  const isLiked = Boolean(post.userReaction);
  const likesCount = post.reactions?.total ?? 0;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = commentText.trim();
    if (!clean) return;
    onAddComment(post.id, clean);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-4xl h-full sm:h-auto sm:max-h-[94vh] bg-white sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Top Bar */}
        <div className="h-12 px-4 border-b border-zinc-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-5 rounded-md bg-[#DC2626] text-white flex items-center justify-center shrink-0">
              <Play className="w-3 h-3 fill-white" />
            </span>
            <span className="text-xs font-extrabold text-zinc-900 truncate">
              Peaceverse24 Player
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-700 cursor-pointer"
            aria-label="Close video player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Player Stage */}
          <div className="aspect-video w-full bg-black relative">
            {isBunny ? (
              <iframe
                src={resolvedMedia || post.mediaUrl}
                title={post.contentBangla || 'Peaceverse24 Video'}
                className="w-full h-full border-0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : post.youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${post.youtubeId}?autoplay=1&rel=0`}
                title={post.contentBangla || 'Peaceverse24 Video'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : post.mediaType === 'video' && resolvedMedia ? (
              <video
                ref={videoRef}
                poster={resolvedThumb || undefined}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <img
                src={resolvedThumb || resolvedMedia || post.author.avatar}
                alt={post.contentBangla}
                className="w-full h-full object-contain bg-black"
              />
            )}
          </div>

          {/* Video Details & Controls */}
          <div className="p-4 sm:p-5 space-y-4">
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-zinc-950 leading-snug">
                {post.contentBangla || 'Peaceverse24 Video'}
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                {(post.viewsCount || 1).toLocaleString()} views · {post.timeAgo}
                {post.category ? ` · ${post.category}` : ''}
              </p>
              {post.hashtags && post.hashtags.length > 0 && (
                <p className="text-xs font-semibold text-[#16A34A] mt-1">
                  {post.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}
                </p>
              )}
            </div>

            {/* Channel Row */}
            <div className="flex items-center justify-between gap-3 py-2 border-y border-zinc-200">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-11 h-11 rounded-full object-cover border border-zinc-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-zinc-950 truncate">
                    {post.author.name}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    {(post.channelSubscribers ?? 1200).toLocaleString()} subscribers
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleSubscribe(post)}
                className={`h-9 px-4 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
                  isSubscribed
                    ? 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'
                    : 'bg-[#16A34A] hover:bg-[#15803D] text-white'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            </div>

            {/* Action Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => onToggleLike(post.id)}
                className={`h-9 px-4 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isLiked ? 'bg-red-50 text-[#DC2626] border border-red-200' : 'bg-zinc-100 text-zinc-800'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-[#DC2626]' : ''}`} />
                <span>Like ({likesCount.toLocaleString()})</span>
              </button>

              <button
                type="button"
                onClick={() => onShare(post)}
                className="h-9 px-4 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleSave(post.id)}
                className={`h-9 px-4 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  post.isSaved ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200' : 'bg-zinc-100 text-zinc-800'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-[#16A34A]' : ''}`} />
                <span>{post.isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenGift(post)}
                className="h-9 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Gift className="w-4 h-4" />
                <span>Gift ({post.goldenGiftsAmount || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenReportBlock(post)}
                className="h-9 px-3.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>Report</span>
              </button>
            </div>

            {/* Comments Section */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2 text-sm font-extrabold text-zinc-950">
                <MessageCircle className="w-4 h-4 text-[#16A34A]" />
                <span>Comments ({post.comments?.length || 0})</span>
              </div>

              <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a peaceful comment..."
                  className="flex-1 h-10 px-3.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:border-[#16A34A] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="w-10 h-10 rounded-full bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-40 text-white flex items-center justify-center cursor-pointer shrink-0"
                  aria-label="Post comment"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="space-y-3 pt-1">
                {(post.comments || []).length === 0 ? (
                  <p className="text-xs text-zinc-500 py-2">
                    Be the first to share a peaceful comment.
                  </p>
                ) : (
                  (post.comments || []).map((c) => (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <img
                        src={c.avatar}
                        alt={c.author}
                        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                      />
                      <div className="flex-1 bg-zinc-50 border border-zinc-200/80 rounded-2xl px-3 py-2">
                        <p className="text-xs font-bold text-zinc-900">
                          {c.author} <span className="font-normal text-zinc-400">· {c.timeAgo}</span>
                        </p>
                        <p className="text-xs text-zinc-800 mt-0.5 leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
