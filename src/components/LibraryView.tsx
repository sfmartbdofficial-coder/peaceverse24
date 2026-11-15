import React, { useState } from 'react';
import { IslamicVideo, Playlist } from '../types';
import {
  History,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Bookmark,
  ThumbsUp,
  Clock,
  ListVideo,
  Upload,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { VideoCard } from './VideoCard';

interface LibraryViewProps {
  historyVideos: IslamicVideo[];
  savedVideos: IslamicVideo[];
  userUploadedVideos: IslamicVideo[];
  onPlay: (video: IslamicVideo) => void;
  savedVideoIds: string[];
  onToggleSave: (video: IslamicVideo) => void;
  onClearHistory: () => void;
  onOpenUploadModal: () => void;
  onOpenHalalPolicy: () => void;
  onOpenSavedTab: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  historyVideos,
  savedVideos,
  userUploadedVideos,
  onPlay,
  savedVideoIds,
  onToggleSave,
  onClearHistory,
  onOpenUploadModal,
  onOpenHalalPolicy,
  onOpenSavedTab,
}) => {
  // Digital Tasbeeh Counter State
  const [tasbeehCount, setTasbeehCount] = useState(33);
  const [activeDhikr, setActiveDhikr] = useState('سُبْحَانَ اللَّهِ (SubhanAllah)');

  const DHIKRS = [
    { arabic: 'سُبْحَانَ اللَّهِ', label: 'সুবহানাল্লাহ (SubhanAllah)' },
    { arabic: 'الْحَمْدُ لِلَّهِ', label: 'আলহামদুলিল্লাহ (Alhamdulillah)' },
    { arabic: 'اللَّهُ أَكْبَرُ', label: 'আল্লাহু আকবার (Allahu Akbar)' },
    { arabic: 'أَسْتَغْفِرُ اللَّهَ', label: 'আস্তাগফিরুল্লাহ (Astaghfirullah)' },
    { arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', label: 'লা ইলাহা ইল্লাল্লাহ' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-6 bg-white text-black">
      
      {/* 1. Profile Header for "You" */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#E4E6EB] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-[#E4E6EB] shadow-xs p-0.5 bg-[#F0F2F5] flex-shrink-0">
            <img
              src="/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg"
              alt="Peaceverse24.com"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-black flex items-center gap-2">
              <span>Peaceverse24.com Profile</span>
            </h2>
            <p className="text-xs text-[#65676B] font-bengali">
              ইউটিউবের বিকল্প ১০০% হালাল ইসলামিক ভিডিও ও অডিও হাব।
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#0866FF]">
              <span className="flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> ১০০% বিজ্ঞাপন ও অশ্লীলতামুক্ত প্ল্যাটফর্ম
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUploadModal}
            className="px-3.5 py-1.5 rounded-xl bg-[#0866FF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>ভিডিও আপলোড</span>
          </button>
          <button
            onClick={onOpenHalalPolicy}
            className="px-3 py-1.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black text-xs flex items-center gap-1 border border-[#E4E6EB]"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#0866FF]" />
            <span>হালাল সনদ</span>
          </button>
        </div>
      </div>

      {/* 2. Playlists & Quick Sections */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
        <button
          onClick={onOpenSavedTab}
          className="p-3.5 rounded-xl bg-white border border-[#E4E6EB] hover:border-[#0866FF] text-left flex flex-col justify-between transition-colors shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-[#0866FF]" />
            <span className="text-xs font-bold text-[#65676B]">{savedVideos.length}</span>
          </div>
          <p className="font-bold text-black">পরে দেখুন (Watch Later)</p>
          <p className="text-[10px] text-[#65676B]">সংরক্ষিত তিলাওয়াত তালিকা</p>
        </button>

        <div className="p-3.5 rounded-xl bg-white border border-[#E4E6EB] text-left flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <ThumbsUp className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-[#65676B]">লাইকড</span>
          </div>
          <p className="font-bold text-black">পছন্দ করা ভিডিও</p>
          <p className="text-[10px] text-[#65676B]">প্রিয় ইসলামিক তিলাওয়াত</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#E4E6EB] text-left flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <ListVideo className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-bold text-[#65676B]">প্লেলিস্ট</span>
          </div>
          <p className="font-bold text-black">কাস্টম প্লেলিস্ট</p>
          <p className="text-[10px] text-[#65676B]">সূরা ও হাদিস সংগ্রহ</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#E4E6EB] text-left flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <Upload className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-bold text-[#65676B]">{userUploadedVideos.length}</span>
          </div>
          <p className="font-bold text-black">আপনার ভিডিও</p>
          <p className="text-[10px] text-[#65676B]">Peaceverse24.com-তে আপনার আপলোড</p>
        </div>
      </div>

      {/* 3. User Uploaded Videos (if any) in 2-Column Grid */}
      {userUploadedVideos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#0866FF]" />
              <span>আপনার প্রকাশিত ভিডিওসমূহ (Your Uploads)</span>
            </h3>
            <span className="text-xs text-[#65676B]">{userUploadedVideos.length} টি ভিডিও</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
            {userUploadedVideos.map((video) => (
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
      )}

      {/* 4. Watch History in 2-Column Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
            <History className="w-4 h-4 text-[#0866FF]" />
            <span>সাম্প্রতিক দেখা ভিডিও (Watch History)</span>
          </h3>
          {historyVideos.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-[#65676B] hover:text-rose-600 transition-colors"
            >
              ইতিহাস মুছুন (Clear)
            </button>
          )}
        </div>

        {historyVideos.length === 0 ? (
          <p className="text-xs text-[#65676B] py-4 text-center">
            এখনও কোনো তিলাওয়াত দেখা হয়নি।
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {historyVideos.map((video) => (
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

      {/* 5. Interactive Digital Tasbeeh Counter */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E4E6EB] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#0866FF]" />
            <span>ডিজিটাল তাসবীহ কাউন্টার (Daily Tasbeeh)</span>
          </h3>
          <button
            onClick={() => setTasbeehCount(0)}
            className="p-1 rounded-full text-[#65676B] hover:text-black hover:bg-[#F0F2F5]"
            title="রিসেট করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dhikr Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
          {DHIKRS.map((d) => (
            <button
              key={d.label}
              onClick={() => {
                setActiveDhikr(`${d.arabic} (${d.label})`);
                setTasbeehCount(0);
              }}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors border ${
                activeDhikr.includes(d.arabic)
                  ? 'bg-[#0866FF] border-[#0866FF] text-white font-bold'
                  : 'bg-[#F0F2F5] border-[#E4E6EB] text-black hover:bg-[#E4E6EB]'
              }`}
            >
              {d.arabic}
            </button>
          ))}
        </div>

        {/* Tap Counter */}
        <div className="mt-3 flex flex-col items-center justify-center p-4 bg-[#F0F2F5] rounded-xl border border-[#E4E6EB]">
          <span className="text-xs text-[#65676B] mb-1">{activeDhikr}</span>
          <button
            onClick={() => setTasbeehCount((prev) => prev + 1)}
            className="w-24 h-24 rounded-full bg-[#0866FF] hover:bg-blue-600 text-white font-black text-3xl shadow-md active:scale-95 transition-transform flex items-center justify-center border-4 border-blue-200 cursor-pointer"
          >
            {tasbeehCount}
          </button>
          <span className="text-[11px] text-[#65676B] mt-2">
            কাউন্ট বাড়াতে গোল বাটনে ট্যাপ করুন
          </span>
        </div>
      </div>

    </div>
  );
};
