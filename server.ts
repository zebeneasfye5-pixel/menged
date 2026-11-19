import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

const LANGUAGE_LABELS: Record<string, string> = {
  am: 'Amharic (አማርኛ)',
  om: 'Afaan Oromoo (Oromo)',
  ti: 'Tigrinya (ትግርኛ)',
  so: 'Somali (Af-Soomaali)',
  en: 'English',
  ar: 'Arabic (العربية)',
  fr: 'French (Français)',
  zh: 'Simplified Chinese (简体中文)',
};

function getAiClient(apiVersion?: string): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    ...(apiVersion ? { apiVersion } : {}),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getErrorStatusAndMessage(err: unknown): { status: number; message: string } {
  if (err && typeof err === 'object') {
    const record = err as Record<string, unknown>;
    const rawStatus = typeof record.status === 'number' ? record.status : 500;
    const status = rawStatus >= 400 && rawStatus < 600 ? rawStatus : 500;
    const message =
      typeof record.message === 'string' && record.message.trim()
        ? record.message
        : 'AI service request failed';
    return { status, message };
  }
  return { status: 500, message: String(err || 'Unknown server error') };
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const { status } = getErrorStatusAndMessage(err);
      if ((status === 429 || status === 503 || status === 500) && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    res.json({
      ok: true,
      hasGeminiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
      languages: Object.keys(LANGUAGE_LABELS),
    });
  });

  app.post('/api/translate', async (req: Request, res: Response) => {
    try {
      const { text, sourceLang, targetLang } = req.body as {
        text?: string;
        sourceLang?: string;
        targetLang?: string;
      };

      const cleanText = (text ?? '').trim();
      if (!cleanText) {
        res.status(400).json({ error: 'Text to translate is required.' });
        return;
      }

      const src = sourceLang && LANGUAGE_LABELS[sourceLang] ? sourceLang : 'auto';
      const tgt = targetLang && LANGUAGE_LABELS[targetLang] ? targetLang : 'en';

      if (src === tgt) {
        res.json({ translatedText: cleanText, sourceLang: src, targetLang: tgt });
        return;
      }

      const ai = getAiClient();
      if (!ai) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please set it in Settings > Secrets.',
        });
        return;
      }

      const srcLabel = src === 'auto' ? 'the detected language' : LANGUAGE_LABELS[src];
      const tgtLabel = LANGUAGE_LABELS[tgt];

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `Translate the following message accurately and naturally from ${srcLabel} to ${tgtLabel}. Preserve numbers, vehicle license plates, Birr amounts, place names, and urgency. Output ONLY the translated text without quotes, labels, or explanations.\n\nMessage:\n${cleanText}`,
          config: {
            systemInstruction:
              'You are a professional real-time multilingual transport, dispatch, and citizen interpreter supporting Amharic, Afaan Oromoo, Tigrinya, Somali, English, Arabic, French, and Chinese. Always output ONLY the direct natural translation in the requested target language and script.',
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        })
      );

      const translatedText = (response.text ?? '').trim();
      if (!translatedText) {
        res.status(502).json({ error: 'Translation model returned an empty response.' });
        return;
      }

      res.json({ translatedText, sourceLang: src, targetLang: tgt });
    } catch (err) {
      const { status, message } = getErrorStatusAndMessage(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/transcribe', async (req: Request, res: Response) => {
    try {
      const { audioBase64, mimeType, sourceLang } = req.body as {
        audioBase64?: string;
        mimeType?: string;
        sourceLang?: string;
      };

      const cleanBase64 = (audioBase64 ?? '').replace(/^data:[^;]+;base64,/, '').trim();
      if (!cleanBase64) {
        res.status(400).json({ error: 'Audio data is required for transcription.' });
        return;
      }

      const ai = getAiClient('v1beta');
      if (!ai) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please set it in Settings > Secrets.',
        });
        return;
      }

      const baseMime = (mimeType || 'audio/webm').split(';')[0].trim() || 'audio/webm';
      const langLabel = sourceLang && LANGUAGE_LABELS[sourceLang] ? LANGUAGE_LABELS[sourceLang] : '';
      const prompt = langLabel
        ? `The speaker is speaking in ${langLabel}. Transcribe the spoken audio verbatim in its native script and language. Output ONLY the transcribed words.`
        : 'Transcribe the spoken audio verbatim in its native script and language. Output ONLY the transcribed words.';

      const audioPart = {
        inlineData: {
          mimeType: baseMime,
          data: cleanBase64,
        },
      };

      let transcript = '';
      try {
        const response = await withRetry(() =>
          ai.models.generateContent({
            model: 'gemini-3.5-transcribe',
            contents: {
              parts: [audioPart, { text: prompt }],
            },
          })
        );
        transcript =
          (response.text ?? '').trim() ||
          (response.candidates?.[0]?.content?.parts ?? [])
            .map((p) => (typeof p.text === 'string' ? p.text : ''))
            .join(' ')
            .trim();
      } catch {
        // Fall through to gemini-4-hydrogen multimodal transcription
      }

      if (!transcript) {
        const textAi = getAiClient() || ai;
        const fallbackResp = await withRetry(() =>
          textAi.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: {
              parts: [audioPart, { text: prompt }],
            },
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          })
        );
        transcript = (fallbackResp.text ?? '').trim();
      }

      res.json({ transcript });
    } catch (err) {
      const { status, message } = getErrorStatusAndMessage(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/tts', async (req: Request, res: Response) => {
    try {
      const { text, langCode } = req.body as {
        text?: string;
        langCode?: string;
      };

      const cleanText = (text ?? '').trim();
      if (!cleanText) {
        res.status(400).json({ error: 'Text is required for speech synthesis.' });
        return;
      }

      const ai = getAiClient('v1beta');
      if (!ai) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please set it in Settings > Secrets.',
        });
        return;
      }

      const langLabel = langCode && LANGUAGE_LABELS[langCode] ? LANGUAGE_LABELS[langCode] : 'the text language';

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanText,
                  speechMetadata: {
                    style: `Clear, articulate, natural native ${langLabel} transport terminal announcement voice`,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        })
      );

      const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audioBase64) {
        res.status(502).json({ error: 'Text-to-speech model did not return audio data.' });
        return;
      }

      res.json({ audioBase64, mimeType: 'audio/wav' });
    } catch (err) {
      const { status, message } = getErrorStatusAndMessage(err);
      res.status(status).json({ error: message });
    }
  });

  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`National Transport Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
