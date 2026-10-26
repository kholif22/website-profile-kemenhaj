// Filter dan format data pengaduan yang dipakai bersama oleh endpoint daftar
// dan endpoint export, agar hasil export selalu sama dengan yang terlihat di UI.

export const COMPLAINT_STATUSES = ['baru', 'diproses', 'menunggu_informasi', 'selesai', 'ditolak'];

export const COMPLAINT_STATUS_LABELS = {
  baru: 'Baru',
  diproses: 'Diproses',
  menunggu_informasi: 'Menunggu Informasi',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WIB_OFFSET = '+07:00';

export function isValidDateOnly(value) {
  if (!DATE_ONLY_PATTERN.test(String(value || ''))) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

// Tanggal dari input <input type="date"> adalah tanggal lokal WIB. Database
// menyimpan DATETIME dalam UTC, jadi batas filter harus dikonversi agar laporan
// tidak bergeser 7 jam.
const wibDateStartToUtc = (value) => new Date(`${value}T00:00:00${WIB_OFFSET}`)
  .toISOString()
  .slice(0, 19)
  .replace('T', ' ');

const wibDateEndExclusiveToUtc = (value) => {
  const date = new Date(`${value}T00:00:00${WIB_OFFSET}`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

export function buildComplaintFilters(query = {}) {
  const clauses = [];
  const params = [];
  const filters = {
    status: '',
    search: '',
    date_from: '',
    date_to: '',
  };

  const status = String(query.status || '').trim();
  if (status) {
    clauses.push('status = ?');
    params.push(status);
    filters.status = status;
  }

  const search = String(query.search || '').trim();
  if (search) {
    clauses.push('(reporter_name LIKE ? OR subject LIKE ? OR reference_number LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    filters.search = search;
  }

  const dateFrom = String(query.date_from || '').trim();
  if (dateFrom) {
    clauses.push('created_at >= ?');
    params.push(wibDateStartToUtc(dateFrom));
    filters.date_from = dateFrom;
  }

  const dateTo = String(query.date_to || '').trim();
  if (dateTo) {
    clauses.push('created_at < ?');
    params.push(wibDateEndExclusiveToUtc(dateTo));
    filters.date_to = dateTo;
  }

  return {
    where: clauses.length ? clauses.join(' AND ') : '1=1',
    params,
    filters,
  };
}

export function parseSqliteDate(value) {
  if (!value) return null;
  const text = String(value);
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(text)
    ? `${text.replace(' ', 'T')}Z`
    : text;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Jakarta',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function formatComplaintDateTime(value) {
  const date = parseSqliteDate(value);
  if (!date) return '-';
  const parts = Object.fromEntries(
    dateTimeFormatter.formatToParts(date).map((part) => [part.type, part.value])
  );
  return `${parts.day}-${parts.month}-${parts.year} ${parts.hour}:${parts.minute} WIB`;
}

export function formatFilterSummary(filters = {}) {
  const parts = [];
  if (filters.status) {
    parts.push(`Status: ${COMPLAINT_STATUS_LABELS[filters.status] || filters.status}`);
  }
  if (filters.search) parts.push(`Pencarian: "${filters.search}"`);
  if (filters.date_from || filters.date_to) {
    parts.push(`Tanggal: ${filters.date_from || 'awal'} s.d. ${filters.date_to || 'akhir'}`);
  }
  return parts.length ? parts.join(' | ') : 'Semua data pengaduan';
}
