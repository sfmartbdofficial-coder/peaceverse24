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
    <div className="sticky top-[53px] sm:top-[57px] z-20 bg-[#0f0f0f] border-b border-neutral-800/80 py-2.5 px-2 sm:px-4">
      <div className="max-w-[1920px] mx-auto relative flex items-center">
        {/* Left Scroll Button (Desktop) */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-neutral-900/90 text-neutral-300 hover:text-white border border-neutral-700/60 hover:bg-neutral-800 shadow-md mr-1.5 flex-shrink-0 z-10"
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

            let badgeBg = 'bg-[#272727] text-neutral-200 hover:bg-[#383838]';
            if (isSelected) {
              badgeBg = 'bg-white text-neutral-950 font-bold shadow-md ring-1 ring-white';
            }

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${badgeBg}`}
              >
                {cat.id === 'Quran' && <span className="text-emerald-400 text-xs">📖</span>}
                {cat.id === 'Hadith' && <span className="text-amber-400 text-xs">📜</span>}
                {cat.id === 'Dua' && <span className="text-sky-400 text-xs">🤲</span>}
                {cat.id === 'Video' && <span className="text-teal-400 text-xs">🎙️</span>}
                {cat.id === 'Live' && <span className="text-rose-500 text-xs animate-ping">🔴</span>}
                {cat.id === 'Nasheed' && <span className="text-purple-400 text-xs">🎵</span>}
                {cat.id === 'Kids' && <span className="text-yellow-400 text-xs">🧒</span>}

                <span>{cat.label}</span>
                <span className={`text-[10px] hidden sm:inline ${isSelected ? 'text-neutral-800 font-semibold' : 'text-neutral-400'}`}>
                  • {cat.labelBangla}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button (Desktop) */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-neutral-900/90 text-neutral-300 hover:text-white border border-neutral-700/60 hover:bg-neutral-800 shadow-md ml-1.5 flex-shrink-0 z-10"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
