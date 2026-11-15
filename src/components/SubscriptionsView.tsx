import React, { useState } from 'react';
import { ChannelInfo, IslamicVideo } from '../types';
import { VideoCard } from './VideoCard';
import { Bell, CheckCircle2, Tv, Sparkles, Filter } from 'lucide-react';

interface SubscriptionsViewProps {
  channels: ChannelInfo[];
  videos: IslamicVideo[];
  onPlay: (video: IslamicVideo) => void;
  savedVideoIds: string[];
  onToggleSave: (video: IslamicVideo) => void;
  onToggleSubscribe: (channelId: string) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  channels,
  videos,
  onPlay,
  savedVideoIds,
  onToggleSave,
  onToggleSubscribe,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');

  const subscribedChannels = channels.filter((c) => c.isSubscribed);

  const filteredVideos =
    selectedChannelId === 'all'
      ? videos.filter((v) =>
          subscribedChannels.some((c) => c.name.toLowerCase() === v.channel.name.toLowerCase())
        )
      : videos.filter((v) => {
          const ch = channels.find((c) => c.id === selectedChannelId);
          return ch ? v.channel.name.toLowerCase() === ch.name.toLowerCase() : true;
        });

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-4 pb-24 space-y-5 bg-white text-black">
      {/* Top Channel Avatars Carousel */}
      <div className="border-b border-[#E4E6EB] pb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm sm:text-base font-bold text-black flex items-center gap-2">
            <Tv className="w-4 h-4 text-[#0866FF]" />
            <span>আপনার সাবস্ক্রাইব করা চ্যানেলসমূহ (Channels)</span>
          </h2>
          <span className="text-xs text-[#65676B]">
            {subscribedChannels.length} টি চ্যানেল অনুসরণ করছেন
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* All button */}
          <button
            onClick={() => setSelectedChannelId('all')}
            className={`flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer p-1.5 rounded-xl transition-all ${
              selectedChannelId === 'all'
                ? 'bg-[#E7F3FF] text-[#0866FF] font-bold'
                : 'text-[#65676B] hover:text-black hover:bg-[#F0F2F5]'
            }`}
          >
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
              selectedChannelId === 'all' ? 'border-[#0866FF] bg-[#0866FF] text-white' : 'border-[#E4E6EB] bg-[#F0F2F5] text-black'
            }`}>
              All
            </div>
            <span className="text-[11px] truncate max-w-[64px]">সবগুলো</span>
          </button>

          {/* Subscribed channels */}
          {subscribedChannels.map((ch) => {
            const isSelected = selectedChannelId === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChannelId(ch.id)}
                className={`flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer p-1.5 rounded-xl transition-all ${
                  isSelected ? 'bg-[#E7F3FF] text-[#0866FF] font-bold' : 'text-[#65676B] hover:text-black hover:bg-[#F0F2F5]'
                }`}
              >
                <div className="relative">
                  <img
                    src={ch.avatar}
                    alt={ch.name}
                    className={`w-12 h-12 rounded-full object-cover border-2 transition-transform ${
                      isSelected ? 'border-[#0866FF] scale-105' : 'border-[#E4E6EB] hover:border-[#0866FF]'
                    }`}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <span className="text-[11px] truncate max-w-[70px] text-center">
                  {ch.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Videos Section Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs sm:text-sm font-bold text-black">
          {selectedChannelId === 'all'
            ? 'সাম্প্রতিক আপলোডসমূহ (Latest from Subscriptions)'
            : `${channels.find((c) => c.id === selectedChannelId)?.name || ''} এর ভিডিওসমূহ`}
        </h3>
        <span className="text-xs text-[#65676B] font-mono">
          {filteredVideos.length} টি ভিডিও
        </span>
      </div>

      {/* 2-Column Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-16 px-4">
          <p className="text-sm text-[#65676B]">এই চ্যানেলের কোনো নতুন ভিডিও পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={onPlay}
              isSaved={savedVideoIds.includes(video.id)}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
};
