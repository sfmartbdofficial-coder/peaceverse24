import React, { useState } from 'react';
import { StoryItem } from '../../types';
import { Plus, X, ChevronLeft, ChevronRight, Sparkles, Volume2, Film } from 'lucide-react';

interface FbStoriesProps {
  stories: StoryItem[];
  onOpenCreateStory: () => void;
  onOpenCreateReel?: () => void;
}

export const FbStories: React.FC<FbStoriesProps> = ({ stories, onOpenCreateStory, onOpenCreateReel }) => {
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);

  return (
    <>
      {/* Stories Carousel matching user requested .story-row & .story-card */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-2.5 bg-white dark:bg-[#1C1C1D]">
        
        {/* 1. Create Story Card (Facebook White Card with Blue Plus button) */}
        <div
          onClick={onOpenCreateStory}
          className="w-[112px] min-w-[112px] h-[190px] rounded-[10px] bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#393a3b] hover:border-[#0866FF] flex-shrink-0 cursor-pointer overflow-hidden flex flex-col group shadow-xs transition-all relative"
        >
          {/* Top cover image */}
          <div className="h-[130px] w-full bg-gradient-to-b from-blue-500/20 to-neutral-200 dark:to-neutral-800 overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80"
              alt="Create Story"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          {/* Overlapping Blue Plus Button */}
          <div className="absolute top-[114px] left-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-[#0866FF] flex items-center justify-center text-white shadow-md ring-4 ring-white dark:ring-[#242526]">
            <Plus className="w-5 h-5 stroke-[3]" />
          </div>
          {/* Bottom text */}
          <div className="flex-1 flex items-end justify-center pb-2.5 px-1 bg-white dark:bg-[#242526]">
            <p className="text-[12px] font-bold text-[#050505] dark:text-white leading-tight text-center">
              Create story
            </p>
          </div>
        </div>

        {/* 2. Create Reel Card */}
        <div
          onClick={() => {
            if (onOpenCreateReel) onOpenCreateReel();
            else onOpenCreateStory();
          }}
          className="w-[112px] min-w-[112px] h-[190px] rounded-[10px] bg-gradient-to-b from-indigo-900 to-purple-950 border border-[#E4E6EB] dark:border-[#393a3b] hover:border-[#0866FF] flex-shrink-0 cursor-pointer overflow-hidden flex flex-col justify-between p-2.5 group shadow-xs transition-all relative"
        >
          <div className="w-8 h-8 rounded-full bg-[#0866FF] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Film className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">
              Create reel
            </p>
          </div>
        </div>

        {/* Remaining Stories */}
        {stories.filter((s) => s.id !== 'story-create').map((story) => {

          return (
            <div
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="w-[112px] min-w-[112px] h-[190px] rounded-[10px] bg-white dark:bg-[#1C1C1D] border border-[#E4E6EB] dark:border-[#222222] hover:border-[#0866FF]/60 flex-shrink-0 cursor-pointer overflow-hidden relative group shadow-xs transition-all"
            >
              {/* Background preview image or gradient */}
              <div className="absolute inset-0">
                {story.previewImage ? (
                  <img
                    src={story.previewImage}
                    alt={story.authorName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-b ${story.bgGradient}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />
              </div>

              {/* Author Avatar on Top-Left (Facebook style ring) */}
              <div className="absolute top-2.5 left-2.5 z-10 w-9 h-9 rounded-full border-2 border-emerald-400 p-0.5 bg-[#242526] shadow-lg">
                <img
                  src={story.authorAvatar}
                  alt={story.authorName}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Center Arabic Calligraphy snippet if any */}
              {story.arabicText && (
                <div className="absolute inset-x-2 top-14 text-center z-10">
                  <p className="text-[11px] font-arabic text-emerald-200 line-clamp-2 leading-relaxed drop-shadow">
                    {story.arabicText}
                  </p>
                </div>
              )}

              {/* Bottom Title & Author Name */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
                <p className="text-[11px] font-bold text-white line-clamp-2 font-bengali leading-tight drop-shadow">
                  {story.banglaText}
                </p>
                <p className="text-[9px] text-[#b0b3b8] truncate mt-0.5 font-medium">
                  {story.authorName}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-Screen Facebook Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm aspect-[9/16] max-h-[85vh] rounded-3xl overflow-hidden border border-emerald-500/40 shadow-2xl flex flex-col justify-between p-5 bg-[#18191a]">
            {/* Story Background */}
            <div className="absolute inset-0">
              {selectedStory.previewImage && (
                <img
                  src={selectedStory.previewImage}
                  alt={selectedStory.authorName}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/90" />
            </div>

            {/* Top Bar: Progress Line & Author */}
            <div className="z-10 space-y-3">
              {/* Progress bar line */}
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="w-full h-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedStory.authorAvatar}
                    alt={selectedStory.authorName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-emerald-400"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{selectedStory.authorName}</p>
                    <p className="text-[10px] text-neutral-300">{selectedStory.timestamp}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStory(null)}
                  className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Middle: Arabic Calligraphy & Inspiration */}
            <div className="z-10 text-center my-auto px-4 py-6">
              {selectedStory.arabicText && (
                <p className="text-2xl font-arabic font-bold text-emerald-200 leading-relaxed drop-shadow-lg mb-3">
                  {selectedStory.arabicText}
                </p>
              )}
              <div className="w-12 h-0.5 bg-emerald-400 mx-auto my-2" />
              <p className="text-base font-bengali font-semibold text-white drop-shadow">
                &quot;{selectedStory.banglaText}&quot;
              </p>
            </div>

            {/* Bottom: Quick Response Bar */}
            <div className="z-10 flex items-center gap-2">
              <input
                type="text"
                placeholder="উত্তর দিন বা দোয়া লিখুন..."
                className="flex-1 bg-black/60 border border-neutral-600 rounded-full px-4 py-2 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => setSelectedStory(null)}
                className="px-4 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs"
              >
                পাঠান
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
