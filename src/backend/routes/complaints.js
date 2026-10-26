import express from 'express';
import crypto from 'crypto';
import { body, query, validationResult } from 'express-validator';
import { getDatabase } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';
import { publicFormLimiter, exportLimiter } from '../middleware/rateLimiters.js';
import { getPagination } from '../utils/pagination.js';
import {
  buildComplaintFilters,
  COMPLAINT_STATUSES,
  isValidDateOnly,
} from '../utils/complaintFilters.js';
import { generateComplaintExcel, generateComplaintPdf } from '../utils/complaintExport.js';

const router = express.Router();

// Nomor referensi memakai tanggal + 6 karakter acak (bukan timestamp sekuensial)
// agar tidak mudah ditebak dan kecil kemungkinan tabrakan.
const generateRef = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `PKD-${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

const complaintFilterValidators = [
  query('status').optional({ values: 'falsy' }).isIn(COMPLAINT_STATUSES).withMessage('Status tidak valid.'),
  query('search').optional({ values: 'falsy' }).isLength({ max: 100 }).withMessage('Pencarian terlalu panjang.'),
  query('date_from').optional({ values: 'falsy' }).custom(isValidDateOnly).withMessage('Format tanggal awal tidak valid.'),
  query('date_to').optional({ values: 'falsy' }).custom(isValidDateOnly).withMessage('Format tanggal akhir tidak valid.'),
];

const hasInvalidDateRange = (req) => {
  const from = String(req.query.date_from || '');
  const to = String(req.query.date_to || '');
  return Boolean(from && to && from > to);
};

const isTruthyQuery = (value) => ['1', 'true', 'yes'].includes(String(value || '').toLowerCase());

// POST /api/complaints (public)
router.post('/', publicFormLimiter,
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
      let ref = null;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const candidate = generateRef();
        const exists = await db.get(`SELECT id FROM complaints WHERE reference_number = ?`, [candidate]);
        if (!exists) {
          ref = candidate;
          break;
        }
      }
      if (!ref) {
        return res.status(503).json({ error: 'Gagal membuat nomor referensi. Silakan coba lagi.' });
      }
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
router.get('/', authenticateToken, complaintFilterValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  if (hasInvalidDateRange(req)) {
    return res.status(400).json({ error: 'Tanggal awal tidak boleh melebihi tanggal akhir.' });
  }

  try {
    const db = await getDatabase();
    const { page, limit, offset } = getPagination(req.query, { defaultLimit: 20, maxLimit: 100 });
    const { where, params } = buildComplaintFilters(req.query);

    const totalRow = await db.get(`SELECT COUNT(*) as total FROM complaints WHERE ${where}`, params);
    const data = await db.all(
      `SELECT id, reference_number, reporter_name, contact, category, subject, status, created_at
       FROM complaints
       WHERE ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ data, total: totalRow.total, page, totalPages: Math.ceil(totalRow.total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

// GET /api/complaints/export?format=xlsx|pdf (admin only)
// Route ini HARUS berada sebelum GET /:id agar "export" tidak dianggap sebagai id.
router.get('/export', exportLimiter, authenticateToken,
  [
    ...complaintFilterValidators,
    query('format').isIn(['xlsx', 'pdf']).withMessage('Format harus xlsx atau pdf.'),
    query('include_internal_notes').optional({ values: 'falsy' }).isIn(['0', '1', 'true', 'false']),
    query('include_message').optional({ values: 'falsy' }).isIn(['0', '1', 'true', 'false']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    if (hasInvalidDateRange(req)) {
      return res.status(400).json({ error: 'Tanggal awal tidak boleh melebihi tanggal akhir.' });
    }

    const format = String(req.query.format);
    const includeInternalNotes = isTruthyQuery(req.query.include_internal_notes);
    const includeMessage = isTruthyQuery(req.query.include_message) || includeInternalNotes;

    try {
      const db = await getDatabase();
      const { where, params, filters } = buildComplaintFilters(req.query);

      const totalRow = await db.get(`SELECT COUNT(*) as total FROM complaints WHERE ${where}`, params);
      if (!totalRow.total) {
        return res.status(400).json({ error: 'Tidak ada data pengaduan untuk diekspor.' });
      }

      const configuredMaxRows = Number.parseInt(process.env.EXPORT_MAX_ROWS, 10);
      const maxRows = Number.isFinite(configuredMaxRows) && configuredMaxRows > 0
        ? configuredMaxRows
        : 5000;
      if (totalRow.total > maxRows) {
        return res.status(400).json({
          error: `Data terlalu banyak (${totalRow.total} pengaduan). Maksimal ${maxRows} baris per ekspor. Persempit filter tanggal atau status.`,
        });
      }

      const rows = await db.all(
        `SELECT id, reference_number, reporter_name, contact, category, subject, message,
                status, internal_notes, data_consent, created_at, updated_at
         FROM complaints
         WHERE ${where}
         ORDER BY created_at DESC`,
        params
      );

      const settingRows = await db.all(`SELECT setting_key, setting_value FROM site_settings`);
      const settings = Object.fromEntries(settingRows.map((row) => [row.setting_key, row.setting_value]));

      let buffer;
      if (format === 'xlsx') {
        buffer = await generateComplaintExcel({
          rows,
          filters,
          user: req.user,
          settings,
          includeInternalNotes,
        });
      } else {
        buffer = await generateComplaintPdf({
          rows,
          filters,
          user: req.user,
          settings,
          includeMessage,
          includeInternalNotes,
        });
      }

      const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
      const filename = `${format === 'xlsx' ? 'pengaduan' : 'laporan-pengaduan'}-plhut-${stamp}.${format}`;
      const contentType = format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';

      await logActivity(
        req.user.id,
        req.user.name,
        `Mengekspor ${rows.length} pengaduan (${format.toUpperCase()})`,
        'complaint',
        null,
        null
      );

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'no-store');
      return res.send(buffer);
    } catch (err) {
      console.error('Gagal mengekspor pengaduan:', err);
      return res.status(500).json({ error: 'Gagal membuat file ekspor pengaduan.' });
    }
  }
);

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
