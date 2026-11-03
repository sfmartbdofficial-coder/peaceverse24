import React from 'react';
import { Clock, Radio, Users, MessageCircle, Sparkles } from 'lucide-react';
import { ChatFriend } from '../../types';

interface FbRightSidebarProps {
  friends: ChatFriend[];
  onOpenChatWithFriend: (friend: ChatFriend) => void;
  onOpenWatchLive: () => void;
}

export const FbRightSidebar: React.FC<FbRightSidebarProps> = ({
  friends,
  onOpenChatWithFriend,
  onOpenWatchLive,
}) => {
  const prayerTimes = [
    { name: 'ফজর', time: '০৪:৫২ AM', current: false },
    { name: 'যোহর', time: '১১:৫৮ AM', current: false },
    { name: 'আসর', time: '০৩:৪৮ PM', current: true },
    { name: 'মাগরিব', time: '০৫:৩৫ PM', current: false },
    { name: 'ইশা', time: '০৬:৪৯ PM', current: false },
  ];

  return (
    <aside className="hidden xl:block w-80 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto no-scrollbar p-3 space-y-4">
      
      {/* 1. Daily Prayer Times Widget */}
      <div className="bg-[#242526] rounded-2xl border border-[#393a3b] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>আজকের নামাজের সময়সূচি</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
            ঢাকা
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1 text-center">
          {prayerTimes.map((p) => (
            <div
              key={p.name}
              className={`p-1.5 rounded-lg border text-xs ${
                p.current
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold ring-1 ring-emerald-400'
                  : 'bg-[#18191a] border-neutral-800 text-[#b0b3b8]'
              }`}
            >
              <p className="text-[10px]">{p.name}</p>
              <p className="text-[10px] font-mono mt-0.5">{p.time.split(' ')[0]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Makkah Live 24/7 Preview Card */}
      <div
        onClick={onOpenWatchLive}
        className="bg-[#242526] rounded-2xl border border-[#393a3b] hover:border-emerald-500/50 p-3 cursor-pointer group transition-all space-y-2 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>২৪/৭ সরাসরি লাইভ হারামাইন</span>
          </span>
          <span className="text-[10px] text-rose-400 font-bold px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-800">
            LIVE
          </span>
        </div>

        <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
          <img
            src="https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&q=80"
            alt="Makkah Live"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="px-3 py-1 rounded-full bg-black/70 text-white text-[11px] font-medium backdrop-blur-sm">
              ▶ সরাসরি দেখতে ক্লিক করুন
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-[#393a3b]" />

      {/* 3. Facebook Contacts / Online Muslim Friends */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-2 py-1 text-[#b0b3b8] font-bold text-xs uppercase tracking-wider">
          <span>যোগাযোগ (Contacts)</span>
          <Users className="w-4 h-4" />
        </div>

        {friends.map((friend) => (
          <div
            key={friend.id}
            onClick={() => onOpenChatWithFriend(friend)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#3a3b3c] cursor-pointer transition-colors"
          >
            <div className="relative">
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-8 h-8 rounded-full object-cover border border-[#393a3b]"
              />
              {friend.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#242526] rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#e4e6eb] truncate">{friend.name}</p>
              <p className="text-[10px] text-[#b0b3b8] truncate">
                {friend.online ? 'সক্রিয় আছেন' : friend.lastSeen}
              </p>
            </div>

            <MessageCircle className="w-4 h-4 text-[#b0b3b8] hover:text-emerald-400" />
          </div>
        ))}
      </div>

    </aside>
  );
};
