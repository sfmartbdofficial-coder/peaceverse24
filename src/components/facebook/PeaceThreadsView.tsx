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

const INITIAL_THREADS: PeaceThreadItem[] = [];

const LEGACY_DUMMY_THREAD_IDS = new Set([
  'thread-sharif-1',
  'thread-ummah-2',
  'thread-ummah-3',
]);

export const PeaceThreadsView: React.FC<PeaceThreadsViewProps> = ({ userProfile, onBack }) => {
  const [threads, setThreads] = useState<PeaceThreadItem[]>(() => {
    try {
      const saved = localStorage.getItem(THREADS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((t) => t && !LEGACY_DUMMY_THREAD_IDS.has(t.id));
        }
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
      userProfile.name && userProfile.name !== 'New Member' ? userProfile.name : 'Member';
    const handleSlug = authorName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'member';

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
      likes: 0,
      isLiked: false,
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
      userProfile.name && userProfile.name !== 'New Member' ? userProfile.name : 'Member';
    const handleSlug = authorName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'member';

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
    userProfile.name && userProfile.name !== 'New Member' ? userProfile.name : 'Member';
  const charCount = content.length;

  return (
    <div className="min-h-screen bg-white text-black pb-16">
      {/* Top Sticky Header (56px, 3-zone clean Threads header) */}
      <header className="sticky top-0 z-30 h-14 bg-white border-b border-[#E4E6EB] px-3 sm:px-6">
        <div className="max-w-2xl mx-auto h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="min-w-[44px] min-h-[44px] -ml-2 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center text-black transition-colors cursor-pointer"
              aria-label="Back to Peaceverse24.com"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                <AtSign className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight truncate whitespace-nowrap text-black">
                Peace Threads
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={focusNewThreadComposer}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Thread</span>
          </button>
        </div>
      </header>

      {/* Subtle Toast Notice */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Centered Feed + Composer Container */}
      <div className="max-w-2xl mx-auto bg-white min-h-[calc(100vh-3.5rem)] border-x border-[#E4E6EB]">
        {/* Composer Box */}
        <form
          onSubmit={handlePublishThread}
          className="p-4 sm:p-5 border-b border-[#E4E6EB] space-y-3"
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
              <div className="flex items-center justify-between gap-2 text-xs text-[#65676B]">
                <span className="font-semibold text-black truncate">
                  {displayName}
                </span>
                <span
                  className={`tabular-nums font-medium ${
                    charCount > 4700 ? 'text-amber-600' : ''
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
                className="w-full resize-y min-h-[84px] bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl p-3 text-sm text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF]"
              />

              {/* Attached Hadith Reference Preview / Editor */}
              {showHadithPanel && (
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
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
                      className="p-1 rounded-lg hover:bg-emerald-200/50 text-[#65676B] cursor-pointer"
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
                        className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100 cursor-pointer"
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
                    className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-black focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={hadithArabic}
                    onChange={(e) => setHadithArabic(e.target.value)}
                    placeholder="আরবি মূল হাদিস (ঐচ্ছিক)"
                    className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-black text-right focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Attached Quran Ayah Preview / Editor */}
              {showQuranPanel && (
                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
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
                      className="p-1 rounded-lg hover:bg-sky-200/50 text-[#65676B] cursor-pointer"
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
                        className="px-2.5 py-1 rounded-lg bg-white border border-sky-200 text-[11px] font-medium text-sky-800 hover:bg-sky-100 cursor-pointer"
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
                    className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-black focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    value={quranArabic}
                    onChange={(e) => setQuranArabic(e.target.value)}
                    placeholder="আরবি আয়াত লিখুন (ঐচ্ছিক)"
                    className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-black text-right focus:outline-none focus:border-sky-500"
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
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'bg-[#F0F2F5] border-[#E4E6EB] text-black hover:bg-[#E4E6EB]'
                    }`}
                  >
                    <ScrollText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Add Hadith Reference</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQuranPanel((v) => !v)}
                    className={`min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                      showQuranPanel
                        ? 'bg-sky-50 border-sky-500 text-sky-700'
                        : 'bg-[#F0F2F5] border-[#E4E6EB] text-black hover:bg-[#E4E6EB]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-sky-600" />
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
        <div className="px-4 py-2.5 border-b border-[#E4E6EB] flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#F0F2F5] rounded-xl">
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
                    ? 'bg-white text-black shadow-2xs'
                    : 'text-[#65676B] hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-[#65676B] whitespace-nowrap">
            নো অ্যাডস · হালাল ফিড
          </span>
        </div>

        {/* Threads Stream */}
        <div className="divide-y divide-[#E4E6EB]">
          {filteredThreads.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-2">
              <p className="text-sm font-semibold text-black">
                এই ক্যাটাগরিতে এখনো কোনো থ্রেড নেই
              </p>
              <p className="text-xs text-[#65676B]">
                উপরের বক্স থেকে প্রথম হালাল থ্রেডটি পোস্ট করুন।
              </p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const showReplies = openReplyThreadId === thread.id;
              return (
                <article
                  key={thread.id}
                  className="p-4 sm:p-5 hover:bg-[#F0F2F5]/40 transition-colors"
                >
                  <div className="flex gap-3">
                    {/* Left Avatar + Vertical Thread Line */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[#0866FF] text-white font-bold text-sm flex items-center justify-center overflow-hidden">
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
                        <div className="w-0.5 flex-1 bg-[#E4E6EB] mt-2 rounded-full" />
                      )}
                    </div>

                    {/* Right Thread Content */}
                    <div className="flex-1 min-w-0 space-y-2.5">
                      {/* Clean unboxed metadata header */}
                      <div className="flex items-center gap-1.5 text-xs text-[#65676B] min-w-0">
                        <span className="text-sm font-bold text-black truncate">
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
                        <p className="text-[15px] leading-relaxed text-black whitespace-pre-wrap">
                          {thread.content}
                        </p>
                      )}

                      {/* Attached Hadith Reference Block */}
                      {(thread.hadithRef || thread.hadithArabic) && (
                        <div className="p-3 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] space-y-1.5">
                          {thread.hadithArabic && (
                            <p
                              dir="rtl"
                              className="text-base font-bold leading-loose text-black text-right font-serif"
                            >
                              {thread.hadithArabic}
                            </p>
                          )}
                          {thread.hadithRef && (
                            <p className="text-xs font-semibold text-emerald-700">
                              রেফারেন্স: {thread.hadithRef}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Attached Quran Ayah Block */}
                      {(thread.quranRef || thread.quranArabic) && (
                        <div className="p-3 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] space-y-1.5">
                          {thread.quranArabic && (
                            <p
                              dir="rtl"
                              className="text-base font-bold leading-loose text-black text-right font-serif"
                            >
                              {thread.quranArabic}
                            </p>
                          )}
                          {thread.quranRef && (
                            <p className="text-xs font-semibold text-[#0866FF]">
                              কুরআন: {thread.quranRef}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Thread Action Buttons */}
                      <div className="flex items-center justify-between pt-1 max-w-sm text-[#65676B]">
                        <button
                          type="button"
                          onClick={() => toggleLike(thread.id)}
                          className={`min-h-[40px] px-2 -ml-2 rounded-lg flex items-center gap-1.5 text-xs font-medium tabular-nums cursor-pointer transition-colors ${
                            thread.isLiked
                              ? 'text-rose-600'
                              : 'hover:text-rose-600'
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
                              ? 'text-emerald-600'
                              : 'hover:text-emerald-600'
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
                              className="p-2.5 rounded-xl bg-[#F0F2F5] text-xs space-y-1"
                            >
                              <div className="flex items-center gap-1.5 text-[#65676B]">
                                <span className="font-bold text-black">
                                  {rep.authorName}
                                </span>
                                <span>{rep.authorHandle}</span>
                                <span aria-hidden="true">·</span>
                                <span>{rep.timeAgo}</span>
                              </div>
                              <p className="text-black leading-relaxed">
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
                                className="flex-1 bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-[#0866FF]"
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
