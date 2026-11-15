import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[420px] pointer-events-none"
    >
      <div className="bg-amber-50/95 backdrop-blur-md border border-amber-300 text-amber-900 rounded-xl px-3.5 py-2 shadow-lg flex items-center justify-center gap-2 text-xs font-semibold">
        <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
        <span>আপনি অফলাইনে আছেন — সংরক্ষিত কনটেন্ট দেখাচ্ছে</span>
      </div>
    </div>
  );
};
