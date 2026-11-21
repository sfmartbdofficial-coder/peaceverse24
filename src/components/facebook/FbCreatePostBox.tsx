import React, { useRef, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { UserProfile, PageItem } from '../../types';
import { validateMediaUpload } from '../../utils/security';
import {
  compressPostImagesBatch,
  extractVideoFrameDataUrl,
  MAX_POST_PHOTOS,
  readFileAsDataUrl,
} from '../../utils/imageCompress';
import {
  ADULT_BLOCK_MESSAGE,
  checkMediaFilenamesSafe,
  checkMediaVisualSafety,
} from '../../lib/halalFilter';

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

    const videoFile = files.find((f) => f.type.startsWith('video/'));
    if (videoFile) {
      const check = validateMediaUpload(videoFile, ['video']);
      if (!check.valid) {
        setUploadError(check.error || 'Max 50MB video allowed.');
        return;
      }
      try {
        const frame = await extractVideoFrameDataUrl(videoFile);
        const visual = await checkMediaVisualSafety({
          mediaDataUrls: frame ? [frame] : [],
          fileNames: [videoFile.name],
        });
        if (!visual.safe) {
          setUploadError(visual.reason || ADULT_BLOCK_MESSAGE);
          return;
        }
        const videoUrl = await readFileAsDataUrl(videoFile);
        onOpenCreateModal(videoUrl);
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
    <div className="bg-white border border-[#E4E6EB] rounded-[8px] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.1)] space-y-2">
    <div className="flex items-center gap-2.5">
      {/* Hidden file input for direct device gallery access (supports up to 10 photos) */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handlePhotoSelect}
      />

      {/* User Profile or Active Page Avatar with ring matching Screenshot 3 */}
      <button
        type="button"
        onClick={onOpenProfile}
        className="w-10 h-10 rounded-full overflow-hidden border border-[#E4E6EB] flex-shrink-0 bg-neutral-100 hover:ring-2 hover:ring-[#0866FF] active:scale-95 transition-all cursor-pointer relative flex items-center justify-center"
        title={activeSwitchedPage ? `${activeSwitchedPage.name} পেজ প্রোফাইল` : "আপনার প্রোফাইল দেখুন (View Profile)"}
      >
        {(activeSwitchedPage ? activeSwitchedPage.avatar : userProfile.avatar) ? (
          <img
            src={activeSwitchedPage ? activeSwitchedPage.avatar : userProfile.avatar}
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

      {/* What's on your mind? Pill button */}
      <button
        onClick={() => onOpenCreateModal()}
        className="flex-1 text-left bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] text-[15px] py-2.5 px-4 rounded-full transition-colors font-sans truncate cursor-pointer"
      >
        What&apos;s on your mind?
      </button>

      {/* Green Photo Icon on the right */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-[#45bd62] hover:bg-[#F0F2F5] rounded-full transition-colors flex-shrink-0 active:scale-95 cursor-pointer"
        title="আপনার ফোনের গ্যালারি থেকে একসাথে সর্বোচ্চ ১০টি ছবি সিলেক্ট করুন"
      >
        <ImageIcon className="w-6 h-6 stroke-[2]" />
      </button>
    </div>
    {uploadError && (
      <p className="text-[11px] font-semibold text-rose-600 px-1">⚠️ {uploadError}</p>
    )}
    </div>
  );
};
