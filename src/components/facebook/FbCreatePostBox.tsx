import React, { useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { UserProfile, PageItem } from '../../types';

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
    <div className="bg-white dark:bg-[#1C1C1D] border border-[#E4E6EB] dark:border-[#222222] rounded-[8px] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex items-center gap-2.5">
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
        className="w-10 h-10 rounded-full overflow-hidden border border-[#E4E6EB] dark:border-[#222222] flex-shrink-0 bg-neutral-100 hover:ring-2 hover:ring-[#0866FF] active:scale-95 transition-all cursor-pointer relative"
        title={activeSwitchedPage ? `${activeSwitchedPage.name} পেজ প্রোফাইল` : "আপনার প্রোফাইল দেখুন (View Profile)"}
      >
        <img
          src={activeSwitchedPage ? activeSwitchedPage.avatar : userProfile.avatar}
          alt={activeSwitchedPage ? activeSwitchedPage.name : userProfile.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80';
          }}
          className="w-full h-full object-cover rounded-full"
          style={{ width: '40px', height: '40px', borderRadius: '50%' }}
        />
      </button>

      {/* What's on your mind? Pill button */}
      <button
        onClick={() => onOpenCreateModal()}
        className="flex-1 text-left bg-[#F0F2F5] hover:bg-[#E4E6EB] dark:bg-[#3A3B3C] dark:hover:bg-[#4E4F50] text-[#65676B] dark:text-[#aaaaaa] text-[15px] py-2.5 px-4 rounded-full transition-colors font-sans truncate cursor-pointer"
      >
        What&apos;s on your mind?
      </button>

      {/* Green Photo Icon on the right */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-[#45bd62] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-full transition-colors flex-shrink-0 active:scale-95 cursor-pointer"
        title="আপনার ফোন বা ডিভাইসের গ্যালারি খুলুন"
      >
        <ImageIcon className="w-6 h-6 stroke-[2]" />
      </button>
    </div>
  );
};
