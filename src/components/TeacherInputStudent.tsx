import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Users,
  Info,
  FileCheck,
  Sparkles,
  RotateCcw,
  Check,
  Eye,
  X,
  Loader2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { StudentMasterData } from '../types';
import { CLASS_SAMPLE_STUDENTS, INITIAL_STUDENT_MASTER } from '../data/quizData';
import { soundManager } from '../utils/audio';

interface TeacherInputStudentProps {
  studentsMaster: StudentMasterData[];
  onSaveMaster: (students: StudentMasterData[]) => void;
  onImportSuccess?: (count: number) => void;
}

interface LastUploadedInfo {
  fileName: string;
  fileSize: string;
  count: number;
  classesSummary: Record<string, number>;
  timestamp: string;
  importedStudents: StudentMasterData[];
  crossClassDuplicates: Array<{ name: string; targetClass: string; existingClass: string }>;
}

interface StagedPreviewInfo {
  fileName: string;
  fileSize: string;
  students: StudentMasterData[];
  classesSummary: Record<string, number>;
  crossClassDuplicates: Array<{ name: string; targetClass: string; existingClass: string }>;
}

export const TeacherInputStudent: React.FC<TeacherInputStudentProps> = ({
  studentsMaster,
  onSaveMaster,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'manual' | 'paste'>('file');
  const [selectedClass, setSelectedClass] = useState<string>('7A');
  const [templateClass, setTemplateClass] = useState<string>('7A');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmClearClass, setConfirmClearClass] = useState<boolean>(false);
  const [confirmClearAllClasses, setConfirmClearAllClasses] = useState<boolean>(false);
  const [confirmResetAll, setConfirmResetAll] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Undo / Backup state
  const [previousMaster, setPreviousMaster] = useState<StudentMasterData[] | null>(null);
  const [lastUploadedInfo, setLastUploadedInfo] = useState<LastUploadedInfo | null>(null);

  // Staged Upload Preview & Mode state
  const [stagedPreview, setStagedPreview] = useState<StagedPreviewInfo | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Manual input state
  const [manualName, setManualName] = useState('');
  const [manualAbsen, setManualAbsen] = useState<number>(() => {
    const classStudents = studentsMaster.filter((s) => s.className === selectedClass);
    return classStudents.length > 0 ? Math.max(...classStudents.map((s) => s.attendanceNumber)) + 1 : 1;
  });
  const [manualNisn, setManualNisn] = useState('');

  // Paste text state
  const [pasteText, setPasteText] = useState('');

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger browser download safely
  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. Download official template (.xlsx or .csv) based on selected templateClass with DISTINCT names
  const handleDownloadTemplate = (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      let templateData: Array<{
        'No': number;
        'Nama Siswa': string;
        'Kelas': string;
        'NISN': string;
      }> = [];

      if (templateClass === 'ALL') {
        Object.entries(CLASS_SAMPLE_STUDENTS).forEach(([cls, students]) => {
          students.forEach((s, idx) => {
            templateData.push({
              'No': idx + 1,
              'Nama Siswa': s.name,
              'Kelas': cls,
              'NISN': s.nisn,
            });
          });
        });
      } else {
        const targetCls = templateClass;
        const list = CLASS_SAMPLE_STUDENTS[targetCls] || CLASS_SAMPLE_STUDENTS['7A'];
        templateData = list.map((s, idx) => ({
          'No': idx + 1,
          'Nama Siswa': s.name,
          'Kelas': targetCls,
          'NISN': s.nisn,
        }));
      }

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      worksheet['!cols'] = [
        { wch: 8 },  // No
        { wch: 32 }, // Nama Siswa
        { wch: 12 }, // Kelas
        { wch: 18 }, // NISN
      ];

      const workbook = XLSX.utils.book_new();
      const sheetName = templateClass === 'ALL' ? 'Semua_Kelas_7A-7H' : `Data_Kelas_${templateClass}`;
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const fileLabel = templateClass === 'ALL' ? 'Semua_Kelas_7A-7H' : `Kelas_${templateClass}`;

      if (format === 'csv') {
        const csvContent = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        triggerDownload(blob, `Template_Data_Siswa_${fileLabel}.csv`);
      } else {
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        triggerDownload(blob, `Template_Data_Siswa_${fileLabel}.xlsx`);
      }

      setStatusMessage({
        type: 'success',
        text: `Template ${format.toUpperCase()} untuk ${templateClass === 'ALL' ? 'Semua Kelas (7A–7H)' : 'Kelas ' + templateClass} berhasil diunduh dengan daftar nama unik per kelas.`,
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Gagal membuat file template. Silakan coba lagi.',
      });
    }
  };

  // Helper: Normalize class string into 7A..7H
  const normalizeClass = (raw: string, fallback: string): string => {
    if (!raw) return fallback;
    const str = String(raw).trim().toUpperCase();
    const m = str.match(/(?:KELAS|ROMBEL)?\s*(?:7|VII)[\s._-]*([A-H])/i);
    if (m && m[1]) {
      return `7${m[1].toUpperCase()}`;
    }
    if (/^[A-H]$/i.test(str)) {
      return `7${str.toUpperCase()}`;
    }
    if (['7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H'].includes(str)) {
      return str;
    }
    return fallback;
  };

  // Smart parser: detect columns and parse rows
  const parseRowsToStudents = (rows: unknown[][], defaultClass: string): StudentMasterData[] => {
    if (!rows || rows.length === 0) return [];

    let headerIndex = -1;
    let colNo = -1;
    let colName = -1;
    let colClass = -1;
    let colNisn = -1;

    // 1. Find header row in first 12 rows
    for (let r = 0; r < Math.min(rows.length, 12); r++) {
      const row = rows[r];
      if (!Array.isArray(row)) continue;

      const cells = row.map((c) => String(c ?? '').trim().toLowerCase());

      const foundName = cells.findIndex(
        (c) => /(nama|name|siswa|peserta|murid|student)/i.test(c) && !/(sekolah|guru|pengajar|mapel|wali)/i.test(c)
      );
      const foundNo = cells.findIndex(
        (c) => /^(no|nomor|absen|urut|number|#)$/i.test(c) || /^(no\.|nomor\s*urut|no\s*absen)/i.test(c)
      );
      const foundClass = cells.findIndex((c) => /(kelas|class|rombel|tingkat)/i.test(c));
      const foundNisn = cells.findIndex((c) => /(nisn|nis|id|induk)/i.test(c));

      if (foundName !== -1) {
        headerIndex = r;
        colName = foundName;
        colNo = foundNo;
        colClass = foundClass;
        colNisn = foundNisn;
        break;
      }
    }

    // Fallback default column indexes if no explicit header row was identified
    if (headerIndex === -1) {
      const firstRow = rows[0] || [];
      const isFirstRowData = firstRow.some((c) => !isNaN(Number(c)) && Number(c) > 0);
      headerIndex = isFirstRowData ? -1 : 0;
      colNo = 0;
      colName = 1;
      colClass = 2;
      colNisn = 3;
    } else {
      if (colName === -1 && colNo !== -1) colName = colNo + 1;
      if (colNo === -1 && colName > 0) colNo = colName - 1;
    }

    const startRow = headerIndex + 1;
    const parsedStudents: StudentMasterData[] = [];
    let autoAbsen = 1;

    for (let r = startRow; r < rows.length; r++) {
      const row = rows[r];
      if (!Array.isArray(row) || row.length === 0) continue;

      const rowStr = row.map((cell) => String(cell ?? '').trim());

      // If entire row is empty, skip
      if (rowStr.every((val) => !val)) continue;

      // Extract raw values based on identified columns
      let rawNo = colNo >= 0 && colNo < rowStr.length ? rowStr[colNo] : '';
      let rawName = colName >= 0 && colName < rowStr.length ? rowStr[colName] : '';
      let rawClass = colClass >= 0 && colClass < rowStr.length ? rowStr[colClass] : '';
      let rawNisn = colNisn >= 0 && colNisn < rowStr.length ? rowStr[colNisn] : '';

      // If colName was empty, search for first valid text column
      if (!rawName) {
        for (let i = 0; i < rowStr.length; i++) {
          if (i !== colNo && isNaN(Number(rowStr[i])) && rowStr[i].length >= 3) {
            rawName = rowStr[i];
            break;
          }
        }
      }

      // If rawName looks like a title row, skip
      if (/^(daftar siswa|rekap|kelas|tahun pelajaran|mata pelajaran|nomor urut|tanda tangan)/i.test(rawName)) {
        continue;
      }

      if (rawName && rawName.length >= 2) {
        let absen = autoAbsen;
        const parsedNum = parseInt(rawNo, 10);
        if (!isNaN(parsedNum) && parsedNum > 0 && parsedNum <= 100) {
          absen = parsedNum;
        }

        const studentClass = normalizeClass(rawClass, defaultClass);

        parsedStudents.push({
          id: `std-${Date.now()}-${r}-${Math.random().toString(36).substr(2, 5)}`,
          name: rawName,
          className: studentClass,
          attendanceNumber: absen,
          nisn: rawNisn && !isNaN(Number(rawNisn)) ? rawNisn : undefined,
        });

        autoAbsen = Math.max(autoAbsen, absen) + 1;
      }
    }

    return parsedStudents;
  };

  // Process selected file (Excel / CSV / TXT) and show STAGED PREVIEW for confirmation
  const processFile = async (file: File) => {
    setIsProcessing(true);
    setStatusMessage(null);
    setStagedPreview(null);

    const fileSizeStr =
      file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    try {
      const buffer = await file.arrayBuffer();
      let allParsedStudents: StudentMasterData[] = [];

      try {
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: true, raw: false });

        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) continue;

          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            blankrows: false,
          }) as unknown[][];

          if (jsonData && jsonData.length > 0) {
            let sheetDefaultClass = selectedClass;
            const matchClass = sheetName.match(/(?:KELAS|ROMBEL)?\s*(?:7|VII)[\s._-]*([A-H])/i);
            if (matchClass && matchClass[1]) {
              sheetDefaultClass = `7${matchClass[1].toUpperCase()}`;
            }

            const sheetStudents = parseRowsToStudents(jsonData, sheetDefaultClass);
            allParsedStudents = [...allParsedStudents, ...sheetStudents];
          }
        }
      } catch {
        // XLSX parsing fallback to text parser handled below
      }

      // Fallback to text/CSV parser if workbook returned no students
      if (allParsedStudents.length === 0) {
        const text = new TextDecoder('utf-8').decode(buffer);
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const rows = lines.map((line) => {
          const delimiter = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
          return line.split(delimiter).map((p) => p.replace(/^["']|["']$/g, '').trim());
        });
        allParsedStudents = parseRowsToStudents(rows, selectedClass);
      }

      if (allParsedStudents.length === 0) {
        setStatusMessage({
          type: 'error',
          text: `File "${file.name}" tidak dapat diurai. Pastikan file Excel/CSV memuat kolom Nomor Urut dan Nama Siswa.`,
        });
        setIsProcessing(false);
        return;
      }

      // Compute summary by class
      const summary: Record<string, number> = {};
      allParsedStudents.forEach((s) => {
        summary[s.className] = (summary[s.className] || 0) + 1;
      });

      // Check cross-class duplicates
      const crossClassDuplicates: Array<{ name: string; targetClass: string; existingClass: string }> = [];
      allParsedStudents.forEach((s) => {
        const match = studentsMaster.find(
          (m) => m.className !== s.className && m.name.trim().toLowerCase() === s.name.trim().toLowerCase()
        );
        if (match) {
          crossClassDuplicates.push({
            name: s.name,
            targetClass: s.className,
            existingClass: match.className,
          });
        }
      });

      setStagedPreview({
        fileName: file.name,
        fileSize: fileSizeStr,
        students: allParsedStudents,
        classesSummary: summary,
        crossClassDuplicates,
      });

      setStatusMessage({
        type: 'success',
        text: `File "${file.name}" berhasil dianalisis (${allParsedStudents.length} data siswa terdeteksi). Silakan periksa pratinjau di bawah dan klik "Konfirmasi & Simpan ke Database".`,
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: `Gagal membaca file "${file.name}". Pastikan format file adalah .xlsx, .xls, atau .csv.`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm and commit staged import to database
  const handleConfirmSaveImport = () => {
    if (!stagedPreview || stagedPreview.students.length === 0) return;

    // Backup current master for 1-click Undo
    setPreviousMaster([...studentsMaster]);

    let newMaster: StudentMasterData[] = [];
    const importedClasses = Object.keys(stagedPreview.classesSummary);

    if (importMode === 'replace') {
      // Replace classes present in upload, keep others
      const kept = studentsMaster.filter((s) => !importedClasses.includes(s.className));
      newMaster = [...kept, ...stagedPreview.students];
    } else {
      // Append mode: keep existing students, add only non-duplicate students
      const existingKeys = new Set(
        studentsMaster.map((s) => `${s.className}-${s.name.trim().toLowerCase()}`)
      );
      const toAdd = stagedPreview.students.filter(
        (s) => !existingKeys.has(`${s.className}-${s.name.trim().toLowerCase()}`)
      );
      newMaster = [...studentsMaster, ...toAdd];
    }

    onSaveMaster(newMaster);
    soundManager.playSuccessSound();

    if (importedClasses.length > 0 && importedClasses[0]) {
      setSelectedClass(importedClasses[0]);
      setTemplateClass(importedClasses[0]);
    }

    setLastUploadedInfo({
      fileName: stagedPreview.fileName,
      fileSize: stagedPreview.fileSize,
      count: stagedPreview.students.length,
      classesSummary: stagedPreview.classesSummary,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      importedStudents: stagedPreview.students,
      crossClassDuplicates: stagedPreview.crossClassDuplicates,
    });

    setStatusMessage({
      type: 'success',
      text: `🎉 Berhasil! Sebanyak ${stagedPreview.students.length} siswa dari "${stagedPreview.fileName}" telah tersimpan permanen ke database!`,
    });

    if (onImportSuccess) onImportSuccess(stagedPreview.students.length);
    setStagedPreview(null);
  };

  // Cancel staged preview
  const handleCancelStagedPreview = () => {
    setStagedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setStatusMessage(null);
  };

  // Handle standard file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input value so selecting the same file again triggers onChange
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Undo last import
  const handleUndoImport = () => {
    if (previousMaster) {
      onSaveMaster(previousMaster);
      setPreviousMaster(null);
      setLastUploadedInfo(null);
      setStatusMessage({
        type: 'success',
        text: 'Impor terakhir berhasil dibatalkan (data dikembalikan ke keadaan sebelumnya).',
      });
    }
  };

  // Load demo template data with 1 click using distinct names for the active class
  const handleLoadDemoData = () => {
    const list = CLASS_SAMPLE_STUDENTS[selectedClass] || CLASS_SAMPLE_STUDENTS['7A'];
    const demoStudents: StudentMasterData[] = list.map((s, idx) => ({
      id: `demo-${selectedClass}-${idx + 1}-${Date.now()}`,
      attendanceNumber: idx + 1,
      name: s.name,
      className: selectedClass,
      nisn: s.nisn,
    }));

    const kept = studentsMaster.filter((s) => s.className !== selectedClass);
    const updated = [...kept, ...demoStudents];
    onSaveMaster(updated);
    setStatusMessage({
      type: 'success',
      text: `Contoh data ${demoStudents.length} siswa unik untuk Kelas ${selectedClass} berhasil dimuat ke database.`,
    });
  };

  // Restore complete 80 distinct students across 7A - 7H
  const handleRestoreFullMaster = () => {
    onSaveMaster(INITIAL_STUDENT_MASTER);
    setConfirmResetAll(false);
    setStatusMessage({
      type: 'success',
      text: `Database lengkap berhasil dipulihkan: 80 siswa berbeda terdaftar di 8 rombel (7A s/d 7H, masing-masing 10 siswa unik tanpa nama kembar antar kelas).`,
    });
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
    setStatusMessage({
      type: 'success',
      text: `Siswa "${manualName.trim()}" (Absen ${manualAbsen}) berhasil ditambahkan ke Kelas ${selectedClass}.`,
    });
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

    const lines = pasteText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const rows = lines.map((line) => line.split(/[\t;,]+/).map((p) => p.trim()));
    const parsed = parseRowsToStudents(rows, selectedClass);

    if (parsed.length === 0) {
      setStatusMessage({
        type: 'error',
        text: 'Format teks tidak terdeteksi. Gunakan format tabel: No, Nama Siswa per baris.',
      });
      return;
    }

    const updated = [...studentsMaster, ...parsed];
    onSaveMaster(updated);
    setStatusMessage({
      type: 'success',
      text: `Berhasil menambahkan ${parsed.length} siswa ke Kelas ${selectedClass}.`,
    });
    setPasteText('');
  };

  // Delete individual student permanently
  const handleDeleteStudent = (id: string) => {
    const target = studentsMaster.find((s) => s.id === id);
    const updated = studentsMaster.filter((s) => s.id !== id);
    onSaveMaster(updated);
    setStatusMessage({
      type: 'success',
      text: target
        ? `Siswa "${target.name}" (Absen ${target.attendanceNumber}) Kelas ${target.className} berhasil dihapus permanen dari database.`
        : 'Data siswa berhasil dihapus permanen dari database.',
    });
  };

  // Filter current class students
  const currentClassStudents = studentsMaster
    .filter((s) => s.className === selectedClass)
    .sort((a, b) => a.attendanceNumber - b.attendanceNumber);

  return (
    <div className="space-y-6">
      {/* Header & Class Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Upload className="w-6 h-6 text-indigo-600" />
            <span>Upload & Manajemen Data Siswa</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Unggah file Excel/CSV sesuai template resmi untuk memasukkan data nama siswa secara instan ke database kuis.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Rombel / Kelas Aktif:</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              const newCls = e.target.value;
              setSelectedClass(newCls);
              setTemplateClass(newCls);
              const classStudents = studentsMaster.filter((s) => s.className === newCls);
              const nextAbsen =
                classStudents.length > 0 ? Math.max(...classStudents.map((s) => s.attendanceNumber)) + 1 : 1;
              setManualAbsen(nextAbsen);
            }}
            className="px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-indigo-700 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs cursor-pointer"
          >
            {['7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H'].map((cls) => (
              <option key={cls} value={cls}>
                Kelas {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Alert Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs sm:text-sm animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-2 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-bold">{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-extrabold hover:underline ml-4 px-2 py-1 bg-white/70 rounded-md shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Tabs Menu Input (Rata Kiri) */}
      <div className="flex items-center justify-start gap-1 border-b border-slate-200 overflow-x-auto text-left">
        <button
          onClick={() => setActiveTab('file')}
          className={`px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center justify-start gap-2 shrink-0 text-left ${
            activeTab === 'file'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload className="w-4 h-4 shrink-0" />
          <span>Upload File Sesuai Template</span>
        </button>

        <button
          onClick={() => setActiveTab('paste')}
          className={`px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center justify-start gap-2 shrink-0 text-left ${
            activeTab === 'paste'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          <span>Salin & Tempel (Copy-Paste)</span>
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center justify-start gap-2 shrink-0 text-left ${
            activeTab === 'manual'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Input Siswa Manual</span>
        </button>
      </div>

      {/* Tab 1: File Upload Sesuai Template */}
      {activeTab === 'file' && (
        <div className="space-y-5">
          {/* STEP 1: DOWNLOAD TEMPLATE CARD WITH CLASS DROPDOWN */}
          <div className="bg-linear-to-r from-blue-50/90 to-indigo-50/90 rounded-2xl p-5 border border-blue-200/90 shadow-2xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Download className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Langkah 1: Unduh Format Template Excel / CSV
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pilih kelas yang Anda inginkan pada menu drop down di bawah, lalu klik download template. Kolom kelas di dalam template akan otomatis terisi sesuai pilihan Anda.
                </p>
              </div>
            </div>

            {/* Dedicated Class Dropdown & Download Buttons Bar */}
            <div className="bg-white/95 p-4 rounded-xl border border-blue-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label htmlFor="template-class-select" className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                  <span>Pilih Kelas untuk Template:</span>
                </label>
                <div className="relative">
                  <select
                    id="template-class-select"
                    value={templateClass}
                    onChange={(e) => setTemplateClass(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-50/70 hover:bg-indigo-50 border-2 border-indigo-300 rounded-xl font-extrabold text-indigo-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors cursor-pointer shadow-2xs"
                  >
                    <option value="7A">Kelas 7A</option>
                    <option value="7B">Kelas 7B</option>
                    <option value="7C">Kelas 7C</option>
                    <option value="7D">Kelas 7D</option>
                    <option value="7E">Kelas 7E</option>
                    <option value="7F">Kelas 7F</option>
                    <option value="7G">Kelas 7G</option>
                    <option value="7H">Kelas 7H</option>
                    <option value="ALL">Semua Kelas (7A - 7H Sekaligus)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons to download template with dynamic label */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('xlsx')}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                  title={`Unduh Template Excel untuk ${templateClass === 'ALL' ? 'Semua Kelas' : 'Kelas ' + templateClass}`}
                >
                  <FileSpreadsheet className="w-4 h-4 shrink-0" />
                  <span>
                    Download Template Excel {templateClass === 'ALL' ? '(Semua Kelas)' : `(Kelas ${templateClass})`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('csv')}
                  className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
                  title="Unduh Template dalam format teks CSV (.csv)"
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>Format CSV</span>
                </button>
              </div>
            </div>

            {/* Template visual specification */}
            <div className="bg-white/90 p-3.5 rounded-xl border border-blue-200/60 text-xs text-slate-700 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <Info className="w-4 h-4 text-indigo-600" />
                  <span>Susunan Kolom Template yang Akan Diunduh:</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  Target Template: <strong className="text-indigo-700">{templateClass === 'ALL' ? 'Semua Kelas (7A–7H)' : `Kelas ${templateClass}`}</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800 block">Kolom A: No</span>
                  <span className="text-slate-500">Nomor absen (1, 2, 3...)</span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800 block">Kolom B: Nama Siswa</span>
                  <span className="text-slate-500">Nama lengkap peserta</span>
                </div>
                <div className="p-2 bg-indigo-50/60 border border-indigo-200 rounded-lg">
                  <span className="font-bold text-indigo-900 block">Kolom C: Kelas</span>
                  <span className="text-indigo-700 font-bold">
                    {templateClass === 'ALL' ? '7A s/d 7H' : templateClass}
                  </span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800 block">Kolom D: NISN</span>
                  <span className="text-slate-500">Nomor induk (opsional)</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: NATIVE CLICKABLE DROPZONE */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`block max-w-xl mx-auto text-center border-2 border-dashed rounded-2xl p-6 sm:p-8 transition-all cursor-pointer select-none ${
                isDragging
                  ? 'border-indigo-600 bg-indigo-50/70 scale-[1.01]'
                  : 'border-indigo-300 hover:border-indigo-600 bg-indigo-50/20 hover:bg-indigo-50/40 shadow-xs'
              }`}
            >
              <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
                {isProcessing ? (
                  <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
                {isProcessing
                  ? 'Sedang Membaca & Menganalisis File...'
                  : 'Langkah 2: Klik atau Tarik File ke Sini'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                Pilih file Excel (<strong>.xlsx, .xls</strong>) atau file teks (<strong>.csv</strong>) dari komputer / HP Anda.
              </p>

              {/* Supported formats badges */}
              <div className="flex items-center justify-center gap-2 my-3">
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-md border border-emerald-300">
                  .XLSX (Excel)
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-md border border-emerald-300">
                  .XLS
                </span>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold text-[11px] rounded-md border border-blue-300">
                  .CSV
                </span>
                <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 font-bold text-[11px] rounded-md border border-slate-300">
                  .TXT
                </span>
              </div>

              {/* Native HTML file input */}
              <input
                id="native-file-upload-input"
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv, .txt, .tsv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/plain, text/csv"
                onChange={handleFileChange}
                className="sr-only"
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                  title="Upload file data siswa dari perangkat (Excel .xlsx / .csv)"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Data Siswa</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 mt-3">
                Target Rombel Default: <strong>Kelas {selectedClass}</strong> (atau mengikuti kolom/sheet Kelas di dalam file)
              </p>
            </div>

            {/* STEP 3: STAGED PREVIEW & CONFIRMATION BEFORE SAVING */}
            {stagedPreview && (
              <div className="p-5 rounded-2xl bg-indigo-50/80 border-2 border-indigo-300 shadow-md space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-extrabold text-indigo-950 flex items-center gap-2">
                        <span>Langkah 3: Pratinjau Hasil Pembacaan File</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900 text-[11px] font-mono">
                          {stagedPreview.students.length} Siswa Terdeteksi
                        </span>
                      </h4>
                      <p className="text-xs text-indigo-700 mt-0.5">
                        File: <strong className="font-mono">{stagedPreview.fileName}</strong> ({stagedPreview.fileSize}) • Periksa data sebelum disimpan ke database.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelStagedPreview}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 text-slate-500" />
                      <span>Batal</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmSaveImport}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Konfirmasi & Simpan ke Database</span>
                    </button>
                  </div>
                </div>

                {/* Class summary badges & Mode selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Class breakdown */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Rombel yang Akan Diperbarui:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(stagedPreview.classesSummary).map(([cls, cnt]) => (
                        <span
                          key={cls}
                          className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-900 font-bold rounded-lg text-xs shadow-2xs"
                        >
                          Kelas {cls}: <strong>{cnt} siswa</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mode selector */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Metode Penyimpanan Data:
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 shadow-2xs">
                        <input
                          type="radio"
                          name="importMode"
                          value="replace"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Ganti Rombel Terkait (Replace)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 shadow-2xs">
                        <input
                          type="radio"
                          name="importMode"
                          value="append"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Gabungkan / Tambah (Append)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Cross-class duplicate warning if any */}
                {stagedPreview.crossClassDuplicates.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Catatan Identitas: Ditemukan {stagedPreview.crossClassDuplicates.length} nama siswa yang mirip/sama di rombel lain:</span>
                    </div>
                    <div className="flex flex-wrap gap-1 font-mono text-[11px] pt-1">
                      {stagedPreview.crossClassDuplicates.slice(0, 6).map((d, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-white border border-amber-300 rounded text-amber-900">
                          {d.name} ({d.targetClass} vs {d.existingClass})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sample rows preview table */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Contoh Baris Terbaca (Maksimal 6 Baris Pertama):
                  </span>
                  <div className="overflow-x-auto rounded-xl border border-indigo-200 bg-white">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-indigo-50/60 text-indigo-900 font-bold border-b border-indigo-200">
                        <tr>
                          <th className="py-2 px-3 text-center w-14">Absen</th>
                          <th className="py-2 px-3">Nama Siswa</th>
                          <th className="py-2 px-3 text-center w-20">Kelas</th>
                          <th className="py-2 px-3 text-center w-32">NISN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {stagedPreview.students.slice(0, 6).map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-center font-bold text-slate-600">{s.attendanceNumber}</td>
                            <td className="py-2 px-3 font-bold text-slate-800">{s.name}</td>
                            <td className="py-2 px-3 text-center font-bold text-indigo-700 bg-indigo-50/30">
                              {s.className}
                            </td>
                            <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">
                              {s.nisn || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {stagedPreview.students.length > 6 && (
                    <p className="text-[11px] text-slate-500 italic text-right">
                      ...dan {stagedPreview.students.length - 6} siswa lainnya siap disimpan.
                    </p>
                  )}
                </div>

                {/* Bottom Confirm Button Row */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleCancelStagedPreview}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSaveImport}
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Konfirmasi & Simpan ke Database ({stagedPreview.students.length} Siswa)</span>
                  </button>
                </div>
              </div>
            )}

            {/* LAST UPLOADED SUMMARY CARD */}
            {lastUploadedInfo && !stagedPreview && (
              <div className="p-4 rounded-2xl bg-emerald-50/90 border-2 border-emerald-300 shadow-xs space-y-3 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>File Terakhir Berhasil Diimpor:</span>
                        <span className="text-emerald-700 font-mono">{lastUploadedInfo.fileName}</span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        {lastUploadedInfo.fileSize} • Pukul {lastUploadedInfo.timestamp} • Total <strong>{lastUploadedInfo.count} siswa</strong> tersimpan ke database
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {previousMaster && (
                      <button
                        type="button"
                        onClick={handleUndoImport}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-rose-700 hover:text-rose-800 font-bold text-xs rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Batalkan impor ini dan kembalikan data sebelumnya"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Urungkan Impor (Undo)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Class count breakdown */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-bold text-slate-700">Rincian Rombel:</span>
                  {Object.entries(lastUploadedInfo.classesSummary).map(([cls, cnt]) => (
                    <span
                      key={cls}
                      className="px-2 py-0.5 bg-white border border-emerald-300 text-emerald-800 font-bold rounded text-[11px]"
                    >
                      Kelas {cls}: {cnt} siswa
                    </span>
                  ))}
                </div>

                {/* Cross-class duplicate warning if any */}
                {lastUploadedInfo.crossClassDuplicates.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Catatan: Ada {lastUploadedInfo.crossClassDuplicates.length} nama siswa yang juga ada di kelas lain:</span>
                    </div>
                    <div className="flex flex-wrap gap-1 font-mono text-[11px] pt-1">
                      {lastUploadedInfo.crossClassDuplicates.slice(0, 5).map((d, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-white border border-amber-300 rounded text-amber-900">
                          {d.name} ({d.targetClass} vs {d.existingClass})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Paste */}
      {activeTab === 'paste' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Tempel Data dari Microsoft Excel atau Google Sheets
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Salin (Copy) kolom nomor absen dan nama siswa dari lembar kerja Excel, lalu tempel (Paste) di kotak berikut.
            </p>
          </div>

          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={8}
            placeholder={`Contoh isi:\n1\tAhmad Rizky Pratama\t7A\n2\tAisyah Putri Rahmawati\t7A\n3\tBagas Aditya Nugroho\t7A`}
            className="w-full p-3 font-mono text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setPasteText('')}
              className="px-4 py-2 border border-slate-300 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50"
            >
              Hapus
            </button>
            <button
              onClick={handlePasteSubmit}
              className="px-6 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 shadow-xs transition-all"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs sm:text-sm"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">NISN (Opsional)</label>
              <input
                type="text"
                value={manualNisn}
                onChange={(e) => setManualNisn(e.target.value)}
                placeholder="0012345678"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs sm:text-sm"
              />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-xs transition-all cursor-pointer"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Daftar Siswa Terdaftar: Kelas {selectedClass}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Total <strong>{currentClassStudents.length} siswa</strong> terdaftar di rombel {selectedClass} (Total keseluruhan: {studentsMaster.length} siswa).
            </p>
          </div>
          {currentClassStudents.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  try {
                    const exportData = currentClassStudents.map((s) => ({
                      'No. Absen': s.attendanceNumber,
                      'Nama Lengkap': s.name,
                      'Kelas': s.className,
                      'NISN': s.nisn || '',
                    }));
                    const ws = XLSX.utils.json_to_sheet(exportData);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, `Siswa_${selectedClass}`);
                    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                    triggerDownload(
                      new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
                      `Data_Siswa_Kelas_${selectedClass}.xlsx`
                    );
                  } catch {
                    // ignore
                  }
                }}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Download data siswa kelas ini ke file Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmClearClass(true)}
                className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                title={`Hapus permanen seluruh siswa Kelas ${selectedClass} dari database`}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Kosongkan Kelas {selectedClass} (Hapus Permanen)</span>
              </button>
            </div>
          )}
        </div>

        {currentClassStudents.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-700">Kelas {selectedClass} Kosong (0 Siswa Terdaftar).</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Seluruh data siswa untuk kelas ini telah kosong. Anda dapat mengunggah file Excel/CSV melalui area upload di atas atau menambahkan siswa satu per satu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
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
                    <td className="py-2.5 px-4 text-center font-bold text-indigo-700 bg-indigo-50/30">
                      {std.className}
                    </td>
                    <td className="py-2.5 px-4 text-xs font-mono text-slate-500">{std.nisn || '-'}</td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => handleDeleteStudent(std.id)}
                        title="Hapus Siswa Permanen"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

        {/* Class distribution pills and bottom database management actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-600 mr-1">Rombel Terdaftar:</span>
            {['7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H'].map((cls) => {
              const count = studentsMaster.filter((s) => s.className === cls).length;
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => {
                    setSelectedClass(cls);
                    setTemplateClass(cls);
                  }}
                  className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                    selectedClass === cls
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title={`Klik untuk beralih melihat siswa Kelas ${cls}`}
                >
                  {cls}: {count}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {studentsMaster.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmClearAllClasses(true)}
                className="text-rose-600 hover:text-rose-800 font-bold hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                title="Hapus permanen seluruh data siswa dari semua rombel di database"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Kosongkan Semua Kelas ({studentsMaster.length} Siswa)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setConfirmResetAll(true)}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
              title="Muat ulang 80 siswa unik untuk seluruh kelas 7A - 7H"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Muat Master Contoh (80 Siswa 7A–7H)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Muat Ulang Master Lengkap */}
      {confirmResetAll && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">Muat Database Siswa Lengkap?</h3>
              <p className="text-xs text-slate-500">
                Sistem akan memuat 80 nama siswa berbeda untuk 8 kelas (Kelas 7A sampai 7H, masing-masing 10 siswa unik tanpa ada nama kembar antar kelas).
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmResetAll(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleRestoreFullMaster}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Ya, Muat Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Kosongkan Kelas Tunggal */}
      {confirmClearClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">
                Hapus Permanen Siswa Kelas {selectedClass}?
              </h3>
              <p className="text-xs text-slate-500">
                Tindakan ini akan menghapus permanen seluruh {currentClassStudents.length} siswa di Kelas {selectedClass} dari database browser. Data tidak akan kembali lagi saat aplikasi dimuat ulang.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmClearClass(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setConfirmClearClass(false);
                  const updated = studentsMaster.filter((s) => s.className !== selectedClass);
                  onSaveMaster(updated);
                  setStatusMessage({
                    type: 'success',
                    text: `🗑️ Seluruh data siswa Kelas ${selectedClass} (${currentClassStudents.length} siswa) berhasil dihapus permanen dari database.`,
                  });
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Kosongkan Seluruh Database Siswa */}
      {confirmClearAllClasses && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">
                Kosongkan Seluruh Database Siswa?
              </h3>
              <p className="text-xs text-slate-500">
                Tindakan ini akan menghapus permanen seluruh {studentsMaster.length} siswa dari semua rombel (7A s/d 7H). Database siswa akan menjadi kosong sepenuhnya dan data tidak akan kembali saat halaman dimuat ulang.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmClearAllClasses(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setConfirmClearAllClasses(false);
                  onSaveMaster([]);
                  setStatusMessage({
                    type: 'success',
                    text: '🗑️ Seluruh database siswa berhasil dikosongkan permanen. Database kini bersih untuk data baru.',
                  });
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Ya, Kosongkan Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
