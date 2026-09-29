import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Clock,
  ArrowRight,
  ArrowLeft,
  Send,
  Headphones,
  AlertTriangle,
  Shuffle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Question, StudentProfile, QuizSettings } from '../types';
import { soundManager } from '../utils/audio';

interface QuizScreenProps {
  questions: Question[];
  studentProfile: StudentProfile;
  settings: QuizSettings;
  onSubmit: (answers: Record<number, number>, timeSpentSeconds: number, violationsCount: number) => void;
  onViolationOccurred: (reason: string, questionIndex: number) => void;
}

interface DisplayOption {
  text: string;
  originalIndex: number;
}

interface PreparedQuestion {
  question: Question;
  displayOptions: DisplayOption[];
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  questions,
  studentProfile,
  settings,
  onSubmit,
  onViolationOccurred,
}) => {
  // Unique draft storage key per student to enable robust auto-save recovery
  const draftKey = useMemo(() => {
    return `quiz_draft_${studentProfile.className}_${studentProfile.attendanceNumber}`;
  }, [studentProfile.className, studentProfile.attendanceNumber]);

  // Load existing draft if present
  const savedDraft = useMemo(() => {
    try {
      const item = localStorage.getItem(draftKey);
      if (item) {
        return JSON.parse(item);
      }
    } catch {
      // ignore
    }
    return null;
  }, [draftKey]);

  // Prepare shuffled questions & shuffled options per student
  const preparedQuestions: PreparedQuestion[] = useMemo(() => {
    // If draft already saved question order, we can restore it, or create stable shuffled order
    let list = [...questions];

    if (settings.shuffleQuestions) {
      // Pseudo-random seeded or shuffled
      list.sort(() => Math.random() - 0.5);
    }

    return list.map((q) => {
      let optionsWithOrig: DisplayOption[] = q.options.map((opt, idx) => ({
        text: opt,
        originalIndex: idx,
      }));

      if (settings.shuffleOptions) {
        optionsWithOrig.sort(() => Math.random() - 0.5);
      }

      return {
        question: q,
        displayOptions: optionsWithOrig,
      };
    });
  }, [questions, settings.shuffleQuestions, settings.shuffleOptions]);

  const [currentIdx, setCurrentIdx] = useState<number>(() => {
    return savedDraft?.currentIdx ?? 0;
  });

  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    return savedDraft?.answers ?? {};
  });

  const [timeSpent, setTimeSpent] = useState<number>(() => {
    return savedDraft?.timeSpent ?? 0;
  });

  const [remainingTime, setRemainingTime] = useState<number>(() => {
    if (settings.timeLimitMinutes <= 0) return 0;
    if (savedDraft?.remainingTime !== undefined) {
      return savedDraft.remainingTime;
    }
    return settings.timeLimitMinutes * 60;
  });

  const [speechRate, setSpeechRate] = useState(settings.defaultSpeechRate || 0.8);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [violationsCount, setViolationsCount] = useState<number>(() => {
    return savedDraft?.violationsCount ?? 0;
  });
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [showAutoSaveToast, setShowAutoSaveToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeItem = preparedQuestions[currentIdx] || preparedQuestions[0];
  const currentQuestion = activeItem?.question;

  // Persist Auto-Save Draft to localStorage whenever state changes
  useEffect(() => {
    try {
      const draftData = {
        answers,
        timeSpent,
        remainingTime,
        currentIdx,
        violationsCount,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    } catch {
      // ignore
    }
  }, [answers, currentIdx, draftKey, remainingTime, timeSpent, violationsCount]);

  // Auto-play audio when navigating to a listening question
  useEffect(() => {
    if (settings.autoPlayAudio && currentQuestion?.isListening && currentQuestion?.audioText) {
      soundManager.speakEnglishText(currentQuestion.audioText, speechRate, () => {
        setIsPlayingAudio(false);
      });
      setIsPlayingAudio(true);
    } else {
      soundManager.stopSpeech();
      setIsPlayingAudio(false);
    }

    return () => {
      soundManager.stopSpeech();
    };
  }, [currentIdx, currentQuestion, settings.autoPlayAudio, speechRate]);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);

      if (settings.timeLimitMinutes > 0) {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Clear draft and auto submit
            try {
              localStorage.removeItem(draftKey);
            } catch {
              // ignore
            }
            onSubmit(answers, timeSpent, violationsCount);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [answers, draftKey, onSubmit, settings.timeLimitMinutes, timeSpent, violationsCount]);

  // Anti-cheating: detect tab switch or blur
  useEffect(() => {
    if (!settings.enableAntiCheating) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        soundManager.playViolationSound();
        setViolationsCount((c) => c + 1);
        onViolationOccurred(
          'Siswa beralih tab atau meminimalkan browser saat kuis berlangsung',
          currentIdx + 1
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentIdx, onViolationOccurred, settings.enableAntiCheating]);

  // Option selection handler - stores original option index
  const handleSelectOption = (origIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: origIdx,
    }));

    // Trigger subtle auto-save badge
    setShowAutoSaveToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setShowAutoSaveToast(false);
    }, 1200);
  };

  // Toggle audio playback
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      soundManager.stopSpeech();
      setIsPlayingAudio(false);
    } else {
      const textToRead = currentQuestion.audioText || currentQuestion.passage || currentQuestion.question;
      soundManager.speakEnglishText(textToRead, speechRate, () => {
        setIsPlayingAudio(false);
      });
      setIsPlayingAudio(true);
    }
  };

  // Final submission
  const handleFinish = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < preparedQuestions.length) {
      if (
        !window.confirm(
          `Anda baru menjawab ${answeredCount} dari ${preparedQuestions.length} soal. Yakin ingin mengumpulkan sekarang?`
        )
      ) {
        return;
      }
    }

    soundManager.stopSpeech();

    // Clear saved draft on successful submission
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }

    onSubmit(answers, timeSpent, violationsCount);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 space-y-4">
      {/* Top Bar Info & Student Identity */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200">
            {studentProfile.attendanceNumber}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">{studentProfile.name}</p>
            <p className="text-xs text-slate-500">Kelas {studentProfile.className}</p>
          </div>
        </div>

        {/* Auto-save & Randomization status badge */}
        <div className="flex items-center gap-2">
          {showAutoSaveToast && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Jawaban Tersimpan</span>
            </div>
          )}

          {settings.shuffleQuestions && (
            <div
              title="Soal diacak untuk mencegah contekkan"
              className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-medium"
            >
              <Shuffle className="w-3 h-3 text-indigo-600" />
              <span>Soal Diacak</span>
            </div>
          )}

          {/* Timer display */}
          {settings.timeLimitMinutes > 0 ? (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
                remainingTime < 180
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Sisa: {formatTimer(remainingTime)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl font-mono text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5" />
              <span>Durasi: {formatTimer(timeSpent)}</span>
            </div>
          )}

          <button
            onClick={handleFinish}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kumpulkan</span>
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
        {/* Header Question */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-600 text-white font-extrabold text-xs rounded-lg">
              Soal {currentIdx + 1} / {preparedQuestions.length}
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              • {currentQuestion.topic}
            </span>
          </div>

          {/* Audio Controls */}
          {currentQuestion.isListening && (
            <div className="flex items-center gap-2 bg-indigo-50/70 border border-indigo-200/70 px-2.5 py-1 rounded-xl">
              <Headphones className="w-4 h-4 text-indigo-600 animate-pulse" />
              <button
                onClick={handleToggleAudio}
                className="text-xs font-bold text-indigo-700 hover:underline flex items-center gap-1"
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Dengarkan (Listening)</span>
                  </>
                )}
              </button>

              {/* Rate selector */}
              <select
                value={speechRate}
                onChange={(e) => setSpeechRate(Number(e.target.value))}
                className="text-[11px] bg-white border border-indigo-200 rounded-md px-1.5 py-0.5 text-indigo-800 font-semibold focus:outline-none"
              >
                <option value={0.7}>0.7x (Lambat)</option>
                <option value={0.8}>0.8x (Jelas ★)</option>
                <option value={0.9}>0.9x (Sedang)</option>
                <option value={1.0}>1.0x (Normal)</option>
              </select>
            </div>
          )}
        </div>

        {/* Passage if any */}
        {currentQuestion.passage && (
          <div className="p-4 bg-slate-50 border-l-4 border-indigo-500 rounded-r-xl text-slate-700 text-sm leading-relaxed font-serif italic">
            "{currentQuestion.passage}"
          </div>
        )}

        {/* Question Text */}
        <div className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
          {currentQuestion.question}
        </div>

        {/* Shuffled Options */}
        <div className="space-y-3">
          {activeItem.displayOptions.map((opt, displayIdx) => {
            const isSelected = answers[currentQuestion.id] === opt.originalIndex;
            const letter = String.fromCharCode(65 + displayIdx); // A, B, C, D

            return (
              <button
                key={displayIdx}
                onClick={() => handleSelectOption(opt.originalIndex)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all flex items-center gap-3.5 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-500/30'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0 transition-colors ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {letter}
                </span>
                <span
                  className={`text-sm sm:text-base font-medium ${
                    isSelected ? 'text-indigo-950 font-bold' : 'text-slate-700'
                  }`}
                >
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Nav inside card */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              currentIdx === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          {/* Flag button */}
          <button
            onClick={() =>
              setFlaggedQuestions((f) => ({ ...f, [currentQuestion.id]: !f[currentQuestion.id] }))
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              flaggedQuestions[currentQuestion.id]
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {flaggedQuestions[currentQuestion.id] ? '★ Ditandai Ragu-ragu' : 'Tandai Ragu-ragu'}
          </button>

          {currentIdx < preparedQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((i) => Math.min(preparedQuestions.length - 1, i + 1))}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Selanjutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Selesai & Kumpulkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Question Number Palette */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
        <p className="text-xs font-bold text-slate-700 mb-2.5">Navigasi Nomor Soal:</p>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {preparedQuestions.map((item, idx) => {
            const q = item.question;
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = idx === currentIdx;
            const isFlagged = flaggedQuestions[q.id];

            let bgClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
            if (isCurrent) {
              bgClass = 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-1';
            } else if (isFlagged) {
              bgClass = 'bg-amber-100 text-amber-800 border border-amber-300';
            } else if (isAnswered) {
              bgClass = 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${bgClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
