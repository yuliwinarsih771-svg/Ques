export interface StudentProfile {
  name: string;
  className: string;
  attendanceNumber: number | string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // 0 for A, 1 for B, 2 for C, 3 for D
  explanation: string;
  topic: string;
  passage?: string;
  audioText?: string;
  isListening?: boolean;
}

export interface StudentSubmission {
  id: string;
  name: string;
  className: string;
  attendanceNumber: number;
  score: number;
  correctAnswersCount: number;
  totalQuestions: number;
  answers: Record<number, number>; // questionId -> chosen answer index
  timeSpentSeconds: number;
  submittedAt: string;
  violationsCount?: number;
  notes?: string;
}

export interface StudentMasterData {
  id: string;
  name: string;
  className: string;
  attendanceNumber: number;
  nisn?: string;
}

export interface QuizSettings {
  maxAttempts: number; // 1, 2, 3, or 0 (unlimited)
  timeLimitMinutes: number; // 0 for unlimited, or 15, 20, 30, etc.
  isQuizOpen: boolean;
  allowedClasses: string[];
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  enableAntiCheating: boolean;
  autoPlayAudio: boolean;
  defaultSpeechRate: number; // 0.8 default
  kkmScore: number; // 75
  antiScreenshotMobile: boolean;
  studyModuleLockHours: number; // 1
}

export interface ViolationRecord {
  id: string;
  studentName: string;
  className: string;
  attendanceNumber: number;
  timestamp: string;
  questionIndex: number;
  reason: string;
  resolved: boolean;
}

export interface ProcedureTextItem {
  id: string;
  title: string;
  category: 'food' | 'drink' | 'snack';
  goal: string;
  servings?: string;
  cookingTime?: string;
  ingredients: string[];
  tools: string[];
  steps: string[];
  languageFocus?: string[];
  audioScript?: string;
}
