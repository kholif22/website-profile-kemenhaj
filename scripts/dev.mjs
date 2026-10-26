/**
 * Menjalankan backend Express (API) dan Vite dev server sekaligus.
 *
 * Sebelumnya `npm run dev` hanya menjalankan Vite. Proxy `/api` di Vite menunjuk
 * ke http://localhost:3000, sehingga bila backend belum dijalankan, semua
 * permintaan login gagal (ECONNREFUSED) dan pengguna hanya melihat pesan
 * "Tidak dapat terhubung ke server".
 *
 * Pemakaian:
 *   npm run dev                # API + frontend
 *   npm run dev -- --port 5173 # argumen diteruskan ke Vite
 *   npm run dev:web            # frontend saja (backend harus sudah berjalan)
 *   npm run dev:api            # backend saja
 *
 * Jika port API sudah dipakai (mis. backend dijalankan di terminal lain),
 * proses backend dilewati agar tidak bentrok.
 */
import dotenv from 'dotenv';
import net from 'net';
import path from 'path';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

const node = process.execPath;
const apiPort = Number(process.env.PORT) || 3000;
const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const viteArgs = [viteBin, ...process.argv.slice(2)];

const children = new Set();
let shuttingDown = false;

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    try {
      child.kill();
    } catch {
      // proses sudah berhenti
    }
  }
  setTimeout(() => process.exit(code), 200);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

function start(label, args) {
  const child = spawn(node, args, { cwd: root, stdio: 'inherit', env: process.env });
  children.add(child);

  child.on('error', (err) => {
    console.error(`[dev] Gagal menjalankan ${label}: ${err.message}`);
    shutdown(1);
  });

  child.on('exit', (code, signal) => {
    children.delete(child);
    if (shuttingDown) return;
    const reason = signal ? `sinyal ${signal}` : `kode ${code}`;
    console.error(`\n[dev] ${label} berhenti (${reason}). Menghentikan proses lainnya...`);
    shutdown(code ?? 1);
  });

  return child;
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    const done = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(1000);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

if (!existsSync(viteBin)) {
  console.error('[dev] Vite tidak ditemukan. Jalankan "npm install" terlebih dahulu.');
  process.exit(1);
}

if (await isPortOpen(apiPort)) {
  console.log(`[dev] Backend sudah berjalan di http://localhost:${apiPort}, melewati proses API.`);
} else {
  console.log(`[dev] Menjalankan backend di http://localhost:${apiPort} ...`);
  start('Backend (server.js)', [path.join(root, 'server.js')]);
}

console.log('[dev] Menjalankan Vite ...');
start('Vite', viteArgs);
