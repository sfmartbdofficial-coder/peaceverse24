import React, { useState } from 'react';
import { IslamicVideo, CommentItem } from '../types';
import {
  X,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Send,
  Sparkles,
  BookOpen,
  Volume2,
  Bell,
  Heart,
  Plus,
  Maximize2,
  Minimize2,
  ListPlus
} from 'lucide-react';
import { VideoCard } from './VideoCard';

interface VideoPlayerModalProps {
  video: IslamicVideo;
  onClose: () => void;
  allVideos: IslamicVideo[];
  onSelectVideo: (video: IslamicVideo) => void;
  isSaved: boolean;
  onToggleSave: (video: IslamicVideo) => void;
  savedVideoIds: string[];
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  allVideos,
  onSelectVideo,
  isSaved,
  onToggleSave,
  savedVideoIds,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(video.channel.isSubscribed ?? false);
  const [subBellActive, setSubBellActive] = useState(true);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [downloadedOffline, setDownloadedOffline] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
  const [theaterMode, setTheaterMode] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlistCreatedToast, setPlaylistCreatedToast] = useState(false);

  const [commentInput, setCommentInput] = useState('');
  const [commentsSort, setCommentsSort] = useState<'top' | 'newest'>('top');
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: 'c-1',
      author: 'Mohammad Abdullah',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      text: 'মাশাআল্লাহ! এত সুন্দর তিলাওয়াত শুনলে অন্তর ঠান্ডা হয়ে যায়। আল্লাহ Peaceverse24.com প্ল্যাটফর্মের সবাইকে উত্তম প্রতিদান দান করুন।',
      timeAgo: '২ ঘণ্টা আগে',
      likes: 42,
      isLiked: false,
      heartByCreator: true,
    },
    {
      id: 'c-2',
      author: 'Fatima Zahra',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      text: 'আমিন ছুম্মা আমিন। প্রতিদিন সকালে এই তিলাওয়াত শুনলে সারাদিন বরকতময় থাকে। কোনো বাজে বিজ্ঞাপন না দেখে খুব স্বস্তি পাচ্ছি।',
      timeAgo: '৫ ঘণ্টা আগে',
      likes: 29,
      isLiked: false,
      heartByCreator: true,
    },
    {
      id: 'c-3',
      author: 'Rashid Khan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      text: 'SubhanAllah. Beautiful authentic reminder. Thank you Peaceverse24.com for this 100% Halal platform!',
      timeAgo: '১ দিন আগে',
      likes: 56,
      isLiked: false,
      heartByCreator: false,
    },
  ]);

  const handleCopySnippet = () => {
    if (video.arabicSnippet) {
      navigator.clipboard.writeText(
        `${video.arabicSnippet}\n\n${video.translationSnippet || ''}\n\n— ${video.reference || ''} via Peaceverse24.com App`
      );
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video.titleBangla,
        text: `${video.titleBangla} - Peaceverse24.com (১০০% হালাল ভিডিও প্ল্যাটফর্ম)`,
        url: `https://www.youtube.com/watch?v=${video.youtubeId}`,
      }).catch(() => {});
      navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${video.youtubeId}`);
    }
  };

  const handleAddComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: 'You (Peaceverse24.com User)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      text: commentInput.trim(),
      timeAgo: 'এইমাত্র',
      likes: 1,
      isLiked: true,
      heartByCreator: false,
    };

    setComments([newComment, ...comments]);
    setCommentInput('');
  };

  const toggleCommentLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const currentlyLiked = Boolean(c.isLiked);
          return {
            ...c,
            isLiked: !currentlyLiked,
            likes: currentlyLiked ? c.likes - 1 : c.likes + 1,
          };
        }
        return c;
      })
    );
  };

  const addQuickReaction = (reaction: string) => {
    setCommentInput((prev) => (prev ? `${prev} ${reaction}` : reaction));
  };

  // Related videos
  const relatedVideos = allVideos
    .filter((v) => v.id !== video.id)
    .slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center sm:p-2 md:p-4 overflow-y-auto">
      {/* Container */}
      <div
        className={`bg-white text-black w-full ${
          theaterMode ? 'max-w-[1600px]' : 'max-w-6xl'
        } h-[96vh] sm:h-auto sm:max-h-[94vh] sm:rounded-2xl border border-[#E4E6EB] shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-[#E4E6EB] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0866FF] animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-black truncate max-w-xs sm:max-w-md">
              {video.titleBangla}
            </span>
            <span className="text-[10px] text-[#0866FF] font-semibold bg-[#E7F3FF] px-2 py-0.5 rounded-full border border-blue-200 hidden sm:inline">
              Peaceverse24.com Halal Player
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheaterMode(!theaterMode)}
              className="p-1.5 rounded-full text-[#65676B] hover:text-black hover:bg-[#F0F2F5] hidden sm:block"
              title={theaterMode ? 'Default View' : 'Theater View'}
            >
              {theaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#65676B] hover:text-black hover:bg-[#F0F2F5] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
          <div className={`grid grid-cols-1 ${theaterMode ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-4 p-3 sm:p-5`}>
            
            {/* Left Column: Video Player + Main Meta + Description + Comments */}
            <div className={`${theaterMode ? 'w-full' : 'lg:col-span-2'} space-y-4`}>
              
              {/* YouTube Iframe Player */}
              <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-md border border-[#E4E6EB]">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={video.titleBangla}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Title Section */}
              <div>
                <h1 className="text-base sm:text-xl font-bold text-black leading-snug">
                  {video.titleBangla}
                </h1>
                <p className="text-xs sm:text-sm text-[#65676B] mt-0.5">
                  {video.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-[#65676B] mt-1">
                  <span>{video.views}</span>
                  <span>•</span>
                  <span>{video.timestamp}</span>
                  <span>•</span>
                  <span className="text-[#0866FF] font-semibold">{video.category}</span>
                </div>
              </div>

              {/* Channel Info & Subscribe Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 border-y border-[#E4E6EB]">
                <div className="flex items-center gap-3">
                  <img
                    src={video.channel.avatar}
                    alt={video.channel.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#E4E6EB]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs sm:text-sm text-black">
                        {video.channel.name}
                      </span>
                      {video.channel.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0866FF]" />
                      )}
                    </div>
                    <span className="text-[11px] text-[#65676B]">
                      {video.channel.subscribers} সাবস্ক্রাইবার
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSubscribed(!isSubscribed)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      isSubscribed
                        ? 'bg-[#F0F2F5] text-black hover:bg-[#E4E6EB]'
                        : 'bg-[#0866FF] hover:bg-blue-600 text-white font-bold shadow-xs'
                    }`}
                  >
                    {isSubscribed ? 'Subscribed ✓' : 'Subscribe (সাবস্ক্রাইব)'}
                  </button>

                  {isSubscribed && (
                    <button
                      onClick={() => setSubBellActive(!subBellActive)}
                      className="p-2 rounded-full bg-[#F0F2F5] text-[#65676B] hover:text-black"
                      title="নোটিফিকেশন বেল"
                    >
                      <Bell className={`w-4 h-4 ${subBellActive ? 'text-[#0866FF] fill-current' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons: Like, Dislike, Share, Save, Offline */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {/* Like / Dislike Pill */}
                <div className="flex items-center rounded-full bg-[#F0F2F5] border border-[#E4E6EB] overflow-hidden flex-shrink-0">
                  <button
                    onClick={() => {
                      setIsLiked(!isLiked);
                      if (isDisliked) setIsDisliked(false);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium hover:bg-[#E4E6EB] transition-colors ${
                      isLiked ? 'text-[#0866FF] font-bold' : 'text-black'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{isLiked ? 'Liked' : video.likes}</span>
                  </button>
                  <div className="w-[1px] h-4 bg-[#E4E6EB]" />
                  <button
                    onClick={() => {
                      setIsDisliked(!isDisliked);
                      if (isLiked) setIsLiked(false);
                    }}
                    className={`px-3 py-1.5 text-xs hover:bg-[#E4E6EB] transition-colors ${
                      isDisliked ? 'text-rose-600' : 'text-[#65676B]'
                    }`}
                  >
                    <ThumbsDown className={`w-3.5 h-3.5 ${isDisliked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F0F2F5] border border-[#E4E6EB] text-xs font-medium text-black hover:bg-[#E4E6EB] transition-colors flex-shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>

                {/* Save to Playlist / Watch Later */}
                <button
                  onClick={() => onToggleSave(video)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-colors flex-shrink-0 ${
                    isSaved
                      ? 'bg-[#E7F3FF] border-blue-200 text-[#0866FF] font-semibold'
                      : 'bg-[#F0F2F5] border-[#E4E6EB] text-black hover:bg-[#E4E6EB]'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-[#0866FF]" />
                      <span>Saved (সংরক্ষিত)</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save (পরে দেখুন)</span>
                    </>
                  )}
                </button>

                {/* Download / Offline Toggle */}
                <button
                  onClick={() => setDownloadedOffline(!downloadedOffline)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-colors flex-shrink-0 ${
                    downloadedOffline
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold'
                      : 'bg-[#F0F2F5] border-[#E4E6EB] text-black hover:bg-[#E4E6EB]'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadedOffline ? 'Offline Ready ✓' : 'Offline'}</span>
                </button>
              </div>

              {/* Arabic Verse / Hadith Snippet Box */}
              {video.arabicSnippet && (
                <div className="p-4 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[#0866FF] text-xs font-semibold">
                      <BookOpen className="w-4 h-4" />
                      <span>মূল আরবি পাঠ ও তরজমা ({video.reference || 'পবিত্র আয়াত'})</span>
                    </div>
                    <button
                      onClick={handleCopySnippet}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#E4E6EB] hover:bg-[#E4E6EB] text-[11px] text-black transition-colors"
                    >
                      {copiedSnippet ? (
                        <>
                          <Check className="w-3 h-3 text-[#0866FF]" />
                          <span>কপি হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>কপি করুন</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-base sm:text-xl font-arabic text-right text-black leading-loose py-1">
                    {video.arabicSnippet}
                  </p>

                  {video.translationSnippet && (
                    <p className="text-xs sm:text-sm text-[#65676B] mt-2 font-bengali border-t border-[#E4E6EB] pt-2">
                      <span className="font-semibold text-black">অর্থ: </span>
                      {video.translationSnippet}
                    </p>
                  )}
                </div>
              )}

              {/* Tabs Switcher: Description & Comments */}
              <div className="flex border-b border-[#E4E6EB] gap-4 pt-2">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 text-xs sm:text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === 'details'
                      ? 'border-[#0866FF] text-[#0866FF]'
                      : 'border-transparent text-[#65676B] hover:text-black'
                  }`}
                >
                  বিবরণ (Description)
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`pb-2 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'comments'
                      ? 'border-[#0866FF] text-[#0866FF]'
                      : 'border-transparent text-[#65676B] hover:text-black'
                  }`}
                >
                  <span>মন্তব্য ও দোয়া ({comments.length})</span>
                  <span className="w-2 h-2 rounded-full bg-[#0866FF]" />
                </button>
              </div>

              {/* Tab 1: Details */}
              {activeTab === 'details' && (
                <div className="p-3.5 bg-[#F0F2F5] rounded-xl border border-[#E4E6EB] text-xs text-black leading-relaxed space-y-3">
                  <p>{video.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {video.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-white text-[10px] text-[#0866FF] border border-[#E4E6EB] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Comments */}
              {activeTab === 'comments' && (
                <div className="space-y-3">
                  {/* Quick Islamic Reactions */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    <span className="text-[11px] text-[#65676B] mr-1 flex-shrink-0">দ্রুত বার্তা:</span>
                    {['আমিন 🤲', 'মাশাআল্লাহ ❤️', 'সুবহানাল্লাহ 🌸', 'আলহামদুলিল্লাহ ✨', 'জাযাকাল্লাহ খাইরান 🍃'].map((r) => (
                      <button
                        key={r}
                        onClick={() => addQuickReaction(r)}
                        className="px-2.5 py-1 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black text-xs flex-shrink-0 border border-[#E4E6EB]"
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="আপনার মন্তব্য বা দোয়া লিখুন..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="flex-1 bg-[#F0F2F5] border border-[#E4E6EB] rounded-full px-4 py-2 text-xs text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF]"
                    />
                    <button
                      type="submit"
                      disabled={!commentInput.trim()}
                      className="p-2 rounded-full bg-[#0866FF] disabled:opacity-40 text-white hover:bg-blue-600 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-3 pt-2">
                    {comments.map((c) => (
                      <div key={c.id} className="flex gap-2.5 text-xs">
                        <img
                          src={c.avatar}
                          alt={c.author}
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                        />
                        <div className="flex-1 bg-[#F0F2F5] p-2.5 rounded-xl border border-[#E4E6EB]">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-black">{c.author}</span>
                            <span className="text-[10px] text-[#65676B]">{c.timeAgo}</span>
                          </div>
                          <p className="text-black mt-1 font-bengali leading-relaxed">{c.text}</p>
                          <div className="flex items-center gap-3 text-[11px] text-[#65676B] mt-2">
                            <button
                              onClick={() => toggleCommentLike(c.id)}
                              className={`flex items-center gap-1 hover:text-[#0866FF] cursor-pointer ${
                                c.isLiked ? 'text-[#0866FF] font-bold' : ''
                              }`}
                            >
                              <ThumbsUp className={`w-3 h-3 ${c.isLiked ? 'fill-current' : ''}`} />
                              <span>{c.likes}</span>
                            </button>
                            {c.heartByCreator && (
                              <span className="flex items-center gap-0.5 text-rose-600 text-[10px]">
                                <Heart className="w-3 h-3 fill-current" />
                                <span>নির্মাতার পছন্দ</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Up Next / Related Videos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0866FF]" />
                  <span>পরবর্তী তিলাওয়াত (Up Next)</span>
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[#65676B]">
                  <span>Autoplay</span>
                  <input
                    type="checkbox"
                    checked={autoPlayNext}
                    onChange={(e) => setAutoPlayNext(e.target.checked)}
                    className="accent-[#0866FF] cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3">
                {relatedVideos.map((rel) => (
                  <VideoCard
                    key={rel.id}
                    video={rel}
                    onPlay={onSelectVideo}
                    isSaved={savedVideoIds.includes(rel.id)}
                    onToggleSave={onToggleSave}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
