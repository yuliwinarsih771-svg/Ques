import React from 'react';
import { X, CheckCircle2, XCircle, HelpCircle, Volume2 } from 'lucide-react';
import { Question, StudentSubmission } from '../types';
import { soundManager } from '../utils/audio';

interface ReviewModalProps {
  isOpen: boolean;
  questions: Question[];
  submission: StudentSubmission;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  questions,
  submission,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Pembahasan & Review Jawaban
            </h3>
            <p className="text-xs text-slate-500">
              {submission.name} ({submission.className} - No. {submission.attendanceNumber}) • Skor: {submission.score}/100
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {questions.map((q, idx) => {
            const studentAnswer = submission.answers[q.id];
            const isCorrect = studentAnswer === q.correctAnswer;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                {/* Question Top */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-white">
                      Soal {idx + 1}
                    </span>
                    <span className="text-xs text-slate-500">{q.topic}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    {isCorrect ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Benar (+10)
                      </span>
                    ) : (
                      <span className="text-rose-700 flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Salah (0)
                      </span>
                    )}
                  </div>
                </div>

                {/* Passage / Audio */}
                {q.passage && (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 font-serif italic mb-3">
                    "{q.passage}"
                  </div>
                )}

                {/* Question */}
                <p className="font-bold text-sm text-slate-800 mb-3">{q.question}</p>

                {/* Options List */}
                <div className="space-y-1.5 text-xs mb-3">
                  {q.options.map((opt, optIdx) => {
                    const isUserChoice = studentAnswer === optIdx;
                    const isKeyAnswer = q.correctAnswer === optIdx;

                    let optStyle = 'border-slate-200 bg-white text-slate-600';
                    if (isKeyAnswer) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (isUserChoice && !isCorrect) {
                      optStyle = 'border-rose-400 bg-rose-50 text-rose-900 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${optStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center font-bold text-[10px]">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isKeyAnswer && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            Kunci Jawaban
                          </span>
                        )}
                        {isUserChoice && !isKeyAnswer && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                            Jawaban Anda
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-indigo-700">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Pembahasan:</span>
                  </div>
                  <p>{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl"
          >
            Tutup Pembahasan
          </button>
        </div>
      </div>
    </div>
  );
};
