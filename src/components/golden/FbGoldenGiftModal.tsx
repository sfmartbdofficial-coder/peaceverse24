import React, { useState } from 'react';
import {
  X,
  Coins,
  Sparkles,
  Heart,
  Send,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Gift,
} from 'lucide-react';
import { PostItem } from '../../types';

interface FbGoldenGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostItem;
  userGoldenCoins: number;
  onSendGift: (postId: string, amount: number, message?: string) => Promise<boolean> | boolean;
  onOpenWallet: () => void;
}

const PRESET_GIFTS = [
  { amount: 1, label: 'সালাম ও দোয়া', icon: '🤲', desc: 'ছোট্ট ভালোবাসা' },
  { amount: 5, label: 'চমৎকার ভিডিও', icon: '✨', desc: 'উৎসাহব্যঞ্জক' },
  { amount: 10, label: 'হাদিয়া ও সম্মান', icon: '🌸', desc: 'হৃদয়স্পর্শী' },
  { amount: 25, label: 'উজ্জ্বল প্রশংসা', icon: '⭐', desc: 'অসাধারণ কনটেন্ট' },
  { amount: 50, label: 'বিশেষ অনুপ্রেরণা', icon: '💎', desc: 'ক্রিয়েটরের পাশে' },
  { amount: 100, label: 'রয়েল হাদিয়া', icon: '👑', desc: 'সর্বোচ্চ সম্মাননা' },
];

const PRESET_MESSAGES = [
  'মাশাআল্লাহ! অসাধারণ ও শিক্ষণীয় ভিডিও ভাই! 🤍',
  'জাযাকাল্লাহু খাইরান! আপনার ইলমে বরকত হোক। 🤲',
  'খুবই সুন্দর আলোচনা, সবসময় পাশে আছি। 🌟',
  'আপনার জন্য ছোট্ট হাদিয়া রইল ভাই! ✨',
];

export const FbGoldenGiftModal: React.FC<FbGoldenGiftModalProps> = ({
  isOpen,
  onClose,
  post,
  userGoldenCoins,
  onSendGift,
  onOpenWallet,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<string>(PRESET_MESSAGES[0]);
  const [isSending, setIsSending] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAmount = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount;
  const hasEnoughCoins = userGoldenCoins >= currentAmount && currentAmount > 0;

  const handleSend = async () => {
    if (!hasEnoughCoins) {
      setErrorMessage('আপনার অ্যাকাউন্টে পর্যাপ্ত গোল্ডেন কয়েন নেই! অনুগ্রহ করে কয়েন রিচার্জ করুন।');
      return;
    }

    setErrorMessage(null);
    setIsSending(true);

    try {
      const success = await onSendGift(post.id, currentAmount, selectedMessage);
      if (success !== false) {
        setShowCelebration(true);
        setTimeout(() => {
          setShowCelebration(false);
          onClose();
        }, 1800);
      }
    } catch {
      setErrorMessage('উপহার পাঠাতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      {/* Floating Sparkle Animation on Success */}
      {showCelebration && (
        <div className="fixed inset-0 z-[130] pointer-events-none flex flex-col items-center justify-center">
          <div className="text-6xl animate-bounce mb-3">🪙✨🎁</div>
          <div className="bg-amber-400 text-black font-extrabold text-base px-6 py-2.5 rounded-full shadow-2xl animate-pulse flex items-center gap-2 border-2 border-amber-300">
            <Sparkles className="w-5 h-5 text-black" />
            <span>সফলভাবে {currentAmount}টি গোল্ডেন হাদিয়া পাঠানো হয়েছে!</span>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#E4E6EB] rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-black">
        
        {/* Header with Golden Accent */}
        <div className="p-4 bg-white border-b border-[#E4E6EB] relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-sm font-black">
                <Gift className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-black flex items-center gap-1.5">
                  <span>গোল্ডেন হাদিয়া পাঠান</span>
                  <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                    হাদিয়া ও রিওয়ার্ড
                  </span>
                </h3>
                <p className="text-[11px] text-[#65676B]">
                  ভালো কনটেন্টের জন্য ক্রিয়েটরকে সরাসরি সম্মানিত করুন
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Receiver Info Pill */}
          <div className="mt-3 bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/60"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-black truncate flex items-center gap-1">
                  <span>{post.author.name}</span>
                  {post.author.verified && <span className="text-[#0866FF] text-xs">✓</span>}
                </p>
                <p className="text-[10px] text-[#65676B] truncate">
                  {post.contentBangla ? post.contentBangla.slice(0, 36) + '...' : 'ভিডিও পোস্ট'}
                </p>
              </div>
            </div>

            {/* User Coin Balance */}
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold text-amber-800 shrink-0">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>{userGoldenCoins}</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenWallet();
                }}
                className="ml-1 text-[10px] text-[#0866FF] underline hover:text-blue-700 cursor-pointer"
                title="রিচার্জ করুন"
              >
                +রিচার্জ
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 max-h-[60vh] bg-white">
          {/* Preset Gifts Grid */}
          <div>
            <label className="text-xs font-bold text-black mb-2 flex items-center justify-between">
              <span>উপহারের পরিমাণ নির্বাচন করুন:</span>
              <span className="text-[11px] text-amber-700 font-semibold">১ গোল্ডেন = ১ টাকা</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {PRESET_GIFTS.map((g) => {
                const isSelected = !customAmount && selectedAmount === g.amount;
                return (
                  <button
                    key={g.amount}
                    type="button"
                    onClick={() => {
                      setCustomAmount('');
                      setSelectedAmount(g.amount);
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 text-black shadow-sm'
                        : 'bg-white border-[#E4E6EB] hover:border-amber-400 text-black hover:bg-[#F0F2F5]'
                    }`}
                  >
                    <div className="text-xl mb-1">{g.icon}</div>
                    <div className="text-sm font-black text-amber-700 flex items-center justify-center gap-0.5">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span>{g.amount}</span>
                    </div>
                    <div className="text-[10px] font-medium text-[#65676B] truncate mt-0.5">{g.label}</div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount Field */}
          <div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  placeholder="অন্য যেকোনো পরিমাণ কয়েন লিখুন..."
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2 text-xs text-black placeholder-[#65676B] focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-700 font-bold">
                  কয়েন
                </span>
              </div>
            </div>
          </div>

          {/* Optional Message Field */}
          <div>
            <label className="text-xs font-bold text-black mb-1.5 block">
              ক্রিয়েটরের জন্য একটি শান্তিময় বার্তা (ঐচ্ছিক):
            </label>
            <div className="space-y-1.5">
              {PRESET_MESSAGES.map((msg, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedMessage(msg)}
                  className={`w-full text-left text-[11px] p-2 rounded-xl border transition-all cursor-pointer ${
                    selectedMessage === msg
                      ? 'bg-amber-50 border-amber-500 text-black font-medium'
                      : 'bg-white border-[#E4E6EB] hover:bg-[#F0F2F5] text-[#65676B]'
                  }`}
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Low Balance Warning */}
          {userGoldenCoins < currentAmount && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div className="text-xs text-black">
                <p className="font-bold">কয়েন ব্যালেন্স অপর্যাপ্ত</p>
                <p className="text-[10px] text-[#65676B]">আপনার আছে {userGoldenCoins} কয়েন, প্রয়োজন {currentAmount} কয়েন</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWallet();
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
              >
                রিচার্জ করুন
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E4E6EB] bg-white flex items-center justify-between gap-3">
          <div className="text-xs tabular-nums">
            <span className="text-[#65676B]">মোট হাদিয়া: </span>
            <span className="font-black text-amber-700 text-base">🪙 {currentAmount} গোল্ডেন</span>
            <span className="text-[10px] text-[#65676B] ml-1">
              (৳{currentAmount} / ${(currentAmount / 120).toFixed(2)} USD)
            </span>
          </div>

          <button
            type="button"
            disabled={!hasEnoughCoins || isSending}
            onClick={handleSend}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all cursor-pointer"
          >
            {isSending ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>পাঠানো হচ্ছে...</span>
              </>
            ) : (
              <>
                <Gift className="w-4 h-4" />
                <span>হাদিয়া নিশ্চিত করুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
