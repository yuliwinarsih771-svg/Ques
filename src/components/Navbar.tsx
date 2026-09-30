import React from 'react';
import { BookOpen, GraduationCap, Shield, User } from 'lucide-react';

interface NavbarProps {
  onOpenTeacherPin: () => void;
  onOpenStudyModal: () => void;
  isStudyLocked?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTeacherPin,
  onOpenStudyModal,
  isStudyLocked = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13 sm:h-16">
          {/* Logo & School Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xs sm:text-base font-extrabold text-slate-800 tracking-tight leading-tight line-clamp-1">
                Interactive English Quiz
              </h1>
              <p className="text-[10px] sm:text-xs text-indigo-600 font-medium">
                English for Nusantara • SMP Kelas VII
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={onOpenStudyModal}
              disabled={isStudyLocked}
              title={isStudyLocked ? 'Modul Ajar Terkunci (1 User 1 Kali Lihat)' : 'Pelajari Modul Ajar'}
              className={`inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-all ${
                isStudyLocked
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modul Belajar Siswa</span>
              <span className="sm:hidden">Modul</span>
            </button>

            <button
              onClick={onOpenTeacherPin}
              className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-xs transition-all active:scale-95"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline sm:inline">Dashboard Guru</span>
              <span className="sm:hidden xs:hidden">Guru</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
