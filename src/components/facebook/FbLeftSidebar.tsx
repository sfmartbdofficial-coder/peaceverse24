import React from 'react';
import {
  Home,
  Tv,
  Users,
  Bookmark,
  BookOpen,
  Scroll,
  HeartHandshake,
  Radio,
  ShieldCheck,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { FacebookTab } from './FbHeader';

interface FbLeftSidebarProps {
  currentTab: FacebookTab;
  onTabChange: (tab: FacebookTab) => void;
  savedCount: number;
  onOpenHalalPolicy: () => void;
}

export const FbLeftSidebar: React.FC<FbLeftSidebarProps> = ({
  currentTab,
  onTabChange,
  savedCount,
  onOpenHalalPolicy,
}) => {
  const navItems: { id: FacebookTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'home',
      label: 'হোম ফিড (Home)',
      icon: <Home className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'reels',
      label: 'ভিডিও ও তিলাওয়াত (Reels)',
      icon: <Tv className="w-5 h-5 text-rose-500" />,
      badge: 'LIVE',
    },
    {
      id: 'friends',
      label: 'ফ্রেন্ডস ও উম্মাহ (Friends)',
      icon: <Users className="w-5 h-5 text-blue-400" />,
      badge: '6',
    },
    {
      id: 'groups',
      label: 'ইসলামিক গ্রুপস (Groups)',
      icon: <Users className="w-5 h-5 text-teal-400" />,
    },
    {
      id: 'saved',
      label: 'সংরক্ষিত পোস্ট (Saved)',
      icon: <Bookmark className="w-5 h-5 text-purple-400" />,
      badge: savedCount > 0 ? `${savedCount}` : undefined,
    },
  ];

  return (
    <aside className="hidden lg:block w-72 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto no-scrollbar p-3 space-y-4">
      
      {/* Profile Row */}
      <div
        onClick={() => onTabChange('profile')}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#3a3b3c] cursor-pointer transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
          Q
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs text-white truncate">Qalby Member</p>
          <p className="text-[10px] text-emerald-400">১০০% হালাল প্রোফাইল</p>
        </div>
      </div>

      <div className="border-t border-[#393a3b]" />

      {/* Main Navigation Items */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-[#3a3b3c] text-white'
                  : 'text-[#e4e6eb] hover:bg-[#3a3b3c]/70'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="border-t border-[#393a3b]" />

      {/* 100% Halal Guarantee Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-[#242526] to-black border border-emerald-500/40 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>Qalby হালাল সোশ্যাল নীতি</span>
        </div>
        <p className="text-[11px] text-[#b0b3b8] leading-relaxed font-bengali">
          বাদ্যযন্ত্রমুক্ত, অশ্লীল বিজ্ঞাপনহীন এবং খাঁটি কুরআন-সুন্নাহর নির্ভরযোগ্য ইসলামিক সামাজিক প্ল্যাটফর্ম।
        </p>
        <button
          onClick={onOpenHalalPolicy}
          className="text-xs text-emerald-300 hover:underline font-semibold flex items-center gap-1"
        >
          <span>বিস্তারিত নীতিমালা পড়ুন</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Footer Info */}
      <div className="px-2 text-[10px] text-[#b0b3b8] space-y-1">
        <p>Qalby (قلبي) © 2026. ফেসবুকের বিকল্প হালাল মাধ্যম।</p>
      </div>

    </aside>
  );
};
