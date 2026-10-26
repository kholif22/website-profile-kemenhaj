import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { logActivity } from '../middleware/activityLogger.js';
import { removeUploadedFile } from '../utils/files.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { status, month, year } = req.query;
    let query = `SELECT * FROM agendas WHERE 1=1`;
    const params = [];
    if (status) { query += ` AND status = ?`; params.push(status); }
    if (month && year) { query += ` AND strftime('%m', event_date) = ? AND strftime('%Y', event_date) = ?`; params.push(month.padStart(2,'0'), year); }
    query += ` ORDER BY event_date ASC`;
    const data = await db.all(query, params);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

router.post('/', authenticateToken, upload.single('image'),
  [body('title').trim().notEmpty(), body('event_date').isDate(), body('status').optional().isIn(['upcoming', 'ongoing', 'completed'])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) await removeUploadedFile(req.file.filename);
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const db = await getDatabase();
      const { title, description, event_date, start_time, end_time, location, status = 'upcoming' } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : null;
      const result = await db.run(
        `INSERT INTO agendas (title, description, event_date, start_time, end_time, location, image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description || '', event_date, start_time || null, end_time || null, location || '', image, status]
      );
      await logActivity(req.user.id, req.user.name, `Menambahkan agenda: ${title}`, 'agenda', result.lastID, title);
      res.status(201).json({ id: result.lastID, message: 'Agenda berhasil disimpan.' });
    } catch (err) {
      res.status(500).json({ error: 'Kesalahan server.' });
    }
  }
);

router.put('/:id', authenticateToken, upload.single('image'),
  [body('title').trim().notEmpty(), body('event_date').isDate(), body('status').optional().isIn(['upcoming', 'ongoing', 'completed'])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) await removeUploadedFile(req.file.filename);
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const db = await getDatabase();
      const existing = await db.get(`SELECT * FROM agendas WHERE id = ?`, [req.params.id]);
      if (!existing) {
        if (req.file) await removeUploadedFile(req.file.filename);
        return res.status(404).json({ error: 'Agenda tidak ditemukan.' });
      }
      const { title, description, event_date, start_time, end_time, location, status } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : existing.image;
      const finalStatus = status || existing.status;
      await db.run(
        `UPDATE agendas SET title=?, description=?, event_date=?, start_time=?, end_time=?, location=?, image=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
        [title, description || '', event_date, start_time || null, end_time || null, location || '', image, finalStatus, req.params.id]
      );
      if (req.file && existing.image) await removeUploadedFile(existing.image);
      await logActivity(req.user.id, req.user.name, `Mengubah agenda: ${title}`, 'agenda', req.params.id, title);
      res.json({ message: 'Agenda berhasil diperbarui.' });
    } catch (err) {
      res.status(500).json({ error: 'Kesalahan server.' });
    }
  }
);

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const item = await db.get(`SELECT title, image FROM agendas WHERE id = ?`, [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Agenda tidak ditemukan.' });
    await db.run(`DELETE FROM agendas WHERE id = ?`, [req.params.id]);
    await removeUploadedFile(item.image);
    await logActivity(req.user.id, req.user.name, `Menghapus agenda: ${item.title}`, 'agenda', req.params.id, item.title);
    res.json({ message: 'Agenda berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

export default router;
