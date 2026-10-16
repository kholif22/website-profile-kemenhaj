/**
 * Membuat atau memperbarui akun administrator dari variabel lingkungan.
 *
 * Pemakaian:
 *   1. Isi ADMIN_EMAIL, ADMIN_USERNAME (opsional), dan ADMIN_PASSWORD di .env
 *   2. Jalankan:  npm run admin:setup
 *
 * Berguna untuk menyiapkan akun admin di server tanpa perlu membuka panel admin.
 * Sandi TIDAK dicetak ke layar.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { getDatabase, initializeDatabase } from '../src/backend/models/database.js';

const username = (process.env.ADMIN_USERNAME || '').trim() || null;
const email = (process.env.ADMIN_EMAIL || 'admin@plhut-magetan.go.id').trim();
const password = process.env.ADMIN_PASSWORD || '';

if (!password || password.length < 8) {
  console.error('GAGAL: set ADMIN_PASSWORD di .env (minimal 8 karakter).');
  process.exit(1);
}
if (username && !/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
  console.error('GAGAL: ADMIN_USERNAME hanya boleh 3-30 karakter (huruf, angka, titik, garis bawah, strip).');
  process.exit(1);
}

await initializeDatabase();
const db = await getDatabase();

const hash = await bcrypt.hash(password, 12);
const existing = await db.get(
  `SELECT id, email, username FROM users WHERE email = ? OR (username IS NOT NULL AND username = ?) LIMIT 1`,
  [email, username]
);

if (existing) {
  await db.run(
    `UPDATE users SET username = ?, email = ?, password_hash = ?, role = 'admin', is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [username ?? existing.username ?? null, email, hash, existing.id]
  );
  console.log(`Akun admin diperbarui (id=${existing.id}, email=${email}${username ? `, username=${username}` : ''}).`);
} else {
  const result = await db.run(
    `INSERT INTO users (name, username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 'admin', 1)`,
    ['Administrator PLHUT', username, email, hash]
  );
  console.log(`Akun admin dibuat (id=${result.lastID}, email=${email}${username ? `, username=${username}` : ''}).`);
}

process.exit(0);
