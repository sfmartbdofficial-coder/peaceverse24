import React from 'react';

export const GeometricBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-white overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* 1. Deep cosmic radial glow at top behind hero */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] max-w-[140vw] h-[640px] rounded-full blur-[110px] opacity-75"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.42) 0%, rgba(14, 165, 233, 0.22) 40%, rgba(3, 7, 18, 0) 75%)',
        }}
      />

      {/* 2. Secondary ambient glow around middle and bottom */}
      <div
        className="pointer-events-none absolute top-[750px] -left-36 w-[480px] h-[520px] rounded-full blur-[130px] opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(24, 119, 242, 0.35) 0%, rgba(3, 7, 18, 0) 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute top-[1400px] -right-36 w-[520px] h-[560px] rounded-full blur-[140px] opacity-45"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(3, 7, 18, 0) 70%)',
        }}
      />

      {/* 3. Islamic geometric arabesque star watermark in top background */}
      <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[720px] opacity-[0.07] select-none flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 600 600" className="w-[880px] h-[880px]" stroke="#38bdf8" fill="none">
          <g strokeWidth="1">
            {/* Concentric geometric stars */}
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
