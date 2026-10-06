import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  Clock,
  CheckCircle2,
  Star,
  Award,
  Settings,
  Layers,
  Volume1,
  X,
  Printer,
  Flame,
  ChevronRight,
  BookOpen,
  Image as ImageIcon,
  Sparkle,
  Zap,
  HelpCircle,
  Check,
  Delete,
  ArrowRight,
} from 'lucide-react';
import {
  SmpGradeLevel,
  StudentProfile,
  KopSuratConfig,
  PictureMatchCategory,
  PictureMatchRecord,
  PictureCardItem,
} from '../types';
import {
  PICTURE_MATCH_CATEGORIES,
  PICTURE_MATCH_ITEMS,
  MatchCard,
  generatePictureMatchDeck,
} from '../data/pictureMatchData';
import { soundManager } from '../utils/audio';

export type PictureGameType = 'memory' | 'connect' | 'spelling';

interface PictureMatchGameScreenProps {
  studentProfile: StudentProfile | null;
  kopSurat: KopSuratConfig;
  onBackToHome: () => void;
  onOpenTeacherPin?: () => void;
  initialGrade?: SmpGradeLevel;
  onSaveRecord?: (record: PictureMatchRecord) => void;
  customCards?: PictureCardItem[];
}

export const PictureMatchGameScreen: React.FC<PictureMatchGameScreenProps> = ({
  studentProfile,
  kopSurat,
  onBackToHome,
  initialGrade = '7',
  onSaveRecord,
  customCards,
}) => {
  // Active game mode: 'memory' (Kartu Balik), 'connect' (Menjodohkan Garis), 'spelling' (Tebak Ejaan)
  const [activeGameType, setActiveGameType] = useState<PictureGameType>('connect');

  // Game Options & Filters
  const [selectedGrade, setSelectedGrade] = useState<SmpGradeLevel>(initialGrade);
  const [selectedCategory, setSelectedCategory] = useState<PictureMatchCategory>('all');
  const [pairsCount, setPairsCount] = useState<number>(6); // 6 or 8
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  // Pool of cards (either custom or default)
  const cardPool = useMemo(() => {
    return customCards && customCards.length > 0 ? customCards : PICTURE_MATCH_ITEMS;
  }, [customCards]);

  // Filtered pool based on category & grade
  const filteredPool = useMemo(() => {
    let pool = cardPool;
    if (selectedCategory !== 'all') {
      pool = pool.filter((c) => c.category === selectedCategory);
    }
    if (selectedGrade !== 'all') {
      const gPool = pool.filter((c) => c.grade === selectedGrade);
      if (gPool.length >= 4) pool = gPool;
    }
    return pool.length > 0 ? pool : cardPool;
  }, [cardPool, selectedCategory, selectedGrade]);

  // Selected items for the current session
  const [sessionItems, setSessionItems] = useState<PictureCardItem[]>(() => {
    return [...filteredPool].sort(() => 0.5 - Math.random()).slice(0, 6);
  });

  // Global Session Score & Timer
  const [score, setScore] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [comboStreak, setComboStreak] = useState<number>(0);

  // Active Toast on Match
  const [matchedToast, setMatchedToast] = useState<{
    word: string;
    translation: string;
    emoji?: string;
    sentence: string;
  } | null>(null);

  // ==========================================
  // STATE MODE 1: MEMORY CARD FLIP
  // ==========================================
  const [memoryDeck, setMemoryDeck] = useState<MatchCard[]>(() =>
    generatePictureMatchDeck('all', initialGrade, 6, 'image_to_word', cardPool)
  );
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [isMemoryEvaluating, setIsMemoryEvaluating] = useState<boolean>(false);
  const [memoryMatchedCount, setMemoryMatchedCount] = useState<number>(0);

  // ==========================================
  // STATE MODE 2: CONNECT / TAP-TO-PAIR
  // ==========================================
  const [selectedLeftCardId, setSelectedLeftCardId] = useState<string | null>(null);
  const [selectedRightCardId, setSelectedRightCardId] = useState<string | null>(null);
  const [connectMatchedIds, setConnectMatchedIds] = useState<Set<string>>(new Set());
  const [shuffledRightItems, setShuffledRightItems] = useState<PictureCardItem[]>([]);

  // ==========================================
  // STATE MODE 3: SPELLING QUEST
  // ==========================================
  const [spellingIndex, setSpellingIndex] = useState<number>(0);
  const [currentTypedLetters, setCurrentTypedLetters] = useState<string[]>([]);
  const [scrambledLetterOptions, setScrambledLetterOptions] = useState<{ id: string; letter: string; used: boolean }[]>([]);
  const [spellingFeedback, setSpellingFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Timer Effect
  useEffect(() => {
    if (isGameWon) return;
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameWon]);

  // Clean speech when unmounting
  useEffect(() => {
    return () => {
      soundManager.stopSpeech();
    };
  }, []);

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper to init Spelling Question
  const setupSpellingQuestion = useCallback((targetItem: PictureCardItem) => {
    const cleanWord = targetItem.word.toUpperCase().replace(/[^A-Z]/g, '');
    const letters = cleanWord.split('');

    // Add 2 extra random distractor letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const distractors = [
      alphabet[Math.floor(Math.random() * alphabet.length)],
      alphabet[Math.floor(Math.random() * alphabet.length)],
    ];

    const allLetters = [...letters, ...distractors].sort(() => 0.5 - Math.random());
    const letterOptions = allLetters.map((l, idx) => ({
      id: `let-${idx}-${l}`,
      letter: l,
      used: false,
    }));

    setCurrentTypedLetters([]);
    setScrambledLetterOptions(letterOptions);
    setSpellingFeedback(null);
  }, []);

  // START / RESTART GAME
  const startNewGame = useCallback(
    (
      mode: PictureGameType = activeGameType,
      cat: PictureMatchCategory = selectedCategory,
      grd: SmpGradeLevel = selectedGrade,
      prs: number = pairsCount
    ) => {
      // Pick random items
      let pool = cardPool;
      if (cat !== 'all') {
        pool = pool.filter((c) => c.category === cat);
      }
      if (grd !== 'all') {
        const gPool = pool.filter((c) => c.grade === grd);
        if (gPool.length >= 4) pool = gPool;
      }
      if (pool.length === 0) pool = cardPool;

      const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, prs);
      setSessionItems(shuffled);

      // Reset shared state
      setScore(0);
      setTimeSpent(0);
      setIsGameWon(false);
      setMovesCount(0);
      setMistakesCount(0);
      setComboStreak(0);
      setMatchedToast(null);
      setShowConfigModal(false);

      if (mode === 'memory') {
        const deck = generatePictureMatchDeck(cat, grd, prs, 'image_to_word', cardPool);
        setMemoryDeck(deck);
        setFlippedUids([]);
        setIsMemoryEvaluating(false);
        setMemoryMatchedCount(0);
      } else if (mode === 'connect') {
        setConnectMatchedIds(new Set());
        setSelectedLeftCardId(null);
        setSelectedRightCardId(null);
        setShuffledRightItems([...shuffled].sort(() => 0.5 - Math.random()));
      } else if (mode === 'spelling') {
        setSpellingIndex(0);
        if (shuffled.length > 0) {
          setupSpellingQuestion(shuffled[0]);
        }
      }

      if (!isSoundMuted) soundManager.playSuccessSound();
    },
    [activeGameType, cardPool, isSoundMuted, pairsCount, selectedCategory, selectedGrade, setupSpellingQuestion]
  );

  // Setup Connect right items whenever sessionItems changes
  useEffect(() => {
    setShuffledRightItems([...sessionItems].sort(() => 0.5 - Math.random()));
  }, [sessionItems]);

  // VICTORY HANDLER
  const triggerVictory = useCallback(
    (extraPoints: number = 0) => {
      setIsGameWon(true);

      const speedBonus = Math.max(0, 300 - timeSpent * 3);
      const accuracyBonus = Math.max(0, 200 - mistakesCount * 15);
      const totalScore = score + extraPoints + 500 + speedBonus + accuracyBonus;
      setScore(totalScore);

      if (!isSoundMuted) soundManager.playSuccessSound();

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } });
          confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } });
        }, 300);
      } catch {
        // ignore
      }

      // Save record
      if (onSaveRecord && studentProfile) {
        const stars = timeSpent < 50 && mistakesCount <= 2 ? 3 : timeSpent < 90 && mistakesCount <= 5 ? 2 : 1;
        const rec: PictureMatchRecord = {
          id: `pm-${Date.now()}`,
          studentName: studentProfile.name,
          className: studentProfile.className,
          gradePlayed: selectedGrade,
          category: selectedCategory,
          difficulty: pairsCount <= 6 ? 'easy' : 'medium',
          pairsCount,
          timeSpentSeconds: timeSpent,
          mistakesCount,
          starsCount: stars,
          score: totalScore,
          completedAt: new Date().toLocaleString('id-ID'),
        };
        onSaveRecord(rec);
      }
    },
    [isSoundMuted, mistakesCount, onSaveRecord, pairsCount, score, selectedCategory, selectedGrade, studentProfile, timeSpent]
  );

  // ==========================================
  // HANDLERS FOR MODE 1: MEMORY CARD FLIP
  // ==========================================
  const handleMemoryCardClick = (card: MatchCard) => {
    if (isMemoryEvaluating || card.isMatched || card.isFlipped || flippedUids.includes(card.uid) || isGameWon) {
      return;
    }

    if (!isSoundMuted) soundManager.playCardFlipSound();

    const updated = [...flippedUids, card.uid];
    setFlippedUids(updated);
    setMemoryDeck((prev) => prev.map((c) => (c.uid === card.uid ? { ...c, isFlipped: true } : c)));

    if (updated.length === 2) {
      setIsMemoryEvaluating(true);
      setMovesCount((prev) => prev + 1);

      const firstCard = memoryDeck.find((c) => c.uid === updated[0]);
      const secondCard = card;

      if (firstCard && secondCard && firstCard.itemId === secondCard.itemId) {
        setTimeout(() => {
          if (!isSoundMuted) soundManager.playCardMatchSound();

          const itemData = cardPool.find((it) => it.id === firstCard.itemId);
          if (itemData) {
            soundManager.speakEnglishText(itemData.word, 0.9);
            setMatchedToast({
              word: itemData.word,
              translation: itemData.translation,
              emoji: itemData.emoji,
              sentence: itemData.exampleSentence,
            });
            setTimeout(() => setMatchedToast(null), 3200);
          }

          const newStreak = comboStreak + 1;
          setComboStreak(newStreak);
          const pts = Math.round(100 * (newStreak >= 2 ? 1.5 : 1));
          setScore((s) => s + pts);

          setMemoryDeck((prev) =>
            prev.map((c) => (c.itemId === firstCard.itemId ? { ...c, isFlipped: true, isMatched: true } : c))
          );
          setFlippedUids([]);
          setIsMemoryEvaluating(false);

          const nextCount = memoryMatchedCount + 1;
          setMemoryMatchedCount(nextCount);
          if (nextCount === pairsCount) {
            triggerVictory(pts);
          }
        }, 350);
      } else {
        setMistakesCount((m) => m + 1);
        setComboStreak(0);

        setTimeout(() => {
          if (!isSoundMuted) soundManager.playErrorSound();
          setMemoryDeck((prev) =>
            prev.map((c) => (c.uid === updated[0] || c.uid === updated[1] ? { ...c, isFlipped: false } : c))
          );
          setFlippedUids([]);
          setIsMemoryEvaluating(false);
        }, 1100);
      }
    }
  };

  // ==========================================
  // HANDLERS FOR MODE 2: CONNECT / TAP-TO-PAIR
  // ==========================================
  const handleConnectSelectLeft = (itemId: string) => {
    if (connectMatchedIds.has(itemId) || isGameWon) return;
    if (!isSoundMuted) soundManager.playKeyClick();
    setSelectedLeftCardId(itemId);

    // If right was already chosen, check match
    if (selectedRightCardId) {
      evaluateConnectPair(itemId, selectedRightCardId);
    }
  };

  const handleConnectSelectRight = (itemId: string) => {
    if (connectMatchedIds.has(itemId) || isGameWon) return;
    if (!isSoundMuted) soundManager.playKeyClick();
    setSelectedRightCardId(itemId);

    // If left was already chosen, check match
    if (selectedLeftCardId) {
      evaluateConnectPair(selectedLeftCardId, itemId);
    }
  };

  const evaluateConnectPair = (leftId: string, rightId: string) => {
    setMovesCount((m) => m + 1);

    if (leftId === rightId) {
      // MATCH SUCCESS!
      if (!isSoundMuted) soundManager.playCardMatchSound();

      const itemData = cardPool.find((it) => it.id === leftId);
      if (itemData) {
        soundManager.speakEnglishText(itemData.word, 0.9);
        setMatchedToast({
          word: itemData.word,
          translation: itemData.translation,
          emoji: itemData.emoji,
          sentence: itemData.exampleSentence,
        });
        setTimeout(() => setMatchedToast(null), 3200);
      }

      const nextMatched = new Set(connectMatchedIds);
      nextMatched.add(leftId);
      setConnectMatchedIds(nextMatched);

      const newStreak = comboStreak + 1;
      setComboStreak(newStreak);
      const pts = Math.round(120 * (newStreak >= 2 ? 1.5 : 1));
      setScore((s) => s + pts);

      setSelectedLeftCardId(null);
      setSelectedRightCardId(null);

      if (nextMatched.size === sessionItems.length) {
        triggerVictory(pts);
      }
    } else {
      // WRONG PAIR
      setMistakesCount((m) => m + 1);
      setComboStreak(0);
      if (!isSoundMuted) soundManager.playErrorSound();

      setTimeout(() => {
        setSelectedLeftCardId(null);
        setSelectedRightCardId(null);
      }, 500);
    }
  };

  // ==========================================
  // HANDLERS FOR MODE 3: SPELLING QUEST
  // ==========================================
  const currentSpellingItem = sessionItems[spellingIndex] || sessionItems[0];

  const handleSelectLetter = (option: { id: string; letter: string; used: boolean }) => {
    if (option.used || spellingFeedback === 'correct' || isGameWon) return;
    if (!isSoundMuted) soundManager.playKeyClick();

    // Mark option as used
    setScrambledLetterOptions((prev) =>
      prev.map((o) => (o.id === option.id ? { ...o, used: true } : o))
    );

    const updatedTyped = [...currentTypedLetters, option.letter];
    setCurrentTypedLetters(updatedTyped);

    const targetWord = currentSpellingItem.word.toUpperCase().replace(/[^A-Z]/g, '');

    // If typed letters reach target word length, evaluate spelling!
    if (updatedTyped.length === targetWord.length) {
      setMovesCount((m) => m + 1);
      const assembledWord = updatedTyped.join('');

      if (assembledWord === targetWord) {
        // SPELLING CORRECT! 🎉
        setSpellingFeedback('correct');
        if (!isSoundMuted) soundManager.playSuccessSound();
        soundManager.speakEnglishText(currentSpellingItem.word, 0.9);

        setMatchedToast({
          word: currentSpellingItem.word,
          translation: currentSpellingItem.translation,
          emoji: currentSpellingItem.emoji,
          sentence: currentSpellingItem.exampleSentence,
        });

        const newStreak = comboStreak + 1;
        setComboStreak(newStreak);
        const pts = Math.round(150 * (newStreak >= 2 ? 1.5 : 1));
        setScore((s) => s + pts);

        // Move to next word after delay
        setTimeout(() => {
          setMatchedToast(null);
          const nextIdx = spellingIndex + 1;
          if (nextIdx < sessionItems.length) {
            setSpellingIndex(nextIdx);
            setupSpellingQuestion(sessionItems[nextIdx]);
          } else {
            triggerVictory(pts);
          }
        }, 1800);
      } else {
        // SPELLING INCORRECT ❌
        setSpellingFeedback('wrong');
        setMistakesCount((m) => m + 1);
        setComboStreak(0);
        if (!isSoundMuted) soundManager.playErrorSound();

        setTimeout(() => {
          // Reset typed letters & unlock options
          setCurrentTypedLetters([]);
          setScrambledLetterOptions((prev) => prev.map((o) => ({ ...o, used: false })));
          setSpellingFeedback(null);
        }, 1000);
      }
    }
  };

  // Backspace letter
  const handleBackspaceLetter = () => {
    if (currentTypedLetters.length === 0 || spellingFeedback === 'correct') return;
    if (!isSoundMuted) soundManager.playKeyClick();

    const lastLetter = currentTypedLetters[currentTypedLetters.length - 1];
    setCurrentTypedLetters((prev) => prev.slice(0, prev.length - 1));

    // Re-enable the first matching used letter option
    let unclicked = false;
    setScrambledLetterOptions((prev) =>
      prev.map((opt) => {
        if (!unclicked && opt.letter === lastLetter && opt.used) {
          unclicked = true;
          return { ...opt, used: false };
        }
        return opt;
      })
    );
  };

  // Clear all typed letters
  const handleClearAllLetters = () => {
    if (currentTypedLetters.length === 0 || spellingFeedback === 'correct') return;
    setCurrentTypedLetters([]);
    setScrambledLetterOptions((prev) => prev.map((o) => ({ ...o, used: false })));
  };

  // Print A4 Certificate
  const handlePrintCertificate = () => {
    const studentName = studentProfile?.name || 'Siswa Hebat SMP';
    const className = studentProfile?.className || '7A';
    const stars = timeSpent < 50 && mistakesCount <= 2 ? 3 : timeSpent < 90 && mistakesCount <= 5 ? 2 : 1;
    const modeName =
      activeGameType === 'connect'
        ? 'Menjodohkan Garis Gambar & Kata'
        : activeGameType === 'spelling'
        ? 'Tebak Gambar & Ejaan Kata'
        : 'Memori Kartu Balik';

    const printableHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Sertifikat Juara Tebak Gambar - ${studentName}</title>
      <style>
        @page { size: A4 landscape; margin: 12mm; }
        body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; background: #fff; color: #1e293b; }
        .cert-border { border: 8px double #e11d48; padding: 25px; text-align: center; position: relative; background: #fffdfd; }
        .header-title { font-size: 24pt; font-weight: bold; color: #881337; letter-spacing: 2px; text-transform: uppercase; margin: 5px 0; }
        .subtitle { font-size: 13pt; font-style: italic; color: #475569; margin-bottom: 20px; }
        .name { font-size: 26pt; font-weight: bold; color: #1e1b4b; text-decoration: underline; margin: 15px 0 5px 0; }
        .desc { font-size: 12pt; line-height: 1.6; margin: 15px auto; max-width: 700px; }
        .stats-badge { display: inline-block; margin: 15px auto; padding: 10px 20px; border: 2px solid #fda4af; border-radius: 12px; background: #fff1f2; font-weight: bold; font-size: 11pt; color: #9f1239; }
        .footer { margin-top: 35px; display: flex; justify-content: space-between; padding: 0 40px; }
        .sign-block { text-align: center; font-size: 11pt; }
      </style>
    </head>
    <body>
      <div class="cert-border">
        <p style="font-size: 11pt; font-weight: bold; margin: 0; letter-spacing: 1px; color: #be123c;">
          ${kopSurat.namaSekolah.toUpperCase()} • TAHUN AJARAN ${kopSurat.tahunPelajaran}
        </p>
        <h1 class="header-title">SERTIFIKAT JUARA TEBAK GAMBAR</h1>
        <p class="subtitle">English Picture Quest • Mode: ${modeName}</p>
        <p style="font-size: 11pt; margin: 0;">Diberikan dengan penuh apresiasi kepada:</p>
        <div class="name">${studentName}</div>
        <p style="font-size: 11pt; font-weight: bold; color: #be123c; margin: 0;">Kelas: ${className} • Tingkat Materi: Kelas ${selectedGrade} SMP</p>
        <p class="desc">
          Telah berhasil menyelesaikan tantangan <strong>Permainan Tebak & Pencocokan Kosakata Gambar Bahasa Inggris</strong> pada mode <strong>${modeName}</strong> dengan waktu <strong>${formatTime(timeSpent)}</strong> dan perolehan skor akhir <strong>${score} Poin XP</strong>.
        </p>
        <div class="stats-badge">
          ★ Rating: ${'★'.repeat(stars)} (${stars} Bintang) | ⏱️ Waktu: ${formatTime(timeSpent)} | 🏆 Total Skor: ${score} XP | 🎯 Langkah: ${movesCount} ★
        </div>
        <div class="footer">
          <div class="sign-block">
            <p>Mengetahui,<br><strong>${kopSurat.jabatanPimpinan}</strong></p>
            <br/><br/>
            <p><strong>${kopSurat.namaPimpinan}</strong><br/>NIP. ${kopSurat.nipPimpinan}</p>
          </div>
          <div class="sign-block">
            <p>${kopSurat.kotaPenerbit}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/><strong>${kopSurat.jabatanGuru}</strong></p>
            <br/><br/>
            <p><strong>${kopSurat.namaGuru}</strong><br/>NIP. ${kopSurat.nipGuru}</p>
          </div>
        </div>
      </div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(printableHtml);
      printWin.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* 1. Header Navbar */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-3 sm:px-4 py-2.5 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2.5">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToHome}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Menu Kuis</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md text-base">
                🖼️
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-black text-white leading-tight flex items-center gap-1.5">
                  <span>Tebak & Cocokkan Gambar</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded font-bold">
                    Picture Quest SMP
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400">
                  Kelas <strong>{selectedGrade} SMP</strong> •{' '}
                  <span className="text-rose-300 font-semibold">
                    {PICTURE_MATCH_CATEGORIES.find((c) => c.id === selectedCategory)?.name.split(' ')[0]}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick HUD Stats */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-extrabold font-mono">
            {comboStreak >= 2 && (
              <div className="px-2 py-1 bg-amber-500/20 border border-amber-400/60 rounded-xl flex items-center gap-1 text-amber-300 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{comboStreak}x</span>
              </div>
            )}

            {/* Score */}
            <div className="px-2.5 py-1 bg-indigo-950/80 border border-indigo-500/50 rounded-xl flex items-center gap-1.5 text-indigo-300">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{score}</span>
            </div>

            {/* Timer */}
            <div className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-1 text-slate-300 hidden min-[480px]:flex">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{formatTime(timeSpent)}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 cursor-pointer"
              title={isSoundMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Settings button */}
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-1.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-white shadow-xs cursor-pointer"
              title="Atur Kategori & Mode"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Top Mode Navigation Pills */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-3 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'connect', label: '1. Menjodohkan Garis', icon: '🔗', desc: 'Hubungkan gambar ke kata' },
              { id: 'spelling', label: '2. Tebak & Eja Kata', icon: '✍️', desc: 'Susun huruf bahasa Inggris' },
              { id: 'memory', label: '3. Memori Kartu Balik', icon: '🎴', desc: 'Buka kartu berpasangan' },
            ].map((mode) => {
              const isActive = activeGameType === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    setActiveGameType(mode.id as PictureGameType);
                    startNewGame(mode.id as PictureGameType, selectedCategory, selectedGrade, pairsCount);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md ring-2 ring-rose-500/40'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{mode.icon}</span>
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => startNewGame()}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
            title="Kocok Ulang"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Acak Ulang</span>
          </button>
        </div>
      </div>

      {/* 3. Main Arena */}
      <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-4 max-w-4xl mx-auto w-full relative">
        {/* Toast Match Celebration & English Sentence Callout */}
        {matchedToast && (
          <div className="absolute top-2 z-30 bg-slate-900/95 border-2 border-emerald-400 text-white px-4 py-2.5 rounded-3xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 max-w-[94vw]">
            <span className="text-3xl animate-bounce">{matchedToast.emoji || '🎉'}</span>
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-amber-300">{matchedToast.word}</span>
                <span className="text-slate-400">({matchedToast.translation})</span>
                <button
                  type="button"
                  onClick={() => soundManager.speakEnglishText(matchedToast.word, 0.9)}
                  className="p-1 rounded-lg bg-indigo-800 text-cyan-300 hover:text-white"
                  title="Dengarkan Suara"
                >
                  <Volume1 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-300 italic pt-0.5 line-clamp-2">
                "{matchedToast.sentence}"
              </p>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* GAME ARENA: MODE 2 - CONNECT / TAP-TO-PAIR (DEFAULT) */}
        {/* ==================================================== */}
        {activeGameType === 'connect' && (
          <div className="w-full flex-1 flex flex-col justify-center my-auto space-y-4">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center justify-center gap-1">
                <span>🔗 MODE MENJODOHKAN GAMBAR KE KATA</span>
              </span>
              <p className="text-xs text-slate-400">
                Ketuk 1 kartu gambar di sebelah kiri, lalu ketuk kosakata Bahasa Inggris yang sesuai di sebelah kanan!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-2xl mx-auto w-full">
              {/* Left Column: Pictures */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-black uppercase text-indigo-400 flex items-center justify-between pb-1 border-b border-slate-800">
                  <span>Kolom Gambar</span>
                  <span>{connectMatchedIds.size}/{sessionItems.length}</span>
                </div>

                {sessionItems.map((item) => {
                  const isMatched = connectMatchedIds.has(item.id);
                  const isSelected = selectedLeftCardId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleConnectSelectLeft(item.id)}
                      className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer select-none ${
                        isMatched
                          ? 'bg-emerald-950/70 border-emerald-500/60 opacity-60 pointer-events-none'
                          : isSelected
                          ? 'bg-rose-950/80 border-rose-400 ring-2 ring-rose-400 shadow-lg scale-[1.02]'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:scale-[1.01]'
                      }`}
                    >
                      <span className="text-3xl sm:text-4xl shrink-0 filter drop-shadow-sm">
                        {item.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-bold text-slate-200 block truncate">
                          {item.translation}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {isMatched ? '✓ Terpasang' : 'Pilih Gambar'}
                        </span>
                      </div>
                      {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Right Column: English Words (Shuffled) */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-black uppercase text-rose-400 flex items-center justify-between pb-1 border-b border-slate-800">
                  <span>Kosakata Inggris</span>
                  <span>Acak</span>
                </div>

                {shuffledRightItems.map((item) => {
                  const isMatched = connectMatchedIds.has(item.id);
                  const isSelected = selectedRightCardId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleConnectSelectRight(item.id)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 cursor-pointer select-none ${
                        isMatched
                          ? 'bg-emerald-950/70 border-emerald-500/60 opacity-60 pointer-events-none'
                          : isSelected
                          ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-400 shadow-lg scale-[1.02]'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-black text-amber-300 block truncate">
                          {item.word}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {isMatched ? '✓ Cocok' : 'Pilih Kata'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.speakEnglishText(item.word, 0.9);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Dengarkan Pengucapan"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* GAME ARENA: MODE 3 - SPELLING QUEST (SUSUN EJAAN)     */}
        {/* ==================================================== */}
        {activeGameType === 'spelling' && currentSpellingItem && (
          <div className="w-full flex-1 flex flex-col items-center justify-center my-auto max-w-xl mx-auto space-y-5">
            <div className="text-center space-y-0.5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                ✍️ TANTANGAN SUSUN EJAAN ({spellingIndex + 1} / {sessionItems.length})
              </span>
              <p className="text-xs text-slate-400">
                Lihat gambar, lalu ketuk huruf-huruf di bawah untuk menyusun kata Bahasa Inggris yang tepat!
              </p>
            </div>

            {/* Target Picture Card */}
            <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 text-center shadow-xl space-y-2 w-full max-w-sm">
              <span className="text-6xl sm:text-7xl block filter drop-shadow-md animate-bounce">
                {currentSpellingItem.emoji}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                {currentSpellingItem.translation}
              </h3>
              <p className="text-xs text-indigo-300 font-semibold italic">
                "{currentSpellingItem.exampleSentence}"
              </p>
            </div>

            {/* Letter Slots */}
            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                {currentSpellingItem.word
                  .toUpperCase()
                  .replace(/[^A-Z]/g, '')
                  .split('')
                  .map((_, idx) => {
                    const letter = currentTypedLetters[idx] || '';
                    return (
                      <div
                        key={idx}
                        className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center font-black text-lg sm:text-xl font-mono shadow-md transition-all ${
                          spellingFeedback === 'correct'
                            ? 'bg-emerald-950 border-emerald-400 text-emerald-300 scale-105'
                            : spellingFeedback === 'wrong'
                            ? 'bg-rose-950 border-rose-400 text-rose-300 animate-shake'
                            : letter
                            ? 'bg-indigo-900 border-indigo-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-500'
                        }`}
                      >
                        {letter || '_'}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Scrambled Letter Options */}
            <div className="space-y-2 text-center w-full">
              <div className="flex items-center justify-center gap-2 flex-wrap max-w-md mx-auto">
                {scrambledLetterOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={opt.used || spellingFeedback === 'correct'}
                    onClick={() => handleSelectLetter(opt)}
                    className={`w-10 h-11 sm:w-11 sm:h-12 rounded-xl font-black text-sm sm:text-base border shadow-sm transition-all cursor-pointer ${
                      opt.used
                        ? 'opacity-20 border-slate-800 bg-slate-900 text-slate-600 pointer-events-none'
                        : 'bg-gradient-to-tr from-slate-800 to-indigo-950 border-slate-600 text-slate-100 hover:border-amber-400 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {opt.letter}
                  </button>
                ))}
              </div>

              {/* Utility buttons: Backspace & Clear */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleBackspaceLetter}
                  disabled={currentTypedLetters.length === 0}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Delete className="w-3.5 h-3.5" />
                  <span>Hapus 1 Huruf</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearAllLetters}
                  disabled={currentTypedLetters.length === 0}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 disabled:opacity-30 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Reset Huruf
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* GAME ARENA: MODE 1 - MEMORY CARD FLIP               */}
        {/* ==================================================== */}
        {activeGameType === 'memory' && (
          <div className="w-full flex-1 flex flex-col items-center justify-center my-auto py-2">
            <div className="text-center space-y-0.5 pb-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                🎴 MODE MEMORI KARTU BALIK
              </span>
              <p className="text-xs text-slate-400">
                Buka 2 kartu untuk mencocokkan gambar dan teks Bahasa Inggris yang tepat!
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 w-full max-w-xl mx-auto">
              {memoryDeck.map((card) => {
                const isRevealed = card.isFlipped || card.isMatched;

                return (
                  <div
                    key={card.uid}
                    onClick={() => handleMemoryCardClick(card)}
                    className={`group relative aspect-[4/5] sm:aspect-square w-full rounded-2xl cursor-pointer select-none transition-all duration-300 transform-gpu active:scale-95 ${
                      card.isMatched ? 'opacity-85 pointer-events-none' : 'hover:scale-[1.02]'
                    }`}
                    style={{ perspective: '1000px' }}
                  >
                    <div
                      className={`relative w-full h-full rounded-2xl transition-transform duration-500 transform-style-3d shadow-xl ${
                        isRevealed ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* FRONT (Face down) */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl backface-hidden bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 p-2 flex flex-col items-center justify-between shadow-lg overflow-hidden group-hover:border-indigo-400 transition-colors">
                        <div className="w-full flex justify-between text-[10px] text-indigo-400 font-bold opacity-60">
                          <span>SMP</span>
                          <span>★</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-900/60 border border-indigo-400/30 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                          ❓
                        </div>
                        <span className="text-[9px] font-black text-indigo-300/80 uppercase tracking-widest">
                          TEBAK
                        </span>
                      </div>

                      {/* BACK (Face up) */}
                      <div
                        className={`absolute inset-0 w-full h-full rounded-2xl backface-hidden rotate-y-180 p-2 flex flex-col items-center justify-between border-2 transition-all shadow-2xl ${
                          card.isMatched
                            ? 'bg-emerald-950/90 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                            : 'bg-slate-900/95 border-amber-400 text-white shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between text-[9px] font-black uppercase text-slate-400">
                          <span>{card.subText}</span>
                          {card.isMatched ? <span className="text-emerald-400">✓ Cocok</span> : <span>?</span>}
                        </div>

                        {card.type === 'image' ? (
                          <div className="flex flex-col items-center justify-center text-center my-auto space-y-1">
                            <span className="text-3xl filter drop-shadow-md">{card.displayEmoji}</span>
                            <span className="text-xs font-black text-white leading-tight block truncate max-w-[90px]">
                              {card.displayText}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center my-auto space-y-1 px-1">
                            <span className="text-xs sm:text-sm font-black text-amber-300 leading-tight block">
                              {card.displayText}
                            </span>
                            <span className="text-[10px] text-slate-400">(English)</span>
                          </div>
                        )}

                        <div className="w-full flex items-center justify-center text-[9px] text-slate-400">
                          {card.type === 'word' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                soundManager.speakEnglishText(card.displayText, 0.9);
                              }}
                              className="p-1 rounded-md bg-indigo-900/80 hover:bg-indigo-800 text-cyan-300"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Bottom Information Bar */}
        <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 p-2.5 sm:p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">
              Langkah: <strong>{movesCount}</strong> • Salah: <strong>{mistakesCount}</strong>
            </span>
            {comboStreak >= 2 && (
              <span className="text-amber-400 font-extrabold text-[11px] animate-pulse">
                ★ {comboStreak}x Kombo Berturut-turut!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] rounded-xl border border-slate-700 cursor-pointer"
            >
              Atur Kategori & Soal
            </button>
          </div>
        </div>
      </main>

      {/* MODAL 1: VICTORY CELEBRATION & SCORE */}
      {isGameWon && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-4xl shadow-xl ring-6 ring-rose-500/30 animate-bounce">
                🏆
              </div>
              <span className="absolute -bottom-1 -right-1 text-2xl">✨</span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">TEBAK GAMBAR SELESAI!</h2>
              <p className="text-xs text-rose-300 font-bold mt-1">
                Hebat! Seluruh pasangan gambar & kosakata berhasil dituntaskan dengan cemerlang!
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 py-1">
              <Star className="w-8 h-8 text-amber-400 fill-amber-400 animate-spin" />
              <Star
                className={`w-9 h-9 ${
                  timeSpent < 80 && mistakesCount <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                }`}
              />
              <Star
                className={`w-8 h-8 ${
                  timeSpent < 45 && mistakesCount <= 2 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                }`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-bold">WAKTU</p>
                <p className="text-sm font-extrabold text-amber-300 font-mono">{formatTime(timeSpent)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold">LANGKAH</p>
                <p className="text-sm font-extrabold text-emerald-400 font-mono">
                  {movesCount} ({mistakesCount} salah)
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold">TOTAL SKOR</p>
                <p className="text-sm font-extrabold text-indigo-300 font-mono">{score} XP</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Sertifikat Juara Tebak Gambar (A4)</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startNewGame()}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Main Lagi</span>
                </button>

                <button
                  type="button"
                  onClick={onBackToHome}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Menu Kuis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIGURATION & SETTINGS */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold text-sm">
                  ⚙️
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Pengaturan Permainan Tebak Gambar</h3>
                  <p className="text-[11px] text-slate-400">Pilih mode, kategori tema, dan tingkatan kelas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">1. Mode Permainan:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'connect', label: 'Menjodohkan', icon: '🔗' },
                  { id: 'spelling', label: 'Eja Kata', icon: '✍️' },
                  { id: 'memory', label: 'Kartu Balik', icon: '🎴' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveGameType(m.id as PictureGameType)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      activeGameType === m.id
                        ? 'border-rose-500 bg-rose-950/70 text-white font-bold'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400'
                    }`}
                  >
                    <span className="text-lg block">{m.icon}</span>
                    <span className="text-xs block">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">2. Kategori Tema Kosakata:</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {PICTURE_MATCH_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'border-rose-500 bg-rose-950/80 text-white font-bold'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span className="truncate">{cat.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grade selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">3. Tingkat Kelas SMP:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'all', label: 'Semua (7–9)' },
                  { id: '7', label: 'Kelas 7' },
                  { id: '8', label: 'Kelas 8' },
                  { id: '9', label: 'Kelas 9' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGrade(g.id as SmpGradeLevel)}
                    className={`py-1.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      selectedGrade === g.id
                        ? 'border-rose-500 bg-rose-950/70 text-white'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => startNewGame(activeGameType, selectedCategory, selectedGrade, pairsCount)}
                className="flex-1 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Terapkan & Main
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
