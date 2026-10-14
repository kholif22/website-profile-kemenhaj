import express from 'express';
import { getDatabase } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/activity (admin only — recent activity log)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { limit = 50, page = 1 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const totalRow = await db.get(`SELECT COUNT(*) as total FROM activity_logs`);
    const logs = await db.all(
      `SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    );
    res.json({
      data: logs,
      total: totalRow.total,
      page: parseInt(page),
      totalPages: Math.ceil(totalRow.total / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

// GET /api/activity/stats (admin only — dashboard stats)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const [newsCount, announcementCount, agendaCount, complaintCount, newComplaintCount, userCount] = await Promise.all([
      db.get(`SELECT COUNT(*) as count FROM news WHERE status = 'published'`),
      db.get(`SELECT COUNT(*) as count FROM announcements WHERE status = 'active'`),
      db.get(`SELECT COUNT(*) as count FROM agendas WHERE status = 'upcoming'`),
      db.get(`SELECT COUNT(*) as count FROM complaints`),
      db.get(`SELECT COUNT(*) as count FROM complaints WHERE status = 'baru'`),
      db.get(`SELECT COUNT(*) as count FROM users`),
    ]);
    res.json({
      publishedNews: newsCount.count,
      activeAnnouncements: announcementCount.count,
      upcomingAgendas: agendaCount.count,
      totalComplaints: complaintCount.count,
      newComplaints: newComplaintCount.count,
      totalUsers: userCount.count,
    });
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

export default router;
