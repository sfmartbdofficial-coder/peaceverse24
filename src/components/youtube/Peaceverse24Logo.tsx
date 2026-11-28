import React from 'react';

interface Peaceverse24LogoProps {
  showTagline?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export const Peaceverse24Logo: React.FC<Peaceverse24LogoProps> = ({
  showTagline = false,
  compact = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-left cursor-pointer group shrink-0 focus:outline-none"
      aria-label="Peaceverse24 Home"
    >
      {/* YouTube Play Button + Green Peace Dove Emblem */}
      <span className="relative inline-flex items-center justify-center w-9 h-7 rounded-[9px] bg-[#DC2626] group-hover:bg-[#B91C1C] transition-colors shadow-xs shrink-0 overflow-hidden">
        {/* Green peace corner touch */}
        <span
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#16A34A]"
          aria-hidden="true"
        />
        <svg
          viewBox="0 0 36 26"
          className="relative z-10 w-6 h-4.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Play Triangle */}
          <path d="M10 6.2L20.2 12.6L10 19V6.2Z" fill="#FFFFFF" />
          {/* Peace Dove silhouette flying cleanly over play edge */}
          <path
            d="M17.5 11.4C19.8 8.3 24.4 6.5 28.4 7.3C26.5 8.8 25.5 10.6 25.4 12.1C27.2 12 28.7 12.6 29.8 13.7C27.6 14.3 25.8 15.6 24.6 17.5C22.4 18.6 19.6 18.1 17.7 16.2L15.1 18.2L16.3 14.6C15.5 13.6 16.1 12.5 17.5 11.4Z"
            fill="#FFFFFF"
          />
          <circle cx="25.9" cy="9.9" r="0.8" fill="#16A34A" />
        </svg>
      </span>

      <span className="flex flex-col leading-none">
        <span
          className={`font-extrabold tracking-tight text-zinc-950 ${
            compact ? 'text-[17px]' : 'text-[19px]'
          }`}
        >
          Peaceverse<span className="text-[#16A34A]">24</span>
        </span>
        {showTagline && (
          <span className="text-[10px] font-semibold text-zinc-500 mt-0.5 tracking-wide">
            Peace in Every Video
          </span>
        )}
      </span>
    </button>
  );
};
