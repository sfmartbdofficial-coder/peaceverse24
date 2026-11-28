import React, { useState, useEffect, useMemo } from 'react';
import {
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_NOTIFICATIONS,
  USER_PROFILE
} from './data/islamicPosts';
import {
  findDummyCommunityUser,
  LEGACY_DUMMY_POST_IDS,
  LEGACY_DUMMY_USER_IDS,
} from './data/dummyCommunity';
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
  NidVerificationData,
  PeaceLiveRoom,
} from './types';
import { YtTopHeader } from './components/youtube/YtTopHeader';
import { YtBottomNav } from './components/youtube/YtBottomNav';
import { YtHomeFeed } from './components/youtube/YtHomeFeed';
import { YtShortsView } from './components/youtube/YtShortsView';
import { YtPeaceLiveView } from './components/youtube/YtPeaceLiveView';
import { YtStudioProfileView, StudioTab } from './components/youtube/YtStudioProfileView';
import { YtUploadModal } from './components/youtube/YtUploadModal';
import { YtVideoWatchModal } from './components/youtube/YtVideoWatchModal';
import { YtGiftModal } from './components/youtube/YtGiftModal';
import { YtWalletModal } from './components/youtube/YtWalletModal';
import { YtReportBlockModal } from './components/youtube/YtReportBlockModal';
import { SHOWCASE_VIDEOS } from './data/youtubeShowcase';
import { PeaceGift, calculateGiftSplit } from './data/peaceGifts';
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
import { FbFeedsView } from './components/facebook/FbFeedsView';
import { FbMemoriesView } from './components/facebook/FbMemoriesView';
import { FbUserSearchResults } from './components/facebook/FbUserSearchResults';
import { FbPeopleYouMayKnowSection } from './components/facebook/FbPeopleYouMayKnowSection';
import { PeaceThreadsView } from './components/facebook/PeaceThreadsView';
import { PeaceInstaView } from './components/facebook/PeaceInstaView';
import { PeaceBusinessSuiteView } from './components/facebook/PeaceBusinessSuiteView';
import { PeaceEditsModal } from './components/facebook/PeaceEditsModal';
import { HalalGuaranteeModal } from './components/HalalGuaranteeModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { SponsoredAdCard } from './components/ads/SponsoredAdCard';
import { LegalModal, LegalTabType } from './components/legal/LegalModal';
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';
import { PWAInstallModal } from './components/pwa/PWAInstallModal';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { installApp } from './hooks/usePWAInstall';
import { CreatorMonetizationModal } from './components/monetization/CreatorMonetizationModal';
import { FirebaseAuthModal } from './components/auth/FirebaseAuthModal';
import { FbGoldenGiftModal } from './components/golden/FbGoldenGiftModal';
import { GoldenWalletModal } from './components/wallet/GoldenWalletModal';
import { useLanguage } from './context/LanguageContext';
import { AdSlot } from './types/admin';
import {
  ADMIN_SYNC_EVENT,
  AdPlacementConfig,
  loadAdPlacementConfig,
  loadAdminAds,
  trackAdClick,
} from './utils/adminControlStorage';
import { ArrowLeft, Globe, Users, Lock, Sparkles, Film, Loader2, Zap, Compass, BookOpen, Clock, Bell, BellOff, ShieldAlert, Download } from 'lucide-react';
import { onAuthStateChanged, updateProfile, User as FirebaseUser } from 'firebase/auth';
import { PeaceVerseLanding } from './components/landing/PeaceVerseLanding';
import { PeaceVerseAuthPage } from './components/landing/PeaceVerseAuthPage';
import { PeaceDoveEmblem } from './components/landing/PeaceDoveEmblem';
import { GlobalPrayerQiblaView } from './components/global/GlobalPrayerQiblaView';
import { FbBlogView } from './components/facebook/FbBlogView';
import {
  GLOBAL_CITIES,
  GlobalCity,
  PrayerSchedule,
  computeNextPrayer,
  detectUserGlobalCity,
  fetchPrayerTimesForCity,
  getCachedOrFallbackPrayerSchedule,
  getDailyQuranVerse,
  formatPrayerTime12h,
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
  syncUserDirectoryProfile,
  invalidateUserDirectoryCache,
  fetchCommunityDirectoryUsers,
  syncPageToFirestore,
  fetchOwnedPagesFromFirestore,
  invalidatePageDirectoryCache,
  fetchDirectoryPagesFromServer,
  isDefaultGeneratedAvatar,
  searchUsersFromFirestore,
  searchPagesFromFirestore,
  toggleFollowUser,
  isTargetFollowedLocally,
  subscribeToUserFollowsList,
  fetchSentFriendRequestIds,
  sendFriendRequestToUser,
  cancelFriendRequestToUser,
  fetchUserFriendsFromFirestore,
  subscribeToUserFriendsFromFirestore,
  subscribeToIncomingFriendRequests,
  subscribeToAcceptedOutgoingFriendRequests,
  acceptFriendRequestInFirestore,
  declineFriendRequestInFirestore,
  syncLocalFriendsStore,
  subscribeToUserChats,
  subscribeToChatMessages,
  markChatThreadRead,
  sendRealtimeDirectMessage,
  getChatRoomId,
  IncomingFriendRequestItem,
  readSentFriendRequestsStore,
  setFriendRequestSentLocally,
  addLocalFriend,
  logUserActivity,
  markCurrentUserEmailOtpVerified,
  reactivateCurrentUserAccount,
  permanentlyDeleteCurrentUserAccount,
  ACCOUNT_DELETION_GRACE_DAYS,
  saveUserWalletAndNidToFirestore,
  getBlockedCreatorIds,
  toggleBlockedCreatorId,
} from './lib/firebase';
import { SearchedUserProfile } from './types';
import {
  registerPushServiceWorker,
  subscribeToForegroundFcm,
  broadcastCreatorNotification,
} from './lib/fcm';
import { loadPeaceSettings, savePeaceSettings } from './utils/settingsStorage';
import { tickScreenTimeSeconds } from './utils/privacyMask';
import {
  detectAndBlockExposedUrlKeys,
  emitApiKeyEnvWarning,
  enforceHttpsProtocol,
  recordSessionStartIfMissing,
  clearSessionStart,
  checkDailyBackupReminder,
  dismissBackupReminderToday,
  exportUserDataJson,
  sanitizeInput,
  encryptMessageBase64,
  checkDailyFriendRequestLimit,
  isAuthorizedAdminUser,
  getAuthorizedAdminEmail,
  POST_MAX_LENGTH,
} from './utils/security';
import {
  initHistoryBase,
  resetHistoryToHome,
  pushAppNavigation,
  goAppBack,
  registerRouteSyncHandler,
  useHistoryBack,
} from './utils/backNavigation';
import { applyPageSeo } from './utils/seo';

const VALID_MAIN_TABS: FacebookMainTab[] = [
  'home',
  'shorts',
  'live',
  'reels',
  'friends',
  'marketplace',
  'notifications',
  'profile',
  'menu',
  'saved',
  'groups',
  'pages',
  'feeds',
  'memories',
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<FacebookMainTab>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab') as FacebookMainTab | null;
      if (urlTab && VALID_MAIN_TABS.includes(urlTab)) return urlTab;
      const savedTab = localStorage.getItem('peaceverse_current_tab_v1') as FacebookMainTab | null;
      if (savedTab && VALID_MAIN_TABS.includes(savedTab)) return savedTab;
    } catch {}
    return 'home';
  });
  const [tabHistory, setTabHistory] = useState<FacebookMainTab[]>(() => [currentTab]);

  useEffect(() => {
    try {
      localStorage.setItem('peaceverse_current_tab_v1', currentTab);
    } catch {}
  }, [currentTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<SearchedUserProfile[]>([]);
  const [pageSearchResults, setPageSearchResults] = useState<PageItem[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [sentFriendRequests, setSentFriendRequests] = useState<Record<string, boolean>>(() =>
    readSentFriendRequestsStore()
  );
  const [viewedProfile, setViewedProfile] = useState<UserProfile | null>(null);

  // Modals state
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [initialPostPhotos, setInitialPostPhotos] = useState<string[]>([]);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showCreateReel, setShowCreateReel] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const [showHalalPolicy, setShowHalalPolicy] = useState(false);
  const [activeReelPostId, setActiveReelPostId] = useState<string | null>(null);

  // Peaceverse24 YouTube UI state
  const [guestBrowseMode, setGuestBrowseMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('peaceverse24_guest_mode_v1') === 'true';
    } catch {
      return false;
    }
  });
  const [watchingVideoPost, setWatchingVideoPost] = useState<PostItem | null>(null);
  const [showYtUpload, setShowYtUpload] = useState(false);
  const [ytUploadMode, setYtUploadMode] = useState<'choose' | 'video' | 'short'>('choose');
  const [studioTab, setStudioTab] = useState<StudioTab>('videos');
  const [blockedCreatorIds, setBlockedCreatorIds] = useState<string[]>(() =>
    getBlockedCreatorIds()
  );
  const [reportTarget, setReportTarget] = useState<{
    targetType: 'video' | 'short' | 'live' | 'channel';
    targetId: string;
    targetTitle?: string;
    creatorId: string;
    creatorName: string;
  } | null>(null);
  const { currentLang } = useLanguage();
  const [globalCity, setGlobalCity] = useState<GlobalCity>(
    () => GLOBAL_CITIES.find((c) => c.id === 'dhaka') || GLOBAL_CITIES[0]
  );
  const [globalPrayerSchedule, setGlobalPrayerSchedule] = useState<PrayerSchedule | null>(() =>
    getCachedOrFallbackPrayerSchedule()
  );
  const [adhanEnabled, setAdhanEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('adhanEnabled') === 'true';
    } catch {
      return false;
    }
  });
  const [adhanToast, setAdhanToast] = useState<string | null>(null);
  const adhanToastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAdhanCheckKeyRef = React.useRef<string>('');

  const showAdhanToast = React.useCallback((message: string) => {
    setAdhanToast(message);
    if (adhanToastTimerRef.current) {
      clearTimeout(adhanToastTimerRef.current);
    }
    adhanToastTimerRef.current = setTimeout(() => {
      setAdhanToast(null);
    }, 5000);
  }, []);

  const playAdhanTone = React.useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, now);
      oscillator.frequency.linearRampToValueAtTime(600, now + 2.0);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(now);
      oscillator.stop(now + 2.05);
      oscillator.onended = () => {
        ctx.close().catch(() => {});
      };
    } catch {
      // Ignore if audio context is blocked before user gesture
    }
  }, []);

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

  // Request notification permission on app load if not yet granted
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        try {
          Notification.requestPermission().catch(() => {});
        } catch {}
      }
    }
  }, []);

  // Sync prayer schedule & Adhan toggle state to Service Worker
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    if (!globalPrayerSchedule) return;

    const scheduleArray = (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map((name) => ({
      name,
      time: String(globalPrayerSchedule.times[name] || '').split(' ')[0].slice(0, 5),
    }));

    const payload = {
      type: 'PEACEVERSE_SYNC_PRAYER_SCHEDULE',
      payload: {
        city: globalPrayerSchedule.city || globalCity.city || 'Dhaka',
        enabled: adhanEnabled,
        schedule: scheduleArray,
      },
    };

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(payload);
    }
    navigator.serviceWorker.ready
      .then((reg) => {
        reg.active?.postMessage(payload);
      })
      .catch(() => {});
  }, [globalPrayerSchedule, globalCity, adhanEnabled]);

  const checkPrayerTime = React.useCallback(() => {
    if (!globalPrayerSchedule) return;

    // Keep nextPrayer countdown fresh
    const updatedNext = computeNextPrayer(globalPrayerSchedule.times);
    setGlobalPrayerSchedule((prev) =>
      prev &&
      (prev.nextPrayer.name !== updatedNext.name ||
        prev.nextPrayer.remainingText !== updatedNext.remainingText)
        ? { ...prev, nextPrayer: updatedNext }
        : prev
    );

    if (!adhanEnabled) return;

    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const todayKey = now.toISOString().slice(0, 10);

    const prayers: Array<{ name: keyof PrayerSchedule['times']; label: string }> = [
      { name: 'Fajr', label: 'Fajr' },
      { name: 'Dhuhr', label: 'Dhuhr' },
      { name: 'Asr', label: 'Asr' },
      { name: 'Maghrib', label: 'Maghrib' },
      { name: 'Isha', label: 'Isha' },
    ];

    for (const prayer of prayers) {
      const cleanTime = String(globalPrayerSchedule.times[prayer.name] || '')
        .split(' ')[0]
        .slice(0, 5);
      if (currentHHMM === cleanTime) {
        const dedupeKey = `${todayKey}-${prayer.label}-${cleanTime}`;
        if (lastAdhanCheckKeyRef.current === dedupeKey) return;
        lastAdhanCheckKeyRef.current = dedupeKey;

        playAdhanTone();
        showAdhanToast(`🕌 ${prayer.label} Adhan - Time to Pray - Allahu Akbar`);
        break;
      }
    }
  }, [globalPrayerSchedule, adhanEnabled, playAdhanTone, showAdhanToast]);

  // Every 60s check if current time matches prayer schedule
  useEffect(() => {
    checkPrayerTime();
    const intervalId = setInterval(checkPrayerTime, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [checkPrayerTime]);

  const handleToggleAdhan = React.useCallback(async () => {
    const nextState = !adhanEnabled;
    setAdhanEnabled(nextState);
    try {
      localStorage.setItem('adhanEnabled', String(nextState));
    } catch {}

    if (nextState) {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
        try {
          await Notification.requestPermission();
        } catch {}
      }

      playAdhanTone();
      showAdhanToast('🔔 Adhan notifications ON');

      const prayerName = globalPrayerSchedule?.nextPrayer?.name || 'Maghrib';
      const prayerTime = globalPrayerSchedule?.nextPrayer?.time || '17:15';
      const cityLabel = globalPrayerSchedule?.city || globalCity.city || 'Dhaka';

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.ready;
            await reg.showNotification(`🕌 ${prayerName} Adhan`, {
              body: `${cityLabel} • ${prayerName} (${prayerTime}) • Time to pray. May Allah accept it.`,
              icon: '/icon-512.png',
              badge: '/icon-192.png',
              tag: `adhan-${prayerName}`,
              renotify: true,
            } as NotificationOptions);
          } else {
            new Notification(`🕌 ${prayerName} Adhan`, {
              body: `${cityLabel} • ${prayerName} (${prayerTime}) • Time to pray. May Allah accept it.`,
              icon: '/icon-512.png',
            });
          }
        } catch {}
      }
    } else {
      showAdhanToast('🔕 Adhan notifications OFF');
    }
  }, [adhanEnabled, globalPrayerSchedule, globalCity, playAdhanTone, showAdhanToast]);

  // Active Switched Page State (Matching Facebook Screenshot 3)
  const [activeSwitchedPage, setActiveSwitchedPage] = useState<PageItem | null>(() => {
    try {
      const saved = localStorage.getItem('qalby_switched_page');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [selectedPageIdToOpen, setSelectedPageIdToOpen] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlPageId = params.get('pageId');
      if (urlPageId) return urlPageId;
      const savedTab = localStorage.getItem('peaceverse_current_tab_v1');
      const savedPageId = localStorage.getItem('peaceverse_selected_page_id_v1');
      if (savedTab === 'pages' && savedPageId) return savedPageId;
    } catch {}
    return null;
  });
  const [openPageSwitchSheetOnOpen, setOpenPageSwitchSheetOnOpen] = useState(false);
  const [initialCreatePageName, setInitialCreatePageName] = useState<string | null>(null);

  useEffect(() => {
    const syncSwitchedPage = () => {
      try {
        const saved = localStorage.getItem('qalby_switched_page');
        setActiveSwitchedPage(saved ? JSON.parse(saved) : null);
      } catch {
        setActiveSwitchedPage(null);
      }
    };
    window.addEventListener('peaceverse:switched-page-updated', syncSwitchedPage);
    window.addEventListener('storage', syncSwitchedPage);
    return () => {
      window.removeEventListener('peaceverse:switched-page-updated', syncSwitchedPage);
      window.removeEventListener('storage', syncSwitchedPage);
    };
  }, []);

  const handleCreatePageWithName = (name: string) => {
    setInitialCreatePageName(name);
    setSearchQuery('');
    navigateToTab('pages');
  };

  const handleSwitchToPage = (
    page: PageItem,
    options?: { stayInPage?: boolean; targetTab?: FacebookMainTab }
  ) => {
    setActiveSwitchedPage(page);
    setSelectedPageIdToOpen(page.id);
    try {
      localStorage.setItem('qalby_switched_page', JSON.stringify(page));
      localStorage.setItem('peaceverse_selected_page_id_v1', page.id);
    } catch {}
    if (options?.stayInPage) {
      if (currentTab !== 'pages') {
        navigateToTab('pages');
      }
      return;
    }
    navigateToTab(options?.targetTab || 'pages');
  };

  const handleSwitchToPersonal = () => {
    setActiveSwitchedPage(null);
    setSelectedPageIdToOpen(null);
    try {
      localStorage.removeItem('qalby_switched_page');
      localStorage.removeItem('peaceverse_selected_page_id_v1');
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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((r: GoldenCashoutRequest) => r.id !== 'cashout-sample-1');
        }
      }
    } catch {}
    return [];
  });

  const persistCashouts = (reqs: GoldenCashoutRequest[]) => {
    setCashoutRequests(reqs);
    try {
      localStorage.setItem('qalby_golden_cashouts', JSON.stringify(reqs));
    } catch {}
  };

  // Standalone Admin Portal state with /admin, #admin, #asol-admin-secret, /asol-admin-secret, or ?panel=admin
  const checkIsAdmin = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const path = window.location.pathname.toLowerCase();
    return (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      path.includes('asol-admin-secret') ||
      hash === 'admin' ||
      hash === 'asol-admin-secret' ||
      window.location.search.includes('panel=admin')
    );
  };

  const [showAdminPortal, setShowAdminPortal] = useState(() => checkIsAdmin());
  const [feedPrivacyFilter, setFeedPrivacyFilter] = useState<'all' | 'public' | 'friends' | 'private'>('all');

  // Path-based routing for Landing (/), Login (/login), Signup (/signup), Home (/home), and Standalone Admin (/admin)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [pendingDeletionInfo, setPendingDeletionInfo] = useState<{
    scheduledAt?: string;
    executeAt: number;
  } | null>(null);
  const [pendingDeletionBusy, setPendingDeletionBusy] = useState<boolean>(false);
  const [accountReactivatedToast, setAccountReactivatedToast] = useState<string | null>(null);
  const [urlKeyBlockedMsg, setUrlKeyBlockedMsg] = useState<string | null>(null);
  const [disableCopyOnSensitive, setDisableCopyOnSensitive] = useState<boolean>(
    () => loadPeaceSettings().disableCopyOnSensitive !== false
  );
  const [backupReminderDismissed, setBackupReminderDismissed] = useState<boolean>(
    () => checkDailyBackupReminder().dismissedToday
  );

  // Military-grade mount security: HTTPS enforce, API key env warning, exposed URL key blocker
  useEffect(() => {
    enforceHttpsProtocol();
    emitApiKeyEnvWarning();
    const urlCheck = detectAndBlockExposedUrlKeys();
    if (urlCheck.blocked) {
      setUrlKeyBlockedMsg(urlCheck.reason || 'Sensitive key exposed in URL was blocked.');
    }
  }, []);

  // Sync sensitive-data copy protection setting and enforce right-click/copy guard on [data-sensitive="true"]
  useEffect(() => {
    const syncCopySetting = () => {
      setDisableCopyOnSensitive(loadPeaceSettings().disableCopyOnSensitive !== false);
    };
    window.addEventListener('peaceverse:settings-updated', syncCopySetting);
    window.addEventListener('storage', syncCopySetting);
    return () => {
      window.removeEventListener('peaceverse:settings-updated', syncCopySetting);
      window.removeEventListener('storage', syncCopySetting);
    };
  }, []);

  useEffect(() => {
    if (!disableCopyOnSensitive) return;
    const blockSensitive = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('[data-sensitive="true"]')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', blockSensitive);
    document.addEventListener('copy', blockSensitive);
    return () => {
      document.removeEventListener('contextmenu', blockSensitive);
      document.removeEventListener('copy', blockSensitive);
    };
  }, [disableCopyOnSensitive]);

  // Initialize Browser History Base once Firebase auth state resolves so Back always
  // steps back through History entries to Home before exiting the app.
  useEffect(() => {
    if (isAuthChecking) return;
    initHistoryBase(currentPath, currentTab, Boolean(firebaseUser));
  }, [isAuthChecking, firebaseUser]);

  // Dynamic per-page SEO title, meta description, OpenGraph, and canonical URL
  useEffect(() => {
    applyPageSeo({
      path: currentPath,
      tab: currentTab,
      isAdminView: showAdminPortal,
    });
  }, [currentPath, currentTab, showAdminPortal]);

  // Sync top-level route & tab state whenever popstate fires (Android Hardware Back / Browser Back)
  useEffect(() => {
    return registerRouteSyncHandler((state) => {
      const nextPath = state.pvPath || window.location.pathname || '/';
      let pathOrTabChanged = false;

      setCurrentPath((prev) => {
        if (prev !== nextPath) pathOrTabChanged = true;
        return nextPath;
      });

      if (state.pvTab && VALID_MAIN_TABS.includes(state.pvTab as FacebookMainTab)) {
        const syncedTab = state.pvTab as FacebookMainTab;
        setCurrentTab((prev) => {
          if (prev !== syncedTab) pathOrTabChanged = true;
          return syncedTab;
        });
        setTabHistory((prev) => {
          const last = prev[prev.length - 1];
          return last === syncedTab ? prev : [...prev.slice(-10), syncedTab];
        });
        if (syncedTab !== 'profile') {
          setViewedProfile(null);
        }
      } else {
        const params = new URLSearchParams(window.location.search);
        const urlTab = params.get('tab') as FacebookMainTab | null;
        if (urlTab && VALID_MAIN_TABS.includes(urlTab)) {
          setCurrentTab((prev) => {
            if (prev !== urlTab) pathOrTabChanged = true;
            return urlTab;
          });
        }
      }
      setShowAdminPortal(checkIsAdmin());
      if (pathOrTabChanged) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }, []);

  // Register every App-level Modal, Drawer & Viewer on the History Back stack
  useHistoryBack(Boolean(viewedProfile), () => setViewedProfile(null), 'viewed-profile');
  useHistoryBack(showCreatePost, () => {
    setShowCreatePost(false);
    setInitialPostPhotos([]);
  }, 'create-post');
  useHistoryBack(showCreateStory, () => setShowCreateStory(false), 'create-story');
  useHistoryBack(showCreateReel, () => setShowCreateReel(false), 'create-reel');
  useHistoryBack(showLive, () => setShowLive(false), 'live-modal');
  useHistoryBack(showHalalPolicy, () => setShowHalalPolicy(false), 'halal-policy');
  useHistoryBack(Boolean(legalModalTab), () => setLegalModalTab(null), 'legal-modal');
  useHistoryBack(showInstallModal, () => setShowInstallModal(false), 'install-modal');
  useHistoryBack(showMonetizationModal, () => setShowMonetizationModal(false), 'monetization-modal');
  useHistoryBack(showAuthModal, () => setShowAuthModal(false), 'auth-modal');
  useHistoryBack(Boolean(activeReelPostId), () => setActiveReelPostId(null), 'reels-player');
  useHistoryBack(Boolean(selectedGiftPost), () => setSelectedGiftPost(null), 'golden-gift');
  useHistoryBack(showGoldenWallet, () => setShowGoldenWallet(false), 'golden-wallet');

  const navigateToPath = (path: string) => {
    const url = new URL(path, window.location.origin);
    const nextPath = url.pathname || '/';
    const nextFull = nextPath + url.search + url.hash;
    const curFull = window.location.pathname + window.location.search + window.location.hash;
    const leavingAuth =
      (currentPath === '/' || currentPath === '/login' || currentPath === '/signup') &&
      nextPath === '/home';

    if (leavingAuth) {
      resetHistoryToHome('/home');
      setCurrentTab('home');
      setTabHistory(['home']);
    } else if (curFull !== nextFull) {
      pushAppNavigation(nextPath, currentTab, nextFull);
    }
    setCurrentPath(nextPath);
    setShowAdminPortal(checkIsAdmin());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync Firebase Auth State & Enforce Landing / Home redirection rules
  useEffect(() => {
    let authReady = false;
    let cancelled = false;
    let latestObservedUser: FirebaseUser | null = auth.currentUser;

    Promise.resolve(typeof auth.authStateReady === 'function' ? auth.authStateReady() : undefined)
      .catch(() => {})
      .finally(() => {
        if (cancelled) return;
        authReady = true;
        if (auth.currentUser) {
          latestObservedUser = auth.currentUser;
          setFirebaseUser(auth.currentUser);
        }
        setIsAuthChecking(false);
        if (!auth.currentUser && !latestObservedUser && !guestBrowseMode) {
          const path = window.location.pathname;
          if (path === '/home') {
            navigateToPath('/' + window.location.search + window.location.hash);
          }
        }
      });

    const unsub = onAuthStateChanged(auth, (usr) => {
      if (cancelled) return;
      latestObservedUser = usr;
      invalidateUserDirectoryCache();
      invalidatePageDirectoryCache();
      setFirebaseUser(usr);
      if (usr || authReady) {
        setIsAuthChecking(false);
      }
      if (usr) {
        recordSessionStartIfMissing();
        void fetchCommunityDirectoryUsers(true)
          .then(() => window.dispatchEvent(new Event('peaceverse:directory-hydrated')))
          .catch(() => {});
        void fetchDirectoryPagesFromServer()
          .then(() => window.dispatchEvent(new Event('peaceverse:pages-hydrated')))
          .catch(() => {});
        const savedName = localStorage.getItem('peaceverse_registered_name');
        const emailFallback = usr.email ? usr.email.split('@')[0] : 'Member';
        const resolvedName =
          usr.displayName && usr.displayName !== 'Sharif Hasan'
            ? usr.displayName
            : savedName || (usr.email ? emailFallback : 'Member');

        if (!usr.displayName && resolvedName) {
          updateProfile(usr, { displayName: resolvedName }).catch(() => {});
        }

        const isDefaultCover = (url?: string) => !url || url === USER_PROFILE.coverPhoto;
        const resolvedAvatar =
          usr.photoURL ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedName)}&backgroundColor=1877f2,0ea5e9,3b82f6`;

        let initialPreservedAvatar = '';
        setUserProfile((prev) => {
          const sameAccount = prev.id === usr.uid;
          const nextAvatar =
            sameAccount && !isDefaultGeneratedAvatar(prev.avatar) ? prev.avatar : resolvedAvatar;
          initialPreservedAvatar = !isDefaultGeneratedAvatar(nextAvatar) ? nextAvatar : '';
          return {
            ...prev,
            id: usr.uid,
            name: resolvedName,
            email: usr.email || prev.email,
            avatar: nextAvatar,
            coverPhoto:
              sameAccount && !isDefaultCover(prev.coverPhoto)
                ? prev.coverPhoto
                : USER_PROFILE.coverPhoto,
            friendsCount:
              sameAccount
                ? prev.friendsCount === 330 || prev.friendsCount === 331
                  ? 0
                  : prev.friendsCount || 0
                : 0,
            bio: sameAccount ? prev.bio || '' : '',
            profileCategory: sameAccount ? prev.profileCategory || '' : '',
            location: sameAccount ? prev.location || '' : '',
            hometown: sameAccount ? prev.hometown || '' : '',
            work: sameAccount ? prev.work || '' : '',
            education: sameAccount ? prev.education || '' : '',
            birthDate: sameAccount ? prev.birthDate || '' : '',
            relationship: sameAccount ? prev.relationship || '' : '',
            website: sameAccount ? prev.website || '' : '',
            thoughtBubble: sameAccount ? prev.thoughtBubble || 'Drop a thought...' : 'Drop a thought...',
            whatsapp: sameAccount ? prev.whatsapp || '' : '',
            imo: sameAccount ? prev.imo || '' : '',
            viber: sameAccount ? prev.viber || '' : '',
            messengerLink: sameAccount ? prev.messengerLink || '' : '',
            hobbies: sameAccount ? prev.hobbies || [] : [],
          };
        });

        // Merge local + Firestore/server owned pages so Page logos/covers survive updates & logins
        void (async () => {
          try {
            const localRaw = localStorage.getItem('qalby_fb_pages');
            const localPages: PageItem[] = localRaw ? JSON.parse(localRaw) : [];
            const usrEmailLower = usr.email ? usr.email.trim().toLowerCase() : '';
            const ownedLocal = Array.isArray(localPages)
              ? localPages.filter(
                  (p) =>
                    p?.isOwner &&
                    (!p.ownerUid ||
                      p.ownerUid === usr.uid ||
                      (usrEmailLower && p.ownerEmail?.trim().toLowerCase() === usrEmailLower))
                )
              : [];
            const remotePages = await fetchOwnedPagesFromFirestore(usr.uid, usr.email || undefined);
            const byId = new Map<string, PageItem>();
            remotePages.forEach((rp) => {
              if (rp?.id) {
                byId.set(rp.id, {
                  ...rp,
                  ownerUid: rp.ownerUid || usr.uid,
                  ownerEmail: rp.ownerEmail || usr.email || undefined,
                  ownerName: rp.ownerName || resolvedName,
                });
              }
            });
            ownedLocal.forEach((lp) => {
              if (!lp?.id) return;
              const rp = byId.get(lp.id);
              if (!rp) {
                const enriched: PageItem = {
                  ...lp,
                  ownerUid: usr.uid,
                  ownerEmail: usr.email || lp.ownerEmail,
                  ownerName: resolvedName || lp.ownerName,
                };
                byId.set(lp.id, enriched);
                void syncPageToFirestore(enriched, usr.uid);
              } else {
                const merged: PageItem = {
                  ...rp,
                  ...lp,
                  ownerUid: usr.uid,
                  ownerEmail: usr.email || lp.ownerEmail || rp.ownerEmail,
                  ownerName: resolvedName || lp.ownerName || rp.ownerName,
                  avatar:
                    (lp.avatar && !lp.avatar.startsWith('blob:') ? lp.avatar : '') ||
                    rp.avatar ||
                    '',
                  cover:
                    (lp.cover && !lp.cover.startsWith('blob:') ? lp.cover : '') ||
                    rp.cover ||
                    '',
                  bio: lp.bio || rp.bio || '',
                  description: lp.description || rp.description || '',
                };
                byId.set(lp.id, merged);
                if (
                  (!rp.avatar && merged.avatar) ||
                  (!rp.cover && merged.cover) ||
                  rp.ownerUid !== usr.uid ||
                  (!rp.ownerEmail && merged.ownerEmail)
                ) {
                  void syncPageToFirestore(merged, usr.uid);
                }
              }
            });
            const mergedList = Array.from(byId.values());
            if (mergedList.length > 0) {
              localStorage.setItem('qalby_fb_pages', JSON.stringify(mergedList));
              window.dispatchEvent(new Event('peaceverse:pages-hydrated'));
              window.dispatchEvent(new Event('peaceverse:switched-page-updated'));
              setActiveSwitchedPage((cur) => {
                if (!cur) return cur;
                const found = mergedList.find((p) => p.id === cur.id);
                if (!found) return cur;
                try {
                  localStorage.setItem('qalby_switched_page', JSON.stringify(found));
                } catch {}
                return found;
              });
            }
          } catch {}
        })();

        fetchUserFriendsFromFirestore(usr.uid).then(({ count, friends }) => {
          syncLocalFriendsStore(friends);
          setUserProfile((prev) =>
            prev.id === usr.uid ? { ...prev, friendsCount: count } : prev
          );
        });
        fetchSentFriendRequestIds(usr.uid).then((ids) => {
          if (ids.length === 0) return;
          ids.forEach((id) => setFriendRequestSentLocally(true, id));
          setSentFriendRequests((prev) => {
            const next = { ...prev };
            ids.forEach((id) => {
              next[id] = true;
            });
            return next;
          });
        });

        if (usr.email) {
          try {
            localStorage.setItem(
              `peaceverse_otp_verified_${usr.uid}`,
              usr.email.trim().toLowerCase()
            );
          } catch {}
        }

        fetchUserProfileFromFirestore(usr.uid).then((remote) => {
          if (!remote) {
            void markCurrentUserEmailOtpVerified();
            void syncUserDirectoryProfile(
              usr.uid,
              resolvedName,
              usr.email || '',
              initialPreservedAvatar || resolvedAvatar
            );
            return;
          }
          if (remote.accountStatus === 'deactivated') {
            void reactivateCurrentUserAccount();
            setAccountReactivatedToast('আপনার সাময়িক নিষ্ক্রিয় অ্যাকাউন্টটি আবার সক্রিয় করা হয়েছে! স্বাগতম।');
            setTimeout(() => setAccountReactivatedToast(null), 5000);
          } else if (remote.accountStatus === 'pending_deletion') {
            const execAt =
              remote.deletionExecuteAt ||
              Date.now() + ACCOUNT_DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000;
            if (remote.deletionExecuteAt && Date.now() >= remote.deletionExecuteAt) {
              void permanentlyDeleteCurrentUserAccount()
                .catch(() => {})
                .finally(() => {
                  void handleLogout();
                });
              return;
            }
            setPendingDeletionInfo({
              scheduledAt: remote.deletionScheduledAt,
              executeAt: execAt,
            });
          } else {
            setPendingDeletionInfo(null);
          }
          if (!remote.emailOtpVerified) {
            void markCurrentUserEmailOtpVerified();
          }
          setUserProfile((prev) => {
            const sameAccount = prev.id === usr.uid;
            const emailPrefix = usr.email ? usr.email.split('@')[0].toLowerCase() : '';
            const prevIsPlaceholder =
              !prev.name ||
              prev.name === 'Member' ||
              prev.name === 'User' ||
              (emailPrefix && prev.name.toLowerCase() === emailPrefix);
            const resolvedRemoteName =
              remote.name && remote.name !== 'Member' && remote.name !== 'User'
                ? remote.name
                : '';
            const nextName =
              prevIsPlaceholder && resolvedRemoteName ? resolvedRemoteName : prev.name;

            const remoteHasAvatar = Boolean(
              remote.avatar && !isDefaultGeneratedAvatar(remote.avatar)
            );
            const localHasAvatar = sameAccount && !isDefaultGeneratedAvatar(prev.avatar);
            const nextAvatar =
              localHasAvatar && !remoteHasAvatar
                ? prev.avatar
                : remoteHasAvatar
                ? remote.avatar!
                : prev.avatar || resolvedAvatar;

            const remoteHasCover = !isDefaultCover(remote.coverPhoto);
            const localHasCover = sameAccount && !isDefaultCover(prev.coverPhoto);
            const nextCoverPhoto =
              localHasCover && !remoteHasCover
                ? prev.coverPhoto
                : remoteHasCover
                ? remote.coverPhoto!
                : prev.coverPhoto || USER_PROFILE.coverPhoto;

            const nextBio = prev.bio || remote.bio || '';
            const nextLocation = prev.location || remote.location || '';
            const nextUsername = prev.username || remote.username || '';

            const mergedProfile: UserProfile = {
              ...prev,
              id: usr.uid,
              name: nextName,
              username: nextUsername,
              avatar: nextAvatar,
              coverPhoto: nextCoverPhoto,
              profileCategory: prev.profileCategory || remote.profileCategory || '',
              whatsapp: prev.whatsapp || remote.whatsapp || '',
              imo: prev.imo || remote.imo || '',
              viber: prev.viber || remote.viber || '',
              messengerLink: prev.messengerLink || remote.messengerLink || '',
              contactPrivacy: prev.contactPrivacy || remote.contactPrivacy || 'public',
              bio: nextBio,
              location: nextLocation,
              hometown: prev.hometown || remote.hometown || '',
              work: prev.work || remote.work || '',
              education: prev.education || remote.education || '',
              relationship: prev.relationship || remote.relationship || '',
              website: prev.website || remote.website || '',
              thoughtBubble:
                prev.thoughtBubble && prev.thoughtBubble !== 'Drop a thought...'
                  ? prev.thoughtBubble
                  : remote.thoughtBubble || prev.thoughtBubble || 'Drop a thought...',
              hobbies:
                prev.hobbies && prev.hobbies.length > 0
                  ? prev.hobbies
                  : remote.hobbies || [],
              friendsCount:
                typeof remote.friendsCount === 'number'
                  ? Math.max(prev.friendsCount || 0, remote.friendsCount)
                  : prev.friendsCount,
            };

            if ((localHasAvatar && !remoteHasAvatar) || (localHasCover && !remoteHasCover)) {
              void saveUserProfileToFirestore(mergedProfile);
            } else {
              void syncUserDirectoryProfile(
                usr.uid,
                nextName,
                usr.email || '',
                nextAvatar,
                {
                  bio: nextBio,
                  location: nextLocation,
                  username: nextUsername,
                  allowFriendRequests: remote.isCreator !== true,
                }
              );
            }

            return mergedProfile;
          });
        });
        // Rule: If user IS logged in (Firebase Auth), auto redirect to "/home" when visiting root "/" (unless opening Admin Panel)
        const path = window.location.pathname;
        if (!checkIsAdmin() && (path === '/' || path === '')) {
          navigateToPath('/home' + window.location.search + window.location.hash);
        }
      } else if (authReady) {
        clearSessionStart();
        // Rule: If user is NOT logged in and not in Guest Browse mode, redirect /home back to "/"
        const path = window.location.pathname;
        if (path === '/home' && !guestBrowseMode) {
          navigateToPath('/' + window.location.search + window.location.hash);
        }
      }
    });

    // When returning to tab/app after 1+ hours in background, silently refresh short-lived ID token
    // using the durable refresh token without ever signing out on temporary offline glitches.
    const handleResumeRefresh = () => {
      if (document.visibilityState === 'visible' && auth.currentUser) {
        void auth.currentUser.getIdToken(false).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleResumeRefresh);
    window.addEventListener('online', handleResumeRefresh);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleResumeRefresh);
      window.removeEventListener('online', handleResumeRefresh);
      unsub();
    };
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
    const handleOpenInstallModalEvent = () => setShowInstallModal(true);
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('peaceverse:open-install-modal', handleOpenInstallModalEvent);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('peaceverse:open-install-modal', handleOpenInstallModalEvent);
    };
  }, []);

  const [activeAds, setActiveAds] = useState<AdSlot[]>(() => loadAdminAds());
  const [adPlacementConfig, setAdPlacementConfig] = useState<AdPlacementConfig>(() => loadAdPlacementConfig());

  useEffect(() => {
    const syncAdminSettings = () => {
      setActiveAds(loadAdminAds());
      setAdPlacementConfig(loadAdPlacementConfig());
    };
    window.addEventListener(ADMIN_SYNC_EVENT, syncAdminSettings);
    window.addEventListener('storage', syncAdminSettings);
    return () => {
      window.removeEventListener(ADMIN_SYNC_EVENT, syncAdminSettings);
      window.removeEventListener('storage', syncAdminSettings);
    };
  }, []);

  const homeFeedAds = useMemo(
    () => activeAds.filter((a) => a.isActive && a.placement === 'home_feed'),
    [activeAds]
  );
  const reelsAds = useMemo(
    () => activeAds.filter((a) => a.isActive && a.placement === 'reels_preroll'),
    [activeAds]
  );
  const marketplaceAds = useMemo(
    () => activeAds.filter((a) => a.isActive && a.placement === 'marketplace_top'),
    [activeAds]
  );
  const storyAds = useMemo(
    () => activeAds.filter((a) => a.isActive && a.placement === 'story_ad'),
    [activeAds]
  );

  // User Profile with localStorage persistence
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('qalby_user_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...USER_PROFILE,
          ...parsed,
          name: parsed.name === 'Sharif Hasan' ? 'Member' : (parsed.name || 'Member'),
          friendsCount: parsed.friendsCount === 330 || parsed.friendsCount === 331 ? 0 : (parsed.friendsCount || 0),
          bio: parsed.bio && parsed.bio.includes('আলহামদুলিল্লাহ আলা কুল্লি হাল') ? '' : (parsed.bio || ''),
          location: parsed.location && parsed.location === 'Dhaka, Bangladesh' ? '' : (parsed.location || ''),
          hometown: parsed.hometown && parsed.hometown === 'Dhaka, Bangladesh' ? '' : (parsed.hometown || ''),
          birthDate: parsed.birthDate && parsed.birthDate === 'August 17, 1991' ? '' : (parsed.birthDate || ''),
          relationship: parsed.relationship && parsed.relationship === 'Married' ? '' : (parsed.relationship || ''),
          goldenCoins: parsed.goldenCoins === 120 ? 100 : (parsed.goldenCoins ?? 100),
          earnedCoins: parsed.earnedCoins === 65 ? 0 : (parsed.earnedCoins ?? 0),
          beansBalance: parsed.beansBalance ?? parsed.earnedCoins ?? 0,
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

  // Messenger State (real user threads & real friends)
  const [chatFriends, setChatFriends] = useState<ChatFriend[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_chat_friends');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((f: ChatFriend) => f && f.id && !String(f.id).startsWith('chat-'));
        }
      }
      return [];
    } catch {
      return [];
    }
  });
  const [showMessengerModal, setShowMessengerModal] = useState<boolean>(false);
  const [activeChatFriend, setActiveChatFriend] = useState<ChatFriend | null>(null);
  const [incomingFriendRequests, setIncomingFriendRequests] = useState<IncomingFriendRequestItem[]>([]);

  useHistoryBack(showMessengerModal, () => {
    setShowMessengerModal(false);
    setActiveChatFriend(null);
  }, 'messenger-modal');
  useHistoryBack(Boolean(activeChatFriend), () => setActiveChatFriend(null), 'messenger-chat');

  useEffect(() => {
    try {
      localStorage.setItem('qalby_chat_friends', JSON.stringify(chatFriends));
    } catch {}
  }, [chatFriends]);

  // Dynamic unread messages count
  const unreadMessagesCount = useMemo(() => {
    return chatFriends.reduce((sum, f) => sum + (f.unreadCount || 0), 0);
  }, [chatFriends]);

  // Persistent theme state is managed by ThemeProvider (localStorage 'peaceverse-theme')

  // Stories (100% empty by default per Part 1 cleanup - genuine stories load from Supabase / uploads)
  const [stories, setStories] = useState<StoryItem[]>([]);

  // Common "All Posts" Global Feed (100% genuine posts only - legacy dummy/seeded IDs stripped)
  const isGenuineFeedPost = React.useCallback((p?: PostItem | null): p is PostItem => {
    if (!p || !p.id) return false;
    if (LEGACY_DUMMY_POST_IDS.has(p.id)) return false;
    if (p.authorId && LEGACY_DUMMY_USER_IDS.has(p.authorId)) return false;
    return true;
  }, []);

  const [posts, setPosts] = useState<PostItem[]>(() => {
    const mergeUniquePosts = (primary: PostItem[], fallback: PostItem[]): PostItem[] => {
      const byId = new Map<string, PostItem>();
      fallback.forEach((p) => {
        if (p && p.id && !LEGACY_DUMMY_POST_IDS.has(p.id) && !(p.authorId && LEGACY_DUMMY_USER_IDS.has(p.authorId))) {
          byId.set(p.id, p);
        }
      });
      primary.forEach((p) => {
        if (!p || !p.id || LEGACY_DUMMY_POST_IDS.has(p.id) || (p.authorId && LEGACY_DUMMY_USER_IDS.has(p.authorId))) {
          return;
        }
        const base = byId.get(p.id);
        byId.set(
          p.id,
          base
            ? {
                ...base,
                ...p,
                createdAtMillis: p.createdAtMillis || base.createdAtMillis,
              }
            : p
        );
      });
      return Array.from(byId.values()).sort(
        (a, b) => (b.createdAtMillis || 0) - (a.createdAtMillis || 0)
      );
    };

    try {
      const stored = localStorage.getItem('peaceverse_posts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return mergeUniquePosts(parsed, INITIAL_POSTS);
        }
      }
      return INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  // Reactive trigger whenever user follows/unfollows anyone across Search, Profile, or Feed
  const [followsTick, setFollowsTick] = useState(0);
  useEffect(() => {
    const onFollowsChanged = () => setFollowsTick((t) => t + 1);
    window.addEventListener('peaceverse:follows-updated', onFollowsChanged);
    window.addEventListener('storage', onFollowsChanged);
    return () => {
      window.removeEventListener('peaceverse:follows-updated', onFollowsChanged);
      window.removeEventListener('storage', onFollowsChanged);
    };
  }, []);

  useEffect(() => {
    if (!firebaseUser?.uid) return;
    const unsub = subscribeToUserFollowsList(firebaseUser.uid, () => {
      setFollowsTick((t) => t + 1);
    });
    return () => unsub();
  }, [firebaseUser?.uid]);

  // Infinite Scroll state: load 10 videos/posts at a time, scroll down to load next 10
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const bottomSentinelRef = React.useRef<HTMLDivElement | null>(null);
  const supabasePageRef = React.useRef<number>(0);
  const hasMoreSupabaseRef = React.useRef<boolean>(true);
  const isFetchingMoreRef = React.useRef<boolean>(false);

  // Facebook-style "Posting..." charging upload progress + 3-minute #1 top pin window
  const FRESH_PIN_WINDOW_MS = 3 * 60 * 1000;
  const [pendingUploadPost, setPendingUploadPost] = useState<{
    post: PostItem;
    progress: number;
  } | null>(null);
  const [freshNowTick, setFreshNowTick] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!pendingUploadPost) return;
    const watchdog = window.setTimeout(() => {
      setPendingUploadPost((cur) => (cur ? { ...cur, progress: 100 } : null));
      window.setTimeout(() => {
        setPendingUploadPost((cur) => {
          if (!cur) return null;
          setFreshNowTick(Date.now());
          setPosts((prev) => [cur.post, ...prev.filter((p) => p.id !== cur.post.id)]);
          return null;
        });
      }, 180);
    }, 4000);
    return () => window.clearTimeout(watchdog);
  }, [pendingUploadPost?.post.id]);

  useEffect(() => {
    const hasFreshPost = posts.some(
      (p) => (p.createdAtMillis || 0) > 0 && Date.now() - (p.createdAtMillis || 0) < FRESH_PIN_WINDOW_MS
    );
    if (!hasFreshPost) return;
    const timer = window.setInterval(() => {
      setFreshNowTick(Date.now());
    }, 20000);
    return () => window.clearInterval(timer);
  }, [posts, FRESH_PIN_WINDOW_MS]);

  // Notifications with Real-time synchronization
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Initialize Supabase & Firebase listeners
  useEffect(() => {
    testFirebaseConnection();

    // 1. Fetch genuine posts from Supabase "posts" table (ORDER BY created_at DESC)
    fetchSupabasePosts(0, 20).then((spPosts) => {
      const genuineSpPosts = spPosts.filter(isGenuineFeedPost);
      if (genuineSpPosts.length > 0) {
        setPosts((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const additions = genuineSpPosts.filter((p) => !ids.has(p.id));
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

    // 3. Sync real-time Firestore posts into the shared "All Posts" global feed
    const unsubPosts = subscribeToRealtimePosts((livePosts) => {
      const genuineLivePosts = livePosts.filter(isGenuineFeedPost);
      setPosts((prev) => {
        const map = new Map<string, PostItem>();
        prev.filter(isGenuineFeedPost).forEach((p) => map.set(p.id, p));
        genuineLivePosts.forEach((p) => {
          const existing = map.get(p.id);
          if (existing) {
            // Merge comments cleanly by id so local/remote comments never overwrite each other
            const commentMap = new Map<string, any>();
            (existing.comments || []).forEach((c) => commentMap.set(c.id, c));
            (p.comments || []).forEach((c) => commentMap.set(c.id, c));
            const mergedComments = Array.from(commentMap.values());
            map.set(p.id, {
              ...existing,
              ...p,
              authorId: p.authorId || existing.authorId,
              createdAtMillis: p.createdAtMillis || existing.createdAtMillis,
              mediaType:
                p.mediaType && p.mediaType !== 'none' ? p.mediaType : existing.mediaType,
              mediaUrl: p.mediaUrl || existing.mediaUrl,
              mediaUrls:
                p.mediaUrls && p.mediaUrls.length > 0 ? p.mediaUrls : existing.mediaUrls,
              comments: mergedComments,
            });
          } else {
            map.set(p.id, p);
          }
        });
        return Array.from(map.values()).sort((a: any, b: any) => {
          const tA = Number(a.createdAtMillis || (a.createdAt ? Date.parse(a.createdAt) : 0)) || 0;
          const tB = Number(b.createdAtMillis || (b.createdAt ? Date.parse(b.createdAt) : 0)) || 0;
          return tB - tA;
        });
      });
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
      unsubFcm();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
    };
  }, []);

  // Per-user real-time listeners: Notifications, Incoming/Outgoing Friend Requests, Friends list, & Messenger Threads
  useEffect(() => {
    const uid = firebaseUser?.uid;
    if (!uid) {
      setNotifications([]);
      setIncomingFriendRequests([]);
      return;
    }

    const unsubNotifs = subscribeToRealtimeNotifications(uid, (liveNotifs) => {
      setNotifications(liveNotifs);
    });

    const unsubIncomingReqs = subscribeToIncomingFriendRequests(uid, (reqs) => {
      setIncomingFriendRequests(reqs);
    });

    const unsubOutgoingReqs = subscribeToAcceptedOutgoingFriendRequests(uid, (syncedFriend) => {
      setSentFriendRequests((prev) => {
        if (!prev[syncedFriend.id]) return prev;
        const next = { ...prev };
        delete next[syncedFriend.id];
        return next;
      });
    });

    const unsubFriends = subscribeToUserFriendsFromFirestore(uid, ({ count, friends }) => {
      syncLocalFriendsStore(friends);
      setUserProfile((prev) => (prev.id === uid ? { ...prev, friendsCount: count } : prev));
      if (friends.length > 0) {
        setChatFriends((prev) => {
          const map = new Map(prev.map((f) => [f.id, f]));
          friends.forEach((f) => {
            const existing = map.get(f.id);
            const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              f.name
            )}&backgroundColor=1877f2,0ea5e9,3b82f6`;
            if (!existing) {
              map.set(f.id, {
                id: f.id,
                name: f.name,
                avatar: f.avatar || fallbackAvatar,
                online: true,
                lastSeen: 'Active now',
                unreadCount: 0,
                messages: [],
              });
            } else if (f.name || f.avatar) {
              map.set(f.id, {
                ...existing,
                name: f.name || existing.name,
                avatar: f.avatar || existing.avatar,
              });
            }
          });
          return Array.from(map.values());
        });
      }
    });

    const unsubChats = subscribeToUserChats(uid, (threads) => {
      setChatFriends((prev) => {
        const map = new Map(prev.map((f) => [f.id, f]));
        const ordered: ChatFriend[] = [];
        threads.forEach((t) => {
          const existing = map.get(t.partnerId);
          const previewMsgs =
            existing && existing.messages.length > 0
              ? existing.messages
              : t.lastMessageText
              ? [
                  {
                    id: `preview-${t.roomId}`,
                    sender: (t.lastSenderId === uid ? 'me' : 'them') as 'me' | 'them',
                    text: t.lastMessageText,
                    time: t.updatedAtMillis
                      ? new Date(t.updatedAtMillis).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Just now',
                  },
                ]
              : [];
          ordered.push({
            id: t.partnerId,
            name: t.partnerName,
            avatar: t.partnerAvatar,
            online: true,
            lastSeen: 'Active now',
            unreadCount: t.unreadCount,
            messages: previewMsgs,
          });
          map.delete(t.partnerId);
        });
        map.forEach((remaining) => {
          if (!String(remaining.id).startsWith('chat-')) {
            ordered.push(remaining);
          }
        });
        return ordered;
      });
    });

    return () => {
      unsubNotifs();
      unsubIncomingReqs();
      unsubOutgoingReqs();
      unsubFriends();
      unsubChats();
    };
  }, [firebaseUser?.uid]);

  // Real-time messages subscription for whichever conversation is open in Messenger
  useEffect(() => {
    const uid = firebaseUser?.uid;
    const partnerId = activeChatFriend?.id;
    if (!uid || !partnerId || partnerId.startsWith('chat-')) return;

    const roomId = getChatRoomId(uid, partnerId);
    void markChatThreadRead(roomId, uid);

    const unsubMsgs = subscribeToChatMessages(roomId, uid, (msgs) => {
      setActiveChatFriend((prev) =>
        prev && prev.id === partnerId ? { ...prev, messages: msgs, unreadCount: 0 } : prev
      );
      setChatFriends((prev) =>
        prev.map((f) => (f.id === partnerId ? { ...f, messages: msgs, unreadCount: 0 } : f))
      );
    });

    return () => unsubMsgs();
  }, [firebaseUser?.uid, activeChatFriend?.id]);

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
            const tA = Number(a.createdAtMillis || (a.createdAt ? Date.parse(a.createdAt) : 0)) || 0;
            const tB = Number(b.createdAtMillis || (b.createdAt ? Date.parse(b.createdAt) : 0)) || 0;
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

  // Navigate to tab with real Browser History (pushState) + local stack tracking
  const navigateToTab = (newTab: FacebookMainTab) => {
    if (newTab !== 'profile') {
      setViewedProfile(null);
    }
    if (newTab === currentTab && (currentPath === '/home' || currentPath === '/')) return;

    const basePath = firebaseUser ? '/home' : '/';
    const targetUrl = newTab === 'home' ? basePath : `${basePath}?tab=${newTab}`;
    pushAppNavigation(basePath, newTab, targetUrl);
    setCurrentPath(basePath);
    setTabHistory((prev) => [...prev, newTab]);
    setCurrentTab(newTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back button handler synced with window.history / Android hardware Back
  const goBack = () => {
    goAppBack(() => {
      if (tabHistory.length > 1) {
        const nextHistory = [...tabHistory];
        nextHistory.pop();
        const previous = nextHistory[nextHistory.length - 1] || 'home';
        setTabHistory(nextHistory);
        setCurrentTab(previous);
      } else {
        setCurrentTab('home');
        setTabHistory(['home']);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
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
    if (currentReaction !== reaction) {
      logUserActivity(
        userProfile.id,
        'Reaction',
        `আপনি একটি পোস্টে ${reaction} রিঅ্যাকশন দিয়েছেন`
      );
    }
  };

  // Handle post save
  const handleToggleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
    );
  };

  // Handle comment submit with Realtime Firestore sync & DOMPurify XSS sanitization
  const handleAddComment = (postId: string, text: string) => {
    const safeText = sanitizeInput(text, POST_MAX_LENGTH);
    if (!safeText) return;
    const commentAuthorName = sanitizeInput(effectiveProfile.name || userProfile.name, 80);
    const commentAuthorAvatar = effectiveProfile.avatar || userProfile.avatar;
    const newComment = {
      id: `c-${Date.now()}`,
      author: commentAuthorName,
      avatar: commentAuthorAvatar,
      text: safeText,
      timeAgo: 'Just now',
      likes: 0,
    };

    const existingPost = posts.find((p) => p.id === postId);

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [newComment, ...(p.comments || [])] } : p
      )
    );

    addRealtimeComment(postId, newComment, existingPost?.author.name, existingPost);
    logUserActivity(
      effectiveProfile.id || userProfile.id,
      'Comment',
      `মন্তব্য করেছেন: "${safeText.slice(0, 60)}"`
    );
  };

  const handleSharePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, sharesCount: (p.sharesCount || 0) + 1 } : p
      )
    );
    logUserActivity(userProfile.id, 'Share', `পোস্ট শেয়ার করেছেন`);
  };

  // Handle sending 20 Peace Gifts (Host gets 60% Beans, App gets 40%)
  const handleSendPeaceGiftAmount = (
    amount: number,
    isHostRecipient: boolean,
    postId?: string,
    message?: string
  ) => {
    const currentCoins = userProfile.goldenCoins ?? 0;
    if (currentCoins < amount) {
      return false;
    }

    const { hostBeans } = calculateGiftSplit(amount);
    const nextCoins = Math.max(0, currentCoins - amount);
    const nextBeans = (userProfile.beansBalance ?? userProfile.earnedCoins ?? 0) + (isHostRecipient ? hostBeans : 0);

    setUserProfile((prev) => ({
      ...prev,
      goldenCoins: nextCoins,
      beansBalance: nextBeans,
      earnedCoins: nextBeans,
    }));
    void saveUserWalletAndNidToFirestore({
      goldenCoins: nextCoins,
      beansBalance: nextBeans,
      earnedCoins: nextBeans,
    });

    if (postId) {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              goldenGiftsCount: (p.goldenGiftsCount || 0) + 1,
              goldenGiftsAmount: (p.goldenGiftsAmount || 0) + amount,
            };
          }
          return p;
        })
      );
    }

    const giftNotif: NotificationItem = {
      id: `notif-gift-${Date.now()}`,
      type: 'general',
      avatar: userProfile.avatar,
      title: `${userProfile.name} sent ${amount.toLocaleString()} Coins Peace Gift!`,
      subtitle: message || `Host received ${hostBeans.toLocaleString()} Beans (60%)`,
      timeAgo: 'Just now',
      isUnread: true,
      badgeType: 'heart',
      postId,
    };
    setNotifications((prev) => [giftNotif, ...prev]);

    return true;
  };

  // Handle sending golden gift coins (legacy wrapper)
  const handleSendGoldenGift = (postId: string, amount: number, message?: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    const isSelf = Boolean(
      targetPost && (targetPost.author.name === userProfile.name || targetPost.authorId === userProfile.id)
    );
    return handleSendPeaceGiftAmount(amount, isSelf, postId, message);
  };

  // Handle adding coins (Buy Coins)
  const handleAddGoldenCoins = (amount: number) => {
    const nextCoins = (userProfile.goldenCoins ?? 0) + amount;
    setUserProfile((prev) => ({
      ...prev,
      goldenCoins: nextCoins,
    }));
    void saveUserWalletAndNidToFirestore({ goldenCoins: nextCoins });
  };

  // Handle requesting cashout / Beans withdrawal (bKash / Nagad / Visa / Mastercard)
  const handleRequestCashout = (reqData: Omit<GoldenCashoutRequest, 'id' | 'status'>) => {
    const newReq: GoldenCashoutRequest = {
      ...reqData,
      id: `cashout-${Date.now()}`,
      status: 'pending',
    };

    const currentBeans = userProfile.beansBalance ?? userProfile.earnedCoins ?? 0;
    const nextBeans = Math.max(0, currentBeans - reqData.coinsAmount);
    setUserProfile((prev) => ({
      ...prev,
      beansBalance: nextBeans,
      earnedCoins: nextBeans,
    }));
    void saveUserWalletAndNidToFirestore({
      beansBalance: nextBeans,
      earnedCoins: nextBeans,
    });

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

  // Handle new post created (enforces DOMPurify sanitization + Firestore/Supabase save)
  const handlePostCreated = async (newPost: PostItem) => {

    const nowMillis = newPost.createdAtMillis || Date.now();
    const sanitizedPost: PostItem = {
      ...newPost,
      authorId: activeSwitchedPage ? activeSwitchedPage.id : newPost.authorId,
      createdAtMillis: nowMillis,
      isFreshUpload: true,
      contentBangla: sanitizeInput(newPost.contentBangla || '', POST_MAX_LENGTH),
      translation: newPost.translation ? sanitizeInput(newPost.translation, POST_MAX_LENGTH) : newPost.translation,
    };

    // Close modal & immediately show Facebook-identical "Posting..." charging ring below Stories
    setShowCreatePost(false);
    setInitialPostPhotos([]);
    navigateToTab('home');
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}

    setPendingUploadPost({ post: sanitizedPost, progress: 14 });

    const stageTimer1 = window.setTimeout(() => {
      setPendingUploadPost((cur) => (cur?.post.id === sanitizedPost.id ? { ...cur, progress: 42 } : cur));
    }, 260);
    const stageTimer2 = window.setTimeout(() => {
      setPendingUploadPost((cur) => (cur?.post.id === sanitizedPost.id ? { ...cur, progress: 74 } : cur));
    }, 620);
    const stageTimer3 = window.setTimeout(() => {
      setPendingUploadPost((cur) => (cur?.post.id === sanitizedPost.id ? { ...cur, progress: 92 } : cur));
    }, 960);

    try {
      const dbWrites = Promise.allSettled([
        insertSupabasePost(sanitizedPost, firebaseUser?.uid || userProfile.id),
        createRealtimePost(sanitizedPost),
      ]);
      const dbMaxWait = new Promise<void>((resolve) => window.setTimeout(resolve, 2200));
      const minVisualDelay = new Promise<void>((resolve) => window.setTimeout(resolve, 1250));

      await Promise.all([minVisualDelay, Promise.race([dbWrites, dbMaxWait])]);
    } catch (err) {
      console.warn('Upload background sync warning:', err);
    } finally {
      window.clearTimeout(stageTimer1);
      window.clearTimeout(stageTimer2);
      window.clearTimeout(stageTimer3);

      setPendingUploadPost((cur) => (cur?.post.id === sanitizedPost.id ? { ...cur, progress: 100 } : cur));
      await new Promise<void>((resolve) => window.setTimeout(resolve, 200));

      setPendingUploadPost((cur) => (cur?.post.id === sanitizedPost.id ? null : cur));
      setFreshNowTick(Date.now());
      setPosts((prev) => [sanitizedPost, ...prev.filter((p) => p.id !== sanitizedPost.id)]);
    }

    logUserActivity(
      userProfile.id,
      'Post',
      `নতুন পোস্ট শেয়ার করেছেন${sanitizedPost.contentBangla ? `: "${sanitizedPost.contentBangla.slice(0, 50)}"` : ''}`
    );

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
  const handleReelCreated = async (newReel: PostItem) => {
    const resolvedOwnerUid = firebaseUser?.uid || userProfile.id;
    const taggedReel: PostItem = {
      ...newReel,
      authorId: activeSwitchedPage
        ? activeSwitchedPage.id
        : resolvedOwnerUid || newReel.authorId,
      createdAtMillis: newReel.createdAtMillis || Date.now(),
    };
    setPosts((prev) => [taggedReel, ...prev.filter((p) => p.id !== taggedReel.id)]);
    setShowCreateReel(false);
    navigateToTab('reels');
    logUserActivity(userProfile.id, 'Reel', 'নতুন ভিডিও রিল আপলোড করেছেন');

    try {
      await Promise.allSettled([
        insertSupabasePost(taggedReel, resolvedOwnerUid),
        createRealtimePost(taggedReel),
      ]);
    } catch (err) {
      console.warn('Reel persistence sync notice:', err);
    }

    const prefs = loadPeaceSettings();
    if (prefs.creatorNotifyFollowersOnPost) {
      const creatorName = taggedReel.author?.name || 'প্রিয় দাদা';
      broadcastCreatorNotification({
        creatorId: taggedReel.authorId || activeSwitchedPage?.id || effectiveProfile.id || creatorName,
        creatorName,
        creatorAvatar: taggedReel.author?.avatar || effectiveProfile.avatar,
        contentType: 'video',
        title: `${creatorName} নতুন ভিডিও আপলোড করেছেন`,
        body:
          taggedReel.contentBangla?.trim().slice(0, 95) ||
          '১০০% হালাল পণ্যের নতুন কালেকশন দেখুন',
        thumbnail: taggedReel.mediaUrl,
        postId: taggedReel.id,
        link: `/?tab=reels&postId=${taggedReel.id}`,
        broadcastToAll: prefs.creatorSendPushToAllUsers,
        onLocalNotify: addLocalBroadcastNotification,
      });
    }
  };

  // Handle new live created
  const handleLiveCreated = (newLive: PostItem) => {
    const taggedLive: PostItem = {
      ...newLive,
      authorId: activeSwitchedPage ? activeSwitchedPage.id : newLive.authorId,
      createdAtMillis: newLive.createdAtMillis || Date.now(),
    };
    setPosts((prev) => [taggedLive, ...prev]);
    setShowLive(false);
    navigateToTab('home');
  };

  // Handle edit post
  const handleEditPost = (postId: string, newContent: string, newArabic?: string, newTranslation?: string) => {
    const safeContent = sanitizeInput(newContent);
    const safeTranslation = newTranslation !== undefined ? sanitizeInput(newTranslation) : undefined;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            contentBangla: safeContent,
            arabicVerse: newArabic !== undefined ? newArabic : p.arabicVerse,
            translation: safeTranslation !== undefined ? safeTranslation : p.translation,
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

  // Handle friend confirmation in notifications & Friends view
  const handleConfirmRequest = (notifOrFollowId: string) => {
    const matchedNotif = notifications.find((n) => n.id === notifOrFollowId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifOrFollowId ? { ...n, isUnread: false, read: true } : n))
    );

    if (matchedNotif && firebaseUser?.uid) {
      const senderIdFromReq = matchedNotif.requestData?.id?.includes('_')
        ? matchedNotif.requestData.id.split('_')[0]
        : '';
      const senderId = String(matchedNotif.from || senderIdFromReq || '').trim();
      const senderName = String(
        matchedNotif.requestData?.name ||
          (matchedNotif.title.includes(' sent you')
            ? matchedNotif.title.split(' sent you')[0]
            : 'Friend')
      ).trim();
      const senderAvatar = String(
        matchedNotif.requestData?.avatar || matchedNotif.avatar || ''
      ).trim();

      if (senderId) {
        addLocalFriend({ id: senderId, name: senderName, avatar: senderAvatar });
        void acceptFriendRequestInFirestore(
          {
            id: firebaseUser.uid,
            name: effectiveProfile.name,
            avatar: effectiveProfile.avatar,
          },
          {
            id: senderId,
            name: senderName,
            avatar: senderAvatar,
          },
          matchedNotif.requestData?.id,
          matchedNotif.id
        );
      }
    }

    setUserProfile((prev: UserProfile) => ({ ...prev, friendsCount: prev.friendsCount + 1 }));
  };

  // Handle friend delete in notifications & Friends view
  const handleDeleteRequest = (notifOrFollowId: string) => {
    const matchedNotif = notifications.find((n) => n.id === notifOrFollowId);
    setNotifications((prev) => prev.filter((n) => n.id !== notifOrFollowId));

    if (matchedNotif && firebaseUser?.uid) {
      const senderIdFromReq = matchedNotif.requestData?.id?.includes('_')
        ? matchedNotif.requestData.id.split('_')[0]
        : '';
      const senderId = String(matchedNotif.from || senderIdFromReq || '').trim();
      if (senderId) {
        void declineFriendRequestInFirestore(
          firebaseUser.uid,
          senderId,
          matchedNotif.requestData?.id,
          matchedNotif.id
        );
      }
    }
  };

  const openChatWithUser = React.useCallback(
    (target: { id: string; name: string; avatar: string }) => {
      if (!target?.id) return;
      const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        target.name || 'User'
      )}&backgroundColor=1877f2,0ea5e9,3b82f6`;
      const resolvedAvatar = target.avatar || fallbackAvatar;

      let chosen: ChatFriend | null = null;
      setChatFriends((prev) => {
        const existing = prev.find((f) => f.id === target.id);
        if (existing) {
          chosen = { ...existing, name: target.name || existing.name, avatar: resolvedAvatar, unreadCount: 0 };
          return prev.map((f) => (f.id === target.id ? chosen! : f));
        }
        chosen = {
          id: target.id,
          name: target.name || 'Member',
          avatar: resolvedAvatar,
          online: true,
          lastSeen: 'Active now',
          unreadCount: 0,
          messages: [],
        };
        return [chosen, ...prev];
      });

      setActiveChatFriend(
        chosen || {
          id: target.id,
          name: target.name || 'Member',
          avatar: resolvedAvatar,
          online: true,
          lastSeen: 'Active now',
          unreadCount: 0,
          messages: [],
        }
      );
      setShowMessengerModal(true);
    },
    []
  );

  // Handle send message (Real-time Firestore sync, Base64 encrypted)
  const handleSendMessage = (friendId: string, text: string) => {
    if (!firebaseUser) return;
    const encrypted = encryptMessageBase64(text);
    if (!encrypted) return;
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'me' as const,
      text: encrypted,
      time: 'Just now',
    };

    const recipient =
      (activeChatFriend?.id === friendId ? activeChatFriend : null) ||
      chatFriends.find((f) => f.id === friendId);

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

    if (firebaseUser.uid && !friendId.startsWith('chat-')) {
      void sendRealtimeDirectMessage(
        {
          id: firebaseUser.uid,
          name: effectiveProfile.name,
          avatar: effectiveProfile.avatar,
        },
        {
          id: friendId,
          name: recipient?.name || 'Member',
          avatar: recipient?.avatar || '',
        },
        encrypted
      );
    }
  };

  const latestSearchSeqRef = React.useRef(0);

  // Debounced Facebook-style Firestore user + page search
  const runUserSearch = React.useCallback(async (rawQuery: string, forceRefresh = false) => {
    const trimmed = rawQuery.trim();
    const seq = ++latestSearchSeqRef.current;
    if (!trimmed) {
      setUserSearchResults([]);
      setPageSearchResults([]);
      setIsSearchingUsers(false);
      return;
    }

    setIsSearchingUsers(true);
    try {
      const [matchedUsers, matchedPages] = await Promise.all([
        searchUsersFromFirestore(trimmed, forceRefresh),
        searchPagesFromFirestore(trimmed, forceRefresh),
      ]);
      if (latestSearchSeqRef.current !== seq) return;
      setUserSearchResults(matchedUsers);
      setPageSearchResults(matchedPages);
    } finally {
      if (latestSearchSeqRef.current === seq) {
        setIsSearchingUsers(false);
      }
    }
  }, []);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      latestSearchSeqRef.current += 1;
      setUserSearchResults([]);
      setPageSearchResults([]);
      setIsSearchingUsers(false);
      return;
    }

    setIsSearchingUsers(true);
    const timer = window.setTimeout(() => {
      void runUserSearch(trimmed, false);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [searchQuery, runUserSearch]);

  const handleUserSearchSubmit = React.useCallback(
    (submittedQuery: string) => {
      if (currentTab !== 'home') {
        navigateToTab('home');
      }
      if (submittedQuery.trim()) {
        void runUserSearch(submittedQuery, true);
      }
    },
    [currentTab, runUserSearch]
  );

  const openSearchedUserProfile = React.useCallback(
    async (targetUser: SearchedUserProfile) => {
      const currentUid = firebaseUser?.uid || userProfile.id;
      if (currentUid && targetUser.id === currentUid) {
        setViewedProfile(null);
        setSearchQuery('');
        navigateToTab('profile');
        return;
      }
      const baseProfile: UserProfile = {
        id: targetUser.id,
        name: targetUser.displayName,
        username: targetUser.username,
        avatar: targetUser.avatar,
        coverPhoto:
          targetUser.coverPhoto ||
          'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
        friendsCount: 0,
        location: targetUser.location || '',
        birthDate: '',
        bio: targetUser.bio || '',
        verified: targetUser.verified,
        isCreator: targetUser.allowFriendRequests === false,
        contactPrivacy: 'public',
      };
      setViewedProfile(baseProfile);
      setSearchQuery('');
      navigateToTab('profile');
      const remote = await fetchUserProfileFromFirestore(targetUser.id);
      if (remote) {
        setViewedProfile((prev) =>
          prev && prev.id === targetUser.id
            ? {
                ...prev,
                ...remote,
                name: remote.name || targetUser.displayName,
                avatar: remote.avatar || targetUser.avatar,
              }
            : prev
        );
      }
    },
    [firebaseUser?.uid, userProfile.id]
  );

  const handleToggleFriendRequest = React.useCallback(
    async (targetUser: SearchedUserProfile) => {
      const senderId = firebaseUser?.uid || userProfile.id || '';
      if (!senderId || senderId === targetUser.id) return;

      const currentlySent = Boolean(sentFriendRequests[targetUser.id]);
      if (!currentlySent) {
        const dailyCap = checkDailyFriendRequestLimit(senderId, false);
        if (!dailyCap.allowed) {
          console.warn(dailyCap.message || 'Max 20 friend requests per day reached.');
          return;
        }
      }

      const nextSent = !currentlySent;
      setSentFriendRequests((prev) => ({
        ...prev,
        [targetUser.id]: nextSent,
      }));
      setFriendRequestSentLocally(nextSent, targetUser.id, targetUser.displayName);

      if (currentlySent) {
        await cancelFriendRequestToUser(senderId, targetUser.id);
      } else {
        await sendFriendRequestToUser(
          senderId,
          userProfile.name,
          userProfile.avatar,
          targetUser
        );
      }
    },
    [firebaseUser?.uid, userProfile.id, userProfile.name, userProfile.avatar, sentFriendRequests]
  );

  const [feedSortMode, setFeedSortMode] = useState<'for_you' | 'latest'>('for_you');

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        tickScreenTimeSeconds(15);
      }
    }, 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  // Privacy filtered + Fresh #1 Top Pin (3 mins) + For You / Latest ranked posts for Feed
  const filteredPosts = useMemo(() => {
    const base = posts.filter((p) => {
      if (pendingUploadPost?.post.id === p.id) {
        return false;
      }

      const privacy = p.privacy || (p.isPublic ? 'public' : 'friends');
      const isAuthor = p.author.name === userProfile.name || p.author.name === effectiveProfile.name;

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

    const isFresh = (p: PostItem) =>
      (p.createdAtMillis || 0) > 0 && freshNowTick - (p.createdAtMillis || 0) < FRESH_PIN_WINDOW_MS;

    // Home Feed = Global Feed:
    // 1) Just-uploaded post (< 3 mins) pinned at #1
    // 2) Posts from people I Follow, sorted newest-first
    // 3) All other users' posts, sorted newest-first
    if (feedSortMode === 'latest') {
      return [...base].sort((a, b) => (b.createdAtMillis || 0) - (a.createdAtMillis || 0));
    }

    return [...base].sort((a, b) => {
      const aFresh = isFresh(a);
      const bFresh = isFresh(b);
      if (aFresh && !bFresh) return -1;
      if (!aFresh && bFresh) return 1;
      if (aFresh && bFresh) return (b.createdAtMillis || 0) - (a.createdAtMillis || 0);

      const aFollowed = isTargetFollowedLocally(a.authorId, a.author.name);
      const bFollowed = isTargetFollowedLocally(b.authorId, b.author.name);
      if (aFollowed && !bFollowed) return -1;
      if (!aFollowed && bFollowed) return 1;

      return (b.createdAtMillis || 0) - (a.createdAtMillis || 0);
    });
  }, [
    posts,
    pendingUploadPost?.post.id,
    feedPrivacyFilter,
    feedSortMode,
    userProfile.name,
    effectiveProfile.name,
    freshNowTick,
    FRESH_PIN_WINDOW_MS,
    followsTick,
  ]);

  // Freshly uploaded posts (< 3 minutes old) shown directly below Stories at #1 like Facebook
  const freshTopPosts = useMemo(() => {
    return filteredPosts.filter(
      (p) => (p.createdAtMillis || 0) > 0 && freshNowTick - (p.createdAtMillis || 0) < FRESH_PIN_WINDOW_MS
    );
  }, [filteredPosts, freshNowTick, FRESH_PIN_WINDOW_MS]);

  // Infinite scroll visible posts slice (loads 10 at a time, excluding freshTopPosts already rendered above)
  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  const regularVisiblePosts = useMemo(() => {
    if (freshTopPosts.length === 0) return visiblePosts;
    const freshIds = new Set(freshTopPosts.map((p) => p.id));
    return visiblePosts.filter((p) => !freshIds.has(p.id));
  }, [visiblePosts, freshTopPosts]);

  const matchesProfileAuthor = React.useCallback((post: PostItem, profile: UserProfile) => {
    const norm = (s?: string) => (s || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
    if (profile.id && post.authorId && post.authorId === profile.id) return true;
    return norm(post.author?.name) === norm(profile.name);
  }, []);

  const userPosts = useMemo(() => {
    return posts.filter((p) => matchesProfileAuthor(p, userProfile));
  }, [posts, userProfile, matchesProfileAuthor]);

  const pendingFriendRequestsCount = useMemo(() => {
    if (incomingFriendRequests.length > 0) {
      return incomingFriendRequests.length;
    }
    return notifications.filter((n) => n.type === 'friend_request').length;
  }, [incomingFriendRequests.length, notifications]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => n.isUnread).length;
  }, [notifications]);

  // Peaceverse24 YouTube Feed (Showcase + Real-time Firestore/Uploaded videos)
  const youtubeFeedPosts = React.useMemo(() => {
    const map = new Map<string, PostItem>();
    posts.forEach((p) => {
      if (p && p.id) map.set(p.id, p);
    });
    SHOWCASE_VIDEOS.forEach((sv) => {
      if (!map.has(sv.id)) {
        map.set(sv.id, sv);
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => (b.createdAtMillis || 0) - (a.createdAtMillis || 0)
    );
  }, [posts]);

  const handleToggleSubscribeCreator = React.useCallback(
    (post: PostItem) => {
      if (!firebaseUser) {
        setShowAuthModal(true);
        return;
      }
      void toggleFollowUser(
        firebaseUser.uid,
        effectiveProfile.name,
        effectiveProfile.avatar,
        post.authorId || post.author.name,
        post.author.name,
        post.author.avatar
      ).then(() => {
        setFollowsTick((t) => t + 1);
      });
    },
    [firebaseUser, effectiveProfile.name, effectiveProfile.avatar]
  );

  const handleNativeShareVideo = React.useCallback(async (post: PostItem) => {
    handleSharePost(post.id);
    const shareData = {
      title: post.contentBangla || 'Peaceverse24 — Peace in Every Video',
      text: `${post.author.name}: ${post.contentBangla || 'Watch on Peaceverse24'}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {}
  }, []);

  const handleToggleBlockCreator = React.useCallback((creatorId: string) => {
    const next = toggleBlockedCreatorId(creatorId);
    setBlockedCreatorIds(next);
    setUserProfile((prev) => ({ ...prev, blockedUserIds: next }));
  }, []);

  const requireAuthOrRun = React.useCallback(
    (fn: () => void) => {
      if (!firebaseUser) {
        setShowAuthModal(true);
        return;
      }
      fn();
    },
    [firebaseUser]
  );

  useHistoryBack(Boolean(watchingVideoPost), () => setWatchingVideoPost(null), 'yt-watch');
  useHistoryBack(showYtUpload, () => setShowYtUpload(false), 'yt-upload');
  useHistoryBack(Boolean(reportTarget), () => setReportTarget(null), 'yt-report');

  // Clean logout handler
  const handleLogout = async () => {
    clearSessionStart();
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setPendingDeletionInfo(null);
    setFirebaseUser(null);
    setActiveSwitchedPage(null);
    setSelectedPageIdToOpen(null);
    setNotifications([]);
    setIncomingFriendRequests([]);
    setChatFriends([]);
    setSentFriendRequests({});
    setCurrentTab('home');
    setTabHistory(['home']);
    try {
      localStorage.removeItem('qalby_user_profile');
      localStorage.removeItem('peaceverse_registered_name');
      localStorage.removeItem('qalby_switched_page');
      localStorage.removeItem('peaceverse_current_tab_v1');
      localStorage.removeItem('peaceverse_selected_page_id_v1');
      localStorage.removeItem('peaceverse_page_subtab_v1');
      localStorage.removeItem('peace_friends_list');
      localStorage.removeItem('peace_friends_confirmed');
      localStorage.removeItem('peace_friends_deleted');
      localStorage.removeItem('peaceverse_sent_friend_requests_v1');
      localStorage.removeItem('peaceverse_removed_suggestions_v1');
      localStorage.removeItem('qalby_chat_friends');
    } catch {}
    setUserProfile(USER_PROFILE);
    navigateToPath('/');
  };

  // Export My Data JSON download
  const handleExportMyData = () => {
    exportUserDataJson({
      userProfile: {
        ...userProfile,
        email: firebaseUser?.email || userProfile.email,
      },
      myPosts: userPosts,
      notificationsCount: notifications.length,
      cashoutRequests,
    });
    setBackupReminderDismissed(true);
  };

  // Hide /admin route from public: if (!isAdmin) redirect to /
  const hasAdminConfig = Boolean(getAuthorizedAdminEmail());
  const isAdmin =
    isAuthorizedAdminUser(firebaseUser) ||
    (!hasAdminConfig && Boolean(firebaseUser?.emailVerified));

  useEffect(() => {
    if (!isAuthChecking && showAdminPortal && !isAdmin) {
      window.history.replaceState({}, '', '/');
      setShowAdminPortal(false);
      setCurrentPath('/');
    }
  }, [isAuthChecking, showAdminPortal, isAdmin]);

  // 1. Standalone Master Admin Panel (/admin, #admin, #asol-admin-secret, ?panel=admin)
  if (showAdminPortal && !isAuthChecking && isAdmin) {
    return (
      <>
        <AdminPortal
          onBackToApp={() => {
            goAppBack(() => {
              setShowAdminPortal(false);
              navigateToPath(firebaseUser ? '/home' : '/');
            });
          }}
          firebaseUser={firebaseUser}
          onOpenAuthModal={() => setShowAuthModal(true)}
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
        <FirebaseAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  // 2. Loading screen during initial Firebase auth handshake
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-black">
        <PeaceDoveEmblem size={130} className="mb-4" />
        <div className="flex items-center gap-2.5 text-[#0866FF] font-bold text-sm tracking-wide">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Connecting to Peaceverse24.com...</span>
        </div>
      </div>
    );
  }

  // 3. Dedicated Auth Pages: /login and /signup
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

  if (currentPath === '/blog') {
    return (
      <FbBlogView
        authorName={userProfile.name}
        onBack={() =>
          goAppBack(() => navigateToPath(firebaseUser ? '/home' : '/'))
        }
      />
    );
  }

  // 4. Protected Route Gate: If visitor is NOT logged in with Firebase and not browsing as Guest, show Landing Page
  if (!firebaseUser && !guestBrowseMode) {
    return (
      <>
        <PeaceVerseLanding
          onNavigateTo={navigateToPath}
          onEnterGuestMode={() => {
            try {
              localStorage.setItem('peaceverse24_guest_mode_v1', 'true');
            } catch {}
            setGuestBrowseMode(true);
            navigateToPath('/home');
          }}
          onOpenDownloadModal={() => {
            void installApp(() => setShowInstallModal(true));
          }}
          onOpenLegalTab={(tab) => {
            setLegalModalTab(tab as LegalTabType);
          }}
        />

        {/* PWA In-App Install Guide Modal */}
        {showInstallModal && (
          <PWAInstallModal
            onClose={() => {
              setShowInstallModal(false);
            }}
          />
        )}

        {/* Legal Policies Modal */}
        {legalModalTab && (
          <LegalModal
            initialTab={legalModalTab}
            onClose={() => {
              setLegalModalTab(null);
            }}
          />
        )}
      </>
    );
  }

  // 4.5 Facebook-style 30-day Account Deletion Recovery Screen
  if (pendingDeletionInfo) {
    const formattedDate = new Date(pendingDeletionInfo.executeAt).toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4 text-[#050505]">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E4E6EB] shadow-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#050505]">
                আপনার অ্যাকাউন্ট ডিলিট করার জন্য নির্ধারিত রয়েছে
              </h2>
              <p className="text-xs text-[#65676B]">
                Facebook-এর {ACCOUNT_DELETION_GRACE_DAYS} দিনের নিয়ম প্রযোজ্য
              </p>
            </div>
          </div>

          <p className="text-xs text-[#1C1E21] leading-relaxed bg-[#F0F2F5] p-3.5 rounded-2xl">
            আপনার অ্যাকাউন্টটি <strong>{formattedDate}</strong> তারিখে স্থায়ীভাবে মুছে ফেলার জন্য শিডিউল করা আছে। আপনি চাইলে এখনই ডিলিট বাতিল করে আবার ব্যবহার শুরু করতে পারেন, অথবা ডিলিট শিডিউল বহাল রেখে লগ-আউট থাকতে পারেন।
          </p>

          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              disabled={pendingDeletionBusy}
              onClick={async () => {
                setPendingDeletionBusy(true);
                try {
                  await reactivateCurrentUserAccount();
                  setPendingDeletionInfo(null);
                  setAccountReactivatedToast('অ্যাকাউন্ট ডিলিট বাতিল করা হয়েছে! স্বাগতম।');
                  setTimeout(() => setAccountReactivatedToast(null), 5000);
                } finally {
                  setPendingDeletionBusy(false);
                }
              }}
              className="w-full py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#166FE5] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {pendingDeletionBusy && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>ডিলিট বাতিল করুন এবং অ্যাকাউন্ট চালু রাখুন</span>
            </button>

            <button
              type="button"
              disabled={pendingDeletionBusy}
              onClick={async () => {
                setPendingDeletionBusy(true);
                try {
                  await handleLogout();
                } finally {
                  setPendingDeletionBusy(false);
                }
              }}
              className="w-full py-2.5 rounded-xl bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              ডিলিট বহাল রাখুন এবং লগ-আউট করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Internal Peaceverse Mini-Apps (stay inside Peaceverse, no external redirect)
  if (currentPath === '/peace-threads') {
    return (
      <PeaceThreadsView
        userProfile={effectiveProfile}
        onBack={() => goAppBack(() => navigateToPath('/home'))}
      />
    );
  }

  if (currentPath === '/peace-insta') {
    return (
      <PeaceInstaView
        userProfile={effectiveProfile}
        posts={posts}
        onBack={() => goAppBack(() => navigateToPath('/home'))}
      />
    );
  }

  if (currentPath === '/business-suite' || currentPath === '/peace-business') {
    return (
      <PeaceBusinessSuiteView
        onBack={() => goAppBack(() => navigateToPath('/home'))}
        userProfile={effectiveProfile}
        onSwitchToPage={(page) => {
          handleSwitchToPage(page);
          navigateToPath('/home');
        }}
        feedPosts={posts}
        onToggleFeedReaction={handleToggleReaction}
        onToggleFeedSave={handleToggleSave}
        onAddFeedComment={handleAddComment}
        onEditFeedPost={handleEditPost}
        onDeleteFeedPost={handleDeletePost}
        onOpenFeedReel={(p) => setActiveReelPostId(p.id)}
        onOpenFeedGiftModal={(p) => setSelectedGiftPost(p)}
        onPublishFeedPost={(newFeedPost) => {
          setPosts((prev) => [newFeedPost, ...prev.filter((p) => p.id !== newFeedPost.id)]);
          insertSupabasePost(newFeedPost, firebaseUser?.uid || userProfile.id);
          createRealtimePost(newFeedPost);
        }}
      />
    );
  }

  if (currentPath === '/peace-edits-editor') {
    return (
      <PeaceEditsModal
        isOpen={true}
        onClose={() => goAppBack(() => navigateToPath('/home'))}
        userProfile={userProfile}
        onPublishReel={(newReel) => {
          handleReelCreated(newReel);
          navigateToPath('/home');
        }}
      />
    );
  }

  if (currentPath === '/qibla') {
    return <GlobalPrayerQiblaView onBack={() => goAppBack(() => navigateToPath('/home'))} />;
  }

  const activeWatchingPost = watchingVideoPost
    ? youtubeFeedPosts.find((p) => p.id === watchingVideoPost.id) || watchingVideoPost
    : null;
  const isShortsTab = currentTab === 'shorts' || currentTab === 'reels';
  const navActiveTab: 'home' | 'shorts' | 'live' | 'profile' =
    currentTab === 'live'
      ? 'live'
      : isShortsTab
      ? 'shorts'
      : currentTab === 'profile'
      ? 'profile'
      : 'home';

  return (
    <div
      className={`min-h-screen w-full overflow-x-clip font-sans selection:bg-[#DC2626] selection:text-white ${
        isShortsTab ? 'bg-black text-white' : 'bg-white text-zinc-950'
      }`}
    >
      {accountReactivatedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#16A34A] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg">
          {accountReactivatedToast}
        </div>
      )}

      {urlKeyBlockedMsg && (
        <div className="bg-rose-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{urlKeyBlockedMsg}</span>
          </span>
          <button
            type="button"
            onClick={() => setUrlKeyBlockedMsg(null)}
            className="text-white/90 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. YouTube-Style Top Header (hidden during full-screen vertical Peace Shorts) */}
      {!isShortsTab && (
        <YtTopHeader
          userProfile={effectiveProfile}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (q.trim() && currentTab !== 'home') {
              navigateToTab('home');
            }
          }}
          onSearchSubmit={() => {
            if (currentTab !== 'home') {
              navigateToTab('home');
            }
          }}
          onLogoClick={() => {
            setSearchQuery('');
            navigateToTab('home');
          }}
          onOpenShorts={() => navigateToTab(isShortsTab ? 'home' : 'shorts')}
          isShortsActive={isShortsTab}
          onOpenWallet={() => setShowGoldenWallet(true)}
          onOpenProfile={() => {
            setStudioTab('videos');
            navigateToTab('profile');
          }}
        />
      )}

      {/* 2. Main Views */}
      <main className="w-full">
        {/* SHORTS TAB */}
        {isShortsTab ? (
          <YtShortsView
            posts={youtubeFeedPosts}
            initialShortId={activeReelPostId}
            userProfile={effectiveProfile}
            blockedCreatorIds={blockedCreatorIds}
            followsTick={followsTick}
            onBack={() => navigateToTab('home')}
            onOpenUploadShort={() =>
              requireAuthOrRun(() => {
                setYtUploadMode('short');
                setShowYtUpload(true);
              })
            }
            onToggleSubscribe={handleToggleSubscribeCreator}
            onToggleLike={(postId) => handleToggleReaction(postId, 'like')}
            onToggleSave={handleToggleSave}
            onShare={handleNativeShareVideo}
            onAddComment={handleAddComment}
            onOpenGift={(p) => requireAuthOrRun(() => setSelectedGiftPost(p))}
            onOpenReportBlock={(p) =>
              setReportTarget({
                targetType: 'short',
                targetId: p.id,
                targetTitle: p.contentBangla,
                creatorId: p.authorId || p.author.name,
                creatorName: p.author.name,
              })
            }
          />
        ) : currentTab === 'live' ? (
          /* LIVE TAB: 6-Seat Likee-Style Peace Live + 5-Min PK Battle */
          <YtPeaceLiveView
            userProfile={effectiveProfile}
            blockedCreatorIds={blockedCreatorIds}
            onDeductCoinsAndAwardBeans={(coins, isHost) =>
              handleSendPeaceGiftAmount(coins, isHost)
            }
            onOpenWallet={() => setShowGoldenWallet(true)}
            onRequestNidVerification={() => {
              setStudioTab('nid');
              navigateToTab('profile');
            }}
            onOpenReportBlockRoom={(room: PeaceLiveRoom) =>
              setReportTarget({
                targetType: 'live',
                targetId: room.id,
                targetTitle: room.title,
                creatorId: room.hostId,
                creatorName: room.hostName,
              })
            }
          />
        ) : currentTab === 'profile' ? (
          /* STUDIO PROFILE TAB: My Videos, Coins, Beans 60%, Withdraw, 18+ NID, Report/Block */
          <YtStudioProfileView
            userProfile={effectiveProfile}
            myPosts={userPosts}
            initialTab={studioTab}
            blockedCreatorIds={blockedCreatorIds}
            isAdmin={isAdmin}
            onBack={() => navigateToTab('home')}
            onWatchVideo={(p) => setWatchingVideoPost(p)}
            onOpenWallet={() => setShowGoldenWallet(true)}
            onSaveNidVerification={async (nid: NidVerificationData) => {
              setUserProfile((prev) => ({ ...prev, nidVerification: nid }));
              await saveUserWalletAndNidToFirestore({ nidVerification: nid });
            }}
            onUnblockCreator={handleToggleBlockCreator}
            onOpenAdminPortal={() => {
              navigateToPath('/admin');
              setShowAdminPortal(true);
            }}
            onOpenLegalTab={(tab) => setLegalModalTab(tab)}
            onLogout={handleLogout}
          />
        ) : (
          /* HOME TAB: YouTube-Style Video Feed + Peace Shorts Shelf */
          <YtHomeFeed
            posts={youtubeFeedPosts}
            searchQuery={searchQuery}
            blockedCreatorIds={blockedCreatorIds}
            followsTick={followsTick}
            onToggleSubscribe={handleToggleSubscribeCreator}
            onWatchVideo={(p) => setWatchingVideoPost(p)}
            onOpenShortsAt={(id) => {
              setActiveReelPostId(id || null);
              navigateToTab('shorts');
            }}
            onToggleLike={(postId) => handleToggleReaction(postId, 'like')}
            onOpenComments={(p) => setWatchingVideoPost(p)}
            onShare={handleNativeShareVideo}
            onToggleSave={handleToggleSave}
            onOpenGift={(p) => requireAuthOrRun(() => setSelectedGiftPost(p))}
            onOpenReportBlock={(p) =>
              setReportTarget({
                targetType: p.isShort || p.videoKind === 'reel' ? 'short' : 'video',
                targetId: p.id,
                targetTitle: p.contentBangla,
                creatorId: p.authorId || p.author.name,
                creatorName: p.author.name,
              })
            }
            onOpenUpload={() =>
              requireAuthOrRun(() => {
                setYtUploadMode('choose');
                setShowYtUpload(true);
              })
            }
          />
        )}
      </main>

      {/* 3. STRICTLY 3 BUTTONS Bottom Navigation: Home | + | Live */}
      {!isShortsTab && (
        <YtBottomNav
          activeTab={navActiveTab}
          onSelectHome={() => navigateToTab('home')}
          onOpenCreate={() =>
            requireAuthOrRun(() => {
              setYtUploadMode('choose');
              setShowYtUpload(true);
            })
          }
          onSelectLive={() => navigateToTab('live')}
        />
      )}

      {/* 4. Easy Upload Modal (Video / Peace Short 15s-1m / Go Live) */}
      <YtUploadModal
        isOpen={showYtUpload}
        initialMode={ytUploadMode}
        userProfile={effectiveProfile}
        onClose={() => setShowYtUpload(false)}
        onPostCreated={async (newPost) => {
          await handlePostCreated(newPost);
          setShowYtUpload(false);
          if (newPost.isShort || newPost.videoKind === 'reel') {
            setActiveReelPostId(newPost.id);
            navigateToTab('shorts');
          } else {
            navigateToTab('home');
          }
        }}
        onSelectGoLive={() => {
          setShowYtUpload(false);
          navigateToTab('live');
        }}
      />

      {/* 5. Full YouTube Watch Modal (16:9 Video / Bunny iframe / Subscribe / Like / Comment / Save / Share / Gift / Report) */}
      <YtVideoWatchModal
        post={activeWatchingPost}
        onClose={() => setWatchingVideoPost(null)}
        userProfile={effectiveProfile}
        isSubscribed={
          activeWatchingPost
            ? isTargetFollowedLocally(
                activeWatchingPost.authorId || activeWatchingPost.author.name,
                activeWatchingPost.author.name
              )
            : false
        }
        onToggleSubscribe={handleToggleSubscribeCreator}
        onToggleLike={(postId) => handleToggleReaction(postId, 'like')}
        onToggleSave={handleToggleSave}
        onShare={handleNativeShareVideo}
        onAddComment={handleAddComment}
        onOpenGift={(p) => requireAuthOrRun(() => setSelectedGiftPost(p))}
        onOpenReportBlock={(p) =>
          setReportTarget({
            targetType: p.isShort || p.videoKind === 'reel' ? 'short' : 'video',
            targetId: p.id,
            targetTitle: p.contentBangla,
            creatorId: p.authorId || p.author.name,
            creatorName: p.author.name,
          })
        }
      />

      {/* 6. 20 Peace Gifts Modal (Small, Medium, Big, Monster — 60% Host Beans / 40% App) */}
      <YtGiftModal
        isOpen={Boolean(selectedGiftPost)}
        onClose={() => setSelectedGiftPost(null)}
        recipientName={selectedGiftPost?.author.name || 'Creator'}
        recipientAvatar={selectedGiftPost?.author.avatar}
        contextLabel={selectedGiftPost?.contentBangla}
        userCoins={userProfile.goldenCoins ?? 0}
        onSendGift={(gift: PeaceGift, message?: string) => {
          if (!selectedGiftPost) return false;
          const isSelf =
            selectedGiftPost.authorId === userProfile.id ||
            selectedGiftPost.author.name === userProfile.name;
          return handleSendPeaceGiftAmount(
            gift.coins,
            isSelf,
            selectedGiftPost.id,
            message
          );
        }}
        onOpenWallet={() => {
          setSelectedGiftPost(null);
          setShowGoldenWallet(true);
        }}
      />

      {/* 7. Geo-Detected Coins & Beans Wallet Modal (BD: bKash/Nagad, Intl: Google Play/Apple Pay/Cards) */}
      <YtWalletModal
        isOpen={showGoldenWallet}
        onClose={() => setShowGoldenWallet(false)}
        userCoins={userProfile.goldenCoins ?? 0}
        userBeans={userProfile.beansBalance ?? userProfile.earnedCoins ?? 0}
        userName={effectiveProfile.name}
        userId={effectiveProfile.id || userProfile.id || 'guest-user'}
        userAvatar={effectiveProfile.avatar}
        onAddCoins={handleAddGoldenCoins}
        onRequestCashout={handleRequestCashout}
        cashoutRequests={cashoutRequests}
      />

      {/* 8. Report & Block Creator Modal */}
      <YtReportBlockModal
        isOpen={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        targetType={reportTarget?.targetType || 'video'}
        targetId={reportTarget?.targetId || ''}
        targetTitle={reportTarget?.targetTitle}
        creatorId={reportTarget?.creatorId || ''}
        creatorName={reportTarget?.creatorName || ''}
        reporterId={firebaseUser?.uid || userProfile.id || 'guest-user'}
        isBlocked={Boolean(
          reportTarget && blockedCreatorIds.includes(reportTarget.creatorId)
        )}
        onToggleBlockCreator={(cid) => handleToggleBlockCreator(cid)}
      />

      {/* 9. Firebase Auth, Legal Policies, PWA Install & Offline Status */}
      <FirebaseAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
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

      {legalModalTab && (
        <LegalModal
          initialTab={legalModalTab}
          onClose={() => setLegalModalTab(null)}
        />
      )}

      {showInstallModal && (
        <PWAInstallModal onClose={() => setShowInstallModal(false)} />
      )}

      <OfflineIndicator />
    </div>
  );
}
