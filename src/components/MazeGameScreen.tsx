import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Trophy,
  Clock,
  Key,
  Gem,
  RotateCcw,
  Sparkles,
  Award,
  ArrowLeft,
  Volume2,
  VolumeX,
  Printer,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Star,
  Settings,
  Lock,
  Flame,
  Zap,
  Eye,
  Layers,
  Volume1,
  X,
  Info,
  Compass,
} from 'lucide-react';
import {
  SmpGradeLevel,
  MazeConfig,
  MazeQuestion,
  StudentProfile,
  KopSuratConfig,
  MazeCompletionRecord,
  MazeAvatar,
  MazeTheme,
} from '../types';
import { generateMazeGrid, DEFAULT_MAZE_CONFIG, MAZE_AVATARS } from '../data/mazeData';
import { soundManager } from '../utils/audio';

interface MazeGameScreenProps {
  studentProfile: StudentProfile | null;
  kopSurat: KopSuratConfig;
  onBackToHome: () => void;
  onOpenTeacherPin: () => void;
  initialGrade?: SmpGradeLevel;
  onSaveCompletion?: (record: MazeCompletionRecord) => void;
}

export const MazeGameScreen: React.FC<MazeGameScreenProps> = ({
  studentProfile,
  kopSurat,
  onBackToHome,
  onOpenTeacherPin,
  initialGrade = '7',
  onSaveCompletion,
}) => {
  // Config state
  const [selectedGrade, setSelectedGrade] = useState<SmpGradeLevel>(initialGrade);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Gamification state: Avatar & Theme
  const [selectedAvatar, setSelectedAvatar] = useState<MazeAvatar>(() => {
    try {
      const saved = localStorage.getItem('eduquiz_maze_avatar');
      if (saved) {
        const found = MAZE_AVATARS.find((a) => a.id === saved);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return MAZE_AVATARS[0];
  });

  const [activeTheme, setActiveTheme] = useState<MazeTheme>('castle');
  const [isTorchMode, setIsTorchMode] = useState<boolean>(false);

  // Maze Board State
  const [maze, setMaze] = useState(() =>
    generateMazeGrid(
      difficulty === 'easy' ? 11 : difficulty === 'medium' ? 15 : 19,
      selectedGrade,
      difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5
    )
  );

  // Player Position & Movement
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [playerDirection, setPlayerDirection] = useState<'up' | 'down' | 'left' | 'right'>('right');

  // Gamification: Streak & Score
  const [score, setScore] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [activeComboBanner, setActiveComboBanner] = useState<string | null>(null);

  // Power-Ups Active
  const [hasShield, setHasShield] = useState(false);
  const [speedBoostSteps, setSpeedBoostSteps] = useState(0);
  const [torchActiveUntil, setTorchActiveUntil] = useState<number>(0);
  const [recentItemToast, setRecentItemToast] = useState<{ title: string; desc: string; icon: string } | null>(null);

  // Collections
  const [collectedGems, setCollectedGems] = useState<string[]>([]);
  const [recentGem, setRecentGem] = useState<{ word: string; meaning: string } | null>(null);

  // Checkpoint modal state
  const [activeCheckpoint, setActiveCheckpoint] = useState<{
    id: string;
    question: MazeQuestion;
    x: number;
    y: number;
    isUnlocked: boolean;
  } | null>(null);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [questionFeedback, setQuestionFeedback] = useState<{
    isCorrect: boolean;
    text: string;
    explanation: string;
  } | null>(null);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);

  // Timer & Victory
  const [timeSpent, setTimeSpent] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [stepsCount, setStepsCount] = useState(0);

  // Modals & Drawers
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showVocabModal, setShowVocabModal] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // Swipe gesture detection ref
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Trigger Victory Confetti
  const triggerVictoryConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);
    } catch {
      // ignore
    }
  };

  // Start new maze
  const initNewMaze = useCallback(
    (newGrade: SmpGradeLevel = selectedGrade, newDiff: 'easy' | 'medium' | 'hard' = difficulty) => {
      const size = newDiff === 'easy' ? 11 : newDiff === 'medium' ? 15 : 19;
      const gates = newDiff === 'easy' ? 3 : newDiff === 'medium' ? 4 : 5;
      const newMaze = generateMazeGrid(size, newGrade, gates);

      setMaze(newMaze);
      setPlayerPos(newMaze.startPos);
      setPlayerDirection('right');
      setScore(0);
      setComboStreak(0);
      setActiveComboBanner(null);
      setHasShield(false);
      setSpeedBoostSteps(0);
      setTorchActiveUntil(0);
      setCollectedGems([]);
      setRecentGem(null);
      setRecentItemToast(null);
      setActiveCheckpoint(null);
      setQuestionFeedback(null);
      setSelectedOption(null);
      setTimeSpent(0);
      setIsGameWon(false);
      setStepsCount(0);
      setShowQuickMenu(false);
    },
    [difficulty, selectedGrade]
  );

  // Timer effect
  useEffect(() => {
    if (isGameWon || activeCheckpoint !== null) return;
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameWon, activeCheckpoint]);

  // Voice Speech Handler
  const handleSpeakText = (text: string) => {
    if (isSpeakingQuestion) {
      soundManager.stopSpeech();
      setIsSpeakingQuestion(false);
      return;
    }
    setIsSpeakingQuestion(true);
    soundManager.speakEnglishText(text, 0.85, () => {
      setIsSpeakingQuestion(false);
    });
  };

  // Clean speech on unmount
  useEffect(() => {
    return () => {
      soundManager.stopSpeech();
    };
  }, []);

  // Movement Logic
  const handleMove = useCallback(
    (dx: number, dy: number, dir: 'up' | 'down' | 'left' | 'right') => {
      if (isGameWon || activeCheckpoint !== null) return;

      setPlayerDirection(dir);
      const newX = playerPos.x + dx;
      const newY = playerPos.y + dy;

      // Boundary check
      if (newY < 0 || newY >= maze.grid.length || newX < 0 || newX >= maze.grid[0].length) {
        return;
      }
      if (maze.grid[newY][newX] === 1) {
        return; // Wall hit
      }

      // Check if trying to pass through a locked checkpoint
      const checkpoint = maze.checkpoints.find((cp) => cp.x === newX && cp.y === newY);
      if (checkpoint && !checkpoint.isUnlocked) {
        // Trigger question challenge!
        setActiveCheckpoint(checkpoint);
        setSelectedOption(null);
        setQuestionFeedback(null);
        if (!isSoundMuted) soundManager.playKeyClick();
        return;
      }

      // Move player
      setPlayerPos({ x: newX, y: newY });
      setStepsCount((prev) => prev + 1);

      // Decrement speed boost if active
      if (speedBoostSteps > 0) {
        setSpeedBoostSteps((prev) => prev - 1);
      }

      // Sound
      if (!isSoundMuted) soundManager.playKeyClick();

      // Check for Collectible Gem
      const gem = maze.gems.find((g) => g.x === newX && g.y === newY && !g.collected);
      if (gem) {
        gem.collected = true;
        setCollectedGems((prev) => [...prev, gem.id]);
        const earnedPoints = 50 * (comboStreak >= 2 ? 1.5 : 1);
        setScore((prev) => prev + Math.round(earnedPoints));
        setRecentGem({ word: gem.word, meaning: gem.meaning });
        if (!isSoundMuted) soundManager.playGemChime();

        // Speak vocabulary word
        soundManager.speakEnglishText(gem.word, 0.9);

        setTimeout(() => {
          setRecentGem(null);
        }, 3500);
      }

      // Check for Power-Up Item
      const powerUp = maze.powerUps?.find((p) => p.x === newX && p.y === newY && !p.collected);
      if (powerUp) {
        powerUp.collected = true;
        if (!isSoundMuted) soundManager.playPowerUpSound();

        if (powerUp.type === 'speed') {
          setSpeedBoostSteps(20);
          setScore((prev) => prev + 75);
          setRecentItemToast({
            title: 'Sepatu Kilat Aktif! ⚡',
            desc: 'Langkah cepat berenergi +75 XP!',
            icon: '⚡',
          });
        } else if (powerUp.type === 'torch') {
          setTorchActiveUntil(Date.now() + 15000); // 15 seconds
          setScore((prev) => prev + 75);
          setRecentItemToast({
            title: 'Obor Sakti Menyala! 🔥',
            desc: 'Jalur gerbang terdekat menyala terang 15 detik!',
            icon: '🔥',
          });
        } else if (powerUp.type === 'shield') {
          setHasShield(true);
          setScore((prev) => prev + 75);
          setRecentItemToast({
            title: 'Perisai Emas Aktif! 🛡️',
            desc: 'Melindungi rantai kombo dari 1 kesalahan!',
            icon: '🛡️',
          });
        }

        setTimeout(() => {
          setRecentItemToast(null);
        }, 3200);
      }

      // Check Exit Portal
      if (newX === maze.exitPos.x && newY === maze.exitPos.y) {
        const allGatesUnlocked = maze.checkpoints.every((cp) => cp.isUnlocked);
        if (allGatesUnlocked) {
          handleVictory();
        }
      }
    },
    [activeCheckpoint, comboStreak, isGameWon, isSoundMuted, maze, playerPos, speedBoostSteps]
  );

  // Swipe Gestures for Mobile Screen
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const minSwipeDistance = 20; // 20px threshold
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > minSwipeDistance) {
        if (dx > 0) handleMove(1, 0, 'right');
        else handleMove(-1, 0, 'left');
      }
    } else {
      if (Math.abs(dy) > minSwipeDistance) {
        if (dy > 0) handleMove(0, 1, 'down');
        else handleMove(0, -1, 'up');
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeCheckpoint !== null || showConfigModal || showAvatarModal || showVocabModal || showQuickMenu) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleMove(0, -1, 'up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleMove(0, 1, 'down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleMove(-1, 0, 'left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleMove(1, 0, 'right');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, activeCheckpoint, showConfigModal, showAvatarModal, showVocabModal, showQuickMenu]);

  // Victory Handler
  const handleVictory = () => {
    setIsGameWon(true);
    const timeBonus = Math.max(0, 500 - timeSpent * 2);
    const gemBonus = collectedGems.length * 50;
    const finalScore = score + 300 + timeBonus + gemBonus;
    setScore(finalScore);

    if (!isSoundMuted) soundManager.playSuccessSound();
    triggerVictoryConfetti();

    // Record completion
    if (onSaveCompletion && studentProfile) {
      const record: MazeCompletionRecord = {
        id: `maze-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        studentName: studentProfile.name,
        className: studentProfile.className,
        attendanceNumber: Number(studentProfile.attendanceNumber),
        gradePlayed: selectedGrade === 'all' ? '7' : selectedGrade,
        difficulty,
        timeSpentSeconds: timeSpent,
        starsCount: timeSpent < 90 ? 3 : timeSpent < 180 ? 2 : 1,
        score: finalScore,
        gatesCleared: maze.checkpoints.length,
        totalGates: maze.checkpoints.length,
        completedAt: new Date().toLocaleString('id-ID'),
      };
      onSaveCompletion(record);
    }
  };

  // Answer Checkpoint Question
  const handleAnswerQuestion = () => {
    if (selectedOption === null || !activeCheckpoint) return;

    const q = activeCheckpoint.question;
    const isCorrect = selectedOption === q.correctAnswer;

    if (isCorrect) {
      // Unlock checkpoint
      const cpTarget = maze.checkpoints.find((c) => c.id === activeCheckpoint.id);
      if (cpTarget) {
        cpTarget.isUnlocked = true;
      }
      activeCheckpoint.isUnlocked = true;

      // Increase Streak & Multiplier
      const newStreak = comboStreak + 1;
      setComboStreak(newStreak);

      const multiplier = newStreak >= 3 ? 2 : newStreak >= 2 ? 1.5 : 1;
      const points = Math.round(100 * multiplier);
      setScore((prev) => prev + points);

      if (!isSoundMuted) {
        soundManager.playGateUnlockSound();
        if (newStreak >= 2) {
          setTimeout(() => soundManager.playComboSound(newStreak), 250);
        }
      }

      // Combo praise text
      let praise = 'Jawaban Benar! Gerbang Kunci Terbuka 🗝️';
      if (newStreak >= 4) {
        praise = 'UNSTOPPABLE! 4x COMBO! LUAR BIASA! 🌟';
        setActiveComboBanner('🔥 UNSTOPPABLE 4X COMBO! 🔥');
      } else if (newStreak === 3) {
        praise = 'EXCELLENT! 3x COMBO! KAMU HEBAT! ⭐';
        setActiveComboBanner('⚡ 3X COMBO MULTIPLIER! ⚡');
      } else if (newStreak === 2) {
        praise = 'GREAT JOB! 2x COMBO! 🎯';
        setActiveComboBanner('✨ 2X COMBO! ✨');
      }

      setQuestionFeedback({
        isCorrect: true,
        text: `${praise} (+${points} XP)`,
        explanation: q.explanation,
      });

      setTimeout(() => setActiveComboBanner(null), 2500);

      // Move player into unlocked tile
      setTimeout(() => {
        setPlayerPos({ x: activeCheckpoint.x, y: activeCheckpoint.y });
        setActiveCheckpoint(null);
        setQuestionFeedback(null);
        setSelectedOption(null);
        soundManager.stopSpeech();
      }, 1500);
    } else {
      // Check if player has Grammar Shield
      if (hasShield) {
        setHasShield(false);
        setRecentItemToast({
          title: 'Perisai Tata Bahasa Menyelamatkanmu! 🛡️',
          desc: 'Kombo Anda tetap aman berkat perisai emas!',
          icon: '🛡️',
        });
      } else {
        setComboStreak(0);
      }

      if (!isSoundMuted) soundManager.playErrorSound();
      setQuestionFeedback({
        isCorrect: false,
        text: 'Jawaban Belum Tepat. Yuk pelajari pembahasannya:',
        explanation: q.explanation,
      });
    }
  };

  // Checkpoints status
  const unlockedGatesCount = maze.checkpoints.filter((cp) => cp.isUnlocked).length;
  const totalGatesCount = maze.checkpoints.length;
  const isExitOpen = unlockedGatesCount === totalGatesCount;

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Print Adventure Certificate
  const handlePrintCertificate = () => {
    const studentName = studentProfile?.name || 'Siswa Hebat SMP';
    const className = studentProfile?.className || '7A';
    const gradeName =
      selectedGrade === '7'
        ? 'Kelas VII (Tujuh)'
        : selectedGrade === '8'
        ? 'Kelas VIII (Delapan)'
        : 'Kelas IX (Sembilan)';

    const printableHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Sertifikat Petualang Labirin - ${studentName}</title>
      <style>
        @page { size: A4 landscape; margin: 12mm; }
        body {
          font-family: 'Times New Roman', serif;
          margin: 0;
          padding: 20px;
          background: #fff;
          color: #1e293b;
        }
        .cert-border {
          border: 8px double #4338ca;
          padding: 25px;
          text-align: center;
          position: relative;
          background: #fdfefe;
        }
        .header-title {
          font-size: 24pt;
          font-weight: bold;
          color: #312e81;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 5px 0;
        }
        .subtitle {
          font-size: 13pt;
          font-style: italic;
          color: #475569;
          margin-bottom: 20px;
        }
        .name {
          font-size: 26pt;
          font-weight: bold;
          color: #1e1b4b;
          text-decoration: underline;
          margin: 15px 0 5px 0;
        }
        .desc {
          font-size: 12pt;
          line-height: 1.6;
          margin: 15px auto;
          max-width: 700px;
        }
        .stats-badge {
          display: inline-block;
          margin: 15px auto;
          padding: 10px 20px;
          border: 2px solid #818cf8;
          border-radius: 12px;
          background: #eef2ff;
          font-weight: bold;
          font-size: 11pt;
        }
        .footer {
          margin-top: 35px;
          display: flex;
          justify-content: space-between;
          padding: 0 40px;
        }
        .sign-block {
          text-align: center;
          font-size: 11pt;
        }
      </style>
    </head>
    <body>
      <div class="cert-border">
        <p style="font-size: 11pt; font-weight: bold; margin: 0; letter-spacing: 1px; color: #4338ca;">
          ${kopSurat.namaSekolah.toUpperCase()} • TAHUN AJARAN ${kopSurat.tahunPelajaran}
        </p>
        <h1 class="header-title">SERTIFIKAT PETUALANG LABIRIN</h1>
        <p class="subtitle">English Maze Quest • Penakluk Labirin Bahasa Inggris SMP</p>

        <p style="font-size: 11pt; margin: 0;">Diberikan dengan bangga kepada peserta didik:</p>
        <div class="name">${studentName}</div>
        <p style="font-size: 11pt; font-weight: bold; color: #4338ca; margin: 0;">Kelas: ${className} • Tingkatan: ${gradeName}</p>

        <p class="desc">
          Telah berhasil menyelesaikan tantangan <strong>English Labyrinth Quest</strong>,
          menjawab seluruh pertanyaan tata bahasa dan teks kurikulum Bahasa Inggris, serta mengoleksi permata kosakata dengan waktu <strong>${formatTime(timeSpent)}</strong> dan perolehan skor akhir <strong>${score} Poin XP</strong>.
        </p>

        <div class="stats-badge">
          ★ Nilai Akhir: ${score} XP | 🗝️ Gerbang: ${unlockedGatesCount}/${totalGatesCount} | 💎 Kosakata: ${collectedGems.length} Kata ★
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
      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(printableHtml);
      printWin.document.close();
    }
  };

  // Dynamic Theme Styling
  const themeStyles = {
    castle: {
      bg: 'bg-slate-950',
      wall: 'bg-indigo-950 border-indigo-900/60 shadow-inner',
      path: 'bg-slate-900/95',
      boardBorder: 'border-indigo-500/40 shadow-indigo-500/10',
      glow: 'shadow-[0_0_20px_rgba(99,102,241,0.2)]',
      label: 'Kastel Kuno',
    },
    forest: {
      bg: 'bg-zinc-950',
      wall: 'bg-emerald-950 border-emerald-900/60 shadow-inner',
      path: 'bg-teal-950/85',
      boardBorder: 'border-emerald-500/40 shadow-emerald-500/10',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
      label: 'Hutan Ajaib',
    },
    cyber: {
      bg: 'bg-neutral-950',
      wall: 'bg-cyan-950 border-cyan-800/70 shadow-inner',
      path: 'bg-slate-950/90',
      boardBorder: 'border-cyan-400/50 shadow-cyan-400/20',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.25)]',
      label: 'Cyber Lab',
    },
  }[activeTheme];

  const isTorchActive = torchActiveUntil > Date.now();

  return (
    <div
      className={`min-h-screen ${themeStyles.bg} text-slate-100 flex flex-col font-sans select-none transition-colors duration-500 overflow-x-hidden`}
    >
      {/* 1. Mobile-Optimized Ultra-Sleek Top Bar */}
      <header className="bg-slate-950/90 border-b border-slate-800/90 px-2 sm:px-4 py-2 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Back button + Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onBackToHome}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700/80 flex items-center gap-1 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Kembali ke Menu Kuis"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Menu</span>
            </button>

            {/* Avatar Pill */}
            <button
              onClick={() => setShowAvatarModal(true)}
              className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 px-2 py-1 rounded-xl transition-all cursor-pointer active:scale-95 group"
              title="Ganti Avatar Karakter"
            >
              <div
                className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${selectedAvatar.color} flex items-center justify-center text-xs shadow-xs group-hover:scale-105`}
              >
                {selectedAvatar.emoji}
              </div>
              <span className="text-[11px] font-black text-white max-w-[80px] sm:max-w-none truncate leading-none">
                {selectedAvatar.name.split(' ')[0]}
              </span>
            </button>
          </div>

          {/* Quick HUD Metrics (Compact for Layar HP) */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-extrabold font-mono">
            {/* Combo Streak */}
            {comboStreak >= 2 && (
              <div className="px-2 py-1 bg-amber-500/20 border border-amber-400/70 rounded-xl flex items-center gap-1 text-amber-300 animate-pulse">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{comboStreak}x</span>
              </div>
            )}

            {/* Keys Progress */}
            <div className="px-2 py-1 bg-amber-950/70 border border-amber-500/50 rounded-xl flex items-center gap-1 text-amber-300">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {unlockedGatesCount}/{totalGatesCount}
              </span>
            </div>

            {/* Score */}
            <div className="px-2 py-1 bg-emerald-950/70 border border-emerald-500/50 rounded-xl flex items-center gap-1 text-emerald-300">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>{score}</span>
            </div>

            {/* Timer */}
            <div className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-1 text-slate-300 hidden min-[400px]:flex">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{formatTime(timeSpent)}</span>
            </div>
          </div>

          {/* Quick Menu Button for Mobile HP */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl text-white shadow-sm transition-all cursor-pointer"
              title="Menu Pengaturan Labirin"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Drawer / Popup Menu on Mobile */}
        {showQuickMenu && (
          <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-1.5 text-xs max-w-4xl mx-auto animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Theme toggle */}
              <button
                onClick={() => {
                  const nextTheme: Record<MazeTheme, MazeTheme> = {
                    castle: 'forest',
                    forest: 'cyber',
                    cyber: 'castle',
                  };
                  setActiveTheme(nextTheme[activeTheme]);
                }}
                className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[11px] font-bold text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3 h-3" />
                <span>Tema: {themeStyles.label}</span>
              </button>

              {/* Torch toggle */}
              <button
                onClick={() => setIsTorchMode(!isTorchMode)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border cursor-pointer ${
                  isTorchMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>{isTorchMode ? 'Obor: Aktif' : 'Obor: Mati'}</span>
              </button>

              {/* Sound mute */}
              <button
                onClick={() => setIsSoundMuted(!isSoundMuted)}
                className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[11px] font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
              >
                {isSoundMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
                <span>{isSoundMuted ? 'Bisu' : 'Suara'}</span>
              </button>

              {/* Grade Selector Modal */}
              <button
                onClick={() => {
                  setShowConfigModal(true);
                  setShowQuickMenu(false);
                }}
                className="px-2 py-1 bg-indigo-950 border border-indigo-500/50 rounded-lg text-[11px] font-bold text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3 h-3" />
                <span>Kelas {selectedGrade} SMP</span>
              </button>
            </div>

            {/* Reset Game */}
            <button
              onClick={() => initNewMaze()}
              className="px-2 py-1 bg-slate-900 border border-slate-700 hover:bg-rose-950 hover:border-rose-700 rounded-lg text-[11px] font-bold text-slate-300 hover:text-rose-200 flex items-center gap-1 cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Acak Ulang</span>
            </button>
          </div>
        )}
      </header>

      {/* 2. Main Game Arena (Designed to Fit Comfortably in HP Viewport) */}
      <main className="flex-1 flex flex-col items-center justify-between p-1.5 sm:p-3 max-w-4xl mx-auto w-full relative">
        {/* Floating Combo Banner */}
        {activeComboBanner && (
          <div className="absolute top-2 z-30 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white font-black text-xs sm:text-sm tracking-wide shadow-xl animate-bounce">
            {activeComboBanner}
          </div>
        )}

        {/* Item Pickup Toast */}
        {recentItemToast && (
          <div className="absolute top-3 z-30 bg-slate-950/95 border-2 border-amber-400 text-white px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 max-w-[92vw]">
            <span className="text-lg">{recentItemToast.icon}</span>
            <div className="text-[11px] leading-tight">
              <span className="font-extrabold text-amber-300 block">{recentItemToast.title}</span>
              <span className="text-slate-300 text-[10px]">{recentItemToast.desc}</span>
            </div>
          </div>
        )}

        {/* Gem Pickup Toast */}
        {recentGem && (
          <div className="absolute top-3 z-30 bg-indigo-950/95 border-2 border-indigo-400 text-white px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 max-w-[92vw]">
            <Gem className="w-4 h-4 text-cyan-300 shrink-0 animate-bounce" />
            <div className="text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-amber-300 text-xs">{recentGem.word}</span>
                <button
                  type="button"
                  onClick={() => soundManager.speakEnglishText(recentGem.word, 0.9)}
                  className="p-0.5 rounded bg-indigo-800 text-cyan-300"
                >
                  <Volume1 className="w-3 h-3" />
                </button>
              </div>
              <span className="text-slate-300 text-[10px]">{recentGem.meaning}</span>{' '}
              <span className="text-emerald-400 font-bold text-[10px]">(+50 XP)</span>
            </div>
          </div>
        )}

        {/* 3. The Maze Board - Responsive Square Container (Anti-Cramping for Layar HP) */}
        <div className="w-full flex flex-col items-center justify-center my-auto">
          <div
            className={`w-full max-w-[min(94vw,410px)] aspect-square p-2 rounded-3xl border-2 ${themeStyles.boardBorder} ${themeStyles.glow} bg-slate-950 relative overflow-hidden transition-all duration-300 flex flex-col justify-center`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Active Buffs Floating Chips */}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 text-[9px]">
              {speedBoostSteps > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400 font-bold flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                  <span>{speedBoostSteps}</span>
                </span>
              )}
              {isTorchActive && (
                <span className="px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400 font-bold flex items-center gap-0.5 animate-pulse">
                  <Flame className="w-2.5 h-2.5 text-orange-400" />
                  <span>Obor</span>
                </span>
              )}
              {hasShield && (
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-bold flex items-center gap-0.5">
                  <Shield className="w-2.5 h-2.5 text-cyan-400" />
                </span>
              )}
            </div>

            {/* Gesture Hint on Mobile */}
            <div className="absolute top-2 left-2 z-10 opacity-70 text-[9px] text-slate-400 hidden min-[360px]:block">
              <span>👆 Geser layar untuk bergerak</span>
            </div>

            {/* The Responsive Grid */}
            <div
              ref={boardRef}
              className={`w-full h-full grid gap-[1.5px] sm:gap-[2px] p-1 rounded-2xl border border-slate-800/90 select-none touch-none ${
                isTorchMode ? 'filter contrast-125' : ''
              }`}
              style={{
                gridTemplateColumns: `repeat(${maze.grid[0].length}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${maze.grid.length}, minmax(0, 1fr))`,
              }}
            >
              {maze.grid.map((row, y) =>
                row.map((cell, x) => {
                  const isPlayer = playerPos.x === x && playerPos.y === y;
                  const isStart = maze.startPos.x === x && maze.startPos.y === y;
                  const isExit = maze.exitPos.x === x && maze.exitPos.y === y;
                  const checkpoint = maze.checkpoints.find((cp) => cp.x === x && cp.y === y);
                  const gem = maze.gems.find((g) => g.x === x && g.y === y && !g.collected);
                  const powerUp = maze.powerUps?.find((p) => p.x === x && p.y === y && !p.collected);
                  const isWall = cell === 1;

                  // Distance from player for torchlight effect
                  const distFromPlayer = Math.hypot(playerPos.x - x, playerPos.y - y);
                  const isVisibleInTorch = !isTorchMode || distFromPlayer <= 3.8;
                  const isTorchGlow = isTorchActive && (checkpoint || isExit);

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`relative w-full h-full aspect-square flex items-center justify-center rounded-[3px] sm:rounded transition-all duration-100 ${
                        isWall
                          ? `${themeStyles.wall} ${!isVisibleInTorch ? 'opacity-10' : 'opacity-100'}`
                          : `${themeStyles.path} ${
                              !isVisibleInTorch ? 'opacity-10' : 'opacity-100'
                            }`
                      } ${isTorchGlow ? 'ring-1 sm:ring-2 ring-amber-400 animate-pulse' : ''}`}
                    >
                      {/* Player Avatar */}
                      {isPlayer && (
                        <div
                          className="w-full h-full flex items-center justify-center z-20"
                          title={`Karakter: ${selectedAvatar.name}`}
                        >
                          <div
                            className={`w-[85%] h-[85%] rounded-full bg-gradient-to-tr ${selectedAvatar.color} shadow-lg ring-2 ring-white flex items-center justify-center text-white font-extrabold text-[10px] sm:text-xs leading-none animate-in zoom-in-75`}
                          >
                            {selectedAvatar.emoji}
                          </div>
                        </div>
                      )}

                      {/* Start Flag */}
                      {isStart && !isPlayer && isVisibleInTorch && (
                        <span className="text-[10px] sm:text-xs text-emerald-400 font-bold opacity-80" title="Start">
                          🚩
                        </span>
                      )}

                      {/* Exit Portal */}
                      {isExit && !isPlayer && isVisibleInTorch && (
                        <div
                          className={`w-full h-full flex items-center justify-center rounded transition-all text-[11px] sm:text-xs ${
                            isExitOpen
                              ? 'bg-emerald-500/40 border border-emerald-300 animate-pulse text-emerald-200 ring-1 ring-emerald-400'
                              : 'bg-rose-500/20 border border-rose-500/40 text-rose-300 opacity-60'
                          }`}
                          title={isExitOpen ? 'Pintu Keluar Terbuka!' : 'Terkunci'}
                        >
                          {isExitOpen ? '🏆' : '🔒'}
                        </div>
                      )}

                      {/* Checkpoint Gates */}
                      {checkpoint && !isPlayer && isVisibleInTorch && (
                        <div
                          className={`w-full h-full flex items-center justify-center transition-all text-[10px] sm:text-xs ${
                            checkpoint.isUnlocked
                              ? 'text-emerald-400 opacity-60'
                              : 'text-amber-400 animate-bounce'
                          }`}
                          title={checkpoint.isUnlocked ? 'Terbuka' : 'Terkunci'}
                        >
                          {checkpoint.isUnlocked ? '🔓' : '🗝️'}
                        </div>
                      )}

                      {/* Gem */}
                      {gem && !isPlayer && isVisibleInTorch && (
                        <div
                          className="w-full h-full flex items-center justify-center text-cyan-300 text-[10px] sm:text-xs animate-pulse drop-shadow-md"
                          title={`Kata: ${gem.word}`}
                        >
                          💎
                        </div>
                      )}

                      {/* Power-up Item */}
                      {powerUp && !isPlayer && isVisibleInTorch && (
                        <div
                          className="w-full h-full flex items-center justify-center text-amber-300 text-[10px] sm:text-xs animate-bounce drop-shadow-md"
                          title={`Item: ${powerUp.type}`}
                        >
                          {powerUp.type === 'speed' ? '⚡' : powerUp.type === 'torch' ? '🔥' : '🛡️'}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 4. Ergonomic Mobile Controller Bar (Directly below Maze, No Scrolling Needed) */}
        <div className="w-full max-w-[min(94vw,410px)] bg-slate-950/95 border border-slate-800/90 p-2 sm:p-3 rounded-3xl shadow-xl flex items-center justify-between gap-2 mt-2">
          {/* Left: Vocabulary Collector Pill */}
          <button
            type="button"
            onClick={() => setShowVocabModal(true)}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-900 hover:bg-slate-850 active:bg-slate-800 border border-slate-700/80 text-cyan-300 transition-all cursor-pointer active:scale-95 shrink-0"
            title="Buka Koleksi Kosakata"
          >
            <div className="flex items-center gap-1 font-bold text-xs">
              <Gem className="w-4 h-4 text-cyan-400" />
              <span>{collectedGems.length}</span>
            </div>
            <span className="text-[9px] text-slate-400 font-semibold leading-tight mt-0.5">Kosakata</span>
          </button>

          {/* Center: Ergonomic 4-Way Thumb D-Pad for Mobile Touchscreens */}
          <div className="flex flex-col items-center justify-center">
            {/* Up */}
            <button
              type="button"
              onClick={() => handleMove(0, -1, 'up')}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 active:from-indigo-600 active:to-indigo-700 text-white flex items-center justify-center shadow-md border border-slate-700 active:scale-90 transition-transform cursor-pointer"
              title="Atas"
            >
              <ChevronUp className="w-6 h-6 text-indigo-300" />
            </button>

            {/* Left, Avatar Center, Right */}
            <div className="flex items-center gap-2 my-0.5">
              <button
                type="button"
                onClick={() => handleMove(-1, 0, 'left')}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 active:from-indigo-600 active:to-indigo-700 text-white flex items-center justify-center shadow-md border border-slate-700 active:scale-90 transition-transform cursor-pointer"
                title="Kiri"
              >
                <ChevronLeft className="w-6 h-6 text-indigo-300" />
              </button>

              <div
                onClick={() => setShowAvatarModal(true)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr ${selectedAvatar.color} border border-white/40 flex items-center justify-center text-white text-base shadow-sm cursor-pointer active:scale-95`}
                title="Ganti Avatar"
              >
                {selectedAvatar.emoji}
              </div>

              <button
                type="button"
                onClick={() => handleMove(1, 0, 'right')}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 active:from-indigo-600 active:to-indigo-700 text-white flex items-center justify-center shadow-md border border-slate-700 active:scale-90 transition-transform cursor-pointer"
                title="Kanan"
              >
                <ChevronRight className="w-6 h-6 text-indigo-300" />
              </button>
            </div>

            {/* Down */}
            <button
              type="button"
              onClick={() => handleMove(0, 1, 'down')}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 active:from-indigo-600 active:to-indigo-700 text-white flex items-center justify-center shadow-md border border-slate-700 active:scale-90 transition-transform cursor-pointer"
              title="Bawah"
            >
              <ChevronDown className="w-6 h-6 text-indigo-300" />
            </button>
          </div>

          {/* Right: Quest Gate Status Pill */}
          <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-900 border border-slate-700/80 text-amber-300 shrink-0 text-center">
            <div className="flex items-center gap-1 font-bold text-xs font-mono">
              <Key className="w-4 h-4 text-amber-400" />
              <span>
                {unlockedGatesCount}/{totalGatesCount}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 font-semibold leading-tight mt-0.5">Gerbang</span>
          </div>
        </div>
      </main>

      {/* MODAL 1: CHECKPOINT ENGLISH QUESTION (TANTANGAN GERBANG SOAL HP) */}
      {activeCheckpoint && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-3.5 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 text-slate-100 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md text-sm">
                  🗝️
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1">
                    <span>Tantangan Gerbang Bahasa Inggris</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-1 py-0.2 rounded font-bold">
                      Kelas {activeCheckpoint.question.grade}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">{activeCheckpoint.question.topic}</p>
                </div>
              </div>

              {/* Speaker TTS */}
              <button
                type="button"
                onClick={() => handleSpeakText(activeCheckpoint.question.question)}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl border flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
                  isSpeakingQuestion
                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title="Dengarkan Pengucapan Bahasa Inggris"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden min-[380px]:inline">{isSpeakingQuestion ? 'Memutar' : 'Dengar'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs sm:text-sm font-semibold text-slate-200 whitespace-pre-line leading-relaxed">
              {activeCheckpoint.question.question}
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-2">
              {activeCheckpoint.question.options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = selectedOption === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!questionFeedback) setSelectedOption(idx);
                    }}
                    className={`w-full p-2.5 sm:p-3 text-left rounded-xl border-2 transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/80 text-white shadow-md ring-1 ring-indigo-500/30'
                        : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="font-medium leading-tight flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Grammar explanation */}
            {questionFeedback && (
              <div
                className={`p-3 rounded-2xl border text-xs space-y-1 animate-in fade-in duration-150 ${
                  questionFeedback.isCorrect
                    ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                    : 'bg-rose-950/70 border-rose-500/60 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {questionFeedback.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{questionFeedback.text}</span>
                </div>
                <p className="text-[11px] opacity-90 leading-relaxed pt-0.5">
                  <strong>Penjelasan:</strong> {questionFeedback.explanation}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  soundManager.stopSpeech();
                  setActiveCheckpoint(null);
                  setQuestionFeedback(null);
                  setSelectedOption(null);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Nanti Saja
              </button>

              {!questionFeedback?.isCorrect && (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleAnswerQuestion}
                  className={`px-4 sm:px-5 py-2 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer ${
                    selectedOption !== null
                      ? 'bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Buka Gerbang (Periksa)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VOCABULARY GEM LIST MODAL (KOLEKSI KATA DI HP) */}
      {showVocabModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3.5 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
                  <Gem className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Koleksi Permata Kosakata</h3>
                  <p className="text-[10px] text-slate-400">{collectedGems.length} kata telah dikumpulkan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVocabModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {collectedGems.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs italic">
                  Belum ada permata kata yang dikumpulkan. Jelajahi lorong labirin untuk menemukan permata 💎!
                </div>
              ) : (
                collectedGems.map((gId, i) => {
                  const gemObj = maze.gems.find((g) => g.id === gId);
                  if (!gemObj) return null;
                  return (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-extrabold text-cyan-300 text-xs block">{gemObj.word}</span>
                        <span className="text-[10px] text-slate-300">{gemObj.meaning}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => soundManager.speakEnglishText(gemObj.word, 0.9)}
                        className="p-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 cursor-pointer"
                        title="Dengarkan Pengucapan"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowVocabModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: VICTORY & CELEBRATION */}
      {isGameWon && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-sm w-full p-5 sm:p-6 text-center space-y-4 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Avatar Animation */}
            <div className="relative w-20 h-20 mx-auto">
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${selectedAvatar.color} flex items-center justify-center text-3xl shadow-xl ring-4 ring-amber-400/30 animate-bounce`}
              >
                {selectedAvatar.emoji}
              </div>
              <span className="absolute -bottom-1 -right-1 text-xl">🏆</span>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">LABIRIN SELESAI!</h2>
              <p className="text-[11px] text-amber-300 font-bold mt-0.5">
                Hebat! Seluruh Gerbang Bahasa Inggris Berhasil Dikuasai
              </p>
            </div>

            {/* Stars */}
            <div className="flex items-center justify-center gap-1 py-0.5">
              <Star className="w-7 h-7 text-amber-400 fill-amber-400 animate-spin" />
              <Star className={`w-8 h-8 ${timeSpent < 180 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
              <Star className={`w-7 h-7 ${timeSpent < 90 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
              <div>
                <p className="text-[9px] text-slate-400 font-bold">WAKTU</p>
                <p className="text-xs sm:text-sm font-extrabold text-amber-300 font-mono">
                  {formatTime(timeSpent)}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-bold">GERBANG</p>
                <p className="text-xs sm:text-sm font-extrabold text-emerald-400 font-mono">
                  {unlockedGatesCount}/{totalGatesCount}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-bold">TOTAL SKOR</p>
                <p className="text-xs sm:text-sm font-extrabold text-indigo-300 font-mono">{score} XP</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Sertifikat Petualang (A4)</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => initNewMaze()}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Main Lagi</span>
                </button>

                <button
                  type="button"
                  onClick={onBackToHome}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Menu Kuis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PILIH AVATAR KARAKTER SISWA */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3.5 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                  🦸
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Pilih Avatar Karakter</h3>
                  <p className="text-[10px] text-slate-400">Pilih avatar kesukaanmu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {MAZE_AVATARS.map((av) => {
                const isSelected = selectedAvatar.id === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(av);
                      try {
                        localStorage.setItem('eduquiz_maze_avatar', av.id);
                      } catch {
                        // ignore
                      }
                      setShowAvatarModal(false);
                      if (!isSoundMuted) soundManager.playSuccessSound();
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/80 shadow-md ring-2 ring-indigo-500/30'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${av.color} flex items-center justify-center text-2xl shadow-sm`}
                    >
                      {av.emoji}
                    </div>
                    <span className="text-[11px] font-extrabold text-white mt-0.5">{av.name}</span>
                    <span className="text-[9px] text-amber-300 font-semibold">{av.badge}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowAvatarModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: PENGATURAN TINGKATAN KELAS & UKURAN LABIRIN */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Pilih Tingkatan Kelas SMP</h3>
                  <p className="text-[10px] text-slate-400">Atur kurikulum soal yang diujikan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grade Selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300">Tingkat Kelas:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: '7', label: 'Kelas 7' },
                  { id: '8', label: 'Kelas 8' },
                  { id: '9', label: 'Kelas 9' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGrade(g.id as SmpGradeLevel)}
                    className={`py-2 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                      selectedGrade === g.id
                        ? 'border-indigo-500 bg-indigo-950/70 text-white shadow-xs'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSelectedGrade('all')}
                className={`w-full py-1.5 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                  selectedGrade === 'all'
                    ? 'border-indigo-500 bg-indigo-950/70 text-white'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400'
                }`}
              >
                Campuran Semua Kelas (7, 8, 9 SMP)
              </button>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300">Ukuran Labirin:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'easy', label: 'Mudah', size: '11x11' },
                  { id: 'medium', label: 'Sedang', size: '15x15' },
                  { id: 'hard', label: 'Tantangan', size: '19x19' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id as 'easy' | 'medium' | 'hard')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      difficulty === d.id
                        ? 'border-amber-500 bg-amber-950/50 text-amber-200 font-bold'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400'
                    }`}
                  >
                    <span className="text-[11px] font-bold block">{d.label}</span>
                    <span className="text-[9px] opacity-75">{d.size}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfigModal(false);
                  initNewMaze(selectedGrade, difficulty);
                }}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
