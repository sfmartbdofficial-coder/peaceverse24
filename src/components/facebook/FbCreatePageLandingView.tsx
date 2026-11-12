import React, { useState } from 'react';
import {
  ArrowLeft,
  X,
  Flag,
  Globe,
  Phone,
  Mail,
  MapPin,
  Camera,
  Plus,
  Trash2,
  Check,
  ShoppingBag,
  Sparkles,
  BookOpen,
  Utensils,
  GraduationCap,
  Briefcase,
  Tv,
  Heart,
  Info,
  User,
} from 'lucide-react';
import { PageItem } from '../../types';

interface FbCreatePageLandingViewProps {
  onBack: () => void;
  onPageCreated: (newPage: PageItem) => void;
}

interface WebsiteEntry {
  id: string;
  type: 'website' | 'shop' | 'youtube' | 'facebook' | 'instagram' | 'whatsapp' | 'other';
  label: string;
  url: string;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=400&q=80', // Retail/Shop
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80', // Halal Food/Kitchen
  'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=400&q=80', // Islamic/Mosque
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', // Digital Creator
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80', // Education/Academy
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80', // Business/Agency
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80', // Shop cover
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', // Restaurant cover
  'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80', // Islamic cover
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80', // Nature/Creator cover
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80', // Education cover
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80', // Modern Office cover
];

const CATEGORIES_OPTIONS = [
  {
    name: 'Shopping & Retail • কেনাকাটা ও রিটেইল',
    short: 'Shopping & retail',
    icon: ShoppingBag,
    color: 'from-amber-500 to-orange-600',
  },
  {
    name: 'Digital Creator • ডিজিটাল ক্রিয়েটর',
    short: 'Digital creator',
    icon: Sparkles,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'Food & Restaurant • খাবার ও রেস্তোরাঁ',
    short: 'Food & Restaurant',
    icon: Utensils,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Islamic Organization • দ্বীনি ও সমাজসেবা',
    short: 'Islamic organization',
    icon: BookOpen,
    color: 'from-emerald-600 to-green-700',
  },
  {
    name: 'Education & Coaching • শিক্ষা ও একাডেমি',
    short: 'Education',
    icon: GraduationCap,
    color: 'from-sky-500 to-blue-700',
  },
  {
    name: 'Business & Agency • ব্যবসা ও কোম্পানি',
    short: 'Business & Consulting',
    icon: Briefcase,
    color: 'from-purple-500 to-violet-700',
  },
  {
    name: 'Media & News • মিডিয়া ও সংবাদ',
    short: 'Media & news',
    icon: Tv,
    color: 'from-rose-500 to-pink-700',
  },
  {
    name: 'Health & Beauty • স্বাস্থ্য ও রূপচর্চা',
    short: 'Health & beauty',
    icon: Heart,
    color: 'from-pink-500 to-rose-600',
  },
];

const ACTION_BUTTON_OPTIONS = [
  { id: 'Start Order', label: 'Start Order (অর্ডার শুরু করুন)', icon: '🛍️' },
  { id: 'Send Message', label: 'Send Message (মেসেজ পাঠান)', icon: '💬' },
  { id: 'WhatsApp', label: 'Send WhatsApp Message (হোয়াটসঅ্যাপ)', icon: '📱' },
  { id: 'Call Now', label: 'Call Now (সরাসরি কল করুন)', icon: '📞' },
  { id: 'Visit Website', label: 'Visit Website (ওয়েবসাইট দেখুন)', icon: '🌐' },
  { id: 'Shop Now', label: 'Shop Now (কেনাকাটা করুন)', icon: '🛒' },
];

export const FbCreatePageLandingView: React.FC<FbCreatePageLandingViewProps> = ({
  onBack,
  onPageCreated,
}) => {
  // Option selection matching Screenshot 4 ("Which option is best for you?")
  const [creationOption, setCreationOption] = useState<'page' | 'profile'>('page');

  // Core Page Information
  const [pageName, setPageName] = useState('');
  const [category, setCategory] = useState(CATEGORIES_OPTIONS[0].name);
  const [customCategory, setCustomCategory] = useState('');
  const [bio, setBio] = useState('');

  // Contact Information
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka, Bangladesh');
  const [zipCode, setZipCode] = useState('');

  // Dynamic Multiple Websites (User explicitly asked: "ওয়েবসাইট অপশনে চার পাঁচটা ওয়েবসাইট এড করতে পারবি")
  const [websites, setWebsites] = useState<WebsiteEntry[]>([
    {
      id: 'w-1',
      type: 'website',
      label: 'প্রধান ওয়েবসাইট (Main Website)',
      url: '',
    },
    {
      id: 'w-2',
      type: 'shop',
      label: 'অনলাইন শপ / স্টোর (Online Shop)',
      url: '',
    },
  ]);

  // Visuals
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [selectedCover, setSelectedCover] = useState(PRESET_COVERS[0]);

  // Primary Action Button
  const [actionButton, setActionButton] = useState('Start Order');

  // Validation & Loading state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper: Add another website input
  const handleAddWebsite = () => {
    if (websites.length >= 8) return;
    const newId = `w-${Date.now()}`;
    setWebsites((prev) => [
      ...prev,
      {
        id: newId,
        type: 'website',
        label: `ওয়েবসাইট / লিংক #${prev.length + 1}`,
        url: '',
      },
    ]);
  };

  // Helper: Remove website entry
  const handleRemoveWebsite = (id: string) => {
    if (websites.length <= 1) {
      setWebsites([{ id: 'w-1', type: 'website', label: 'প্রধান ওয়েবসাইট', url: '' }]);
      return;
    }
    setWebsites((prev) => prev.filter((w) => w.id !== id));
  };

  // Helper: Update website field
  const handleUpdateWebsite = (id: string, url: string, type?: WebsiteEntry['type']) => {
    setWebsites((prev) =>
      prev.map((w) => (w.id === id ? { ...w, url, ...(type ? { type } : {}) } : w))
    );
  };

  // Helper: Image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (target === 'avatar') setSelectedAvatar(reader.result);
        else setSelectedCover(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Final Form Submit Handler
  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageName.trim()) {
      setValidationError('দয়া করে পেজের একটি নাম লিখুন (Page Name is required)');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    // Filter valid non-empty website URLs
    const validWebsites = websites
      .map((w) => w.url.trim())
      .filter((url) => url.length > 0);

    const finalCategory = customCategory.trim() || category;

    const newPage: PageItem = {
      id: `page-${Date.now()}`,
      name: pageName.trim(),
      category: finalCategory,
      likes: '১ লাইক',
      followersCount: 1,
      avatar: selectedAvatar,
      cover: selectedCover,
      role: 'Admin',
      isOwner: true,
      isLiked: true,
      description: bio.trim() || `${pageName.trim()} - অফিসিয়াল Peaceverse24 পেজ।`,
      bio: bio.trim() || 'Welcome to our official Peaceverse24 Page.',
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      website: validWebsites[0] || undefined,
      websites: validWebsites.length > 0 ? validWebsites : undefined,
      location: [address.trim(), city.trim(), zipCode.trim()].filter(Boolean).join(', ') || 'Dhaka, Bangladesh',
      actionButton: actionButton,
      rating: '5.0 ★ (New Page)',
      createdAt: 'এখনই',
    };

    // Save to local storage
    try {
      const stored = localStorage.getItem('qalby_fb_pages');
      const existing: PageItem[] = stored ? JSON.parse(stored) : [];
      const updated = [newPage, ...existing];
      localStorage.setItem('qalby_fb_pages', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save page to storage', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onPageCreated(newPage);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#18191a] text-neutral-900 dark:text-[#E4E6EB] pb-32 font-sans select-none">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#242526] border-b border-neutral-200 dark:border-[#393a3b] shadow-xs px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-[#3a3b3c] text-neutral-700 dark:text-[#E4E6EB] transition-colors cursor-pointer"
            title="ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-tight">
              Create Peaceverse24 Page
            </h1>
            <p className="text-[11px] text-neutral-500 dark:text-[#B0B3B8]">
              আপনার Peaceverse24 পেজ তৈরি করুন
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-[#3a3b3c] text-neutral-500 hover:text-neutral-800 dark:text-[#B0B3B8] transition-colors cursor-pointer"
          title="বাতিল করুন"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* 2. WHICH OPTION IS BEST FOR YOU? */}
        <section className="bg-white dark:bg-[#242526] rounded-2xl border border-neutral-200 dark:border-[#393a3b] p-4 sm:p-5 shadow-xs space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white">
            Which option is best for you?
          </h2>
          <p className="text-xs text-neutral-500 dark:text-[#B0B3B8]">
            আপনার প্রয়োজন অনুযায়ী সঠিক অপশনটি বেছে নিন:
          </p>

          <div className="space-y-2.5 pt-1">
            {/* Card 1: Create a new Peaceverse24 Page */}
            <div
              onClick={() => setCreationOption('page')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                creationOption === 'page'
                  ? 'border-[#0866FF] bg-blue-50/60 dark:bg-blue-950/20 shadow-xs'
                  : 'border-neutral-200 dark:border-[#393a3b] hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-full bg-neutral-200 dark:bg-[#3a3b3c] flex items-center justify-center text-neutral-800 dark:text-neutral-100 shrink-0 mt-0.5">
                  <Flag className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                    Create a new Peaceverse24 Page
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-[#B0B3B8] leading-relaxed mt-0.5">
                    Start fresh with a new name, separate audience and professional tools on Peaceverse24.
                  </p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-[#0866FF]/10 text-[#0866FF] text-[11px] font-bold">
                    সুপারিশকৃত (Recommended)
                  </span>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                  creationOption === 'page'
                    ? 'border-[#0866FF] bg-[#0866FF]'
                    : 'border-neutral-400 bg-white dark:bg-transparent'
                }`}
              >
                {creationOption === 'page' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>

            {/* Card 2: Use your existing profile */}
            <div
              onClick={() => setCreationOption('profile')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                creationOption === 'profile'
                  ? 'border-[#0866FF] bg-blue-50/60 dark:bg-blue-950/20 shadow-xs'
                  : 'border-neutral-200 dark:border-[#393a3b] hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-full bg-neutral-200 dark:bg-[#3a3b3c] flex items-center justify-center text-neutral-800 dark:text-neutral-100 shrink-0 mt-0.5">
                  <User className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                    Use your existing profile
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-[#B0B3B8] leading-relaxed mt-0.5">
                    Turn on professional mode to add tools to your main profile and continue growing your current audience.
                  </p>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                  creationOption === 'profile'
                    ? 'border-[#0866FF] bg-[#0866FF]'
                    : 'border-neutral-400 bg-white dark:bg-transparent'
                }`}
              >
                {creationOption === 'profile' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
          </div>
        </section>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <Info className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* 4. MAIN FORM: SINGLE LANDING PAGE WITH LARGE SPACIOUS INPUTS */}
        <form onSubmit={handleSavePage} className="space-y-4">
          {/* SECTION 1: GENERAL INFO */}
          <div className="bg-white dark:bg-[#242526] rounded-2xl border border-neutral-200 dark:border-[#393a3b] p-4 sm:p-5 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 dark:border-[#393a3b] pb-2">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0866FF] text-white flex items-center justify-center text-xs">
                  ১
                </span>
                <span>সাধারণ তথ্য (General Info)</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-[#B0B3B8] mt-0.5">
                আপনার পেজের নাম ও মূল পরিচিতি দিন
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mb-1.5">
                পেজের নাম (Page Name) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                placeholder="যেমন: হালাল ফুড কিচেন / SF MART BD / ইসলামিক আলো..."
                className="w-full text-sm sm:text-base px-4 py-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191a] border-2 border-neutral-200 dark:border-[#3a3b3c] focus:border-[#0866FF] focus:bg-white dark:focus:bg-[#242526] text-neutral-900 dark:text-white placeholder-neutral-400 outline-none transition-all shadow-inner"
              />
              <p className="text-[11px] text-neutral-500 dark:text-[#B0B3B8] mt-1.5 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#0866FF] shrink-0" />
                <span>আপনার ব্যবসা, ব্র্যান্ড, ব্যক্তিত্ব বা প্রতিষ্ঠানের আসল নাম ব্যবহার করুন।</span>
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mb-2">
                ক্যাটাগরি নির্বাচন করুন (Category) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CATEGORIES_OPTIONS.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'border-[#0866FF] bg-[#0866FF]/10 text-[#0866FF] font-bold shadow-xs ring-1 ring-[#0866FF]'
                          : 'border-neutral-200 dark:border-[#393a3b] hover:bg-neutral-50 dark:hover:bg-[#3a3b3c] text-neutral-800 dark:text-[#E4E6EB]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white bg-gradient-to-tr ${cat.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs truncate">{cat.name}</span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#0866FF] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="অন্য কোনো ক্যাটাগরি থাকলে এখানে লিখুন (ঐচ্ছিক)..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#18191a] border border-neutral-200 dark:border-[#3a3b3c] text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-[#0866FF]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                  বায়ো বা সংক্ষিপ্ত বিবরণ (Bio / Description)
                </label>
                <span className="text-[11px] text-neutral-400">{bio.length}/255</span>
              </div>
              <textarea
                rows={3}
                maxLength={255}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="পেজ সম্পর্কে কিছু লিখুন... যেমন আপনাদের সেবা, লক্ষ্য, সততা ও কার্যক্রম সম্পর্কে যা দেখে ফলোয়াররা আকৃষ্ট হবে।"
                className="w-full text-xs sm:text-sm p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191a] border-2 border-neutral-200 dark:border-[#3a3b3c] focus:border-[#0866FF] focus:bg-white dark:focus:bg-[#242526] text-neutral-900 dark:text-white placeholder-neutral-400 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* SECTION 2: CONTACT DETAILS */}
          <div className="bg-white dark:bg-[#242526] rounded-2xl border border-neutral-200 dark:border-[#393a3b] p-4 sm:p-5 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 dark:border-[#393a3b] pb-2">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0866FF] text-white flex items-center justify-center text-xs">
                  ২
                </span>
                <span>যোগাযোগের তথ্য (Contact Information)</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-[#B0B3B8] mt-0.5">
                কাস্টমার ও ফলোয়ারদের সহজে যোগাযোগের মাধ্যম
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-900 dark:text-white mb-1.5">
                  ফোন বা হোয়াটসঅ্যাপ নম্বর (Phone / WhatsApp)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-neutral-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1711-234567"
                    className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-3 rounded-xl bg-neutral-50 dark:bg-[#18191a] border border-neutral-200 dark:border-[#3a3b3c] focus:border-[#0866FF] text-neutral-900 dark:text-white placeholder-neutral-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-900 dark:text-white mb-1.5">
                  ইমেইল ঠিকানা (Email Address)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-neutral-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@yourbusiness.com"
                    className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-3 rounded-xl bg-neutral-50 dark:bg-[#18191a] border border-neutral-200 dark:border-[#3a3b3c] focus:border-[#0866FF] text-neutral-900 dark:text-white placeholder-neutral-400 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-900 dark:text-white mb-1.5">
                  রাস্তা বা এলাকার ঠিকানা (Street Address)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-neutral-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="হাউস নং, রোড নং, এলাকা (যেমন মিরপুর-১০)"
                    className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-3 rounded-xl bg-neutral-50 dark:bg-[#18191a] border border-neutral-200 dark:border-[#3a3b3c] focus:border-[#0866FF] text-neutral-900 dark:text-white placeholder-neutral-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-900 dark:text-white mb-1.5">
                  শহর / জেলা (City)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Dhaka, Bangladesh"
                  className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl bg-neutral-50 dark:bg-[#18191a] border border-neutral-200 dark:border-[#3a3b3c] focus:border-[#0866FF] text-neutral-900 dark:text-white placeholder-neutral-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: MULTIPLE WEBSITES & SOCIAL LINKS (৪-৫টি ওয়েবসাইট ও লিংক) */}
          <div className="bg-white dark:bg-[#242526] rounded-2xl border border-neutral-200 dark:border-[#393a3b] p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#393a3b] pb-2">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0866FF] text-white flex items-center justify-center text-xs">
                    ৩
                  </span>
                  <span>ওয়েবসাইট ও সোশ্যাল লিংকসমূহ (Websites & Links)</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-[#B0B3B8] mt-0.5">
                  এখানে আপনি ৪-৫টি বা তার বেশি ওয়েবসাইট, ইউটিউব, শপ বা সোশ্যাল লিংক যুক্ত করতে পারবেন
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-[#0866FF]">
                {websites.length}টি লিংক
              </span>
            </div>

            <div className="space-y-3">
              {websites.map((site, index) => (
                <div
                  key={site.id}
                  className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191a] border border-neutral-200 dark:border-[#3a3b3c] space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-700 dark:text-[#E4E6EB]">
                        লিংক #{index + 1}:
                      </span>
                      <select
                        value={site.type}
                        onChange={(e) =>
                          handleUpdateWebsite(site.id, site.url, e.target.value as any)
                        }
                        className="text-xs font-semibold bg-white dark:bg-[#242526] border border-neutral-200 dark:border-[#393a3b] rounded-lg px-2 py-1 text-neutral-800 dark:text-white outline-none cursor-pointer"
                      >
                        <option value="website">🌐 ওয়েবসাইট (Website)</option>
                        <option value="shop">🛍️ অনলাইন শপ (Shop / Store)</option>
                        <option value="youtube">▶️ ইউটিউব চ্যানেল (YouTube)</option>
                        <option value="facebook">👥 ফেসবুক পেজ / আইডি</option>
                        <option value="instagram">📸 ইনস্টাগ্রাম (Instagram)</option>
                        <option value="whatsapp">💬 হোয়াটসঅ্যাপ ক্যাটালগ</option>
                        <option value="other">🔗 অন্যান্য লিংক (Other)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveWebsite(site.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="লিংকটি মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-neutral-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={site.url}
                      onChange={(e) => handleUpdateWebsite(site.id, e.target.value)}
                      placeholder="https://www.yoursite.com বা আপনার পেজ লিংক..."
                      className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-[#242526] border border-neutral-200 dark:border-[#3a3b3c] focus:border-[#0866FF] text-neutral-900 dark:text-white placeholder-neutral-400 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddWebsite}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-[#0866FF]/40 hover:border-[#0866FF] bg-[#0866FF]/5 hover:bg-[#0866FF]/10 text-[#0866FF] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ আরেকটি ওয়েবসাইট বা সোশ্যাল লিংক যোগ করুন (+ Add Another Link)</span>
            </button>
          </div>

          {/* SECTION 4: VISUALS */}
          <div className="bg-white dark:bg-[#242526] rounded-2xl border border-neutral-200 dark:border-[#393a3b] p-4 sm:p-5 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 dark:border-[#393a3b] pb-2">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0866FF] text-white flex items-center justify-center text-xs">
                  ৪
                </span>
                <span>ছবি ও ব্র্যান্ডিং (Photos & Branding)</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-[#B0B3B8] mt-0.5">
                আপনার পেজের লোগো ও আকর্ষনীয় কভার ফটো নির্ধারণ করুন
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mb-2">
                প্রোফাইল ছবি / লোগো (Profile Picture / Logo)
              </label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#0866FF] shadow-md shrink-0 bg-neutral-900">
                  <img
                    src={selectedAvatar}
                    alt="Selected Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-1.5">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#3a3b3c] hover:bg-neutral-200 text-xs font-bold text-neutral-800 dark:text-white cursor-pointer transition-colors shadow-xs">
                    <Camera className="w-4 h-4 text-[#0866FF]" />
                    <span>ফোন বা কম্পিউটার থেকে ছবি আপলোড করুন</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'avatar')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-neutral-400">
                    অথবা নিচের প্রস্তুতকৃত লোগোগুলো থেকে যেকোনো একটি বেছে নিন:
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2.5 pb-1">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-transform cursor-pointer ${
                      selectedAvatar === av
                        ? 'border-[#0866FF] ring-2 ring-[#0866FF]/40 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={av} alt="Preset Avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mb-2">
                কভার ফটো (Cover Photo)
              </label>
              <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-neutral-300 dark:border-[#3a3b3c] shadow-xs">
                <img
                  src={selectedCover}
                  alt="Selected Cover"
                  className="w-full h-full object-cover"
                />
                <label className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 cursor-pointer transition-all shadow-md">
                  <Camera className="w-3.5 h-3.5" />
                  <span>কভার পরিবর্তন</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'cover')}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2.5">
                {PRESET_COVERS.map((cv, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedCover(cv)}
                    className={`h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedCover === cv
                        ? 'border-[#0866FF] ring-2 ring-[#0866FF]/40 scale-102'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={cv} alt="Preset Cover" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 5: ACTION BUTTON */}
          <div className="bg-white dark:bg-[#242526] rounded-2xl border border-neutral-200 dark:border-[#393a3b] p-4 sm:p-5 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 dark:border-[#393a3b] pb-2">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0866FF] text-white flex items-center justify-center text-xs">
                  ৫
                </span>
                <span>অ্যাকশন বাটন নির্বাচন (Action Button)</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-[#B0B3B8] mt-0.5">
                ভিজিটররা আপনার পেজে ঢুকেই কোন বাটনটি দেখতে পাবে (যেমন SF MART BD পেজে &quot;Start Order&quot;)
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ACTION_BUTTON_OPTIONS.map((btn) => {
                const isSelected = actionButton === btn.id;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setActionButton(btn.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-[#0866FF] bg-[#0866FF]/10 text-[#0866FF] font-bold shadow-xs ring-1 ring-[#0866FF]'
                        : 'border-neutral-200 dark:border-[#393a3b] hover:bg-neutral-50 dark:hover:bg-[#3a3b3c] text-neutral-800 dark:text-[#E4E6EB]'
                    }`}
                  >
                    <span className="text-xl">{btn.icon}</span>
                    <span className="text-xs font-bold">{btn.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BOTTOM SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#0866FF] hover:bg-[#1877F2] active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-base shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Flag className="w-5 h-5 fill-current" />
              <span>
                {isSubmitting
                  ? 'পেজটি তৈরি ও সংরক্ষণ হচ্ছে...'
                  : 'Save & Create Page (পেজ তৈরি ও সংরক্ষণ করুন)'}
              </span>
            </button>
            <p className="text-[11px] text-center text-neutral-500 dark:text-[#B0B3B8] mt-2">
              পেজ তৈরি করার পর আপনি পেজের সকল অ্যাডমিন সুবিধা ও রিলস/পোস্ট করতে পারবেন।
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
