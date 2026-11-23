import React, { useEffect, useMemo, useState } from 'react';
import { UserPlus, Check, Users } from 'lucide-react';
import { DUMMY_COMMUNITY_USERS } from '../../data/dummyCommunity';
import { SearchedUserProfile } from '../../types';
import {
  isSameOwnerIdentity,
  isTargetFriendLocally,
  isFriendRequestSentLocally,
  toggleLocalFriendRequestAndSync,
  readRemovedSuggestionsStore,
  markSuggestionRemovedLocally,
} from '../../lib/firebase';

export interface SuggestionPersonCard {
  id: string;
  name: string;
  avatar: string;
  mutualText: string;
  isOnline?: boolean;
  bio?: string;
  location?: string;
  verified?: boolean;
}

const BASE_SUGGESTION_PEOPLE: SuggestionPersonCard[] = [
  {
    id: 'sug-1',
    name: 'Biplob Hosen',
    avatar:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=240&q=80',
    mutualText: '5 mutual friends',
    isOnline: true,
    location: 'Dhaka, Bangladesh',
  },
  {
    id: 'sug-2',
    name: 'Naimur Rahman',
    avatar:
      'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=240&q=80',
    mutualText: '3 mutual friends',
    isOnline: false,
    location: 'Sylhet, Bangladesh',
  },
  ...DUMMY_COMMUNITY_USERS.filter((u) => u.allowFriendRequests !== false).map((u, idx) => ({
    id: u.id,
    name: u.displayName,
    avatar: u.avatar,
    mutualText: `${(idx % 6) + 1} mutual friend${idx % 6 === 0 ? '' : 's'}`,
    isOnline: idx % 2 === 0,
    bio: u.bio,
    location: u.location,
    verified: u.verified,
  })),
];

interface FbPeopleYouMayKnowSectionProps {
  variant?: 'feed' | 'list';
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  searchQuery?: string;
  onSeeAllFriends?: () => void;
  onOpenUserProfile?: (user: SearchedUserProfile) => void;
}

export const FbPeopleYouMayKnowSection: React.FC<FbPeopleYouMayKnowSectionProps> = ({
  variant = 'feed',
  currentUserId,
  currentUserName,
  currentUserAvatar,
  searchQuery = '',
  onSeeAllFriends,
  onOpenUserProfile,
}) => {
  const [syncTick, setSyncTick] = useState(0);
  const [removedMap, setRemovedMap] = useState<Record<string, boolean>>(() =>
    readRemovedSuggestionsStore()
  );

  useEffect(() => {
    const bump = () => {
      setSyncTick((t) => t + 1);
      setRemovedMap(readRemovedSuggestionsStore());
    };
    window.addEventListener('peaceverse:friends-updated', bump);
    window.addEventListener('peaceverse:friend-requests-updated', bump);
    window.addEventListener('peaceverse:suggestions-updated', bump);
    window.addEventListener('storage', bump);
    return () => {
      window.removeEventListener('peaceverse:friends-updated', bump);
      window.removeEventListener('peaceverse:friend-requests-updated', bump);
      window.removeEventListener('peaceverse:suggestions-updated', bump);
      window.removeEventListener('storage', bump);
    };
  }, []);

  const visibleSuggestions = useMemo(() => {
    void syncTick;
    const q = searchQuery.trim().toLowerCase();
    const seen = new Set<string>();
    return BASE_SUGGESTION_PEOPLE.filter((person) => {
      const normName = person.name.normalize('NFC').trim().toLowerCase();
      if (seen.has(person.id) || seen.has(normName)) return false;
      seen.add(person.id);
      seen.add(normName);

      if (removedMap[person.id]) return false;
      if (isSameOwnerIdentity(person.id, person.name, currentUserId, currentUserName)) {
        return false;
      }
      if (isTargetFriendLocally(person.id, person.name)) return false;
      if (q && !person.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [syncTick, removedMap, currentUserId, currentUserName, searchQuery]);

  if (visibleSuggestions.length === 0) return null;

  const handleAddFriend = async (person: SuggestionPersonCard) => {
    await toggleLocalFriendRequestAndSync(
      currentUserId || 'user-me',
      currentUserName || 'Member',
      currentUserAvatar || '',
      {
        id: person.id,
        name: person.name,
        avatar: person.avatar,
      }
    );
    setSyncTick((t) => t + 1);
  };

  const handleRemove = (personId: string) => {
    markSuggestionRemovedLocally(personId);
    setRemovedMap((prev) => ({ ...prev, [personId]: true }));
  };

  const openPerson = (person: SuggestionPersonCard) => {
    if (!onOpenUserProfile) return;
    onOpenUserProfile({
      id: person.id,
      uid: person.id,
      displayName: person.name,
      avatar: person.avatar,
      bio: person.bio,
      location: person.location,
      verified: person.verified,
      allowFriendRequests: true,
    });
  };

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {visibleSuggestions.map((person) => {
          const isSent = isFriendRequestSentLocally(person.id, person.name);
          return (
            <div
              key={person.id}
              className="bg-white rounded-xl py-2 flex items-center gap-3.5"
            >
              <button
                type="button"
                onClick={() => openPerson(person)}
                className="relative shrink-0 cursor-pointer"
              >
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-20 h-20 rounded-full object-cover border border-[#E4E6EB]"
                />
                {person.isOnline && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#31A24C] border-2 border-white" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => openPerson(person)}
                  className="font-bold text-[16px] text-[#050505] truncate block text-left hover:underline cursor-pointer"
                >
                  {person.name}
                </button>
                <p className="text-xs text-[#65676B] mt-0.5">{person.mutualText}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddFriend(person)}
                    className={`flex-1 py-2 rounded-lg text-[14px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isSent
                        ? 'bg-[#E7F3FF] text-[#1877F2]'
                        : 'bg-[#1877F2] hover:bg-[#166fe5] text-white'
                    }`}
                  >
                    {isSent ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Request sent</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Add Friend</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(person.id)}
                    className="flex-1 py-2 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-[14px] font-bold transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <section className="bg-white border border-[#E4E6EB] rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.08)] p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#0866FF]" />
          <h3 className="text-[16px] font-bold text-[#050505]">People you may know</h3>
        </div>
        {onSeeAllFriends && (
          <button
            type="button"
            onClick={onSeeAllFriends}
            className="text-[13px] font-semibold text-[#0866FF] hover:bg-[#E7F3FF] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            See all
          </button>
        )}
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        {visibleSuggestions.slice(0, 12).map((person) => {
          const isSent = isFriendRequestSentLocally(person.id, person.name);
          return (
            <div
              key={person.id}
              className="w-[172px] shrink-0 rounded-xl border border-[#E4E6EB] bg-white overflow-hidden shadow-2xs flex flex-col"
            >
              <button
                type="button"
                onClick={() => openPerson(person)}
                className="w-full h-[160px] bg-[#F0F2F5] overflow-hidden relative cursor-pointer"
              >
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-full h-full object-cover hover:scale-[1.02] transition-transform"
                />
                {person.isOnline && (
                  <span className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-[#31A24C] border-2 border-white" />
                )}
              </button>

              <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
                <div>
                  <button
                    type="button"
                    onClick={() => openPerson(person)}
                    className="text-[14.5px] font-bold text-[#050505] truncate block w-full text-left hover:underline cursor-pointer"
                  >
                    {person.name}
                  </button>
                  <p className="text-[12px] text-[#65676B] truncate mt-0.5">
                    {person.mutualText}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddFriend(person)}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isSent
                        ? 'bg-[#E7F3FF] text-[#0866FF]'
                        : 'bg-[#0866FF] hover:bg-[#166FE5] text-white'
                    }`}
                  >
                    {isSent ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Request sent</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add Friend</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(person.id)}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-[13px] font-bold transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
