import path from 'path';
import { fileURLToPath } from 'url';

// Akar proyek: src/backend/config -> src/backend -> src -> root
const rootPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

// UPLOAD_DIR dibaca relatif terhadap akar proyek agar konsisten dengan static
// middleware di server.js. Nilai absolut juga didukung oleh path.resolve.
export const uploadsDir = path.resolve(rootPath, process.env.UPLOAD_DIR || 'uploads');
