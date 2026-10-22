import fs from 'node:fs/promises';
import { renderPage, pages } from '../.prerender/prerender.js';
const template = await fs.readFile('dist/index.html', 'utf8');
const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
let origin = '';
if (process.env.SITE_URL) {
  const parsed = new URL(process.env.SITE_URL);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) {
    throw new Error('SITE_URL must be an HTTPS origin without credentials, a path, query or fragment');
  }
  origin = parsed.origin;
}
for (const page of pages) {
  const canonical = origin ? `${origin}${page.path}` : '';
  const schema = { '@context': 'https://schema.org', '@type': 'WebApplication', name: page.heading, description: page.description, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', isAccessibleForFree: true, ...(canonical ? { url: canonical } : {}) };
  let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(page.title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/>)/, `$1${escape(page.description)}$2`)
    .replace('<div id="root"></div>', `<div id="root">${renderPage(page.path)}</div>`)
    .replace('</head>', `<meta property="og:type" content="website"/><meta property="og:title" content="${escape(page.title)}"/><meta property="og:description" content="${escape(page.description)}"/>${canonical ? `<link rel="canonical" href="${canonical}"/><meta property="og:url" content="${canonical}"/>` : ''}<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script></head>`);
  const directory = page.path === '/' ? 'dist' : `dist${page.path}`;
  await fs.mkdir(directory, {recursive:true}); await fs.writeFile(`${directory}/index.html`, html);
}
await fs.writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ''}`);
if (origin) await fs.writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p => `<url><loc>${origin}${p.path}</loc></url>`).join('')}</urlset>`);
console.log(`Prerendered ${pages.length} pages. ${origin ? 'Canonical URLs and sitemap generated.' : 'Set SITE_URL to generate canonical URLs and sitemap for your production domain.'}`);
