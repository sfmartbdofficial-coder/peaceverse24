import React, { useState } from 'react';
import { UserCheck, Check, Trash2, Search, UserPlus, ArrowLeft } from 'lucide-react';
import { INITIAL_NOTIFICATIONS } from '../../data/islamicPosts';

interface FbFriendsViewProps {
  onBack?: () => void;
  onConfirmRequest?: (id: string) => void;
  onDeleteRequest?: (id: string) => void;
}

export const FbFriendsView: React.FC<FbFriendsViewProps> = ({
  onBack,
  onConfirmRequest,
  onDeleteRequest,
}) => {
  const [requests, setRequests] = useState([
    {
      id: 'req-1',
      name: 'Sujon Ahme',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      timeAgo: '1d',
      mutualFriend: 'আমার বাংলাদেশ is a mutual friend.',
      status: 'pending',
    },
    {
      id: 'req-2',
      name: 'Karan Viswakarma',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      timeAgo: '1d',
      mutualFriend: 'Karan Singh is a mutual friend.',
      status: 'pending',
    },
    {
      id: 'req-3',
      name: 'Md Sojibur Rahman',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      timeAgo: '17h',
      mutualFriend: 'Sk Anowar is a mutual friend.',
      status: 'pending',
    },
    {
      id: 'req-4',
      name: 'Hassan Abdullah',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
      timeAgo: '2d',
      mutualFriend: '৫ জন মিউচুয়াল ফ্রেন্ড',
      status: 'pending',
    },
    {
      id: 'req-5',
      name: 'Robel M',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
      timeAgo: '3d',
      mutualFriend: '১২ জন মিউচুয়াল ফ্রেন্ড',
      status: 'pending',
    },
  ]);

  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [deleted, setDeleted] = useState<Record<string, boolean>>({});

  const handleConfirm = (id: string) => {
    setConfirmed((prev) => ({ ...prev, [id]: true }));
    if (onConfirmRequest) onConfirmRequest(id);
  };

  const handleDelete = (id: string) => {
    setDeleted((prev) => ({ ...prev, [id]: true }));
    if (onDeleteRequest) onDeleteRequest(id);
  };

  return (
    <div className="max-w-[700px] mx-auto min-h-screen bg-[#18191a] text-[#e4e6eb] pb-24 p-3 sm:p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#393a3b]/60">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-white transition-colors"
              title="পেছনে যান (Back)"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
          )}
          <h1 className="font-bold text-2xl text-white">Friends</h1>
        </div>
        <button className="w-9 h-9 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] flex items-center justify-center transition-colors">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button className="px-4 py-2 rounded-full bg-[#1877F2] text-white font-bold text-xs shadow">
          Friend requests
        </button>
        <button className="px-4 py-2 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] font-bold text-xs">
          Your friends (330)
        </button>
      </div>

      {/* Friend Requests List */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-white">
          Friend Requests ({requests.filter((r) => !deleted[r.id] && !confirmed[r.id]).length})
        </h2>

        {requests.map((req) => {
          if (deleted[req.id]) return null;

          const isConf = confirmed[req.id];

          return (
            <div
              key={req.id}
              className="p-3 rounded-2xl bg-[#242526] border border-[#393a3b] flex items-center gap-3 shadow-sm"
            >
              <img
                src={req.avatar}
                alt={req.name}
                className="w-16 h-16 rounded-full object-cover border border-[#393a3b] flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-white truncate">{req.name}</p>
                  <span className="text-xs text-[#b0b3b8]">{req.timeAgo}</span>
                </div>
                <p className="text-xs text-[#b0b3b8] truncate">{req.mutualFriend}</p>

                <div className="mt-2 flex items-center gap-2">
                  {isConf ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Request confirmed
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleConfirm(req.id)}
                        className="flex-1 py-1.5 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="flex-1 py-1.5 rounded-lg bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] text-xs font-bold transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
