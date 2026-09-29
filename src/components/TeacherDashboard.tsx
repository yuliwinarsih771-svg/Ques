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
  const [activeTab, setActiveTab] = useState<'rekap' | 'input-siswa' | 'analisis' | 'pengaturan'>('rekap');
  const [selectedClass, setSelectedClass] = useState<string>('Semua Kelas');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200/60 rounded-full text-xs font-bold text-indigo-700 mb-2">
            Portal Guru • Eli Ermawati, S.Pd.
          </div>
          <h1 className="text-2xl font-black text-slate-800">Dashboard Pengajar & Rekap Nilai</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Materi: Chapter 1: Introducing my self and other (Descriptive Text) • Kelas VII SMP
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportRecapToExcel(submissions, selectedClass, settings.kkmScore)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xls)</span>
          </button>

          <button
            onClick={() => printClassRecap(submissions, selectedClass, settings.kkmScore)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all"
          >
            Tutup Portal
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Total Peserta</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{totalSubmissions}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{selectedClass}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Rata-rata Kelas</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{averageScore}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Skala 0 - 100</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Ketuntasan (KKM 75)</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{passRate}%</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{passedSubmissions} Siswa Tuntas</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Nilai Tertinggi</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{highestScore}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Skor Maksimal</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Nilai Terendah</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{lowestScore}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Perlu Remedial</p>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('rekap')}
          className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'rekap'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Rekap Nilai Siswa</span>
        </button>

        <button
          onClick={() => setActiveTab('input-siswa')}
          className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'input-siswa'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload className="w-4 h-4 text-emerald-600" />
          <span>Input Data Siswa (File/Manual)</span>
        </button>

        <button
          onClick={() => setActiveTab('analisis')}
          className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'analisis'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analisis Butir Soal</span>
        </button>

        <button
          onClick={() => setActiveTab('pengaturan')}
          className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'pengaturan'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Batasan & Pengaturan Kuis</span>
        </button>
      </div>

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
                  onClick={() => {
                    if (window.confirm('PERINGATAN: Yakin ingin mengosongkan seluruh riwayat nilai siswa secara permanen?')) {
                      onClearAllSubmissions();
                    }
                  }}
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
                <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
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
    </div>
  );
};
