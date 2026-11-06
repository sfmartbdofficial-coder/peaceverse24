/**
 * FINAL CONTENT MODERATION CODE FOR PeaceVerse24
 * Completely replaces old code per user specification.
 */

export const BLOCK_WORDS = [
  // ১. নেশা - এগুলা থাকলেই ব্লক
  "মদ খাও", "বিয়ার খাও", "গাঁজা খাও", "ইয়াবা", "হেরোইন", "ফেন্সিডিল", "মদ বিক্রি", "গাঁজা বিক্রি", "নেশা করো",

  // ২. নগ্নতা ও পর্ন - এগুলা থাকলেই ব্লক
  "নগ্ন ছবি", "উলঙ্গ", "পর্ন", "xxx", "sex video", "অশ্লীল ভিডিও", "যৌন ভিডিও",

  // ৩. সহিংসতা
  "খুন করব", "মেরে ফেলব", "আত্মহত্যা করো", "বোমা বানাও", "জঙ্গি হও",

  // ৪. ধর্ম নিয়ে গালি
  "ইসলাম খারাপ", "নবীকে গালি", "কুরআনকে গালি", "আল্লাহকে গালি"
];

export const ALLOW_ALWAYS = [
  // এগুলা থাকলে কখনোই ব্লক করবে না, যত যাই হোক
  "গান", "বাদ্যযন্ত্র", "বাউল", "লালন", "গজল", "তেলাওয়াত", "ওয়াজ", "হারমোনিয়াম", "ঢোল", "গিটার",
  "পরিবার", "ভালোবাসা", "দোয়া", "দোয়া", "শিক্ষণীয় গল্প", "ইসলামিক", "Alhamdulillah", "PeaceVerse24", "FirstPost", "বন্ধু", "গল্প", "ছবি"
];

export interface HalalCheckResult {
  isApproved: boolean;
  status: 'approved' | 'blocked' | 'rejected';
  reason?: string;
  category?: string;
  isQuranVerse?: boolean;
  tag?: string;
  score: number;
}

/**
 * Main Check Function per User Specification:
 * Step 1: যদি ALLOW_ALWAYS এর কোনো শব্দ থাকে, সাথে সাথে ALLOW
 * Step 2: শুধু BLOCK_WORDS 100% মিললে ব্লক
 * Step 3: বাকি সব ALLOW
 */
export function checkPost(text: string): HalalCheckResult {
  const normalizedText = (text || '').toLowerCase();

  // Step 1: যদি ALLOW_ALWAYS এর কোনো শব্দ থাকে, সাথে সাথে ALLOW
  const hasAllowAlways = ALLOW_ALWAYS.some((word) => normalizedText.includes(word.toLowerCase()));
  if (hasAllowAlways) {
    return {
      isApproved: true,
      status: 'approved',
      score: 100,
    };
  }

  // Step 2: শুধু BLOCK_WORDS 100% মিললে ব্লক
  const matchedBlocked = BLOCK_WORDS.find((phrase) => normalizedText.includes(phrase.toLowerCase()));
  if (matchedBlocked) {
    return {
      isApproved: false,
      status: 'blocked',
      reason: 'দুঃখিত, এই পোস্টে নিষিদ্ধ কনটেন্ট আছে',
      score: 0,
    };
  }

  // Step 3: বাকি সব ALLOW
  return {
    isApproved: true,
    status: 'approved',
    score: 100,
  };
}

// Backward-compatible alias for existing imports
export function checkHalalLocally(
  text: string,
  _mediaType?: string,
  _mediaUrl?: string
): HalalCheckResult {
  return checkPost(text);
}

export async function runHalalContentFilter(
  text: string,
  _mediaType?: string,
  _mediaUrl?: string
): Promise<HalalCheckResult> {
  return checkPost(text);
}
