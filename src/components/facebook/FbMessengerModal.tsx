import React, { useState } from 'react';
import { X, Send, Smile, Phone, Video, Minus, Sparkles, CheckCheck } from 'lucide-react';
import { ChatFriend, ChatMessage } from '../../types';

interface FbMessengerModalProps {
  friend: ChatFriend;
  onClose: () => void;
  onSendMessage: (friendId: string, text: string) => void;
}

export const FbMessengerModal: React.FC<FbMessengerModalProps> = ({
  friend,
  onClose,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(friend.id, inputText.trim());
    setInputText('');
  };

  const quickGreetings = [
    'আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ 🍃',
    'মাশাআল্লাহ ভাই! ✨',
    'জাযাকাল্লাহ খাইরান 🤲',
    'আমিন ছুম্মা আমিন ❤️',
  ];

  return (
    <div className="fixed bottom-0 right-2 sm:right-6 z-50 w-full sm:w-84 max-w-[95vw] h-96 bg-[#242526] rounded-t-2xl border border-[#393a3b] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#18191a] border-b border-[#393a3b]">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={friend.avatar}
              alt={friend.name}
              className="w-8 h-8 rounded-full object-cover border border-[#393a3b]"
            />
            {friend.online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#18191a] rounded-full" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">{friend.name}</p>
            <p className="text-[10px] text-emerald-400 font-medium">
              {friend.online ? 'সক্রিয় আছেন' : 'অফলাইন'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#b0b3b8]">
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#3a3b3c] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2 text-xs">
        {friend.messages.map((m) => {
          const isMe = m.sender === 'me';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`px-3 py-2 rounded-2xl max-w-[80%] font-bengali leading-relaxed shadow-sm ${
                  isMe
                    ? 'bg-emerald-600 text-white rounded-br-xs'
                    : 'bg-[#3a3b3c] text-[#e4e6eb] rounded-bl-xs'
                }`}
              >
                <p>{m.text}</p>
              </div>
              <span className="text-[9px] text-[#b0b3b8] mt-0.5 px-1">{m.time}</span>
            </div>
          );
        })}
      </div>

      {/* Quick Islamic greeting pills */}
      <div className="px-2 py-1 bg-[#18191a] border-t border-[#393a3b] flex items-center gap-1 overflow-x-auto no-scrollbar">
        {quickGreetings.map((q) => (
          <button
            key={q}
            onClick={() => onSendMessage(friend.id, q)}
            className="px-2 py-0.5 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] text-[10px] whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-2 bg-[#242526] border-t border-[#393a3b] flex items-center gap-2">
        <input
          type="text"
          placeholder="মেসেজ লিখুন..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-[#3a3b3c] rounded-full px-3.5 py-1.5 text-xs text-[#e4e6eb] placeholder-[#b0b3b8] focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
};
