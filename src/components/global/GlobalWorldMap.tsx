import React, { useState } from 'react';
import { Globe, Users, MapPin, DollarSign, Sparkles } from 'lucide-react';

export interface CountryNode {
  code: string;
  country: string;
  flag: string;
  x: number; // percentage on equirectangular SVG (0-1000)
  y: number; // percentage on equirectangular SVG (0-500)
  onlineUsers: number;
  followers: number;
  hadiyaUsd: number;
  highlight?: boolean;
}

export const GLOBAL_COUNTRY_NODES: CountryNode[] = [
  { code: 'US', country: 'USA', flag: '🇺🇸', x: 215, y: 175, onlineUsers: 18420, followers: 14200, hadiyaUsd: 1240, highlight: true },
  { code: 'CA', country: 'Canada', flag: '🇨🇦', x: 205, y: 130, onlineUsers: 6150, followers: 4800, hadiyaUsd: 420 },
  { code: 'GB', country: 'UK', flag: '🇬🇧', x: 472, y: 132, onlineUsers: 15890, followers: 12900, hadiyaUsd: 1180, highlight: true },
  { code: 'FR', country: 'France', flag: '🇫🇷', x: 486, y: 154, onlineUsers: 9320, followers: 7400, hadiyaUsd: 590 },
  { code: 'DE', country: 'Germany', flag: '🇩🇪', x: 508, y: 142, onlineUsers: 8740, followers: 6900, hadiyaUsd: 540 },
  { code: 'MA', country: 'Morocco', flag: '🇲🇦', x: 458, y: 196, onlineUsers: 5410, followers: 4100, hadiyaUsd: 260 },
  { code: 'TR', country: 'Türkiye', flag: '🇹🇷', x: 558, y: 170, onlineUsers: 14200, followers: 11300, hadiyaUsd: 780 },
  { code: 'EG', country: 'Egypt', flag: '🇪🇬', x: 554, y: 212, onlineUsers: 13900, followers: 10800, hadiyaUsd: 460 },
  { code: 'SA', country: 'Saudi Arabia', flag: '🇸🇦', x: 596, y: 226, onlineUsers: 22600, followers: 19400, hadiyaUsd: 1680, highlight: true },
  { code: 'AE', country: 'UAE', flag: '🇦🇪', x: 626, y: 224, onlineUsers: 9840, followers: 8100, hadiyaUsd: 890 },
  { code: 'QA', country: 'Qatar', flag: '🇶🇦', x: 616, y: 220, onlineUsers: 4320, followers: 3600, hadiyaUsd: 510 },
  { code: 'NG', country: 'Nigeria', flag: '🇳🇬', x: 498, y: 268, onlineUsers: 11450, followers: 8900, hadiyaUsd: 310 },
  { code: 'PK', country: 'Pakistan', flag: '🇵🇰', x: 668, y: 204, onlineUsers: 16780, followers: 13500, hadiyaUsd: 490 },
  { code: 'IN', country: 'India', flag: '🇮🇳', x: 698, y: 224, onlineUsers: 19230, followers: 15800, hadiyaUsd: 520 },
  { code: 'BD', country: 'Bangladesh', flag: '🇧🇩', x: 730, y: 220, onlineUsers: 24500, followers: 21000, hadiyaUsd: 640 },
  { code: 'MY', country: 'Malaysia', flag: '🇲🇾', x: 766, y: 282, onlineUsers: 12940, followers: 10400, hadiyaUsd: 730 },
  { code: 'SG', country: 'Singapore', flag: '🇸🇬', x: 774, y: 294, onlineUsers: 4850, followers: 3900, hadiyaUsd: 480 },
  { code: 'ID', country: 'Indonesia', flag: '🇮🇩', x: 794, y: 310, onlineUsers: 28900, followers: 24600, hadiyaUsd: 1120, highlight: true },
  { code: 'JP', country: 'Japan', flag: '🇯🇵', x: 858, y: 182, onlineUsers: 3640, followers: 2800, hadiyaUsd: 390 },
  { code: 'AU', country: 'Australia', flag: '🇦🇺', x: 842, y: 382, onlineUsers: 6910, followers: 5200, hadiyaUsd: 610 },
];

interface GlobalWorldMapProps {
  mode?: 'landing' | 'creator';
  compact?: boolean;
}

export const GlobalWorldMap: React.FC<GlobalWorldMapProps> = ({
  mode = 'landing',
  compact = false,
}) => {
  const [selectedNode, setSelectedNode] = useState<CountryNode>(
    GLOBAL_COUNTRY_NODES.find((c) => c.code === 'SA') || GLOBAL_COUNTRY_NODES[0]
  );

  const totalOnline = GLOBAL_COUNTRY_NODES.reduce((s, n) => s + n.onlineUsers, 0);
  const totalHadiya = GLOBAL_COUNTRY_NODES.reduce((s, n) => s + n.hadiyaUsd, 0);
  const totalFollowers = GLOBAL_COUNTRY_NODES.reduce((s, n) => s + n.followers, 0);

  return (
    <div className="rounded-2xl bg-[#071124] border border-sky-500/30 overflow-hidden shadow-xl text-white">
      {/* Top Map Header */}
      <div className="px-4 py-3 border-b border-sky-500/20 flex flex-wrap items-center justify-between gap-2 bg-[#0b1730]">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs sm:text-sm font-bold text-white">
            {mode === 'creator'
              ? 'Global Ummah Reach & Hadiya Map (20 Countries)'
              : 'Live Global Community Map · 2 Billion Muslims Connected'}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-semibold tabular-nums">
          {mode === 'creator' ? (
            <>
              <span className="text-emerald-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                ${totalHadiya.toLocaleString()} Hadiya
              </span>
              <span className="text-sky-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {totalFollowers.toLocaleString()} Followers
              </span>
            </>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{totalOnline.toLocaleString()} Online Now</span>
            </span>
          )}
        </div>
      </div>

      {/* Interactive Vector World Map */}
      <div className={`relative w-full ${compact ? 'aspect-[2.2/1]' : 'aspect-[2/1]'} bg-[#040b18] overflow-hidden`}>
        <svg viewBox="0 0 1000 500" className="w-full h-full select-none">
          <defs>
            <radialGradient id="globeGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="1000" height="500" fill="url(#globeGlow)" />

          {/* Latitude / Longitude Grid Lines */}
          {[100, 200, 300, 400].map((y) => (
            <line key={`lat-${y}`} x1="0" y1={y} x2="1000" y2={y} stroke="#1e293b" strokeWidth="0.7" strokeDasharray="4 4" />
          ))}
          {[166, 333, 500, 666, 833].map((x) => (
            <line key={`lng-${x}`} x1={x} y1="0" x2={x} y2="500" stroke="#1e293b" strokeWidth="0.7" strokeDasharray="4 4" />
          ))}

          {/* Stylized Continents Silhouettes */}
          <g fill="#162847" stroke="#2563eb" strokeOpacity="0.45" strokeWidth="1.2">
            {/* North America */}
            <path d="M90,90 L260,72 L305,125 L265,180 L235,215 L195,248 L168,230 L145,190 L105,155 Z" />
            {/* South America */}
            <path d="M235,268 L305,275 L340,330 L312,415 L268,452 L245,380 L225,315 Z" />
            {/* Europe */}
            <path d="M445,88 L555,82 L578,132 L542,162 L462,165 L442,135 Z" />
            {/* Africa */}
            <path d="M448,184 L558,182 L598,232 L572,332 L528,405 L488,365 L472,290 L438,242 Z" />
            {/* Middle East & Asia */}
            <path d="M562,135 L650,102 L820,95 L878,158 L830,222 L772,265 L732,258 L692,248 L645,232 L595,244 L568,200 Z" />
            {/* Maritime SE Asia (Indonesia / Malaysia) */}
            <path d="M745,274 L845,288 L858,325 L765,322 Z" />
            {/* Australia */}
            <path d="M790,350 L890,342 L912,402 L845,428 L788,395 Z" />
          </g>

          {/* Connection Arcs from Makkah Hub (596, 226) to Global Communities */}
          {GLOBAL_COUNTRY_NODES.filter((n) => n.code !== 'SA').map((node) => {
            const mx = (596 + node.x) / 2;
            const my = Math.min(226, node.y) - 38;
            return (
              <path
                key={`arc-${node.code}`}
                d={`M 596 226 Q ${mx} ${my} ${node.x} ${node.y}`}
                fill="none"
                stroke={selectedNode.code === node.code ? '#38bdf8' : '#10b981'}
                strokeOpacity={selectedNode.code === node.code ? 0.85 : 0.25}
                strokeWidth={selectedNode.code === node.code ? 2 : 1}
                strokeDasharray="4 3"
              />
            );
          })}

          {/* Interactive Country Pins */}
          {GLOBAL_COUNTRY_NODES.map((node) => {
            const isSelected = selectedNode.code === node.code;
            const isKeyHub = Boolean(node.highlight);
            return (
              <g
                key={node.code}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer"
              >
                {(isKeyHub || isSelected) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 18 : 13}
                    fill={node.code === 'SA' ? '#f59e0b' : '#10b981'}
                    fillOpacity="0.22"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 7.5 : isKeyHub ? 6 : 4.5}
                  fill={isSelected ? '#38bdf8' : node.code === 'SA' ? '#f59e0b' : '#10b981'}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 2 : 1.2}
                />
                {(isKeyHub || isSelected) && (
                  <text
                    x={node.x}
                    y={node.y - 11}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="11"
                    fontWeight="700"
                  >
                    {node.flag} {node.country}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Bottom Overlay Selected Country Card */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:left-4 sm:right-auto sm:min-w-[270px] bg-slate-950/90 backdrop-blur-md border border-sky-400/40 rounded-xl p-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl shrink-0">{selectedNode.flag}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white flex items-center gap-1 truncate">
                <span>{selectedNode.country}</span>
                {selectedNode.code === 'SA' && (
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                )}
              </p>
              <p className="text-[11px] text-sky-300 tabular-nums">
                {mode === 'creator'
                  ? `${selectedNode.followers.toLocaleString()} followers · $${selectedNode.hadiyaUsd} Hadiya`
                  : `${selectedNode.onlineUsers.toLocaleString()} users online now`}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 shrink-0">
            <MapPin className="w-3 h-3" />
            Live
          </span>
        </div>
      </div>

      {/* Key Hubs Quick Selector Strip (USA, UK, Saudi, Indonesia, etc.) */}
      <div className="px-3 py-2.5 bg-[#0a1428] border-t border-sky-500/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {GLOBAL_COUNTRY_NODES.slice(0, 12).map((node) => (
          <button
            key={node.code}
            type="button"
            onClick={() => setSelectedNode(node)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedNode.code === node.code
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <span>{node.flag}</span>
            <span>{node.country}</span>
            <span className="opacity-75 tabular-nums">
              {mode === 'creator' ? `$${node.hadiyaUsd}` : `${(node.onlineUsers / 1000).toFixed(1)}k`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
