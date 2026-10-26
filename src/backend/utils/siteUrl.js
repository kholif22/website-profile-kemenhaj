// URL publik website. Di produksi, set SITE_URL (mis. https://plhutmagetan.go.id)
// agar sitemap/canonical tidak bergantung pada header Host yang bisa dipalsukan.
export function getSiteUrl(req) {
  const configured = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
  if (configured) return configured;

  // trust proxy (lihat server.js) membuat req.protocol mengikuti X-Forwarded-Proto
  // ketika aplikasi berada di belakang Nginx/load balancer.
  return `${req.protocol}://${req.get('host')}`;
}

export function absoluteUrl(req, pathname = '/') {
  try {
    return new URL(pathname, `${getSiteUrl(req)}/`).href;
  } catch {
    return `${getSiteUrl(req)}${pathname}`;
  }
}
