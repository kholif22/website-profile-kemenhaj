import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// GET /api/announcements (public - active only)
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { all } = req.query;
    let query = `SELECT * FROM announcements`;
    const params = [];
    if (all !== 'true') {
      query += ` WHERE status = 'active' AND (end_date IS NULL OR end_date >= date('now'))`;
    }
    query += ` ORDER BY priority DESC, created_at DESC`;
    const data = await db.all(query, params);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

// POST /api/announcements (admin)
router.post('/', authenticateToken,
  [body('title').trim().notEmpty(), body('content').trim().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const db = await getDatabase();
      const { title, content, priority = 1, start_date, end_date, status = 'active', show_on_home = 1 } = req.body;
      const result = await db.run(
        `INSERT INTO announcements (title, content, priority, start_date, end_date, status, show_on_home) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, content, priority, start_date || null, end_date || null, status, show_on_home ? 1 : 0]
      );
      await logActivity(req.user.id, req.user.name, `Menambahkan pengumuman: ${title}`, 'announcement', result.lastID, title);
      res.status(201).json({ id: result.lastID, message: 'Pengumuman berhasil disimpan.' });
    } catch (err) {
      res.status(500).json({ error: 'Kesalahan server.' });
    }
  }
);

// PUT /api/announcements/:id (admin)
router.put('/:id', authenticateToken,
  [body('title').trim().notEmpty(), body('content').trim().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const db = await getDatabase();
      const { title, content, priority, start_date, end_date, status, show_on_home } = req.body;
      await db.run(
        `UPDATE announcements SET title=?, content=?, priority=?, start_date=?, end_date=?, status=?, show_on_home=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
        [title, content, priority || 1, start_date || null, end_date || null, status, show_on_home ? 1 : 0, req.params.id]
      );
      await logActivity(req.user.id, req.user.name, `Mengubah pengumuman: ${title}`, 'announcement', req.params.id, title);
      res.json({ message: 'Pengumuman berhasil diperbarui.' });
    } catch (err) {
      res.status(500).json({ error: 'Kesalahan server.' });
    }
  }
);

// DELETE /api/announcements/:id (admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const item = await db.get(`SELECT title FROM announcements WHERE id = ?`, [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Pengumuman tidak ditemukan.' });
    await db.run(`DELETE FROM announcements WHERE id = ?`, [req.params.id]);
    await logActivity(req.user.id, req.user.name, `Menghapus pengumuman: ${item.title}`, 'announcement', req.params.id, item.title);
    res.json({ message: 'Pengumuman berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

export default router;
