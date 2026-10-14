import express from 'express';
import { getDatabase } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const [newsCount, announcementCount, agendaCount, complaintTotal, complaintNew, complaintPending] = await Promise.all([
      db.get(`SELECT COUNT(*) as count FROM news WHERE status = 'published'`),
      db.get(`SELECT COUNT(*) as count FROM announcements WHERE status = 'active'`),
      db.get(`SELECT COUNT(*) as count FROM agendas WHERE status = 'upcoming'`),
      db.get(`SELECT COUNT(*) as count FROM complaints`),
      db.get(`SELECT COUNT(*) as count FROM complaints WHERE status = 'baru'`),
      db.get(`SELECT COUNT(*) as count FROM complaints WHERE status IN ('baru','diproses','menunggu_informasi')`),
    ]);

    const monthlyNews = await db.all(
      `SELECT strftime('%Y-%m', published_at) as month, COUNT(*) as count 
       FROM news 
       WHERE published_at IS NOT NULL 
       GROUP BY month 
       ORDER BY month ASC 
       LIMIT 6`
    );

    const complaintByStatus = await db.all(
      `SELECT status, COUNT(*) as count FROM complaints GROUP BY status`
    );

    const recentActivity = await db.all(`SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 8`);
    const upcomingAgendas = await db.all(`SELECT * FROM agendas WHERE status = 'upcoming' ORDER BY event_date ASC LIMIT 5`);
    const recentComplaints = await db.all(`SELECT id, reference_number, reporter_name, category, subject, status, created_at FROM complaints ORDER BY created_at DESC LIMIT 5`);

    res.json({
      newsCount: newsCount?.count || 0,
      announcementCount: announcementCount?.count || 0,
      agendaCount: agendaCount?.count || 0,
      complaintTotal: complaintTotal?.count || 0,
      complaintNew: complaintNew?.count || 0,
      complaintPending: complaintPending?.count || 0,
      monthlyNews: monthlyNews || [],
      complaintByStatus: complaintByStatus || [],
      recentActivity: recentActivity || [],
      upcomingAgendas: upcomingAgendas || [],
      recentComplaints: recentComplaints || [],
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Kesalahan mengambil data statistik.' });
  }
});

export default router;
