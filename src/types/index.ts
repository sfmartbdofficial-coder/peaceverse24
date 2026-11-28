export type ReactionType = 'like' | 'love' | 'subhanallah' | 'mashaallah' | 'care' | 'sad';

export type FacebookMainTab =
  | 'home'
  | 'reels'
  | 'shorts'
  | 'live'
  | 'friends'
  | 'marketplace'
  | 'notifications'
  | 'menu'
  | 'profile'
  | 'saved'
  | 'groups'
  | 'pages'
  | 'feeds'
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
  authorConnectionMode?: 'friend' | 'add_friend' | 'follow_only';
  contentBangla: string;
  arabicVerse?: string;
  translation?: string;
  reference?: string;
  mediaType?: 'video' | 'image' | 'verseCard' | 'none';
  mediaUrl?: string;
  mediaUrls?: string[];
  youtubeId?: string;
  duration?: string;
  durationSeconds?: number;
  videoKind?: 'reel' | 'long';
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
  createdAtMillis?: number;
  musicTitle?: string;
  aiLabeled?: boolean;
  sharedGroups?: string[];
  isFreshUpload?: boolean;
  thumbnailUrl?: string;
  viewsCount?: number;
  hashtags?: string[];
  channelSubscribers?: number;
  isShort?: boolean;
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
  isPublished?: boolean;
  status?: 'active' | 'deactivated' | 'pending_deletion';
  deletionScheduledAt?: string;
  deletionExecuteAt?: number;
  ownerUid?: string;
  ownerEmail?: string;
  ownerName?: string;
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
  username?: string;
  profileCategory?: string;
  avatar: string;
  coverPhoto: string;
  friendsCount: number;
  followersCount?: number;
  followingCount?: number;
  isCreator?: boolean;
  isFollowing?: boolean;
  verified?: boolean;
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
  beansBalance?: number;
  nidVerification?: NidVerificationData;
  blockedUserIds?: string[];
  accountStatus?: 'active' | 'deactivated' | 'pending_deletion';
  deletionScheduledAt?: string;
  deletionExecuteAt?: number;
}

export interface SearchedUserProfile {
  id: string;
  uid: string;
  displayName: string;
  username?: string;
  avatar: string;
  coverPhoto?: string;
  bio?: string;
  location?: string;
  verified?: boolean;
  allowFriendRequests?: boolean;
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
  moneyAmount: number; // In BDT or USD
  currency?: 'BDT' | 'USD';
  paymentMethod:
    | 'bkash'
    | 'nagad'
    | 'rocket'
    | 'bank'
    | 'paypal'
    | 'payoneer'
    | 'visa_mastercard'
    | 'google_play'
    | 'apple_pay';
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

export interface NidVerificationData {
  status: 'unverified' | 'pending' | 'verified';
  fullName: string;
  nidNumber: string;
  dateOfBirth: string;
  isAdult18Plus: boolean;
  frontImageUrl?: string;
  backImageUrl?: string;
  verifiedAt?: string;
}

export interface PeaceLiveSeat {
  seatIndex: number; // 0 = Big Host, 1..5 = Small Guests
  role: 'host' | 'guest';
  userId?: string;
  userName?: string;
  userAvatar?: string;
  micOn?: boolean;
  camOn?: boolean;
  beansEarned?: number;
}

export interface PeaceLiveChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  isGift?: boolean;
  giftName?: string;
  giftIcon?: string;
  giftCoins?: number;
  createdAtMillis: number;
}

export interface PeaceLivePkBattle {
  active: boolean;
  startedAtMillis: number;
  endsAtMillis: number; // 5 minutes (300s)
  hostScore: number;
  challengerScore: number;
  challengerName: string;
  challengerAvatar?: string;
}

export interface PeaceLiveRoom {
  id: string;
  title: string;
  category: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  coverImage?: string;
  isLive: boolean;
  status?: 'live' | 'ended';
  viewersCount: number;
  totalBeans: number;
  seats: PeaceLiveSeat[];
  pkBattle?: PeaceLivePkBattle;
  zegoRoomId?: string;
  createdAtMillis: number;
  startedAtMillis?: number;
}

export interface ContentReportRecord {
  id: string;
  targetType: 'video' | 'short' | 'live' | 'user' | 'channel';
  targetId: string;
  targetTitle?: string;
  targetAuthorId?: string;
  targetAuthorName?: string;
  reason: string;
  details?: string;
  reporterId: string;
  reporterName?: string;
  createdAt?: string;
  createdAtMillis?: number;
  status?: 'pending' | 'reviewed' | 'resolved';
}
