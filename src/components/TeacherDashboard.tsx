import React, { useState } from 'react';
import {
  Users,
  Award,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Trash2,
  Printer,
  Search,
  BookOpen,
  Plus,
  RefreshCw,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Upload,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  Sparkles,
  Trophy,
  Activity,
  ShieldCheck,
  ShieldAlert,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
  LogOut,
  ChevronDown,
  FileSignature,
  Gamepad2,
  Key,
  Star,
  Dice6,
  Image as ImageIcon,
} from 'lucide-react';
import {
  StudentSubmission,
  StudentMasterData,
  Question,
  QuizSettings,
  ProcedureTextItem,
  ViolationRecord,
  KopSuratConfig,
  DEFAULT_KOP_SURAT,
  MazeConfig,
  MazeCompletionRecord,
  SmpGradeLevel,
  MazeQuestion,
  PictureCardItem,
  PictureMatchRecord,
} from '../types';
import { SMP_MAZE_QUESTIONS, DEFAULT_MAZE_CONFIG } from '../data/mazeData';
import { exportRecapToExcel, printClassRecap, printSingleStudentCertificate } from '../utils/printReport';
import { TeacherInputStudent } from './TeacherInputStudent';
import { AiQuestionGenerator } from './AiQuestionGenerator';
import { KopSuratSettings } from './KopSuratSettings';
import { TeacherSnakeLadderQuestions } from './TeacherSnakeLadderQuestions';
import { TeacherPictureCards } from './TeacherPictureCards';

interface TeacherDashboardProps {
  submissions: StudentSubmission[];
  studentsMaster: StudentMasterData[];
  questions: Question[];
  settings: QuizSettings;
  procedureTexts: ProcedureTextItem[];
  violations: ViolationRecord[];
  mazeConfig?: MazeConfig;
  onSaveMazeConfig?: (config: MazeConfig) => void;
  mazeCompletions?: MazeCompletionRecord[];
  onClearMazeCompletions?: () => void;
  onOpenMazePlay?: () => void;
  onOpenSnakeLadderPlay?: () => void;
  onOpenPictureMatchPlay?: () => void;
  snakeLadderQuestions?: MazeQuestion[];
  onSaveSnakeLadderQuestions?: (questions: MazeQuestion[]) => void;
  pictureCards?: PictureCardItem[];
  onSavePictureCards?: (cards: PictureCardItem[]) => void;
  pictureMatchRecords?: PictureMatchRecord[];
  onClearPictureMatchRecords?: () => void;
  onSaveSettings: (settings: QuizSettings) => void;
  onSaveMaster: (students: StudentMasterData[]) => void;
  onSaveQuestions: (questions: Question[]) => void;
  onDeleteSubmission: (id: string) => void;
  onClearAllSubmissions: () => void;
  onClose: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  submissions,
  studentsMaster,
  questions,
  settings,
  procedureTexts,
  violations,
  mazeConfig = DEFAULT_MAZE_CONFIG,
  onSaveMazeConfig,
  mazeCompletions = [],
  onClearMazeCompletions,
  onOpenMazePlay,
  onOpenSnakeLadderPlay,
  onOpenPictureMatchPlay,
  snakeLadderQuestions = [],
  onSaveSnakeLadderQuestions,
  pictureCards = [],
  onSavePictureCards,
  pictureMatchRecords = [],
  onClearPictureMatchRecords,
  onSaveSettings,
  onSaveMaster,
  onSaveQuestions,
  onDeleteSubmission,
  onClearAllSubmissions,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'rekap' | 'buat-soal-ai' | 'input-siswa' | 'analisis' | 'pengaturan' | 'kop-surat' | 'monitoring' | 'game-labirin' | 'bank-ular-tangga' | 'bank-tebak-gambar'>('rekap');
  const [selectedClass, setSelectedClass] = useState<string>('Semua Kelas');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printModalClass, setPrintModalClass] = useState<string>('Semua Kelas');
  const [kopSurat, setKopSurat] = useState<KopSuratConfig>(() => {
    try {
      const saved = localStorage.getItem('eduquiz_kop_surat');
      if (saved) {
        return { ...DEFAULT_KOP_SURAT, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_KOP_SURAT;
  });

  const handleSaveKopSurat = (newConfig: KopSuratConfig) => {
    setKopSurat(newConfig);
    try {
      localStorage.setItem('eduquiz_kop_surat', JSON.stringify(newConfig));
    } catch {
      // ignore
    }
  };
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showScreenOptions, setShowScreenOptions] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Filter submissions by class and search
  const filteredSubmissions = submissions
    .filter((s) => {
      const matchClass = selectedClass === 'Semua Kelas' || s.className === selectedClass;
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchClass && matchSearch;
    })
    // Sort by attendance number asc
    .sort((a, b) => {
      if (a.className !== b.className) return a.className.localeCompare(b.className);
      return a.attendanceNumber - b.attendanceNumber;
    });

  // KPI Statistics
  const totalSubmissions = filteredSubmissions.length;
  const passedSubmissions = filteredSubmissions.filter((s) => s.score >= settings.kkmScore).length;
  const passRate = totalSubmissions > 0 ? Math.round((passedSubmissions / totalSubmissions) * 100) : 0;
  const averageScore = totalSubmissions > 0
    ? Math.round(filteredSubmissions.reduce((sum, s) => sum + s.score, 0) / totalSubmissions)
    : 0;
  const highestScore = totalSubmissions > 0 ? Math.max(...filteredSubmissions.map((s) => s.score)) : 0;
  const lowestScore = totalSubmissions > 0 ? Math.min(...filteredSubmissions.map((s) => s.score)) : 0;

  // Handle delete
  const handleDelete = (id: string) => {
    onDeleteSubmission(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f1] text-[#2c3338] flex flex-col font-sans select-none antialiased">
      {/* 1. TOP ADMIN BAR (WordPress Dark Bar: #1d2327) */}
      <header className="h-8 sm:h-9 bg-[#1d2327] text-[#c3c4c7] px-3 sm:px-4 flex items-center justify-between text-xs z-30 shrink-0 border-b border-[#3c434a]">
        {/* Left Side: Logo & Site Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1 text-[#c3c4c7] hover:text-white"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* WP style Icon */}
          <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs">
              W
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-white font-medium hover:text-[#72aee6] transition-colors cursor-pointer">
            <Home className="w-3.5 h-3.5 text-[#c3c4c7]" />
            <span className="font-bold">Portal Guru SMP</span>
            <span className="text-[#8c8f94] text-[11px] font-normal">• English for Nusantara (Kelas VII)</span>
          </div>
        </div>

        {/* Right Side: Quick Action & User Greeting */}
        <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
          <button
            onClick={() => {
              setPrintModalClass(selectedClass);
              setShowPrintModal(true);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[11px] transition-colors shadow-2xs cursor-pointer"
            title="Buka Menu Cetak & Print Laporan Nilai A4"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Rekap dan Cetak</span>
          </button>

          <button
            onClick={() => exportRecapToExcel(submissions, selectedClass, settings.kkmScore, kopSurat)}
            className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-[#2c3338] hover:bg-[#3c434a] text-emerald-400 font-semibold rounded text-[11px] transition-colors cursor-pointer"
            title="Download Excel"
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span>Export Excel</span>
          </button>

          {/* User profile */}
          <div className="flex items-center gap-1.5 text-[#c3c4c7] hover:text-white cursor-default">
            <span>Howdy, <strong className="text-white font-semibold">{kopSurat.namaGuru || 'Ibu Eli Ermawati, S.Pd.'}</strong></span>
            <div className="w-5 h-5 rounded-full bg-[#3c434a] flex items-center justify-center text-slate-200 font-bold text-[10px]">
              {(kopSurat.namaGuru || 'E')[0].toUpperCase()}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="ml-1 sm:ml-2 inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[11px] transition-all active:scale-95 shadow-2xs"
            title="Keluar dari Portal Guru"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden xs:inline">Tutup Portal</span>
          </button>
        </div>
      </header>

      {/* 2. BODY LAYOUT: LEFT SIDEBAR + MAIN CONTENT */}
      <div className="flex flex-1 min-h-[calc(100vh-36px)] relative">
        {/* Left Sidebar Menu (Hitam / Dark WordPress Style) */}
        <aside
          className={`bg-[#1d2327] text-[#c3c4c7] shrink-0 transition-all duration-200 flex flex-col justify-between z-20 ${
            isSidebarCollapsed ? 'w-12 sm:w-14' : 'w-48 sm:w-56'
          } ${
            isMobileMenuOpen
              ? 'block fixed inset-y-8 left-0 shadow-2xl z-40'
              : 'hidden md:flex'
          }`}
        >
          {/* Menu Items List */}
          <div className="py-1 space-y-0.5">
            {/* 1. Rekap dan Cetak Nilai Siswa */}
            <div>
              <button
                onClick={() => {
                  setActiveTab('rekap');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs flex items-center justify-start gap-2.5 transition-all text-left ${
                  activeTab === 'rekap'
                    ? 'bg-[#2271b1] text-white font-bold'
                    : 'text-[#c3c4c7] hover:bg-[#13171a] hover:text-[#72aee6]'
                }`}
                title="Rekap dan Cetak Nilai Siswa"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && (
                  <>
                    <span className="flex-1 truncate">Rekap dan Cetak</span>
                    {totalSubmissions > 0 && (
                      <span className="text-[10px] bg-[#13171a] text-[#72aee6] px-1.5 py-0.2 rounded-full font-bold">
                        {totalSubmissions}
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* Sub-menu (WordPress style) */}
              {!isSidebarCollapsed && activeTab === 'rekap' && (
                <div className="bg-[#2c3338] py-1 text-[11px] text-[#c3c4c7]">
                  <button
                    onClick={() => setSelectedClass('Semua Kelas')}
                    className={`w-full px-7 py-1 text-left hover:text-[#72aee6] flex items-center justify-between ${
                      selectedClass === 'Semua Kelas' ? 'text-white font-bold' : ''
                    }`}
                  >
                    <span>Semua Kelas</span>
                    {selectedClass === 'Semua Kelas' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                  </button>
                  <button
                    onClick={() => setActiveTab('rekap')}
                    className="w-full px-7 py-1 text-left text-slate-300 hover:text-[#72aee6]"
                  >
                    Rekap Nilai Siswa
                  </button>
                  <button
                    onClick={() => {
                      setPrintModalClass(selectedClass);
                      setShowPrintModal(true);
                    }}
                    className="w-full px-7 py-1 text-left text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3 h-3 text-blue-400" />
                    <span>Cetak Format A4</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Bank Soal dengan AI */}
            <button
              onClick={() => {
                setActiveTab('buat-soal-ai');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 text-xs flex items-center justify-start gap-2.5 transition-all text-left ${
                activeTab === 'buat-soal-ai'
                  ? 'bg-[#2271b1] text-white font-bold'
                  : 'text-[#c3c4c7] hover:bg-[#13171a] hover:text-[#72aee6]'
              }`}
              title="Bank Soal dengan AI"
            >
              <Sparkles className={`w-4 h-4 shrink-0 ${activeTab === 'buat-soal-ai' ? 'text-amber-300' : 'text-amber-400'}`} />
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 truncate">Bank Soal AI</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded font-bold">
                    Gemini
                  </span>
                </>
              )}
            </button>

            {/* 3. Data Siswa */}
            <button
              onClick={() => {
                setActiveTab('input-siswa');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 text-xs flex items-center justify-start gap-2.5 transition-all text-left ${
                activeTab === 'input-siswa'
                  ? 'bg-[#2271b1] text-white font-bold'
                  : 'text-[#c3c4c7] hover:bg-[#13171a] hover:text-[#72aee6]'
              }`}
              title="Data Siswa"
            >
              <Users className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 truncate">Data Siswa</span>
                  {studentsMaster.length > 0 && (
                    <span className="text-[10px] bg-[#2c3338] text-slate-300 px-1.5 py-0.2 rounded font-mono">
                      {studentsMaster.length}
                    </span>
                  )}
                </>
              )}
            </button>

            {/* 4. Analisis Butir Soal */}
            <button
              onClick={() => {
                setActiveTab('analisis');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 text-xs flex items-center justify-start gap-2.5 transition-all text-left ${
                activeTab === 'analisis'
                  ? 'bg-[#2271b1] text-white font-bold'
                  : 'text-[#c3c4c7] hover:bg-[#13171a] hover:text-[#72aee6]'
              }`}
              title="Analisis Butir Soal"
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span className="flex-1 truncate">Analisis Butir Soal</span>}
            </button>

            {/* 5. Batasan & Pengaturan Kuis */}
            <button
              onClick={() => {
                setActiveTab('pengaturan');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 text-xs flex items-center justify-start gap-2.5 transition-all text-left ${
                activeTab === 'pengaturan'
                  ? 'bg-[#2271b1] text-white font-bold'
                  : 'text-[#c3c4c7] hover:bg-[#13171a] hover:text-[#72aee6]'
              }`}
              title="Batasan & Pengaturan Kuis"
            >
              <Sliders className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span className="flex-1 truncate">Pengaturan Kuis</span>}
            </button>

            {/* 6. Pengaturan Kop Surat */}
            <button
              onClick={() => {
                setActiveTab('kop-surat');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 text-xs flex items-center justify-start gap-2.5 transition-all text-left ${
                activeTab === 'kop-surat'
                  ? 'bg-[#2271b1] text-white font-bold'
                  : 'text-[#c3c4c7] hover:bg-[#13171a] hover:text-[#72aee6]'
              }`}
              title="Pengaturan Kop Surat & Lembar Cetak"
            >
              <FileSignature className="w-4 h-4 shrink-0 text-amber-400" />
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 truncate">Kop Surat & Cetak</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded font-bold">
                    A4
                  </span>
                </>
              )}
            </button>

            {/* 7. Monitoring Anti-Curang */}
            <button
              onClick={() => {
                setActiveTab('monitoring');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 text-xs flex items-center justify-start gap-2.5 transition-all text-left ${
                activeTab === 'monitoring'
                  ? 'bg-[#2271b1] text-white font-bold'
                  : 'text-[#c3c4c7] hover:bg-[#13171a] hover:text-[#72aee6]'
              }`}
              title="Monitoring Anti-Curang & Log Siswa"
            >
              <ShieldAlert className={`w-4 h-4 shrink-0 ${violations.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 truncate">Monitoring Pelanggaran</span>
                  {violations.length > 0 && (
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded-full font-bold">
                      {violations.length}
                    </span>
                  )}
                </>
              )}
            </button>

            {/* 8. Game Labirin SMP */}
            <button
              onClick={() => {
                setActiveTab('game-labirin');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 text-xs flex items-center justify-start gap-2.5 transition-all text-left ${
                activeTab === 'game-labirin'
                  ? 'bg-[#2271b1] text-white font-bold'
                  : 'text-[#c3c4c7] hover:bg-[#13171a] hover:text-[#72aee6]'
              }`}
              title="Permainan Labirin SMP & Pilihan Tingkat Kelas"
            >
              <Gamepad2 className="w-4 h-4 shrink-0 text-amber-400" />
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 truncate">Game Labirin SMP</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded font-bold">
                    Kelas {mazeConfig.activeGrade === 'all' ? '7-9' : mazeConfig.activeGrade}
                  </span>
                </>
              )}
            </button>

            {/* 9. Bank Soal Ular Tangga */}
            <button
              onClick={() => {
                setActiveTab('bank-ular-tangga');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 text-xs flex items-center justify-start gap-2.5 transition-all text-left ${
                activeTab === 'bank-ular-tangga'
                  ? 'bg-[#2271b1] text-white font-bold'
                  : 'text-[#c3c4c7] hover:bg-[#13171a] hover:text-[#72aee6]'
              }`}
              title="Bank Soal Ular Tangga (Bisa Diedit Guru)"
            >
              <Dice6 className="w-4 h-4 shrink-0 text-teal-400" />
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 truncate">Soal Ular Tangga</span>
                  <span className="text-[9px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-1 rounded font-bold">
                    Edit
                  </span>
                </>
              )}
            </button>

            {/* 10. Bank Soal Tebak Gambar */}
            <button
              onClick={() => {
                setActiveTab('bank-tebak-gambar');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 text-xs flex items-center justify-start gap-2.5 transition-all text-left ${
                activeTab === 'bank-tebak-gambar'
                  ? 'bg-[#2271b1] text-white font-bold'
                  : 'text-[#c3c4c7] hover:bg-[#13171a] hover:text-[#72aee6]'
              }`}
              title="Bank Soal Tebak Gambar (Bisa Diedit Guru)"
            >
              <ImageIcon className="w-4 h-4 shrink-0 text-rose-400" />
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 truncate">Soal Tebak Gambar</span>
                  <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1 rounded font-bold">
                    Edit
                  </span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="border-t border-[#3c434a] my-2 mx-2" />

            {/* Export Excel Tool */}
            <button
              onClick={() => exportRecapToExcel(submissions, selectedClass, settings.kkmScore, kopSurat)}
              className="w-full px-3 py-2 text-xs flex items-center justify-start gap-2.5 text-[#c3c4c7] hover:bg-[#13171a] hover:text-emerald-400 transition-all text-left"
              title="Download Rekap Nilai ke Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
              {!isSidebarCollapsed && <span className="flex-1 truncate">Export Excel</span>}
            </button>

            {/* Print Laporan Tool */}
            <button
              onClick={() => {
                setPrintModalClass(selectedClass);
                setShowPrintModal(true);
              }}
              className="w-full px-3 py-2 text-xs flex items-center justify-start gap-2.5 text-[#c3c4c7] hover:bg-[#13171a] hover:text-white transition-all text-left cursor-pointer"
              title="Cetak & Print Rekap Nilai Format A4"
            >
              <Printer className="w-4 h-4 text-blue-400 shrink-0" />
              {!isSidebarCollapsed && <span className="flex-1 truncate">Cetak & Print (A4)</span>}
            </button>
          </div>

          {/* Bottom Sidebar: Collapse Menu Button */}
          <div className="border-t border-[#3c434a] p-2 hidden md:block">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full px-2.5 py-1.5 text-[11px] text-[#c3c4c7] hover:text-[#72aee6] hover:bg-[#13171a] rounded flex items-center gap-2 transition-colors text-left"
              title={isSidebarCollapsed ? 'Perluas Menu' : 'Sembunyikan Menu'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 shrink-0" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span>Collapse Menu</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Right Main Content Area (Light Gray #f0f0f1) */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Top Page Header (WordPress style) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1d2327]">
                {activeTab === 'rekap' && 'Rekap dan Cetak Nilai Siswa'}
                {activeTab === 'buat-soal-ai' && 'Bank Soal dengan AI (Gemini)'}
                {activeTab === 'input-siswa' && 'Manajemen Data Siswa'}
                {activeTab === 'analisis' && 'Analisis Butir Soal'}
                {activeTab === 'pengaturan' && 'Batasan & Pengaturan Ujian'}
                {activeTab === 'kop-surat' && 'Pengaturan Kop Surat & Lembar Cetak'}
                {activeTab === 'monitoring' && 'Monitoring Anti-Curang & Log Siswa'}
                {activeTab === 'game-labirin' && 'Permainan Labirin & Pilihan Tingkatan Kelas SMP'}
              </h1>
              <p className="text-xs text-[#646970] mt-0.5">
                Chapter 1: Introducing my self and other (Descriptive Text) • SMP Kelas VII
              </p>
            </div>

            {/* Screen Options & Help dropdown badges */}
            <div className="flex items-center gap-1.5 self-start sm:self-center">
              <button
                onClick={() => setShowScreenOptions(!showScreenOptions)}
                className="text-[11px] bg-white border border-[#c3c4c7] text-[#2c3338] px-2.5 py-1 rounded shadow-2xs font-medium hover:bg-[#f6f7f7] flex items-center gap-1"
              >
                <span>Screen Options</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-[11px] bg-white border border-[#c3c4c7] text-[#2c3338] px-2.5 py-1 rounded shadow-2xs font-medium hover:bg-[#f6f7f7] flex items-center gap-1"
              >
                <span>Help</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Expandable Screen Options / Help Drawer if opened */}
          {showScreenOptions && (
            <div className="bg-white border border-[#c3c4c7] p-3 rounded text-xs space-y-1 text-[#2c3338]">
              <p className="font-bold">Pengaturan Tampilan Kolom:</p>
              <p className="text-slate-500 text-[11px]">
                Semua widget portal guru aktif: Status Kuis, Total Peserta, Rata-rata Nilai, dan Bank Soal.
              </p>
            </div>
          )}

          {showHelp && (
            <div className="bg-white border border-[#c3c4c7] p-3 rounded text-xs space-y-1 text-[#2c3338]">
              <p className="font-bold">Bantuan Penggunaan Dashboard Guru:</p>
              <p className="text-slate-500 text-[11px]">
                Gunakan menu di sebelah kiri untuk berpindah modul: Rekapitulasi nilai, Generator soal AI, Input data siswa, Analisis soal, dan Pengaturan kuota.
              </p>
            </div>
          )}

          {/* WordPress Dashboard Widgets Grid (Site Health & At a Glance style) - Only on Rekap tab */}
          {activeTab === 'rekap' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Widget 1: Site Health / Status Kuis */}
              <div className="bg-white border border-[#c3c4c7] shadow-xs p-3.5 flex items-center gap-3 rounded">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center text-emerald-600 bg-emerald-50 shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-[#646970]">Status Kuis</p>
                  <p className="text-sm font-bold text-[#1d2327]">Kondisi Baik</p>
                  <p className="text-[11px] text-[#646970]">
                    KKM: <strong className="text-emerald-700">{settings.kkmScore}</strong> • Kelas: {selectedClass}
                  </p>
                </div>
              </div>

              {/* Widget 2: Total Peserta */}
              <div className="bg-white border border-[#c3c4c7] shadow-xs p-3.5 flex items-center gap-3 rounded">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2271b1] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-[#646970]">Total Peserta</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-[#1d2327]">{totalSubmissions}</span>
                    <span className="text-xs text-[#646970]">siswa</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    Tuntas: {passedSubmissions} ({passRate}%)
                  </p>
                </div>
              </div>

              {/* Widget 3: Rata-rata Skor */}
              <div className="bg-white border border-[#c3c4c7] shadow-xs p-3.5 flex items-center gap-3 rounded">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-[#646970]">Rata-Rata Nilai</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-[#1d2327]">{averageScore}</span>
                    <span className="text-xs text-[#646970]">/ 100</span>
                  </div>
                  <p className="text-[11px] text-[#646970]">
                    Tertinggi: <strong className="text-slate-800">{highestScore}</strong>
                  </p>
                </div>
              </div>

              {/* Widget 4: Database Siswa */}
              <div
                onClick={() => setActiveTab('input-siswa')}
                className="bg-white border border-[#c3c4c7] hover:border-indigo-400 shadow-xs p-3.5 flex items-center gap-3 rounded cursor-pointer transition-colors"
                title="Klik untuk Kelola Data Siswa"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-[#646970]">Database Siswa</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-[#1d2327]">{studentsMaster.length}</span>
                    <span className="text-xs text-[#646970]">siswa terdata</span>
                  </div>
                  <p className="text-[11px] text-indigo-700 font-semibold hover:underline">
                    Kelola Data Siswa
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Tab Content: Buat Soal dengan AI */}
          {activeTab === 'buat-soal-ai' && (
            <AiQuestionGenerator
              currentQuestions={questions}
              onSaveQuestions={onSaveQuestions}
            />
          )}

      {/* Tab Content: Rekap Nilai Siswa */}
      {activeTab === 'rekap' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Semua Kelas">Semua Kelas</option>
                {['7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H'].map((cls) => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </select>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama siswa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setPrintModalClass(selectedClass);
                  setShowPrintModal(true);
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Buka Menu Cetak & Print Laporan Nilai A4"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Rekap dan Cetak</span>
              </button>

              <button
                type="button"
                onClick={() => exportRecapToExcel(submissions, selectedClass, settings.kkmScore, kopSurat)}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Download Rekap Nilai ke Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Excel</span>
              </button>

              {submissions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearAllModal(true)}
                  className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan Rekap</span>
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">Belum ada data nilai kuis peserta didik.</p>
              <p className="text-xs text-slate-400 mt-1">Data siswa yang mengerjakan kuis akan otomatis tersimpan dan muncul di sini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">No</th>
                    <th className="py-3 px-3 text-center w-16">Absen</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-3 text-center w-20">Kelas</th>
                    <th className="py-3 px-3 text-center w-20">Nilai</th>
                    <th className="py-3 px-3 text-center w-28">Status</th>
                    <th className="py-3 px-3 text-center w-24">Benar/Soal</th>
                    <th className="py-3 px-3 text-center w-20">Durasi</th>
                    <th className="py-3 px-4 text-center w-36">Waktu Selesai</th>
                    <th className="py-3 px-3 text-center w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSubmissions.map((sub, idx) => (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">{sub.attendanceNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{sub.name}</td>
                      <td className="py-3 px-3 text-center font-bold text-indigo-700 bg-indigo-50/30">{sub.className}</td>
                      <td className="py-3 px-3 text-center font-extrabold text-slate-900 text-sm">{sub.score}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.score >= settings.kkmScore
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {sub.score >= settings.kkmScore ? 'TUNTAS' : 'REMEDIAL'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600">{sub.correctAnswersCount} / {sub.totalQuestions}</td>
                      <td className="py-3 px-3 text-center text-slate-500">{Math.round(sub.timeSpentSeconds / 60)} mnt</td>
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">{sub.submittedAt}</td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => printSingleStudentCertificate(sub, settings.kkmScore, kopSurat)}
                            title="Cetak Bukti Nilai Siswa Ini (A4)"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(sub.id)}
                            title="Hapus Nilai Permanen"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Input Data Siswa (File/Manual) */}
      {activeTab === 'input-siswa' && (
        <TeacherInputStudent
          studentsMaster={studentsMaster}
          onSaveMaster={onSaveMaster}
          onImportSuccess={(count) => {
            // Optional callback
          }}
        />
      )}

      {/* Tab Content: Analisis Butir Soal */}
      {activeTab === 'analisis' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Analisis Tingkat Penguasaan Materi Butir Soal (1–10)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan persentase ketepatan jawaban peserta didik pada setiap butir soal untuk evaluasi pembelajaran remedial/pengayaan.
            </p>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => {
              const totalAttempted = submissions.length;
              const correctCount = submissions.filter((s) => s.answers[q.id] === q.correctAnswer).length;
              const correctPct = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

              return (
                <div key={`analysis-${q.id}-${idx}`} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Soal {idx + 1}: {q.topic}
                    </span>
                    <span className="font-bold text-indigo-700">
                      {correctCount} / {totalAttempted} Siswa Benar ({correctPct}%)
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">{q.question}</p>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        correctPct >= 75 ? 'bg-emerald-500' : correctPct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${correctPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content: Pengaturan Kuis */}
      {activeTab === 'pengaturan' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">Batasan Pengerjaan Siswa & Pengaturan Ujian</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur kuota pengerjaan, batas waktu durasi, dan keamanan anti-curang ujian.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Kelas Yang Aktif / Ditugaskan:
                </label>
                <select
                  value={settings.activeClass || 'Semua Kelas'}
                  onChange={(e) => onSaveSettings({ ...settings, activeClass: e.target.value })}
                  className="w-full px-3 py-2 bg-indigo-50/70 border border-indigo-300 rounded-xl text-xs font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Semua Kelas">Semua Kelas (7A s.d. 7H)</option>
                  {['7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H'].map((cls) => (
                    <option key={cls} value={cls}>
                      Khusus Kelas {cls} Saja
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Jika guru memilih kelas tertentu (misal: 7A), maka di dashboard utama siswa hanya nama-nama siswa kelas tersebut yang akan muncul.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Batas Pengerjaan per Siswa:
                </label>
                <select
                  value={settings.maxAttempts}
                  onChange={(e) => onSaveSettings({ ...settings, maxAttempts: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={1}>1 Kali Pengerjaan (Default Ujian)</option>
                  <option value={2}>2 Kali Pengerjaan</option>
                  <option value={3}>3 Kali Pengerjaan</option>
                  <option value={0}>Tanpa Batas (Mode Latihan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Batas Waktu Pengerjaan (Timer):
                </label>
                <select
                  value={settings.timeLimitMinutes}
                  onChange={(e) => onSaveSettings({ ...settings, timeLimitMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={0}>Tanpa Batas Waktu</option>
                  <option value={15}>15 Menit</option>
                  <option value={20}>20 Menit (Standar)</option>
                  <option value={30}>30 Menit</option>
                  <option value={45}>45 Menit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nilai Standar KKM:
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={settings.kkmScore}
                  onChange={(e) => onSaveSettings({ ...settings, kkmScore: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-800">Acak Urutan Soal (Shuffle Questions)</p>
                  <p className="text-[11px] text-slate-500">Nomor urut 1–10 diacak berbeda untuk setiap siswa</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.shuffleQuestions}
                  onChange={(e) => onSaveSettings({ ...settings, shuffleQuestions: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-800">Acak Pilihan Ganda (Shuffle A-B-C-D)</p>
                  <p className="text-[11px] text-slate-500">Posisi opsi jawaban diacak agar siswa tidak bisa saling contek</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.shuffleOptions}
                  onChange={(e) => onSaveSettings({ ...settings, shuffleOptions: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-800">Proteksi Anti-Pindah Tab (Anti-Cheating)</p>
                  <p className="text-[11px] text-slate-500">Kirim notifikasi pelanggaran ke guru jika siswa membuka tab lain</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableAntiCheating}
                  onChange={(e) => onSaveSettings({ ...settings, enableAntiCheating: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-800">Putar Audio Listening Otomatis</p>
                  <p className="text-[11px] text-slate-500">Otomatis membacakan soal listening saat dibuka</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoPlayAudio}
                  onChange={(e) => onSaveSettings({ ...settings, autoPlayAudio: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-800">Kunci Modul Belajar Setelah 1x Buka</p>
                  <p className="text-[11px] text-slate-500">Mencegah siswa membaca modul belajar berulang kali saat ujian</p>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  1 User 1 Kali Lihat
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Pengaturan Kop Surat */}
      {activeTab === 'kop-surat' && (
        <KopSuratSettings
          kopSurat={kopSurat}
          onSaveKopSurat={handleSaveKopSurat}
          submissions={submissions}
          kkmScore={settings.kkmScore}
        />
      )}

      {/* Tab Content: Game Labirin SMP */}
      {activeTab === 'game-labirin' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          {/* Top Bar with Launch Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-amber-500" />
                <span>Pengaturan Game Labirin & Pilihan Tingkat Kelas SMP</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Guru dapat memilih tingkatan kelas (Kelas 7, 8, atau 9 SMP) untuk menyesuaikan tingkat kesulitan dan topik soal Bahasa Inggris yang muncul di gerbang labirin.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onOpenSnakeLadderPlay && (
                <button
                  type="button"
                  onClick={onOpenSnakeLadderPlay}
                  className="px-3.5 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>🎲 Main Ular Tangga</span>
                </button>
              )}

              {onOpenMazePlay && (
                <button
                  type="button"
                  onClick={onOpenMazePlay}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Gamepad2 className="w-4 h-4 text-amber-200" />
                  <span>Main Labirin</span>
                </button>
              )}

              {onOpenPictureMatchPlay && (
                <button
                  type="button"
                  onClick={onOpenPictureMatchPlay}
                  className="px-3.5 py-2 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>🖼️ Tebak Gambar</span>
                </button>
              )}
            </div>
          </div>

          {/* Setting 1: Grade Level Selection Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                1. Tingkatan Kelas yang Ditugaskan ke Siswa:
              </label>
              <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                Aktif Saat Ini: Kelas {mazeConfig.activeGrade === 'all' ? 'Semua (7–9)' : mazeConfig.activeGrade} SMP
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  grade: '7' as SmpGradeLevel,
                  title: 'Kelas VII (7) SMP',
                  subtitle: 'Kurikulum Merdeka - Fase D',
                  topics: ['Introducing Myself & Others', 'Pronouns & Subject Verb Agreement', 'Describing Physical Appearance', 'Procedure Text Imperatives'],
                  color: 'indigo',
                },
                {
                  grade: '8' as SmpGradeLevel,
                  title: 'Kelas VIII (8) SMP',
                  subtitle: 'Kurikulum Merdeka - Fase D',
                  topics: ['Recount Text & Past Events', 'Asking & Giving Opinions', 'Modals (Must & Should)', 'Degrees of Comparison (Faster, Highest)'],
                  color: 'amber',
                },
                {
                  grade: '9' as SmpGradeLevel,
                  title: 'Kelas IX (9) SMP',
                  subtitle: 'Kurikulum Merdeka - Fase D',
                  topics: ['Narrative Text & Legends', 'Passive Voice (Present & Past)', 'Report Text Scientific Facts', 'Present Perfect & Conjunctions'],
                  color: 'emerald',
                },
              ].map((item) => {
                const isSelected = mazeConfig.activeGrade === item.grade;

                return (
                  <div
                    key={item.grade}
                    onClick={() => {
                      if (onSaveMazeConfig) {
                        onSaveMazeConfig({ ...mazeConfig, activeGrade: item.grade });
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-slate-800">{item.title}</span>
                        {isSelected ? (
                          <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
                            Dipilih Guru ★
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold">Klik untuk Pilih</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{item.subtitle}</p>
                    </div>

                    <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200/80 text-[11px] text-slate-600">
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Fokus Materi Gerbang:</span>
                      {item.topics.map((t, idx) => (
                        <p key={idx} className="flex items-center gap-1.5 leading-tight">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span>{t}</span>
                        </p>
                      ))}
                    </div>

                    <button
                      type="button"
                      className={`w-full py-1.5 rounded-xl font-bold text-xs transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {isSelected ? '✓ Tingkat Kelas Aktif' : `Tugaskan Kelas ${item.grade}`}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* All Grades Option */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-800">Mode Campuran (Semua Kelas 7, 8, dan 9):</p>
                <p className="text-[11px] text-slate-500">
                  Gerbang labirin akan mengacak pertanyaan dari seluruh jenjang SMP Kelas 7, 8, dan 9 untuk menguji pemahaman komprehensif.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onSaveMazeConfig) {
                    onSaveMazeConfig({ ...mazeConfig, activeGrade: 'all' });
                  }
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  mazeConfig.activeGrade === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {mazeConfig.activeGrade === 'all' ? '✓ Mode Campuran Aktif' : 'Gunakan Mode Campuran'}
              </button>
            </div>
          </div>

          {/* Setting 2: Grid Size & Permissions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            {/* Difficulty */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                2. Tingkat Kerumitan & Jumlah Gerbang:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'easy', label: 'Mudah', size: '11 x 11', desc: '3 Gerbang Soal' },
                  { id: 'medium', label: 'Sedang', size: '15 x 15', desc: '4 Gerbang Soal' },
                  { id: 'hard', label: 'Tantangan', size: '19 x 19', desc: '5 Gerbang Soal' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      if (onSaveMazeConfig) {
                        onSaveMazeConfig({ ...mazeConfig, difficulty: d.id as any });
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      mazeConfig.difficulty === d.id
                        ? 'border-indigo-600 bg-white text-indigo-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span className="text-xs">{d.label}</span>
                    <span className="text-[10px] text-slate-500">{d.size}</span>
                    <span className="text-[9px] text-amber-600 font-bold">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Permission for student grade change */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  3. Izin Akses Tingkat Kelas Siswa:
                </label>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Atur apakah siswa diizinkan berpindah tingkat kelas secara mandiri di game, atau wajib terkunci mengikuti pilihan guru.
                </p>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-xs font-semibold text-slate-700">
                  {mazeConfig.allowStudentGradeChange
                    ? 'Siswa Bebas Memilih Tingkat Kelas'
                    : 'Terkunci Khusus Pilihan Guru'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onSaveMazeConfig) {
                      onSaveMazeConfig({
                        ...mazeConfig,
                        allowStudentGradeChange: !mazeConfig.allowStudentGradeChange,
                      });
                    }
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    mazeConfig.allowStudentGradeChange
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  {mazeConfig.allowStudentGradeChange ? 'Bebas (Klik untuk Kunci)' : 'Terkunci (Klik untuk Buka)'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Bank Soal Gerbang Labirin SMP Preview */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Pratinjau Bank Soal Gerbang Labirin ({SMP_MAZE_QUESTIONS.length} Butir Soal Terintegrasi)
                </h4>
                <p className="text-xs text-slate-500">
                  Soal-soal kurikulum SMP yang otomatis diacak pada gerbang labirin sesuai tingkat kelas yang dipilih.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {SMP_MAZE_QUESTIONS.slice(0, 12).map((q, idx) => (
                <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-indigo-700">
                      Soal #{idx + 1} • Kelas {q.grade} SMP
                    </span>
                    <span className="text-slate-400 font-semibold">{q.topic}</span>
                  </div>
                  <p className="text-slate-700 font-medium line-clamp-2">{q.question}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    Kunci: {String.fromCharCode(65 + q.correctAnswer)}. {q.options[q.correctAnswer]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Hall of Fame / Completion Records */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Daftar Siswa Penakluk Labirin (Hall of Fame)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Mencatat siswa yang berhasil menyelesaikan labirin, waktu tercepat, dan perolehan bintang.
                </p>
              </div>

              {mazeCompletions.length > 0 && onClearMazeCompletions && (
                <button
                  type="button"
                  onClick={onClearMazeCompletions}
                  className="px-3 py-1 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer"
                >
                  Kosongkan Riwayat Game
                </button>
              )}
            </div>

            {mazeCompletions.length === 0 ? (
              <div className="py-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                <Gamepad2 className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="font-bold text-slate-700">Belum Ada Riwayat Penyelesaian Labirin</p>
                <p className="text-[11px]">Siswa yang berhasil menyelesaikan petualangan labirin akan otomatis tercatat di sini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-12">No</th>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3 text-center w-20">Kelas</th>
                      <th className="py-2.5 px-3 text-center w-28">Tingkat Dimainkan</th>
                      <th className="py-2.5 px-3 text-center w-24">Waktu</th>
                      <th className="py-2.5 px-3 text-center w-24">Bintang</th>
                      <th className="py-2.5 px-3 text-center w-24">Skor XP</th>
                      <th className="py-2.5 px-4 text-center w-36">Tanggal Selesai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {mazeCompletions.map((rec, i) => (
                      <tr key={rec.id || i} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-400">{i + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{rec.studentName}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-indigo-700 bg-indigo-50/30">
                          {rec.className}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                          Kelas {rec.gradePlayed} SMP
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-600">
                          {Math.floor(rec.timeSpentSeconds / 60)}m {rec.timeSpentSeconds % 60}s
                        </td>
                        <td className="py-2.5 px-3 text-center text-amber-500 font-bold">
                          {'★'.repeat(rec.starsCount)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-extrabold text-emerald-700">
                          {rec.score} XP
                        </td>
                        <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                          {rec.completedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Bank Soal Ular Tangga */}
      {activeTab === 'bank-ular-tangga' && (
        <TeacherSnakeLadderQuestions
          questions={snakeLadderQuestions}
          onSaveQuestions={onSaveSnakeLadderQuestions || (() => {})}
          onOpenSnakeLadderPlay={onOpenSnakeLadderPlay}
        />
      )}

      {/* Tab Content: Bank Soal Tebak Gambar */}
      {activeTab === 'bank-tebak-gambar' && (
        <TeacherPictureCards
          cards={pictureCards}
          onSaveCards={onSavePictureCards || (() => {})}
          records={pictureMatchRecords}
          onClearRecords={onClearPictureMatchRecords}
          onOpenPictureMatchPlay={onOpenPictureMatchPlay}
        />
      )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800">Hapus Rekap Nilai Siswa?</h3>
            <p className="text-xs text-slate-500">
              Tindakan ini akan menghapus data nilai siswa ini secara permanen dari rekapitulasi.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">Kosongkan Seluruh Rekap?</h3>
              <p className="text-xs text-slate-500">
                PERINGATAN: Tindakan ini akan menghapus seluruh data riwayat ujian ({submissions.length} siswa) secara permanen.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowClearAllModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowClearAllModal(false);
                  onClearAllSubmissions();
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Ya, Kosongkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK & PRINT REKAP NILAI (A4 PREVIEW) */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/80 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Menu Cetak & Print Rekapitulasi Nilai</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                      Standar A4
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pratinjau resmi sebelum dicetak ke printer fisik atau disimpan sebagai PDF (Kertas A4).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter & Action Controls inside Modal */}
            <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 shrink-0">Pilih Rombel / Kelas:</span>
                <select
                  value={printModalClass}
                  onChange={(e) => setPrintModalClass(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Semua Kelas">Semua Kelas</option>
                  {['7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H'].map((cls) => (
                    <option key={cls} value={cls}>Kelas {cls}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setShowPrintModal(false);
                    setActiveTab('kop-surat');
                  }}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Ubah identitas kop surat, logo sekolah, atau nama guru"
                >
                  <FileSignature className="w-3.5 h-3.5" />
                  <span>Edit Kop Surat & TTD</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportRecapToExcel(submissions, printModalClass, settings.kkmScore, kopSurat)}
                  className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Unduh File Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => printClassRecap(submissions, printModalClass, settings.kkmScore, kopSurat)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  title="Cetak Sekarang ke Printer atau Simpan PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Print Sekarang (A4)</span>
                </button>
              </div>
            </div>

            {/* Document Preview Paper (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
              {/* Paper representation */}
              <div className="max-w-[780px] mx-auto bg-white rounded-lg shadow-md border border-slate-200 p-6 sm:p-8 text-slate-900 font-serif space-y-4">
                {/* Kop Surat */}
                <div className="border-b-2 border-double border-slate-900 pb-3">
                  <div className="flex items-center justify-center gap-4">
                    {kopSurat.showLogo && kopSurat.logoUrl && (
                      <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                        <img src={kopSurat.logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
                      </div>
                    )}
                    <div className="text-center flex-1">
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider m-0 leading-tight">
                        {kopSurat.instansiInduk}
                      </h2>
                      <h4 className="text-[11px] sm:text-xs font-semibold uppercase m-0 leading-tight mt-0.5">
                        {kopSurat.dinasPendidikan}
                      </h4>
                      <h3 className="text-sm sm:text-base font-extrabold uppercase m-0 leading-tight mt-1">
                        {kopSurat.namaSekolah}
                      </h3>
                      <p className="text-[9.5px] font-sans text-slate-600 m-0 mt-1">
                        {kopSurat.alamatSekolah}
                      </p>
                      <p className="text-[9px] font-sans text-slate-500 m-0">
                        {kopSurat.kontakSekolah}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center py-1">
                  <h4 className="text-xs sm:text-sm font-bold uppercase underline tracking-wide m-0">
                    {kopSurat.judulLaporan}
                  </h4>
                  <p className="text-[10px] font-sans italic text-slate-500 m-0 mt-0.5">
                    {kopSurat.subJudulLaporan}
                  </p>
                </div>

                {/* Meta Information */}
                {(() => {
                  const modalFiltered = (printModalClass === 'Semua Kelas'
                    ? submissions
                    : submissions.filter((s) => s.className === printModalClass)
                  ).sort((a, b) => {
                    if (a.className !== b.className) return a.className.localeCompare(b.className);
                    return a.attendanceNumber - b.attendanceNumber;
                  });

                  const modalTotal = modalFiltered.length;
                  const modalPassed = modalFiltered.filter((s) => s.score >= settings.kkmScore).length;
                  const modalPassRate = modalTotal > 0 ? ((modalPassed / modalTotal) * 100).toFixed(1) : '0';
                  const modalAvg = modalTotal > 0
                    ? (modalFiltered.reduce((sum, s) => sum + s.score, 0) / modalTotal).toFixed(1)
                    : '0';
                  const modalHighest = modalTotal > 0 ? Math.max(...modalFiltered.map(s => s.score)) : 0;
                  const modalLowest = modalTotal > 0 ? Math.min(...modalFiltered.map(s => s.score)) : 0;

                  return (
                    <div className="space-y-3 font-sans text-xs">
                      <div className="grid grid-cols-2 gap-2 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div>
                          <p><strong>Mata Pelajaran:</strong> {kopSurat.mataPelajaran}</p>
                          <p><strong>Lingkup Materi:</strong> {kopSurat.materiPokok}</p>
                          <p><strong>Rombel / Kelas:</strong> {printModalClass}</p>
                          <p><strong>Standar KKM:</strong> {settings.kkmScore}</p>
                        </div>
                        <div>
                          <p><strong>Titimangsa:</strong> {kopSurat.kotaPenerbit}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          <p><strong>Tahun / Semester:</strong> {kopSurat.tahunPelajaran} • {kopSurat.semester}</p>
                          <p><strong>Total Peserta:</strong> {modalTotal} Siswa</p>
                          <p><strong>Rata-rata:</strong> {modalAvg} (Tertinggi: {modalHighest} / Terendah: {modalLowest})</p>
                        </div>
                      </div>

                      <div className="p-2 bg-slate-50 rounded border border-slate-200 font-bold">
                        <span>Ketuntasan Belajar: </span>
                        <span className="text-emerald-700">{modalPassed} Tuntas</span> • <span className="text-rose-700">{modalTotal - modalPassed} Remedial</span> ({modalPassRate}% Ketuntasan Klasikal)
                      </div>

                      {/* Preview Table */}
                      <div className="overflow-x-auto border border-slate-300 rounded">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-100 font-bold border-b border-slate-300">
                            <tr>
                              <th className="p-2 text-center w-8">No</th>
                              <th className="p-2 text-center w-12">Absen</th>
                              <th className="p-2">Nama Siswa</th>
                              <th className="p-2 text-center w-14">Kelas</th>
                              <th className="p-2 text-center w-14">Nilai</th>
                              <th className="p-2 text-center w-20">Status</th>
                              <th className="p-2 text-center w-20">Benar/Soal</th>
                              <th className="p-2 text-center w-24">Waktu Selesai</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {modalFiltered.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                                  Belum ada data nilai kuis untuk rombel {printModalClass}.
                                </td>
                              </tr>
                            ) : (
                              modalFiltered.map((sub, idx) => (
                                <tr key={sub.id} className="hover:bg-slate-50">
                                  <td className="p-1.5 text-center text-slate-400">{idx + 1}</td>
                                  <td className="p-1.5 text-center font-bold text-slate-700">{sub.attendanceNumber}</td>
                                  <td className="p-1.5 font-bold text-slate-800">{sub.name}</td>
                                  <td className="p-1.5 text-center font-bold text-indigo-700">{sub.className}</td>
                                  <td className="p-1.5 text-center font-extrabold text-slate-900">{sub.score}</td>
                                  <td className="p-1.5 text-center">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      sub.score >= settings.kkmScore
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}>
                                      {sub.score >= settings.kkmScore ? 'TUNTAS' : 'REMEDIAL'}
                                    </span>
                                  </td>
                                  <td className="p-1.5 text-center text-slate-600">{sub.correctAnswersCount}/{sub.totalQuestions}</td>
                                  <td className="p-1.5 text-center text-slate-500 text-[10px]">{sub.submittedAt}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Tanda Tangan */}
                      <div className="pt-6 grid grid-cols-2 gap-4 text-center font-serif text-xs">
                        <div>
                          <p>Mengetahui,</p>
                          <p className="font-bold">{kopSurat.jabatanPimpinan}</p>
                          <div className="h-14" />
                          <p className="font-bold">{kopSurat.namaPimpinan}</p>
                          <p className="text-[11px] text-slate-500">NIP. {kopSurat.nipPimpinan}</p>
                        </div>
                        <div>
                          <p>{kopSurat.kotaPenerbit}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          <p className="font-bold">{kopSurat.jabatanGuru}</p>
                          <div className="h-14" />
                          <p className="font-bold">{kopSurat.namaGuru}</p>
                          <p className="text-[11px] text-slate-500">NIP. {kopSurat.nipGuru}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-200 bg-white rounded-b-3xl flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => printClassRecap(submissions, printModalClass, settings.kkmScore, kopSurat)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Print Laporan ({printModalClass})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
