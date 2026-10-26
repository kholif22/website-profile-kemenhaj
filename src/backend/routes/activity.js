import express from 'express';
import { getDatabase } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { getPagination } from '../utils/pagination.js';

const router = express.Router();

// GET /api/activity (admin only — recent activity log)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { page, limit, offset } = getPagination(req.query, { defaultLimit: 50, maxLimit: 200 });
    const totalRow = await db.get(`SELECT COUNT(*) as total FROM activity_logs`);
    const logs = await db.all(
      `SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json({
      data: logs,
      total: totalRow.total,
      page,
      totalPages: Math.ceil(totalRow.total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

export default router;
