import { unlink } from 'fs/promises';
import path from 'path';
import { uploadsDir } from '../config/paths.js';

// Menghapus berkas upload lama berdasarkan path publik yang tersimpan di DB
// (mis. "/uploads/123-abc.jpg"). path.basename mencegah path traversal.
export async function removeUploadedFile(publicPath) {
  if (!publicPath || typeof publicPath !== 'string') return;
  if (/^https?:\/\//i.test(publicPath)) return;

  const filename = path.basename(publicPath);
  if (!filename || filename === '.' || filename === '..') return;

  try {
    await unlink(path.join(uploadsDir, filename));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Gagal menghapus berkas upload:', err.message);
    }
  }
}
