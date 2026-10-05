import React, { useState } from 'react';
import { Play, Sparkles, BookOpen, Clock, AlertTriangle, ShieldCheck, UserCheck, Lock, Gamepad2 } from 'lucide-react';
import { QuizSettings, StudentProfile, StudentMasterData, StudentSubmission } from '../types';

interface StartScreenProps {
  settings: QuizSettings;
  studentsMaster: StudentMasterData[];
  submissions: StudentSubmission[];
  onStartQuiz: (profile: StudentProfile) => void;
  onOpenStudyModal: () => void;
  onOpenMazeGame?: (profile?: StudentProfile) => void;
  isStudyLocked: boolean;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  settings,
  studentsMaster,
  submissions,
  onStartQuiz,
  onOpenStudyModal,
  onOpenMazeGame,
  isStudyLocked,
}) => {
  const defaultClass = React.useMemo(() => {
    if (settings.activeClass && settings.activeClass !== 'Semua Kelas') {
      return settings.activeClass;
    }
    return '7A';
  }, [settings.activeClass]);

  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);
  const [attendanceNumber, setAttendanceNumber] = useState<number | ''>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync selectedClass if teacher changed activeClass
  React.useEffect(() => {
    if (settings.activeClass && settings.activeClass !== 'Semua Kelas') {
      setSelectedClass(settings.activeClass);
      setName('');
      setAttendanceNumber('');
    }
  }, [settings.activeClass]);

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

  // Available classes: if teacher designated a specific activeClass, only show that class
  const availableClasses = React.useMemo(() => {
    if (settings.activeClass && settings.activeClass !== 'Semua Kelas') {
      return [settings.activeClass];
    }
    return ['7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H'];
  }, [settings.activeClass]);

  // Quick select student from master database
  // If teacher selected a specific class, only students from that class will appear
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
    <div className="max-w-lg mx-auto py-2.5 sm:py-6 px-3 sm:px-4">
      {/* Hero Badge */}
      <div className="text-center mb-2.5 sm:mb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-indigo-50 border border-indigo-200/60 rounded-full text-[11px] sm:text-xs font-bold text-indigo-700 mb-1.5 sm:mb-3 shadow-2xs">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" />
          <span>Kuis by Eli Ermawati, S.Pd.</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
          Interactive English Quiz
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
          Chapter 1: Introducing my self and other (Descriptive Text)
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Card Header info */}
        <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/40 p-2.5 sm:p-3.5 border-b border-slate-200/80 flex items-center justify-between text-[11px] sm:text-xs text-slate-600">
          <div className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Waktu: <strong>{settings.timeLimitMinutes > 0 ? `${settings.timeLimitMinutes}m` : 'Bebas'}</strong></span>
          </div>
          <div className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>KKM: <strong>{settings.kkmScore}</strong></span>
          </div>
          <div className="flex items-center gap-1 font-medium">
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Batas: <strong>{settings.maxAttempts > 0 ? `${settings.maxAttempts} Kali` : 'Bebas'}</strong></span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleStart} className="p-3.5 sm:p-5 space-y-3 sm:space-y-4">
          {errorMessage && (
            <div className="p-2.5 sm:p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Akses Ditolak</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Kelas Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Rombel / Kelas
              </label>
              {settings.activeClass && settings.activeClass !== 'Semua Kelas' && (
                <span className="text-[10px] sm:text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 rounded">
                  ★ Ditugaskan: Kelas {settings.activeClass}
                </span>
              )}
            </div>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setName('');
                setAttendanceNumber('');
                setErrorMessage(null);
              }}
              disabled={Boolean(settings.activeClass && settings.activeClass !== 'Semua Kelas')}
              className={`w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all ${
                settings.activeClass && settings.activeClass !== 'Semua Kelas'
                  ? 'bg-indigo-50/40 text-indigo-900 border-indigo-200 cursor-not-allowed'
                  : ''
              }`}
            >
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Quick select from Master Data if available */}
          {classMasterList.length > 0 && (
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-indigo-700 mb-1">
                Pilih Cepat Nama Siswa (Kelas {selectedClass}):
              </label>
              <select
                value={classMasterList.find(s => s.name === name && s.attendanceNumber === attendanceNumber)?.id || ''}
                onChange={(e) => {
                  const std = classMasterList.find(s => s.id === e.target.value);
                  if (std) {
                    setName(std.name);
                    setAttendanceNumber(std.attendanceNumber);
                    setErrorMessage(null);
                  }
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-indigo-50/50 border border-indigo-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold truncate"
              >
                <option value="">-- Pilih dari daftar nama siswa --</option>
                {classMasterList.map((std) => (
                  <option key={std.id} value={std.id}>
                    No. {std.attendanceNumber} - {std.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Input Absen & Nama Siswa (Compact Grid on Mobile) */}
          <div className="grid grid-cols-4 gap-2">
            {/* Nomor Absen */}
            <div className="col-span-1">
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Absen
              </label>
              <input
                type="number"
                min="1"
                max="50"
                placeholder="15"
                value={attendanceNumber}
                onChange={(e) => {
                  setAttendanceNumber(e.target.value ? Number(e.target.value) : '');
                  setErrorMessage(null);
                }}
                required
                className="w-full px-2.5 py-2 text-center bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
              />
            </div>

            {/* Nama Siswa */}
            <div className="col-span-3">
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Lengkap Siswa
              </label>
              <input
                type="text"
                placeholder="Ketik nama lengkap..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMessage(null);
                }}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-semibold text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-1 space-y-2">
            {hasDraft && (
              <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-[11px] text-indigo-900">
                <span className="font-semibold">Ada draft jawaban belum selesai.</span>
                <span className="font-bold text-indigo-600 bg-white px-2 py-0.5 rounded shadow-2xs">Lanjutkan Sesi</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{hasDraft ? 'Lanjutkan Mengerjakan Kuis' : 'Mulai Mengerjakan Kuis'}</span>
            </button>

            {/* Study Module Button */}
            <button
              type="button"
              onClick={onOpenStudyModal}
              disabled={isStudyLocked}
              className={`w-full py-2 px-3 text-[11px] sm:text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                isStudyLocked
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              {isStudyLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Modul Ajar Terkunci (Sudah Dilihat)</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pelajari Dulu Modul Belajar Siswa</span>
                </>
              )}
            </button>

            {/* Educational Maze Game Launcher Button */}
            {onOpenMazeGame && (
              <button
                type="button"
                onClick={() =>
                  onOpenMazeGame(
                    name.trim()
                      ? {
                          name: name.trim(),
                          className: selectedClass,
                          attendanceNumber: attendanceNumber || 1,
                        }
                      : undefined
                  )
                }
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-extrabold text-[11px] sm:text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                title="Buka Permainan Labirin Bahasa Inggris SMP"
              >
                <Gamepad2 className="w-4 h-4 text-amber-200" />
                <span>Petualangan Labirin Bahasa Inggris SMP (Game Edukasi)</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
