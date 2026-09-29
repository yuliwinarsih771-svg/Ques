import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/70 py-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <p className="font-semibold text-slate-700">
            Kuis by <span className="text-indigo-600 font-bold">Eli Ermawati, S.Pd.</span>
          </p>
          <p className="text-slate-400 mt-0.5">
            Buku Siswa Bahasa Inggris: English for Nusantara untuk SMP/MTs Kelas VII
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Chapter 1: Introducing my self and other</span>
        </div>
      </div>
    </footer>
  );
};
