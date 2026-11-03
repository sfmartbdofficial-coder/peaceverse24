import React from 'react';
import { IslamicVideo } from '../types';
import { VideoCard } from './VideoCard';
import { Bookmark, Trash2, ArrowLeft, Clock, Play } from 'lucide-react';

interface SavedViewProps {
  savedVideos: IslamicVideo[];
  onPlay: (video: IslamicVideo) => void;
  onToggleSave: (video: IslamicVideo) => void;
  savedVideoIds: string[];
  onClearAll: () => void;
  onBackToHome: () => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  savedVideos,
  onPlay,
  onToggleSave,
  savedVideoIds,
  onClearAll,
  onBackToHome,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-4 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>পরে দেখুন (Watch Later & Saved)</span>
            </h2>
            <p className="text-xs text-neutral-400">
              {savedVideos.length} টি সংরক্ষিত হালাল তিলাওয়াত ও ইসলামিক আলোচনা
            </p>
          </div>
        </div>

        {savedVideos.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPlay(savedVideos[0])}
              className="flex items-center gap-1.5 text-xs text-neutral-950 font-bold px-4 py-2 rounded-full bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-md shadow-emerald-950/40"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>সবগুলো শুনুন (Play All)</span>
            </button>
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-3.5 py-2 rounded-full bg-rose-950/40 border border-rose-800/50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>সব মুছুন</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {savedVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mb-4">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-neutral-200">
            এখনও কোনো ভিডিও সেভ করেননি
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mt-1">
            হোমপেজের যেকোনো ভিডিও বা দোয়ার ৩-ডট মেনু অথবা প্লেয়ার থেকে &quot;Watch Later&quot; এ ক্লিক করে প্রিয় তালিকা তৈরি করুন।
          </p>
          <button
            onClick={onBackToHome}
            className="mt-5 px-5 py-2 rounded-full bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 transition-colors shadow-lg"
          >
            ভিডিও ব্রাউজ করুন (Go to Home)
          </button>
        </div>
      ) : (
        /* 2-Column Grid */
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {savedVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={onPlay}
              isSaved={savedVideoIds.includes(video.id)}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
};
