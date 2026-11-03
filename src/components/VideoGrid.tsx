import React, { useState } from 'react';
import { IslamicVideo } from '../types';
import { VideoCard } from './VideoCard';
import { Sparkles, AlertCircle, LayoutGrid, Columns2, ShieldCheck } from 'lucide-react';

interface VideoGridProps {
  videos: IslamicVideo[];
  onPlay: (video: IslamicVideo) => void;
  savedVideoIds: string[];
  onToggleSave: (video: IslamicVideo) => void;
  selectedCategory: string;
  searchQuery: string;
  onClearFilters: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  onPlay,
  savedVideoIds,
  onToggleSave,
  selectedCategory,
  searchQuery,
  onClearFilters,
}) => {
  const [columnsMode, setColumnsMode] = useState<'two' | 'responsive'>('two');

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-neutral-200">
          কোনো হালাল ভিডিও বা তিলাওয়াত পাওয়া যায়নি
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mt-1 font-bengali">
          &quot;{searchQuery || selectedCategory}&quot; এর জন্য কোনো ফলাফল নেই। অন্য কোনো সূরা, দোয়া বা হাদিসের নাম দিয়ে অনুসন্ধান করুন।
        </p>
        <button
          onClick={onClearFilters}
          className="mt-4 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-semibold transition-colors shadow-lg"
        >
          ফিল্টার রিসেট করুন (Show All)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto px-2.5 sm:px-4 py-4 pb-24">
      {/* Featured Spiritual Verse Banner (Shown when on Home with no search) */}
      {!searchQuery && selectedCategory === 'All' && (
        <div className="mb-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-black border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Qalby আজকের রূহানি বাণী (Ayah of the Day)</span>
            </div>
            <span className="text-[10px] bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
              ১০০% হালাল ফিড
            </span>
          </div>

          <p className="text-sm sm:text-base font-arabic text-emerald-100 font-bold tracking-wide">
            فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ
          </p>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1.5 font-bengali leading-relaxed">
            &quot;অতএব তোমরা আমাকে স্মরণ কর, আমিও তোমাদের স্মরণ করব। আর আমার প্রতি কৃতজ্ঞতা জ্ঞাপন কর এবং অকৃতজ্ঞ হয়ো না।&quot; — সূরা আল-বাক্বারাহ [২:১৫২]
          </p>
        </div>
      )}

      {/* Grid Header Info + 2-Column Mode Indicator */}
      <div className="flex items-center justify-between mb-3.5 px-1">
        <h2 className="text-xs sm:text-sm font-bold text-neutral-200 flex items-center gap-2">
          <span>
            {searchQuery
              ? `অনুসন্ধান: "${searchQuery}"`
              : selectedCategory === 'All'
              ? 'Qalby ফিড (সবগুলো তিলাওয়াত ও কন্টেন্ট)'
              : `${selectedCategory} ক্যাটাগরি`}
          </span>
          <span className="text-[11px] font-normal text-neutral-500 font-mono">
            ({videos.length} টি ভিডিও)
          </span>
        </h2>

        {/* Column toggle */}
        <div className="hidden sm:flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs text-neutral-400">
          <button
            onClick={() => setColumnsMode('two')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
              columnsMode === 'two' ? 'bg-neutral-800 text-white font-bold' : 'hover:text-white'
            }`}
            title="২ কলাম ভিউ"
          >
            <Columns2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>২ কলাম</span>
          </button>
          <button
            onClick={() => setColumnsMode('responsive')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
              columnsMode === 'responsive' ? 'bg-neutral-800 text-white font-bold' : 'hover:text-white'
            }`}
            title="ওয়াইড ভিউ"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
            <span>৩-৪ কলাম</span>
          </button>
        </div>
      </div>

      {/* YouTube Video Grid (Default 2 Columns as requested by user) */}
      <div
        className={`grid gap-2.5 sm:gap-4 ${
          columnsMode === 'two'
            ? 'grid-cols-2'
            : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
        }`}
      >
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onPlay={onPlay}
            isSaved={savedVideoIds.includes(video.id)}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
    </div>
  );
};
