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
    <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-4 pb-24 bg-white text-black">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-[#E4E6EB] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-full hover:bg-[#F0F2F5] text-[#65676B] hover:text-black"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>পরে দেখুন (Watch Later & Saved)</span>
            </h2>
            <p className="text-xs text-[#65676B]">
              {savedVideos.length} টি সংরক্ষিত হালাল তিলাওয়াত ও ইসলামিক আলোচনা
            </p>
          </div>
        </div>

        {savedVideos.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPlay(savedVideos[0])}
              className="flex items-center gap-1.5 text-xs text-white font-bold px-4 py-2 rounded-full bg-[#0866FF] hover:bg-[#1877F2] transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>সবগুলো শুনুন (Play All)</span>
            </button>
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 px-3.5 py-2 rounded-full bg-rose-50 border border-rose-200 transition-colors"
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
          <div className="w-16 h-16 rounded-full bg-[#F0F2F5] border border-[#E4E6EB] flex items-center justify-center text-[#65676B] mb-4">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-black">
            এখনও কোনো ভিডিও সেভ করেননি
          </h3>
          <p className="text-xs sm:text-sm text-[#65676B] max-w-sm mt-1">
            হোমপেজের যেকোনো ভিডিও বা দোয়ার ৩-ডট মেনু অথবা প্লেয়ার থেকে &quot;Watch Later&quot; এ ক্লিক করে প্রিয় তালিকা তৈরি করুন।
          </p>
          <button
            onClick={onBackToHome}
            className="mt-5 px-5 py-2 rounded-full bg-[#0866FF] text-white font-semibold text-xs hover:bg-[#1877F2] transition-colors shadow-sm"
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
