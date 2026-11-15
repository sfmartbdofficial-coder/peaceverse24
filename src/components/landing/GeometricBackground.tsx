import React from 'react';

export const GeometricBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-white text-black overflow-x-hidden selection:bg-[#0866FF] selection:text-white">
      {/* Subtle Islamic geometric arabesque star watermark in top background */}
      <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[720px] opacity-[0.05] select-none flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 600 600" className="w-[880px] h-[880px]" stroke="#0866FF" fill="none">
          <g strokeWidth="1">
            {[0, 45, 90, 135].map((deg) => (
              <rect
                key={deg}
                x="150"
                y="150"
                width="300"
                height="300"
                transform={`rotate(${deg} 300 300)`}
              />
            ))}
            <circle cx="300" cy="300" r="180" strokeDasharray="4 6" />
            <circle cx="300" cy="300" r="240" />
            <circle cx="300" cy="300" r="280" strokeDasharray="2 8" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="300"
                y1="300"
                x2="300"
                y2="20"
                transform={`rotate(${deg} 300 300)`}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
