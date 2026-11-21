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
import { validateMediaUpload, sanitizeInput } from '../../utils/security';
import {
  ADULT_BLOCK_MESSAGE,
  checkMediaFilenamesSafe,
  checkMediaVisualSafety,
  checkPost,
} from '../../lib/halalFilter';
import { extractVideoFrameDataUrl, readFileAsDataUrl } from '../../utils/imageCompress';

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
  const [selectedDuration, setSelectedDuration] = useState<'0:30' | '0:45' | '1:00' | '1:15'>('0:45');
  const [selectedCategory, setSelectedCategory] = useState<string>('Makkah Live');
  const [uploadedVideos, setUploadedVideos] = useState<Array<{ url: string; title: string; duration: string }>>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCheckingMedia, setIsCheckingMedia] = useState(false);
  const [reelInfoNotice, setReelInfoNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const check = validateMediaUpload(file, ['video', 'image']);
    if (!check.valid) {
      setUploadError(check.error || 'Max 50MB video or 5MB image file allowed.');
      return;
    }

    const nameCheck = checkMediaFilenamesSafe([file], caption);
    if (!nameCheck.safe) {
      setUploadError(nameCheck.reason || ADULT_BLOCK_MESSAGE);
      return;
    }

    setUploadError(null);
    setIsCheckingMedia(true);
    try {
      let frameOrImage: string | null = null;
      if (file.type.startsWith('video/')) {
        frameOrImage = await extractVideoFrameDataUrl(file);
      } else if (file.type.startsWith('image/')) {
        frameOrImage = await readFileAsDataUrl(file);
      }

      const visual = await checkMediaVisualSafety({
        mediaDataUrls: frameOrImage ? [frameOrImage] : [],
        caption,
        fileNames: [file.name],
      });
      if (!visual.safe) {
        setUploadError(visual.reason || ADULT_BLOCK_MESSAGE);
        return;
      }

      const url =
        file.size <= 700 * 1024
          ? await readFileAsDataUrl(file)
          : URL.createObjectURL(file);

      const newVideo = {
        url,
        title: file.name.replace(/\.[^/.]+$/, ''),
        duration: selectedDuration,
      };
      setUploadedVideos((prev) => [newVideo, ...prev]);
      await handlePublishReel(url, newVideo.title, undefined, frameOrImage);
    } catch {
      setUploadError('ভিডিওটি প্রসেস করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsCheckingMedia(false);
    }
  };

  const handlePublishReel = async (
    videoUrl: string,
    reelTitle: string,
    arabicSnippet?: string,
    previewImageDataUrl?: string | null
  ) => {
    const combinedCaption = `${caption} ${reelTitle} ${arabicSnippet || ''}`.trim();
    const textCheck = checkPost(combinedCaption);
    if (!textCheck.isApproved) {
      setUploadError(textCheck.reason || ADULT_BLOCK_MESSAGE);
      return;
    }

    if (previewImageDataUrl && previewImageDataUrl.startsWith('data:image/')) {
      const visualCheck = await checkMediaVisualSafety({
        mediaDataUrls: [previewImageDataUrl],
        caption: combinedCaption,
      });
      if (!visualCheck.safe) {
        setUploadError(visualCheck.reason || ADULT_BLOCK_MESSAGE);
        return;
      }
    }

    const newReel: PostItem = {
      id: `reel-${Date.now()}`,
      author: {
        name: userProfile.name,
        avatar: userProfile.avatar,
        verified: true,
        subtitle: `Reels • ${selectedCategory}`,
      },
      timeAgo: 'Just now',
      isPublic: true,
      contentBangla: sanitizeInput(caption || reelTitle || 'নতুন রিলস ভিডিও'),
      arabicVerse: arabicSnippet ? sanitizeInput(arabicSnippet) : undefined,
      mediaType: 'video',
      mediaUrl: videoUrl,
      duration: selectedDuration,
      category: (selectedCategory === 'Quran Tilawat' ? 'Quran' : 'Lecture') as PostItem['category'],
      reactions: {
        total: 0,
        likeCount: 0,
        loveCount: 0,
        subhanallahCount: 0,
        mashaallahCount: 0,
      },
      comments: [],
      sharesCount: 0,
      isSaved: false,
      createdAtMillis: Date.now(),
    };
    onReelCreated(newReel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white text-black flex flex-col animate-in fade-in">
      
      {/* Hidden file input for videos */}
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*,image/*"
        className="hidden"
        onChange={handleDeviceUpload}
      />

      {/* 1. Header matching Screenshot 4 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E6EB] bg-white">
        <button
          onClick={onClose}
          className="p-1 rounded-full text-black hover:bg-[#F0F2F5] transition-colors"
          title="বন্ধ করুন"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h1 className="text-base font-bold text-black">Create reel</h1>

        <button
          onClick={() =>
            setReelInfoNotice((prev) =>
              prev ? null : 'সব ধরনের স্বাভাবিক ভিডিও ও ছবি আপলোড করা যাবে (শুধু XXX/অশ্লীল কনটেন্ট নিষিদ্ধ)।'
            )
          }
          className="p-1.5 rounded-full text-black hover:bg-[#F0F2F5] transition-colors cursor-pointer"
          title="Reel Guidelines"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {isCheckingMedia && (
        <div className="mx-4 mt-2 p-2.5 rounded-xl bg-[#E7F3FF] border border-[#0866FF]/30 text-[#0866FF] text-xs font-semibold">
          ভিডিও যাচাই ও প্রস্তুত করা হচ্ছে...
        </div>
      )}

      {reelInfoNotice && !uploadError && (
        <div className="mx-4 mt-2 p-2.5 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] text-[#050505] text-xs font-medium">
          {reelInfoNotice}
        </div>
      )}

      {uploadError && (
        <div className="mx-4 mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          ⚠️ {uploadError}
        </div>
      )}

      {/* 2. Circular Action Buttons matching Screenshot 4: [ Camera ] [ Music ] [ Templates ] [ Drafts ] [ Green screen ] */}
      <div className="px-3 py-4 bg-white border-b border-[#E4E6EB]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Camera */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#F0F2F5] group-hover:bg-[#E4E6EB] flex items-center justify-center text-black transition-colors">
              <Camera className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-xs font-semibold text-black">Camera</span>
          </button>

          {/* Music */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('Quran Tilawat');
              setCaption((prev) => prev || 'মধুর সুর ও মিউজিক রিলস 🎵');
              setReelInfoNotice('অডিও / মিউজিক রিলস মোড সক্রিয় হয়েছে — এখন ফোনের ভিডিও বা নিচের টেমপ্লেট বাছুন।');
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#F0F2F5] group-hover:bg-[#E4E6EB] flex items-center justify-center text-black transition-colors">
              <Music className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-xs font-semibold text-black">Music</span>
          </button>

          {/* Templates */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('Makkah Live');
              setReelInfoNotice('নিচের রেডিমেড রিলস টেমপ্লেট থেকে যেকোনো একটি সিলেক্ট করুন।');
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#F0F2F5] group-hover:bg-[#E4E6EB] flex items-center justify-center text-black transition-colors">
              <PlusCircle className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-xs font-semibold text-black">Templates</span>
          </button>

          {/* Drafts */}
          <button
            type="button"
            onClick={() => {
              const draftKey = 'peaceverse_reel_draft_caption';
              if (caption.trim()) {
                localStorage.setItem(draftKey, caption.trim());
                setReelInfoNotice('আপনার রিলস ক্যাপশন ড্রাফটে সংরক্ষণ করা হয়েছে।');
              } else {
                const savedDraft = localStorage.getItem(draftKey);
                if (savedDraft) {
                  setCaption(savedDraft);
                  setReelInfoNotice('আগের সেভ করা ড্রাফট লোড করা হয়েছে।');
                } else {
                  setReelInfoNotice('এখনো কোনো ড্রাফট সেভ করা হয়নি। আগে ক্যাপশন লিখুন।');
                }
              }
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#F0F2F5] group-hover:bg-[#E4E6EB] flex items-center justify-center text-black transition-colors">
              <FileText className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-xs font-semibold text-black">Drafts</span>
          </button>

          {/* Green screen */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#F0F2F5] group-hover:bg-[#E4E6EB] flex items-center justify-center text-black transition-colors">
              <Scan className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-xs font-semibold text-black">Green screen</span>
          </button>
        </div>
      </div>

      {/* 3. Subheader: "Gallery ⌄" + "Select multiple" */}
      <div className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-20 border-b border-[#E4E6EB]">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 cursor-pointer hover:text-[#0866FF]"
          title="আপনার ফোনের ভিডিও গ্যালারি খুলুন"
        >
          <span className="font-bold text-sm text-black">Gallery</span>
          <ChevronDown className="w-4 h-4 text-[#65676B]" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-full bg-[#0866FF] hover:bg-[#166fe5] text-xs font-bold text-white flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>ফোনের ভিডিও খুলুন</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] text-xs font-semibold text-black transition-colors"
          >
            Select multiple
          </button>
        </div>
      </div>

      {/* Prominent Device Video Banner */}
      <div className="p-3 bg-white border-b border-[#E4E6EB] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-black">আপনার মোবাইল বা পিসির ভিডিও</p>
            <p className="text-[10px] text-[#65676B]">নিজস্ব রিলস ভিডিও আপলোড করুন</p>
          </div>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-xl bg-[#E4E6EB] hover:bg-[#D8DADF] text-xs font-bold text-black border border-[#CCD0D5]"
        >
          ভিডিও বাছুন
        </button>
      </div>

      {/* 3.5 Category & Duration Selector */}
      <div className="px-4 py-2.5 bg-white border-b border-[#E4E6EB] space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['Makkah Live', 'Madinah', 'Quran Tilawat', 'Rain Shukriya', 'Jumua Darud'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#F0F2F5] text-[#050505] hover:bg-[#E4E6EB]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="রিলস ক্যাপশন লিখুন..."
            className="flex-1 bg-[#F0F2F5] rounded-xl px-3 py-1.5 text-xs text-black placeholder-[#65676B] focus:outline-none"
          />
          <div className="flex items-center gap-1 shrink-0">
            {(['0:30', '0:45', '1:00', '1:15'] as const).map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => setSelectedDuration(dur)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold tabular-nums cursor-pointer ${
                  selectedDuration === dur ? 'bg-[#0866FF] text-white' : 'bg-[#F0F2F5] text-[#65676B]'
                }`}
              >
                {dur}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Video Gallery Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-1 grid grid-cols-3 gap-1 bg-white">
        {/* Device Video Big Tile */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="aspect-[9/16] bg-purple-50 hover:bg-purple-100 flex flex-col items-center justify-center gap-2 transition-all border-2 border-dashed border-purple-400 p-2"
        >
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-md">
            <Upload className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-black text-center leading-tight">
            ফোনের গ্যালারি
          </span>
        </button>

        {/* Uploaded videos from device */}
        {uploadedVideos.map((vid, idx) => (
          <div
            key={`up-vid-${idx}`}
            onClick={() => handlePublishReel(vid.url, vid.title)}
            className="aspect-[9/16] relative overflow-hidden bg-[#F0F2F5] group cursor-pointer border border-[#E4E6EB]"
          >
            <div className="w-full h-full flex items-center justify-center bg-black/50">
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
            className="aspect-[9/16] relative overflow-hidden bg-[#F0F2F5] group cursor-pointer border border-[#E4E6EB]"
          >
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {/* Play icon overlay */}
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 flex items-center justify-center transition-colors">
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
