import React, { useState } from 'react';
import {
  Building2,
  FileSignature,
  Save,
  RotateCcw,
  Printer,
  CheckCircle,
  Eye,
  Upload,
  Image as ImageIcon,
  Sparkles,
  School,
  UserCheck,
  BookOpen,
} from 'lucide-react';
import { KopSuratConfig, DEFAULT_KOP_SURAT, StudentSubmission } from '../types';
import { printClassRecap } from '../utils/printReport';

interface KopSuratSettingsProps {
  kopSurat: KopSuratConfig;
  onSaveKopSurat: (config: KopSuratConfig) => void;
  submissions?: StudentSubmission[];
  kkmScore?: number;
}

export const KopSuratSettings: React.FC<KopSuratSettingsProps> = ({
  kopSurat,
  onSaveKopSurat,
  submissions = [],
  kkmScore = 75,
}) => {
  const [formData, setFormData] = useState<KopSuratConfig>({ ...kopSurat });
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'sekolah' | 'kurikulum' | 'ttd'>('sekolah');

  const handleChange = (field: keyof KopSuratConfig, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSaveKopSurat(formData);
    setStatusMessage({
      type: 'success',
      text: 'Pengaturan Kop Surat & Tanda Tangan berhasil disimpan!',
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleReset = () => {
    if (window.confirm('Kembalikan format kop surat ke pengaturan awal standar?')) {
      setFormData({ ...DEFAULT_KOP_SURAT });
      onSaveKopSurat({ ...DEFAULT_KOP_SURAT });
      setStatusMessage({
        type: 'success',
        text: 'Format kop surat telah direset ke bawaan standar.',
      });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleApplyPreset = (presetType: 'smp' | 'sma' | 'mts' | 'swasta') => {
    let preset: Partial<KopSuratConfig> = {};
    if (presetType === 'smp') {
      preset = {
        instansiInduk: 'PEMERINTAH DAERAH DINAS PENDIDIKAN',
        dinasPendidikan: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
        namaSekolah: 'SMP NEGERI 1 INDONESIA',
        subJudulLaporan: 'Asesmen Formatif & Sumatif • Kurikulum Merdeka SMP',
        jabatanPimpinan: 'Kepala Sekolah',
      };
    } else if (presetType === 'sma') {
      preset = {
        instansiInduk: 'PEMERINTAH PROVINSI DINAS PENDIDIKAN',
        dinasPendidikan: 'CABANG DINAS PENDIDIKAN WILAYAH I',
        namaSekolah: 'SMA NEGERI 1 INDONESIA',
        subJudulLaporan: 'Asesmen Sumatif Akhir Jenjang / Semester • SMA',
        jabatanPimpinan: 'Kepala Sekolah',
      };
    } else if (presetType === 'mts') {
      preset = {
        instansiInduk: 'KEMENTERIAN AGAMA REPUBLIK INDONESIA',
        dinasPendidikan: 'KANTOR KEMENTERIAN AGAMA KABUPATEN/KOTA',
        namaSekolah: 'MADRASAH TSANAWIYAH NEGERI (MTsN) 1',
        subJudulLaporan: 'Penilaian Akhir Semester (PAS) Berbasis Komputer',
        jabatanPimpinan: 'Kepala Madrasah',
      };
    } else if (presetType === 'swasta') {
      preset = {
        instansiInduk: 'YAYASAN PENDIDIKAN INDONESIA MAJU',
        dinasPendidikan: 'BADAN PENGELOLA PENDIDIKAN TINGKAT MENENGAH',
        namaSekolah: 'SMP / SMA ISLAM TERPADU INDONESIA',
        subJudulLaporan: 'Asesmen Berbasis Komputer & Digital Learning',
        jabatanPimpinan: 'Kepala Sekolah',
      };
    }

    setFormData((prev) => ({ ...prev, ...preset }));
    setStatusMessage({
      type: 'success',
      text: `Template preset ${presetType.toUpperCase()} berhasil diterapkan. Silakan klik "Simpan" setelah memeriksa.`,
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setStatusMessage({
          type: 'error',
          text: 'Ukuran file gambar logo terlalu besar (maksimal 2MB).',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        handleChange('logoUrl', base64);
        handleChange('showLogo', true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestPrint = () => {
    // Test print with the active form data
    printClassRecap(submissions, 'Semua Kelas', kkmScore, formData);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
            <FileSignature className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Pengaturan Kop Surat & Lembar Cetak</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Resmi A4
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sesuaikan identitas sekolah, kop surat kedinasan, judul asesmen, dan nama guru penandatangan yang tercetak pada laporan hasil ujian.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset ke format kop surat bawaan sistem"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bawaan</span>
          </button>

          <button
            type="button"
            onClick={handleTestPrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            title="Uji coba cetak ke printer fisik atau PDF"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Uji Cetak (Test Print)</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Kop Surat</span>
          </button>
        </div>
      </div>

      {/* Status Message Notification */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Preset Quick Select Pills */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Pilihan Format Cepat (Preset Template):</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleApplyPreset('smp')}
            className="px-3 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-300 rounded-lg font-semibold transition-colors cursor-pointer text-xs"
          >
            SMP Negeri
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('sma')}
            className="px-3 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-300 rounded-lg font-semibold transition-colors cursor-pointer text-xs"
          >
            SMA / SMK Negeri
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('mts')}
            className="px-3 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-300 rounded-lg font-semibold transition-colors cursor-pointer text-xs"
          >
            Madrasah (MTs/MA)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('swasta')}
            className="px-3 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-300 rounded-lg font-semibold transition-colors cursor-pointer text-xs"
          >
            Sekolah Swasta / Yayasan
          </button>
        </div>
      </div>

      {/* 2-Column Grid: Form Inputs & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: 5 cols */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-5">
          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-200 text-xs font-bold gap-4 pb-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('sekolah')}
              className={`pb-1.5 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'sekolah'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>1. Identitas Sekolah</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('kurikulum')}
              className={`pb-1.5 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'kurikulum'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>2. Mata Pelajaran</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('ttd')}
              className={`pb-1.5 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'ttd'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>3. Tanda Tangan</span>
            </button>
          </div>

          {/* Tab 1: Identitas Sekolah & Dinas */}
          {activeSubTab === 'sekolah' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instansi Induk / Pemerintah Daerah:
                </label>
                <input
                  type="text"
                  value={formData.instansiInduk}
                  onChange={(e) => handleChange('instansiInduk', e.target.value)}
                  placeholder="Contoh: PEMERINTAH DAERAH PROVINSI JAWA TIMUR"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Teks baris paling atas pada kop surat.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dinas Pendidikan / Instansi Pengelola:
                </label>
                <input
                  type="text"
                  value={formData.dinasPendidikan}
                  onChange={(e) => handleChange('dinasPendidikan', e.target.value)}
                  placeholder="Contoh: DINAS PENDIDIKAN DAN KEBUDAYAAN"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Satuan Pendidikan (Sekolah):
                </label>
                <input
                  type="text"
                  value={formData.namaSekolah}
                  onChange={(e) => handleChange('namaSekolah', e.target.value)}
                  placeholder="Contoh: SMP NEGERI 1 INDONESIA"
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-indigo-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap Sekolah:
                </label>
                <input
                  type="text"
                  value={formData.alamatSekolah}
                  onChange={(e) => handleChange('alamatSekolah', e.target.value)}
                  placeholder="Contoh: Jl. Pendidikan No. 45, Kecamatan Gambir, Jakarta Pusat"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kontak, Telepon, & Email/Website:
                </label>
                <input
                  type="text"
                  value={formData.kontakSekolah}
                  onChange={(e) => handleChange('kontakSekolah', e.target.value)}
                  placeholder="Contoh: Telp: (021) 7890123 • Email: info@sekolah.sch.id"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Logo Settings */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showLogo}
                      onChange={(e) => handleChange('showLogo', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Tampilkan Logo Sekolah di Kop Surat</span>
                  </label>
                </div>

                {formData.showLogo && (
                  <div className="space-y-2 pt-1 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                        {formData.logoUrl ? (
                          <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Unggah Logo (PNG/JPG)</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        {formData.logoUrl && (
                          <button
                            type="button"
                            onClick={() => handleChange('logoUrl', '')}
                            className="ml-2 text-[11px] text-rose-600 hover:underline cursor-pointer"
                          >
                            Hapus Logo
                          </button>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">
                          Format PNG transparan atau JPG persegi disarankan (Maksimal 2MB).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Informasi Mata Pelajaran & Kurikulum */}
          {activeSubTab === 'kurikulum' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Dokumen Laporan:
                </label>
                <input
                  type="text"
                  value={formData.judulLaporan}
                  onChange={(e) => handleChange('judulLaporan', e.target.value)}
                  placeholder="Contoh: REKAPITULASI HASIL ASESMEN NILAI SISWA"
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sub-Judul / Keterangan Asesmen:
                </label>
                <input
                  type="text"
                  value={formData.subJudulLaporan}
                  onChange={(e) => handleChange('subJudulLaporan', e.target.value)}
                  placeholder="Contoh: Kuis & Asesmen Interaktif Berbasis Komputer • Kurikulum Merdeka"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mata Pelajaran:
                </label>
                <input
                  type="text"
                  value={formData.mataPelajaran}
                  onChange={(e) => handleChange('mataPelajaran', e.target.value)}
                  placeholder="Contoh: Bahasa Inggris"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Materi Pokok / Lingkup Materi:
                </label>
                <input
                  type="text"
                  value={formData.materiPokok}
                  onChange={(e) => handleChange('materiPokok', e.target.value)}
                  placeholder="Contoh: Chapter 1: Introducing myself and others & Chapter 2: Culinary and Me"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tahun Pelajaran:
                  </label>
                  <input
                    type="text"
                    value={formData.tahunPelajaran}
                    onChange={(e) => handleChange('tahunPelajaran', e.target.value)}
                    placeholder="Contoh: 2026/2027"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Semester:
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => handleChange('semester', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Titimangsa & Pejabat Penandatangan */}
          {activeSubTab === 'ttd' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kota Titimangsa Tanggal Cetak:
                </label>
                <input
                  type="text"
                  value={formData.kotaPenerbit}
                  onChange={(e) => handleChange('kotaPenerbit', e.target.value)}
                  placeholder="Contoh: Jakarta / Surabaya / Bandung"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-indigo-900 block">Pejabat 1: Kepala Sekolah / Pimpinan</span>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Jabatan:</label>
                  <input
                    type="text"
                    value={formData.jabatanPimpinan}
                    onChange={(e) => handleChange('jabatanPimpinan', e.target.value)}
                    placeholder="Contoh: Kepala Sekolah / Wali Kelas"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Nama Lengkap & Gelar:</label>
                    <input
                      type="text"
                      value={formData.namaPimpinan}
                      onChange={(e) => handleChange('namaPimpinan', e.target.value)}
                      placeholder="Nama Kepala Sekolah"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">NIP / NUPTK:</label>
                    <input
                      type="text"
                      value={formData.nipPimpinan}
                      onChange={(e) => handleChange('nipPimpinan', e.target.value)}
                      placeholder="NIP Kepala Sekolah"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-indigo-900 block">Pejabat 2: Guru Pengampu Mata Pelajaran</span>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Jabatan Guru:</label>
                  <input
                    type="text"
                    value={formData.jabatanGuru}
                    onChange={(e) => handleChange('jabatanGuru', e.target.value)}
                    placeholder="Contoh: Guru Mata Pelajaran Bahasa Inggris"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Nama Guru:</label>
                    <input
                      type="text"
                      value={formData.namaGuru}
                      onChange={(e) => handleChange('namaGuru', e.target.value)}
                      placeholder="Contoh: Eli Ermawati, S.Pd."
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">NIP / NUPTK Guru:</label>
                    <input
                      type="text"
                      value={formData.nipGuru}
                      onChange={(e) => handleChange('nipGuru', e.target.value)}
                      placeholder="NIP Guru"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Button inside Form */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Kop Surat</span>
            </button>
          </div>
        </div>

        {/* Right Live Preview: 6 cols */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pratinjau Langsung Lembar Cetak A4 (Live Preview)</span>
            </span>
            <span className="text-[10px] text-slate-400">Berubah real-time</span>
          </div>

          {/* Paper Mockup */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 font-serif text-slate-900 space-y-4">
            {/* Kop Surat Header with double underline */}
            <div className="border-b-2 border-double border-slate-900 pb-3 relative">
              <div className="flex items-center justify-center gap-4">
                {formData.showLogo && (
                  <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo Sekolah" className="w-14 h-14 object-contain" />
                    ) : (
                      <div className="w-12 h-12 rounded-full border border-slate-400 flex items-center justify-center text-[9px] font-sans text-slate-400 text-center font-bold">
                        LOGO
                      </div>
                    )}
                  </div>
                )}
                <div className="text-center flex-1">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider m-0 leading-tight">
                    {formData.instansiInduk || 'PEMERINTAH DAERAH DINAS PENDIDIKAN'}
                  </h3>
                  <h4 className="text-[11px] sm:text-xs font-semibold uppercase m-0 leading-tight mt-0.5">
                    {formData.dinasPendidikan || 'DINAS PENDIDIKAN DAN KEBUDAYAAN'}
                  </h4>
                  <h2 className="text-sm sm:text-base font-extrabold uppercase m-0 leading-tight mt-1">
                    {formData.namaSekolah || 'SMP NEGERI INDONESIA'}
                  </h2>
                  <p className="text-[9.5px] font-sans text-slate-600 m-0 mt-1">
                    {formData.alamatSekolah || 'Jl. Pendidikan Nasional No. 123'}
                  </p>
                  <p className="text-[9px] font-sans text-slate-500 m-0">
                    {formData.kontakSekolah || 'Telp: (021) 7890123 • Email: info@sekolah.sch.id'}
                  </p>
                </div>
              </div>
            </div>

            {/* Judul Laporan */}
            <div className="text-center py-1">
              <h4 className="text-xs sm:text-sm font-bold uppercase underline tracking-wide m-0">
                {formData.judulLaporan || 'REKAPITULASI HASIL ASESMEN NILAI SISWA'}
              </h4>
              <p className="text-[10px] font-sans italic text-slate-500 m-0 mt-0.5">
                {formData.subJudulLaporan || 'Kuis & Asesmen Interaktif Berbasis Komputer'}
              </p>
            </div>

            {/* Meta Table Preview */}
            <div className="font-sans text-[11px] grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded border border-slate-200">
              <div>
                <p><strong>Mata Pelajaran:</strong> {formData.mataPelajaran || 'Bahasa Inggris'}</p>
                <p><strong>Lingkup Materi:</strong> {formData.materiPokok || 'Chapter 1 & 2'}</p>
                <p><strong>Tahun / Semester:</strong> {formData.tahunPelajaran} • {formData.semester}</p>
              </div>
              <div>
                <p><strong>Titimangsa:</strong> {formData.kotaPenerbit}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p><strong>KKM:</strong> {kkmScore}</p>
                <p><strong>Rombel:</strong> Kelas 7A (Contoh)</p>
              </div>
            </div>

            {/* Dummy Score Table Mockup */}
            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left font-sans text-[10px]">
                <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-700">
                  <tr>
                    <th className="p-1.5 text-center w-8">No</th>
                    <th className="p-1.5 text-center w-12">Absen</th>
                    <th className="p-1.5">Nama Siswa</th>
                    <th className="p-1.5 text-center w-12">Kelas</th>
                    <th className="p-1.5 text-center w-12">Nilai</th>
                    <th className="p-1.5 text-center w-16">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-1 text-center text-slate-400">1</td>
                    <td className="p-1 text-center font-bold">01</td>
                    <td className="p-1 font-semibold">Aditya Pratama</td>
                    <td className="p-1 text-center">7A</td>
                    <td className="p-1 text-center font-bold">95</td>
                    <td className="p-1 text-center text-emerald-700 font-bold">TUNTAS</td>
                  </tr>
                  <tr>
                    <td className="p-1 text-center text-slate-400">2</td>
                    <td className="p-1 text-center font-bold">02</td>
                    <td className="p-1 font-semibold">Anindya Putri</td>
                    <td className="p-1 text-center">7A</td>
                    <td className="p-1 text-center font-bold">88</td>
                    <td className="p-1 text-center text-emerald-700 font-bold">TUNTAS</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signature Area Mockup */}
            <div className="pt-4 grid grid-cols-2 gap-4 text-center font-serif text-[11px]">
              <div>
                <p className="m-0">Mengetahui,</p>
                <p className="font-bold m-0">{formData.jabatanPimpinan || 'Kepala Sekolah'}</p>
                <div className="h-12" />
                <p className="font-bold m-0">{formData.namaPimpinan || '( ............................................................ )'}</p>
                <p className="text-[10px] text-slate-500 m-0">NIP. {formData.nipPimpinan || '...........................................................'}</p>
              </div>
              <div>
                <p className="m-0">{formData.kotaPenerbit || 'Kota'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold m-0">{formData.jabatanGuru || 'Guru Mata Pelajaran'}</p>
                <div className="h-12" />
                <p className="font-bold m-0">{formData.namaGuru || 'Eli Ermawati, S.Pd.'}</p>
                <p className="text-[10px] text-slate-500 m-0">NIP. {formData.nipGuru || '...........................................................'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
