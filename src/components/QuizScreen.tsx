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
  LayoutGrid,
  X,
  Flag,
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
  const [showIncompleteConfirm, setShowIncompleteConfirm] = useState(false);
  const [showPaletteModal, setShowPaletteModal] = useState(false);
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
  const executeSubmit = () => {
    soundManager.stopSpeech();

    // Clear saved draft on successful submission
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }

    onSubmit(answers, timeSpent, violationsCount);
  };

  const handleFinish = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < preparedQuestions.length) {
      setShowIncompleteConfirm(true);
      return;
    }
    executeSubmit();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round(((currentIdx + 1) / preparedQuestions.length) * 100);

  return (
    <div className="h-full max-h-full flex flex-col bg-slate-100/90 overflow-hidden select-none">
      {/* 1. TOP BAR (Compact, single-row on mobile and desktop) */}
      <header className="shrink-0 bg-white border-b border-slate-200/90 z-20 px-3 sm:px-6 py-2 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Student Identity */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {studentProfile.attendanceNumber}
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate leading-tight">
                {studentProfile.name}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                Kelas {studentProfile.className}
              </p>
            </div>
          </div>

          {/* Center: Current Question & Progress */}
          <div className="flex flex-col items-center shrink-0">
            <span className="text-xs sm:text-sm font-extrabold text-indigo-700">
              Soal {currentIdx + 1} <span className="text-slate-400 font-normal">/ {preparedQuestions.length}</span>
            </span>
            <div className="w-14 sm:w-24 h-1 bg-slate-200 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Right: Timer & Daftar Soal & Kumpulkan */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Auto-save indicator */}
            {showAutoSaveToast && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>Tersimpan</span>
              </span>
            )}

            {/* Timer */}
            {settings.timeLimitMinutes > 0 ? (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg font-mono text-xs font-bold ${
                  remainingTime < 180
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(remainingTime)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg font-mono text-xs text-slate-600">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(timeSpent)}</span>
              </div>
            )}

            {/* Quick Palette Button */}
            <button
              onClick={() => setShowPaletteModal(true)}
              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors border border-indigo-200/60"
              title="Buka Daftar Nomor Soal"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px]">{answeredCount}/{preparedQuestions.length}</span>
            </button>

            {/* Submit Button on Desktop */}
            <button
              onClick={handleFinish}
              className="hidden sm:flex px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs items-center gap-1 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kumpulkan</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MIDDLE QUESTION AREA (Fits mobile screen, scrolls internally if question is long) */}
      <main className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-4 flex flex-col justify-center">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3.5 sm:p-5 flex flex-col justify-between space-y-2.5 sm:space-y-3.5">
            
            {/* Header: Topic & Listening Audio Controls */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <span className="text-[11px] sm:text-xs font-bold text-indigo-700 tracking-wide truncate">
                {currentQuestion.topic}
              </span>

              {/* Audio Controls if listening question */}
              {currentQuestion.isListening && (
                <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 rounded-lg shrink-0">
                  <Headphones className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  <button
                    onClick={handleToggleAudio}
                    className="text-[11px] font-bold text-indigo-700 hover:underline flex items-center gap-1"
                  >
                    {isPlayingAudio ? (
                      <>
                        <VolumeX className="w-3 h-3 text-rose-500" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 text-indigo-600" />
                        <span>Dengarkan</span>
                      </>
                    )}
                  </button>

                  <select
                    value={speechRate}
                    onChange={(e) => setSpeechRate(Number(e.target.value))}
                    className="text-[10px] bg-white border border-indigo-200 rounded px-1 py-0.5 text-indigo-800 font-semibold focus:outline-none"
                  >
                    <option value={0.7}>0.7x</option>
                    <option value={0.8}>0.8x ★</option>
                    <option value={1.0}>1.0x</option>
                  </select>
                </div>
              )}
            </div>

            {/* Stimulus / Reading Passage if any */}
            {currentQuestion.passage && (
              <div className="p-2 sm:p-2.5 bg-slate-50 border-l-2 border-indigo-500 rounded-r-lg text-slate-700 text-xs sm:text-sm font-serif italic max-h-24 sm:max-h-32 overflow-y-auto leading-relaxed">
                "{currentQuestion.passage}"
              </div>
            )}

            {/* Question Text */}
            <div className="text-xs sm:text-base font-bold text-slate-900 leading-snug">
              {currentQuestion.question}
            </div>

            {/* 4 Multiple Choice Options */}
            <div className="space-y-2 sm:space-y-2.5 pt-0.5">
              {activeItem.displayOptions.map((opt, displayIdx) => {
                const isSelected = answers[currentQuestion.id] === opt.originalIndex;
                const letter = String.fromCharCode(65 + displayIdx); // A, B, C, D

                return (
                  <button
                    key={displayIdx}
                    onClick={() => handleSelectOption(opt.originalIndex)}
                    className={`w-full min-h-[44px] py-2 sm:py-2.5 px-3 sm:px-4 text-left rounded-xl border-2 transition-all flex items-center gap-2.5 sm:gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-extrabold text-xs sm:text-sm shrink-0 transition-colors ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                    >
                      {letter}
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-medium leading-tight flex-1 ${
                        isSelected ? 'text-indigo-950 font-bold' : 'text-slate-800'
                      }`}
                    >
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </main>

      {/* 3. BOTTOM BAR (Fixed Navigation, fits nicely on HP) */}
      <footer className="shrink-0 bg-white border-t border-slate-200 z-20 px-3 sm:px-6 py-2 sm:py-2.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          {/* Tombol Sebelumnya */}
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors min-h-[40px] ${
              currentIdx === 0
                ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Sebelumnya</span>
          </button>

          {/* Center: Ragu-ragu & Daftar Soal Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() =>
                setFlaggedQuestions((f) => ({ ...f, [currentQuestion.id]: !f[currentQuestion.id] }))
              }
              className={`py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold border transition-all flex items-center gap-1 min-h-[40px] ${
                flaggedQuestions[currentQuestion.id]
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Flag className="w-3 h-3" />
              <span>{flaggedQuestions[currentQuestion.id] ? 'Ragu' : 'Ragu?'}</span>
            </button>

            <button
              onClick={() => setShowPaletteModal(true)}
              className="py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-all flex items-center gap-1 min-h-[40px]"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
              <span>No. Soal</span>
            </button>
          </div>

          {/* Tombol Selanjutnya / Selesai */}
          {currentIdx < preparedQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((i) => Math.min(preparedQuestions.length - 1, i + 1))}
              className="py-2 px-3.5 sm:px-5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs min-h-[40px]"
            >
              <span>Selanjutnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="py-2 px-3.5 sm:px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs min-h-[40px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kumpulkan</span>
            </button>
          )}
        </div>
      </footer>

      {/* Modal / Drawer Daftar Nomor Soal */}
      {showPaletteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200 max-h-[85dvh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Daftar Nomor Soal</h3>
                <p className="text-[11px] text-slate-500">
                  Terjawab: {answeredCount} dari {preparedQuestions.length} butir soal
                </p>
              </div>
              <button
                onClick={() => setShowPaletteModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 gap-2 overflow-y-auto p-1 max-h-60">
              {preparedQuestions.map((item, idx) => {
                const q = item.question;
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentIdx;
                const isFlagged = flaggedQuestions[q.id];

                let bgClass = 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200';
                if (isCurrent) {
                  bgClass = 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-1 font-extrabold';
                } else if (isFlagged) {
                  bgClass = 'bg-amber-100 text-amber-900 border border-amber-400 font-bold';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold';
                }

                return (
                  <button
                    key={`qnav-${q.id}-${idx}`}
                    onClick={() => {
                      setCurrentIdx(idx);
                      setShowPaletteModal(false);
                    }}
                    className={`h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Terjawab
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Ragu
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Kosong
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Soal Belum Lengkap */}
      {showIncompleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">Soal Belum Lengkap</h3>
              <p className="text-xs text-slate-500">
                Anda baru menjawab <strong className="text-slate-800">{Object.keys(answers).length}</strong> dari{' '}
                <strong className="text-slate-800">{preparedQuestions.length}</strong> butir soal. Yakin ingin mengumpulkan sekarang?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowIncompleteConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Lanjutkan Kuis
              </button>
              <button
                onClick={() => {
                  setShowIncompleteConfirm(false);
                  executeSubmit();
                }}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Tetap Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
