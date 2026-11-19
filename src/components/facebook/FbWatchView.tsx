import React, { useState } from 'react';
import { PostItem, ReactionType } from '../../types';
import { FbPostCard } from './FbPostCard';
import { Tv, Radio, Sparkles, Filter, ArrowLeft } from 'lucide-react';

interface FbWatchViewProps {
  posts: PostItem[];
  onToggleReaction: (postId: string, reaction: ReactionType) => void;
  onToggleSave: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onBack?: () => void;
  onOpenReel?: (post: PostItem) => void;
  onOpenGiftModal?: (post: PostItem) => void;
  onOpenLive?: () => void;
}

export const FbWatchView: React.FC<FbWatchViewProps> = ({
  posts,
  onToggleReaction,
  onToggleSave,
  onAddComment,
  onBack,
  onOpenReel,
  onOpenGiftModal,
  onOpenLive,
}) => {
  const [filter, setFilter] = useState<string>('all');

  const videoPosts = posts.filter((p) => p.mediaType === 'video');

  const filteredVideos = videoPosts.filter((p) => {
    const text = `${p.contentBangla} ${p.author.subtitle || ''}`.toLowerCase();
    if (filter === 'live') return Boolean(p.isLive);
    if (filter === 'makkah') return text.includes('makkah') || text.includes('মক্কা');
    if (filter === 'madinah') return text.includes('madinah') || text.includes('মদিনা');
    if (filter === 'quran') return p.category === 'Quran' || text.includes('তিলাওয়াত') || text.includes('কুরআন');
    if (filter === 'rain') return text.includes('বৃষ্টি') || text.includes('rain');
    if (filter === 'jumua') return text.includes('জুম') || text.includes('দরূদ') || text.includes('jumua');
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24 font-sans">
      {/* Facebook Watch Header & Filter Pills */}
      <div className="bg-white rounded-[8px] border border-[#E4E6EB] p-3 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1 rounded-full hover:bg-[#F0F2F5] text-black transition-colors cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
            <Tv className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 className="text-base font-bold text-black truncate">Peaceverse24 Video</h2>
          </div>
          {onOpenLive ? (
            <button
              type="button"
              onClick={onOpenLive}
              className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Go Live as Akherath</span>
            </button>
          ) : (
            <span className="text-xs text-rose-600 font-bold flex items-center gap-1">
              <Radio className="w-3.5 h-3.5" />
              <span>Live</span>
            </span>
          )}
        </div>

        {/* Halal Video Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Videos' },
            { id: 'live', label: 'Live Now' },
            { id: 'makkah', label: 'Makkah Live' },
            { id: 'madinah', label: 'Madinah' },
            { id: 'quran', label: 'Quran Tilawat' },
            { id: 'rain', label: 'Rain Shukriya' },
            { id: 'jumua', label: 'Jumua Darud' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Videos List */}
      <div className="space-y-4">
        {filteredVideos.length === 0 ? (
          <div className="bg-white rounded-[8px] border border-[#E4E6EB] p-8 text-center space-y-2">
            <p className="text-sm font-bold text-black">No videos found in this category yet</p>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="px-4 py-1.5 rounded-lg bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
            >
              Show All Videos
            </button>
          </div>
        ) : (
          filteredVideos.map((post) => (
            <FbPostCard
              key={post.id}
              post={post}
              onToggleReaction={onToggleReaction}
              onToggleSave={onToggleSave}
              onAddComment={onAddComment}
              onOpenReel={onOpenReel}
              onOpenGiftModal={onOpenGiftModal}
            />
          ))
        )}
      </div>
    </div>
  );
};
