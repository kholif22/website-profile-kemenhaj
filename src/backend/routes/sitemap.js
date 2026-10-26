import express from 'express';
import { getDatabase } from '../models/database.js';
import { getSiteUrl } from '../utils/siteUrl.js';

const router = express.Router();

const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/profil', changefreq: 'monthly', priority: '0.8' },
  { path: '/layanan-haji', changefreq: 'monthly', priority: '0.9' },
  { path: '/layanan-umrah', changefreq: 'monthly', priority: '0.9' },
  { path: '/manasik', changefreq: 'weekly', priority: '0.8' },
  { path: '/berita', changefreq: 'daily', priority: '0.9' },
  { path: '/pengaduan', changefreq: 'monthly', priority: '0.7' },
  { path: '/kontak', changefreq: 'monthly', priority: '0.7' },
];

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const toLastmod = (value) => {
  if (!value) return null;
  const text = String(value);
  // SQLite menyimpan DATETIME sebagai "YYYY-MM-DD HH:MM:SS" (UTC).
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
};

router.get('/sitemap.xml', async (req, res) => {
  const baseUrl = getSiteUrl(req);
  const urls = STATIC_PAGES.map((page) => ({
    loc: `${baseUrl}${page.path}`,
    changefreq: page.changefreq,
    priority: page.priority,
    lastmod: null,
  }));

  try {
    const db = await getDatabase();
    const news = await db.all(
      `SELECT slug, updated_at, published_at
       FROM news
       WHERE status = 'published' AND published_at IS NOT NULL
       ORDER BY published_at DESC
       LIMIT 500`
    );

    for (const item of news) {
      if (!item.slug) continue;
      urls.push({
        loc: `${baseUrl}/berita/${encodeURIComponent(item.slug)}`,
        changefreq: 'monthly',
        priority: '0.6',
        lastmod: toLastmod(item.updated_at || item.published_at),
      });
    }
  } catch (err) {
    // Sitemap tetap bisa disajikan untuk halaman statis meski database bermasalah.
    console.error('Gagal membuat sitemap dari database:', err.message);
  }

  const body = urls.map((item) => [
    '  <url>',
    `    <loc>${escapeXml(item.loc)}</loc>`,
    item.lastmod ? `    <lastmod>${item.lastmod}</lastmod>` : null,
    `    <changefreq>${item.changefreq}</changefreq>`,
    `    <priority>${item.priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n')).join('\n');

  res
    .type('application/xml')
    .set('Cache-Control', 'public, max-age=3600')
    .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
});

export default router;
