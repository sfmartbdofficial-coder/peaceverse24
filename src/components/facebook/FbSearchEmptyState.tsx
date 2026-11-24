import React, { useState } from 'react';
import { Search, Users, UserPlus, Flag, Check } from 'lucide-react';

interface FbSearchEmptyStateProps {
  query: string;
  onCreatePageWithName?: (name: string) => void;
}

export const FbSearchEmptyState: React.FC<FbSearchEmptyStateProps> = ({
  query,
  onCreatePageWithName,
}) => {
  const [inviteCopied, setInviteCopied] = useState(false);
  const trimmed = query.trim();

  const handleInviteFriends = async () => {
    const shareUrl = window.location.origin;
    const shareText = `Peaceverse24.com এ যোগ দিন — ১০০% হালাল সোশ্যাল মিডিয়া! ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Peaceverse24.com',
          text: 'Peaceverse24.com এ আমার সাথে যোগ দিন!',
          url: shareUrl,
        });
        setInviteCopied(true);
        setTimeout(() => setInviteCopied(false), 3000);
        return;
      } catch {
        // User dismissed or unsupported, fall back to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // Fallback copy if clipboard permission unavailable
    }
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 3000);
  };

  return (
    <div className="bg-white rounded-[12px] border border-[#E4E6EB] px-5 py-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.08)] my-2">
      {/* Icon: Magnifying glass + People / Friendly sad cue */}
      <div className="relative w-20 h-20 rounded-full bg-[#F0F2F5] border border-[#E4E6EB] flex items-center justify-center mx-auto mb-4">
        <Search className="w-9 h-9 text-[#65676B]" />
        <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#E7F3FF] border-2 border-white flex items-center justify-center text-[#0866FF] shadow-xs">
          <Users className="w-4 h-4" />
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[17px] font-bold text-[#050505] leading-snug">
        &ldquo;{trimmed}&rdquo; এর জন্য কোনো রেজাল্ট পাওয়া যায়নি
      </h3>

      {/* Encouraging genuine subtitle */}
      <p className="text-[13px] text-[#65676B] max-w-sm mx-auto mt-2 leading-relaxed">
        এই নামে কোনো অ্যাকাউন্ট বা পেজ পাওয়া যায়নি। নামের বানান যাচাই করুন অথবা আপনার বন্ধুদের ইনভাইট করুন।
      </p>

      {/* Action Buttons */}
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-sm mx-auto">
        <button
          type="button"
          onClick={handleInviteFriends}
          className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          {inviteCopied ? (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>ইনভাইট লিংক কপি হয়েছে!</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>বন্ধুদের ইনভাইট করুন</span>
            </>
          )}
        </button>

        {onCreatePageWithName && (
          <button
            type="button"
            onClick={() => onCreatePageWithName(trimmed)}
            className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Flag className="w-4 h-4 text-[#0866FF]" />
            <span className="truncate">&ldquo;{trimmed}&rdquo; নামে পেজ খুলুন</span>
          </button>
        )}
      </div>

      {inviteCopied && (
        <p className="text-[11px] font-semibold text-[#00A651] mt-3">
          লিঙ্ক শেয়ারের জন্য প্রস্তুত! আপনার বন্ধুদের সাথে শেয়ার করুন।
        </p>
      )}
    </div>
  );
};
