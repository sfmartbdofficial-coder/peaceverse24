import React from 'react';
import {
  Home,
  Flame,
  Tv,
  History,
  ListVideo,
  Clock,
  ThumbsUp,
  Radio,
  BookOpen,
  Scroll,
  HeartHandshake,
  Music2,
  Smile,
  ShieldCheck,
  ChevronRight,
  Menu,
  Sparkles,
  HelpCircle,
  Settings,
  FolderHeart,
  Video as VideoIcon
} from 'lucide-react';
import { ChannelInfo } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  onTabChange: (tab: any) => void;
  channels: ChannelInfo[];
  onSelectCategory: (category: string) => void;
  onSelectChannel: (channelName: string) => void;
  onOpenHalalPolicy: () => void;
  isDesktopCollapsed: boolean;
  onToggleDesktopCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentTab,
  onTabChange,
  channels,
  onSelectCategory,
  onSelectChannel,
  onOpenHalalPolicy,
  isDesktopCollapsed,
  onToggleDesktopCollapse,
}) => {
  const mainNavItems = [
    { id: 'home', label: 'হোম (Home)', icon: <Home className="w-5 h-5" /> },
    { id: 'shorts', label: 'শর্টস (Shorts)', icon: <Flame className="w-5 h-5" /> },
    { id: 'subscriptions', label: 'সাবস্ক্রিপশন (Subscriptions)', icon: <Tv className="w-5 h-5" /> },
  ];

  const youItems = [
    { id: 'history', label: 'হিস্ট্রি (History)', icon: <History className="w-5 h-5" /> },
    { id: 'saved', label: 'পরে দেখুন (Watch Later)', icon: <Clock className="w-5 h-5" /> },
    { id: 'liked', label: 'পছন্দ করা ভিডিও (Liked)', icon: <ThumbsUp className="w-5 h-5" /> },
    { id: 'playlists', label: 'প্লেলিস্ট (Playlists)', icon: <ListVideo className="w-5 h-5" /> },
    { id: 'library', label: 'আপনার লাইব্রেরি (You)', icon: <FolderHeart className="w-5 h-5" /> },
  ];

  const exploreCategories = [
    { id: 'Live', label: '২৪/৭ লাইভ হারামাইন', icon: <Radio className="w-4 h-4 text-rose-500 animate-pulse" /> },
    { id: 'Quran', label: 'পবিত্র কুরআন তিলাওয়াত', icon: <BookOpen className="w-4 h-4 text-emerald-400" /> },
    { id: 'Hadith', label: 'সহীহ হাদিস ও তাফসির', icon: <Scroll className="w-4 h-4 text-amber-400" /> },
    { id: 'Dua', label: 'মাসনূন দোয়া ও জিকির', icon: <HeartHandshake className="w-4 h-4 text-sky-400" /> },
    { id: 'Nasheed', label: 'হালাল নাশিদ (বাদ্যহীন)', icon: <Music2 className="w-4 h-4 text-purple-400" /> },
    { id: 'Video', label: 'ইসলামিক লেকচার ও বয়ান', icon: <VideoIcon className="w-4 h-4 text-emerald-300" /> },
    { id: 'Kids', label: 'শিশুতোষ ইসলামিক শিক্ষা', icon: <Smile className="w-4 h-4 text-yellow-400" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Mini Sidebar for Desktop (when collapsed) */}
      <aside
        className={`hidden lg:flex flex-col items-center py-2 bg-[#0f0f0f] border-r border-neutral-800/80 fixed left-0 top-[56px] bottom-0 z-30 transition-all duration-200 ${
          isDesktopCollapsed ? 'w-18' : 'w-0 -translate-x-full overflow-hidden pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center gap-1 w-full px-1">
          {mainNavItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center w-full py-3.5 px-1 rounded-xl transition-colors ${
                  isActive
                    ? 'text-white bg-neutral-800 font-medium'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
                title={item.label}
              >
                {item.icon}
                <span className="text-[10px] mt-1 text-center truncate w-full">
                  {item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => onTabChange('library')}
            className={`flex flex-col items-center justify-center w-full py-3.5 px-1 rounded-xl transition-colors ${
              currentTab === 'library'
                ? 'text-white bg-neutral-800 font-medium'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
            title="লাইব্রেরি"
          >
            <FolderHeart className="w-5 h-5" />
            <span className="text-[10px] mt-1 text-center truncate w-full">লাইব্রেরি</span>
          </button>
        </div>
      </aside>

      {/* Full Sidebar (Desktop expanded OR Mobile Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0f0f0f] border-r border-neutral-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isDesktopCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0 lg:top-[56px]'}`}
      >
        {/* Mobile Header in Drawer */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800/80 lg:hidden">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-300"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-emerald-500/40">
              <img
                src="/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg"
                alt="Qalby"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-extrabold text-lg text-white">
              Qalby <span className="text-emerald-400 font-arabic text-sm">قلبي</span>
            </span>
          </div>
        </div>

        {/* Scrollable Nav List */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-4 text-xs">
          {/* Main Items */}
          <div className="space-y-0.5">
            {mainNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-neutral-800 text-white font-semibold'
                      : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-400' : 'text-neutral-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-neutral-800/80 pt-2" />

          {/* Section: You (আপনি) */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between px-3 py-1 text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
              <span>আপনি (You)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>

            {youItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-colors text-left ${
                    isActive
                      ? 'bg-neutral-800 text-white font-semibold'
                      : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                  }`}
                >
                  <span className="text-neutral-400">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-neutral-800/80 pt-2" />

          {/* Section: Subscriptions (সাবস্ক্রিপশন চ্যানেল) */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
              সাবস্ক্রিপশন (Channels)
            </div>

            {channels.slice(0, 5).map((ch) => (
              <button
                key={ch.id}
                onClick={() => {
                  onSelectChannel(ch.name);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-300 hover:bg-neutral-800/60 hover:text-white transition-colors group text-left"
              >
                <img
                  src={ch.avatar}
                  alt={ch.name}
                  className="w-6 h-6 rounded-full object-cover border border-neutral-700"
                />
                <span className="truncate flex-1 text-xs">{ch.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              </button>
            ))}

            <button
              onClick={() => {
                onTabChange('subscriptions');
                onClose();
              }}
              className="w-full text-left px-3 py-1.5 text-emerald-400 hover:text-emerald-300 font-medium text-xs flex items-center gap-1"
            >
              <span>সকল চ্যানেল দেখুন</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="border-t border-neutral-800/80 pt-2" />

          {/* Section: Explore (এক্সপ্লোর / অন্বেষণ) */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
              অন্বেষণ (Explore)
            </div>

            {exploreCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onTabChange('home');
                  onClose();
                }}
                className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-neutral-300 hover:bg-neutral-800/60 hover:text-white transition-colors text-left"
              >
                {cat.icon}
                <span className="truncate text-xs">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-neutral-800/80 pt-2" />

          {/* Section: 100% Halal Guarantee Badge */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-950/70 via-neutral-900 to-black border border-emerald-500/40">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-1">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>১০০% হালাল গ্যারান্টি</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-bengali">
              কলবী প্ল্যাটফর্ম সম্পূর্ণ বাদ্যযন্ত্র, অশ্লীলতা ও বিভ্রান্তিমুক্ত বিশুদ্ধ ইসলামিক কনটেন্টের প্রতিশ্রুতি দেয়।
            </p>
            <button
              onClick={() => {
                onOpenHalalPolicy();
                onClose();
              }}
              className="mt-2 text-[10px] text-emerald-300 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>হালাল নীতি ও সনদ পড়ুন</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Footer Info */}
          <div className="px-3 py-2 text-[10px] text-neutral-500 space-y-1">
            <p>Qalby (قلبي) - The Halal Alternative to YouTube.</p>
            <p>© 2026 Qalby Inc. শান্তি ও বরকতময় প্ল্যাটফর্ম।</p>
          </div>
        </div>
      </aside>
    </>
  );
};
