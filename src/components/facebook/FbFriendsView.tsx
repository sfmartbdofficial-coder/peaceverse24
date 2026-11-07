import React, { useState } from 'react';
import { UserCheck, Check, Trash2, Search, ArrowLeft, Users } from 'lucide-react';

interface FbFriendsViewProps {
  onBack?: () => void;
  onConfirmRequest?: (id: string) => void;
  onDeleteRequest?: (id: string) => void;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
}

export const FbFriendsView: React.FC<FbFriendsViewProps> = ({
  onBack,
  onConfirmRequest,
  onDeleteRequest,
  currentUserId = 'user-me',
  currentUserName = 'Sharif Hasan',
  currentUserAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80',
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'friends'>('requests');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Friend Requests (0 by default for genuine new accounts)
  const [requests, setRequests] = useState<
    Array<{
      id: string;
      name: string;
      avatar: string;
      timeAgo: string;
      mutualFriend: string;
      status: string;
    }>
  >([]);

  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [deleted, setDeleted] = useState<Record<string, boolean>>({});

  // 2. Existing Friends List (0 friends by default for genuine new accounts)
  const [friendsList, setFriendsList] = useState<
    Array<{
      id: string;
      name: string;
      avatar: string;
      mutualCount: number;
      isOnline: boolean;
    }>
  >([]);

  const handleConfirm = (id: string) => {
    setConfirmed((prev) => ({ ...prev, [id]: true }));
    if (onConfirmRequest) onConfirmRequest(id);
  };

  const handleDelete = (id: string) => {
    setDeleted((prev) => ({ ...prev, [id]: true }));
    if (onDeleteRequest) onDeleteRequest(id);
  };

  const pendingRequests = requests.filter((r) => !deleted[r.id] && !confirmed[r.id]);

  return (
    <div className="max-w-[700px] mx-auto min-h-screen bg-[#F0F2F5] dark:bg-[#121212] text-[#050505] dark:text-[#e4e6eb] p-3 sm:p-4 space-y-4 pb-24 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB] dark:border-[#393a3b]">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-[#E4E6EB] dark:hover:bg-[#3a3b3c] text-[#050505] dark:text-white transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-[#050505] dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0866FF]" />
            <span>Friends (বন্ধু)</span>
          </h1>
        </div>

        {/* Search */}
        <div className="relative w-40 sm:w-56">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            className="w-full bg-[#E4E6EB] dark:bg-[#3a3b3c] text-xs text-[#050505] dark:text-white rounded-full pl-7 pr-3 py-1.5 placeholder-[#65676B] dark:placeholder-[#8a8d91] focus:outline-none focus:ring-1 focus:ring-[#0866FF]"
          />
          <Search className="w-3.5 h-3.5 text-[#65676B] dark:text-[#8a8d91] absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Filter Tabs (Strictly Friends Only: Requests & Friends) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-full font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'requests'
              ? 'bg-[#0866FF] text-white'
              : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] dark:text-[#e4e6eb]'
          }`}
        >
          Friend requests ({pendingRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'friends'
              ? 'bg-[#0866FF] text-white'
              : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] dark:text-[#e4e6eb]'
          }`}
        >
          Your friends ({friendsList.length})
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: FRIEND REQUESTS */}
      {/* ======================================================== */}
      {activeTab === 'requests' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#050505] dark:text-white">
              Friend Requests ({pendingRequests.length})
            </h2>
            <span className="text-xs text-[#65676B] dark:text-[#b0b3b8]">মেইন অ্যাকাউন্টে শুধু ফ্রেন্ডস</span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-white dark:bg-[#242526] rounded-[8px] border border-[#E4E6EB] dark:border-[#393a3b] p-8 text-center space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.1)] my-2">
              <div className="w-12 h-12 rounded-full bg-[#0866FF]/15 border border-[#0866FF]/30 flex items-center justify-center text-[#0866FF] mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#050505] dark:text-white">কোনো ফ্রেন্ড রিকোয়েস্ট নেই (0 Requests)</h3>
              <p className="text-xs text-[#65676B] dark:text-[#b0b3b8] max-w-sm mx-auto">
                আপনার অ্যাকাউন্ট নতুন খোলা হয়েছে। অন্য সদস্যরা ফ্রেন্ড রিকোয়েস্ট পাঠালে তা এখানে সরাসরি দেখতে পাবেন।
              </p>
            </div>
          ) : (
            pendingRequests
              .filter((req) => req.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((req) => {
                const isConf = confirmed[req.id];

                return (
                  <div
                    key={req.id}
                    className="p-3 rounded-[8px] bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#393a3b] flex items-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                  >
                    <img
                      src={req.avatar}
                      alt={req.name}
                      className="w-16 h-16 rounded-full object-cover border border-[#E4E6EB] dark:border-[#393a3b] flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm text-[#050505] dark:text-white truncate">{req.name}</p>
                        <span className="text-xs text-[#65676B] dark:text-[#b0b3b8]">{req.timeAgo}</span>
                      </div>
                      <p className="text-xs text-[#65676B] dark:text-[#b0b3b8] truncate">{req.mutualFriend}</p>

                      <div className="mt-2 flex items-center gap-2">
                        {isConf ? (
                          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                            <Check className="w-4 h-4" /> Request confirmed
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleConfirm(req.id)}
                              className="flex-1 py-1.5 rounded-lg bg-[#0866FF] hover:bg-[#0055d4] text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleDelete(req.id)}
                              className="flex-1 py-1.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] dark:text-[#e4e6eb] text-xs font-bold transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: YOUR FRIENDS */}
      {/* ======================================================== */}
      {activeTab === 'friends' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#050505] dark:text-white">আপনার বন্ধু তালিকা ({friendsList.length})</h2>
            {friendsList.length > 0 && (
              <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {friendsList.filter((f) => f.isOnline).length} জন অনলাইন
              </span>
            )}
          </div>

          {friendsList.length === 0 ? (
            <div className="bg-white dark:bg-[#242526] rounded-[8px] border border-[#E4E6EB] dark:border-[#393a3b] p-8 text-center space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.1)] my-2">
              <div className="w-12 h-12 rounded-full bg-[#0866FF]/15 border border-[#0866FF]/30 flex items-center justify-center text-[#0866FF] mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#050505] dark:text-white">এখনও কোনো বন্ধু যুক্ত নেই (0 Friends)</h3>
              <p className="text-xs text-[#65676B] dark:text-[#b0b3b8] max-w-sm mx-auto">
                আপনার ফ্রেন্ডলিস্ট এখন সম্পূর্ণ জেনুইন ও স্বচ্ছ। নতুন অ্যাকাউন্ট খোলার কারণে এখানে কোনো ফেক ফ্রেন্ড বা ফলোয়ার নেই—আসল ফ্রেন্ড রিকোয়েস্ট অ্যাকসেপ্ট করলে তারা এখানে যুক্ত হবে।
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {friendsList
                .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((friend) => (
                  <div
                    key={friend.id}
                    className="p-3 rounded-[8px] bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#393a3b] flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-12 h-12 rounded-full object-cover border border-[#E4E6EB] dark:border-[#393a3b]"
                        />
                        {friend.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#242526]" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#050505] dark:text-white">{friend.name}</p>
                        <p className="text-xs text-[#65676B] dark:text-[#b0b3b8]">{friend.mutualCount} জন মিউচুয়াল ফ্রেন্ড</p>
                      </div>
                    </div>

                    <button className="px-3.5 py-1.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-xs font-bold text-[#050505] dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] dark:text-[#e4e6eb] transition-colors cursor-pointer">
                      Message
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
