import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface FbToastProps {
  message: string;
  onClose: () => void;
}

export const FbToast: React.FC<FbToastProps> = ({ message, onClose }) => {
  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-4 py-2.5 rounded-full border border-[#E4E6EB] shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200">
      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
      <span className="text-xs font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded-full hover:bg-[#F0F2F5] text-[#65676B] hover:text-black cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
