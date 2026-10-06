import React, { useState, useMemo } from 'react';
import {
  Dice6,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  HelpCircle,
  X,
  Save,
  Check,
  Gamepad2,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { MazeQuestion, SmpGradeLevel } from '../types';
import { DEFAULT_SNAKE_LADDER_QUESTIONS } from '../data/snakeLadderData';
import { soundManager } from '../utils/audio';

interface TeacherSnakeLadderQuestionsProps {
  questions: MazeQuestion[];
  onSaveQuestions: (updated: MazeQuestion[]) => void;
  onOpenSnakeLadderPlay?: () => void;
}

export const TeacherSnakeLadderQuestions: React.FC<TeacherSnakeLadderQuestionsProps> = ({
  questions,
  onSaveQuestions,
  onOpenSnakeLadderPlay,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'all' | SmpGradeLevel>('all');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Edit / Add modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<MazeQuestion | null>(null);

  // Form Fields
  const [formGrade, setFormGrade] = useState<'7' | '8' | '9'>('7');
  const [formTopic, setFormTopic] = useState('');
  const [formQuestion, setFormQuestion] = useState('');
  const [formOption0, setFormOption0] = useState('');
  const [formOption1, setFormOption1] = useState('');
  const [formOption2, setFormOption2] = useState('');
  const [formOption3, setFormOption3] = useState('');
  const [formCorrectIndex, setFormCorrectIndex] = useState(0);
  const [formExplanation, setFormExplanation] = useState('');
  const [formError, setFormError] = useState('');

  // Delete confirm modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchGrade = selectedGradeFilter === 'all' || q.grade === selectedGradeFilter;
      const qLower = searchQuery.toLowerCase();
      const matchSearch =
        q.question.toLowerCase().includes(qLower) ||
        q.topic.toLowerCase().includes(qLower) ||
        q.explanation.toLowerCase().includes(qLower) ||
        q.options.some((opt) => opt.toLowerCase().includes(qLower));

      return matchGrade && matchSearch;
    });
  }, [questions, selectedGradeFilter, searchQuery]);

  // Counts by grade
  const gradeCounts = useMemo(() => {
    return {
      all: questions.length,
      grade7: questions.filter((q) => q.grade === '7').length,
      grade8: questions.filter((q) => q.grade === '8').length,
      grade9: questions.filter((q) => q.grade === '9').length,
    };
  }, [questions]);

  // Open modal for Adding new question
  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setFormGrade('7');
    setFormTopic('');
    setFormQuestion('');
    setFormOption0('');
    setFormOption1('');
    setFormOption2('');
    setFormOption3('');
    setFormCorrectIndex(0);
    setFormExplanation('');
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Open modal for Editing existing question
  const handleOpenEditModal = (q: MazeQuestion) => {
    setEditingQuestion(q);
    setFormGrade(q.grade);
    setFormTopic(q.topic);
    setFormQuestion(q.question);
    setFormOption0(q.options[0] || '');
    setFormOption1(q.options[1] || '');
    setFormOption2(q.options[2] || '');
    setFormOption3(q.options[3] || '');
    setFormCorrectIndex(q.correctAnswer);
    setFormExplanation(q.explanation);
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Save form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTopic.trim()) {
      setFormError('Topik / Materi tidak boleh kosong.');
      return;
    }
    if (!formQuestion.trim()) {
      setFormError('Butir Pertanyaan tidak boleh kosong.');
      return;
    }
    if (!formOption0.trim() || !formOption1.trim() || !formOption2.trim() || !formOption3.trim()) {
      setFormError('Semua 4 pilihan jawaban (A, B, C, D) harus diisi.');
      return;
    }
    if (!formExplanation.trim()) {
      setFormError('Penjelasan / Pembahasan tata bahasa wajib diisi untuk edukasi siswa.');
      return;
    }

    const options = [formOption0.trim(), formOption1.trim(), formOption2.trim(), formOption3.trim()];

    if (editingQuestion) {
      // Update
      const updatedList = questions.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...q,
              grade: formGrade,
              topic: formTopic.trim(),
              question: formQuestion.trim(),
              options,
              correctAnswer: formCorrectIndex,
              explanation: formExplanation.trim(),
            }
          : q
      );
      onSaveQuestions(updatedList);
    } else {
      // Create New
      const newQuestion: MazeQuestion = {
        id: `sl-custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        grade: formGrade,
        topic: formTopic.trim(),
        question: formQuestion.trim(),
        options,
        correctAnswer: formCorrectIndex,
        explanation: formExplanation.trim(),
      };
      onSaveQuestions([newQuestion, ...questions]);
    }

    setIsEditModalOpen(false);
    soundManager.playSuccessSound();
  };

  // Delete question
  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    const updated = questions.filter((q) => q.id !== deleteTargetId);
    onSaveQuestions(updated);
    setDeleteTargetId(null);
    soundManager.playKeyClick();
  };

  // Reset to default standard SMP questions
  const handleResetToDefault = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin mengatur ulang bank soal Ular Tangga ke kurikulum standar Bahasa Inggris SMP? Seluruh soal kustom akan diperbarui.'
      )
    ) {
      onSaveQuestions(DEFAULT_SNAKE_LADDER_QUESTIONS);
      soundManager.playSuccessSound();
    }
  };

  // Play pronunciation TTS
  const handlePlayAudio = (qId: string, text: string) => {
    if (playingAudioId === qId) {
      soundManager.stopSpeech();
      setPlayingAudioId(null);
      return;
    }
    setPlayingAudioId(qId);
    soundManager.speakEnglishText(text, 0.85, () => {
      setPlayingAudioId(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-teal-900/90 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-teal-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg">
              🎲
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Bank Soal Ular Tangga Bahasa Inggris SMP</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full font-bold">
                  Bisa Diedit Guru
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Kelola butir soal kurikulum yang muncul di petak tangga emas, kepala ular, dan petak bintang kuis.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenSnakeLadderPlay && (
            <button
              type="button"
              onClick={onOpenSnakeLadderPlay}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 font-extrabold text-xs rounded-xl border border-teal-500/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Gamepad2 className="w-4 h-4 text-teal-400" />
              <span>Uji Coba Game</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Kembalikan ke Soal Standar Kurikulum SMP"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Soal Baru</span>
          </button>
        </div>
      </div>

      {/* Grade Metrics Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setSelectedGradeFilter('all')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            selectedGradeFilter === 'all'
              ? 'bg-teal-50 border-teal-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-500 block uppercase">TOTAL SELURUH SOAL</span>
          <span className="text-xl font-black text-slate-800 font-mono">{gradeCounts.all} Soal</span>
        </div>

        <div
          onClick={() => setSelectedGradeFilter('7')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            selectedGradeFilter === '7'
              ? 'bg-indigo-50 border-indigo-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-indigo-600 block uppercase">SOAL KELAS VII (7)</span>
          <span className="text-xl font-black text-indigo-900 font-mono">{gradeCounts.grade7} Soal</span>
        </div>

        <div
          onClick={() => setSelectedGradeFilter('8')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            selectedGradeFilter === '8'
              ? 'bg-blue-50 border-blue-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-blue-600 block uppercase">SOAL KELAS VIII (8)</span>
          <span className="text-xl font-black text-blue-900 font-mono">{gradeCounts.grade8} Soal</span>
        </div>

        <div
          onClick={() => setSelectedGradeFilter('9')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            selectedGradeFilter === '9'
              ? 'bg-purple-50 border-purple-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-purple-600 block uppercase">SOAL KELAS IX (9)</span>
          <span className="text-xl font-black text-purple-900 font-mono">{gradeCounts.grade9} Soal</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari materi, teks soal, atau pembahasan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Grade Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { id: 'all', label: 'Semua' },
            { id: '7', label: 'Kelas 7' },
            { id: '8', label: 'Kelas 8' },
            { id: '9', label: 'Kelas 9' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedGradeFilter(tab.id as 'all' | SmpGradeLevel)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedGradeFilter === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs space-y-2">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Tidak ada soal yang sesuai dengan pencarian atau filter.</p>
            <p className="text-xs text-slate-400">
              Silakan ganti kata kunci pencarian atau klik "+ Tambah Soal Baru" untuk membuat butir soal.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isPlayingThisAudio = playingAudioId === q.id;

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-teal-300 transition-all space-y-3.5"
              >
                {/* Header row: Badge, Topic, and Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-400 font-mono">#{idx + 1}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        q.grade === '7'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : q.grade === '8'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      Kelas {q.grade} SMP
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      {q.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* TTS Speaker button */}
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(q.id, q.question)}
                      className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isPlayingThisAudio
                          ? 'bg-amber-500 text-white border-amber-400 animate-pulse'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Dengarkan Pelafalan Bahasa Inggris"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] hidden sm:inline">
                        {isPlayingThisAudio ? 'Memutar...' : 'Audio'}
                      </span>
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(q)}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Edit Butir Soal & Kunci Jawaban"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(q.id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                      title="Hapus Soal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="text-xs sm:text-sm font-semibold text-slate-800 whitespace-pre-line leading-relaxed">
                  {q.question}
                </div>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oIdx) => {
                    const letter = String.fromCharCode(65 + oIdx);
                    const isCorrect = q.correctAnswer === oIdx;

                    return (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                          isCorrect
                            ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-extrabold text-[11px] shrink-0 ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="leading-tight">{opt}</span>
                        </div>
                        {isCorrect && (
                          <span className="text-[10px] font-black text-emerald-700 flex items-center gap-0.5 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Kunci Benar</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Callout */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Pembahasan Tata Bahasa: </span>
                    <span>{q.explanation}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: ADD / EDIT QUESTION */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center font-black">
                  🎲
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingQuestion ? 'Edit Soal Ular Tangga' : 'Tambah Soal Baru Ular Tangga'}
                  </h3>
                  <p className="text-xs text-slate-500">Soal kurikulum Bahasa Inggris untuk tantangan ular tangga</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-3.5">
              {/* Row 1: Grade & Topic */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tingkat Kelas:</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value as '7' | '8' | '9')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  >
                    <option value="7">Kelas 7 SMP</option>
                    <option value="8">Kelas 8 SMP</option>
                    <option value="9">Kelas 9 SMP</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Topik / Materi Pokok:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Simple Present Tense, Recount Text..."
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Question text */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Butir Pertanyaan (Teks Soal Bahasa Inggris):
                </label>
                <textarea
                  rows={3}
                  placeholder="Tulis kalimat pertanyaan atau percakapan rumpang dalam Bahasa Inggris..."
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white leading-relaxed"
                  required
                />
              </div>

              {/* Row 3: 4 Options */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Pilihan Jawaban (A, B, C, D):</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'A', val: formOption0, set: setFormOption0, idx: 0 },
                    { label: 'B', val: formOption1, set: setFormOption1, idx: 1 },
                    { label: 'C', val: formOption2, set: setFormOption2, idx: 2 },
                    { label: 'D', val: formOption3, set: setFormOption3, idx: 3 },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-1.5 p-1.5 rounded-xl border ${
                        formCorrectIndex === item.idx ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                        {item.label}
                      </span>
                      <input
                        type="text"
                        placeholder={`Pilihan ${item.label}...`}
                        value={item.val}
                        onChange={(e) => item.set(e.target.value)}
                        className="w-full px-2 py-1 bg-transparent text-xs font-medium focus:outline-none"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 4: Correct Answer Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Kunci Jawaban yang Benar:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['A', 'B', 'C', 'D'].map((letter, idx) => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => setFormCorrectIndex(idx)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center justify-center gap-1 ${
                        formCorrectIndex === idx
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {formCorrectIndex === idx && <Check className="w-3.5 h-3.5" />}
                      <span>Opsi {letter}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 5: Grammar explanation */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pembahasan Tata Bahasa / Penjelasan Edukatif:
                </label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan alasan mengapa jawaban tersebut benar untuk memandu pemahaman siswa..."
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Soal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM DELETE */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4 shadow-2xl text-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              🗑️
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Hapus Butir Soal?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Soal ini akan dihapus dari daftar pertanyaan permainan Ular Tangga. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
