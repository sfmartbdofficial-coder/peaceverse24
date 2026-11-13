import React, { useState, useEffect, useMemo } from 'react';
import {
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_CHAT_FRIENDS,
  USER_PROFILE
} from './data/islamicPosts';
import {
  PostItem,
  StoryItem,
  ChatFriend,
  NotificationItem,
  FacebookMainTab,
  ReactionType,
  UserProfile,
  GoldenCashoutRequest,
  PageItem,
} from './types';
import { FbHeader } from './components/facebook/FbHeader';
import { FbCreatePostBox } from './components/facebook/FbCreatePostBox';
import { FbStories } from './components/facebook/FbStories';
import { FbPostCard } from './components/facebook/FbPostCard';
import { FbCreatePostModal } from './components/facebook/FbCreatePostModal';
import { FbCreateStoryModal } from './components/facebook/FbCreateStoryModal';
import { FbCreateReelModal } from './components/facebook/FbCreateReelModal';
import { FbTikTokReelsModal } from './components/facebook/FbTikTokReelsModal';
import { FbLiveModal } from './components/facebook/FbLiveModal';
import { FbNotificationsView } from './components/facebook/FbNotificationsView';
import { FbProfileView } from './components/facebook/FbProfileView';
import { FbMenuView } from './components/facebook/FbMenuView';
import { FbFriendsView } from './components/facebook/FbFriendsView';
import { FbMarketplaceView } from './components/facebook/FbMarketplaceView';
import { FbWatchView } from './components/facebook/FbWatchView';
import { FbBottomNav } from './components/facebook/FbBottomNav';
import { FbMessengerModal } from './components/facebook/FbMessengerModal';
import { FbSavedPostsView } from './components/facebook/FbSavedPostsView';
import { FbGroupsView } from './components/facebook/FbGroupsView';
import { FbPagesView } from './components/facebook/FbPagesView';
import { FbMemoriesView } from './components/facebook/FbMemoriesView';
import { PeaceThreadsView } from './components/facebook/PeaceThreadsView';
import { PeaceInstaView } from './components/facebook/PeaceInstaView';
import { PeaceBusinessSuiteView } from './components/facebook/PeaceBusinessSuiteView';
import { PeaceEditsModal } from './components/facebook/PeaceEditsModal';
import { HalalGuaranteeModal } from './components/HalalGuaranteeModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { LegalModal, LegalTabType } from './components/legal/LegalModal';
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';
import { PWAInstallModal } from './components/pwa/PWAInstallModal';
import { CreatorMonetizationModal } from './components/monetization/CreatorMonetizationModal';
import { FirebaseAuthModal } from './components/auth/FirebaseAuthModal';
import { FbGoldenGiftModal } from './components/golden/FbGoldenGiftModal';
import { GoldenWalletModal } from './components/wallet/GoldenWalletModal';
import { useLanguage } from './context/LanguageContext';
import { INITIAL_ADS } from './data/adminData';
import { AdSlot } from './types/admin';
import { ArrowLeft, Globe, Users, Lock, Sparkles, Film, Loader2, Zap, Compass, BookOpen, Clock } from 'lucide-react';
import { onAuthStateChanged, updateProfile, sendEmailVerification, User as FirebaseUser } from 'firebase/auth';
import { PeaceVerseLanding } from './components/landing/PeaceVerseLanding';
import { PeaceVerseAuthPage } from './components/landing/PeaceVerseAuthPage';
import { PeaceDoveEmblem } from './components/landing/PeaceDoveEmblem';
import { GlobalPrayerQiblaView } from './components/global/GlobalPrayerQiblaView';
import {
  GLOBAL_CITIES,
  GlobalCity,
  PrayerSchedule,
  detectUserGlobalCity,
  fetchPrayerTimesForCity,
  getDailyQuranVerse,
} from './lib/globalPrayer';
import { fetchSupabasePosts, fetchSupabaseStories, insertSupabasePost } from './lib/supabase';
import {
  auth,
  logoutUser,
  testFirebaseConnection,
  seedInitialPostsIfEmpty,
  subscribeToRealtimePosts,
  subscribeToRealtimeNotifications,
  toggleRealtimeReaction,
  addRealtimeComment,
  setRealtimeTypingStatus,
  moderateRealtimePost,
  deleteRealtimePost,
  createRealtimePost,
  markNotificationAsRead,
  markAllRealtimeNotificationsRead,
  saveUserProfileToFirestore,
  fetchUserProfileFromFirestore,
  fetchUserProfileByNameFromFirestore,
} from './lib/firebase';
import {
  registerPushServiceWorker,
  subscribeToForegroundFcm,
  broadcastCreatorNotification,
} from './lib/fcm';
import { loadPeaceSettings } from './utils/settingsStorage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<FacebookMainTab>('home');
  const [tabHistory, setTabHistory] = useState<FacebookMainTab[]>(['home']);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewedProfile, setViewedProfile] = useState<UserProfile | null>(null);

  // Modals state
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [initialPostPhoto, setInitialPostPhoto] = useState<string | null>(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showCreateReel, setShowCreateReel] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const [showHalalPolicy, setShowHalalPolicy] = useState(false);
  const [activeReelPostId, setActiveReelPostId] = useState<string | null>(null);
  const { currentLang } = useLanguage();
  const [globalCity, setGlobalCity] = useState<GlobalCity>(GLOBAL_CITIES[0]);
  const [globalPrayerSchedule, setGlobalPrayerSchedule] = useState<PrayerSchedule | null>(null);

  useEffect(() => {
    let active = true;
    detectUserGlobalCity().then((detected) => {
      if (active) {
        setGlobalCity(detected);
        fetchPrayerTimesForCity(detected).then((res) => {
          if (active) setGlobalPrayerSchedule(res);
        });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Active Switched Page State (Matching Facebook Screenshot 3)
  const [activeSwitchedPage, setActiveSwitchedPage] = useState<PageItem | null>(() => {
    try {
      const saved = localStorage.getItem('qalby_switched_page');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [selectedPageIdToOpen, setSelectedPageIdToOpen] = useState<string | null>(null);

  const handleSwitchToPage = (page: PageItem) => {
    setActiveSwitchedPage(page);
    setSelectedPageIdToOpen(page.id);
    try {
      localStorage.setItem('qalby_switched_page', JSON.stringify(page));
    } catch {}
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchToPersonal = () => {
    setActiveSwitchedPage(null);
    setSelectedPageIdToOpen(null);
    try {
      localStorage.removeItem('qalby_switched_page');
    } catch {}
  };
  // Google Play Store & Legal Policy Modal state (supports direct hash: #about, #privacy, #terms, #guidelines, #delete-account, #contact)
  const [legalModalTab, setLegalModalTab] = useState<LegalTabType | null>(() => {
    const hash = window.location.hash.replace('#', '');
    if (['about', 'privacy', 'terms', 'guidelines', 'delete-account', 'contact'].includes(hash)) {
      return hash as LegalTabType;
    }
    return null;
  });

  // PWA In-App Install Modal state (supports direct #install hash)
  const [showInstallModal, setShowInstallModal] = useState(() => {
    return window.location.hash === '#install';
  });

  // Creator Monetization Modal state (supports direct #monetization or #creator-studio hash)
  const [showMonetizationModal, setShowMonetizationModal] = useState(() => {
    return window.location.hash === '#monetization' || window.location.hash === '#creator-studio';
  });

  // Firebase Authentication Modal state (supports #login or #auth hash)
  const [showAuthModal, setShowAuthModal] = useState(() => {
    return window.location.hash === '#login' || window.location.hash === '#auth';
  });

  // Golden Gift & Wallet state
  const [selectedGiftPost, setSelectedGiftPost] = useState<PostItem | null>(null);
  const [showGoldenWallet, setShowGoldenWallet] = useState(false);
  const [cashoutRequests, setCashoutRequests] = useState<GoldenCashoutRequest[]>(() => {
    try {
      const saved = localStorage.getItem('qalby_golden_cashouts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'cashout-sample-1',
        userId: 'user-me',
        userName: 'Siddik',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        coinsAmount: 50,
        moneyAmount: 50,
        paymentMethod: 'bkash',
        accountNumber: '01712345678',
        status: 'pending',
        requestedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ];
  });

  const persistCashouts = (reqs: GoldenCashoutRequest[]) => {
    setCashoutRequests(reqs);
    try {
      localStorage.setItem('qalby_golden_cashouts', JSON.stringify(reqs));
    } catch {}
  };

  // Admin Portal state with direct #admin or #asol-admin-secret or /asol-admin-secret URL support
  const checkIsAdmin = () => {
    const hash = window.location.hash.replace('#', '');
    const path = window.location.pathname;
    return (
      hash === 'admin' ||
      hash === 'asol-admin-secret' ||
      path.includes('asol-admin-secret') ||
      window.location.search.includes('panel=admin')
    );
  };

  const [showAdminPortal, setShowAdminPortal] = useState(() => checkIsAdmin());
  const [feedPrivacyFilter, setFeedPrivacyFilter] = useState<'all' | 'public' | 'friends' | 'private'>('all');

  // Path-based routing for Landing (/), Login (/login), Signup (/signup), and Home (/home)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  const navigateToPath = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync Firebase Auth State & Enforce Landing / Home redirection rules
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      setFirebaseUser(usr);
      setIsAuthChecking(false);
      if (usr) {
        const savedName = localStorage.getItem('peaceverse_registered_name');
        const emailFallback = usr.email ? usr.email.split('@')[0] : 'Member';
        const resolvedName =
          usr.displayName && usr.displayName !== 'Sharif Hasan'
            ? usr.displayName
            : savedName || (usr.email ? emailFallback : 'Member');

        if (!usr.displayName && resolvedName) {
          updateProfile(usr, { displayName: resolvedName }).catch(() => {});
        }

        const resolvedAvatar =
          usr.photoURL ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedName)}&backgroundColor=1877f2,0ea5e9,3b82f6`;

        setUserProfile((prev) => ({
          ...prev,
          id: usr.uid,
          name: resolvedName,
          email: usr.email || prev.email,
          avatar: resolvedAvatar,
          friendsCount: prev.friendsCount || 331,
          location: prev.location || 'Dhaka, Bangladesh',
          hometown: prev.hometown || 'Dhaka, Bangladesh',
          birthDate: prev.birthDate || 'August 17, 1991',
          relationship: prev.relationship || 'Married',
        }));

        fetchUserProfileFromFirestore(usr.uid).then((remote) => {
          if (!remote) return;
          setUserProfile((prev) => ({
            ...prev,
            whatsapp: prev.whatsapp || remote.whatsapp || '',
            imo: prev.imo || remote.imo || '',
            viber: prev.viber || remote.viber || '',
            messengerLink: prev.messengerLink || remote.messengerLink || '',
            contactPrivacy: prev.contactPrivacy || remote.contactPrivacy || 'public',
            bio: prev.bio || remote.bio || '',
            work: prev.work || remote.work || '',
            education: prev.education || remote.education || '',
            website: prev.website || remote.website || '',
          }));
        });
        // Rule: If user IS logged in (Firebase Auth), auto redirect to "/home" when visiting root "/"
        const path = window.location.pathname;
        if (path === '/' || path === '') {
          navigateToPath('/home');
        }
      } else {
        // Rule: If user is NOT logged in, redirect any /home visit back to "/"
        const path = window.location.pathname;
        if (path === '/home') {
          navigateToPath('/');
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (checkIsAdmin()) {
        setShowAdminPortal(true);
        setLegalModalTab(null);
        setShowInstallModal(false);
        setShowMonetizationModal(false);
        setShowAuthModal(false);
      } else if (hash === 'install') {
        setShowInstallModal(true);
        setShowAdminPortal(false);
      } else if (hash === 'login' || hash === 'auth') {
        setShowAuthModal(true);
        setShowAdminPortal(false);
      } else if (hash === 'monetization' || hash === 'creator-studio') {
        setShowMonetizationModal(true);
        setShowAdminPortal(false);
        setShowInstallModal(false);
        setShowAuthModal(false);
        setLegalModalTab(null);
      } else if (['about', 'privacy', 'terms', 'guidelines', 'delete-account', 'contact'].includes(hash)) {
        setLegalModalTab(hash as LegalTabType);
        setShowAdminPortal(false);
        setShowInstallModal(false);
        setShowMonetizationModal(false);
        setShowAuthModal(false);
      } else {
        setShowAdminPortal(false);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Email verification state and handlers
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);

  const handleResendEmailVerification = async () => {
    if (!firebaseUser) return;
    try {
      await sendEmailVerification(firebaseUser);
      setVerificationNotice('ভেরিফিকেশন লিঙ্ক পুনরায় আপনার ইমেইলে পাঠানো হয়েছে। ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।');
      setTimeout(() => setVerificationNotice(null), 6000);
    } catch (err: any) {
      setVerificationNotice(err?.message || 'লিঙ্ক পাঠাতে সমস্যা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।');
      setTimeout(() => setVerificationNotice(null), 5000);
    }
  };

  const handleCheckEmailVerified = async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    setFirebaseUser({ ...auth.currentUser });
    if (auth.currentUser.emailVerified) {
      setVerificationNotice('আলহামদুলিল্লাহ! আপনার ইমেইল সফলভাবে ভেরিফাই হয়েছে।');
      setTimeout(() => setVerificationNotice(null), 5000);
    } else {
      setVerificationNotice('আপনার ইমেইল এখনও ভেরিফাই হয়নি। দয়া করে আপনার ইমেইল ইনবক্সে পাঠানো লিঙ্কে ক্লিক করুন।');
      setTimeout(() => setVerificationNotice(null), 5000);
    }
  };

  const [activeAds] = useState<AdSlot[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_admin_ads');
      return stored ? JSON.parse(stored) : INITIAL_ADS;
    } catch {
      return INITIAL_ADS;
    }
  });

  // User Profile with localStorage persistence
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('qalby_user_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...USER_PROFILE,
          ...parsed,
          friendsCount: parsed.friendsCount === 330 ? 0 : (parsed.friendsCount || 0),
          bio: parsed.bio && parsed.bio.includes('আলহামদুলিল্লাহ আলা কুল্লি হাল') ? '' : (parsed.bio || ''),
          location: parsed.location && parsed.location === 'Dhaka, Bangladesh' ? '' : (parsed.location || ''),
        };
      }
      return USER_PROFILE;
    } catch {
      return USER_PROFILE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('qalby_user_profile', JSON.stringify(userProfile));
    } catch {}
  }, [userProfile]);

  // Effective profile when switched into a Page (Matching Screenshot 3)
  const effectiveProfile: UserProfile = useMemo(() => {
    if (activeSwitchedPage) {
      return {
        ...userProfile,
        name: activeSwitchedPage.name,
        avatar: activeSwitchedPage.avatar,
      };
    }
    return userProfile;
  }, [userProfile, activeSwitchedPage]);

  // Messenger State
  const [chatFriends, setChatFriends] = useState<ChatFriend[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_chat_friends');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return INITIAL_CHAT_FRIENDS;
    } catch {
      return INITIAL_CHAT_FRIENDS;
    }
  });
  const [showMessengerModal, setShowMessengerModal] = useState<boolean>(false);
  const [activeChatFriend, setActiveChatFriend] = useState<ChatFriend | null>(null);

  // Dynamic unread messages count
  const unreadMessagesCount = useMemo(() => {
    return chatFriends.reduce((sum, f) => sum + (f.unreadCount || 0), 0);
  }, [chatFriends]);

  // Theme State: Default is LIGHT/WHITE theme for international users
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('peaceverse_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = (val: boolean) => {
    setIsDarkMode(val);
    try {
      localStorage.setItem('peaceverse_dark_mode', String(val));
    } catch {}
  };

  // Stories (100% empty by default per Part 1 cleanup - genuine stories load from Supabase / uploads)
  const [stories, setStories] = useState<StoryItem[]>([]);

  // Posts Feed (Loads user's first post and any newly created posts)
  const [posts, setPosts] = useState<PostItem[]>(() => {
    try {
      const stored = localStorage.getItem('peaceverse_posts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          Array.isArray(parsed) &&
          !parsed.some(
            (p) =>
              p.id?.includes('post-sohel') ||
              p.id?.includes('post-hadith') ||
              p.id?.includes('post-mishary') ||
              p.id?.includes('post-live-makkah')
          )
        ) {
          // If stored doesn't have the user's first post, ensure it is included
          if (!parsed.some((p: PostItem) => p.contentBangla?.includes('পরিবারের সদস্য'))) {
            return [...INITIAL_POSTS, ...parsed];
          }
          return parsed;
        }
      }
      return INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  // Infinite Scroll state: load 10 videos/posts at a time, scroll down to load next 10
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const bottomSentinelRef = React.useRef<HTMLDivElement | null>(null);
  const supabasePageRef = React.useRef<number>(0);
  const hasMoreSupabaseRef = React.useRef<boolean>(true);
  const isFetchingMoreRef = React.useRef<boolean>(false);

  // Notifications with Real-time synchronization
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Initialize Supabase & Firebase listeners
  useEffect(() => {
    testFirebaseConnection();

    // 1. Fetch genuine posts from Supabase "posts" table (ORDER BY created_at DESC)
    fetchSupabasePosts(0, 20).then((spPosts) => {
      if (spPosts.length > 0) {
        setPosts((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const additions = spPosts.filter((p) => !ids.has(p.id));
          return [...prev, ...additions];
        });
      }
    });

    // 2. Fetch genuine stories from Supabase "stories" table
    fetchSupabaseStories().then((spStories) => {
      if (spStories.length > 0) {
        setStories(spStories);
      }
    });

    // 3. Sync real-time Firestore posts (filter out any legacy dummy posts)
    const unsubPosts = subscribeToRealtimePosts((livePosts) => {
      const cleanPosts = livePosts.filter(
        (p) =>
          !p.id?.includes('post-sohel') &&
          !p.id?.includes('post-hadith') &&
          !p.id?.includes('post-mishary') &&
          !p.id?.includes('post-live-makkah')
      );
      setPosts((prev) => {
        const map = new Map<string, PostItem>();
        prev.forEach((p) => map.set(p.id, p));
        cleanPosts.forEach((p) => map.set(p.id, p));
        return Array.from(map.values()).sort((a: any, b: any) => {
          const tA = new Date(a.createdAt || a.createdAtMillis || 0).getTime();
          const tB = new Date(b.createdAt || b.createdAtMillis || 0).getTime();
          return tB - tA;
        });
      });
    });

    const unsubNotifs = subscribeToRealtimeNotifications((liveNotifs) => {
      setNotifications(liveNotifs);
    });

    // 4. Register Firebase FCM / Web Push Service Worker & foreground listener
    registerPushServiceWorker();
    let unsubFcm = () => {};
    subscribeToForegroundFcm((item) => {
      setNotifications((prev) => (prev.some((n) => n.id === item.id) ? prev : [item, ...prev]));
    }).then((unsub) => {
      unsubFcm = unsub;
    });

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PEACEVERSE_OPEN_POST') {
        const targetId = event.data.postId;
        if (targetId) {
          setCurrentTab('home');
          setTimeout(() => {
            const el = document.getElementById(`post-${targetId}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    return () => {
      unsubPosts();
      unsubNotifs();
      unsubFcm();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
    };
  }, []);

  // Pull-to-refresh & silent background refresh state (no visible button)
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartYRef = React.useRef<number | null>(null);

  const refreshFeedSilently = React.useCallback(async () => {
    try {
      const [spPosts, spStories] = await Promise.all([
        fetchSupabasePosts(0, 20),
        fetchSupabaseStories(),
      ]);

      if (spPosts.length > 0) {
        setPosts((prev) => {
          const map = new Map<string, PostItem>();
          prev.forEach((p) => map.set(p.id, p));
          spPosts.forEach((p) => map.set(p.id, p));
          return Array.from(map.values()).sort((a: any, b: any) => {
            const tA = new Date(a.createdAt || a.createdAtMillis || 0).getTime();
            const tB = new Date(b.createdAt || b.createdAtMillis || 0).getTime();
            return tB - tA;
          });
        });
      }

      if (spStories.length > 0) {
        setStories(spStories);
      }
    } catch {
      // Silent background refresh
    }
  }, []);

  // Silent background refresh every 60 seconds without any UI button
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      refreshFeedSilently();
    }, 60000);
    return () => window.clearInterval(intervalId);
  }, [refreshFeedSilently]);

  // Infinite Scroll IntersectionObserver: loads next 10 videos/posts as user scrolls down
  useEffect(() => {
    if (currentTab !== 'home') return;
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          // Reveal next 10 videos/posts from feed
          setVisibleCount((prev) => prev + 10);

          // Fetch next batch from Supabase if available
          if (hasMoreSupabaseRef.current && !isFetchingMoreRef.current) {
            isFetchingMoreRef.current = true;
            supabasePageRef.current += 1;
            fetchSupabasePosts(supabasePageRef.current, 10)
              .then((morePosts) => {
                if (morePosts.length === 0) {
                  hasMoreSupabaseRef.current = false;
                } else {
                  setPosts((prev) => {
                    const ids = new Set(prev.map((p) => p.id));
                    const newPosts = morePosts.filter((p) => !ids.has(p.id));
                    return [...prev, ...newPosts];
                  });
                }
              })
              .finally(() => {
                isFetchingMoreRef.current = false;
              });
          }
        }
      },
      { rootMargin: '350px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [posts.length, currentTab]);

  useEffect(() => {
    try {
      localStorage.setItem('peaceverse_posts', JSON.stringify(posts));
    } catch {}
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem('qalby_chat_friends', JSON.stringify(chatFriends));
    } catch {}
  }, [chatFriends]);

  // Navigate to tab with history tracking
  const navigateToTab = (newTab: FacebookMainTab) => {
    if (newTab !== 'profile') {
      setViewedProfile(null);
    }
    if (newTab === currentTab) return;
    setTabHistory((prev) => [...prev, newTab]);
    setCurrentTab(newTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back button handler
  const goBack = () => {
    if (tabHistory.length > 1) {
      const nextHistory = [...tabHistory];
      nextHistory.pop(); // remove current tab
      const previous = nextHistory[nextHistory.length - 1] || 'home';
      setTabHistory(nextHistory);
      setCurrentTab(previous);
    } else {
      setCurrentTab('home');
      setTabHistory(['home']);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle post reaction toggle with Realtime Firestore sync
  const handleToggleReaction = (postId: string, reaction: ReactionType) => {
    const post = posts.find((p) => p.id === postId);
    const currentReaction = post?.userReaction;

    const getCountKey = (r: ReactionType) => {
      switch (r) {
        case 'like': return 'likeCount' as const;
        case 'love': return 'loveCount' as const;
        case 'subhanallah': return 'subhanallahCount' as const;
        case 'mashaallah': return 'mashaallahCount' as const;
        case 'care': return 'careCount' as const;
        case 'sad': return 'sadCount' as const;
      }
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isSameReaction = p.userReaction === reaction;
          const nextReaction = isSameReaction ? null : reaction;
          const totalDiff = isSameReaction ? -1 : p.userReaction ? 0 : 1;
          const nextCounts = { ...p.reactions };

          if (p.userReaction) {
            const oldKey = getCountKey(p.userReaction);
            nextCounts[oldKey] = Math.max(0, (nextCounts[oldKey] || 0) - 1);
          }
          if (nextReaction) {
            const newKey = getCountKey(nextReaction);
            nextCounts[newKey] = (nextCounts[newKey] || 0) + 1;
          }

          return {
            ...p,
            userReaction: nextReaction,
            reactions: {
              ...nextCounts,
              total: Math.max(0, p.reactions.total + totalDiff),
            },
          };
        }
        return p;
      })
    );

    // Sync to Firestore
    toggleRealtimeReaction(postId, userProfile.name, userProfile.avatar, reaction, currentReaction);
  };

  // Handle post save
  const handleToggleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
    );
  };

  // Handle comment submit with Realtime Firestore sync
  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      author: userProfile.name,
      avatar: userProfile.avatar,
      text,
      timeAgo: 'Just now',
      likes: 1,
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [newComment, ...p.comments] } : p
      )
    );

    const post = posts.find((p) => p.id === postId);
    addRealtimeComment(postId, newComment, post?.author.name);
  };

  // Handle sending golden gift coins
  const handleSendGoldenGift = (postId: string, amount: number, message?: string) => {
    const currentCoins = userProfile.goldenCoins ?? 120;
    if (currentCoins < amount) {
      return false;
    }

    // 1. Deduct coins from sender
    setUserProfile((prev) => ({
      ...prev,
      goldenCoins: Math.max(0, (prev.goldenCoins ?? 120) - amount),
    }));

    // 2. Update post golden gifts count
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            goldenGiftsCount: (p.goldenGiftsCount || 0) + amount,
            goldenGiftsAmount: (p.goldenGiftsAmount || 0) + amount,
          };
        }
        return p;
      })
    );

    // 3. If gifting own post, add to earnedCoins; or credit creator
    const targetPost = posts.find((p) => p.id === postId);
    if (targetPost && (targetPost.author.name === userProfile.name || targetPost.authorId === userProfile.id)) {
      setUserProfile((prev) => ({
        ...prev,
        earnedCoins: (prev.earnedCoins ?? 65) + amount,
      }));
    }

    // 4. Create in-app celebration notification
    const giftNotif: NotificationItem = {
      id: `notif-gift-${Date.now()}`,
      type: 'general',
      avatar: userProfile.avatar,
      title: `${userProfile.name} ${amount}টি গোল্ডেন কয়েন হাদিয়া দিয়েছেন! 🪙✨`,
      subtitle: message || 'মাশাআল্লাহ! চমৎকার ভিডিওটির জন্য হাদিয়া পাঠিয়েছেন।',
      timeAgo: 'এখনই',
      isUnread: true,
      badgeType: 'heart',
      postId,
    };
    setNotifications((prev) => [giftNotif, ...prev]);

    return true;
  };

  // Handle adding golden coins (recharge)
  const handleAddGoldenCoins = (amount: number) => {
    setUserProfile((prev) => ({
      ...prev,
      goldenCoins: (prev.goldenCoins ?? 0) + amount,
    }));
  };

  // Handle requesting cashout to bKash / Nagad
  const handleRequestCashout = (reqData: Omit<GoldenCashoutRequest, 'id' | 'status'>) => {
    const newReq: GoldenCashoutRequest = {
      ...reqData,
      id: `cashout-${Date.now()}`,
      status: 'pending',
    };

    // Deduct coins from user's earnedCoins
    setUserProfile((prev) => ({
      ...prev,
      earnedCoins: Math.max(0, (prev.earnedCoins ?? 0) - reqData.coinsAmount),
    }));

    const updated = [newReq, ...cashoutRequests];
    persistCashouts(updated);
    return true;
  };

  // Admin handles cashout approval & rejection
  const handleApproveGoldenCashout = (id: string) => {
    const updated = cashoutRequests.map((r) =>
      r.id === id ? { ...r, status: 'approved' as const, processedAt: new Date().toISOString() } : r
    );
    persistCashouts(updated);
  };

  const handleRejectGoldenCashout = (id: string) => {
    const target = cashoutRequests.find((r) => r.id === id);
    if (target && target.status === 'pending') {
      setUserProfile((prev) => ({
        ...prev,
        earnedCoins: (prev.earnedCoins ?? 0) + target.coinsAmount,
      }));
    }
    const updated = cashoutRequests.map((r) =>
      r.id === id ? { ...r, status: 'rejected' as const, processedAt: new Date().toISOString() } : r
    );
    persistCashouts(updated);
  };

  // Handle real-time typing status
  const handleTypingChange = (postId: string, isTyping: boolean) => {
    setRealtimeTypingStatus(postId, userProfile.name, userProfile.name, isTyping);
  };

  // Handle post moderation (block, reject, approve)
  const handleModeratePost = (
    postId: string,
    status: 'approved' | 'blocked' | 'rejected',
    reason: string
  ) => {
    const post = posts.find((p) => p.id === postId);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              status,
              moderationReason: reason,
              appealStatus: status === 'approved' ? 'resolved' : p.appealStatus,
            }
          : p
      )
    );
    moderateRealtimePost(postId, status, reason, post?.author.name);
  };

  const addLocalBroadcastNotification = React.useCallback((item: NotificationItem) => {
    setNotifications((prev) => (prev.some((n) => n.id === item.id) ? prev : [item, ...prev]));
  }, []);

  const handleOpenNotification = React.useCallback(
    (notif: NotificationItem) => {
      // Mark read locally & in Firestore
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isUnread: false, read: true } : n))
      );
      markNotificationAsRead(notif.id);

      if (notif.link?.includes('tab=marketplace')) {
        navigateToTab('marketplace');
        return;
      }
      if (notif.link?.includes('tab=pages')) {
        navigateToTab('pages');
        return;
      }
      if (notif.link?.includes('tab=reels')) {
        navigateToTab('reels');
        return;
      }

      if (notif.postId) {
        const matched = posts.find((p) => p.id === notif.postId);
        if (matched && matched.mediaType === 'video') {
          setActiveReelPostId(matched.id);
          return;
        }
        navigateToTab('home');
        setTimeout(() => {
          const el = document.getElementById(`post-${notif.postId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 250);
        return;
      }

      navigateToTab('home');
    },
    [posts]
  );

  // Handle new post created (triggers Creator Broadcast /api/notify-all when enabled)
  const handlePostCreated = (newPost: PostItem) => {
    setPosts((prev) => [newPost, ...prev]);
    insertSupabasePost(newPost);
    createRealtimePost(newPost);
    setShowCreatePost(false);
    navigateToTab('home');

    const prefs = loadPeaceSettings();
    if (prefs.creatorNotifyFollowersOnPost && (newPost.privacy || 'public') === 'public') {
      const contentType =
        newPost.mediaType === 'video' ? 'video' : newPost.mediaType === 'image' ? 'photo' : 'post';
      const creatorName = newPost.author?.name || 'প্রিয় দাদা';
      broadcastCreatorNotification({
        creatorId: newPost.authorId || activeSwitchedPage?.id || effectiveProfile.id || creatorName,
        creatorName,
        creatorAvatar: newPost.author?.avatar || effectiveProfile.avatar,
        contentType,
        title:
          contentType === 'video'
            ? `${creatorName} নতুন ভিডিও আপলোড করেছেন`
            : contentType === 'photo'
            ? `${creatorName} নতুন ছবি আপলোড করেছেন`
            : `${creatorName} নতুন পোস্ট আপলোড করেছেন`,
        body:
          newPost.contentBangla?.trim().slice(0, 95) ||
          '১০০% হালাল পণ্যের নতুন কালেকশন ও পোস্ট দেখুন',
        thumbnail: newPost.mediaUrl,
        postId: newPost.id,
        link: `/?postId=${newPost.id}`,
        broadcastToAll: prefs.creatorSendPushToAllUsers,
        onLocalNotify: addLocalBroadcastNotification,
      });
    }
  };

  // Handle new story created
  const handleStoryCreated = (newStory: StoryItem) => {
    setStories((prev) => [newStory, ...prev]);
    setShowCreateStory(false);
    navigateToTab('home');
  };

  // Handle new reel created (triggers Creator Broadcast /api/notify-all when enabled)
  const handleReelCreated = (newReel: PostItem) => {
    setPosts((prev) => [newReel, ...prev]);
    insertSupabasePost(newReel);
    createRealtimePost(newReel);
    setShowCreateReel(false);
    navigateToTab('reels');

    const prefs = loadPeaceSettings();
    if (prefs.creatorNotifyFollowersOnPost) {
      const creatorName = newReel.author?.name || 'প্রিয় দাদা';
      broadcastCreatorNotification({
        creatorId: newReel.authorId || activeSwitchedPage?.id || effectiveProfile.id || creatorName,
        creatorName,
        creatorAvatar: newReel.author?.avatar || effectiveProfile.avatar,
        contentType: 'video',
        title: `${creatorName} নতুন ভিডিও আপলোড করেছেন`,
        body:
          newReel.contentBangla?.trim().slice(0, 95) ||
          '১০০% হালাল পণ্যের নতুন কালেকশন দেখুন',
        thumbnail: newReel.mediaUrl,
        postId: newReel.id,
        link: `/?tab=reels&postId=${newReel.id}`,
        broadcastToAll: prefs.creatorSendPushToAllUsers,
        onLocalNotify: addLocalBroadcastNotification,
      });
    }
  };

  // Handle new live created
  const handleLiveCreated = (newLive: PostItem) => {
    setPosts((prev) => [newLive, ...prev]);
    setShowLive(false);
    navigateToTab('home');
  };

  // Handle edit post
  const handleEditPost = (postId: string, newContent: string, newArabic?: string, newTranslation?: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            contentBangla: newContent,
            arabicVerse: newArabic !== undefined ? newArabic : p.arabicVerse,
            translation: newTranslation !== undefined ? newTranslation : p.translation,
          };
        }
        return p;
      })
    );
  };

  // Handle delete post with Realtime Firestore sync
  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    deleteRealtimePost(postId);
  };

  // Handle friend confirmation in notifications
  const handleConfirmRequest = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isUnread: false } : n))
    );
    setUserProfile((prev: UserProfile) => ({ ...prev, friendsCount: prev.friendsCount + 1 }));
  };

  // Handle friend delete in notifications
  const handleDeleteRequest = (notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  // Handle send message
  const handleSendMessage = (friendId: string, text: string) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'me' as const,
      text,
      time: 'Just now',
    };

    setChatFriends((prev) =>
      prev.map((f) => {
        if (f.id === friendId) {
          return { ...f, messages: [...f.messages, newMsg] };
        }
        return f;
      })
    );

    setActiveChatFriend((prev) =>
      prev && prev.id === friendId ? { ...prev, messages: [...prev.messages, newMsg] } : prev
    );

    // Interactive friend reply simulation
    setTimeout(() => {
      const replies = [
        'ওয়ালাইকুম আসসালাম! কেমন আছেন ভাই?',
        'আলহামদুলিল্লাহ ভাই, মেসেজ পেলাম। Peaceverse-এ আপনার পোস্টটা দারুণ হয়েছে!',
        'জাযাকাল্লাহ খাইরান ভাই! ইনশাআল্লাহ সবসময় দোয়া রইলো।',
        'মাশাআল্লাহ ভাই! ধন্যবাদ যোগাযোগের জন্য।',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyMsg = {
        id: `reply-${Date.now()}`,
        sender: 'them' as const,
        text: randomReply,
        time: 'Just now',
      };

      setChatFriends((prev) =>
        prev.map((f) => {
          if (f.id === friendId) {
            return { ...f, messages: [...f.messages, replyMsg] };
          }
          return f;
        })
      );

      setActiveChatFriend((prev) =>
        prev && prev.id === friendId ? { ...prev, messages: [...prev.messages, replyMsg] } : prev
      );
    }, 1000);
  };

  // Privacy and search filtered posts for Feed
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchBangla = p.contentBangla?.toLowerCase().includes(q);
        const matchAuthor = p.author?.name?.toLowerCase().includes(q);
        const matchArabic = p.arabicVerse && p.arabicVerse.includes(q);
        if (!matchBangla && !matchAuthor && !matchArabic) return false;
      }

      const privacy = p.privacy || (p.isPublic ? 'public' : 'friends');
      const isAuthor = p.author.name === userProfile.name;

      // Rejected posts are hidden from feed
      if (p.status === 'rejected' && !isAuthor) {
        return false;
      }

      // "Only Me" (private) posts: ONLY author can see in feed!
      if (privacy === 'private' && !isAuthor) {
        return false;
      }

      // Filter by privacy chip
      if (feedPrivacyFilter === 'public' && privacy !== 'public') return false;
      if (feedPrivacyFilter === 'friends' && privacy !== 'friends') return false;
      if (feedPrivacyFilter === 'private' && (privacy !== 'private' || !isAuthor)) return false;

      return true;
    });
  }, [posts, searchQuery, feedPrivacyFilter, userProfile.name]);

  // Infinite scroll visible posts slice (loads 10 at a time, scroll down loads next 10)
  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  const userPosts = useMemo(() => {
    return posts.filter((p) => p.author.name === userProfile.name);
  }, [posts, userProfile.name]);

  const pendingFriendRequestsCount = useMemo(() => {
    return notifications.filter((n) => n.type === 'friend_request').length;
  }, [notifications]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => n.isUnread).length;
  }, [notifications]);

  // Clean logout handler
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setFirebaseUser(null);
    setCurrentTab('home');
    try {
      localStorage.removeItem('qalby_user_profile');
      localStorage.removeItem('peaceverse_registered_name');
    } catch {}
    setUserProfile(USER_PROFILE);
    navigateToPath('/');
  };

  // 1. Loading screen during initial Firebase auth handshake
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-4 text-white">
        <PeaceDoveEmblem size={130} className="mb-4" />
        <div className="flex items-center gap-2.5 text-sky-400 font-bold text-sm tracking-wide">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
          <span>Connecting to PeaceVerse...</span>
        </div>
      </div>
    );
  }

  // 2. Dedicated Auth Pages: /login and /signup
  if (currentPath === '/login') {
    return (
      <PeaceVerseAuthPage
        initialMode="login"
        currentUser={firebaseUser}
        onNavigateHome={() => navigateToPath('/home')}
        onNavigateTo={navigateToPath}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPath === '/signup') {
    return (
      <PeaceVerseAuthPage
        initialMode="signup"
        currentUser={firebaseUser}
        onNavigateHome={() => navigateToPath('/home')}
        onNavigateTo={navigateToPath}
        onLogout={handleLogout}
      />
    );
  }

  // 3. Protected Route Gate: If visitor is NOT logged in with Firebase, show Landing Page
  if (!firebaseUser) {
    return (
      <>
        <PeaceVerseLanding
          onNavigateTo={navigateToPath}
          onOpenDownloadModal={() => setShowInstallModal(true)}
          onOpenLegalTab={(tab) => {
            setLegalModalTab(tab as LegalTabType);
            window.location.hash = `#${tab}`;
          }}
        />

        {/* PWA In-App Install Guide Modal */}
        {showInstallModal && (
          <PWAInstallModal
            onClose={() => {
              setShowInstallModal(false);
              if (window.location.hash === '#install') {
                history.pushState('', document.title, window.location.pathname + window.location.search);
              }
            }}
          />
        )}

        {/* Legal Policies Modal */}
        {legalModalTab && (
          <LegalModal
            initialTab={legalModalTab}
            onClose={() => {
              setLegalModalTab(null);
              if (window.location.hash) {
                history.pushState('', document.title, window.location.pathname + window.location.search);
              }
            }}
          />
        )}
      </>
    );
  }

  // 4. Admin Portal (via #admin, #asol-admin-secret, or Menu click)
  if (showAdminPortal) {
    return (
      <AdminPortal
        onBackToApp={() => {
          setShowAdminPortal(false);
          window.location.hash = '';
        }}
        posts={posts}
        onAddPostToFeed={handlePostCreated}
        onDeletePostFromFeed={handleDeletePost}
        onModeratePost={handleModeratePost}
        goldenCashoutRequests={cashoutRequests}
        onApproveGoldenCashout={handleApproveGoldenCashout}
        onRejectGoldenCashout={handleRejectGoldenCashout}
        userProfile={effectiveProfile}
        onBroadcastNotification={addLocalBroadcastNotification}
      />
    );
  }

  // 5. Internal Peaceverse Mini-Apps (stay inside Peaceverse, no external redirect)
  if (currentPath === '/peace-threads') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <PeaceThreadsView
          userProfile={effectiveProfile}
          onBack={() => navigateToPath('/home')}
        />
      </div>
    );
  }

  if (currentPath === '/peace-insta') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <PeaceInstaView
          userProfile={effectiveProfile}
          posts={posts}
          onBack={() => navigateToPath('/home')}
        />
      </div>
    );
  }

  if (currentPath === '/business-suite' || currentPath === '/peace-business') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <PeaceBusinessSuiteView
          onBack={() => navigateToPath('/home')}
          userProfile={effectiveProfile}
          onSwitchToPage={(page) => {
            handleSwitchToPage(page);
            navigateToPath('/home');
          }}
        />
      </div>
    );
  }

  if (currentPath === '/peace-edits-editor') {
    return (
      <PeaceEditsModal
        isOpen={true}
        onClose={() => navigateToPath('/home')}
        userProfile={userProfile}
        onPublishReel={(newReel) => {
          handleReelCreated(newReel);
          navigateToPath('/home');
        }}
      />
    );
  }

  if (currentPath === '/qibla') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <GlobalPrayerQiblaView onBack={() => navigateToPath('/home')} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'dark bg-[#121212] text-[#e4e6eb]' : 'bg-[#F0F2F5] text-[#050505]'} selection:bg-[#0866FF] selection:text-white`}>
      
      {/* 1. Facebook App Top Bar (shown on Home, Reels, Friends, Marketplace with back button if not on home) */}
      {currentTab !== 'notifications' && currentTab !== 'profile' && currentTab !== 'menu' && (
        <FbHeader
          userProfile={userProfile}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCreatePost={() => setShowCreatePost(true)}
          onOpenCreateStory={() => setShowCreateStory(true)}
          onOpenCreateReel={() => setShowCreateReel(true)}
          onOpenLive={() => setShowLive(true)}
          onOpenMessenger={() => {
            setShowMessengerModal(true);
            setActiveChatFriend(null);
          }}
          onOpenMenu={() => navigateToTab('menu')}
          onOpenQibla={() => navigateToPath('/qibla')}
          onBack={goBack}
          showBackButton={currentTab !== 'home'}
          unreadMessagesCount={unreadMessagesCount}
        />
      )}

      {/* 2. Main Tab Views */}
      <main className="w-full">
        
        {/* TAB 1: Home (ফিড - Exact Facebook Style Container max-w-[500px]) */}
        {currentTab === 'home' && (
          <div
            className="max-w-[500px] mx-auto pb-24 space-y-2"
            onTouchStart={(e) => {
              if (window.scrollY <= 0 && e.touches.length === 1) {
                touchStartYRef.current = e.touches[0].clientY;
              } else {
                touchStartYRef.current = null;
              }
            }}
            onTouchMove={(e) => {
              if (touchStartYRef.current !== null && window.scrollY <= 0) {
                const delta = e.touches[0].clientY - touchStartYRef.current;
                if (delta > 0) {
                  setPullDistance(Math.min(delta * 0.45, 64));
                }
              }
            }}
            onTouchEnd={async () => {
              if (pullDistance >= 48 && !isPullRefreshing) {
                setIsPullRefreshing(true);
                await refreshFeedSilently();
                setIsPullRefreshing(false);
              }
              touchStartYRef.current = null;
              setPullDistance(0);
            }}
          >
            {/* Mobile Pull-to-Refresh Spinner (visible only while pulling/refreshing) */}
            {(pullDistance > 12 || isPullRefreshing) && (
              <div
                className="flex items-center justify-center overflow-hidden transition-all"
                style={{ height: isPullRefreshing ? 40 : Math.max(24, pullDistance) }}
              >
                <Loader2
                  className={`w-5 h-5 text-[#0866FF] ${isPullRefreshing ? 'animate-spin' : ''}`}
                />
              </div>
            )}

            {/* Clean 56px Facebook-style Active Profile Header (Clicking opens Page Profile) */}
            {activeSwitchedPage && (
              <div
                onClick={() => {
                  setSelectedPageIdToOpen(activeSwitchedPage.id);
                  navigateToTab('pages');
                }}
                className="h-[56px] bg-[#0866FF] hover:bg-[#1877F2] text-white rounded-[10px] px-3.5 shadow-xs flex items-center justify-between gap-3 cursor-pointer transition-colors"
                title="পেজ প্রোফাইল দেখুন"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {activeSwitchedPage.avatar ? (
                    <img
                      src={activeSwitchedPage.avatar}
                      alt={activeSwitchedPage.name}
                      className="w-9 h-9 rounded-full object-cover border border-white/80 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-white text-[#0866FF] font-extrabold text-sm flex items-center justify-center border border-white/80 shrink-0">
                      {activeSwitchedPage.name.trim().charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 leading-tight">
                    <p className="font-bold text-[15px] text-white truncate">
                      {activeSwitchedPage.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-white/90 font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#31A24C] inline-block shrink-0" />
                      <span>Profile Active • View Page</span>
                    </div>
                  </div>
                </div>

                <span
                  className="w-2.5 h-2.5 rounded-full bg-[#31A24C] ring-2 ring-white/80 shrink-0"
                  aria-label="Online"
                />
              </div>
            )}

            {/* What's on your mind? Box (using effectiveProfile & activeSwitchedPage) */}
            <FbCreatePostBox
              userProfile={effectiveProfile}
              activeSwitchedPage={activeSwitchedPage}
              onOpenCreateModal={(photo?: string) => {
                setInitialPostPhoto(photo || null);
                setShowCreatePost(true);
              }}
              onOpenProfile={() => {
                if (activeSwitchedPage) {
                  setSelectedPageIdToOpen(activeSwitchedPage.id);
                  navigateToTab('pages');
                } else {
                  setViewedProfile(null);
                  navigateToTab('profile');
                }
              }}
            />

            {/* Stories & Reels Bar */}
            <div className="bg-white dark:bg-[#1C1C1D] border border-[#E4E6EB] dark:border-[#222222] rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden">
              <FbStories
                stories={stories}
                onOpenCreateStory={() => setShowCreateStory(true)}
                onOpenCreateReel={() => setShowCreateReel(true)}
              />
            </div>

            {/* Global Prayer Times, Daily Quran Verse & Qibla Compass Strip */}
            <div className="bg-white dark:bg-[#1C1C1D] border border-[#E4E6EB] dark:border-[#222222] rounded-[8px] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.1)] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#050505] dark:text-white truncate">
                      {globalCity.flag} {globalCity.city} •{' '}
                      {globalPrayerSchedule
                        ? `Next: ${globalPrayerSchedule.nextPrayer.name} (${globalPrayerSchedule.nextPrayer.time})`
                        : 'Global Prayer Times'}
                    </p>
                    <p className="text-[10px] text-[#65676B] dark:text-[#b0b3b8] truncate">
                      Peace World — Halal Alternative to Facebook for 2 Billion Muslims
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigateToPath('/qibla')}
                  className="px-2.5 py-1.5 rounded-full bg-[#E7F3FF] dark:bg-[#0866FF]/20 text-[#0866FF] dark:text-sky-300 text-[11px] font-bold flex items-center gap-1 shrink-0 hover:bg-[#0866FF] hover:text-white transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Qibla</span>
                </button>
              </div>

              <div className="p-2 rounded-lg bg-[#F0F2F5] dark:bg-[#242526] flex items-start gap-2 text-[11px]">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[#050505] dark:text-[#e4e6eb] leading-snug">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {getDailyQuranVerse(currentLang).surahRef}:{' '}
                  </span>
                  {getDailyQuranVerse(currentLang).localized}
                </p>
              </div>
            </div>

            {/* Filter Tabs matching exact Facebook style */}
            <div className="flex items-center gap-[15px] px-[15px] py-2.5 bg-white dark:bg-[#1C1C1D] border border-[#E4E6EB] dark:border-[#222222] rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.1)] text-sm overflow-x-auto no-scrollbar">
              <button
                onClick={() => setFeedPrivacyFilter('all')}
                className={`transition-colors whitespace-nowrap cursor-pointer pb-[5px] ${
                  feedPrivacyFilter === 'all'
                    ? 'text-[#0866FF] border-b-[3px] border-[#0866FF] font-bold'
                    : 'text-[#65676B] dark:text-[#aaaaaa] hover:text-[#050505] dark:hover:text-white'
                }`}
              >
                সব পোস্ট
              </button>
              <button
                onClick={() => setFeedPrivacyFilter('public')}
                className={`transition-colors whitespace-nowrap cursor-pointer pb-[5px] ${
                  feedPrivacyFilter === 'public'
                    ? 'text-[#0866FF] border-b-[3px] border-[#0866FF] font-bold'
                    : 'text-[#65676B] dark:text-[#aaaaaa] hover:text-[#050505] dark:hover:text-white'
                }`}
              >
                পাবলিক
              </button>
              <button
                onClick={() => setFeedPrivacyFilter('friends')}
                className={`transition-colors whitespace-nowrap cursor-pointer pb-[5px] ${
                  feedPrivacyFilter === 'friends'
                    ? 'text-[#0866FF] border-b-[3px] border-[#0866FF] font-bold'
                    : 'text-[#65676B] dark:text-[#aaaaaa] hover:text-[#050505] dark:hover:text-white'
                }`}
              >
                বন্ধুরা
              </button>
              <button
                onClick={() => setFeedPrivacyFilter('private')}
                className={`transition-colors whitespace-nowrap cursor-pointer pb-[5px] ${
                  feedPrivacyFilter === 'private'
                    ? 'text-[#0866FF] border-b-[3px] border-[#0866FF] font-bold'
                    : 'text-[#65676B] dark:text-[#aaaaaa] hover:text-[#050505] dark:hover:text-white'
                }`}
              >
                শুধুমাত্র আমি
              </button>
            </div>

            {/* Posts Feed matching Screenshot 1 */}
            <div className="space-y-2.5">
              {filteredPosts.length === 0 ? (
                <div className="bg-white dark:bg-[#242526] rounded-[8px] border border-[#E4E6EB] dark:border-[#393a3b] p-8 text-center space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.1)] my-2">
                  <div className="w-14 h-14 rounded-full bg-[#0866FF]/15 border border-[#0866FF]/30 flex items-center justify-center text-[#0866FF] mx-auto shadow-sm">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    No posts yet - Your genuine posts will appear here
                  </h3>
                  <p className="text-xs text-[#65676B] dark:text-[#b0b3b8] max-w-sm mx-auto">
                    Share your genuine videos, thoughts, and moments using the box above.
                  </p>
                </div>
              ) : (
                <>
                  {visiblePosts.map((post) => (
                    <div key={post.id} id={`post-${post.id}`}>
                    <FbPostCard
                      post={post}
                      onToggleReaction={handleToggleReaction}
                      onToggleSave={handleToggleSave}
                      onAddComment={handleAddComment}
                      onEditPost={handleEditPost}
                      onDeletePost={handleDeletePost}
                      onOpenProfile={async (authorName) => {
                        if (!authorName || authorName === userProfile.name) {
                          setViewedProfile(null);
                          navigateToTab('profile');
                          return;
                        }
                        const baseAuthorProfile: UserProfile = {
                          id: post.authorId || `author-${authorName}`,
                          name: authorName,
                          avatar: post.author.avatar,
                          coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
                          friendsCount: 245,
                          location: 'Dhaka, Bangladesh',
                          hometown: 'Bangladesh',
                          birthDate: '1994',
                          contactPrivacy: 'public',
                        };
                        setViewedProfile(baseAuthorProfile);
                        navigateToTab('profile');
                        const remote = await fetchUserProfileByNameFromFirestore(authorName);
                        if (remote) {
                          setViewedProfile((prev) =>
                            prev && prev.name === authorName ? { ...prev, ...remote } : prev
                          );
                        }
                      }}
                      onTypingChange={handleTypingChange}
                      currentUserId={userProfile.id || 'user-me'}
                      currentUserName={userProfile.name}
                      onOpenReel={(p) => setActiveReelPostId(p.id)}
                      onOpenGiftModal={(p) => setSelectedGiftPost(p)}
                    />
                    </div>
                  ))}

                  {/* Infinite Scroll Sentinel: loads next 10 videos as user scrolls */}
                  <div ref={bottomSentinelRef} className="py-4 flex items-center justify-center">
                    {visibleCount < filteredPosts.length && (
                      <div className="flex items-center gap-2 text-xs text-[#b0b3b8]">
                        <Loader2 className="w-4 h-4 animate-spin text-[#1877F2]" />
                        <span>Loading more videos & posts...</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Reels / Watch (ভিডিও) */}
        {currentTab === 'reels' && (
          <div className="pt-2">
            <FbWatchView
              posts={posts}
              onToggleReaction={handleToggleReaction}
              onToggleSave={handleToggleSave}
              onAddComment={handleAddComment}
              onBack={goBack}
              onOpenReel={(p) => setActiveReelPostId(p.id)}
              onOpenGiftModal={(p) => setSelectedGiftPost(p)}
            />
          </div>
        )}

        {/* TAB 3: Friends (ফ্রেন্ডস ও উম্মাহ - matching badge 6) */}
        {currentTab === 'friends' && (
          <FbFriendsView
            onBack={goBack}
            onConfirmRequest={handleConfirmRequest}
            onDeleteRequest={handleDeleteRequest}
            currentUserId={userProfile.id || 'user-me'}
            currentUserName={userProfile.name}
            currentUserAvatar={userProfile.avatar}
          />
        )}

        {/* TAB 4: Marketplace (মার্কেটপ্লেস ও হালাল শপ) */}
        {currentTab === 'marketplace' && (
          <FbMarketplaceView
            onBack={goBack}
            userProfile={effectiveProfile}
            onBroadcastNotification={addLocalBroadcastNotification}
          />
        )}

        {/* TAB 5: Notifications (নোটিফিকেশন - Screenshot 2) */}
        {currentTab === 'notifications' && (
          <FbNotificationsView
            notifications={notifications}
            onOpenMenu={() => navigateToTab('menu')}
            onBack={goBack}
            onConfirmRequest={handleConfirmRequest}
            onDeleteRequest={handleDeleteRequest}
            onOpenNotification={handleOpenNotification}
            onMarkAllRead={() => {
              setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false, read: true })));
              markAllRealtimeNotificationsRead(notifications);
            }}
          />
        )}

        {/* TAB 6: Profile (প্রোফাইল - Screenshot 4) */}
        {currentTab === 'profile' && (
          <FbProfileView
            userProfile={userProfile}
            userPosts={
              viewedProfile
                ? posts.filter((p) => p.author.name === viewedProfile.name)
                : userPosts
            }
            viewedProfile={viewedProfile}
            onBackToOwnProfile={() => setViewedProfile(null)}
            onOpenMenu={() => navigateToTab('menu')}
            onOpenPages={() => navigateToTab('pages')}
            onBack={() => {
              setViewedProfile(null);
              goBack();
            }}
            onAddStory={() => setShowCreateStory(true)}
            onToggleReaction={handleToggleReaction}
            onToggleSave={handleToggleSave}
            onAddComment={handleAddComment}
            onUpdateProfile={(updated) => {
              setUserProfile(updated);
              saveUserProfileToFirestore(updated);
            }}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onOpenReel={(p) => setActiveReelPostId(p.id)}
            onOpenGoldenWallet={() => setShowGoldenWallet(true)}
          />
        )}

        {/* TAB 7: Menu (মেনু - Screenshot 5) */}
        {currentTab === 'menu' && (
          <FbMenuView
            userProfile={userProfile}
            onUpdateProfile={(updated) => {
              setUserProfile(updated);
              saveUserProfileToFirestore(updated);
            }}
            activeSwitchedPage={activeSwitchedPage}
            onSwitchToPage={handleSwitchToPage}
            onSwitchToPersonal={handleSwitchToPersonal}
            onNavigateTab={navigateToTab}
            onOpenProfile={() => {
              setViewedProfile(null);
              navigateToTab('profile');
            }}
            onOpenHalalPolicy={() => setShowHalalPolicy(true)}
            onOpenAdminPortal={() => {
              setShowAdminPortal(true);
              window.location.hash = '#admin';
            }}
            onOpenMonetization={() => setShowMonetizationModal(true)}
            onOpenGoldenWallet={() => setShowGoldenWallet(true)}
            onOpenLegalTab={(tab) => {
              setLegalModalTab(tab);
              window.location.hash = `#${tab}`;
            }}
            onOpenInstallModal={() => setShowInstallModal(true)}
            onOpenAuth={() => setShowAuthModal(true)}
            onLogout={handleLogout}
            onBack={goBack}
            onBroadcastNotification={addLocalBroadcastNotification}
            onOpenMessenger={() => {
              setShowMessengerModal(true);
              setActiveChatFriend(null);
            }}
            unreadMessagesCount={unreadMessagesCount}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onPublishReel={handleReelCreated}
            onNavigatePath={navigateToPath}
          />
        )}

        {/* TAB 8: Saved Posts */}
        {currentTab === 'saved' && (
          <div className="pt-2 px-2 sm:px-0">
            <FbSavedPostsView
              posts={posts}
              onToggleReaction={handleToggleReaction}
              onToggleSave={handleToggleSave}
              onAddComment={handleAddComment}
              onBackToFeed={goBack}
              onOpenReel={(p) => setActiveReelPostId(p.id)}
            />
          </div>
        )}

        {/* TAB 9: Groups */}
        {currentTab === 'groups' && (
          <div className="pt-2 px-2 sm:px-0">
            <FbGroupsView onBack={goBack} userProfile={userProfile} />
          </div>
        )}

        {/* TAB 10: Pages */}
        {currentTab === 'pages' && (
          <FbPagesView
            onBack={() => {
              setSelectedPageIdToOpen(null);
              goBack();
            }}
            userProfile={userProfile}
            onSwitchToPage={handleSwitchToPage}
            onBroadcastNotification={addLocalBroadcastNotification}
            initialSelectedPageId={selectedPageIdToOpen}
          />
        )}

        {/* TAB 11: Memories */}
        {currentTab === 'memories' && (
          <FbMemoriesView onBack={goBack} posts={posts} />
        )}

      </main>

      {/* 3. Exact 6-Icon Bottom Navigation Bar (Screenshots 1, 2, 4, 5) */}
      <FbBottomNav
        currentTab={currentTab}
        onTabChange={navigateToTab}
        userProfile={userProfile}
        activeSwitchedPage={activeSwitchedPage}
        friendRequestsCount={pendingFriendRequestsCount || 2}
        notificationsCount={unreadNotificationsCount}
      />

      {/* 4. Facebook Create Post Modal */}
      {showCreatePost && (
        <FbCreatePostModal
          userProfile={effectiveProfile}
          initialPhoto={initialPostPhoto}
          onClose={() => {
            setShowCreatePost(false);
            setInitialPostPhoto(null);
          }}
          onPostCreated={handlePostCreated}
          onOpenLive={() => setShowLive(true)}
        />
      )}

      {/* 5. Facebook Create Story Modal */}
      {showCreateStory && (
        <FbCreateStoryModal
          userProfile={userProfile}
          onClose={() => setShowCreateStory(false)}
          onStoryCreated={handleStoryCreated}
        />
      )}

      {/* 6. Facebook Create Reel Modal */}
      {showCreateReel && (
        <FbCreateReelModal
          userProfile={userProfile}
          onClose={() => setShowCreateReel(false)}
          onReelCreated={handleReelCreated}
        />
      )}

      {/* 7. Facebook Live Modal */}
      {showLive && (
        <FbLiveModal
          userProfile={userProfile}
          onClose={() => setShowLive(false)}
          onLiveCreated={handleLiveCreated}
        />
      )}

      {/* 5. Messenger Inbox & Chat Modal */}
      {showMessengerModal && (
        <FbMessengerModal
          chatFriends={chatFriends}
          activeFriend={activeChatFriend}
          onSelectFriend={(friend) => {
            setActiveChatFriend(friend);
            if (friend && friend.unreadCount) {
              setChatFriends((prev) =>
                prev.map((f) => (f.id === friend.id ? { ...f, unreadCount: 0 } : f))
              );
            }
          }}
          onClose={() => {
            setShowMessengerModal(false);
            setActiveChatFriend(null);
          }}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* 6. Halal Policy Modal */}
      {showHalalPolicy && (
        <HalalGuaranteeModal onClose={() => setShowHalalPolicy(false)} />
      )}

      {/* 7. International & Google Play Store Legal Modal */}
      {legalModalTab && (
        <LegalModal
          initialTab={legalModalTab}
          onClose={() => {
            setLegalModalTab(null);
            if (window.location.hash && window.location.hash !== '#admin') {
              history.pushState('', document.title, window.location.pathname + window.location.search);
            }
          }}
        />
      )}

      {/* 8. PWA Website-to-App Install Slide-up Banner */}
      {currentTab !== 'profile' && (
        <PWAInstallBanner onOpenGuide={() => setShowInstallModal(true)} />
      )}

      {/* 9. PWA Installation Guide Modal for All Platforms (Android / iOS / PC) */}
      {showInstallModal && (
        <PWAInstallModal
          onClose={() => {
            setShowInstallModal(false);
            if (window.location.hash === '#install') {
              history.pushState('', document.title, window.location.pathname + window.location.search);
            }
          }}
        />
      )}

      {/* 10. Creator Monetization Studio Modal */}
      {showMonetizationModal && (
        <CreatorMonetizationModal
          userProfile={userProfile}
          onClose={() => {
            setShowMonetizationModal(false);
            if (window.location.hash === '#monetization' || window.location.hash === '#creator-studio') {
              history.pushState('', document.title, window.location.pathname + window.location.search);
            }
          }}
        />
      )}

      {/* 11. Firebase Authentication Modal (Google Sign-In, Email/Password, Password Reset) */}
      <FirebaseAuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          if (window.location.hash === '#login' || window.location.hash === '#auth') {
            history.pushState('', document.title, window.location.pathname + window.location.search);
          }
        }}
        onSuccess={(usr) => {
          setUserProfile((prev) => ({
            ...prev,
            id: usr.uid,
            name: usr.displayName || prev.name,
            email: usr.email || prev.email,
            avatar: usr.photoURL || prev.avatar,
          }));
        }}
      />

      {/* 12. Full-Screen Immersive TikTok / Facebook Reels Video Player */}
      <FbTikTokReelsModal
        isOpen={Boolean(activeReelPostId)}
        onClose={() => setActiveReelPostId(null)}
        initialPostId={activeReelPostId || undefined}
        posts={posts}
        onToggleReaction={handleToggleReaction}
        onToggleSave={handleToggleSave}
        onAddComment={handleAddComment}
        currentUserName={userProfile.name}
        currentUserAvatar={userProfile.avatar}
        onOpenGiftModal={(post) => setSelectedGiftPost(post)}
      />

      {/* 13. Golden Hadia Gift Modal (Gifting Golden Coins to Creators) */}
      {selectedGiftPost && (
        <FbGoldenGiftModal
          isOpen={Boolean(selectedGiftPost)}
          onClose={() => setSelectedGiftPost(null)}
          post={selectedGiftPost}
          userGoldenCoins={userProfile.goldenCoins ?? 120}
          onSendGift={handleSendGoldenGift}
          onOpenWallet={() => setShowGoldenWallet(true)}
        />
      )}

      {/* 14. Golden Wallet & Cashout to bKash / Nagad Modal */}
      <GoldenWalletModal
        isOpen={showGoldenWallet}
        onClose={() => setShowGoldenWallet(false)}
        userGoldenCoins={userProfile.goldenCoins ?? 120}
        userEarnedCoins={userProfile.earnedCoins ?? 65}
        userName={userProfile.name}
        userAvatar={userProfile.avatar}
        onAddCoins={handleAddGoldenCoins}
        onRequestCashout={handleRequestCashout}
        cashoutRequests={cashoutRequests}
      />
    </div>
  );
}
