import React, { useState } from 'react';
import { Play, Sparkles, BookOpen, Clock, AlertTriangle, ShieldCheck, UserCheck, Lock } from 'lucide-react';
import { QuizSettings, StudentProfile, StudentMasterData, StudentSubmission } from '../types';

interface StartScreenProps {
  settings: QuizSettings;
  studentsMaster: StudentMasterData[];
  submissions: StudentSubmission[];
  onStartQuiz: (profile: StudentProfile) => void;
  onOpenStudyModal: () => void;
  isStudyLocked: boolean;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  settings,
  studentsMaster,
  submissions,
  onStartQuiz,
  onOpenStudyModal,
  isStudyLocked,
}) => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState('7A');
  const [attendanceNumber, setAttendanceNumber] = useState<number | ''>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if student name already exists in a different class
  const checkCrossClassViolation = (inputName: string, chosenClass: string): { hasViolation: boolean; registeredClass?: string } => {
    const cleanInput = inputName.trim().toLowerCase();
    if (!cleanInput) return { hasViolation: false };

    // Check master data first
    const masterMatch = studentsMaster.find(s => s.name.trim().toLowerCase() === cleanInput);
    if (masterMatch && masterMatch.className !== chosenClass) {
      return { hasViolation: true, registeredClass: masterMatch.className };
    }

    // Check existing submissions
    const subMatch = submissions.find(s => s.name.trim().toLowerCase() === cleanInput);
    if (subMatch && subMatch.className !== chosenClass) {
      return { hasViolation: true, registeredClass: subMatch.className };
    }

    return { hasViolation: false };
  };

  // Check student attempts
  const getStudentAttempts = (inputName: string, chosenClass: string, absen: number | ''): number => {
    if (!inputName.trim() || !absen) return 0;
    return submissions.filter(
      s => s.className === chosenClass && (
        s.attendanceNumber === Number(absen) || s.name.trim().toLowerCase() === inputName.trim().toLowerCase()
      )
    ).length;
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Silakan isi Nama Lengkap Anda.');
      return;
    }
    if (!attendanceNumber || Number(attendanceNumber) <= 0) {
      setErrorMessage('Nomor absen harus diisi dengan angka yang valid.');
      return;
    }

    // Check if class is allowed
    if (settings.allowedClasses.length > 0 && !settings.allowedClasses.includes(selectedClass)) {
      setErrorMessage(`Sesi kuis untuk Kelas ${selectedClass} sedang ditutup oleh guru.`);
      return;
    }

    // Check 2-class conflict
    const crossCheck = checkCrossClassViolation(name, selectedClass);
    if (crossCheck.hasViolation) {
      setErrorMessage(
        `Nama "${name.trim()}" telah terdata di ${crossCheck.registeredClass}. Sistem menolak pengerjaan di kelas ${selectedClass} untuk mencegah duplikasi identitas siswa!`
      );
      return;
    }

    // Check attempts
    const attempts = getStudentAttempts(name, selectedClass, attendanceNumber);
    if (settings.maxAttempts > 0 && attempts >= settings.maxAttempts) {
      setErrorMessage(
        `Anda telah mengerjakan kuis sebanyak ${attempts} kali. Batas pengerjaan untuk kuis ini adalah ${settings.maxAttempts} kali.`
      );
      return;
    }

    onStartQuiz({
      name: name.trim(),
      className: selectedClass,
      attendanceNumber: Number(attendanceNumber),
    });
  };

  // Quick select student from master database
  const classMasterList = studentsMaster
    .filter(s => s.className === selectedClass)
    .sort((a, b) => a.attendanceNumber - b.attendanceNumber);

  // Check if active draft exists for chosen student
  const hasDraft = React.useMemo(() => {
    if (!selectedClass || !attendanceNumber) return false;
    try {
      const draft = localStorage.getItem(`quiz_draft_${selectedClass}_${attendanceNumber}`);
      return Boolean(draft);
    } catch {
      return false;
    }
  }, [selectedClass, attendanceNumber]);

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      {/* Hero Badge */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200/60 rounded-full text-xs font-bold text-indigo-700 mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Kuis by Eli Ermawati, S.Pd.</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
          Interactive English Quiz
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Chapter 1: Introducing my self and other (Materi Descriptive text)
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Card Header info */}
        <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/40 p-4 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Waktu: <strong>{settings.timeLimitMinutes > 0 ? `${settings.timeLimitMinutes} Menit` : 'Tanpa Batas'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>KKM: <strong>{settings.kkmScore}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>Batas: <strong>{settings.maxAttempts > 0 ? `${settings.maxAttempts}x Kerjakan` : 'Bebas'}</strong></span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleStart} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Akses Ditolak</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Kelas Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pilih Rombel / Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
            >
              {['7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H'].map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Quick select from Master Data if available */}
          {classMasterList.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-indigo-700 mb-1">
                Pilih Cepat Nama Siswa (Dari Database Siswa Kelas {selectedClass}):
              </label>
              <select
                onChange={(e) => {
                  const std = classMasterList.find(s => s.id === e.target.value);
                  if (std) {
                    setName(std.name);
                    setAttendanceNumber(std.attendanceNumber);
                    setErrorMessage(null);
                  }
                }}
                defaultValue=""
                className="w-full px-3 py-2 text-xs bg-indigo-50/50 border border-indigo-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled>-- Pilih nama kamu atau ketik manual di bawah --</option>
                {classMasterList.map((std) => (
                  <option key={std.id} value={std.id}>
                    No. {std.attendanceNumber} - {std.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nomor Absen */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nomor Absen
            </label>
            <input
              type="number"
              min="1"
              max="50"
              placeholder="Contoh: 15"
              value={attendanceNumber}
              onChange={(e) => {
                setAttendanceNumber(e.target.value ? Number(e.target.value) : '');
                setErrorMessage(null);
              }}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Nama Siswa */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap Siswa
            </label>
            <input
              type="text"
              placeholder="Ketik nama lengkap sesuai buku absensi..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMessage(null);
              }}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 space-y-3">
            {hasDraft && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
                <span className="font-semibold">Ditemukan draft jawaban yang belum selesai.</span>
                <span className="font-bold text-indigo-600 bg-white px-2 py-0.5 rounded shadow-2xs">Lanjutkan Sesi</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{hasDraft ? 'Lanjutkan Mengerjakan Kuis' : 'Mulai Mengerjakan Kuis (10 Soal)'}</span>
            </button>

            {/* Study Module Button */}
            <button
              type="button"
              onClick={onOpenStudyModal}
              disabled={isStudyLocked}
              className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                isStudyLocked
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              {isStudyLocked ? (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Modul Ajar Terkunci (Sudah Dilihat 1 Kali)</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Pelajari Dulu Modul Belajar Siswa (Batas 1 Kali Lihat)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
