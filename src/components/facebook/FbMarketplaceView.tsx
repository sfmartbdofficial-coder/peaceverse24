import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Tag,
  ShoppingBag,
  Check,
  ArrowLeft,
  Plus,
  X,
  Camera,
  MessageCircle,
  ShieldCheck,
  Globe,
  CreditCard,
} from 'lucide-react';
import { INITIAL_MARKETPLACE } from '../../data/islamicPosts';
import { MarketplaceItem, NotificationItem, UserProfile } from '../../types';
import { broadcastCreatorNotification } from '../../lib/fcm';
import { loadPeaceSettings } from '../../utils/settingsStorage';

interface FbMarketplaceViewProps {
  onBack?: () => void;
  userProfile?: UserProfile;
  onBroadcastNotification?: (notif: NotificationItem) => void;
}

type GlobalCurrency = 'USD' | 'SAR' | 'BDT' | 'MYR' | 'TRY' | 'EUR';
type GlobalPaymentMethod = 'PayPal' | 'Stripe' | 'bKash' | 'Payoneer';

const CURRENCY_CONFIG: Record<GlobalCurrency, { symbol: string; rateFromUsd: number; flag: string }> = {
  USD: { symbol: '$', rateFromUsd: 1, flag: '🇺🇸' },
  SAR: { symbol: 'SAR ', rateFromUsd: 3.75, flag: '🇸🇦' },
  BDT: { symbol: '৳', rateFromUsd: 120, flag: '🇧🇩' },
  MYR: { symbol: 'RM ', rateFromUsd: 4.45, flag: '🇲🇾' },
  TRY: { symbol: '₺', rateFromUsd: 34.5, flag: '🇹🇷' },
  EUR: { symbol: '€', rateFromUsd: 0.92, flag: '🇪🇺' },
};

const PAYMENT_OPTIONS: { id: GlobalPaymentMethod; label: string; desc: string }[] = [
  { id: 'PayPal', label: 'PayPal', desc: 'Global buyer protection' },
  { id: 'Stripe', label: 'Stripe', desc: 'Visa / Mastercard / Apple Pay' },
  { id: 'bKash', label: 'bKash', desc: 'Instant Bangladesh mobile pay' },
  { id: 'Payoneer', label: 'Payoneer', desc: 'Global cross-border card' },
];

const PRESET_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=500&q=80',
];

const CATEGORIES = [
  'All (সব পণ্য)',
  'খাবার ও মধু',
  'আতর ও সুগন্ধি',
  'পোশাক ও টুপি',
  'জায়নামাজ ও তসবিহ',
  'ইসলামিক বই',
  'Islamic Lifestyle',
  'Islamic Apparel',
];

function convertPriceString(rawPrice: string, currency: GlobalCurrency): string {
  const numeric = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0;
  if (!numeric) return rawPrice;

  let usdAmount = numeric;
  if (rawPrice.includes('৳')) {
    usdAmount = numeric / 120;
  } else if (rawPrice.toUpperCase().includes('SAR')) {
    usdAmount = numeric / 3.75;
  } else if (rawPrice.includes('€')) {
    usdAmount = numeric / 0.92;
  }

  const cfg = CURRENCY_CONFIG[currency];
  const converted = usdAmount * cfg.rateFromUsd;
  if (currency === 'BDT' || currency === 'TRY') {
    return `${cfg.symbol}${Math.round(converted).toLocaleString('en-US')}`;
  }
  return `${cfg.symbol}${converted.toFixed(2)}`;
}

export const FbMarketplaceView: React.FC<FbMarketplaceViewProps> = ({
  onBack,
  userProfile,
  onBroadcastNotification,
}) => {
  const [items, setItems] = useState<MarketplaceItem[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_fb_marketplace');
      const parsed: MarketplaceItem[] = stored ? JSON.parse(stored) : INITIAL_MARKETPLACE;
      return parsed.map((it) => ({
        ...it,
        sellerName: it.sellerName.replace(/SF MART(\s*BD)?/gi, 'Peace Mart Global'),
      }));
    } catch {
      return INITIAL_MARKETPLACE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('qalby_fb_marketplace', JSON.stringify(items));
    } catch {}
  }, [items]);

  const [currency, setCurrency] = useState<GlobalCurrency>('USD');
  const [selectedPayment, setSelectedPayment] = useState<GlobalPaymentMethod>('PayPal');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All (সব পণ্য)');
  const [orderedToast, setOrderedToast] = useState<string | null>(null);

  // Sell Modal
  const [showSellModal, setShowSellModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('খাবার ও মধু');
  const [newLocation, setNewLocation] = useState('London, UK / Global Shipping');
  const [newImage, setNewImage] = useState(PRESET_PRODUCT_IMAGES[0]);

  const [selectedProduct, setSelectedProduct] = useState<MarketplaceItem | null>(null);

  const showToast = (msg: string) => {
    setOrderedToast(msg);
    setTimeout(() => setOrderedToast(null), 3200);
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice.trim()) {
      showToast('দয়া করে পণ্যের নাম ও মূল্য লিখুন');
      return;
    }

    const sellerName = userProfile?.name || 'Peace Mart Global';
    const cleanPrice = newPrice.startsWith('$') || newPrice.startsWith('৳')
      ? newPrice
      : `$${newPrice}`;

    const newItem: MarketplaceItem = {
      id: `item-${Date.now()}`,
      title: newTitle.trim(),
      price: cleanPrice,
      location: newLocation,
      image: newImage,
      sellerName,
      category: newCategory,
    };

    setItems((prev) => [newItem, ...prev]);
    setShowSellModal(false);
    setNewTitle('');
    setNewPrice('');
    showToast(`🎉 "${newItem.title}" listed on Peace Mart Global!`);

    const prefs = loadPeaceSettings();
    if (prefs.creatorNotifyFollowersOnPost) {
      await broadcastCreatorNotification({
        creatorId: userProfile?.id || sellerName,
        creatorName: sellerName,
        creatorAvatar: userProfile?.avatar || '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
        contentType: 'product',
        title: `${sellerName} listed a Halal Certified product`,
        body: `${newItem.title} (${newItem.price}) - Peace Mart Global`,
        thumbnail: newItem.image,
        postId: newItem.id,
        link: '/?tab=marketplace',
        broadcastToAll: prefs.creatorSendPushToAllUsers,
        onLocalNotify: onBroadcastNotification,
      });
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewImage(url);
    }
  };

  const filtered = items.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      selectedCategory === 'All (সব পণ্য)' ||
      item.category.toLowerCase().includes(selectedCategory.split(' ')[0].toLowerCase());

    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-[740px] mx-auto min-h-screen bg-[#F0F2F5] dark:bg-[#121212] text-[#050505] dark:text-[#e4e6eb] pb-24 p-3 sm:p-4 space-y-3.5 font-sans">
      {/* Header: Peace Mart Global + Halal Certified Worldwide */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E4E6EB] dark:border-[#393a3b]/60">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-[#E4E6EB] dark:hover:bg-[#3a3b3c] text-[#050505] dark:text-white transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-xl sm:text-2xl text-[#050505] dark:text-white">
                Peace Mart Global
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Halal Certified Worldwide</span>
              </span>
            </div>
            <p className="text-xs text-[#0866FF] font-medium">
              Worldwide Halal Marketplace • PayPal, Stripe, bKash &amp; Payoneer
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSellModal(true)}
          className="px-3.5 py-1.5 rounded-full bg-[#0866FF] hover:bg-[#0055d4] text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Sell Globally</span>
        </button>
      </div>

      {/* Global Currency Switcher & Payment Methods Strip */}
      <div className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#393a3b] rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Globe className="w-4 h-4 text-[#0866FF] shrink-0" />
          <span className="text-[11px] font-bold text-[#65676B] dark:text-[#b0b3b8] mr-1">Currency:</span>
          {(['USD', 'SAR', 'BDT', 'MYR', 'TRY', 'EUR'] as GlobalCurrency[]).map((curr) => (
            <button
              key={curr}
              type="button"
              onClick={() => setCurrency(curr)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                currency === curr
                  ? 'bg-[#0866FF] text-white'
                  : 'bg-[#F0F2F5] dark:bg-[#3a3b3c] text-[#050505] dark:text-[#e4e6eb] hover:bg-[#E4E6EB]'
              }`}
            >
              {CURRENCY_CONFIG[curr].flag} {curr}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
          <CreditCard className="w-3.5 h-3.5" />
          <span>PayPal • Stripe • bKash • Payoneer</span>
        </div>
      </div>

      {/* Action Bar Categories */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#0866FF] text-white shadow-xs'
                : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] dark:bg-[#242526] dark:border dark:border-[#393a3b] dark:text-[#b0b3b8] dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search Peace Mart Global (Oud, Honey, Prayer Mat, Abaya)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#393a3b] rounded-full pl-9 pr-4 py-2 text-xs text-[#050505] dark:text-[#e4e6eb] placeholder-[#65676B] focus:outline-none focus:border-[#0866FF] shadow-xs"
        />
        <Search className="w-4 h-4 text-[#65676B] dark:text-[#b0b3b8] absolute left-3 top-2.5" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map((item) => {
          const displayPrice = convertPriceString(item.price, currency);
          return (
            <div
              key={item.id}
              onClick={() => setSelectedProduct(item)}
              className="bg-white dark:bg-[#242526] rounded-[8px] border border-[#E4E6EB] dark:border-[#393a3b] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:border-[#0866FF]/60 transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div className="aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-2 left-2 bg-emerald-600/90 backdrop-blur-sm text-[9px] font-bold text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Halal Certified</span>
                </span>
                <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
              </div>

              <div className="p-3 space-y-1">
                <p className="font-black text-sm sm:text-base text-[#050505] dark:text-white tabular-nums">
                  {displayPrice}
                </p>
                <h3 className="text-xs font-semibold text-[#050505] dark:text-[#e4e6eb] line-clamp-2 leading-tight">
                  {item.title}
                </h3>
                <p className="text-[10px] text-[#65676B] dark:text-[#b0b3b8] flex items-center gap-1 pt-0.5">
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className="truncate">{item.location} • {item.sellerName}</span>
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(item);
                  }}
                  className="w-full mt-2 py-1.5 rounded-lg bg-[#0866FF] hover:bg-[#0055d4] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Order ({currency})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PRODUCT DETAILS & GLOBAL CHECKOUT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#242526] w-full max-w-md rounded-2xl border border-[#393a3b] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="relative h-56 bg-neutral-900">
              <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Halal Certified Worldwide</span>
              </span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-black text-emerald-400 tabular-nums">
                  {convertPriceString(selectedProduct.price, currency)}{' '}
                  <span className="text-xs font-semibold text-[#b0b3b8]">({currency})</span>
                </h2>
                <span className="text-xs bg-[#3a3b3c] px-2.5 py-1 rounded-full text-white">
                  {selectedProduct.category}
                </span>
              </div>

              <h1 className="text-base font-bold text-white">{selectedProduct.title}</h1>

              <div className="text-xs text-[#b0b3b8] space-y-1">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Ships from: {selectedProduct.location}</span>
                </p>
                <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Seller: {selectedProduct.sellerName} (Halal Certified Worldwide)</span>
                </p>
              </div>

              {/* Global Checkout Payment Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-white block">
                  Select Global Payment Method:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedPayment(opt.id)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedPayment === opt.id
                          ? 'border-[#0866FF] bg-[#0866FF]/15 text-white ring-1 ring-[#0866FF]'
                          : 'border-[#393a3b] bg-[#18191a] text-[#b0b3b8] hover:text-white'
                      }`}
                    >
                      <p className="text-xs font-bold text-white">{opt.label}</p>
                      <p className="text-[9px] text-[#b0b3b8] truncate">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    showToast(
                      `Order confirmed via ${selectedPayment} (${convertPriceString(selectedProduct.price, currency)})!`
                    );
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Pay with {selectedPayment}</span>
                </button>

                <button
                  onClick={() => {
                    showToast('Seller contacted via Peaceverse Messenger!');
                    setSelectedProduct(null);
                  }}
                  className="p-2.5 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-white cursor-pointer"
                  title="Message Seller"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SELL PRODUCT MODAL */}
      {showSellModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#242526] w-full max-w-lg rounded-2xl border border-[#393a3b] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-4 py-3 border-b border-[#393a3b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#1877F2]" />
                <h3 className="font-bold text-sm text-white">List Halal Product on Peace Mart Global</h3>
              </div>
              <button onClick={() => setShowSellModal(false)} className="p-1 rounded-full text-[#b0b3b8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSellSubmit} className="p-4 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Medjool Dates / Turkish Prayer Rug..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#1877F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Price (USD or ৳) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="$24.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#1877F2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1877F2]"
                  >
                    <option value="খাবার ও মধু">খাবার ও মধু / Organic Food</option>
                    <option value="আতর ও সুগন্ধি">আতর ও সুগন্ধি / Oud</option>
                    <option value="Islamic Apparel">Islamic Apparel / Hijab</option>
                    <option value="Islamic Lifestyle">Islamic Lifestyle &amp; Mats</option>
                    <option value="ইসলামিক বই">Islamic Books</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">Location / Shipping Region</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#1877F2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">Product Photo</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <label className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-[#18191a] border border-dashed border-[#1877F2] text-[#1877F2] cursor-pointer hover:bg-[#1877F2]/10 shrink-0">
                    <Camera className="w-5 h-5" />
                    <span className="text-[8px] font-bold mt-0.5">Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                  </label>
                  {PRESET_PRODUCT_IMAGES.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Preset"
                      onClick={() => setNewImage(url)}
                      className={`w-14 h-14 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                        newImage === url ? 'border-[#1877F2] scale-105' : 'border-transparent opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSellModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#3a3b3c] text-xs font-bold text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-xs font-bold text-white shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Publish Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {orderedToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-1.5 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{orderedToast}</span>
        </div>
      )}
    </div>
  );
};
