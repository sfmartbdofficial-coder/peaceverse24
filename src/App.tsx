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
  UserProfile
} from './types';
import { FbHeader } from './components/facebook/FbHeader';
import { FbCreatePostBox } from './components/facebook/FbCreatePostBox';
import { FbStories } from './components/facebook/FbStories';
import { FbPostCard } from './components/facebook/FbPostCard';
import { FbCreatePostModal } from './components/facebook/FbCreatePostModal';
import { FbCreateStoryModal } from './components/facebook/FbCreateStoryModal';
import { FbCreateReelModal } from './components/facebook/FbCreateReelModal';
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
import { HalalGuaranteeModal } from './components/HalalGuaranteeModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { LegalModal, LegalTabType } from './components/legal/LegalModal';
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';
import { PWAInstallModal } from './components/pwa/PWAInstallModal';
import { CreatorMonetizationModal } from './components/monetization/CreatorMonetizationModal';
import { FirebaseAuthModal } from './components/auth/FirebaseAuthModal';
import { useLanguage } from './context/LanguageContext';
import { INITIAL_ADS } from './data/adminData';
import { AdSlot } from './types/admin';
import { ArrowLeft, Globe, Users, Lock, Sparkles, Film, Loader2 } from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { PeaceVerseLanding } from './components/landing/PeaceVerseLanding';
import { PeaceVerseAuthPage } from './components/landing/PeaceVerseAuthPage';
import { PeaceDoveEmblem } from './components/landing/PeaceDoveEmblem';
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
  markAllRealtimeNotificationsRead,
} from './lib/firebase';

export default function App() {
  const [currentTab, setCurrentTab] = useState<FacebookMainTab>('home');
  const [tabHistory, setTabHistory] = useState<FacebookMainTab[]>(['home']);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [initialPostPhoto, setInitialPostPhoto] = useState<string | null>(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showCreateReel, setShowCreateReel] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const [showHalalPolicy, setShowHalalPolicy] = useState(false);
  
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
        setUserProfile((prev) => ({
          ...prev,
          id: usr.uid,
          name: usr.displayName || prev.name,
          email: usr.email || prev.email,
          avatar: usr.photoURL || prev.avatar,
        }));
        // Rule: If user IS logged in (Firebase Auth), auto redirect to "/home"
        const path = window.location.pathname;
        if (path === '/' || path === '/login' || path === '/signup' || path === '') {
          navigateToPath('/home');
        }
      } else {
        // Rule: If user is NOT logged in, show this landing page at "/"
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
      return stored ? JSON.parse(stored) : USER_PROFILE;
    } catch {
      return USER_PROFILE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('qalby_user_profile', JSON.stringify(userProfile));
    } catch {}
  }, [userProfile]);

  // Messenger State
  const [chatFriends, setChatFriends] = useState<ChatFriend[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_chat_friends');
      return stored ? JSON.parse(stored) : INITIAL_CHAT_FRIENDS;
    } catch {
      return INITIAL_CHAT_FRIENDS;
    }
  });
  const [activeChatFriend, setActiveChatFriend] = useState<ChatFriend | null>(null);

  // Stories (100% empty by default per Part 1 cleanup - genuine stories load from Supabase / uploads)
  const [stories, setStories] = useState<StoryItem[]>([]);

  // Posts Feed (100% empty by default per Part 1 cleanup - genuine posts load from Supabase / Firestore)
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
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
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

    return () => {
      unsubPosts();
      unsubNotifs();
    };
  }, []);

  // Infinite Scroll IntersectionObserver: loads next 10 videos as user scrolls down
  useEffect(() => {
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
  }, [posts.length]);

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

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isSameReaction = p.userReaction === reaction;
          const nextReaction = isSameReaction ? null : reaction;
          const totalDiff = isSameReaction ? -1 : p.userReaction ? 0 : 1;
          return {
            ...p,
            userReaction: nextReaction,
            reactions: {
              ...p.reactions,
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

  // Handle new post created
  const handlePostCreated = (newPost: PostItem) => {
    setPosts((prev) => [newPost, ...prev]);
    insertSupabasePost(newPost);
    createRealtimePost(newPost);
    setShowCreatePost(false);
    navigateToTab('home');
  };

  // Handle new story created
  const handleStoryCreated = (newStory: StoryItem) => {
    setStories((prev) => [newStory, ...prev]);
    setShowCreateStory(false);
    navigateToTab('home');
  };

  // Handle new reel created
  const handleReelCreated = (newReel: PostItem) => {
    setPosts((prev) => [newReel, ...prev]);
    insertSupabasePost(newReel);
    createRealtimePost(newReel);
    setShowCreateReel(false);
    navigateToTab('reels');
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

    if (activeChatFriend && activeChatFriend.id === friendId) {
      setActiveChatFriend((prev) =>
        prev ? { ...prev, messages: [...prev.messages, newMsg] } : null
      );
    }
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
        onNavigateHome={() => navigateToPath('/home')}
        onNavigateTo={navigateToPath}
      />
    );
  }

  if (currentPath === '/signup') {
    return (
      <PeaceVerseAuthPage
        initialMode="signup"
        onNavigateHome={() => navigateToPath('/home')}
        onNavigateTo={navigateToPath}
      />
    );
  }

  // 3. Landing Page Flow for non-logged-in visitors at "/"
  if (!firebaseUser && (currentPath === '/' || currentPath === '')) {
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
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#18191a] text-[#e4e6eb] font-sans selection:bg-[#1877F2] selection:text-white">
      
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
            if (chatFriends.length > 0) setActiveChatFriend(chatFriends[0]);
          }}
          onOpenMenu={() => navigateToTab('menu')}
          onBack={goBack}
          showBackButton={currentTab !== 'home'}
          unreadMessagesCount={4}
        />
      )}

      {/* 2. Main Tab Views */}
      <main className="w-full">
        
        {/* TAB 1: Home (ফিড - Screenshot 1) */}
        {currentTab === 'home' && (
          <div className="max-w-[700px] mx-auto pb-24 space-y-2.5">
            {/* What's on your mind? Box */}
            <FbCreatePostBox
              userProfile={userProfile}
              onOpenCreateModal={(photo?: string) => {
                setInitialPostPhoto(photo || null);
                setShowCreatePost(true);
              }}
              onOpenProfile={() => navigateToTab('profile')}
            />

            {/* Stories & Reels Bar */}
            <div className="bg-[#242526] py-3 px-3 sm:px-4 border-y border-[#393a3b] shadow-sm">
              <FbStories
                stories={stories}
                onOpenCreateStory={() => setShowCreateStory(true)}
                onOpenCreateReel={() => setShowCreateReel(true)}
              />
            </div>

            {/* Feed Privacy Filters */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#242526] border-y border-[#393a3b] text-xs overflow-x-auto no-scrollbar">
              <span className="text-[#b0b3b8] text-[11px] font-semibold mr-1 shrink-0">ফিল্টার:</span>
              <button
                onClick={() => setFeedPrivacyFilter('all')}
                className={`px-3 py-1 rounded-full font-bold transition-all shrink-0 ${
                  feedPrivacyFilter === 'all' ? 'bg-[#1877F2] text-white shadow-sm' : 'text-[#b0b3b8] hover:bg-[#3a3b3c]'
                }`}
              >
                সব পোস্ট
              </button>
              <button
                onClick={() => setFeedPrivacyFilter('public')}
                className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1 shrink-0 ${
                  feedPrivacyFilter === 'public' ? 'bg-[#1877F2] text-white shadow-sm' : 'text-[#b0b3b8] hover:bg-[#3a3b3c]'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>পাবলিক</span>
              </button>
              <button
                onClick={() => setFeedPrivacyFilter('friends')}
                className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1 shrink-0 ${
                  feedPrivacyFilter === 'friends' ? 'bg-[#1877F2] text-white shadow-sm' : 'text-[#b0b3b8] hover:bg-[#3a3b3c]'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>বন্ধুরা</span>
              </button>
              <button
                onClick={() => setFeedPrivacyFilter('private')}
                className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1 shrink-0 ${
                  feedPrivacyFilter === 'private' ? 'bg-amber-600 text-white shadow-sm' : 'text-[#b0b3b8] hover:bg-[#3a3b3c]'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>শুধুমাত্র আমি</span>
              </button>
            </div>

            {/* Posts Feed matching Screenshot 1 */}
            <div className="space-y-2.5">
              {filteredPosts.length === 0 ? (
                <div className="bg-[#242526] rounded-2xl border border-[#393a3b] p-8 text-center space-y-3 shadow-sm my-2">
                  <div className="w-14 h-14 rounded-full bg-[#1877F2]/15 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2] mx-auto shadow-sm">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    No posts yet - Your genuine posts will appear here
                  </h3>
                  <p className="text-xs text-[#b0b3b8] max-w-sm mx-auto">
                    Share your genuine videos, thoughts, and moments using the box above.
                  </p>
                </div>
              ) : (
                <>
                  {visiblePosts.map((post) => (
                    <FbPostCard
                      key={post.id}
                      post={post}
                      onToggleReaction={handleToggleReaction}
                      onToggleSave={handleToggleSave}
                      onAddComment={handleAddComment}
                      onEditPost={handleEditPost}
                      onDeletePost={handleDeletePost}
                      onOpenProfile={() => navigateToTab('profile')}
                      onTypingChange={handleTypingChange}
                      currentUserId={userProfile.id || 'user-me'}
                      currentUserName={userProfile.name}
                    />
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
          <FbMarketplaceView onBack={goBack} />
        )}

        {/* TAB 5: Notifications (নোটিফিকেশন - Screenshot 2) */}
        {currentTab === 'notifications' && (
          <FbNotificationsView
            notifications={notifications}
            onOpenMenu={() => navigateToTab('menu')}
            onBack={goBack}
            onConfirmRequest={handleConfirmRequest}
            onDeleteRequest={handleDeleteRequest}
          />
        )}

        {/* TAB 6: Profile (প্রোফাইল - Screenshot 4) */}
        {currentTab === 'profile' && (
          <FbProfileView
            userProfile={userProfile}
            userPosts={userPosts}
            onOpenMenu={() => navigateToTab('menu')}
            onBack={goBack}
            onAddStory={() => setShowCreateStory(true)}
            onToggleReaction={handleToggleReaction}
            onToggleSave={handleToggleSave}
            onAddComment={handleAddComment}
            onUpdateProfile={(updated) => setUserProfile(updated)}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
          />
        )}

        {/* TAB 7: Menu (মেনু - Screenshot 5) */}
        {currentTab === 'menu' && (
          <FbMenuView
            userProfile={userProfile}
            onNavigateTab={navigateToTab}
            onOpenProfile={() => navigateToTab('profile')}
            onOpenHalalPolicy={() => setShowHalalPolicy(true)}
            onOpenAdminPortal={() => {
              setShowAdminPortal(true);
              window.location.hash = '#admin';
            }}
            onOpenMonetization={() => setShowMonetizationModal(true)}
            onOpenLegalTab={(tab) => {
              setLegalModalTab(tab);
              window.location.hash = `#${tab}`;
            }}
            onOpenInstallModal={() => setShowInstallModal(true)}
            onOpenAuth={() => setShowAuthModal(true)}
            onLogout={() => {
              logoutUser();
              setUserProfile(USER_PROFILE);
              navigateToPath('/');
            }}
            onBack={goBack}
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
          <FbPagesView onBack={goBack} userProfile={userProfile} />
        )}

        {/* TAB 11: Memories */}
        {currentTab === 'memories' && (
          <FbMemoriesView onBack={goBack} posts={posts} />
        )}

      </main>

      {/* Floating Quick-Back Button whenever not on Home */}
      {currentTab !== 'home' && (
        <div className="fixed bottom-14 left-4 z-40 animate-in slide-in-from-bottom-2">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold shadow-2xl border border-white/20 active:scale-95 transition-transform"
            title="পেছনে যান (Back)"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>ব্যাক (Back)</span>
          </button>
        </div>
      )}

      {/* 3. Exact 6-Icon Bottom Navigation Bar (Screenshots 1, 2, 4, 5) */}
      <FbBottomNav
        currentTab={currentTab}
        onTabChange={navigateToTab}
        userProfile={userProfile}
        friendRequestsCount={pendingFriendRequestsCount}
        notificationsCount={39}
      />

      {/* 4. Facebook Create Post Modal */}
      {showCreatePost && (
        <FbCreatePostModal
          userProfile={userProfile}
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

      {/* 5. Messenger Chat Modal */}
      {activeChatFriend && (
        <FbMessengerModal
          friend={activeChatFriend}
          onClose={() => setActiveChatFriend(null)}
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
      <PWAInstallBanner onOpenGuide={() => setShowInstallModal(true)} />

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

    </div>
  );
}
