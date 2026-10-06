import React, { useState, useMemo } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  RotateCcw,
  Volume2,
  Volume1,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  X,
  Save,
  Gamepad2,
  Trophy,
  Star,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  PictureCardItem,
  PictureMatchCategory,
  PictureMatchRecord,
  SmpGradeLevel,
} from '../types';
import { PICTURE_MATCH_CATEGORIES, PICTURE_MATCH_ITEMS } from '../data/pictureMatchData';
import { soundManager } from '../utils/audio';

interface TeacherPictureCardsProps {
  cards: PictureCardItem[];
  onSaveCards: (updated: PictureCardItem[]) => void;
  records?: PictureMatchRecord[];
  onClearRecords?: () => void;
  onOpenPictureMatchPlay?: () => void;
}

export const TeacherPictureCards: React.FC<TeacherPictureCardsProps> = ({
  cards,
  onSaveCards,
  records = [],
  onClearRecords,
  onOpenPictureMatchPlay,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<PictureMatchCategory>('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'all' | SmpGradeLevel>('all');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Add / Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<PictureCardItem | null>(null);

  // Form Fields
  const [formWord, setFormWord] = useState('');
  const [formTranslation, setFormTranslation] = useState('');
  const [formEmoji, setFormEmoji] = useState('🌟');
  const [formCategory, setFormCategory] = useState<'animals' | 'school' | 'food' | 'jobs' | 'actions' | 'science'>('school');
  const [formGrade, setFormGrade] = useState<'7' | '8' | '9'>('7');
  const [formSentence, setFormSentence] = useState('');
  const [formError, setFormError] = useState('');

  // Delete Confirm modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      const matchCategory = selectedCategoryFilter === 'all' || c.category === selectedCategoryFilter;
      const matchGrade = selectedGradeFilter === 'all' || c.grade === selectedGradeFilter;
      const qLower = searchQuery.toLowerCase();
      const matchSearch =
        c.word.toLowerCase().includes(qLower) ||
        c.translation.toLowerCase().includes(qLower) ||
        c.exampleSentence.toLowerCase().includes(qLower);

      return matchCategory && matchGrade && matchSearch;
    });
  }, [cards, selectedCategoryFilter, selectedGradeFilter, searchQuery]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    return {
      all: cards.length,
      animals: cards.filter((c) => c.category === 'animals').length,
      school: cards.filter((c) => c.category === 'school').length,
      food: cards.filter((c) => c.category === 'food').length,
      jobs: cards.filter((c) => c.category === 'jobs').length,
      actions: cards.filter((c) => c.category === 'actions').length,
      science: cards.filter((c) => c.category === 'science').length,
    };
  }, [cards]);

  // Open modal for Adding new card
  const handleOpenAddModal = () => {
    setEditingCard(null);
    setFormWord('');
    setFormTranslation('');
    setFormEmoji('🌟');
    setFormCategory('school');
    setFormGrade('7');
    setFormSentence('');
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Open modal for Editing existing card
  const handleOpenEditModal = (c: PictureCardItem) => {
    setEditingCard(c);
    setFormWord(c.word);
    setFormTranslation(c.translation);
    setFormEmoji(c.emoji);
    setFormCategory(c.category);
    setFormGrade(c.grade);
    setFormSentence(c.exampleSentence);
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Save form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formWord.trim()) {
      setFormError('Kata Bahasa Inggris tidak boleh kosong.');
      return;
    }
    if (!formTranslation.trim()) {
      setFormError('Arti dalam Bahasa Indonesia tidak boleh kosong.');
      return;
    }
    if (!formEmoji.trim()) {
      setFormError('Silakan pilih atau ketik 1 emoji ilustrasi gambar.');
      return;
    }
    if (!formSentence.trim()) {
      setFormError('Contoh kalimat Bahasa Inggris wajib diisi untuk edukasi siswa.');
      return;
    }

    if (editingCard) {
      // Update
      const updated = cards.map((c) =>
        c.id === editingCard.id
          ? {
              ...c,
              word: formWord.trim(),
              translation: formTranslation.trim(),
              emoji: formEmoji.trim(),
              category: formCategory,
              grade: formGrade,
              exampleSentence: formSentence.trim(),
            }
          : c
      );
      onSaveCards(updated);
    } else {
      // Create new
      const newCard: PictureCardItem = {
        id: `pic-custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        word: formWord.trim(),
        translation: formTranslation.trim(),
        emoji: formEmoji.trim(),
        category: formCategory,
        grade: formGrade,
        exampleSentence: formSentence.trim(),
        color:
          formCategory === 'animals'
            ? 'from-amber-400 to-orange-500'
            : formCategory === 'school'
            ? 'from-blue-400 to-indigo-600'
            : formCategory === 'food'
            ? 'from-rose-400 to-pink-600'
            : formCategory === 'jobs'
            ? 'from-teal-400 to-emerald-600'
            : formCategory === 'actions'
            ? 'from-cyan-400 to-blue-600'
            : 'from-purple-400 to-violet-600',
      };
      onSaveCards([newCard, ...cards]);
    }

    setIsEditModalOpen(false);
    soundManager.playSuccessSound();
  };

  // Delete card
  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    const updated = cards.filter((c) => c.id !== deleteTargetId);
    onSaveCards(updated);
    setDeleteTargetId(null);
    soundManager.playKeyClick();
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (
      window.confirm(
        'Kembalikan seluruh bank kartu gambar ke kurikulum standar Bahasa Inggris SMP? Kartu kustom Anda akan diatur ulang.'
      )
    ) {
      onSaveCards(PICTURE_MATCH_ITEMS);
      soundManager.playSuccessSound();
    }
  };

  // Play audio TTS
  const handlePlayAudio = (id: string, text: string) => {
    if (playingAudioId === id) {
      soundManager.stopSpeech();
      setPlayingAudioId(null);
      return;
    }
    setPlayingAudioId(id);
    soundManager.speakEnglishText(text, 0.9, () => {
      setPlayingAudioId(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-rose-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-500 text-white flex items-center justify-center font-black text-xl shadow-lg">
              🖼️
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Bank Gambar & Kosakata Tebak Gambar</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                  Bisa Diedit Guru
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Kelola pasangan gambar ilustrasi dan kosakata Bahasa Inggris untuk permainan memori, menjodohkan garis, dan tebak ejaan.
              </p>
            </div>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenPictureMatchPlay && (
            <button
              type="button"
              onClick={onOpenPictureMatchPlay}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 font-extrabold text-xs rounded-xl border border-rose-500/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Gamepad2 className="w-4 h-4 text-rose-400" />
              <span>Uji Coba Game</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset ke Standar Kurikulum SMP"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Kartu Baru</span>
          </button>
        </div>
      </div>

      {/* Category Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
        {PICTURE_MATCH_CATEGORIES.map((cat) => {
          const count =
            cat.id === 'all'
              ? categoryCounts.all
              : categoryCounts[cat.id as keyof typeof categoryCounts] || 0;
          const isSelected = selectedCategoryFilter === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer text-center ${
                isSelected
                  ? 'bg-rose-50 border-rose-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-xl block">{cat.emoji}</span>
              <span className="text-[10px] font-bold text-slate-500 block uppercase truncate">
                {cat.name.split(' ')[0]}
              </span>
              <span className="text-sm font-black text-slate-800 font-mono">{count} Kartu</span>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kata Inggris, arti, atau contoh kalimat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
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

        {/* Grade Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Tingkat:
          </span>
          {[
            { id: 'all', label: 'Semua Kelas' },
            { id: '7', label: 'Kelas 7' },
            { id: '8', label: 'Kelas 8' },
            { id: '9', label: 'Kelas 9' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedGradeFilter(tab.id as 'all' | SmpGradeLevel)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedGradeFilter === tab.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredCards.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs space-y-2">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Tidak ada kartu gambar yang cocok dengan filter.</p>
            <p className="text-xs text-slate-400">
              Gunakan kata kunci lain atau klik "+ Tambah Kartu Baru" untuk menambahkan kosakata bergambar.
            </p>
          </div>
        ) : (
          filteredCards.map((c, idx) => {
            const isPlayingThis = playingAudioId === c.id;

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between space-y-3 relative group"
              >
                {/* Header: Grade & Category badges */}
                <div className="flex items-center justify-between text-[10px]">
                  <span
                    className={`px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                      c.grade === '7'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : c.grade === '8'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    Kelas {c.grade} SMP
                  </span>
                  <span className="text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 uppercase">
                    {c.category}
                  </span>
                </div>

                {/* Picture & Word Display */}
                <div className="flex items-center gap-3 py-1">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                    {c.emoji}
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h3 className="text-sm font-black text-slate-900 truncate flex items-center gap-1.5">
                      <span>{c.word}</span>
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(c.id, c.word)}
                        className={`p-1 rounded-md transition-all cursor-pointer ${
                          isPlayingThis
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Dengarkan Suara"
                      >
                        <Volume1 className="w-3 h-3" />
                      </button>
                    </h3>
                    <p className="text-xs font-bold text-rose-700 truncate">{c.translation}</p>
                  </div>
                </div>

                {/* Example sentence */}
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 italic line-clamp-2 leading-tight">
                  "{c.exampleSentence}"
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(c)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(c.id)}
                    className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                    title="Hapus Kartu"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Hall of Fame Records Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Daftar Siswa Penakluk Tebak Gambar (Rekap Prestasi)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Mencatat siswa yang telah menyelesaikan tantangan mencocokkan gambar dan perolehan skornya.
            </p>
          </div>

          {records.length > 0 && onClearRecords && (
            <button
              type="button"
              onClick={onClearRecords}
              className="px-3 py-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer"
            >
              Kosongkan Riwayat
            </button>
          )}
        </div>

        {records.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
            <Gamepad2 className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
            <p className="font-bold text-slate-700">Belum Ada Riwayat Penyelesaian Tebak Gambar</p>
            <p className="text-[11px]">Siswa yang berhasil menyelesaikan permainan akan otomatis tercatat di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">No</th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3 text-center w-20">Kelas</th>
                  <th className="py-2.5 px-3 text-center w-28">Tingkat Kelas</th>
                  <th className="py-2.5 px-3 text-center w-24">Waktu</th>
                  <th className="py-2.5 px-3 text-center w-24">Bintang</th>
                  <th className="py-2.5 px-3 text-center w-28">Total Skor</th>
                  <th className="py-2.5 px-4 text-center w-36">Tanggal Main</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec, rIdx) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-bold">
                      {rIdx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{rec.studentName}</td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-600">
                      {rec.className}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-indigo-700">
                      Kelas {rec.gradePlayed} SMP
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                      {Math.floor(rec.timeSpentSeconds / 60)}m {rec.timeSpentSeconds % 60}s
                    </td>
                    <td className="py-2.5 px-3 text-center text-amber-500 font-bold">
                      {'★'.repeat(rec.starsCount)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-extrabold text-emerald-700">
                      {rec.score} XP
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                      {rec.completedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD / EDIT PICTURE CARD */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center font-black">
                  🖼️
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingCard ? 'Edit Kartu Gambar & Kata' : 'Tambah Kartu Gambar Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">Pasangan gambar ilustrasi dan kosakata kurikulum SMP</p>
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
              {/* Row 1: Emoji, Word, Translation */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Emoji / Gambar:</label>
                  <input
                    type="text"
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                    className="w-full px-2 py-2 text-center text-2xl bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                    placeholder="🦁"
                    required
                  />
                </div>

                <div className="col-span-3">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kata Bahasa Inggris (*English Word*):
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Elephant, Microscope, Chef..."
                    value={formWord}
                    onChange={(e) => setFormWord(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Translation */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Arti dalam Bahasa Indonesia:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Gajah, Mikroskop, Koki..."
                  value={formTranslation}
                  onChange={(e) => setFormTranslation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  required
                />
              </div>

              {/* Row 3: Category & Grade */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kategori Tema:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  >
                    <option value="school">Sekolah & Belajar (School)</option>
                    <option value="animals">Hewan & Alam (Animals)</option>
                    <option value="food">Makanan & Minuman (Food)</option>
                    <option value="jobs">Profesi & Pekerjaan (Jobs)</option>
                    <option value="actions">Kata Kerja & Aktivitas (Actions)</option>
                    <option value="science">Sains & Teknologi (Science)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tingkat Kelas SMP:</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  >
                    <option value="7">Kelas 7 SMP</option>
                    <option value="8">Kelas 8 SMP</option>
                    <option value="9">Kelas 9 SMP</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Example Sentence */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Contoh Kalimat Bahasa Inggris (*Example Sentence*):
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: An elephant has a long trunk and large ears."
                  value={formSentence}
                  onChange={(e) => setFormSentence(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
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
                  className="px-5 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Kartu</span>
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
              <h3 className="text-base font-black text-slate-900">Hapus Kartu Gambar?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Kartu gambar ini akan dihapus dari bank permainan. Tindakan ini tidak dapat dibatalkan.
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
