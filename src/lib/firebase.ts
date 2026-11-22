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
import { PostItem, PostComment, NotificationItem, ReactionType, UserProfile, SearchedUserProfile, PageItem } from '../types';
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

export function subscribeToRealtimePosts(
  onUpdate: (posts: PostItem[]) => void,
  onError?: (error: any) => void
) {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, limit(50));

    return onSnapshot(
      q,
      (snapshot) => {
        const livePosts: PostItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          livePosts.push({
            id: docSnap.id,
            author: data.author || {
              name: data.authorName || 'Peaceverse24.com User',
              avatar: data.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80',
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
          });
        });

        if (livePosts.length > 0) {
          // Sort newest first
          livePosts.sort((a, b) => {
            const timeA = (a as any).createdAtMillis || 0;
            const timeB = (b as any).createdAtMillis || 0;
            return timeB - timeA;
          });
          onUpdate(livePosts);
        }
      },
      (error) => {
        console.warn('Realtime posts subscription notice:', error);
        if (onError) onError(error);
      }
    );
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

// Force Firebase email or 6-digit Email OTP verification before creating posts/comments (phone accounts exempt)
function isCurrentUserVerifiedForPosting(): boolean {
  const u = auth.currentUser;
  if (!u) return false;
  if (u.emailVerified) return true;
  if (u.email?.endsWith('@phone.peaceverse.app')) return true;
  if (u.providerData?.some((p) => p.providerId === 'phone')) return true;
  try {
    if (
      u.uid &&
      u.email &&
      localStorage.getItem(`peaceverse_otp_verified_${u.uid}`) === u.email.trim().toLowerCase()
    ) {
      return true;
    }
  } catch {}
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
    console.warn('Security Block: Email verification required before posting.');
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
      contentBangla: sanitizeInput(post.contentBangla || '', POST_MAX_LENGTH),
      arabicVerse: post.arabicVerse ? sanitizeInput(post.arabicVerse, POST_MAX_LENGTH) : undefined,
      translation: post.translation ? sanitizeInput(post.translation, POST_MAX_LENGTH) : undefined,
      privacy: post.privacy || 'public',
      status: post.status || 'approved',
      createdAtMillis: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Guard against Firestore's 1 MB document limit (e.g., if a huge video Data URL was attached)
    const approxBytes = JSON.stringify(payload).length;
    if (approxBytes > 950_000) {
      if (Array.isArray(payload.mediaUrls) && payload.mediaUrls.length > 1) {
        // Keep as many compressed photos as fit comfortably under 900 KB
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
  _postAuthorName?: string
): Promise<boolean> {
  if (!isCurrentUserVerifiedForPosting()) {
    console.warn('Security Block: Email verification required before commenting.');
    return false;
  }

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
    if (!postSnap || !postSnap.exists()) return false;

    const existingComments: PostComment[] = postSnap.data().comments || [];
    const updatedComments = [safeComment, ...existingComments];

    await updateDoc(postRef, {
      comments: updatedComments,
      updatedAt: new Date().toISOString(),
    });

    // Also write to subcollection for individual snapshot listener
    const commentDocRef = doc(db, `posts/${postId}/comments`, safeComment.id);
    await setDoc(commentDocRef, {
      ...safeComment,
      createdAt: new Date().toISOString(),
    });

    // Trigger instant notification to author
    await sendRealtimeNotification({
      id: `notif-${Date.now()}`,
      type: 'comment',
      avatar: safeComment.avatar,
      title: `${safeComment.author} আপনার পোস্টে মন্তব্য করেছেন`,
      subtitle: `"${safeComment.text.length > 35 ? safeComment.text.slice(0, 35) + '...' : safeComment.text}"`,
      timeAgo: 'Just now',
      isUnread: true,
      badgeType: 'comment',
      postId,
    });

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

    if (!postSnap || !postSnap.exists()) return false;
    const data = postSnap.data();

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

    await updateDoc(postRef, {
      reactions: updatedReactions,
      userReaction: nextReaction,
      updatedAt: new Date().toISOString(),
    });

    if (!isSame) {
      // Send realtime notification
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
        avatar: userAvatar,
        title: `${userName} আপনার পোস্টে ${reactionBangla[reaction] || 'রিয়েক্ট দিয়েছেন'}`,
        subtitle: 'আপনার পোস্টের সাথে যুক্ত থাকুন',
        timeAgo: 'Just now',
        isUnread: true,
        badgeType: 'like',
        postId,
      });
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
  onUpdate: (notifications: NotificationItem[]) => void,
  onError?: (error: any) => void
) {
  try {
    const notifsRef = collection(db, 'notifications');
    const q = query(notifsRef, limit(40));

    return onSnapshot(
      q,
      (snapshot) => {
        const liveNotifs: NotificationItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          liveNotifs.push({
            id: docSnap.id,
            type: data.type || 'general',
            from: data.from,
            to: data.to,
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
          });
        });

        if (liveNotifs.length > 0) {
          liveNotifs.sort((a, b) => {
            const timeA = (a as any).createdAtMillis || 0;
            const timeB = (b as any).createdAtMillis || 0;
            return timeB - timeA;
          });
          onUpdate(liveNotifs);
        }
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
        const ids = snap.docs.map((d) => d.data().targetId);
        onUpdate(ids);
      },
      () => onUpdate([])
    );
  } catch {
    onUpdate([]);
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

    try {
      const userRef = doc(db, 'users', res.user.uid);
      const latinFromName = transliterateBnToEn(cleanName).replace(/[^a-z0-9]+/g, '');
      const generatedUsername =
        latinFromName ||
        (res.user.email ? res.user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : `user${res.user.uid.slice(0, 6)}`);
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
          emailOtpVerified: true,
          friendsCount: 0,
          avatar:
            res.user.photoURL ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=1877f2,0ea5e9,3b82f6`,
          createdAt: new Date().toISOString(),
          createdAtMillis: Date.now(),
        },
        { merge: true }
      );
      cachedDirectoryUsers = null;
    } catch (err) {
      console.warn('Saving user doc notice:', err);
    }

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
    await setDoc(
      userRef,
      {
        id: targetId,
        uid: targetId,
        name: cleanName,
        displayName: cleanName,
        transliteratedName: cleanName ? transliterateBnToEn(cleanName) : '',
        ...(resolvedUsername ? { username: resolvedUsername } : {}),
        email: profile.email || auth.currentUser?.email || '',
        avatar: profile.avatar || '',
        coverPhoto: profile.coverPhoto || '',
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
): Promise<(Partial<UserProfile> & { emailOtpVerified?: boolean }) | null> {
  if (!uid) return null;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDocSafe(userRef);
    if (!snap || !snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      name: data.name || data.displayName,
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
      emailOtpVerified: data.emailOtpVerified === true,
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
    .replace(/chh/g, 'ch')
    .replace(/sh/g, 's')
    .replace(/th/g, 't')
    .replace(/dh/g, 'd')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/ou/g, 'o')
    .replace(/([a-z])\1+/g, '$1')
    .replace(/[aeiou]+/g, (m, offset) => (offset === 0 ? m[0] : 'a'))
    .trim();
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

let cachedDirectoryUsers: { users: SearchedUserProfile[]; fetchedAt: number } | null = null;
const USER_DIRECTORY_CACHE_TTL_MS = 20 * 1000;

export async function syncUserDirectoryProfile(
  uid: string,
  displayName: string,
  email: string,
  avatar: string
): Promise<void> {
  if (!uid || !displayName.trim()) return;
  const userRef = doc(db, 'users', uid);
  try {
    const existingSnap = await getDocSafe(userRef);
    const existingData = existingSnap && existingSnap.exists() ? existingSnap.data() : null;
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
      existingUsername ||
      transliterated.replace(/[^a-z0-9]+/g, '') ||
      (email ? email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '') : '');

    await setDoc(
      userRef,
      {
        id: uid,
        uid,
        displayName: finalName,
        name: finalName,
        transliteratedName: transliterated,
        username: derivedUsername,
        avatar: existingData?.avatar || existingData?.photoURL || avatar,
        ...(existingData?.profileCategory ? { profileCategory: existingData.profileCategory } : {}),
        ...(existingData?.friendsCount === undefined ? { friendsCount: 0 } : {}),
        ...(email && !existingData?.email ? { email } : {}),
        updatedAt: new Date().toISOString(),
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
}

async function fetchDirectoryUsersFromServer(): Promise<SearchedUserProfile[]> {
  const byId = new Map<string, SearchedUserProfile>();

  const usersSnap = await getDocs(query(collection(db, 'users'), limit(1000))).catch((err) => {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.LIST, 'users');
    }
    return null;
  });

  (usersSnap?.docs || []).forEach((docSnap) => {
    const data = docSnap.data();
    const displayName = String(data.displayName || data.name || 'Peaceverse User').trim();
    const emailLocal = data.email ? String(data.email).split('@')[0] : '';
    const username = String(data.username || data.handle || emailLocal || '').trim();
    const avatar =
      String(data.avatar || data.photoURL || '').trim() ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        displayName
      )}&backgroundColor=1877f2,0ea5e9,3b82f6`;

    byId.set(docSnap.id, {
      id: docSnap.id,
      uid: String(data.uid || docSnap.id),
      displayName,
      username,
      avatar,
      coverPhoto: data.coverPhoto ? String(data.coverPhoto) : undefined,
      bio: data.bio ? String(data.bio) : undefined,
      location: data.location ? String(data.location) : undefined,
      verified: Boolean(data.verified || data.isVerified),
    });
  });

  // Fallback: also index active creators from recent posts in case a profile doc hasn't synced yet
  const postsSnap = await getDocs(query(collection(db, 'posts'), limit(200))).catch(() => null);
  (postsSnap?.docs || []).forEach((pDoc) => {
    const pData = pDoc.data();
    const aName = String(pData?.author?.name || '').trim();
    const aId = String(pData?.authorId || (aName ? `author-${aName}` : '')).trim();
    if (!aName || !aId || byId.has(aId)) return;
    const sameNameExists = Array.from(byId.values()).some(
      (u) => u.displayName.toLowerCase() === aName.toLowerCase()
    );
    if (sameNameExists) return;
    byId.set(aId, {
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

  return Array.from(byId.values());
}

export async function searchUsersFromFirestore(
  searchTerm: string,
  forceRefresh = false
): Promise<SearchedUserProfile[]> {
  const rawTrimmed = searchTerm.normalize('NFC').trim();
  const q = rawTrimmed.toLowerCase();
  if (!q) return [];

  const qTranslit = transliterateBnToEn(rawTrimmed);
  const qPhonetic = phoneticNormalize(rawTrimmed);
  const qTokens = qTranslit.split(/\s+/).filter(Boolean);
  const qPhoneticTokens = qPhonetic.split(/\s+/).filter(Boolean);

  const matchesCandidate = (u: SearchedUserProfile): boolean => {
    const dn = u.displayName.normalize('NFC').toLowerCase();
    const un = (u.username || '').toLowerCase();
    if (dn.includes(q) || un.includes(q)) return true;

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

    return false;
  };

  try {
    const now = Date.now();
    let directoryUsers: SearchedUserProfile[] = [];

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

    let matched = directoryUsers.filter(matchesCandidate);

    // If cached search returned 0 results, bypass cache immediately once so newly created accounts are found right away
    if (matched.length === 0 && !forceRefresh) {
      directoryUsers = await fetchDirectoryUsersFromServer();
      cachedDirectoryUsers = { users: directoryUsers, fetchedAt: Date.now() };
      matched = directoryUsers.filter(matchesCandidate);
    }

    // Also check current logged-in local user if somehow not yet indexed in server snapshot
    try {
      const currentAuth = auth.currentUser;
      const savedName = localStorage.getItem('peaceverse_registered_name');
      if (currentAuth) {
        const localName = (currentAuth.displayName || savedName || '').trim();
        if (localName && !matched.some((m) => m.id === currentAuth.uid)) {
          const selfCandidate: SearchedUserProfile = {
            id: currentAuth.uid,
            uid: currentAuth.uid,
            displayName: localName,
            username: transliterateBnToEn(localName).replace(/[^a-z0-9]+/g, ''),
            avatar:
              currentAuth.photoURL ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                localName
              )}&backgroundColor=1877f2,0ea5e9,3b82f6`,
          };
          if (matchesCandidate(selfCandidate)) {
            matched.unshift(selfCandidate);
          }
        }
      }
    } catch {}

    // Prioritize exact and prefix matches
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

      return aName.localeCompare(bName);
    });

    return matched;
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

export async function syncPageToFirestore(page: PageItem, ownerUid?: string): Promise<void> {
  if (!page?.id || !page?.name?.trim()) return;
  try {
    const cleanName = page.name.trim();
    const resolvedOwnerUid = ownerUid || auth.currentUser?.uid || '';
    const payload: Record<string, any> = {
      id: page.id,
      name: cleanName,
      transliteratedName: transliterateBnToEn(cleanName),
      category: page.category || 'Community',
      likes: page.likes || '0 লাইক',
      followersCount: typeof page.followersCount === 'number' ? page.followersCount : 1,
      followingCount: typeof page.followingCount === 'number' ? page.followingCount : 0,
      avatar: trimOversizedImageForFirestore(page.avatar),
      cover: trimOversizedImageForFirestore(page.cover),
      description: page.description || '',
      bio: page.bio || '',
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
      description: String(data.description || ''),
      bio: String(data.bio || ''),
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
      description: String(data.description || existing?.description || ''),
      bio: String(data.bio || existing?.bio || ''),
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


