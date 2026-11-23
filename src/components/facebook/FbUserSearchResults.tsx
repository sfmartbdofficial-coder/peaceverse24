import React, { useEffect, useState } from 'react';
import {
  Search,
  UserPlus,
  Check,
  BadgeCheck,
  UserCheck,
  Users,
  Flag,
  Loader2,
  X,
  Plus,
} from 'lucide-react';
import { PageItem, SearchedUserProfile } from '../../types';
import {
  isTargetFollowedLocally,
  toggleFollowUser,
  isSameOwnerIdentity,
  isTargetFriendLocally,
  isFriendRequestSentLocally,
} from '../../lib/firebase';

interface FbUserSearchResultsProps {
  query: string;
  results: SearchedUserProfile[];
  pageResults?: PageItem[];
  isLoading: boolean;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  sentRequestIds: Record<string, boolean>;
  onToggleFriendRequest: (user: SearchedUserProfile) => void;
  onOpenUserProfile: (user: SearchedUserProfile) => void;
  onOpenPage?: (page: PageItem) => void;
  onToggleFollowPage?: (page: PageItem) => void;
  onClearSearch: () => void;
}

export const FbUserSearchResults: React.FC<FbUserSearchResultsProps> = ({
  query,
  results,
  pageResults = [],
  isLoading,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  sentRequestIds,
  onToggleFriendRequest,
  onOpenUserProfile,
  onOpenPage,
  onToggleFollowPage,
  onClearSearch,
}) => {
  const trimmed = query.trim();
  const totalCount = pageResults.length + results.length;
  const [, setFollowSyncTick] = useState(0);

  useEffect(() => {
    const sync = () => setFollowSyncTick((t) => t + 1);
    window.addEventListener('peaceverse:follows-updated', sync);
    window.addEventListener('peaceverse:friends-updated', sync);
    window.addEventListener('peaceverse:friend-requests-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('peaceverse:follows-updated', sync);
      window.removeEventListener('peaceverse:friends-updated', sync);
      window.removeEventListener('peaceverse:friend-requests-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return (
    <div className="space-y-2.5 my-1">
      {/* Facebook-style Unified Search Header Card */}
      <div className="bg-white rounded-[12px] border border-[#E4E6EB] px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold text-[#050505] truncate">
              Results for &ldquo;{trimmed}&rdquo;
            </h2>
            <p className="text-xs text-[#65676B]">
              {isLoading
                ? 'Searching people and pages...'
                : totalCount === 0
                ? '0 results found'
                : [
                    pageResults.length > 0
                      ? `${pageResults.length} ${pageResults.length === 1 ? 'page' : 'pages'}`
                      : null,
                    results.length > 0
                      ? `${results.length} ${results.length === 1 ? 'person' : 'people'}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
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
          <span>Searching people &amp; pages...</span>
        </div>
      ) : totalCount === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-[12px] border border-[#E4E6EB] px-5 py-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
          <div className="w-16 h-16 rounded-full bg-[#F0F2F5] border border-[#E4E6EB] flex items-center justify-center mx-auto mb-3.5">
            <Search className="w-7 h-7 text-[#65676B]" />
          </div>
          <h3 className="text-[17px] font-bold text-[#050505]">No results found</h3>
          <p className="text-[13px] text-[#65676B] max-w-xs mx-auto mt-1.5">
            No person or page matched &ldquo;{trimmed}&rdquo;. Check the spelling or try searching another name.
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
        <div className="space-y-2.5">
          {/* PAGES SECTION */}
          {pageResults.length > 0 && (
            <div className="bg-white rounded-[12px] border border-[#E4E6EB] shadow-[0_1px_2px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#E4E6EB] flex items-center gap-2 bg-[#F7F8FA]">
                <Flag className="w-4 h-4 text-[#0866FF]" />
                <span className="text-xs font-bold text-[#050505] uppercase tracking-wide">
                  Pages ({pageResults.length})
                </span>
              </div>
              <div className="divide-y divide-[#E4E6EB]">
                {pageResults.map((page) => {
                  const isOwnPage =
                    Boolean(page.isOwner) ||
                    isSameOwnerIdentity(page.id, page.name, currentUserId, currentUserName);
                  const isFollowed = !isOwnPage && isTargetFollowedLocally(page.id, page.name);
                  const fallbackPageAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    page.name || 'Page'
                  )}&backgroundColor=0866ff,1877f2,0ea5e9`;

                  return (
                    <div
                      key={page.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#F7F8FA] transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => onOpenPage?.(page)}
                        className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer group"
                      >
                        <img
                          src={page.avatar || fallbackPageAvatar}
                          alt={page.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = fallbackPageAvatar;
                          }}
                          className="w-14 h-14 rounded-full object-cover border border-[#E4E6EB] bg-[#F0F2F5] shrink-0"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="text-[15px] font-bold text-[#050505] group-hover:underline truncate">
                              {page.name}
                            </span>
                            <BadgeCheck className="w-4 h-4 text-[#0866FF] shrink-0" />
                          </div>

                          <p className="text-xs text-[#65676B] truncate">
                            Page · {page.category || 'Community'}
                          </p>

                          <p className="text-xs text-[#65676B] truncate mt-0.5">
                            {(page.followersCount || 1).toLocaleString()} followers
                          </p>
                        </div>
                      </button>

                      <div className="shrink-0">
                        {isOwnPage ? (
                          <button
                            type="button"
                            onClick={() => onOpenPage?.(page)}
                            className="px-3.5 py-2 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold transition-colors cursor-pointer"
                          >
                            Your Page
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onToggleFollowPage?.(page)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isFollowed
                                ? 'bg-[#E7F3FF] text-[#0866FF] hover:bg-[#DBE7F2]'
                                : 'bg-[#0866FF] hover:bg-[#166FE5] active:scale-95 text-white shadow-xs'
                            }`}
                          >
                            {isFollowed ? (
                              <>
                                <Check className="w-4 h-4 stroke-[2.5]" />
                                <span>Following</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 stroke-[2.5]" />
                                <span>Follow</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PEOPLE SECTION */}
          {results.length > 0 && (
            <div className="bg-white rounded-[12px] border border-[#E4E6EB] shadow-[0_1px_2px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#E4E6EB] flex items-center gap-2 bg-[#F7F8FA]">
                <Users className="w-4 h-4 text-[#0866FF]" />
                <span className="text-xs font-bold text-[#050505] uppercase tracking-wide">
                  People ({results.length})
                </span>
              </div>
              <div className="divide-y divide-[#E4E6EB]">
                {results.map((user) => {
                  const isSelf = isSameOwnerIdentity(
                    user.id,
                    user.displayName,
                    currentUserId,
                    currentUserName
                  );
                  const isFriend = !isSelf && isTargetFriendLocally(user.id, user.displayName);
                  const isFollowOnly = !isSelf && !isFriend && user.allowFriendRequests === false;
                  const isRequested =
                    Boolean(sentRequestIds[user.id]) ||
                    isFriendRequestSentLocally(user.id, user.displayName);
                  const isFollowed = isTargetFollowedLocally(user.id, user.displayName);
                  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    user.displayName || 'User'
                  )}&backgroundColor=1877f2,0ea5e9,3b82f6`;

                  const handleToggleFollowPerson = async () => {
                    await toggleFollowUser(
                      currentUserId || 'user-me',
                      currentUserName || 'Member',
                      currentUserAvatar || '',
                      user.id,
                      user.displayName,
                      user.avatar || ''
                    );
                    setFollowSyncTick((t) => t + 1);
                  };

                  return (
                    <div
                      key={user.id}
                      className="p-3.5 flex items-center justify-between gap-2.5 hover:bg-[#F7F8FA] transition-colors"
                    >
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
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-[#E4E6EB] bg-[#F0F2F5] shrink-0"
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

                      <div className="shrink-0 flex items-center gap-1.5">
                        {isSelf ? (
                          <button
                            type="button"
                            onClick={() => onOpenUserProfile(user)}
                            className="px-3.5 py-2 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>You</span>
                          </button>
                        ) : isFriend ? (
                          <button
                            type="button"
                            onClick={() => onOpenUserProfile(user)}
                            className="px-3.5 py-2 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Friends</span>
                          </button>
                        ) : isFollowOnly ? (
                          <button
                            type="button"
                            onClick={handleToggleFollowPerson}
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isFollowed
                                ? 'bg-[#E7F3FF] text-[#0866FF] hover:bg-[#DBE7F2]'
                                : 'bg-[#0866FF] hover:bg-[#166FE5] active:scale-95 text-white shadow-xs'
                            }`}
                          >
                            {isFollowed ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Following</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Follow</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onToggleFriendRequest(user)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isRequested
                                ? 'bg-[#E7F3FF] hover:bg-[#DBE7F2] text-[#0866FF]'
                                : 'bg-[#0866FF] hover:bg-[#166FE5] active:scale-95 text-white shadow-xs'
                            }`}
                          >
                            {isRequested ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Request sent</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4" />
                                <span>Add Friend</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
