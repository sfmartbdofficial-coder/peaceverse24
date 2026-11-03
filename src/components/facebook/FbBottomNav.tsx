import React from 'react';
import { Home, Clapperboard, Users, Store, Bell } from 'lucide-react';
import { FacebookMainTab, UserProfile } from '../../types';

interface FbBottomNavProps {
  currentTab: FacebookMainTab;
  onTabChange: (tab: FacebookMainTab) => void;
  userProfile: UserProfile;
  friendRequestsCount: number;
  notificationsCount: number;
}

export const FbBottomNav: React.FC<FbBottomNavProps> = ({
  currentTab,
  onTabChange,
  userProfile,
  friendRequestsCount,
  notificationsCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#242526] border-t border-[#393a3b] px-1 py-1 shadow-2xl">
      <div className="max-w-[700px] mx-auto flex items-center justify-between">
        
        {/* 1. Home (🏠) */}
        <button
          onClick={() => {
            onTabChange('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            currentTab === 'home' ? 'text-[#1877F2]' : 'text-[#b0b3b8]'
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
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            currentTab === 'reels' ? 'text-[#1877F2]' : 'text-[#b0b3b8]'
          }`}
          title="Reels / Watch"
        >
          <Clapperboard className="w-6 h-6 stroke-[2]" />
        </button>

        {/* 3. Friends (👥) with red badge '6' */}
        <button
          onClick={() => {
            onTabChange('friends');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
            currentTab === 'friends' ? 'text-[#1877F2]' : 'text-[#b0b3b8]'
          }`}
          title="Friends"
        >
          <div className="relative">
            <Users className="w-6 h-6 stroke-[2]" />
            {friendRequestsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-[#e41e3f] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 ring-2 ring-[#242526]">
                {friendRequestsCount}
              </span>
            )}
          </div>
        </button>

        {/* 4. Marketplace (🏪) */}
        <button
          onClick={() => {
            onTabChange('marketplace');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            currentTab === 'marketplace' ? 'text-[#1877F2]' : 'text-[#b0b3b8]'
          }`}
          title="Marketplace"
        >
          <Store className="w-6 h-6 stroke-[2]" />
        </button>

        {/* 5. Notifications (🔔) with red badge '39' */}
        <button
          onClick={() => {
            onTabChange('notifications');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
            currentTab === 'notifications' ? 'text-[#1877F2]' : 'text-[#b0b3b8]'
          }`}
          title="Notifications"
        >
          <div className="relative">
            <Bell className="w-6 h-6 stroke-[2]" />
            {notificationsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-4 bg-[#e41e3f] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 ring-2 ring-[#242526]">
                {notificationsCount}
              </span>
            )}
          </div>
        </button>

        {/* 6. Profile / Menu (Avatar circle with active ring) */}
        <button
          onClick={() => {
            onTabChange('profile');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            currentTab === 'profile' || currentTab === 'menu' ? 'scale-105' : 'opacity-80'
          }`}
          title="Profile / Menu"
        >
          <div
            className={`w-7 h-7 rounded-full overflow-hidden border-2 ${
              currentTab === 'profile' || currentTab === 'menu'
                ? 'border-[#1877F2] ring-1 ring-[#1877F2]'
                : 'border-[#393a3b]'
            }`}
          >
            <img
              src={userProfile.avatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </button>

      </div>
    </nav>
  );
};
