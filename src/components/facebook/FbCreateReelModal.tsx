import React, { useState, useRef } from 'react';
import {
  X,
  Settings,
  Camera,
  Music,
  PlusCircle,
  FileText,
  Scan,
  Upload,
  ChevronDown,
  Check,
  Play,
  Film
} from 'lucide-react';
import { PostItem, UserProfile } from '../../types';

interface FbCreateReelModalProps {
  userProfile: UserProfile;
  onClose: () => void;
  onReelCreated: (newReelPost: PostItem) => void;
}

const REEL_PRESETS = [
  {
    id: 'reel-1',
    title: 'মক্কা মুকাররমার হৃদয়স্পর্শী লাইভ রিলস',
    duration: '0:45',
    thumbnail: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ',
  },
  {
    id: 'reel-2',
    title: 'পবিত্র কুরআনের অত্যন্ত মনমুগ্ধকর তিলাওয়াত',
    duration: '1:02',
    thumbnail: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    arabic: 'الرَّحْمَٰنُ • عَلَّمَ الْقُرْآنَ',
  },
  {
    id: 'reel-3',
    title: 'মসজিদে নববীর সবুজ গম্বুজের দৃশ্য',
    duration: '0:30',
    thumbnail: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    arabic: 'الصَّلَاةُ وَالسَّلَامُ عَلَيْكَ يَا رَسُولَ اللَّهِ',
  },
  {
    id: 'reel-4',
    title: 'বৃষ্টির মধ্যে রবের শুকরিয়া ও তাওহীদের আহ্বান',
    duration: '0:58',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    arabic: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ',
  },
  {
    id: 'reel-5',
    title: 'জুমুআর দিনে দরূদ পাঠের বরকত ও ফজিলত',
    duration: '1:15',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    arabic: 'إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ',
  },
  {
    id: 'reel-6',
    title: 'হালাল জীবিকা ও উত্তম আখলাকের গুরুত্ব',
    duration: '0:40',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    arabic: 'طَلَبُ الْحَلَالِ فَرِيضَةٌ',
  },
];

export const FbCreateReelModal: React.FC<FbCreateReelModalProps> = ({
  userProfile,
  onClose,
  onReelCreated,
}) => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploadedVideos, setUploadedVideos] = useState<Array<{ url: string; title: string; duration: string }>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newVideo = {
        url,
        title: file.name.replace(/\.[^/.]+$/, ''),
        duration: '0:35',
      };
      setUploadedVideos((prev) => [newVideo, ...prev]);
      handlePublishReel(url, newVideo.title);
    }
  };

  const handlePublishReel = (videoUrl: string, reelTitle: string, arabicSnippet?: string) => {
    const newReel: PostItem = {
      id: `reel-${Date.now()}`,
      author: {
        name: userProfile.name,
        avatar: userProfile.avatar,
        verified: true,
        subtitle: 'Reels • 🌐',
      },
      timeAgo: 'Just now',
      isPublic: true,
      contentBangla: caption || reelTitle || 'নতুন হালাল রিলস ভিডিও',
      arabicVerse: arabicSnippet,
      mediaType: 'video',
      mediaUrl: videoUrl,
      duration: '0:45',
      category: 'Lecture',
      reactions: {
        total: 1,
        likeCount: 1,
        loveCount: 0,
        subhanallahCount: 0,
        mashaallahCount: 0,
      },
      userReaction: 'like',
      comments: [],
      sharesCount: 0,
      isSaved: false,
    };
    onReelCreated(newReel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#18191a] text-white flex flex-col animate-in fade-in">
      
      {/* Hidden file input for videos */}
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*,image/*"
        className="hidden"
        onChange={handleDeviceUpload}
      />

      {/* 1. Header matching Screenshot 4 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#393a3b] bg-[#242526]">
        <button
          onClick={onClose}
          className="p-1 rounded-full text-white hover:bg-[#3a3b3c] transition-colors"
          title="বন্ধ করুন"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h1 className="text-base font-bold text-white">Create reel</h1>

        <button
          onClick={() => {}}
          className="p-1.5 rounded-full text-white hover:bg-[#3a3b3c] transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Circular Action Buttons matching Screenshot 4: [ Camera ] [ Music ] [ Templates ] [ Drafts ] [ Green screen ] */}
      <div className="px-3 py-4 bg-[#18191a] border-b border-[#393a3b]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Camera */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#3a3b3c] group-hover:bg-[#4e4f50] flex items-center justify-center text-white transition-colors">
              <Camera className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-xs font-semibold text-[#e4e6eb]">Camera</span>
          </button>

          {/* Music */}
          <button
            onClick={() => {}}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#3a3b3c] group-hover:bg-[#4e4f50] flex items-center justify-center text-white transition-colors">
              <Music className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-xs font-semibold text-[#e4e6eb]">Music</span>
          </button>

          {/* Templates */}
          <button
            onClick={() => {}}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#3a3b3c] group-hover:bg-[#4e4f50] flex items-center justify-center text-white transition-colors">
              <PlusCircle className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-xs font-semibold text-[#e4e6eb]">Templates</span>
          </button>

          {/* Drafts */}
          <button
            onClick={() => {}}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#3a3b3c] group-hover:bg-[#4e4f50] flex items-center justify-center text-white transition-colors">
              <FileText className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-xs font-semibold text-[#e4e6eb]">Drafts</span>
          </button>

          {/* Green screen */}
          <button
            onClick={() => {}}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#3a3b3c] group-hover:bg-[#4e4f50] flex items-center justify-center text-white transition-colors">
              <Scan className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-xs font-semibold text-[#e4e6eb]">Green screen</span>
          </button>
        </div>
      </div>

      {/* 3. Subheader: "Gallery ⌄" + "Select multiple" */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#18191a] sticky top-0 z-20 border-b border-[#393a3b]">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 cursor-pointer hover:text-white"
          title="আপনার ফোনের ভিডিও গ্যালারি খুলুন"
        >
          <span className="font-bold text-sm text-white">Gallery</span>
          <ChevronDown className="w-4 h-4 text-[#b0b3b8]" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-xs font-bold text-white flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>ফোনের ভিডিও খুলুন</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] text-xs font-semibold text-white transition-colors"
          >
            Select multiple
          </button>
        </div>
      </div>

      {/* Prominent Device Video Banner */}
      <div className="p-3 bg-[#242526] border-b border-[#393a3b] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">আপনার মোবাইল বা পিসির ভিডিও</p>
            <p className="text-[10px] text-[#b0b3b8]">নিজস্ব রিলস ভিডিও আপলোড করুন</p>
          </div>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-xs font-bold text-white border border-[#4e4f50]"
        >
          ভিডিও বাছুন
        </button>
      </div>

      {/* 4. Video Gallery Grid matching Screenshot 4 */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-1 grid grid-cols-3 gap-1">
        {/* Device Video Big Tile */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="aspect-[9/16] bg-gradient-to-br from-purple-900/30 to-[#242526] hover:from-purple-900/50 flex flex-col items-center justify-center gap-2 transition-all border-2 border-dashed border-purple-500/60 p-2"
        >
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-md">
            <Upload className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-white text-center leading-tight">
            আপনার গ্যালারি<br />(Open Gallery)
          </span>
        </button>

        {/* Uploaded videos from device */}
        {uploadedVideos.map((vid, idx) => (
          <div
            key={`up-vid-${idx}`}
            onClick={() => handlePublishReel(vid.url, vid.title)}
            className="aspect-[9/16] relative overflow-hidden bg-neutral-900 group cursor-pointer border border-[#393a3b]"
          >
            <div className="w-full h-full flex items-center justify-center bg-black/60">
              <Play className="w-8 h-8 text-white fill-current" />
            </div>
            <span className="absolute top-1.5 right-1.5 bg-black/75 text-[10px] px-1.5 py-0.5 rounded text-white font-mono">
              {vid.duration}
            </span>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 p-1.5">
              <p className="text-[10px] font-bold text-white truncate">{vid.title}</p>
            </div>
          </div>
        ))}

        {/* Preset Islamic Reels */}
        {REEL_PRESETS.map((item) => (
          <div
            key={item.id}
            onClick={() => handlePublishReel(item.videoUrl, item.title, item.arabic)}
            className="aspect-[9/16] relative overflow-hidden bg-neutral-900 group cursor-pointer border border-[#2a2b2c]"
          >
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {/* Play icon overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
              <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>

            {/* Duration badge */}
            <span className="absolute top-1.5 right-1.5 bg-black/75 text-[10px] px-1.5 py-0.5 rounded text-white font-mono">
              {item.duration}
            </span>

            {/* Bottom title */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-1.5">
              <p className="text-[10px] font-bold text-white line-clamp-2 leading-tight">
                {item.title}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
