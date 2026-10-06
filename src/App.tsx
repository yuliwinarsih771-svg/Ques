import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { StartScreen } from './components/StartScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { ReviewModal } from './components/ReviewModal';
import { TeacherPinModal } from './components/TeacherPinModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ProcedureTextStudyModal } from './components/ProcedureTextStudyModal';
import { MazeGameScreen } from './components/MazeGameScreen';
import { SnakeLadderGameScreen } from './components/SnakeLadderGameScreen';
import {
  StudentProfile,
  StudentSubmission,
  StudentMasterData,
  Question,
  QuizSettings,
  ProcedureTextItem,
  ViolationRecord,
  MazeConfig,
  MazeCompletionRecord,
  SnakeLadderRecord,
  MazeQuestion,
  PictureMatchRecord,
  PictureCardItem,
  KopSuratConfig,
  DEFAULT_KOP_SURAT,
} from './types';
import {
  DEFAULT_QUESTIONS,
  DEFAULT_QUIZ_SETTINGS,
  INITIAL_STUDENT_MASTER,
  INITIAL_SUBMISSIONS,
  INITIAL_PROCEDURE_TEXTS,
} from './data/quizData';
import { DEFAULT_MAZE_CONFIG } from './data/mazeData';
import { DEFAULT_SNAKE_LADDER_QUESTIONS } from './data/snakeLadderData';
import { PICTURE_MATCH_ITEMS } from './data/pictureMatchData';
import { PictureMatchGameScreen } from './components/PictureMatchGameScreen';
import { soundManager } from './utils/audio';

const STORAGE_KEYS = {
  SUBMISSIONS: 'quiz_submissions_v2',
  MASTER_STUDENTS: 'quiz_master_students_v2',
  SETTINGS: 'quiz_settings_v2',
  QUESTIONS: 'quiz_questions_v2',
  PROCEDURES: 'quiz_procedures_v2',
  VIOLATIONS: 'quiz_violations_v2',
  STUDY_VIEWED: 'quiz_study_viewed_v2',
  TEACHER_PIN: 'quiz_teacher_pin_v2',
  MAZE_CONFIG: 'eduquiz_maze_config',
  MAZE_COMPLETIONS: 'quiz_maze_completions_v2',
  SNAKE_LADDER_RECORDS: 'quiz_snake_ladder_records_v2',
  SNAKE_LADDER_QUESTIONS: 'quiz_snake_ladder_questions_v2',
  PICTURE_MATCH_RECORDS: 'quiz_picture_match_records_v2',
  PICTURE_CARDS: 'quiz_picture_cards_v2',
  KOP_SURAT: 'eduquiz_kop_surat',
};

// Helper to ensure each question in the question bank always has a guaranteed unique ID
const ensureUniqueQuestionIds = (qs: Question[]): Question[] => {
  if (!Array.isArray(qs)) return DEFAULT_QUESTIONS;
  const seenIds = new Set<number>();
  let nextId = 1;

  // Find max numeric ID that is reasonable
  for (const q of qs) {
    if (typeof q.id === 'number' && q.id > 0 && q.id < 1000000 && q.id >= nextId) {
      nextId = q.id + 1;
    }
  }

  return qs.map((q, idx) => {
    let id = q.id;
    if (typeof id !== 'number' || seenIds.has(id)) {
      while (seenIds.has(nextId)) {
        nextId++;
      }
      id = nextId++;
    }
    seenIds.add(id);
    return { ...q, id };
  });
};

export default function App() {
  // Screen state: 'start' | 'quiz' | 'result' | 'teacher' | 'maze' | 'snake_ladder' | 'picture_match'
  const [currentScreen, setCurrentScreen] = useState<'start' | 'quiz' | 'result' | 'teacher' | 'maze' | 'snake_ladder' | 'picture_match'>('start');

  // Master states with localStorage persistence
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  });

  const [studentsMaster, setStudentsMaster] = useState<StudentMasterData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MASTER_STUDENTS);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return INITIAL_STUDENT_MASTER;
    } catch {
      return INITIAL_STUDENT_MASTER;
    }
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      const parsed = saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
      return ensureUniqueQuestionIds(Array.isArray(parsed) ? parsed : DEFAULT_QUESTIONS);
    } catch {
      return DEFAULT_QUESTIONS;
    }
  });

  const handleSaveQuestions = (newQuestions: Question[]) => {
    const sanitized = ensureUniqueQuestionIds(newQuestions);
    setQuestions(sanitized);
  };

  const [settings, setSettings] = useState<QuizSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_QUIZ_SETTINGS;
    } catch {
      return DEFAULT_QUIZ_SETTINGS;
    }
  });

  const [procedureTexts, setProcedureTexts] = useState<ProcedureTextItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROCEDURES);
      return saved ? JSON.parse(saved) : INITIAL_PROCEDURE_TEXTS;
    } catch {
      return INITIAL_PROCEDURE_TEXTS;
    }
  });

  const [violations, setViolations] = useState<ViolationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIOLATIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Maze Game State & Completions
  const [mazeConfig, setMazeConfig] = useState<MazeConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MAZE_CONFIG);
      return saved ? { ...DEFAULT_MAZE_CONFIG, ...JSON.parse(saved) } : DEFAULT_MAZE_CONFIG;
    } catch {
      return DEFAULT_MAZE_CONFIG;
    }
  });

  const handleSaveMazeConfig = (newCfg: MazeConfig) => {
    setMazeConfig(newCfg);
    try {
      localStorage.setItem(STORAGE_KEYS.MAZE_CONFIG, JSON.stringify(newCfg));
    } catch {
      // Ignore
    }
  };

  const [mazeCompletions, setMazeCompletions] = useState<MazeCompletionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MAZE_COMPLETIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSaveMazeCompletion = (record: MazeCompletionRecord) => {
    setMazeCompletions((prev) => [record, ...prev]);
    try {
      localStorage.setItem(STORAGE_KEYS.MAZE_COMPLETIONS, JSON.stringify([record, ...mazeCompletions]));
    } catch {
      // Ignore
    }
  };

  const handleClearMazeCompletions = () => {
    setMazeCompletions([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.MAZE_COMPLETIONS);
    } catch {
      // Ignore
    }
  };

  // Snakes & Ladders Game Records
  const [snakeLadderRecords, setSnakeLadderRecords] = useState<SnakeLadderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SNAKE_LADDER_RECORDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSaveSnakeLadderRecord = (rec: SnakeLadderRecord) => {
    setSnakeLadderRecords((prev) => [rec, ...prev]);
    try {
      localStorage.setItem(STORAGE_KEYS.SNAKE_LADDER_RECORDS, JSON.stringify([rec, ...snakeLadderRecords]));
    } catch {
      // Ignore
    }
  };

  const handleClearSnakeLadderRecords = () => {
    setSnakeLadderRecords([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.SNAKE_LADDER_RECORDS);
    } catch {
      // Ignore
    }
  };

  // Editable Question Bank for Snakes and Ladders
  const [snakeLadderQuestions, setSnakeLadderQuestions] = useState<MazeQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SNAKE_LADDER_QUESTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_SNAKE_LADDER_QUESTIONS;
  });

  const handleSaveSnakeLadderQuestions = (updated: MazeQuestion[]) => {
    setSnakeLadderQuestions(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.SNAKE_LADDER_QUESTIONS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Picture Match Records
  const [pictureMatchRecords, setPictureMatchRecords] = useState<PictureMatchRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PICTURE_MATCH_RECORDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSavePictureMatchRecord = (record: PictureMatchRecord) => {
    setPictureMatchRecords((prev) => [record, ...prev]);
    try {
      localStorage.setItem(
        STORAGE_KEYS.PICTURE_MATCH_RECORDS,
        JSON.stringify([record, ...pictureMatchRecords])
      );
    } catch {
      // ignore
    }
  };

  const handleClearPictureMatchRecords = () => {
    setPictureMatchRecords([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.PICTURE_MATCH_RECORDS);
    } catch {
      // ignore
    }
  };

  // Picture Cards editable by teacher
  const [pictureCards, setPictureCards] = useState<PictureCardItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PICTURE_CARDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return PICTURE_MATCH_ITEMS;
  });

  const handleSavePictureCards = (updated: PictureCardItem[]) => {
    setPictureCards(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.PICTURE_CARDS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Kop Surat for certificates
  const [kopSurat, setKopSurat] = useState<KopSuratConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.KOP_SURAT);
      if (saved) {
        return { ...DEFAULT_KOP_SURAT, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_KOP_SURAT;
  });

  // Current active session
  const [activeProfile, setActiveProfile] = useState<StudentProfile | null>(null);
  const [latestSubmission, setLatestSubmission] = useState<StudentSubmission | null>(null);

  // Modals
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [hasViewedStudy, setHasViewedStudy] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.STUDY_VIEWED) === 'true';
    } catch {
      return false;
    }
  });

  const [teacherPin, setTeacherPin] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.TEACHER_PIN) || '1234';
    } catch {
      return '1234';
    }
  });

  const handleUpdateTeacherPin = (newPin: string) => {
    setTeacherPin(newPin);
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHER_PIN, newPin);
    } catch {
      // Ignore
    }
  };

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    } catch {
      // Ignore
    }
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MASTER_STUDENTS, JSON.stringify(studentsMaster));
    } catch {
      // Ignore
    }
  }, [studentsMaster]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    } catch {
      // Ignore
    }
  }, [questions]);

  // Start Quiz Handler
  const handleStartQuiz = (profile: StudentProfile) => {
    setActiveProfile(profile);
    setCurrentScreen('quiz');
  };

  // Submit Quiz Handler
  const handleSubmitQuiz = (
    answers: Record<number, number>,
    timeSpentSeconds: number,
    violationsCount: number
  ) => {
    if (!activeProfile) return;

    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);

    if (calculatedScore >= settings.kkmScore) {
      soundManager.playSuccessSound();
    }

    const newSubmission: StudentSubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: activeProfile.name,
      className: activeProfile.className,
      attendanceNumber: Number(activeProfile.attendanceNumber),
      score: calculatedScore,
      correctAnswersCount: correctCount,
      totalQuestions: questions.length,
      answers,
      timeSpentSeconds,
      submittedAt: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      violationsCount,
    };

    setSubmissions((prev) => [newSubmission, ...prev]);
    setLatestSubmission(newSubmission);
    setCurrentScreen('result');
  };

  // Record Violation Handler
  const handleViolationOccurred = (reason: string, questionIndex: number) => {
    if (!activeProfile) return;
    const record: ViolationRecord = {
      id: `viol-${Date.now()}`,
      studentName: activeProfile.name,
      className: activeProfile.className,
      attendanceNumber: Number(activeProfile.attendanceNumber),
      timestamp: new Date().toLocaleTimeString('id-ID'),
      questionIndex,
      reason,
      resolved: false,
    };
    setViolations((prev) => [record, ...prev]);
    try {
      localStorage.setItem(STORAGE_KEYS.VIOLATIONS, JSON.stringify([record, ...violations]));
    } catch {
      // Ignore
    }
  };

  // Open Study Modal
  const handleOpenStudyModal = () => {
    if (hasViewedStudy) return;
    setIsStudyModalOpen(true);
    setHasViewedStudy(true);
    try {
      localStorage.setItem(STORAGE_KEYS.STUDY_VIEWED, 'true');
    } catch {
      // Ignore
    }
  };

  // Delete submission
  const handleDeleteSubmission = (id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  // Clear all submissions
  const handleClearAllSubmissions = () => {
    setSubmissions([]);
  };

  const isQuizActive = currentScreen === 'quiz';
  const isDedicatedScreen =
    currentScreen === 'quiz' ||
    currentScreen === 'teacher' ||
    currentScreen === 'maze' ||
    currentScreen === 'snake_ladder' ||
    currentScreen === 'picture_match';

  return (
    <div
      className={`bg-slate-50 text-slate-800 flex flex-col ${
        isQuizActive ? 'h-dvh max-h-dvh overflow-hidden' : 'min-h-screen'
      }`}
    >
      {/* Top Navbar: Hide during quiz, teacher dashboard & games for clean immersive layout */}
      {!isDedicatedScreen && (
        <Navbar
          onOpenTeacherPin={() => setIsPinModalOpen(true)}
          onOpenStudyModal={handleOpenStudyModal}
          onOpenMazeGame={() => setCurrentScreen('maze')}
          onOpenSnakeLadder={() => setCurrentScreen('snake_ladder')}
          onOpenPictureMatch={() => setCurrentScreen('picture_match')}
          isStudyLocked={hasViewedStudy}
        />
      )}

      {/* Main View Router */}
      <main className={`flex-1 ${isQuizActive ? 'h-full min-h-0 overflow-hidden' : ''}`}>
        {currentScreen === 'start' && (
          <StartScreen
            settings={settings}
            studentsMaster={studentsMaster}
            submissions={submissions}
            onStartQuiz={handleStartQuiz}
            onOpenStudyModal={handleOpenStudyModal}
            onOpenMazeGame={(prof) => {
              if (prof) setActiveProfile(prof);
              setCurrentScreen('maze');
            }}
            onOpenSnakeLadder={(prof) => {
              if (prof) setActiveProfile(prof);
              setCurrentScreen('snake_ladder');
            }}
            onOpenPictureMatch={(prof) => {
              if (prof) setActiveProfile(prof);
              setCurrentScreen('picture_match');
            }}
            isStudyLocked={hasViewedStudy}
          />
        )}

        {currentScreen === 'quiz' && activeProfile && (
          <QuizScreen
            questions={questions}
            studentProfile={activeProfile}
            settings={settings}
            onSubmit={handleSubmitQuiz}
            onViolationOccurred={handleViolationOccurred}
          />
        )}

        {currentScreen === 'result' && latestSubmission && (
          <ResultScreen
            submission={latestSubmission}
            questions={questions}
            onRetry={() => {
              setCurrentScreen('start');
            }}
            onHome={() => {
              setCurrentScreen('start');
              setActiveProfile(null);
            }}
            onOpenReview={() => setIsReviewModalOpen(true)}
          />
        )}

        {currentScreen === 'teacher' && (
          <TeacherDashboard
            submissions={submissions}
            studentsMaster={studentsMaster}
            questions={questions}
            settings={settings}
            procedureTexts={procedureTexts}
            violations={violations}
            mazeConfig={mazeConfig}
            onSaveMazeConfig={handleSaveMazeConfig}
            mazeCompletions={mazeCompletions}
            onClearMazeCompletions={handleClearMazeCompletions}
            onOpenMazePlay={() => setCurrentScreen('maze')}
            onOpenSnakeLadderPlay={() => setCurrentScreen('snake_ladder')}
            onOpenPictureMatchPlay={() => setCurrentScreen('picture_match')}
            snakeLadderQuestions={snakeLadderQuestions}
            onSaveSnakeLadderQuestions={handleSaveSnakeLadderQuestions}
            pictureCards={pictureCards}
            onSavePictureCards={handleSavePictureCards}
            pictureMatchRecords={pictureMatchRecords}
            onClearPictureMatchRecords={handleClearPictureMatchRecords}
            onSaveSettings={setSettings}
            onSaveMaster={setStudentsMaster}
            onSaveQuestions={handleSaveQuestions}
            onDeleteSubmission={handleDeleteSubmission}
            onClearAllSubmissions={handleClearAllSubmissions}
            onClose={() => setCurrentScreen('start')}
          />
        )}

        {currentScreen === 'maze' && (
          <MazeGameScreen
            studentProfile={activeProfile}
            kopSurat={kopSurat}
            onBackToHome={() => setCurrentScreen('start')}
            onOpenTeacherPin={() => setIsPinModalOpen(true)}
            initialGrade={mazeConfig.activeGrade}
            onSaveCompletion={handleSaveMazeCompletion}
          />
        )}

        {currentScreen === 'snake_ladder' && (
          <SnakeLadderGameScreen
            studentProfile={activeProfile}
            kopSurat={kopSurat}
            onBackToHome={() => setCurrentScreen('start')}
            onOpenTeacherPin={() => setIsPinModalOpen(true)}
            initialGrade={mazeConfig.activeGrade}
            onSaveRecord={handleSaveSnakeLadderRecord}
            customQuestions={snakeLadderQuestions}
          />
        )}

        {currentScreen === 'picture_match' && (
          <PictureMatchGameScreen
            studentProfile={activeProfile}
            kopSurat={kopSurat}
            onBackToHome={() => setCurrentScreen('start')}
            onOpenTeacherPin={() => setIsPinModalOpen(true)}
            initialGrade={mazeConfig.activeGrade}
            onSaveRecord={handleSavePictureMatchRecord}
            customCards={pictureCards}
          />
        )}
      </main>

      {/* Footer: Hidden during quiz & teacher dashboard, and compact on mobile for Start & Result */}
      {!isDedicatedScreen && (
        <div className="hidden sm:block">
          <Footer />
        </div>
      )}

      {/* Teacher PIN Modal */}
      <TeacherPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        correctPin={teacherPin}
        onSuccess={() => {
          setIsPinModalOpen(false);
          setCurrentScreen('teacher');
        }}
        onUpdatePin={handleUpdateTeacherPin}
      />

      {/* Review Modal */}
      {latestSubmission && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          questions={questions}
          submission={latestSubmission}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}

      {/* Procedure / Descriptive Study Modal */}
      <ProcedureTextStudyModal
        isOpen={isStudyModalOpen}
        procedureTexts={procedureTexts}
        onClose={() => setIsStudyModalOpen(false)}
      />
    </div>
  );
}
