import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Heart,
  PenLine,
  Search,
  Share2,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useHistoryBack } from '../../utils/backNavigation';
import { sanitizeInput } from '../../utils/security';

export interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  coverImage: string;
  likes: number;
}

const INITIAL_BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'blog-peaceverse24-welcome',
    title: 'PeaceVerse24 - শান্তি, ভালোবাসা আর পজিটিভ কমিউনিটি',
    excerpt:
      'PeaceVerse24 হলো শান্তি আর ভালোবাসার কমিউনিটি। জানুন কেন নিরাপদ ও পজিটিভ সোশ্যাল নেটওয়ার্ক আজ সবার জন্য প্রয়োজন।',
    content: [
      'আজকের ডিজিটাল দুনিয়ায় নেতিবাচকতা, গুজব এবং অপ্রয়োজনীয় কোলাহল থেকে দূরে থেকে একটি পরিচ্ছন্ন ও শান্তিময় জায়গার প্রয়োজনীয়তা আমরা সবাই অনুভব করি। সেই চিন্তা থেকেই জন্ম হয়েছে PeaceVerse24 (peaceverse24.com)-এর।',
      'PeaceVerse24 হলো এমন একটি প্ল্যাটফর্ম যেখানে আপনি নির্ভয়ে আপনার মনের ভালো কথা শেয়ার করতে পারবেন, ভালো মানুষের সাথে নতুন বন্ধুত্ব গড়ে তুলতে পারবেন এবং প্রতিদিন পজিটিভ ও অনুপ্রেরণামূলক কনটেন্ট দেখতে পারবেন।',
      'আমাদের লক্ষ্য হলো বিশ্বের প্রতিটি প্রান্তের মানুষ যেন পরিবার ও বন্ধুদের সাথে নিরাপদ, সম্মানজনক এবং ভালোবাসাপূর্ণ পরিবেশে যুক্ত থাকতে পারেন। আসুন, একসাথে গড়ে তুলি একটি শান্তির পৃথিবী।',
    ],
    category: 'কমিউনিটি',
    author: 'PeaceVerse24 Editorial',
    publishedAt: '২০ নভেম্বর, ২০২৬',
    readTime: '৩ মিনিট পড়া',
    coverImage:
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1000&q=80',
    likes: 128,
  },
  {
    id: 'blog-positive-mindset',
    title: 'প্রতিদিন পজিটিভ থাকার ও মানসিক শান্তি বজায় রাখার ৫টি সহজ অভ্যাস',
    excerpt:
      'ছোট ছোট ইতিবাচক পরিবর্তন কীভাবে আমাদের দৈনন্দিন জীবনকে আরও প্রশান্তিময় ও সুন্দর করে তোলে তা জানুন।',
    content: [
      '১. কৃতজ্ঞতা প্রকাশ করা: প্রতিদিন সকালে ঘুম থেকে উঠে এবং রাতে ঘুমানোর আগে অন্তত তিনটি বিষয়ের জন্য শুকরিয়া আদায় করুন। এতে মনে গভীর প্রশান্তি আসে।',
      '২. ভালো কথা বলা ও লেখা: সোশ্যাল মিডিয়ায় বা বাস্তব জীবনে এমন কিছু শেয়ার করুন যা অন্যের মুখে হাসি ফোটায় বা কাউকে সাহস দেয়।',
      '৩. ইতিবাচক বন্ধুদের সাথে সময় কাটানো: ভালো সঙ্গ আপনার চিন্তাধারাকে সুন্দর করে। PeaceVerse24-এ এমন সব গ্রুপ ও মানুষের সাথে যুক্ত হোন যারা ভালো কাজে উৎসাহ দেয়।',
      '৪. নিয়মিত বিরতি ও নামাজ/ধ্যান: কাজের ফাঁকে মনকে শান্ত করতে নিয়মিত প্রার্থনা ও নিজেকে একটু নীরব সময় দিন।',
      '৫. ক্ষমা ও ভালোবাসা: ছোটখাটো ভুল ভুলে গিয়ে মানুষের প্রতি সহানুভূতিশীল থাকলে নিজের মনই সবচেয়ে বেশি হালকা থাকে।',
    ],
    category: 'মানসিক শান্তি',
    author: 'সাদিয়া ইসলাম',
    publishedAt: '১৮ নভেম্বর, ২০২৬',
    readTime: '৪ মিনিট পড়া',
    coverImage:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    likes: 94,
  },
  {
    id: 'blog-meaningful-friendship',
    title: 'অনলাইনে সুস্থ ও অর্থপূর্ণ বন্ধুত্ব গড়ার উপায়',
    excerpt:
      'নতুন বন্ধু বানানো এবং অনলাইনে পারস্পরিক শ্রদ্ধা ও আস্থার সম্পর্ক তৈরি করার কার্যকর পরামর্শ।',
    content: [
      'সত্যিকারের বন্ধুত্ব দূরত্ব মানে না। সঠিক কমিউনিটিতে থাকলে পৃথিবীর যেকোনো প্রান্ত থেকেই চমৎকার বন্ধু পাওয়া সম্ভব যারা আপনার ভালো সময়ে পাশে থাকবে এবং বিপদে সাহস জোগাবে।',
      'শালীনতা, সততা এবং একে অপরের মতামতের প্রতি সম্মান—এই তিনটি বিষয় মেনে চললেই প্রতিটি ডিজিটাল সম্পর্ক সুন্দর ও দীর্ঘস্থায়ী হয়।',
      'PeaceVerse24-এ আজই আপনার পছন্দের কমিউনিটি ও গ্রুপগুলোতে যুক্ত হোন এবং সুস্থ চিন্তার মানুষের সাথে পরিচিত হোন।',
    ],
    category: 'বন্ধুত্ব',
    author: 'তারেক রহমান',
    publishedAt: '১৫ নভেম্বর, ২০২৬',
    readTime: '৩ মিনিট পড়া',
    coverImage:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80',
    likes: 76,
  },
];

interface FbBlogViewProps {
  onBack: () => void;
  authorName?: string;
}

const BLOG_STORAGE_KEY = 'peaceverse_blog_articles_v1';

export const FbBlogView: React.FC<FbBlogViewProps> = ({
  onBack,
  authorName = 'PeaceVerse Member',
}) => {
  const [articles, setArticles] = useState<BlogArticle[]>(() => {
    try {
      const saved = localStorage.getItem(BLOG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_BLOG_ARTICLES;
  });

  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('সব');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [showWriteModal, setShowWriteModal] = useState(false);

  // Compose state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('কমিউনিটি');
  const [newContent, setNewContent] = useState('');
  const [shareToast, setShareToast] = useState<string | null>(null);

  useHistoryBack(Boolean(selectedArticle), () => setSelectedArticle(null), 'blog-article');
  useHistoryBack(showWriteModal, () => setShowWriteModal(false), 'blog-compose');

  useEffect(() => {
    try {
      localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(articles));
    } catch {}
  }, [articles]);

  const categories = ['সব', 'কমিউনিটি', 'মানসিক শান্তি', 'বন্ধুত্ব', 'গল্প'];

  const filteredArticles = articles.filter((art) => {
    const matchCategory = selectedCategory === 'সব' || art.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      art.title.toLowerCase().includes(q) ||
      art.excerpt.toLowerCase().includes(q) ||
      art.author.toLowerCase().includes(q);
    return matchCategory && matchQuery;
  });

  const handleToggleLike = (articleId: string) => {
    const currentlyLiked = Boolean(likedIds[articleId]);
    setLikedIds((prev) => ({ ...prev, [articleId]: !currentlyLiked }));
    setArticles((prev) =>
      prev.map((a) =>
        a.id === articleId ? { ...a, likes: Math.max(0, a.likes + (currentlyLiked ? -1 : 1)) } : a
      )
    );
    if (selectedArticle?.id === articleId) {
      setSelectedArticle((prev) =>
        prev ? { ...prev, likes: Math.max(0, prev.likes + (currentlyLiked ? -1 : 1)) } : prev
      );
    }
  };

  const handlePublishArticle = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeInput(newTitle.trim());
    const cleanBody = sanitizeInput(newContent.trim());
    if (!cleanTitle || !cleanBody) return;

    const paragraphs = cleanBody
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    const created: BlogArticle = {
      id: `blog-${Date.now()}`,
      title: cleanTitle,
      excerpt: paragraphs[0]?.slice(0, 140) || cleanBody.slice(0, 140),
      content: paragraphs.length > 0 ? paragraphs : [cleanBody],
      category: newCategory,
      author: sanitizeInput(authorName),
      publishedAt: 'আজ',
      readTime: '২ মিনিট পড়া',
      coverImage:
        'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1000&q=80',
      likes: 1,
    };

    setArticles((prev) => [created, ...prev]);
    setNewTitle('');
    setNewContent('');
    setShowWriteModal(false);
  };

  const handleShare = async (article: BlogArticle) => {
    const shareUrl = `${window.location.origin}/blog`;
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, text: article.excerpt, url: shareUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setShareToast('ব্লগ লিংক কপি হয়েছে!');
      setTimeout(() => setShareToast(null), 2500);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black pb-14">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E4E6EB] px-3 sm:px-4 h-14 flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => {
              if (selectedArticle) {
                setSelectedArticle(null);
              } else {
                onBack();
              }
            }}
            className="w-9 h-9 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] flex items-center justify-center text-black cursor-pointer shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-extrabold text-[17px] text-black truncate leading-tight">
              PeaceVerse24 Blog
            </h1>
            <p className="text-[11px] text-[#65676B] truncate">
              শান্তি, ভালোবাসা ও পজিটিভ গল্প
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowWriteModal(true)}
          className="px-3 py-1.5 rounded-full bg-[#0866FF] hover:bg-[#166FE5] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <PenLine className="w-3.5 h-3.5" />
          <span>লিখুন</span>
        </button>
      </header>

      {shareToast && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg">
          {shareToast}
        </div>
      )}

      <div className="max-w-[720px] mx-auto px-3 sm:px-4 pt-4">
        {selectedArticle ? (
          /* Single Article Reader View */
          <article className="bg-white rounded-2xl border border-[#E4E6EB] overflow-hidden shadow-xs animate-in fade-in">
            <img
              src={selectedArticle.coverImage}
              alt={selectedArticle.title}
              className="w-full h-52 sm:h-64 object-cover"
            />
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#65676B]">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                  {selectedArticle.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedArticle.publishedAt}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedArticle.readTime}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-black leading-snug">
                {selectedArticle.title}
              </h2>

              <div className="flex items-center gap-2 text-xs font-semibold text-[#65676B] pb-2 border-b border-[#E4E6EB]">
                <User className="w-4 h-4 text-[#0866FF]" />
                <span>{selectedArticle.author}</span>
              </div>

              <div className="space-y-3 text-[15px] leading-relaxed text-[#1C1E21]">
                {selectedArticle.content.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              <div className="pt-4 border-t border-[#E4E6EB] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleLike(selectedArticle.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    likedIds[selectedArticle.id]
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-[#F0F2F5] text-black hover:bg-[#E4E6EB]'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${likedIds[selectedArticle.id] ? 'fill-rose-600' : ''}`}
                  />
                  <span>ভালো লেগেছে ({selectedArticle.likes})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShare(selectedArticle)}
                  className="px-4 py-2 rounded-xl bg-[#E7F3FF] hover:bg-[#D8EAFE] text-[#0866FF] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>শেয়ার করুন</span>
                </button>
              </div>
            </div>
          </article>
        ) : (
          /* Blog Index List */
          <div className="space-y-4">
            {/* Search + Category Filter */}
            <div className="bg-white rounded-2xl border border-[#E4E6EB] p-3.5 space-y-3 shadow-2xs">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#65676B] absolute left-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ব্লগ খুঁজুন (যেমন: PeaceVerse24, শান্তি, বন্ধুত্ব)..."
                  className="w-full bg-[#F0F2F5] rounded-full pl-9 pr-4 py-2 text-xs text-black placeholder-[#65676B] focus:outline-none focus:ring-2 focus:ring-[#0866FF]/30"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#0866FF] text-white'
                        : 'bg-[#F0F2F5] text-[#65676B] hover:text-black'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles Feed */}
            {filteredArticles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E4E6EB] p-8 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-[#65676B] mx-auto" />
                <p className="text-sm font-bold text-black">কোনো ব্লগ লেখা পাওয়া যায়নি</p>
                <p className="text-xs text-[#65676B]">অন্য কিছু লিখে খুঁজুন অথবা নতুন একটি পজিটিভ লেখা প্রকাশ করুন।</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="bg-white rounded-2xl border border-[#E4E6EB] overflow-hidden shadow-2xs hover:shadow-md transition-shadow cursor-pointer flex flex-col sm:flex-row"
                  >
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full sm:w-44 h-44 sm:h-auto object-cover shrink-0"
                    />
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                            {article.category}
                          </span>
                          <span className="text-[#65676B]">{article.readTime}</span>
                        </div>
                        <h3 className="font-extrabold text-[16px] text-black leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-xs text-[#65676B] line-clamp-2">{article.excerpt}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#65676B] pt-1 border-t border-[#F0F2F5]">
                        <span>{article.author} • {article.publishedAt}</span>
                        <span className="text-[#0866FF] font-bold">পড়ুন →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Write Blog Post Modal */}
      {showWriteModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setShowWriteModal(false)}
        >
          <div
            className="bg-white border border-[#E4E6EB] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0866FF]" />
                <h3 className="font-bold text-sm text-black">নতুন পজিটিভ ব্লগ লিখুন</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWriteModal(false)}
                className="p-1 rounded-full hover:bg-[#F0F2F5] text-[#65676B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishArticle} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-black mb-1">শিরোনাম</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="আপনার লেখার শিরোনাম..."
                  className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl text-xs text-black focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">ক্যাটাগরি</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl text-xs text-black focus:outline-none focus:border-[#0866FF]"
                >
                  <option value="কমিউনিটি">কমিউনিটি</option>
                  <option value="মানসিক শান্তি">মানসিক শান্তি</option>
                  <option value="বন্ধুত্ব">বন্ধুত্ব</option>
                  <option value="গল্প">গল্প</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">মূল লেখা</label>
                <textarea
                  rows={5}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="শান্তি, ভালোবাসা ও ইতিবাচক চিন্তার কথা লিখুন..."
                  className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl text-xs text-black focus:outline-none focus:border-[#0866FF] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#166FE5] text-white font-bold text-xs cursor-pointer"
              >
                প্রকাশ করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
