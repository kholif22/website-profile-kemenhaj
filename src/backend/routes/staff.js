import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../models/database.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { logActivity } from '../middleware/activityLogger.js';
import { removeUploadedFile } from '../utils/files.js';

const router = express.Router();

const validations = [
  body('name').trim().notEmpty().withMessage('Nama pegawai wajib diisi.').isLength({ max: 150 }),
  body('position').trim().notEmpty().withMessage('Jabatan wajib diisi.').isLength({ max: 150 }),
  body('unit').optional({ checkFalsy: true }).isLength({ max: 150 }),
  body('sort_order').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Urutan harus berupa angka.'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status tidak valid.'),
];

// GET /api/staff — publik hanya melihat pegawai aktif. Admin dapat memakai
// ?status=all untuk menampilkan semua data (termasuk nonaktif).
router.get('/', optionalAuth, async (req, res) => {
  try {
    const db = await getDatabase();
    const { status } = req.query;
    let query = `SELECT * FROM staff`;
    const params = [];

    if (req.user) {
      if (status && ['active', 'inactive'].includes(status)) {
        query += ` WHERE status = ?`;
        params.push(status);
      } else if (status !== 'all') {
        query += ` WHERE status = 'active'`;
      }
    } else {
      // Pengunjung publik hanya boleh melihat pegawai aktif.
      query += ` WHERE status = 'active'`;
    }

    query += ` ORDER BY sort_order ASC, id ASC`;
    const data = await db.all(query, params);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

// POST /api/staff (admin only)
router.post('/', authenticateToken, requireAdmin, upload.single('photo'), validations, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) await removeUploadedFile(req.file.filename);
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = await getDatabase();
    const { name, position, unit, sort_order, status = 'active' } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;
    const order = parseInt(sort_order, 10) || 0;

    const result = await db.run(
      `INSERT INTO staff (name, position, unit, photo, sort_order, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), position.trim(), unit || '', photo, order, status]
    );

    await logActivity(req.user.id, req.user.name, `Menambahkan pegawai: ${name}`, 'staff', result.lastID, name);
    res.status(201).json({ id: result.lastID, photo, message: 'Data pegawai berhasil disimpan.' });
  } catch (err) {
    if (req.file) await removeUploadedFile(req.file.filename);
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

// PUT /api/staff/:id (admin only)
router.put('/:id', authenticateToken, requireAdmin, upload.single('photo'), validations, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) await removeUploadedFile(req.file.filename);
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = await getDatabase();
    const existing = await db.get(`SELECT * FROM staff WHERE id = ?`, [req.params.id]);
    if (!existing) {
      if (req.file) await removeUploadedFile(req.file.filename);
      return res.status(404).json({ error: 'Data pegawai tidak ditemukan.' });
    }

    const { name, position, unit, sort_order, status } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : existing.photo;
    const order = sort_order === undefined || sort_order === '' ? existing.sort_order : parseInt(sort_order, 10) || 0;
    const finalStatus = status || existing.status;

    await db.run(
      `UPDATE staff SET name=?, position=?, unit=?, photo=?, sort_order=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [name.trim(), position.trim(), unit || '', photo, order, finalStatus, req.params.id]
    );

    if (req.file && existing.photo) await removeUploadedFile(existing.photo);

    await logActivity(req.user.id, req.user.name, `Mengubah pegawai: ${name}`, 'staff', req.params.id, name);
    res.json({ message: 'Data pegawai berhasil diperbarui.', photo });
  } catch (err) {
    if (req.file) await removeUploadedFile(req.file.filename);
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

// DELETE /api/staff/:id (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDatabase();
    const item = await db.get(`SELECT name, photo FROM staff WHERE id = ?`, [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Data pegawai tidak ditemukan.' });

    await db.run(`DELETE FROM staff WHERE id = ?`, [req.params.id]);
    if (item.photo) await removeUploadedFile(item.photo);

    await logActivity(req.user.id, req.user.name, `Menghapus pegawai: ${item.name}`, 'staff', req.params.id, item.name);
    res.json({ message: 'Data pegawai berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

export default router;
