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
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import {
  StudentSubmission,
  StudentMasterData,
  Question,
  QuizSettings,
  ProcedureTextItem,
  ViolationRecord,
} from '../types';
import { exportRecapToExcel, printClassRecap } from '../utils/printReport';
import { TeacherInputStudent } from './TeacherInputStudent';
import { AiQuestionGenerator } from './AiQuestionGenerator';

interface TeacherDashboardProps {
  submissions: StudentSubmission[];
  studentsMaster: StudentMasterData[];
  questions: Question[];
  settings: QuizSettings;
  procedureTexts: ProcedureTextItem[];
  violations: ViolationRecord[];
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
  onSaveSettings,
  onSaveMaster,
  onSaveQuestions,
  onDeleteSubmission,
  onClearAllSubmissions,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'rekap' | 'buat-soal-ai' | 'input-siswa' | 'analisis' | 'pengaturan'>('rekap');
  const [selectedClass, setSelectedClass] = useState<string>('Semua Kelas');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState<boolean>(false);
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
            onClick={() => exportRecapToExcel(submissions, selectedClass, settings.kkmScore)}
            className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-[#2c3338] hover:bg-[#3c434a] text-emerald-400 font-semibold rounded text-[11px] transition-colors"
            title="Download Excel"
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => printClassRecap(submissions, selectedClass, settings.kkmScore)}
            className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-[#2c3338] hover:bg-[#3c434a] text-slate-200 font-semibold rounded text-[11px] transition-colors"
            title="Cetak Laporan A4"
          >
            <Printer className="w-3 h-3" />
            <span>Cetak A4</span>
          </button>

          {/* User profile */}
          <div className="flex items-center gap-1.5 text-[#c3c4c7] hover:text-white cursor-default">
            <span>Howdy, <strong className="text-white font-semibold">Ibu Eli Ermawati, S.Pd.</strong></span>
            <div className="w-5 h-5 rounded-full bg-[#3c434a] flex items-center justify-center text-slate-200 font-bold text-[10px]">
              E
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
            {/* 1. Dashboard / Rekap Nilai Siswa */}
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
                title="Dashboard & Rekap Nilai Siswa"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && (
                  <>
                    <span className="flex-1 truncate">Dashboard</span>
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

            {/* 3. Input Data Siswa */}
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
              title="Input Data Siswa"
            >
              <Upload className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 truncate">Input Data Siswa</span>
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

            {/* Divider */}
            <div className="border-t border-[#3c434a] my-2 mx-2" />

            {/* Export Excel Tool */}
            <button
              onClick={() => exportRecapToExcel(submissions, selectedClass, settings.kkmScore)}
              className="w-full px-3 py-2 text-xs flex items-center justify-start gap-2.5 text-[#c3c4c7] hover:bg-[#13171a] hover:text-emerald-400 transition-all text-left"
              title="Download Rekap Nilai ke Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
              {!isSidebarCollapsed && <span className="flex-1 truncate">Export Excel</span>}
            </button>

            {/* Print Laporan Tool */}
            <button
              onClick={() => printClassRecap(submissions, selectedClass, settings.kkmScore)}
              className="w-full px-3 py-2 text-xs flex items-center justify-start gap-2.5 text-[#c3c4c7] hover:bg-[#13171a] hover:text-white transition-all text-left"
              title="Cetak Rekap Nilai Format A4"
            >
              <Printer className="w-4 h-4 text-blue-400 shrink-0" />
              {!isSidebarCollapsed && <span className="flex-1 truncate">Cetak Laporan (A4)</span>}
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
                {activeTab === 'rekap' && 'Dashboard Rekap Nilai Siswa'}
                {activeTab === 'buat-soal-ai' && 'Bank Soal dengan AI (Gemini)'}
                {activeTab === 'input-siswa' && 'Input & Manajemen Data Siswa'}
                {activeTab === 'analisis' && 'Analisis Butir Soal'}
                {activeTab === 'pengaturan' && 'Batasan & Pengaturan Ujian'}
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

          {/* WordPress Dashboard Widgets Grid (Site Health & At a Glance style) */}
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

            {/* Widget 4: Database Siswa & Bank Soal */}
            <div className="bg-white border border-[#c3c4c7] shadow-xs p-3.5 flex items-center gap-3 rounded">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-bold text-[#646970]">Bank Soal Aktif</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-[#1d2327]">{questions.length}</span>
                  <span className="text-xs text-[#646970]">butir soal</span>
                </div>
                <p className="text-[11px] text-indigo-700 font-medium">
                  {studentsMaster.length} siswa terdaftar
                </p>
              </div>
            </div>
          </div>
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

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setActiveTab('input-siswa')}
                className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl border border-indigo-200/60 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Input Data Siswa</span>
              </button>

              {submissions.length > 0 && (
                <button
                  onClick={() => setShowClearAllModal(true)}
                  className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl border border-rose-200 transition-all flex items-center gap-1.5"
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
                        <button
                          onClick={() => setDeleteConfirmId(sub.id)}
                          title="Hapus Nilai Permanen"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
    </div>
  );
};
