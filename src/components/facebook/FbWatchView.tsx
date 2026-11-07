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
}

export const FbWatchView: React.FC<FbWatchViewProps> = ({
  posts,
  onToggleReaction,
  onToggleSave,
  onAddComment,
  onBack,
}) => {
  const [filter, setFilter] = useState<'all' | 'live' | 'quran' | 'lecture'>('all');

  const videoPosts = posts.filter((p) => p.mediaType === 'video');

  const filteredVideos = videoPosts.filter((p) => {
    if (filter === 'live') return p.isLive;
    if (filter === 'quran') return p.category === 'Quran';
    if (filter === 'lecture') return p.category === 'Lecture';
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24 font-sans">
      {/* Facebook Watch Header & Filter Pills */}
      <div className="bg-white dark:bg-[#242526] rounded-[8px] border border-[#E4E6EB] dark:border-[#393a3b] p-3 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1 rounded-full hover:bg-[#F0F2F5] dark:hover:bg-[#3a3b3c] text-[#050505] dark:text-white transition-colors cursor-pointer"
                title="পেছনে যান (Back)"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
            <Tv className="w-5 h-5 text-[#0866FF]" />
            <h2 className="text-base font-bold text-[#050505] dark:text-white">Peaceverse Video (ভিডিও)</h2>
          </div>
          <span className="text-xs text-rose-500 font-bold flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>লাইভ</span>
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'সকল ভিডিও' },
            { id: 'live', label: '🔴 সরাসরি লাইভ' },
            { id: 'quran', label: '📖 কুরআন তিলাওয়াত' },
            { id: 'lecture', label: '🎙️ ইসলামিক বয়ান' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#0866FF] text-white shadow-xs'
                  : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] dark:bg-[#3a3b3c] dark:text-[#b0b3b8] dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Videos List */}
      <div className="space-y-4">
        {filteredVideos.map((post) => (
          <FbPostCard
            key={post.id}
            post={post}
            onToggleReaction={onToggleReaction}
            onToggleSave={onToggleSave}
            onAddComment={onAddComment}
          />
        ))}
      </div>
    </div>
  );
};
