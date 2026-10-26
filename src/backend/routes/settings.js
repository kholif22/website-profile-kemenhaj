import express from 'express';
import { getDatabase } from '../models/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';
import { upload } from '../middleware/upload.js';
import { removeUploadedFile } from '../utils/files.js';

const router = express.Router();

// Foto profil yang boleh diunggah melalui endpoint ini.
const PROFILE_PHOTO_KEYS = ['profile_office_photo', 'site_welcome_photo'];

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

// POST /api/settings/photo (admin only — upload foto kantor / foto pimpinan)
router.post('/photo', authenticateToken, requireAdmin, upload.single('photo'), async (req, res) => {
  const key = req.body.key;

  if (!PROFILE_PHOTO_KEYS.includes(key)) {
    if (req.file) await removeUploadedFile(req.file.filename);
    return res.status(400).json({ error: 'Jenis foto tidak valid.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Berkas foto wajib dipilih.' });
  }

  try {
    const db = await getDatabase();
    const existing = await db.get(`SELECT setting_value FROM site_settings WHERE setting_key = ?`, [key]);
    const publicPath = `/uploads/${req.file.filename}`;

    await db.run(
      `INSERT INTO site_settings (setting_key, setting_value, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP`,
      [key, publicPath]
    );

    // Hapus berkas lama agar tidak menumpuk di folder uploads.
    if (existing?.setting_value) await removeUploadedFile(existing.setting_value);

    await logActivity(req.user.id, req.user.name, `Memperbarui foto profil: ${key}`, 'settings', null, key);
    res.status(201).json({ message: 'Foto berhasil diunggah.', key, url: publicPath });
  } catch (err) {
    if (req.file) await removeUploadedFile(req.file.filename);
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

// DELETE /api/settings/photo/:key (admin only — hapus foto profil)
router.delete('/photo/:key', authenticateToken, requireAdmin, async (req, res) => {
  const key = req.params.key;
  if (!PROFILE_PHOTO_KEYS.includes(key)) {
    return res.status(400).json({ error: 'Jenis foto tidak valid.' });
  }

  try {
    const db = await getDatabase();
    const existing = await db.get(`SELECT setting_value FROM site_settings WHERE setting_key = ?`, [key]);

    await db.run(
      `INSERT INTO site_settings (setting_key, setting_value, updated_at)
       VALUES (?, '', CURRENT_TIMESTAMP)
       ON CONFLICT(setting_key) DO UPDATE SET setting_value = '', updated_at = CURRENT_TIMESTAMP`,
      [key]
    );

    if (existing?.setting_value) await removeUploadedFile(existing.setting_value);

    await logActivity(req.user.id, req.user.name, `Menghapus foto profil: ${key}`, 'settings', null, key);
    res.json({ message: 'Foto berhasil dihapus.', key });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kesalahan server.' });
  }
});

export default router;
