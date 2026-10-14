import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

const generateRef = () => `PKD-${Date.now().toString().slice(-8)}`;

// POST /api/complaints (public)
router.post('/',
  [
    body('reporter_name').trim().notEmpty().withMessage('Nama wajib diisi.').isLength({ max: 100 }),
    body('contact').trim().notEmpty().withMessage('Kontak wajib diisi.').isLength({ max: 100 }),
    body('category').trim().notEmpty().withMessage('Kategori wajib dipilih.'),
    body('subject').trim().notEmpty().withMessage('Subjek wajib diisi.').isLength({ max: 200 }),
    body('message').trim().notEmpty().withMessage('Pesan wajib diisi.').isLength({ max: 2000 }),
    body('data_consent').equals('true').withMessage('Anda harus menyetujui penggunaan data.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const db = await getDatabase();
      const ref = generateRef();
      const { reporter_name, contact, category, subject, message } = req.body;
      const result = await db.run(
        `INSERT INTO complaints (reference_number, reporter_name, contact, category, subject, message, data_consent) VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [ref, reporter_name, contact, category, subject, message]
      );
      res.status(201).json({ id: result.lastID, reference_number: ref, message: 'Pengaduan berhasil dikirim. Nomor referensi Anda: ' + ref });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Kesalahan server.' });
    }
  }
);

// GET /api/complaints (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { status, search, page = 1, limit = 20 } = req.query;
    let query = `SELECT id, reference_number, reporter_name, contact, category, subject, status, created_at FROM complaints WHERE 1=1`;
    const params = [];
    if (status) { query += ` AND status = ?`; params.push(status); }
    if (search) { query += ` AND (reporter_name LIKE ? OR subject LIKE ? OR reference_number LIKE ?)`; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    const countQuery = query.replace('SELECT id, reference_number, reporter_name, contact, category, subject, status, created_at', 'SELECT COUNT(*) as total');
    const totalRow = await db.get(countQuery, params);
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    const data = await db.all(query, params);
    res.json({ data, total: totalRow.total, page: parseInt(page), totalPages: Math.ceil(totalRow.total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

// GET /api/complaints/:id (admin only)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const item = await db.get(`SELECT * FROM complaints WHERE id = ?`, [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Pengaduan tidak ditemukan.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

// PUT /api/complaints/:id/status (admin)
router.put('/:id/status', authenticateToken,
  [body('status').isIn(['baru','diproses','menunggu_informasi','selesai','ditolak'])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const db = await getDatabase();
      const { status, internal_notes } = req.body;
      const item = await db.get(`SELECT * FROM complaints WHERE id = ?`, [req.params.id]);
      if (!item) return res.status(404).json({ error: 'Pengaduan tidak ditemukan.' });
      await db.run(
        `UPDATE complaints SET status=?, internal_notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
        [status, internal_notes || item.internal_notes, req.params.id]
      );
      await logActivity(req.user.id, req.user.name, `Mengubah status pengaduan ${item.reference_number} menjadi ${status}`, 'complaint', req.params.id, item.reference_number);
      res.json({ message: 'Status pengaduan berhasil diperbarui.' });
    } catch (err) {
      res.status(500).json({ error: 'Kesalahan server.' });
    }
  }
);

export default router;
