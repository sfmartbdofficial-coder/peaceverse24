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
  Image as ImageIcon,
  Sparkles,
  MessageCircle,
  Eye
} from 'lucide-react';
import { INITIAL_MARKETPLACE } from '../../data/islamicPosts';
import { MarketplaceItem } from '../../types';

interface FbMarketplaceViewProps {
  onBack?: () => void;
}

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
  'হাইজিন ও অর্গানিক',
];

export const FbMarketplaceView: React.FC<FbMarketplaceViewProps> = ({ onBack }) => {
  const [items, setItems] = useState<MarketplaceItem[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_fb_marketplace');
      return stored ? JSON.parse(stored) : INITIAL_MARKETPLACE;
    } catch {
      return INITIAL_MARKETPLACE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('qalby_fb_marketplace', JSON.stringify(items));
    } catch {}
  }, [items]);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All (সব পণ্য)');
  const [orderedToast, setOrderedToast] = useState<string | null>(null);

  // Sell Modal
  const [showSellModal, setShowSellModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('খাবার ও মধু');
  const [newLocation, setNewLocation] = useState('Dhaka, Bangladesh');
  const [newImage, setNewImage] = useState(PRESET_PRODUCT_IMAGES[0]);

  const [selectedProduct, setSelectedProduct] = useState<MarketplaceItem | null>(null);

  const showToast = (msg: string) => {
    setOrderedToast(msg);
    setTimeout(() => setOrderedToast(null), 3000);
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice.trim()) {
      showToast('দয়া করে পণ্যের নাম ও মূল্য লিখুন');
      return;
    }

    const newItem: MarketplaceItem = {
      id: `item-${Date.now()}`,
      title: newTitle.trim(),
      price: newPrice.startsWith('৳') ? newPrice : `৳${newPrice}`,
      location: newLocation,
      image: newImage,
      sellerName: 'Sharif Hasan',
      category: newCategory,
    };

    setItems((prev) => [newItem, ...prev]);
    setShowSellModal(false);
    setNewTitle('');
    setNewPrice('');
    showToast(`🎉 "${newItem.title}" সফলভাবে লিস্টিং করা হয়েছে!`);
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
      selectedCategory === 'All (সব পণ্য)' || item.category.includes(selectedCategory.split(' ')[0]);

    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-[700px] mx-auto min-h-screen bg-[#18191a] text-[#e4e6eb] pb-24 p-3 sm:p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#393a3b]/60">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-white transition-colors"
              title="পেছনে যান (Back)"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
          )}
          <div>
            <h1 className="font-bold text-2xl text-white">Marketplace</h1>
            <p className="text-xs text-emerald-400 font-bengali">১০০% হালাল খাদ্য, আতর ও ইসলামিক পণ্য</p>
          </div>
        </div>

        {/* Big "+ Sell (পণ্য বিক্রি করুন)" Button */}
        <button
          onClick={() => setShowSellModal(true)}
          className="px-3.5 py-1.5 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>পণ্য বিক্রি করুন (Sell)</span>
        </button>
      </div>

      {/* Action Bar Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setShowSellModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#1877F2]/20 border border-[#1877F2]/40 text-[#1877F2] hover:bg-[#1877F2] hover:text-white text-xs font-bold whitespace-nowrap transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ বিক্রি করুন (Sell)</span>
        </button>

        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-[#3a3b3c] text-white'
                : 'bg-[#242526] border border-[#393a3b] text-[#b0b3b8] hover:text-white'
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
          placeholder="Marketplace-এ খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#242526] border border-[#393a3b] rounded-full pl-9 pr-4 py-2 text-xs text-[#e4e6eb] focus:outline-none focus:border-[#1877F2]"
        />
        <Search className="w-4 h-4 text-[#b0b3b8] absolute left-3 top-2.5" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedProduct(item)}
            className="bg-[#242526] rounded-2xl border border-[#393a3b] overflow-hidden shadow-sm hover:border-[#1877F2]/60 transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div className="aspect-square w-full overflow-hidden bg-neutral-800 relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white px-2 py-0.5 rounded-full">
                {item.category}
              </span>
            </div>

            <div className="p-3 space-y-1">
              <p className="font-black text-sm sm:text-base text-white">{item.price}</p>
              <h3 className="text-xs font-semibold text-[#e4e6eb] line-clamp-2 leading-tight">
                {item.title}
              </h3>
              <p className="text-[10px] text-[#b0b3b8] flex items-center gap-1 pt-0.5">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>{item.location} • {item.sellerName}</span>
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showToast(`"${item.title}" এর জন্য অর্ডার গৃহীত হয়েছে! বিক্রেতা যোগাযোগ করবেন।`);
                }}
                className="w-full mt-2 py-1.5 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>অর্ডার করুন</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#242526] w-full max-w-md rounded-2xl border border-[#393a3b] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="relative h-64 bg-neutral-900">
              <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-black text-emerald-400">{selectedProduct.price}</h2>
                <span className="text-xs bg-[#3a3b3c] px-2.5 py-1 rounded-full text-white">
                  {selectedProduct.category}
                </span>
              </div>

              <h1 className="text-base font-bold text-white">{selectedProduct.title}</h1>

              <div className="text-xs text-[#b0b3b8] space-y-1">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>অবস্থান: {selectedProduct.location}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span>বিক্রেতা: {selectedProduct.sellerName} (১০০% ভেরিফাইড হালাল সেলার)</span>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    showToast('অর্ডার গৃহীত হয়েছে! ইনবক্সে মেসেজ পাঠানো হচ্ছে...');
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>এখনই অর্ডার করুন</span>
                </button>

                <button
                  onClick={() => {
                    showToast('বিক্রেতাকে ইনবক্স করা হয়েছে');
                    setSelectedProduct(null);
                  }}
                  className="p-2.5 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-white"
                  title="মেসেজ পাঠান"
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
                <h3 className="font-bold text-sm text-white">মার্কেটপ্লেসে পণ্য বিক্রি করুন (Sell)</h3>
              </div>
              <button onClick={() => setShowSellModal(false)} className="p-1 rounded-full text-[#b0b3b8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSellSubmit} className="p-4 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  পণ্যের শিরোনাম (Title) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: খাঁটি সুন্দরবনের প্রাকৃতিক মধু (১ কেজি)..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#1877F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    মূল্য (Price) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="৳ ১২৫০"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#1877F2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">ক্যাটাগরি</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1877F2]"
                  >
                    <option value="খাবার ও মধু">খাবার ও মধু</option>
                    <option value="আতর ও সুগন্ধি">আতর ও সুগন্ধি</option>
                    <option value="পোশাক ও টুপি">পোশাক ও টুপি</option>
                    <option value="জায়নামাজ ও তসবিহ">জায়নামাজ ও তসবিহ</option>
                    <option value="ইসলামিক বই">ইসলামিক বই</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">অবস্থান (Location)</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#1877F2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">পণ্যের ছবি</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <label className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-[#18191a] border border-dashed border-[#1877F2] text-[#1877F2] cursor-pointer hover:bg-[#1877F2]/10 shrink-0">
                    <Camera className="w-5 h-5" />
                    <span className="text-[8px] font-bold mt-0.5">আপলোড</span>
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
                  className="px-4 py-2 rounded-xl bg-[#3a3b3c] text-xs font-bold text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-xs font-bold text-white shadow-lg flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>পণ্য লিস্টিং করুন</span>
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
