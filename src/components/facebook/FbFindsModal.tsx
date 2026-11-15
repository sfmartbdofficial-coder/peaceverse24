import React, { useState } from 'react';
import { X, Compass, TrendingUp, Search, UserPlus, Heart, Hash, Sparkles, Check } from 'lucide-react';

interface FbFindsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FbFindsModal: React.FC<FbFindsModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const trendingTopics = [
    { tag: '#কুরআন_তিলাওয়াত', posts: '45.2K পোস্ট', category: 'কুরআন' },
    { tag: '#জুম্মা_মুবারক', posts: '128K পোস্ট', category: 'দ্বীন' },
    { tag: '#হালাল_ব্যবসা', posts: '18.9K পোস্ট', category: 'উদ্যোক্তা' },
    { tag: '#সখীপুর_মাহফিল', posts: '9.4K পোস্ট', category: 'স্থানীয়' },
    { tag: '#ফিলিস্তিনের_জন্য_দোয়া', posts: '210K পোস্ট', category: 'উম্মাহ' },
  ];

  const suggestedCreators = [
    {
      id: 'cr-1',
      name: 'কারী মিজানুর রহমান আজহারী',
      handle: '@mizanur_azhari',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      followers: '1.2M ফলোয়ার',
      tag: 'ইসলামিক স্কলার',
    },
    {
      id: 'cr-2',
      name: 'শায়েখ আহমাদুল্লাহ',
      handle: '@ahmadullah_official',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      followers: '980K ফলোয়ার',
      tag: 'আস-সুন্নাহ ট্রাস্ট',
    },
    {
      id: 'cr-3',
      name: 'কুরআন হৃদয়ের নূর',
      handle: '@quran_nur',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      followers: '450K ফলোয়ার',
      tag: 'হিফজ ও তিলাওয়াত',
    },
  ];

  const handleFollow = (id: string) => {
    setFollowed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white border border-[#E4E6EB] rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-black">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E4E6EB] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-black">Finds (নতুন আবিষ্কার)</h2>
              <p className="text-[11px] text-[#65676B]">জনপ্রিয় ইসলামিক কনটেন্ট ও ট্রেন্ডিং বিষয় আবিষ্কার করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-[#E4E6EB] bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-[#65676B] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="ট্রেন্ডিং বিষয়, স্কলার বা হ্যাশট্যাগ খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl text-xs text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF]"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white">
          {/* Trending Topics */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
              <TrendingUp className="w-4 h-4" />
              <span>বাংলাদেশে ট্রেন্ডিং হ্যাশট্যাগ</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {trendingTopics.map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white border border-[#E4E6EB] flex items-center justify-between hover:bg-[#F0F2F5] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F0F2F5] text-[#0866FF] flex items-center justify-center font-bold text-sm">
                      <Hash className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-black">{item.tag}</p>
                      <p className="text-[10px] text-[#65676B]">{item.category} • {item.posts}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    ট্রেন্ডিং #{i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Islamic Creators */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0866FF]">
              <Sparkles className="w-4 h-4" />
              <span>জনপ্রিয় ইসলামিক ক্রিয়েটর ও স্কলার</span>
            </div>
            <div className="space-y-2.5">
              {suggestedCreators.map((cr) => {
                const isF = followed[cr.id];
                return (
                  <div
                    key={cr.id}
                    className="p-3 rounded-xl bg-white border border-[#E4E6EB] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={cr.avatar}
                        alt={cr.name}
                        className="w-11 h-11 rounded-full object-cover border border-[#E4E6EB]"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-black">{cr.name}</h4>
                        <p className="text-[10px] text-[#65676B]">{cr.followers} • {cr.tag}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollow(cr.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        isF
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#0866FF] hover:bg-[#0055D4] text-white shadow'
                      }`}
                    >
                      {isF ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>ফলো করা হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>ফলো করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E4E6EB] bg-white text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black font-bold text-xs"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
