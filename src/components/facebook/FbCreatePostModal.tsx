import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Music,
  UserPlus,
  Users,
  MapPin,
  Smile,
  Image as ImageIcon,
  BookOpen,
  Globe,
  Upload,
  Check,
  Star,
  Video,
  Lock,
  ShieldAlert,
  Loader2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Share2,
  PlusCircle,
  Megaphone,
} from 'lucide-react';
import { PostItem, UserProfile } from '../../types';
import { FbBoostPostModal } from './FbBoostPostModal';
import {
  ADULT_BLOCK_MESSAGE,
  checkMediaFilenamesSafe,
  checkMediaVisualSafety,
  checkPost,
} from '../../lib/halalFilter';
import { validateMediaUpload, sanitizeInput } from '../../utils/security';
import {
  classifyVideoDuration,
  compressPostImagesBatch,
  extractVideoMetadataAndFrames,
  MAX_POST_PHOTOS,
} from '../../utils/imageCompress';
import {
  getPendingBlobMetadata,
  uploadDataUrlIfOversized,
  uploadMediaFile,
} from '../../lib/mediaStorage';
import { readLocalFriendsStore } from '../../lib/firebase';

interface FbCreatePostModalProps {
  userProfile: UserProfile;
  isPageAccount?: boolean;
  initialPhoto?: string | null;
  initialPhotos?: string[] | null;
  onClose: () => void;
  onPostCreated: (newPost: PostItem) => Promise<void> | void;
  onOpenLive?: () => void;
}

const getTaggingFriendsList = () =>
  readLocalFriendsStore().map((f) => ({
    id: f.id,
    name: f.name,
    avatar:
      f.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(f.name)}&backgroundColor=1877f2,0ea5e9,3b82f6`,
  }));

const ISLAMIC_FEELINGS = [
  { label: 'feeling grateful', emoji: '😇', bn: 'কৃতজ্ঞ অনুভব করছি' },
  { label: 'saying Alhamdulillah', emoji: '🤲', bn: 'আলহামদুলিল্লাহ' },
  { label: 'feeling blessed', emoji: '✨', bn: 'ধন্য বোধ করছি' },
  { label: 'feeling peaceful', emoji: '🕊️', bn: 'শান্তিময় অনুভব' },
  { label: 'saying SubhanAllah', emoji: '🌸', bn: 'সুবহানাল্লাহ' },
  { label: 'reciting Quran', emoji: '📖', bn: 'কুরআন তিলাওয়াতরত' },
  { label: 'fasting', emoji: '🌙', bn: 'রোজা পালনরত' },
  { label: 'making Dua', emoji: '🤍', bn: 'দোয়ায় মগ্ন' },
];

const LOCATIONS = [
  'লক্ষ্মীপুর - Lakshmipur, Bangladesh',
  'Baitul Mukarram National Mosque, Dhaka',
  'Makkah Al-Mukarramah, Saudi Arabia',
  'Al-Masjid an-Nabawi, Madinah',
  'Lalbagh Fort Mosque, Dhaka',
  'Sylhet Shahi Eidgah, Sylhet',
  'Dhaka, Bangladesh',
];

const QUICK_MUSIC_SUGGESTIONS = [
  {
    id: 'm1',
    title: 'সময় চলে যায়, থেকে যা...',
    thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 'm2',
    title: 'হালাল উপার্জন',
    thumb: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 'm3',
    title: 'সূরা আর-রহমান তিলাওয়াত',
    thumb: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 'm4',
    title: 'আয়াতুল কুরসি তিলাওয়াত',
    thumb: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: 'm5',
    title: 'তাওবার পবিত্র দোয়া',
    thumb: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=100&q=80',
  },
];

const SHAREABLE_GROUPS = [
  { id: 'g1', name: 'Peaceverse24 Global Ummah', members: '48K members' },
  { id: 'g2', name: 'কুরআন ও হাদিস শিক্ষা', members: '32K members' },
  { id: 'g3', name: 'হালাল বিজনেস ও উদ্যোক্তা ফোরাম', members: '19K members' },
  { id: 'g4', name: 'যুব সমাজ ও দাওয়াহ', members: '24K members' },
];

export const FbCreatePostModal: React.FC<FbCreatePostModalProps> = ({
  userProfile,
  isPageAccount = false,
  initialPhoto = null,
  initialPhotos = null,
  onClose,
  onPostCreated,
  onOpenLive,
}) => {
  const [step, setStep] = useState<'compose' | 'options'>('compose');
  const [content, setContent] = useState('');
  const [pendingBoostPost, setPendingBoostPost] = useState<PostItem | null>(null);
  const [showBoostPrompt, setShowBoostPrompt] = useState(false);
  const [showBoostPageModal, setShowBoostPageModal] = useState(false);
  
  // Privacy selector: public | friends | private
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const [showStep2Audience, setShowStep2Audience] = useState(false);

  // Moderation & submission state
  const [isVerifyingHalal, setIsVerifyingHalal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [moderationError, setModerationError] = useState<{ status: string; reason: string } | null>(null);

  // Media / up to 10 Photos or 1 Video from user's device
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>(() => {
    if (Array.isArray(initialPhotos) && initialPhotos.length > 0) {
      return initialPhotos.slice(0, MAX_POST_PHOTOS);
    }
    if (initialPhoto && !initialPhoto.startsWith('data:video/')) {
      return [initialPhoto];
    }
    return [];
  });
  const [selectedVideo, setSelectedVideo] = useState<string | null>(() => {
    if (initialPhoto && (initialPhoto.startsWith('data:video/') || initialPhoto.startsWith('blob:'))) {
      return initialPhoto;
    }
    return null;
  });
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(() =>
    initialPhoto?.startsWith('blob:') ? getPendingBlobMetadata(initialPhoto)?.file || null : null
  );
  const [videoDurationSeconds, setVideoDurationSeconds] = useState<number>(() =>
    initialPhoto?.startsWith('blob:') ? getPendingBlobMetadata(initialPhoto)?.durationSeconds || 0 : 0
  );
  const [videoDurationText, setVideoDurationText] = useState<string>(() =>
    initialPhoto?.startsWith('blob:') ? getPendingBlobMetadata(initialPhoto)?.durationText || '' : ''
  );
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null);
  const [pendingVideoFrames, setPendingVideoFrames] = useState<string[]>(() =>
    initialPhoto?.startsWith('blob:') ? getPendingBlobMetadata(initialPhoto)?.frames || [] : []
  );
  const [pendingFileNames, setPendingFileNames] = useState<string[]>(() => {
    const meta = initialPhoto?.startsWith('blob:') ? getPendingBlobMetadata(initialPhoto) : null;
    return meta?.file?.name ? [meta.file.name] : [];
  });

  // Quran Verse / Hadith
  const [showAyahBox, setShowAyahBox] = useState(false);
  const [arabicText, setArabicText] = useState('');
  const [translationText, setTranslationText] = useState('');

  // Pills & Step 2 options state
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [showStep2MusicSheet, setShowStep2MusicSheet] = useState(false);

  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [showFeelingModal, setShowFeelingModal] = useState(false);

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showGroupsPicker, setShowGroupsPicker] = useState(false);
  const [shareToApps, setShareToApps] = useState(false);
  const [aiLabeled, setAiLabeled] = useState(false);
  const [showAiLearnMore, setShowAiLearnMore] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (Array.isArray(initialPhotos) && initialPhotos.length > 0) {
      setSelectedPhotos(initialPhotos.slice(0, MAX_POST_PHOTOS));
      setSelectedVideo(null);
      setSelectedVideoFile(null);
      setVideoDurationSeconds(0);
      setVideoDurationText('');
      setPendingVideoFrames([]);
    } else if (initialPhoto) {
      if (initialPhoto.startsWith('data:video/') || initialPhoto.startsWith('blob:')) {
        const meta = initialPhoto.startsWith('blob:') ? getPendingBlobMetadata(initialPhoto) : null;
        setSelectedVideo(initialPhoto);
        setSelectedVideoFile(meta?.file || null);
        setVideoDurationSeconds(meta?.durationSeconds || 0);
        setVideoDurationText(meta?.durationText || '');
        setPendingVideoFrames(meta?.frames || []);
        setPendingFileNames(meta?.file?.name ? [meta.file.name] : []);
        setSelectedPhotos([]);
      } else {
        setSelectedPhotos([initialPhoto]);
        setSelectedVideo(null);
        setSelectedVideoFile(null);
        setVideoDurationSeconds(0);
        setVideoDurationText('');
        setPendingVideoFrames([]);
      }
    }
  }, [initialPhoto, initialPhotos]);

  // Real device gallery selection handler (up to 10 compressed photos or 1 video of ANY length)
  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setModerationError(null);

    const nameCheck = checkMediaFilenamesSafe(files);
    if (!nameCheck.safe) {
      setModerationError({
        status: 'blocked',
        reason: nameCheck.reason || ADULT_BLOCK_MESSAGE,
      });
      return;
    }

    const videoFile = files.find(
      (f) =>
        f.type.startsWith('video/') ||
        /\.(mp4|mov|webm|m4v|3gp|mkv|ogg)$/i.test(f.name || '')
    );
    if (videoFile) {
      const check = validateMediaUpload(videoFile, ['video']);
      if (!check.valid) {
        setModerationError({
          status: 'blocked',
          reason: check.error || 'সর্বোচ্চ ২ GB সাইজের ভিডিও আপলোড করা যাবে।',
        });
        return;
      }
      setIsProcessingMedia(true);
      try {
        const meta = await extractVideoMetadataAndFrames(videoFile, 4);
        const visualCheck = await checkMediaVisualSafety({
          mediaDataUrls: meta.frames,
          caption: content,
          fileNames: [videoFile.name],
        });
        if (!visualCheck.safe) {
          setModerationError({
            status: 'blocked',
            reason: visualCheck.reason || ADULT_BLOCK_MESSAGE,
          });
          return;
        }
        const previewBlobUrl = URL.createObjectURL(videoFile);
        setSelectedVideo((prev) => {
          if (prev && prev.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(prev);
            } catch {}
          }
          return previewBlobUrl;
        });
        setSelectedVideoFile(videoFile);
        setVideoDurationSeconds(meta.durationSeconds);
        setVideoDurationText(meta.durationText);
        setPendingVideoFrames(meta.frames);
        setPendingFileNames([videoFile.name]);
        setSelectedPhotos([]);
      } catch {
        setModerationError({
          status: 'error',
          reason: 'ভিডিও ফাইলটি পড়া যায়নি। আবার চেষ্টা করুন।',
        });
      } finally {
        setIsProcessingMedia(false);
      }
      return;
    }

    const remainingSlots = MAX_POST_PHOTOS - selectedPhotos.length;
    if (remainingSlots <= 0) {
      setModerationError({
        status: 'limit',
        reason: `একটি পোস্টে সর্বোচ্চ ${MAX_POST_PHOTOS}টি ছবি যোগ করা যায়। নতুন ছবি যোগ করতে আগে একটি ছবি সরান।`,
      });
      return;
    }

    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setModerationError({
        status: 'blocked',
        reason: 'শুধুমাত্র ছবি বা ভিডিও ফাইল সিলেক্ট করুন।',
      });
      return;
    }

    const acceptedFiles = imageFiles.slice(0, remainingSlots);
    for (const file of acceptedFiles) {
      const check = validateMediaUpload(file, ['image']);
      if (!check.valid) {
        setModerationError({
          status: 'blocked',
          reason: check.error || 'প্রতিটি ছবি সর্বোচ্চ ৫ MB-এর মধ্যে হতে হবে।',
        });
        return;
      }
    }

    setIsProcessingMedia(true);
    try {
      const totalCount = selectedPhotos.length + acceptedFiles.length;
      const compressedUrls = await compressPostImagesBatch(acceptedFiles, totalCount);
      const visualCheck = await checkMediaVisualSafety({
        mediaDataUrls: compressedUrls.slice(0, 3),
        caption: content,
        fileNames: acceptedFiles.map((f) => f.name),
      });
      if (!visualCheck.safe) {
        setModerationError({
          status: 'blocked',
          reason: visualCheck.reason || ADULT_BLOCK_MESSAGE,
        });
        return;
      }
      setSelectedVideo((prev) => {
        if (prev && prev.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(prev);
          } catch {}
        }
        return null;
      });
      setSelectedVideoFile(null);
      setVideoDurationSeconds(0);
      setVideoDurationText('');
      setPendingVideoFrames([]);
      setPendingFileNames((prev) => [...prev, ...acceptedFiles.map((f) => f.name)].slice(0, MAX_POST_PHOTOS));
      setSelectedPhotos((prev) => [...prev, ...compressedUrls].slice(0, MAX_POST_PHOTOS));
      if (imageFiles.length > remainingSlots) {
        setModerationError({
          status: 'limit',
          reason: `একটি পোস্টে সর্বোচ্চ ${MAX_POST_PHOTOS}টি ছবি নেওয়া যায় — প্রথম ${remainingSlots}টি ছবি যোগ করা হয়েছে।`,
        });
      }
    } catch {
      setModerationError({
        status: 'error',
        reason: 'ছবিগুলো প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
      });
    } finally {
      setIsProcessingMedia(false);
    }
  };

  const removePhotoAtIndex = (idx: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPendingFileNames((prev) => prev.filter((_, i) => i !== idx));
    setModerationError(null);
  };

  const toggleFriendTag = (friendName: string) => {
    if (taggedFriends.includes(friendName)) {
      setTaggedFriends(taggedFriends.filter((f: string) => f !== friendName));
    } else {
      setTaggedFriends([...taggedFriends, friendName]);
    }
  };

  const handleSubmit = async () => {
    if (
      (!content.trim() && !arabicText.trim() && selectedPhotos.length === 0 && !selectedVideo) ||
      isVerifyingHalal ||
      isSubmitting ||
      isProcessingMedia
    ) {
      return;
    }

    setIsVerifyingHalal(true);
    setModerationError(null);

    try {
      const combinedText = `${content} ${arabicText || ''} ${translationText || ''}`.trim();
      const filterResult = checkPost(combinedText);

      if (!filterResult.isApproved) {
        setIsVerifyingHalal(false);
        setModerationError({
          status: 'blocked',
          reason: filterResult.reason || ADULT_BLOCK_MESSAGE,
        });
        return;
      }

      const samplesToCheck = selectedVideo
        ? pendingVideoFrames
        : selectedPhotos.slice(0, 3);

      const visualResult = await checkMediaVisualSafety({
        mediaDataUrls: samplesToCheck,
        caption: combinedText,
        fileNames: pendingFileNames,
      });

      setIsVerifyingHalal(false);

      if (!visualResult.safe) {
        setModerationError({
          status: 'blocked',
          reason: visualResult.reason || ADULT_BLOCK_MESSAGE,
        });
        return;
      }

      setIsSubmitting(true);

      let finalVideoUrl: string | undefined = undefined;
      let finalPhotoUrls: string[] = [];

      if (selectedVideoFile) {
        setUploadProgressText('ভিডিও আপলোড হচ্ছে...');
        finalVideoUrl = await uploadMediaFile(selectedVideoFile, {
          mimeType: selectedVideoFile.type || 'video/mp4',
          fileName: selectedVideoFile.name,
          onProgress: (pct) => setUploadProgressText(`ভিডিও আপলোড হচ্ছে (${pct}%)...`),
        });
      } else if (selectedVideo) {
        if (selectedVideo.startsWith('blob:')) {
          setUploadProgressText('ভিডিও আপলোড হচ্ছে...');
          const blobResp = await fetch(selectedVideo);
          const blob = await blobResp.blob();
          finalVideoUrl = await uploadMediaFile(blob, {
            mimeType: blob.type || 'video/mp4',
            onProgress: (pct) => setUploadProgressText(`ভিডিও আপলোড হচ্ছে (${pct}%)...`),
          });
        } else if (selectedVideo.startsWith('data:')) {
          setUploadProgressText('ভিডিও আপলোড হচ্ছে...');
          finalVideoUrl = await uploadDataUrlIfOversized(selectedVideo, 'video', true);
        } else {
          finalVideoUrl = selectedVideo;
        }
      } else if (selectedPhotos.length > 0) {
        setUploadProgressText('ছবি আপলোড হচ্ছে...');
        const forceCloudUpload = selectedPhotos.length > 2;
        finalPhotoUrls = (
          await Promise.all(
            selectedPhotos.map((photoSrc) =>
              uploadDataUrlIfOversized(photoSrc, 'image', forceCloudUpload)
            )
          )
        ).filter(Boolean);
      }

      const privacyIcons: Record<'public' | 'friends' | 'private', string> = {
        public: '🌐',
        friends: '👥',
        private: '🔒',
      };

      const hasQuranVerse = filterResult.isQuranVerse || !!arabicText.trim();
      const finalArabic = arabicText.trim() || (filterResult.isQuranVerse ? content.trim() : undefined);

      const videoClass = finalVideoUrl ? classifyVideoDuration(videoDurationSeconds) : null;
      const nowMillis = Date.now();
      const newPost: PostItem = {
        id: `post-${nowMillis}`,
        authorId: userProfile.id || userProfile.name,
        author: {
          name: userProfile.name,
          avatar: userProfile.avatar,
          verified: true,
          subtitle: `Just now • ${privacyIcons[privacy]}`,
        },
        timeAgo: 'Just now',
        createdAtMillis: nowMillis,
        isFreshUpload: true,
        isPublic: privacy === 'public',
        privacy,
        status: 'approved',
        contentBangla: sanitizeInput(content.trim()),
        arabicVerse: finalArabic ? sanitizeInput(finalArabic) : undefined,
        translation: translationText.trim() ? sanitizeInput(translationText.trim()) : undefined,
        mediaType: finalVideoUrl
          ? 'video'
          : finalPhotoUrls.length > 0
          ? 'image'
          : hasQuranVerse
          ? 'verseCard'
          : 'none',
        mediaUrl: finalVideoUrl || finalPhotoUrls[0] || undefined,
        mediaUrls: finalPhotoUrls.length > 0 ? finalPhotoUrls : undefined,
        duration: finalVideoUrl ? videoDurationText || undefined : undefined,
        durationSeconds:
          finalVideoUrl && videoDurationSeconds > 0
            ? Math.round(videoDurationSeconds)
            : undefined,
        videoKind: videoClass ? videoClass.kind : undefined,
        category: hasQuranVerse ? 'Quran' : 'Community',
        location: selectedLocation || undefined,
        feeling: selectedFeeling || undefined,
        taggedFriends: taggedFriends.length > 0 ? taggedFriends : undefined,
        musicTitle: selectedMusic || undefined,
        aiLabeled: aiLabeled || undefined,
        sharedGroups: selectedGroups.length > 0 ? selectedGroups : undefined,
        reactions: {
          total: 0,
          likeCount: 0,
          loveCount: 0,
          subhanallahCount: 0,
          mashaallahCount: 0,
        },
        userReaction: null,
        comments: [],
        sharesCount: 0,
        isSaved: false,
      };

      if (isPageAccount) {
        setPendingBoostPost(newPost);
        setShowBoostPrompt(true);
        return;
      }

      await onPostCreated(newPost);

      if (shareToApps && typeof navigator !== 'undefined' && navigator.share) {
        navigator
          .share({
            title: `${userProfile.name} on PeaceVerse`,
            text: newPost.contentBangla || 'নতুন পোস্ট দেখুন PeaceVerse24.com এ',
            url: window.location.href,
          })
          .catch(() => {});
      }
    } catch (err: any) {
      setModerationError({
        status: 'error',
        reason: err?.message || 'পোস্ট প্রকাশ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
      });
    } finally {
      setIsVerifyingHalal(false);
      setIsSubmitting(false);
      setUploadProgressText(null);
    }
  };

  const hasMedia = selectedPhotos.length > 0 || Boolean(selectedVideo);
  const canSubmit =
    Boolean(content.trim() || arabicText.trim() || hasMedia) &&
    !isVerifyingHalal &&
    !isSubmitting &&
    !isProcessingMedia;

  const handleGoNextStep = () => {
    if (!canSubmit) return;
    setModerationError(null);
    setShowMusicPicker(false);
    setShowTagModal(false);
    setShowLocationModal(false);
    setShowFeelingModal(false);
    setShowPrivacyMenu(false);
    setStep('options');
  };

  if (step === 'options') {
    const audienceLabel =
      privacy === 'public' ? 'Public' : privacy === 'friends' ? 'Friends' : 'Only Me';

    return (
      <div className="fixed inset-0 z-50 h-[100dvh] max-h-[100dvh] overflow-hidden bg-white text-[#050505] flex flex-col animate-in fade-in font-sans">
        {/* Step 2 Top Header: [ < ]  "New post" */}
        <div className="shrink-0 flex items-center justify-between px-3 py-3 border-b border-[#E4E6EB] bg-white">
          <button
            type="button"
            onClick={() => setStep('compose')}
            className="p-1.5 rounded-full text-[#050505] hover:bg-[#F0F2F5] transition-colors cursor-pointer"
            title="পিছনে যান"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>

          <h1 className="text-[17px] font-bold text-[#050505]">New post</h1>

          <div className="w-9" aria-hidden="true" />
        </div>

        {/* Step 2 Scrollable Options Matching Screenshot 1 */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y bg-white divide-y divide-[#E4E6EB]">
          {/* Media / Post Preview (full uncropped view + freely scrollable) */}
          <div className="px-4 py-3.5 bg-white">
            {selectedVideo ? (
              <div className="w-full max-w-[380px] mx-auto rounded-2xl overflow-hidden border border-[#E4E6EB] bg-[#F0F2F5]">
                <video src={selectedVideo} controls className="w-full h-auto max-h-[420px] object-contain mx-auto" />
                {videoDurationSeconds > 0 && (
                  <div className="px-3 py-1.5 bg-white border-t border-[#E4E6EB] flex items-center justify-between text-[11px] font-bold">
                    <span className={classifyVideoDuration(videoDurationSeconds).kind === 'long' ? 'text-emerald-700' : 'text-[#0866FF]'}>
                      {classifyVideoDuration(videoDurationSeconds).badgeText}
                    </span>
                    <span className="text-[#65676B]">XXX/অশ্লীলতা নিষিদ্ধ</span>
                  </div>
                )}
              </div>
            ) : selectedPhotos.length === 1 ? (
              <div className="w-full max-w-[380px] mx-auto rounded-2xl overflow-hidden border border-[#E4E6EB] bg-[#F7F8FA]">
                <img
                  src={selectedPhotos[0]}
                  alt="Post preview"
                  className="w-full h-auto max-h-[440px] object-contain mx-auto"
                />
              </div>
            ) : selectedPhotos.length > 1 ? (
              <div className="w-full max-w-[380px] mx-auto rounded-2xl overflow-hidden border border-[#E4E6EB] bg-[#F7F8FA] p-1.5 grid grid-cols-2 gap-1.5 relative">
                {selectedPhotos.slice(0, 4).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Preview ${i + 1}`}
                    className="w-full h-32 object-cover object-top rounded-lg"
                  />
                ))}
                {selectedPhotos.length > 4 && (
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/75 text-white text-xs font-bold">
                    +{selectedPhotos.length - 4} more
                  </span>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#E4E6EB] bg-[#F7F8FA] p-4 space-y-2">
                {content.trim() && (
                  <p className="text-[15px] text-[#050505] leading-relaxed line-clamp-4">
                    {content.trim()}
                  </p>
                )}
                {arabicText.trim() && (
                  <p className="text-base font-arabic text-emerald-800 text-right leading-relaxed">
                    {arabicText.trim()}
                  </p>
                )}
              </div>
            )}

            {hasMedia && content.trim() && (
              <p className="mt-2.5 text-[13px] text-[#65676B] text-center line-clamp-2 px-2">
                {content.trim()}
              </p>
            )}
          </div>

          {/* Error / Safety Banner if any */}
          {moderationError && (
            <div className="px-4 py-3 bg-amber-50 flex items-center gap-2.5 text-xs text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="font-semibold text-[13px]">{moderationError.reason}</span>
            </div>
          )}

          {/* Post audience */}
          <div className="bg-white">
            <button
              type="button"
              onClick={() => setShowStep2Audience((prev) => !prev)}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F7F8FA] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                {privacy === 'public' ? (
                  <Globe className="w-6 h-6 text-[#050505] stroke-[1.9]" />
                ) : privacy === 'friends' ? (
                  <Users className="w-6 h-6 text-emerald-600 stroke-[1.9]" />
                ) : (
                  <Lock className="w-6 h-6 text-amber-600 stroke-[1.9]" />
                )}
                <div>
                  <p className="text-[15px] font-bold text-[#050505] leading-snug">Post audience</p>
                  <p className="text-[13px] text-[#65676B]">{audienceLabel}</p>
                </div>
              </div>
              <ChevronRight
                className={`w-5 h-5 text-[#65676B] transition-transform ${
                  showStep2Audience ? 'rotate-90' : ''
                }`}
              />
            </button>

            {showStep2Audience && (
              <div className="px-4 pb-3 space-y-1.5 animate-in fade-in">
                {[
                  {
                    key: 'public' as const,
                    title: 'Public',
                    desc: 'Peaceverse24.com এর যেকোনো ব্যক্তি দেখতে পারবে',
                    icon: <Globe className="w-4 h-4 text-[#0866FF]" />,
                  },
                  {
                    key: 'friends' as const,
                    title: 'Friends',
                    desc: 'শুধুমাত্র আপনার বন্ধুরা দেখতে পারবে',
                    icon: <Users className="w-4 h-4 text-emerald-600" />,
                  },
                  {
                    key: 'private' as const,
                    title: 'Only Me',
                    desc: 'শুধুমাত্র আপনি নিজে দেখতে পারবেন',
                    icon: <Lock className="w-4 h-4 text-amber-600" />,
                  },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setPrivacy(opt.key);
                      setShowStep2Audience(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left cursor-pointer ${
                      privacy === opt.key
                        ? 'bg-[#E7F3FF] border-[#0866FF]/40'
                        : 'bg-[#F7F8FA] border-[#E4E6EB] hover:bg-[#F0F2F5]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {opt.icon}
                      <div>
                        <p className="text-[13px] font-bold text-[#050505]">{opt.title}</p>
                        <p className="text-[11px] text-[#65676B]">{opt.desc}</p>
                      </div>
                    </div>
                    {privacy === opt.key && <Check className="w-4 h-4 text-[#0866FF]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add music + horizontal pill suggestions */}
          <div className="bg-white pb-3.5">
            <button
              type="button"
              onClick={() => setShowStep2MusicSheet((prev) => !prev)}
              className="w-full px-4 pt-3.5 pb-2.5 flex items-center justify-between hover:bg-[#F7F8FA] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <Music className="w-6 h-6 text-[#050505] stroke-[1.9]" />
                <div>
                  <p className="text-[15px] font-bold text-[#050505] leading-snug">Add music</p>
                  {selectedMusic && (
                    <p className="text-[12px] font-semibold text-[#0866FF]">{selectedMusic}</p>
                  )}
                </div>
              </div>
              <ChevronRight
                className={`w-5 h-5 text-[#65676B] transition-transform ${
                  showStep2MusicSheet ? 'rotate-90' : ''
                }`}
              />
            </button>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 pt-0.5">
              {QUICK_MUSIC_SUGGESTIONS.map((item) => {
                const isActive = selectedMusic === item.title;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedMusic(isActive ? null : item.title)}
                    className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border text-[13px] font-medium shrink-0 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF] font-semibold'
                        : 'bg-white border-[#CED0D4] text-[#050505] hover:bg-[#F0F2F5]'
                    }`}
                  >
                    <img
                      src={item.thumb}
                      alt={item.title}
                      className="w-6 h-6 rounded-full object-cover border border-[#E4E6EB] shrink-0"
                    />
                    <span className="max-w-[170px] truncate">{item.title}</span>
                  </button>
                );
              })}
            </div>

            {showStep2MusicSheet && (
              <div className="mx-4 mt-2.5 p-2.5 rounded-xl bg-[#F7F8FA] border border-[#E4E6EB] flex items-center justify-between gap-2">
                <span className="text-xs text-[#65676B]">
                  {selectedMusic ? `নির্বাচিত: ${selectedMusic}` : 'উপরের তালিকা থেকে অডিও সিলেক্ট করুন'}
                </span>
                {selectedMusic && (
                  <button
                    type="button"
                    onClick={() => setSelectedMusic(null)}
                    className="text-xs font-bold text-rose-600 cursor-pointer"
                  >
                    সরান
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Also share to... (Groups / Apps) */}
          <div className="bg-white py-2">
            <p className="px-4 pt-1.5 pb-1 text-[13px] font-semibold text-[#65676B]">
              Also share to...
            </p>

            {/* Groups */}
            <button
              type="button"
              onClick={() => setShowGroupsPicker((prev) => !prev)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#F7F8FA] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <Users className="w-6 h-6 text-[#050505] stroke-[1.9]" />
                <div>
                  <p className="text-[15px] font-bold text-[#050505]">Groups</p>
                  {selectedGroups.length > 0 && (
                    <p className="text-[12px] text-[#0866FF] font-semibold">
                      {selectedGroups.length} group(s) selected
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight
                className={`w-5 h-5 text-[#65676B] transition-transform ${
                  showGroupsPicker ? 'rotate-90' : ''
                }`}
              />
            </button>

            {showGroupsPicker && (
              <div className="px-4 pb-2.5 space-y-1.5 animate-in fade-in">
                {SHAREABLE_GROUPS.map((grp) => {
                  const checked = selectedGroups.includes(grp.name);
                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() =>
                        setSelectedGroups((prev) =>
                          checked ? prev.filter((g) => g !== grp.name) : [...prev, grp.name]
                        )
                      }
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left cursor-pointer ${
                        checked
                          ? 'bg-[#E7F3FF] border-[#0866FF]/40'
                          : 'bg-[#F7F8FA] border-[#E4E6EB] hover:bg-[#F0F2F5]'
                      }`}
                    >
                      <div>
                        <p className="text-[13px] font-bold text-[#050505]">{grp.name}</p>
                        <p className="text-[11px] text-[#65676B]">{grp.members}</p>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          checked
                            ? 'bg-[#0866FF] border-[#0866FF] text-white'
                            : 'bg-white border-[#CED0D4]'
                        }`}
                      >
                        {checked && <Check className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Apps */}
            <button
              type="button"
              onClick={() => setShareToApps((prev) => !prev)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#F7F8FA] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <Share2 className="w-6 h-6 text-[#050505] stroke-[1.9]" />
                <div>
                  <p className="text-[15px] font-bold text-[#050505]">Apps</p>
                  {shareToApps && (
                    <p className="text-[12px] text-[#0866FF] font-semibold">
                      পোস্ট করার পর শেয়ার মেনু খুলবে
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {shareToApps && (
                  <span className="px-2 py-0.5 rounded-full bg-[#E7F3FF] text-[#0866FF] text-[11px] font-bold">
                    ON
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-[#65676B]" />
              </div>
            </button>
          </div>

          {/* AI label Toggle Row */}
          <div className="bg-white px-4 py-3.5 space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <PlusCircle className="w-6 h-6 text-[#050505] stroke-[1.9]" />
                <span className="text-[15px] font-bold text-[#050505]">AI label</span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={aiLabeled}
                aria-label="Toggle AI label"
                onClick={() => setAiLabeled((prev) => !prev)}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                  aiLabeled ? 'bg-[#0866FF] justify-end' : 'bg-[#CED0D4] justify-start'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] font-bold text-[#65676B]">
                  {aiLabeled ? '✓' : '✕'}
                </span>
              </button>
            </div>

            <p className="text-[13px] text-[#65676B] leading-snug">
              We require you to label certain realistic content that&apos;s made with AI.{' '}
              <button
                type="button"
                onClick={() => setShowAiLearnMore((prev) => !prev)}
                className="text-[#0866FF] font-semibold hover:underline cursor-pointer"
              >
                Learn more
              </button>
            </p>

            {showAiLearnMore && (
              <div className="p-2.5 rounded-xl bg-[#F0F2F5] text-[12px] text-[#050505] leading-relaxed">
                ছবি বা ভিডিও যদি এআই (AI) দিয়ে তৈরি বা সম্পাদিত হয়ে থাকে, তবে স্বচ্ছতার জন্য AI label চালু রাখুন।
              </div>
            )}
          </div>
        </div>

        {/* Bottom Full-Width Blue "Post" Button matching Screenshot 1 */}
        <div className="shrink-0 bg-white border-t border-[#E4E6EB] px-4 py-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full h-[44px] rounded-[8px] font-bold text-[15px] transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              canSubmit
                ? 'bg-[#0866FF] hover:bg-[#1877F2] text-white shadow-xs'
                : 'bg-[#E4E6EB] text-[#BCC0C4] cursor-not-allowed'
            }`}
          >
            {isVerifyingHalal || isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{uploadProgressText || 'Posting...'}</span>
              </>
            ) : (
              <span>Post</span>
            )}
          </button>
        </div>

        {/* Boost Confirmation Popup ("Apni ki eti Boost korte chan?") */}
        {showBoostPrompt && pendingBoostPost && (
          <div
            className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
            onClick={() => setShowBoostPrompt(false)}
          >
            <div
              className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[#E4E6EB] shadow-2xl p-5 space-y-4 text-[#050505]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center shrink-0">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-extrabold text-[#050505] leading-snug">
                    Apni ki eti Boost korte chan?
                  </h3>
                  <p className="text-xs text-[#65676B] mt-1 leading-relaxed">
                    আপনি কি আপনার পেজের এই পোস্টটি Boost করে আরও বেশি মানুষের কাছে পৌঁছাতে চান?
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowBoostPrompt(false);
                    setShowBoostPageModal(true);
                  }}
                  className="w-full py-3 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-extrabold text-sm cursor-pointer"
                >
                  YES, BOOST KORUN
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const postToPublish = pendingBoostPost;
                    setShowBoostPrompt(false);
                    setPendingBoostPost(null);
                    await onPostCreated(postToPublish);
                  }}
                  className="w-full py-3 rounded-xl bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] font-bold text-sm cursor-pointer"
                >
                  NOT NOW / EKHON NA
                </button>
              </div>
            </div>
          </div>
        )}

        {showBoostPageModal && pendingBoostPost && (
          <FbBoostPostModal
            post={pendingBoostPost}
            initialMode="boost"
            onClose={() => setShowBoostPageModal(false)}
            onBoostConfirmed={async () => {
              const postToPublish = pendingBoostPost;
              setShowBoostPageModal(false);
              setPendingBoostPost(null);
              await onPostCreated(postToPublish);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] max-h-[100dvh] overflow-hidden bg-white text-[#050505] flex flex-col animate-in fade-in font-sans">
      
      {/* Hidden file input that triggers user's real phone/PC gallery (up to 10 photos at once) */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleDeviceUpload}
      />

      {/* Top Header: [ ✕ ]  "New post"  [ spacer / audience ] */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#E4E6EB] bg-white">
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 -ml-1.5 rounded-full text-[#050505] hover:bg-[#F0F2F5] transition-colors cursor-pointer"
          title="বন্ধ করুন"
          aria-label="Close"
        >
          <X className="w-6 h-6 stroke-[2.2]" />
        </button>

        <h1 className="text-[17px] font-bold text-[#050505]">New post</h1>

        <div className="w-9" aria-hidden="true" />
      </div>

      {/* Main Content Area */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y px-4 pt-3.5 pb-4 space-y-3.5 bg-white">
        
        {/* Author row */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-[#E4E6EB] bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center font-extrabold text-base shrink-0">
            {userProfile.avatar ? (
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{userProfile.name.trim().charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-[16px] text-[#050505] leading-tight">{userProfile.name}</h2>

              {/* Compact Privacy Selector Pill */}
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {privacy === 'public' && (
                    <>
                      <Globe className="w-3 h-3 text-[#65676B]" />
                      <span>Public</span>
                    </>
                  )}
                  {privacy === 'friends' && (
                    <>
                      <Users className="w-3 h-3 text-emerald-600" />
                      <span>Friends</span>
                    </>
                  )}
                  {privacy === 'private' && (
                    <>
                      <Lock className="w-3 h-3 text-amber-600" />
                      <span>Only Me</span>
                    </>
                  )}
                  <span className="text-[8px] text-[#65676B]">▼</span>
                </button>

                {showPrivacyMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowPrivacyMenu(false)} />
                    <div className="absolute left-0 top-7 z-50 w-64 bg-white border border-[#E4E6EB] rounded-xl shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95">
                      <p className="text-[11px] font-bold text-[#65676B] px-2 py-1">পোস্টের প্রাইভেসী নির্বাচন করুন</p>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setPrivacy('public');
                          setShowPrivacyMenu(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                          privacy === 'public' ? 'bg-[#E7F3FF] border border-[#0866FF]/30' : 'hover:bg-[#F0F2F5]'
                        }`}
                      >
                        <Globe className="w-4 h-4 text-[#0866FF] mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-[#050505]">Public (পাবলিক)</p>
                          <p className="text-[10px] text-[#65676B]">Peaceverse24.com এর যেকোনো ব্যক্তি দেখতে পারবে</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPrivacy('friends');
                          setShowPrivacyMenu(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                          privacy === 'friends' ? 'bg-emerald-50 border border-emerald-300' : 'hover:bg-[#F0F2F5]'
                        }`}
                      >
                        <Users className="w-4 h-4 text-emerald-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-[#050505]">Friends (বন্ধুরা)</p>
                          <p className="text-[10px] text-[#65676B]">শুধুমাত্র আপনার ফ্রেন্ডলিস্টের ব্যক্তিরা দেখতে পারবে</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPrivacy('private');
                          setShowPrivacyMenu(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                          privacy === 'private' ? 'bg-amber-50 border border-amber-300' : 'hover:bg-[#F0F2F5]'
                        }`}
                      >
                        <Lock className="w-4 h-4 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-[#050505]">Only Me (শুধুমাত্র আমি)</p>
                          <p className="text-[10px] text-[#65676B]">শুধুমাত্র আপনি নিজে দেখতে পারবেন, ফিডে থাকবে না</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {selectedFeeling && (
              <p className="text-xs font-medium text-amber-700 mt-0.5">is {selectedFeeling}</p>
            )}
            {taggedFriends.length > 0 && (
              <p className="text-xs font-medium text-[#0866FF] mt-0.5">
                with {taggedFriends.join(', ')}
              </p>
            )}
            {selectedLocation && (
              <p className="text-xs font-medium text-emerald-700 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-red-500" />
                <span>at {selectedLocation}</span>
              </p>
            )}
          </div>
        </div>

        {/* 4 Interactive Pills matching Facebook Screenshot 1:
            [ 🎵 Music ] [ 👤 People ] [ 📍 Location ] [ 🙂 Feeling/activity ] */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Music */}
          <button
            type="button"
            onClick={() => setShowMusicPicker(!showMusicPicker)}
            className={`px-3.5 py-1.5 rounded-full border text-[13px] font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
              selectedMusic
                ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF]'
                : 'bg-white border-[#CED0D4] text-[#050505] hover:bg-[#F0F2F5]'
            }`}
          >
            <Music className="w-4 h-4 text-[#050505]" />
            <span>{selectedMusic || 'Music'}</span>
          </button>

          {/* People */}
          <button
            type="button"
            onClick={() => setShowTagModal(!showTagModal)}
            className={`px-3.5 py-1.5 rounded-full border text-[13px] font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
              taggedFriends.length > 0
                ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF]'
                : 'bg-white border-[#CED0D4] text-[#050505] hover:bg-[#F0F2F5]'
            }`}
          >
            <UserPlus className="w-4 h-4 text-[#050505]" />
            <span>{taggedFriends.length > 0 ? `People (${taggedFriends.length})` : 'People'}</span>
          </button>

          {/* Location */}
          <button
            type="button"
            onClick={() => setShowLocationModal(!showLocationModal)}
            className={`px-3.5 py-1.5 rounded-full border text-[13px] font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
              selectedLocation
                ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF]'
                : 'bg-white border-[#CED0D4] text-[#050505] hover:bg-[#F0F2F5]'
            }`}
          >
            <MapPin className="w-4 h-4 text-[#050505]" />
            <span>{selectedLocation ? selectedLocation.split(',')[0] : 'Location'}</span>
          </button>

          {/* Feeling/activity */}
          <button
            type="button"
            onClick={() => setShowFeelingModal(!showFeelingModal)}
            className={`px-3.5 py-1.5 rounded-full border text-[13px] font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
              selectedFeeling
                ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF]'
                : 'bg-white border-[#CED0D4] text-[#050505] hover:bg-[#F0F2F5]'
            }`}
          >
            <Smile className="w-4 h-4 text-[#050505]" />
            <span>{selectedFeeling ? 'Feeling added' : 'Feeling/activity'}</span>
          </button>
        </div>

        {/* Media/Text Verification Indicator */}
        {(isVerifyingHalal || isProcessingMedia) && (
          <div className="p-3 bg-[#E7F3FF] border border-[#0866FF]/30 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-[#0866FF]">
            <Loader2 className="w-4 h-4 animate-spin text-[#0866FF]" />
            <span>{isProcessingMedia ? 'ছবি/ভিডিও প্রস্তুত হচ্ছে...' : 'নিরাপত্তা যাচাই করা হচ্ছে...'}</span>
          </div>
        )}

        {/* Moderation / Media / Submit Error Banner */}
        {moderationError && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 animate-in fade-in">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="font-semibold text-[13px] text-amber-900">
              {moderationError.reason}
            </span>
          </div>
        )}

        {/* Music Picker subdrawer */}
        {showMusicPicker && (
          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-teal-300 space-y-2 animate-in fade-in">
            <p className="text-xs font-bold text-teal-700">অডিও বা তিলাওয়াত নির্বাচন করুন:</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'সূরা আর-রহমান তিলাওয়াত 🎵',
                'আয়াতুল কুরসি তিলাওয়াত 🕊️',
                'তাওবার পবিত্র দোয়া 🤲',
                'সুমিষ্ট আযান ও সালাত 🕌'
              ].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setSelectedMusic(m);
                    setShowMusicPicker(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#E4E6EB] text-xs font-medium text-[#050505] hover:bg-teal-50 hover:border-teal-400 cursor-pointer"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tag Friends Modal */}
        {showTagModal && (
          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#0866FF]/30 space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0866FF]">বন্ধুদের ট্যাগ করুন</span>
              <button type="button" onClick={() => setShowTagModal(false)} className="text-[#65676B] hover:text-[#050505] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
              {getTaggingFriendsList().length === 0 ? (
                <p className="text-xs text-[#65676B] py-2 text-center">
                  এখনো কোনো বন্ধু যুক্ত নেই
                </p>
              ) : (
                getTaggingFriendsList().map((f) => {
                  const isTagged = taggedFriends.includes(f.name);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleFriendTag(f.name)}
                      className={`w-full p-2 rounded-lg flex items-center justify-between text-xs cursor-pointer ${
                        isTagged ? 'bg-[#E7F3FF] text-[#0866FF] font-semibold' : 'hover:bg-[#E4E6EB] text-[#050505]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={f.avatar} alt={f.name} className="w-6 h-6 rounded-full object-cover" />
                        <span>{f.name}</span>
                      </div>
                      {isTagged && <Check className="w-3.5 h-3.5 text-[#0866FF]" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Location Picker */}
        {showLocationModal && (
          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-red-300 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-600">অবস্থান নির্বাচন করুন</span>
              <button type="button" onClick={() => setShowLocationModal(false)} className="text-[#65676B] hover:text-[#050505] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    setSelectedLocation(loc);
                    setShowLocationModal(false);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-[#E4E6EB] text-xs text-[#050505] flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>{loc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feeling Picker */}
        {showFeelingModal && (
          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-amber-300 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700">অনুভূতি বা কার্যকলাপ</span>
              <button type="button" onClick={() => setShowFeelingModal(false)} className="text-[#65676B] hover:text-[#050505] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
              {ISLAMIC_FEELINGS.map((feel, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSelectedFeeling(`${feel.label} ${feel.emoji}`);
                    setShowFeelingModal(false);
                  }}
                  className="p-2 rounded-lg bg-white border border-[#E4E6EB] hover:bg-amber-50 text-left text-xs text-[#050505] flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-base">{feel.emoji}</span>
                  <span className="truncate">{feel.bn}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clean Facebook-style Text Area */}
        <div className="bg-white pt-1">
          <textarea
            rows={hasMedia ? 3 : 7}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
            className="w-full bg-white placeholder-[#65676B] focus:outline-none resize-none leading-relaxed text-[#050505] text-[20px] sm:text-[22px] font-sans"
          />
        </div>

        {/* Single Video Preview */}
        {selectedVideo && (
          <div className="relative rounded-2xl overflow-hidden border border-[#E4E6EB] bg-[#F0F2F5] group animate-in fade-in">
            <video src={selectedVideo} controls className="w-full h-auto max-h-[420px] object-contain mx-auto" />
            {videoDurationSeconds > 0 && (
              <div className="px-3 py-1.5 bg-white border-t border-[#E4E6EB] flex items-center justify-between gap-2 text-[11px] font-bold">
                <span className={classifyVideoDuration(videoDurationSeconds).kind === 'long' ? 'text-emerald-700' : 'text-[#0866FF]'}>
                  {classifyVideoDuration(videoDurationSeconds).badgeText}
                </span>
                <span className="text-[#65676B] shrink-0">যেকোনো দৈর্ঘ্য চলবে</span>
              </div>
            )}
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-full bg-white/95 hover:bg-white text-xs font-bold text-[#050505] flex items-center gap-1 shadow-md border border-[#E4E6EB] cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#0866FF]" />
                <span>পরিবর্তন করুন</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedVideo((prev) => {
                    if (prev && prev.startsWith('blob:')) {
                      try {
                        URL.revokeObjectURL(prev);
                      } catch {}
                    }
                    return null;
                  });
                  setSelectedVideoFile(null);
                  setVideoDurationSeconds(0);
                  setVideoDurationText('');
                  setPendingVideoFrames([]);
                }}
                className="p-1.5 rounded-full bg-white/95 hover:bg-white text-[#050505] shadow-md border border-[#E4E6EB] cursor-pointer"
                title="মুছে ফেলুন"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* Multi-Photo Preview (1 to 10 photos) */}
        {selectedPhotos.length > 0 && (
          <div className="rounded-2xl border border-[#E4E6EB] bg-[#F7F8FA] p-2.5 space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-xs font-bold text-[#050505]">
                সিলেক্ট করা ছবি ({selectedPhotos.length}/{MAX_POST_PHOTOS})
              </span>
              <div className="flex items-center gap-1.5">
                {selectedPhotos.length < MAX_POST_PHOTOS && (
                  <button
                    type="button"
                    disabled={isProcessingMedia}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-[#E7F3FF] hover:bg-[#D8EAFE] text-[#0866FF] text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-60"
                  >
                    {isProcessingMedia ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>আরও ছবি যোগ করুন</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedPhotos([])}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-[#E4E6EB] text-xs font-bold cursor-pointer"
                >
                  সব মুছুন
                </button>
              </div>
            </div>

            {selectedPhotos.length === 1 ? (
              <div className="relative rounded-xl overflow-hidden border border-[#E4E6EB] bg-[#F7F8FA]">
                <img
                  src={selectedPhotos[0]}
                  alt="Selected 1"
                  className="w-full h-auto max-h-[440px] object-contain mx-auto"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => removePhotoAtIndex(0)}
                    className="p-1.5 rounded-full bg-white/95 hover:bg-white text-[#050505] shadow-md border border-[#E4E6EB] cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedPhotos.map((photoSrc, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-[#E4E6EB] bg-white"
                  >
                    <img
                      src={photoSrc}
                      alt={`Selected ${idx + 1}`}
                      className="w-full h-full object-cover object-top"
                    />
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/65 text-white text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePhotoAtIndex(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-black text-white shadow cursor-pointer"
                      title="ছবি সরান"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ayah Box Form */}
        {showAyahBox && (
          <div className="p-3 rounded-xl bg-[#F7F8FA] border border-emerald-300 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-emerald-700 font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> কুরআনের আয়াত বা হাদিস কার্ড
              </span>
              <button type="button" onClick={() => setShowAyahBox(false)} className="text-[#65676B] hover:text-[#050505] cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="মূল আরবি পাঠ লিখুন..."
              value={arabicText}
              onChange={(e) => setArabicText(e.target.value)}
              className="w-full bg-white border border-[#E4E6EB] rounded-lg p-2 text-right font-arabic text-sm text-[#050505] placeholder-[#65676B] outline-none focus:border-[#0866FF]"
            />
            <input
              type="text"
              placeholder="বাংলা অনুবাদ..."
              value={translationText}
              onChange={(e) => setTranslationText(e.target.value)}
              className="w-full bg-white border border-[#E4E6EB] rounded-lg px-2.5 py-1.5 text-xs text-[#050505] placeholder-[#65676B] outline-none focus:border-[#0866FF]"
            />
          </div>
        )}

      </div>

      {/* Single Clean Facebook-Style Bottom Toolbar matching Screenshot 1 */}
      <div className="shrink-0 bg-white border-t border-[#E4E6EB] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-5">
          {/* 1. Gallery (1-10 Photos / Video) */}
          <button
            type="button"
            disabled={isProcessingMedia}
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 -ml-1.5 rounded-full text-[#050505] hover:bg-[#F0F2F5] transition-colors cursor-pointer disabled:opacity-50"
            title="ফোনের গ্যালারি থেকে ছবি বা ভিডিও যোগ করুন"
            aria-label="Photo or video"
          >
            <ImageIcon className="w-6 h-6 stroke-[1.9]" />
          </button>

          {/* 2. কুরআন কার্ড */}
          <button
            type="button"
            onClick={() => setShowAyahBox((prev) => !prev)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              showAyahBox ? 'bg-[#E7F3FF] text-[#0866FF]' : 'text-[#050505] hover:bg-[#F0F2F5]'
            }`}
            title="কুরআন বা হাদিস কার্ড"
            aria-label="Quran card"
          >
            <BookOpen className="w-6 h-6 stroke-[1.9]" />
          </button>

          {/* 3. Feeling / Highlights */}
          <button
            type="button"
            onClick={() => setShowFeelingModal((prev) => !prev)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              showFeelingModal ? 'bg-[#E7F3FF] text-[#0866FF]' : 'text-[#050505] hover:bg-[#F0F2F5]'
            }`}
            title="অনুভূতি বা অ্যাক্টিভিটি"
            aria-label="Feeling or highlight"
          >
            <Star className="w-6 h-6 stroke-[1.9]" />
          </button>

          {/* 4. Video / Live */}
          <button
            type="button"
            onClick={() => {
              if (onOpenLive) {
                onClose();
                onOpenLive();
              } else {
                fileInputRef.current?.click();
              }
            }}
            className="p-1.5 rounded-full text-[#050505] hover:bg-[#F0F2F5] transition-colors cursor-pointer"
            title="লাইভ ভিডিও"
            aria-label="Live video"
          >
            <Video className="w-6 h-6 stroke-[1.9]" />
          </button>
        </div>

        {/* Facebook-identical Step 1 "Next" button on bottom right */}
        <button
          type="button"
          onClick={handleGoNextStep}
          disabled={!canSubmit}
          className={`h-[38px] min-w-[84px] px-5 rounded-[8px] font-bold text-[14px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            canSubmit
              ? 'bg-[#0866FF] hover:bg-[#1877F2] text-white shadow-xs'
              : 'bg-[#E4E6EB] text-[#BCC0C4] cursor-not-allowed'
          }`}
        >
          <span>Next</span>
        </button>
      </div>

    </div>
  );
};
