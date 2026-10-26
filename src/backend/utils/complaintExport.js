import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  COMPLAINT_STATUSES,
  COMPLAINT_STATUS_LABELS,
  formatComplaintDateTime,
  formatFilterSummary,
} from './complaintFilters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_NAME = 'PLHUT Kabupaten Magetan';
const FONT_REGULAR = path.join(__dirname, '../assets/fonts/NotoSans-Regular.ttf');
const FONT_BOLD = path.join(__dirname, '../assets/fonts/NotoSans-Bold.ttf');

const EXCEL_BORDER = {
  top: { style: 'thin', color: { argb: 'FFD6D3D1' } },
  left: { style: 'thin', color: { argb: 'FFD6D3D1' } },
  bottom: { style: 'thin', color: { argb: 'FFD6D3D1' } },
  right: { style: 'thin', color: { argb: 'FFD6D3D1' } },
};

const sanitizeCell = (value) => {
  if (value === null || value === undefined) return '';
  const text = String(value);
  // Cegah formula injection saat file dibuka di Excel, termasuk bila formula
  // didahului spasi/tab.
  return /^[=+\-@]/.test(text.trimStart()) ? `'${text}` : text;
};

const statusCounts = (rows) => COMPLAINT_STATUSES.reduce((acc, status) => {
  acc[status] = rows.filter((item) => item.status === status).length;
  return acc;
}, {});

export async function generateComplaintExcel({
  rows,
  filters,
  user,
  settings = {},
  includeInternalNotes = false,
}) {
  const siteName = settings.site_name || SITE_NAME;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = siteName;
  workbook.lastModifiedBy = user?.name || siteName;
  workbook.created = new Date();
  workbook.modified = new Date();

  const columns = [
    { header: 'No', width: 6 },
    { header: 'No. Referensi', width: 23 },
    { header: 'Tanggal Masuk', width: 20 },
    { header: 'Terakhir Diubah', width: 20 },
    { header: 'Nama Pelapor', width: 23 },
    { header: 'Kontak', width: 24 },
    { header: 'Kategori', width: 21 },
    { header: 'Subjek', width: 42 },
    { header: 'Isi Pesan', width: 65 },
    { header: 'Status', width: 19 },
    ...(includeInternalNotes ? [{ header: 'Catatan Internal', width: 45 }] : []),
    { header: 'Persetujuan Data', width: 18 },
  ];

  const sheet = workbook.addWorksheet('Daftar Pengaduan', {
    views: [{ state: 'frozen', ySplit: 4 }],
    pageSetup: {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9,
      margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 },
    },
  });
  columns.forEach((column, index) => {
    sheet.getColumn(index + 1).width = column.width;
  });

  const titleRow = sheet.addRow(['Daftar Pengaduan Masyarakat']);
  sheet.mergeCells(titleRow.number, 1, titleRow.number, columns.length);
  titleRow.height = 28;
  titleRow.getCell(1).font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF171717' } };
  titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };

  const metaRow = sheet.addRow([
    `${siteName} | Diekspor oleh ${user?.name || '-'} pada ${formatComplaintDateTime(new Date())}`,
  ]);
  sheet.mergeCells(metaRow.number, 1, metaRow.number, columns.length);
  metaRow.height = 21;
  metaRow.getCell(1).font = { name: 'Calibri', size: 10, color: { argb: 'FF44403C' } };
  metaRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F4' } };
  metaRow.getCell(1).alignment = { vertical: 'middle' };

  const filterRow = sheet.addRow([`Filter: ${formatFilterSummary(filters)} | Jumlah: ${rows.length} pengaduan`]);
  sheet.mergeCells(filterRow.number, 1, filterRow.number, columns.length);
  filterRow.height = 19;
  filterRow.getCell(1).font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF57534E' } };
  filterRow.getCell(1).alignment = { vertical: 'middle', wrapText: true };

  const headerRow = sheet.addRow(columns.map((column) => column.header));
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF171717' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = EXCEL_BORDER;
  });

  sheet.autoFilter = {
    from: { row: headerRow.number, column: 1 },
    to: { row: headerRow.number, column: columns.length },
  };

  rows.forEach((item, index) => {
    const values = [
      index + 1,
      item.reference_number,
      formatComplaintDateTime(item.created_at),
      formatComplaintDateTime(item.updated_at),
      item.reporter_name,
      item.contact,
      item.category,
      item.subject,
      item.message,
      COMPLAINT_STATUS_LABELS[item.status] || item.status,
      ...(includeInternalNotes ? [item.internal_notes || ''] : []),
      item.data_consent ? 'Ya' : 'Tidak',
    ];

    const row = sheet.addRow(values.map(sanitizeCell));
    row.height = 42;
    row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
      cell.font = { name: 'Calibri', size: 9, color: { argb: 'FF292524' } };
      cell.alignment = {
        vertical: 'top',
        horizontal: columnNumber === 1 ? 'center' : 'left',
        wrapText: true,
      };
      cell.border = EXCEL_BORDER;
      if (index % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFAF9' } };
      }
    });
  });

  const summary = workbook.addWorksheet('Rekap Status', {
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, paperSize: 9 },
  });
  summary.getColumn(1).width = 30;
  summary.getColumn(2).width = 16;
  summary.getColumn(3).width = 16;

  const summaryTitle = summary.addRow(['Rekap Status Pengaduan']);
  summary.mergeCells(summaryTitle.number, 1, summaryTitle.number, 3);
  summaryTitle.getCell(1).font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  summaryTitle.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF171717' } };
  summaryTitle.height = 24;

  const summaryHeader = summary.addRow(['Status', 'Jumlah', 'Persentase']);
  summaryHeader.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF57534E' } };
    cell.border = EXCEL_BORDER;
    cell.alignment = { horizontal: 'center' };
  });

  const counts = statusCounts(rows);
  COMPLAINT_STATUSES.forEach((status) => {
    const count = counts[status] || 0;
    const row = summary.addRow([
      COMPLAINT_STATUS_LABELS[status],
      count,
      rows.length ? `${((count / rows.length) * 100).toFixed(1)}%` : '0%',
    ]);
    row.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = EXCEL_BORDER;
    });
  });

  const totalRow = summary.addRow(['Total', rows.length, rows.length ? '100%' : '0%']);
  totalRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10, bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F4' } };
    cell.border = EXCEL_BORDER;
  });

  const info = workbook.addWorksheet('Info Ekspor');
  info.getColumn(1).width = 28;
  info.getColumn(2).width = 82;
  const infoTitle = info.addRow(['Informasi Ekspor']);
  info.mergeCells(infoTitle.number, 1, infoTitle.number, 2);
  infoTitle.getCell(1).font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  infoTitle.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF171717' } };
  infoTitle.height = 24;

  const infoRows = [
    ['Nama Petugas', user?.name || '-'],
    ['Waktu Ekspor', formatComplaintDateTime(new Date())],
    ['Filter', formatFilterSummary(filters)],
    ['Jumlah Pengaduan', rows.length],
    ['Catatan Internal', includeInternalNotes ? 'Disertakan' : 'Tidak disertakan'],
    ['Keterangan', 'Dokumen internal. Memuat data pribadi pelapor. Gunakan hanya untuk kepentingan pelayanan.'],
  ];
  infoRows.forEach(([label, value]) => {
    const row = info.addRow([label, value]);
    row.getCell(1).font = { name: 'Calibri', size: 10, bold: true };
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F4' } };
    row.getCell(2).font = { name: 'Calibri', size: 10 };
    row.getCell(2).alignment = { wrapText: true, vertical: 'top' };
    row.eachCell((cell) => { cell.border = EXCEL_BORDER; });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
}

export async function generateComplaintPdf({
  rows,
  filters,
  user,
  settings = {},
  includeMessage = false,
  includeInternalNotes = false,
}) {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 32, bottom: 44, left: 30, right: 30 },
    bufferPages: true,
    info: {
      Title: 'Laporan Rekap Pengaduan Masyarakat',
      Author: settings.site_name || SITE_NAME,
      Subject: formatFilterSummary(filters),
      Creator: 'Sistem PLHUT Kabupaten Magetan',
    },
  });

  if (existsSync(FONT_REGULAR)) doc.registerFont('Body', FONT_REGULAR);
  else doc.registerFont('Body', 'Helvetica');
  if (existsSync(FONT_BOLD)) doc.registerFont('Bold', FONT_BOLD);
  else doc.registerFont('Bold', 'Helvetica-Bold');

  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  const pageWidth = doc.page.width;
  const left = 30;
  const contentWidth = pageWidth - left - 30;
  const pageBottom = () => doc.page.height - 44 - 18;
  const siteName = settings.site_name || SITE_NAME;
  const contactParts = [settings.site_phone, settings.site_email].filter(Boolean);
  const columns = [
    { label: 'No', width: 24, align: 'center' },
    { label: 'No. Referensi', width: 100, align: 'left' },
    { label: 'Tanggal', width: 82, align: 'left' },
    { label: 'Pelapor', width: 100, align: 'left' },
    { label: 'Kontak', width: 96, align: 'left' },
    { label: 'Kategori', width: 90, align: 'left' },
    { label: 'Subjek', width: 203, align: 'left' },
    { label: 'Status', width: 86, align: 'left' },
  ];

  let currentY = 32;

  const drawContinuationHeader = () => {
    doc.font('Bold').fontSize(8).fillColor('#171717')
      .text(`${siteName} - Laporan Pengaduan`, left, 22, { width: contentWidth });
    currentY = 38;
  };

  const drawTableHeader = () => {
    const headerHeight = 24;
    let x = left;
    doc.rect(left, currentY, contentWidth, headerHeight).fill('#171717');
    columns.forEach((column) => {
      doc.rect(x, currentY, column.width, headerHeight).stroke('#171717');
      doc.font('Bold').fontSize(7.4).fillColor('#FFFFFF')
        .text(column.label, x + 3, currentY + 6, {
          width: column.width - 6,
          align: 'center',
          lineBreak: false,
        });
      x += column.width;
    });
    currentY += headerHeight;
  };

  const drawRow = (values, index) => {
    const texts = values.map((value) => (value === null || value === undefined || value === '' ? '-' : String(value)));
    doc.font('Body').fontSize(7.2);
    const heights = texts.map((text, columnIndex) => doc.heightOfString(text, {
      width: columns[columnIndex].width - 6,
      align: columns[columnIndex].align,
      lineGap: 0.5,
    }));
    let rowHeight = Math.max(...heights) + 7;
    rowHeight = Math.min(rowHeight, 84);

    if (currentY + rowHeight > pageBottom()) {
      doc.addPage();
      drawContinuationHeader();
      drawTableHeader();
    }

    let x = left;
    texts.forEach((text, columnIndex) => {
      const column = columns[columnIndex];
      if (index % 2 === 1) {
        doc.rect(x, currentY, column.width, rowHeight).fill('#FAFAF9');
      }
      doc.rect(x, currentY, column.width, rowHeight).stroke('#D6D3D1');
      doc.font('Body').fontSize(7.2).fillColor('#292524')
        .text(text, x + 3, currentY + 4, {
          width: column.width - 6,
          align: column.align,
          lineGap: 0.5,
          height: rowHeight - 6,
          ellipsis: true,
        });
      x += column.width;
    });
    currentY += rowHeight;
  };

  const ensureSpace = (height) => {
    if (currentY + height > pageBottom()) {
      doc.addPage();
      drawContinuationHeader();
    }
  };

  // Header dokumen
  doc.font('Bold').fontSize(15).fillColor('#171717')
    .text(siteName, left, currentY, { width: contentWidth });
  currentY = doc.y + 2;
  const address = [settings.site_address, contactParts.join(' | ')].filter(Boolean).join(' | ');
  if (address) {
    doc.font('Body').fontSize(8).fillColor('#57534E')
      .text(address, left, currentY, { width: contentWidth });
    currentY = doc.y + 4;
  }
  doc.moveTo(left, currentY).lineTo(left + contentWidth, currentY).lineWidth(2).stroke('#D4AF37');
  currentY += 8;
  doc.font('Bold').fontSize(12).fillColor('#171717')
    .text('LAPORAN REKAP PENGADUAN MASYARAKAT', left, currentY, { width: contentWidth });
  currentY = doc.y + 2;
  doc.font('Body').fontSize(8).fillColor('#57534E')
    .text(`${formatFilterSummary(filters)} | ${rows.length} pengaduan`, left, currentY, { width: contentWidth });
  currentY = doc.y + 5;

  drawTableHeader();
  rows.forEach((item, index) => {
    drawRow([
      index + 1,
      item.reference_number,
      formatComplaintDateTime(item.created_at),
      item.reporter_name,
      item.contact,
      item.category,
      item.subject,
      COMPLAINT_STATUS_LABELS[item.status] || item.status,
    ], index);
  });

  // Rekap status di bawah tabel
  ensureSpace(90);
  currentY += 12;
  doc.font('Bold').fontSize(9).fillColor('#171717')
    .text('Rekap Status', left, currentY);
  currentY = doc.y + 4;
  const counts = statusCounts(rows);
  COMPLAINT_STATUSES.forEach((status) => {
    ensureSpace(16);
    const count = counts[status] || 0;
    doc.font('Body').fontSize(8).fillColor('#292524')
      .text(`${COMPLAINT_STATUS_LABELS[status]}: ${count}`, left + 4, currentY, { width: 200 });
    currentY = doc.y + 1;
  });

  // Lampiran detail opsional
  if (includeMessage) {
    doc.addPage();
    drawContinuationHeader();
    doc.font('Bold').fontSize(13).fillColor('#171717')
      .text('Lampiran Detail Pengaduan', left, currentY, { width: contentWidth });
    currentY = doc.y + 2;
    doc.font('Body').fontSize(8).fillColor('#57534E')
      .text('Isi pesan lengkap disertakan sesuai pilihan saat mengekspor.', left, currentY, { width: contentWidth });
    currentY = doc.y + 10;

    rows.forEach((item, index) => {
      const message = item.message || '-';
      doc.font('Body').fontSize(8);
      const messageHeight = doc.heightOfString(message, { width: contentWidth, lineGap: 2 });
      const notes = includeInternalNotes ? (item.internal_notes || '-') : null;
      const notesHeight = notes ? doc.heightOfString(notes, { width: contentWidth, lineGap: 2 }) : 0;
      const blockHeight = 78 + Math.min(messageHeight, 150) + (notes ? Math.min(notesHeight, 90) : 0);
      ensureSpace(blockHeight);

      doc.font('Bold').fontSize(9).fillColor('#171717')
        .text(`${index + 1}. ${item.reference_number} - ${item.subject}`, left, currentY, { width: contentWidth });
      currentY = doc.y + 2;
      doc.font('Body').fontSize(7.8).fillColor('#57534E')
        .text(`${formatComplaintDateTime(item.created_at)} | ${item.reporter_name} | ${item.contact} | ${item.category} | ${COMPLAINT_STATUS_LABELS[item.status] || item.status}`,
          left, currentY, { width: contentWidth });
      currentY = doc.y + 4;
      doc.font('Body').fontSize(8).fillColor('#292524')
        .text(message, left, currentY, { width: contentWidth, lineGap: 2 });
      currentY = doc.y + 4;
      if (notes) {
        doc.font('Bold').fontSize(7.5).fillColor('#92400E')
          .text('Catatan internal:', left, currentY, { width: contentWidth });
        currentY = doc.y + 1;
        doc.font('Body').fontSize(7.8).fillColor('#57534E')
          .text(notes, left, currentY, { width: contentWidth, lineGap: 2 });
        currentY = doc.y + 4;
      }
      doc.moveTo(left, currentY).lineTo(left + contentWidth, currentY).lineWidth(0.5).stroke('#E7E5E4');
      currentY += 10;
    });
  }

  // Footer dan nomor halaman
  const range = doc.bufferedPageRange();
  for (let pageIndex = range.start; pageIndex < range.start + range.count; pageIndex += 1) {
    doc.switchToPage(pageIndex);
    doc.font('Body').fontSize(7).fillColor('#78716C')
      .text(`Dokumen internal - memuat data pribadi. Dicetak pada ${formatComplaintDateTime(new Date())} oleh ${user?.name || '-'}`,
        left, doc.page.height - 28, {
          width: contentWidth - 90,
          lineBreak: false,
        });
    doc.font('Body').fontSize(7).fillColor('#78716C')
      .text(`Halaman ${pageIndex + 1} dari ${range.count}`, left, doc.page.height - 28, {
        width: contentWidth,
        align: 'right',
        lineBreak: false,
      });
  }

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    try {
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
