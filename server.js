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

app.use(helmet({ contentSecurityPolicy: false }));
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

// Serve React build
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

await initializeDatabase();

app.listen(PORT, () => {
  console.log(`PLHUT Magetan Server running on http://localhost:${PORT}`);
});
