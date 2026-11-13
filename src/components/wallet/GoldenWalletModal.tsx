import React, { useState } from 'react';
import {
  X,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  CreditCard,
  Building,
  Smartphone,
  ChevronRight,
  TrendingUp,
  History,
  Globe,
} from 'lucide-react';
import { GoldenCashoutRequest } from '../../types';

interface GoldenWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGoldenCoins: number;
  userEarnedCoins: number;
  userName: string;
  userAvatar?: string;
  onAddCoins: (amount: number) => void;
  onRequestCashout: (request: Omit<GoldenCashoutRequest, 'id' | 'createdAt' | 'status'>) => Promise<boolean> | boolean;
  cashoutRequests: GoldenCashoutRequest[];
}

const BUY_PACKAGES = [
  { coins: 50, price: 50, bonus: 0, tag: 'শুরু করার জন্য' },
  { coins: 100, price: 100, bonus: 5, tag: 'সবচেয়ে জনপ্রিয়' },
  { coins: 250, price: 250, bonus: 15, tag: 'বেশি উপহারের জন্য' },
  { coins: 500, price: 500, bonus: 40, tag: 'ক্রিয়েটর সাপোর্ট' },
  { coins: 1000, price: 1000, bonus: 100, tag: 'ভিআইপি প্যাকেজ' },
];

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

  // Cashout Form State
  const [cashoutCoins, setCashoutCoins] = useState<string>('50');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'payoneer' | 'bkash' | 'nagad' | 'rocket' | 'bank'>('paypal');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [cashoutStatus, setCashoutStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [cashoutError, setCashoutError] = useState<string>('');

  // Buy State
  const [buyMethod, setBuyMethod] = useState<'paypal' | 'bkash' | 'nagad'>('paypal');
  const [selectedBuyPkg, setSelectedBuyPkg] = useState<typeof BUY_PACKAGES[0]>(BUY_PACKAGES[1]);
  const [buyStatus, setBuyStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  if (!isOpen) return null;

  const coinsToCash = parseInt(cashoutCoins, 10) || 0;
  const canCashout = userEarnedCoins >= coinsToCash && coinsToCash >= 20;

  const handleCashoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) {
      setCashoutError('অনুগ্রহ করে আপনার বিকাশ/নগদ/একাউন্ট নম্বর প্রদান করুন!');
      return;
    }
    if (coinsToCash < 20) {
      setCashoutError('সর্বনিম্ন ২০টি গোল্ডেন কয়েন ক্যাশ আউট করতে পারবেন!');
      return;
    }
    if (coinsToCash > userEarnedCoins) {
      setCashoutError('আপনার উপহার হিসেবে অর্জিত কয়েনের চেয়ে বেশি ক্যাশ আউট করা সম্ভব নয়!');
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
        accountNumber,
        requestedAt: new Date().toISOString(),
      });

      if (success !== false) {
        setCashoutStatus('success');
        setTimeout(() => {
          setCashoutStatus('idle');
          setAccountNumber('');
          setActiveTab('history');
        }, 1500);
      } else {
        setCashoutStatus('error');
        setCashoutError('আবেদন জমা দেওয়া যায়নি, পুনরায় চেষ্টা করুন।');
      }
    } catch {
      setCashoutStatus('error');
      setCashoutError('কোনো একটি সমস্যা হয়েছে, আবার চেষ্টা করুন।');
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
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-[#1f2022] border border-amber-500/30 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-white">
        
        {/* Header with Balance Card */}
        <div className="p-4 bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-[#1f2022] border-b border-amber-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-neutral-950 font-black shadow-md shadow-amber-500/30">
                <Coins className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">গোল্ডেন ওয়ালেট ও ক্যাশ আউট</h3>
                <p className="text-[10px] text-amber-300">১ গোল্ডেন কয়েন = ১.০০ টাকা (BDT)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Balance Summary Cards */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-3 relative overflow-hidden">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">হাদিয়া পাঠানোর ব্যালেন্স</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-amber-400">🪙 {userGoldenCoins}</span>
                <span className="text-[10px] text-neutral-400">কয়েন</span>
              </div>
              <p className="text-[10px] text-amber-200/70 mt-0.5 tabular-nums">মূল্য: ৳{userGoldenCoins} (${(userGoldenCoins / 120).toFixed(2)} USD)</p>
              <button
                onClick={() => setActiveTab('buy')}
                className="mt-2 text-[10px] font-extrabold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
              >
                <span>+ কয়েন রিচার্জ করুন</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-emerald-950/60 to-black/40 border border-emerald-500/40 rounded-2xl p-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Global Hadiya আয়</p>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-emerald-300 tabular-nums">🪙 {userEarnedCoins}</span>
                <span className="text-[10px] text-emerald-400">কয়েন</span>
              </div>
              <p className="text-[10px] text-emerald-200/80 mt-0.5 tabular-nums">PayPal/Cash: ৳{userEarnedCoins} (${(userEarnedCoins / 120).toFixed(2)} USD)</p>
              <button
                onClick={() => setActiveTab('cashout')}
                className="mt-2 text-[10px] font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>ক্যাশ আউট করুন</span>
                <ArrowDownLeft className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 border-b border-white/10 bg-[#18191a] text-xs font-bold text-neutral-400">
          <button
            onClick={() => setActiveTab('cashout')}
            className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'cashout'
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5'
                : 'hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>ক্যাশ আউট / বিক্রি</span>
          </button>
          <button
            onClick={() => setActiveTab('buy')}
            className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'buy'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/5'
                : 'hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>কয়েন রিচার্জ</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'text-sky-400 border-b-2 border-sky-400 bg-sky-500/5'
                : 'hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>হিস্টোরি ({cashoutRequests.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto space-y-4 max-h-[60vh]">
          
          {/* TAB 1: CASHOUT (Sell Golden to Cash) */}
          {activeTab === 'cashout' && (
            <form onSubmit={handleCashoutSubmit} className="space-y-4">
              <div className="bg-[#18191a] border border-emerald-500/30 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>বিকাশ, নগদ বা রকেটে সরাসরি টাকা গ্রহণ করুন</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  আপনার ভিডিও ও পোস্টের উপহার থেকে অর্জিত গোল্ডেন কয়েন বিক্রি করে সরাসরি বিকাশ/নগদে টাকা নিতে পারবেন। প্রতি গোল্ডেন কয়েনের মূল্য ১ টাকা।
                </p>
              </div>

              {/* Amount to cash out */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  কত গোল্ডেন কয়েন বিক্রি করতে চান? (ন্যূনতম ২০টি)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="20"
                    max={userEarnedCoins}
                    value={cashoutCoins}
                    onChange={(e) => setCashoutCoins(e.target.value)}
                    className="w-full bg-[#18191a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCashoutCoins(userEarnedCoins.toString())}
                      className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/30 cursor-pointer"
                    >
                      সর্বোচ্চ ({userEarnedCoins})
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  গ্লোবাল ও লোকাল পেমেন্ট মাধ্যম নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'paypal', name: 'PayPal', sub: 'Global USD', color: 'border-sky-500/50 bg-sky-500/10 text-sky-300' },
                    { id: 'payoneer', name: 'Payoneer', sub: 'Worldwide', color: 'border-amber-500/50 bg-amber-500/10 text-amber-300' },
                    { id: 'bkash', name: 'বিকাশ', sub: 'BDT', color: 'border-pink-500/50 bg-pink-500/10 text-pink-300' },
                    { id: 'nagad', name: 'নগদ', sub: 'BDT', color: 'border-orange-500/50 bg-orange-500/10 text-orange-300' },
                    { id: 'rocket', name: 'রকেট', sub: 'BDT', color: 'border-purple-500/50 bg-purple-500/10 text-purple-300' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? `${m.color} ring-2 ring-emerald-400`
                          : 'border-white/10 bg-[#18191a] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {m.id === 'paypal' || m.id === 'payoneer' ? (
                        <Globe className="w-4 h-4 mx-auto mb-1 text-sky-400" />
                      ) : (
                        <Smartphone className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                      )}
                      <p className="text-[11px] font-bold text-white">{m.name}</p>
                      <p className="text-[9px] text-neutral-400">{m.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Number Input */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  {paymentMethod === 'paypal' || paymentMethod === 'payoneer'
                    ? `আপনার ${paymentMethod.toUpperCase()} ইমেইল:`
                    : `আপনার ${paymentMethod === 'bkash' ? 'বিকাশ' : paymentMethod === 'nagad' ? 'নগদ' : 'রকেট'} মোবাইল নম্বর:`}
                </label>
                <input
                  type="text"
                  placeholder={paymentMethod === 'paypal' || paymentMethod === 'payoneer' ? 'email@paypal-global.com' : 'যেমন: 01712345678'}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-[#18191a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              {/* Conversion Preview Breakdown */}
              <div className="bg-[#18191a] rounded-xl p-3 border border-white/10 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-neutral-300">
                  <span>বিক্রিকৃত গোল্ডেন কয়েন:</span>
                  <span className="font-bold text-amber-300">🪙 {coinsToCash}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>প্ল্যাটফর্ম ফি (০%):</span>
                  <span className="font-bold text-emerald-400">৳ ০.০০ (ফ্রি)</span>
                </div>
                <div className="pt-1.5 border-t border-white/10 flex items-center justify-between font-extrabold text-sm text-white">
                  <span>আপনি সর্বমোট পাবেন:</span>
                  <span className="text-emerald-400 text-base">৳ {coinsToCash}.০০ টাকা</span>
                </div>
                <p className="text-[10px] text-neutral-400 pt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>আবেদন করার ২৪ ঘণ্টার মধ্যে বিকাশ/নগদে টাকা পৌঁছে দেওয়া হয়।</span>
                </p>
              </div>

              {/* Error Message */}
              {cashoutError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cashoutError}</span>
                </div>
              )}

              {/* Success Feedback */}
              {cashoutStatus === 'success' && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>আপনার ক্যাশ আউট আবেদন সফলভাবে জমা হয়েছে! এডমিন শীঘ্রই বিকাশ/নগদে টাকা পাঠিয়ে দেবেন।</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canCashout || cashoutStatus === 'loading'}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
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
                <label className="text-xs font-bold text-neutral-300 block mb-2">
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
                        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-400 text-white shadow-md shadow-amber-500/20'
                            : 'bg-[#18191a] border-white/10 hover:border-white/20 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
                            🪙
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-amber-300">{pkg.coins} গোল্ডেন কয়েন</span>
                              {pkg.bonus > 0 && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-md font-bold">
                                  +{pkg.bonus} বোনাস
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-400">{pkg.tag}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-white">৳ {pkg.price} টাকা</span>
                          {isSelected && <p className="text-[10px] text-amber-400 font-bold">নির্বাচিত ✓</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  পেমেন্ট মাধ্যম (PayPal Global / বিকাশ / নগদ):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBuyMethod('paypal')}
                    className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                      buyMethod === 'paypal'
                        ? 'border-sky-500 bg-sky-500/20 text-white ring-1 ring-sky-400 font-bold'
                        : 'border-white/10 bg-[#18191a] text-neutral-400'
                    }`}
                  >
                    🌐 PayPal Global
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuyMethod('bkash')}
                    className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                      buyMethod === 'bkash'
                        ? 'border-pink-500 bg-pink-500/20 text-white ring-1 ring-pink-400 font-bold'
                        : 'border-white/10 bg-[#18191a] text-neutral-400'
                    }`}
                  >
                    বিকাশ (bKash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuyMethod('nagad')}
                    className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                      buyMethod === 'nagad'
                        ? 'border-orange-500 bg-orange-500/20 text-white ring-1 ring-orange-400 font-bold'
                        : 'border-white/10 bg-[#18191a] text-neutral-400'
                    }`}
                  >
                    নগদ (Nagad)
                  </button>
                </div>
              </div>

              {buyStatus === 'success' && (
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>সফলভাবে {selectedBuyPkg.coins + selectedBuyPkg.bonus}টি গোল্ডেন কয়েন যোগ করা হয়েছে!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={buyStatus === 'loading'}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 rounded-xl text-xs font-black shadow-lg shadow-amber-500/30 hover:opacity-95 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {buyStatus === 'loading' ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-neutral-950" />
                    <span>পেমেন্ট প্রসেস হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 text-neutral-950" />
                    <span>৳ {selectedBuyPkg.price} টাকা পরিশোধ করে কয়েন কিনুন</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-300 font-bold mb-2">
                <span>ক্যাশ আউট রিকোয়েস্ট হিস্টোরি:</span>
                <span className="text-[11px] text-neutral-400">{cashoutRequests.length}টি আবেদন</span>
              </div>

              {cashoutRequests.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs bg-[#18191a] rounded-2xl border border-white/5 space-y-2">
                  <Coins className="w-8 h-8 text-amber-400/50 mx-auto" />
                  <p>এখনো কোনো ক্যাশ আউট রিকোয়েস্ট করেননি।</p>
                  <p className="text-[10px] text-neutral-500">ভিডিও থেকে কয়েন অর্জন করে বিকাশ বা নগদে টাকা তুলুন।</p>
                </div>
              ) : (
                cashoutRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-2xl bg-[#18191a] border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          ৳ {req.moneyAmount} টাকা ({req.coinsAmount} কয়েন)
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            req.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : req.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          }`}
                        >
                          {req.status === 'approved' ? 'অনুমোদিত ✓' : req.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমাণ...'}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        মাধ্যম: <span className="capitalize font-semibold text-neutral-300">{req.paymentMethod}</span> ({req.accountNumber})
                      </p>
                      <p className="text-[9px] text-neutral-500 mt-0.5">
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
                        <span className="text-xs font-bold text-emerald-400">টাকা পাঠানো হয়েছে</span>
                      ) : (
                        <span className="text-[10px] text-amber-300">প্রসেসিং</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-[#18191a] flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>১০০% হালাল ও বিশ্বস্ত লেনদেন</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
