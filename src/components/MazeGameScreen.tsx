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
  Compass,
  Volume1,
  Layers,
  Sparkle,
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
  MazePowerUpType,
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

  // Modals
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Board Ref
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
      }, 350);
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
        }, 4000);
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
            title: 'Sepatu Kilat Diaktifkan! ⚡',
            desc: 'Langkah cepat berenergi + 75 XP!',
            icon: '⚡',
          });
        } else if (powerUp.type === 'torch') {
          setTorchActiveUntil(Date.now() + 15000); // 15 seconds
          setScore((prev) => prev + 75);
          setRecentItemToast({
            title: 'Obor Sakti Menyinari Labirin! 🔥',
            desc: 'Jalur gerbang terdekat menyala terang selama 15 detik!',
            icon: '🔥',
          });
        } else if (powerUp.type === 'shield') {
          setHasShield(true);
          setScore((prev) => prev + 75);
          setRecentItemToast({
            title: 'Perisai Tata Bahasa Aktif! 🛡️',
            desc: 'Melindungi rantai kombo Anda dari 1 kesalahan!',
            icon: '🛡️',
          });
        }

        setTimeout(() => {
          setRecentItemToast(null);
        }, 3500);
      }

      // Check Exit Portal
      if (newX === maze.exitPos.x && newY === maze.exitPos.y) {
        const allGatesUnlocked = maze.checkpoints.every((cp) => cp.isUnlocked);
        if (allGatesUnlocked) {
          handleVictory();
        }
      }
    },
    [
      activeCheckpoint,
      comboStreak,
      isGameWon,
      isSoundMuted,
      maze,
      playerPos,
      speedBoostSteps,
    ]
  );

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeCheckpoint !== null || showConfigModal || showAvatarModal) return;

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
  }, [handleMove, activeCheckpoint, showConfigModal, showAvatarModal]);

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

      // Clear combo banner after 2.5s
      setTimeout(() => setActiveComboBanner(null), 2500);

      // Move player into unlocked tile
      setTimeout(() => {
        setPlayerPos({ x: activeCheckpoint.x, y: activeCheckpoint.y });
        setActiveCheckpoint(null);
        setQuestionFeedback(null);
        setSelectedOption(null);
        soundManager.stopSpeech();
      }, 1600);
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
      wall: 'bg-slate-800 border-slate-700 shadow-inner',
      path: 'bg-slate-900/90',
      boardBorder: 'border-indigo-500/30',
      label: 'Kastel Kuno',
    },
    forest: {
      bg: 'bg-emerald-950',
      wall: 'bg-emerald-900 border-emerald-800 shadow-inner',
      path: 'bg-teal-950/80',
      boardBorder: 'border-emerald-500/30',
      label: 'Hutan Ajaib',
    },
    cyber: {
      bg: 'bg-zinc-950',
      wall: 'bg-zinc-800 border-cyan-500/40 shadow-inner',
      path: 'bg-cyan-950/40',
      boardBorder: 'border-cyan-500/40',
      label: 'Cyber Lab',
    },
  }[activeTheme];

  const isTorchActive = torchActiveUntil > Date.now();

  return (
    <div className={`min-h-screen ${themeStyles.bg} text-slate-100 flex flex-col font-sans select-none transition-colors duration-500`}>
      {/* Top Navbar */}
      <header className="bg-slate-950/90 border-b border-slate-800 px-3 sm:px-4 py-2.5 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Brand & Left Controls */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={onBackToHome}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer active:scale-95"
              title="Kembali ke Beranda Kuis"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Menu Kuis</span>
            </button>

            {/* Avatar Profile Badge */}
            <button
              onClick={() => setShowAvatarModal(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-2xl transition-all cursor-pointer group"
              title="Klik untuk Ganti Karakter Avatar"
            >
              <div className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${selectedAvatar.color} flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform`}>
                {selectedAvatar.emoji}
              </div>
              <div className="text-left">
                <span className="text-xs font-extrabold text-white flex items-center gap-1 leading-tight">
                  <span>{selectedAvatar.name}</span>
                  <span className="text-[10px] text-amber-400">▼</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">{selectedAvatar.badge}</span>
              </div>
            </button>
          </div>

          {/* Center HUD Stats */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs overflow-x-auto max-w-full py-0.5">
            {/* Combo Multiplier Badge */}
            {comboStreak >= 2 && (
              <div className="px-2.5 py-1 bg-amber-500/20 border border-amber-400/60 rounded-xl flex items-center gap-1 text-amber-300 font-extrabold animate-pulse">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{comboStreak}x COMBO!</span>
              </div>
            )}

            {/* Active Grade */}
            <div className="px-2.5 py-1 bg-indigo-950/70 border border-indigo-500/40 rounded-xl flex items-center gap-1 text-indigo-300 font-bold shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Kelas {selectedGrade === 'all' ? '7–9' : selectedGrade} SMP</span>
            </div>

            {/* Score */}
            <div className="px-2.5 py-1 bg-emerald-950/70 border border-emerald-500/40 rounded-xl flex items-center gap-1 text-emerald-300 font-bold shrink-0">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>{score} XP</span>
            </div>

            {/* Timer */}
            <div className="px-2.5 py-1 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center gap-1 text-amber-300 font-mono font-bold shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatTime(timeSpent)}</span>
            </div>

            {/* Gate progress */}
            <div className="px-2.5 py-1 bg-amber-950/70 border border-amber-500/40 rounded-xl flex items-center gap-1 text-amber-200 font-bold shrink-0">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {unlockedGatesCount}/{totalGatesCount}
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            {/* Theme switcher */}
            <button
              onClick={() => {
                const nextTheme: Record<MazeTheme, MazeTheme> = {
                  castle: 'forest',
                  forest: 'cyber',
                  cyber: 'castle',
                };
                setActiveTheme(nextTheme[activeTheme]);
              }}
              className="p-1.5 px-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1 transition-all cursor-pointer"
              title="Ganti Tema Visual Labirin (Kastel / Hutan / Cyber)"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{themeStyles.label}</span>
            </button>

            {/* Torch Mode Toggle */}
            <button
              onClick={() => setIsTorchMode(!isTorchMode)}
              className={`p-1.5 px-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                isTorchMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Mode Obor Gelap Petualang (Lebih Menantang)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isTorchMode ? 'Obor: ON' : 'Obor: OFF'}</span>
            </button>

            {/* Sound Mute */}
            <button
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isSoundMuted ? 'Nyalakan Efek Suara' : 'Bisukan Suara'}
            >
              {isSoundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* Reset */}
            <button
              onClick={() => initNewMaze()}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Acak Ulang Labirin Baru"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Grade/Teacher settings */}
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              title="Pilih Tingkatan Kelas SMP"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pilih Kelas</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Arena */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 max-w-6xl mx-auto w-full relative">
        {/* Combo Floating Banner */}
        {activeComboBanner && (
          <div className="absolute top-2 z-20 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white font-black text-sm tracking-wider shadow-2xl animate-bounce">
            {activeComboBanner}
          </div>
        )}

        {/* Toast for Item Pickup */}
        {recentItemToast && (
          <div className="absolute top-12 z-20 bg-slate-900/95 border-2 border-amber-400 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
            <span className="text-xl animate-spin">{recentItemToast.icon}</span>
            <div className="text-xs">
              <span className="font-extrabold text-amber-300 block">{recentItemToast.title}</span>
              <span className="text-slate-300 text-[11px]">{recentItemToast.desc}</span>
            </div>
          </div>
        )}

        {/* Toast for Vocabulary Gem */}
        {recentGem && (
          <div className="absolute top-2 z-20 bg-indigo-950/95 border-2 border-indigo-400 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
            <Gem className="w-5 h-5 text-cyan-300 animate-bounce" />
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-amber-300 text-sm">{recentGem.word}</span>
                <button
                  type="button"
                  onClick={() => soundManager.speakEnglishText(recentGem.word, 0.9)}
                  className="p-1 rounded-lg bg-indigo-800 hover:bg-indigo-700 text-cyan-300"
                  title="Dengarkan Pengucapan Bahasa Inggris"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-slate-200 text-[11px]">{recentGem.meaning}</span>{' '}
              <span className="text-emerald-400 font-bold">(+50 XP)</span>
            </div>
          </div>
        )}

        {/* Maze Grid + Right Controller Panel */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 w-full">
          {/* Maze Grid Canvas Container */}
          <div className={`p-2 sm:p-4 rounded-3xl border-2 ${themeStyles.boardBorder} bg-slate-950 shadow-2xl relative overflow-hidden`}>
            {/* Active Power-Up Badges Overlay */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-[10px]">
              {speedBoostSteps > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Sepatu Kilat ({speedBoostSteps})</span>
                </span>
              )}
              {isTorchActive && (
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400 font-bold flex items-center gap-1 animate-pulse">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span>Obor Penunjuk Aktif</span>
                </span>
              )}
              {hasShield && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3 text-cyan-400" />
                  <span>Perisai Terpasang</span>
                </span>
              )}
            </div>

            {/* The Tile Grid */}
            <div
              ref={boardRef}
              className={`grid gap-[2px] sm:gap-[3px] p-2 rounded-2xl border border-slate-800 select-none touch-none ${
                isTorchMode ? 'filter contrast-125' : ''
              }`}
              style={{
                gridTemplateColumns: `repeat(${maze.grid[0].length}, minmax(0, 1fr))`,
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

                  // Responsive tile sizing
                  const cellSizeClass =
                    difficulty === 'easy'
                      ? 'w-7 h-7 sm:w-10 sm:h-10 text-xs sm:text-base'
                      : difficulty === 'medium'
                      ? 'w-5 h-5 sm:w-7 sm:h-7 text-[10px] sm:text-xs'
                      : 'w-4 h-4 sm:w-6 sm:h-6 text-[8px] sm:text-[11px]';

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`relative flex items-center justify-center rounded-sm sm:rounded transition-all duration-150 ${cellSizeClass} ${
                        isWall
                          ? `${themeStyles.wall} ${!isVisibleInTorch ? 'opacity-10' : 'opacity-100'}`
                          : `${themeStyles.path} ${
                              !isVisibleInTorch ? 'opacity-10' : 'opacity-100'
                            } hover:bg-slate-800/40`
                      } ${isTorchGlow ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 animate-pulse' : ''}`}
                    >
                      {/* Player Avatar */}
                      {isPlayer && (
                        <div
                          className="w-full h-full flex items-center justify-center z-10 transition-transform duration-100"
                          title={`Karakter: ${selectedAvatar.name}`}
                        >
                          <div
                            className={`w-4/5 h-4/5 rounded-full bg-gradient-to-tr ${selectedAvatar.color} shadow-lg border-2 border-white flex items-center justify-center text-white font-extrabold text-[11px] sm:text-sm animate-in zoom-in-75`}
                          >
                            {selectedAvatar.emoji}
                          </div>
                        </div>
                      )}

                      {/* Start Flag */}
                      {isStart && !isPlayer && isVisibleInTorch && (
                        <span className="text-emerald-400 font-bold opacity-80" title="Titik Mulai (Start)">
                          🚩
                        </span>
                      )}

                      {/* Exit Portal */}
                      {isExit && !isPlayer && isVisibleInTorch && (
                        <div
                          className={`w-full h-full flex items-center justify-center rounded transition-all ${
                            isExitOpen
                              ? 'bg-emerald-500/40 border border-emerald-300 animate-pulse text-emerald-200'
                              : 'bg-rose-500/20 border border-rose-500/40 text-rose-300 opacity-60'
                          }`}
                          title={isExitOpen ? 'Pintu Keluar Terbuka!' : 'Pintu Keluar (Buka semua gerbang)'}
                        >
                          {isExitOpen ? '🏆' : '🔒'}
                        </div>
                      )}

                      {/* Checkpoint Gates */}
                      {checkpoint && !isPlayer && isVisibleInTorch && (
                        <div
                          className={`w-full h-full flex items-center justify-center transition-all ${
                            checkpoint.isUnlocked
                              ? 'text-emerald-400 opacity-70'
                              : 'text-amber-400 animate-bounce'
                          }`}
                          title={
                            checkpoint.isUnlocked
                              ? 'Gerbang Terbuka'
                              : 'Gerbang Terkunci - Jawab Soal Bahasa Inggris'
                          }
                        >
                          {checkpoint.isUnlocked ? '🔓' : '🗝️'}
                        </div>
                      )}

                      {/* Gem */}
                      {gem && !isPlayer && isVisibleInTorch && (
                        <div
                          className="w-full h-full flex items-center justify-center text-cyan-300 animate-pulse drop-shadow-md"
                          title={`Permata Kata: ${gem.word}`}
                        >
                          💎
                        </div>
                      )}

                      {/* Power-up Item */}
                      {powerUp && !isPlayer && isVisibleInTorch && (
                        <div
                          className="w-full h-full flex items-center justify-center text-amber-300 animate-bounce drop-shadow-md"
                          title={`Item: ${
                            powerUp.type === 'speed'
                              ? 'Sepatu Kilat'
                              : powerUp.type === 'torch'
                              ? 'Obor Sakti'
                              : 'Perisai Emas'
                          }`}
                        >
                          {powerUp.type === 'speed' ? '⚡' : powerUp.type === 'torch' ? '🔥' : '🛡️'}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Instruction Footer below Maze */}
            <div className="mt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 px-1 gap-1">
              <span className="flex items-center gap-1.5">
                <span>Tekan <strong>Panah / W,A,S,D</strong> atau D-Pad layar</span>
                {speedBoostSteps > 0 && <span className="text-amber-300 font-bold">⚡ Kecepatan Berlipat</span>}
              </span>
              <span className="text-amber-300 font-bold">
                Langkah: {stepsCount} • 🗝️ Kunci: {unlockedGatesCount}/{totalGatesCount} • 🏆 Portal Keluar
              </span>
            </div>
          </div>

          {/* Right Side: Virtual Mobile D-Pad, Power-ups & Quest Status */}
          <div className="flex flex-col items-center justify-between gap-3 w-full lg:w-72 bg-slate-950 p-4 rounded-3xl border border-slate-800">
            {/* Quest Status Card */}
            <div className="w-full bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Kunci Gerbang Soal:</span>
                </span>
                <span className="text-xs font-extrabold text-amber-400 font-mono">
                  {unlockedGatesCount} / {totalGatesCount}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${(unlockedGatesCount / totalGatesCount) * 100}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                {isExitOpen
                  ? '✨ Pintu keluar 🏆 terbuka! Segera melangkah ke portal untuk menang!'
                  : `Buka ${totalGatesCount - unlockedGatesCount} gerbang soal lagi untuk membuka portal keluar.`}
              </p>
            </div>

            {/* Collected Words Vocabulary Card */}
            <div className="w-full bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Gem className="w-4 h-4 text-cyan-400" />
                  <span>Koleksi Kosakata ({collectedGems.length}):</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pt-0.5">
                {collectedGems.length === 0 ? (
                  <span className="text-[10px] text-slate-500 italic">Jelajahi lorong untuk mengoleksi permata kata.</span>
                ) : (
                  collectedGems.map((gId, i) => {
                    const gemObj = maze.gems.find((g) => g.id === gId);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => gemObj && soundManager.speakEnglishText(gemObj.word, 0.9)}
                        className="px-2 py-0.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                        title={`${gemObj?.word} = ${gemObj?.meaning} (Klik untuk dengar suara)`}
                      >
                        <span>{gemObj?.word}</span>
                        <Volume1 className="w-2.5 h-2.5 text-cyan-400" />
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Virtual Touch Controller (D-Pad) for Mobile / Touchscreen */}
            <div className="flex flex-col items-center justify-center p-2 bg-slate-900 rounded-3xl border border-slate-800 shadow-inner w-full">
              <p className="text-[10px] font-bold text-slate-400 mb-1">KONTROL SENTUH / D-PAD</p>
              {/* Up */}
              <button
                type="button"
                onClick={() => handleMove(0, -1, 'up')}
                className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-indigo-600 active:bg-indigo-700 text-white flex items-center justify-center shadow-md border border-slate-700 active:scale-95 transition-all cursor-pointer"
                title="Atas"
              >
                <ChevronUp className="w-6 h-6" />
              </button>

              {/* Left, Center Avatar, Right */}
              <div className="flex items-center gap-3 my-1">
                <button
                  type="button"
                  onClick={() => handleMove(-1, 0, 'left')}
                  className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-indigo-600 active:bg-indigo-700 text-white flex items-center justify-center shadow-md border border-slate-700 active:scale-95 transition-all cursor-pointer"
                  title="Kiri"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div
                  onClick={() => setShowAvatarModal(true)}
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${selectedAvatar.color} border border-white/40 flex items-center justify-center text-white text-base shadow-sm cursor-pointer`}
                  title="Ganti Avatar"
                >
                  {selectedAvatar.emoji}
                </div>

                <button
                  type="button"
                  onClick={() => handleMove(1, 0, 'right')}
                  className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-indigo-600 active:bg-indigo-700 text-white flex items-center justify-center shadow-md border border-slate-700 active:scale-95 transition-all cursor-pointer"
                  title="Kanan"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Down */}
              <button
                type="button"
                onClick={() => handleMove(0, 1, 'down')}
                className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-indigo-600 active:bg-indigo-700 text-white flex items-center justify-center shadow-md border border-slate-700 active:scale-95 transition-all cursor-pointer"
                title="Bawah"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL 1: CHECKPOINT ENGLISH QUESTION (TANTANGAN GERBANG) */}
      {activeCheckpoint && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-slate-100">
            {/* Header with audio TTS button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold shadow-md">
                  🗝️
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                    <span>Gerbang Soal Bahasa Inggris</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-1.5 py-0.2 rounded font-bold">
                      Kelas {activeCheckpoint.question.grade} SMP
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">{activeCheckpoint.question.topic}</p>
                </div>
              </div>

              {/* Pronounce question button */}
              <button
                type="button"
                onClick={() => handleSpeakText(activeCheckpoint.question.question)}
                className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                  isSpeakingQuestion
                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title="Dengarkan Pengucapan Soal dalam Bahasa Inggris"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isSpeakingQuestion ? 'Memutar...' : 'Dengar'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs sm:text-sm font-semibold text-slate-200 whitespace-pre-line leading-relaxed">
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
                    className={`w-full p-3 text-left rounded-xl border-2 transition-all flex items-center gap-2.5 text-xs sm:text-sm cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/80 text-white shadow-md'
                        : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${
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
                className={`p-3.5 rounded-2xl border text-xs space-y-1 animate-in fade-in duration-150 ${
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
                  <strong>Penjelasan Tata Bahasa:</strong> {questionFeedback.explanation}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.stopSpeech();
                  setActiveCheckpoint(null);
                  setQuestionFeedback(null);
                  setSelectedOption(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Nanti Saja (Mundur)
              </button>

              {!questionFeedback?.isCorrect && (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleAnswerQuestion}
                  className={`px-5 py-2 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer ${
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

      {/* MODAL 2: VICTORY & CELEBRATION (PENAKLUK LABIRIN) */}
      {isGameWon && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Victory Avatar Animation */}
            <div className="relative w-24 h-24 mx-auto">
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-tr ${selectedAvatar.color} flex items-center justify-center text-4xl shadow-2xl ring-8 ring-amber-400/30 animate-bounce`}>
                {selectedAvatar.emoji}
              </div>
              <span className="absolute -bottom-2 -right-2 text-2xl">🏆</span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">PETUALANGAN LABIRIN SELESAI!</h2>
              <p className="text-xs text-amber-300 font-bold mt-1">
                Luar Biasa! Seluruh Gerbang Bahasa Inggris Berhasil Dikuasai
              </p>
            </div>

            {/* Stars Rating */}
            <div className="flex items-center justify-center gap-1.5 py-1">
              <Star className="w-8 h-8 text-amber-400 fill-amber-400 animate-spin" />
              <Star className={`w-9 h-9 ${timeSpent < 180 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
              <Star className={`w-8 h-8 ${timeSpent < 90 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <div>
                <p className="text-[10px] text-slate-400 font-bold">WAKTU</p>
                <p className="text-sm sm:text-base font-extrabold text-amber-300 font-mono">
                  {formatTime(timeSpent)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold">GERBANG</p>
                <p className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono">
                  {unlockedGatesCount}/{totalGatesCount}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold">TOTAL SKOR</p>
                <p className="text-sm sm:text-base font-extrabold text-indigo-300 font-mono">{score} XP</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Sertifikat Petualang Labirin (A4)</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => initNewMaze()}
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
                  Kembali ke Kuis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PILIH AVATAR KARAKTER SISWA */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm">
                  🦸
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Pilih Karakter Petualang</h3>
                  <p className="text-xs text-slate-400">Pilih avatar favoritmu untuk menjelajahi labirin</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                    className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/80 shadow-lg ring-2 ring-indigo-500/30'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${av.color} flex items-center justify-center text-3xl shadow-md`}>
                      {av.emoji}
                    </div>
                    <span className="text-xs font-extrabold text-white mt-1">{av.name}</span>
                    <span className="text-[10px] text-amber-300 font-semibold">{av.badge}</span>
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

      {/* MODAL 4: PENGATURAN TINGKATAN KELAS & GURU */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Pilih Tingkatan Kelas SMP</h3>
                  <p className="text-xs text-slate-400">Pilih kurikulum materi Bahasa Inggris yang diujikan</p>
                </div>
              </div>
            </div>

            {/* Grade Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Pilih Tingkat Kelas:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '7', label: 'Kelas 7 SMP', desc: 'Introduction & Routines' },
                  { id: '8', label: 'Kelas 8 SMP', desc: 'Recount Text & Modals' },
                  { id: '9', label: 'Kelas 9 SMP', desc: 'Narrative & Passive' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGrade(g.id as SmpGradeLevel)}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      selectedGrade === g.id
                        ? 'border-indigo-500 bg-indigo-950/70 text-white shadow-md'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-sm font-extrabold">{g.label}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                      {g.desc}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSelectedGrade('all')}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedGrade === 'all'
                    ? 'border-indigo-500 bg-indigo-950/70 text-white'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>Campuran Semua Tingkat (Kelas 7, 8, dan 9 SMP)</span>
              </button>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Ukuran & Kerumitan Labirin:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'easy', label: 'Mudah', size: '11 x 11', gates: '3 Gerbang' },
                  { id: 'medium', label: 'Sedang', size: '15 x 15', gates: '4 Gerbang' },
                  { id: 'hard', label: 'Tantangan', size: '19 x 19', gates: '5 Gerbang' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id as 'easy' | 'medium' | 'hard')}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      difficulty === d.id
                        ? 'border-amber-500 bg-amber-950/50 text-amber-200 font-bold'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{d.label}</span>
                    <span className="text-[10px] opacity-75">{d.size}</span>
                    <span className="text-[9px] text-amber-400 font-medium">{d.gates}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfigModal(false);
                  initNewMaze(selectedGrade, difficulty);
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Terapkan & Mulai Ulang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
