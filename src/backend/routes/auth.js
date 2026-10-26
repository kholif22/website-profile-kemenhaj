import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

// POST /api/auth/login
// Menerima email ATAU username pada field `identifier`
// (`email` masih diterima agar klien lama tetap kompatibel).
router.post('/login', loginLimiter, async (req, res) => {
  const identifier = String(req.body?.identifier ?? req.body?.email ?? '').trim();
  const password = String(req.body?.password ?? '');
  if (!identifier) return res.status(400).json({ error: 'Email atau username wajib diisi.' });
  if (!password) return res.status(400).json({ error: 'Password wajib diisi.' });
  try {
    const db = await getDatabase();
    const user = await db.get(
      `SELECT * FROM users
       WHERE (email = ? COLLATE NOCASE OR username = ? COLLATE NOCASE)
         AND is_active = 1`,
      [identifier, identifier]
    );
    if (!user) return res.status(401).json({ error: 'Email/username atau kata sandi salah.' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Email/username atau kata sandi salah.' });
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({
      token,
      user: { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
