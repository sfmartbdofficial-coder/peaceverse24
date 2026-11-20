export interface PageSeoInput {
  path: string;
  tab?: string;
  isAdminView?: boolean;
}

interface SeoMetadata {
  title: string;
  description: string;
  canonicalPath: string;
  robots?: string;
}

const DEFAULT_DESCRIPTION =
  'PeaceVerse24 হলো বিশ্বের প্রথম ১০০% হালাল ও শান্তিপূর্ণ সোশ্যাল নেটওয়ার্ক। বন্ধুদের সাথে যোগাযোগ, হালাল ভিডিও, নামাজের সময় ও কিবলা দেখতে যোগ দিন। PeaceVerse24 is a peaceful, halal global social network to connect with friends, share positive content, check prayer times, and explore halal marketplace.';

const BASE_ORIGIN = 'https://peaceverse24.com';

function resolveSeoMetadata({ path, tab, isAdminView }: PageSeoInput): SeoMetadata {
  if (isAdminView || path.startsWith('/admin')) {
    return {
      title: 'PeaceVerse24 - Admin Portal',
      description: DEFAULT_DESCRIPTION,
      canonicalPath: '/',
      robots: 'noindex, nofollow',
    };
  }

  if (path === '/login') {
    return {
      title: 'PeaceVerse24 - লগইন | Log In',
      description:
        'PeaceVerse24 অ্যাকাউন্টে লগইন করুন এবং আপনার শান্তিময় হালাল কমিউনিটির সাথে যুক্ত থাকুন। Sign in to PeaceVerse24 to connect with friends and family worldwide.',
      canonicalPath: '/login',
    };
  }

  if (path === '/signup') {
    return {
      title: 'PeaceVerse24 - নতুন অ্যাকাউন্ট তৈরি করুন | Sign Up',
      description:
        'PeaceVerse24-এ ফ্রি নতুন অ্যাকাউন্ট খুলুন — নিরাপদ, হালাল ও শান্তিপূর্ণ সোশ্যাল নেটওয়ার্ক। Create a new PeaceVerse24 account step by step.',
      canonicalPath: '/signup',
    };
  }

  switch (tab) {
    case 'reels':
    case 'watch':
      return {
        title: 'PeaceVerse24 - হালাল ভিডিও ও রিলস | Halal Reels & Videos',
        description:
          'মক্কা-মদিনা লাইভ, কুরআন তিলাওয়াত ও শিক্ষামূলক হালাল ভিডিও দেখুন PeaceVerse24-এ। Watch Makkah live, Quran recitation, and positive halal reels on PeaceVerse24.',
        canonicalPath: '/?tab=reels',
      };
    case 'friends':
      return {
        title: 'PeaceVerse24 - বন্ধু ও কমিউনিটি | Friends & Community',
        description:
          'PeaceVerse24-এ নতুন বন্ধু খুঁজুন এবং নিরাপদ ইসলামিক কমিউনিটিতে যুক্ত হোন। Find friends and build peaceful connections on PeaceVerse24.',
        canonicalPath: '/?tab=friends',
      };
    case 'marketplace':
      return {
        title: 'PeaceVerse24 - পিস মার্ট হালাল মার্কেটপ্লেস | Peace Mart',
        description:
          'PeaceVerse24 পিস মার্টে হালাল পণ্য কিনুন ও বিক্রি করুন। Buy and sell trusted halal products on PeaceVerse24 Peace Mart.',
        canonicalPath: '/?tab=marketplace',
      };
    case 'groups':
      return {
        title: 'PeaceVerse24 - হালাল গ্রুপ ও কমিউনিটি | Groups',
        description:
          'জ্ঞান, দাওয়াহ ও সামাজিক কল্যাণমূলক হালাল গ্রুপে যোগ দিন PeaceVerse24-এ। Join positive study and community groups on PeaceVerse24.',
        canonicalPath: '/?tab=groups',
      };
    case 'pages':
      return {
        title: 'PeaceVerse24 - পেজ ও চ্যানেল | Pages',
        description:
          'মসজিদ, ইসলামিক প্রতিষ্ঠান ও হালাল ব্র্যান্ডের পেজ অনুসরণ করুন PeaceVerse24-এ। Follow verified Islamic creators, masjids, and halal brands on PeaceVerse24.',
        canonicalPath: '/?tab=pages',
      };
    case 'notifications':
      return {
        title: 'PeaceVerse24 - নোটিফিকেশন | Notifications',
        description:
          'আপনার পোস্ট, কমেন্ট, ফ্রেন্ড রিকোয়েস্ট ও কমিউনিটি আপডেট দেখুন। Stay updated with your PeaceVerse24 notifications.',
        canonicalPath: '/?tab=notifications',
      };
    case 'profile':
      return {
        title: 'PeaceVerse24 - প্রোফাইল ও আখেরাত | Profile & Akherath',
        description:
          'আপনার PeaceVerse24 প্রোফাইল, পোস্ট এবং নেক আমলের হিসাব দেখুন। Manage your PeaceVerse24 profile, posts, and daily good deeds log.',
        canonicalPath: '/?tab=profile',
      };
    case 'menu':
      return {
        title: 'PeaceVerse24 - মেনু, নামাজের সময় ও কিবলা | Menu & Tools',
        description:
          'নামাজের সময়সূচি, কিবলা কম্পাস, তাসবিহ ও সেটিংস ব্যবহার করুন PeaceVerse24 মেনু থেকে। Access prayer times, Qibla compass, tasbih, and settings.',
        canonicalPath: '/?tab=menu',
      };
    case 'home':
      return {
        title: 'PeaceVerse24 - হোম ফিড | Halal Social Network',
        description: DEFAULT_DESCRIPTION,
        canonicalPath: '/home',
      };
    default:
      return {
        title: 'PeaceVerse24 - শান্তিময় ও হালাল সোশ্যাল নেটওয়ার্ক | Halal Social Network',
        description: DEFAULT_DESCRIPTION,
        canonicalPath: '/',
      };
  }
}

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonicalLink(href: string) {
  if (typeof document === 'undefined') return;
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export function applyPageSeo(input: PageSeoInput): void {
  if (typeof document === 'undefined') return;

  const meta = resolveSeoMetadata(input);
  const fullUrl = `${BASE_ORIGIN}${meta.canonicalPath}`;

  document.title = meta.title;
  upsertMetaTag('name', 'description', meta.description);
  upsertMetaTag('name', 'robots', meta.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  upsertMetaTag('property', 'og:title', meta.title);
  upsertMetaTag('property', 'og:description', meta.description);
  upsertMetaTag('property', 'og:url', fullUrl);
  upsertMetaTag('name', 'twitter:title', meta.title);
  upsertMetaTag('name', 'twitter:description', meta.description);
  upsertCanonicalLink(fullUrl);

  try {
    const gscToken = (import.meta as any)?.env?.VITE_GOOGLE_SITE_VERIFICATION;
    if (typeof gscToken === 'string' && gscToken.trim()) {
      upsertMetaTag('name', 'google-site-verification', gscToken.trim());
    }
  } catch {
    // ignore env lookup error
  }
}
