import React, { useState } from 'react';
import { X, Shield, Lock, Heart, MessageSquare, BookOpen, Smile, Sparkles, Send } from 'lucide-react';

interface FbMessengerKidsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FbMessengerKidsModal: React.FC<FbMessengerKidsModalProps> = ({ isOpen, onClose }) => {
  const [selectedKidTab, setSelectedKidTab] = useState<'chat' | 'stories'>('chat');
  const [messages, setMessages] = useState([
    { id: '1', sender: 'আম্মু (Mom)', text: 'সোনামণি, আসরের নামাজ পড়েছ?', isMe: false, time: '৪:১৫ PM' },
    { id: '2', sender: 'আমি', text: 'হ্যাঁ আম্মু, মসজিদে গিয়ে জামাতে পড়েছি আলহামদুলিল্লাহ! 🤲', isMe: true, time: '৪:১৮ PM' },
    { id: '3', sender: 'আম্মু (Mom)', text: 'মাশাআল্লাহ আমার ভালো বাবা! বাড়ি ফেরার সময় আব্বুর সাথে এসো। ❤️', isMe: false, time: '৪:২০ PM' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  if (!isOpen) return null;

  const kidStories = [
    {
      title: 'হযরত নূহ (আ.) ও মহাপ্লাবনের কিশতি',
      desc: 'আল্লাহর আদেশে কীভাবে তৈরি হলো সেই বিশাল কিশতি এবং প্রাণীকুল রক্ষা পেল।',
      moral: 'আল্লাহর ওপর ভরসা ও আনুগত্যের শিক্ষা',
    },
    {
      title: 'হযরত ইউনুস (আ.) ও তিমি মাছের পেট',
      desc: 'তিমি মাছের পেটে অন্ধকারে আল্লাহর বিশেষ তাসবীহ পাঠ ও ক্ষমা প্রার্থনা।',
      moral: 'লা ইলাহা ইল্লা আনতা সুবহানাকা ইন্নি কুনতু মিনায যালিমীন',
    },
    {
      title: 'ছোট্ট সাহাবীদের সততা ও পরোপকার',
      desc: 'কীভাবে শিশু সাহাবীরা সততা দিয়ে মদিনায় মানুষের মন জয় করেছিলেন।',
      moral: 'সত্যবাদীতা ও পিতা-মাতার সেবা',
    },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'আমি',
        text: inputMsg,
        isMe: true,
        time: 'এখন',
      },
    ]);
    setInputMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-[#242526] border border-[#393a3b] rounded-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-[#e4e6eb]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#393a3b] bg-gradient-to-r from-emerald-600/30 to-[#242526]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white">Messenger Kids</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-bold">
                  প্যারেন্টাল সিকিউর
                </span>
              </div>
              <p className="text-[11px] text-[#b0b3b8]">শিশুদের জন্য ১০০% নিরাপদ ইসলামিক চ্যাট ও গল্প</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#393a3b] bg-[#18191a]">
          <button
            onClick={() => setSelectedKidTab('chat')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              selectedKidTab === 'chat'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>পরিবারের নিরাপদ চ্যাট</span>
          </button>
          <button
            onClick={() => setSelectedKidTab('stories')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              selectedKidTab === 'stories'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>নবীজিদের গল্প ও নীতিশিক্ষা</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedKidTab === 'chat' ? (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>এই মোডে কোনো অপরিচিত বা অননুমোদিত ব্যক্তি যোগাযোগ করতে পারবে না।</span>
              </div>

              {/* Chat bubbles */}
              <div className="space-y-2.5 min-h-[220px]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-[#b0b3b8] px-1 mb-0.5">{m.sender}</span>
                    <div
                      className={`p-3 rounded-2xl max-w-[85%] text-xs font-medium leading-relaxed ${
                        m.isMe
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-[#18191a] text-[#e4e6eb] border border-[#393a3b] rounded-tl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[9px] text-[#8a8d91] px-1 mt-0.5">{m.time}</span>
                  </div>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="বার্তা লিখুন..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 bg-[#18191a] border border-[#393a3b] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              {kidStories.map((story, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-2"
                >
                  <h4 className="font-bold text-sm text-emerald-400">{story.title}</h4>
                  <p className="text-xs text-[#b0b3b8] leading-relaxed">{story.desc}</p>
                  <div className="p-2 rounded-lg bg-[#242526] text-[11px] text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>শিক্ষা: {story.moral}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#393a3b] bg-[#18191a] text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] font-bold text-xs"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
