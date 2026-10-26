import { readFile, stat } from 'fs/promises';
import { getDatabase } from '../models/database.js';
import { absoluteUrl } from './siteUrl.js';

const SITE_NAME = 'PLHUT Kabupaten Magetan';
const DEFAULT_DESCRIPTION = 'Informasi resmi pelayanan haji dan umrah Kabupaten Magetan: pendaftaran, manasik, pengumuman, berita, dan pengaduan masyarakat.';

const STATIC_META = {
  '/': {
    title: `${SITE_NAME} - Pusat Layanan Haji dan Umrah`,
    description: DEFAULT_DESCRIPTION,
  },
  '/profil': {
    title: 'Profil Instansi',
    description: 'Sejarah, visi, misi, tugas, dan struktur layanan Pusat Layanan Haji dan Umrah Terpadu Kabupaten Magetan.',
  },
  '/layanan-haji': {
    title: 'Layanan Haji',
    description: 'Panduan pendaftaran porsi, persyaratan dokumen, biometrik, dan alur pelayanan haji reguler Kabupaten Magetan.',
  },
  '/layanan-umrah': {
    title: 'Layanan & Edukasi Umrah',
    description: 'Panduan Gerakan 5 Pasti Umrah, persyaratan dokumen, dan verifikasi legalitas PPIU di Kabupaten Magetan.',
  },
  '/manasik': {
    title: 'Informasi & Jadwal Manasik',
    description: 'Jadwal bimbingan manasik haji tingkat kabupaten dan kecamatan di Kabupaten Magetan.',
  },
  '/berita': {
    title: 'Berita & Pengumuman',
    description: 'Berita kegiatan, informasi pelayanan, dan pengumuman resmi PLHUT Kabupaten Magetan.',
  },
  '/pengaduan': {
    title: 'Pusat Informasi & Pengaduan',
    description: 'Sampaikan pengaduan, pertanyaan, atau laporan pelayanan haji dan umrah kepada PLHUT Kabupaten Magetan.',
  },
  '/kontak': {
    title: 'Kontak & Lokasi',
    description: 'Alamat kantor, telepon, email, jam pelayanan, dan peta lokasi PLHUT Kabupaten Magetan.',
  },
};

const normalizePathname = (pathname) => pathname.replace(/\/+$/, '') || '/';

const stripHtml = (html) => String(html || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const truncate = (value, maxLength) => {
  const text = String(value || '');
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}...` : text;
};

const toIsoDate = (value) => {
  if (!value) return undefined;
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(text)) {
    return `${text.replace(' ', 'T')}Z`;
  }
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? text : date.toISOString();
};

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const fullTitle = (title) => {
  const text = String(title || SITE_NAME);
  return text.includes('PLHUT') ? text : `${text} - ${SITE_NAME}`;
};

/**
 * Menentukan status HTTP dan metadata untuk sebuah path SPA.
 * Detail berita divalidasi ke database agar URL yang tidak ada menghasilkan 404.
 */
export async function resolveSpaPage(req) {
  const cleanPath = normalizePathname(req.path);
  let status = 200;
  let meta = STATIC_META[cleanPath] ? { ...STATIC_META[cleanPath] } : null;

  if (!meta && /^\/admin(?:\/.*)?$/.test(cleanPath)) {
    meta = { title: 'Dashboard Admin', noIndex: true };
  }

  if (!meta) {
    const newsMatch = cleanPath.match(/^\/berita\/([^/]+)$/);
    if (newsMatch) {
      try {
        const db = await getDatabase();
        const slug = decodeURIComponent(newsMatch[1]);
        const article = await db.get(
          `SELECT title, slug, excerpt, content, image, published_at, updated_at
           FROM news
           WHERE slug = ? AND status = 'published'`,
          [slug]
        );

        if (article) {
          meta = {
            title: article.title,
            description: truncate(article.excerpt || stripHtml(article.content), 160) || DEFAULT_DESCRIPTION,
            image: article.image ? absoluteUrl(req, article.image) : null,
            type: 'article',
            url: absoluteUrl(req, `/berita/${encodeURIComponent(article.slug)}`),
            jsonLd: {
              '@context': 'https://schema.org',
              '@type': 'NewsArticle',
              headline: article.title,
              description: truncate(article.excerpt || stripHtml(article.content), 160),
              ...(article.image ? { image: [absoluteUrl(req, article.image)] } : {}),
              datePublished: toIsoDate(article.published_at),
              dateModified: toIsoDate(article.updated_at || article.published_at),
              mainEntityOfPage: absoluteUrl(req, `/berita/${encodeURIComponent(article.slug)}`),
              publisher: {
                '@type': 'GovernmentOrganization',
                name: SITE_NAME,
              },
            },
          };
        }
      } catch {
        // Diperlakukan sebagai 404 di bawah.
      }
    }

    if (!meta) {
      status = 404;
      meta = {
        title: 'Halaman Tidak Ditemukan',
        description: 'Halaman yang Anda tuju tidak tersedia.',
        noIndex: true,
      };
    }
  }

  if (!meta.url) meta.url = absoluteUrl(req, cleanPath);
  if (!meta.type) meta.type = 'website';
  if (meta.noIndex === undefined) meta.noIndex = false;

  if (cleanPath === '/' && !meta.jsonLd) {
    meta.jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'GovernmentOrganization',
      name: SITE_NAME,
      url: meta.url,
      description: meta.description,
    };
  }

  return { status, meta };
}

let cachedTemplate = { mtimeMs: 0, html: '' };

async function loadIndexTemplate(indexPath) {
  const info = await stat(indexPath);
  if (cachedTemplate.html && cachedTemplate.mtimeMs === info.mtimeMs) {
    return cachedTemplate.html;
  }
  const html = await readFile(indexPath, 'utf8');
  cachedTemplate = { mtimeMs: info.mtimeMs, html };
  return html;
}

function replaceMeta(html, attribute, key, content) {
  if (!content) {
    return html.replace(new RegExp(`\\s*<meta\\s+${attribute}="${key}"[^>]*>`, 'i'), '');
  }
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(content)}">`;
  const pattern = new RegExp(`<meta\\s+${attribute}="${key}"[^>]*>`, 'i');
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
}

/**
 * Menyisipkan title/description/OG/canonical/JSON-LD ke index.html sebelum
 * dikirim, sehingga crawler yang tidak mengeksekusi JavaScript tetap mendapat
 * metadata yang benar.
 */
export async function renderIndexHtml(indexPath, meta) {
  const title = fullTitle(meta.title);
  let html = await loadIndexTemplate(indexPath);

  html = html.replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(title)}</title>`);
  html = replaceMeta(html, 'name', 'description', meta.description || DEFAULT_DESCRIPTION);
  html = replaceMeta(html, 'name', 'robots', meta.noIndex ? 'noindex, nofollow' : 'index, follow');
  html = replaceMeta(html, 'property', 'og:title', title);
  html = replaceMeta(html, 'property', 'og:description', meta.description || DEFAULT_DESCRIPTION);
  html = replaceMeta(html, 'property', 'og:type', meta.type || 'website');
  html = replaceMeta(html, 'property', 'og:site_name', SITE_NAME);
  html = replaceMeta(html, 'property', 'og:locale', 'id_ID');
  html = replaceMeta(html, 'property', 'og:url', meta.url);
  html = replaceMeta(html, 'property', 'og:image', meta.image);
  html = replaceMeta(html, 'name', 'twitter:card', meta.image ? 'summary_large_image' : 'summary');
  html = replaceMeta(html, 'name', 'twitter:title', title);
  html = replaceMeta(html, 'name', 'twitter:description', meta.description || DEFAULT_DESCRIPTION);
  html = replaceMeta(html, 'name', 'twitter:image', meta.image);

  if (!meta.noIndex) {
    const canonicalTag = `<link rel="canonical" href="${escapeHtml(meta.url)}">`;
    if (/<link\s+rel="canonical"[^>]*>/i.test(html)) {
      html = html.replace(/<link\s+rel="canonical"[^>]*>/i, canonicalTag);
    } else {
      html = html.replace('</head>', `  ${canonicalTag}\n</head>`);
    }
  }

  if (meta.jsonLd) {
    const json = JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c');
    html = html.replace('</head>', `  <script type="application/ld+json">${json}</script>\n</head>`);
  }

  return html;
}
