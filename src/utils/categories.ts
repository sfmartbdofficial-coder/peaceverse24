export interface CategoryOptionItem {
  value: string;
  labelBn: string;
  labelEn: string;
}

/**
 * Facebook-standard Page Categories (English + Bangla)
 */
export const FACEBOOK_PAGE_CATEGORIES: CategoryOptionItem[] = [
  { value: 'Digital Creator (ডিজিটাল ক্রিয়েটর)', labelBn: 'ডিজিটাল ক্রিয়েটর', labelEn: 'Digital Creator' },
  { value: 'Public Figure (পাবলিক ফিগার)', labelBn: 'পাবলিক ফিগার / ব্যক্তিত্ব', labelEn: 'Public Figure' },
  { value: 'Shopping & Retail (শপিং ও রিটেইল)', labelBn: 'শপিং ও রিটেইল / হালাল শপ', labelEn: 'Shopping & Retail' },
  { value: 'Entrepreneur & Business (ব্যবসা ও উদ্যোক্তা)', labelBn: 'ব্যবসা ও উদ্যোক্তা', labelEn: 'Entrepreneur & Business' },
  { value: 'Education & Academy (শিক্ষা ও একাডেমি)', labelBn: 'শিক্ষা ও একাডেমি', labelEn: 'Education' },
  { value: 'Media & News Company (মিডিয়া ও নিউজ)', labelBn: 'মিডিয়া ও সংবাদ প্রকাশনা', labelEn: 'Media / News Company' },
  { value: 'Video & Entertainment (ভিডিও ও বিনোদন)', labelBn: 'ভিডিও ও বিনোদন ক্রিয়েটর', labelEn: 'Entertainment / Video Creator' },
  { value: 'Food & Restaurant (খাবার ও রেস্তোরাঁ)', labelBn: 'খাবার ও রেস্তোরাঁ', labelEn: 'Food & Beverage / Restaurant' },
  { value: 'Community Organization (কমিউনিটি সংগঠন)', labelBn: 'কমিউনিটি ও সমাজ সংগঠন', labelEn: 'Community Organization' },
  { value: 'Religious & Islamic Center (ধর্মীয় ও ইসলামিক প্রতিষ্ঠান)', labelBn: 'মসজিদ ও ইসলামিক প্রতিষ্ঠান', labelEn: 'Religious / Islamic Organization' },
  { value: 'Nonprofit & Charity (চ্যারিটি ও সেবা)', labelBn: 'অলাভজনক ও চ্যারিটি সংস্থা', labelEn: 'Nonprofit Organization' },
  { value: 'Health & Wellness (স্বাস্থ্য ও সুস্থতা)', labelBn: 'স্বাস্থ্য ও সুস্থতা', labelEn: 'Health & Wellness' },
  { value: 'Personal Blog (পার্সোনাল ব্লগ)', labelBn: 'পার্সোনাল ব্লগ', labelEn: 'Personal Blog' },
  { value: 'Local Business & Service (লোকাল বিজনেস)', labelBn: 'লোকাল বিজনেস ও সার্ভিস', labelEn: 'Local Business / Service' },
];

/**
 * Mail ID / Personal Profile Categories (প্রোফাইল / মেইল আইডি ক্যাটাগরি)
 */
export const PROFILE_ACCOUNT_CATEGORIES: CategoryOptionItem[] = [
  { value: 'Personal Account (সাধারণ প্রোফাইল)', labelBn: 'সাধারণ প্রোফাইল', labelEn: 'Personal Account' },
  { value: 'Digital Creator (ডিজিটাল ক্রিয়েটর)', labelBn: 'ডিজিটাল ক্রিয়েটর', labelEn: 'Digital Creator' },
  { value: 'Public Figure (পাবলিক ফিগার)', labelBn: 'পাবলিক ফিগার', labelEn: 'Public Figure' },
  { value: 'Entrepreneur (উদ্যোক্তা ও ব্যবসায়ী)', labelBn: 'উদ্যোক্তা ও ব্যবসায়ী', labelEn: 'Entrepreneur' },
  { value: 'Blogger & Writer (ব্লগার ও লেখক)', labelBn: 'ব্লগার ও লেখক', labelEn: 'Blogger / Writer' },
  { value: 'Teacher & Educator (শিক্ষক ও প্রশিক্ষক)', labelBn: 'শিক্ষক ও প্রশিক্ষক', labelEn: 'Educator' },
  { value: 'Artist & Content Creator (শিল্পী ও কন্টেন্ট নির্মাতা)', labelBn: 'শিল্পী ও কন্টেন্ট নির্মাতা', labelEn: 'Artist / Creator' },
  { value: 'Media & Journalist (মিডিয়া ও সাংবাদিক)', labelBn: 'সাংবাদিক ও মিডিয়া', labelEn: 'Media / Journalist' },
  { value: 'Community Leader (সমাজসেবক)', labelBn: 'সমাজসেবক', labelEn: 'Community Leader' },
  { value: 'Islamic Speaker (ইসলামিক আলোচক)', labelBn: 'ইসলামিক আলোচক', labelEn: 'Islamic Speaker' },
  { value: 'Business Owner (দোকান ও ব্যবসা মালিক)', labelBn: 'দোকান ও ব্যবসা মালিক', labelEn: 'Business Owner' },
  { value: 'Student (শিক্ষার্থী)', labelBn: 'শিক্ষার্থী', labelEn: 'Student' },
];
