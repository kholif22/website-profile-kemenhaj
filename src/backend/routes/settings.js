import express from 'express';
import { getDatabase } from '../models/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// GET /api/settings (public — returns all key-value pairs as object)
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const rows = await db.all(`SELECT setting_key, setting_value FROM site_settings`);
    const settings = {};
    for (const row of rows) {
      settings[row.setting_key] = row.setting_value;
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

// PUT /api/settings (admin only — accepts { key: value } object)
router.put('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDatabase();
    const updates = req.body;
    if (typeof updates !== 'object' || Array.isArray(updates)) {
      return res.status(400).json({ error: 'Body harus berupa objek key-value.' });
    }
    for (const [key, value] of Object.entries(updates)) {
      await db.run(
        `INSERT INTO site_settings (setting_key, setting_value, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP`,
        [key, value]
      );
    }
    await logActivity(req.user.id, req.user.name, `Memperbarui pengaturan situs`, 'settings', null, null);
    res.json({ message: 'Pengaturan berhasil disimpan.' });
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

export default router;
