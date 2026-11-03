import React, { useState } from 'react';
import { IslamicVideo } from '../types';
import { Play, CheckCircle2, MoreVertical, Bookmark, BookmarkCheck, Share2, Copy, BookOpen, Download, Radio, Ban } from 'lucide-react';

interface VideoCardProps {
  video: IslamicVideo;
  onPlay: (video: IslamicVideo) => void;
  isSaved: boolean;
  onToggleSave: (video: IslamicVideo) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPlay,
  isSaved,
  onToggleSave,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Quran':
        return 'bg-emerald-600/90 text-emerald-100 border-emerald-500/50';
      case 'Hadith':
        return 'bg-amber-600/90 text-amber-100 border-amber-500/50';
      case 'Dua':
        return 'bg-sky-600/90 text-sky-100 border-sky-500/50';
      case 'Nasheed':
        return 'bg-purple-600/90 text-purple-100 border-purple-500/50';
      case 'Kids':
        return 'bg-yellow-600/90 text-yellow-950 font-bold border-yellow-500/50';
      case 'Live':
        return 'bg-rose-600/90 text-white font-bold border-rose-500/50 animate-pulse';
      case 'Video':
        return 'bg-teal-600/90 text-teal-100 border-teal-500/50';
      default:
        return 'bg-neutral-800 text-neutral-200 border-neutral-700';
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${video.youtubeId}`);
    setCopiedToast(true);
    setMenuOpen(false);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: video.titleBangla,
        text: `${video.titleBangla} - Qalby (১০০% হালাল ভিডিও প্ল্যাটফর্ম)`,
        url: `https://www.youtube.com/watch?v=${video.youtubeId}`,
      }).catch(() => {});
    } else {
      handleCopyLink(e);
    }
    setMenuOpen(false);
  };

  return (
    <div className="flex flex-col group cursor-pointer relative transition-all duration-200">
      {/* 16:9 Thumbnail Container */}
      <div
        onClick={() => onPlay(video)}
        className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/80 group-hover:border-emerald-500/50 group-hover:shadow-lg group-hover:shadow-emerald-950/20 transition-all"
      >
        <img
          src={video.thumbnail}
          alt={video.titleBangla}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Ambient Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Category Badge (Top Left) */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-md border shadow-sm ${getCategoryColor(video.category)}`}>
            {video.category === 'Live' ? '🔴 LIVE' : video.category}
          </span>
        </div>

        {/* Duration Timestamp (Bottom Right - YouTube style) */}
        <div className="absolute bottom-2 right-2 z-10">
          {video.isLive || video.duration === 'LIVE' ? (
            <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-600 text-white flex items-center gap-1 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              LIVE
            </span>
          ) : (
            <span className="text-[10px] sm:text-xs font-mono font-medium px-1.5 py-0.5 rounded bg-black/85 text-white backdrop-blur-sm">
              {video.duration}
            </span>
          )}
        </div>

        {/* Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/90 text-neutral-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
          </div>
        </div>

        {/* Saved Indicator */}
        {isSaved && (
          <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
            <BookmarkCheck className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Video Details Section */}
      <div className="flex gap-2 sm:gap-2.5 mt-2 sm:mt-2.5 px-0.5">
        {/* Channel Avatar */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onPlay(video);
          }}
          className="flex-shrink-0"
        >
          <img
            src={video.channel.avatar}
            alt={video.channel.name}
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border border-neutral-700 hover:border-emerald-500 transition-colors"
          />
        </div>

        {/* Title & Metadata */}
        <div className="flex-1 min-w-0" onClick={() => onPlay(video)}>
          {/* Bengali Title / Primary */}
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-100 line-clamp-2 leading-tight group-hover:text-emerald-300 transition-colors">
            {video.titleBangla}
          </h3>

          {/* English Title / Secondary */}
          <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5 font-normal">
            {video.title}
          </p>

          {/* Channel Name with Verified Checkmark */}
          <div className="flex items-center gap-1 mt-1 text-[11px] text-neutral-400">
            <span className="truncate hover:text-neutral-200 transition-colors">
              {video.channel.name}
            </span>
            {video.channel.verified && (
              <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            )}
          </div>

          {/* Views & Timestamp */}
          <div className="text-[10px] sm:text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
            <span>{video.views}</span>
            <span>•</span>
            <span>{video.timestamp}</span>
          </div>
        </div>

        {/* 3-dot Menu Button */}
        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute right-0 top-6 z-50 w-52 py-1.5 bg-[#212121] border border-neutral-700 rounded-xl shadow-2xl text-xs text-neutral-200 animate-in fade-in zoom-in-95">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(video);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-neutral-800 flex items-center gap-2.5 transition-colors"
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                      <span>সংরক্ষিত তালিকা থেকে মুছুন</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 text-neutral-400" />
                      <span>পরে দেখুন (Watch Later)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="w-full px-3.5 py-2 text-left hover:bg-neutral-800 flex items-center gap-2.5 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-neutral-400" />
                  <span>শেয়ার করুন (Share)</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full px-3.5 py-2 text-left hover:bg-neutral-800 flex items-center gap-2.5 transition-colors"
                >
                  <Copy className="w-4 h-4 text-neutral-400" />
                  <span>লিঙ্ক কপি করুন</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDownloaded(true);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-neutral-800 flex items-center gap-2.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-neutral-400" />
                  <span>{downloaded ? 'অফলাইনে প্রস্তুত ✓' : 'অফলাইন সেভ (Download)'}</span>
                </button>

                {video.reference && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlay(video);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-neutral-800 flex items-center gap-2.5 transition-colors border-t border-neutral-800 text-emerald-400"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>আরবি আয়াত ও অর্থ দেখুন</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Copy link feedback */}
      {copiedToast && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-[10px] px-2.5 py-1 rounded-md shadow-lg">
          লিঙ্ক কপি করা হয়েছে!
        </div>
      )}
    </div>
  );
};
