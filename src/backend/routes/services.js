import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../models/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const db = await getDatabase();
    const { category, all } = req.query;
    if (all === 'true' && !req.user) return res.status(403).json({ error: 'Akses ditolak.' });
    let query = `SELECT * FROM services WHERE 1=1`;
    const params = [];
    if (all !== 'true') { query += ` AND status = 'active'`; }
    if (category) { query += ` AND category = ?`; params.push(category); }
    query += ` ORDER BY created_at DESC`;
    res.json(await db.all(query, params));
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const db = await getDatabase();
    let query = `SELECT * FROM services WHERE id = ?`;
    if (!req.user) query += ` AND status = 'active'`;
    const item = await db.get(query, [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Layanan tidak ditemukan.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

router.post('/', authenticateToken,
  [
    body('title').trim().notEmpty(),
    body('category').isIn(['haji', 'umrah', 'manasik', 'informasi']),
    body('status').optional().isIn(['active', 'inactive']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const db = await getDatabase();
      const { title, category, description, requirements, procedure, official_url, status = 'active' } = req.body;
      const result = await db.run(
        `INSERT INTO services (title, category, description, requirements, procedure, official_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, category, description || '', requirements || '', procedure || '', official_url || '', status]
      );
      await logActivity(req.user.id, req.user.name, `Menambahkan layanan: ${title}`, 'service', result.lastID, title);
      res.status(201).json({ id: result.lastID, message: 'Layanan berhasil disimpan.' });
    } catch (err) {
      res.status(500).json({ error: 'Kesalahan server.' });
    }
  }
);

router.put('/:id', authenticateToken,
  [
    body('title').trim().notEmpty(),
    body('category').isIn(['haji', 'umrah', 'manasik', 'informasi']),
    body('status').optional().isIn(['active', 'inactive']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const db = await getDatabase();
      const existing = await db.get(`SELECT status FROM services WHERE id = ?`, [req.params.id]);
      if (!existing) return res.status(404).json({ error: 'Layanan tidak ditemukan.' });
      const { title, category, description, requirements, procedure, official_url, status } = req.body;
      const finalStatus = status || existing.status;
      await db.run(
        `UPDATE services SET title=?, category=?, description=?, requirements=?, procedure=?, official_url=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
        [title, category, description || '', requirements || '', procedure || '', official_url || '', finalStatus, req.params.id]
      );
      await logActivity(req.user.id, req.user.name, `Mengubah layanan: ${title}`, 'service', req.params.id, title);
      res.json({ message: 'Layanan berhasil diperbarui.' });
    } catch (err) {
      res.status(500).json({ error: 'Kesalahan server.' });
    }
  }
);

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const item = await db.get(`SELECT title FROM services WHERE id = ?`, [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Layanan tidak ditemukan.' });
    await db.run(`DELETE FROM services WHERE id = ?`, [req.params.id]);
    await logActivity(req.user.id, req.user.name, `Menghapus layanan: ${item.title}`, 'service', req.params.id, item.title);
    res.json({ message: 'Layanan berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

export default router;
