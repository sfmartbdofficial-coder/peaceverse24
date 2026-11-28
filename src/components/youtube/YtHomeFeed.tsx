import React, { useMemo, useState } from 'react';
import { Film, Play, Plus, SearchX, ChevronRight } from 'lucide-react';
import { PostItem } from '../../types';
import { YtVideoCard } from './YtVideoCard';
import { isTargetFollowedLocally } from '../../lib/firebase';
import { useResolvedMediaUrl } from '../../lib/mediaStorage';

interface YtHomeFeedProps {
  posts: PostItem[];
  searchQuery: string;
  blockedCreatorIds: string[];
  followsTick: number;
  onToggleSubscribe: (post: PostItem) => void;
  onWatchVideo: (post: PostItem) => void;
  onOpenShortsAt: (postId?: string) => void;
  onToggleLike: (postId: string) => void;
  onOpenComments: (post: PostItem) => void;
  onShare: (post: PostItem) => void;
  onToggleSave: (postId: string) => void;
  onOpenGift: (post: PostItem) => void;
  onOpenReportBlock: (post: PostItem) => void;
  onOpenUpload: () => void;
}

const CATEGORIES = [
  'All',
  'Quran',
  'Lectures',
  'Nasheed',
  'Kids',
  'Hadith',
  'Bangla',
];

const ShortShelfCard: React.FC<{
  post: PostItem;
  onClick: () => void;
}> = ({ post, onClick }) => {
  const thumb = useResolvedMediaUrl(
    post.thumbnailUrl || (post.mediaType === 'image' ? post.mediaUrl : undefined)
  );
  const media = useResolvedMediaUrl(post.mediaUrl);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-[136px] sm:w-[152px] aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-900 shrink-0 group text-left cursor-pointer border border-zinc-200 shadow-xs"
    >
      {thumb ? (
        <img
          src={thumb}
          alt={post.contentBangla}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      ) : media && !media.includes('iframe.mediadelivery.net') ? (
        <video
          src={media}
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-b from-emerald-900 via-zinc-900 to-black flex items-center justify-center">
          <Play className="w-8 h-8 text-white fill-white opacity-90" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#DC2626] text-white text-[10px] font-extrabold">
        {post.duration || '0:45'}
      </span>
      <div className="absolute bottom-2.5 inset-x-2.5">
        <p className="text-xs font-bold text-white line-clamp-2 leading-snug">
          {post.contentBangla || 'Peace Short'}
        </p>
        <p className="text-[10px] text-white/75 mt-0.5 truncate">
          {post.viewsCount ? `${post.viewsCount.toLocaleString()} views` : post.author.name}
        </p>
      </div>
    </button>
  );
};

export const YtHomeFeed: React.FC<YtHomeFeedProps> = ({
  posts,
  searchQuery,
  blockedCreatorIds,
  followsTick,
  onToggleSubscribe,
  onWatchVideo,
  onOpenShortsAt,
  onToggleLike,
  onOpenComments,
  onShare,
  onToggleSave,
  onOpenGift,
  onOpenReportBlock,
  onOpenUpload,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const blockedSet = useMemo(() => new Set(blockedCreatorIds), [blockedCreatorIds]);

  const unblockedVideoPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((p) => {
      if (p.status === 'blocked' || p.status === 'rejected') return false;
      const authorKey = p.authorId || p.author.name;
      if (blockedSet.has(authorKey) || blockedSet.has(p.author.name)) return false;

      if (selectedCategory !== 'All') {
        const cat = (p.category || '').toLowerCase();
        const text = `${p.contentBangla || ''} ${(p.hashtags || []).join(' ')}`.toLowerCase();
        const key = selectedCategory.toLowerCase();
        if (!cat.includes(key) && !text.includes(key)) return false;
      }

      if (q) {
        const hay = `${p.contentBangla || ''} ${p.author.name} ${p.category || ''} ${(p.hashtags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [posts, blockedSet, selectedCategory, searchQuery]);

  const shortsList = useMemo(() => {
    return unblockedVideoPosts.filter(
      (p) =>
        p.isShort ||
        p.videoKind === 'reel' ||
        (typeof p.durationSeconds === 'number' && p.durationSeconds >= 15 && p.durationSeconds <= 60)
    );
  }, [unblockedVideoPosts]);

  const mainVideos = useMemo(() => {
    const nonShorts = unblockedVideoPosts.filter((p) => !p.isShort && p.videoKind !== 'reel');
    return nonShorts.length > 0 ? nonShorts : unblockedVideoPosts;
  }, [unblockedVideoPosts]);

  return (
    <div className="max-w-7xl mx-auto pb-24">
      {/* Category Chip Strip */}
      <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-sm border-b border-zinc-200 px-3 sm:px-5 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === cat
                ? 'bg-zinc-950 text-white'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Peace Shorts Shelf */}
      {shortsList.length > 0 && !searchQuery.trim() && (
        <section className="px-3 sm:px-5 pt-4 pb-2 border-b border-zinc-200/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#DC2626] text-white flex items-center justify-center">
                <Film className="w-4 h-4" />
              </span>
              <h2 className="text-base font-extrabold text-zinc-950 tracking-tight">
                Peace Shorts
              </h2>
              <span className="text-[11px] font-semibold text-zinc-500">15s – 1 min</span>
            </div>
            <button
              type="button"
              onClick={() => onOpenShortsAt(shortsList[0]?.id)}
              className="text-xs font-bold text-[#16A34A] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>Watch all</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-2">
            {shortsList.slice(0, 10).map((shortPost) => (
              <ShortShelfCard
                key={shortPost.id}
                post={shortPost}
                onClick={() => onOpenShortsAt(shortPost.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Vertical YouTube Video Feed */}
      {mainVideos.length === 0 ? (
        <div className="px-4 py-16 text-center max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-500 flex items-center justify-center mx-auto">
            <SearchX className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-zinc-950">No matching videos found</h3>
          <p className="text-xs text-zinc-500">
            Try another keyword, switch category, or upload your own peaceful Halal video.
          </p>
          <button
            type="button"
            onClick={onOpenUpload}
            className="h-10 px-5 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Video</span>
          </button>
        </div>
      ) : (
        <div className="sm:px-5 sm:pt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 sm:gap-5">
          {mainVideos.map((post) => {
            void followsTick;
            const isSub = isTargetFollowedLocally(post.authorId, post.author.name);
            return (
              <YtVideoCard
                key={post.id}
                post={post}
                isSubscribed={isSub}
                onToggleSubscribe={onToggleSubscribe}
                onWatchVideo={onWatchVideo}
                onToggleLike={onToggleLike}
                onOpenComments={onOpenComments}
                onShare={onShare}
                onToggleSave={onToggleSave}
                onOpenGift={onOpenGift}
                onOpenReportBlock={onOpenReportBlock}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
