import React, { useRef, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { UserProfile, PageItem } from '../../types';
import { validateMediaUpload } from '../../utils/security';
import {
  compressPostImagesBatch,
  extractVideoMetadataAndFrames,
  MAX_POST_PHOTOS,
} from '../../utils/imageCompress';
import {
  ADULT_BLOCK_MESSAGE,
  checkMediaFilenamesSafe,
  checkMediaVisualSafety,
} from '../../lib/halalFilter';
import { registerPendingBlobFile, useResolvedMediaUrl } from '../../lib/mediaStorage';

interface FbCreatePostBoxProps {
  userProfile: UserProfile;
  activeSwitchedPage?: PageItem | null;
  onOpenCreateModal: (initialMedia?: string | string[]) => void;
  onOpenProfile?: () => void;
}

export const FbCreatePostBox: React.FC<FbCreatePostBoxProps> = ({
  userProfile,
  activeSwitchedPage = null,
  onOpenCreateModal,
  onOpenProfile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const resolvedAvatar = useResolvedMediaUrl(
    activeSwitchedPage ? activeSwitchedPage.avatar : userProfile.avatar
  );

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setUploadError(null);

    const filenameCheck = checkMediaFilenamesSafe(files);
    if (!filenameCheck.safe) {
      setUploadError(filenameCheck.reason || ADULT_BLOCK_MESSAGE);
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
        setUploadError(check.error || 'সর্বোচ্চ ২ GB সাইজের ভিডিও আপলোড করা যাবে।');
        return;
      }
      try {
        const meta = await extractVideoMetadataAndFrames(videoFile, 4);
        const visual = await checkMediaVisualSafety({
          mediaDataUrls: meta.frames,
          fileNames: [videoFile.name],
        });
        if (!visual.safe) {
          setUploadError(visual.reason || ADULT_BLOCK_MESSAGE);
          return;
        }
        const previewBlobUrl = URL.createObjectURL(videoFile);
        registerPendingBlobFile(previewBlobUrl, {
          file: videoFile,
          durationSeconds: meta.durationSeconds,
          durationText: meta.durationText,
          frames: meta.frames,
        });
        onOpenCreateModal(previewBlobUrl);
      } catch {
        setUploadError('ভিডিওটি পড়া যায়নি। আবার চেষ্টা করুন।');
      }
      return;
    }

    const imageFiles = files.slice(0, MAX_POST_PHOTOS);
    for (const file of imageFiles) {
      const check = validateMediaUpload(file, ['image']);
      if (!check.valid) {
        setUploadError(check.error || 'Max 5MB image allowed.');
        return;
      }
    }

    try {
      const compressed = await compressPostImagesBatch(imageFiles, imageFiles.length);
      const visual = await checkMediaVisualSafety({
        mediaDataUrls: compressed.slice(0, 3),
        fileNames: imageFiles.map((f) => f.name),
      });
      if (!visual.safe) {
        setUploadError(visual.reason || ADULT_BLOCK_MESSAGE);
        return;
      }
      onOpenCreateModal(compressed);
    } catch {
      setUploadError('ছবিগুলো প্রসেস করা যায়নি। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="bg-white border border-[#E4E6EB] sm:rounded-[8px] px-3 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] space-y-2">
      <div className="flex items-center gap-2">
        {/* Hidden file input for direct device gallery access (supports up to 10 photos) */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handlePhotoSelect}
        />

        {/* User Profile or Active Page Avatar */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="w-10 h-10 rounded-full overflow-hidden border border-[#E4E6EB] flex-shrink-0 bg-neutral-100 hover:ring-2 hover:ring-[#0866FF] active:scale-95 transition-all cursor-pointer relative flex items-center justify-center"
          title={activeSwitchedPage ? `${activeSwitchedPage.name} পেজ প্রোফাইল` : 'আপনার প্রোফাইল দেখুন (View Profile)'}
        >
          {resolvedAvatar ? (
            <img
              src={resolvedAvatar}
              alt={activeSwitchedPage ? activeSwitchedPage.name : userProfile.name}
              className="w-full h-full object-cover rounded-full"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            />
          ) : (
            <span className="text-sm font-extrabold text-[#0866FF]">
              {(activeSwitchedPage ? activeSwitchedPage.name : userProfile.name).trim().charAt(0).toUpperCase() || 'P'}
            </span>
          )}
        </button>

        {/* Facebook-identical white bordered pill button (fits full "What's on your mind?" on mobile) */}
        <button
          type="button"
          onClick={() => onOpenCreateModal()}
          className="flex-1 min-w-0 text-left bg-white hover:bg-[#F0F2F5] border border-[#CED0D4] text-[#050505] text-[14px] sm:text-[15px] py-2 px-3.5 rounded-full transition-colors font-sans whitespace-nowrap cursor-pointer"
        >
          What&apos;s on your mind?
        </button>

        {/* Clean Photo/Gallery Icon on the right matching Facebook */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 text-[#65676B] hover:text-[#050505] hover:bg-[#F0F2F5] rounded-full transition-colors flex-shrink-0 active:scale-95 cursor-pointer"
          title="আপনার ফোনের গ্যালারি থেকে একসাথে সর্বোচ্চ ১০টি ছবি সিলেক্ট করুন"
          aria-label="Add photos or video"
        >
          <ImageIcon className="w-6 h-6 stroke-[1.8]" />
        </button>
      </div>
      {uploadError && (
        <p className="text-[11px] font-semibold text-rose-600 px-1">⚠️ {uploadError}</p>
      )}
    </div>
  );
};
