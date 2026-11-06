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
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Endpoint for Admin AI Assistant
app.post('/api/ai/admin-assist', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await ai.models.generateContent({
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
