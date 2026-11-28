import React, { useState } from 'react';
import {
  X,
  Coins,
  Globe,
  CheckCircle2,
  ArrowDownToLine,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { GoldenCashoutRequest } from '../../types';
import {
  COIN_TO_BDT,
  COIN_TO_USD,
  HOST_BEAN_SHARE,
  APP_PLATFORM_SHARE,
  formatCoinPrice,
} from '../../data/peaceGifts';
import {
  useGeoPayment,
  getPaymentMethodsForRegion,
} from '../../utils/geoPayment';

interface YtWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  userBeans: number;
  userName: string;
  userId: string;
  userAvatar?: string;
  onAddCoins: (amount: number) => void;
  onRequestCashout: (
    req: Omit<GoldenCashoutRequest, 'id' | 'status'>
  ) => boolean;
  cashoutRequests: GoldenCashoutRequest[];
}

const COIN_PACKS = [50, 200, 1000, 5000, 15000, 40000];

export const YtWalletModal: React.FC<YtWalletModalProps> = ({
  isOpen,
  onClose,
  userCoins,
  userBeans,
  userName,
  userId,
  userAvatar,
  onAddCoins,
  onRequestCashout,
  cashoutRequests,
}) => {
  const { region, countryCode, setManualRegion } = useGeoPayment();
  const [tab, setTab] = useState<'buy' | 'withdraw'>('buy');
  const [selectedPack, setSelectedPack] = useState<number>(200);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [buyFeedback, setBuyFeedback] = useState<string | null>(null);

  const [withdrawBeans, setWithdrawBeans] = useState<string>('100');
  const [withdrawAccount, setWithdrawAccount] = useState<string>('');
  const [withdrawFeedback, setWithdrawFeedback] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const regionMethods = getPaymentMethodsForRegion(region);
  const activeMethodId =
    selectedMethod && regionMethods.some((m) => m.id === selectedMethod)
      ? selectedMethod
      : regionMethods[0]?.id || 'bkash';

  if (!isOpen) return null;

  const isBD = region === 'BD';
  const beansValueBdt = Math.round(userBeans * COIN_TO_BDT);
  const beansValueUsd = Number((userBeans * COIN_TO_USD).toFixed(2));

  const handleBuyCoins = () => {
    onAddCoins(selectedPack);
    const priceLabel = formatCoinPrice(selectedPack, isBD);
    setBuyFeedback(
      `+${selectedPack.toLocaleString()} Coins added (${priceLabel} via ${
        regionMethods.find((m) => m.id === activeMethodId)?.label
      })`
    );
    setTimeout(() => setBuyFeedback(null), 3000);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    const amount = Math.floor(Number(withdrawBeans));
    if (!Number.isFinite(amount) || amount < 50) {
      setWithdrawError('Minimum withdrawal is 50 Beans.');
      return;
    }
    if (amount > userBeans) {
      setWithdrawError('Insufficient Beans balance.');
      return;
    }
    if (!withdrawAccount.trim()) {
      setWithdrawError(
        isBD
          ? 'Enter your bKash or Nagad number.'
          : 'Enter your Visa/Mastercard or Bank account.'
      );
      return;
    }

    const methodMap: Record<string, GoldenCashoutRequest['paymentMethod']> = {
      bkash: 'bkash',
      nagad: 'nagad',
      visa_mastercard: 'visa_mastercard',
      google_play: 'bank',
      apple_pay: 'bank',
    };

    const moneyAmount = isBD
      ? Math.round(amount * COIN_TO_BDT)
      : Number((amount * COIN_TO_USD).toFixed(2));

    const ok = onRequestCashout({
      userId,
      userName,
      userAvatar,
      coinsAmount: amount,
      moneyAmount,
      currency: isBD ? 'BDT' : 'USD',
      paymentMethod: methodMap[activeMethodId] || (isBD ? 'bkash' : 'visa_mastercard'),
      accountNumber: withdrawAccount.trim(),
      requestedAt: new Date().toISOString(),
    });

    if (ok) {
      setWithdrawFeedback(
        `Withdrawal requested: ${amount.toLocaleString()} Beans (${isBD ? `৳${moneyAmount}` : `$${moneyAmount}`})`
      );
      setWithdrawAccount('');
      setTimeout(() => setWithdrawFeedback(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-zinc-950">Peaceverse24 Wallet</h3>
              <p className="text-[11px] text-zinc-500">
                1 Coin = ৳{COIN_TO_BDT} / ${COIN_TO_USD} · Host {Math.round(HOST_BEAN_SHARE * 100)}% Beans / App {Math.round(APP_PLATFORM_SHARE * 100)}%
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

        {/* Auto-detected Region Switcher & Balances */}
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 font-bold text-zinc-700">
              <Globe className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Detected: {countryCode} ({isBD ? 'Bangladesh ৳' : 'International $'})</span>
            </span>
            <div className="inline-flex rounded-full bg-zinc-200 p-0.5">
              <button
                type="button"
                onClick={() => setManualRegion('BD')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                  isBD ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-600'
                }`}
              >
                🇧🇩 BD
              </button>
              <button
                type="button"
                onClick={() => setManualRegion('INTL')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                  !isBD ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-600'
                }`}
              >
                🌍 Foreign
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white rounded-2xl border border-zinc-200 p-3">
              <p className="text-[11px] font-bold text-zinc-500">My Coins</p>
              <p className="text-lg font-extrabold text-zinc-950 flex items-center gap-1 mt-0.5">
                <Coins className="w-4 h-4 text-[#DC2626]" />
                <span>{userCoins.toLocaleString()}</span>
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-emerald-200 p-3">
              <p className="text-[11px] font-bold text-[#16A34A]">My Beans (60%)</p>
              <p className="text-lg font-extrabold text-zinc-950 flex items-center gap-1 mt-0.5">
                <Sparkles className="w-4 h-4 text-[#16A34A]" />
                <span>{userBeans.toLocaleString()}</span>
              </p>
              <p className="text-[10px] font-semibold text-zinc-500">
                ≈ {isBD ? `৳${beansValueBdt.toLocaleString()}` : `$${beansValueUsd}`}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTab('buy')}
              className={`h-10 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                tab === 'buy'
                  ? 'bg-[#DC2626] text-white'
                  : 'bg-white border border-zinc-200 text-zinc-700'
              }`}
            >
              Buy Coins
            </button>
            <button
              type="button"
              onClick={() => setTab('withdraw')}
              className={`h-10 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                tab === 'withdraw'
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-white border border-zinc-200 text-zinc-700'
              }`}
            >
              Withdraw Beans (60%)
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Payment Methods */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-zinc-600">
              {isBD
                ? 'Bangladesh Payment Methods (bKash / Nagad)'
                : 'International Payment Methods (Google Play / Apple Pay / Visa & Mastercard)'}
            </p>
            <div className="flex flex-wrap gap-2">
              {regionMethods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethod(m.id)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                    activeMethodId === m.id
                      ? 'border-[#16A34A] bg-emerald-50 text-emerald-950'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {m.label} · {m.badge}
                </button>
              ))}
            </div>
          </div>

          {tab === 'buy' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2.5">
                {COIN_PACKS.map((coins) => {
                  const priceLabel = formatCoinPrice(coins, isBD);
                  const active = selectedPack === coins;
                  return (
                    <button
                      key={coins}
                      type="button"
                      onClick={() => setSelectedPack(coins)}
                      className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                        active
                          ? 'border-[#DC2626] bg-red-50/70 ring-2 ring-[#DC2626]/20'
                          : 'border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      <p className="text-sm font-extrabold text-zinc-950">
                        {coins.toLocaleString()}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-500">Coins</p>
                      <p className="text-xs font-extrabold text-[#16A34A] mt-1">
                        {priceLabel}
                      </p>
                    </button>
                  );
                })}
              </div>

              {buyFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
                  <span>{buyFeedback}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleBuyCoins}
                className="w-full h-12 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold text-sm cursor-pointer transition-colors"
              >
                Buy {selectedPack.toLocaleString()} Coins (
                {formatCoinPrice(selectedPack, isBD)})
              </button>
            </div>
          ) : (
            <form onSubmit={handleWithdrawSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Beans to Withdraw (Min 50)
                </label>
                <input
                  type="number"
                  min={50}
                  max={Math.max(50, userBeans)}
                  value={withdrawBeans}
                  onChange={(e) => setWithdrawBeans(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-950 focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  {isBD
                    ? 'bKash / Nagad Number'
                    : 'Visa/Mastercard or Bank Account Details'}
                </label>
                <input
                  type="text"
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  placeholder={isBD ? '01XXXXXXXXX' : 'Card / IBAN / Account'}
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm text-zinc-950 focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              {withdrawError && (
                <p className="text-xs font-bold text-[#DC2626]">{withdrawError}</p>
              )}
              {withdrawFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
                  <span>{withdrawFeedback}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Request Withdrawal</span>
              </button>

              {cashoutRequests.length > 0 && (
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-bold text-zinc-500">Recent Withdrawals</p>
                  {cashoutRequests.slice(0, 4).map((req) => (
                    <div
                      key={req.id}
                      className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-zinc-900">
                          {req.coinsAmount.toLocaleString()} Beans · {req.paymentMethod.toUpperCase()}
                        </p>
                        <p className="text-[11px] text-zinc-500">{req.accountNumber}</p>
                      </div>
                      <span className="font-extrabold uppercase text-[10px] text-[#16A34A]">
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
