import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../models/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { logActivity } from '../middleware/activityLogger.js';
import { sanitizeHtml, formatNewsContent } from '../utils/sanitize.js';
import { getPagination } from '../utils/pagination.js';
import { removeUploadedFile } from '../utils/files.js';

const router = express.Router();

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

// GET /api/news (public)
// Pengunjung tanpa login selalu dibatasi ke berita yang sudah terbit.
// Hanya pengguna yang sudah login (editor/admin) yang boleh memakai status=all/draft.
router.get('/', optionalAuth, async (req, res) => {
  try {
    const db = await getDatabase();
    const { category, search } = req.query;
    const { page, limit, offset } = getPagination(req.query, { defaultLimit: 9, maxLimit: 50 });
    const status = req.user ? (req.query.status || 'published') : 'published';
    let query = `SELECT id, title, slug, excerpt, content, image, category, status, published_at, created_at FROM news WHERE 1=1`;
    const params = [];
    if (status !== 'all') { query += ` AND status = ?`; params.push(status); }
    if (category) { query += ` AND category = ?`; params.push(category); }
    if (search) { query += ` AND (title LIKE ? OR excerpt LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
    let countQuery = `SELECT COUNT(*) as total FROM news WHERE 1=1`;
    const countParams = [];
    if (status !== 'all') { countQuery += ` AND status = ?`; countParams.push(status); }
    if (category) { countQuery += ` AND category = ?`; countParams.push(category); }
    if (search) { countQuery += ` AND (title LIKE ? OR excerpt LIKE ?)`; countParams.push(`%${search}%`, `%${search}%`); }
    const totalRow = await db.get(countQuery, countParams);
    query += ` ORDER BY published_at DESC, created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const news = await db.all(query, params);
    res.json({ data: news, total: totalRow.total, page, limit, totalPages: Math.ceil(totalRow.total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

// GET /api/news/:slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const db = await getDatabase();
    const item = await db.get(`SELECT n.*, u.name as author_name FROM news n LEFT JOIN users u ON n.created_by = u.id WHERE n.slug = ? AND n.status = 'published'`, [req.params.slug]);
    if (!item) return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

// POST /api/news (admin)
router.post('/', authenticateToken, upload.single('image'),
  [
    body('title').trim().notEmpty().withMessage('Judul wajib diisi.').isLength({ max: 255 }),
    body('content').trim().notEmpty().withMessage('Konten wajib diisi.'),
    body('category').trim().notEmpty().withMessage('Kategori wajib dipilih.'),
    body('status').isIn(['draft', 'published']).withMessage('Status tidak valid.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) await removeUploadedFile(req.file.filename);
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const db = await getDatabase();
      const { title, content, category, status, excerpt } = req.body;
      let slug = slugify(title);
      const existing = await db.get(`SELECT id FROM news WHERE slug = ?`, [slug]);
      if (existing) slug = `${slug}-${Date.now()}`;
      const image = req.file ? `/uploads/${req.file.filename}` : null;
      const published_at = status === 'published' ? new Date().toISOString() : null;
      const result = await db.run(
        `INSERT INTO news (title, slug, excerpt, content, image, category, status, published_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, slug, excerpt || '', formatNewsContent(sanitizeHtml(content)), image, category, status, published_at, req.user.id]
      );
      await logActivity(req.user.id, req.user.name, `Menambahkan berita: ${title}`, 'news', result.lastID, title);
      res.status(201).json({ id: result.lastID, slug, message: 'Berita berhasil disimpan.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Kesalahan server.' });
    }
  }
);

// PUT /api/news/:id (admin)
router.put('/:id', authenticateToken, upload.single('image'),
  [
    body('title').trim().notEmpty().withMessage('Judul wajib diisi.'),
    body('content').trim().notEmpty().withMessage('Konten wajib diisi.'),
    body('category').trim().notEmpty().withMessage('Kategori wajib dipilih.'),
    body('status').isIn(['draft', 'published']).withMessage('Status tidak valid.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) await removeUploadedFile(req.file.filename);
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const db = await getDatabase();
      const existing = await db.get(`SELECT * FROM news WHERE id = ?`, [req.params.id]);
      if (!existing) {
        if (req.file) await removeUploadedFile(req.file.filename);
        return res.status(404).json({ error: 'Berita tidak ditemukan.' });
      }
      const { title, content, category, status, excerpt } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : existing.image;
      const published_at = status === 'published' ? (existing.published_at || new Date().toISOString()) : null;
      await db.run(
        `UPDATE news SET title=?, excerpt=?, content=?, image=?, category=?, status=?, published_at=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
        [title, excerpt || '', formatNewsContent(sanitizeHtml(content)), image, category, status, published_at, req.params.id]
      );
      if (req.file && existing.image) await removeUploadedFile(existing.image);
      await logActivity(req.user.id, req.user.name, `Mengubah berita: ${title}`, 'news', req.params.id, title);
      res.json({ message: 'Berita berhasil diperbarui.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Kesalahan server.' });
    }
  }
);

// DELETE /api/news/:id (admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const item = await db.get(`SELECT * FROM news WHERE id = ?`, [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    await db.run(`DELETE FROM news WHERE id = ?`, [req.params.id]);
    await removeUploadedFile(item.image);
    await logActivity(req.user.id, req.user.name, `Menghapus berita: ${item.title}`, 'news', req.params.id, item.title);
    res.json({ message: 'Berita berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

export default router;
