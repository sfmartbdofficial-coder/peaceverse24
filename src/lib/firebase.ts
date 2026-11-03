import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { PostItem, PostComment, NotificationItem, ReactionType } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with configured databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

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
    if (err?.message?.includes('the client is offline')) {
      console.warn('Peace World: Firestore offline mode active.');
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

// Seed initial posts to Firestore if collection is empty
export async function seedInitialPostsIfEmpty(initialPosts: PostItem[]) {
  try {
    const postsRef = collection(db, 'posts');
    const snapshot = await getDocs(postsRef);
    if (snapshot.empty && initialPosts.length > 0) {
      for (let i = 0; i < Math.min(initialPosts.length, 6); i++) {
        const post = initialPosts[i];
        const postDocRef = doc(db, 'posts', post.id);
        await setDoc(
          postDocRef,
          {
            ...post,
            privacy: post.privacy || 'public',
            status: post.status || 'approved',
            createdAtMillis: Date.now() - i * 1000 * 60 * 30, // staggered time
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
      console.log('Peace World: Initial posts seeded to Firestore.');
    }
  } catch (err) {
    console.warn('Seed posts warning:', err);
  }
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
  } catch (err) {
    console.error('Error creating realtime post:', err);
    return false;
  }
}

// Add comment in real-time
export async function addRealtimeComment(
  postId: string,
  comment: PostComment,
  postAuthorName?: string
): Promise<boolean> {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    let existingComments: PostComment[] = [];
    if (postSnap.exists()) {
      existingComments = postSnap.data().comments || [];
    }

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
  } catch (err) {
    console.error('Error adding realtime comment:', err);
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
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) return false;
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

    const newTotal = Math.max(0, (currentReactions.total || 0) + diff);
    const updatedReactions = {
      ...currentReactions,
      total: newTotal,
      likeCount: Math.max(0, (currentReactions.likeCount || 0) + diff),
    };

    await updateDoc(postRef, {
      reactions: updatedReactions,
      userReaction: nextReaction,
      updatedAt: new Date().toISOString(),
    });

    if (!isSame) {
      // Send realtime notification
      const reactionBangla: Record<ReactionType, string> = {
        like: 'লাইক দিয়েছেন',
        love: 'লাভ দিয়েছেন',
        subhanallah: 'সুবহানাল্লাহ বলেছেন',
        mashaallah: 'মাশাআল্লাহ বলেছেন',
        care: 'কেয়ার রিয়েক্ট দিয়েছেন',
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
  } catch (err) {
    console.error('Error toggling realtime reaction:', err);
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
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return;

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
  } catch (err) {
    console.error('Error updating post privacy:', err);
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
  } catch (err) {
    console.error('Error moderating post:', err);
    return false;
  }
}

// Delete post
export async function deleteRealtimePost(postId: string): Promise<boolean> {
  try {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    return true;
  } catch (err) {
    console.error('Error deleting post:', err);
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
  } catch (err) {
    console.error('Error submitting appeal:', err);
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
            avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
            title: data.title || '',
            subtitle: data.subtitle,
            timeAgo: data.timeAgo || 'Just now',
            isUnread: data.isUnread ?? true,
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
    await setDoc(notifRef, {
      ...notification,
      createdAtMillis: Date.now(),
      createdAt: new Date().toISOString(),
    });

    // Sound chime & browser push
    playNotificationSound();
    triggerPushNotification(notification.title, {
      body: notification.subtitle,
    });
  } catch (err) {
    console.error('Error sending notification:', err);
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { isUnread: false });
  } catch (err) {
    console.error('Error marking notification read:', err);
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
  } catch (err) {
    console.error('Error marking all notifications read:', err);
  }
}
