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

const DEFAULT_TITLE = 'Peaceverse24 — Peace in Every Video';
const DEFAULT_DESCRIPTION =
  'Peaceverse24 — Peace in Every Video. Halal YouTube-style videos, Peace Shorts, and 6-seat Peace Live for Bangladesh & Worldwide.';

const CANONICAL_PRODUCTION_ORIGIN = 'https://peaceverse24.com';

function resolveSeoMetadata({ path, tab, isAdminView }: PageSeoInput): SeoMetadata {
  if (isAdminView || path.startsWith('/admin')) {
    return {
      title: 'PeaceVerse24 - Admin Portal',
      description: DEFAULT_DESCRIPTION,
      canonicalPath: '/',
      robots: 'noindex, nofollow',
    };
  }

  if (path === '/blog') {
    return {
      title: 'PeaceVerse24 Blog - শান্তি, ভালোবাসা আর পজিটিভ গল্প | peaceverse24.com',
      description:
        'PeaceVerse24 ব্লগে শান্তি, ভালোবাসা, বন্ধুত্ব ও পজিটিভ জীবনের অনুপ্রেরণামূলক লেখা পড়ুন এবং নিজের মনের কথা শেয়ার করুন।',
      canonicalPath: '/blog',
    };
  }

  if (path === '/login') {
    return {
      title: 'PeaceVerse24 - লগইন | শান্তি, ভালোবাসা আর পজিটিভ কমিউনিটি',
      description: DEFAULT_DESCRIPTION,
      canonicalPath: '/login',
    };
  }

  if (path === '/signup') {
    return {
      title: 'PeaceVerse24 - নতুন অ্যাকাউন্ট তৈরি করুন | peaceverse24.com',
      description: DEFAULT_DESCRIPTION,
      canonicalPath: '/signup',
    };
  }

  switch (tab) {
    case 'reels':
    case 'watch':
      return {
        title: 'PeaceVerse24 - পজিটিভ ভিডিও ও রিলস | peaceverse24.com',
        description:
          'PeaceVerse24-এ পজিটিভ, শিক্ষামূলক ও প্রশান্তিময় ভিডিও ও রিলস দেখুন। শান্তি আর ভালোবাসার কমিউনিটিতে যুক্ত থাকুন।',
        canonicalPath: '/?tab=reels',
      };
    case 'friends':
      return {
        title: 'PeaceVerse24 - নতুন বন্ধু বানাও | শান্তি আর ভালোবাসার কমিউনিটি',
        description: DEFAULT_DESCRIPTION,
        canonicalPath: '/?tab=friends',
      };
    case 'marketplace':
      return {
        title: 'PeaceVerse24 - পিস মার্ট | শান্তি, ভালোবাসা আর পজিটিভ কমিউনিটি',
        description: DEFAULT_DESCRIPTION,
        canonicalPath: '/?tab=marketplace',
      };
    case 'groups':
      return {
        title: 'PeaceVerse24 - কমিউনিটি গ্রুপ | peaceverse24.com',
        description: DEFAULT_DESCRIPTION,
        canonicalPath: '/?tab=groups',
      };
    case 'pages':
      return {
        title: 'PeaceVerse24 - পেজ ও চ্যানেল | peaceverse24.com',
        description: DEFAULT_DESCRIPTION,
        canonicalPath: '/?tab=pages',
      };
    case 'notifications':
      return {
        title: 'PeaceVerse24 - নোটিফিকেশন | peaceverse24.com',
        description: DEFAULT_DESCRIPTION,
        canonicalPath: '/?tab=notifications',
      };
    case 'profile':
      return {
        title: 'PeaceVerse24 - প্রোফাইল | শান্তি, ভালোবাসা আর পজিটিভ কমিউনিটি',
        description: DEFAULT_DESCRIPTION,
        canonicalPath: '/?tab=profile',
      };
    case 'menu':
      return {
        title: 'PeaceVerse24 - মেনু ও ব্লগ | peaceverse24.com',
        description: DEFAULT_DESCRIPTION,
        canonicalPath: '/?tab=menu',
      };
    case 'home':
      return {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        canonicalPath: '/home',
      };
    default:
      return {
        title: DEFAULT_TITLE,
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
  const fullUrl = `${CANONICAL_PRODUCTION_ORIGIN}${meta.canonicalPath}`;

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
