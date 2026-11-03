/**
 * Halal Content Filter Algorithm for Peace World
 * Enforces 100% Halal Islamic compliance, detects Quranic verses, and blocks vulgar/music/haram content.
 */

// Forbidden keyword lists in Bangla, English, and Romanized terms
export const HARAM_KEYWORDS: {
  category: string;
  keywords: string[];
  severity: 'block' | 'reject';
  message: string;
}[] = [
  {
    category: 'nudity_adult',
    keywords: [
      'nude', 'nudity', 'porn', 'xxx', 'sex', 'erotic', 'sexy', 'bikini', 'nsfw', 'adult',
      'অশ্লীল', 'নগ্ন', 'যৌন', 'পতিতা', 'জিনা', 'যৌনাচার', 'ফাহেশা', 'কামুক', 'দেহব্যবসা',
    ],
    severity: 'reject',
    message: 'নগ্নতা ও অশ্লীল কনটেন্ট Peace World-এ কঠোরভাবে নিষিদ্ধ।',
  },
  {
    category: 'music_instruments',
    keywords: [
      'guitar', 'drums', 'piano', 'rock band', 'dj remix', 'dj party', 'dance club', 'clubbing',
      'গান বাজনা', 'বাদ্যযন্ত্র', 'কনসার্ট', 'নাচ গান', 'মিউজিক ভিডিও', 'ডিজে পার্টি', 'গিটার', 'ড্রাম', 'ক্লাব সং',
    ],
    severity: 'block',
    message: 'Peace World বাদ্যযন্ত্রমুক্ত ১০০% হালাল প্ল্যাটফর্ম। গান-বাজনা প্রচার করা যাবে না।',
  },
  {
    category: 'gambling_riba',
    keywords: [
      'casino', 'gambling', 'betting', '1xbet', 'bet365', 'poker', 'jackpot', 'lottery ticket',
      'জুয়া', 'ক্যাসিনো', 'বাজি', 'লটারি', 'জুয়ার আসর', 'সুদ', 'রিবাহ',
    ],
    severity: 'reject',
    message: 'জুয়া, বাজি এবং সুদের প্রচার ইসলামে সম্পূর্ণ হারাম।',
  },
  {
    category: 'alcohol_drugs',
    keywords: [
      'alcohol', 'beer', 'vodka', 'whiskey', 'wine', 'drugs', 'weed', 'cannabis', 'meth',
      'মদ', 'গাঁজা', 'মাদক', 'ইয়াবা', 'মদের আসর', 'হেরোইন',
    ],
    severity: 'reject',
    message: 'মদ এবং মাদকদ্রব্য সম্পর্কিত কনটেন্ট নিষিদ্ধ।',
  },
  {
    category: 'hate_speech',
    keywords: [
      'কুলাঙ্গার', 'হারামজাদা', 'খানকির', 'শুয়োরের বাচ্চা', 'গালাগালি', 'স্লাট', 'বেশ্যা', 'কুফরি',
    ],
    severity: 'block',
    message: 'অশালীন ভাষা, গালিগালাজ ও অন্যের সম্মানহানি ইসলামে নিষিদ্ধ।',
  },
];

// Quranic Arabic detection regex (matches Arabic script ranges)
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;

// Key Islamic / Quranic words for tagging
const QURAN_KEYWORDS = [
  'بِسْمِ اللَّهِ', 'سُورَة', 'الْحَمْدُ لِلَّهِ', 'قُلْ هُوَ اللَّهُ', 'آية', 'القرآن',
  'কুরআন', 'সূরা', 'আয়াত', 'হাদিস', 'বুখারী', 'মুসলিম', 'মুত্তাকী', 'সালাত',
  'বিসমিল্লাহ', 'আলহামদুলিল্লাহ', 'সুবহানাল্লাহ', 'আল্লাহু আকবার',
];

export interface HalalCheckResult {
  isApproved: boolean;
  status: 'approved' | 'blocked' | 'rejected';
  reason?: string;
  category?: string;
  isQuranVerse: boolean;
  tag?: string;
  score: number;
}

/**
 * Checks if text contains Quranic Arabic verses or sacred Islamic text
 */
export function detectQuranVerse(text: string): { isQuran: boolean; tag?: string } {
  if (!text) return { isQuran: false };

  const arabicMatches = text.match(ARABIC_REGEX);
  const arabicCount = arabicMatches ? arabicMatches.length : 0;
  const isArabicSubstantial = arabicCount >= 10;

  const hasQuranWord = QURAN_KEYWORDS.some((kw) => text.includes(kw));

  if (isArabicSubstantial || (arabicCount > 5 && hasQuranWord)) {
    return {
      isQuran: true,
      tag: 'পবিত্র আয়াত',
    };
  }

  return { isQuran: false };
}

/**
 * Fast client-side keyword and pattern filter
 */
export function checkHalalLocally(
  text: string,
  mediaType?: 'image' | 'video' | 'verseCard' | 'none',
  mediaUrl?: string
): HalalCheckResult {
  const normalizedText = (text || '').toLowerCase();

  // Check each forbidden category
  for (const group of HARAM_KEYWORDS) {
    for (const kw of group.keywords) {
      if (normalizedText.includes(kw.toLowerCase())) {
        return {
          isApproved: false,
          status: group.severity === 'block' ? 'blocked' : 'rejected',
          reason: group.message,
          category: group.category,
          isQuranVerse: false,
          score: 20,
        };
      }
    }
  }

  // If video has music keywords in title/content
  if (mediaType === 'video') {
    const musicFlags = ['music', 'song', 'remix', 'dj', 'গান', 'সুর', 'মিউজিক'];
    if (musicFlags.some((m) => normalizedText.includes(m))) {
      return {
        isApproved: false,
        status: 'rejected',
        reason: 'ভিডিওটিতে বাদ্যযন্ত্র বা গান থাকার সম্ভাবনা রয়েছে, যা Peace World নীতিমালার পরিপন্থী।',
        category: 'music_instruments',
        isQuranVerse: false,
        score: 30,
      };
    }
  }

  const { isQuran, tag } = detectQuranVerse(text);

  return {
    isApproved: true,
    status: 'approved',
    isQuranVerse: isQuran,
    tag,
    score: 98,
  };
}

/**
 * Full AI-powered content moderation calling Gemini API
 */
export async function runHalalContentFilter(
  text: string,
  mediaType?: 'image' | 'video' | 'verseCard' | 'none',
  mediaUrl?: string
): Promise<HalalCheckResult> {
  // Step 1: Local fast check
  const localCheck = checkHalalLocally(text, mediaType, mediaUrl);
  if (!localCheck.isApproved) {
    return localCheck;
  }

  // Step 2: Gemini Server-side AI check
  try {
    const res = await fetch('/api/ai/moderate-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postContent: text, mediaType, mediaUrl }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.isHalal === false) {
        return {
          isApproved: false,
          status: data.score < 40 ? 'blocked' : 'rejected',
          reason: data.feedback || 'পোস্টটি ইসলামিক শালীনতা বজায় রাখতে ব্যর্থ হয়েছে।',
          isQuranVerse: localCheck.isQuranVerse,
          tag: localCheck.tag,
          score: data.score || 35,
        };
      }
    }
  } catch (err) {
    console.warn('AI moderation server fallback to local check:', err);
  }

  return localCheck;
}
