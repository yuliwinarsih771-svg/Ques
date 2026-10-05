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
  activeClass?: string; // 'Semua Kelas' or specific class like '7A'
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

export interface KopSuratConfig {
  instansiInduk: string;
  dinasPendidikan: string;
  namaSekolah: string;
  alamatSekolah: string;
  kontakSekolah: string;
  judulLaporan: string;
  subJudulLaporan: string;
  mataPelajaran: string;
  materiPokok: string;
  tahunPelajaran: string;
  semester: string;
  kotaPenerbit: string;
  jabatanPimpinan: string;
  namaPimpinan: string;
  nipPimpinan: string;
  jabatanGuru: string;
  namaGuru: string;
  nipGuru: string;
  logoUrl?: string;
  showLogo: boolean;
}

export type SmpGradeLevel = '7' | '8' | '9' | 'all';

export interface MazeQuestion {
  id: string;
  grade: '7' | '8' | '9';
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  vocabularyFocus?: string;
}

export interface MazeCheckpoint {
  id: string;
  x: number;
  y: number;
  question: MazeQuestion;
  isUnlocked: boolean;
}

export interface MazeGem {
  id: string;
  x: number;
  y: number;
  word: string;
  meaning: string;
  collected: boolean;
}

export type MazePowerUpType = 'speed' | 'torch' | 'shield';

export interface MazePowerUp {
  id: string;
  x: number;
  y: number;
  type: MazePowerUpType;
  collected: boolean;
}

export type MazeTheme = 'castle' | 'forest' | 'cyber';

export interface MazeAvatar {
  id: string;
  name: string;
  emoji: string;
  badge: string;
  color: string;
}

export interface MazeConfig {
  activeGrade: SmpGradeLevel;
  difficulty: 'easy' | 'medium' | 'hard';
  gridSize: number; // 11, 15, or 19
  allowStudentGradeChange: boolean;
  timeLimitSeconds: number; // 0 for unlimited, or e.g. 180, 300
}

export interface MazeCompletionRecord {
  id: string;
  studentName: string;
  className: string;
  attendanceNumber: number;
  gradePlayed: '7' | '8' | '9';
  difficulty: string;
  timeSpentSeconds: number;
  starsCount: number;
  score: number;
  gatesCleared: number;
  totalGates: number;
  completedAt: string;
}

export const DEFAULT_KOP_SURAT: KopSuratConfig = {
  instansiInduk: 'PEMERINTAH DAERAH DINAS PENDIDIKAN',
  dinasPendidikan: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
  namaSekolah: 'SMP NEGERI INDONESIA',
  alamatSekolah: 'Jl. Pendidikan Nasional No. 123, Indonesia',
  kontakSekolah: 'Telp: (021) 7890123 • Email: info@smpindonesia.sch.id',
  judulLaporan: 'REKAPITULASI HASIL ASESMEN NILAI SISWA',
  subJudulLaporan: 'Kuis & Asesmen Interaktif Berbasis Komputer • Kurikulum Merdeka',
  mataPelajaran: 'Bahasa Inggris',
  materiPokok: 'Chapter 1 (Introducing myself and others) & Chapter 2 (Culinary and Me)',
  tahunPelajaran: '2026/2027',
  semester: 'Ganjil',
  kotaPenerbit: 'Jakarta',
  jabatanPimpinan: 'Kepala Sekolah / Wali Kelas',
  namaPimpinan: '( ............................................................ )',
  nipPimpinan: '...........................................................',
  jabatanGuru: 'Guru Mata Pelajaran Bahasa Inggris',
  namaGuru: 'Eli Ermawati, S.Pd.',
  nipGuru: '...........................................................',
  showLogo: true,
  logoUrl: '',
};
