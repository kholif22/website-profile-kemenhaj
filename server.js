import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

import authRoutes from './src/backend/routes/auth.js';
import newsRoutes from './src/backend/routes/news.js';
import announcementRoutes from './src/backend/routes/announcements.js';
import agendaRoutes from './src/backend/routes/agendas.js';
import serviceRoutes from './src/backend/routes/services.js';
import faqRoutes from './src/backend/routes/faqs.js';
import complaintRoutes from './src/backend/routes/complaints.js';
import userRoutes from './src/backend/routes/users.js';
import settingsRoutes from './src/backend/routes/settings.js';
import activityRoutes from './src/backend/routes/activity.js';
import statsRoutes from './src/backend/routes/stats.js';
import { initializeDatabase } from './src/backend/models/database.js';

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: Variabel JWT_SECRET wajib diisi dan minimal 32 karakter. Atur pada file .env sebelum menjalankan server.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

// Rate limiters
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Terlalu banyak percobaan login. Coba lagi setelah 15 menit.' } });
const publicFormLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { error: 'Terlalu banyak pengiriman formulir. Coba lagi setelah 1 jam.' } });

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'"],
      frameSrc: ['https://www.google.com', 'https://maps.google.com', 'https://www.google.co.id'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: null,
    },
  },
}));
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? false : true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', apiLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'PLHUT Magetan API is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/agendas', agendaRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/complaints', publicFormLimiter, complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/stats', statsRoutes);

// Serve React build.
// Hashed assets are immutable (safe to cache for a year); index.html must always
// revalidate. Otherwise a cached index.html can reference asset hashes that no longer
// exist, the server would answer with index.html (text/html) and — combined with
// `X-Content-Type-Options: nosniff` — the browser refuses to execute the module script
// and the page goes blank.
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders(res, filePath) {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
}));

// Unmatched API routes must never fall back to the SPA shell.
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
});

// SPA fallback: only for real page navigations. Missing assets/uploads/API paths
// return a proper 404 instead of the HTML shell.
app.get('*', (req, res) => {
  const isAsset = req.path.startsWith('/assets/') || req.path.startsWith('/uploads/') || req.path.startsWith('/api/');
  const wantsHtml = req.accepts(['html', 'json']) === 'html';
  if (isAsset || !wantsHtml) {
    return res.status(404).json({ error: 'Tidak ditemukan.' });
  }
  return res.sendFile(path.join(__dirname, 'dist', 'index.html'), {
    headers: { 'Cache-Control': 'no-cache, must-revalidate' },
  });
});

// Global error handler (handles multer errors & unexpected failures consistently)
app.use((err, _req, res, _next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Ukuran file melebihi batas yang diizinkan.' });
  }
  if (err && err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err) {
    console.error('Unhandled error:', err.message);
    return res.status(500).json({ error: 'Kesalahan server.' });
  }
  return res.status(500).json({ error: 'Kesalahan server.' });
});

await initializeDatabase();

app.listen(PORT, () => {
  console.log(`PLHUT Magetan Server running on http://localhost:${PORT}`);
});
