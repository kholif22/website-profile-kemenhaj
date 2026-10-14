import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

// GET /api/news (public)
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { category, status = 'published', search, page = 1, limit = 9 } = req.query;
    let query = `SELECT id, title, slug, excerpt, image, category, status, published_at, created_at FROM news WHERE 1=1`;
    const params = [];
    if (status !== 'all') { query += ` AND status = ?`; params.push(status); }
    if (category) { query += ` AND category = ?`; params.push(category); }
    if (search) { query += ` AND (title LIKE ? OR excerpt LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
    const totalRow = await db.get(`SELECT COUNT(*) as total FROM news WHERE 1=1${status !== 'all' ? ` AND status = '${status}'` : ''}${category ? ` AND category = '${category}'` : ''}${search ? ` AND (title LIKE '%${search}%' OR excerpt LIKE '%${search}%')` : ''}`);
    query += ` ORDER BY published_at DESC, created_at DESC LIMIT ? OFFSET ?`;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);
    const news = await db.all(query, params);
    res.json({ data: news, total: totalRow.total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(totalRow.total / parseInt(limit)) });
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
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
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
        [title, slug, excerpt || '', content, image, category, status, published_at, req.user.id]
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
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const db = await getDatabase();
      const existing = await db.get(`SELECT * FROM news WHERE id = ?`, [req.params.id]);
      if (!existing) return res.status(404).json({ error: 'Berita tidak ditemukan.' });
      const { title, content, category, status, excerpt } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : existing.image;
      const published_at = status === 'published' ? (existing.published_at || new Date().toISOString()) : null;
      await db.run(
        `UPDATE news SET title=?, excerpt=?, content=?, image=?, category=?, status=?, published_at=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
        [title, excerpt || '', content, image, category, status, published_at, req.params.id]
      );
      await logActivity(req.user.id, req.user.name, `Mengubah berita: ${title}`, 'news', req.params.id, title);
      res.json({ message: 'Berita berhasil diperbarui.' });
    } catch (err) {
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
    await logActivity(req.user.id, req.user.name, `Menghapus berita: ${item.title}`, 'news', req.params.id, item.title);
    res.json({ message: 'Berita berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

export default router;
