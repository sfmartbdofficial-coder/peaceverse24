import React from 'react';

interface PeaceDoveEmblemProps {
  className?: string;
  size?: number;
}

export const PeaceDoveEmblem: React.FC<PeaceDoveEmblemProps> = ({
  className = '',
  size = 190,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/30 via-cyan-500/25 to-blue-400/20 blur-xl animate-pulse"
        style={{ animationDuration: '4s' }}
      />

      {/* Main SVG Container */}
      <svg
        viewBox="0 0 260 260"
        width={size}
        height={size}
        className="relative z-10 drop-shadow-[0_0_25px_rgba(56,189,248,0.55)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radial gradient for glowing disc background */}
          <radialGradient id="discBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#0f1f4d" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#0a1330" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#050a1c" stopOpacity="1" />
          </radialGradient>

          {/* Glowing neon ring gradient */}
          <linearGradient id="neonRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="45%" stopColor="#38bdf8" />
            <stop offset="80%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>

          {/* Dove body gradient */}
          <linearGradient id="doveFill" x1="30%" y1="20%" x2="70%" y2="80%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
          </linearGradient>

          {/* Neon stroke filter for extra glow */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.8" />
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#1d4ed8" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* 1. Base dark glowing circular disc */}
        <circle cx="130" cy="130" r="120" fill="url(#discBg)" stroke="url(#neonRing)" strokeWidth="2.5" />

        {/* 2. Concentric inner decorative rings */}
        <circle cx="130" cy="130" r="114" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 3" />
        <circle cx="130" cy="130" r="102" stroke="#60a5fa" strokeWidth="1.2" strokeOpacity="0.5" />
        <circle cx="130" cy="130" r="96" stroke="#93c5fd" strokeWidth="0.8" strokeOpacity="0.3" />

        {/* 3. Intricate Geometric Mosaic Border Ring (Mandala pattern around border) */}
        <g stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.45" filter="url(#neonGlow)">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 130 130)`}>
              <path d="M 130 16 L 136 28 L 130 34 L 124 28 Z" fill="#38bdf8" fillOpacity="0.2" />
              <line x1="130" y1="28" x2="130" y2="40" />
              <path d="M 124 28 Q 130 33 136 28" />
            </g>
          ))}
        </g>

        {/* 4. Background Arabesque / Geometric Interlacing Lines */}
        <g stroke="#60a5fa" strokeWidth="0.9" strokeOpacity="0.28">
          {/* 8-pointed star in background */}
          <polygon points="130,52 148,82 182,78 178,112 208,130 178,148 182,182 148,178 130,208 112,178 78,182 82,148 52,130 82,112 78,78 112,82" />
          <polygon points="130,62 145,88 174,85 171,114 197,130 171,146 174,175 145,172 130,198 115,172 86,175 89,146 63,130 89,114 86,85 115,88" strokeOpacity="0.18" />
        </g>

        {/* 5. The Majestic Peace Dove (Mosaic Stained-Glass Geometric Art) */}
        <g id="peace-dove" filter="url(#neonGlow)">
          {/* Main Wing Back */}
          <path
            d="M 124 122 C 112 90 100 68 82 56 C 104 68 118 84 126 102 Z"
            fill="url(#doveFill)"
            stroke="#7dd3fc"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M 102 70 C 114 84 122 100 126 114"
            stroke="#bae6fd"
            strokeWidth="1.2"
            strokeOpacity="0.75"
          />

          {/* Main Wing Front (Large fan with geometric feathers) */}
          <path
            d="M 132 118 C 142 86 160 58 194 48 C 182 66 174 88 168 106 C 160 114 148 118 132 118 Z"
            fill="url(#doveFill)"
            stroke="#e0f2fe"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Feather internal polygon facets */}
          <path d="M 182 56 L 160 88" stroke="#7dd3fc" strokeWidth="1.2" />
          <path d="M 170 70 L 150 98" stroke="#7dd3fc" strokeWidth="1.2" />
          <path d="M 158 84 L 142 108" stroke="#7dd3fc" strokeWidth="1.2" />

          {/* Dove Body & Chest */}
          <path
            d="M 106 130 C 100 114 110 96 126 94 C 132 94 138 98 142 104 C 146 112 144 124 138 136 C 130 148 116 156 104 156 C 96 156 94 148 98 140 Z"
            fill="url(#doveFill)"
            stroke="#e0f2fe"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Neck & Head gracefully arched */}
          <path
            d="M 126 94 C 130 84 138 76 150 74 C 158 72 164 76 168 82 C 168 86 164 92 156 96 C 148 100 140 102 136 104 Z"
            fill="url(#doveFill)"
            stroke="#e0f2fe"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Beak with olive/peace twig */}
          <polygon points="168,78 180,79 169,83" fill="#bae6fd" stroke="#e0f2fe" strokeWidth="1.2" />
          <circle cx="156" cy="79" r="2.2" fill="#e0f2fe" />

          {/* Tail Feathers with geometric fan */}
          <path
            d="M 98 144 C 84 156 70 172 58 194 C 74 186 92 176 104 162 Z"
            fill="url(#doveFill)"
            stroke="#7dd3fc"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M 90 152 C 78 166 66 182 52 206 C 70 196 86 182 98 168 Z"
            fill="url(#doveFill)"
            stroke="#38bdf8"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <line x1="78" y1="172" x2="94" y2="158" stroke="#bae6fd" strokeWidth="1.1" />

          {/* Inner body facet lines creating stained-glass effect */}
          <line x1="116" y1="108" x2="132" y2="136" stroke="#bae6fd" strokeWidth="1" strokeOpacity="0.8" />
          <line x1="126" y1="120" x2="108" y2="146" stroke="#bae6fd" strokeWidth="1" strokeOpacity="0.8" />
          <line x1="134" y1="108" x2="120" y2="130" stroke="#bae6fd" strokeWidth="1" strokeOpacity="0.8" />
        </g>

        {/* 6. Subtle Sparkles / Stars around the dove */}
        <g fill="#e0f2fe" opacity="0.85">
          <circle cx="68" cy="98" r="1.5" />
          <circle cx="196" cy="116" r="1.8" />
          <circle cx="188" cy="168" r="1.5" />
          <circle cx="84" cy="76" r="1.2" />
          <circle cx="148" cy="46" r="1.6" />
        </g>
      </svg>
    </div>
  );
};
