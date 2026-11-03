import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface FbToastProps {
  message: string;
  onClose: () => void;
}

export const FbToast: React.FC<FbToastProps> = ({ message, onClose }) => {
  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#242526] text-white px-4 py-2.5 rounded-full border border-emerald-500/50 shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      <span className="text-xs font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
