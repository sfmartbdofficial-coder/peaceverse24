import React, { useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { UserProfile } from '../../types';

interface FbCreatePostBoxProps {
  userProfile: UserProfile;
  onOpenCreateModal: (initialPhoto?: string) => void;
  onOpenProfile?: () => void;
}

export const FbCreatePostBox: React.FC<FbCreatePostBoxProps> = ({
  userProfile,
  onOpenCreateModal,
  onOpenProfile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    <div className="bg-[#242526] border-b border-[#393a3b] px-3.5 py-2.5 shadow-sm">
      {/* Hidden file input for direct device gallery access */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        className="hidden"
        onChange={handlePhotoSelect}
      />

      <div className="flex items-center gap-3">
        {/* User Profile Avatar with ring - Clicking opens user profile just like Facebook */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="w-10 h-10 rounded-full overflow-hidden border border-[#393a3b] flex-shrink-0 bg-neutral-800 hover:ring-2 hover:ring-[#1877F2] active:scale-95 transition-all cursor-pointer"
          title="আপনার প্রোফাইল দেখুন (View Profile)"
        >
          <img
            src={userProfile.avatar}
            alt={userProfile.name}
            className="w-full h-full object-cover"
          />
        </button>

        {/* What's on your mind? Pill button */}
        <button
          onClick={() => onOpenCreateModal()}
          className="flex-1 text-left bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] text-sm px-4 py-2.5 rounded-full transition-colors font-sans truncate shadow-inner"
        >
          What&apos;s on your mind?
        </button>

        {/* Green Photo Icon on the right: triggers real device gallery immediately */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-[#45bd62] hover:bg-[#3a3b3c] rounded-full transition-colors flex-shrink-0 active:scale-95"
          title="আপনার ফোন বা ডিভাইসের গ্যালারি খুলুন"
        >
          <ImageIcon className="w-6 h-6 stroke-[2]" />
        </button>
      </div>
    </div>
  );
};
