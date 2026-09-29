import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Shared Gemini client on server
  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API endpoint: Generate quiz questions using Gemini 3.8 Flash
  app.post('/api/ai/generate-questions', async (req, res) => {
    try {
      const {
        topic = 'Introducing Myself and Others (Descriptive Text)',
        gradeLevel = 'Kelas 7 SMP (Kurikulum Merdeka)',
        count = 5,
        difficulty = 'Sedang',
        stimulusType = 'Campuran (Teks Bacaan & Dialog)',
        customInstructions = '',
        includeListening = false,
      } = req.body;

      if (!apiKey) {
        return res.status(500).json({
          success: false,
          error: 'GEMINI_API_KEY belum dikonfigurasi di server environment.',
        });
      }

      const prompt = `Anda adalah guru Bahasa Inggris SMP berpengalaman dan tim pengembang kurikulum (Kurikulum Merdeka).
Tugas Anda adalah membuat ${count} butir soal pilihan ganda Bahasa Inggris berkualitas tinggi untuk siswa ${gradeLevel}.

Spesifikasi Soal:
- Topik Utama: ${topic}
- Tingkat Kesulitan: ${difficulty} (Mudah: C1-C2, Sedang: C3, HOTS: C4-C5)
- Bentuk Stimulus: ${stimulusType}
- Buat soal dengan 4 opsi pilihan ganda (A, B, C, D)
- Tepat ada 1 jawaban yang benar (correctAnswer berupa indeks 0 untuk A, 1 untuk B, 2 untuk C, 3 untuk D)
- Sertakan penjelasan/pembahasan mendidik dalam Bahasa Indonesia yang jelas mengapa jawaban tersebut benar
- Sertakan 'audioText' untuk pembacaan audio/listening jika ada stimulus teks/dialog
${includeListening ? '- Berikan flag isListening = true pada minimal 1-2 soal listening dengan stimulus audio' : ''}
${customInstructions ? `- Instruksi Khusus dari Guru: ${customInstructions}` : ''}

Pastikan bahasa Inggris yang digunakan autentik, alami, dan sesuai dengan tingkat pemahaman siswa SMP di Indonesia.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an expert English educator in Indonesia who crafts high-quality, pedagogical multiple-choice English exam questions for SMP (Junior High School) students with accurate Indonesian explanations.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topic: {
                  type: Type.STRING,
                  description: 'Nama subtopik spesifik dari soal tersebut',
                },
                question: {
                  type: Type.STRING,
                  description: 'Teks soal lengkap, termasuk teks bacaan singkat atau dialog jika ada',
                },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Tepat 4 opsi pilihan jawaban: A, B, C, D',
                },
                correctAnswer: {
                  type: Type.INTEGER,
                  description: 'Indeks jawaban benar (0=A, 1=B, 2=C, 3=D)',
                },
                explanation: {
                  type: Type.STRING,
                  description: 'Pembahasan ringkas dan jelas dalam Bahasa Indonesia',
                },
                audioText: {
                  type: Type.STRING,
                  description: 'Naskah teks yang dibacakan untuk stimulus audio listening jika ada',
                },
                isListening: {
                  type: Type.BOOLEAN,
                  description: 'True jika tipe soal ini adalah latihan listening audio',
                },
              },
              required: ['topic', 'question', 'options', 'correctAnswer', 'explanation'],
            },
          },
        },
      });

      const rawText = response.text || '[]';
      const generatedQuestions = JSON.parse(rawText);

      return res.json({
        success: true,
        questions: generatedQuestions,
      });
    } catch (err: any) {
      console.error('Error generating questions with Gemini:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Terjadi kesalahan saat memproses permintaan AI.',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey) });
  });

  // Dev server with Vite middlewares OR prod static build
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
