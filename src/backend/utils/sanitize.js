// Minimal HTML sanitizer (defense-in-depth) untuk konten kaya yang ditulis admin.
// Catatan: ini BUKAN pengganti parser HTML penuh. Tujuannya menutup vektor XSS yang
// paling umum (script/iframe/event handler/javascript: URL) pada konten berita.

const BLOCKED_TAGS = [
  'script', 'style', 'iframe', 'object', 'embed', 'link', 'meta',
  'base', 'form', 'input', 'button', 'textarea', 'select', 'option',
  'svg', 'math', 'frame', 'frameset', 'applet',
];

export function sanitizeHtml(input) {
  if (!input || typeof input !== 'string') return '';
  let html = input;

  // Hapus tag berbahaya beserta isinya (mis. <script>...</script>) dan varian void/self-closing
  for (const tag of BLOCKED_TAGS) {
    html = html.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'), '');
    html = html.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi'), '');
  }

  // Hapus atribut event handler (onclick, onerror, onload, dst.)
  html = html.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Netralkan skema URL berbahaya pada href/src/action
  html = html.replace(
    /\s(href|src|xlink:href|action)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,
    (match, attr, value) => {
      const raw = value
        .replace(/^['"]|['"]$/g, '')
        .replace(/[\s\u0000-\u001f]/g, '')
        .toLowerCase();
      if (
        raw.startsWith('javascript:') ||
        raw.startsWith('vbscript:') ||
        (raw.startsWith('data:') && !raw.startsWith('data:image/'))
      ) {
        return ` ${attr}="#"`;
      }
      return match;
    }
  );

  return html;
}

export default sanitizeHtml;
