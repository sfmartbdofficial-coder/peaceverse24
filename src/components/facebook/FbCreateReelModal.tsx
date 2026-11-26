import React, { useState, useRef } from 'react';
import {
  X,
  Settings,
  Camera,
  Music,
  PlusCircle,
  FileText,
  Scan,
  Upload,
  ChevronDown,
  ChevronLeft,
  Check,
  Play,
  Film,
  Hash,
  Megaphone,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { PostItem, UserProfile } from '../../types';
import { validateMediaUpload, sanitizeInput } from '../../utils/security';
import {
  ADULT_BLOCK_MESSAGE,
  checkMediaFilenamesSafe,
  checkMediaVisualSafety,
  checkPost,
} from '../../lib/halalFilter';
import { extractVideoFrameDataUrl, readFileAsDataUrl } from '../../utils/imageCompress';
import { uploadDataUrlIfOversized, uploadMediaFile } from '../../lib/mediaStorage';
import { FbBoostPostModal } from './FbBoostPostModal';

interface FbCreateReelModalProps {
  userProfile: UserProfile;
  isPageAccount?: boolean;
  pageId?: string;
  onClose: () => void;
  onReelCreated: (newReelPost: PostItem, options?: { boosted?: boolean }) => void;
}

interface PreviewReelMedia {
  url: string;
  mediaType: 'video' | 'image';
  duration: string;
  thumbnail?: string;
  arabicSnippet?: string;
  suggestedTitle?: string;
  file?: File;
}

const REEL_PRESETS = [
  {
    id: 'reel-1',
    title: 'মক্কা মুকাররমার হৃদয়স্পর্শী লাইভ রিলস',
    duration: '0:45',
    thumbnail:
      'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ',
  },
  {
    id: 'reel-2',
    title: 'পবিত্র কুরআনের অত্যন্ত মনমুগ্ধকর তিলাওয়াত',
    duration: '1:02',
    thumbnail:
      'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    arabic: 'الرَّحْمَٰنُ • عَلَّمَ الْقُرْآنَ',
  },
  {
    id: 'reel-3',
    title: 'মসজিদে নববীর সবুজ গম্বুজের দৃশ্য',
    duration: '0:30',
    thumbnail:
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    arabic: 'الصَّلَاةُ وَالسَّلَامُ عَلَيْكَ يَا رَسُولَ اللَّهِ',
  },
  {
    id: 'reel-4',
    title: 'বৃষ্টির মধ্যে রবের শুকরিয়া ও তাওহীদের আহ্বান',
    duration: '0:58',
    thumbnail:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    arabic: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ',
  },
  {
    id: 'reel-5',
    title: 'জুমুআর দিনে দরূদ পাঠের বরকত ও ফজিলত',
    duration: '1:15',
    thumbnail:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    arabic: 'إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ',
  },
  {
    id: 'reel-6',
    title: 'হালাল জীবিকা ও উত্তম আখলাকের গুরুত্ব',
    duration: '0:40',
    thumbnail:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    arabic: 'طَلَبُ الْحَلَالِ فَرِيضَةٌ',
  },
];

const REEL_MUSIC_TRACKS = [
  'সালাতুস সালাম — মধুর নাশিদ',
  'মক্কা ফজর আজান অ্যাম্বিয়েন্স',
  'হৃদয়স্পর্শী কুরআন অ্যাম্বিয়েন্স',
  'হামদ ও নাত ভোকাল টোন',
  'পিসভার্স স্পিরিচুয়াল ব্যাকগ্রাউন্ড',
  'জিকির ও সুকুন অ্যাকোস্টিক',
];

const QUICK_HASHTAGS = [
  '#PeaceVerse',
  '#IslamicReels',
  '#Quran',
  '#Dua',
  '#Hadith',
  '#Bangladesh',
];

function formatHashtags(raw: string): string {
  const cleaned = raw.trim();
  if (!cleaned) return '';
  return cleaned
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
    .join(' ');
}

export const FbCreateReelModal: React.FC<FbCreateReelModalProps> = ({
  userProfile,
  isPageAccount = false,
  pageId,
  onClose,
  onReelCreated,
}) => {
  const [step, setStep] = useState<'gallery' | 'preview'>('gallery');
  const [previewMedia, setPreviewMedia] = useState<PreviewReelMedia | null>(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [selectedMusic, setSelectedMusic] = useState<string>('');
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [customMusicInput, setCustomMusicInput] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<'0:30' | '0:45' | '1:00' | '1:15'>('0:45');
  const [selectedCategory, setSelectedCategory] = useState<string>('Makkah Live');
  const [uploadedVideos, setUploadedVideos] = useState<
    Array<{ url: string; mediaType: 'video' | 'image'; thumbnail?: string; duration: string; file?: File }>
  >([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCheckingMedia, setIsCheckingMedia] = useState(false);
  const [isPublishingReel, setIsPublishingReel] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null);
  const [reelInfoNotice, setReelInfoNotice] = useState<string | null>(null);

  // Step 3 (Boost Confirmation & Boost Page)
  const [showBoostPrompt, setShowBoostPrompt] = useState(false);
  const [pendingReelForBoost, setPendingReelForBoost] = useState<PostItem | null>(null);
  const [showBoostPageModal, setShowBoostPageModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const check = validateMediaUpload(file, ['video', 'image']);
    if (!check.valid) {
      setUploadError(check.error || 'Max 50MB video or 5MB image file allowed.');
      return;
    }

    const nameCheck = checkMediaFilenamesSafe([file], caption);
    if (!nameCheck.safe) {
      setUploadError(nameCheck.reason || ADULT_BLOCK_MESSAGE);
      return;
    }

    setUploadError(null);
    setIsCheckingMedia(true);
    try {
      let frameOrImage: string | null = null;
      const isImageFile = file.type.startsWith('image/');
      if (file.type.startsWith('video/')) {
        frameOrImage = await extractVideoFrameDataUrl(file);
      } else if (isImageFile) {
        frameOrImage = await readFileAsDataUrl(file);
      }

      const visual = await checkMediaVisualSafety({
        mediaDataUrls: frameOrImage ? [frameOrImage] : [],
        caption,
        fileNames: [file.name],
      });
      if (!visual.safe) {
        setUploadError(visual.reason || ADULT_BLOCK_MESSAGE);
        return;
      }

      const url = URL.createObjectURL(file);

      const mediaType: 'video' | 'image' = isImageFile ? 'image' : 'video';

      // NEVER use file.name (like 1000048591) as Title or Caption!
      setUploadedVideos((prev) => [
        {
          url,
          mediaType,
          thumbnail: frameOrImage || undefined,
          duration: selectedDuration,
          file,
        },
        ...prev,
      ]);

      setPreviewMedia({
        url,
        mediaType,
        duration: selectedDuration,
        thumbnail: frameOrImage || undefined,
        file,
      });
      setStep('preview');
      setUploadError(null);
    } catch {
      setUploadError('ভিডিওটি প্রসেস করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsCheckingMedia(false);
    }
  };

  const openPresetInPreview = (item: (typeof REEL_PRESETS)[number]) => {
    setUploadError(null);
    setPreviewMedia({
      url: item.videoUrl,
      mediaType: 'video',
      duration: item.duration,
      thumbnail: item.thumbnail,
      arabicSnippet: item.arabic,
      suggestedTitle: item.title,
    });
    setStep('preview');
  };

  const openUploadedInPreview = (vid: {
    url: string;
    mediaType: 'video' | 'image';
    thumbnail?: string;
    duration: string;
    file?: File;
  }) => {
    setUploadError(null);
    setPreviewMedia({
      url: vid.url,
      mediaType: vid.mediaType,
      duration: vid.duration,
      thumbnail: vid.thumbnail,
      file: vid.file,
    });
    setStep('preview');
  };

  const buildDraftReelPost = async (): Promise<PostItem | null> => {
    if (!previewMedia) return null;

    // File name is NEVER used. Empty title defaults strictly to "PeaceVerse Reels".
    const finalTitle = caption.trim() || previewMedia.suggestedTitle || 'PeaceVerse Reels';
    const formattedTags = formatHashtags(hashtags);
    const fullContent = formattedTags ? `${finalTitle}\n\n${formattedTags}` : finalTitle;

    const combinedTextCheck = `${fullContent} ${previewMedia.arabicSnippet || ''}`.trim();
    const textCheck = checkPost(combinedTextCheck);
    if (!textCheck.isApproved) {
      setUploadError(textCheck.reason || ADULT_BLOCK_MESSAGE);
      return null;
    }

    if (previewMedia.thumbnail && previewMedia.thumbnail.startsWith('data:image/')) {
      const visualCheck = await checkMediaVisualSafety({
        mediaDataUrls: [previewMedia.thumbnail],
        caption: combinedTextCheck,
      });
      if (!visualCheck.safe) {
        setUploadError(visualCheck.reason || ADULT_BLOCK_MESSAGE);
        return null;
      }
    }

    let persistentMediaUrl = previewMedia.url;
    if (previewMedia.file) {
      setUploadProgressText('ভিডিও আপলোড হচ্ছে...');
      persistentMediaUrl = await uploadMediaFile(previewMedia.file, {
        mimeType:
          previewMedia.file.type || (previewMedia.mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
        fileName: previewMedia.file.name,
        onProgress: (pct) => setUploadProgressText(`ভিডিও আপলোড হচ্ছে (${pct}%)...`),
      });
    } else if (previewMedia.url.startsWith('blob:')) {
      setUploadProgressText('ভিডিও আপলোড হচ্ছে...');
      const resp = await fetch(previewMedia.url);
      const blob = await resp.blob();
      persistentMediaUrl = await uploadMediaFile(blob, {
        mimeType: blob.type || (previewMedia.mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
        onProgress: (pct) => setUploadProgressText(`ভিডিও আপলোড হচ্ছে (${pct}%)...`),
      });
    } else if (previewMedia.url.startsWith('data:')) {
      setUploadProgressText('ভিডিও আপলোড হচ্ছে...');
      persistentMediaUrl = await uploadDataUrlIfOversized(
        previewMedia.url,
        previewMedia.mediaType,
        true
      );
    }

    const nowMs = Date.now();
    const resolvedAuthorId = isPageAccount
      ? pageId || userProfile.id
      : userProfile.id || userProfile.name;

    return {
      id: `reel-${nowMs}`,
      authorId: resolvedAuthorId,
      author: {
        name: userProfile.name,
        avatar: userProfile.avatar,
        verified: true,
        subtitle: `Reels • ${selectedCategory}`,
      },
      timeAgo: 'Just now',
      isPublic: true,
      privacy: 'public',
      contentBangla: sanitizeInput(fullContent),
      arabicVerse: previewMedia.arabicSnippet
        ? sanitizeInput(previewMedia.arabicSnippet)
        : undefined,
      mediaType: previewMedia.mediaType,
      mediaUrl: persistentMediaUrl,
      duration: previewMedia.duration || selectedDuration,
      musicTitle: selectedMusic.trim() ? sanitizeInput(selectedMusic.trim(), 80) : undefined,
      category: (selectedCategory === 'Quran Tilawat' ? 'Quran' : 'Lecture') as PostItem['category'],
      reactions: {
        total: 0,
        likeCount: 0,
        loveCount: 0,
        subhanallahCount: 0,
        mashaallahCount: 0,
      },
      comments: [],
      sharesCount: 0,
      isSaved: false,
      isFreshUpload: true,
      createdAtMillis: nowMs,
    };
  };

  // POST button click -> validate, upload media persistently & open Boost Confirmation Popup ("Apni ki eti Boost korte chan?")
  const handlePostButtonClick = async () => {
    if (isPublishingReel) return;
    setUploadError(null);
    setIsPublishingReel(true);
    try {
      const draft = await buildDraftReelPost();
      if (!draft) return;
      setPendingReelForBoost(draft);
      setShowBoostPrompt(true);
    } catch (err: any) {
      setUploadError(err?.message || 'ভিডিও আপলোড করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setIsPublishingReel(false);
      setUploadProgressText(null);
    }
  };

  const handlePublishWithoutBoost = () => {
    if (!pendingReelForBoost) return;
    setShowBoostPrompt(false);
    onReelCreated(pendingReelForBoost, { boosted: false });
    onClose();
  };

  const handleChooseBoostYes = () => {
    if (!pendingReelForBoost) return;
    setShowBoostPrompt(false);
    setShowBoostPageModal(true);
  };

  const handleBoostConfirmedAndPublish = () => {
    if (!pendingReelForBoost) return;
    setShowBoostPageModal(false);
    onReelCreated(pendingReelForBoost, { boosted: true });
    onClose();
  };

  const toggleQuickHashtag = (tag: string) => {
    const currentTokens = hashtags.trim().split(/\s+/).filter(Boolean);
    const exists = currentTokens.some((t) => t.toLowerCase() === tag.toLowerCase());
    if (exists) {
      setHashtags(currentTokens.filter((t) => t.toLowerCase() !== tag.toLowerCase()).join(' '));
    } else {
      setHashtags([...currentTokens, tag].join(' '));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white text-black flex flex-col animate-in fade-in">
      {/* Hidden file input for videos */}
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*,image/*"
        className="hidden"
        onChange={handleDeviceUpload}
      />

      {step === 'preview' && previewMedia ? (
        <>
          {/* PREVIEW PAGE HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E6EB] bg-white shrink-0">
            <button
              type="button"
              onClick={() => {
                setStep('gallery');
                setUploadError(null);
              }}
              className="p-1.5 rounded-full text-black hover:bg-[#F0F2F5] transition-colors flex items-center gap-1 cursor-pointer"
              title="Back to Gallery"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.3]" />
            </button>

            <h1 className="text-base font-bold text-black">Reel Preview</h1>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-black hover:bg-[#F0F2F5] transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5 stroke-[2.3]" />
            </button>
          </div>

          {uploadError && (
            <div className="mx-4 mt-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold shrink-0">
              ⚠️ {uploadError}
            </div>
          )}

          {/* PREVIEW PAGE SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4 bg-[#F7F8FA]">
            {/* 1. Video / Media Preview Player */}
            <div className="relative w-full max-w-[340px] mx-auto rounded-2xl overflow-hidden bg-black border border-[#E4E6EB] shadow-md">
              {previewMedia.mediaType === 'video' ? (
                <video
                  src={previewMedia.url}
                  poster={previewMedia.thumbnail}
                  controls
                  playsInline
                  autoPlay
                  loop
                  className="w-full max-h-[340px] object-contain bg-black mx-auto"
                />
              ) : (
                <img
                  src={previewMedia.url}
                  alt="Reel Preview"
                  className="w-full max-h-[340px] object-contain bg-black mx-auto"
                />
              )}

              {selectedMusic && (
                <div className="px-3 py-2 bg-black/80 text-white text-xs font-semibold flex items-center justify-between gap-2 border-t border-white/10">
                  <span className="flex items-center gap-1.5 truncate">
                    <Music className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{selectedMusic}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedMusic('')}
                    className="text-[11px] text-rose-300 hover:text-rose-200 font-bold shrink-0 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* 2. Title / Caption Box */}
            <div className="bg-white rounded-2xl border border-[#E4E6EB] p-3.5 space-y-2 shadow-2xs">
              <label className="text-xs font-extrabold text-[#050505] block">
                Title / Caption
              </label>
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Apnar video somporke kichu likhun..."
                className="w-full bg-[#F0F2F5] border border-[#E4E6EB] focus:border-[#0866FF] focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-[#050505] placeholder-[#65676B] focus:outline-none resize-none transition-colors"
              />
              <p className="text-[11px] text-[#65676B]">
                খালি রাখলে ডিফল্ট টাইটেল হবে:{' '}
                <span className="font-bold text-[#050505]">&quot;PeaceVerse Reels&quot;</span>
              </p>
            </div>

            {/* 3. Hashtag Box */}
            <div className="bg-white rounded-2xl border border-[#E4E6EB] p-3.5 space-y-2.5 shadow-2xs">
              <label className="text-xs font-extrabold text-[#050505] flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#0866FF]" />
                <span>Hashtags</span>
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#peaceverse #islamic #reels #dua"
                className="w-full bg-[#F0F2F5] border border-[#E4E6EB] focus:border-[#0866FF] focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-[#050505] placeholder-[#65676B] focus:outline-none transition-colors"
              />
              <div className="flex flex-wrap gap-1.5">
                {QUICK_HASHTAGS.map((tag) => {
                  const active = hashtags
                    .toLowerCase()
                    .split(/\s+/)
                    .includes(tag.toLowerCase());
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleQuickHashtag(tag)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#0866FF] text-white'
                          : 'bg-[#F0F2F5] text-[#050505] hover:bg-[#E4E6EB]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Add Music Button & Track Picker */}
            <div className="bg-white rounded-2xl border border-[#E4E6EB] p-3.5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center shrink-0">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#050505]">Music / অডিও</p>
                    <p className="text-[11px] text-[#65676B] truncate">
                      {selectedMusic || 'কোনো মিউজিক সিলেক্ট করা হয়নি'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMusicPicker((prev) => !prev)}
                  className="px-3.5 py-2 rounded-xl bg-[#E7F3FF] hover:bg-[#DBEAFE] text-[#0866FF] text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>{selectedMusic ? 'Change Music' : 'Add Music'}</span>
                </button>
              </div>

              {showMusicPicker && (
                <div className="pt-2 border-t border-[#E4E6EB] space-y-2 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {REEL_MUSIC_TRACKS.map((track) => {
                      const active = selectedMusic === track;
                      return (
                        <button
                          key={track}
                          type="button"
                          onClick={() => {
                            setSelectedMusic(active ? '' : track);
                            setShowMusicPicker(false);
                          }}
                          className={`px-3 py-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            active
                              ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF]'
                              : 'bg-[#F7F8FA] border-[#E4E6EB] text-[#050505] hover:bg-[#F0F2F5]'
                          }`}
                        >
                          <span className="truncate">{track}</span>
                          {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={customMusicInput}
                      onChange={(e) => setCustomMusicInput(e.target.value)}
                      placeholder="নিজে মিউজিক / নাশিদের নাম লিখুন..."
                      className="flex-1 bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg px-3 py-1.5 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!customMusicInput.trim()) return;
                        setSelectedMusic(customMusicInput.trim());
                        setCustomMusicInput('');
                        setShowMusicPicker(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Category selector */}
            <div className="bg-white rounded-2xl border border-[#E4E6EB] p-3.5 space-y-2 shadow-2xs">
              <p className="text-xs font-extrabold text-[#050505]">Category</p>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['Makkah Live', 'Madinah', 'Quran Tilawat', 'Rain Shukriya', 'Jumua Darud'].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#F0F2F5] text-[#050505] hover:bg-[#E4E6EB]'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM LARGE POST BUTTON */}
          <div className="shrink-0 p-3.5 bg-white border-t border-[#E4E6EB] shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
            <button
              type="button"
              disabled={isPublishingReel}
              onClick={handlePostButtonClick}
              className="w-full h-12 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] active:scale-[0.99] disabled:opacity-70 text-white font-extrabold text-base tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isPublishingReel ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{uploadProgressText || 'আপলোড হচ্ছে...'}</span>
                </>
              ) : (
                <span>POST</span>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* GALLERY VIEW */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E6EB] bg-white">
            <button
              onClick={onClose}
              className="p-1 rounded-full text-black hover:bg-[#F0F2F5] transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>

            <h1 className="text-base font-bold text-black">Create reel</h1>

            <button
              onClick={() =>
                setReelInfoNotice((prev) =>
                  prev
                    ? null
                    : 'ভিডিও বাছার পর Preview পেজে গিয়ে Title, Hashtag ও Music দিয়ে POST করতে পারবেন।'
                )
              }
              className="p-1.5 rounded-full text-black hover:bg-[#F0F2F5] transition-colors cursor-pointer"
              title="Reel Guidelines"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {isCheckingMedia && (
            <div className="mx-4 mt-2 p-2.5 rounded-xl bg-[#E7F3FF] border border-[#0866FF]/30 text-[#0866FF] text-xs font-semibold">
              ভিডিও প্রিভিউ প্রস্তুত করা হচ্ছে...
            </div>
          )}

          {reelInfoNotice && !uploadError && (
            <div className="mx-4 mt-2 p-2.5 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] text-[#050505] text-xs font-medium">
              {reelInfoNotice}
            </div>
          )}

          {uploadError && (
            <div className="mx-4 mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              ⚠️ {uploadError}
            </div>
          )}

          {/* Circular Action Buttons */}
          <div className="px-3 py-4 bg-white border-b border-[#E4E6EB]">
            <div className="flex items-center justify-around max-w-md mx-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#F0F2F5] group-hover:bg-[#E4E6EB] flex items-center justify-center text-black transition-colors">
                  <Camera className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-xs font-semibold text-black">Camera</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Quran Tilawat');
                  setShowMusicPicker(true);
                  setReelInfoNotice(
                    'ভিডিও সিলেক্ট করলে Preview পেজ থেকে পছন্দের Music যোগ করতে পারবেন।'
                  );
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#F0F2F5] group-hover:bg-[#E4E6EB] flex items-center justify-center text-black transition-colors">
                  <Music className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-xs font-semibold text-black">Music</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Makkah Live');
                  setReelInfoNotice('নিচের যেকোনো ভিডিওতে ক্লিক করলে Preview পেজ খুলবে।');
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#F0F2F5] group-hover:bg-[#E4E6EB] flex items-center justify-center text-black transition-colors">
                  <PlusCircle className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-xs font-semibold text-black">Templates</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const draftKey = 'peaceverse_reel_draft_caption';
                  if (caption.trim()) {
                    localStorage.setItem(draftKey, caption.trim());
                    setReelInfoNotice('আপনার রিলস ক্যাপশন ড্রাফটে সংরক্ষণ করা হয়েছে।');
                  } else {
                    const savedDraft = localStorage.getItem(draftKey);
                    if (savedDraft) {
                      setCaption(savedDraft);
                      setReelInfoNotice('আগের সেভ করা ড্রাফট লোড করা হয়েছে।');
                    } else {
                      setReelInfoNotice('এখনো কোনো ড্রাফট সেভ করা হয়নি।');
                    }
                  }
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#F0F2F5] group-hover:bg-[#E4E6EB] flex items-center justify-center text-black transition-colors">
                  <FileText className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-xs font-semibold text-black">Drafts</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#F0F2F5] group-hover:bg-[#E4E6EB] flex items-center justify-center text-black transition-colors">
                  <Scan className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-xs font-semibold text-black">Green screen</span>
              </button>
            </div>
          </div>

          {/* Subheader: Gallery */}
          <div className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-20 border-b border-[#E4E6EB]">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 cursor-pointer hover:text-[#0866FF]"
              title="আপনার ফোনের ভিডিও গ্যালারি খুলুন"
            >
              <span className="font-bold text-sm text-black">Gallery</span>
              <ChevronDown className="w-4 h-4 text-[#65676B]" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-full bg-[#0866FF] hover:bg-[#166fe5] text-xs font-bold text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>ফোনের ভিডিও খুলুন</span>
              </button>
            </div>
          </div>

          {/* Prominent Device Video Banner */}
          <div className="p-3 bg-white border-b border-[#E4E6EB] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-black">আপনার মোবাইল বা পিসির ভিডিও</p>
                <p className="text-[10px] text-[#65676B]">
                  ভিডিও বাছলে আগে Preview পেজ খুলবে — সরাসরি পোস্ট হবে না
                </p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-[#E4E6EB] hover:bg-[#D8DADF] text-xs font-bold text-black border border-[#CCD0D5] cursor-pointer"
            >
              ভিডিও বাছুন
            </button>
          </div>

          {/* Duration selector */}
          <div className="px-4 py-2 bg-white border-b border-[#E4E6EB] flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#65676B]">Duration:</span>
            <div className="flex items-center gap-1">
              {(['0:30', '0:45', '1:00', '1:15'] as const).map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setSelectedDuration(dur)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold tabular-nums cursor-pointer ${
                    selectedDuration === dur
                      ? 'bg-[#0866FF] text-white'
                      : 'bg-[#F0F2F5] text-[#65676B]'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

          {/* Video Gallery Grid */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-1 grid grid-cols-3 gap-1 bg-white">
            {/* Device Video Big Tile */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[9/16] bg-purple-50 hover:bg-purple-100 flex flex-col items-center justify-center gap-2 transition-all border-2 border-dashed border-purple-400 p-2 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-md">
                <Upload className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-black text-center leading-tight">
                ফোনের গ্যালারি
              </span>
            </button>

            {/* Uploaded videos from device (click -> Preview, NEVER auto-post!) */}
            {uploadedVideos.map((vid, idx) => (
              <div
                key={`up-vid-${idx}`}
                onClick={() => openUploadedInPreview(vid)}
                className="aspect-[9/16] relative overflow-hidden bg-black group cursor-pointer border border-[#E4E6EB]"
              >
                {vid.thumbnail ? (
                  <img
                    src={vid.thumbnail}
                    alt="Selected Reel"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black/50">
                    <Play className="w-8 h-8 text-white fill-current" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
                <span className="absolute top-1.5 right-1.5 bg-black/75 text-[10px] px-1.5 py-0.5 rounded text-white font-mono">
                  {vid.duration}
                </span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 p-1.5">
                  <p className="text-[10px] font-bold text-white truncate">Preview video</p>
                </div>
              </div>
            ))}

            {/* Preset Islamic Reels (click -> Preview, NEVER auto-post!) */}
            {REEL_PRESETS.map((item) => (
              <div
                key={item.id}
                onClick={() => openPresetInPreview(item)}
                className="aspect-[9/16] relative overflow-hidden bg-[#F0F2F5] group cursor-pointer border border-[#E4E6EB]"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                  <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
                <span className="absolute top-1.5 right-1.5 bg-black/75 text-[10px] px-1.5 py-0.5 rounded text-white font-mono">
                  {item.duration}
                </span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-1.5">
                  <p className="text-[10px] font-bold text-white line-clamp-2 leading-tight">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* PROBLEM 2: BOOST CONFIRMATION POPUP ("Apni ki eti Boost korte chan?") */}
      {showBoostPrompt && pendingReelForBoost && (
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
                  আপনি কি এই রিলসটি Boost করে হাজার হাজার নতুন মানুষের কাছে পৌঁছাতে চান? না চাইলে কোন টাকা ছাড়াই সরাসরি পোস্ট হবে।
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#0866FF] shrink-0" />
              <p className="text-xs font-semibold text-[#050505] line-clamp-2">
                {pendingReelForBoost.contentBangla}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleChooseBoostYes}
                className="w-full py-3 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] active:scale-[0.99] text-white font-extrabold text-sm shadow-sm transition-all cursor-pointer"
              >
                YES, BOOST KORUN
              </button>
              <button
                type="button"
                onClick={handlePublishWithoutBoost}
                className="w-full py-3 rounded-xl bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] font-bold text-sm transition-all cursor-pointer"
              >
                NOT NOW / EKHON NA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOST PAGE MODAL WHEN USER CLICKS "YES, BOOST KORUN" */}
      {showBoostPageModal && pendingReelForBoost && (
        <FbBoostPostModal
          post={pendingReelForBoost}
          initialMode="boost"
          onClose={() => setShowBoostPageModal(false)}
          onBoostConfirmed={handleBoostConfirmedAndPublish}
        />
      )}
    </div>
  );
};
