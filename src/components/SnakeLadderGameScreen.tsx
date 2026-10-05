import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Trophy,
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Award,
  Users,
  User,
  Bot,
  HelpCircle,
  Volume1,
  CheckCircle2,
  XCircle,
  Printer,
  Shield,
  Zap,
  Star,
  Settings,
  Flame,
} from 'lucide-react';
import {
  SnakeLadderPlayer,
  SnakeLadderConfig,
  SmpGradeLevel,
  StudentProfile,
  KopSuratConfig,
  SnakeLadderRecord,
  MazeQuestion,
} from '../types';
import {
  DEFAULT_SNAKE_LADDER_CONFIG,
  LADDERS_MAP,
  SNAKES_MAP,
  QUESTION_TILES,
  PLAYER_AVATARS,
  getSnakeLadderQuestion,
  getBoardTilesZigZag,
} from '../data/snakeLadderData';
import { soundManager } from '../utils/audio';

interface SnakeLadderGameScreenProps {
  studentProfile: StudentProfile | null;
  kopSurat: KopSuratConfig;
  onBackToHome: () => void;
  onOpenTeacherPin: () => void;
  initialGrade?: SmpGradeLevel;
  onSaveRecord?: (record: SnakeLadderRecord) => void;
}

export const SnakeLadderGameScreen: React.FC<SnakeLadderGameScreenProps> = ({
  studentProfile,
  kopSurat,
  onBackToHome,
  onOpenTeacherPin,
  initialGrade = '7',
  onSaveRecord,
}) => {
  // Game Setup Stage vs Playing Stage
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'gameover'>('setup');

  // Config
  const [config, setConfig] = useState<SnakeLadderConfig>({
    ...DEFAULT_SNAKE_LADDER_CONFIG,
    activeGrade: initialGrade,
  });

  // Setup form players state
  const [player1Name, setPlayer1Name] = useState(studentProfile?.name || 'Siswa 1');
  const [player1Class, setPlayer1Class] = useState(studentProfile?.className || '7A');
  const [player1Avatar, setPlayer1Avatar] = useState(PLAYER_AVATARS[0]);

  const [player2Name, setPlayer2Name] = useState('Teman Sekelas');
  const [player2Class, setPlayer2Class] = useState('7A');
  const [player2Avatar, setPlayer2Avatar] = useState(PLAYER_AVATARS[1]);

  const [player3Name, setPlayer3Name] = useState('Siswa 3');
  const [player3Avatar, setPlayer3Avatar] = useState(PLAYER_AVATARS[2]);

  const [player4Name, setPlayer4Name] = useState('Siswa 4');
  const [player4Avatar, setPlayer4Avatar] = useState(PLAYER_AVATARS[3]);

  // In-Game Players State
  const [players, setPlayers] = useState<SnakeLadderPlayer[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Synchronized refs to prevent asynchronous closure staleness
  const playersRef = useRef<SnakeLadderPlayer[]>([]);
  playersRef.current = players;
  const currentPlayerIndexRef = useRef<number>(0);
  currentPlayerIndexRef.current = currentPlayerIndex;

  // Dice & Moving States
  const [diceNumber, setDiceNumber] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [hasBonusRoll, setHasBonusRoll] = useState(false);
  const [roundsCount, setRoundsCount] = useState(1);

  // Interactive Question Modal State
  const [activeQuestion, setActiveQuestion] = useState<{
    question: MazeQuestion;
    purpose: 'ladder' | 'snake' | 'bonus';
    targetTile: number;
    playerIndex: number;
  } | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [questionFeedback, setQuestionFeedback] = useState<{
    isCorrect: boolean;
    text: string;
    explanation: string;
  } | null>(null);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);

  // Sounds & Audio
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Event Toast
  const [eventToast, setEventToast] = useState<{ text: string; type: 'ladder' | 'snake' | 'bonus' | 'six' } | null>(null);

  // Winner
  const [winner, setWinner] = useState<SnakeLadderPlayer | null>(null);

  // Used questions cache
  const usedQuestionsRef = useRef<Set<string>>(new Set());

  // Board Zigzag tiles
  const boardRows = React.useMemo(() => getBoardTilesZigZag(), []);

  // Initialize and start game
  const handleStartGame = () => {
    const list: SnakeLadderPlayer[] = [];

    // Player 1 (Human)
    list.push({
      id: 'p1',
      name: player1Name.trim() || 'Pemain 1',
      className: player1Class || '7A',
      avatar: player1Avatar.emoji,
      color: player1Avatar.color,
      position: 1,
      isBot: false,
      questionsAnswered: 0,
      correctAnswers: 0,
      score: 0,
    });

    if (config.mode === 'solo') {
      // Player 2 is AI Bot
      list.push({
        id: 'p2-bot',
        name: 'AI Buddy (Bot)',
        className: 'Robot SMP',
        avatar: '🤖',
        color: 'from-cyan-400 to-blue-600',
        position: 1,
        isBot: true,
        questionsAnswered: 0,
        correctAnswers: 0,
        score: 0,
      });
    } else {
      // Multiplayer mode: Add 2, 3, or 4 human players
      list.push({
        id: 'p2',
        name: player2Name.trim() || 'Pemain 2',
        className: player2Class || '7A',
        avatar: player2Avatar.emoji,
        color: player2Avatar.color,
        position: 1,
        isBot: false,
        questionsAnswered: 0,
        correctAnswers: 0,
        score: 0,
      });

      if (config.totalPlayers >= 3) {
        list.push({
          id: 'p3',
          name: player3Name.trim() || 'Pemain 3',
          className: player1Class,
          avatar: player3Avatar.emoji,
          color: player3Avatar.color,
          position: 1,
          isBot: false,
          questionsAnswered: 0,
          correctAnswers: 0,
          score: 0,
        });
      }

      if (config.totalPlayers >= 4) {
        list.push({
          id: 'p4',
          name: player4Name.trim() || 'Pemain 4',
          className: player1Class,
          avatar: player4Avatar.emoji,
          color: player4Avatar.color,
          position: 1,
          isBot: false,
          questionsAnswered: 0,
          correctAnswers: 0,
          score: 0,
        });
      }
    }

    setPlayers(list);
    playersRef.current = list;
    setCurrentPlayerIndex(0);
    currentPlayerIndexRef.current = 0;
    setDiceNumber(1);
    setIsRolling(false);
    setIsMoving(false);
    setHasBonusRoll(false);
    setRoundsCount(1);
    setWinner(null);
    setGameState('playing');
    usedQuestionsRef.current.clear();

    if (!isSoundMuted) soundManager.playSuccessSound();
  };

  // Turn management: Advance to next player
  const advanceTurn = useCallback((bonusRollAllowed: boolean = false) => {
    if (bonusRollAllowed) {
      // The current player gets another turn (e.g. rolled a 6)
      return;
    }

    setHasBonusRoll(false);
    const totalP = playersRef.current.length;
    const nextIdx = (currentPlayerIndexRef.current + 1) % totalP;
    if (nextIdx === 0) {
      setRoundsCount((prev) => prev + 1);
    }
    setCurrentPlayerIndex(nextIdx);
    currentPlayerIndexRef.current = nextIdx;
  }, []);

  // Direct climb ladder
  const climbLadderDirect = useCallback(
    (playerIdx: number, topPos: number, bonusRollActive: boolean) => {
      if (!isSoundMuted) soundManager.playPowerUpSound();
      setEventToast({
        text: `HEBAT! Menemukan Tangga Emas! Naik ke Petak ${topPos} 🪜`,
        type: 'ladder',
      });
      setTimeout(() => setEventToast(null), 3000);

      setPlayers((prev) => {
        const next = prev.map((p, idx) =>
          idx === playerIdx ? { ...p, position: topPos, score: p.score + 100 } : p
        );
        playersRef.current = next;
        return next;
      });

      if (topPos >= 100) {
        const targetP = playersRef.current[playerIdx];
        if (targetP) handleGameVictory(targetP);
      } else {
        advanceTurn(bonusRollActive);
      }
    },
    [advanceTurn, isSoundMuted]
  );

  // Direct slide snake
  const slideDownSnakeDirect = useCallback(
    (playerIdx: number, tailPos: number, bonusRollActive: boolean) => {
      if (!isSoundMuted) soundManager.playErrorSound();
      setEventToast({
        text: `YAH! Terinjak Kepala Ular! Meluncur turun ke Petak ${tailPos} 🐍`,
        type: 'snake',
      });
      setTimeout(() => setEventToast(null), 3000);

      setPlayers((prev) => {
        const next = prev.map((p, idx) =>
          idx === playerIdx ? { ...p, position: tailPos } : p
        );
        playersRef.current = next;
        return next;
      });

      advanceTurn(bonusRollActive);
    },
    [advanceTurn, isSoundMuted]
  );

  // Game Victory Handler
  const handleGameVictory = (winningPlayer: SnakeLadderPlayer) => {
    setWinner(winningPlayer);
    setGameState('gameover');
    setIsMoving(false);
    setIsRolling(false);
    if (!isSoundMuted) soundManager.playSuccessSound();

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);
    } catch {
      // ignore
    }

    if (onSaveRecord) {
      const rec: SnakeLadderRecord = {
        id: `snk-${Date.now()}`,
        winnerName: winningPlayer.name,
        className: winningPlayer.className,
        gradePlayed: config.activeGrade,
        playersCount: playersRef.current.length,
        roundsCount,
        winningScore: winningPlayer.score + 500,
        completedAt: new Date().toLocaleString('id-ID'),
      };
      onSaveRecord(rec);
    }
  };

  // Evaluate arrival on tile
  const evaluateTileArrival = useCallback(
    (playerIdx: number, finalPos: number, rolledValue: number) => {
      setIsMoving(false);
      const curPlayer = playersRef.current[playerIdx];
      if (!curPlayer) return;

      // Check Victory at 100
      if (finalPos === 100) {
        handleGameVictory(curPlayer);
        return;
      }

      // Check Bonus Roll on 6
      const gotSix = rolledValue === 6;
      if (gotSix) {
        setHasBonusRoll(true);
        setEventToast({
          text: `DAPAT ANGKA 6! ${curPlayer.name} mendapat bonus lemparan sekali lagi! 🎉`,
          type: 'six',
        });
        setTimeout(() => setEventToast(null), 2800);
      } else {
        setHasBonusRoll(false);
      }

      // Check Ladder 🪜
      if (LADDERS_MAP[finalPos]) {
        const topPos = LADDERS_MAP[finalPos];
        if (config.requireCorrectToClimb && !curPlayer.isBot) {
          // Trigger English Question to climb!
          const q = getSnakeLadderQuestion(config.activeGrade, usedQuestionsRef.current);
          usedQuestionsRef.current.add(q.id);

          setActiveQuestion({
            question: q,
            purpose: 'ladder',
            targetTile: topPos,
            playerIndex: playerIdx,
          });
          setSelectedOption(null);
          setQuestionFeedback(null);
          return;
        } else {
          // Direct climb for bot or if quiz requirement is turned off
          climbLadderDirect(playerIdx, topPos, gotSix);
          return;
        }
      }

      // Check Snake 🐍
      if (SNAKES_MAP[finalPos]) {
        const tailPos = SNAKES_MAP[finalPos];
        if (config.snakeShieldOnCorrect && !curPlayer.isBot) {
          // Trigger English Question for Shield!
          const q = getSnakeLadderQuestion(config.activeGrade, usedQuestionsRef.current);
          usedQuestionsRef.current.add(q.id);

          setActiveQuestion({
            question: q,
            purpose: 'snake',
            targetTile: tailPos,
            playerIndex: playerIdx,
          });
          setSelectedOption(null);
          setQuestionFeedback(null);
          return;
        } else {
          // Slide down for bot or direct slide
          slideDownSnakeDirect(playerIdx, tailPos, gotSix);
          return;
        }
      }

      // Check Dedicated Question Tile ⭐
      if (QUESTION_TILES.has(finalPos) && !curPlayer.isBot) {
        const q = getSnakeLadderQuestion(config.activeGrade, usedQuestionsRef.current);
        usedQuestionsRef.current.add(q.id);

        setActiveQuestion({
          question: q,
          purpose: 'bonus',
          targetTile: finalPos,
          playerIndex: playerIdx,
        });
        setSelectedOption(null);
        setQuestionFeedback(null);
        return;
      }

      // Normal tile -> finish turn and pass to next player
      advanceTurn(gotSix);
    },
    [advanceTurn, climbLadderDirect, config.activeGrade, config.requireCorrectToClimb, config.snakeShieldOnCorrect, slideDownSnakeDirect]
  );

  // Step-by-step moving animation
  const stepPlayerToTarget = useCallback(
    (playerIdx: number, startPos: number, targetPos: number, rolledValue: number) => {
      setIsMoving(true);
      let currentStep = startPos;

      const stepTimer = setInterval(() => {
        if (currentStep < targetPos) {
          currentStep++;
        } else if (currentStep > targetPos) {
          currentStep--;
        }

        setPlayers((prev) => {
          const next = prev.map((p, idx) => (idx === playerIdx ? { ...p, position: currentStep } : p));
          playersRef.current = next;
          return next;
        });

        if (!isSoundMuted) soundManager.playStepSound();

        if (currentStep === targetPos) {
          clearInterval(stepTimer);
          // Evaluate target tile after landing
          setTimeout(() => {
            evaluateTileArrival(playerIdx, targetPos, rolledValue);
          }, 150);
        }
      }, 130);
    },
    [evaluateTileArrival, isSoundMuted]
  );

  // Main Dice Roll Action
  const triggerRoll = useCallback(
    (playerIdx: number) => {
      if (isRolling || isMoving || activeQuestion !== null || gameState !== 'playing') {
        return;
      }

      setIsRolling(true);
      if (!isSoundMuted) soundManager.playDiceRollSound();

      // Animate dice faces tumbling
      let count = 0;
      const rollInterval = setInterval(() => {
        count++;
        const randomFace = Math.floor(Math.random() * 6) + 1;
        setDiceNumber(randomFace);

        if (count >= 8) {
          clearInterval(rollInterval);
          const finalRoll = Math.floor(Math.random() * 6) + 1;
          setDiceNumber(finalRoll);
          setIsRolling(false);

          // Calculate destination
          const curPlayer = playersRef.current[playerIdx];
          if (!curPlayer) return;

          const startPos = curPlayer.position;
          let targetPos = startPos + finalRoll;

          // Bounce back if overshoot 100
          if (targetPos > 100) {
            const overshoot = targetPos - 100;
            targetPos = 100 - overshoot;
          }

          // Begin moving
          stepPlayerToTarget(playerIdx, startPos, targetPos, finalRoll);
        }
      }, 50);
    },
    [activeQuestion, gameState, isMoving, isRolling, isSoundMuted, stepPlayerToTarget]
  );

  // Roll Handler for Button / Spacebar
  const handleUserRoll = () => {
    const curPlayer = playersRef.current[currentPlayerIndexRef.current];
    if (!curPlayer || curPlayer.isBot) return;
    triggerRoll(currentPlayerIndexRef.current);
  };

  // Keyboard shortcut: Spacebar or Enter to roll dice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        if (gameState === 'playing' && !isRolling && !isMoving && activeQuestion === null) {
          const curPlayer = playersRef.current[currentPlayerIndexRef.current];
          if (curPlayer && !curPlayer.isBot) {
            e.preventDefault();
            handleUserRoll();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isRolling, isMoving, activeQuestion]);

  // AI Bot Auto Roll Effect
  useEffect(() => {
    if (gameState !== 'playing' || isRolling || isMoving || activeQuestion !== null || winner) {
      return;
    }

    const curPlayer = players[currentPlayerIndex];
    if (curPlayer && curPlayer.isBot) {
      const botTimer = setTimeout(() => {
        triggerRoll(currentPlayerIndex);
      }, 1000);

      return () => clearTimeout(botTimer);
    }
  }, [currentPlayerIndex, gameState, isRolling, isMoving, activeQuestion, winner, players, triggerRoll]);

  // Answer English Challenge Question
  const handleAnswerQuestion = () => {
    if (selectedOption === null || !activeQuestion) return;

    const q = activeQuestion.question;
    const isCorrect = selectedOption === q.correctAnswer;
    const pIdx = activeQuestion.playerIndex;

    // Update player question stats
    setPlayers((prev) => {
      const next = prev.map((p, idx) =>
        idx === pIdx
          ? {
              ...p,
              questionsAnswered: p.questionsAnswered + 1,
              correctAnswers: p.correctAnswers + (isCorrect ? 1 : 0),
              score: p.score + (isCorrect ? 100 : 0),
            }
          : p
      );
      playersRef.current = next;
      return next;
    });

    if (isCorrect) {
      if (!isSoundMuted) soundManager.playSuccessSound();

      if (activeQuestion.purpose === 'ladder') {
        setQuestionFeedback({
          isCorrect: true,
          text: `Jawaban Tepat! Anda berhak menaiki tangga emas ke petak ${activeQuestion.targetTile}! 🪜`,
          explanation: q.explanation,
        });

        setTimeout(() => {
          climbLadderDirect(pIdx, activeQuestion.targetTile, hasBonusRoll);
          setActiveQuestion(null);
          setQuestionFeedback(null);
          setSelectedOption(null);
        }, 1500);
      } else if (activeQuestion.purpose === 'snake') {
        setQuestionFeedback({
          isCorrect: true,
          text: 'Jawaban Tepat! Perisai Emas Melindungi Anda dari Gigitan Ular! Tetap aman di petak ini! 🛡️',
          explanation: q.explanation,
        });

        setTimeout(() => {
          setActiveQuestion(null);
          setQuestionFeedback(null);
          setSelectedOption(null);
          advanceTurn(hasBonusRoll);
        }, 1500);
      } else {
        // Bonus question tile
        setQuestionFeedback({
          isCorrect: true,
          text: 'Jawaban Tepat! Anda mendapatkan bonus +100 XP! ⭐',
          explanation: q.explanation,
        });

        setTimeout(() => {
          setActiveQuestion(null);
          setQuestionFeedback(null);
          setSelectedOption(null);
          advanceTurn(hasBonusRoll);
        }, 1500);
      }
    } else {
      if (!isSoundMuted) soundManager.playErrorSound();

      if (activeQuestion.purpose === 'ladder') {
        setQuestionFeedback({
          isCorrect: false,
          text: 'Jawaban Belum Tepat. Belum berhasil menaiki tangga, tetap di petak saat ini.',
          explanation: q.explanation,
        });

        setTimeout(() => {
          setActiveQuestion(null);
          setQuestionFeedback(null);
          setSelectedOption(null);
          advanceTurn(hasBonusRoll);
        }, 2200);
      } else if (activeQuestion.purpose === 'snake') {
        setQuestionFeedback({
          isCorrect: false,
          text: `Jawaban Belum Tepat. Tergelincir meluncur turun ke petak ${activeQuestion.targetTile}! 🐍`,
          explanation: q.explanation,
        });

        setTimeout(() => {
          slideDownSnakeDirect(pIdx, activeQuestion.targetTile, hasBonusRoll);
          setActiveQuestion(null);
          setQuestionFeedback(null);
          setSelectedOption(null);
        }, 2200);
      } else {
        setQuestionFeedback({
          isCorrect: false,
          text: 'Jawaban Belum Tepat. Pelajari pembahasannya ya!',
          explanation: q.explanation,
        });

        setTimeout(() => {
          setActiveQuestion(null);
          setQuestionFeedback(null);
          setSelectedOption(null);
          advanceTurn(hasBonusRoll);
        }, 2200);
      }
    }
  };

  // Speak question TTS
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

  // Print Champion Certificate
  const handlePrintCertificate = () => {
    if (!winner) return;

    const printableHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Sertifikat Juara Ular Tangga - ${winner.name}</title>
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
          border: 8px double #0d9488;
          padding: 25px;
          text-align: center;
          position: relative;
          background: #fdfefe;
        }
        .header-title {
          font-size: 24pt;
          font-weight: bold;
          color: #115e59;
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
          color: #134e4a;
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
          border: 2px solid #2dd4bf;
          border-radius: 12px;
          background: #f0fdfa;
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
        <p style="font-size: 11pt; font-weight: bold; margin: 0; letter-spacing: 1px; color: #0d9488;">
          ${kopSurat.namaSekolah.toUpperCase()} • TAHUN AJARAN ${kopSurat.tahunPelajaran}
        </p>
        <h1 class="header-title">SERTIFIKAT JUARA ULAR TANGGA</h1>
        <p class="subtitle">English Snakes & Ladders • Pemenang Permainan Edukasi Bahasa Inggris SMP</p>

        <p style="font-size: 11pt; margin: 0;">Diberikan dengan bangga kepada Juara 1:</p>
        <div class="name">${winner.name}</div>
        <p style="font-size: 11pt; font-weight: bold; color: #0d9488; margin: 0;">Kelas: ${winner.className} • Tingkat Materi: Kelas ${config.activeGrade} SMP</p>

        <p class="desc">
          Telah berhasil menjadi yang pertama mencapai <strong>Petak 100 Piala Kemenangan</strong> dalam permainan <strong>Snakes and Ladders Bahasa Inggris SMP</strong>, menjawab butir soal tantangan kurikulum, dan mengumpulkan skor akhir <strong>${winner.score + 500} Poin XP</strong>.
        </p>

        <div class="stats-badge">
          🏆 Juara 1 Petak 100 | ★ Skor Akhir: ${winner.score + 500} XP | 🎯 Akurasi Soal: ${winner.correctAnswers}/${winner.questionsAnswered} Benar ★
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

  // Render authentic 3D casino dice faces with pips
  const renderDiceCube = (val: number) => {
    // 3x3 grid dot positions
    const dotMap: Record<number, number[]> = {
      1: [4], // Center
      2: [0, 8], // Top-left, Bottom-right
      3: [0, 4, 8], // Diagonal
      4: [0, 2, 6, 8], // 4 corners
      5: [0, 2, 4, 6, 8], // 4 corners + center
      6: [0, 2, 3, 5, 6, 8], // 2 columns of 3
    };

    const activeDots = new Set(dotMap[val] || [4]);
    const isOne = val === 1;

    return (
      <div className="w-18 h-18 sm:w-20 sm:h-20 bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-2.5 grid grid-cols-3 grid-rows-3 gap-1 select-none">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {activeDots.has(i) && (
              <div
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full shadow-inner ${
                  isOne ? 'bg-rose-600 scale-125' : 'bg-slate-900'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const currentPlayer = players[currentPlayerIndex];
  const isHumanTurn = currentPlayer && !currentPlayer.isBot;
  const isTurnDisabled = isRolling || isMoving || activeQuestion !== null || !isHumanTurn;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Navbar */}
      <header className="bg-slate-950/90 border-b border-slate-800 px-3 sm:px-4 py-2.5 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBackToHome}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer active:scale-95"
              title="Kembali ke Beranda Kuis"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Menu Kuis</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-white leading-tight flex items-center gap-1.5">
                  <span>English Snakes & Ladders</span>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-1.5 py-0.2 rounded font-bold">
                    Ular Tangga SMP
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">
                  Materi Soal: <strong>Kelas {config.activeGrade === 'all' ? '7–9' : config.activeGrade} SMP</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isSoundMuted ? 'Nyalakan Efek Suara' : 'Bisukan Suara'}
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {gameState === 'playing' && (
              <button
                onClick={() => setGameState('setup')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer"
                title="Atur Ulang Pemain & Tingkat Kelas"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pemain Baru</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* STAGE 1: SETUP & LOGIN FORM (MASUKKAN NAMA PEMAIN) */}
      {gameState === 'setup' && (
        <main className="flex-1 flex items-center justify-center p-3 sm:p-6 max-w-xl mx-auto w-full">
          <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 w-full text-slate-100">
            <div className="text-center space-y-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-3xl mx-auto shadow-lg ring-4 ring-teal-500/20">
                🎲
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">MASUK PEMAIN ULAR TANGGA</h2>
              <p className="text-xs text-slate-400">
                Daftarkan nama pemain dan pilih tingkatan kelas untuk bermain
              </p>
            </div>

            {/* Mode Selector: Solo vs Multiplayer */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                1. Mode Permainan:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, mode: 'solo' })}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    config.mode === 'solo'
                      ? 'border-teal-500 bg-teal-950/60 text-white shadow-md'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Bot className="w-5 h-5 text-teal-400" />
                  <span className="text-xs font-bold">1 Pemain vs Bot AI</span>
                  <span className="text-[10px] text-slate-400">Latihan mandiri seru</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfig({ ...config, mode: 'multiplayer' })}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    config.mode === 'multiplayer'
                      ? 'border-teal-500 bg-teal-950/60 text-white shadow-md'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-bold">Main Bersama Teman</span>
                  <span className="text-[10px] text-slate-400">2 - 4 pemain bergantian</span>
                </button>
              </div>
            </div>

            {/* Total Players if multiplayer */}
            {config.mode === 'multiplayer' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Jumlah Pemain Sekelas:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setConfig({ ...config, totalPlayers: count })}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        config.totalPlayers === count
                          ? 'border-indigo-500 bg-indigo-950/70 text-white'
                          : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {count} Pemain
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Player Inputs */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                2. Data Pemain:
              </label>

              {/* Player 1 */}
              <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-teal-300 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-teal-400" />
                    <span>Pemain 1 (Utama)</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {PLAYER_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setPlayer1Avatar(av)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                          player1Avatar.id === av.id ? 'ring-2 ring-teal-400 scale-110 bg-slate-800' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        {av.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Nama Pemain 1..."
                      value={player1Name}
                      onChange={(e) => setPlayer1Name(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Kelas (7A)"
                      value={player1Class}
                      onChange={(e) => setPlayer1Class(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-center text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Player 2 if Multiplayer */}
              {config.mode === 'multiplayer' && (
                <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-pink-300 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-pink-400" />
                      <span>Pemain 2</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {PLAYER_AVATARS.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setPlayer2Avatar(av)}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                            player2Avatar.id === av.id ? 'ring-2 ring-pink-400 scale-110 bg-slate-800' : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          {av.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Nama Pemain 2..."
                        value={player2Name}
                        onChange={(e) => setPlayer2Name(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Kelas"
                        value={player2Class}
                        onChange={(e) => setPlayer2Class(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-center text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Player 3 if Multiplayer count >= 3 */}
              {config.mode === 'multiplayer' && config.totalPlayers >= 3 && (
                <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-300">Pemain 3</span>
                    <div className="flex items-center gap-1">
                      {PLAYER_AVATARS.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setPlayer3Avatar(av)}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                            player3Avatar.id === av.id ? 'ring-2 ring-blue-400 scale-110 bg-slate-800' : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          {av.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Nama Pemain 3..."
                    value={player3Name}
                    onChange={(e) => setPlayer3Name(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white"
                  />
                </div>
              )}

              {/* Player 4 if Multiplayer count >= 4 */}
              {config.mode === 'multiplayer' && config.totalPlayers >= 4 && (
                <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-300">Pemain 4</span>
                    <div className="flex items-center gap-1">
                      {PLAYER_AVATARS.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setPlayer4Avatar(av)}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                            player4Avatar.id === av.id ? 'ring-2 ring-emerald-400 scale-110 bg-slate-800' : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          {av.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Nama Pemain 4..."
                    value={player4Name}
                    onChange={(e) => setPlayer4Name(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white"
                  />
                </div>
              )}
            </div>

            {/* Grade Selection */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                3. Tingkatan Materi Soal Bahasa Inggris SMP:
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
                    onClick={() => setConfig({ ...config, activeGrade: g.id as SmpGradeLevel })}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      config.activeGrade === g.id
                        ? 'border-teal-500 bg-teal-950/70 text-teal-200 font-extrabold shadow-sm'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs">{g.label}</span>
                    <span className="text-[10px] opacity-75">{g.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleStartGame}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Mulai Petualangan Ular Tangga 🎲</span>
            </button>
          </div>
        </main>
      )}

      {/* STAGE 2: PLAYING THE BOARD GAME */}
      {gameState === 'playing' && (
        <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 max-w-6xl mx-auto w-full relative">
          {/* Active Toast Notification */}
          {eventToast && (
            <div className="absolute top-2 z-20 px-4 py-2 rounded-2xl bg-slate-950/95 border-2 border-amber-400 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
              <span>{eventToast.text}</span>
            </div>
          )}

          {/* Grid Layout: Left is 10x10 Board, Right is Controller & Live HUD */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 w-full">
            {/* The 100-tile Board */}
            <div className="bg-slate-950 p-2 sm:p-3 rounded-3xl border-2 border-slate-800 shadow-2xl relative select-none">
              <div className="grid grid-cols-10 gap-1 sm:gap-1.5 bg-slate-900 p-2 rounded-2xl border border-slate-800">
                {boardRows.map((row) =>
                  row.map((tileNum) => {
                    const isLadder = LADDERS_MAP[tileNum] !== undefined;
                    const ladderTarget = LADDERS_MAP[tileNum];
                    const isSnake = SNAKES_MAP[tileNum] !== undefined;
                    const snakeTarget = SNAKES_MAP[tileNum];
                    const isQuestion = QUESTION_TILES.has(tileNum);
                    const isFinish = tileNum === 100;
                    const isStart = tileNum === 1;

                    // Players currently on this tile
                    const playersHere = players.filter((p) => p.position === tileNum);

                    return (
                      <div
                        key={tileNum}
                        className={`relative w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl border flex flex-col justify-between p-0.5 sm:p-1 transition-all ${
                          isFinish
                            ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 border-amber-300 text-slate-950 shadow-md ring-2 ring-amber-400/40'
                            : isStart
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : isLadder
                            ? 'bg-teal-950/70 border-teal-500/60 text-teal-200'
                            : isSnake
                            ? 'bg-rose-950/70 border-rose-500/60 text-rose-200'
                            : isQuestion
                            ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
                            : tileNum % 2 === 0
                            ? 'bg-slate-950/90 border-slate-800/80 text-slate-400'
                            : 'bg-slate-900/70 border-slate-800/60 text-slate-400'
                        }`}
                      >
                        {/* Tile Number & Badges */}
                        <div className="flex items-center justify-between leading-none">
                          <span
                            className={`text-[8px] sm:text-[10px] font-black ${
                              isFinish ? 'text-slate-950 font-black' : 'text-slate-500'
                            }`}
                          >
                            {tileNum}
                          </span>

                          {/* Tile Badge icon */}
                          {isFinish && <span className="text-xs">🏆</span>}
                          {isLadder && (
                            <span className="text-[10px] text-teal-400 font-bold" title={`Naik ke ${ladderTarget}`}>
                              🪜
                            </span>
                          )}
                          {isSnake && (
                            <span className="text-[10px] text-rose-400 font-bold" title={`Turun ke ${snakeTarget}`}>
                              🐍
                            </span>
                          )}
                          {isQuestion && (
                            <span className="text-[10px] text-amber-400 font-bold" title="Tantangan Soal Kuis">
                              ⭐
                            </span>
                          )}
                        </div>

                        {/* Players on Tile */}
                        <div className="flex items-center justify-center gap-0.5 z-10">
                          {playersHere.map((p) => (
                            <div
                              key={p.id}
                              className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr ${p.color} border border-white flex items-center justify-center text-[9px] sm:text-xs shadow-md animate-in zoom-in-75`}
                              title={`${p.name} (${p.position})`}
                            >
                              {p.avatar}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Legend footer */}
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span className="flex items-center gap-2">
                  <span className="text-teal-400 font-bold">🪜 Tangga (Naik)</span>
                  <span className="text-rose-400 font-bold">🐍 Ular (Turun)</span>
                  <span className="text-amber-400 font-bold">⭐ Soal Kuis</span>
                </span>
                <span className="text-slate-500">Putaran: #{roundsCount}</span>
              </div>
            </div>

            {/* Right Side: Interactive Dice Controller & Live Player Scoreboard */}
            <div className="flex flex-col items-center justify-between gap-3 w-full lg:w-72 bg-slate-950 p-4 rounded-3xl border border-slate-800 shadow-xl">
              {/* Turn Banner */}
              <div className={`w-full p-3.5 rounded-2xl border text-center space-y-1 transition-all ${
                isHumanTurn ? 'bg-teal-950/50 border-teal-500/50 shadow-md ring-1 ring-teal-500/30' : 'bg-slate-900/90 border-slate-800'
              }`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {isHumanTurn ? '⭐ GILIRAN ANDA MELEMPAR DADU ⭐' : '🤖 GILIRAN LAWAN (BOT)'}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${currentPlayer?.color} flex items-center justify-center text-lg shadow-sm border border-white/20`}>
                    {currentPlayer?.avatar}
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-black text-white block leading-tight">{currentPlayer?.name}</span>
                    <span className="text-[11px] text-teal-400 font-bold">Petak #{currentPlayer?.position}</span>
                  </div>
                </div>
              </div>

              {/* 3D Interactive Dice Area */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-900/80 rounded-3xl border border-slate-800 w-full space-y-3">
                {/* Clickable 3D Dice Box */}
                <div
                  onClick={() => {
                    if (!isTurnDisabled) handleUserRoll();
                  }}
                  className={`transition-all duration-300 transform select-none ${
                    isRolling ? 'rotate-[720deg] scale-110 cursor-wait' : isTurnDisabled ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:scale-105 active:scale-95'
                  }`}
                  title={isHumanTurn ? 'Klik Dadu atau Tekan Spasi untuk Mengocok!' : 'Menunggu giliran'}
                >
                  {renderDiceCube(diceNumber)}
                </div>

                <div className="text-center">
                  <span className="text-xs font-black text-slate-200 block">
                    {isRolling ? 'Mengocok Dadu...' : isMoving ? 'Pion Sedang Berjalan...' : `Angka Dadu Terakhir: ${diceNumber}`}
                  </span>
                  {hasBonusRoll && (
                    <span className="text-[11px] font-black text-amber-400 block animate-bounce mt-0.5">
                      ★ Bonus Lemparan Sekali Lagi! ★
                    </span>
                  )}
                </div>

                {/* Roll Dice Button */}
                <button
                  type="button"
                  disabled={isTurnDisabled}
                  onClick={handleUserRoll}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                    isTurnDisabled
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 ring-2 ring-teal-400/40 animate-pulse'
                  }`}
                >
                  <span>
                    {isRolling
                      ? 'Mengocok Dadu...'
                      : isMoving
                      ? 'Melangkah di Papan...'
                      : currentPlayer?.isBot
                      ? 'Bot Sedang Berpikir...'
                      : 'Kocok Dadu! (Klik / Tekan Spasi) 🎲'}
                  </span>
                </button>
              </div>

              {/* Player Rankings List */}
              <div className="w-full bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Posisi Pemain:</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {players.map((p, idx) => {
                    const isTurn = idx === currentPlayerIndex;
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                          isTurn
                            ? 'bg-teal-950/70 border-teal-500/70 text-white shadow-xs ring-1 ring-teal-400/30'
                            : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{p.avatar}</span>
                          <div>
                            <span className="font-extrabold text-white block leading-tight">{p.name}</span>
                            <span className="text-[10px] text-slate-400">{p.score} XP</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-black text-amber-400 text-sm">#{p.position}</span>
                          <span className="text-[9px] text-slate-500 block">/ 100</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* MODAL 1: ENGLISH CHALLENGE ON LADDER / SNAKE / QUESTION TILE */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-teal-500 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
                  {activeQuestion.purpose === 'ladder'
                    ? '🪜'
                    : activeQuestion.purpose === 'snake'
                    ? '🛡️'
                    : '⭐'}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                    <span>
                      {activeQuestion.purpose === 'ladder'
                        ? 'Tantangan Naik Tangga Emas'
                        : activeQuestion.purpose === 'snake'
                        ? 'Perisai Tangkal Gigitan Ular'
                        : 'Tantangan Soal Bintang Kuis'}
                    </span>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.2 rounded font-bold">
                      Kelas {activeQuestion.question.grade} SMP
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">{activeQuestion.question.topic}</p>
                </div>
              </div>

              {/* TTS Voice Button */}
              <button
                type="button"
                onClick={() => handleSpeakText(activeQuestion.question.question)}
                className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                  isSpeakingQuestion
                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title="Dengarkan Pengucapan Soal Bahasa Inggris"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isSpeakingQuestion ? 'Memutar...' : 'Dengar'}</span>
              </button>
            </div>

            {/* Purpose explanation */}
            <div className="p-2.5 bg-teal-950/40 border border-teal-500/30 rounded-xl text-xs text-teal-200">
              {activeQuestion.purpose === 'ladder'
                ? `🪜 Jawab benar untuk naik langsung ke Petak ${activeQuestion.targetTile} dan raih +100 XP!`
                : activeQuestion.purpose === 'snake'
                ? '🛡️ Jawab benar untuk mengaktifkan Perisai Emas dan menolak gigitan ular!'
                : '⭐ Jawab benar untuk mendapatkan bonus +100 XP!'}
            </div>

            {/* Question Text */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs sm:text-sm font-semibold text-slate-200 whitespace-pre-line leading-relaxed">
              {activeQuestion.question.question}
            </div>

            {/* Options */}
            <div className="space-y-2">
              {activeQuestion.question.options.map((opt, idx) => {
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
                        ? 'border-teal-500 bg-teal-950/70 text-white shadow-md'
                        : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${
                        isSelected ? 'bg-teal-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="font-medium leading-tight flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
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
                  <strong>Penjelasan:</strong> {questionFeedback.explanation}
                </p>
              </div>
            )}

            {/* Action */}
            <div className="flex justify-end pt-1">
              {!questionFeedback && (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleAnswerQuestion}
                  className={`px-5 py-2.5 font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer ${
                    selectedOption !== null
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Periksa Jawaban
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: GAME OVER & VICTORY CELEBRATION */}
      {gameState === 'gameover' && winner && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Victory Badge */}
            <div className="relative w-24 h-24 mx-auto">
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-tr ${winner.color} flex items-center justify-center text-4xl shadow-2xl ring-8 ring-amber-400/30 animate-bounce`}>
                {winner.avatar}
              </div>
              <span className="absolute -bottom-2 -right-2 text-2xl">🏆</span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">JUARA ULAR TANGGA!</h2>
              <p className="text-xs text-amber-300 font-bold mt-1">
                Selamat kepada <strong>{winner.name}</strong> ({winner.className}) berhasil menaklukkan Petak 100!
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <div>
                <p className="text-[10px] text-slate-400 font-bold">PUTARAN</p>
                <p className="text-sm sm:text-base font-extrabold text-amber-300 font-mono">#{roundsCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold">SOAL BENAR</p>
                <p className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono">
                  {winner.correctAnswers}/{winner.questionsAnswered}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold">TOTAL SKOR</p>
                <p className="text-sm sm:text-base font-extrabold text-teal-300 font-mono">
                  {winner.score + 500} XP
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Sertifikat Juara Ular Tangga (A4)</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGameState('setup')}
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
    </div>
  );
};
