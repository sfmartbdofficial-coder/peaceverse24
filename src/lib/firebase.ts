import { initializeApp, getApps, getApp } from 'firebase/app';
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
import defaultFirebaseConfig from '../../firebase-applet-config.json';
import { PostItem, PostComment, NotificationItem, ReactionType, UserProfile } from '../types';

// Support both Cloudflare/Vite environment variables (VITE_FIREBASE_*) and fallback to firebase-applet-config.json
const resolvedFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_DATABASE_ID ||
    defaultFirebaseConfig.firestoreDatabaseId ||
    '(default)',
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(resolvedFirebaseConfig);

// Initialize Firestore with specific database ID and auto-long-polling for reliable iframe/mobile connections
export const db = (() => {
  try {
    return initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true,
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
    console.log('Peace World: Connected to Firestore successfully.');
    return true;
  } catch (err: any) {
    if (
      err?.message?.includes('the client is offline') ||
      err?.code === 'unavailable' ||
      err?.message?.includes('unavailable')
    ) {
      console.warn('Peace World: Firestore offline mode active. App working seamlessly.');
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
              name: data.authorName || 'Peace World User',
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

// Create a new post in Firestore with Real-time push
export async function createRealtimePost(post: PostItem): Promise<boolean> {
  try {
    const postRef = doc(db, 'posts', post.id);
    await setDoc(postRef, {
      ...post,
      privacy: post.privacy || 'public',
      status: post.status || 'approved',
      createdAtMillis: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
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
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDocSafe(postRef);
    if (!postSnap || !postSnap.exists()) return false;

    const existingComments: PostComment[] = postSnap.data().comments || [];
    const updatedComments = [comment, ...existingComments];

    await updateDoc(postRef, {
      comments: updatedComments,
      updatedAt: new Date().toISOString(),
    });

    // Also write to subcollection for individual snapshot listener
    const commentDocRef = doc(db, `posts/${postId}/comments`, comment.id);
    await setDoc(commentDocRef, {
      ...comment,
      createdAt: new Date().toISOString(),
    });

    // Trigger instant notification to author
    await sendRealtimeNotification({
      id: `notif-${Date.now()}`,
      type: 'comment',
      avatar: comment.avatar,
      title: `${comment.author} আপনার পোস্টে মন্তব্য করেছেন`,
      subtitle: `"${comment.text.length > 35 ? comment.text.slice(0, 35) + '...' : comment.text}"`,
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
      title: 'Peace World কনটেন্ট মডারেশন টিম',
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
// REAL-TIME FOLLOW / UNFOLLOW SYSTEM
// ==========================================

export async function toggleFollowUser(
  followerId: string,
  followerName: string,
  followerAvatar: string,
  targetId: string,
  targetName: string,
  targetAvatar: string
): Promise<boolean> {
  try {
    const followDocId = `${followerId}_${targetId}`;
    const followRef = doc(db, 'follows', followDocId);
    const snap = await getDocSafe(followRef);

    if (snap && snap.exists()) {
      await deleteDoc(followRef);
      return false; // Unfollowed
    } else {
      await setDoc(followRef, {
        id: followDocId,
        followerId,
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

      return true; // Followed
    }
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, `follows/${followerId}_${targetId}`);
    } else if (!isOfflineOrUnavailableError(err)) {
      console.warn('Notice toggling follow:', err);
    }
    return false;
  }
}

export function subscribeToFollowStatus(
  followerId: string,
  targetId: string,
  onUpdate: (isFollowing: boolean) => void
) {
  try {
    const followDocId = `${followerId}_${targetId}`;
    const followRef = doc(db, 'follows', followDocId);
    return onSnapshot(
      followRef,
      (snap) => {
        onUpdate(snap.exists());
      },
      () => onUpdate(false)
    );
  } catch {
    onUpdate(false);
    return () => {};
  }
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
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    console.error('Google Sign-In Error:', err);
    throw err;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser | null> {
  const res = await signInWithEmailAndPassword(auth, email, pass);
  return res.user;
}

export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<FirebaseUser | null> {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  if (res.user) {
    const cleanName = displayName.trim() || email.split('@')[0];
    try {
      await updateProfile(res.user, {
        displayName: cleanName,
      });
    } catch (e) {
      console.warn('updateProfile notice:', e);
    }

    try {
      localStorage.setItem('peaceverse_registered_name', cleanName);
    } catch {}

    try {
      const userRef = doc(db, 'users', res.user.uid);
      await setDoc(
        userRef,
        {
          uid: res.user.uid,
          displayName: cleanName,
          email: res.user.email,
          createdAt: new Date().toISOString(),
          createdAtMillis: Date.now(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Saving user doc notice:', err);
    }

    await sendEmailVerification(res.user).catch(() => {});
  }
  return res.user;
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// ==========================================
// USER PROFILE & SOCIAL CONTACT PERSISTENCE
// ==========================================

export async function saveUserProfileToFirestore(profile: UserProfile): Promise<boolean> {
  const targetId = auth.currentUser?.uid || profile.id || 'user-me';
  try {
    const userRef = doc(db, 'users', targetId);
    await setDoc(
      userRef,
      {
        id: targetId,
        uid: targetId,
        name: profile.name,
        displayName: profile.name,
        email: profile.email || auth.currentUser?.email || '',
        avatar: profile.avatar || '',
        coverPhoto: profile.coverPhoto || '',
        bio: profile.bio || '',
        location: profile.location || '',
        hometown: profile.hometown || '',
        work: profile.work || '',
        education: profile.education || '',
        relationship: profile.relationship || '',
        website: profile.website || '',
        thoughtBubble: profile.thoughtBubble || '',
        whatsapp: profile.whatsapp || '',
        imo: profile.imo || '',
        viber: profile.viber || '',
        messengerLink: profile.messengerLink || '',
        contactPrivacy: profile.contactPrivacy || 'public',
        hobbies: profile.hobbies || [],
        updatedAt: new Date().toISOString(),
        updatedAtMillis: Date.now(),
      },
      { merge: true }
    );
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

export async function fetchUserProfileFromFirestore(uid: string): Promise<Partial<UserProfile> | null> {
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
      hobbies: Array.isArray(data.hobbies) ? data.hobbies : undefined,
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

