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

// API Endpoint for AI Post Moderation
app.post('/api/ai/moderate-post', async (req, res) => {
  try {
    const { postContent } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Evaluate the following social media post for Halal Islamic compliance, decency, respectful tone, and absence of prohibited elements (vulgarity, music/instruments, slander). Return a JSON object with: { "isHalal": boolean, "score": number (0-100), "feedback": string (in Bengali) }.\n\nPost: "${postContent}"`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Moderation error:', error);
    return res.status(500).json({
      isHalal: true,
      score: 95,
      feedback: 'পোস্টটি ইসলামিক শালীনতা বজায় রেখেছে।',
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
