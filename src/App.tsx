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
import {
  StudentProfile,
  StudentSubmission,
  StudentMasterData,
  Question,
  QuizSettings,
  ProcedureTextItem,
  ViolationRecord,
} from './types';
import {
  DEFAULT_QUESTIONS,
  DEFAULT_QUIZ_SETTINGS,
  INITIAL_STUDENT_MASTER,
  INITIAL_SUBMISSIONS,
  INITIAL_PROCEDURE_TEXTS,
} from './data/quizData';
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
};

export default function App() {
  // Screen state: 'start' | 'quiz' | 'result' | 'teacher'
  const [currentScreen, setCurrentScreen] = useState<'start' | 'quiz' | 'result' | 'teacher'>('start');

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
      return saved ? JSON.parse(saved) : INITIAL_STUDENT_MASTER;
    } catch {
      return INITIAL_STUDENT_MASTER;
    }
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
    } catch {
      return DEFAULT_QUESTIONS;
    }
  });

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

  const teacherPin = '1234';

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <Navbar
        onOpenTeacherPin={() => setIsPinModalOpen(true)}
        onOpenStudyModal={handleOpenStudyModal}
        isStudyLocked={hasViewedStudy}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentScreen === 'start' && (
          <StartScreen
            settings={settings}
            studentsMaster={studentsMaster}
            submissions={submissions}
            onStartQuiz={handleStartQuiz}
            onOpenStudyModal={handleOpenStudyModal}
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
            onSaveSettings={setSettings}
            onSaveMaster={setStudentsMaster}
            onSaveQuestions={setQuestions}
            onDeleteSubmission={handleDeleteSubmission}
            onClearAllSubmissions={handleClearAllSubmissions}
            onClose={() => setCurrentScreen('start')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Teacher PIN Modal */}
      <TeacherPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        correctPin={teacherPin}
        onSuccess={() => {
          setIsPinModalOpen(false);
          setCurrentScreen('teacher');
        }}
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
