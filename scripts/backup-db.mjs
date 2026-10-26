/**
 * Backup database SQLite yang aman saat server sedang berjalan.
 * Memakai `VACUUM INTO` yang menghasilkan salinan konsisten (termasuk WAL),
 * lalu menghapus backup lama sesuai BACKUP_KEEP.
 *
 * Pemakaian:
 *   npm run db:backup
 *   BACKUP_KEEP=14 npm run db:backup
 */
import 'dotenv/config';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
} from 'fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = path.join(root, 'database', 'plhut.db');
const backupDir = path.join(root, 'backups');
const keep = Math.max(1, Number(process.env.BACKUP_KEEP) || 30);

if (!existsSync(dbPath)) {
  console.error(`GAGAL: database tidak ditemukan di ${dbPath}`);
  process.exit(1);
}

mkdirSync(backupDir, { recursive: true });

const timestamp = new Date().toISOString()
  .replace('T', '_')
  .replace(/[:.]/g, '-')
  .slice(0, 19);
const destination = path.join(backupDir, `plhut-${timestamp}.db`);
const destinationSql = destination.replace(/'/g, "''");

let db;

try {
  db = await open({ filename: dbPath, driver: sqlite3.Database });
  await db.exec('PRAGMA busy_timeout = 5000');

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await db.exec(`VACUUM INTO '${destinationSql}'`);
      lastError = null;
      break;
    } catch (err) {
      lastError = err;
      if (err.code !== 'SQLITE_BUSY' || attempt === 3) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  if (lastError) throw lastError;

  if (!existsSync(destination) || statSync(destination).size === 0) {
    throw new Error('file backup kosong atau tidak terbentuk');
  }

  // Hapus backup paling lama, sisakan `keep` file terbaru.
  const files = readdirSync(backupDir)
    .filter((name) => /^plhut-.*\.db$/.test(name))
    .map((name) => {
      const filePath = path.join(backupDir, name);
      return { filePath, mtimeMs: statSync(filePath).mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  for (const file of files.slice(keep)) {
    try {
      unlinkSync(file.filePath);
    } catch (err) {
      console.warn(`Peringatan: gagal menghapus backup lama ${file.filePath}: ${err.message}`);
    }
  }

  console.log(`Backup database berhasil: ${destination}`);
  console.log(`Total backup disimpan: ${Math.min(files.length, keep)} (maksimal ${keep}).`);
} catch (err) {
  console.error('GAGAL membuat backup:', err.message);
  if (existsSync(destination)) {
    try {
      unlinkSync(destination);
    } catch {
      // abaikan kegagalan pembersihan
    }
  }
  process.exitCode = 1;
} finally {
  if (db) await db.close();
}
