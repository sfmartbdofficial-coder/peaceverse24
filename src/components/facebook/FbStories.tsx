import React, { useState } from 'react';
import { StoryItem } from '../../types';
import { Plus, X, ChevronLeft, ChevronRight, Sparkles, Volume2, Film } from 'lucide-react';

interface FbStoriesProps {
  stories: StoryItem[];
  onOpenCreateStory: () => void;
  onOpenCreateReel?: () => void;
  currentUserAvatar?: string;
  currentUserName?: string;
}

export const FbStories: React.FC<FbStoriesProps> = ({
  stories,
  onOpenCreateStory,
  onOpenCreateReel,
  currentUserAvatar,
  currentUserName = 'User',
}) => {
  const viewableStories = stories.filter((s) => s.id !== 'story-create');
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySentNotice, setReplySentNotice] = useState<string | null>(null);
  const selectedStory = selectedStoryIndex !== null ? viewableStories[selectedStoryIndex] || null : null;
  const userInitial = currentUserName.trim().charAt(0).toUpperCase() || 'P';

  return (
    <>
      {/* Stories Carousel matching user requested .story-row & .story-card */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-2.5 bg-white">
        
        {/* 1. Create Story Card (Facebook White Card with Blue Plus button) */}
        <div
          onClick={onOpenCreateStory}
          className="w-[112px] min-w-[112px] h-[190px] rounded-[10px] bg-white border border-[#E4E6EB] hover:border-[#0866FF] flex-shrink-0 cursor-pointer overflow-hidden flex flex-col group shadow-xs transition-all relative"
        >
          {/* Top cover image (shows active personal or switched Page logo/avatar) */}
          <div className="h-[130px] w-full bg-[#E7F3FF] overflow-hidden relative flex items-center justify-center">
            {currentUserAvatar ? (
              <img
                src={currentUserAvatar}
                alt={currentUserName || 'Create Story'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0866FF] to-[#1877F2] flex items-center justify-center text-white text-3xl font-black">
                {userInitial}
              </div>
            )}
          </div>
          {/* Overlapping Blue Plus Button */}
          <div className="absolute top-[114px] left-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-[#0866FF] flex items-center justify-center text-white shadow-md ring-4 ring-white">
            <Plus className="w-5 h-5 stroke-[3]" />
          </div>
          {/* Bottom text */}
          <div className="flex-1 flex items-end justify-center pb-2.5 px-1 bg-white">
            <p className="text-[12px] font-bold text-black leading-tight text-center">
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
          className="w-[112px] min-w-[112px] h-[190px] rounded-[10px] bg-gradient-to-b from-indigo-900 to-purple-950 border border-[#E4E6EB] hover:border-[#0866FF] flex-shrink-0 cursor-pointer overflow-hidden flex flex-col justify-between p-2.5 group shadow-xs transition-all relative"
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
        {viewableStories.map((story, idx) => {

          return (
            <div
              key={story.id}
              onClick={() => {
                setSelectedStoryIndex(idx);
                setReplySentNotice(null);
              }}
              className="w-[112px] min-w-[112px] h-[190px] rounded-[10px] bg-white border border-[#E4E6EB] hover:border-[#0866FF]/60 flex-shrink-0 cursor-pointer overflow-hidden relative group shadow-xs transition-all"
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
              <div className="absolute top-2.5 left-2.5 z-10 w-9 h-9 rounded-full border-2 border-emerald-400 p-0.5 bg-white shadow-lg">
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
          <div className="relative w-full max-w-sm aspect-[9/16] max-h-[85vh] rounded-3xl overflow-hidden border border-[#E4E6EB]/30 shadow-2xl flex flex-col justify-between p-5 bg-black">
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
                <div className="w-full h-full bg-emerald-400" />
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
                  onClick={() => setSelectedStoryIndex(null)}
                  className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Prev / Next Navigation Arrows */}
            {selectedStoryIndex !== null && selectedStoryIndex > 0 && (
              <button
                type="button"
                onClick={() => setSelectedStoryIndex((prev) => (prev !== null ? Math.max(0, prev - 1) : 0))}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer"
                aria-label="Previous story"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {selectedStoryIndex !== null && selectedStoryIndex < viewableStories.length - 1 && (
              <button
                type="button"
                onClick={() =>
                  setSelectedStoryIndex((prev) =>
                    prev !== null ? Math.min(viewableStories.length - 1, prev + 1) : 0
                  )
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer"
                aria-label="Next story"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Middle: Arabic Calligraphy & Inspiration */}
            <div className="z-10 text-center my-auto px-6 py-6">
              {selectedStory.arabicText && (
                <p className="text-2xl font-arabic font-bold text-emerald-200 leading-relaxed drop-shadow-lg mb-3">
                  {selectedStory.arabicText}
                </p>
              )}
              <div className="w-12 h-0.5 bg-emerald-400 mx-auto my-2" />
              <p className="text-base font-bengali font-semibold text-white drop-shadow">
                &quot;{selectedStory.banglaText}&quot;
              </p>
              {replySentNotice && (
                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-bold">
                  {replySentNotice}
                </div>
              )}
            </div>

            {/* Bottom: Quick Response Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!replyText.trim()) return;
                setReplySentNotice('দোয়া / উত্তর পাঠানো হয়েছে ✓');
                setReplyText('');
                setTimeout(() => setReplySentNotice(null), 2500);
              }}
              className="z-10 flex items-center gap-2"
            >
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="উত্তর দিন বা দোয়া লিখুন..."
                className="flex-1 bg-black/60 border border-neutral-600 rounded-full px-4 py-2 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs cursor-pointer whitespace-nowrap"
              >
                পাঠান
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
