import multer from 'multer';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import crypto from 'crypto';
import { uploadsDir } from '../config/paths.js';

if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${randomName}${ext}`);
  },
});

const allowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExt.includes(ext) && allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('Tipe file tidak diizinkan. Gunakan JPG, PNG, WEBP, atau GIF.');
    err.status = 400;
    cb(err);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
});
