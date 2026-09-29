import { StudentSubmission } from '../types';

export function exportRecapToExcel(
  submissions: StudentSubmission[],
  classNameFilter: string = 'Semua Kelas',
  kkmScore: number = 75
) {
  const filtered = classNameFilter === 'Semua Kelas'
    ? [...submissions]
    : submissions.filter(s => s.className === classNameFilter);

  // Sort by attendance number asc
  filtered.sort((a, b) => {
    if (a.className !== b.className) return a.className.localeCompare(b.className);
    return a.attendanceNumber - b.attendanceNumber;
  });

  const totalStudents = filtered.length;
  const passedStudents = filtered.filter(s => s.score >= kkmScore).length;
  const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : '0';
  const averageScore = totalStudents > 0
    ? (filtered.reduce((sum, s) => sum + s.score, 0) / totalStudents).toFixed(1)
    : '0';

  const rowsHtml = filtered.map((s, idx) => `
    <tr>
      <td style="border: 1px solid #000; text-align: center; padding: 6px;">${idx + 1}</td>
      <td style="border: 1px solid #000; text-align: center; padding: 6px;">${s.attendanceNumber}</td>
      <td style="border: 1px solid #000; text-align: left; padding: 6px; font-weight: bold;">${s.name}</td>
      <td style="border: 1px solid #000; text-align: center; padding: 6px;">${s.className}</td>
      <td style="border: 1px solid #000; text-align: center; padding: 6px; font-weight: bold;">${s.score}</td>
      <td style="border: 1px solid #000; text-align: center; padding: 6px; color: ${s.score >= kkmScore ? '#059669' : '#dc2626'}; font-weight: bold;">
        ${s.score >= kkmScore ? 'TUNTAS' : 'REMEDIAL'}
      </td>
      <td style="border: 1px solid #000; text-align: center; padding: 6px;">${s.correctAnswersCount} / ${s.totalQuestions}</td>
      <td style="border: 1px solid #000; text-align: center; padding: 6px;">${Math.round(s.timeSpentSeconds / 60)} mnt</td>
      <td style="border: 1px solid #000; text-align: center; padding: 6px;">${s.submittedAt}</td>
    </tr>
  `).join('');

  const excelContent = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>Rekap Nilai</x:Name>
            <x:WorksheetOptions>
              <x:DisplayGridlines/>
              <x:FitToPage/>
              <x:Print>
                <x:FitWidth>1</x:FitWidth>
                <x:FitHeight>99</x:FitHeight>
                <x:ValidPrinterInfo/>
                <x:PaperSizeIndex>9</x:PaperSizeIndex>
              </x:Print>
            </x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 11pt; }
      table { border-collapse: collapse; width: 100%; margin-top: 15px; }
      th { background-color: #f1f5f9; border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; }
    </style>
  </head>
  <body>
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="margin: 0; padding: 0; font-size: 16pt;">PEMERINTAH DAERAH DINAS PENDIDIKAN</h2>
      <h3 style="margin: 4px 0; padding: 0; font-size: 14pt;">LAPORAN HASIL PENILAIAN SUMATIF BAHASA INGGRIS</h3>
      <p style="margin: 0; font-size: 11pt;">Chapter 1: Introducing my self and other (Descriptive Text) & Chapter 2: Culinary and Me</p>
      <p style="margin: 4px 0 0 0; font-size: 10pt; font-style: italic;">Kuis Interaktif by Eli Ermawati, S.Pd. • SMP Kelas VII</p>
      <hr style="border: none; border-top: 2px solid #000; margin-top: 10px;" />
    </div>

    <table style="width: 100%; border: none; margin-bottom: 12px; font-size: 10.5pt;">
      <tr>
        <td style="width: 20%; font-weight: bold;">Mata Pelajaran</td>
        <td style="width: 30%;">: Bahasa Inggris</td>
        <td style="width: 20%; font-weight: bold;">Tanggal Rekap</td>
        <td style="width: 30%;">: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Rombel / Kelas</td>
        <td>: ${classNameFilter}</td>
        <td style="font-weight: bold;">Standar KKM</td>
        <td>: ${kkmScore}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Jumlah Peserta</td>
        <td>: ${totalStudents} Siswa</td>
        <td style="font-weight: bold;">Rata-rata Nilai</td>
        <td>: ${averageScore} (${passRate}% Tuntas)</td>
      </tr>
    </table>

    <table>
      <thead>
        <tr>
          <th style="width: 40px;">No</th>
          <th style="width: 50px;">Absen</th>
          <th>Nama Siswa</th>
          <th style="width: 70px;">Kelas</th>
          <th style="width: 70px;">Nilai</th>
          <th style="width: 90px;">Status</th>
          <th style="width: 80px;">Benar</th>
          <th style="width: 70px;">Waktu</th>
          <th style="width: 130px;">Waktu Selesai</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml || '<tr><td colspan="9" style="text-align:center; padding: 12px;">Belum ada data nilai peserta.</td></tr>'}
      </tbody>
    </table>

    <div style="margin-top: 35px; width: 100%;">
      <table style="width: 100%; border: none;">
        <tr>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            Mengetahui,<br />
            Kepala Sekolah / Wali Kelas
            <br /><br /><br /><br />
            ( __________________________ )<br />
            NIP. ........................................
          </td>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            Guru Mata Pelajaran Bahasa Inggris,
            <br /><br /><br /><br />
            <strong>Eli Ermawati, S.Pd.</strong><br />
            NIP. ........................................
          </td>
        </tr>
      </table>
    </div>
  </body>
  </html>
  `;

  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Rekap_Nilai_${classNameFilter.replace(/\s+/g, '_')}_${Date.now()}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printClassRecap(
  submissions: StudentSubmission[],
  classNameFilter: string = 'Semua Kelas',
  kkmScore: number = 75
) {
  window.print();
}
