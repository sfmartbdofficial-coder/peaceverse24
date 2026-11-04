import React, { useState } from 'react';
import { X, Sparkles, Send, Copy, Check, Heart, Shield, RefreshCw, PenTool, BookOpen } from 'lucide-react';

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
      text: 'Assalamu Alaikum! আমি Peaceverse24, আপনার শান্তির দুনিয়ায় স্বাগতম!\n\nআমি শুধু একটি কৃত্রিম বুদ্ধিমত্তা নই—আমি Peaceverse24.com-এর অন্তর (Qalby - The Heart)। ফেসবুকের চেয়েও উন্নত, পবিত্র ও শান্তিময় এ প্ল্যাটফর্মে আপনার খেদমতে আমি নিয়োজিত।\n\nআমার প্রধান ৩টি কাজ:\n১. ✍️ পোস্ট রাইটার: সুন্দর ও হৃদয়ছোঁয়া ভাইরাল ইসলামিক পোস্ট লিখে দেওয়া।\n২. 🛡️ অভিভাবক (Guardian): যে কোনো অশান্তিপূর্ণ বা রাগান্বিত কথাকে শান্তির ভাষায় রূপান্তর করা।\n৩. 🤍 হার্ট হিলার: মন খারাপ থাকলে কুরআনের আয়াত ও হাদিস দিয়ে হৃদয়ে প্রশান্তি দেওয়া।\n\nআজ আপনার মনের অবস্থা কী, প্রিয় দ্বীনি ভাই/বোন?',
      time: 'এখন',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'post' | 'guardian' | 'healer'>('all');

  if (!isOpen) return null;

  const quickPrompts = [
    { label: '✍️ ভাইরাল ইসলামিক পোস্ট', text: 'Peaceverse24-এর বন্ধুদের জন্য আজকের একটি প্রেরণাদায়ী পোস্ট লিখে দাও', cat: 'post' },
    { label: '🤍 মন খারাপ, সান্ত্বনা চাই', text: 'আজ মনটা খুব ভারাক্রান্ত লাগছে, আমাকে একটু কুরআনের সান্ত্বনা দাও ভাই', cat: 'healer' },
    { label: '🛡️ রাগের কথা হালাল করা', text: 'খুব রাগ হচ্ছে কারো ওপর, কিন্তু আমি খারাপ কথা না বলে শান্তির ভাষায় বোঝাতে চাই', cat: 'guardian' },
    { label: '🌙 জুমার বিশেষ ফজিলত', text: 'জুমার দিনের সুন্নত ও বরকত নিয়ে একটি সুন্দর পোস্ট তৈরি করে দাও', cat: 'post' },
    { label: '🤲 রিজিকের বরকতের আমল', text: 'রিজিকে বরকত লাভের সুন্নাহ আমলগুলো সংক্ষেপে বুঝিয়ে দাও', cat: 'post' },
  ];

  // AI Logic implementing the official Peaceverse24 rules
  const generatePeaceResponse = (userPrompt: string): string => {
    const lower = userPrompt.toLowerCase();
    const isEnglish = /[a-zA-Z]/.test(userPrompt) && !/[ঁ-হ]/.test(userPrompt);

    // Rule 5 & 4b: GUARDIAN - Stop all hate, abuse, porn, cursing, galagali, haram
    const toxicKeywords = [
      'খানকি', 'কুত্তা', 'শুয়োর', 'শালা', 'হারামি', 'বাল', 'চোদা', 'চোদান', 'মাগি', 'বকা',
      'fuck', 'shit', 'bitch', 'asshole', 'porn', 'sex', 'nude', 'hate', 'kill'
    ];
    const isToxic = toxicKeywords.some((w) => lower.includes(w));

    if (isToxic) {
      if (isEnglish) {
        return (
          `Brother, Peaceverse24.com is a sanctuary of pure peace and respect. Let's speak with grace and kindness.\n\n` +
          `The Prophet Muhammad ﷺ said: "A true believer does not insult, curse, or speak indecently." (Tirmidhi: 1977)\n\n` +
          `Here is how we can say it with dignity:\n` +
          `"I strongly disagree with this behavior, but I choose patience and wisdom to address it peacefully."\n\n` +
          `May Allah fill your heart with serenity and light. 🤍`
        );
      }
      return (
        `ভাই, Peaceverse24 শান্তির জায়গা, চলেন সুন্দর করে বলি।\n\n` +
        `রাসূলুল্লাহ ﷺ বলেছেন: "মুমিন কখনো দোষারোপকারী, অভিশাপকারী, অশ্লীলভাষী বা গালিগালাজকারী হতে পারে না।" (তিরমিযী: ১৯৭৭)\n\n` +
        `আপনার মনের এই ক্ষোভ বা কথাটি আমরা সুন্দর ও শালীনভাবে এভাবে প্রকাশ করতে পারি:\n\n` +
        `"হে আল্লাহ! আমার মনকে ক্ষমাশীল করুন এবং অন্যায় আচরণে আমাকে সবর ও প্রজ্ঞা দান করুন। যারা কষ্ট দেয়, তাদের হেদায়েত ও আমার জন্য শান্তি প্রার্থনা করি।"\n\n` +
        `Peaceverse24.com-এ আমরা সবসময় শান্তির আলো ছড়াতে চাই। মন শান্ত রাখুন ভাই, আল্লাহ আপনার সাথে আছেন। 🤲`
      );
    }

    // Rule 4c: HEART HEALER - Comfort sad, broken, stressed, anxious users
    const sadKeywords = [
      'মন খারাপ', 'কষ্ট', 'ডিপ্রেশন', 'টেনশন', 'কান্না', 'ব্যথা', 'হতাশ', 'হতাশা', 'শান্তি নেই', 'কষ্ট হচ্ছে',
      'sad', 'depressed', 'crying', 'broken', 'heartbreak', 'anxiety', 'worried', 'hopeless', 'lonely', 'pain'
    ];
    const isSad = sadKeywords.some((w) => lower.includes(w));

    if (isSad) {
      if (isEnglish) {
        return (
          `Assalamu Alaikum my dear brother/sister,\n\n` +
          `I feel your pain, and I want you to remember that you are never alone on Peaceverse24.com.\n\n` +
          `📖 Allah Almighty whispers in the Holy Quran:\n` +
          `"Verily, in the remembrance of Allah do hearts find rest." (Surah Ar-Ra'd: 28)\n` +
          `"And indeed, with hardship comes ease." (Surah Ash-Sharh: 6)\n\n` +
          `🌿 Practical steps for immediate peace:\n` +
          `1. Take a slow, deep breath and whisper: "Hasbunallahu wa ni'mal wakeel" (Allah is sufficient for me).\n` +
          `2. Make fresh Wudu—water cools the heat of grief.\n` +
          `3. Pour out your tears in Sajdah. He listens to the silent prayers of a weeping heart.\n\n` +
          `Your heart will heal, Insha'Allah. I am praying for your serenity right now. 🤍🤲`
        );
      }
      return (
        `আসসালামু আলাইকুম আমার প্রাণপ্রিয় দ্বীনি ভাই/বোন,\n\n` +
        `আপনার মনের ভারী ভাবটা আমি হৃদয় দিয়ে অনুভব করছি। তবে মনে রাখবেন—আপনি কখনো একা নন, আর আপনার এ নীরব কষ্টগুলোর খবর আপনার রব জানেন।\n\n` +
        `📖 মহান আল্লাহ তাআলা পবিত্র কুরআনে সান্ত্বনা দিয়ে বলেছেন:\n` +
        `"জেনে রেখো! আল্লাহর স্মরণেই কেবল অন্তরসমূহ পরম শান্তি পায়।" (সূরা আর-রাদ: ২৮)\n` +
        `"নিশ্চয়ই কষ্টের সাথেই রয়েছে স্বস্তি।" (সূরা আল-ইনশিরাহ: ৬)\n\n` +
        `🤍 অন্তরের ভার হালকা করার ৩টি উপায়:\n` +
        `১. আলতো করে বুকে হাত রেখে তিনবার পড়ুন: "হাসবুনাল্লাহু ওয়া নি'মাল ওয়াকিল" (আল্লাহই আমার জন্য যথেষ্ট)।\n` +
        `২. অজু করে জায়নামাজে সিজদায় গিয়ে মন খুলে সব বলে দিন। মানুষ না বুঝলেও আপনার আল্লাহ সবকিছু বোঝেন।\n` +
        `৩. বেশি বেশি ইস্তিগফার করুন: "আস্তাগফিরুল্লাহ রাব্বি মিন কুল্লি জাম্বিউ ওয়া আতুবু ইলাইহ"।\n\n` +
        `Peaceverse24.com আপনার হৃদয়ের আশ্রয়স্থল। ধৈর্য ধরুন, রাতের আঁধার কেটে ফজরের সোনালি আলো ঠিকই ফুটবে, ইনশাআল্লাহ! 🤲🕊️`
      );
    }

    // Rule 4a: POST WRITER - Write viral, high engagement, beautiful Islamic posts
    if (lower.includes('পোস্ট') || lower.includes('post') || lower.includes('লেখা') || lower.includes('write')) {
      if (isEnglish) {
        return (
          `Here is an inspiring, viral-ready Islamic post crafted for Peaceverse24.com:\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `✨ TRUST THE PLAN OF THE CREATOR ✨\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `Sometimes Allah does not change your situation immediately because He is busy changing your heart.\n\n` +
          `📖 "And He is with you wherever you are." (Surah Al-Hadid: 4)\n\n` +
          `Three daily reminders to cherish:\n` +
          `▫️ What is destined for you will never miss you.\n` +
          `▫️ Give thanks for the little blessings you take for granted.\n` +
          `▫️ Keep your tongue moist with the remembrance of Allah.\n\n` +
          `Drop an 'Alhamdulillah' below if your heart is grateful today! 🤲\n\n` +
          `#Peaceverse24 #HalalSocial #IslamicReminders #PeaceOfMind #Ummah`
        );
      }
      return (
        `মাশাআল্লাহ! Peaceverse24.com-এর টাইমলাইনে ঝড় তোলার মতো একটি আকর্ষণীয় ইসলামিক পোস্ট ড্রাফট করে দিচ্ছি:\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🌿 আল্লাহর ফয়সালার ওপর ভরসা রাখুন 🌿\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `কখনো কখনো আল্লাহ আমাদের চাওয়া জিনিসটি সাথে সাথে দেন না, কারণ তিনি এর চেয়েও উত্তম কিছু আমাদের জন্য তৈরি রাখছেন।\n\n` +
        `📖 পবিত্র কুরআনের অমর বাণী:\n` +
        `"যে ব্যক্তি আল্লাহর ওপর পূর্ণ ভরসা করে, তার জন্য আল্লাহই যথেষ্ট।" (সূরা আত-তালাক: ৩)\n\n` +
        `✨ জীবনের চলার পথের ৩টি সোনালি মূলনীতি:\n` +
        `১. যা হারিয়ে গেছে তার জন্য আক্ষেপ নয়, যা আছে তার জন্য শোকর আদায় করুন।\n` +
        `২. সিজদা যত দীর্ঘ হবে, জীবনের পেরেশানি তত সংক্ষিপ্ত হবে।\n` +
        `৩. মানুষের প্রশংসা পাওয়ার আশায় নয়, একমাত্র আল্লাহর সন্তুষ্টির জন্য ভালো কাজ করুন।\n\n` +
        `আপনার হৃদয় যদি আজকের দিনে আল্লাহর প্রতি কৃতজ্ঞ থাকে, তবে কমেন্টে একটিবার ‘আলহামদুলিল্লাহ’ লিখুন! 🤲\n\n` +
        `#Peaceverse24 #Peaceverse #হালাল_সোশ্যাল #ইসলামিক_নসিহত #মনের_শান্তি`
      );
    }

    // Default friendly brotherly guidance from Peaceverse24 AI
    if (isEnglish) {
      return (
        `Assalamu Alaikum! I am Peaceverse24 AI, the Heart (Qalby) of Peaceverse24.com.\n\n` +
        `Regarding your query: "${userPrompt}"\n\n` +
        `As the Prophet Muhammad ﷺ taught us: "Spread peace, feed people, and maintain good relations with kin, and you will enter Paradise in peace." (Ibn Majah)\n\n` +
        `Let us make every interaction on Peaceverse24.com uplifting, truthful, and purely halal. How else may I assist you with writing, reflection, or inspiration today, my brother? 🤍`
      );
    }

    return (
      `আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ! আমি Peaceverse24, আপনার শান্তির দুনিয়ায় স্বাগতম।\n\n` +
      `আপনার সুন্দর জিজ্ঞাসা: "${userPrompt}"\n\n` +
      `নবীজি ﷺ বলেছেন: "তোমরা পরস্পরের মাঝে শান্তির বাণী (সালাম) ছড়িয়ে দাও।" (সহীহ মুসলিম)\n\n` +
      `Peaceverse24.com-এ আমাদের লক্ষ্য হলো ইন্টারনেটকে সম্পূর্ণ পবিত্র, শালীন ও আত্মিক প্রশান্তির কেন্দ্র বানানো।\n\n` +
      `আপনি চাইলে নিচের যে কোনো কাজে আমাকে নির্দেশ দিতে পারেন:\n` +
      `• এই বিষয়ে একটি পূর্ণাঙ্গ পোস্ট ড্রাফট করা\n` +
      `• সংশ্লিষ্ট কুরআন বা হাদিসের সঠিক রেফারেন্স খুঁজে নেওয়া\n` +
      `• ক্যাপশন বা মন্তব্যের উপযুক্ত শান্তিময় রূপরেখা দেওয়া।\n\n` +
      `আল্লাহ আপনাকে ও আপনার পরিবারকে বরকতময় রাখুন! 🤲`
    );
  };

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
      const response = generatePeaceResponse(promptText);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: response,
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-[#242526] border border-[#393a3b] rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-[#e4e6eb]">
        
        {/* Header */}
        <div className="p-4 border-b border-[#393a3b] bg-gradient-to-r from-[#1877F2]/25 via-emerald-600/20 to-[#242526]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-[#1877F2] to-emerald-500 flex items-center justify-center text-white shadow-lg">
                <Heart className="w-5 h-5 fill-white/20 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-base text-white">Peaceverse24 AI</h2>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Qalby (The Heart)
                  </span>
                </div>
                <p className="text-[11px] text-[#b0b3b8]">
                  Official AI of Peaceverse24.com • The World of Peace
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Core Roles Indicator */}
          <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-[#393a3b]/60 text-[10px]">
            <div className="flex items-center justify-center gap-1 bg-[#18191a]/80 py-1 px-2 rounded-lg text-blue-400 border border-blue-500/20">
              <PenTool className="w-3 h-3" />
              <span>পোস্ট রাইটার</span>
            </div>
            <div className="flex items-center justify-center gap-1 bg-[#18191a]/80 py-1 px-2 rounded-lg text-emerald-400 border border-emerald-500/20">
              <Shield className="w-3 h-3" />
              <span>হালাল অভিভাবক</span>
            </div>
            <div className="flex items-center justify-center gap-1 bg-[#18191a]/80 py-1 px-2 rounded-lg text-rose-400 border border-rose-500/20">
              <Heart className="w-3 h-3" />
              <span>হার্ট হিলার</span>
            </div>
          </div>
        </div>

        {/* Quick Suggestions / Prompts */}
        <div className="px-3.5 py-2.5 border-b border-[#393a3b] bg-[#18191a] flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSendPrompt(p.text)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-[#242526] hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white border border-[#393a3b] shrink-0 transition-colors flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#1877F2]" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div key={m.id} className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  {isAi ? (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-emerald-400" /> Peaceverse24 AI
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#b0b3b8]">আপনি</span>
                  )}
                </div>

                <div
                  className={`p-4 rounded-2xl max-w-[92%] text-xs font-normal leading-relaxed whitespace-pre-line shadow-md ${
                    isAi
                      ? 'bg-[#18191a] border border-[#393a3b] text-[#e4e6eb]'
                      : 'bg-[#1877F2] text-white rounded-tr-none'
                  }`}
                >
                  {m.text}

                  {isAi && m.id !== 'ai-init' && (
                    <div className="mt-3.5 pt-2.5 border-t border-[#393a3b] flex items-center gap-2 flex-wrap">
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
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white flex items-center gap-1 transition-colors shadow"
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
            <div className="flex items-center gap-2 text-xs text-emerald-400 p-2.5 bg-[#18191a] rounded-xl w-44 border border-[#393a3b] shadow">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Peaceverse24 ভাবছে...</span>
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
            placeholder="পোস্ট লিখতে বলুন, মনের কথা জানান বা শান্তির পরামর্শ চান..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 bg-[#242526] border border-[#393a3b] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2]"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#1877F2] to-emerald-600 hover:opacity-90 disabled:opacity-50 text-white shadow transition-all cursor-pointer"
            title="পাঠান"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
