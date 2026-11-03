import React, { useState } from 'react';
import { INITIAL_SHORTS } from '../data/islamicVideos';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ThumbsDown,
  Bookmark,
  X,
  Send,
  CheckCircle2
} from 'lucide-react';

export const ShortsViewer: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedShorts, setLikedShorts] = useState<Record<string, boolean>>({});
  const [dislikedShorts, setDislikedShorts] = useState<Record<string, boolean>>({});
  const [muted, setMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [subscribedShorts, setSubscribedShorts] = useState<Record<string, boolean>>({});
  const [commentsList, setCommentsList] = useState<Record<string, string[]>>({
    'short-1': [
      'আমিন ছুম্মা আমিন 🤲',
      'আল্লাহই আমাদের জন্য যথেষ্ট। সুবহানাল্লাহ!',
      'প্রতিদিন এই দোয়া পড়লে জীবনে ভয় কেটে যায়।',
    ],
  });
  const [commentInput, setCommentInput] = useState('');

  const currentShort = INITIAL_SHORTS[currentIndex];

  const toggleLike = (id: string) => {
    setLikedShorts((prev) => {
      const next = !prev[id];
      if (next && dislikedShorts[id]) {
        setDislikedShorts((d) => ({ ...d, [id]: false }));
      }
      return { ...prev, [id]: next };
    });
  };

  const toggleDislike = (id: string) => {
    setDislikedShorts((prev) => {
      const next = !prev[id];
      if (next && likedShorts[id]) {
        setLikedShorts((l) => ({ ...l, [id]: false }));
      }
      return { ...prev, [id]: next };
    });
  };

  const handleShare = (short: typeof INITIAL_SHORTS[0]) => {
    if (navigator.share) {
      navigator.share({
        title: short.titleBangla,
        text: `${short.arabic}\n\n${short.titleBangla} (${short.surah}) — Qalby Shorts`,
        url: window.location.href,
      }).catch(() => {});
      navigator.clipboard.writeText(`${short.arabic}\n${short.titleBangla} (${short.surah}) — Qalby`);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommentsList((prev) => ({
      ...prev,
      [currentShort.id]: [commentInput.trim(), ...(prev[currentShort.id] || [])],
    }));
    setCommentInput('');
  };

  const nextShort = () => {
    setCurrentIndex((prev) => (prev + 1) % INITIAL_SHORTS.length);
    setShowComments(false);
  };

  const prevShort = () => {
    setCurrentIndex((prev) => (prev - 1 + INITIAL_SHORTS.length) % INITIAL_SHORTS.length);
    setShowComments(false);
  };

  return (
    <div className="max-w-md mx-auto px-2 py-3 pb-24 flex flex-col items-center">
      {/* Navigation Top Indicators */}
      <div className="w-full flex items-center justify-between px-3 mb-2 text-xs text-neutral-400">
        <span className="font-bold text-white flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>Qalby Shorts (শান্তির রিলস)</span>
        </span>
        <span className="font-mono text-neutral-400">
          {currentIndex + 1} / {INITIAL_SHORTS.length}
        </span>
      </div>

      {/* Reel Card */}
      <div
        className={`relative w-full aspect-[9/16] max-h-[72vh] rounded-2xl bg-gradient-to-b ${currentShort.bgGradient} border border-emerald-500/30 shadow-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden select-none`}
      >
        {/* Decorative Glow */}
        <div className="absolute top-1/4 -right-20 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-20 w-52 h-52 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar inside Reel */}
        <div className="flex items-center justify-between z-10">
          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 text-xs font-semibold border border-emerald-500/20">
            {currentShort.surah}
          </span>
          <button
            onClick={() => setMuted(!muted)}
            className="p-2 rounded-full bg-black/60 text-neutral-300 hover:text-white"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

        {/* Center: Arabic Calligraphy & Meaning */}
        <div className="my-auto text-center py-4 z-10">
          <p className="text-2xl sm:text-3xl font-arabic font-bold text-white leading-relaxed drop-shadow-lg selection:bg-emerald-600">
            {currentShort.arabic}
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent mx-auto my-3" />
          <p className="text-sm sm:text-base font-bengali text-emerald-100 font-semibold px-2">
            &quot;{currentShort.titleBangla}&quot;
          </p>
          <p className="text-xs text-neutral-300 mt-1 font-normal">
            {currentShort.title}
          </p>
        </div>

        {/* Bottom Metadata & Speaker */}
        <div className="z-10 flex items-end justify-between">
          <div className="space-y-1.5 max-w-[70%]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {currentShort.speaker}
              </span>
              <button
                onClick={() =>
                  setSubscribedShorts((prev) => ({
                    ...prev,
                    [currentShort.id]: !prev[currentShort.id],
                  }))
                }
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                  subscribedShorts[currentShort.id]
                    ? 'bg-neutral-800 text-neutral-300'
                    : 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
                }`}
              >
                {subscribedShorts[currentShort.id] ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
            <p className="text-[11px] text-neutral-300 line-clamp-1 font-bengali">
              ১০০% হালাল শান্তির বাণী ও রিলস
            </p>
          </div>

          {/* Action Column on Right */}
          <div className="flex flex-col items-center gap-3">
            {/* Like */}
            <button
              onClick={() => toggleLike(currentShort.id)}
              className="flex flex-col items-center gap-0.5 text-white group"
            >
              <div
                className={`p-2.5 rounded-full bg-black/60 backdrop-blur-md transition-all ${
                  likedShorts[currentShort.id]
                    ? 'text-emerald-400 bg-emerald-950/80 scale-110'
                    : 'text-white hover:bg-black/80'
                }`}
              >
                <Heart className={`w-5 h-5 ${likedShorts[currentShort.id] ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[10px] font-semibold">
                {likedShorts[currentShort.id] ? 'Liked' : currentShort.likes}
              </span>
            </button>

            {/* Dislike */}
            <button
              onClick={() => toggleDislike(currentShort.id)}
              className="flex flex-col items-center gap-0.5 text-white"
            >
              <div
                className={`p-2.5 rounded-full bg-black/60 backdrop-blur-md transition-all ${
                  dislikedShorts[currentShort.id] ? 'text-rose-400' : 'text-white'
                }`}
              >
                <ThumbsDown className={`w-4 h-4 ${dislikedShorts[currentShort.id] ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[10px]">Dislike</span>
            </button>

            {/* Comments */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex flex-col items-center gap-0.5 text-white"
            >
              <div className="p-2.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 text-white">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold">{currentShort.comments}</span>
            </button>

            {/* Share */}
            <button
              onClick={() => handleShare(currentShort)}
              className="flex flex-col items-center gap-0.5 text-white"
            >
              <div className="p-2.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 text-white">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold">Share</span>
            </button>
          </div>
        </div>

        {/* Comments Drawer / Popover within Shorts */}
        {showComments && (
          <div className="absolute inset-x-0 bottom-0 max-h-[60%] bg-[#121212] rounded-t-2xl border-t border-neutral-700 p-3 z-30 flex flex-col animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold text-white">মন্তব্যসমূহ</span>
              <button onClick={() => setShowComments(false)} className="text-neutral-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-2 text-xs">
              {(commentsList[currentShort.id] || []).map((msg, i) => (
                <div key={i} className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                  <p className="text-neutral-200 font-bengali">{msg}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-1.5 pt-2">
              <input
                type="text"
                placeholder="দোয়া বা মন্তব্য লিখুন..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-full px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="p-1.5 rounded-full bg-emerald-600 disabled:opacity-40 text-white"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Up/Down Reel Controls */}
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={prevShort}
          className="p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          title="আগের শর্টস"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={nextShort}
          className="p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/40 transition-colors"
          title="পরের শর্টস"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
