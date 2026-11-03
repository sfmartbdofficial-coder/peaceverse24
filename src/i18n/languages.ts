export type SupportedLanguage =
  | 'bn'
  | 'en'
  | 'ar'
  | 'ur'
  | 'hi'
  | 'id'
  | 'tr'
  | 'fr'
  | 'es'
  | 'pt'
  | 'de'
  | 'ru'
  | 'fa'
  | 'ms'
  | 'sw'
  | 'zh'
  | 'ja'
  | 'it';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  country: string;
  countryCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', dir: 'ltr', country: 'বাংলাদেশ / পশ্চিমবঙ্গ (Bangladesh)', countryCode: 'BD' },
  { code: 'en', name: 'English', nativeName: 'English (US/UK/Global)', flag: '🌐', dir: 'ltr', country: 'International / USA / UK / Canada', countryCode: 'US' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl', country: 'المملكة العربية السعودية / العالم العربي (22 دول)', countryCode: 'SA' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl', country: 'پاکستان (Pakistan)', countryCode: 'PK' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr', country: 'भारत (India)', countryCode: 'IN' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr', country: 'Indonesia', countryCode: 'ID' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', dir: 'ltr', country: 'Malaysia / Brunei / Singapore', countryCode: 'MY' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr', country: 'Türkiye / Azerbaycan', countryCode: 'TR' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr', country: 'France / Sénégal / Belgique / Canada (29+ pays)', countryCode: 'FR' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr', country: 'España / México / Colombia / Argentina (21 países)', countryCode: 'ES' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', dir: 'ltr', country: 'Brasil / Portugal / Angola / Moçambique', countryCode: 'BR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr', country: 'Deutschland / Österreich / Schweiz', countryCode: 'DE' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr', country: 'Россия / Казахстан / Узбекистан / СНГ', countryCode: 'RU' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', dir: 'rtl', country: 'ایران / افغانستان / تاجیکستان', countryCode: 'IR' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', dir: 'ltr', country: 'Kenya / Tanzania / Uganda (East Africa)', countryCode: 'KE' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (简体)', flag: '🇨🇳', dir: 'ltr', country: '中国 / 台湾 / 新加坡 (China / Diaspora)', countryCode: 'CN' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr', country: '日本 (Japan)', countryCode: 'JP' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr', country: 'Italia / Svizzera', countryCode: 'IT' },
];

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  navHome: string;
  navWatch: string;
  navFriends: string;
  navMarketplace: string;
  navNotifications: string;
  navMenu: string;
  whatsOnYourMind: string;
  post: string;
  story: string;
  reel: string;
  live: string;
  searchPlaceholder: string;
  like: string;
  comment: string;
  share: string;
  saved: string;
  pages: string;
  groups: string;
  memories: string;
  professionalDashboard: string;
  monetization: string;
  creatorStudio: string;
  earnings: string;
  followers: string;
  watchMinutes: string;
  halalVerified: string;
  applyMonetization: string;
  monetizationActive: string;
  requestPayout: string;
  payoutMethod: string;
  availableBalance: string;
  lifetimeEarnings: string;
  revenueShare: string;
  installApp: string;
  languageSelect: string;
  autoDetectedCountry: string;
  changeLanguage: string;
  halalGuarantee: string;
  aboutUs: string;
  privacyPolicy: string;
  termsOfService: string;
  back: string;
  confirm: string;
  close: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  bn: {
    appName: 'কলবী',
    tagline: '১০০% হালাল সোশ্যাল নেটওয়ার্ক',
    navHome: 'হোম',
    navWatch: 'ওয়াচ',
    navFriends: 'বন্ধু',
    navMarketplace: 'মার্কেট',
    navNotifications: 'নোটিফিকেশন',
    navMenu: 'মেনু',
    whatsOnYourMind: "What's on your mind? / মনের কথা লিখুন...",
    post: 'পোস্ট',
    story: 'স্টোরি',
    reel: 'রিলস',
    live: 'লাইভ',
    searchPlaceholder: 'Qalby-তে খুঁজুন (পোস্ট, আয়াত, উপদেশ)...',
    like: 'লাইক',
    comment: 'মন্তব্য',
    share: 'শেয়ার',
    saved: 'সংরক্ষিত',
    pages: 'পেজসমূহ',
    groups: 'গ্রুপসমূহ',
    memories: 'স্মৃতিচারণ',
    professionalDashboard: 'প্রফেশনাল ড্যাশবোর্ড',
    monetization: 'ক্রিয়েটর মনিটাইজেশন',
    creatorStudio: 'ক্রিয়েটর আর্নিং স্টুডিও',
    earnings: 'উপার্জন ও আয়',
    followers: 'ফলোয়ার',
    watchMinutes: 'ভিউ মিনিট',
    halalVerified: '১০০% হালাল ভেরিফাইড',
    applyMonetization: 'মনিটাইজেশনের জন্য আবেদন করুন',
    monetizationActive: 'মনিটাইজেশন সক্রিয় (অনুমোদিত)',
    requestPayout: 'টাকা উত্তোলনের আবেদন করুন',
    payoutMethod: 'পেমেন্ট মাধ্যম (বিকাশ / নগদ / ব্যাংক)',
    availableBalance: 'উত্তোলনযোগ্য ব্যালেন্স',
    lifetimeEarnings: 'সর্বমোট অর্জিত আয়',
    revenueShare: 'রাজস্ব বণ্টন: ৫৫% ক্রিয়েটর / ৪৫% প্ল্যাটফর্ম',
    installApp: 'অ্যাপ ইন্সটল করুন',
    languageSelect: 'ভাষা নির্বাচন করুন',
    autoDetectedCountry: 'আপনার দেশের ভাষা স্বয়ংক্রিয়ভাবে সক্রিয় করা হয়েছে',
    changeLanguage: 'ভাষা পরিবর্তন করুন',
    halalGuarantee: '১০০% হালাল গ্যারান্টি',
    aboutUs: 'আমাদের সম্পর্কে',
    privacyPolicy: 'গোপনীয়তা নীতি',
    termsOfService: 'ব্যবহারের শর্তাবলী',
    back: 'পেছনে যান',
    confirm: 'নিশ্চিত করুন',
    close: 'বন্ধ করুন',
  },
  en: {
    appName: 'Qalby',
    tagline: '100% Halal Islamic Social Network',
    navHome: 'Home',
    navWatch: 'Watch',
    navFriends: 'Friends',
    navMarketplace: 'Marketplace',
    navNotifications: 'Notifications',
    navMenu: 'Menu',
    whatsOnYourMind: "What's on your mind? Share a reminder...",
    post: 'Post',
    story: 'Story',
    reel: 'Reel',
    live: 'Live',
    searchPlaceholder: 'Search Qalby (posts, verses, reminders)...',
    like: 'Like',
    comment: 'Comment',
    share: 'Share',
    saved: 'Saved',
    pages: 'Pages',
    groups: 'Groups',
    memories: 'Memories',
    professionalDashboard: 'Professional Dashboard',
    monetization: 'Creator Monetization',
    creatorStudio: 'Creator Earning Studio',
    earnings: 'Earnings & Revenue',
    followers: 'Followers',
    watchMinutes: 'Watch Minutes',
    halalVerified: '100% Halal Verified',
    applyMonetization: 'Apply for Monetization',
    monetizationActive: 'Monetization Active (Approved)',
    requestPayout: 'Request Payout / Withdrawal',
    payoutMethod: 'Payout Method (Bank / PayPal / Mobile)',
    availableBalance: 'Withdrawable Balance',
    lifetimeEarnings: 'Total Lifetime Earnings',
    revenueShare: 'Revenue Split: 55% Creator / 45% Platform',
    installApp: 'Install App',
    languageSelect: 'Select Language',
    autoDetectedCountry: 'Automatically detected language for your region',
    changeLanguage: 'Change Language',
    halalGuarantee: '100% Halal Guarantee',
    aboutUs: 'About Us',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    back: 'Back',
    confirm: 'Confirm',
    close: 'Close',
  },
  ar: {
    appName: 'قلبي',
    tagline: 'شبكة اجتماعية إسلامية حلال ١٠٠٪',
    navHome: 'الرئيسية',
    navWatch: 'فيديو',
    navFriends: 'الأصدقاء',
    navMarketplace: 'السوق',
    navNotifications: 'الإشعارات',
    navMenu: 'القائمة',
    whatsOnYourMind: 'ماذا يخطر في بالك؟ شارك فائدة أو حديثاً...',
    post: 'منشور',
    story: 'قصة',
    reel: 'ريلز',
    live: 'بث مباشر',
    searchPlaceholder: 'ابحث في قلبي (منشورات، آيات، أذكار)...',
    like: 'إعجاب',
    comment: 'تعليق',
    share: 'مشاركة',
    saved: 'المحفوظات',
    pages: 'الصفحات',
    groups: 'المجموعات',
    memories: 'الذكريات',
    professionalDashboard: 'لوحة التحكم الاحترافية',
    monetization: 'تحقيق الأرباح للمنشئين',
    creatorStudio: 'استوديو أرباح المنشئين',
    earnings: 'الأرباح والإيرادات',
    followers: 'المتابعون',
    watchMinutes: 'دقائق المشاهدة',
    halalVerified: 'موثق حلال ١٠٠٪',
    applyMonetization: 'التقديم لتحقيق الدخل',
    monetizationActive: 'تحقيق الدخل مفعل (معتمد)',
    requestPayout: 'طلب سحب الأرباح',
    payoutMethod: 'طريقة الدفع (حساب بنكي / باي بال)',
    availableBalance: 'الرصيد القابل للسحب',
    lifetimeEarnings: 'إجمالي الأرباح المستلمة',
    revenueShare: 'تقاسم الإيرادات: ٥٥٪ للمنشئ / ٤٥٪ للمنصة',
    installApp: 'تثبيت التطبيق',
    languageSelect: 'اختر اللغة',
    autoDetectedCountry: 'تم تفعيل لغة منطقتك تلقائياً',
    changeLanguage: 'تغيير اللغة',
    halalGuarantee: 'ضمان الحلال ١٠٠٪',
    aboutUs: 'من نحن',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfService: 'شروط الاستخدام',
    back: 'رجوع',
    confirm: 'تأكيد',
    close: 'إغلاق',
  },
  ur: {
    appName: 'قلبی',
    tagline: '۱۰۰٪ حلال اسلامی سوشل نیٹ ورک',
    navHome: 'ہوم',
    navWatch: 'ویڈیوز',
    navFriends: 'دوست',
    navMarketplace: 'مارکیٹ',
    navNotifications: 'اطلاعات',
    navMenu: 'مینو',
    whatsOnYourMind: 'آپ کے دل میں کیا ہے؟ کوئی نصیحت یا آیت شیئر کریں...',
    post: 'پوسٹ',
    story: 'اسٹوری',
    reel: 'ریلز',
    live: 'لائیو',
    searchPlaceholder: 'قلبی میں تلاش کریں...',
    like: 'پسند',
    comment: 'تبصرہ',
    share: 'شیئر',
    saved: 'محفوظ شدہ',
    pages: 'صفحات',
    groups: 'گروپس',
    memories: 'یادیں',
    professionalDashboard: 'پروفیشنل ڈیش بورڈ',
    monetization: 'کریئیٹر مونیٹائزیشن',
    creatorStudio: 'کریئیٹر ارننگ اسٹوڈیو',
    earnings: 'آمدنی اور منافع',
    followers: 'فالوورز',
    watchMinutes: 'دیکھنے کے منٹ',
    halalVerified: '۱۰۰٪ حلال تصدیق شدہ',
    applyMonetization: 'مونیٹائزیشن کی درخواست دیں',
    monetizationActive: 'مونیٹائزیشن فعال ہے',
    requestPayout: 'رقم نکلوانے کی درخواست',
    payoutMethod: 'ادائیگی کا طریقہ (بینک / ایزی پیسہ / جاز کیش)',
    availableBalance: 'قابل نکلوائی رقم',
    lifetimeEarnings: 'کل مجموعی آمدنی',
    revenueShare: 'آمدنی کی تقسیم: ۵۵٪ کریئیٹر / ۴۵٪ پلیٹ فارم',
    installApp: 'ایپ انسٹال کریں',
    languageSelect: 'زبان منتخب کریں',
    autoDetectedCountry: 'آپ کے ملک کے مطابق زبان خودکار منتخب ہوئی ہے',
    changeLanguage: 'زبان تبدیل کریں',
    halalGuarantee: '۱۰۰٪ حلال گارنٹی',
    aboutUs: 'ہمارے متعلق',
    privacyPolicy: 'پرائیویسی پالیسی',
    termsOfService: 'استعمال کی شرائط',
    back: 'واپس',
    confirm: 'تصدیق',
    close: 'بند کریں',
  },
  hi: {
    appName: 'क़ल्बी',
    tagline: '100% हलाल इस्लामिक सोशल नेटवर्क',
    navHome: 'होम',
    navWatch: 'वीडियो',
    navFriends: 'मित्र',
    navMarketplace: 'मार्केट',
    navNotifications: 'सूचनाएं',
    navMenu: 'मेनू',
    whatsOnYourMind: 'आपके मन में क्या है? कोई सीख या आयत साझा करें...',
    post: 'पोस्ट',
    story: 'स्टोरी',
    reel: 'रील्स',
    live: 'लाइव',
    searchPlaceholder: 'क़ल्बी में खोजें...',
    like: 'लाइक',
    comment: 'टिप्पणी',
    share: 'शेयर',
    saved: 'सहेजे गए',
    pages: 'पेज',
    groups: 'ग्रुप्स',
    memories: 'यादें',
    professionalDashboard: 'प्रोफेशनल डैशबोर्ड',
    monetization: 'क्रिएटर मोनेटाइजेशन',
    creatorStudio: 'क्रिएटर अर्निंग स्टूडियो',
    earnings: 'कमाई और आय',
    followers: 'फॉलोअर्स',
    watchMinutes: 'वॉच मिनट्स',
    halalVerified: '100% हलाल सत्यापित',
    applyMonetization: 'मोनेटाइजेशन के लिए आवेदन करें',
    monetizationActive: 'मोनेटाइजेशन सक्रिय (स्वीकृत)',
    requestPayout: 'भुगतान निकासी अनुरोध',
    payoutMethod: 'भुगतान विधि (बैंक / यूपीआई / पेपैल)',
    availableBalance: 'निकासी योग्य राशि',
    lifetimeEarnings: 'कुल आजीवन कमाई',
    revenueShare: 'राजस्व विभाजन: 55% क्रिएटर / 45% प्लेटफॉर्म',
    installApp: 'ऐप इंस्टॉल करें',
    languageSelect: 'भाषा चुनें',
    autoDetectedCountry: 'आपके देश की भाषा स्वचालित रूप से सक्रिय हो गई है',
    changeLanguage: 'भाषा बदलें',
    halalGuarantee: '100% हलाल गारंटी',
    aboutUs: 'हमारे बारे में',
    privacyPolicy: 'गोपनीयता नीति',
    termsOfService: 'उपयोग की शर्तें',
    back: 'वापस',
    confirm: 'पुष्टि करें',
    close: 'बंद करें',
  },
  id: {
    appName: 'Qalby',
    tagline: 'Jaringan Sosial Islam 100% Halal',
    navHome: 'Beranda',
    navWatch: 'Tonton',
    navFriends: 'Teman',
    navMarketplace: 'Pasar',
    navNotifications: 'Notifikasi',
    navMenu: 'Menu',
    whatsOnYourMind: 'Apa yang Anda pikirkan? Bagikan nasehat...',
    post: 'Postingan',
    story: 'Cerita',
    reel: 'Reels',
    live: 'Langsung',
    searchPlaceholder: 'Cari di Qalby (postingan, ayat, doa)...',
    like: 'Suka',
    comment: 'Komentar',
    share: 'Bagikan',
    saved: 'Tersimpan',
    pages: 'Halaman',
    groups: 'Grup',
    memories: 'Kenangan',
    professionalDashboard: 'Dasbor Profesional',
    monetization: 'Monetisasi Kreator',
    creatorStudio: 'Studio Penghasilan Kreator',
    earnings: 'Penghasilan & Pendapatan',
    followers: 'Pengikut',
    watchMinutes: 'Menit Ditonton',
    halalVerified: 'Terverifikasi 100% Halal',
    applyMonetization: 'Ajukan Monetisasi',
    monetizationActive: 'Monetisasi Aktif (Disetujui)',
    requestPayout: 'Ajukan Penarikan Dana',
    payoutMethod: 'Metode Pembayaran (Bank / E-Wallet)',
    availableBalance: 'Saldo yang Dapat Ditarik',
    lifetimeEarnings: 'Total Penghasilan Seumur Hidup',
    revenueShare: 'Bagi Hasil: 55% Kreator / 45% Platform',
    installApp: 'Pasang Aplikasi',
    languageSelect: 'Pilih Bahasa',
    autoDetectedCountry: 'Bahasa terdeteksi otomatis sesuai wilayah Anda',
    changeLanguage: 'Ubah Bahasa',
    halalGuarantee: 'Jaminan 100% Halal',
    aboutUs: 'Tentang Kami',
    privacyPolicy: 'Kebijakan Privasi',
    termsOfService: 'Ketentuan Layanan',
    back: 'Kembali',
    confirm: 'Konfirmasi',
    close: 'Tutup',
  },
  ms: {
    appName: 'Qalby',
    tagline: 'Rangkaian Sosial Islam 100% Halal',
    navHome: 'Utama',
    navWatch: 'Tonton',
    navFriends: 'Rakan',
    navMarketplace: 'Pasaran',
    navNotifications: 'Pemberitahuan',
    navMenu: 'Menu',
    whatsOnYourMind: 'Apa yang anda fikirkan? Kongsi tazkirah...',
    post: 'Siaran',
    story: 'Cerita',
    reel: 'Reels',
    live: 'Langsung',
    searchPlaceholder: 'Cari di Qalby (siaran, ayat, doa)...',
    like: 'Suka',
    comment: 'Komen',
    share: 'Kongsi',
    saved: 'Disimpan',
    pages: 'Halaman',
    groups: 'Kumpulan',
    memories: 'Kenangan',
    professionalDashboard: 'Papan Pemuka Profesional',
    monetization: 'Pengewangan Pencipta',
    creatorStudio: 'Studio Pendapatan Pencipta',
    earnings: 'Pendapatan & Hasil',
    followers: 'Pengikut',
    watchMinutes: 'Minit Tontonan',
    halalVerified: 'Disahkan 100% Halal',
    applyMonetization: 'Mohon Pengewangan',
    monetizationActive: 'Pengewangan Aktif (Diluluskan)',
    requestPayout: 'Pohon Pengeluaran Wang',
    payoutMethod: 'Kaedah Pembayaran (Bank / DuitNow)',
    availableBalance: 'Baki Boleh Dikeluarkan',
    lifetimeEarnings: 'Jumlah Pendapatan Keseluruhan',
    revenueShare: 'Bahagian Hasil: 55% Pencipta / 45% Platform',
    installApp: 'Pasang Aplikasi',
    languageSelect: 'Pilih Bahasa',
    autoDetectedCountry: 'Bahasa dikesan secara automatik untuk negara anda',
    changeLanguage: 'Tukar Bahasa',
    halalGuarantee: 'Jaminan 100% Halal',
    aboutUs: 'Tentang Kami',
    privacyPolicy: 'Dasar Privasi',
    termsOfService: 'Syarat Perkhidmatan',
    back: 'Kembali',
    confirm: 'Sahkan',
    close: 'Tutup',
  },
  tr: {
    appName: 'Qalby',
    tagline: '%100 Helal İslami Sosyal Ağ',
    navHome: 'Ana Sayfa',
    navWatch: 'İzle',
    navFriends: 'Arkadaşlar',
    navMarketplace: 'Pazar',
    navNotifications: 'Bildirimler',
    navMenu: 'Menü',
    whatsOnYourMind: 'Aklınızdan ne geçiyor? Bir hatırlatma paylaşın...',
    post: 'Gönderi',
    story: 'Hikaye',
    reel: 'Reels',
    live: 'Canlı',
    searchPlaceholder: "Qalby'de ara (ayetler, hadisler, paylaşımlar)...",
    like: 'Beğen',
    comment: 'Yorum Yap',
    share: 'Paylaş',
    saved: 'Kaydedilenler',
    pages: 'Sayfalar',
    groups: 'Gruplar',
    memories: 'Anılar',
    professionalDashboard: 'Profesyonel Pano',
    monetization: 'İçerik Üretici Para Kazanma',
    creatorStudio: 'Kazanç Stüdyosu',
    earnings: 'Kazançlar ve Gelir',
    followers: 'Takipçiler',
    watchMinutes: 'İzlenme Dakikası',
    halalVerified: '%100 Helal Onaylı',
    applyMonetization: 'Para Kazanmaya Başvur',
    monetizationActive: 'Para Kazanma Aktif (Onaylandı)',
    requestPayout: 'Ödeme / Para Çekme Talebi',
    payoutMethod: 'Ödeme Yöntemi (Banka / Papara / IBAN)',
    availableBalance: 'Çekilebilir Bakiye',
    lifetimeEarnings: 'Toplam Kazanç',
    revenueShare: 'Gelir Paylaşımı: %55 Üretici / %45 Platform',
    installApp: 'Uygulamayı Yükle',
    languageSelect: 'Dil Seçin',
    autoDetectedCountry: 'Bölgenize göre dil otomatik algılandı',
    changeLanguage: 'Dili Değiştir',
    halalGuarantee: '%100 Helal Güvence',
    aboutUs: 'Hakkımızda',
    privacyPolicy: 'Gizlilik Politikası',
    termsOfService: 'Kullanım Koşulları',
    back: 'Geri',
    confirm: 'Onayla',
    close: 'Kapat',
  },
  fr: {
    appName: 'Qalby',
    tagline: 'Réseau Social Islamique 100% Halal',
    navHome: 'Accueil',
    navWatch: 'Vidéos',
    navFriends: 'Amis',
    navMarketplace: 'Boutique',
    navNotifications: 'Notifications',
    navMenu: 'Menu',
    whatsOnYourMind: 'À quoi pensez-vous ? Partagez un rappel pieux...',
    post: 'Publier',
    story: 'Story',
    reel: 'Reels',
    live: 'Direct',
    searchPlaceholder: 'Rechercher sur Qalby (versets, rappels, pages)...',
    like: "J'aime",
    comment: 'Commenter',
    share: 'Partager',
    saved: 'Enregistrements',
    pages: 'Pages',
    groups: 'Groupes',
    memories: 'Souvenirs',
    professionalDashboard: 'Tableau de Bord Professionnel',
    monetization: 'Monétisation des Créateurs',
    creatorStudio: 'Studio de Rémunération',
    earnings: 'Gains et Revenus',
    followers: 'Abonnés',
    watchMinutes: 'Minutes de visionnage',
    halalVerified: 'Certifié 100% Halal',
    applyMonetization: 'Postuler à la Monétisation',
    monetizationActive: 'Monétisation Active (Approuvée)',
    requestPayout: 'Demander un Paiement',
    payoutMethod: 'Mode de paiement (Banque / PayPal / Mobile)',
    availableBalance: 'Solde Retirable',
    lifetimeEarnings: 'Gains Cumulés Totaux',
    revenueShare: 'Partage des revenus : 55% Créateur / 45% Plateforme',
    installApp: "Installer l'Application",
    languageSelect: 'Choisir la Langue',
    autoDetectedCountry: 'Langue automatiquement activée pour votre pays',
    changeLanguage: 'Changer de Langue',
    halalGuarantee: 'Garantie 100% Halal',
    aboutUs: 'À Propos de Nous',
    privacyPolicy: 'Politique de Confidentialité',
    termsOfService: "Conditions d'Utilisation",
    back: 'Retour',
    confirm: 'Confirmer',
    close: 'Fermer',
  },
  es: {
    appName: 'Qalby',
    tagline: 'Red Social Islámica 100% Halal',
    navHome: 'Inicio',
    navWatch: 'Videos',
    navFriends: 'Amigos',
    navMarketplace: 'Mercado',
    navNotifications: 'Notificaciones',
    navMenu: 'Menú',
    whatsOnYourMind: '¿Qué estás pensando? Comparte un recordatorio...',
    post: 'Publicar',
    story: 'Historia',
    reel: 'Reels',
    live: 'En Vivo',
    searchPlaceholder: 'Buscar en Qalby (publicaciones, aleyas)...',
    like: 'Me gusta',
    comment: 'Comentar',
    share: 'Compartir',
    saved: 'Guardados',
    pages: 'Páginas',
    groups: 'Grupos',
    memories: 'Recuerdos',
    professionalDashboard: 'Panel Profesional',
    monetization: 'Monetización de Creadores',
    creatorStudio: 'Estudio de Ganancias',
    earnings: 'Ganancias e Ingresos',
    followers: 'Seguidores',
    watchMinutes: 'Minutos de Reproducción',
    halalVerified: '100% Halal Verificado',
    applyMonetization: 'Solicitar Monetización',
    monetizationActive: 'Monetización Activa (Aprobada)',
    requestPayout: 'Solicitar Pago / Retiro',
    payoutMethod: 'Método de Pago (Banco / PayPal)',
    availableBalance: 'Saldo Disponible',
    lifetimeEarnings: 'Ganancias Históricas Totales',
    revenueShare: 'División de Ingresos: 55% Creador / 45% Plataforma',
    installApp: 'Instalar Aplicación',
    languageSelect: 'Seleccionar Idioma',
    autoDetectedCountry: 'Idioma detectado automáticamente según tu país',
    changeLanguage: 'Cambiar Idioma',
    halalGuarantee: 'Garantía 100% Halal',
    aboutUs: 'Sobre Nosotros',
    privacyPolicy: 'Política de Privacidad',
    termsOfService: 'Términos de Servicio',
    back: 'Atrás',
    confirm: 'Confirmar',
    close: 'Cerrar',
  },
  pt: {
    appName: 'Qalby',
    tagline: 'Rede Social Islâmica 100% Halal',
    navHome: 'Início',
    navWatch: 'Vídeos',
    navFriends: 'Amigos',
    navMarketplace: 'Mercado',
    navNotifications: 'Notificações',
    navMenu: 'Menu',
    whatsOnYourMind: 'No que você está pensando? Compartilhe uma mensagem...',
    post: 'Publicar',
    story: 'Story',
    reel: 'Reels',
    live: 'Ao Vivo',
    searchPlaceholder: 'Pesquisar no Qalby (postagens, versículos)...',
    like: 'Curtir',
    comment: 'Comentar',
    share: 'Compartilhar',
    saved: 'Salvos',
    pages: 'Páginas',
    groups: 'Grupos',
    memories: 'Lembranças',
    professionalDashboard: 'Painel Profissional',
    monetization: 'Monetização de Criadores',
    creatorStudio: 'Estúdio de Ganhos',
    earnings: 'Ganhos e Receitas',
    followers: 'Seguidores',
    watchMinutes: 'Minutos Assistidos',
    halalVerified: '100% Halal Verificado',
    applyMonetization: 'Solicitar Monetização',
    monetizationActive: 'Monetização Ativa (Aprovada)',
    requestPayout: 'Solicitar Retirada / Saque',
    payoutMethod: 'Método de Pagamento (PIX / Banco / PayPal)',
    availableBalance: 'Saldo Disponível para Saque',
    lifetimeEarnings: 'Total de Ganhos Históricos',
    revenueShare: 'Divisão de Receita: 55% Criador / 45% Plataforma',
    installApp: 'Instalar Aplicativo',
    languageSelect: 'Selecionar Idioma',
    autoDetectedCountry: 'Idioma ativado automaticamente para o seu país',
    changeLanguage: 'Alterar Idioma',
    halalGuarantee: 'Garantia 100% Halal',
    aboutUs: 'Sobre Nós',
    privacyPolicy: 'Política de Privacidade',
    termsOfService: 'Termos de Serviço',
    back: 'Voltar',
    confirm: 'Confirmar',
    close: 'Fechar',
  },
  de: {
    appName: 'Qalby',
    tagline: '100% Halal Islamisches Soziales Netzwerk',
    navHome: 'Startseite',
    navWatch: 'Videos',
    navFriends: 'Freunde',
    navMarketplace: 'Marktplatz',
    navNotifications: 'Benachrichtigungen',
    navMenu: 'Menü',
    whatsOnYourMind: 'Was machst du gerade? Teile eine Erinnerung...',
    post: 'Beitrag',
    story: 'Story',
    reel: 'Reels',
    live: 'Live',
    searchPlaceholder: 'Qalby durchsuchen (Verse, Hadithe, Beiträge)...',
    like: 'Gefällt mir',
    comment: 'Kommentieren',
    share: 'Teilen',
    saved: 'Gespeichert',
    pages: 'Seiten',
    groups: 'Gruppen',
    memories: 'Erinnerungen',
    professionalDashboard: 'Professionelles Dashboard',
    monetization: 'Creator Monetarisierung',
    creatorStudio: 'Einnahmen-Studio',
    earnings: 'Einnahmen & Ertrag',
    followers: 'Follower',
    watchMinutes: 'Wiedergabeminuten',
    halalVerified: '100% Halal Verifiziert',
    applyMonetization: 'Monetarisierung beantragen',
    monetizationActive: 'Monetarisierung aktiv (bestätigt)',
    requestPayout: 'Auszahlung anfordern',
    payoutMethod: 'Auszahlungsmethode (Bank / IBAN / PayPal)',
    availableBalance: 'Auszahlbarer Betrag',
    lifetimeEarnings: 'Gesamteinnahmen',
    revenueShare: 'Erlösaufteilung: 55% Creator / 45% Plattform',
    installApp: 'App Installieren',
    languageSelect: 'Sprache wählen',
    autoDetectedCountry: 'Sprache für Ihr Land automatisch aktiviert',
    changeLanguage: 'Sprache ändern',
    halalGuarantee: '100% Halal Garantie',
    aboutUs: 'Über uns',
    privacyPolicy: 'Datenschutzerklärung',
    termsOfService: 'Nutzungsbedingungen',
    back: 'Zurück',
    confirm: 'Bestätigen',
    close: 'Schließen',
  },
  ru: {
    appName: 'Калби',
    tagline: '100% Халяльная Исламская Социальная Сеть',
    navHome: 'Главная',
    navWatch: 'Видео',
    navFriends: 'Друзья',
    navMarketplace: 'Маркет',
    navNotifications: 'Уведомления',
    navMenu: 'Меню',
    whatsOnYourMind: 'О чём вы думаете? Поделитесь напоминанием...',
    post: 'Опубликовать',
    story: 'История',
    reel: 'Рилс',
    live: 'Прямой эфир',
    searchPlaceholder: 'Поиск в Qalby (посты, аяты, наставления)...',
    like: 'Нравится',
    comment: 'Комментировать',
    share: 'Поделиться',
    saved: 'Сохраненное',
    pages: 'Страницы',
    groups: 'Группы',
    memories: 'Воспоминания',
    professionalDashboard: 'Профессиональная панель',
    monetization: 'Монетизация авторов',
    creatorStudio: 'Студия заработка',
    earnings: 'Доходы и выручка',
    followers: 'Подписчики',
    watchMinutes: 'Минуты просмотра',
    halalVerified: '100% Халяль проверено',
    applyMonetization: 'Подать заявку на монетизацию',
    monetizationActive: 'Монетизация активна',
    requestPayout: 'Запросить вывод средств',
    payoutMethod: 'Способ выплаты (Банк / Карта / Электронный кошелек)',
    availableBalance: 'Доступно к выводу',
    lifetimeEarnings: 'Общий доход за все время',
    revenueShare: 'Разделение дохода: 55% автору / 45% платформе',
    installApp: 'Установить приложение',
    languageSelect: 'Выберите язык',
    autoDetectedCountry: 'Язык автоматически установлен для вашей страны',
    changeLanguage: 'Изменить язык',
    halalGuarantee: '100% Гарантия Халяль',
    aboutUs: 'О нас',
    privacyPolicy: 'Политика конфиденциальности',
    termsOfService: 'Условия обслуживания',
    back: 'Назад',
    confirm: 'Подтвердить',
    close: 'Закрыть',
  },
  fa: {
    appName: 'قلبی',
    tagline: 'شبکه اجتماعی اسلامی ۱۰۰٪ حلال',
    navHome: 'خانه',
    navWatch: 'ویدیوها',
    navFriends: 'دوستان',
    navMarketplace: 'بازار',
    navNotifications: 'اعلان‌ها',
    navMenu: 'منو',
    whatsOnYourMind: 'در ذهن شما چه می‌گذرد؟ آیه یا پندی بنویسید...',
    post: 'پست',
    story: 'استوری',
    reel: 'ریلز',
    live: 'پخش زنده',
    searchPlaceholder: 'جستجو در قلبی (پست‌ها، آیات و ادعیه)...',
    like: 'پسندیدن',
    comment: 'دیدگاه',
    share: 'اشتراک‌گذاری',
    saved: 'ذخیره شده‌ها',
    pages: 'صفحات',
    groups: 'گروه‌ها',
    memories: 'خاطرات',
    professionalDashboard: 'داشبورد حرفه‌ای',
    monetization: 'درآمدزایی تولیدکنندگان محتوا',
    creatorStudio: 'استودیو درآمد',
    earnings: 'درآمد و عواید',
    followers: 'دنبال‌کنندگان',
    watchMinutes: 'دقایق بازدید',
    halalVerified: '۱۰۰٪ حلال تایید شده',
    applyMonetization: 'درخواست درآمدزایی',
    monetizationActive: 'درآمدزایی فعال است',
    requestPayout: 'درخواست تسویه حساب و برداشت',
    payoutMethod: 'روش پرداخت (حساب بانکی / بین‌المللی)',
    availableBalance: 'موجودی قابل برداشت',
    lifetimeEarnings: 'کل درآمد مادام‌العمر',
    revenueShare: 'تقسیم درآمد: ۵۵٪ به تولیدکننده / ۴۵٪ پلتفرم',
    installApp: 'نصب اپلیکیشن',
    languageSelect: 'انتخاب زبان',
    autoDetectedCountry: 'زبان بر اساس موقعیت جغرافیایی شما خودکار فعال شد',
    changeLanguage: 'تغییر زبان',
    halalGuarantee: 'ضمانت ۱۰۰٪ حلال',
    aboutUs: 'درباره ما',
    privacyPolicy: 'سیاست حفظ حریم خصوصی',
    termsOfService: 'شرایط خدمات',
    back: 'بازگشت',
    confirm: 'تأیید',
    close: 'بستن',
  },
  sw: {
    appName: 'Qalby',
    tagline: 'Mtandao wa Kijamii wa Kiislamu 100% Halal',
    navHome: 'Mwanzo',
    navWatch: 'Video',
    navFriends: 'Marafiki',
    navMarketplace: 'Soko',
    navNotifications: 'Arifa',
    navMenu: 'Menyu',
    whatsOnYourMind: 'Unafikiria nini? Shiriki mawaidha...',
    post: 'Chapisha',
    story: 'Hadithi',
    reel: 'Reels',
    live: 'Mubashara',
    searchPlaceholder: 'Tafuta katika Qalby (machapisho, aya)...',
    like: 'Penda',
    comment: 'Toa Maoni',
    share: 'Shiriki',
    saved: 'Iliyohifadhiwa',
    pages: 'Kurasa',
    groups: 'Vikundi',
    memories: 'Kumbukumbu',
    professionalDashboard: 'Dashibodi ya Kitaalamu',
    monetization: 'Mapato ya Waundaji Maudhui',
    creatorStudio: 'Studio ya Mapato',
    earnings: 'Mapato na Faida',
    followers: 'Wafuasi',
    watchMinutes: 'Dakika Zilizotazamwa',
    halalVerified: 'Imethibitishwa 100% Halal',
    applyMonetization: 'Omba Kupata Mapato',
    monetizationActive: 'Kupata Mapato Kumewashwa',
    requestPayout: 'Omba Kutoa Pesa',
    payoutMethod: 'Njia ya Malipo (Benki / M-Pesa / Tigo Pesa)',
    availableBalance: 'Salio Lililopo Kutoa',
    lifetimeEarnings: 'Jumla ya Mapato Yote',
    revenueShare: 'Mgawanyo: 55% Muundaji / 45% Jukwaa',
    installApp: 'Sakinisha Programu',
    languageSelect: 'Chagua Lugha',
    autoDetectedCountry: 'Lugha imechaguliwa kiotomatiki kwa nchi yako',
    changeLanguage: 'Badilisha Lugha',
    halalGuarantee: 'Dhamana ya 100% Halal',
    aboutUs: 'Kuhusu Sisi',
    privacyPolicy: 'Sera ya Faragha',
    termsOfService: 'Masharti ya Huduma',
    back: 'Rudi',
    confirm: 'Thibitisha',
    close: 'Funga',
  },
  zh: {
    appName: 'Qalby',
    tagline: '100% 清真伊斯兰社交网络',
    navHome: '首页',
    navWatch: '视频',
    navFriends: '好友',
    navMarketplace: '集市',
    navNotifications: '通知',
    navMenu: '菜单',
    whatsOnYourMind: '在想些什么？分享一段提醒或经文...',
    post: '发布',
    story: '快拍',
    reel: '短视频',
    live: '直播',
    searchPlaceholder: '在 Qalby 搜索 (帖子、经文、提醒)...',
    like: '赞',
    comment: '评论',
    share: '分享',
    saved: '收藏夹',
    pages: '主页',
    groups: '群组',
    memories: '那年今天',
    professionalDashboard: '专业管理面板',
    monetization: '创作者收益计划',
    creatorStudio: '创作者收入工作室',
    earnings: '收益与收入',
    followers: '粉丝',
    watchMinutes: '播放分钟数',
    halalVerified: '100% 清真认证',
    applyMonetization: '申请开通收益',
    monetizationActive: '收益已激活 (已批准)',
    requestPayout: '申请提现',
    payoutMethod: '提现方式 (银行账户 / 支付宝 / PayPal)',
    availableBalance: '可提现余额',
    lifetimeEarnings: '历史累计总收益',
    revenueShare: '分成比例：55% 创作者 / 45% 平台',
    installApp: '安装应用程序',
    languageSelect: '选择语言',
    autoDetectedCountry: '已根据您的所在国家自动切换语言',
    changeLanguage: '更改语言',
    halalGuarantee: '100% 清真保障',
    aboutUs: '关于我们',
    privacyPolicy: '隐私政策',
    termsOfService: '服务条款',
    back: '返回',
    confirm: '确认',
    close: '关闭',
  },
  ja: {
    appName: 'Qalby',
    tagline: '100% ハラール・イスラム ソーシャルネットワーク',
    navHome: 'ホーム',
    navWatch: '動画',
    navFriends: '友達',
    navMarketplace: 'マーケット',
    navNotifications: 'お知らせ',
    navMenu: 'メニュー',
    whatsOnYourMind: 'いま何を考えていますか？教訓や言葉を共有...',
    post: '投稿',
    story: 'ストーリー',
    reel: 'リール',
    live: 'ライブ配信',
    searchPlaceholder: 'Qalby を検索 (投稿、節、言葉)...',
    like: 'いいね！',
    comment: 'コメント',
    share: 'シェア',
    saved: '保存済み',
    pages: 'ページ',
    groups: 'グループ',
    memories: '過去の思い出',
    professionalDashboard: 'プロフェッショナルダッシュボード',
    monetization: 'クリエイター収益化',
    creatorStudio: 'クリエイタースタジオ',
    earnings: '獲得収益',
    followers: 'フォロワー',
    watchMinutes: '視聴時間 (分)',
    halalVerified: '100% ハラール認証',
    applyMonetization: '収益化を申請',
    monetizationActive: '収益化有効 (承認済み)',
    requestPayout: '出金・振込申請',
    payoutMethod: '支払い方法 (銀行振込 / PayPal)',
    availableBalance: '出金可能残高',
    lifetimeEarnings: '累計総収益',
    revenueShare: '収益配分: 55% クリエイター / 45% プラットフォーム',
    installApp: 'アプリをインストール',
    languageSelect: '言語を選択',
    autoDetectedCountry: 'あなたの地域と言語を自動検出しました',
    changeLanguage: '言語を変更',
    halalGuarantee: '100% ハラール保証',
    aboutUs: '運営者情報',
    privacyPolicy: 'プライバシーポリシー',
    termsOfService: '利用規約',
    back: '戻る',
    confirm: '確定',
    close: '閉じる',
  },
  it: {
    appName: 'Qalby',
    tagline: 'Rete Sociale Islamica 100% Halal',
    navHome: 'Home',
    navWatch: 'Video',
    navFriends: 'Amici',
    navMarketplace: 'Mercato',
    navNotifications: 'Notifiche',
    navMenu: 'Menu',
    whatsOnYourMind: 'A cosa stai pensando? Condividi un pensiero...',
    post: 'Pubblica',
    story: 'Storia',
    reel: 'Reels',
    live: 'In diretta',
    searchPlaceholder: 'Cerca in Qalby (post, versetti)...',
    like: 'Mi piace',
    comment: 'Commenta',
    share: 'Condividi',
    saved: 'Elementi salvati',
    pages: 'Pagine',
    groups: 'Gruppi',
    memories: 'Ricordi',
    professionalDashboard: 'Dashboard per Professionisti',
    monetization: 'Monetizzazione Creator',
    creatorStudio: 'Studio Guadagni',
    earnings: 'Guadagni e Ricavi',
    followers: 'Follower',
    watchMinutes: 'Minuti visualizzati',
    halalVerified: '100% Halal Verificato',
    applyMonetization: 'Richiedi Monetizzazione',
    monetizationActive: 'Monetizzazione Attiva (Approvata)',
    requestPayout: 'Richiedi Pagamento',
    payoutMethod: 'Metodo di Pagamento (Bonifico / PayPal)',
    availableBalance: 'Saldo Prelevabile',
    lifetimeEarnings: 'Guadagni Complessivi',
    revenueShare: 'Divisione Ricavi: 55% Creator / 45% Piattaforma',
    installApp: 'Installa Applicazione',
    languageSelect: 'Seleziona Lingua',
    autoDetectedCountry: 'Lingua attivata automaticamente per il tuo paese',
    changeLanguage: 'Cambia Lingua',
    halalGuarantee: 'Garanzia 100% Halal',
    aboutUs: 'Chi Siamo',
    privacyPolicy: 'Informativa sulla Privacy',
    termsOfService: 'Termini di Servizio',
    back: 'Indietro',
    confirm: 'Conferma',
    close: 'Chiudi',
  },
};

/**
 * Map country codes (ISO 3166-1 alpha-2) to the best matching language & details
 */
export const COUNTRY_TO_LANGUAGE_MAP: Record<string, { lang: SupportedLanguage; countryName: string; flag: string }> = {
  // South Asia
  BD: { lang: 'bn', countryName: 'বাংলাদেশ (Bangladesh)', flag: '🇧🇩' },
  IN: { lang: 'hi', countryName: 'भारत (India)', flag: '🇮🇳' },
  PK: { lang: 'ur', countryName: 'پاکستان (Pakistan)', flag: '🇵🇰' },

  // Arab World (MENA)
  SA: { lang: 'ar', countryName: 'المملكة العربية السعودية (Saudi Arabia)', flag: '🇸🇦' },
  AE: { lang: 'ar', countryName: 'الإمارات العربية المتحدة (UAE)', flag: '🇦🇪' },
  EG: { lang: 'ar', countryName: 'مصر (Egypt)', flag: '🇪🇬' },
  QA: { lang: 'ar', countryName: 'قطر (Qatar)', flag: '🇶🇦' },
  KW: { lang: 'ar', countryName: 'الكويت (Kuwait)', flag: '🇰🇼' },
  OM: { lang: 'ar', countryName: 'عمان (Oman)', flag: '🇴🇲' },
  BH: { lang: 'ar', countryName: 'البحرين (Bahrain)', flag: '🇧🇭' },
  IQ: { lang: 'ar', countryName: 'العراق (Iraq)', flag: '🇮🇶' },
  JO: { lang: 'ar', countryName: 'الأردن (Jordan)', flag: '🇯🇴' },
  LB: { lang: 'ar', countryName: 'لبنان (Lebanon)', flag: '🇱🇧' },
  MA: { lang: 'ar', countryName: 'المغرب (Morocco)', flag: '🇲🇦' },
  DZ: { lang: 'ar', countryName: 'الجزائر (Algeria)', flag: '🇩🇿' },
  TN: { lang: 'ar', countryName: 'تونس (Tunisia)', flag: '🇹🇳' },
  LY: { lang: 'ar', countryName: 'ليبيا (Libya)', flag: '🇱🇾' },
  YE: { lang: 'ar', countryName: 'اليمن (Yemen)', flag: '🇾🇪' },
  PS: { lang: 'ar', countryName: 'فلسطين (Palestine)', flag: '🇵🇸' },
  SD: { lang: 'ar', countryName: 'السودان (Sudan)', flag: '🇸🇩' },
  SY: { lang: 'ar', countryName: 'سوريا (Syria)', flag: '🇸🇾' },

  // Southeast Asia
  ID: { lang: 'id', countryName: 'Indonesia', flag: '🇮🇩' },
  MY: { lang: 'ms', countryName: 'Malaysia', flag: '🇲🇾' },
  BN: { lang: 'ms', countryName: 'Brunei', flag: '🇧🇳' },
  SG: { lang: 'en', countryName: 'Singapore', flag: '🇸🇬' },

  // Eurasia / Turkey
  TR: { lang: 'tr', countryName: 'Türkiye', flag: '🇹🇷' },
  AZ: { lang: 'tr', countryName: 'Azərbaycan (Azerbaijan)', flag: '🇦🇿' },
  IR: { lang: 'fa', countryName: 'ایران (Iran)', flag: '🇮🇷' },
  AF: { lang: 'fa', countryName: 'افغانستان (Afghanistan)', flag: '🇦🇫' },
  TJ: { lang: 'fa', countryName: 'Тоҷикистон (Tajikistan)', flag: '🇹🇯' },

  // Europe - Romance & Germanic
  FR: { lang: 'fr', countryName: 'France', flag: '🇫🇷' },
  BE: { lang: 'fr', countryName: 'Belgique (Belgium)', flag: '🇧🇪' },
  ES: { lang: 'es', countryName: 'España (Spain)', flag: '🇪🇸' },
  MX: { lang: 'es', countryName: 'México (Mexico)', flag: '🇲🇽' },
  CO: { lang: 'es', countryName: 'Colombia', flag: '🇨🇴' },
  AR: { lang: 'es', countryName: 'Argentina', flag: '🇦🇷' },
  CL: { lang: 'es', countryName: 'Chile', flag: '🇨🇱' },
  PE: { lang: 'es', countryName: 'Perú', flag: '🇵🇪' },
  VE: { lang: 'es', countryName: 'Venezuela', flag: '🇻🇪' },
  PT: { lang: 'pt', countryName: 'Portugal', flag: '🇵🇹' },
  BR: { lang: 'pt', countryName: 'Brasil (Brazil)', flag: '🇧🇷' },
  AO: { lang: 'pt', countryName: 'Angola', flag: '🇦🇴' },
  MZ: { lang: 'pt', countryName: 'Moçambique', flag: '🇲🇿' },
  DE: { lang: 'de', countryName: 'Deutschland (Germany)', flag: '🇩🇪' },
  AT: { lang: 'de', countryName: 'Österreich (Austria)', flag: '🇦🇹' },
  CH: { lang: 'de', countryName: 'Schweiz (Switzerland)', flag: '🇨🇭' },
  IT: { lang: 'it', countryName: 'Italia (Italy)', flag: '🇮🇹' },

  // Russian / CIS
  RU: { lang: 'ru', countryName: 'Россия (Russia)', flag: '🇷🇺' },
  KZ: { lang: 'ru', countryName: 'Қазақстан (Kazakhstan)', flag: '🇰🇿' },
  UZ: { lang: 'ru', countryName: 'Oʻzbekiston (Uzbekistan)', flag: '🇺🇿' },
  KG: { lang: 'ru', countryName: 'Кыргызстан (Kyrgyzstan)', flag: '🇰🇬' },
  BY: { lang: 'ru', countryName: 'Беларусь (Belarus)', flag: '🇧🇾' },

  // Africa
  SN: { lang: 'fr', countryName: 'Sénégal', flag: '🇸🇳' },
  CI: { lang: 'fr', countryName: "Côte d'Ivoire", flag: '🇨🇮' },
  ML: { lang: 'fr', countryName: 'Mali', flag: '🇲🇱' },
  GN: { lang: 'fr', countryName: 'Guinée', flag: '🇬🇳' },
  KE: { lang: 'sw', countryName: 'Kenya', flag: '🇰🇪' },
  TZ: { lang: 'sw', countryName: 'Tanzania', flag: '🇹🇿' },
  UG: { lang: 'sw', countryName: 'Uganda', flag: '🇺🇬' },
  RW: { lang: 'sw', countryName: 'Rwanda', flag: '🇷🇼' },

  // East Asia
  CN: { lang: 'zh', countryName: '中国 (China)', flag: '🇨🇳' },
  TW: { lang: 'zh', countryName: '台灣 (Taiwan)', flag: '🇹🇼' },
  HK: { lang: 'zh', countryName: '香港 (Hong Kong)', flag: '🇭🇰' },
  JP: { lang: 'ja', countryName: '日本 (Japan)', flag: '🇯🇵' },

  // English Dominant
  US: { lang: 'en', countryName: 'United States', flag: '🇺🇸' },
  GB: { lang: 'en', countryName: 'United Kingdom', flag: '🇬🇧' },
  CA: { lang: 'en', countryName: 'Canada', flag: '🇨🇦' },
  AU: { lang: 'en', countryName: 'Australia', flag: '🇦🇺' },
  NZ: { lang: 'en', countryName: 'New Zealand', flag: '🇳🇿' },
  IE: { lang: 'en', countryName: 'Ireland', flag: '🇮🇪' },
  ZA: { lang: 'en', countryName: 'South Africa', flag: '🇿🇦' },
};

/**
 * Automatically detects the user's country and preferred language based on browser environment & timezone
 */
export function detectUserCountryAndLanguage(): { language: SupportedLanguage; countryName: string; detectedFlag: string } {
  // 1. Check if user previously made a manual choice
  try {
    const saved = localStorage.getItem('qalby_language_preference');
    const validCodes: SupportedLanguage[] = ['bn', 'en', 'ar', 'ur', 'hi', 'id', 'ms', 'tr', 'fr', 'es', 'pt', 'de', 'ru', 'fa', 'sw', 'zh', 'ja', 'it'];
    if (saved && validCodes.includes(saved as SupportedLanguage)) {
      const match = SUPPORTED_LANGUAGES.find((l) => l.code === saved);
      return {
        language: saved as SupportedLanguage,
        countryName: match?.country || 'Saved Preference',
        detectedFlag: match?.flag || '🌐',
      };
    }
  } catch {}

  const browserLang = (typeof navigator !== 'undefined' ? (navigator.language || (navigator.languages && navigator.languages[0]) || '') : '').toLowerCase();
  const timeZone = (typeof Intl !== 'undefined' && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : '') || '';

  // 2. Exact language match from browser locale
  if (browserLang.startsWith('bn')) {
    return { language: 'bn', countryName: 'বাংলাদেশ (Bangladesh)', detectedFlag: '🇧🇩' };
  }
  if (browserLang.startsWith('ar')) {
    return { language: 'ar', countryName: 'العالم العربي (Arab World)', detectedFlag: '🇸🇦' };
  }
  if (browserLang.startsWith('ur')) {
    return { language: 'ur', countryName: 'پاکستان (Pakistan)', detectedFlag: '🇵🇰' };
  }
  if (browserLang.startsWith('hi')) {
    return { language: 'hi', countryName: 'भारत (India)', detectedFlag: '🇮🇳' };
  }
  if (browserLang.startsWith('id')) {
    return { language: 'id', countryName: 'Indonesia', detectedFlag: '🇮🇩' };
  }
  if (browserLang.startsWith('ms')) {
    return { language: 'ms', countryName: 'Malaysia', detectedFlag: '🇲🇾' };
  }
  if (browserLang.startsWith('tr') || browserLang.startsWith('az')) {
    return { language: 'tr', countryName: 'Türkiye', detectedFlag: '🇹🇷' };
  }
  if (browserLang.startsWith('fr')) {
    return { language: 'fr', countryName: 'France / Francophonie', detectedFlag: '🇫🇷' };
  }
  if (browserLang.startsWith('es')) {
    return { language: 'es', countryName: 'España / Latinoamérica', detectedFlag: '🇪🇸' };
  }
  if (browserLang.startsWith('pt')) {
    return { language: 'pt', countryName: 'Brasil / Portugal', detectedFlag: '🇧🇷' };
  }
  if (browserLang.startsWith('de')) {
    return { language: 'de', countryName: 'Deutschland (Germany)', detectedFlag: '🇩🇪' };
  }
  if (browserLang.startsWith('ru') || browserLang.startsWith('kk') || browserLang.startsWith('uz') || browserLang.startsWith('ky') || browserLang.startsWith('be')) {
    return { language: 'ru', countryName: 'Россия / СНГ (Eurasia)', detectedFlag: '🇷🇺' };
  }
  if (browserLang.startsWith('fa') || browserLang.startsWith('prs') || browserLang.startsWith('tg')) {
    return { language: 'fa', countryName: 'ایران / افغانستان (Persian)', detectedFlag: '🇮🇷' };
  }
  if (browserLang.startsWith('sw')) {
    return { language: 'sw', countryName: 'East Africa (Kiswahili)', detectedFlag: '🇰🇪' };
  }
  if (browserLang.startsWith('zh')) {
    return { language: 'zh', countryName: '中国 (China / Chinese)', detectedFlag: '🇨🇳' };
  }
  if (browserLang.startsWith('ja')) {
    return { language: 'ja', countryName: '日本 (Japan)', detectedFlag: '🇯🇵' };
  }
  if (browserLang.startsWith('it')) {
    return { language: 'it', countryName: 'Italia (Italy)', detectedFlag: '🇮🇹' };
  }

  // 3. Timezone-based country & region matching
  if (timeZone.includes('Dhaka') || timeZone.includes('Bangladesh')) {
    return { language: 'bn', countryName: 'বাংলাদেশ (Bangladesh)', detectedFlag: '🇧🇩' };
  }
  if (
    timeZone.includes('Riyadh') ||
    timeZone.includes('Dubai') ||
    timeZone.includes('Cairo') ||
    timeZone.includes('Doha') ||
    timeZone.includes('Kuwait') ||
    timeZone.includes('Muscat') ||
    timeZone.includes('Baghdad') ||
    timeZone.includes('Amman') ||
    timeZone.includes('Beirut') ||
    timeZone.includes('Casablanca') ||
    timeZone.includes('Algiers') ||
    timeZone.includes('Tunis') ||
    timeZone.includes('Bahrain') ||
    timeZone.includes('Tripoli') ||
    timeZone.includes('Damascus') ||
    timeZone.includes('Khartoum') ||
    timeZone.includes('Gaza') ||
    timeZone.includes('Hebron')
  ) {
    return { language: 'ar', countryName: 'العالم العربي / الشرق الأوسط', detectedFlag: '🇸🇦' };
  }
  if (timeZone.includes('Karachi') || timeZone.includes('Islamabad')) {
    return { language: 'ur', countryName: 'پاکستان (Pakistan)', detectedFlag: '🇵🇰' };
  }
  if (timeZone.includes('Kolkata') || timeZone.includes('Calcutta')) {
    return { language: 'hi', countryName: 'भारत (India)', detectedFlag: '🇮🇳' };
  }
  if (timeZone.includes('Jakarta') || timeZone.includes('Makassar') || timeZone.includes('Pontianak') || timeZone.includes('Jayapura')) {
    return { language: 'id', countryName: 'Indonesia', detectedFlag: '🇮🇩' };
  }
  if (timeZone.includes('Kuala_Lumpur') || timeZone.includes('Kuching') || timeZone.includes('Brunei')) {
    return { language: 'ms', countryName: 'Malaysia / Brunei', detectedFlag: '🇲🇾' };
  }
  if (timeZone.includes('Istanbul') || timeZone.includes('Baku')) {
    return { language: 'tr', countryName: 'Türkiye', detectedFlag: '🇹🇷' };
  }
  if (timeZone.includes('Paris') || timeZone.includes('Brussels') || timeZone.includes('Montreal') || timeZone.includes('Dakar') || timeZone.includes('Abidjan')) {
    return { language: 'fr', countryName: 'France / Francophone', detectedFlag: '🇫🇷' };
  }
  if (
    timeZone.includes('Madrid') ||
    timeZone.includes('Mexico') ||
    timeZone.includes('Bogota') ||
    timeZone.includes('Buenos_Aires') ||
    timeZone.includes('Lima') ||
    timeZone.includes('Santiago') ||
    timeZone.includes('Caracas')
  ) {
    return { language: 'es', countryName: 'España / Latinoamérica', detectedFlag: '🇪🇸' };
  }
  if (timeZone.includes('Sao_Paulo') || timeZone.includes('Lisbon') || timeZone.includes('Luanda') || timeZone.includes('Maputo') || timeZone.includes('Fortaleza')) {
    return { language: 'pt', countryName: 'Brasil / Portugal', detectedFlag: '🇧🇷' };
  }
  if (timeZone.includes('Berlin') || timeZone.includes('Vienna') || timeZone.includes('Zurich')) {
    return { language: 'de', countryName: 'Deutschland (Germany)', detectedFlag: '🇩🇪' };
  }
  if (timeZone.includes('Moscow') || timeZone.includes('Almaty') || timeZone.includes('Tashkent') || timeZone.includes('Bishkek') || timeZone.includes('Minsk')) {
    return { language: 'ru', countryName: 'Россия / СНГ (Eurasia)', detectedFlag: '🇷🇺' };
  }
  if (timeZone.includes('Tehran') || timeZone.includes('Kabul') || timeZone.includes('Dushanbe')) {
    return { language: 'fa', countryName: 'ایران / افغانستان (Persian)', detectedFlag: '🇮🇷' };
  }
  if (timeZone.includes('Nairobi') || timeZone.includes('Dar_es_Salaam') || timeZone.includes('Kampala') || timeZone.includes('Kigali')) {
    return { language: 'sw', countryName: 'East Africa (Kiswahili)', detectedFlag: '🇰🇪' };
  }
  if (timeZone.includes('Shanghai') || timeZone.includes('Taipei') || timeZone.includes('Hong_Kong') || timeZone.includes('Chongqing')) {
    return { language: 'zh', countryName: '中国 (China)', detectedFlag: '🇨🇳' };
  }
  if (timeZone.includes('Tokyo')) {
    return { language: 'ja', countryName: '日本 (Japan)', detectedFlag: '🇯🇵' };
  }
  if (timeZone.includes('Rome')) {
    return { language: 'it', countryName: 'Italia (Italy)', detectedFlag: '🇮🇹' };
  }

  // 4. Default to Global International English
  return { language: 'en', countryName: 'International (Global)', detectedFlag: '🌐' };
}
