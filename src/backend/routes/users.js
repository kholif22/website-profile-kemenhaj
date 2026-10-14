import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../models/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// GET /api/users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDatabase();
    const users = await db.all(`SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC`);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

// POST /api/users (admin only)
router.post('/', authenticateToken, requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Nama wajib diisi.'),
    body('email').isEmail().withMessage('Format email tidak valid.'),
    body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter.'),
    body('role').isIn(['admin', 'editor']).withMessage('Role tidak valid.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const db = await getDatabase();
      const { name, email, password, role } = req.body;
      const exists = await db.get(`SELECT id FROM users WHERE email = ?`, [email]);
      if (exists) return res.status(409).json({ error: 'Email sudah terdaftar.' });
      const hash = await bcrypt.hash(password, 12);
      const result = await db.run(
        `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        [name, email, hash, role]
      );
      await logActivity(req.user.id, req.user.name, `Menambahkan pengguna: ${name}`, 'user', result.lastID, name);
      res.status(201).json({ id: result.lastID, message: 'Pengguna berhasil ditambahkan.' });
    } catch (err) {
      res.status(500).json({ error: 'Kesalahan server.' });
    }
  }
);

// PUT /api/users/:id (admin only)
router.put('/:id', authenticateToken, requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Nama wajib diisi.'),
    body('email').isEmail().withMessage('Format email tidak valid.'),
    body('role').isIn(['admin', 'editor']).withMessage('Role tidak valid.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const db = await getDatabase();
      const { name, email, password, role, is_active } = req.body;
      const user = await db.get(`SELECT * FROM users WHERE id = ?`, [req.params.id]);
      if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
      const dupEmail = await db.get(`SELECT id FROM users WHERE email = ? AND id != ?`, [email, req.params.id]);
      if (dupEmail) return res.status(409).json({ error: 'Email sudah digunakan pengguna lain.' });
      let passwordHash = user.password_hash;
      if (password && password.length >= 8) {
        passwordHash = await bcrypt.hash(password, 12);
      }
      await db.run(
        `UPDATE users SET name=?, email=?, password_hash=?, role=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
        [name, email, passwordHash, role, is_active !== undefined ? (is_active ? 1 : 0) : user.is_active, req.params.id]
      );
      await logActivity(req.user.id, req.user.name, `Mengubah pengguna: ${name}`, 'user', req.params.id, name);
      res.json({ message: 'Pengguna berhasil diperbarui.' });
    } catch (err) {
      res.status(500).json({ error: 'Kesalahan server.' });
    }
  }
);

// DELETE /api/users/:id (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri.' });
    }
    const db = await getDatabase();
    const user = await db.get(`SELECT name FROM users WHERE id = ?`, [req.params.id]);
    if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    await db.run(`DELETE FROM users WHERE id = ?`, [req.params.id]);
    await logActivity(req.user.id, req.user.name, `Menghapus pengguna: ${user.name}`, 'user', req.params.id, user.name);
    res.json({ message: 'Pengguna berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

// PUT /api/users/me/password (self)
router.put('/me/password', authenticateToken,
  [
    body('current_password').notEmpty().withMessage('Password lama wajib diisi.'),
    body('new_password').isLength({ min: 8 }).withMessage('Password baru minimal 8 karakter.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const db = await getDatabase();
      const user = await db.get(`SELECT * FROM users WHERE id = ?`, [req.user.id]);
      const valid = await bcrypt.compare(req.body.current_password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Password lama tidak sesuai.' });
      const hash = await bcrypt.hash(req.body.new_password, 12);
      await db.run(`UPDATE users SET password_hash=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`, [hash, req.user.id]);
      res.json({ message: 'Password berhasil diperbarui.' });
    } catch (err) {
      res.status(500).json({ error: 'Kesalahan server.' });
    }
  }
);

export default router;
