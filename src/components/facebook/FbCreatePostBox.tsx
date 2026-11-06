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
    <div className="bg-[#1C1C1D] border border-[#222222] rounded-[10px] p-3 shadow-sm flex items-center gap-2.5">
      {/* Hidden file input for direct device gallery access */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        className="hidden"
        onChange={handlePhotoSelect}
      />

      {/* User Profile Avatar with ring */}
      <button
        type="button"
        onClick={onOpenProfile}
        className="w-10 h-10 rounded-full overflow-hidden border border-[#222222] flex-shrink-0 bg-neutral-800 hover:ring-2 hover:ring-[#0064FF] active:scale-95 transition-all cursor-pointer"
        title="আপনার প্রোফাইল দেখুন (View Profile)"
      >
        <img
          src={userProfile.avatar}
          alt={userProfile.name}
          className="w-full h-full object-cover rounded-full"
          style={{ width: '40px', height: '40px', borderRadius: '50%' }}
        />
      </button>

      {/* What's on your mind? Pill button */}
      <button
        onClick={() => onOpenCreateModal()}
        className="flex-1 text-left bg-[#3A3B3C] hover:bg-[#4E4F50] text-[#aaaaaa] text-sm py-2.5 px-4 rounded-full transition-colors font-sans truncate cursor-pointer shadow-inner"
      >
        What&apos;s on your mind?
      </button>

      {/* Green Photo Icon on the right */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-[#45bd62] hover:bg-[#3A3B3C] rounded-full transition-colors flex-shrink-0 active:scale-95"
        title="আপনার ফোন বা ডিভাইসের গ্যালারি খুলুন"
      >
        <ImageIcon className="w-5 h-5 stroke-[2]" />
      </button>
    </div>
  );
};
