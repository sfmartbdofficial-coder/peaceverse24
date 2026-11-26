import React from 'react';
import { Home, Clapperboard, Users, Store, Bell } from 'lucide-react';
import { FacebookMainTab, UserProfile, PageItem } from '../../types';
import { useResolvedMediaUrl } from '../../lib/mediaStorage';

interface FbBottomNavProps {
  currentTab: FacebookMainTab;
  onTabChange: (tab: FacebookMainTab) => void;
  onOpenOwnProfile?: () => void;
  userProfile: UserProfile;
  activeSwitchedPage?: PageItem | null;
  friendRequestsCount: number;
  notificationsCount: number;
}

const getInitials = (name?: string): string => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

export const FbBottomNav: React.FC<FbBottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenOwnProfile,
  userProfile,
  activeSwitchedPage = null,
  friendRequestsCount,
  notificationsCount,
}) => {
  const isReelsDark = currentTab === 'reels';
  const isProfileActive =
    currentTab === 'profile' || Boolean(activeSwitchedPage && currentTab === 'pages');
  const initials = getInitials(userProfile.name);
  const resolvedUserAvatar = useResolvedMediaUrl(userProfile.avatar);
  const resolvedPageAvatar = useResolvedMediaUrl(activeSwitchedPage?.avatar);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 border-t px-1 pb-[env(safe-area-inset-bottom)] shadow-md transition-colors ${
        isReelsDark
          ? 'bg-[#18191A] border-[#2E2F30]'
          : 'bg-white border-[#E4E6EB]'
      }`}
    >
      <div className="max-w-[500px] mx-auto h-[52px] flex items-center justify-between">
        
        {/* 1. Home (🏠) */}
        <button
          onClick={() => {
            onTabChange('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            currentTab === 'home'
              ? 'text-[#0866FF]'
              : isReelsDark
                ? 'text-[#B0B3B8] hover:text-white'
                : 'text-[#65676B]'
          }`}
          title="Home"
        >
          <Home className="w-6 h-6 stroke-[2.2]" />
        </button>

        {/* 2. Reels / Watch (🎬) */}
        <button
          onClick={() => {
            onTabChange('reels');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            currentTab === 'reels' ? 'text-white' : 'text-[#65676B]'
          }`}
          title="Reels"
        >
          <Clapperboard
            className={`w-6 h-6 stroke-[2.1] ${
              currentTab === 'reels' ? 'fill-white text-white' : ''
            }`}
          />
        </button>

        {/* 3. Friends (👥) with badge 2 */}
        <button
          onClick={() => {
            onTabChange('friends');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative cursor-pointer ${
            currentTab === 'friends'
              ? 'text-[#0866FF]'
              : isReelsDark
                ? 'text-[#B0B3B8] hover:text-white'
                : 'text-[#65676B]'
          }`}
          title="Friends"
        >
          <div className="relative">
            <Users className="w-6 h-6 stroke-[2]" />
            <span
              className={`absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-[#e41e3f] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 ring-2 ${
                isReelsDark ? 'ring-[#18191A]' : 'ring-white'
              }`}
            >
              {friendRequestsCount || 2}
            </span>
          </div>
        </button>

        {/* 4. Marketplace (🏪) */}
        <button
          onClick={() => {
            onTabChange('marketplace');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            currentTab === 'marketplace'
              ? 'text-[#0866FF]'
              : isReelsDark
                ? 'text-[#B0B3B8] hover:text-white'
                : 'text-[#65676B]'
          }`}
          title="Market"
        >
          <Store className="w-6 h-6 stroke-[2]" />
        </button>

        {/* 5. Notifications (🔔) */}
        <button
          onClick={() => {
            onTabChange('notifications');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative cursor-pointer ${
            currentTab === 'notifications'
              ? 'text-[#0866FF]'
              : isReelsDark
                ? 'text-[#B0B3B8] hover:text-white'
                : 'text-[#65676B]'
          }`}
          title="Notifications"
        >
          <div className="relative">
            <Bell className="w-6 h-6 stroke-[2]" />
            {notificationsCount > 0 && (
              <span
                className={`absolute -top-1.5 -right-2.5 min-w-[18px] h-4 bg-[#e41e3f] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 ring-2 ${
                  isReelsDark ? 'ring-[#18191A]' : 'ring-white'
                }`}
              >
                {notificationsCount > 99 ? '99+' : notificationsCount}
              </span>
            )}
          </div>
        </button>

        {/* 6. Profile Avatar (Matches Facebook: opens Profile or active Switched Page) */}
        <button
          onClick={() => {
            if (onOpenOwnProfile) {
              onOpenOwnProfile();
            } else {
              onTabChange('profile');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            isProfileActive ? 'scale-105' : 'opacity-90 hover:opacity-100'
          }`}
          title={activeSwitchedPage ? activeSwitchedPage.name : 'Profile'}
          aria-label="Open Profile"
        >
          {activeSwitchedPage ? (
            <div className="relative">
              {resolvedPageAvatar ? (
                <img
                  src={resolvedPageAvatar}
                  alt={activeSwitchedPage.name}
                  className={`w-7 h-7 rounded-full object-cover border-2 shadow-xs ${
                    isProfileActive
                      ? 'border-white ring-2 ring-[#0866FF]'
                      : isReelsDark
                        ? 'border-[#3A3B3C]'
                        : 'border-[#E4E6EB]'
                  }`}
                />
              ) : (
                <div
                  className={`w-7 h-7 rounded-full bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center text-[11px] font-black border-2 shadow-xs ${
                    isProfileActive
                      ? 'border-white ring-2 ring-[#0866FF]'
                      : isReelsDark
                        ? 'border-[#3A3B3C]'
                        : 'border-[#E4E6EB]'
                  }`}
                >
                  {activeSwitchedPage.name.trim().charAt(0).toUpperCase()}
                </div>
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-1 ${
                  isReelsDark ? 'ring-[#18191A]' : 'ring-white'
                }`}
              />
            </div>
          ) : resolvedUserAvatar ? (
            <img
              src={resolvedUserAvatar}
              alt={userProfile.name}
              className={`w-7 h-7 rounded-full object-cover border-2 shadow-xs ${
                isProfileActive
                  ? 'border-white ring-2 ring-[#0866FF]'
                  : isReelsDark
                    ? 'border-[#3A3B3C]'
                    : 'border-[#E4E6EB]'
              }`}
            />
          ) : (
            <div
              className={`w-7 h-7 rounded-full bg-[#0866FF] text-white flex items-center justify-center text-[11px] font-black border-2 shadow-xs ${
                isProfileActive
                  ? 'border-white ring-2 ring-[#0866FF]'
                  : 'border-transparent'
              }`}
            >
              {initials}
            </div>
          )}
        </button>

      </div>
    </nav>
  );
};
