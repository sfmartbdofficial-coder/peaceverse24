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
    <div className="max-w-[700px] mx-auto min-h-screen bg-[#F5F7FB] text-[#e4e6eb] p-3 sm:p-4 space-y-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#393a3b]">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-white transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#1877F2]" />
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
            className="w-full bg-[#3a3b3c] text-xs text-white rounded-full pl-7 pr-3 py-1.5 border border-transparent focus:outline-none focus:border-[#1877F2]"
          />
          <Search className="w-3.5 h-3.5 text-[#8a8d91] absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Filter Tabs (Strictly Friends Only: Requests & Friends) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-full font-bold text-xs shadow transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'requests'
              ? 'bg-[#1877F2] text-white'
              : 'bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb]'
          }`}
        >
          Friend requests ({pendingRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'friends'
              ? 'bg-[#1877F2] text-white'
              : 'bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb]'
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
            <h2 className="text-base font-bold text-white">
              Friend Requests ({pendingRequests.length})
            </h2>
            <span className="text-xs text-[#b0b3b8]">মেইন অ্যাকাউন্টে শুধু ফ্রেন্ডস</span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-[#242526] rounded-2xl border border-[#393a3b] p-8 text-center space-y-3 shadow-sm my-2">
              <div className="w-12 h-12 rounded-full bg-[#1877F2]/15 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2] mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">কোনো ফ্রেন্ড রিকোয়েস্ট নেই (0 Requests)</h3>
              <p className="text-xs text-[#b0b3b8] max-w-sm mx-auto">
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
                              className="flex-1 py-1.5 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleDelete(req.id)}
                              className="flex-1 py-1.5 rounded-lg bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] text-xs font-bold transition-colors cursor-pointer"
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
            <h2 className="text-base font-bold text-white">আপনার বন্ধু তালিকা ({friendsList.length})</h2>
            {friendsList.length > 0 && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {friendsList.filter((f) => f.isOnline).length} জন অনলাইন
              </span>
            )}
          </div>

          {friendsList.length === 0 ? (
            <div className="bg-[#242526] rounded-2xl border border-[#393a3b] p-8 text-center space-y-3 shadow-sm my-2">
              <div className="w-12 h-12 rounded-full bg-[#1877F2]/15 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2] mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">এখনও কোনো বন্ধু যুক্ত নেই (0 Friends)</h3>
              <p className="text-xs text-[#b0b3b8] max-w-sm mx-auto">
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
                    className="p-3 rounded-2xl bg-[#242526] border border-[#393a3b] flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-12 h-12 rounded-full object-cover border border-[#393a3b]"
                        />
                        {friend.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#242526]" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{friend.name}</p>
                        <p className="text-xs text-[#b0b3b8]">{friend.mutualCount} জন মিউচুয়াল ফ্রেন্ড</p>
                      </div>
                    </div>

                    <button className="px-3 py-1.5 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-xs font-bold text-[#e4e6eb] transition-colors cursor-pointer">
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
