import React, { useState, useMemo } from 'react';
import { X, Sparkles, Coins, CheckCircle2, ArrowRight } from 'lucide-react';
import {
  PEACE_GIFTS,
  PeaceGift,
  GiftTier,
  calculateGiftSplit,
  formatCoinPrice,
} from '../../data/peaceGifts';
import { useGeoPayment } from '../../utils/geoPayment';

interface YtGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientAvatar?: string;
  contextLabel?: string;
  userCoins: number;
  onSendGift: (gift: PeaceGift, message?: string) => boolean | Promise<boolean>;
  onOpenWallet: () => void;
}

const TIER_TABS: { id: GiftTier | 'all'; label: string }[] = [
  { id: 'all', label: 'All 20' },
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'big', label: 'Big' },
  { id: 'monster', label: 'Monster' },
];

export const YtGiftModal: React.FC<YtGiftModalProps> = ({
  isOpen,
  onClose,
  recipientName,
  recipientAvatar,
  contextLabel,
  userCoins,
  onSendGift,
  onOpenWallet,
}) => {
  const { region } = useGeoPayment();
  const [selectedTier, setSelectedTier] = useState<GiftTier | 'all'>('all');
  const [selectedGift, setSelectedGift] = useState<PeaceGift>(PEACE_GIFTS[0]);
  const [note, setNote] = useState('');
  const [sentFeedback, setSentFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const visibleGifts = useMemo(
    () =>
      selectedTier === 'all'
        ? PEACE_GIFTS
        : PEACE_GIFTS.filter((g) => g.tier === selectedTier),
    [selectedTier]
  );

  if (!isOpen) return null;

  const split = calculateGiftSplit(selectedGift.coins);
  const insufficient = userCoins < selectedGift.coins;

  const handleSend = async () => {
    setErrorMsg(null);
    if (insufficient) {
      setErrorMsg(`Need ${selectedGift.coins.toLocaleString()} coins. Please buy coins first.`);
      return;
    }
    const ok = await onSendGift(selectedGift, note.trim() || undefined);
    if (ok) {
      setSentFeedback(
        `${selectedGift.icon} Sent ${selectedGift.name} (${selectedGift.coins.toLocaleString()} Coins)! Host gets ${split.hostBeans.toLocaleString()} Beans (60%).`
      );
      setNote('');
      setTimeout(() => {
        setSentFeedback(null);
        onClose();
      }, 1400);
    } else {
      setErrorMsg('Could not send gift. Check your coin balance.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {recipientAvatar && (
              <img
                src={recipientAvatar}
                alt={recipientName}
                className="w-10 h-10 rounded-full object-cover border border-zinc-200 shrink-0"
              />
            )}
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-zinc-950 truncate flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#DC2626] shrink-0" />
                <span>Send Peace Gift to {recipientName}</span>
              </h3>
              <p className="text-xs text-zinc-500 truncate">
                {contextLabel || '1 Coin = 2 Taka / $0.015 · Host gets 60% Beans · App gets 40%'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance + Tier Tabs */}
        <div className="px-5 pt-3 pb-2 bg-zinc-50 border-b border-zinc-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
              <Coins className="w-4 h-4 text-[#16A34A]" />
              <span>Your Balance: {userCoins.toLocaleString()} Coins</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenWallet();
              }}
              className="px-3 py-1.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>+ Buy Coins</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {TIER_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTier(t.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedTier === t.id
                    ? 'bg-[#DC2626] text-white'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 20 Gifts Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {visibleGifts.map((gift) => {
            const active = selectedGift.id === gift.id;
            const priceLabel = formatCoinPrice(gift.coins, region === 'BD');
            return (
              <button
                key={gift.id}
                type="button"
                onClick={() => {
                  setSelectedGift(gift);
                  setErrorMsg(null);
                }}
                className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-between gap-1 cursor-pointer transition-all ${
                  active
                    ? 'border-[#DC2626] bg-red-50/70 ring-2 ring-[#DC2626]/20 scale-[1.02]'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <span className="text-2xl leading-none mt-0.5">{gift.icon}</span>
                <span className="text-[11px] font-bold text-zinc-900 leading-tight line-clamp-1">
                  {gift.name}
                </span>
                <span className="text-[11px] font-extrabold text-[#DC2626]">
                  {gift.coins.toLocaleString()} Coins
                </span>
                <span className="text-[10px] text-zinc-500 font-medium">
                  {priceLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer Send Action */}
        <div className="p-4 border-t border-zinc-200 bg-white space-y-2.5">
          <div className="flex items-center justify-between text-xs text-zinc-600 px-1">
            <span>
              Selected: <strong className="text-zinc-950">{selectedGift.icon} {selectedGift.name}</strong>
            </span>
            <span>
              Host <strong className="text-[#16A34A]">{split.hostBeans.toLocaleString()} Beans (60%)</strong> · App {split.appCoins.toLocaleString()} (40%)
            </span>
          </div>

          {sentFeedback && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
              <span>{sentFeedback}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[#DC2626] text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a peaceful dua or comment (optional)..."
              maxLength={80}
              className="flex-1 h-11 px-3.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:border-[#16A34A] focus:bg-white"
            />
            <button
              type="button"
              onClick={handleSend}
              className={`h-11 px-5 rounded-xl font-bold text-sm text-white shrink-0 cursor-pointer transition-colors ${
                insufficient
                  ? 'bg-zinc-900 hover:bg-zinc-800'
                  : 'bg-[#DC2626] hover:bg-[#B91C1C]'
              }`}
            >
              {insufficient ? 'Buy Coins' : `Send (${selectedGift.coins.toLocaleString()})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
