import React, { useState } from 'react';
import {
  X,
  Video,
  Radio,
  Globe,
  Sparkles,
  RotateCcw,
  Mic,
  Camera
} from 'lucide-react';
import { PostItem, UserProfile } from '../../types';

interface FbLiveModalProps {
  userProfile: UserProfile;
  onClose: () => void;
  onLiveCreated: (newLivePost: PostItem) => void;
}

export const FbLiveModal: React.FC<FbLiveModalProps> = ({
  userProfile,
  onClose,
  onLiveCreated,
}) => {
  const [liveTitle, setLiveTitle] = useState('পবিত্র জুমুআর সরাসরি লাইভ সম্প্রচার ও দ্বীনি আলোচনা');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleStartLive = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      const newLivePost: PostItem = {
        id: `live-${Date.now()}`,
        author: {
          name: userProfile.name,
          avatar: userProfile.avatar,
          verified: true,
          subtitle: '🔴 LIVE • 🌐',
        },
        timeAgo: 'Just now',
        isPublic: true,
        contentBangla: liveTitle || 'সরাসরি লাইভ সম্প্রচার শুরু হয়েছে',
        mediaType: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80',
        isLive: true,
        category: 'Live',
        reactions: {
          total: 5,
          likeCount: 3,
          loveCount: 1,
          subhanallahCount: 1,
          mashaallahCount: 0,
        },
        userReaction: 'like',
        comments: [
          {
            id: 'c-live-1',
            author: 'Hassan Abdullah',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
            text: 'মাশাআল্লাহ ভাই! লাইভ দেখতে পাচ্ছি 🌸',
            timeAgo: 'Just now',
            likes: 1,
          }
        ],
        sharesCount: 1,
      };
      onLiveCreated(newLivePost);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-4 animate-in fade-in">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-black/60 hover:bg-black text-white"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-white/20">
          <Globe className="w-3.5 h-3.5 text-[#b0b3b8]" />
          <span className="text-xs font-semibold">Public</span>
        </div>

        <button className="p-2 rounded-full bg-black/60 hover:bg-black text-white">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Center Simulated Camera Viewfinder */}
      <div className="text-center space-y-4 my-auto">
        <div className="relative w-32 h-32 mx-auto rounded-full border-4 border-red-500 p-1 flex items-center justify-center animate-pulse">
          <div className="w-full h-full rounded-full bg-red-950/60 flex items-center justify-center">
            <Radio className="w-12 h-12 text-red-500" />
          </div>
          <span className="absolute -top-2 bg-red-600 text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase">
            LIVE
          </span>
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <input
            type="text"
            value={liveTitle}
            onChange={(e) => setLiveTitle(e.target.value)}
            placeholder="লাইভের শিরোনাম লিখুন..."
            className="w-full bg-black/60 border border-neutral-700 focus:border-red-500 rounded-xl px-4 py-2 text-center text-sm font-semibold text-white outline-none"
          />
          <p className="text-xs text-neutral-400">
            {userProfile.name} হিসেবে হালাল দ্বীনি লাইভ সম্প্রচার শুরু করুন
          </p>
        </div>
      </div>

      {/* Bottom Start Button */}
      <div className="space-y-3 max-w-sm mx-auto w-full">
        <button
          onClick={handleStartLive}
          disabled={isBroadcasting}
          className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
        >
          <Radio className="w-5 h-5" />
          <span>{isBroadcasting ? 'সংযোগ হচ্ছে...' : 'Start Live Video (লাইভ শুরু করুন)'}</span>
        </button>
      </div>
    </div>
  );
};
