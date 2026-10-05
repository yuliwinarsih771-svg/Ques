import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  CheckCircle,
  Copy,
  Trash2,
  Volume2,
  PlusCircle,
  Sliders,
  HelpCircle,
  Layers,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Send,
  AlertCircle,
} from 'lucide-react';
import { Question } from '../types';
import { DEFAULT_QUESTIONS } from '../data/quizData';
import { soundManager } from '../utils/audio';

interface AiQuestionGeneratorProps {
  currentQuestions: Question[];
  onSaveQuestions: (questions: Question[]) => void;
  onClose?: () => void;
}

const PRESET_TOPICS = [
  {
    id: 'intro',
    title: 'Introducing Myself & Others',
    topic: 'Introducing Myself and Others (Descriptive Text)',
    desc: 'Nama, asal daerah, umur, hobi, dan perkenalan teman',
  },
  {
    id: 'family',
    title: 'Describing Family & Friends',
    topic: 'Describing Family Members and Physical Traits',
    desc: 'Anggota keluarga, ciri fisik (tall, curly hair), kepribadian',
  },
  {
    id: 'school',
    title: 'School Environment & Daily Activities',
    topic: 'School Environment, Classroom Objects & Daily Routines',
    desc: 'Benda kelas, jadwal pelajaran, kegiatan sehari-hari di SMP',
  },
  {
    id: 'procedure',
    title: 'Procedure Text (Food & Drink)',
    topic: 'Procedure Text - Recipes and Making Drinks/Food',
    desc: 'Langkah membuat teh hangat, nasi goreng, bahan & urutan aksi',
  },
  {
    id: 'greeting',
    title: 'Greetings & Leave-takings',
    topic: 'Greetings, Gratitude, and Apologies in Daily Life',
    desc: 'Ungkapan sapaan, berterima kasih, dan meminta maaf santun',
  },
  {
    id: 'grammar',
    title: 'Grammar in Context: Simple Present',
    topic: 'Grammar Focus: Simple Present Tense & Subject Pronouns',
    desc: 'Kata ganti (He/She/They), to be (am/is/are), dan kata kerja dasar',
  },
];

export const AiQuestionGenerator: React.FC<AiQuestionGeneratorProps> = ({
  currentQuestions,
  onSaveQuestions,
}) => {
  // Form configuration state
  const [selectedPreset, setSelectedPreset] = useState<string>('intro');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>('Kelas 7 SMP (Kurikulum Merdeka)');
  const [difficulty, setDifficulty] = useState<'Mudah' | 'Sedang' | 'HOTS / Analisis'>('Sedang');
  const [stimulusType, setStimulusType] = useState<string>('Campuran (Teks Bacaan Pendek & Dialog)');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [includeListening, setIncludeListening] = useState<boolean>(true);

  // Generation status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Audio testing state
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  // Active topic string
  const activeTopic = selectedPreset === 'custom' ? customTopic : (PRESET_TOPICS.find(p => p.id === selectedPreset)?.topic || customTopic);

  // Fallback generator when API key is missing or offline
  const generateFallbackQuestions = (topicName: string, count: number): Question[] => {
    const fallbacks: Question[] = [
      {
        id: 101,
        topic: topicName,
        question: 'Read the greeting carefully:\n"Good morning, my name is Andre. I am 13 years old and I love playing badminton on weekends."\n\nWhat is Andre\'s favorite hobby?',
        options: ['Playing badminton', 'Reading comic books', 'Cooking fried rice', 'Riding a bicycle'],
        correctAnswer: 0,
        explanation: 'Dalam teks tertulis: "I love playing badminton on weekends". Jadi hobi favorit Andre adalah bermain bulu tangkis (Playing badminton).',
        audioText: 'Good morning, my name is Andre. I am thirteen years old and I love playing badminton on weekends. What is Andre\'s favorite hobby?',
        isListening: false,
      },
      {
        id: 102,
        topic: topicName,
        question: 'Look at the dialogue below:\nSiti: "Hello Edo, this is my classmate, Nayla."\nEdo: "Hi Nayla, pleased to meet you!"\nNayla: "________, Edo."\n\nWhat is the most suitable response to complete the conversation?',
        options: ['Pleased to meet you too', 'I am sorry', 'Goodbye, see you', 'Thank you very much'],
        correctAnswer: 0,
        explanation: 'Ungkapan respon yang santun dan tepat untuk membalas salam "Pleased to meet you" adalah "Pleased to meet you too".',
        audioText: 'Hello Edo, this is my classmate, Nayla. Hi Nayla, pleased to meet you! Pleased to meet you too, Edo.',
        isListening: true,
      },
      {
        id: 103,
        topic: topicName,
        question: 'Read the description:\n"Galang has an older brother named Bagas. Bagas is very tall and has curly hair. He always helps Galang study English."\n\nWhat does Bagas look like?',
        options: ['He is short and has straight hair', 'He is tall and has curly hair', 'He is fat and wears glasses', 'He is small and has wavy hair'],
        correctAnswer: 1,
        explanation: 'Dalam teks deskripsi dinyatakan jelas: "Bagas is very tall and has curly hair".',
        audioText: 'Galang has an older brother named Bagas. Bagas is very tall and has curly hair. He always helps Galang study English.',
        isListening: false,
      },
      {
        id: 104,
        topic: topicName,
        question: 'Complete the sentence with the correct pronoun:\n"Monita and Pipit are in the school library. ________ are reading story books together."',
        options: ['She', 'He', 'They', 'We'],
        correctAnswer: 2,
        explanation: 'Subjek yang dibicarakan adalah jamak pihak ketiga (Monita and Pipit), sehingga kata ganti subjek yang tepat adalah "They".',
        audioText: 'Monita and Pipit are in the school library. They are reading story books together.',
        isListening: false,
      },
      {
        id: 105,
        topic: topicName,
        question: 'Listen / Read the text:\n"First, boil two cups of clean water in a small pan. Second, put one tea bag into the cup and pour the hot water."\n\nWhat is the first step according to the procedure text?',
        options: ['Put the tea bag into the cup', 'Boil two cups of clean water', 'Add sugar to the hot tea', 'Stir the tea slowly with a spoon'],
        correctAnswer: 1,
        explanation: 'Langkah pertama (First) yang tertulis adalah mendidihkan dua cangkir air bersih (boil two cups of clean water).',
        audioText: 'First, boil two cups of clean water in a small pan. Second, put one tea bag into the cup and pour the hot water.',
        isListening: true,
      },
    ];

    return fallbacks.slice(0, count).map((q, idx) => ({
      ...q,
      id: Date.now() + idx * 50 + Math.floor(Math.random() * 20),
      topic: topicName,
    }));
  };

  // Call server-side Gemini API
  const handleGenerate = async () => {
    if (selectedPreset === 'custom' && !customTopic.trim()) {
      setNotification({ type: 'error', text: 'Silakan ketikkan nama topik soal yang ingin dibuat.' });
      return;
    }

    setIsGenerating(true);
    setNotification(null);
    setStatusMessage('Menghubungkan ke AI Gemini...');

    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeTopic,
          gradeLevel,
          count: questionCount,
          difficulty,
          stimulusType,
          customInstructions,
          includeListening,
        }),
      });

      const data = await response.json();

      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        const baseTime = Date.now();
        const formatted: Question[] = data.questions.map((q: any, i: number) => ({
          id: typeof q.id === 'number' ? q.id : baseTime + i * 50 + Math.floor(Math.random() * 20),
          topic: q.topic || activeTopic,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D'],
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
          explanation: q.explanation || 'Pembahasan kunci jawaban.',
          audioText: q.audioText || q.question,
          isListening: Boolean(q.isListening),
        }));

        setGeneratedQuestions(formatted);
        if (data.quotaNotice) {
          setNotification({
            type: 'info',
            text: `${data.quotaNotice} (${formatted.length} butir soal siap digunakan).`,
          });
        } else {
          setNotification({
            type: 'success',
            text: `Berhasil membuat ${formatted.length} butir soal dengan AI! Silakan pratinjau dan sesuaikan di bawah.`,
          });
        }
      } else {
        // Fallback gracefully without console pollution
        const fallbackList = generateFallbackQuestions(activeTopic, questionCount);
        setGeneratedQuestions(fallbackList);
        setNotification({
          type: 'info',
          text: `Berhasil membuat ${fallbackList.length} butir soal berdasarkan kurikulum SMP (Mode Cadangan Kurikulum). Anda dapat mengedit butir soal di bawah.`,
        });
      }
    } catch {
      // Fallback to curriculum offline generator
      const fallbackList = generateFallbackQuestions(activeTopic, questionCount);
      setGeneratedQuestions(fallbackList);
      setNotification({
        type: 'info',
        text: `Berhasil membuat ${fallbackList.length} butir soal kurikulum Bahasa Inggris SMP. Anda dapat meninjau dan mengeditnya di bawah.`,
      });
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  // Play audio TTS preview for a question
  const handlePlayAudio = (q: Question, index: number) => {
    if (playingIndex === index) {
      soundManager.stopSpeech();
      setPlayingIndex(null);
      return;
    }

    setPlayingIndex(index);
    const textToSpeak = q.audioText || q.question;
    soundManager.speakEnglishText(textToSpeak, 0.85, () => {
      setPlayingIndex(null);
    });
  };

  // Action: Replace all questions in the quiz with the new AI questions
  const executeReplaceQuestions = () => {
    if (generatedQuestions.length === 0) return;
    const sanitized = generatedQuestions.map((q, idx) => ({
      ...q,
      id: idx + 1,
    }));
    onSaveQuestions(sanitized);
    setNotification({
      type: 'success',
      text: `Kuis berhasil diperbarui! Sekarang kuis menggunakan ${sanitized.length} butir soal baru hasil AI.`,
    });
    soundManager.playSuccessSound();
  };

  const handleReplaceActiveQuestions = () => {
    if (generatedQuestions.length === 0) return;
    setShowReplaceConfirm(true);
  };

  const executeResetQuestions = () => {
    onSaveQuestions(DEFAULT_QUESTIONS);
    setNotification({
      type: 'success',
      text: 'Bank soal kuis telah di-reset kembali ke 10 soal default kurikulum!',
    });
    soundManager.playSuccessSound();
  };

  // Action: Append AI questions to existing quiz bank with guaranteed fresh unique IDs
  const handleAppendQuestions = () => {
    if (generatedQuestions.length === 0) return;
    const existingIds = new Set(currentQuestions.map(q => q.id));
    let nextId = 1;
    for (const q of currentQuestions) {
      if (typeof q.id === 'number' && q.id >= nextId && q.id < 1000000) {
        nextId = q.id + 1;
      }
    }

    const uniqueNewQuestions = generatedQuestions.map((q) => {
      let id = q.id;
      if (!id || existingIds.has(id)) {
        while (existingIds.has(nextId)) {
          nextId++;
        }
        id = nextId++;
      }
      existingIds.add(id);
      return { ...q, id };
    });

    const combined = [...currentQuestions, ...uniqueNewQuestions];
    onSaveQuestions(combined);
    setNotification({
      type: 'success',
      text: `Berhasil menambahkan ${uniqueNewQuestions.length} soal AI. Total soal kuis sekarang: ${combined.length} butir soal!`,
    });
    soundManager.playSuccessSound();
  };

  // Action: Copy text formatted exam paper to clipboard
  const handleCopyExamText = () => {
    if (generatedQuestions.length === 0) return;
    const text = generatedQuestions
      .map((q, idx) => {
        const letters = ['A', 'B', 'C', 'D'];
        const optionsText = q.options.map((opt, i) => `  ${letters[i]}. ${opt}`).join('\n');
        return `SOAL NO. ${idx + 1} (${q.topic})\n${q.question}\n\nPilihan Jawaban:\n${optionsText}\n\nKUNCI JAWABAN: ${letters[q.correctAnswer]}\nPEMBAHASAN: ${q.explanation}\n----------------------------------------\n`;
      })
      .join('\n');

    navigator.clipboard.writeText(text);
    setNotification({ type: 'success', text: 'Naskah soal lengkap berhasil disalin ke clipboard!' });
  };

  // Remove one item from generated list
  const handleRemoveItem = (index: number) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // Update specific question field
  const handleUpdateQuestion = (index: number, updated: Partial<Question>) => {
    setGeneratedQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updated };
      return copy;
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-700/60 border border-indigo-400/40 text-[11px] font-bold text-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>AI Question Generator • Powered by Gemini 3.8 Flash</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Pembuat Soal Kuis Otomatis Berbasis AI
          </h2>
          <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">
            Buat butir soal pilihan ganda Bahasa Inggris kurikulum SMP secara instan, lengkap dengan opsi A-B-C-D, kunci jawaban, pembahasan Bahasa Indonesia, dan stimulus audio listening.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-indigo-800/80 border border-indigo-600/50 text-right">
            <p className="text-[10px] text-indigo-300 font-semibold uppercase">Bank Soal Aktif</p>
            <p className="text-base font-extrabold text-white">{currentQuestions.length} Butir Soal</p>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium'
              : notification.type === 'info'
              ? 'bg-blue-50 border border-blue-200 text-blue-800 font-medium'
              : 'bg-rose-50 border border-rose-200 text-rose-800 font-medium'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
            {notification.type === 'info' && <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-700 px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Form Controls */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Parameter & Spesifikasi Pembuatan Soal
          </h3>
        </div>

        {/* Preset Topic Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Pilih Materi / Topik Pembelajaran:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {PRESET_TOPICS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPreset(p.id);
                  setNotification(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPreset === p.id
                    ? 'bg-indigo-50 border-indigo-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${selectedPreset === p.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {p.title}
                  </span>
                  {selectedPreset === p.id && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{p.desc}</p>
              </button>
            ))}

            {/* Custom Topic Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedPreset('custom');
                setNotification(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedPreset === 'custom'
                  ? 'bg-indigo-50 border-indigo-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${selectedPreset === 'custom' ? 'text-indigo-900' : 'text-slate-800'}`}>
                  ✨ Topik Bebas / Kustom Sendiri
                </span>
                {selectedPreset === 'custom' && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Ketikkan topik atau materi apapun yang Anda inginkan</p>
            </button>
          </div>

          {/* Custom topic input */}
          {selectedPreset === 'custom' && (
            <div className="mt-3">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Contoh: Asking for Clarification & Daily Expressions in English Class..."
                className="w-full px-3.5 py-2.5 bg-white border border-indigo-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Row of configurations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Jenjang */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Jenjang / Target Kelas:
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Kelas 7 SMP (Kurikulum Merdeka)">Kelas 7 SMP (Kurikulum Merdeka)</option>
              <option value="Kelas 8 SMP (Kurikulum Merdeka)">Kelas 8 SMP (Kurikulum Merdeka)</option>
              <option value="Kelas 9 SMP (Kurikulum Merdeka)">Kelas 9 SMP (Kurikulum Merdeka)</option>
            </select>
          </div>

          {/* Tingkat Kesulitan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tingkat Kesulitan:
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Mudah">Mudah (C1-C2: Remembering)</option>
              <option value="Sedang">Sedang (C3: Applying)</option>
              <option value="HOTS / Analisis">HOTS / Analisis (C4-C5)</option>
            </select>
          </div>

          {/* Bentuk Stimulus */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bentuk Soal / Stimulus:
            </label>
            <select
              value={stimulusType}
              onChange={(e) => setStimulusType(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Campuran (Teks Bacaan Pendek & Dialog)">Campuran (Teks & Dialog)</option>
              <option value="Reading Comprehension (Teks Deskriptif)">Reading Comprehension</option>
              <option value="Conversational Dialogue">Dialog / Percakapan</option>
              <option value="Vocabulary & Grammar in Context">Kosakata & Tata Bahasa</option>
            </select>
          </div>

          {/* Jumlah Soal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Jumlah Butir Soal:
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value={3}>3 Soal (Cepat)</option>
              <option value={5}>5 Soal (Standar Rekomendasi)</option>
              <option value={10}>10 Soal (Paket Lengkap Ujian)</option>
            </select>
          </div>
        </div>

        {/* Additional instructions & options */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Instruksi Tambahan dari Guru (Opsional):
            </label>
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Contoh: Sertakan nama tokoh lokal (Galang, Made, Sinta) dan gunakan kosakata tentang hobi olahraga..."
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeListeningCheck"
              checked={includeListening}
              onChange={(e) => setIncludeListening(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300"
            />
            <label htmlFor="includeListeningCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Sertakan naskah stimulus audio listening (dapat langsung diputar menggunakan Web Speech Audio)
            </label>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Topik: <strong className="text-indigo-700">{activeTopic}</strong> • {questionCount} Soal • {difficulty}
          </p>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs text-white shadow-md flex items-center gap-2 transition-all ${
              isGenerating
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{statusMessage || 'Sedang Membuat Soal AI...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Buat {questionCount} Soal dengan AI Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Questions Preview Section */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-4 pt-2">
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl">
            <div>
              <h4 className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Hasil Butir Soal AI ({generatedQuestions.length} Soal)</span>
              </h4>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                Anda dapat merevisi kalimat, mengganti kunci jawaban, atau langsung menerapkannya ke dalam kuis siswa.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyExamText}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                title="Salin semua naskah soal dan kunci ke clipboard"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Salin Naskah</span>
              </button>

              <button
                onClick={handleAppendQuestions}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                title="Tambahkan ke daftar soal kuis yang sudah ada"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Gabungkan (+{generatedQuestions.length} Soal)</span>
              </button>

              <button
                onClick={handleReplaceActiveQuestions}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                title="Jadikan soal-soal ini sebagai soal kuis utama yang aktif dikerjakan siswa"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Jadikan Soal Utama Siswa</span>
              </button>
            </div>
          </div>

          {/* List of generated questions */}
          <div className="space-y-4">
            {generatedQuestions.map((q, idx) => (
              <div
                key={`ai-gen-card-${q.id}-${idx}`}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-indigo-200 transition-all space-y-3.5"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                      {q.topic}
                    </span>
                    {q.isListening && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-amber-600" />
                        <span>Listening Stimulus</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Audio TTS test */}
                    <button
                      onClick={() => handlePlayAudio(q, idx)}
                      className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                        playingIndex === idx
                          ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Putar suara bacaan soal / listening"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] hidden sm:inline">
                        {playingIndex === idx ? 'Stop Audio' : 'Dengar TTS'}
                      </span>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus butir soal ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Teks Soal / Stimulus:
                  </label>
                  <textarea
                    rows={3}
                    value={q.question}
                    onChange={(e) => handleUpdateQuestion(idx, { question: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* 4 Choices A, B, C, D */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Pilihan Jawaban (Klik lingkaran opsi untuk menentukan kunci jawaban yang benar):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const letters = ['A', 'B', 'C', 'D'];
                      const isCorrect = q.correctAnswer === optIdx;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleUpdateQuestion(idx, { correctAnswer: optIdx })}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isCorrect
                              ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-semibold shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full text-[11px] font-extrabold flex items-center justify-center shrink-0 ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {letters[optIdx]}
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const newOptions = [...q.options];
                              newOptions[optIdx] = e.target.value;
                              handleUpdateQuestion(idx, { options: newOptions });
                            }}
                            className="w-full bg-transparent text-xs font-medium focus:outline-none"
                          />
                          {isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded shrink-0">
                              Kunci
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Pembahasan (Bahasa Indonesia):
                  </span>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => handleUpdateQuestion(idx, { explanation: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Menampilkan {generatedQuestions.length} butir soal AI siap pakai.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAppendQuestions}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200/80 transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tambahkan ke Bank Soal</span>
              </button>

              <button
                onClick={handleReplaceActiveQuestions}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Terapkan Sebagai Soal Ujian Aktif</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Question Bank Management */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Informasi Bank Soal Yang Sedang Aktif di Kuis ({currentQuestions.length} Soal)
            </h4>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            <p className="font-bold text-slate-800">
              Status Soal Siswa: Terpasang {currentQuestions.length} Butir Soal Pilihan Ganda
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Soal-soal ini adalah yang saat ini muncul dan dikerjakan oleh siswa di halaman ujian.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset ke Soal Standar (10 Soal)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Ganti Soal Utama */}
      {showReplaceConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">Terapkan Sebagai Soal Kuis Utama?</h3>
              <p className="text-xs text-slate-500">
                Tindakan ini akan menggantikan {currentQuestions.length} butir soal lama dengan {generatedQuestions.length} butir soal AI baru ini untuk dikerjakan siswa.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowReplaceConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowReplaceConfirm(false);
                  executeReplaceQuestions();
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Ya, Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Reset ke Soal Standar */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">Kembalikan ke Soal Standar?</h3>
              <p className="text-xs text-slate-500">
                Bank soal kuis akan di-reset kembali ke 10 soal standar awal materi Introducing Myself & Procedure Text.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  executeResetQuestions();
                }}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Ya, Reset Soal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
