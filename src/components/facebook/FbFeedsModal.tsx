import React, { useState } from 'react';
import { X, Rss, Clock, Sparkles, Star, Users, Flag, Layers, Check } from 'lucide-react';

interface FbFeedsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeedMode?: (mode: 'algorithmic' | 'chronological') => void;
}

export const FbFeedsModal: React.FC<FbFeedsModalProps> = ({
  isOpen,
  onClose,
  onSelectFeedMode,
}) => {
  const [feedTab, setFeedTab] = useState<'all' | 'following'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'friends' | 'groups' | 'pages'>('all');

  if (!isOpen) return null;

  const handleSelect = (tab: 'all' | 'following') => {
    setFeedTab(tab);
    if (onSelectFeedMode) {
      onSelectFeedMode(tab === 'all' ? 'algorithmic' : 'chronological');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-[#242526] border border-[#393a3b] rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-[#e4e6eb]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow">
              <Rss className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Feeds (ফিডস)</h2>
              <p className="text-[11px] text-[#b0b3b8]">আপনার পছন্দমতো টাইমলাইনের পোস্ট দেখুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Tabs: All vs Following */}
        <div className="flex border-b border-[#393a3b] bg-[#18191a]">
          <button
            onClick={() => handleSelect('all')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
              feedTab === 'all'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>All (এলগরিদমিক সাজানো)</span>
          </button>
          <button
            onClick={() => handleSelect('following')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
              feedTab === 'following'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Following (সময়ানুক্রমিক)</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Sub Filters */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#b0b3b8] uppercase tracking-wider">ক্যাটাগরি ফিল্টার</p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'সব পোস্ট', icon: Layers },
                { id: 'favorites', label: 'প্রিয় (Favorites)', icon: Star },
                { id: 'friends', label: 'বন্ধু-বান্ধব', icon: Users },
                { id: 'groups', label: 'যুক্ত থাকা গ্রুপ', icon: Users },
                { id: 'pages', label: 'ফলো করা পেজ', icon: Flag },
              ].map((f) => {
                const Icon = f.icon;
                const isSelected = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                      isSelected
                        ? 'bg-[#1877F2] border-[#1877F2] text-white shadow'
                        : 'bg-[#18191a] border-[#393a3b] text-[#b0b3b8] hover:bg-[#3a3b3c]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode explanation */}
          <div className="p-3.5 rounded-xl bg-[#18191a] border border-[#393a3b] space-y-2 text-xs">
            {feedTab === 'all' ? (
              <>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>স্মার্ট এলগরিদমিক ফিড সক্রিয়</span>
                </p>
                <p className="text-[#b0b3b8] leading-relaxed">
                  আপনার সবচেয়ে পছন্দের ইসলামিক তিলাওয়াত, উম্মাহর জনপ্রিয় পোস্ট এবং ঘনিষ্ঠ বন্ধুদের আপডেট সবচেয়ে ওপরে প্রদর্শন করা হয়।
                </p>
              </>
            ) : (
              <>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#1877F2]" />
                  <span>সময়ানুক্রমিক (Chronological) ফিড সক্রিয়</span>
                </p>
                <p className="text-[#b0b3b8] leading-relaxed">
                  যাদের আপনি ফলো করছেন, তাদের সর্বশেষ প্রকাশিত পোস্ট সময় অনুযায়ী ঠিক একটার পর একটা ক্রমানুসারে দেখতে পাবেন।
                </p>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#393a3b] bg-[#18191a] flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>ফিড প্রয়োগ করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
