export type ReactionType = 'like' | 'love' | 'subhanallah' | 'mashaallah' | 'care' | 'sad';

export type FacebookMainTab =
  | 'home'
  | 'reels'
  | 'friends'
  | 'marketplace'
  | 'notifications'
  | 'menu'
  | 'profile'
  | 'saved'
  | 'groups'
  | 'pages'
  | 'memories';

export interface PostComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timeAgo: string;
  likes: number;
  isLiked?: boolean;
}

export interface PostItem {
  id: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
    subtitle?: string;
  };
  timeAgo: string;
  isPublic: boolean;
  privacy?: 'public' | 'friends' | 'private';
  status?: 'approved' | 'blocked' | 'rejected';
  moderationReason?: string;
  appealStatus?: 'none' | 'pending' | 'resolved';
  authorId?: string;
  contentBangla: string;
  arabicVerse?: string;
  translation?: string;
  reference?: string;
  mediaType?: 'video' | 'image' | 'verseCard' | 'none';
  mediaUrl?: string;
  youtubeId?: string;
  duration?: string;
  isLive?: boolean;
  category: 'Quran' | 'Hadith' | 'Dua' | 'Lecture' | 'Nasheed' | 'Community' | 'Live' | 'Global Ummah';
  reactions: {
    total: number;
    likeCount: number;
    loveCount: number;
    subhanallahCount: number;
    mashaallahCount: number;
    careCount?: number;
    sadCount?: number;
  };
  userReaction?: ReactionType | null;
  comments: PostComment[];
  sharesCount: number;
  isSaved?: boolean;
  bgGradient?: string; // For colorful Facebook text posts!
  location?: string;
  feeling?: string;
  taggedFriends?: string[];
  typingUsers?: { id: string; name: string }[];
  goldenGiftsCount?: number;
  goldenGiftsAmount?: number;
}

export interface StoryItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  bgGradient: string;
  previewImage?: string;
  arabicText?: string;
  banglaText: string;
  timestamp: string;
  hasSeen?: boolean;
}

export interface FriendRequest {
  id: string;
  name: string;
  avatar: string;
  timeAgo: string;
  mutualFriend?: string;
  status: 'pending' | 'confirmed' | 'deleted';
}

export interface NotificationItem {
  id: string;
  type:
    | 'friend_request'
    | 'page_views'
    | 'page_posts'
    | 'follow'
    | 'general'
    | 'like'
    | 'comment'
    | 'share'
    | 'moderation'
    | 'new_post'
    | 'broadcast';
  avatar: string;
  title: string;
  subtitle?: string;
  image?: string;
  link?: string;
  from?: string;
  to?: string;
  read?: boolean;
  timeAgo: string;
  isUnread: boolean;
  badgeType?: 'friend' | 'page' | 'heart' | 'bell' | 'like' | 'comment' | 'shield' | 'broadcast';
  requestData?: FriendRequest;
  postId?: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  price: string;
  location: string;
  image: string;
  sellerName: string;
  category: string;
}

export interface IslamicGroup {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  membersCount: string;
  description: string;
  postsPerDay: string;
  isJoined: boolean;
  category: string;
  rules?: string[];
  privacy?: 'public' | 'private';
}

export interface PageItem {
  id: string;
  name: string;
  category: string;
  likes: string;
  followersCount: number;
  followingCount?: number;
  followedBy?: string[];
  avatar: string;
  cover: string;
  views?: string;
  role?: string;
  isOwner?: boolean;
  isLiked?: boolean;
  description: string;
  bio?: string;
  phone?: string;
  whatsapp?: string;
  imo?: string;
  viber?: string;
  website?: string;
  websites?: string[];
  email?: string;
  location?: string;
  rating?: string;
  actionButton?: string;
  actionUrl?: string;
  hours?: string;
  createdAt?: string;
  posts?: PostItem[];
}

export interface ChatMessage {
  id: string;
  sender: 'them' | 'me';
  text: string;
  time: string;
}

export interface ChatFriend {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  lastSeen?: string;
  unreadCount?: number;
  messages: ChatMessage[];
}

export interface UserProfile {
  id?: string;
  email?: string;
  name: string;
  avatar: string;
  coverPhoto: string;
  friendsCount: number;
  followersCount?: number;
  followingCount?: number;
  isCreator?: boolean;
  isFollowing?: boolean;
  location: string;
  birthDate: string;
  thoughtBubble?: string;
  bio?: string;
  work?: string;
  education?: string;
  hometown?: string;
  relationship?: string;
  website?: string;
  whatsapp?: string;
  imo?: string;
  viber?: string;
  messengerLink?: string;
  contactPrivacy?: 'public' | 'friends' | 'private';
  hobbies?: string[];
  goldenCoins?: number;
  earnedCoins?: number;
}

export interface GoldenGiftTransaction {
  id: string;
  postId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId?: string;
  receiverName?: string;
  amount: number;
  message?: string;
  createdAt: string;
}

export interface GoldenCashoutRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userPhone?: string;
  coinsAmount: number;
  moneyAmount: number; // In BDT
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'bank' | 'paypal' | 'payoneer';
  accountNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
}

// Backward compatibility types
export type CategoryType =
  | 'All'
  | 'Quran'
  | 'Hadith'
  | 'Dua'
  | 'Video'
  | 'Nasheed'
  | 'Live'
  | 'Kids'
  | 'Seerah';

export interface ChannelInfo {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  subscribers: string;
  isSubscribed?: boolean;
  notificationSetting?: 'all' | 'personalized' | 'none';
}

export interface IslamicVideo {
  id: string;
  title: string;
  titleBangla: string;
  category: CategoryType;
  duration: string;
  views: string;
  timestamp: string;
  thumbnail: string;
  youtubeId: string;
  channel: ChannelInfo;
  description: string;
  arabicSnippet?: string;
  translationSnippet?: string;
  reference?: string;
  tags: string[];
  likes: string;
  isShort?: boolean;
  isLive?: boolean;
}

export interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timeAgo: string;
  likes: number;
  isLiked?: boolean;
  heartByCreator?: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  videoIds: string[];
  updatedAt: string;
  isPrivate: boolean;
}
