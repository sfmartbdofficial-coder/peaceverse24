import React, { useState } from 'react';
import {
  Menu,
  Search,
  MoreHorizontal,
  UserCheck,
  Check,
  Flag,
  Heart,
  Bell,
  ArrowLeft,
  Megaphone,
  CheckCheck,
  Video,
} from 'lucide-react';
import { NotificationItem } from '../../types';

interface FbNotificationsViewProps {
  notifications: NotificationItem[];
  onOpenMenu: () => void;
  onBack: () => void;
  onConfirmRequest: (notifId: string) => void;
  onDeleteRequest: (notifId: string) => void;
  onOpenNotification?: (notif: NotificationItem) => void;
  onMarkAllRead?: () => void;
}

export const FbNotificationsView: React.FC<FbNotificationsViewProps> = ({
  notifications,
  onOpenMenu,
  onBack,
  onConfirmRequest,
  onDeleteRequest,
  onOpenNotification,
  onMarkAllRead,
}) => {
  const [confirmedIds, setConfirmedIds] = useState<Record<string, boolean>>({});
  const [deletedIds, setDeletedIds] = useState<Record<string, boolean>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleConfirm = (id: string) => {
    setConfirmedIds((prev) => ({ ...prev, [id]: true }));
    onConfirmRequest(id);
  };

  const handleDelete = (id: string) => {
    setDeletedIds((prev) => ({ ...prev, [id]: true }));
    onDeleteRequest(id);
  };

  const filteredNotifications = notifications.filter((item) => {
    if (deletedIds[item.id]) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle || '').toLowerCase().includes(q)
    );
  });

  const unreadCount = filteredNotifications.filter((n) => n.isUnread).length;

  return (
    <div className="max-w-[700px] mx-auto min-h-screen bg-[#F0F2F5] dark:bg-[#121212] text-[#050505] dark:text-[#e4e6eb] pb-24 font-sans">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-[#242526] border-b border-[#E4E6EB] dark:border-[#393a3b] px-4 py-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1.5 rounded-full text-[#050505] dark:text-[#e4e6eb] hover:bg-[#F0F2F5] dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
              title="পেছনে যান (Back)"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
            <button
              onClick={onOpenMenu}
              className="p-1 rounded-full text-[#050505] dark:text-[#b0b3b8] hover:bg-[#F0F2F5] dark:hover:bg-[#3a3b3c] cursor-pointer"
              title="Menu"
            >
              <Menu className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <h1 className="font-bold text-xl sm:text-2xl text-[#050505] dark:text-white leading-none">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-[11px] font-semibold text-[#0866FF] mt-0.5">
                  {unreadCount}টি নতুন নোটিফিকেশন
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onMarkAllRead && unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="px-2.5 py-1.5 rounded-full bg-[#E7F3FF] dark:bg-[#0866FF]/20 text-[#0866FF] text-[11px] font-bold flex items-center gap-1 hover:bg-[#d8ebff] transition-colors cursor-pointer"
                title="সব পঠিত হিসেবে চিহ্নিত করুন"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>সব পড়ুন</span>
              </button>
            )}
            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              className="w-9 h-9 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-[#050505] dark:text-[#e4e6eb] flex items-center justify-center transition-colors cursor-pointer"
              title="Search notifications"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {searchOpen && (
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নোটিফিকেশন খুঁজুন..."
            className="w-full px-3.5 py-2 rounded-xl bg-[#F0F2F5] dark:bg-[#18191a] border border-[#E4E6EB] dark:border-[#393a3b] text-xs outline-none focus:border-[#0866FF]"
          />
        )}
      </div>

      {/* Subheading */}
      <div className="px-4 py-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#050505] dark:text-white">New & Creator Broadcasts</h2>
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <div className="mx-4 p-8 rounded-2xl bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#393a3b] text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#E7F3FF] dark:bg-[#0866FF]/20 text-[#0866FF] flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-[#050505] dark:text-white">কোনো নোটিফিকেশন নেই</h3>
          <p className="text-xs text-[#65676B] dark:text-[#b0b3b8]">
            ক্রিয়েটর বা পেজ নতুন ভিডিও, ছবি বা পোস্ট আপলোড করলে সাথে সাথে এখানে দেখতে পাবেন।
          </p>
        </div>
      )}

      {/* Notifications List */}
      <div className="divide-y divide-[#E4E6EB] dark:divide-[#393a3b]/60 bg-white dark:bg-transparent">
        {filteredNotifications.map((item) => {
          const isConfirmed = confirmedIds[item.id];
          const isBroadcast = item.type === 'new_post' || item.type === 'broadcast';

          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.type !== 'friend_request' && onOpenNotification) {
                  onOpenNotification(item);
                }
              }}
              className={`p-3.5 sm:px-4 flex items-start gap-3 transition-colors ${
                item.type !== 'friend_request' ? 'cursor-pointer' : ''
              } ${
                item.isUnread
                  ? 'bg-[#E7F3FF]/70 dark:bg-[#242526]/90 hover:bg-[#E7F3FF]'
                  : 'hover:bg-[#F0F2F5] dark:hover:bg-[#242526]/50'
              }`}
            >
              {/* Avatar with Type Badge */}
              <div className="relative flex-shrink-0 mt-0.5">
                <img
                  src={item.avatar || '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg'}
                  alt="avatar"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg';
                  }}
                  className="w-14 h-14 rounded-full object-cover border border-[#E4E6EB] dark:border-[#393a3b]"
                />

                {item.type === 'friend_request' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0866FF] border-2 border-white dark:border-[#242526] flex items-center justify-center text-white">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                )}
                {item.badgeType === 'page' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#fa3e3e] border-2 border-white dark:border-[#242526] flex items-center justify-center text-white">
                    <Flag className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}
                {item.badgeType === 'heart' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#e41e3f] border-2 border-white dark:border-[#242526] flex items-center justify-center text-white">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}
                {(isBroadcast || item.badgeType === 'broadcast') && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 border-2 border-white dark:border-[#242526] flex items-center justify-center text-white shadow-xs">
                    {item.title.includes('ভিডিও') ? (
                      <Video className="w-3.5 h-3.5" />
                    ) : (
                      <Megaphone className="w-3.5 h-3.5" />
                    )}
                  </div>
                )}
                {item.badgeType === 'bell' && !isBroadcast && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0866FF] border-2 border-white dark:border-[#242526] flex items-center justify-center text-white">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Text & Action Buttons */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {isBroadcast && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold mb-1">
                        <Megaphone className="w-3 h-3" />
                        <span>Creator Broadcast</span>
                      </span>
                    )}
                    <p className="text-sm text-[#050505] dark:text-[#e4e6eb] leading-snug">
                      <span className="font-bold text-[#050505] dark:text-white">
                        {item.title.includes(' sent you')
                          ? item.title.split(' sent you')[0]
                          : item.title}
                      </span>
                      {item.title.includes(' sent you') && ' sent you a friend request.'}
                      <span className="text-xs text-[#65676B] dark:text-[#b0b3b8] font-normal ml-1.5">
                        • {item.timeAgo}
                      </span>
                    </p>

                    {item.subtitle && (
                      <p className="text-xs text-[#65676B] dark:text-[#b0b3b8] mt-0.5 line-clamp-2">
                        {item.subtitle}
                      </p>
                    )}

                    {(item.postId || item.link) && item.type !== 'friend_request' && (
                      <p className="text-[11px] font-bold text-[#0866FF] mt-1">
                        পোস্টটি দেখতে ক্লিক করুন →
                      </p>
                    )}
                  </div>

                  {/* Thumbnail preview for Creator Broadcasts / Posts */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt="post thumbnail"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                      className="w-14 h-14 rounded-xl object-cover border border-[#E4E6EB] dark:border-[#393a3b] shrink-0 shadow-xs"
                    />
                  )}

                  {!item.image && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="p-1 text-[#65676B] dark:text-[#b0b3b8] hover:text-[#050505] dark:hover:text-white rounded-full flex-shrink-0 cursor-pointer"
                      title="Remove notification"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Unread blue indicator */}
                {item.isUnread && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#0866FF]" />
                    <span className="text-[10px] font-bold text-[#0866FF]">Unread</span>
                  </div>
                )}

                {/* Friend Request Action Buttons */}
                {item.type === 'friend_request' && (
                  <div className="mt-2.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {isConfirmed ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Request Accepted (বন্ধু হিসেবে যুক্ত হয়েছেন)
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleConfirm(item.id)}
                          className="flex-1 max-w-[130px] py-2 rounded-lg bg-[#0866FF] hover:bg-[#0055d4] text-white text-xs font-bold text-center transition-colors shadow-xs cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex-1 max-w-[130px] py-2 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] dark:text-[#e4e6eb] text-xs font-bold text-center transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
