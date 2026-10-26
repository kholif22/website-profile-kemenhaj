import { useEffect } from 'react';

const SITE_NAME = 'PLHUT Kabupaten Magetan';
const DEFAULT_DESCRIPTION = 'Informasi resmi pelayanan haji dan umrah Kabupaten Magetan: pendaftaran, manasik, pengumuman, berita, dan pengaduan masyarakat.';
const MANAGED_ATTR = 'data-seo-managed';

function setMeta(attribute, key, content) {
  if (!content) return;
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
  element.setAttribute(MANAGED_ATTR, 'true');
}

function removeManagedMeta(attribute, key) {
  const element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (element?.getAttribute(MANAGED_ATTR) === 'true') {
    element.remove();
  }
}

function toAbsoluteUrl(value) {
  if (!value) return null;
  try {
    return new URL(value, window.location.origin).href;
  } catch {
    return value;
  }
}

/**
 * Mengatur title, description, canonical, dan tag Open Graph/Twitter untuk
 * halaman saat ini. Tidak memakai dependensi tambahan agar bundle tetap kecil.
 */
export function useSEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  type = 'website',
  url,
  noIndex = false,
  appendSiteName = true,
} = {}) {
  useEffect(() => {
    const fullTitle = title
      ? (appendSiteName && !title.includes('PLHUT') ? `${title} - ${SITE_NAME}` : title)
      : SITE_NAME;

    const canonicalUrl = toAbsoluteUrl(url || `${window.location.origin}${window.location.pathname}`);
    const imageUrl = toAbsoluteUrl(image);

    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setMeta('name', 'theme-color', '#171717');

    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:locale', 'id_ID');
    if (canonicalUrl) setMeta('property', 'og:url', canonicalUrl);
    if (imageUrl) {
      setMeta('property', 'og:image', imageUrl);
    } else {
      removeManagedMeta('property', 'og:image');
    }

    setMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    if (imageUrl) {
      setMeta('name', 'twitter:image', imageUrl);
    } else {
      removeManagedMeta('name', 'twitter:image');
    }

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonicalUrl && !noIndex) {
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
      canonical.setAttribute(MANAGED_ATTR, 'true');
    } else if (noIndex && canonical?.getAttribute(MANAGED_ATTR) === 'true') {
      canonical.remove();
    }
  }, [title, description, image, type, url, noIndex, appendSiteName]);
}
