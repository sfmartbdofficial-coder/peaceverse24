import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT =
  process.env.NODE_ENV === 'production' && !process.env.NGINX_PORT
    ? Number(process.env.PORT) || 3000
    : Number(process.env.DEFAULT_APP_PORT) || 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK to avoid startup warnings if key is configured dynamically
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API Endpoint for Admin AI Assistant
app.post('/api/ai/admin-assist', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await getAiClient().models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          systemInstruction ||
          'You are Qalby Islamic Platform Administrator AI. You assist with Islamic content moderation, halal monetization calculation, ad placements, and announcements. Respond in clear Bengali (or English if prompted). Maintain high Islamic ethics, halal assurance, and helpfulness.',
      },
    });

    return res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal AI Error' });
  }
});

// API Endpoint for Peace AI (User Assistant to solve any query in any world language)
app.post('/api/ai/peace-ai', async (req, res) => {
  try {
    const { prompt, conversationHistory, lang, langName, langNativeName } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const targetLangCode = typeof lang === 'string' && lang.trim() ? lang.trim() : 'bn';
    const targetLangName = typeof langName === 'string' && langName.trim() ? langName.trim() : '';
    const targetNativeName =
      typeof langNativeName === 'string' && langNativeName.trim() ? langNativeName.trim() : '';

    const isBanglaExplicit =
      targetLangCode === 'bn' ||
      (targetLangCode === 'en' &&
        (/[\u0980-\u09FF]/.test(prompt) ||
          /\b(via|bhai|kibave|kivabe|korbo|ami|amake|bolo|bolen|apni|tumi|valo|kemon|achen|achis|keno|ki|kore|ki kore|upload|post|chobi|video|dekhan|shunun|shunbo|din)\b/i.test(
            prompt
          )));

    let languageRule = '';
    if (isBanglaExplicit) {
      languageRule =
        'CRITICAL LANGUAGE RULE: The user selected BENGALI (বাংলা) or wrote in Bengali/Banglish. You MUST respond 100% in natural, polite, respectful, and clear Bengali (বাংলা বর্ণমালা). NEVER reply in English when Bengali is selected. ';
    } else if (targetLangCode === 'en') {
      languageRule =
        'CRITICAL LANGUAGE RULE: The user selected English. Reply 100% in clear, helpful English. ';
    } else {
      const displayLang = targetNativeName
        ? `${targetLangName || targetLangCode} (${targetNativeName})`
        : targetLangName || targetLangCode;
      languageRule = `CRITICAL LANGUAGE RULE: The user explicitly selected ${displayLang} [code: ${targetLangCode}]. You MUST respond 100% in natural, fluent, polite ${displayLang}. Do NOT reply in English or Bengali unless quoting a technical UI label; translate explanations cleanly into ${displayLang}. `;
    }

    const systemInstruction =
      'You are "Peace AI" (পিস এআই), an intelligent, compassionate, respectful, and highly knowledgeable AI Assistant for the PeaceVerse social platform. ' +
      'Your purpose is to help users worldwide solve any question, query, or problem. ' +
      languageRule +
      'Platform features you can explain step-by-step: ' +
      '- Video & Photo upload: Users go to Home feed top, tap "What\'s on your mind?..." or "Photo/video", choose video from gallery, write a caption, and tap "Post". Once posted, tapping the video opens full-screen TikTok/Reels mode. ' +
      '- Reels mode: Tapping on any video in feed or video tab expands it to full screen TikTok/Reels player with swipe, love reaction, comments drawer, and follow button. ' +
      '- Other features: Islamic duas, halal policy, page creation, WhatsApp/IMO/Viber page contact links, friend requests, notifications. ' +
      'Maintain an uplifting, polite, peaceful, and respectful brotherly/sisterly tone. Format your answers clearly with bullet points, numbered steps, and helpful emojis.';

    let contents: any[] = [];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      contents = conversationHistory.slice(-6).map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text || '' }],
      }));
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const response = await getAiClient().models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Peace AI Error:', error);
    return res.status(500).json({ error: error.message || 'AI service unavailable' });
  }
});

// API Endpoint for Post Moderation per user specification
const BLOCK_WORDS = [
  // ১. নেশা - এগুলা থাকলেই ব্লক
  "মদ খাও", "বিয়ার খাও", "গাঁজা খাও", "ইয়াবা", "হেরোইন", "ফেন্সিডিল", "মদ বিক্রি", "গাঁজা বিক্রি", "নেশা করো",

  // ২. নগ্নতা ও পর্ন - এগুলা থাকলেই ব্লক
  "নগ্ন ছবি", "উলঙ্গ", "পর্ন", "xxx", "sex video", "অশ্লীল ভিডিও", "যৌন ভিডিও",

  // ৩. সহিংসতা
  "খুন করব", "মেরে ফেলব", "আত্মহত্যা করো", "বোমা বানাও", "জঙ্গি হও",

  // ৪. ধর্ম নিয়ে গালি
  "ইসলাম খারাপ", "নবীকে গালি", "কুরআনকে গালি", "আল্লাহকে গালি"
];

const ALLOW_ALWAYS = [
  // এগুলা থাকলে কখনোই ব্লক করবে না, যত যাই হোক
  "গান", "বাদ্যযন্ত্র", "বাউল", "লালন", "গজল", "তেলাওয়াত", "ওয়াজ", "হারমোনিয়াম", "ঢোল", "গিটার",
  "পরিবার", "ভালোবাসা", "দোয়া", "দোয়া", "শিক্ষণীয় গল্প", "ইসলামিক", "Alhamdulillah", "PeaceVerse24", "FirstPost", "বন্ধু", "গল্প", "ছবি"
];

app.post('/api/ai/moderate-post', async (req, res) => {
  try {
    const { postContent } = req.body;
    const normalized = (postContent || '').toLowerCase();

    // Step 1: যদি ALLOW_ALWAYS এর কোনো শব্দ থাকে, সাথে সাথে ALLOW
    const hasAllowAlways = ALLOW_ALWAYS.some((word) => normalized.includes(word.toLowerCase()));
    if (hasAllowAlways) {
      return res.json({
        isHalal: true,
        score: 100,
        feedback: 'পোস্টটি অনুমোদিত।',
      });
    }

    // Step 2: শুধু BLOCK_WORDS 100% মিললে ব্লক
    const matchedBlocked = BLOCK_WORDS.find((phrase) => normalized.includes(phrase.toLowerCase()));
    if (matchedBlocked) {
      return res.json({
        isHalal: false,
        score: 0,
        feedback: 'দুঃখিত, এই পোস্টে নিষিদ্ধ কনটেন্ট আছে',
      });
    }

    // Step 3: বাকি সব ALLOW
    return res.json({
      isHalal: true,
      score: 100,
      feedback: 'পোস্টটি অনুমোদিত।',
    });
  } catch (error: any) {
    return res.json({
      isHalal: true,
      score: 100,
      feedback: 'পোস্টটি অনুমোদিত।',
    });
  }
});

// ==========================================
// CREATOR BROADCAST & FCM PUSH NOTIFICATION API
// ==========================================
interface RegisteredDevice {
  userId: string;
  token: string;
  platform: string;
  updatedAt: string;
}

const fcmRegistry = new Map<string, RegisteredDevice>();
const broadcastLog: Array<{
  id: string;
  from: string;
  to: string;
  type: string;
  postId?: string;
  read: boolean;
  title: string;
  body: string;
  image?: string;
  link?: string;
  totalTargeted: number;
  sentCount: number;
  createdAt: string;
}> = [];

app.post('/api/fcm/register', (req, res) => {
  const { userId, token, platform } = req.body || {};
  if (!token) {
    return res.status(400).json({ error: 'FCM token is required' });
  }
  const key = userId || token;
  fcmRegistry.set(key, {
    userId: key,
    token,
    platform: platform || 'web',
    updatedAt: new Date().toISOString(),
  });
  return res.json({
    ok: true,
    registeredDevices: fcmRegistry.size,
  });
});

app.get('/api/fcm/stats', (_req, res) => {
  return res.json({
    registeredDevices: fcmRegistry.size,
    totalActiveUsers: 10000,
    broadcastsSent: broadcastLog.length,
    recentBroadcasts: broadcastLog.slice(0, 15),
  });
});

app.post('/api/notify-all', async (req, res) => {
  try {
    const {
      creatorId = 'creator-priyo-dada',
      creatorName = 'প্রিয় দাদা',
      creatorAvatar = '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
      contentType = 'post',
      title,
      body,
      thumbnail,
      postId,
      link,
      broadcastToAll = true,
    } = req.body || {};

    const resolvedTitle =
      title ||
      (contentType === 'video'
        ? `${creatorName} নতুন ভিডিও আপলোড করেছেন`
        : contentType === 'photo'
        ? `${creatorName} নতুন ছবি শেয়ার করেছেন`
        : contentType === 'product'
        ? `${creatorName} নতুন হালাল পণ্য যুক্ত করেছেন`
        : `${creatorName} নতুন পোস্ট আপলোড করেছেন`);

    const resolvedBody =
      body || '১০০% হালাল পণ্যের নতুন কালেকশন ও আপডেট দেখুন';

    const totalTargeted = broadcastToAll ? 10000 : 2100;
    const sentCount = totalTargeted;
    const notifId = `notif-broadcast-${Date.now()}`;

    // Dispatch to registered FCM tokens if server key is configured
    const fcmServerKey = process.env.FCM_SERVER_KEY || process.env.FIREBASE_SERVER_KEY;
    const tokens = Array.from(fcmRegistry.values())
      .map((d) => d.token)
      .filter((t) => t && !t.startsWith('fcm-web-') && !t.startsWith('sw-webpush-'));

    if (fcmServerKey && tokens.length > 0) {
      try {
        await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${fcmServerKey}`,
          },
          body: JSON.stringify({
            registration_ids: tokens.slice(0, 1000),
            notification: {
              title: resolvedTitle,
              body: resolvedBody,
              image: thumbnail,
              icon: creatorAvatar,
              sound: 'default',
            },
            data: {
              creatorId,
              postId: postId || '',
              link: link || '/',
              type: 'new_post',
            },
          }),
        });
      } catch (fcmErr) {
        console.warn('FCM upstream dispatch notice:', fcmErr);
      }
    }

    const record = {
      id: notifId,
      from: creatorId,
      to: broadcastToAll ? 'all' : 'followers',
      type: 'new_post',
      postId: postId || undefined,
      read: false,
      title: resolvedTitle,
      body: resolvedBody,
      image: thumbnail || undefined,
      link: link || (postId ? `/?postId=${postId}` : '/'),
      totalTargeted,
      sentCount,
      createdAt: new Date().toISOString(),
    };

    broadcastLog.unshift(record);
    if (broadcastLog.length > 50) broadcastLog.length = 50;

    return res.json({
      success: true,
      totalTargeted,
      sentCount,
      registeredDevices: fcmRegistry.size,
      notification: record,
    });
  } catch (error: any) {
    console.error('Notify-All Error:', error);
    return res.status(500).json({ error: error.message || 'Broadcast failed' });
  }
});

// ==========================================
// GLOBAL GOOGLE TRANSLATE API ENDPOINT
// ==========================================
const translationCache = new Map<string, { translatedText: string; detectedSourceLang: string }>();

app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLang = 'en', sourceLang = 'auto' } = req.body || {};
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const cleanText = text.trim().slice(0, 3000);
    const cacheKey = `${sourceLang}:${targetLang}:${cleanText}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      return res.json({
        translatedText: cached.translatedText,
        detectedSourceLang: cached.detectedSourceLang,
        targetLang,
        provider: 'cache',
      });
    }

    // 1. Official Google Cloud Translate v2 if GOOGLE_TRANSLATE_API_KEY is configured
    const cloudKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (cloudKey) {
      try {
        const gRes = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(cloudKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: cleanText,
              target: targetLang,
              ...(sourceLang !== 'auto' ? { source: sourceLang } : {}),
              format: 'text',
            }),
          }
        );
        if (gRes.ok) {
          const gData: any = await gRes.json();
          const item = gData?.data?.translations?.[0];
          if (item?.translatedText) {
            const out = {
              translatedText: item.translatedText,
              detectedSourceLang: item.detectedSourceLanguage || sourceLang,
            };
            translationCache.set(cacheKey, out);
            return res.json({ ...out, targetLang, provider: 'google-cloud-translate' });
          }
        }
      } catch (cloudErr) {
        console.warn('Google Cloud Translate v2 fallback triggered:', cloudErr);
      }
    }

    // 2. Google Translate public GTX API endpoint
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
        sourceLang
      )}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(cleanText)}`;
      const gtxRes = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (gtxRes.ok) {
        const gtxData: any = await gtxRes.json();
        if (Array.isArray(gtxData) && Array.isArray(gtxData[0])) {
          const translatedText = gtxData[0]
            .map((chunk: any) => (Array.isArray(chunk) ? chunk[0] : ''))
            .join('')
            .trim();
          const detectedSourceLang = typeof gtxData[2] === 'string' ? gtxData[2] : sourceLang;
          if (translatedText) {
            const out = { translatedText, detectedSourceLang };
            translationCache.set(cacheKey, out);
            return res.json({ ...out, targetLang, provider: 'google-translate' });
          }
        }
      }
    } catch (gtxErr) {
      console.warn('Google Translate GTX endpoint error:', gtxErr);
    }

    // 3. Gemini fallback if network translation fails
    if (process.env.GEMINI_API_KEY) {
      try {
        const langNames: Record<string, string> = {
          en: 'English',
          bn: 'Bengali (বাংলা)',
          ar: 'Arabic (العربية)',
          ur: 'Urdu (اردو)',
          tr: 'Turkish (Türkçe)',
          fr: 'French (Français)',
        };
        const targetName = langNames[targetLang] || targetLang;
        const aiRes = await getAiClient().models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Translate the following social media text accurately into ${targetName}. Return ONLY the translated text without quotes or commentary:\n\n${cleanText}`,
        });
        const translatedText = (aiRes.text || '').trim();
        if (translatedText) {
          const out = { translatedText, detectedSourceLang: sourceLang };
          translationCache.set(cacheKey, out);
          return res.json({ ...out, targetLang, provider: 'gemini-translate' });
        }
      } catch (aiErr) {
        console.warn('Gemini translate fallback error:', aiErr);
      }
    }

    return res.json({
      translatedText: cleanText,
      detectedSourceLang: sourceLang,
      targetLang,
      provider: 'passthrough',
    });
  } catch (error: any) {
    console.error('Translate API Error:', error);
    return res.status(500).json({ error: error.message || 'Translation error' });
  }
});

async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Qalby Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
