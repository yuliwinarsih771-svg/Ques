import React from 'react';
import { Award, CheckCircle, XCircle, RotateCcw, BookOpen, Printer, Home, Clock, AlertTriangle } from 'lucide-react';
import { StudentSubmission, Question } from '../types';

interface ResultScreenProps {
  submission: StudentSubmission;
  questions: Question[];
  onRetry: () => void;
  onHome: () => void;
  onOpenReview: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  submission,
  questions,
  onRetry,
  onHome,
  onOpenReview,
}) => {
  const isPassed = submission.score >= 75;

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-center space-y-6">
        {/* Badge Icon */}
        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center shadow-inner relative">
          {isPassed ? (
            <div className="w-full h-full rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-4 border-emerald-100">
              <Award className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-full h-full rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border-4 border-amber-100">
              <AlertTriangle className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            {isPassed ? 'Selamat, Anda Tuntas!' : 'Tetap Semangat, Belajar Lebih Giat!'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kuis by <strong className="text-indigo-600">Eli Ermawati, S.Pd.</strong> • Chapter 1: Introducing my self and other
          </p>
        </div>

        {/* Score Card */}
        <div className={`p-6 rounded-2xl border-2 ${
          isPassed ? 'bg-emerald-50/50 border-emerald-300' : 'bg-amber-50/50 border-amber-300'
        }`}>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Nilai Akhir Anda</p>
          <div className="text-5xl font-black text-slate-900 my-2">
            {submission.score}
            <span className="text-xl font-medium text-slate-400">/100</span>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
            isPassed ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
          }`}>
            {isPassed ? 'TUNTAS (Memenuhi KKM 75)' : 'BELUM TUNTAS (Remedial KKM 75)'}
          </span>
        </div>

        {/* Student Stats */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-4 rounded-xl text-left text-xs border border-slate-200">
          <div>
            <span className="text-slate-400 block">Siswa</span>
            <span className="font-bold text-slate-800 truncate block">{submission.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Kelas / Absen</span>
            <span className="font-bold text-slate-800">{submission.className} • No. {submission.attendanceNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Benar / Soal</span>
            <span className="font-bold text-slate-800">{submission.correctAnswersCount} / {submission.totalQuestions}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onOpenReview}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Lihat Pembahasan Jawaban (Review)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Bukti Nilai (A4)</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onRetry}
              className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>

            <button
              onClick={onHome}
              className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Kembali ke Awal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
