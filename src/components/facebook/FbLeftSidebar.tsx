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
    <aside className="hidden lg:block w-72 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto no-scrollbar p-3 space-y-4 bg-white">
      
      {/* Profile Row */}
      <div
        onClick={() => onTabChange('profile')}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F0F2F5] cursor-pointer transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-[#0866FF] flex items-center justify-center font-bold text-xs text-white">
          P
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs text-black truncate">Peaceverse24.com Member</p>
          <p className="text-[10px] text-emerald-600">১০০% হালাল প্রোফাইল</p>
        </div>
      </div>

      <div className="border-t border-[#E4E6EB]" />

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
                  ? 'bg-[#E7F3FF] text-[#0866FF]'
                  : 'text-black hover:bg-[#F0F2F5]'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="border-t border-[#E4E6EB]" />

      {/* 100% Halal Guarantee Banner */}
      <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 space-y-2 shadow-2xs">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>Peaceverse24.com হালাল সোশ্যাল নীতি</span>
        </div>
        <p className="text-[11px] text-[#65676B] leading-relaxed font-bengali">
          Peaceverse24.com — World's Most Peaceful Social Network for 8 Billion People. বাদ্যযন্ত্রমুক্ত ও খাঁটি কুরআন-সুন্নাহর বিশ্বব্যাপী সামাজিক প্ল্যাটফর্ম।
        </p>
        <button
          onClick={onOpenHalalPolicy}
          className="text-xs text-[#0866FF] hover:underline font-semibold flex items-center gap-1"
        >
          <span>বিস্তারিত নীতিমালা পড়ুন</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Footer Info */}
      <div className="px-2 text-[10px] text-[#65676B] space-y-1">
        <p>Peaceverse24.com — Halal Alternative © 2026.</p>
      </div>

    </aside>
  );
};
