import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Maximize2 } from 'lucide-react';

interface FbVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

export const FbVideoPlayer: React.FC<FbVideoPlayerProps> = ({ src, poster, title }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControlsHint, setShowControlsHint] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Auto-play when in viewport, pause when out of viewport (Facebook style)
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Auto-play muted in viewport
            video.muted = isMuted;
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true);
                })
                .catch(() => {
                  // Browser autoplay restriction handling
                });
            }
          } else {
            // Pause when out of viewport
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      {
        threshold: [0.2, 0.5, 0.8],
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [isMuted]);

  // Track progress
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  // Toggle Play / Pause on video tap
  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    setHasUserInteracted(true);
    setShowControlsHint(true);
    setTimeout(() => setShowControlsHint(false), 900);

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Toggle Mute / Unmute
  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  };

  // Fullscreen
  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if ((video as any).webkitRequestFullscreen) {
      (video as any).webkitRequestFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleTogglePlay}
      className="relative w-full bg-black border-y border-[#393a3b] overflow-hidden group cursor-pointer select-none max-h-[640px] flex items-center justify-center"
      style={{ minHeight: '260px' }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        muted={isMuted}
        loop
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-auto max-h-[640px] object-contain mx-auto"
        title={title || 'Peaceverse Video'}
      />

      {/* Center Play/Pause Indicator Animation on click */}
      {showControlsHint && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-2xl animate-in zoom-in-75">
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-white" />
            ) : (
              <Play className="w-8 h-8 fill-white translate-x-0.5" />
            )}
          </div>
        </div>
      )}

      {/* Floating Center Play Button if paused and no recent click */}
      {!isPlaying && !showControlsHint && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-xl">
            <Play className="w-7 h-7 fill-white translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Floating Bottom Sound Mute/Unmute & Fullscreen buttons */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggleMute}
          className="p-2 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 shadow-lg active:scale-95 transition-all"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-white" />
          ) : (
            <Volume2 className="w-4 h-4 text-sky-400" />
          )}
        </button>

        <button
          type="button"
          onClick={handleFullscreen}
          className="p-2 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 shadow-lg active:scale-95 transition-all opacity-0 group-hover:opacity-100"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Bottom Slim Video Progress Bar */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
        <div
          className="h-full bg-[#1877F2] transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
