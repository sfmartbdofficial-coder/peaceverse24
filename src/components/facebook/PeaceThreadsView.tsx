import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  BookOpen,
  ScrollText,
  Send,
  ShieldCheck,
  Check,
  X,
  AtSign,
} from 'lucide-react';
import { UserProfile } from '../../types';

export interface PeaceThreadItem {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  verified: boolean;
  timeAgo: string;
  content: string;
  hadithRef?: string;
  hadithArabic?: string;
  quranRef?: string;
  quranArabic?: string;
  likes: number;
  isLiked?: boolean;
  reposts: number;
  isReposted?: boolean;
  isSaved?: boolean;
  replies: {
    id: string;
    authorName: string;
    authorHandle: string;
    text: string;
    timeAgo: string;
  }[];
}

interface PeaceThreadsViewProps {
  userProfile: UserProfile;
  onBack: () => void;
}

const THREADS_STORAGE_KEY = 'peaceverse_threads_v1';
const MAX_THREAD_CHARS = 5000;

const HADITH_PRESETS = [
  {
    ref: 'সহীহ বুখারী, হাদিস: ১ (কিতাবুল ওহী)',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    text: 'নিশ্চয়ই সকল আমল নিয়তের ওপর নির্ভরশীল, আর প্রত্যেক ব্যক্তি তাই পাবে যা সে নিয়ত করবে।',
  },
  {
    ref: 'সহীহ মুসলিম, হাদিস: ৪৫',
    arabic: 'الدِّينُ النَّصِيحَةُ',
    text: 'দ্বীন হলো কল্যাণকামিতা (নসিহত ও আন্তরিকতা)।',
  },
  {
    ref: 'জামে তিরমিজি, হাদিস: ১৯৮৭',
    arabic: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ',
    text: 'তুমি যেখানেই থাকো আল্লাহকে ভয় করো এবং মন্দের পর পরই ভালো কাজ করো, তাহলে তা মন্দকে মুছে দেবে।',
  },
];

const QURAN_PRESETS = [
  {
    ref: 'সূরা আল-ইনশিরাহ (৯৪:৬)',
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    text: 'নিশ্চয়ই কষ্টের সাথেই রয়েছে স্বস্তি।',
  },
  {
    ref: 'সূরা আল-বাকারা (২:১৫২)',
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    text: 'অতএব তোমরা আমাকে স্মরণ করো, আমিও তোমাদের স্মরণ করবো এবং আমার কৃতজ্ঞতা প্রকাশ করো।',
  },
  {
    ref: 'সূরা আল-আসর (১০৩:১-৩)',
    arabic: 'وَالْعَصْرِ ۝ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ',
    text: 'সময়ের কসম! নিশ্চয়ই মানুষ ক্ষতির মধ্যে নিমজ্জিত, তবে তারা ছাড়া যারা ঈমান এনেছে ও সৎকর্ম করেছে।',
  },
];

const INITIAL_THREADS: PeaceThreadItem[] = [
  {
    id: 'thread-sharif-1',
    authorName: 'Sharif Hasan',
    authorHandle: '@sharifhasan',
    verified: true,
    timeAgo: '১২ মিনিট আগে',
    content:
      'প্রতিটি কাজের শুরুতে আমাদের নিয়ত পরিশুদ্ধ করা খুব জরুরি। দুনিয়ার ব্যস্ততার মাঝেও যদি নিয়ত আল্লাহর সন্তুষ্টির জন্য হয়, তবে সাধারণ কাজও ইবাদতে পরিণত হয়। আসুন আজ থেকেই খাঁটি নিয়তে সব ভালো কাজ শুরু করি।',
    hadithRef: 'সহীহ বুখারী, হাদিস নং: ১ • কিতাবুল ওহী',
    hadithArabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    likes: 48,
    reposts: 14,
    replies: [
      {
        id: 'rep-1',
        authorName: 'Abdullah Al Mamun',
        authorHandle: '@mamun_bd',
        text: 'সুবহানাল্লাহ, অত্যন্ত সুন্দর ও সময়োপযোগী স্মরণ করিয়ে দেওয়া।',
        timeAgo: '৬ মিনিট আগে',
      },
    ],
  },
  {
    id: 'thread-ummah-2',
    authorName: 'Umar Faruq',
    authorHandle: '@umar_dawah',
    verified: true,
    timeAgo: '৪৫ মিনিট আগে',
    content:
      'কঠিন সময়ে হতাশ না হয়ে আল্লাহর ওপর তাওয়াক্কুল রাখা মুমিনের অন্যতম বড় শক্তি। প্রতিটি পরীক্ষার পেছনেই আল্লাহর অপার হিকমত ও কল্যাণ লুকিয়ে থাকে।',
    quranRef: 'সূরা আল-ইনশিরাহ (৯৪:৬)',
    quranArabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    likes: 72,
    reposts: 21,
    replies: [],
  },
  {
    id: 'thread-ummah-3',
    authorName: 'Fatema Tuz Zohra',
    authorHandle: '@fatema_notes',
    verified: false,
    timeAgo: '২ ঘণ্টা আগে',
    content:
      'সোশ্যাল মিডিয়ায় আমরা যে শব্দগুলো লিখি তাও আমাদের আমলনামায় লিপিবদ্ধ হচ্ছে। তাই আসুন কটূক্তি বা গিবত নয়—সত্য, সুন্দর ও কল্যাণকর কথা দিয়ে অনলাইন অঙ্গনকে আলোকিত করি।',
    hadithRef: 'সহীহ বুখারী, হাদিস: ৬৪৭৫',
    hadithArabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    likes: 39,
    reposts: 9,
    replies: [],
  },
];

export const PeaceThreadsView: React.FC<PeaceThreadsViewProps> = ({ userProfile, onBack }) => {
  const [threads, setThreads] = useState<PeaceThreadItem[]>(() => {
    try {
      const saved = localStorage.getItem(THREADS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to initial threads
    }
    return INITIAL_THREADS;
  });

  // Composer state
  const [content, setContent] = useState('');
  const [showHadithPanel, setShowHadithPanel] = useState(false);
  const [hadithRef, setHadithRef] = useState('');
  const [hadithArabic, setHadithArabic] = useState('');
  const [showQuranPanel, setShowQuranPanel] = useState(false);
  const [quranRef, setQuranRef] = useState('');
  const [quranArabic, setQuranArabic] = useState('');

  // Feed filter & reply state
  const [activeFilter, setActiveFilter] = useState<'all' | 'hadith' | 'saved'>('all');
  const [openReplyThreadId, setOpenReplyThreadId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
    } catch {
      // Ignore storage quota issues
    }
  }, [threads]);

  const showNotice = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const focusNewThreadComposer = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 150);
  };

  const handlePublishThread = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed && !hadithRef.trim() && !quranRef.trim()) {
      showNotice('অনুগ্রহ করে থ্রেডে কিছু লিখুন');
      textareaRef.current?.focus();
      return;
    }

    const authorName =
      userProfile.name && userProfile.name !== 'New Member' ? userProfile.name : 'Sharif Hasan';
    const handleSlug = authorName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'sharifhasan';

    const newThread: PeaceThreadItem = {
      id: `thread-${Date.now()}`,
      authorName,
      authorHandle: `@${handleSlug}`,
      authorAvatar: userProfile.avatar,
      verified: true,
      timeAgo: 'এইমাত্র',
      content: trimmed,
      hadithRef: hadithRef.trim() || undefined,
      hadithArabic: hadithArabic.trim() || undefined,
      quranRef: quranRef.trim() || undefined,
      quranArabic: quranArabic.trim() || undefined,
      likes: 1,
      isLiked: true,
      reposts: 0,
      replies: [],
    };

    setThreads((prev) => [newThread, ...prev]);
    setContent('');
    setHadithRef('');
    setHadithArabic('');
    setQuranRef('');
    setQuranArabic('');
    setShowHadithPanel(false);
    setShowQuranPanel(false);
    showNotice('আপনার থ্রেড সফলভাবে প্রকাশিত হয়েছে');
  };

  const toggleLike = (id: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isLiked: !t.isLiked,
              likes: Math.max(0, t.likes + (t.isLiked ? -1 : 1)),
            }
          : t
      )
    );
  };

  const toggleRepost = (id: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isReposted: !t.isReposted,
              reposts: Math.max(0, t.reposts + (t.isReposted ? -1 : 1)),
            }
          : t
      )
    );
  };

  const toggleSave = (id: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isSaved: !t.isSaved } : t))
    );
  };

  const handleSubmitReply = (threadId: string) => {
    const text = (replyDrafts[threadId] || '').trim();
    if (!text) return;
    const authorName =
      userProfile.name && userProfile.name !== 'New Member' ? userProfile.name : 'Sharif Hasan';
    const handleSlug = authorName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'sharifhasan';

    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              replies: [
                ...t.replies,
                {
                  id: `rep-${Date.now()}`,
                  authorName,
                  authorHandle: `@${handleSlug}`,
                  text,
                  timeAgo: 'এইমাত্র',
                },
              ],
            }
          : t
      )
    );
    setReplyDrafts((prev) => ({ ...prev, [threadId]: '' }));
  };

  const filteredThreads = threads.filter((t) => {
    if (activeFilter === 'hadith') return Boolean(t.hadithRef || t.quranRef);
    if (activeFilter === 'saved') return Boolean(t.isSaved);
    return true;
  });

  const displayName =
    userProfile.name && userProfile.name !== 'New Member' ? userProfile.name : 'Sharif Hasan';
  const charCount = content.length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0C10] text-neutral-900 dark:text-neutral-100 pb-16">
      {/* Top Sticky Header (56px, 3-zone clean Threads header) */}
      <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-[#12141B]/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-3 sm:px-6">
        <div className="max-w-2xl mx-auto h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="min-w-[44px] min-h-[44px] -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
              aria-label="Back to Peaceverse"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shrink-0">
                <AtSign className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight truncate whitespace-nowrap">
                Peace Threads
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={focusNewThreadComposer}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Thread</span>
          </button>
        </div>
      </header>

      {/* Subtle Toast Notice */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Centered Feed + Composer Container */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-[#12141B] min-h-[calc(100vh-3.5rem)] border-x border-neutral-200/80 dark:border-neutral-800">
        {/* Composer Box */}
        <form
          onSubmit={handlePublishThread}
          className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 space-y-3"
        >
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#0866FF] text-white font-bold text-sm flex items-center justify-center overflow-hidden shrink-0">
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{displayName.slice(0, 2).toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-semibold text-neutral-900 dark:text-white truncate">
                  {displayName}
                </span>
                <span
                  className={`tabular-nums font-medium ${
                    charCount > 4700 ? 'text-amber-600 dark:text-amber-400' : ''
                  }`}
                >
                  {charCount} / {MAX_THREAD_CHARS}
                </span>
              </div>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_THREAD_CHARS))}
                maxLength={MAX_THREAD_CHARS}
                rows={3}
                placeholder="সংক্ষিপ্ত মতামত, হাদিস বা দ্বীনি চিন্তা লিখুন... (সর্বোচ্চ ৫০০০ অক্ষর)"
                className="w-full resize-y min-h-[84px] bg-neutral-50 dark:bg-[#191C26] border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-[#0866FF]"
              />

              {/* Attached Hadith Reference Preview / Editor */}
              {showHadithPanel && (
                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <ScrollText className="w-3.5 h-3.5" />
                      <span>হাদিসের রেফারেন্স যুক্ত করুন</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowHadithPanel(false);
                        setHadithRef('');
                        setHadithArabic('');
                      }}
                      className="p-1 rounded-lg hover:bg-emerald-200/50 dark:hover:bg-emerald-900 text-neutral-500 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick Hadith Presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {HADITH_PRESETS.map((preset) => (
                      <button
                        key={preset.ref}
                        type="button"
                        onClick={() => {
                          setHadithRef(preset.ref);
                          setHadithArabic(preset.arabic);
                          if (!content.trim()) setContent(preset.text);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#12141B] border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer"
                      >
                        {preset.ref.split('(')[0].trim()}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={hadithRef}
                    onChange={(e) => setHadithRef(e.target.value)}
                    placeholder="উদা: সহীহ বুখারী, হাদিস নং: ১"
                    className="w-full bg-white dark:bg-[#12141B] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={hadithArabic}
                    onChange={(e) => setHadithArabic(e.target.value)}
                    placeholder="আরবি মূল হাদিস (ঐচ্ছিক)"
                    className="w-full bg-white dark:bg-[#12141B] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-right focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Attached Quran Ayah Preview / Editor */}
              {showQuranPanel && (
                <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/25 border border-sky-200 dark:border-sky-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>কুরআনের আয়াত যুক্ত করুন</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuranPanel(false);
                        setQuranRef('');
                        setQuranArabic('');
                      }}
                      className="p-1 rounded-lg hover:bg-sky-200/50 dark:hover:bg-sky-900 text-neutral-500 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick Quran Presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {QURAN_PRESETS.map((preset) => (
                      <button
                        key={preset.ref}
                        type="button"
                        onClick={() => {
                          setQuranRef(preset.ref);
                          setQuranArabic(preset.arabic);
                          if (!content.trim()) setContent(preset.text);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#12141B] border border-sky-200 dark:border-sky-800 text-[11px] font-medium text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/40 cursor-pointer"
                      >
                        {preset.ref}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={quranRef}
                    onChange={(e) => setQuranRef(e.target.value)}
                    placeholder="উদা: সূরা আল-ইনশিরাহ (৯৪:৬)"
                    className="w-full bg-white dark:bg-[#12141B] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={quranArabic}
                    onChange={(e) => setQuranArabic(e.target.value)}
                    placeholder="আরবি আয়াত লিখুন (ঐচ্ছিক)"
                    className="w-full bg-white dark:bg-[#12141B] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-right focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}

              {/* Composer Toolbar: Add Hadith Reference, Add Quran Ayah, Post */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHadithPanel((v) => !v)}
                    className={`min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                      showHadithPanel
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-neutral-50 dark:bg-[#191C26] border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <ScrollText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Add Hadith Reference</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQuranPanel((v) => !v)}
                    className={`min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                      showQuranPanel
                        ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-700 dark:text-sky-300'
                        : 'bg-neutral-50 dark:bg-[#191C26] border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Add Quran Ayah</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="min-h-[40px] px-5 py-2 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Segmented Filter Tabs */}
        <div className="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-[#191C26] rounded-xl">
            {[
              { id: 'all' as const, label: 'সব থ্রেড' },
              { id: 'hadith' as const, label: 'হাদিস ও কুরআন' },
              { id: 'saved' as const, label: 'সেভড' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeFilter === tab.id
                    ? 'bg-white dark:bg-[#242836] text-neutral-900 dark:text-white shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
            নো অ্যাডস · হালাল ফিড
          </span>
        </div>

        {/* Threads Stream */}
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {filteredThreads.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-2">
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                এই ক্যাটাগরিতে এখনো কোনো থ্রেড নেই
              </p>
              <p className="text-xs text-neutral-500">
                উপরের বক্স থেকে প্রথম হালাল থ্রেডটি পোস্ট করুন।
              </p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const showReplies = openReplyThreadId === thread.id;
              return (
                <article
                  key={thread.id}
                  className="p-4 sm:p-5 hover:bg-neutral-50/70 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex gap-3">
                    {/* Left Avatar + Vertical Thread Line */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-neutral-800 text-white font-bold text-sm flex items-center justify-center overflow-hidden">
                        {thread.authorAvatar ? (
                          <img
                            src={thread.authorAvatar}
                            alt={thread.authorName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{thread.authorName.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      {thread.replies.length > 0 && (
                        <div className="w-0.5 flex-1 bg-neutral-200 dark:bg-neutral-800 mt-2 rounded-full" />
                      )}
                    </div>

                    {/* Right Thread Content */}
                    <div className="flex-1 min-w-0 space-y-2.5">
                      {/* Clean unboxed metadata header */}
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 min-w-0">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                          {thread.authorName}
                        </span>
                        {thread.verified && (
                          <ShieldCheck
                            className="w-3.5 h-3.5 text-[#0866FF] shrink-0"
                            aria-label="Verified"
                          />
                        )}
                        <span className="truncate">{thread.authorHandle}</span>
                        <span aria-hidden="true">·</span>
                        <span className="whitespace-nowrap">{thread.timeAgo}</span>
                      </div>

                      {/* Body text */}
                      {thread.content && (
                        <p className="text-[15px] leading-relaxed text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap">
                          {thread.content}
                        </p>
                      )}

                      {/* Attached Hadith Reference Block */}
                      {(thread.hadithRef || thread.hadithArabic) && (
                        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#191C26] border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                          {thread.hadithArabic && (
                            <p
                              dir="rtl"
                              className="text-base font-bold leading-loose text-neutral-900 dark:text-emerald-300 text-right font-serif"
                            >
                              {thread.hadithArabic}
                            </p>
                          )}
                          {thread.hadithRef && (
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              রেফারেন্স: {thread.hadithRef}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Attached Quran Ayah Block */}
                      {(thread.quranRef || thread.quranArabic) && (
                        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#191C26] border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                          {thread.quranArabic && (
                            <p
                              dir="rtl"
                              className="text-base font-bold leading-loose text-neutral-900 dark:text-sky-300 text-right font-serif"
                            >
                              {thread.quranArabic}
                            </p>
                          )}
                          {thread.quranRef && (
                            <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                              কুরআন: {thread.quranRef}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Thread Action Buttons */}
                      <div className="flex items-center justify-between pt-1 max-w-sm text-neutral-500 dark:text-neutral-400">
                        <button
                          type="button"
                          onClick={() => toggleLike(thread.id)}
                          className={`min-h-[40px] px-2 -ml-2 rounded-lg flex items-center gap-1.5 text-xs font-medium tabular-nums cursor-pointer transition-colors ${
                            thread.isLiked
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'hover:text-rose-600 dark:hover:text-rose-400'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${thread.isLiked ? 'fill-current' : ''}`} />
                          <span>{thread.likes}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setOpenReplyThreadId((prev) => (prev === thread.id ? null : thread.id))
                          }
                          className="min-h-[40px] px-2 rounded-lg flex items-center gap-1.5 text-xs font-medium tabular-nums hover:text-[#0866FF] cursor-pointer transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{thread.replies.length}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleRepost(thread.id)}
                          className={`min-h-[40px] px-2 rounded-lg flex items-center gap-1.5 text-xs font-medium tabular-nums cursor-pointer transition-colors ${
                            thread.isReposted
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'hover:text-emerald-600 dark:hover:text-emerald-400'
                          }`}
                        >
                          <Repeat2 className="w-4 h-4" />
                          <span>{thread.reposts}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleSave(thread.id)}
                          className={`min-h-[40px] px-2 rounded-lg flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors ${
                            thread.isSaved
                              ? 'text-[#0866FF]'
                              : 'hover:text-[#0866FF]'
                          }`}
                          aria-label="Save thread"
                        >
                          <Bookmark className={`w-4 h-4 ${thread.isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Replies Thread List & Inline Reply Input */}
                      {(showReplies || thread.replies.length > 0) && (
                        <div className="space-y-2 pt-1">
                          {thread.replies.map((rep) => (
                            <div
                              key={rep.id}
                              className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#191C26] text-xs space-y-1"
                            >
                              <div className="flex items-center gap-1.5 text-neutral-500">
                                <span className="font-bold text-neutral-900 dark:text-white">
                                  {rep.authorName}
                                </span>
                                <span>{rep.authorHandle}</span>
                                <span aria-hidden="true">·</span>
                                <span>{rep.timeAgo}</span>
                              </div>
                              <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                                {rep.text}
                              </p>
                            </div>
                          ))}

                          {showReplies && (
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                value={replyDrafts[thread.id] || ''}
                                onChange={(e) =>
                                  setReplyDrafts((prev) => ({
                                    ...prev,
                                    [thread.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSubmitReply(thread.id);
                                  }
                                }}
                                placeholder="মন্তব্য লিখুন..."
                                className="flex-1 bg-neutral-50 dark:bg-[#191C26] border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0866FF]"
                              />
                              <button
                                type="button"
                                onClick={() => handleSubmitReply(thread.id)}
                                className="min-h-[36px] px-3.5 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold cursor-pointer"
                              >
                                Reply
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
