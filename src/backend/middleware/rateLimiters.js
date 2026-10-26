import rateLimit from 'express-rate-limit';

// Limiter umum untuk seluruh endpoint API.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

// Hanya untuk percobaan login. Jangan dipasang pada seluruh router /api/auth,
// karena /api/auth/me dipanggil setiap kali halaman admin dimuat.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Terlalu banyak percobaan login. Coba lagi setelah 15 menit.' },
});

// Hanya untuk pengiriman formulir publik (POST). Endpoint baca/ubah milik admin
// tidak boleh terkena batas ini.
export const publicFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Terlalu banyak pengiriman formulir. Coba lagi setelah 1 jam.' },
});

// Export pengaduan menghasilkan file besar dan memuat data pribadi. Batasi
// frekuensinya agar tidak dipakai untuk membanjiri server.
export const exportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Terlalu banyak permintaan ekspor. Coba lagi setelah 15 menit.' },
});
