export type GiftTier = 'small' | 'medium' | 'big' | 'monster';

export interface PeaceGift {
  id: string;
  name: string;
  nameBn: string;
  tier: GiftTier;
  coins: number;
  icon: string;
  accent: string;
}

// Exact Economy Rules:
// 1 Coin = 2 Taka / $0.015
// Host gets 60% (Beans), App gets 40%
export const COIN_TO_BDT = 2;
export const COIN_TO_USD = 0.015;
export const HOST_BEAN_SHARE = 0.6;
export const APP_PLATFORM_SHARE = 0.4;

export const PEACE_GIFTS: PeaceGift[] = [
  // Small (5)
  { id: 'rose', name: 'Rose', nameBn: 'গোলাপ', tier: 'small', coins: 1, icon: '🌹', accent: 'from-rose-500 to-pink-500' },
  { id: 'ice_cream', name: 'Ice Cream', nameBn: 'আইসক্রিম', tier: 'small', coins: 1, icon: '🍦', accent: 'from-amber-400 to-rose-400' },
  { id: 'finger_heart', name: 'Finger Heart', nameBn: 'ফিঙ্গার হার্ট', tier: 'small', coins: 5, icon: '🫰', accent: 'from-pink-500 to-red-500' },
  { id: 'perfume', name: 'Perfume', nameBn: 'আতর / পারফিউম', tier: 'small', coins: 20, icon: '🧴', accent: 'from-emerald-500 to-teal-500' },
  { id: 'donut', name: 'Donut', nameBn: 'ডোনাট', tier: 'small', coins: 30, icon: '🍩', accent: 'from-orange-400 to-rose-400' },

  // Medium (5)
  { id: 'hand_heart', name: 'Hand Heart', nameBn: 'হ্যান্ড হার্ট', tier: 'medium', coins: 100, icon: '🫶', accent: 'from-red-500 to-rose-500' },
  { id: 'sunglasses', name: 'Sunglasses', nameBn: 'সানগ্লাস', tier: 'medium', coins: 199, icon: '🕶️', accent: 'from-slate-700 to-zinc-900' },
  { id: 'corgi', name: 'Corgi', nameBn: 'কorgi পাপ', tier: 'medium', coins: 299, icon: '🐕', accent: 'from-amber-500 to-orange-500' },
  { id: 'swan', name: 'Swan', nameBn: 'রাজহাঁস', tier: 'medium', coins: 699, icon: '🦢', accent: 'from-sky-500 to-emerald-500' },
  { id: 'galaxy', name: 'Galaxy', nameBn: 'গ্যালাক্সি', tier: 'medium', coins: 1000, icon: '🌌', accent: 'from-indigo-600 to-emerald-600' },

  // Big (5)
  { id: 'luxury_car', name: 'Luxury Car', nameBn: 'লাক্সারি গাড়ি', tier: 'big', coins: 2000, icon: '🏎️', accent: 'from-red-600 to-rose-600' },
  { id: 'private_jet', name: 'Private Jet', nameBn: 'প্রাইভেট জেট', tier: 'big', coins: 3000, icon: '🛩️', accent: 'from-slate-600 to-red-600' },
  { id: 'yacht', name: 'Yacht', nameBn: 'ইয়ট', tier: 'big', coins: 5000, icon: '🛥️', accent: 'from-cyan-600 to-emerald-600' },
  { id: 'crown', name: 'Crown', nameBn: 'মুকুট', tier: 'big', coins: 7000, icon: '👑', accent: 'from-amber-500 to-yellow-500' },
  { id: 'diamond', name: 'Diamond', nameBn: 'হীরা', tier: 'big', coins: 10000, icon: '💎', accent: 'from-sky-500 to-teal-500' },

  // Monster (5)
  { id: 'rocket', name: 'Rocket', nameBn: 'রকেট', tier: 'monster', coins: 15000, icon: '🚀', accent: 'from-red-600 to-orange-500' },
  { id: 'lion', name: 'Lion', nameBn: 'সিংহ', tier: 'monster', coins: 20000, icon: '🦁', accent: 'from-amber-600 to-red-600' },
  { id: 'tiger', name: 'Tiger', nameBn: 'রয়েল বেঙ্গল টাইগার', tier: 'monster', coins: 25000, icon: '🐯', accent: 'from-orange-600 to-amber-600' },
  { id: 'king', name: 'King', nameBn: 'কিং স্যালুট', tier: 'monster', coins: 30000, icon: '🤴', accent: 'from-yellow-500 to-red-600' },
  { id: 'peace_universe', name: 'Peace Universe', nameBn: 'পিস ইউনিভার্স', tier: 'monster', coins: 40000, icon: '🕊️', accent: 'from-emerald-600 via-teal-500 to-red-600' },
];

export const GIFT_TIER_META: Array<{ id: GiftTier; label: string; labelBn: string }> = [
  { id: 'small', label: 'Small', labelBn: 'ছোট গিফট' },
  { id: 'medium', label: 'Medium', labelBn: 'মাঝারি গিফট' },
  { id: 'big', label: 'Big', labelBn: 'বড় গিফট' },
  { id: 'monster', label: 'Monster', labelBn: 'মনস্টার গিফট' },
];

export function calculateGiftSplit(coins: number) {
  const safeCoins = Math.max(0, Math.round(coins));
  const hostBeans = Math.round(safeCoins * HOST_BEAN_SHARE * 100) / 100;
  const appCoins = Math.round(safeCoins * APP_PLATFORM_SHARE * 100) / 100;
  const bdtValue = Math.round(safeCoins * COIN_TO_BDT * 100) / 100;
  const usdValue = Math.round(safeCoins * COIN_TO_USD * 1000) / 1000;
  return {
    coins: safeCoins,
    hostBeans,
    appCoins,
    bdtValue,
    usdValue,
  };
}

export function formatCoinPrice(coins: number, isBangladesh: boolean): string {
  if (isBangladesh) {
    return `৳${Math.round(coins * COIN_TO_BDT).toLocaleString()}`;
  }
  const usd = coins * COIN_TO_USD;
  return `$${usd >= 1 ? usd.toFixed(2) : usd.toFixed(3)}`;
}
