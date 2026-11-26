import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import {
  getFirestore,
  initializeFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocFromCache,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  getDocFromServer,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { PostItem, PostComment, NotificationItem, ReactionType, UserProfile, SearchedUserProfile, PageItem, ChatMessage } from '../types';
import { DUMMY_COMMUNITY_USERS, DUMMY_GLOBAL_POSTS } from '../data/dummyCommunity';
import { syncSupabaseProfile, fetchSupabaseProfiles } from './supabase';
import {
  getEnvApiKey,
  emitApiKeyEnvWarning,
  detectAndBlockExposedUrlKeys,
  checkRateLimit,
  checkDailyFriendRequestLimit,
  sanitizeInput,
  POST_MAX_LENGTH,
  resetSessionStart,
  clearSessionStart,
} from '../utils/security';

emitApiKeyEnvWarning();
detectAndBlockExposedUrlKeys();

// API keys loaded strictly from process.env.API_KEY / Vercel Environment Variables (never hardcoded)
const resolvedFirebaseConfig = {
  apiKey: getEnvApiKey() || process.env.API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'gen-lang-client-0936405543.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0936405543',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0936405543.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '499589609756',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:499589609756:web:6b0e982f903121c07562d9',
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_DATABASE_ID ||
    'ai-studio-peaceverse-d7a086ee-044c-4934-8539-89a03de39673',
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(resolvedFirebaseConfig);

// Firebase App Check to prevent bot & automated script abuse
export const firebaseAppCheck = (() => {
  if (typeof window === 'undefined') return null;
  try {
    const appCheckKey = import.meta.env?.VITE_FIREBASE_APPCHECK_SITE_KEY || '';
    if (!appCheckKey) return null;
    return initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    console.warn('Firebase App Check notice:', err);
    return null;
  }
})();

// Initialize Firestore with specific database ID and auto-long-polling for reliable iframe/mobile connections
export const db = (() => {
  try {
    return initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true,
        ignoreUndefinedProperties: true,
      },
      resolvedFirebaseConfig.firestoreDatabaseId
    );
  } catch {
    return getFirestore(app, resolvedFirebaseConfig.firestoreDatabaseId);
  }
})();

function isOfflineOrUnavailableError(err: any): boolean {
  const code = String(err?.code || '').toLowerCase();
  const msg = String(err?.message || err || '').toLowerCase();
  return (
    code === 'unavailable' ||
    code === 'failed-precondition' ||
    msg.includes('client is offline') ||
    msg.includes('offline') ||
    msg.includes('unavailable') ||
    msg.includes('network')
  );
}

async function getDocSafe(docRef: ReturnType<typeof doc>) {
  try {
    return await getDoc(docRef);
  } catch (err) {
    if (isOfflineOrUnavailableError(err)) {
      try {
        return await getDocFromCache(docRef);
      } catch {
        return null;
      }
    }
    throw err;
  }
}

// Initialize Auth
export const auth = getAuth(app);

// Firestore Error Handling (Section 3 of Firebase Integration Skill)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

// Export active project information for debugging & configuration transparency
export const activeFirebaseConfig = resolvedFirebaseConfig;
export const activeFirebaseProjectId = resolvedFirebaseConfig.projectId;

// Helper for sound notification (Halal Web Audio Chime)
export function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

// Request and trigger browser push notifications
export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  try {
    if (Notification.permission === 'granted') return true;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}

export function triggerPushNotification(title: string, options?: NotificationOptions) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
        badge: '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
        ...options,
      });
    } catch {
      // Fallback
    }
  }
}

// Test Firebase connection
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Peaceverse24.com: Connected to Firestore successfully.');
    return true;
  } catch (err: any) {
    if (
      err?.message?.includes('the client is offline') ||
      err?.code === 'unavailable' ||
      err?.message?.includes('unavailable')
    ) {
      console.warn('Peaceverse24.com: Firestore offline mode active. App working seamlessly.');
    }
    return false;
  }
}

// ==========================================
// REAL-TIME POSTS LISTENERS & ACTIONS
// ==========================================

function mapFirestoreDocToPostItem(id: string, data: Record<string, any>): PostItem {
  const parsedCreatedAt = data.createdAt ? Date.parse(String(data.createdAt)) : 0;
  const createdAtMillis = Number(
    data.createdAtMillis || (Number.isFinite(parsedCreatedAt) ? parsedCreatedAt : 0)
  );
  return {
    id,
    author: data.author || {
      name: data.authorName || 'Peaceverse24.com User',
      avatar:
        data.authorAvatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80',
      verified: data.authorVerified ?? true,
      subtitle: data.authorSubtitle || 'Just now • 🌐',
    },
    timeAgo: data.timeAgo || 'Just now',
    isPublic: data.privacy ? data.privacy === 'public' : (data.isPublic ?? true),
    privacy: data.privacy || 'public',
    status: data.status || 'approved',
    moderationReason: data.moderationReason,
    appealStatus: data.appealStatus || 'none',
    authorId: data.authorId,
    contentBangla: data.contentBangla || data.content || '',
    arabicVerse: data.arabicVerse,
    translation: data.translation,
    reference: data.reference,
    mediaType: data.mediaType || 'none',
    mediaUrl: data.mediaUrl,
    mediaUrls: Array.isArray(data.mediaUrls) ? data.mediaUrls : undefined,
    youtubeId: data.youtubeId,
    duration: data.duration,
    durationSeconds: typeof data.durationSeconds === 'number' ? data.durationSeconds : undefined,
    videoKind: data.videoKind === 'reel' || data.videoKind === 'long' ? data.videoKind : undefined,
    isLive: data.isLive,
    category: data.category || 'Community',
    reactions: data.reactions || {
      total: data.likesCount || 0,
      likeCount: data.likesCount || 0,
      loveCount: 0,
      subhanallahCount: 0,
      mashaallahCount: 0,
    },
    userReaction: data.userReaction || null,
    comments: Array.isArray(data.comments) ? data.comments : [],
    sharesCount: data.sharesCount || 0,
    isSaved: data.isSaved || false,
    bgGradient: data.bgGradient,
    location: data.location,
    feeling: data.feeling,
    taggedFriends: data.taggedFriends,
    typingUsers: data.typingUsers || [],
    goldenGiftsCount: data.goldenGiftsCount,
    goldenGiftsAmount: data.goldenGiftsAmount,
    musicTitle: data.musicTitle,
    createdAtMillis: Number.isFinite(createdAtMillis) ? createdAtMillis : 0,
  };
}

export function subscribeToRealtimePosts(
  onUpdate: (posts: PostItem[]) => void,
  onError?: (error: any) => void
) {
  try {
    const postsRef = collection(db, 'posts');
    const orderedQuery = query(postsRef, orderBy('createdAtMillis', 'desc'), limit(150));
    const mergedById = new Map<string, PostItem>();

    const emitMerged = () => {
      if (mergedById.size === 0) return;
      const list = Array.from(mergedById.values()).sort(
        (a, b) => (b.createdAtMillis || 0) - (a.createdAtMillis || 0)
      );
      onUpdate(list);
    };

    // One-time legacy fallback fetch so older posts without createdAtMillis still load alongside latest 150
    getDocs(query(postsRef, limit(100)))
      .then((snap) => {
        let added = false;
        snap.forEach((docSnap) => {
          if (!mergedById.has(docSnap.id)) {
            mergedById.set(docSnap.id, mapFirestoreDocToPostItem(docSnap.id, docSnap.data()));
            added = true;
          }
        });
        if (added) emitMerged();
      })
      .catch(() => {});

    let fallbackUnsub: (() => void) | null = null;
    const mainUnsub = onSnapshot(
      orderedQuery,
      (snapshot) => {
        snapshot.forEach((docSnap) => {
          mergedById.set(docSnap.id, mapFirestoreDocToPostItem(docSnap.id, docSnap.data()));
        });
        emitMerged();
      },
      (error) => {
        console.warn('Realtime ordered posts subscription notice, trying fallback:', error);
        if (!fallbackUnsub) {
          fallbackUnsub = onSnapshot(
            query(postsRef, limit(150)),
            (snap) => {
              snap.forEach((docSnap) => {
                mergedById.set(docSnap.id, mapFirestoreDocToPostItem(docSnap.id, docSnap.data()));
              });
              emitMerged();
            },
            (err2) => {
              if (onError) onError(err2);
            }
          );
        }
        if (onError) onError(error);
      }
    );

    return () => {
      mainUnsub();
      if (fallbackUnsub) fallbackUnsub();
    };
  } catch (err) {
    console.warn('Realtime subscription initialization:', err);
    return () => {};
  }
}

// Seed initial posts to Firestore disabled per cleanup instructions
export async function seedInitialPostsIfEmpty(_initialPosts: PostItem[]) {
  // Feed is 100% empty by default - only genuine posts will appear
  return;
}

// Allow any signed-in non-anonymous Firebase user (Google, Email/Password, Phone) to post
function isCurrentUserVerifiedForPosting(): boolean {
  const u = auth.currentUser;
  if (!u || u.isAnonymous) return false;
  if (u.emailVerified) return true;
  if (u.email?.endsWith('@phone.peaceverse.app')) return true;
  if (u.providerData && u.providerData.length > 0) return true;
  if (u.uid) return true;
  return false;
}

function stripUndefinedFields<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      cleaned[k] = v;
    }
  }
  return cleaned;
}

// Create a new post in Firestore with Real-time push
export async function createRealtimePost(post: PostItem): Promise<boolean> {
  if (!isCurrentUserVerifiedForPosting()) {
    console.warn('Security Block: Authentication required before posting.');
    return false;
  }

  const actorId = auth.currentUser?.uid || post.authorId || 'anonymous';
  const rate = checkRateLimit(actorId);
  if (!rate.allowed) {
    console.warn(`Rate limit exceeded. Try again in ${rate.retryAfterSec}s.`);
    return false;
  }

  try {
    const postRef = doc(db, 'posts', post.id);
    const payload = stripUndefinedFields({
      ...post,
      authorId: post.authorId || actorId,
      contentBangla: sanitizeInput(post.contentBangla || '', POST_MAX_LENGTH),
      arabicVerse: post.arabicVerse ? sanitizeInput(post.arabicVerse, POST_MAX_LENGTH) : undefined,
      translation: post.translation ? sanitizeInput(post.translation, POST_MAX_LENGTH) : undefined,
      privacy: post.privacy || 'public',
      status: post.status || 'approved',
      createdAtMillis: post.createdAtMillis || Date.now(),
      createdAt: new Date(post.createdAtMillis || Date.now()).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Never drop persistent URLs (/api/media/, pv-media://, https://).
    // Only offload/trim raw inline data: payloads if document approaches Firestore's 1 MB limit.
    let approxBytes = JSON.stringify(payload).length;
    if (approxBytes > 920_000) {
      try {
        const { uploadDataUrlIfOversized } = await import('./mediaStorage');
        if (typeof payload.mediaUrl === 'string' && payload.mediaUrl.startsWith('data:')) {
          const kind = payload.mediaType === 'video' ? 'video' : 'image';
          payload.mediaUrl = await uploadDataUrlIfOversized(payload.mediaUrl, kind, true);
        }
        if (Array.isArray(payload.mediaUrls)) {
          payload.mediaUrls = await Promise.all(
            payload.mediaUrls.map((u: string) =>
              typeof u === 'string' && u.startsWith('data:')
                ? uploadDataUrlIfOversized(u, 'image', true)
                : Promise.resolve(u)
            )
          );
          if (payload.mediaUrls[0]) {
            payload.mediaUrl = payload.mediaUrls[0];
          }
        }
      } catch {}

      approxBytes = JSON.stringify(payload).length;
      if (approxBytes > 950_000) {
        if (Array.isArray(payload.mediaUrls) && payload.mediaUrls.length > 1) {
          const trimmedUrls: string[] = [];
          for (const url of payload.mediaUrls) {
            trimmedUrls.push(url);
            if (JSON.stringify({ ...payload, mediaUrls: trimmedUrls, mediaUrl: trimmedUrls[0] }).length > 900_000) {
              trimmedUrls.pop();
              break;
            }
          }
          payload.mediaUrls = trimmedUrls.length > 0 ? trimmedUrls : undefined;
          payload.mediaUrl = trimmedUrls[0] || undefined;
        } else if (typeof payload.mediaUrl === 'string' && payload.mediaUrl.startsWith('data:')) {
          delete payload.mediaUrl;
          payload.mediaType = 'none';
        }
      }
    }

    await setDoc(postRef, payload);
    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, `posts/${post.id}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice creating realtime post:', err);
    }
    return false;
  }
}

// Add comment in real-time
export async function addRealtimeComment(
  postId: string,
  comment: PostComment,
  _postAuthorName?: string,
  postFallback?: PostItem
): Promise<boolean> {
  const actorId = auth.currentUser?.uid || comment.author || 'anonymous';
  const rate = checkRateLimit(actorId);
  if (!rate.allowed) {
    console.warn(`Rate limit exceeded. Try again in ${rate.retryAfterSec}s.`);
    return false;
  }

  try {
    const safeComment: PostComment = {
      ...comment,
      author: sanitizeInput(comment.author || '', 80),
      text: sanitizeInput(comment.text || '', POST_MAX_LENGTH),
    };
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDocSafe(postRef);
    let existingComments: PostComment[] = [];
    let postAuthorId: string | undefined = postFallback?.authorId;
    if (!postSnap || !postSnap.exists()) {
      const fallback = postFallback || DUMMY_GLOBAL_POSTS.find((dp) => dp.id === postId);
      if (!fallback) return false;
      postAuthorId = fallback.authorId;
      existingComments = (fallback.comments || []).filter((c) => c.id !== safeComment.id);
      await setDoc(postRef, {
        ...stripUndefinedFields(fallback),
        comments: [safeComment, ...existingComments],
        createdAt: new Date(fallback.createdAtMillis || Date.now()).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      const snapData = postSnap.data();
      postAuthorId = snapData.authorId || postFallback?.authorId;
      existingComments = (snapData.comments || []).filter((c: PostComment) => c.id !== safeComment.id);
      const updatedComments = [safeComment, ...existingComments];

      await updateDoc(postRef, {
        comments: updatedComments,
        updatedAt: new Date().toISOString(),
      });
    }

    // Also write to subcollection for individual snapshot listener
    const commentDocRef = doc(db, `posts/${postId}/comments`, safeComment.id);
    await setDoc(commentDocRef, {
      ...safeComment,
      createdAt: new Date().toISOString(),
    });

    // Trigger instant notification targeted to post author (skip notifying self)
    const senderUid = auth.currentUser?.uid || comment.author;
    if (!postAuthorId || !senderUid || postAuthorId !== senderUid) {
      await sendRealtimeNotification({
        id: `notif-${Date.now()}`,
        type: 'comment',
        from: senderUid,
        to: postAuthorId || 'all',
        avatar: safeComment.avatar,
        title: `${safeComment.author} আপনার পোস্টে মন্তব্য করেছেন`,
        subtitle: `"${safeComment.text.length > 35 ? safeComment.text.slice(0, 35) + '...' : safeComment.text}"`,
        timeAgo: 'Just now',
        isUnread: true,
        badgeType: 'comment',
        postId,
      });
    }

    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice adding realtime comment:', err);
    }
    return false;
  }
}

// Toggle reaction in real-time
export async function toggleRealtimeReaction(
  postId: string,
  userName: string,
  userAvatar: string,
  reaction: ReactionType,
  currentReaction: ReactionType | null | undefined
): Promise<boolean> {
  const actorId = auth.currentUser?.uid || userName || 'anonymous';
  const rate = checkRateLimit(actorId);
  if (!rate.allowed) {
    console.warn(`Rate limit exceeded. Try again in ${rate.retryAfterSec}s.`);
    return false;
  }

  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDocSafe(postRef);
    const dummyPost = !postSnap || !postSnap.exists() ? DUMMY_GLOBAL_POSTS.find((dp) => dp.id === postId) : null;

    if ((!postSnap || !postSnap.exists()) && !dummyPost) return false;
    const data = postSnap && postSnap.exists() ? postSnap.data() : (dummyPost as any);

    const isSame = currentReaction === reaction;
    const nextReaction = isSame ? null : reaction;
    const diff = isSame ? -1 : currentReaction ? 0 : 1;

    const currentReactions = data.reactions || {
      total: 0,
      likeCount: 0,
      loveCount: 0,
      subhanallahCount: 0,
      mashaallahCount: 0,
    };

    const keyMap: Record<ReactionType, 'likeCount' | 'loveCount' | 'subhanallahCount' | 'mashaallahCount' | 'careCount' | 'sadCount'> = {
      like: 'likeCount',
      love: 'loveCount',
      subhanallah: 'subhanallahCount',
      mashaallah: 'mashaallahCount',
      care: 'careCount',
      sad: 'sadCount',
    };

    const newTotal = Math.max(0, (currentReactions.total || 0) + diff);
    const updatedReactions = {
      ...currentReactions,
      total: newTotal,
    };

    if (currentReaction && keyMap[currentReaction]) {
      const prevKey = keyMap[currentReaction];
      updatedReactions[prevKey] = Math.max(0, (updatedReactions[prevKey] || 0) - 1);
    }
    if (nextReaction && keyMap[nextReaction]) {
      const nextKey = keyMap[nextReaction];
      updatedReactions[nextKey] = (updatedReactions[nextKey] || 0) + 1;
    }

    if (dummyPost) {
      await setDoc(postRef, {
        ...stripUndefinedFields(dummyPost),
        reactions: updatedReactions,
        userReaction: nextReaction,
        createdAt: new Date(dummyPost.createdAtMillis || Date.now()).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(postRef, {
        reactions: updatedReactions,
        userReaction: nextReaction,
        updatedAt: new Date().toISOString(),
      });
    }

    if (!isSame) {
      const postAuthorId = data.authorId ? String(data.authorId) : undefined;
      const senderUid = auth.currentUser?.uid || userName;
      if (!postAuthorId || !senderUid || postAuthorId !== senderUid) {
        const reactionBangla: Record<ReactionType, string> = {
          like: '🤲 Dua দিয়েছেন',
          love: '❤️ MashaAllah দিয়েছেন',
          subhanallah: '🕋 SubhanAllah বলেছেন',
          mashaallah: '🙏 Alhamdulillah বলেছেন',
          care: '🤝 InshaAllah দিয়েছেন',
          sad: '😢 Astagfirullah বলেছেন',
        };

        await sendRealtimeNotification({
          id: `notif-${Date.now()}`,
          type: 'like',
          from: senderUid,
          to: postAuthorId || 'all',
          avatar: userAvatar,
          title: `${userName} আপনার পোস্টে ${reactionBangla[reaction] || 'রিয়েক্ট দিয়েছেন'}`,
          subtitle: 'আপনার পোস্টের সাথে যুক্ত থাকুন',
          timeAgo: 'Just now',
          isUnread: true,
          badgeType: 'like',
          postId,
        });
      }
    }

    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice toggling realtime reaction:', err);
    }
    return false;
  }
}

// Set typing indicator status in real-time
export async function setRealtimeTypingStatus(
  postId: string,
  userId: string,
  userName: string,
  isTyping: boolean
) {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDocSafe(postRef);
    if (!postSnap || !postSnap.exists()) return;

    const data = postSnap.data();
    let typingList: { id: string; name: string }[] = data.typingUsers || [];

    if (isTyping) {
      if (!typingList.some((u) => u.id === userId)) {
        typingList = [...typingList, { id: userId, name: userName }];
      }
    } else {
      typingList = typingList.filter((u) => u.id !== userId);
    }

    await updateDoc(postRef, {
      typingUsers: typingList,
    });
  } catch {
    // Ignore minor typing errors
  }
}

// Update post privacy
export async function updateRealtimePostPrivacy(
  postId: string,
  privacy: 'public' | 'friends' | 'private'
): Promise<boolean> {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      privacy,
      isPublic: privacy === 'public',
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice updating post privacy:', err);
    }
    return false;
  }
}

// Moderate Post (Block, Reject, Approve, Delete)
export async function moderateRealtimePost(
  postId: string,
  status: 'approved' | 'blocked' | 'rejected',
  reason: string,
  authorName?: string
): Promise<boolean> {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      status,
      moderationReason: reason,
      updatedAt: new Date().toISOString(),
    });

    // Notify user of moderation action
    const statusMsg =
      status === 'blocked'
        ? `আপনার একটি পোস্ট গাইডলাইন লঙ্ঘনের কারণে ব্লক করা হয়েছে`
        : status === 'rejected'
        ? `আপনার পোস্টটি বাতিল করা হয়েছে: "${reason}"`
        : `আপনার পোস্টটি পর্যালোচনা শেষে অনুমোদিত হয়েছে`;

    await sendRealtimeNotification({
      id: `mod-notif-${Date.now()}`,
      type: 'moderation',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      title: 'Peaceverse24.com কনটেন্ট মডারেশন টিম',
      subtitle: statusMsg,
      timeAgo: 'Just now',
      isUnread: true,
      badgeType: 'shield',
      postId,
    });

    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice moderating post:', err);
    }
    return false;
  }
}

// Delete post
export async function deleteRealtimePost(postId: string): Promise<boolean> {
  try {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.DELETE, `posts/${postId}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice deleting post:', err);
    }
    return false;
  }
}

// Submit appeal for blocked/rejected post
export async function submitRealtimeAppeal(
  postId: string,
  userId: string,
  userName: string,
  reason: string
): Promise<boolean> {
  try {
    const appealRef = doc(db, 'appeals', `appeal-${postId}-${Date.now()}`);
    await setDoc(appealRef, {
      postId,
      userId,
      userName,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    // Update post appealStatus
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      appealStatus: 'pending',
      updatedAt: new Date().toISOString(),
    });

    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, `appeals/${postId}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice submitting appeal:', err);
    }
    return false;
  }
}

// ==========================================
// REAL-TIME NOTIFICATIONS
// ==========================================

export function subscribeToRealtimeNotifications(
  currentUserId: string | undefined,
  onUpdate: (notifications: NotificationItem[]) => void,
  onError?: (error: any) => void
) {
  try {
    const notifsRef = collection(db, 'notifications');
    const q = query(notifsRef, limit(80));

    return onSnapshot(
      q,
      (snapshot) => {
        const ownedPageIds = new Set<string>();
        try {
          const pagesRaw = localStorage.getItem('qalby_fb_pages');
          if (pagesRaw) {
            const parsed = JSON.parse(pagesRaw);
            if (Array.isArray(parsed)) {
              parsed.forEach((pg: { id?: string; isOwner?: boolean }) => {
                if (pg?.id && pg.isOwner !== false) ownedPageIds.add(String(pg.id).trim());
              });
            }
          }
        } catch {}

        const liveNotifs: (NotificationItem & { createdAtMillis?: number })[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const recipient = String(data.to || data.recipientId || '').trim();
          const sender = String(data.from || data.senderId || '').trim();

          // Filter user-targeted notifications so Account A never sees Account B's private alerts
          if (recipient && recipient !== 'all') {
            const matchesMe = Boolean(
              currentUserId && (recipient === currentUserId || ownedPageIds.has(recipient))
            );
            if (!matchesMe) return;
          }

          // Never show user's own outgoing action back to themselves as an incoming alert
          if (
            currentUserId &&
            sender &&
            (sender === currentUserId || ownedPageIds.has(sender)) &&
            (data.type === 'friend_request' || data.type === 'like' || data.type === 'comment')
          ) {
            return;
          }

          const parsedCreatedAt = data.createdAt ? Date.parse(String(data.createdAt)) : 0;
          const createdAtMillis = Number(
            data.createdAtMillis || (Number.isFinite(parsedCreatedAt) ? parsedCreatedAt : 0)
          );

          liveNotifs.push({
            id: docSnap.id,
            type: data.type || 'general',
            from: data.from,
            to: data.to || data.recipientId,
            read: data.read ?? !data.isUnread,
            avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
            title: data.title || '',
            subtitle: data.subtitle,
            image: data.image,
            link: data.link,
            timeAgo: data.timeAgo || 'Just now',
            isUnread: data.isUnread ?? !(data.read ?? false),
            badgeType: data.badgeType || 'bell',
            postId: data.postId,
            requestData: data.requestData,
            createdAtMillis: Number.isFinite(createdAtMillis) ? createdAtMillis : 0,
          });
        });

        liveNotifs.sort((a, b) => (b.createdAtMillis || 0) - (a.createdAtMillis || 0));
        onUpdate(liveNotifs);
      },
      (error) => {
        console.warn('Realtime notifications notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Notifications subscribe error:', err);
    return () => {};
  }
}

export async function sendRealtimeNotification(notification: NotificationItem) {
  try {
    const notifRef = doc(db, 'notifications', notification.id);
    const cleanPayload: Record<string, any> = {
      id: notification.id,
      type: notification.type,
      from: notification.from || 'creator',
      to: notification.to || 'all',
      read: notification.read ?? false,
      avatar: notification.avatar,
      title: notification.title,
      subtitle: notification.subtitle || '',
      timeAgo: notification.timeAgo || 'Just now',
      isUnread: notification.isUnread ?? true,
      badgeType: notification.badgeType || 'bell',
      createdAtMillis: Date.now(),
      createdAt: new Date().toISOString(),
    };
    if (notification.image) cleanPayload.image = notification.image;
    if (notification.link) cleanPayload.link = notification.link;
    if (notification.postId) cleanPayload.postId = notification.postId;

    await setDoc(notifRef, cleanPayload);

    // Sound chime & browser push
    playNotificationSound();
    triggerPushNotification(notification.title, {
      body: notification.subtitle,
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${notification.id}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice sending notification:', err);
    }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { isUnread: false });
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${notificationId}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice marking notification read:', err);
    }
  }
}

export async function markAllRealtimeNotificationsRead(notifications: NotificationItem[]) {
  try {
    for (const notif of notifications) {
      if (notif.isUnread) {
        const notifRef = doc(db, 'notifications', notif.id);
        await updateDoc(notifRef, { isUnread: false }).catch(() => {});
      }
    }
  } catch (err: any) {
    if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice marking all notifications read:', err);
    }
  }
}

// ==========================================
// REAL-TIME FOLLOW / UNFOLLOW SYSTEM (DURABLE LOCAL + FIRESTORE)
// ==========================================

const FOLLOWS_STORE_KEY = 'peaceverse_follows_store_v1';

interface LocalFollowsStore {
  followingIds: Record<string, boolean>;
  followingNames: Record<string, boolean>;
  unfollowedIds: Record<string, boolean>;
  unfollowedNames: Record<string, boolean>;
}

function normalizeFollowName(name?: string): string {
  return (name || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
}

function safeFollowDocKey(val: string): string {
  return encodeURIComponent((val || '').trim()).replace(/%/g, '_') || 'unknown';
}

function readLocalFollowsStore(): LocalFollowsStore {
  const empty: LocalFollowsStore = {
    followingIds: {},
    followingNames: {},
    unfollowedIds: {},
    unfollowedNames: {},
  };
  try {
    const raw = localStorage.getItem(FOLLOWS_STORE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return {
      followingIds: parsed?.followingIds && typeof parsed.followingIds === 'object' ? parsed.followingIds : {},
      followingNames: parsed?.followingNames && typeof parsed.followingNames === 'object' ? parsed.followingNames : {},
      unfollowedIds: parsed?.unfollowedIds && typeof parsed.unfollowedIds === 'object' ? parsed.unfollowedIds : {},
      unfollowedNames: parsed?.unfollowedNames && typeof parsed.unfollowedNames === 'object' ? parsed.unfollowedNames : {},
    };
  } catch {
    return empty;
  }
}

function writeLocalFollowsStore(store: LocalFollowsStore): void {
  try {
    localStorage.setItem(FOLLOWS_STORE_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event('peaceverse:follows-updated'));
  } catch {}
}

export function isTargetFollowedLocally(targetId?: string, targetName?: string): boolean {
  const store = readLocalFollowsStore();
  const cleanId = (targetId || '').trim();
  const normName = normalizeFollowName(targetName);
  if (cleanId && store.followingIds[cleanId]) return true;
  if (normName && store.followingNames[normName]) return true;
  return false;
}

export function isSameOwnerIdentity(
  authorId?: string,
  authorName?: string,
  currentUserId?: string,
  currentUserName?: string
): boolean {
  const norm = (s?: string) =>
    (s || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();

  const targetId = (authorId || '').trim();
  const targetName = norm(authorName);

  const ownedIds = new Set<string>();
  const ownedNames = new Set<string>();

  if (currentUserId) ownedIds.add(currentUserId.trim());
  if (currentUserName) {
    const n = norm(currentUserName);
    if (n) ownedNames.add(n);
  }
  if (auth.currentUser?.uid) ownedIds.add(auth.currentUser.uid);
  if (auth.currentUser?.displayName) {
    const n = norm(auth.currentUser.displayName);
    if (n) ownedNames.add(n);
  }

  try {
    const rawProfile =
      localStorage.getItem('qalby_user_profile') ||
      localStorage.getItem('peaceverse_user_profile');
    if (rawProfile) {
      const prof = JSON.parse(rawProfile);
      if (prof?.id) ownedIds.add(String(prof.id).trim());
      if (prof?.name) {
        const n = norm(String(prof.name));
        if (n) ownedNames.add(n);
      }
    }
  } catch {}

  try {
    const switchedRaw = localStorage.getItem('qalby_switched_page');
    if (switchedRaw) {
      const sw = JSON.parse(switchedRaw);
      if (sw?.id) ownedIds.add(String(sw.id).trim());
      if (sw?.name) {
        const n = norm(String(sw.name));
        if (n) ownedNames.add(n);
      }
    }
  } catch {}

  try {
    const pagesRaw = localStorage.getItem('qalby_fb_pages');
    if (pagesRaw) {
      const pages = JSON.parse(pagesRaw);
      if (Array.isArray(pages)) {
        pages.forEach((pg: { id?: string; name?: string; isOwner?: boolean }) => {
          if (pg?.isOwner !== false) {
            if (pg?.id) ownedIds.add(String(pg.id).trim());
            if (pg?.name) {
              const n = norm(String(pg.name));
              if (n) ownedNames.add(n);
            }
          }
        });
      }
    }
  } catch {}

  if (targetId && ownedIds.has(targetId)) return true;
  if (targetName && ownedNames.has(targetName)) return true;
  return false;
}

const FRIENDS_LIST_STORAGE_KEY = 'peace_friends_list';
const SENT_FRIEND_REQUESTS_STORAGE_KEY = 'peaceverse_sent_friend_requests_v1';
const REMOVED_SUGGESTIONS_STORAGE_KEY = 'peaceverse_removed_suggestions_v1';

const DEFAULT_FRIEND_IDENTITIES: Array<{ id: string; name: string }> = [
  { id: 'on-1', name: 'নিস্তব্ধ হৃদয়' },
  { id: 'on-2', name: 'সুনামগঞ্জ রাজনৈতিক' },
  { id: 'on-3', name: 'Sujon Ahmed' },
  { id: 'user-fatima-zahra', name: 'Fatima Zahra' },
  { id: 'user-nusrat-jahan', name: 'Nusrat Jahan' },
];

const FOLLOW_ONLY_DUMMY_IDS = new Set<string>([
  'user-sheikh-makkah',
  'user-ayesha-rahman',
  'user-bilal-ahmed',
  'user-zayd-hasan',
  'user-hafsa-noor',
  'user-yusuf-ali',
  'user-hamza-chowdhury',
  'user-maryam-siddiqua',
]);

const FOLLOW_ONLY_DUMMY_NAMES = new Set<string>([
  'sheikh tariq al-harbi',
  'ayesha rahman',
  'bilal ahmed',
  'zayd hasan',
  'hafsa noor',
  'yusuf ali',
  'hamza chowdhury',
  'maryam siddiqua',
]);

export function isTargetFriendLocally(targetId?: string, targetName?: string): boolean {
  const cleanId = (targetId || '').trim();
  const normName = normalizeFollowName(targetName);

  try {
    const saved = localStorage.getItem(FRIENDS_LIST_STORAGE_KEY);
    if (saved) {
      const list = JSON.parse(saved);
      if (Array.isArray(list)) {
        const matched = list.some((f: { id?: string; name?: string }) => {
          if (cleanId && f?.id && String(f.id).trim() === cleanId) return true;
          if (normName && f?.name && normalizeFollowName(String(f.name)) === normName) return true;
          return false;
        });
        if (matched) return true;
      }
    } else {
      const matchedDefault = DEFAULT_FRIEND_IDENTITIES.some(
        (f) =>
          (cleanId && f.id === cleanId) ||
          (normName && normalizeFollowName(f.name) === normName)
      );
      if (matchedDefault) return true;
    }
  } catch {}

  try {
    const confirmedRaw = localStorage.getItem('peace_friends_confirmed');
    if (confirmedRaw) {
      const confirmed = JSON.parse(confirmedRaw);
      if (cleanId && confirmed?.[cleanId]) return true;
    }
  } catch {}

  return false;
}

export function readLocalFriendsStore(): Array<{
  id: string;
  name: string;
  avatar: string;
  mutualCount?: number;
  isOnline?: boolean;
}> {
  try {
    const raw = localStorage.getItem(FRIENDS_LIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function syncLocalFriendsStore(
  friends: Array<{ id: string; name: string; avatar: string }>
): void {
  try {
    const normalized = friends
      .filter((f) => f && f.id && f.name)
      .map((f) => ({
        id: String(f.id),
        name: String(f.name),
        avatar: String(f.avatar || ''),
        mutualCount: 1,
        isOnline: true,
      }));
    localStorage.setItem(FRIENDS_LIST_STORAGE_KEY, JSON.stringify(normalized));
    normalized.forEach((f) => setFriendRequestSentLocally(false, f.id, f.name));
    window.dispatchEvent(new Event('peaceverse:friends-updated'));
  } catch {}
}

export function addLocalFriend(friend: { id: string; name: string; avatar: string }): void {
  try {
    const safeList = readLocalFriendsStore();
    const normNew = normalizeFollowName(friend.name);
    const exists = safeList.some(
      (f) => f.id === friend.id || (normNew && normalizeFollowName(f.name) === normNew)
    );
    if (!exists) {
      const next = [
        {
          id: friend.id,
          name: friend.name,
          avatar: friend.avatar,
          mutualCount: 1,
          isOnline: true,
        },
        ...safeList,
      ];
      localStorage.setItem(FRIENDS_LIST_STORAGE_KEY, JSON.stringify(next));
    }
    setFriendRequestSentLocally(false, friend.id, friend.name);
    window.dispatchEvent(new Event('peaceverse:friends-updated'));
  } catch {}
}

export function readSentFriendRequestsStore(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(SENT_FRIEND_REQUESTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function isFriendRequestSentLocally(targetId?: string, targetName?: string): boolean {
  const store = readSentFriendRequestsStore();
  const cleanId = (targetId || '').trim();
  const normName = normalizeFollowName(targetName);
  if (cleanId && store[cleanId]) return true;
  if (normName && store[`name:${normName}`]) return true;
  return false;
}

export function setFriendRequestSentLocally(
  sent: boolean,
  targetId?: string,
  targetName?: string
): void {
  try {
    const store = readSentFriendRequestsStore();
    const cleanId = (targetId || '').trim();
    const normName = normalizeFollowName(targetName);
    if (sent) {
      if (cleanId) store[cleanId] = true;
      if (normName) store[`name:${normName}`] = true;
    } else {
      if (cleanId) delete store[cleanId];
      if (normName) delete store[`name:${normName}`];
    }
    localStorage.setItem(SENT_FRIEND_REQUESTS_STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event('peaceverse:friend-requests-updated'));
  } catch {}
}

export async function toggleLocalFriendRequestAndSync(
  senderId: string,
  senderName: string,
  senderAvatar: string,
  target: { id: string; name: string; avatar: string }
): Promise<boolean> {
  const currentlySent = isFriendRequestSentLocally(target.id, target.name);
  const nextSent = !currentlySent;
  setFriendRequestSentLocally(nextSent, target.id, target.name);

  if (senderId && senderId !== target.id) {
    if (nextSent) {
      await sendFriendRequestToUser(senderId, senderName, senderAvatar, {
        id: target.id,
        uid: target.id,
        displayName: target.name,
        avatar: target.avatar,
      });
    } else {
      await cancelFriendRequestToUser(senderId, target.id);
    }
  }
  return nextSent;
}

export function readRemovedSuggestionsStore(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(REMOVED_SUGGESTIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function markSuggestionRemovedLocally(id: string): void {
  try {
    const store = readRemovedSuggestionsStore();
    store[id] = true;
    localStorage.setItem(REMOVED_SUGGESTIONS_STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event('peaceverse:suggestions-updated'));
  } catch {}
}

export function getAuthorRelationshipKind(
  post: PostItem,
  currentUserId?: string,
  currentUserName?: string
): 'self' | 'friend' | 'add_friend' | 'follow_only' {
  if (isSameOwnerIdentity(post.authorId, post.author.name, currentUserId, currentUserName)) {
    return 'self';
  }
  if (
    post.authorConnectionMode === 'friend' ||
    isTargetFriendLocally(post.authorId, post.author.name)
  ) {
    return 'friend';
  }
  if (
    post.authorConnectionMode === 'follow_only' ||
    Boolean(post.authorId && post.authorId.startsWith('page-'))
  ) {
    return 'follow_only';
  }
  if (post.authorConnectionMode === 'add_friend') {
    return 'add_friend';
  }
  const cleanId = (post.authorId || '').trim().toLowerCase();
  const normName = normalizeFollowName(post.author.name);
  if (FOLLOW_ONLY_DUMMY_IDS.has(cleanId) || FOLLOW_ONLY_DUMMY_NAMES.has(normName)) {
    return 'follow_only';
  }
  return 'add_friend';
}

function isTargetExplicitlyUnfollowed(targetId?: string, targetName?: string): boolean {
  const store = readLocalFollowsStore();
  const cleanId = (targetId || '').trim();
  const normName = normalizeFollowName(targetName);
  if (cleanId && store.unfollowedIds[cleanId]) return true;
  if (normName && store.unfollowedNames[normName]) return true;
  return false;
}

export function setTargetFollowedLocally(
  following: boolean,
  targetId?: string,
  targetName?: string
): void {
  const store = readLocalFollowsStore();
  const cleanId = (targetId || '').trim();
  const normName = normalizeFollowName(targetName);

  if (following) {
    if (cleanId) {
      store.followingIds[cleanId] = true;
      delete store.unfollowedIds[cleanId];
    }
    if (normName) {
      store.followingNames[normName] = true;
      delete store.unfollowedNames[normName];
    }
  } else {
    if (cleanId) {
      delete store.followingIds[cleanId];
      store.unfollowedIds[cleanId] = true;
    }
    if (normName) {
      delete store.followingNames[normName];
      store.unfollowedNames[normName] = true;
    }
  }

  writeLocalFollowsStore(store);
}

export async function toggleFollowUser(
  followerId: string,
  followerName: string,
  followerAvatar: string,
  targetId: string,
  targetName: string,
  targetAvatar: string
): Promise<boolean> {
  const effectiveFollowerId = auth.currentUser?.uid || followerId || 'user-me';
  const safeDocId = `${safeFollowDocKey(effectiveFollowerId)}_${safeFollowDocKey(targetId)}`;
  const legacyDocId = `${followerId}_${targetId}`;
  const followRef = doc(db, 'follows', safeDocId);
  const legacyRef = legacyDocId !== safeDocId ? doc(db, 'follows', legacyDocId) : null;

  const wasFollowedLocally = isTargetFollowedLocally(targetId, targetName);
  const nextFollowing = !wasFollowedLocally;

  // Persist immediately in localStorage so state never disappears on app close/reload
  setTargetFollowedLocally(nextFollowing, targetId, targetName);

  try {
    if (!nextFollowing) {
      await deleteDoc(followRef).catch(() => {});
      if (legacyRef) {
        await deleteDoc(legacyRef).catch(() => {});
      }
      return false;
    } else {
      await setDoc(followRef, {
        id: safeDocId,
        followerId: effectiveFollowerId,
        followerName,
        followerAvatar,
        targetId,
        targetName,
        targetAvatar,
        createdAt: new Date().toISOString(),
        createdAtMillis: Date.now(),
      });

      // Send live notification to target
      sendRealtimeNotification({
        id: `notif-follow-${Date.now()}`,
        type: 'follow',
        avatar: followerAvatar,
        title: `${followerName} started following you`,
        subtitle: 'View profile in Peaceverse',
        timeAgo: 'Just now',
        isUnread: true,
        badgeType: 'heart',
      });

      return true;
    }
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, `follows/${safeDocId}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice toggling follow:', err);
    }
    // Keep local persistent follow state intact even if offline
    return nextFollowing;
  }
}

export function subscribeToFollowStatus(
  followerId: string,
  targetId: string,
  onUpdate: (isFollowing: boolean) => void,
  targetName?: string
) {
  const syncFromLocal = () => {
    onUpdate(isTargetFollowedLocally(targetId, targetName));
  };

  syncFromLocal();

  window.addEventListener('peaceverse:follows-updated', syncFromLocal);
  window.addEventListener('storage', syncFromLocal);

  let unsubFirestore = () => {};
  let unsubLegacy = () => {};
  try {
    const effectiveFollowerId = auth.currentUser?.uid || followerId || 'user-me';
    const safeDocId = `${safeFollowDocKey(effectiveFollowerId)}_${safeFollowDocKey(targetId)}`;
    const legacyDocId = `${followerId}_${targetId}`;

    const handleSnap = (snap: any) => {
      if (snap.exists() && !isTargetExplicitlyUnfollowed(targetId, targetName)) {
        if (!isTargetFollowedLocally(targetId, targetName)) {
          setTargetFollowedLocally(true, targetId, targetName);
        }
        onUpdate(true);
      } else {
        onUpdate(isTargetFollowedLocally(targetId, targetName));
      }
    };

    unsubFirestore = onSnapshot(
      doc(db, 'follows', safeDocId),
      handleSnap,
      () => syncFromLocal()
    );

    if (legacyDocId !== safeDocId && !/[\/\s]/.test(legacyDocId)) {
      unsubLegacy = onSnapshot(
        doc(db, 'follows', legacyDocId),
        handleSnap,
        () => {}
      );
    }
  } catch {
    syncFromLocal();
  }

  return () => {
    window.removeEventListener('peaceverse:follows-updated', syncFromLocal);
    window.removeEventListener('storage', syncFromLocal);
    unsubFirestore();
    unsubLegacy();
  };
}

export function subscribeToUserFollowsList(
  followerId: string,
  onUpdate: (followingIds: string[]) => void
) {
  try {
    const q = query(collection(db, 'follows'), where('followerId', '==', followerId));
    return onSnapshot(
      q,
      (snap) => {
        const ids: string[] = [];
        const store = readLocalFollowsStore();
        let mutated = false;
        snap.docs.forEach((d) => {
          const data = d.data();
          const tId = String(data.targetId || '').trim();
          const tName = String(data.targetName || '').trim();
          if (tId) ids.push(tId);
          if (!isTargetExplicitlyUnfollowed(tId, tName)) {
            if (tId && !store.followingIds[tId]) {
              store.followingIds[tId] = true;
              mutated = true;
            }
            const normName = normalizeFollowName(tName);
            if (normName && !store.followingNames[normName]) {
              store.followingNames[normName] = true;
              mutated = true;
            }
          }
        });
        if (mutated) {
          writeLocalFollowsStore(store);
        }
        onUpdate(Array.from(new Set([...ids, ...Object.keys(store.followingIds)])));
      },
      () => {
        const store = readLocalFollowsStore();
        onUpdate(Object.keys(store.followingIds));
      }
    );
  } catch {
    const store = readLocalFollowsStore();
    onUpdate(Object.keys(store.followingIds));
    return () => {};
  }
}

export function subscribeToFollowersCount(
  targetId: string,
  onUpdate: (count: number) => void
) {
  try {
    const q = query(collection(db, 'follows'), where('targetId', '==', targetId));
    return onSnapshot(
      q,
      (snap) => {
        onUpdate(snap.size);
      },
      () => onUpdate(0)
    );
  } catch {
    onUpdate(0);
    return () => {};
  }
}

// ==========================================
// FIREBASE AUTHENTICATION HELPERS
// ==========================================

export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  if (!resolvedFirebaseConfig.apiKey) {
    emitApiKeyEnvWarning();
    throw new Error('Firebase API key missing. Set API keys in Vercel Environment Variables, not in code.');
  }
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      resetSessionStart();
      cachedDirectoryUsers = null;
      const gName =
        result.user.displayName?.trim() ||
        (result.user.email ? result.user.email.split('@')[0] : 'Member');
      const gAvatar =
        result.user.photoURL ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(gName)}&backgroundColor=1877f2,0ea5e9,3b82f6`;
      void syncUserDirectoryProfile(result.user.uid, gName, result.user.email || '', gAvatar);
    }
    return result.user;
  } catch (err) {
    console.error('Google Sign-In Error:', err);
    throw err;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser | null> {
  if (!resolvedFirebaseConfig.apiKey) {
    emitApiKeyEnvWarning();
    throw new Error('Firebase API key missing. Set API keys in Vercel Environment Variables, not in code.');
  }
  const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
  if (res.user) {
    resetSessionStart();
    cachedDirectoryUsers = null;
    try {
      if (res.user.email) {
        localStorage.setItem(
          `peaceverse_otp_verified_${res.user.uid}`,
          res.user.email.trim().toLowerCase()
        );
      }
    } catch {}
    const eName =
      res.user.displayName?.trim() ||
      (res.user.email ? res.user.email.split('@')[0] : 'Member');
    const eAvatar =
      res.user.photoURL ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(eName)}&backgroundColor=1877f2,0ea5e9,3b82f6`;
    void syncUserDirectoryProfile(res.user.uid, eName, res.user.email || '', eAvatar);
    void markCurrentUserEmailOtpVerified();
  }
  return res.user;
}

export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string,
  otpVerificationToken?: string
): Promise<FirebaseUser | null> {
  if (!resolvedFirebaseConfig.apiKey) {
    emitApiKeyEnvWarning();
    throw new Error('Firebase API key missing. Set API keys in Vercel Environment Variables, not in code.');
  }
  if (!otpVerificationToken || !otpVerificationToken.trim()) {
    throw new Error('Email OTP verification is required before creating an account.');
  }
  const cleanDisplayName = sanitizeInput(displayName.trim()) || email.split('@')[0];
  const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (res.user) {
    resetSessionStart();
    const cleanName = cleanDisplayName;
    try {
      await updateProfile(res.user, {
        displayName: cleanName,
      });
    } catch (e) {
      console.warn('updateProfile notice:', e);
    }

    try {
      localStorage.setItem('peaceverse_registered_name', cleanName);
      localStorage.setItem(
        `peaceverse_otp_verified_${res.user.uid}`,
        email.trim().toLowerCase()
      );
    } catch {}

    const latinFromName = transliterateBnToEn(cleanName).replace(/[^a-z0-9]+/g, '');
    const generatedUsername =
      latinFromName ||
      (res.user.email ? res.user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : `user${res.user.uid.slice(0, 6)}`);
    const resolvedAvatar =
      res.user.photoURL ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=1877f2,0ea5e9,3b82f6`;

    const normalizedEmail = (res.user.email || email).trim().toLowerCase();
    const emailHash = await sha256Hex(normalizedEmail);
    const nowMs = Date.now();

    try {
      const userRef = doc(db, 'users', res.user.uid);
      await setDoc(
        userRef,
        {
          uid: res.user.uid,
          id: res.user.uid,
          name: cleanName,
          displayName: cleanName,
          username: generatedUsername,
          transliteratedName: transliterateBnToEn(cleanName),
          email: res.user.email,
          ...(emailHash ? { emailHash } : {}),
          emailOtpVerified: true,
          friendsCount: 0,
          avatar: trimOversizedImageForFirestore(resolvedAvatar),
          createdAt: new Date(nowMs).toISOString(),
          createdAtMillis: nowMs,
          updatedAt: new Date(nowMs).toISOString(),
          updatedAtMillis: nowMs,
        },
        { merge: true }
      );
      cachedDirectoryUsers = null;
    } catch (err) {
      console.warn('Saving user doc notice:', err);
    }

    await Promise.allSettled([
      setDoc(
        doc(db, 'public_profiles', res.user.uid),
        {
          id: res.user.uid,
          uid: res.user.uid,
          name: cleanName,
          displayName: cleanName,
          username: generatedUsername,
          transliteratedName: transliterateBnToEn(cleanName),
          ...(emailHash ? { emailHash } : {}),
          avatar: trimOversizedImageForFirestore(resolvedAvatar),
          allowFriendRequests: true,
          updatedAt: new Date(nowMs).toISOString(),
          updatedAtMillis: nowMs,
        },
        { merge: true }
      ),
      syncUserToServerDirectory({
        uid: res.user.uid,
        displayName: cleanName,
        username: generatedUsername,
        avatar: trimOversizedImageForFirestore(resolvedAvatar),
        email: res.user.email || '',
      }),
      syncSupabaseProfile({
        id: res.user.uid,
        displayName: cleanName,
        username: generatedUsername,
        avatar: trimOversizedImageForFirestore(resolvedAvatar),
      }),
    ]);

    await sendEmailVerification(res.user).catch(() => {});
  }
  return res.user;
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function logoutUser(): Promise<void> {
  clearSessionStart();
  await signOut(auth);
}

export async function markCurrentUserEmailOtpVerified(): Promise<void> {
  const u = auth.currentUser;
  if (!u || !u.email) return;
  try {
    localStorage.setItem(
      `peaceverse_otp_verified_${u.uid}`,
      u.email.trim().toLowerCase()
    );
  } catch {}
  try {
    await setDoc(
      doc(db, 'users', u.uid),
      {
        uid: u.uid,
        id: u.uid,
        email: u.email,
        emailOtpVerified: true,
        updatedAt: new Date().toISOString(),
        updatedAtMillis: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Saving emailOtpVerified notice:', err);
  }
}

// ==========================================
// USER PROFILE & SOCIAL CONTACT PERSISTENCE
// ==========================================

export function isDefaultGeneratedAvatar(url?: string): boolean {
  const clean = (url || '').trim();
  if (!clean) return true;
  return clean.includes('api.dicebear.com/');
}

async function preparePersistableImageForFirestore(
  url?: string,
  maxDim = 960
): Promise<string> {
  const clean = (url || '').trim();
  if (!clean || clean.startsWith('blob:')) return '';
  if (!clean.startsWith('data:')) {
    return clean;
  }
  const targetMaxChars = maxDim <= 600 ? 200_000 : 280_000;
  if (clean.length <= targetMaxChars) {
    return clean;
  }
  try {
    const { uploadDataUrlIfOversized } = await import('./mediaStorage');
    const uploaded = await uploadDataUrlIfOversized(clean, 'image', true);
    if (uploaded && (!uploaded.startsWith('data:') || uploaded.length <= targetMaxChars)) {
      return uploaded;
    }
  } catch {}
  try {
    const { compressDataUrlUnderLimit } = await import('../utils/imageCompress');
    const compressed = await compressDataUrlUnderLimit(clean, targetMaxChars, maxDim);
    if (compressed && compressed.length <= 420_000) {
      return compressed;
    }
  } catch {}
  return clean.length <= 420_000 ? clean : '';
}

export async function saveUserProfileToFirestore(profile: UserProfile): Promise<boolean> {
  const targetId = auth.currentUser?.uid;
  if (!targetId) return false;
  const rate = checkRateLimit(targetId);
  if (!rate.allowed) return false;

  try {
    const userRef = doc(db, 'users', targetId);
    const cleanName = sanitizeInput(profile.name || '');
    const latinFromName = cleanName ? transliterateBnToEn(cleanName).replace(/[^a-z0-9]+/g, '') : '';
    const resolvedUsername =
      (profile.username && sanitizeInput(profile.username.trim())) ||
      latinFromName;
    if (cleanName && auth.currentUser && auth.currentUser.displayName !== cleanName) {
      updateProfile(auth.currentUser, { displayName: cleanName }).catch(() => {});
    }
    const resolvedEmail = (profile.email || auth.currentUser?.email || '').trim();
    const emailHash = resolvedEmail ? await sha256Hex(resolvedEmail.toLowerCase()) : '';
    const [rawSafeAvatar, safeCoverForDoc] = await Promise.all([
      preparePersistableImageForFirestore(profile.avatar, 512),
      preparePersistableImageForFirestore(profile.coverPhoto, 1080),
    ]);
    const safeAvatarForDoc =
      rawSafeAvatar && !isDefaultGeneratedAvatar(rawSafeAvatar) ? rawSafeAvatar : '';
    await setDoc(
      userRef,
      {
        id: targetId,
        uid: targetId,
        name: cleanName,
        displayName: cleanName,
        transliteratedName: cleanName ? transliterateBnToEn(cleanName) : '',
        ...(resolvedUsername ? { username: resolvedUsername } : {}),
        email: resolvedEmail,
        ...(emailHash ? { emailHash } : {}),
        ...(safeAvatarForDoc ? { avatar: safeAvatarForDoc } : {}),
        ...(safeCoverForDoc ? { coverPhoto: safeCoverForDoc } : {}),
        bio: sanitizeInput(profile.bio || ''),
        profileCategory: sanitizeInput(profile.profileCategory || ''),
        location: sanitizeInput(profile.location || ''),
        hometown: sanitizeInput(profile.hometown || ''),
        work: sanitizeInput(profile.work || ''),
        education: sanitizeInput(profile.education || ''),
        relationship: sanitizeInput(profile.relationship || ''),
        website: sanitizeInput(profile.website || ''),
        thoughtBubble: sanitizeInput(profile.thoughtBubble || ''),
        whatsapp: sanitizeInput(profile.whatsapp || ''),
        imo: sanitizeInput(profile.imo || ''),
        viber: sanitizeInput(profile.viber || ''),
        messengerLink: sanitizeInput(profile.messengerLink || ''),
        contactPrivacy: profile.contactPrivacy || 'public',
        hobbies: Array.isArray(profile.hobbies) ? profile.hobbies.map((h) => sanitizeInput(String(h))) : [],
        updatedAt: new Date().toISOString(),
        updatedAtMillis: Date.now(),
      },
      { merge: true }
    );
    cachedDirectoryUsers = null;
    if (cleanName) {
      void Promise.allSettled([
        setDoc(
          doc(db, 'public_profiles', targetId),
          {
            id: targetId,
            uid: targetId,
            name: cleanName,
            displayName: cleanName,
            transliteratedName: transliterateBnToEn(cleanName),
            ...(resolvedUsername ? { username: resolvedUsername } : {}),
            ...(emailHash ? { emailHash } : {}),
            ...(safeAvatarForDoc ? { avatar: safeAvatarForDoc } : {}),
            bio: sanitizeInput(profile.bio || '', 300),
            location: sanitizeInput(profile.location || '', 120),
            allowFriendRequests: profile.isCreator !== true,
            updatedAt: new Date().toISOString(),
            updatedAtMillis: Date.now(),
          },
          { merge: true }
        ),
        syncUserToServerDirectory({
          uid: targetId,
          displayName: cleanName,
          username: resolvedUsername,
          avatar: safeAvatarForDoc || undefined,
          bio: sanitizeInput(profile.bio || '', 300),
          location: sanitizeInput(profile.location || '', 120),
          email: resolvedEmail,
          allowFriendRequests: profile.isCreator !== true,
        }),
        syncSupabaseProfile({
          id: targetId,
          displayName: cleanName,
          username: resolvedUsername,
          avatar: safeAvatarForDoc || undefined,
          bio: sanitizeInput(profile.bio || '', 300),
          location: sanitizeInput(profile.location || '', 120),
        }),
      ]);
    }
    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, `users/${targetId}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice saving user profile:', err);
    }
    return false;
  }
}

export async function fetchUserProfileFromFirestore(
  uid: string
): Promise<(Partial<UserProfile> & { emailOtpVerified?: boolean; updatedAtMillis?: number }) | null> {
  if (!uid) return null;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDocSafe(userRef);
    if (!snap || !snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      name: data.name || data.displayName,
      username: data.username,
      email: data.email,
      avatar: data.avatar,
      coverPhoto: data.coverPhoto,
      bio: data.bio,
      profileCategory: data.profileCategory,
      location: data.location,
      hometown: data.hometown,
      work: data.work,
      education: data.education,
      relationship: data.relationship,
      website: data.website,
      thoughtBubble: data.thoughtBubble,
      whatsapp: data.whatsapp,
      imo: data.imo,
      viber: data.viber,
      messengerLink: data.messengerLink,
      contactPrivacy: data.contactPrivacy || 'public',
      friendsCount: typeof data.friendsCount === 'number' ? data.friendsCount : 0,
      hobbies: Array.isArray(data.hobbies) ? data.hobbies : undefined,
      isCreator: data.isCreator === true,
      emailOtpVerified: data.emailOtpVerified === true,
      updatedAtMillis: typeof data.updatedAtMillis === 'number' ? data.updatedAtMillis : undefined,
    };
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice fetching user profile:', err);
    }
    return null;
  }
}

export async function fetchUserProfileByNameFromFirestore(name: string): Promise<Partial<UserProfile> | null> {
  const cleanName = name.trim();
  if (!cleanName) return null;
  try {
    const q = query(collection(db, 'users'), where('name', '==', cleanName), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name || data.displayName || cleanName,
      avatar: data.avatar,
      coverPhoto: data.coverPhoto,
      bio: data.bio,
      profileCategory: data.profileCategory,
      location: data.location,
      hometown: data.hometown,
      relationship: data.relationship,
      website: data.website,
      whatsapp: data.whatsapp,
      imo: data.imo,
      viber: data.viber,
      messengerLink: data.messengerLink,
      contactPrivacy: data.contactPrivacy || 'public',
    };
  } catch (err: any) {
    if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice fetching user profile by name:', err);
    }
    return null;
  }
}

// ==========================================
// REAL USER SUBCOLLECTIONS (NO MOCK DATA)
// ==========================================

export interface UserLinkHistoryItem {
  id: string;
  title: string;
  url: string;
  time: string;
  createdAtMillis?: number;
}

export interface UserActivityLogItem {
  id: string;
  category: string;
  text: string;
  time: string;
  createdAtMillis?: number;
}

export interface UserOrderRecord {
  id: string;
  shopName: string;
  itemsSummary: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface UserDeviceSession {
  id: string;
  device: string;
  location: string;
  isCurrent: boolean;
  time: string;
}

function resolveActiveUserId(uid?: string): string | null {
  const authUid = auth.currentUser?.uid;
  if (!authUid) return null;
  if (uid && uid !== authUid) return authUid;
  return authUid;
}

export async function fetchUserLinkHistory(uid?: string): Promise<UserLinkHistoryItem[]> {
  const targetId = resolveActiveUserId(uid);
  if (!targetId) return [];
  const path = `users/${targetId}/link_history`;
  try {
    const q = query(collection(db, path), orderBy('createdAtMillis', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: String(data.title || data.url || ''),
        url: String(data.url || ''),
        time: String(data.visitedAt || data.time || ''),
        createdAtMillis: Number(data.createdAtMillis || 0),
      };
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.LIST, path);
    }
    return [];
  }
}

export async function recordUserLinkVisit(uid: string | undefined, title: string, url: string): Promise<void> {
  const targetId = resolveActiveUserId(uid);
  if (!targetId || !url) return;
  const linkId = `link-${Date.now()}`;
  const path = `users/${targetId}/link_history/${linkId}`;
  try {
    await setDoc(doc(db, path), {
      id: linkId,
      userId: targetId,
      title: title || url,
      url,
      visitedAt: new Date().toLocaleDateString('bn-BD'),
      createdAtMillis: Date.now(),
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }
}

export async function clearUserLinkHistory(uid?: string): Promise<void> {
  const targetId = resolveActiveUserId(uid);
  if (!targetId) return;
  const path = `users/${targetId}/link_history`;
  try {
    const snap = await getDocs(collection(db, path));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }
}

export async function fetchUserActivityLog(uid?: string): Promise<UserActivityLogItem[]> {
  const targetId = resolveActiveUserId(uid);
  if (!targetId) return [];
  const path = `users/${targetId}/activity_log`;
  try {
    const q = query(collection(db, path), orderBy('createdAtMillis', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        category: String(data.category || 'Activity'),
        text: String(data.text || ''),
        time: String(data.time || data.createdAt || ''),
        createdAtMillis: Number(data.createdAtMillis || 0),
      };
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.LIST, path);
    }
    return [];
  }
}

export async function logUserActivity(
  uid: string | undefined,
  category: string,
  text: string
): Promise<void> {
  const targetId = resolveActiveUserId(uid);
  if (!targetId || !text.trim()) return;
  const actId = `act-${Date.now()}`;
  const path = `users/${targetId}/activity_log/${actId}`;
  try {
    await setDoc(doc(db, path), {
      id: actId,
      userId: targetId,
      category,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      createdAtMillis: Date.now(),
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }
}

export async function clearUserActivityLog(uid?: string): Promise<void> {
  const targetId = resolveActiveUserId(uid);
  if (!targetId) return;
  const path = `users/${targetId}/activity_log`;
  try {
    const snap = await getDocs(collection(db, path));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }
}

export async function fetchUserOrders(uid?: string): Promise<UserOrderRecord[]> {
  const targetId = resolveActiveUserId(uid);
  if (!targetId) return [];
  const path = `users/${targetId}/orders`;
  try {
    const q = query(collection(db, path), orderBy('createdAtMillis', 'desc'), limit(25));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        shopName: String(data.shopName || ''),
        itemsSummary: String(data.itemsSummary || ''),
        amount: Number(data.amount || 0),
        paymentMethod: String(data.paymentMethod || ''),
        status: String(data.status || 'Pending'),
        createdAt: String(data.createdAt || ''),
      };
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.LIST, path);
    }
    return [];
  }
}

export async function fetchUserDeviceSessions(uid?: string): Promise<UserDeviceSession[]> {
  const targetId = resolveActiveUserId(uid);
  if (!targetId) return [];
  const path = `users/${targetId}/sessions`;
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        device: String(data.device || ''),
        location: String(data.location || ''),
        isCurrent: Boolean(data.isCurrent),
        time: String(data.time || ''),
      };
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.LIST, path);
    }
    return [];
  }
}

export async function clearOtherUserDeviceSessions(uid?: string): Promise<void> {
  const targetId = resolveActiveUserId(uid);
  if (!targetId) return;
  const path = `users/${targetId}/sessions`;
  try {
    const snap = await getDocs(collection(db, path));
    await Promise.all(
      snap.docs
        .filter((d) => !d.data().isCurrent)
        .map((d) => deleteDoc(d.ref))
    );
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }
}

export async function saveUserSettingsToFirestore(
  uid: string | undefined,
  patch: Record<string, unknown>
): Promise<void> {
  const targetId = resolveActiveUserId(uid);
  if (!targetId) return;
  const path = `users/${targetId}/settings/preferences`;
  try {
    await setDoc(
      doc(db, path),
      {
        ...patch,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
}

export async function fetchUserSettingsFromFirestore(
  uid?: string
): Promise<Record<string, any> | null> {
  const targetId = resolveActiveUserId(uid);
  if (!targetId) return null;
  const path = `users/${targetId}/settings/preferences`;
  try {
    const snap = await getDocSafe(doc(db, path));
    if (!snap || !snap.exists()) return null;
    return snap.data();
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.GET, path);
    }
    return null;
  }
}

export async function fetchUserPublicPresenceStats(
  uid?: string
): Promise<{ followersCount: number; postsCount: number }> {
  const targetId = resolveActiveUserId(uid);
  if (!targetId) return { followersCount: 0, postsCount: 0 };
  try {
    const [followersSnap, postsSnap] = await Promise.all([
      getDocs(query(collection(db, 'follows'), where('targetId', '==', targetId))),
      getDocs(query(collection(db, 'posts'), where('authorId', '==', targetId))),
    ]);
    return {
      followersCount: followersSnap.size,
      postsCount: postsSnap.size,
    };
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.LIST, 'follows');
    }
    return { followersCount: 0, postsCount: 0 };
  }
}

// ==========================================
// BENGALI <-> ENGLISH TRANSLITERATION & SEARCH MATCHING
// ==========================================

const BN_CONSONANTS: Record<string, string> = {
  ক: 'k', খ: 'kh', গ: 'g', ঘ: 'gh', ঙ: 'ng',
  চ: 'ch', ছ: 'chh', জ: 'j', ঝ: 'jh', ঞ: 'n',
  ট: 't', ঠ: 'th', ড: 'd', ঢ: 'dh', ণ: 'n',
  ত: 't', থ: 'th', দ: 'd', ধ: 'dh', ন: 'n',
  প: 'p', ফ: 'f', ব: 'b', ভ: 'bh', ম: 'm',
  য: 'j', র: 'r', ল: 'l', শ: 'sh', ষ: 'sh',
  স: 's', হ: 'h', ড়: 'r', ঢ়: 'rh', য়: 'y',
  ৎ: 't',
};

const BN_INDEP_VOWELS: Record<string, string> = {
  অ: 'o', আ: 'a', ই: 'i', ঈ: 'i', উ: 'u', ঊ: 'u',
  ঋ: 'ri', এ: 'e', ঐ: 'oi', ও: 'o', ঔ: 'ou',
};

const BN_VOWEL_SIGNS: Record<string, string> = {
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u',
  'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou',
};

export function transliterateBnToEn(input: string): string {
  const s = (input || '').normalize('NFC').trim();
  if (!s) return '';
  let out = '';
  const chars = Array.from(s);
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (BN_INDEP_VOWELS[ch]) {
      out += BN_INDEP_VOWELS[ch];
      continue;
    }
    if (BN_CONSONANTS[ch]) {
      const next = chars[i + 1];
      const next2 = chars[i + 2];
      if (next === '্') {
        if (next2 === 'য') {
          out += BN_CONSONANTS[ch] + 'y';
          i += 2;
        } else if (next2 === 'ব') {
          out += BN_CONSONANTS[ch] + 'w';
          i += 2;
        } else {
          out += BN_CONSONANTS[ch];
          i += 1;
        }
        continue;
      }
      if (next && BN_VOWEL_SIGNS[next]) {
        out += BN_CONSONANTS[ch] + BN_VOWEL_SIGNS[next];
        i += 1;
        continue;
      }
      // Inherent vowel at word start/middle vs word end
      const isWordEnd = !next || /\s/.test(next) || !/[\u0980-\u09FF]/.test(next);
      out += BN_CONSONANTS[ch] + (isWordEnd ? '' : 'a');
      continue;
    }
    if (BN_VOWEL_SIGNS[ch]) {
      out += BN_VOWEL_SIGNS[ch];
      continue;
    }
    if (ch === 'ং') {
      out += 'ng';
      continue;
    }
    if (ch === 'ঃ') {
      out += 'h';
      continue;
    }
    if (ch === 'ঁ' || ch === '্') {
      continue;
    }
    out += ch;
  }
  return out.toLowerCase().replace(/\s+/g, ' ').trim();
}

function phoneticNormalize(text: string): string {
  const latin = transliterateBnToEn(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!latin) return '';
  return latin
    .replace(/ph/g, 'f')
    .replace(/bh/g, 'v')
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/chh/g, 'c')
    .replace(/ch/g, 'c')
    .replace(/sh/g, 's')
    .replace(/th/g, 't')
    .replace(/dh/g, 'd')
    .replace(/z/g, 'j')
    .replace(/q/g, 'k')
    .replace(/w/g, 'v')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/ou/g, 'o')
    .replace(/([a-z])\1+/g, '$1')
    .replace(/[aeiou]+/g, (m, offset) => (offset === 0 ? m[0] : 'a'))
    .trim();
}

function consonantSkeleton(text: string): string {
  const normalized = phoneticNormalize(text).replace(/\s+/g, '');
  if (!normalized) return '';
  return normalized[0] + normalized.slice(1).replace(/[aeiou]/g, '');
}

async function sha256Hex(value: string): Promise<string> {
  const clean = value.trim().toLowerCase();
  if (!clean || typeof window === 'undefined' || !window.crypto?.subtle) return '';
  try {
    const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(clean));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return '';
  }
}

function isPlaceholderDisplayName(name?: string, email?: string): boolean {
  const clean = (name || '').trim().toLowerCase();
  if (!clean) return true;
  if (['member', 'user', 'peaceverse user', 'peaceverse creator'].includes(clean)) return true;
  if (email) {
    const localPart = email.split('@')[0].trim().toLowerCase();
    if (localPart && clean === localPart) return true;
  }
  return false;
}

// ==========================================
// FACEBOOK-STYLE USER SEARCH & FRIEND REQUESTS
// ==========================================

type DirectoryUserRecord = SearchedUserProfile & {
  emailHash?: string;
  phoneDigits?: string;
};

let cachedDirectoryUsers: { users: DirectoryUserRecord[]; fetchedAt: number } | null = null;
const USER_DIRECTORY_CACHE_TTL_MS = 15 * 1000;

export function invalidateUserDirectoryCache(): void {
  cachedDirectoryUsers = null;
}

async function getCurrentAuthHeaders(): Promise<Record<string, string>> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return {};
    const idToken = await currentUser.getIdToken();
    if (!idToken) return {};
    return { Authorization: `Bearer ${idToken}` };
  } catch {
    return {};
  }
}

async function syncUserToServerDirectory(payload: {
  uid: string;
  displayName: string;
  username?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  email?: string;
  verified?: boolean;
  allowFriendRequests?: boolean;
}): Promise<void> {
  if (typeof window === 'undefined' || !payload.uid || !payload.displayName.trim()) return;
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== payload.uid) return;
    const idToken = await currentUser.getIdToken();
    if (!idToken) return;
    await fetch('/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Non-fatal fallback if offline or serverless edge doesn't expose /api/users/sync
  }
}

export async function syncUserDirectoryProfile(
  uid: string,
  displayName: string,
  email: string,
  avatar: string,
  extra?: { bio?: string; location?: string; username?: string; allowFriendRequests?: boolean }
): Promise<void> {
  if (!uid || !displayName.trim()) return;
  const userRef = doc(db, 'users', uid);

  let existingData: Record<string, any> | null = null;
  try {
    const existingSnap = await getDocSafe(userRef);
    existingData = existingSnap && existingSnap.exists() ? existingSnap.data() : null;
  } catch {
    existingData = null;
  }

  const incomingName = displayName.trim();
  const existingName = String(existingData?.displayName || existingData?.name || '').trim();
  const finalName =
    existingName &&
    (!isPlaceholderDisplayName(existingName, email) || isPlaceholderDisplayName(incomingName, email))
      ? existingName
      : incomingName;

  const existingUsername = existingData?.username ? String(existingData.username).trim() : '';
  const transliterated = transliterateBnToEn(finalName);
  const derivedUsername =
    extra?.username?.trim() ||
    existingUsername ||
    transliterated.replace(/[^a-z0-9]+/g, '') ||
    (email ? email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '') : '');
  const existingRawAvatar = !isDefaultGeneratedAvatar(existingData?.avatar)
    ? String(existingData?.avatar || '')
    : !isDefaultGeneratedAvatar(existingData?.photoURL)
    ? String(existingData?.photoURL || '')
    : '';
  const resolvedAvatar = existingRawAvatar || (!isDefaultGeneratedAvatar(avatar) ? avatar : '');
  const safeAvatar = resolvedAvatar
    ? await preparePersistableImageForFirestore(resolvedAvatar, 512)
    : '';
  const resolvedBio = extra?.bio !== undefined ? extra.bio : String(existingData?.bio || '');
  const resolvedLocation =
    extra?.location !== undefined ? extra.location : String(existingData?.location || '');
  const resolvedEmail = (email || String(existingData?.email || '')).trim();
  const emailHash = resolvedEmail ? await sha256Hex(resolvedEmail.toLowerCase()) : '';

  try {
    await setDoc(
      userRef,
      {
        id: uid,
        uid,
        displayName: finalName,
        name: finalName,
        transliteratedName: transliterated,
        username: derivedUsername,
        ...(safeAvatar ? { avatar: safeAvatar } : {}),
        ...(existingData?.profileCategory ? { profileCategory: existingData.profileCategory } : {}),
        ...(existingData?.friendsCount === undefined ? { friendsCount: 0 } : {}),
        ...(resolvedEmail && !existingData?.email ? { email: resolvedEmail } : {}),
        ...(emailHash ? { emailHash } : {}),
        ...(resolvedBio ? { bio: resolvedBio } : {}),
        ...(resolvedLocation ? { location: resolvedLocation } : {}),
        updatedAt: new Date().toISOString(),
        updatedAtMillis: Date.now(),
      },
      { merge: true }
    );
    cachedDirectoryUsers = null;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice syncing user directory profile:', err);
    }
  }

  await Promise.allSettled([
    setDoc(
      doc(db, 'public_profiles', uid),
      {
        id: uid,
        uid,
        displayName: finalName,
        name: finalName,
        transliteratedName: transliterated,
        username: derivedUsername,
        ...(safeAvatar ? { avatar: safeAvatar } : {}),
        ...(emailHash ? { emailHash } : {}),
        bio: resolvedBio,
        location: resolvedLocation,
        allowFriendRequests: extra?.allowFriendRequests ?? true,
        updatedAt: new Date().toISOString(),
        updatedAtMillis: Date.now(),
      },
      { merge: true }
    ),
    syncUserToServerDirectory({
      uid,
      displayName: finalName,
      username: derivedUsername,
      avatar: safeAvatar,
      bio: resolvedBio,
      location: resolvedLocation,
      email: resolvedEmail,
      allowFriendRequests: extra?.allowFriendRequests ?? true,
    }),
    syncSupabaseProfile({
      id: uid,
      displayName: finalName,
      username: derivedUsername,
      avatar: safeAvatar,
      bio: resolvedBio,
      location: resolvedLocation,
    }),
  ]);
}

async function fetchDirectoryUsersFromServer(): Promise<DirectoryUserRecord[]> {
  const byId = new Map<string, DirectoryUserRecord>();

  const upsertCandidate = (candidate: DirectoryUserRecord, preferOverride = false) => {
    if (!candidate.id || !candidate.displayName?.trim()) return;
    const existing = byId.get(candidate.id);
    if (!existing) {
      byId.set(candidate.id, candidate);
      return;
    }
    const existingPlaceholder = isPlaceholderDisplayName(existing.displayName);
    const incomingPlaceholder = isPlaceholderDisplayName(candidate.displayName);
    if (preferOverride || (existingPlaceholder && !incomingPlaceholder)) {
      byId.set(candidate.id, {
        ...existing,
        ...candidate,
        displayName: incomingPlaceholder && !existingPlaceholder ? existing.displayName : candidate.displayName,
        username: candidate.username || existing.username,
        avatar: candidate.avatar || existing.avatar,
        bio: candidate.bio || existing.bio,
        location: candidate.location || existing.location,
        coverPhoto: candidate.coverPhoto || existing.coverPhoto,
        emailHash: candidate.emailHash || existing.emailHash,
        phoneDigits: candidate.phoneDigits || existing.phoneDigits,
      });
    } else if (!existing.emailHash && candidate.emailHash) {
      byId.set(candidate.id, {
        ...existing,
        emailHash: candidate.emailHash,
        phoneDigits: existing.phoneDigits || candidate.phoneDigits,
      });
    }
  };

  const authHeaders = await getCurrentAuthHeaders();

  // Query all cross-device shared directories in parallel (newest updated first with fallback)
  const [serverRes, usersSnap, publicProfilesSnap, supabaseProfiles, postsSnap] = await Promise.all([
    fetch('/api/users/directory', { headers: authHeaders })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
    getDocs(query(collection(db, 'users'), orderBy('updatedAtMillis', 'desc'), limit(1000))).catch(() =>
      getDocs(query(collection(db, 'users'), limit(1000))).catch((err) => {
        if (err?.code === 'permission-denied') {
          handleFirestoreError(err, OperationType.LIST, 'users');
        }
        return null;
      })
    ),
    getDocs(query(collection(db, 'public_profiles'), orderBy('updatedAtMillis', 'desc'), limit(1000))).catch(() =>
      getDocs(query(collection(db, 'public_profiles'), limit(1000))).catch(() => null)
    ),
    fetchSupabaseProfiles().catch(() => []),
    getDocs(query(collection(db, 'posts'), orderBy('createdAtMillis', 'desc'), limit(250))).catch(() =>
      getDocs(query(collection(db, 'posts'), limit(250))).catch(() => null)
    ),
  ]);

  // 1. Server shared user directory
  if (serverRes && Array.isArray(serverRes.users)) {
    serverRes.users.forEach((u: any) => {
      const displayName = String(u?.displayName || '').trim();
      const id = String(u?.id || u?.uid || '').trim();
      if (!id || !displayName) return;
      upsertCandidate(
        {
          id,
          uid: String(u?.uid || id),
          displayName,
          username: u?.username ? String(u.username) : transliterateBnToEn(displayName).replace(/[^a-z0-9]+/g, ''),
          avatar:
            String(u?.avatar || '').trim() ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              displayName
            )}&backgroundColor=1877f2,0ea5e9,3b82f6`,
          bio: u?.bio ? String(u.bio) : undefined,
          location: u?.location ? String(u.location) : undefined,
          verified: Boolean(u?.verified),
          allowFriendRequests: u?.allowFriendRequests !== false,
        },
        true
      );
    });
  }

  // 2. Firestore public_profiles collection
  (publicProfilesSnap?.docs || []).forEach((docSnap) => {
    const data = docSnap.data();
    const displayName = String(data.displayName || data.name || '').trim();
    if (!displayName) return;
    const username = String(data.username || data.handle || '').trim();
    const avatar =
      String(data.avatar || data.photoURL || '').trim() ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        displayName
      )}&backgroundColor=1877f2,0ea5e9,3b82f6`;

    upsertCandidate(
      {
        id: docSnap.id,
        uid: String(data.uid || docSnap.id),
        displayName,
        username,
        avatar,
        bio: data.bio ? String(data.bio) : undefined,
        location: data.location ? String(data.location) : undefined,
        verified: Boolean(data.verified || data.isVerified),
        allowFriendRequests: data.allowFriendRequests !== false,
        emailHash: data.emailHash ? String(data.emailHash) : undefined,
      },
      true
    );
  });

  // 3. Firestore users collection
  (usersSnap?.docs || []).forEach((docSnap) => {
    const data = docSnap.data();
    const displayName = String(data.displayName || data.name || 'Peaceverse User').trim();
    const rawEmail = data.email ? String(data.email).trim().toLowerCase() : '';
    const emailLocal = rawEmail ? rawEmail.split('@')[0] : '';
    const phoneDigits = rawEmail.endsWith('@phone.peaceverse.app')
      ? emailLocal.replace(/\D/g, '')
      : '';
    const username = String(data.username || data.handle || emailLocal || '').trim();
    const avatar =
      String(data.avatar || data.photoURL || '').trim() ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        displayName
      )}&backgroundColor=1877f2,0ea5e9,3b82f6`;

    upsertCandidate(
      {
        id: docSnap.id,
        uid: String(data.uid || docSnap.id),
        displayName,
        username,
        avatar,
        coverPhoto: data.coverPhoto ? String(data.coverPhoto) : undefined,
        bio: data.bio ? String(data.bio) : undefined,
        location: data.location ? String(data.location) : undefined,
        verified: Boolean(data.verified || data.isVerified),
        allowFriendRequests: data.isCreator !== true,
        emailHash: data.emailHash ? String(data.emailHash) : undefined,
        phoneDigits: phoneDigits || undefined,
      },
      true
    );
  });

  // 4. Supabase profiles table (when configured)
  (supabaseProfiles || []).forEach((sp) => {
    upsertCandidate(sp, false);
  });

  // 5. Fallback: active creators from Firestore posts
  (postsSnap?.docs || []).forEach((pDoc) => {
    const pData = pDoc.data();
    const aName = String(pData?.author?.name || '').trim();
    const aId = String(pData?.authorId || (aName ? `author-${aName}` : '')).trim();
    if (!aName || !aId || aId.startsWith('page-') || byId.has(aId)) return;
    upsertCandidate({
      id: aId,
      uid: aId,
      displayName: aName,
      username: transliterateBnToEn(aName).replace(/[^a-z0-9]+/g, ''),
      avatar:
        String(pData?.author?.avatar || '').trim() ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          aName
        )}&backgroundColor=1877f2,0ea5e9,3b82f6`,
      verified: Boolean(pData?.author?.verified),
    });
  });

  // 6. Local posts store authors
  try {
    const localPostsRaw = localStorage.getItem('peaceverse_posts');
    if (localPostsRaw) {
      const localPosts: PostItem[] = JSON.parse(localPostsRaw);
      if (Array.isArray(localPosts)) {
        localPosts.forEach((lp) => {
          const aName = String(lp?.author?.name || '').trim();
          const aId = String(lp?.authorId || (aName ? `author-${aName}` : '')).trim();
          if (!aName || !aId || aId.startsWith('page-') || byId.has(aId)) return;
          upsertCandidate({
            id: aId,
            uid: aId,
            displayName: aName,
            username: transliterateBnToEn(aName).replace(/[^a-z0-9]+/g, ''),
            avatar:
              String(lp?.author?.avatar || '').trim() ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                aName
              )}&backgroundColor=1877f2,0ea5e9,3b82f6`,
            verified: Boolean(lp?.author?.verified),
          });
        });
      }
    }
  } catch {}

  // 7. Built-in global community members (added last so real accounts always keep priority)
  DUMMY_COMMUNITY_USERS.forEach((du) => {
    if (!byId.has(du.id)) {
      byId.set(du.id, du);
    }
  });

  return Array.from(byId.values());
}

export async function fetchCommunityDirectoryUsers(forceRefresh = false): Promise<SearchedUserProfile[]> {
  const now = Date.now();
  if (
    !forceRefresh &&
    cachedDirectoryUsers &&
    now - cachedDirectoryUsers.fetchedAt < USER_DIRECTORY_CACHE_TTL_MS
  ) {
    return cachedDirectoryUsers.users;
  }
  const users = await fetchDirectoryUsersFromServer();
  cachedDirectoryUsers = { users, fetchedAt: now };
  return users;
}

export async function searchUsersFromFirestore(
  searchTerm: string,
  forceRefresh = false
): Promise<SearchedUserProfile[]> {
  const rawTrimmed = searchTerm.normalize('NFC').trim();
  const q = rawTrimmed.toLowerCase();
  if (!q) return [];

  const qDigits = q.replace(/\D/g, '');
  const qEmailHash = q.includes('@') ? await sha256Hex(q) : '';
  const qNoEmailDomain = q.includes('@') ? q.split('@')[0].trim() : q;
  const qTranslit = transliterateBnToEn(rawTrimmed);
  const qPhonetic = phoneticNormalize(rawTrimmed);
  const qSkeleton = consonantSkeleton(rawTrimmed);
  const qTokens = qTranslit.split(/\s+/).filter(Boolean);
  const qPhoneticTokens = qPhonetic.split(/\s+/).filter(Boolean);

  const matchesCandidate = (u: DirectoryUserRecord): boolean => {
    if (u.id.toLowerCase() === q || u.uid.toLowerCase() === q) return true;
    if (qEmailHash && u.emailHash && u.emailHash === qEmailHash) return true;
    if (qDigits.length >= 6 && u.phoneDigits && u.phoneDigits.includes(qDigits)) return true;

    const dn = u.displayName.normalize('NFC').toLowerCase();
    const un = (u.username || '').toLowerCase();
    if (dn.includes(q) || un.includes(q)) return true;
    if (qNoEmailDomain && qNoEmailDomain !== q && (dn.includes(qNoEmailDomain) || un.includes(qNoEmailDomain))) {
      return true;
    }

    const uTranslit = transliterateBnToEn(u.displayName);
    if (qTranslit && (uTranslit.includes(qTranslit) || un.includes(qTranslit.replace(/\s+/g, '')))) {
      return true;
    }

    if (qTokens.length > 0) {
      const hay = `${dn} ${uTranslit} ${un}`;
      if (qTokens.every((t) => hay.includes(t))) return true;
    }

    const uPhonetic = phoneticNormalize(u.displayName);
    if (qPhonetic && uPhonetic && (uPhonetic.includes(qPhonetic) || qPhonetic.includes(uPhonetic))) {
      return true;
    }
    if (qPhoneticTokens.length > 0 && uPhonetic) {
      const uPhoneticWords = uPhonetic.split(/\s+/).filter(Boolean);
      const allTokensRoughMatch = qPhoneticTokens.every((qt) =>
        uPhoneticWords.some((uw) => uw.includes(qt) || qt.includes(uw))
      );
      if (allTokensRoughMatch) return true;
    }

    if (qSkeleton.length >= 3) {
      const uSkeleton = consonantSkeleton(u.displayName);
      if (uSkeleton && (uSkeleton.includes(qSkeleton) || qSkeleton.includes(uSkeleton))) {
        return true;
      }
      const uWordSkeletons = u.displayName
        .split(/\s+/)
        .map((w) => consonantSkeleton(w))
        .filter((s) => s.length >= 3);
      if (uWordSkeletons.some((ws) => ws.includes(qSkeleton) || qSkeleton.includes(ws))) {
        return true;
      }
    }

    return false;
  };

  try {
    const now = Date.now();
    let directoryUsers: DirectoryUserRecord[] = [];

    if (
      !forceRefresh &&
      cachedDirectoryUsers &&
      now - cachedDirectoryUsers.fetchedAt < USER_DIRECTORY_CACHE_TTL_MS
    ) {
      directoryUsers = cachedDirectoryUsers.users;
    } else {
      directoryUsers = await fetchDirectoryUsersFromServer();
      cachedDirectoryUsers = { users: directoryUsers, fetchedAt: now };
    }

    let matched: DirectoryUserRecord[] = directoryUsers.filter(matchesCandidate);

    const authHeaders = await getCurrentAuthHeaders();
    // Query backend /api/users/search directly with Firebase token (hydrates cross-container & matches emailHash/uid)
    const serverMatched = await fetch(`/api/users/search?q=${encodeURIComponent(rawTrimmed)}`, {
      headers: authHeaders,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => (data && Array.isArray(data.users) ? (data.users as DirectoryUserRecord[]) : []))
      .catch(() => [] as DirectoryUserRecord[]);

    if (serverMatched.length > 0) {
      const seenIds = new Set(matched.map((m) => m.id));
      serverMatched.forEach((su) => {
        if (su?.id && !seenIds.has(su.id)) {
          matched.push(su);
          seenIds.add(su.id);
        }
      });
    }

    // If cached search returned 0 non-dummy results, refresh directory from server once so newly created accounts are found right away
    const hasRealMatch = matched.some((m) => !DUMMY_COMMUNITY_USERS.some((du) => du.id === m.id));
    if (!hasRealMatch && !forceRefresh) {
      directoryUsers = await fetchDirectoryUsersFromServer();
      cachedDirectoryUsers = { users: directoryUsers, fetchedAt: Date.now() };
      const freshMatched = directoryUsers.filter(matchesCandidate);
      const seen = new Set(freshMatched.map((m) => m.id));
      serverMatched.forEach((su) => {
        if (su?.id && !seen.has(su.id)) {
          freshMatched.push(su);
          seen.add(su.id);
        }
      });
      matched = freshMatched;
    }

    // Also check current logged-in local user if somehow not yet indexed in server snapshot
    try {
      const currentAuth = auth.currentUser;
      const savedName = localStorage.getItem('peaceverse_registered_name');
      if (currentAuth) {
        const localName = (currentAuth.displayName || savedName || '').trim();
        if (localName && !matched.some((m) => m.id === currentAuth.uid)) {
          const selfEmailHash = currentAuth.email
            ? await sha256Hex(currentAuth.email.toLowerCase())
            : '';
          const selfCandidate: DirectoryUserRecord = {
            id: currentAuth.uid,
            uid: currentAuth.uid,
            displayName: localName,
            username: transliterateBnToEn(localName).replace(/[^a-z0-9]+/g, ''),
            avatar:
              currentAuth.photoURL ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                localName
              )}&backgroundColor=1877f2,0ea5e9,3b82f6`,
            emailHash: selfEmailHash || undefined,
          };
          if (matchesCandidate(selfCandidate)) {
            matched.unshift(selfCandidate);
          }
        }
      }
    } catch {}

    // Prioritize exact and prefix matches (and real Firebase/server accounts over dummy items on ties)
    const dummyIds = new Set(DUMMY_COMMUNITY_USERS.map((du) => du.id));
    matched.sort((a, b) => {
      const aName = a.displayName.toLowerCase();
      const bName = b.displayName.toLowerCase();
      const aT = transliterateBnToEn(a.displayName);
      const bT = transliterateBnToEn(b.displayName);
      const aExact =
        aName === q || aT === qTranslit || (a.username || '').toLowerCase() === q ? 0 : 1;
      const bExact =
        bName === q || bT === qTranslit || (b.username || '').toLowerCase() === q ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;

      const aStarts = aName.startsWith(q) || aT.startsWith(qTranslit) ? 0 : 1;
      const bStarts = bName.startsWith(q) || bT.startsWith(qTranslit) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;

      const aIsDummy = dummyIds.has(a.id) ? 1 : 0;
      const bIsDummy = dummyIds.has(b.id) ? 1 : 0;
      if (aIsDummy !== bIsDummy) return aIsDummy - bIsDummy;

      return aName.localeCompare(bName);
    });

    return matched.map(({ emailHash: _eh, phoneDigits: _pd, ...publicFields }) => publicFields);
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.LIST, 'users');
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice searching users collection:', err);
    }
    return [];
  }
}

// ==========================================
// PAGE DIRECTORY SYNC & CROSS-SCRIPT PAGE SEARCH
// ==========================================

let cachedDirectoryPages: { pages: PageItem[]; fetchedAt: number } | null = null;
const PAGE_DIRECTORY_CACHE_TTL_MS = 20 * 1000;

function trimOversizedImageForFirestore(url?: string): string {
  const clean = (url || '').trim();
  if (!clean || clean.startsWith('blob:')) return '';
  if (clean.startsWith('data:') && clean.length > 420000) return '';
  return clean;
}

export function sanitizePageBioValue(raw?: string): string {
  const text = (raw || '').trim();
  if (!text) return '';
  const lower = text.toLowerCase();
  if (
    lower === 'welcome to our official peaceverse24.com page.' ||
    lower === 'welcome to our official peaceverse24 page.'
  ) {
    return '';
  }
  return text;
}

export async function syncPageToFirestore(page: PageItem, ownerUid?: string): Promise<void> {
  if (!page?.id || !page?.name?.trim()) return;
  try {
    const cleanName = page.name.trim();
    const resolvedOwnerUid = ownerUid || auth.currentUser?.uid || '';
    const cleanBio = sanitizePageBioValue(page.bio);
    const cleanDesc = sanitizePageBioValue(page.description);
    const [safeAvatar, safeCover] = await Promise.all([
      preparePersistableImageForFirestore(page.avatar, 512),
      preparePersistableImageForFirestore(page.cover, 1080),
    ]);
    const payload: Record<string, any> = {
      id: page.id,
      name: cleanName,
      transliteratedName: transliterateBnToEn(cleanName),
      category: page.category || 'Community',
      likes: page.likes || '0 লাইক',
      followersCount: typeof page.followersCount === 'number' ? page.followersCount : 1,
      followingCount: typeof page.followingCount === 'number' ? page.followingCount : 0,
      ...(safeAvatar ? { avatar: safeAvatar } : {}),
      ...(safeCover ? { cover: safeCover } : {}),
      description: cleanDesc,
      bio: cleanBio,
      location: page.location || '',
      website: page.website || '',
      email: page.email || '',
      phone: page.phone || '',
      whatsapp: page.whatsapp || '',
      imo: page.imo || '',
      viber: page.viber || '',
      rating: page.rating || '5.0 ★',
      createdAt: page.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (resolvedOwnerUid) {
      payload.ownerUid = resolvedOwnerUid;
    }
    await setDoc(doc(db, 'pages', page.id), payload, { merge: true });
    cachedDirectoryPages = null;
  } catch (err: any) {
    if (!isOfflineOrUnavailableError(err) && err?.code !== 'permission-denied') {
      console.warn('Notice syncing page to Firestore:', err);
    }
  }
}

export async function fetchOwnedPagesFromFirestore(ownerUid: string): Promise<PageItem[]> {
  if (!ownerUid || ownerUid === 'user-me') return [];
  try {
    const q = query(collection(db, 'pages'), where('ownerUid', '==', ownerUid), limit(100));
    const snap = await getDocs(q);
    if (snap.empty) return [];
    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      const name = String(data.name || 'Page').trim();
      return {
        id: docSnap.id,
        name,
        category: String(data.category || 'Community'),
        likes: String(data.likes || `${data.followersCount || 0} লাইক`),
        followersCount: Number(data.followersCount || 0),
        followingCount: Number(data.followingCount || 0),
        avatar: String(data.avatar || ''),
        cover: String(data.cover || ''),
        role: 'Admin',
        isOwner: true,
        isLiked: isTargetFollowedLocally(docSnap.id, name),
        description: sanitizePageBioValue(data.description ? String(data.description) : ''),
        bio: sanitizePageBioValue(data.bio ? String(data.bio) : ''),
        phone: data.phone ? String(data.phone) : undefined,
        whatsapp: data.whatsapp ? String(data.whatsapp) : undefined,
        imo: data.imo ? String(data.imo) : undefined,
        viber: data.viber ? String(data.viber) : undefined,
        website: data.website ? String(data.website) : undefined,
        email: data.email ? String(data.email) : undefined,
        location: data.location ? String(data.location) : undefined,
        rating: data.rating ? String(data.rating) : undefined,
        createdAt: data.createdAt ? String(data.createdAt) : undefined,
      };
    });
  } catch {
    return [];
  }
}

export async function fetchPageByIdFromFirestore(pageId: string): Promise<PageItem | null> {
  if (!pageId) return null;
  try {
    const snap = await getDocSafe(doc(db, 'pages', pageId));
    if (!snap || !snap.exists()) return null;
    const data = snap.data();
    const currentUid = auth.currentUser?.uid || '';
    const isOwner = Boolean(currentUid && data.ownerUid && data.ownerUid === currentUid);
    const name = String(data.name || 'Page').trim();
    return {
      id: snap.id,
      name,
      category: String(data.category || 'Community'),
      likes: String(data.likes || `${data.followersCount || 0} লাইক`),
      followersCount: Number(data.followersCount || 0),
      followingCount: Number(data.followingCount || 0),
      avatar: String(data.avatar || ''),
      cover: String(data.cover || ''),
      role: isOwner ? 'Admin' : undefined,
      isOwner,
      isLiked: isTargetFollowedLocally(snap.id, name),
      description: sanitizePageBioValue(data.description ? String(data.description) : ''),
      bio: sanitizePageBioValue(data.bio ? String(data.bio) : ''),
      phone: data.phone ? String(data.phone) : undefined,
      whatsapp: data.whatsapp ? String(data.whatsapp) : undefined,
      imo: data.imo ? String(data.imo) : undefined,
      viber: data.viber ? String(data.viber) : undefined,
      website: data.website ? String(data.website) : undefined,
      email: data.email ? String(data.email) : undefined,
      location: data.location ? String(data.location) : undefined,
      rating: data.rating ? String(data.rating) : undefined,
      createdAt: data.createdAt ? String(data.createdAt) : undefined,
    };
  } catch {
    return null;
  }
}

async function fetchDirectoryPagesFromServer(): Promise<PageItem[]> {
  const byId = new Map<string, PageItem>();
  const currentUid = auth.currentUser?.uid || '';

  // 1. Local user-created pages (instant availability even before server round-trip completes)
  try {
    const localRaw = localStorage.getItem('qalby_fb_pages');
    if (localRaw) {
      const parsed: PageItem[] = JSON.parse(localRaw);
      if (Array.isArray(parsed)) {
        parsed.forEach((p) => {
          if (p?.id && p?.name) {
            byId.set(p.id, {
              ...p,
              bio: sanitizePageBioValue(p.bio),
              description: sanitizePageBioValue(p.description),
              isLiked: isTargetFollowedLocally(p.id, p.name) || Boolean(p.isLiked),
            });
          }
        });
      }
    }
  } catch {}

  // 2. Firestore 'pages' collection (all public pages created across users)
  const pagesSnap = await getDocs(query(collection(db, 'pages'), limit(500))).catch(() => null);
  (pagesSnap?.docs || []).forEach((docSnap) => {
    const data = docSnap.data();
    const name = String(data.name || '').trim();
    if (!name) return;
    const existing = byId.get(docSnap.id);
    const isOwner = Boolean(
      existing?.isOwner || (currentUid && data.ownerUid && data.ownerUid === currentUid)
    );
    byId.set(docSnap.id, {
      id: docSnap.id,
      name,
      category: String(data.category || existing?.category || 'Community'),
      likes: String(data.likes || existing?.likes || `${data.followersCount || 0} লাইক`),
      followersCount: Number(data.followersCount ?? existing?.followersCount ?? 1),
      followingCount: Number(data.followingCount ?? existing?.followingCount ?? 0),
      avatar: String(existing?.avatar || data.avatar || ''),
      cover: String(existing?.cover || data.cover || ''),
      role: isOwner ? 'Admin' : undefined,
      isOwner,
      isLiked: isTargetFollowedLocally(docSnap.id, name) || Boolean(existing?.isLiked),
      description:
        sanitizePageBioValue(existing?.description) ||
        sanitizePageBioValue(data.description ? String(data.description) : ''),
      bio:
        sanitizePageBioValue(existing?.bio) ||
        sanitizePageBioValue(data.bio ? String(data.bio) : ''),
      phone: data.phone ? String(data.phone) : existing?.phone,
      whatsapp: data.whatsapp ? String(data.whatsapp) : existing?.whatsapp,
      imo: data.imo ? String(data.imo) : existing?.imo,
      viber: data.viber ? String(data.viber) : existing?.viber,
      website: data.website ? String(data.website) : existing?.website,
      email: data.email ? String(data.email) : existing?.email,
      location: data.location ? String(data.location) : existing?.location,
      rating: data.rating ? String(data.rating) : existing?.rating,
      createdAt: data.createdAt ? String(data.createdAt) : existing?.createdAt,
    });
  });

  // 3. Fallback: index any Page-authored posts from 'posts' collection (e.g. page-* IDs)
  const postsSnap = await getDocs(query(collection(db, 'posts'), limit(200))).catch(() => null);
  (postsSnap?.docs || []).forEach((pDoc) => {
    const pData = pDoc.data();
    const aId = String(pData?.authorId || '').trim();
    const aName = String(pData?.author?.name || '').trim();
    if (!aId.startsWith('page-') || !aName || byId.has(aId)) return;
    const sameNameExists = Array.from(byId.values()).some(
      (pg) => pg.name.normalize('NFC').toLowerCase() === aName.normalize('NFC').toLowerCase()
    );
    if (sameNameExists) return;
    byId.set(aId, {
      id: aId,
      name: aName,
      category: String(pData?.author?.subtitle || 'Community'),
      likes: '১ লাইক',
      followersCount: 1,
      followingCount: 0,
      avatar: String(pData?.author?.avatar || ''),
      cover: '',
      isOwner: false,
      isLiked: isTargetFollowedLocally(aId, aName),
      description: String(pData?.author?.subtitle || 'Peaceverse Page'),
      bio: '',
    });
  });

  return Array.from(byId.values());
}

export async function searchPagesFromFirestore(
  searchTerm: string,
  forceRefresh = false
): Promise<PageItem[]> {
  const rawTrimmed = searchTerm.normalize('NFC').trim();
  const q = rawTrimmed.toLowerCase();
  if (!q) return [];

  const qTranslit = transliterateBnToEn(rawTrimmed);
  const qPhonetic = phoneticNormalize(rawTrimmed);
  const qTokens = qTranslit.split(/\s+/).filter(Boolean);
  const qPhoneticTokens = qPhonetic.split(/\s+/).filter(Boolean);

  const matchesPage = (pg: PageItem): boolean => {
    const pn = pg.name.normalize('NFC').toLowerCase();
    const cat = (pg.category || '').normalize('NFC').toLowerCase();
    const bio = (pg.bio || pg.description || '').normalize('NFC').toLowerCase();
    if (pn.includes(q) || cat.includes(q) || bio.includes(q)) return true;

    const pTranslit = transliterateBnToEn(pg.name);
    const pSlug = pTranslit.replace(/\s+/g, '');
    if (qTranslit && (pTranslit.includes(qTranslit) || pSlug.includes(qTranslit.replace(/\s+/g, '')))) {
      return true;
    }

    if (qTokens.length > 0) {
      const hay = `${pn} ${pTranslit} ${cat}`;
      if (qTokens.every((t) => hay.includes(t))) return true;
    }

    const pPhonetic = phoneticNormalize(pg.name);
    if (qPhonetic && pPhonetic && (pPhonetic.includes(qPhonetic) || qPhonetic.includes(pPhonetic))) {
      return true;
    }
    if (qPhoneticTokens.length > 0 && pPhonetic) {
      const pPhoneticWords = pPhonetic.split(/\s+/).filter(Boolean);
      const allTokensRoughMatch = qPhoneticTokens.every((qt) =>
        pPhoneticWords.some((pw) => pw.includes(qt) || qt.includes(pw))
      );
      if (allTokensRoughMatch) return true;
    }

    return false;
  };

  try {
    const now = Date.now();
    let directoryPages: PageItem[] = [];

    if (
      !forceRefresh &&
      cachedDirectoryPages &&
      now - cachedDirectoryPages.fetchedAt < PAGE_DIRECTORY_CACHE_TTL_MS
    ) {
      directoryPages = cachedDirectoryPages.pages;
    } else {
      directoryPages = await fetchDirectoryPagesFromServer();
      cachedDirectoryPages = { pages: directoryPages, fetchedAt: now };
    }

    let matched = directoryPages.filter(matchesPage);

    if (matched.length === 0 && !forceRefresh) {
      directoryPages = await fetchDirectoryPagesFromServer();
      cachedDirectoryPages = { pages: directoryPages, fetchedAt: Date.now() };
      matched = directoryPages.filter(matchesPage);
    }

    matched.sort((a, b) => {
      const aName = a.name.normalize('NFC').toLowerCase();
      const bName = b.name.normalize('NFC').toLowerCase();
      const aT = transliterateBnToEn(a.name);
      const bT = transliterateBnToEn(b.name);
      const aExact = aName === q || aT === qTranslit ? 0 : 1;
      const bExact = bName === q || bT === qTranslit ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;

      const aStarts = aName.startsWith(q) || aT.startsWith(qTranslit) ? 0 : 1;
      const bStarts = bName.startsWith(q) || bT.startsWith(qTranslit) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;

      return aName.localeCompare(bName);
    });

    return matched;
  } catch (err: any) {
    if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice searching pages collection:', err);
    }
    return [];
  }
}

export async function fetchSentFriendRequestIds(senderId: string): Promise<string[]> {
  if (!senderId) return [];
  try {
    const q = query(collection(db, 'follows'), where('followerId', '==', senderId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => String(d.data().targetId || '')).filter(Boolean);
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.LIST, 'follows');
    }
    return [];
  }
}

export async function sendFriendRequestToUser(
  senderId: string,
  senderName: string,
  senderAvatar: string,
  targetUser: SearchedUserProfile
): Promise<boolean> {
  if (!senderId || !targetUser.id || senderId === targetUser.id) return false;
  const rate = checkRateLimit(senderId);
  if (!rate.allowed) return false;
  const dailyLimit = checkDailyFriendRequestLimit(senderId, true);
  if (!dailyLimit.allowed) {
    console.warn(dailyLimit.message || 'Max 20 friend requests per day reached.');
    return false;
  }
  const followDocId = `${senderId}_${targetUser.id}`;
  const notifDocId = `fr-${senderId}-${targetUser.id}`;

  try {
    await setDoc(doc(db, 'follows', followDocId), {
      id: followDocId,
      type: 'friend_request',
      status: 'pending',
      followerId: senderId,
      followerName: senderName,
      followerAvatar: senderAvatar,
      targetId: targetUser.id,
      targetName: targetUser.displayName,
      targetAvatar: targetUser.avatar,
      createdAt: new Date().toISOString(),
      createdAtMillis: Date.now(),
    });

    await setDoc(doc(db, 'notifications', notifDocId), {
      id: notifDocId,
      type: 'friend_request',
      from: senderId,
      to: targetUser.id,
      recipientId: targetUser.id,
      senderId,
      senderName,
      senderAvatar,
      avatar: senderAvatar,
      title: `${senderName} sent you a friend request`,
      subtitle: 'Tap to accept or view profile',
      timeAgo: 'Just now',
      isUnread: true,
      read: false,
      badgeType: 'friend',
      requestData: {
        id: followDocId,
        name: senderName,
        avatar: senderAvatar,
        timeAgo: 'Just now',
        status: 'pending',
      },
      createdAt: new Date().toISOString(),
      createdAtMillis: Date.now(),
    });

    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, `follows/${followDocId}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice sending friend request:', err);
    }
    return false;
  }
}

export async function cancelFriendRequestToUser(
  senderId: string,
  targetUserId: string
): Promise<boolean> {
  if (!senderId || !targetUserId) return false;
  const followDocId = `${senderId}_${targetUserId}`;
  const notifDocId = `fr-${senderId}-${targetUserId}`;

  try {
    await Promise.all([
      deleteDoc(doc(db, 'follows', followDocId)).catch(() => {}),
      deleteDoc(doc(db, 'notifications', notifDocId)).catch(() => {}),
    ]);
    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.DELETE, `follows/${followDocId}`);
    }
    return false;
  }
}

export interface UserFriendItem {
  id: string;
  name: string;
  avatar: string;
}

export async function fetchUserFriendsFromFirestore(
  userId: string
): Promise<{ count: number; friends: UserFriendItem[] }> {
  if (!userId) return { count: 0, friends: [] };
  try {
    const friendsRef = collection(db, 'users', userId, 'friends');
    const snap = await getDocs(friendsRef);
    const friends = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: String(data.name || data.displayName || 'Friend'),
        avatar: String(data.avatar || data.photoURL || ''),
      };
    });
    return {
      count: snap.size,
      friends,
    };
  } catch (err: any) {
    if (!isOfflineOrUnavailableError(err) && err?.code !== 'permission-denied') {
      console.warn('Notice fetching user friends:', err);
    }
    return { count: 0, friends: [] };
  }
}

export function subscribeToUserFriendsFromFirestore(
  userId: string,
  onUpdate: (data: { count: number; friends: UserFriendItem[] }) => void
): () => void {
  if (!userId) {
    onUpdate({ count: 0, friends: [] });
    return () => {};
  }
  try {
    const friendsRef = collection(db, 'users', userId, 'friends');
    return onSnapshot(
      friendsRef,
      (snap) => {
        const friends = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: String(data.name || data.displayName || 'Friend'),
            avatar: String(data.avatar || data.photoURL || ''),
          };
        });
        onUpdate({ count: snap.size, friends });
      },
      () => {
        onUpdate({ count: 0, friends: [] });
      }
    );
  } catch {
    onUpdate({ count: 0, friends: [] });
    return () => {};
  }
}

export interface AdminPlatformUser {
  id: string;
  uid: string;
  displayName: string;
  username: string;
  email: string;
  avatar: string;
  location: string;
  updatedAt: string;
  updatedAtMillis: number;
  isActive24h: boolean;
  isActive7d: boolean;
  verified: boolean;
}

export interface AdminPlatformStats {
  totalUsers: number;
  activeUsers24h: number;
  activeUsers7d: number;
  totalPosts: number;
  totalFollows: number;
  totalNotifications: number;
  users: AdminPlatformUser[];
}

export async function fetchAdminPlatformData(): Promise<AdminPlatformStats> {
  const empty: AdminPlatformStats = {
    totalUsers: 0,
    activeUsers24h: 0,
    activeUsers7d: 0,
    totalPosts: 0,
    totalFollows: 0,
    totalNotifications: 0,
    users: [],
  };

  try {
    const [usersSnap, postsSnap, followsSnap, notifsSnap] = await Promise.all([
      getDocs(query(collection(db, 'users'), limit(1000))).catch((err) => {
        if (err?.code === 'permission-denied') {
          handleFirestoreError(err, OperationType.LIST, 'users');
        }
        return null;
      }),
      getDocs(query(collection(db, 'posts'), limit(500))).catch((err) => {
        if (err?.code === 'permission-denied') {
          handleFirestoreError(err, OperationType.LIST, 'posts');
        }
        return null;
      }),
      getDocs(query(collection(db, 'follows'), limit(1000))).catch((err) => {
        if (err?.code === 'permission-denied') {
          handleFirestoreError(err, OperationType.LIST, 'follows');
        }
        return null;
      }),
      getDocs(query(collection(db, 'notifications'), limit(500))).catch((err) => {
        if (err?.code === 'permission-denied') {
          handleFirestoreError(err, OperationType.LIST, 'notifications');
        }
        return null;
      }),
    ]);

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;

    const users: AdminPlatformUser[] = (usersSnap?.docs || []).map((docSnap) => {
      const data = docSnap.data();
      const displayName = String(data.displayName || data.name || 'Peaceverse User').trim();
      const username = String(data.username || data.handle || '').trim();
      const email = String(data.email || '').trim();
      const avatar =
        String(data.avatar || data.photoURL || '').trim() ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=1877f2,0ea5e9,3b82f6`;
      const updatedAt = String(data.updatedAt || '');
      const parsedTime = updatedAt ? Date.parse(updatedAt) : 0;
      const updatedAtMillis = Number.isFinite(parsedTime) && parsedTime > 0 ? parsedTime : 0;
      const ageMs = updatedAtMillis > 0 ? now - updatedAtMillis : Number.MAX_SAFE_INTEGER;

      return {
        id: docSnap.id,
        uid: String(data.uid || docSnap.id),
        displayName,
        username,
        email,
        avatar,
        location: String(data.location || ''),
        updatedAt,
        updatedAtMillis,
        isActive24h: ageMs <= dayMs,
        isActive7d: ageMs <= weekMs,
        verified: Boolean(data.verified || data.isVerified),
      };
    });

    users.sort((a, b) => b.updatedAtMillis - a.updatedAtMillis);

    return {
      totalUsers: users.length,
      activeUsers24h: users.filter((u) => u.isActive24h).length,
      activeUsers7d: users.filter((u) => u.isActive7d).length,
      totalPosts: postsSnap?.size || 0,
      totalFollows: followsSnap?.size || 0,
      totalNotifications: notifsSnap?.size || 0,
      users,
    };
  } catch (err) {
    console.warn('Notice fetching admin platform stats:', err);
    return empty;
  }
}

// ==========================================
// REAL-TIME FRIEND REQUESTS & MUTUAL SYNC
// ==========================================

export interface IncomingFriendRequestItem {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  timeAgo: string;
  createdAtMillis: number;
}

export function subscribeToIncomingFriendRequests(
  userId: string | undefined,
  onUpdate: (requests: IncomingFriendRequestItem[]) => void
): () => void {
  if (!userId || userId === 'user-me') {
    onUpdate([]);
    return () => {};
  }
  try {
    const q = query(collection(db, 'follows'), where('targetId', '==', userId));
    return onSnapshot(
      q,
      (snap) => {
        const items: IncomingFriendRequestItem[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.type !== 'friend_request') return;
          if (data.status && data.status !== 'pending') return;
          const senderId = String(data.followerId || '').trim();
          if (!senderId || senderId === userId) return;
          const parsedTime = data.createdAt ? Date.parse(String(data.createdAt)) : 0;
          const createdAtMillis = Number(
            data.createdAtMillis || (Number.isFinite(parsedTime) ? parsedTime : Date.now())
          );
          const senderName = String(data.followerName || 'Peaceverse User').trim();
          const senderAvatar =
            String(data.followerAvatar || '').trim() ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              senderName
            )}&backgroundColor=1877f2,0ea5e9,3b82f6`;

          items.push({
            id: docSnap.id,
            senderId,
            senderName,
            senderAvatar,
            timeAgo: 'Just now',
            createdAtMillis: Number.isFinite(createdAtMillis) ? createdAtMillis : Date.now(),
          });
        });
        items.sort((a, b) => b.createdAtMillis - a.createdAtMillis);
        onUpdate(items);
      },
      (err) => {
        if (!isOfflineOrUnavailableError(err)) {
          console.warn('Notice subscribing to incoming friend requests:', err);
        }
        onUpdate([]);
      }
    );
  } catch {
    onUpdate([]);
    return () => {};
  }
}

export function subscribeToAcceptedOutgoingFriendRequests(
  userId: string | undefined,
  onSyncedFriend?: (friend: UserFriendItem) => void
): () => void {
  if (!userId || userId === 'user-me') return () => {};
  try {
    const q = query(collection(db, 'follows'), where('followerId', '==', userId));
    return onSnapshot(
      q,
      (snap) => {
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.type !== 'friend_request') return;
          const targetId = String(data.targetId || '').trim();
          const targetName = String(data.targetName || 'Friend').trim();
          const targetAvatar = String(data.targetAvatar || '').trim();
          if (!targetId) return;

          if (data.status === 'pending') {
            setFriendRequestSentLocally(true, targetId, targetName);
          } else if (data.status === 'accepted') {
            addLocalFriend({ id: targetId, name: targetName, avatar: targetAvatar });
            setFriendRequestSentLocally(false, targetId, targetName);
            void setDoc(
              doc(db, 'users', userId, 'friends', targetId),
              {
                id: targetId,
                name: targetName,
                avatar: targetAvatar,
                addedAt: new Date().toISOString(),
                addedAtMillis: Date.now(),
              },
              { merge: true }
            ).catch(() => {});
            onSyncedFriend?.({ id: targetId, name: targetName, avatar: targetAvatar });
          }
        });
      },
      () => {}
    );
  } catch {
    return () => {};
  }
}

export async function acceptFriendRequestInFirestore(
  currentUser: { id: string; name: string; avatar: string },
  sender: { id: string; name: string; avatar: string },
  followDocId?: string,
  notifId?: string
): Promise<boolean> {
  if (!currentUser.id || !sender.id || currentUser.id === 'user-me') return false;
  const resolvedFollowId = followDocId || `${sender.id}_${currentUser.id}`;
  const defaultNotifId = `fr-${sender.id}-${currentUser.id}`;
  const now = Date.now();
  const iso = new Date(now).toISOString();

  try {
    await setDoc(
      doc(db, 'follows', resolvedFollowId),
      {
        id: resolvedFollowId,
        type: 'friend_request',
        status: 'accepted',
        followerId: sender.id,
        followerName: sender.name,
        followerAvatar: sender.avatar,
        targetId: currentUser.id,
        targetName: currentUser.name,
        targetAvatar: currentUser.avatar,
        acceptedAt: iso,
        acceptedAtMillis: now,
      },
      { merge: true }
    );

    await Promise.allSettled([
      setDoc(
        doc(db, 'users', currentUser.id, 'friends', sender.id),
        {
          id: sender.id,
          name: sender.name,
          avatar: sender.avatar,
          addedAt: iso,
          addedAtMillis: now,
        },
        { merge: true }
      ),
      setDoc(
        doc(db, 'users', sender.id, 'friends', currentUser.id),
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          addedAt: iso,
          addedAtMillis: now,
        },
        { merge: true }
      ),
      deleteDoc(doc(db, 'notifications', defaultNotifId)).catch(() => {}),
      notifId && notifId !== defaultNotifId
        ? deleteDoc(doc(db, 'notifications', notifId)).catch(() => {})
        : Promise.resolve(),
    ]);

    addLocalFriend({
      id: sender.id,
      name: sender.name,
      avatar: sender.avatar,
    });

    await sendRealtimeNotification({
      id: `fr-acc-${currentUser.id}-${sender.id}`,
      type: 'general',
      from: currentUser.id,
      to: sender.id,
      avatar: currentUser.avatar,
      title: `${currentUser.name} আপনার ফ্রেন্ড রিকোয়েস্ট গ্রহণ করেছেন`,
      subtitle: 'আপনারা এখন Peaceverse24-এ বন্ধু',
      timeAgo: 'Just now',
      isUnread: true,
      badgeType: 'friend',
    });

    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, `follows/${resolvedFollowId}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice accepting friend request:', err);
    }
    return false;
  }
}

export async function declineFriendRequestInFirestore(
  currentUserId: string,
  senderId: string,
  followDocId?: string,
  notifId?: string
): Promise<boolean> {
  if (!currentUserId || !senderId || currentUserId === 'user-me') return false;
  const resolvedFollowId = followDocId || `${senderId}_${currentUserId}`;
  const defaultNotifId = `fr-${senderId}-${currentUserId}`;

  try {
    await Promise.allSettled([
      deleteDoc(doc(db, 'follows', resolvedFollowId)),
      deleteDoc(doc(db, 'notifications', defaultNotifId)),
      notifId && notifId !== defaultNotifId
        ? deleteDoc(doc(db, 'notifications', notifId))
        : Promise.resolve(),
    ]);
    return true;
  } catch (err: any) {
    if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice declining friend request:', err);
    }
    return false;
  }
}

// ==========================================
// REAL-TIME USER-TO-USER DIRECT MESSAGING
// ==========================================

export function getChatRoomId(uid1: string, uid2: string): string {
  return [uid1.trim(), uid2.trim()].sort().join('__');
}

export interface RealtimeChatThread {
  roomId: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessageText: string;
  lastSenderId: string;
  updatedAtMillis: number;
  unreadCount: number;
}

export function subscribeToUserChats(
  userId: string | undefined,
  onUpdate: (threads: RealtimeChatThread[]) => void
): () => void {
  if (!userId || userId === 'user-me') {
    onUpdate([]);
    return () => {};
  }
  try {
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', userId));
    return onSnapshot(
      q,
      (snap) => {
        const threads: RealtimeChatThread[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const participants: string[] = Array.isArray(data.participants)
            ? data.participants.map(String)
            : [];
          const partnerId = participants.find((p) => p !== userId) || '';
          if (!partnerId) return;
          const meta = data.participantMeta?.[partnerId] || {};
          const partnerName = String(meta.name || 'Peaceverse User').trim();
          const partnerAvatar =
            String(meta.avatar || '').trim() ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              partnerName
            )}&backgroundColor=1877f2,0ea5e9,3b82f6`;
          const lastSenderId = String(data.lastSenderId || '');
          const updatedAtMillis = Number(data.updatedAtMillis || 0);
          const unreadForMe =
            typeof data.unreadBy?.[userId] === 'number'
              ? Number(data.unreadBy[userId])
              : lastSenderId && lastSenderId !== userId
              ? 1
              : 0;

          threads.push({
            roomId: docSnap.id,
            partnerId,
            partnerName,
            partnerAvatar,
            lastMessageText: String(data.lastMessageText || ''),
            lastSenderId,
            updatedAtMillis,
            unreadCount: unreadForMe,
          });
        });
        threads.sort((a, b) => b.updatedAtMillis - a.updatedAtMillis);
        onUpdate(threads);
      },
      (err) => {
        if (!isOfflineOrUnavailableError(err)) {
          console.warn('Notice subscribing to user chats:', err);
        }
      }
    );
  } catch {
    return () => {};
  }
}

export function subscribeToChatMessages(
  roomId: string | undefined,
  currentUserId: string | undefined,
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  if (!roomId || !currentUserId) {
    onUpdate([]);
    return () => {};
  }
  try {
    const msgsRef = collection(db, 'chats', roomId, 'messages');
    const q = query(msgsRef, limit(100));
    return onSnapshot(
      q,
      (snap) => {
        const msgs: (ChatMessage & { createdAtMillis: number })[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const senderId = String(data.senderId || '');
          const createdAtMillis = Number(data.createdAtMillis || 0);
          msgs.push({
            id: docSnap.id,
            sender: senderId === currentUserId ? 'me' : 'them',
            text: String(data.text || ''),
            time: String(data.timeLabel || 'Just now'),
            createdAtMillis,
          });
        });
        msgs.sort((a, b) => a.createdAtMillis - b.createdAtMillis);
        onUpdate(msgs.map(({ id, sender, text, time }) => ({ id, sender, text, time })));
      },
      (err) => {
        if (!isOfflineOrUnavailableError(err)) {
          console.warn('Notice subscribing to chat messages:', err);
        }
      }
    );
  } catch {
    return () => {};
  }
}

export async function markChatThreadRead(roomId: string, currentUserId: string): Promise<void> {
  if (!roomId || !currentUserId) return;
  try {
    await setDoc(
      doc(db, 'chats', roomId),
      {
        unreadBy: { [currentUserId]: 0 },
      },
      { merge: true }
    );
  } catch {}
}

export async function sendRealtimeDirectMessage(
  sender: { id: string; name: string; avatar: string },
  recipient: { id: string; name: string; avatar: string },
  encryptedText: string
): Promise<boolean> {
  if (!sender.id || !recipient.id || !encryptedText) return false;
  const roomId = getChatRoomId(sender.id, recipient.id);
  const now = Date.now();
  const iso = new Date(now).toISOString();
  const msgId = `msg-${now}-${Math.random().toString(36).slice(2, 7)}`;
  const timeLabel = new Date(now).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  try {
    await setDoc(
      doc(db, 'chats', roomId),
      {
        id: roomId,
        participants: [sender.id, recipient.id].sort(),
        participantMeta: {
          [sender.id]: { name: sender.name, avatar: sender.avatar },
          [recipient.id]: { name: recipient.name, avatar: recipient.avatar },
        },
        lastMessageText: encryptedText,
        lastSenderId: sender.id,
        unreadBy: {
          [sender.id]: 0,
          [recipient.id]: 1,
        },
        updatedAtMillis: now,
        updatedAt: iso,
      },
      { merge: true }
    );

    await setDoc(doc(db, 'chats', roomId, 'messages', msgId), {
      id: msgId,
      senderId: sender.id,
      senderName: sender.name,
      text: encryptedText,
      timeLabel,
      createdAtMillis: now,
      createdAt: iso,
    });

    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, `chats/${roomId}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice sending direct message:', err);
    }
    return false;
  }
}



