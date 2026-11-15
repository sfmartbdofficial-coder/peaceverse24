import React from 'react';
import { Home, Clapperboard, Users, Store, Bell } from 'lucide-react';
import { FacebookMainTab, UserProfile, PageItem } from '../../types';

interface FbBottomNavProps {
  currentTab: FacebookMainTab;
  onTabChange: (tab: FacebookMainTab) => void;
  userProfile: UserProfile;
  activeSwitchedPage?: PageItem | null;
  friendRequestsCount: number;
  notificationsCount: number;
}

export const FbBottomNav: React.FC<FbBottomNavProps> = ({
  currentTab,
  onTabChange,
  userProfile,
  activeSwitchedPage = null,
  friendRequestsCount,
  notificationsCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 border-t border-[#E4E6EB] px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-md">
      <div className="max-w-[500px] mx-auto flex items-center justify-between">
        
        {/* 1. Home (🏠) */}
        <button
          onClick={() => {
            onTabChange('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            currentTab === 'home' ? 'text-[#0866FF]' : 'text-[#65676B]'
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
            currentTab === 'reels' ? 'text-[#0866FF]' : 'text-[#65676B]'
          }`}
          title="Video"
        >
          <Clapperboard className="w-6 h-6 stroke-[2]" />
        </button>

        {/* 3. Friends (👥) with badge 2 */}
        <button
          onClick={() => {
            onTabChange('friends');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative cursor-pointer ${
            currentTab === 'friends' ? 'text-[#0866FF]' : 'text-[#65676B]'
          }`}
          title="Friends"
        >
          <div className="relative">
            <Users className="w-6 h-6 stroke-[2]" />
            <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-[#e41e3f] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 ring-2 ring-white">
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
            currentTab === 'marketplace' ? 'text-[#0866FF]' : 'text-[#65676B]'
          }`}
          title="Market"
        >
          <Store className="w-6 h-6 stroke-[2]" />
        </button>

        {/* 5. Notifications (🔔) with badge 28 */}
        <button
          onClick={() => {
            onTabChange('notifications');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative cursor-pointer ${
            currentTab === 'notifications' ? 'text-[#0866FF]' : 'text-[#65676B]'
          }`}
          title="Notifications"
        >
          <div className="relative">
            <Bell className="w-6 h-6 stroke-[2]" />
            {notificationsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-4 bg-[#e41e3f] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 ring-2 ring-white">
                {notificationsCount > 99 ? '99+' : notificationsCount}
              </span>
            )}
          </div>
        </button>

        {/* 6. Profile / Menu (Shows Page Avatar when switched to page matching Screenshot 3, else SI Blue circle) */}
        <button
          onClick={() => {
            onTabChange('menu');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            currentTab === 'profile' || currentTab === 'menu' ? 'scale-105' : 'opacity-85'
          }`}
          title="Profile / Menu"
        >
          {activeSwitchedPage ? (
            <div className="relative">
              {activeSwitchedPage.avatar ? (
                <img
                  src={activeSwitchedPage.avatar}
                  alt={activeSwitchedPage.name}
                  className={`w-7 h-7 rounded-full object-cover border-2 shadow-xs ${
                    currentTab === 'profile' || currentTab === 'menu'
                      ? 'border-white ring-2 ring-[#0866FF]'
                      : 'border-transparent'
                  }`}
                />
              ) : (
                <div
                  className={`w-7 h-7 rounded-full bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center text-[11px] font-black border-2 shadow-xs ${
                    currentTab === 'profile' || currentTab === 'menu'
                      ? 'border-white ring-2 ring-[#0866FF]'
                      : 'border-transparent'
                  }`}
                >
                  {activeSwitchedPage.name.trim().charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white" />
            </div>
          ) : (
            <div
              className={`w-7 h-7 rounded-full bg-[#0866FF] text-white flex items-center justify-center text-[11px] font-black border-2 shadow-xs ${
                currentTab === 'profile' || currentTab === 'menu'
                  ? 'border-white ring-2 ring-[#0866FF]'
                  : 'border-transparent'
              }`}
            >
              SI
            </div>
          )}
        </button>

      </div>
    </nav>
  );
};
