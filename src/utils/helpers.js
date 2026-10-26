// Format tanggal ke format Indonesia
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  });
};

// Format tanggal singkat
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Format datetime
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  return d.toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }) + ' WIB';
};

// Truncate text
export const truncate = (str, n = 120) => {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 3) + '...' : str;
};

// Strip HTML
export const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

// Apakah konten berupa teks biasa (tanpa tag HTML sama sekali)?
const HAS_HTML_TAG = /<[a-z][\s\S]*>/i;

export const isPlainTextContent = (content) => {
  if (!content) return false;
  return !HAS_HTML_TAG.test(String(content));
};

// Ubah teks biasa dari textarea menjadi paragraf HTML agar baris baru
// (Enter) tetap tampil. Satu Enter = baris baru, dua Enter = paragraf baru.
// Konten yang sudah berisi HTML dibiarkan apa adanya.
export const formatNewsContent = (content) => {
  if (!content) return '';
  const text = String(content).replace(/\r\n?/g, '\n').trim();
  if (!text) return '';
  if (!isPlainTextContent(text)) return text;

  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('');
};

// Status complaint labels
export const complaintStatusLabel = {
  baru: 'Baru',
  diproses: 'Diproses',
  menunggu_informasi: 'Menunggu Informasi',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

export const complaintStatusClass = {
  baru: 'badge-info',
  diproses: 'badge-warning',
  menunggu_informasi: 'badge-warning',
  selesai: 'badge-success',
  ditolak: 'badge-error',
};

// Agenda status
export const agendaStatusLabel = {
  upcoming: 'Akan Datang',
  ongoing: 'Berlangsung',
  completed: 'Selesai',
};

export const agendaStatusClass = {
  upcoming: 'badge-info',
  ongoing: 'badge-warning',
  completed: 'badge-success',
};

// News category colors
export const categoryClass = {
  'Berita Instansi': 'badge-info',
  'Pelayanan Haji': 'badge-gold',
  'Pelayanan Umrah': 'badge-warning',
  'Manasik': 'badge-success',
  'Pengumuman': 'badge-error',
  'Edukasi Masyarakat': 'badge-gray',
};

// Image URL helper
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return path;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Generate slug
export const slugify = (text) =>
  text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
