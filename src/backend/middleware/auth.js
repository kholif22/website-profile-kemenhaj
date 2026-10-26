import jwt from 'jsonwebtoken';
import { getDatabase } from '../models/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token tidak ditemukan. Harap login terlebih dahulu.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = await getDatabase();
    const user = await db.get(`SELECT id, name, email, role, is_active FROM users WHERE id = ?`, [decoded.userId]);
    if (!user) return res.status(401).json({ error: 'Pengguna tidak ditemukan.' });
    if (!user.is_active) return res.status(403).json({ error: 'Akun tidak aktif.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Token tidak valid atau telah kedaluwarsa.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Akses ditolak. Hanya administrator yang diizinkan.' });
  next();
};

export const requireAuth = authenticateToken;

// Optional auth: attaches req.user when a valid token is present, otherwise continues anonymously.
export const optionalAuth = async (req, _res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = await getDatabase();
    const user = await db.get(`SELECT id, name, email, role, is_active FROM users WHERE id = ?`, [decoded.userId]);
    if (user && user.is_active) req.user = user;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
};
