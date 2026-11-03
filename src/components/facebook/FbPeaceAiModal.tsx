import React, { useState } from 'react';
import { X, Sparkles, Send, Copy, Check, MessageSquare, BookOpen, Heart, RefreshCw } from 'lucide-react';

interface FbPeaceAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseAsPost?: (text: string) => void;
}

export const FbPeaceAiModal: React.FC<FbPeaceAiModalProps> = ({
  isOpen,
  onClose,
  onUseAsPost,
}) => {
  const [messages, setMessages] = useState([
    {
      id: 'ai-init',
      sender: 'ai',
      text: 'আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ! আমি Peace AI (পিস এআই)। আমি আপনাকে ইসলামিক সুন্দর ফেসবুক পোস্ট লিখতে, কুরআন ও হাদিসের দলিল বের করতে এবং দ্বীনি যেকোনো বিষয়ে তথ্য দিয়ে সহায়তা করতে প্রস্তুত। কী বিষয়ে লিখতে চান?',
      time: 'এখন',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    'জুমার দিনের জন্য একটি দোয়াপূর্ণ পোস্ট লিখে দাও',
    'রিযিকে বরকত লাভের ৫টি সুন্নাহ আমল',
    'সূরা আল-মুলক পড়ার ফজিলত কী?',
    'পিতামাতার জন্য কুরআনিক দোয়া ও সুন্দর ক্যাপশন',
  ];

  const handleSendPrompt = (promptText: string) => {
    const userMsgId = Date.now().toString();
    const newMsgs = [
      ...messages,
      { id: userMsgId, sender: 'user', text: promptText, time: 'এখন' },
    ];
    setMessages(newMsgs);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse = '';
      if (promptText.includes('জুমা') || promptText.includes('জুমার')) {
        aiResponse =
          '🌙 জুম্মা মুবারক!\n\nরাসূলুল্লাহ ﷺ ইরশাদ করেছেন: "দিনসমূহের মধ্যে সর্বোত্তম দিন হলো জুমার দিন।" (আবু দাউদ)\n\nআজকের দিনের বিশেষ আমলসমূহ:\n১. সূরা কাহাফ তিলাওয়াত করা\n২. বেশি বেশি দরূদ পাঠ করা (আল্লাহুম্মা সাল্লি আলা মুহাম্মাদ...)\n৩. আসর থেকে মাগরিবের মধ্যবর্তী সময়ে খাস অন্তরে দোয়া করা\n\nহে আল্লাহ! আপনি আমাদের সকল গুনাহ মাফ করুন এবং উম্মাহকে হেফাজত করুন। আমিন! 🤲';
      } else if (promptText.includes('রিযিক') || promptText.includes('বরকত')) {
        aiResponse =
          '✨ রিযিকে অফুরন্ত বরকত লাভের সুন্নাহ নির্দেশিকা:\n\n১. তাকওয়া বা আল্লাহভীতি অর্জন করা (সূরা তালাক: ২-৩)\n২. বেশি বেশি ইস্তিগফার পাঠ করা ("আস্তাগফিরুল্লাহাল্লাজি লা ইলাহা ইল্লা হুয়াল হাইয়্যুল কাইয়্যুম")\n৩. আত্মীয়তার সম্পর্ক বজায় রাখা (সহীহ বুখারী: ২০৬৭)\n৪. নিয়ামত পাওয়ার পর কৃতজ্ঞতা প্রকাশ ও শোকর আদায় করা\n৫. সাধ্যমতো গোপন সাদাকাহ করা 🤲';
      } else if (promptText.includes('মুলক') || promptText.includes('সূরা')) {
        aiResponse =
          '📖 সূরা আল-মুলকের বিশেষ মর্যাদা ও ফজিলত:\n\nহাদিসে এসেছে, রাসূলুল্লাহ ﷺ বলেছেন: "কুরআনে ৩০ আয়াতের একটি সূরা আছে, যা একজন মানুষের জন্য ক্ষমা না পাওয়া পর্যন্ত সুপারিশ করতেই থাকবে; আর তা হলো ‘তাবা-রাকাল্লাযী বিয়াদিহিল মুলক’ (সূরা আল-মুলক)।" (তিরমিযী: ২৮৯১)\n\nপ্রতি রাতে ঘুমানোর পূর্বে এই সূরা তিলাওয়াত করা কবরের আজাব থেকে মুক্তির সুনিশ্চিত ওসিলা। 🤍';
      } else {
        aiResponse =
          `✨ "${promptText}" সম্পর্কিত ইসলামিক পরামর্শ:\n\n"যে ব্যক্তি আল্লাহর ওপর ভরসা করে, তার জন্য তিনিই যথেষ্ট।" (সূরা আত-তালাক: ৩)\n\nপ্রতিটি পদক্ষেপে বিসমিল্লাহ বলুন, সৎ নিয়ত রাখুন এবং উত্তম চরিত্র প্রদর্শন করুন। আপনার এই ভাবনাটি উম্মাহর জন্য কল্যাণকর হোক! 🤲`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiResponse,
          time: 'এখন',
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-[#242526] border border-[#393a3b] rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-[#e4e6eb]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#393a3b] bg-gradient-to-r from-blue-600/30 via-indigo-600/20 to-[#242526]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-[#1877F2] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-base text-white">Peace AI (পিস এআই)</h2>
                <span className="text-[10px] bg-[#1877F2] text-white px-2 py-0.2 rounded-full font-bold">
                  ইসলামিক সহকারী
                </span>
              </div>
              <p className="text-[11px] text-[#b0b3b8]">ফেসবুক পোস্ট ড্রাফট, ইসলামিক প্রশ্ন ও ক্যাপশন জেনারেটর</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-b border-[#393a3b] bg-[#18191a] flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSendPrompt(p)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-[#242526] hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white border border-[#393a3b] shrink-0 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#1877F2]" />
              <span>{p}</span>
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div key={m.id} className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  {isAi ? (
                    <span className="text-[11px] font-bold text-[#1877F2] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Peace AI
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#b0b3b8]">আপনি</span>
                  )}
                </div>

                <div
                  className={`p-3.5 rounded-2xl max-w-[90%] text-xs font-normal leading-relaxed whitespace-pre-line ${
                    isAi
                      ? 'bg-[#18191a] border border-[#393a3b] text-[#e4e6eb] shadow-sm'
                      : 'bg-[#1877F2] text-white rounded-tr-none'
                  }`}
                >
                  {m.text}

                  {isAi && m.id !== 'ai-init' && (
                    <div className="mt-3 pt-2 border-t border-[#393a3b] flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="px-2.5 py-1 rounded-lg bg-[#242526] hover:bg-[#3a3b3c] text-[11px] font-bold text-[#b0b3b8] hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>কপি করুন</span>
                          </>
                        )}
                      </button>

                      {onUseAsPost && (
                        <button
                          onClick={() => {
                            onUseAsPost(m.text);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white flex items-center gap-1 transition-colors shadow"
                        >
                          <Send className="w-3 h-3" />
                          <span>পোস্ট হিসেবে ড্রাফট করুন</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-[#b0b3b8] p-2 bg-[#18191a] rounded-xl w-36 border border-[#393a3b]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1877F2]" />
              <span>Peace AI ভাবছে...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!inputVal.trim()) return;
            handleSendPrompt(inputVal);
          }}
          className="p-3 border-t border-[#393a3b] bg-[#18191a] flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="ইসলামিক কোনো প্রশ্ন বা পোস্ট লেখার বিষয় বলুন..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 bg-[#242526] border border-[#393a3b] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2]"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            className="p-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-50 text-white shadow transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
