import React, { useRef, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { UserProfile, PageItem } from '../../types';
import { validateMediaUpload } from '../../utils/security';

interface FbCreatePostBoxProps {
  userProfile: UserProfile;
  activeSwitchedPage?: PageItem | null;
  onOpenCreateModal: (initialPhoto?: string) => void;
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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const check = validateMediaUpload(file, ['image', 'video']);
      if (!check.valid) {
        setUploadError(check.error || 'Max 5MB image/video allowed.');
        e.target.value = '';
        return;
      }
      setUploadError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onOpenCreateModal(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white border border-[#E4E6EB] rounded-[8px] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.1)] space-y-2">
    <div className="flex items-center gap-2.5">
      {/* Hidden file input for direct device gallery access */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
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
        title="আপনার ফোন বা ডিভাইসের গ্যালারি খুলুন"
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
