import React, { useState } from 'react';
import { X, Sparkles, Check, Smile, Heart, ThumbsUp, Send } from 'lucide-react';

interface FbAvatarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarCreated?: (avatarUrl: string) => void;
}

export const FbAvatarsModal: React.FC<FbAvatarsModalProps> = ({
  isOpen,
  onClose,
  onAvatarCreated,
}) => {
  const [skinColor, setSkinColor] = useState('#f5d0b5');
  const [headwear, setHeadwear] = useState<'none' | 'kufi-white' | 'kufi-black' | 'hijab-blue' | 'hijab-emerald' | 'turban'>('kufi-white');
  const [beard, setBeard] = useState<'none' | 'sunnah' | 'stubble' | 'full'>('sunnah');
  const [glasses, setGlasses] = useState<'none' | 'classic' | 'sunglasses'>('none');
  const [outfitColor, setOutfitColor] = useState('#1877F2');
  const [selectedTab, setSelectedTab] = useState<'customize' | 'stickers'>('customize');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const skinTones = ['#fde3cf', '#f5d0b5', '#d49d79', '#9f6643', '#5a3825'];
  const outfitColors = ['#1877F2', '#10b981', '#6366f1', '#1f2937', '#d97706'];

  const stickers = [
    { id: 1, label: 'আসসালামু আলাইকুম', icon: '🤲', mood: 'Greeting' },
    { id: 2, label: 'মাশাআল্লাহ!', icon: '✨', mood: 'Praise' },
    { id: 3, label: 'সুবহানাল্লাহ', icon: '❤️', mood: 'Faith' },
    { id: 4, label: 'জাযাকাল্লাহ খাইরান', icon: '🌟', mood: 'Thanks' },
    { id: 5, label: 'আলহামদুলিল্লাহ', icon: '🕊️', mood: 'Gratitude' },
    { id: 6, label: 'জুম্মা মুবারক', icon: '🕌', mood: 'Blessing' },
  ];

  const handleSaveAvatar = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-[#242526] border border-[#393a3b] rounded-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-[#e4e6eb]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center text-white">
              <Smile className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Avatars (অ্যাভাটার)</h2>
              <p className="text-[11px] text-[#b0b3b8]">হালাল ইসলামিক কার্টুন অ্যাভাটার ও স্টিকার</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#393a3b] bg-[#18191a]">
          <button
            onClick={() => setSelectedTab('customize')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
              selectedTab === 'customize'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            কার্টুন তৈরি করুন
          </button>
          <button
            onClick={() => setSelectedTab('stickers')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
              selectedTab === 'stickers'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            আমার স্টিকার প্যাক ({stickers.length})
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedTab === 'customize' ? (
            <>
              {/* Avatar Live Preview */}
              <div className="relative w-40 h-40 mx-auto rounded-full bg-gradient-to-b from-[#3a3b3c] to-[#18191a] border-4 border-[#393a3b] flex items-center justify-center overflow-hidden shadow-lg">
                <div
                  className="w-24 h-28 rounded-full relative flex flex-col items-center justify-center transition-all"
                  style={{ backgroundColor: skinColor }}
                >
                  {/* Headwear */}
                  {headwear === 'kufi-white' && (
                    <div className="absolute -top-3 w-20 h-7 bg-white rounded-t-full border-b-2 border-neutral-300 shadow-sm" />
                  )}
                  {headwear === 'kufi-black' && (
                    <div className="absolute -top-3 w-20 h-7 bg-neutral-900 rounded-t-full border-b-2 border-neutral-700 shadow-sm" />
                  )}
                  {headwear === 'hijab-blue' && (
                    <div className="absolute -top-4 w-28 h-32 bg-[#1877F2] rounded-3xl -z-10 shadow-md" />
                  )}
                  {headwear === 'hijab-emerald' && (
                    <div className="absolute -top-4 w-28 h-32 bg-emerald-600 rounded-3xl -z-10 shadow-md" />
                  )}
                  {headwear === 'turban' && (
                    <div className="absolute -top-4 w-22 h-9 bg-amber-700 rounded-t-3xl border-b-2 border-amber-800" />
                  )}

                  {/* Eyes & Glasses */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="w-2 h-2.5 bg-neutral-900 rounded-full" />
                    <div className="w-2 h-2.5 bg-neutral-900 rounded-full" />
                  </div>

                  {glasses === 'classic' && (
                    <div className="absolute top-7 flex items-center gap-2">
                      <div className="w-5 h-4 border-2 border-neutral-900 rounded" />
                      <div className="w-2 h-0.5 bg-neutral-900" />
                      <div className="w-5 h-4 border-2 border-neutral-900 rounded" />
                    </div>
                  )}
                  {glasses === 'sunglasses' && (
                    <div className="absolute top-7 flex items-center gap-1.5 bg-neutral-900 px-2 py-1 rounded shadow">
                      <div className="w-4 h-3 bg-neutral-700 rounded-sm" />
                      <div className="w-4 h-3 bg-neutral-700 rounded-sm" />
                    </div>
                  )}

                  {/* Smile */}
                  <div className="w-3.5 h-1.5 border-b-2 border-neutral-800 rounded-full mt-2" />

                  {/* Beard */}
                  {beard === 'sunnah' && (
                    <div className="absolute bottom-1 w-10 h-5 bg-neutral-900 rounded-b-xl border-t border-neutral-800" />
                  )}
                  {beard === 'stubble' && (
                    <div className="absolute bottom-1 w-8 h-3 bg-neutral-800/40 rounded-b-lg" />
                  )}
                  {beard === 'full' && (
                    <div className="absolute bottom-0 w-14 h-7 bg-neutral-950 rounded-b-2xl shadow" />
                  )}
                </div>

                {/* Outfit */}
                <div
                  className="absolute -bottom-2 w-32 h-12 rounded-t-2xl shadow-inner transition-colors"
                  style={{ backgroundColor: outfitColor }}
                />
              </div>

              {/* Skin Tone Selector */}
              <div>
                <label className="text-xs font-bold text-[#b0b3b8] uppercase tracking-wider block mb-2">
                  গায়ের রং (Skin Tone)
                </label>
                <div className="flex items-center gap-2.5">
                  {skinTones.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSkinColor(tone)}
                      className={`w-9 h-9 rounded-full border-2 transition-transform active:scale-90 ${
                        skinColor === tone ? 'border-[#1877F2] scale-110 shadow-md ring-2 ring-blue-500/30' : 'border-[#393a3b]'
                      }`}
                      style={{ backgroundColor: tone }}
                    />
                  ))}
                </div>
              </div>

              {/* Headwear & Sunnah Cap / Hijab */}
              <div>
                <label className="text-xs font-bold text-[#b0b3b8] uppercase tracking-wider block mb-2">
                  টুপি / হিজাব (Headwear)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'kufi-white', label: 'সাদা টুপি (Kufi)' },
                    { id: 'kufi-black', label: 'কালো টুপি' },
                    { id: 'hijab-blue', label: 'নীল হিজাব' },
                    { id: 'hijab-emerald', label: 'সবুজ হিজাব' },
                    { id: 'turban', label: 'পাগড়ি (Turban)' },
                    { id: 'none', label: 'কোনোটি নয়' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setHeadwear(item.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                        headwear === item.id
                          ? 'bg-[#1877F2]/20 border-[#1877F2] text-[#1877F2]'
                          : 'bg-[#18191a] border-[#393a3b] text-[#b0b3b8] hover:bg-[#3a3b3c]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sunnah Beard */}
              <div>
                <label className="text-xs font-bold text-[#b0b3b8] uppercase tracking-wider block mb-2">
                  দাড়ি (Sunnah Beard)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'sunnah', label: 'সুন্নতি দাড়ি' },
                    { id: 'full', label: 'ঘন দাড়ি' },
                    { id: 'stubble', label: 'হালকা' },
                    { id: 'none', label: 'ক্লিন' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBeard(b.id as any)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-colors ${
                        beard === b.id
                          ? 'bg-[#1877F2]/20 border-[#1877F2] text-[#1877F2]'
                          : 'bg-[#18191a] border-[#393a3b] text-[#b0b3b8] hover:bg-[#3a3b3c]'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outfit Color */}
              <div>
                <label className="text-xs font-bold text-[#b0b3b8] uppercase tracking-wider block mb-2">
                  পোশাকের রং (Outfit Color)
                </label>
                <div className="flex items-center gap-2.5">
                  {outfitColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setOutfitColor(color)}
                      className={`w-9 h-9 rounded-full border-2 transition-transform ${
                        outfitColor === color ? 'border-white scale-110 shadow ring-2 ring-white/40' : 'border-[#393a3b]'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Stickers Pack */
            <div className="space-y-3">
              <p className="text-xs text-[#b0b3b8]">
                আপনার অ্যাভাটার দিয়ে এই ইসলামিক স্টিকারগুলো কমেন্ট ও মেসেজে শেয়ার করুন:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {stickers.map((stk) => (
                  <div
                    key={stk.id}
                    className="p-3 rounded-2xl bg-[#18191a] border border-[#393a3b] flex flex-col items-center gap-1.5 text-center hover:border-[#1877F2] transition-colors cursor-pointer group"
                  >
                    <span className="text-3xl group-hover:scale-125 transition-transform">{stk.icon}</span>
                    <span className="font-bold text-xs text-white">{stk.label}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{stk.mood}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#393a3b] bg-[#18191a] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] font-bold text-xs transition-colors"
          >
            বাতিল
          </button>
          <button
            onClick={handleSaveAvatar}
            disabled={savedSuccess}
            className="px-5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>সংরক্ষণ সম্পন্ন!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>অ্যাভাটার সেভ করুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
