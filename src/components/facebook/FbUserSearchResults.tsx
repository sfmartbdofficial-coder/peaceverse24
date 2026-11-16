import React from 'react';
import { Search, UserPlus, Check, BadgeCheck, UserCheck, Users, Loader2, X } from 'lucide-react';
import { SearchedUserProfile } from '../../types';

interface FbUserSearchResultsProps {
  query: string;
  results: SearchedUserProfile[];
  isLoading: boolean;
  currentUserId?: string;
  sentRequestIds: Record<string, boolean>;
  onToggleFriendRequest: (user: SearchedUserProfile) => void;
  onOpenUserProfile: (user: SearchedUserProfile) => void;
  onClearSearch: () => void;
}

export const FbUserSearchResults: React.FC<FbUserSearchResultsProps> = ({
  query,
  results,
  isLoading,
  currentUserId,
  sentRequestIds,
  onToggleFriendRequest,
  onOpenUserProfile,
  onClearSearch,
}) => {
  const trimmed = query.trim();

  return (
    <div className="space-y-2.5 my-1">
      {/* Facebook-style People Search Header Card */}
      <div className="bg-white rounded-[12px] border border-[#E4E6EB] px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold text-[#050505] truncate">
              People matching &ldquo;{trimmed}&rdquo;
            </h2>
            <p className="text-xs text-[#65676B]">
              {isLoading
                ? 'Searching Peaceverse users...'
                : results.length === 1
                ? '1 person found'
                : `${results.length} people found`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClearSearch}
          className="px-3 py-1.5 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-[12px] border border-[#E4E6EB] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.08)] flex items-center justify-center gap-2.5 text-sm font-medium text-[#65676B]">
          <Loader2 className="w-5 h-5 animate-spin text-[#0866FF]" />
          <span>Searching users...</span>
        </div>
      ) : results.length === 0 ? (
        /* Empty State: Exact "No user found" message */
        <div className="bg-white rounded-[12px] border border-[#E4E6EB] px-5 py-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
          <div className="w-16 h-16 rounded-full bg-[#F0F2F5] border border-[#E4E6EB] flex items-center justify-center mx-auto mb-3.5">
            <Search className="w-7 h-7 text-[#65676B]" />
          </div>
          <h3 className="text-[17px] font-bold text-[#050505]">No user found</h3>
          <p className="text-[13px] text-[#65676B] max-w-xs mx-auto mt-1.5">
            No user matched &ldquo;{trimmed}&rdquo;. Check the spelling or try searching another name or username.
          </p>
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-4 px-5 py-2 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold transition-colors cursor-pointer"
          >
            Back to Home Feed
          </button>
        </div>
      ) : (
        /* Facebook-style User Results List */
        <div className="bg-white rounded-[12px] border border-[#E4E6EB] shadow-[0_1px_2px_rgba(0,0,0,0.08)] divide-y divide-[#E4E6EB] overflow-hidden">
          {results.map((user) => {
            const isSelf = Boolean(currentUserId && user.id === currentUserId);
            const isRequested = Boolean(sentRequestIds[user.id]);
            const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              user.displayName || 'User'
            )}&backgroundColor=1877f2,0ea5e9,3b82f6`;

            return (
              <div
                key={user.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#F7F8FA] transition-colors"
              >
                {/* Profile Picture + Name/Username */}
                <button
                  type="button"
                  onClick={() => onOpenUserProfile(user)}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer group"
                >
                  <img
                    src={user.avatar || fallbackAvatar}
                    alt={user.displayName}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = fallbackAvatar;
                    }}
                    className="w-14 h-14 rounded-full object-cover border border-[#E4E6EB] bg-[#F0F2F5] shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-[15px] font-bold text-[#050505] group-hover:underline truncate">
                        {user.displayName}
                      </span>
                      {user.verified && (
                        <BadgeCheck className="w-4 h-4 text-[#0866FF] shrink-0" />
                      )}
                    </div>

                    {user.username && (
                      <p className="text-xs text-[#65676B] truncate">@{user.username}</p>
                    )}

                    {(user.bio || user.location) && (
                      <p className="text-xs text-[#65676B] truncate mt-0.5">
                        {user.bio || user.location}
                      </p>
                    )}
                  </div>
                </button>

                {/* Add Friend / Friend Request Button */}
                <div className="shrink-0">
                  {isSelf ? (
                    <button
                      type="button"
                      onClick={() => onOpenUserProfile(user)}
                      className="px-3.5 py-2 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>You</span>
                    </button>
                  ) : isRequested ? (
                    <button
                      type="button"
                      onClick={() => onToggleFriendRequest(user)}
                      className="px-3.5 py-2 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Tap to cancel friend request"
                    >
                      <Check className="w-4 h-4 text-[#0866FF] stroke-[2.5]" />
                      <span>Request Sent</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleFriendRequest(user)}
                      className="px-3.5 py-2 rounded-lg bg-[#0866FF] hover:bg-[#166FE5] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 stroke-[2.2]" />
                      <span>Add Friend</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
