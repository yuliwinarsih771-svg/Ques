import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Plus, Trash2, CheckCircle, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { StudentMasterData } from '../types';

interface TeacherInputStudentProps {
  studentsMaster: StudentMasterData[];
  onSaveMaster: (students: StudentMasterData[]) => void;
  onImportSuccess?: (count: number) => void;
}

export const TeacherInputStudent: React.FC<TeacherInputStudentProps> = ({
  studentsMaster,
  onSaveMaster,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'manual' | 'paste'>('file');
  const [selectedClass, setSelectedClass] = useState<string>('7A');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manual input state
  const [manualName, setManualName] = useState('');
  const [manualAbsen, setManualAbsen] = useState<number>(() => {
    const classStudents = studentsMaster.filter(s => s.className === selectedClass);
    return classStudents.length > 0 ? Math.max(...classStudents.map(s => s.attendanceNumber)) + 1 : 1;
  });
  const [manualNisn, setManualNisn] = useState('');

  // Paste text state
  const [pasteText, setPasteText] = useState('');

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV or tab-separated text
  const parseStudentData = (rawText: string, targetClass: string): StudentMasterData[] => {
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const parsed: StudentMasterData[] = [];
    let autoAbsen = 1;

    for (const line of lines) {
      // Ignore header lines
      if (/^(no|nama|absen|nisn|kelas)/i.test(line)) continue;

      // Split by tab, semicolon, or comma
      const parts = line.split(/[\t;,]+/).map(p => p.trim());
      if (parts.length === 0 || !parts[0]) continue;

      let name = '';
      let absen = autoAbsen;
      let nisn = '';
      let cls = targetClass;

      if (parts.length === 1) {
        // Just name
        name = parts[0];
      } else if (parts.length === 2) {
        // Could be "1, Ahmad" or "Ahmad, 7A"
        if (!isNaN(Number(parts[0]))) {
          absen = Number(parts[0]);
          name = parts[1];
        } else {
          name = parts[0];
          cls = parts[1] || targetClass;
        }
      } else if (parts.length >= 3) {
        // e.g. "1, Ahmad, 7A" or "1, 001234, Ahmad"
        if (!isNaN(Number(parts[0]))) {
          absen = Number(parts[0]);
          name = parts[1];
          if (parts[2].toUpperCase().startsWith('7')) {
            cls = parts[2].toUpperCase();
          } else {
            nisn = parts[2];
          }
        } else {
          name = parts[0];
          cls = parts[1] || targetClass;
          nisn = parts[2] || '';
        }
      }

      if (name.length > 1) {
        parsed.push({
          id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name,
          className: cls,
          attendanceNumber: absen,
          nisn,
        });
        autoAbsen = Math.max(autoAbsen, absen) + 1;
      }
    }

    return parsed;
  };

  // Handle File Upload (.xlsx, .xls, .csv, .txt, .tsv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isExcel = /\.(xlsx|xls)$/i.test(file.name);

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

          if (!jsonData || jsonData.length === 0) {
            setStatusMessage({ type: 'error', text: 'File Excel kosong atau tidak terbaca.' });
            return;
          }

          const parsedStudents: StudentMasterData[] = [];
          let autoAbsen = 1;

          for (const row of jsonData) {
            if (!row || row.length === 0) continue;
            const rowStr = row.map(cell => String(cell || '').trim());
            const firstCell = rowStr[0]?.toLowerCase() || '';

            // Skip header row if starts with no / absen / nama / nisn
            if (/^(no|absen|nama|nisn|kelas|rombel)/i.test(firstCell)) continue;

            let name = '';
            let absen = autoAbsen;
            let nisn = '';
            let cls = selectedClass;

            if (rowStr.length === 1 && rowStr[0]) {
              name = rowStr[0];
            } else if (rowStr.length >= 2) {
              if (!isNaN(Number(rowStr[0])) && Number(rowStr[0]) > 0) {
                absen = Number(rowStr[0]);
                name = rowStr[1];
                if (rowStr[2]) {
                  if (rowStr[2].toUpperCase().startsWith('7')) cls = rowStr[2].toUpperCase();
                  else nisn = rowStr[2];
                }
              } else {
                name = rowStr[0];
                if (rowStr[1].toUpperCase().startsWith('7')) cls = rowStr[1].toUpperCase();
                else nisn = rowStr[1];
              }
            }

            if (name && name.length > 1) {
              parsedStudents.push({
                id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                name,
                className: cls,
                attendanceNumber: absen,
                nisn: nisn || undefined,
              });
              autoAbsen = Math.max(autoAbsen, absen) + 1;
            }
          }

          if (parsedStudents.length === 0) {
            setStatusMessage({
              type: 'error',
              text: 'Tidak ada baris siswa yang terdeteksi dari Excel. Pastikan terdapat kolom Nomor dan Nama Siswa.',
            });
            return;
          }

          const updated = [...studentsMaster, ...parsedStudents];
          onSaveMaster(updated);
          setStatusMessage({
            type: 'success',
            text: `Berhasil mengimpor ${parsedStudents.length} siswa langsung dari file Excel (.xlsx).`,
          });
          if (onImportSuccess) onImportSuccess(parsedStudents.length);
        } catch {
          setStatusMessage({ type: 'error', text: 'Gagal memproses file Excel. Pastikan file tidak terkunci password.' });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Text / CSV reader
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          if (!text) {
            setStatusMessage({ type: 'error', text: 'File kosong atau tidak terbaca.' });
            return;
          }

          const newStudents = parseStudentData(text, selectedClass);
          if (newStudents.length === 0) {
            setStatusMessage({
              type: 'error',
              text: 'Gagal mendeteksi data siswa dari file. Pastikan format teks memuat kolom No/Absen dan Nama Siswa.',
            });
            return;
          }

          const updated = [...studentsMaster, ...newStudents];
          onSaveMaster(updated);
          setStatusMessage({
            type: 'success',
            text: `Berhasil mengimpor ${newStudents.length} siswa dari file.`,
          });
          if (onImportSuccess) onImportSuccess(newStudents.length);
        } catch {
          setStatusMessage({ type: 'error', text: 'Terjadi kesalahan saat membaca file.' });
        }
      };
      reader.readAsText(file);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Manual Add
  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      setStatusMessage({ type: 'error', text: 'Nama siswa wajib diisi.' });
      return;
    }

    const newStudent: StudentMasterData = {
      id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: manualName.trim(),
      className: selectedClass,
      attendanceNumber: manualAbsen,
      nisn: manualNisn.trim() || undefined,
    };

    const updated = [...studentsMaster, newStudent];
    onSaveMaster(updated);
    setStatusMessage({ type: 'success', text: `Siswa "${manualName.trim()}" berhasil ditambahkan ke kelas ${selectedClass}.` });
    setManualName('');
    setManualNisn('');
    setManualAbsen(manualAbsen + 1);
  };

  // Handle Bulk Paste
  const handlePasteSubmit = () => {
    if (!pasteText.trim()) {
      setStatusMessage({ type: 'error', text: 'Silakan tempel teks data siswa terlebih dahulu.' });
      return;
    }

    const parsed = parseStudentData(pasteText, selectedClass);
    if (parsed.length === 0) {
      setStatusMessage({ type: 'error', text: 'Format tidak terdeteksi. Gunakan format: No, Nama Siswa per baris.' });
      return;
    }

    const updated = [...studentsMaster, ...parsed];
    onSaveMaster(updated);
    setStatusMessage({ type: 'success', text: `Berhasil menambahkan ${parsed.length} siswa ke database.` });
    setPasteText('');
  };

  // Delete individual student
  const handleDeleteStudent = (id: string) => {
    const updated = studentsMaster.filter(s => s.id !== id);
    onSaveMaster(updated);
  };

  // Filter current class students
  const currentClassStudents = studentsMaster
    .filter(s => s.className === selectedClass)
    .sort((a, b) => a.attendanceNumber - b.attendanceNumber);

  return (
    <div className="space-y-6">
      {/* Header & Class Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            Input & Manajemen Data Siswa
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Data siswa digunakan untuk validasi kuis, pembatasan pengerjaan, dan pencetakan rekap nilai per kelas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Pilih Kelas:</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              const classStudents = studentsMaster.filter(s => s.className === e.target.value);
              const nextAbsen = classStudents.length > 0 ? Math.max(...classStudents.map(s => s.attendanceNumber)) + 1 : 1;
              setManualAbsen(nextAbsen);
            }}
            className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-indigo-700 bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {['7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H'].map(cls => (
              <option key={cls} value={cls}>Kelas {cls}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Alert Message */}
      {statusMessage && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-xs font-semibold hover:underline ml-4">
            Tutup
          </button>
        </div>
      )}

      {/* Tabs Menu Input */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('file')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'file'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          Import dari File (Excel/CSV/TXT)
        </button>

        <button
          onClick={() => setActiveTab('paste')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'paste'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Salin & Tempel (Copy-Paste)
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'manual'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          Input Siswa Manual
        </button>
      </div>

      {/* Tab 1: File Upload */}
      {activeTab === 'file' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Unggah File Data Siswa</h3>
              <p className="text-sm text-slate-500 mt-1">
                Mendukung file Excel langsung <strong>.XLSX, .XLS</strong> serta file teks <strong>.CSV, .TXT, atau .TSV</strong> dari Dapodik / Buku Nilai.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs text-slate-600 font-mono space-y-1">
              <p className="font-bold text-slate-700 font-sans mb-1">Contoh format tabel / baris file (Kolom 1: Absen, Kolom 2: Nama Siswa):</p>
              <p>1 | Ahmad Rizky Pratama</p>
              <p>2 | Aisyah Putri Rahmawati</p>
              <p>3 | Bagas Aditya Nugroho</p>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv, .txt, .tsv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/plain, text/csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-input"
              />
              <label
                htmlFor="file-upload-input"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 cursor-pointer transition-all transform active:scale-95"
              >
                <Upload className="w-5 h-5" />
                Pilih File dari Komputer / HP
              </label>
              <p className="text-xs text-slate-400 mt-2">Data otomatis dimasukkan ke rombel: <strong>Kelas {selectedClass}</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Paste */}
      {activeTab === 'paste' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Tempel Data dari Microsoft Excel atau Google Sheets</h3>
            <p className="text-xs text-slate-500 mt-1">
              Salin (Copy) kolom nomor absen dan nama siswa dari Excel, lalu tempel (Paste) di kotak berikut.
            </p>
          </div>

          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={8}
            placeholder={`Contoh isi:\n1\tAhmad Rizky Pratama\n2\tAisyah Putri Rahmawati\n3\tBagas Aditya Nugroho`}
            className="w-full p-3 font-mono text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />

          <div className="flex justify-end">
            <button
              onClick={handlePasteSubmit}
              className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 shadow-sm transition-all"
            >
              Simpan Data ke Kelas {selectedClass}
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Manual */}
      {activeTab === 'manual' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-800 mb-4">Input Siswa Satuan (Manual)</h3>
          <form onSubmit={handleAddManual} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">No. Absen</label>
              <input
                type="number"
                min="1"
                value={manualAbsen}
                onChange={(e) => setManualAbsen(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap Siswa</label>
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Contoh: Muhammad Galang Pratama"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">NISN / Catatan (Opsional)</label>
              <input
                type="text"
                value={manualNisn}
                onChange={(e) => setManualNisn(e.target.value)}
                placeholder="0012345678"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Tambahkan Siswa ke Kelas {selectedClass}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table of current class students */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Daftar Siswa Terdata: Kelas {selectedClass}
            </h3>
            <p className="text-xs text-slate-500">
              Total {currentClassStudents.length} siswa terdaftar di kelas {selectedClass}.
            </p>
          </div>
          {currentClassStudents.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm(`Yakin ingin mengosongkan seluruh data siswa kelas ${selectedClass}?`)) {
                  const updated = studentsMaster.filter(s => s.className !== selectedClass);
                  onSaveMaster(updated);
                  setStatusMessage({ type: 'success', text: `Data siswa kelas ${selectedClass} berhasil dikosongkan.` });
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Kosongkan Kelas {selectedClass}
            </button>
          )}
        </div>

        {currentClassStudents.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-sm text-slate-500">Belum ada data siswa untuk Kelas {selectedClass}.</p>
            <p className="text-xs text-slate-400 mt-1">Gunakan opsi Import dari File atau Salin & Tempel di atas untuk memasukkan data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 text-xs font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Absen</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4 w-28 text-center">Kelas</th>
                  <th className="py-3 px-4 w-36">NISN</th>
                  <th className="py-3 px-4 w-20 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentClassStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-center text-slate-700">{std.attendanceNumber}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{std.name}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-indigo-700 bg-indigo-50/30">{std.className}</td>
                    <td className="py-2.5 px-4 text-xs font-mono text-slate-500">{std.nisn || '-'}</td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => handleDeleteStudent(std.id)}
                        title="Hapus Siswa"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
