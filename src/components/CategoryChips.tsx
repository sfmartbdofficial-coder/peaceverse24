import React, { useRef } from 'react';
import { CATEGORIES } from '../data/islamicVideos';
import { ChevronLeft, ChevronRight, Compass } from 'lucide-react';

interface CategoryChipsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-[53px] sm:top-[57px] z-20 bg-white border-b border-[#E4E6EB] py-2.5 px-2 sm:px-4">
      <div className="max-w-[1920px] mx-auto relative flex items-center">
        {/* Left Scroll Button (Desktop) */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-[#F0F2F5] text-[#65676B] hover:text-black border border-[#E4E6EB] hover:bg-[#E4E6EB] shadow-2xs mr-1.5 flex-shrink-0 z-10"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Chips */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            let badgeBg = 'bg-[#F0F2F5] text-black hover:bg-[#E4E6EB] border border-[#E4E6EB]';
            if (isSelected) {
              badgeBg = 'bg-[#0866FF] text-white font-bold shadow-xs border border-[#0866FF]';
            }

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${badgeBg}`}
              >
                {cat.id === 'Quran' && <span className="text-xs">📖</span>}
                {cat.id === 'Hadith' && <span className="text-xs">📜</span>}
                {cat.id === 'Dua' && <span className="text-xs">🤲</span>}
                {cat.id === 'Video' && <span className="text-xs">🎙️</span>}
                {cat.id === 'Live' && <span className="text-xs animate-ping">🔴</span>}
                {cat.id === 'Nasheed' && <span className="text-xs">🎵</span>}
                {cat.id === 'Kids' && <span className="text-xs">🧒</span>}

                <span>{cat.label}</span>
                <span className={`text-[10px] hidden sm:inline ${isSelected ? 'text-white/90 font-semibold' : 'text-[#65676B]'}`}>
                  • {cat.labelBangla}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button (Desktop) */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-[#F0F2F5] text-[#65676B] hover:text-black border border-[#E4E6EB] hover:bg-[#E4E6EB] shadow-2xs ml-1.5 flex-shrink-0 z-10"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
