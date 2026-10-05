import { StudentSubmission, KopSuratConfig, DEFAULT_KOP_SURAT } from '../types';

export function getActiveKopSurat(custom?: KopSuratConfig): KopSuratConfig {
  if (custom) return custom;
  try {
    const saved = localStorage.getItem('eduquiz_kop_surat');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_KOP_SURAT, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_KOP_SURAT;
}

export function exportRecapToExcel(
  submissions: StudentSubmission[],
  classNameFilter: string = 'Semua Kelas',
  kkmScore: number = 75,
  customKop?: KopSuratConfig
) {
  const kop = getActiveKopSurat(customKop);
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
      <h2 style="margin: 0; padding: 0; font-size: 15pt;">${kop.instansiInduk}</h2>
      <h3 style="margin: 3px 0; padding: 0; font-size: 13pt;">${kop.dinasPendidikan}</h3>
      <h2 style="margin: 4px 0; padding: 0; font-size: 16pt;">${kop.namaSekolah}</h2>
      <p style="margin: 0; font-size: 10pt;">${kop.alamatSekolah} • ${kop.kontakSekolah}</p>
      <hr style="border: none; border-top: 2px solid #000; margin-top: 10px;" />
    </div>

    <div style="text-align: center; margin-bottom: 15px;">
      <h3 style="margin: 0; font-size: 13pt; text-decoration: underline;">${kop.judulLaporan}</h3>
      <p style="margin: 3px 0; font-size: 10pt; font-style: italic;">${kop.subJudulLaporan}</p>
    </div>

    <table style="width: 100%; border: none; margin-bottom: 12px; font-size: 10.5pt;">
      <tr>
        <td style="width: 20%; font-weight: bold;">Mata Pelajaran</td>
        <td style="width: 30%;">: ${kop.mataPelajaran}</td>
        <td style="width: 20%; font-weight: bold;">Titimangsa</td>
        <td style="width: 30%;">: ${kop.kotaPenerbit}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Rombel / Kelas</td>
        <td>: ${classNameFilter}</td>
        <td style="font-weight: bold;">Standar KKM</td>
        <td>: ${kkmScore}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Tahun / Semester</td>
        <td>: ${kop.tahunPelajaran} • ${kop.semester}</td>
        <td style="font-weight: bold;">Jumlah Peserta</td>
        <td>: ${totalStudents} Siswa</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Materi Pokok</td>
        <td colspan="3">: ${kop.materiPokok}</td>
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
            ${kop.jabatanPimpinan}
            <br /><br /><br /><br />
            <strong>${kop.namaPimpinan}</strong><br />
            NIP. ${kop.nipPimpinan}
          </td>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            ${kop.kotaPenerbit}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
            ${kop.jabatanGuru},
            <br /><br /><br /><br />
            <strong>${kop.namaGuru}</strong><br />
            NIP. ${kop.nipGuru}
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
  kkmScore: number = 75,
  customKop?: KopSuratConfig
) {
  const kop = getActiveKopSurat(customKop);
  const filtered = classNameFilter === 'Semua Kelas'
    ? [...submissions]
    : submissions.filter(s => s.className === classNameFilter);

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
  const highestScore = totalStudents > 0 ? Math.max(...filtered.map(s => s.score)) : 0;
  const lowestScore = totalStudents > 0 ? Math.min(...filtered.map(s => s.score)) : 0;

  const rowsHtml = filtered.map((s, idx) => `
    <tr>
      <td style="border: 1px solid #333; text-align: center; padding: 5px 3px;">${idx + 1}</td>
      <td style="border: 1px solid #333; text-align: center; padding: 5px 3px; font-weight: bold;">${s.attendanceNumber}</td>
      <td style="border: 1px solid #333; text-align: left; padding: 5px 6px; font-weight: 600;">${s.name}</td>
      <td style="border: 1px solid #333; text-align: center; padding: 5px 3px;">${s.className}</td>
      <td style="border: 1px solid #333; text-align: center; padding: 5px 3px; font-weight: bold; font-size: 11pt;">${s.score}</td>
      <td style="border: 1px solid #333; text-align: center; padding: 5px 3px; font-weight: bold; color: ${s.score >= kkmScore ? '#047857' : '#b91c1c'};">
        ${s.score >= kkmScore ? 'TUNTAS' : 'REMEDIAL'}
      </td>
      <td style="border: 1px solid #333; text-align: center; padding: 5px 3px;">${s.correctAnswersCount} / ${s.totalQuestions}</td>
      <td style="border: 1px solid #333; text-align: center; padding: 5px 3px;">${Math.round(s.timeSpentSeconds / 60)} mnt</td>
      <td style="border: 1px solid #333; text-align: center; padding: 5px 3px; font-size: 8.5pt;">${s.submittedAt}</td>
    </tr>
  `).join('');

  const printableHtml = `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="utf-8" />
    <title>Rekap Nilai Siswa - ${classNameFilter}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 12mm 10mm 12mm 10mm;
      }
      * { box-sizing: border-box; }
      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 10pt;
        color: #000;
        line-height: 1.25;
        margin: 0;
        padding: 0;
        background: #fff;
      }
      .header-kop {
        border-bottom: 3px double #000;
        padding-bottom: 6px;
        margin-bottom: 10px;
      }
      .kop-flex {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
      }
      .kop-logo {
        width: 60px;
        height: 60px;
        object-fit: contain;
        flex-shrink: 0;
      }
      .header-kop h2 {
        margin: 0;
        font-size: 12pt;
        font-weight: bold;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
      .header-kop h4 {
        margin: 2px 0 1px 0;
        font-size: 10.5pt;
        font-weight: bold;
        text-transform: uppercase;
      }
      .header-kop h3 {
        margin: 2px 0 1px 0;
        font-size: 13pt;
        font-weight: bold;
        text-transform: uppercase;
      }
      .header-kop p {
        margin: 1px 0;
        font-size: 8.5pt;
      }
      .meta-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10px;
        font-size: 9.5pt;
      }
      .meta-table td {
        padding: 2px 4px;
        vertical-align: top;
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 4px;
        font-size: 9pt;
      }
      .data-table th {
        background-color: #f1f5f9;
        border: 1px solid #000;
        padding: 5px 3px;
        text-align: center;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 8.5pt;
      }
      .data-table tr {
        page-break-inside: avoid;
      }
      .ttd-container {
        margin-top: 25px;
        width: 100%;
        page-break-inside: avoid;
      }
      .ttd-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 9.5pt;
      }
      .ttd-table td {
        text-align: center;
        vertical-align: top;
        width: 50%;
        padding: 4px;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style>
  </head>
  <body>
    <div class="header-kop">
      <div class="kop-flex">
        ${kop.showLogo && kop.logoUrl ? `<img src="${kop.logoUrl}" class="kop-logo" alt="Logo" />` : ''}
        <div style="text-align: center; flex: 1;">
          <h2>${kop.instansiInduk}</h2>
          <h4>${kop.dinasPendidikan}</h4>
          <h3>${kop.namaSekolah}</h3>
          <p>${kop.alamatSekolah}</p>
          <p style="font-size: 8pt; color: #333;">${kop.kontakSekolah}</p>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-bottom: 8px;">
      <span style="font-size: 11pt; font-weight: bold; text-decoration: underline; text-transform: uppercase;">
        ${kop.judulLaporan}
      </span>
      <p style="font-size: 8.5pt; font-style: italic; margin: 2px 0 0 0;">${kop.subJudulLaporan}</p>
    </div>

    <table class="meta-table">
      <tr>
        <td style="width: 18%; font-weight: bold;">Mata Pelajaran</td>
        <td style="width: 32%;">: ${kop.mataPelajaran}</td>
        <td style="width: 18%; font-weight: bold;">Titimangsa</td>
        <td style="width: 32%;">: ${kop.kotaPenerbit}, ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Rombel / Kelas</td>
        <td>: <strong>${classNameFilter}</strong></td>
        <td style="font-weight: bold;">Standar KKM</td>
        <td>: <strong>${kkmScore}</strong></td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Materi Pokok</td>
        <td>: ${kop.materiPokok}</td>
        <td style="font-weight: bold;">Tahun / Semester</td>
        <td>: ${kop.tahunPelajaran} • ${kop.semester}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Jumlah Peserta</td>
        <td>: ${totalStudents} Siswa</td>
        <td style="font-weight: bold;">Rata-rata Nilai</td>
        <td>: <strong>${averageScore}</strong> (Tertinggi: ${highestScore} / Terendah: ${lowestScore})</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Status Ketuntasan</td>
        <td colspan="3">: <strong style="color: #047857;">${passedStudents} Tuntas</strong>, <strong style="color: #b91c1c;">${totalStudents - passedStudents} Remedial</strong> (${passRate}% Ketuntasan Klasikal)</td>
      </tr>
    </table>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 30px;">No</th>
          <th style="width: 40px;">Absen</th>
          <th>Nama Lengkap Siswa</th>
          <th style="width: 55px;">Kelas</th>
          <th style="width: 55px;">Nilai</th>
          <th style="width: 75px;">Status</th>
          <th style="width: 70px;">Benar/Soal</th>
          <th style="width: 60px;">Durasi</th>
          <th style="width: 100px;">Waktu Selesai</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml || '<tr><td colspan="9" style="text-align: center; padding: 14px; font-style: italic; color: #666;">Belum ada data nilai kuis peserta didik.</td></tr>'}
      </tbody>
    </table>

    <div class="ttd-container">
      <table class="ttd-table">
        <tr>
          <td>
            Mengetahui,<br />
            ${kop.jabatanPimpinan}
            <br /><br /><br /><br />
            <strong>${kop.namaPimpinan}</strong><br />
            NIP. ${kop.nipPimpinan}
          </td>
          <td>
            ${kop.kotaPenerbit}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
            ${kop.jabatanGuru},
            <br /><br /><br /><br />
            <strong>${kop.namaGuru}</strong><br />
            NIP. ${kop.nipGuru}
          </td>
        </tr>
      </table>
    </div>
  </body>
  </html>
  `;

  // Print using hidden iframe for clean, isolated, reliable printing without dashboard chrome
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.width = '210mm';
  iframe.style.height = '297mm';
  iframe.style.border = 'none';
  iframe.style.opacity = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(printableHtml);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 400);
  } else {
    window.print();
  }
}

export function printSingleStudentCertificate(
  sub: StudentSubmission,
  kkmScore: number = 75,
  customKop?: KopSuratConfig
) {
  const kop = getActiveKopSurat(customKop);
  const isPassed = sub.score >= kkmScore;
  const printableHtml = `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="utf-8" />
    <title>Lembar Nilai - ${sub.name}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 18mm 14mm;
      }
      body {
        font-family: 'Times New Roman', serif;
        font-size: 11pt;
        color: #000;
        margin: 0;
        padding: 0;
      }
      .kop {
        border-bottom: 3px double #000;
        padding-bottom: 8px;
        margin-bottom: 18px;
      }
      .kop-flex {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
      }
      .kop-logo {
        width: 55px;
        height: 55px;
        object-fit: contain;
      }
      .kop h2 { margin: 0; font-size: 13pt; text-transform: uppercase; }
      .kop h3 { margin: 3px 0; font-size: 14pt; text-transform: uppercase; font-weight: bold; }
      .kop p { margin: 1px 0; font-size: 8.5pt; }
      .score-box {
        margin: 20px auto;
        width: 140px;
        height: 100px;
        border: 3px solid #000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      .table-info {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
      }
      .table-info td {
        padding: 6px 8px;
        border-bottom: 1px solid #ddd;
      }
    </style>
  </head>
  <body>
    <div class="kop">
      <div class="kop-flex">
        ${kop.showLogo && kop.logoUrl ? `<img src="${kop.logoUrl}" class="kop-logo" alt="Logo" />` : ''}
        <div style="text-align: center; flex: 1;">
          <h2>${kop.instansiInduk}</h2>
          <p style="font-weight: bold; text-transform: uppercase;">${kop.dinasPendidikan}</p>
          <h3>${kop.namaSekolah}</h3>
          <p>${kop.alamatSekolah}</p>
          <p style="font-size: 8pt; color: #444;">${kop.kontakSekolah}</p>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin: 15px 0;">
      <h3 style="margin: 0; text-decoration: underline;">BUKTI CAPAIAN ASESMEN INDIVIDUAL SISWA</h3>
      <p style="margin: 2px 0; font-size: 9.5pt; font-style: italic;">${kop.subJudulLaporan}</p>
    </div>

    <table class="table-info">
      <tr>
        <td style="width: 30%; font-weight: bold;">Nama Lengkap</td>
        <td>: <strong>${sub.name}</strong></td>
      </tr>
      <tr>
        <td style="font-weight: bold;">No. Absen / Kelas</td>
        <td>: Absen ${sub.attendanceNumber} • Kelas ${sub.className}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Mata Pelajaran</td>
        <td>: ${kop.mataPelajaran}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Materi Pokok</td>
        <td>: ${kop.materiPokok}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Tahun / Semester</td>
        <td>: ${kop.tahunPelajaran} • ${kop.semester}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Standar KKM</td>
        <td>: ${kkmScore}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Jawaban Benar</td>
        <td>: ${sub.correctAnswersCount} dari ${sub.totalQuestions} Soal</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Durasi Pengerjaan</td>
        <td>: ${Math.round(sub.timeSpentSeconds / 60)} menit (${sub.timeSpentSeconds} detik)</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Waktu Pengumpulan</td>
        <td>: ${sub.submittedAt}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Status Ketuntasan</td>
        <td>: <strong style="color: ${isPassed ? '#047857' : '#b91c1c'}; font-size: 12pt;">${isPassed ? 'TUNTAS' : 'REMEDIAL'}</strong></td>
      </tr>
    </table>

    <div class="score-box">
      <div style="font-size: 9pt; font-weight: bold; text-transform: uppercase;">Nilai Akhir</div>
      <div style="font-size: 32pt; font-weight: bold; line-height: 1;">${sub.score}</div>
    </div>

    <div style="margin-top: 35px;">
      <table style="width: 100%; border: none;">
        <tr>
          <td style="width: 50%; text-align: center;">
            Mengetahui,<br />
            Orang Tua / Wali Murid
            <br /><br /><br /><br />
            ( __________________________ )
          </td>
          <td style="width: 50%; text-align: center;">
            ${kop.kotaPenerbit}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
            ${kop.jabatanGuru},
            <br /><br /><br /><br />
            <strong>${kop.namaGuru}</strong><br />
            NIP. ${kop.nipGuru}
          </td>
        </tr>
      </table>
    </div>
  </body>
  </html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.width = '210mm';
  iframe.style.height = '297mm';
  iframe.style.border = 'none';
  iframe.style.opacity = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(printableHtml);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 400);
  } else {
    window.print();
  }
}

