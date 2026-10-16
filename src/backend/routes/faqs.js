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
    let query = `SELECT * FROM faqs WHERE 1=1`;
    const params = [];
    if (all !== 'true') { query += ` AND status = 'active'`; }
    if (category) { query += ` AND category = ?`; params.push(category); }
    query += ` ORDER BY sort_order ASC, created_at ASC`;
    const data = await db.all(query, params);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

router.post('/', authenticateToken,
  [body('question').trim().notEmpty(), body('answer').trim().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const db = await getDatabase();
      const { question, answer, category = 'umum', sort_order = 0 } = req.body;
      const result = await db.run(
        `INSERT INTO faqs (question, answer, category, sort_order) VALUES (?, ?, ?, ?)`,
        [question, answer, category, sort_order]
      );
      await logActivity(req.user.id, req.user.name, `Menambahkan FAQ`, 'faq', result.lastID, question);
      res.status(201).json({ id: result.lastID, message: 'FAQ berhasil disimpan.' });
    } catch (err) {
      res.status(500).json({ error: 'Kesalahan server.' });
    }
  }
);

router.put('/:id', authenticateToken,
  [body('question').trim().notEmpty(), body('answer').trim().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const db = await getDatabase();
      const { question, answer, category, sort_order, status } = req.body;
      await db.run(
        `UPDATE faqs SET question=?, answer=?, category=?, sort_order=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
        [question, answer, category || 'umum', sort_order || 0, status || 'active', req.params.id]
      );
      await logActivity(req.user.id, req.user.name, `Mengubah FAQ`, 'faq', req.params.id, question);
      res.json({ message: 'FAQ berhasil diperbarui.' });
    } catch (err) {
      res.status(500).json({ error: 'Kesalahan server.' });
    }
  }
);

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const item = await db.get(`SELECT question FROM faqs WHERE id = ?`, [req.params.id]);
    if (!item) return res.status(404).json({ error: 'FAQ tidak ditemukan.' });
    await db.run(`DELETE FROM faqs WHERE id = ?`, [req.params.id]);
    await logActivity(req.user.id, req.user.name, `Menghapus FAQ`, 'faq', req.params.id, item.question);
    res.json({ message: 'FAQ berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

export default router;
