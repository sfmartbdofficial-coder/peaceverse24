import React, { useState, useEffect } from 'react';
import {
  X,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  History,
  Globe,
  Wallet,
  Check,
} from 'lucide-react';
import { GoldenCashoutRequest } from '../../types';
import { useHistoryBack } from '../../utils/backNavigation';

interface GoldenWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGoldenCoins: number;
  userEarnedCoins: number;
  userName: string;
  userAvatar?: string;
  onAddCoins: (amount: number) => void;
  onRequestCashout: (
    request: Omit<GoldenCashoutRequest, 'id' | 'status'>
  ) => Promise<boolean> | boolean;
  cashoutRequests: GoldenCashoutRequest[];
}

export interface SavedPaymentMethods {
  bkash: string;
  bkashVerified: boolean;
  nagad: string;
  rocket: string;
  paypal: string;
  payoneer: string;
}

const STORAGE_KEY_PAYMENT_METHODS = 'peace_payment_methods';

const DEFAULT_SAVED_METHODS: SavedPaymentMethods = {
  bkash: '',
  bkashVerified: false,
  nagad: '',
  rocket: '',
  paypal: '',
  payoneer: '',
};

const loadSavedPaymentMethods = (): SavedPaymentMethods => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAYMENT_METHODS);
    if (raw) {
      return { ...DEFAULT_SAVED_METHODS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SAVED_METHODS;
};

const BUY_PACKAGES = [
  { coins: 50, price: 50, bonus: 0, tag: 'শুরু করার জন্য' },
  { coins: 100, price: 100, bonus: 5, tag: 'সবচেয়ে জনপ্রিয়' },
  { coins: 250, price: 250, bonus: 15, tag: 'বেশি উপহারের জন্য' },
  { coins: 500, price: 500, bonus: 40, tag: 'ক্রিয়েটর সাপোর্ট' },
  { coins: 1000, price: 1000, bonus: 100, tag: 'ভিআইপি প্যাকেজ' },
];

type CashoutMethodId = 'paypal' | 'payoneer' | 'bkash' | 'nagad' | 'rocket';

const PAYMENT_METHODS: Array<{
  id: CashoutMethodId;
  name: string;
  sub: string;
  isEmail?: boolean;
}> = [
  { id: 'paypal', name: 'PayPal', sub: 'Global USD', isEmail: true },
  { id: 'payoneer', name: 'Payoneer', sub: 'Worldwide', isEmail: true },
  { id: 'bkash', name: 'বিকাশ', sub: 'BDT' },
  { id: 'nagad', name: 'নগদ', sub: 'BDT' },
  { id: 'rocket', name: 'রকেট', sub: 'BDT' },
];

const maskDestination = (value: string, isEmail?: boolean): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (isEmail || trimmed.includes('@')) {
    const [local, domain] = trimmed.split('@');
    if (!domain) return trimmed;
    const prefix = local.slice(0, 2);
    return `${prefix}***@${domain}`;
  }
  if (trimmed.length >= 7) {
    return `${trimmed.slice(0, 5)}****${trimmed.slice(-2)}`;
  }
  return trimmed;
};

export const GoldenWalletModal: React.FC<GoldenWalletModalProps> = ({
  isOpen,
  onClose,
  userGoldenCoins,
  userEarnedCoins,
  userName,
  userAvatar,
  onAddCoins,
  onRequestCashout,
  cashoutRequests,
}) => {
  const [activeTab, setActiveTab] = useState<'cashout' | 'buy' | 'history'>('cashout');
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);

  // Saved Payment Methods
  const [savedMethods, setSavedMethods] = useState<SavedPaymentMethods>(() =>
    loadSavedPaymentMethods()
  );

  // Payment Setup Draft Inputs
  const [bkashInput, setBkashInput] = useState(savedMethods.bkash);
  const [bkashVerified, setBkashVerified] = useState(savedMethods.bkashVerified);
  const [nagadInput, setNagadInput] = useState(savedMethods.nagad);
  const [rocketInput, setRocketInput] = useState(savedMethods.rocket);
  const [paypalInput, setPaypalInput] = useState(savedMethods.paypal);
  const [payoneerInput, setPayoneerInput] = useState(savedMethods.payoneer);
  const [setupFeedback, setSetupFeedback] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  // Cashout Form State
  const [cashoutCoins, setCashoutCoins] = useState<string>('50');
  const [paymentMethod, setPaymentMethod] = useState<CashoutMethodId>('bkash');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [cashoutStatus, setCashoutStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [cashoutError, setCashoutError] = useState<string>('');
  const [showSuccessConfirmModal, setShowSuccessConfirmModal] = useState(false);

  useHistoryBack(isOpen && showPaymentSetup, () => setShowPaymentSetup(false), 'wallet-payment-setup');
  useHistoryBack(
    isOpen && showSuccessConfirmModal,
    () => setShowSuccessConfirmModal(false),
    'wallet-cashout-confirm'
  );

  // Buy State
  const [buyMethod, setBuyMethod] = useState<'paypal' | 'bkash' | 'nagad'>('bkash');
  const [selectedBuyPkg, setSelectedBuyPkg] = useState<typeof BUY_PACKAGES[0]>(BUY_PACKAGES[1]);
  const [buyStatus, setBuyStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Auto-sync selected method's saved number into accountNumber
  useEffect(() => {
    const savedVal = savedMethods[paymentMethod] || '';
    setAccountNumber(savedVal);
    setCashoutError('');
  }, [paymentMethod, savedMethods]);

  if (!isOpen) return null;

  const selectedMethodMeta =
    PAYMENT_METHODS.find((m) => m.id === paymentMethod) || PAYMENT_METHODS[2];
  const savedForSelected = (savedMethods[paymentMethod] || '').trim();

  const coinsToCash = parseInt(cashoutCoins, 10) || 0;
  const canCashout = userEarnedCoins >= coinsToCash && coinsToCash >= 20;

  const openPaymentSetupScreen = () => {
    setBkashInput(savedMethods.bkash);
    setBkashVerified(savedMethods.bkashVerified);
    setNagadInput(savedMethods.nagad);
    setRocketInput(savedMethods.rocket);
    setPaypalInput(savedMethods.paypal);
    setPayoneerInput(savedMethods.payoneer);
    setSetupFeedback(null);
    setSetupError(null);
    setShowPaymentSetup(true);
  };

  const handleVerifyBkash = () => {
    const cleaned = bkashInput.replace(/\s+/g, '');
    if (!/^01\d{9}$/.test(cleaned)) {
      setSetupError('সঠিক ১১ সংখ্যার বিকাশ নাম্বার দিন (যেমন: 01XXXXXXXXX)');
      setBkashVerified(false);
      return;
    }
    setSetupError(null);
    setBkashInput(cleaned);
    setBkashVerified(true);
    setSetupFeedback('বিকাশ নাম্বার সফলভাবে ভেরিফাই হয়েছে ✓');
    setTimeout(() => setSetupFeedback(null), 2500);
  };

  const handleSavePaymentMethods = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);

    const updated: SavedPaymentMethods = {
      bkash: bkashInput.trim(),
      bkashVerified: bkashInput.trim() ? bkashVerified || /^01\d{9}$/.test(bkashInput.trim()) : false,
      nagad: nagadInput.trim(),
      rocket: rocketInput.trim(),
      paypal: paypalInput.trim(),
      payoneer: payoneerInput.trim(),
    };

    setSavedMethods(updated);
    try {
      localStorage.setItem(STORAGE_KEY_PAYMENT_METHODS, JSON.stringify(updated));
    } catch {
      // ignore storage failure
    }

    setSetupFeedback('আপনার পেমেন্ট মাধ্যমসমূহ সংরক্ষণ করা হয়েছে!');
    setTimeout(() => {
      setSetupFeedback(null);
      setShowPaymentSetup(false);
    }, 600);
  };

  const handleCashoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveAccount = accountNumber.trim() || savedForSelected;

    if (!effectiveAccount) {
      setCashoutError(
        `আপনি এখনো ${selectedMethodMeta.name} নাম্বার যোগ করেননি — উপরের লাল বক্সে ক্লিক করে যোগ করুন!`
      );
      return;
    }
    if (coinsToCash < 20) {
      setCashoutError('সর্বনিম্ন ২০টি গোল্ডেন কয়েন ক্যাশ আউট করতে পারবেন!');
      return;
    }
    if (coinsToCash > userEarnedCoins) {
      setCashoutError('আপনার উপহার হিসেবে অর্জিত কয়েনের চেয়ে বেশি ক্যাশ আউট করা সম্ভব নয়!');
      return;
    }

    setCashoutStatus('loading');
    setCashoutError('');

    try {
      const success = await onRequestCashout({
        userId: 'user-me',
        userName,
        userAvatar,
        coinsAmount: coinsToCash,
        moneyAmount: coinsToCash, // 1 Coin = 1 BDT
        paymentMethod,
        accountNumber: effectiveAccount,
        requestedAt: new Date().toISOString(),
      });

      if (success !== false) {
        setCashoutStatus('success');
        setShowSuccessConfirmModal(true);
      } else {
        setCashoutStatus('error');
        setCashoutError('আবেদন জমা দেওয়া যায়নি, পুনরায় চেষ্টা করুন।');
      }
    } catch {
      setCashoutStatus('error');
      setCashoutError('কোনো একটি সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    }
  };

  const handleBuySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBuyStatus('loading');
    setTimeout(() => {
      onAddCoins(selectedBuyPkg.coins + selectedBuyPkg.bonus);
      setBuyStatus('success');
      setTimeout(() => {
        setBuyStatus('idle');
      }, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white border border-[#E4E6EB] rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-[#050505] relative">
        {/* ======================================================= */}
        {/* SUB-VIEW: পেমেন্ট মাধ্যম যোগ করুন (WHITE GENUINE)         */}
        {/* ======================================================= */}
        {showPaymentSetup ? (
          <>
            <div className="p-4 bg-white border-b border-[#E4E6EB] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPaymentSetup(false)}
                  className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#050505] transition-colors cursor-pointer"
                  title="ফিরে যান"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-extrabold text-base text-[#050505]">
                    পেমেন্ট মাধ্যম যোগ করুন
                  </h3>
                  <p className="text-[11px] text-[#65676B]">
                    আপনার বিকাশ, নগদ, রকেট বা গ্লোবাল একাউন্ট সংরক্ষণ করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] hover:text-[#050505] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSavePaymentMethods}
              className="p-4 overflow-y-auto space-y-4 max-h-[72vh] bg-white"
            >
              {/* বিকাশ নাম্বার + Verify button */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E4E6EB] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#050505]">বিকাশ নাম্বার</label>
                  {bkashVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00A651] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={bkashInput}
                    onChange={(e) => {
                      setBkashInput(e.target.value);
                      setBkashVerified(false);
                    }}
                    className="flex-1 bg-white border border-[#CED0D4] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#050505] placeholder-[#8A8D91] focus:outline-none focus:border-[#0866FF]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyBkash}
                    className="px-4 py-2.5 rounded-xl bg-[#E7F3FF] hover:bg-[#DBE7F2] text-[#0866FF] text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Verify
                  </button>
                </div>
              </div>

              {/* নগদ নাম্বার */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E4E6EB] space-y-1.5">
                <label className="text-xs font-bold text-[#050505] block">নগদ নাম্বার</label>
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={nagadInput}
                  onChange={(e) => setNagadInput(e.target.value)}
                  className="w-full bg-white border border-[#CED0D4] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#050505] placeholder-[#8A8D91] focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              {/* রকেট নাম্বার */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E4E6EB] space-y-1.5">
                <label className="text-xs font-bold text-[#050505] block">রকেট নাম্বার</label>
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={rocketInput}
                  onChange={(e) => setRocketInput(e.target.value)}
                  className="w-full bg-white border border-[#CED0D4] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#050505] placeholder-[#8A8D91] focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              {/* PayPal ইমেইল */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E4E6EB] space-y-1.5">
                <label className="text-xs font-bold text-[#050505] block">PayPal ইমেইল</label>
                <input
                  type="email"
                  placeholder="email@paypal.com"
                  value={paypalInput}
                  onChange={(e) => setPaypalInput(e.target.value)}
                  className="w-full bg-white border border-[#CED0D4] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#050505] placeholder-[#8A8D91] focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              {/* Payoneer ইমেইল */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E4E6EB] space-y-1.5">
                <label className="text-xs font-bold text-[#050505] block">Payoneer ইমেইল</label>
                <input
                  type="email"
                  placeholder="email@payoneer.com"
                  value={payoneerInput}
                  onChange={(e) => setPayoneerInput(e.target.value)}
                  className="w-full bg-white border border-[#CED0D4] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#050505] placeholder-[#8A8D91] focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              {setupError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{setupError}</span>
                </div>
              )}

              {setupFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#00A651] text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{setupFeedback}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPaymentSetup(false)}
                  className="px-4 py-3 rounded-xl bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white text-sm font-bold shadow-sm transition-colors cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* ======================================================= */}
            {/* MAIN WALLET & CASHOUT SCREEN (WHITE GENUINE)            */}
            {/* ======================================================= */}

            {/* Top Card Header — Yellow Icon on Pure White */}
            <div className="p-4 bg-white border-b border-[#E4E6EB]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-neutral-950 font-black shadow-sm">
                    <Coins className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#050505]">
                      গোল্ডেন ওয়ালেট ও ক্যাশ আউট
                    </h3>
                    <p className="text-[11px] text-[#65676B]">
                      ১ গোল্ডেন কয়েন = ১.০০ টাকা (BDT)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={openPaymentSetupScreen}
                    className="px-2.5 py-1.5 rounded-lg bg-[#E7F3FF] hover:bg-[#DBE7F2] text-[#0866FF] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    title="পেমেন্ট মাধ্যম যোগ করুন"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>পেমেন্ট নাম্বার</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] hover:text-[#050505] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Balance Summary Cards */}
              <div className="grid grid-cols-2 gap-2.5 mt-2">
                {/* Card 1: হাদিয়া পাঠানোর ব্যালেন্স - Light gray/white background, black text */}
                <div className="bg-[#F0F2F5] border border-[#E4E6EB] rounded-2xl p-3">
                  <p className="text-[10px] font-bold text-[#65676B] uppercase tracking-wide">
                    হাদিয়া পাঠানোর ব্যালেন্স
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-[#050505] tabular-nums">
                      🪙 {userGoldenCoins}
                    </span>
                    <span className="text-[10px] text-[#65676B] font-semibold">কয়েন</span>
                  </div>
                  <p className="text-[10px] text-[#65676B] mt-0.5 tabular-nums">
                    মূল্য: ৳{userGoldenCoins} (${(userGoldenCoins / 120).toFixed(2)} USD)
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('buy')}
                    className="mt-2 text-[11px] font-extrabold text-[#0866FF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ কয়েন রিচার্জ করুন</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Card 2: GLOBAL HADIYA - Light green/white background, black text */}
                <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-[#00A651] uppercase tracking-wide">
                      GLOBAL HADIYA
                    </p>
                    <span className="w-2 h-2 rounded-full bg-[#00A651]" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-[#050505] tabular-nums">
                      🪙 {userEarnedCoins}
                    </span>
                    <span className="text-[10px] text-[#050505] font-semibold">কয়েন</span>
                  </div>
                  <p className="text-[10px] text-[#050505]/75 mt-0.5 tabular-nums">
                    PayPal/Cash: ৳{userEarnedCoins} (${(userEarnedCoins / 120).toFixed(2)} USD)
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('cashout')}
                    className="mt-2 text-[11px] font-extrabold text-[#00A651] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>ক্যাশ আউট করুন</span>
                    <ArrowDownLeft className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Switcher — White Background, Black/Blue Active */}
            <div className="grid grid-cols-3 border-b border-[#E4E6EB] bg-white text-xs font-bold text-[#65676B]">
              <button
                type="button"
                onClick={() => setActiveTab('cashout')}
                className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'cashout'
                    ? 'text-[#050505] border-b-2 border-[#0866FF] bg-[#F0F2F5]/60'
                    : 'hover:text-[#050505] hover:bg-[#F0F2F5]/40'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-[#00A651]" />
                <span>ক্যাশ আউট / বিক্রি</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('buy')}
                className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'buy'
                    ? 'text-[#050505] border-b-2 border-[#0866FF] bg-[#F0F2F5]/60'
                    : 'hover:text-[#050505] hover:bg-[#F0F2F5]/40'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
                <span>কয়েন রিচার্জ</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'history'
                    ? 'text-[#050505] border-b-2 border-[#0866FF] bg-[#F0F2F5]/60'
                    : 'hover:text-[#050505] hover:bg-[#F0F2F5]/40'
                }`}
              >
                <History className="w-3.5 h-3.5 text-[#0866FF]" />
                <span>হিস্টোরি ({cashoutRequests.length})</span>
              </button>
            </div>

            {/* Tab Content — White Background */}
            <div className="p-4 overflow-y-auto space-y-4 max-h-[58vh] bg-white">
              {/* TAB 1: CASHOUT */}
              {activeTab === 'cashout' && (
                <form onSubmit={handleCashoutSubmit} className="space-y-4">
                  <div className="bg-[#F0F2F5] border border-[#E4E6EB] rounded-2xl p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#00A651] font-bold text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>বিকাশ, নগদ বা রকেটে সরাসরি টাকা গ্রহণ করুন</span>
                    </div>
                    <p className="text-[11px] text-[#65676B] leading-relaxed">
                      আপনার ভিডিও ও পোস্টের উপহার থেকে অর্জিত গোল্ডেন কয়েন বিক্রি করে সরাসরি বিকাশ/নগদে টাকা নিতে পারবেন। প্রতি গোল্ডেন কয়েনের মূল্য ১ টাকা।
                    </p>
                  </div>

                  {/* Amount to cash out */}
                  <div>
                    <label className="text-xs font-bold text-[#050505] block mb-1">
                      কত গোল্ডেন কয়েন বিক্রি করতে চান? (ন্যূনতম ২০টি)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="20"
                        max={Math.max(20, userEarnedCoins)}
                        value={cashoutCoins}
                        onChange={(e) => setCashoutCoins(e.target.value)}
                        className="w-full bg-white border border-[#CED0D4] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#050505] focus:outline-none focus:border-[#0866FF]"
                        required
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        <button
                          type="button"
                          onClick={() => setCashoutCoins(userEarnedCoins.toString())}
                          className="px-2.5 py-1 rounded-lg bg-[#E7F3FF] text-[#0866FF] text-[10px] font-bold hover:bg-[#DBE7F2] cursor-pointer"
                        >
                          সর্বোচ্চ ({userEarnedCoins})
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector — White Cards, Blue Selected Border */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#050505]">
                        গ্লোবাল ও লোকাল পেমেন্ট মাধ্যম নির্বাচন করুন:
                      </label>
                      <button
                        type="button"
                        onClick={openPaymentSetupScreen}
                        className="text-[11px] font-bold text-[#0866FF] hover:underline cursor-pointer"
                      >
                        + মাধ্যম যোগ/পরিবর্তন
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {PAYMENT_METHODS.map((m) => {
                        const isSelected = paymentMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id)}
                            className={`p-2 rounded-xl border-2 text-center transition-all cursor-pointer bg-white ${
                              isSelected
                                ? 'border-[#0866FF] bg-[#E7F3FF]/40 shadow-2xs'
                                : 'border-[#E4E6EB] hover:border-[#CED0D4]'
                            }`}
                          >
                            {m.isEmail ? (
                              <Globe className="w-4 h-4 mx-auto mb-1 text-[#0866FF]" />
                            ) : (
                              <Smartphone className="w-4 h-4 mx-auto mb-1 text-[#00A651]" />
                            )}
                            <p className="text-[11px] font-bold text-[#050505]">{m.name}</p>
                            <p className="text-[9px] text-[#65676B]">{m.sub}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Number Status Banner (Missing = Red clickable warning, Saved = Masked destination) */}
                  {!savedForSelected ? (
                    <button
                      type="button"
                      onClick={openPaymentSetupScreen}
                      className="w-full text-left p-3 rounded-xl bg-red-50 hover:bg-red-100/80 border border-red-300 text-red-600 text-xs font-bold flex items-center justify-between gap-2 transition-colors cursor-pointer"
                    >
                      <span>
                        ⚠️ আপনি এখনো {selectedMethodMeta.name} নাম্বার যোগ করেননি - এখানে ক্লিক করে যোগ করুন
                      </span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-white border border-emerald-300 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#050505]">
                        <CheckCircle2 className="w-4 h-4 text-[#00A651] shrink-0" />
                        <span>
                          {selectedMethodMeta.name}:{' '}
                          <span className="text-[#00A651]">
                            {maskDestination(savedForSelected, selectedMethodMeta.isEmail)}
                          </span>{' '}
                          তে যাবে
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={openPaymentSetupScreen}
                        className="text-[11px] font-bold text-[#0866FF] hover:underline cursor-pointer shrink-0"
                      >
                        পরিবর্তন করুন
                      </button>
                    </div>
                  )}

                  {/* Account Number Input (White background, Gray border, Black text) */}
                  <div>
                    <label className="text-xs font-bold text-[#050505] block mb-1">
                      {selectedMethodMeta.isEmail
                        ? `আপনার ${selectedMethodMeta.name} ইমেইল:`
                        : `আপনার ${selectedMethodMeta.name} মোবাইল নম্বর:`}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        selectedMethodMeta.isEmail
                          ? 'email@paypal.com'
                          : 'আপনার মোবাইল নম্বর লিখুন (01XXXXXXXXX)'
                      }
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-white border border-[#CED0D4] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#050505] placeholder-[#8A8D91] focus:outline-none focus:border-[#0866FF]"
                      required
                    />
                  </div>

                  {/* Conversion Preview Breakdown */}
                  <div className="bg-white rounded-xl p-3 border border-[#E4E6EB] text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[#65676B]">
                      <span>বিক্রিকৃত গোল্ডেন কয়েন:</span>
                      <span className="font-bold text-[#050505]">🪙 {coinsToCash}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#65676B]">
                      <span>প্ল্যাটফর্ম ফি (০%):</span>
                      <span className="font-bold text-[#00A651]">৳ ০.০০ (ফ্রি)</span>
                    </div>
                    <div className="pt-1.5 border-t border-[#E4E6EB] flex items-center justify-between font-extrabold text-sm text-[#050505]">
                      <span>আপনি সর্বমোট পাবেন:</span>
                      <span className="text-[#00A651] text-base">৳ {coinsToCash}.০০ টাকা</span>
                    </div>
                    <p className="text-[10px] text-[#65676B] pt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#00A651]" />
                      <span>আবেদন করার ২৪ ঘণ্টার মধ্যে বিকাশ/নগদে টাকা পৌঁছে দেওয়া হয়।</span>
                    </p>
                  </div>

                  {cashoutError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{cashoutError}</span>
                    </div>
                  )}

                  {/* Green Cashout Button #00A651 */}
                  <button
                    type="submit"
                    disabled={!canCashout || cashoutStatus === 'loading'}
                    className="w-full py-3 bg-[#00A651] hover:bg-[#008f45] text-white rounded-xl text-xs font-black shadow-md disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {cashoutStatus === 'loading' ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>আবেদন প্রক্রিয়াধীন...</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownLeft className="w-4 h-4" />
                        <span>ক্যাশ আউট আবেদন জমা দিন (৳ {coinsToCash} টাকা)</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: BUY / RECHARGE COINS */}
              {activeTab === 'buy' && (
                <form onSubmit={handleBuySubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#050505] block mb-2">
                      প্যাকেজ নির্বাচন করুন:
                    </label>
                    <div className="space-y-2">
                      {BUY_PACKAGES.map((pkg) => {
                        const isSelected = selectedBuyPkg.coins === pkg.coins;
                        return (
                          <button
                            key={pkg.coins}
                            type="button"
                            onClick={() => setSelectedBuyPkg(pkg)}
                            className={`w-full p-3 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer bg-white ${
                              isSelected
                                ? 'border-[#0866FF] bg-[#E7F3FF]/30 shadow-2xs'
                                : 'border-[#E4E6EB] hover:border-[#CED0D4]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 font-black">
                                🪙
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-sm text-[#050505]">
                                    {pkg.coins} গোল্ডেন কয়েন
                                  </span>
                                  {pkg.bonus > 0 && (
                                    <span className="text-[10px] bg-emerald-50 text-[#00A651] border border-emerald-200 px-1.5 py-0.5 rounded-md font-bold">
                                      +{pkg.bonus} বোনাস
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-[#65676B]">{pkg.tag}</p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-sm font-black text-[#050505]">
                                ৳ {pkg.price} টাকা
                              </span>
                              {isSelected && (
                                <p className="text-[10px] text-[#0866FF] font-bold">নির্বাচিত ✓</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#050505] block mb-1.5">
                      পেমেন্ট মাধ্যম (PayPal Global / বিকাশ / নগদ):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setBuyMethod('paypal')}
                        className={`p-2.5 rounded-xl border-2 text-center text-xs transition-all cursor-pointer bg-white text-[#050505] ${
                          buyMethod === 'paypal'
                            ? 'border-[#0866FF] bg-[#E7F3FF]/40 font-bold'
                            : 'border-[#E4E6EB]'
                        }`}
                      >
                        🌐 PayPal
                      </button>
                      <button
                        type="button"
                        onClick={() => setBuyMethod('bkash')}
                        className={`p-2.5 rounded-xl border-2 text-center text-xs transition-all cursor-pointer bg-white text-[#050505] ${
                          buyMethod === 'bkash'
                            ? 'border-[#0866FF] bg-[#E7F3FF]/40 font-bold'
                            : 'border-[#E4E6EB]'
                        }`}
                      >
                        বিকাশ (bKash)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBuyMethod('nagad')}
                        className={`p-2.5 rounded-xl border-2 text-center text-xs transition-all cursor-pointer bg-white text-[#050505] ${
                          buyMethod === 'nagad'
                            ? 'border-[#0866FF] bg-[#E7F3FF]/40 font-bold'
                            : 'border-[#E4E6EB]'
                        }`}
                      >
                        নগদ (Nagad)
                      </button>
                    </div>
                  </div>

                  {buyStatus === 'success' && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#00A651] text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>
                        সফলভাবে {selectedBuyPkg.coins + selectedBuyPkg.bonus}টি গোল্ডেন কয়েন যোগ করা হয়েছে!
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={buyStatus === 'loading'}
                    className="w-full py-3 bg-[#0866FF] hover:bg-[#1877F2] text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {buyStatus === 'loading' ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>পেমেন্ট প্রসেস হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4" />
                        <span>৳ {selectedBuyPkg.price} টাকা পরিশোধ করে কয়েন কিনুন</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 3: HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#050505] font-bold mb-2">
                    <span>ক্যাশ আউট রিকোয়েস্ট হিস্টোরি:</span>
                    <span className="text-[11px] text-[#65676B]">{cashoutRequests.length}টি আবেদন</span>
                  </div>

                  {cashoutRequests.length === 0 ? (
                    <div className="text-center py-8 text-[#65676B] text-xs bg-[#F0F2F5] rounded-2xl border border-[#E4E6EB] space-y-2">
                      <Coins className="w-8 h-8 text-amber-500 mx-auto" />
                      <p className="font-bold text-[#050505]">এখনো কোনো ক্যাশ আউট রিকোয়েস্ট করেননি।</p>
                      <p className="text-[11px] text-[#65676B]">
                        ভিডিও থেকে কয়েন অর্জন করে বিকাশ বা নগদে টাকা তুলুন।
                      </p>
                    </div>
                  ) : (
                    cashoutRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 rounded-2xl bg-white border border-[#E4E6EB] flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#050505]">
                              ৳ {req.moneyAmount} টাকা ({req.coinsAmount} কয়েন)
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                req.status === 'approved'
                                  ? 'bg-emerald-50 text-[#00A651] border border-emerald-200'
                                  : req.status === 'rejected'
                                  ? 'bg-red-50 text-red-600 border border-red-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {req.status === 'approved'
                                ? 'অনুমোদিত ✓'
                                : req.status === 'rejected'
                                ? 'বাতিল'
                                : 'Pending'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#65676B] mt-0.5">
                            মাধ্যম:{' '}
                            <span className="capitalize font-semibold text-[#050505]">
                              {req.paymentMethod}
                            </span>{' '}
                            ({req.accountNumber})
                          </p>
                          <p className="text-[10px] text-[#8A8D91] mt-0.5">
                            {new Date(req.requestedAt).toLocaleDateString('bn-BD', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>

                        <div className="text-right">
                          {req.status === 'approved' ? (
                            <span className="text-xs font-bold text-[#00A651]">টাকা পাঠানো হয়েছে</span>
                          ) : req.status === 'rejected' ? (
                            <span className="text-xs font-bold text-red-500">বাতিল</span>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-600">প্রসেসিং</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Footer — 100% হালাল Green Text on White */}
            <div className="p-3 border-t border-[#E4E6EB] bg-white flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-[#00A651] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>১০০% হালাল ও বিশ্বস্ত লেনদেন</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] font-bold transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </>
        )}

        {/* White Confirmation Modal after Cashout Submit */}
        {showSuccessConfirmModal && (
          <div className="fixed inset-0 z-[130] bg-black/45 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white border border-[#E4E6EB] rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl space-y-3 text-[#050505]">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-[#00A651]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-extrabold text-[#050505] leading-snug">
                ✅ আবেদন গ্রহণ করা হয়েছে! (ডেমো) - অ্যাডমিন ২৪ ঘণ্টার মধ্যে পাঠাবে।
              </h4>
              <p className="text-xs text-[#65676B]">
                আপনার রিকোয়েস্টটি Admin Payout Requests এবং হিস্টোরি ট্যাবে যুক্ত হয়েছে।
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessConfirmModal(false);
                  setCashoutStatus('idle');
                  setActiveTab('history');
                }}
                className="w-full py-2.5 rounded-xl bg-[#00A651] hover:bg-[#008f45] text-white text-xs font-bold cursor-pointer"
              >
                ঠিক আছে (হিস্টোরি দেখুন)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
