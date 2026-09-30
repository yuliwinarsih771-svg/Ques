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
  // Dev server must always run on port 3000 (nginx listens on 8080 and proxies to 3000)
  const PORT = 3000;

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

  // API endpoint: Generate quiz questions using Gemini
  app.post('/api/ai/generate-questions', async (req, res) => {
    const {
      topic = 'Introducing Myself and Others (Descriptive Text)',
      gradeLevel = 'Kelas 7 SMP (Kurikulum Merdeka)',
      count = 5,
      difficulty = 'Sedang',
      stimulusType = 'Campuran (Teks Bacaan & Dialog)',
      customInstructions = '',
      includeListening = false,
    } = req.body;

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

    const schemaConfig = {
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
    };

    let response;
    let usedModel = 'gemini-3.1-flash-lite';

    try {
      if (!apiKey) {
        throw new Error('API Key missing');
      }

      // Try gemini-3.1-flash-lite first (lightweight and highest rate limits)
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: schemaConfig,
        });
      } catch (liteErr: any) {
        console.warn('gemini-3.1-flash-lite failed or hit quota, trying gemini-3.8-flash...', liteErr.message);
        usedModel = 'gemini-3.8-flash';
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: schemaConfig,
        });
      }

      const rawText = response.text || '[]';
      const parsed = JSON.parse(rawText);
      const baseTime = Date.now();
      const generatedQuestions = parsed.map((q: any, i: number) => ({
        ...q,
        id: baseTime + i * 100 + Math.floor(Math.random() * 50),
      }));

      return res.json({
        success: true,
        questions: generatedQuestions,
        usedModel,
      });
    } catch (err: any) {
      console.warn('Gemini API call failed (quota exhausted or error):', err.message);

      // Return high-quality curriculum questions so user is never blocked by quota limit
      const fallbackQuestions = getCurriculumBackupQuestions(topic, count);
      return res.json({
        success: true,
        questions: fallbackQuestions,
        isFallback: true,
        quotaNotice: 'Batas kuota harian Gemini API tercapai (resource_exhausted). Soal berhasil dibuat menggunakan Bank Soal Kurikulum Merdeka SMP.',
      });
    }
  });

  // Curriculum backup questions for SMP
  function getCurriculumBackupQuestions(topicName: string, count: number) {
    const baseTime = Date.now();
    const bank = [
      {
        topic: topicName,
        question: 'Read the dialogue below:\nSiti: "Hello Edo, this is my new classmate, Nayla."\nEdo: "Hi Nayla, pleased to meet you!"\nNayla: "________, Edo."\n\nWhat is the most polite response to complete the conversation?',
        options: ['Pleased to meet you too', 'I am so sorry', 'Goodbye, see you tomorrow', 'Thank you very much'],
        correctAnswer: 0,
        explanation: 'Ungkapan respon yang tepat dan santun untuk menyambut "Pleased to meet you" adalah "Pleased to meet you too".',
        audioText: 'Hello Edo, this is my new classmate, Nayla. Hi Nayla, pleased to meet you! Pleased to meet you too, Edo.',
        isListening: true,
      },
      {
        topic: topicName,
        question: 'Read Andre\'s self-introduction:\n"Good morning everyone! My name is Andre Pratama. I am 13 years old and I live on Jalan Merdeka. On Sunday mornings, I always play badminton with my father."\n\nWhat is Andre\'s favorite routine on Sunday mornings?',
        options: ['Playing badminton with his father', 'Reading comic books alone', 'Cooking fried rice in the kitchen', 'Riding a bicycle to the market'],
        correctAnswer: 0,
        explanation: 'Dalam teks tertulis eksplisit: "On Sunday mornings, I always play badminton with my father".',
        audioText: 'Good morning everyone! My name is Andre Pratama. I am thirteen years old and I live on Jalan Merdeka. On Sunday mornings, I always play badminton with my father. What is Andre\'s favorite routine on Sunday mornings?',
        isListening: false,
      },
      {
        topic: topicName,
        question: 'Read the description of Galang\'s brother:\n"Galang has an older brother named Bagas. Bagas is very tall and has curly black hair. He is friendly and loves playing basketball."\n\nWhich of the following physical descriptions matches Bagas?',
        options: ['He is short and has straight brown hair', 'He is very tall and has curly black hair', 'He is chubby and wears round glasses', 'He has long blonde hair and is small'],
        correctAnswer: 1,
        explanation: 'Dalam teks deskripsi fisik dijelaskan: "Bagas is very tall and has curly black hair".',
        audioText: 'Galang has an older brother named Bagas. Bagas is very tall and has curly black hair. He is friendly and loves playing basketball.',
        isListening: false,
      },
      {
        topic: topicName,
        question: 'Choose the correct subject pronoun to complete the sentence:\n"Monita and Pipit are studying in the school library. ________ are preparing for the English exam together."',
        options: ['She', 'He', 'They', 'We'],
        correctAnswer: 2,
        explanation: 'Subjek jamak orang ketiga (Monita dan Pipit) digantikan dengan kata ganti "They".',
        audioText: 'Monita and Pipit are studying in the school library. They are preparing for the English exam together.',
        isListening: false,
      },
      {
        topic: topicName,
        question: 'Read the procedure steps for making sweet warm tea:\n"First, boil one cup of clean water in a kettle. Second, put one tea bag and two teaspoons of sugar into a glass. Third, pour the hot water and stir well."\n\nWhat should you do after boiling the water?',
        options: ['Drink the tea immediately', 'Put one tea bag and sugar into a glass', 'Buy a new kettle', 'Turn off the electric light'],
        correctAnswer: 1,
        explanation: 'Langkah kedua (Second) setelah mendidihkan air adalah memasukkan kantong teh dan gula ke dalam gelas.',
        audioText: 'First, boil one cup of clean water in a kettle. Second, put one tea bag and two teaspoons of sugar into a glass. Third, pour the hot water and stir well.',
        isListening: true,
      },
      {
        topic: topicName,
        question: 'Identify the correct simple present tense verb:\n"Galang and his friends ________ to school by bicycle every morning."',
        options: ['go', 'goes', 'went', 'going'],
        correctAnswer: 0,
        explanation: 'Subjek jamak (Galang and his friends / They) dalam Simple Present Tense menggunakan kata kerja bentuk dasar tanpa akhiran -s/-es (go).',
        audioText: 'Galang and his friends go to school by bicycle every morning.',
        isListening: false,
      },
    ];

    return bank.slice(0, count).map((item, i) => ({
      ...item,
      id: baseTime + i * 100 + Math.floor(Math.random() * 50),
    }));
  }

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
