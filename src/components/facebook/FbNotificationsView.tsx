import React, { useState } from 'react';
import { Menu, Search, MoreHorizontal, UserCheck, Check, Trash2, Flag, Heart, Bell, ArrowLeft } from 'lucide-react';
import { NotificationItem } from '../../types';

interface FbNotificationsViewProps {
  notifications: NotificationItem[];
  onOpenMenu: () => void;
  onBack: () => void;
  onConfirmRequest: (notifId: string) => void;
  onDeleteRequest: (notifId: string) => void;
}

export const FbNotificationsView: React.FC<FbNotificationsViewProps> = ({
  notifications,
  onOpenMenu,
  onBack,
  onConfirmRequest,
  onDeleteRequest,
}) => {
  const [confirmedIds, setConfirmedIds] = useState<Record<string, boolean>>({});
  const [deletedIds, setDeletedIds] = useState<Record<string, boolean>>({});

  const handleConfirm = (id: string) => {
    setConfirmedIds((prev) => ({ ...prev, [id]: true }));
    onConfirmRequest(id);
  };

  const handleDelete = (id: string) => {
    setDeletedIds((prev) => ({ ...prev, [id]: true }));
    onDeleteRequest(id);
  };

  return (
    <div className="max-w-[700px] mx-auto min-h-screen bg-[#18191a] text-[#e4e6eb] pb-24">
      {/* Top Header matching Screenshot 2 */}
      <div className="sticky top-0 z-30 bg-[#242526] border-b border-[#393a3b] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full text-[#e4e6eb] hover:bg-[#3a3b3c] transition-colors"
            title="পেছনে যান (Back)"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          <button
            onClick={onOpenMenu}
            className="p-1 rounded-full text-[#b0b3b8] hover:bg-[#3a3b3c]"
            title="Menu"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="font-bold text-xl sm:text-2xl text-white">Notifications</h1>
        </div>

        <button className="w-9 h-9 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] flex items-center justify-center transition-colors">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Subheading: "New" */}
      <div className="px-4 py-3">
        <h2 className="text-base font-bold text-white">New</h2>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-[#393a3b]/60">
        {notifications.map((item) => {
          if (deletedIds[item.id]) return null;

          const isConfirmed = confirmedIds[item.id];

          return (
            <div
              key={item.id}
              className={`p-3.5 sm:px-4 flex items-start gap-3 transition-colors ${
                item.isUnread ? 'bg-[#242526]/80 hover:bg-[#242526]' : 'hover:bg-[#242526]/50'
              }`}
            >
              {/* Avatar with Type Badge */}
              <div className="relative flex-shrink-0 mt-0.5">
                <img
                  src={item.avatar}
                  alt="avatar"
                  className="w-14 h-14 rounded-full object-cover border border-[#393a3b]"
                />
                
                {/* Badge (Blue friend icon, Orange page icon, etc.) */}
                {item.type === 'friend_request' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1877F2] border-2 border-[#242526] flex items-center justify-center text-white">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                )}
                {item.badgeType === 'page' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#fa3e3e] border-2 border-[#242526] flex items-center justify-center text-white">
                    <Flag className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}
                {item.badgeType === 'heart' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#e41e3f] border-2 border-[#242526] flex items-center justify-center text-white">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}
              </div>

              {/* Text & Action Buttons */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <p className="text-sm text-[#e4e6eb] leading-snug">
                    <span className="font-bold text-white">{item.title.split(' sent you')[0]}</span>
                    {item.title.includes(' sent you') && ' sent you a friend request.'}
                    {!item.title.includes(' sent you') && (
                      <span className="font-normal text-[#e4e6eb]"> {item.title}</span>
                    )}
                    <span className="text-xs text-[#b0b3b8] font-normal ml-1.5">• {item.timeAgo}</span>
                  </p>

                  <button className="p-1 text-[#b0b3b8] hover:text-white rounded-full flex-shrink-0">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {item.subtitle && (
                  <p className="text-xs text-[#b0b3b8] mt-0.5">{item.subtitle}</p>
                )}

                {/* Friend Request Action Buttons: Confirm & Delete (Exact Facebook Style) */}
                {item.type === 'friend_request' && (
                  <div className="mt-2.5 flex items-center gap-2">
                    {isConfirmed ? (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Request Accepted (বন্ধু হিসেবে যুক্ত হয়েছেন)
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleConfirm(item.id)}
                          className="flex-1 max-w-[130px] py-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold text-center transition-colors shadow-sm"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex-1 max-w-[130px] py-2 rounded-lg bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] text-xs font-bold text-center transition-colors"
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
