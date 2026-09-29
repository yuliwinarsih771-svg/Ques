import React, { useState } from 'react';
import { X, Volume2, BookOpen, Sparkles, CheckCircle2, User, Users } from 'lucide-react';
import { ProcedureTextItem } from '../types';
import { soundManager } from '../utils/audio';

interface ProcedureTextStudyModalProps {
  procedureTexts: ProcedureTextItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const ProcedureTextStudyModal: React.FC<ProcedureTextStudyModalProps> = ({
  procedureTexts,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'examples'>('concepts');
  const [activeRecipeIdx, setActiveRecipeIdx] = useState(0);

  if (!isOpen) return null;

  const currentRecipe = procedureTexts[activeRecipeIdx] || procedureTexts[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold mb-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Modul Belajar Siswa • SMP Kelas VII</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Chapter 1: Introducing my self and other (Materi Descriptive text)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-white px-5">
          <button
            onClick={() => setActiveTab('concepts')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'concepts'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Poin Materi & Unsur Kebahasaan</span>
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'examples'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Contoh Teks & Audio Pelafalan</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'concepts' ? (
            <div className="space-y-6">
              {/* Concept 1: What is Descriptive text */}
              <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2">
                <h4 className="font-extrabold text-sm text-indigo-950 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  Apa itu Descriptive text? (Describing People & Friends)
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Descriptive Text</strong> adalah teks yang bertujuan untuk menggambarkan atau mendeskripsikan seseorang, benda, atau tempat secara spesifik. Dalam Chapter 1: <em>Introducing my self and other</em>, kita belajar mendeskripsikan diri sendiri, teman sekelas, hobi, serta ciri fisik dan sifat (physical appearance & personality).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <div className="bg-white p-3 rounded-xl border border-indigo-200/60 text-xs">
                    <p className="font-bold text-indigo-900">1. Identification (Pengenalan)</p>
                    <p className="text-slate-600 mt-0.5">Memperkenalkan siapa orang yang akan dideskripsikan (nama, asal, usia, hubungan pertemanan).</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-indigo-200/60 text-xs">
                    <p className="font-bold text-indigo-900">2. Description (Ciri-ciri)</p>
                    <p className="text-slate-600 mt-0.5">Menjelaskan ciri fisik (tall, curly hair, wears glasses), hobi, serta sifat ramah dan kebiasaan.</p>
                  </div>
                </div>
              </div>

              {/* Useful Expressions Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 p-3 border-b border-slate-200 font-bold text-xs text-slate-700">
                  Ungkapan Kunci (Key Expressions) Introducing Myself & Others
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-bold text-indigo-700 mb-1.5">Memperkenalkan Diri (Introducing Myself):</p>
                    <ul className="space-y-1 text-slate-600">
                      <li>• "Hello, my name is..." (Nama lengkap)</li>
                      <li>• "You can call me..." (Nama panggilan)</li>
                      <li>• "I am from Kalimantan / Java." (Asal daerah)</li>
                      <li>• "I live at Jl. Merak No. 12." (Alamat rumah)</li>
                      <li>• "I am 13 years old." (Usia)</li>
                      <li>• "My hobby is reading / playing football."</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-indigo-700 mb-1.5">Memperkenalkan Teman (Introducing Others):</p>
                    <ul className="space-y-1 text-slate-600">
                      <li>• "Galang, this is Andre. He is my classmate."</li>
                      <li>• "Nice to meet you." ➔ "Nice to meet you too."</li>
                      <li>• "His hobby is fishing." (Kata ganti laki-laki)</li>
                      <li>• "Her favorite subject is English." (Perempuan)</li>
                      <li>• "They are from SMP Merdeka."</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Recipe Selector */}
              <div className="flex gap-2">
                {procedureTexts.map((text, idx) => (
                  <button
                    key={text.id}
                    onClick={() => setActiveRecipeIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      idx === activeRecipeIdx
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {text.title}
                  </button>
                ))}
              </div>

              {/* Recipe Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-base text-slate-800">{currentRecipe.title}</h4>
                  {currentRecipe.audioScript && (
                    <button
                      onClick={() => soundManager.speakEnglishText(currentRecipe.audioScript || '', 0.8)}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Dengarkan Pelafalan</span>
                    </button>
                  )}
                </div>

                {/* Steps */}
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Langkah-langkah (Steps):</p>
                  <ol className="space-y-2 text-xs text-slate-700">
                    {currentRecipe.steps.map((step, sIdx) => (
                      <li key={sIdx} className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-start gap-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 italic">
            *Batas akses: 1 User 1 Kali Lihat sebelum mengerjakan kuis.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
          >
            Paham & Tutup Modul
          </button>
        </div>
      </div>
    </div>
  );
};
