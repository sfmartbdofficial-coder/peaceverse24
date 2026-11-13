import React from 'react';
import { PageItem } from '../../types';

interface FbSwitchToPageSheetProps {
  isOpen: boolean;
  onClose: () => void;
  page: PageItem | null;
  onConfirmSwitch: (page: PageItem) => void;
  onViewPageWithoutSwitch?: (page: PageItem) => void;
  onEditPage?: (page: PageItem) => void;
}

export const FbSwitchToPageSheet: React.FC<FbSwitchToPageSheetProps> = ({
  isOpen,
  onClose,
  page,
  onConfirmSwitch,
  onViewPageWithoutSwitch,
  onEditPage,
}) => {
  if (!isOpen || !page) return null;

  const isSharifPage =
    page.id === 'page-sharif-story' || page.name.toLowerCase().includes("sharif's life story");

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-[1px] flex items-end justify-center p-0 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-[24px] px-5 pt-3 pb-6 text-[#050505] shadow-[0_-8px_30px_rgba(0,0,0,0.18)] animate-in slide-in-from-bottom duration-200 select-none font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drag Handle */}
        <div className="w-10 h-1 bg-[#CED0D4] rounded-full mx-auto mb-5" />

        {/* Centered Circular Page Logo + "Switch to {page.name}." */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative w-16 h-16 rounded-full border-2 border-[#0866FF] p-0.5 bg-white shadow-sm mb-3">
            {page.avatar ? (
              <img
                src={page.avatar}
                alt={page.name}
                className="w-full h-full rounded-full object-cover bg-[#E4E6EB]"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center font-extrabold text-xl">
                {page.name.trim().charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h2 className="text-[20px] font-bold text-[#050505] leading-snug tracking-tight">
            Switch to {page.name}.
          </h2>
        </div>

        {/* Middle Row: Page Avatar + Page Name + "50 notifications" + Blue [Switch] button */}
        <div className="flex items-center justify-between gap-3 py-3 px-1 border-t border-[#E4E6EB]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[#E4E6EB] bg-[#E4E6EB] flex items-center justify-center">
              {page.avatar ? (
                <img
                  src={page.avatar}
                  alt={page.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-base font-extrabold text-[#0866FF]">
                  {page.name.trim().charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-[15px] text-[#050505] truncate leading-tight">
                {page.name}
              </h3>
              <p className="text-[13px] text-[#65676B] font-medium mt-0.5 tabular-nums">
                50 notifications
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onConfirmSwitch(page);
              onClose();
            }}
            className="min-h-[40px] px-5 py-2 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] active:scale-[0.98] text-white font-bold text-[14px] shrink-0 transition-all cursor-pointer"
          >
            Switch
          </button>
        </div>

        {/* Bottom Row: Gray [See all options] button */}
        <div className="pt-3 space-y-2">
          <button
            type="button"
            onClick={() => {
              if (onViewPageWithoutSwitch) {
                onViewPageWithoutSwitch(page);
              }
              onClose();
            }}
            className="w-full min-h-[44px] py-2.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] active:scale-[0.99] text-[#050505] font-bold text-[15px] transition-colors cursor-pointer"
          >
            See all options
          </button>

          {page.isOwner && onEditPage && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditPage(page);
              }}
              className="w-full min-h-[40px] py-2 rounded-lg text-[#0866FF] hover:bg-[#F0F2F5] font-semibold text-[13px] transition-colors cursor-pointer"
            >
              Edit Page Info
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
