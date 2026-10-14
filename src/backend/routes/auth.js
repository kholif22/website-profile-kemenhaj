import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login',
  [
    body('email').isEmail().withMessage('Format email tidak valid.'),
    body('password').notEmpty().withMessage('Password wajib diisi.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { email, password } = req.body;
      const db = await getDatabase();
      const user = await db.get(`SELECT * FROM users WHERE email = ? AND is_active = 1`, [email]);
      if (!user) return res.status(401).json({ error: 'Email atau password salah.' });
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Email atau password salah.' });
      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret_change_in_production', { expiresIn: '8h' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Kesalahan server.' });
    }
  }
);

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
