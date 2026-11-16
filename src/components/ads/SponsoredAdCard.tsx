import React from 'react';
import { ExternalLink, Megaphone } from 'lucide-react';
import { AdSlot } from '../../types/admin';

interface SponsoredAdCardProps {
  ad: AdSlot;
  variant?: 'feed' | 'banner';
  onAdClick?: (ad: AdSlot) => void;
}

export const SponsoredAdCard: React.FC<SponsoredAdCardProps> = ({
  ad,
  variant = 'feed',
  onAdClick,
}) => {
  const handleOpen = () => {
    onAdClick?.(ad);
    if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (variant === 'banner') {
    return (
      <div className="bg-white rounded-xl border border-[#E4E6EB] shadow-2xs p-3 flex items-center gap-3 my-2">
        <img
          src={ad.imageUrl}
          alt={ad.adTitle}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-[#E4E6EB]"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0866FF] uppercase tracking-wide">
            <Megaphone className="w-3 h-3" />
            <span>Sponsored • {ad.sponsorName}</span>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-[#050505] truncate mt-0.5">
            {ad.adTitle}
          </h4>
          <p className="text-[11px] text-[#65676B] line-clamp-2 mt-0.5">
            {ad.adDescription}
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpen}
          className="px-3 py-2 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>দেখুন</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <article className="bg-white rounded-[8px] border border-[#E4E6EB] shadow-[0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden">
      <div className="p-3 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0866FF] to-emerald-500 text-white font-black text-sm flex items-center justify-center shrink-0">
            {ad.sponsorName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#050505] truncate">{ad.sponsorName}</p>
            <p className="text-[11px] text-[#65676B] flex items-center gap-1">
              <span>Sponsored · স্পন্সরড</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">{ad.category}</span>
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[#F0F2F5] border border-[#E4E6EB] text-[10px] font-bold text-[#65676B]">
          Ad
        </span>
      </div>

      <div className="px-3 pb-2.5">
        <h3 className="text-sm font-bold text-[#050505]">{ad.adTitle}</h3>
        <p className="text-xs text-[#65676B] mt-1 leading-relaxed">{ad.adDescription}</p>
      </div>

      {ad.imageUrl && (
        <div
          onClick={handleOpen}
          className="w-full max-h-80 overflow-hidden bg-[#F0F2F5] cursor-pointer"
        >
          <img
            src={ad.imageUrl}
            alt={ad.adTitle}
            className="w-full h-56 sm:h-64 object-cover hover:scale-[1.01] transition-transform"
          />
        </div>
      )}

      <div className="px-3 py-2.5 bg-[#F0F2F5] border-t border-[#E4E6EB] flex items-center justify-between gap-2">
        <span className="text-[11px] text-[#65676B] truncate">
          {ad.targetUrl ? ad.targetUrl.replace(/^https?:\/\//, '') : 'peaceverse24.com'}
        </span>
        <button
          type="button"
          onClick={handleOpen}
          className="px-4 py-1.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>বিস্তারিত দেখুন</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
