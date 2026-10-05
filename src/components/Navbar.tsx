import React from 'react';
import { BookOpen, GraduationCap, Shield, Gamepad2 } from 'lucide-react';

interface NavbarProps {
  onOpenTeacherPin: () => void;
  onOpenStudyModal: () => void;
  onOpenMazeGame?: () => void;
  isStudyLocked?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTeacherPin,
  onOpenStudyModal,
  onOpenMazeGame,
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
                English for Nusantara • SMP Kelas VII, VIII & IX
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {onOpenMazeGame && (
              <button
                type="button"
                onClick={onOpenMazeGame}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-extrabold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Mainkan Game Labirin Edukasi Bahasa Inggris SMP"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Game Labirin SMP</span>
                <span className="sm:hidden">Labirin</span>
              </button>
            )}

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
              <span className="hidden sm:inline">Modul Belajar</span>
              <span className="sm:hidden">Modul</span>
            </button>

            <button
              onClick={onOpenTeacherPin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 border border-indigo-500/30 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer group"
              title="Masuk ke Portal & Dashboard Guru"
            >
              <div className="w-4.5 h-4.5 rounded-md bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/40">
                <Shield className="w-2.5 h-2.5 text-amber-400" />
              </div>
              <span className="hidden xs:inline">Portal Guru</span>
              <span className="xs:hidden">Guru</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
