import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  Send,
  Copy,
  Check,
  Heart,
  Shield,
  RefreshCw,
  PenTool,
  Video,
  Search,
  ChevronDown,
  Globe,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { WORLD_LANGUAGES, WorldLanguageItem } from '../../i18n/worldLanguages';

interface FbPeaceAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseAsPost?: (text: string) => void;
}

const LOCALIZED_GREETINGS: Record<string, string> = {
  bn:
    'আসসালামু আলাইকুম! আমি Peace AI (পিস এআই)—আপনার প্ল্যাটফর্মে স্বাগতম!\n\n' +
    '💡 যেকোনো প্রশ্নের তাৎক্ষণিক সমাধান:\n' +
    'আপনার যেকোনো জিজ্ঞাসা, ভিডিও আপলোড ও অ্যাপ ব্যবহারের নিয়ম, দ্বীনি মাসয়ালা, সোশ্যাল মিডিয়ার জন্য সুন্দর পোস্ট বা ক্যাপশন লেখা, কঠিন সময়ে মনকে সান্ত্বনা দেওয়া, কিংবা জ্ঞানমূলক যেকোনো প্রশ্নের সমাধান পেতে আমাকে নির্দ্বিধায় জিজ্ঞাসা করুন।\n\n' +
    'আজ আপনাকে কীভাবে সহায়তা করতে পারি ভাই?',
  en:
    'Assalamu Alaikum! I am Peace AI, your official assistant on PeaceVerse.\n\n' +
    '💡 Instant Query Solver:\n' +
    'Feel free to ask me anything—how to upload videos and use the app, Islamic knowledge, crafting beautiful social posts, or finding peace of mind.\n\n' +
    'How may I assist you today, my brother?',
  ar:
    'السلام عليكم! أنا Peace AI، مساعدك الرسمي في PeaceVerse.\n\n' +
    '💡 حلّال الأسئلة الفوري:\n' +
    'اسألني عن أي شيء—كيفية رفع الفيديو واستخدام التطبيق، المعرفة الإسلامية، كتابة منشورات ملهمة، أو إيجاد الطمأنينة.\n\n' +
    'كيف يمكنني مساعدتك اليوم؟',
  ur:
    'السلام علیکم! میں Peace AI ہوں، PeaceVerse پر آپ کا آفیشل اسسٹنٹ۔\n\n' +
    '💡 فوری سوالوں کا حل:\n' +
    'مجھ سے کچھ بھی پوچھیں—ویڈیو اپ لوڈ کرنے کا طریقہ، اسلامی معلومات، خوبصورت پوسٹس لکھنا، یا دل کا سکون پانا۔\n\n' +
    'آج میں آپ کی کیا مدد کر سکتا ہوں؟',
  hi:
    'अस्सलामु अलैकुम! मैं Peace AI हूँ, PeaceVerse पर आपका आधिकारिक सहायक।\n\n' +
    '💡 हर सवाल का तुरंत समाधान:\n' +
    'मुझसे कुछ भी पूछें—वीडियो कैसे अपलोड करें, ऐप का उपयोग, ज्ञानवर्धक जानकारी, सोशल मीडिया पोस्ट लिखना या मन की शांति।\n\n' +
    'आज मैं आपकी क्या मदद कर सकता हूँ?',
  es:
    '¡Assalamu Alaikum! Soy Peace AI, tu asistente oficial en PeaceVerse.\n\n' +
    '💡 Solucionador instantáneo:\n' +
    'Pregúntame lo que quieras: cómo subir videos, usar la app, conocimiento islámico, redactar publicaciones o encontrar paz interior.\n\n' +
    '¿En qué puedo ayudarte hoy?',
  fr:
    'Assalamu Alaikum ! Je suis Peace AI, votre assistant officiel sur PeaceVerse.\n\n' +
    '💡 Réponses instantanées :\n' +
    'Posez-moi toutes vos questions : comment publier des vidéos, utiliser l’application, connaissances islamiques ou rédiger de beaux messages.\n\n' +
    'Comment puis-je vous aider aujourd’hui ?',
  de:
    'Assalamu Alaikum! Ich bin Peace AI, dein offizieller Assistent auf PeaceVerse.\n\n' +
    '💡 Sofortige Antworten:\n' +
    'Frag mich alles: Videos hochladen, App-Funktionen, islamisches Wissen oder inspirierende Beiträge schreiben.\n\n' +
    'Wie kann ich dir heute helfen?',
  zh:
    'Assalamu Alaikum！我是 Peace AI，您在 PeaceVerse 的官方助手。\n\n' +
    '💡 即时问答助手：\n' +
    '欢迎随时向我提问——如何上传视频、使用应用功能、撰写优质动态，或寻找心灵的平静。\n\n' +
    '今天我可以为您做些什么？',
  ja:
    'アッサラーム・アライクム！PeaceVerseの公式アシスタント、Peace AIです。\n\n' +
    '💡 即時質問サポート：\n' +
    '動画のアップロード方法、アプリの使い方、知識の共有、投稿文の作成など、何でも気軽にご質問ください。\n\n' +
    '今日はどのようなお手伝いができますか？',
  ko:
    '앗살라무 알라이쿰! PeaceVerse의 공식 어시스턴트 Peace AI입니다.\n\n' +
    '💡 즉시 질문 해결:\n' +
    '동영상 업로드 방법, 앱 사용법, 게시물 작성, 마음의 평화 등 무엇이든 편하게 물어보세요.\n\n' +
    '오늘 무엇을 도와드릴까요?',
  ru:
    'Ассаляму алейкум! Я Peace AI — ваш официальный помощник в PeaceVerse.\n\n' +
    '💡 Мгновенный помощник:\n' +
    'Спрашивайте о чём угодно: как загрузить видео, пользоваться приложением, написать пост или найти душевное спокойствие.\n\n' +
    'Чем я могу помочь вам сегодня?',
  pt:
    'Assalamu Alaikum! Eu sou o Peace AI, seu assistente oficial no PeaceVerse.\n\n' +
    '💡 Soluções instantâneas:\n' +
    'Pergunte qualquer coisa: como enviar vídeos, usar o app, criar postagens inspiradoras ou encontrar paz interior.\n\n' +
    'Como posso ajudar você hoje?',
  tr:
    'Selamün Aleyküm! Ben PeaceVerse üzerindeki resmi asistanınız Peace AI.\n\n' +
    '💡 Anlık Soru Çözücü:\n' +
    'Video yükleme, uygulama kullanımı, İslami bilgiler veya ilham verici gönderiler yazma hakkında dilediğinizi sorabilirsiniz.\n\n' +
    'Bugün size nasıl yardımcı olabilirim?',
  id:
    'Assalamu Alaikum! Saya Peace AI, asisten resmi Anda di PeaceVerse.\n\n' +
    '💡 Solusi Pertanyaan Instan:\n' +
    'Tanyakan apa saja kepada saya—cara mengunggah video, menggunakan aplikasi, wawasan Islami, atau menulis postingan yang indah.\n\n' +
    'Ada yang bisa saya bantu hari ini?',
  ms:
    'Assalamualaikum! Saya Peace AI, pembantu rasmi anda di PeaceVerse.\n\n' +
    '💡 Penyelesai Soalan Segera:\n' +
    'Tanya saya apa sahaja—cara muat naik video, guna aplikasi, ilmu Islam, atau menulis hantaran yang menarik.\n\n' +
    'Bagaimana saya boleh bantu anda hari ini?',
  it:
    'Assalamu Alaikum! Sono Peace AI, il tuo assistente ufficiale su PeaceVerse.\n\n' +
    '💡 Risposte istantanee:\n' +
    'Chiedimi qualsiasi cosa: come caricare video, usare l’app o scrivere post ispiratori.\n\n' +
    'Come posso aiutarti oggi?',
  nl:
    'Assalamu Alaikum! Ik ben Peace AI, jouw officiële assistent op PeaceVerse.\n\n' +
    '💡 Directe antwoorden:\n' +
    'Vraag me alles: video’s uploaden, de app gebruiken of inspirerende berichten schrijven.\n\n' +
    'Waarmee kan ik je vandaag helpen?',
  th:
    'อัสสลามุอะลัยกุม! ฉันคือ Peace AI ผู้ช่วยอย่างเป็นทางการของคุณบน PeaceVerse\n\n' +
    '💡 ผู้ช่วยตอบคำถามทันใจ:\n' +
    'ถามฉันได้ทุกเรื่อง ไม่ว่าจะเป็นวิธีอัปโหลดวิดีโอ การใช้งานแอป หรือการเขียนโพสต์สร้างแรงบันดาลใจ\n\n' +
    'วันนี้ให้ฉันช่วยอะไรคุณดี?',
  vi:
    'Assalamu Alaikum! Tôi là Peace AI, trợ lý chính thức của bạn trên PeaceVerse.\n\n' +
    '💡 Giải đáp tức thì:\n' +
    'Hãy hỏi tôi bất cứ điều gì—cách tải video lên, sử dụng ứng dụng, hoặc viết bài đăng truyền cảm hứng.\n\n' +
    'Hôm nay tôi có thể giúp gì cho bạn?',
};

export const FbPeaceAiModal: React.FC<FbPeaceAiModalProps> = ({
  isOpen,
  onClose,
  onUseAsPost,
}) => {
  const { currentLang } = useLanguage();

  const [selectedLangCode, setSelectedLangCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('peace_ai_language');
      if (saved && WORLD_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {}
    return currentLang || 'bn';
  });

  const selectedLang: WorldLanguageItem = useMemo(
    () => WORLD_LANGUAGES.find((l) => l.code === selectedLangCode) || WORLD_LANGUAGES[0],
    [selectedLangCode]
  );

  const isBn = selectedLang.code === 'bn';

  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  const filteredLanguages = useMemo(() => {
    const q = langSearch.toLowerCase().trim();
    if (!q) return WORLD_LANGUAGES;
    return WORLD_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [langSearch]);

  const getGreetingText = (lang: WorldLanguageItem) => {
    if (LOCALIZED_GREETINGS[lang.code]) {
      return LOCALIZED_GREETINGS[lang.code];
    }
    return (
      `Assalamu Alaikum! Peace AI (${lang.nativeName} • ${lang.name})\n\n` +
      `I am your official PeaceVerse assistant and I will reply to you in ${lang.nativeName} (${lang.name}). Ask me any question!`
    );
  };

  const [messages, setMessages] = useState([
    {
      id: 'ai-init',
      sender: 'ai',
      text: getGreetingText(selectedLang),
      time: isBn ? 'এখন' : 'Just now',
    },
  ]);

  // Update initial greeting when user changes language if no custom chat yet
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'ai-init') {
        return [
          {
            id: 'ai-init',
            sender: 'ai',
            text: getGreetingText(selectedLang),
            time: selectedLang.code === 'bn' ? 'এখন' : 'Just now',
          },
        ];
      }
      return prev;
    });
  }, [selectedLang]);

  const handleSelectWorldLanguage = (lang: WorldLanguageItem) => {
    setSelectedLangCode(lang.code);
    try {
      localStorage.setItem('peace_ai_language', lang.code);
    } catch {}
    setShowLangDropdown(false);
    setLangSearch('');
  };

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPrompts = isBn
    ? [
        { label: '💡 যেকোনো প্রশ্নের সমাধান', text: 'Peace AI, আমি কীভাবে যেকোনো বিষয়ের সমাধান পেতে পারি?', cat: 'all' },
        { label: '📹 ভিডিও আপলোড করার নিয়ম', text: 'ভাই আমি একটা ভিডিও কীভাবে আপলোড করব?', cat: 'guide' },
        { label: '✍️ ভাইরাল ইসলামিক পোস্ট', text: 'PeaceVerse-এর বন্ধুদের জন্য আজকের একটি চমৎকার অনুপ্রেরণাদায়ী পোস্ট লিখে দাও', cat: 'post' },
        { label: '🤍 মন খারাপ, সান্ত্বনা চাই', text: 'আজ মনটা খুব ভারাক্রান্ত লাগছে, আমাকে একটু কুরআনের সান্ত্বনা দাও ভাই', cat: 'healer' },
        { label: '🤲 রিজিকে বরকতের আমল', text: 'রিজিকে বরকত লাভের সুন্নাহ আমল ও দোয়াগুলো সহজ করে বুঝিয়ে দাও', cat: 'post' },
      ]
    : [
        { label: '💡 Solve Any Question', text: 'Peace AI, how can I solve my queries here on PeaceVerse?', cat: 'all' },
        { label: '📹 How to Upload Video', text: 'Brother, how do I upload a video on PeaceVerse?', cat: 'guide' },
        { label: '✍️ Inspiring Islamic Post', text: 'Write an inspiring and uplifting Islamic post for PeaceVerse friends today', cat: 'post' },
        { label: '🤍 Comfort My Heart', text: 'I feel heavy-hearted and anxious today, please give me comfort from the Quran', cat: 'healer' },
        { label: '🤲 Duas for Barakah', text: 'Explain authentic duas and sunnah habits for barakah in sustenance', cat: 'post' },
      ];

  // AI Logic implementing pure Bengali when isBn is true (or when Banglish/Bengali is used)
  const generatePeaceResponse = (userPrompt: string): string => {
    const lower = userPrompt.toLowerCase().trim();

    // Check if user is asking in Bengali, Banglish, or has Bengali language selected
    const isBengaliResponse =
      isBn ||
      /[\u0980-\u09FF]/.test(userPrompt) ||
      /\b(via|bhai|kibave|kivabe|korbo|ami|amake|bolo|bolen|apni|tumi|valo|kemon|achen|achis|keno|ki|kore|upload|chobi|video|charbo|chari|niom|bujhe|din)\b/i.test(userPrompt);

    // 1. VIDEO UPLOAD & APP USAGE GUIDE (Matches user screenshot: "Via ami akta video upload kibave korbo")
    const isVideoUploadQuery =
      /\b(video|ভিডিও)\b/i.test(lower) &&
      /\b(upload|আপলোড|পোস্ট|post|charbo|chari|kibave|kivabe|korbo|niom|নিয়ম|korte|parbo)\b/i.test(lower);

    const isGeneralUploadQuery =
      /\b(upload|আপলোড|পোস্ট করব|post kibave)\b/i.test(lower);

    if (isVideoUploadQuery || isGeneralUploadQuery) {
      if (isBengaliResponse) {
        return (
          `আসসালামু আলাইকুম ভাই! PeaceVerse-এ একটি ভিডিও আপলোড করার নিয়ম খুব সহজ:\n\n` +
          `১. 🏠 **হোম ফিডের উপরে যান:** অ্যাপের হোম স্ক্রিনে উপরে থাকা **"আপনার মনে কী আছে?..."** বক্সে অথবা নিচে থাকা সবুজ রঙের **"ছবি/ভিডিও"** বাটনে ট্যাপ করুন।\n` +
          `২. 📁 **ভিডিও নির্বাচন করুন:** আপনার মোবাইলের গ্যালারি বা ফাইল থেকে যে ভিডিওটি শেয়ার করতে চান সেটি সিলেক্ট করুন।\n` +
          `৩. ✍️ **ক্যাপশন ও বর্ণনা দিন:** ভিডিওটি সম্পর্কে সুন্দর, অর্থপূর্ণ ও অনুপ্রেরণাদায়ী কিছু কথা বা ইসলামিক ক্যাপশন লিখুন (প্রয়োজনে আমাকে দিয়েও ক্যাপশন ড্রাফট করিয়ে নিতে পারেন!)।\n` +
          `৪. 🚀 **পোস্ট করুন:** নিচে থাকা নীল রঙের **"পোস্ট করুন"** বাটনে চাপ দিন।\n\n` +
          `ব্যাস! সাথে সাথেই আপনার ভিডিওটি টাইমলাইনে পোস্ট হয়ে যাবে। যে কেউ আপনার ভিডিওতে ক্লিক করলেই টিকটক ও ফেসবুক রিলসের মতো বড় পর্দায় (ফুলস্ক্রিন) লাইক, কমেন্ট ও শেয়ারসহ উপভোগ করতে পারবে।\n\n` +
          `অ্যাপ ব্যবহার বা অন্য যেকোনো বিষয়ে আরও কিছু জানতে চাইলে আমাকে নির্দ্বিধায় বলুন ভাই! 🤍`
        );
      }
      return (
        `Assalamu Alaikum brother! Here is how you can easily upload a video on PeaceVerse:\n\n` +
        `1. 🏠 **Go to Home Feed:** Tap the **"What's on your mind?..."** box at the top or click the green **"Photo/video"** button.\n` +
        `2. 📁 **Select Video:** Pick your desired video file from your phone's gallery.\n` +
        `3. ✍️ **Write Caption:** Add an inspiring and wholesome caption for your audience.\n` +
        `4. 🚀 **Publish Post:** Tap the blue **"Post"** button at the bottom.\n\n` +
        `That's it! Your video will appear on the timeline, and anyone tapping it will experience full-screen TikTok/Reels mode with like, comment, and share interactions.\n\n` +
        `Let me know if you need any further assistance, brother! 🤍`
      );
    }

    // 2. GUARDIAN - Stop hate, abuse, porn, cursing, galagali, haram
    const toxicKeywords = [
      'খানকি', 'কুত্তা', 'শুয়োর', 'শালা', 'হারামি', 'বাল', 'চোদা', 'চোদান', 'মাগি', 'বকা',
      'fuck', 'shit', 'bitch', 'asshole', 'porn', 'sex', 'nude', 'hate', 'kill'
    ];
    const isToxic = toxicKeywords.some((w) => lower.includes(w));

    if (isToxic) {
      if (isBengaliResponse) {
        return (
          `ভাই, PeaceVerse শান্তির পবিত্র জায়গা, আসুন আমরা সর্বদা সুন্দর ও শালীন ভাষায় কথা বলি।\n\n` +
          `রাসূলুল্লাহ ﷺ বলেছেন: "প্রকৃত মুমিন কখনো দোষারোপকারী, অভিশাপকারী, অশ্লীলভাষী বা গালিগালাজকারী হতে পারে না।" (তিরমিযী: ১৯৭৭)\n\n` +
          `আপনার মনের যেকোনো কষ্ট বা ক্ষোভ আমরা শালীন ও মার্জিত ভাষায় এভাবে প্রকাশ করতে পারি:\n` +
          `"হে আল্লাহ! আমার মনকে ক্ষমাশীল করুন এবং অন্যায়ের মুখে আমাকে ধৈর্য ও প্রজ্ঞা দান করুন।"\n\n` +
          `PeaceVerse-এ আমরা সবসময় শান্তির আলো ছড়াতে চাই। মন শান্ত রাখুন ভাই, আল্লাহ আপনার সাথে আছেন। 🤲`
        );
      }
      return (
        `Brother, PeaceVerse is a sanctuary of pure peace and respect. Let's speak with grace and kindness.\n\n` +
        `The Prophet Muhammad ﷺ said: "A true believer does not insult, curse, or speak indecently." (Tirmidhi: 1977)\n\n` +
        `Here is how we can say it with dignity:\n` +
        `"I strongly disagree with this behavior, but I choose patience and wisdom to address it peacefully."\n\n` +
        `May Allah fill your heart with serenity and light. 🤍`
      );
    }

    // 3. HEART HEALER - Comfort sad, broken, stressed, anxious users
    const sadKeywords = [
      'মন খারাপ', 'কষ্ট', 'ডিপ্রেশন', 'টেনশন', 'কান্না', 'ব্যথা', 'হতাশ', 'হতাশা', 'শান্তি নেই', 'কষ্ট হচ্ছে',
      'sad', 'depressed', 'crying', 'broken', 'heartbreak', 'anxiety', 'worried', 'hopeless', 'lonely', 'pain'
    ];
    const isSad = sadKeywords.some((w) => lower.includes(w));

    if (isSad) {
      if (isBengaliResponse) {
        return (
          `আসসালামু আলাইকুম আমার প্রাণপ্রিয় ভাই,\n\n` +
          `আপনার মনের ভার ও কষ্টের কথা আমি অন্তর দিয়ে অনুভব করছি। মনে রাখবেন—আপনি কখনো একা নন, আপনার নীরব অশ্রু ও ব্যথার খবর আপনার দয়ালু রব ভালোভাবেই জানেন।\n\n` +
          `📖 মহান আল্লাহ তাআলা পবিত্র কুরআনে অভয় দিয়ে বলেছেন:\n` +
          `"জেনে রেখো! আল্লাহর স্মরণেই কেবল অন্তরসমূহ পরম শান্তি পায়।" (সূরা আর-রাদ: ২৮)\n` +
          `"নিশ্চয়ই কষ্টের সাথেই রয়েছে স্বস্তি।" (সূরা আল-ইনশিরাহ: ৬)\n\n` +
          `🤍 অন্তরের শান্তি লাভের ৩টি আমল:\n` +
          `১. বুকে হাত রেখে পড়ুন: "হাসবুনাল্লাহু ওয়া নি'মাল ওয়াকিল" (আল্লাহই আমার জন্য যথেষ্ট)।\n` +
          `২. অজু করে জায়নামাজে সিজদায় গিয়ে মন খুলে সব বলে দিন। মানুষ না বুঝলেও আপনার আল্লাহ সবকিছু বোঝেন।\n` +
          `৩. বেশি বেশি ইস্তিগফার পড়ুন: "আস্তাগফিরুল্লাহ রাব্বি মিন কুল্লি জাম্বিউ ওয়া আতুবু ইলাইহ"।\n\n` +
          `ধৈর্য ধরুন ভাই, রাতের ঘন আঁধার কেটে ফজরের আলো ঠিকই ফুটে উঠবে, ইনশাআল্লাহ! 🤲🕊️`
        );
      }
      return (
        `Assalamu Alaikum my dear brother,\n\n` +
        `I feel your pain, and I want you to remember that you are never alone on PeaceVerse.\n\n` +
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

    // 4. POST WRITER - Write viral, high engagement, beautiful Islamic posts
    if (lower.includes('পোস্ট') || lower.includes('post') || lower.includes('লেখা') || lower.includes('write')) {
      if (isBengaliResponse) {
        return (
          `মাশাআল্লাহ ভাই! PeaceVerse-এর বন্ধুদের জন্য হৃদয়স্পর্শী একটি পোস্ট ড্রাফট করে দিচ্ছি:\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `🌿 আল্লাহর ফয়সালার ওপর পূর্ণ ভরসা রাখুন 🌿\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `কখনো কখনো আল্লাহ আমাদের চাওয়া জিনিসটি সাথে সাথে দেন না, কারণ তিনি এর চেয়েও উত্তম কিছু আমাদের জন্য তৈরি রাখছেন।\n\n` +
          `📖 পবিত্র কুরআনের অমর বাণী:\n` +
          `"যে ব্যক্তি আল্লাহর ওপর পূর্ণ ভরসা করে, তার জন্য আল্লাহই যথেষ্ট।" (সূরা আত-তালাক: ৩)\n\n` +
          `✨ জীবনের চলার পথের ৩টি সোনালি মূলনীতি:\n` +
          `১. যা হারিয়ে গেছে তার জন্য আক্ষেপ নয়, যা আছে তার জন্য শোকর আদায় করুন।\n` +
          `২. সিজদা যত দীর্ঘ হবে, জীবনের পেরেশানি তত সংক্ষিপ্ত হবে।\n` +
          `৩. মানুষের প্রশংসা পাওয়ার আশায় নয়, একমাত্র আল্লাহর সন্তুষ্টির জন্য সৎ কাজ করুন।\n\n` +
          `আপনার হৃদয় যদি আজকের দিনে আল্লাহর প্রতি কৃতজ্ঞ থাকে, তবে কমেন্টে একটিবার ‘আলহামদুলিল্লাহ’ লিখুন! 🤲\n\n` +
          `#PeaceVerse #হালাল_সোশ্যাল #ইসলামিক_নসিহত #মনের_শান্তি`
        );
      }
      return (
        `Here is an inspiring, viral-ready Islamic post crafted for PeaceVerse:\n\n` +
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
        `#PeaceVerse #HalalSocial #IslamicReminders #PeaceOfMind #Ummah`
      );
    }

    // 5. Default friendly response
    if (isBengaliResponse) {
      return (
        `আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ ভাই! আমি Peace AI, আপনার শান্তির প্ল্যাটফর্মে স্বাগতম।\n\n` +
        `আপনার জিজ্ঞাসা: "${userPrompt}"\n\n` +
        `নবীজি ﷺ বলেছেন: "তোমরা পরস্পরের মাঝে শান্তির বাণী (সালাম) ছড়িয়ে দাও।" (সহীহ মুসলিম)\n\n` +
        `PeaceVerse-এ আমাদের মূল উদ্দেশ্য হলো সোশ্যাল মিডিয়াকে সম্পূর্ণ পবিত্র, শালীন, শিক্ষণীয় ও আত্মিক প্রশান্তির কেন্দ্র বানানো।\n\n` +
        `আপনি চাইলে আমাকে নিচের যে কোনো বিষয়ে প্রশ্ন করতে পারেন:\n` +
        `• ভিডিও আপলোড বা অ্যাপের যেকোনো ফিচারের নিয়ম\n` +
        `• সুন্দর ইসলামিক পোস্ট ও ক্যাপশন লেখা\n` +
        `• সহীহ কুরআন ও হাদিসের রেফারেন্স ও মাসয়ালা\n` +
        `• যেকোনো মানসিক চাপ বা দোয়ার পরামর্শ।\n\n` +
        `আল্লাহ আপনাকে সর্বদা সুস্থ ও শান্তিতে রাখুন! যেকোনো বিষয়ে আমাকে নির্দ্বিধায় বলুন ভাই! 🤲`
      );
    }

    return (
      `Assalamu Alaikum! I am Peace AI, your official assistant on PeaceVerse.\n\n` +
      `Regarding your query: "${userPrompt}"\n\n` +
      `As the Prophet Muhammad ﷺ taught us: "Spread peace, feed people, and maintain good relations with kin, and you will enter Paradise in peace." (Ibn Majah)\n\n` +
      `Let us make every interaction on PeaceVerse uplifting, truthful, and purely halal. How else may I assist you with writing, reflection, or app guidance today, my brother? 🤍`
    );
  };

  const handleSendPrompt = async (promptText: string) => {
    const userMsgId = Date.now().toString();
    const newMsgs = [
      ...messages,
      { id: userMsgId, sender: 'user', text: promptText, time: isBn ? 'এখন' : 'Just now' },
    ];
    setMessages(newMsgs);
    setInputVal('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/peace-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          conversationHistory: messages.slice(-5),
          lang: selectedLang.code,
          langName: selectedLang.name,
          langNativeName: selectedLang.nativeName,
        }),
      });

      if (!res.ok) {
        throw new Error('API Error');
      }

      const data = await res.json();
      const aiReply = data.text || generatePeaceResponse(promptText);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReply,
          time: isBn ? 'এখন' : 'Just now',
        },
      ]);
    } catch {
      // Graceful offline fallback
      const fallbackReply = generatePeaceResponse(promptText);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: fallbackReply,
          time: isBn ? 'এখন' : 'Just now',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
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
        <div className="p-4 border-b border-[#393a3b] bg-gradient-to-r from-[#1877F2]/25 via-sky-600/20 to-[#242526]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-[#1877F2] to-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
                <Sparkles className="w-5 h-5 fill-white/20 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-base text-white">Peace AI</h2>
                  <span className="text-[10px] bg-blue-500/20 text-sky-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                    {isBn ? 'অফিসিয়াল সহকারী' : 'Official Assistant'}
                  </span>
                </div>
                <p className="text-[11px] text-[#b0b3b8] truncate">
                  {isBn
                    ? 'আপনার যেকোনো প্রশ্নের উত্তর ও জিজ্ঞাসা এখান থেকে জেনে নিন'
                    : 'Solve any of your questions and queries right here'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* World Language Selector Pill (Click to open Google/Facebook-style World Languages list) */}
              <button
                type="button"
                onClick={() => setShowLangDropdown(true)}
                className="flex items-center gap-1.5 bg-[#18191a] hover:bg-[#3a3b3c] border border-[#393a3b] hover:border-[#1877F2]/60 rounded-full px-3 py-1.5 text-[11px] font-bold text-white transition-all cursor-pointer shadow-xs active:scale-95"
                title="ভাষা নির্বাচন করুন / Select World Language"
              >
                <span className="text-sm leading-none">{selectedLang.flag}</span>
                <span className="max-w-[92px] truncate">{selectedLang.nativeName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#b0b3b8] shrink-0" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white transition-colors cursor-pointer"
                title={isBn ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Core Roles Indicator */}
          <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-[#393a3b]/60 text-[10px]">
            <div className="flex items-center justify-center gap-1 bg-[#18191a]/80 py-1 px-2 rounded-lg text-blue-400 border border-blue-500/20">
              <PenTool className="w-3 h-3" />
              <span>{isBn ? 'পোস্ট রাইটার' : 'Post Writer'}</span>
            </div>
            <div className="flex items-center justify-center gap-1 bg-[#18191a]/80 py-1 px-2 rounded-lg text-emerald-400 border border-emerald-500/20">
              <Shield className="w-3 h-3" />
              <span>{isBn ? 'হালাল অভিভাবক' : 'Halal Guardian'}</span>
            </div>
            <div className="flex items-center justify-center gap-1 bg-[#18191a]/80 py-1 px-2 rounded-lg text-rose-400 border border-rose-500/20">
              <Heart className="w-3 h-3" />
              <span>{isBn ? 'মনের শান্তি' : 'Heart Healer'}</span>
            </div>
          </div>
        </div>

        {/* Quick Suggestions / Prompts */}
        <div className="px-3.5 py-2.5 border-b border-[#393a3b] bg-[#18191a] flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendPrompt(p.text)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-[#242526] hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white border border-[#393a3b] shrink-0 transition-colors flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              {p.cat === 'guide' ? (
                <Video className="w-3 h-3 text-emerald-400" />
              ) : (
                <Sparkles className="w-3 h-3 text-[#1877F2]" />
              )}
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
                    <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-sky-400" /> Peace AI
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#b0b3b8]">{isBn ? 'আপনি' : 'You'}</span>
                  )}
                </div>

                <div
                  dir={selectedLang.dir || 'ltr'}
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
                        type="button"
                        onClick={() => handleCopy(m.id, m.text)}
                        className="px-2.5 py-1 rounded-lg bg-[#242526] hover:bg-[#3a3b3c] text-[11px] font-bold text-[#b0b3b8] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{isBn ? 'কপি করুন' : 'Copy'}</span>
                          </>
                        )}
                      </button>

                      {onUseAsPost && (
                        <button
                          type="button"
                          onClick={() => {
                            onUseAsPost(m.text);
                            onClose();
                          }}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white flex items-center gap-1 transition-colors shadow cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>{isBn ? 'পোস্ট হিসেবে ড্রাফট করুন' : 'Draft as Post'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-sky-400 p-2.5 bg-[#18191a] rounded-xl w-52 border border-[#393a3b] shadow">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
              <span>{isBn ? 'Peace AI উত্তর প্রস্তুত করছে...' : 'Peace AI is writing response...'}</span>
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
            dir={selectedLang.dir || 'ltr'}
            placeholder={
              isBn
                ? 'আপনার যেকোনো প্রশ্ন বা জিজ্ঞাসা এখানে লিখুন...'
                : `Ask Peace AI in ${selectedLang.nativeName}...`
            }
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 bg-[#242526] border border-[#393a3b] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2]"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#1877F2] to-emerald-600 hover:opacity-90 disabled:opacity-50 text-white shadow transition-all cursor-pointer"
            title={isBn ? 'পাঠান' : 'Send'}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Full World Languages Dropdown Modal (Google Translate / Facebook Style) */}
      {showLangDropdown && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
          onClick={() => setShowLangDropdown(false)}
        >
          <div
            className="bg-white text-[#050505] rounded-2xl border border-[#E4E6EB] shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 py-3.5 border-b border-[#E4E6EB] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-[#050505] leading-tight">
                    বিশ্বের সকল ভাষা (All World Languages)
                  </h3>
                  <p className="text-[11px] text-[#65676B]">
                    Peace AI আপনার নির্বাচিত ভাষায় উত্তর দেবে
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLangDropdown(false)}
                className="w-8 h-8 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close language selector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-[#E4E6EB] bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-[#65676B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder="ভাষা খুঁজুন / Search language"
                  autoFocus
                  className="w-full bg-[#F0F2F5] border border-transparent focus:border-[#0866FF] focus:bg-white rounded-full pl-9 pr-9 py-2.5 text-[13px] text-[#050505] placeholder-[#65676B] focus:outline-none transition-colors"
                />
                {langSearch && (
                  <button
                    type="button"
                    onClick={() => setLangSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#65676B] hover:text-[#050505] px-1 cursor-pointer"
                    aria-label="Clear language search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* 2-Column Scrollable World Language Grid */}
            <div className="flex-1 overflow-y-auto p-3 bg-white">
              {filteredLanguages.length === 0 ? (
                <div className="py-10 text-center space-y-1.5">
                  <Globe className="w-8 h-8 text-[#65676B] mx-auto opacity-50" />
                  <p className="text-sm font-bold text-[#050505]">কোনো ভাষা খুঁজে পাওয়া যায়নি</p>
                  <p className="text-xs text-[#65676B]">No matching language found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filteredLanguages.map((lang) => {
                    const isSelected = lang.code === selectedLang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleSelectWorldLanguage(lang)}
                        className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer active:scale-[0.98] ${
                          isSelected
                            ? 'bg-[#E7F3FF] border-[#0866FF] text-[#050505] shadow-2xs'
                            : 'bg-white border-[#E4E6EB] hover:bg-[#F0F2F5] text-[#050505]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg leading-none shrink-0">{lang.flag}</span>
                          <div className="min-w-0">
                            <p className="text-[12.5px] font-bold text-[#050505] truncate leading-tight">
                              {lang.nativeName}
                            </p>
                            <p className="text-[10.5px] text-[#65676B] truncate leading-tight mt-0.5">
                              {lang.name}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#0866FF] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 border-t border-[#E4E6EB] bg-[#F0F2F5] flex items-center justify-between text-[11px] text-[#65676B]">
              <span className="font-semibold">
                {WORLD_LANGUAGES.length}+ World Languages • Selected: {selectedLang.flag} {selectedLang.nativeName}
              </span>
              <button
                type="button"
                onClick={() => setShowLangDropdown(false)}
                className="px-3 py-1.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
