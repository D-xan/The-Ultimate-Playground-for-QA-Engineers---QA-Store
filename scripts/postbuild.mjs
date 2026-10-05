// Runs after `vite build`: prerenders every SEO page to static HTML, draws a share image per page,
// and writes sitemap.xml, robots.txt, llms.txt and the 404.html SPA fallback into dist/.
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { loadEnv } from 'vite';
import { chromium } from '@playwright/test';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const env = loadEnv('production', root);
const SITE_URL = env.VITE_SITE_URL; // canonical: sitemap, share-image host, llms.txt links
const PUBLIC_URL = env.VITE_PUBLIC_URL || SITE_URL; // where this copy is served
const isMirror = PUBLIC_URL !== SITE_URL;
const base = new URL(PUBLIC_URL).pathname;
const seo = JSON.parse(await readFile(path.join(root, 'src/data/seo.json'), 'utf8'));
const shots = JSON.parse(await readFile(path.join(root, 'src/data/screenshots.json'), 'utf8'));

const INFO_IDS = ['about', 'privacy-policy', 'terms-of-service', 'contact']; // keep in step with src/seo/seo.ts
const pathForId = (id) => (id === 'home' ? '' : id === 'practice' || INFO_IDS.includes(id) ? id : `practice/${id}`);
// GitHub Pages serves /practice/tables from practice/tables.html without a trailing-slash redirect.
const fileForId = (id) => path.join(dist, id === 'home' ? 'index.html' : `${pathForId(id)}.html`);
const ids = ['home', 'practice', ...Object.keys(seo).filter((id) => id !== 'home' && id !== 'practice' && !INFO_IDS.includes(id)).sort(), ...INFO_IDS];

const shell = await readFile(path.join(dist, 'index.html'), 'utf8');
await writeFile(path.join(dist, '404.html'), shell);

// Store, login, admin and popup routes are client-rendered and kept out of search (SeoHead gives them
// noindex at runtime). Without a file they got 404.html with status 404, so the homepage's product links
// looked broken to crawlers. Serve them a shell with status 200 and noindex in the raw HTML instead.
const STORE_ROUTES = ['/products', '/categories', '/deals', '/product/*', '/cart', '/checkout', '/profile', '/orders', '/settings', '/wishlist', '/login', '/popup/*', '/admin', '/admin/*'];
await writeFile(path.join(dist, 'store-shell.html'), shell
  .replace(/<title>[^<]*<\/title>/, '<title>QA Store demo | QA Playground</title>')
  .replace('<meta name="robots" content="index, follow" />', '<meta name="robots" content="noindex, follow" />'));
// Cloudflare Pages reads _redirects (public/_redirects is already copied in); GitHub Pages ignores it.
// The target has no .html: Pages would 308 /store-shell.html to /store-shell.
await writeFile(path.join(dist, '_redirects'), (await readFile(path.join(dist, '_redirects'), 'utf8').catch(() => '')) +
  `\n# Client-rendered store routes: noindex shell, status 200 (added by scripts/postbuild.mjs)\n${STORE_ROUTES.map((r) => `${r} /store-shell 200`).join('\n')}\n`);

const types = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const rel = url.pathname.startsWith(base) ? url.pathname.slice(base.length) : null;
  const file = rel && path.join(dist, decodeURIComponent(rel));
  if (file && file.startsWith(dist) && (await stat(file).catch(() => null))?.isFile()) {
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  } else {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(shell);
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}${base}`;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
// Only the local copy of the site is needed to render; skip analytics, fonts and outbound calls.
await context.route((u) => !u.href.startsWith(origin), (route) => route.abort());
const page = await context.newPage();
page.on('pageerror', (e) => console.warn(`  page error: ${e.message}`));

for (const id of ids) {
  await page.goto(origin + pathForId(id));
  await page.waitForFunction((t) => document.title === t, seo[id].title);
  await page.waitForFunction(() => !document.querySelector('[data-app-loading]') && document.getElementById('root')?.hasChildNodes());
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600); // let entrance animations settle so nothing is captured mid-fade
  // Vite injects chunk preloads and CSS links with absolute URLs; point them at the real site path.
  const html = ('<!doctype html>\n' + (await page.evaluate(() => document.documentElement.outerHTML)).replaceAll(new URL(origin).origin, ''))
    // Cloudflare's email obfuscation rewrites mailto links to /cdn-cgi/l/email-protection, a 404 for crawlers.
    .replace(/<a [^>]*href="mailto:[^"]*"[^>]*>[\s\S]*?<\/a>/g, (a) => `<!--email_off-->${a}<!--/email_off-->`);
  await mkdir(path.dirname(fileForId(id)), { recursive: true });
  await writeFile(fileForId(id), html);
  console.log(`prerendered /${pathForId(id)}`);
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const host = new URL(SITE_URL).host;
const ogHtml = (id) => `<!doctype html><html><head><style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; font-family: Inter, 'Segoe UI', Roboto, 'DejaVu Sans', sans-serif; color: #f8fafc;
    background: radial-gradient(900px 500px at 100% 0%, #1e3a8a 0%, transparent 60%), #0b1120; padding: 72px 80px; display: flex; flex-direction: column; }
  .brand { display: flex; align-items: center; gap: 14px; font-size: 26px; font-weight: 600; color: #cbd5e1; }
  .dot { width: 18px; height: 18px; border-radius: 5px; background: #3b82f6; box-shadow: 0 0 0 6px rgba(59,130,246,.25); }
  h1 { margin-top: auto; font-size: ${seo[id].ogHeadline.length > 26 ? 68 : 80}px; line-height: 1.05; letter-spacing: -0.02em; font-weight: 800; max-width: 1000px; }
  p { margin-top: 24px; font-size: 32px; line-height: 1.3; color: #94a3b8; max-width: 980px; }
  .foot { margin-top: auto; display: flex; justify-content: space-between; align-items: center; font-size: 24px; color: #64748b; }
  .url { font-family: 'DejaVu Sans Mono', ui-monospace, monospace; color: #93c5fd; }
  .free { border: 2px solid #334155; border-radius: 999px; padding: 8px 20px; color: #cbd5e1; }
</style></head><body>
  <div class="brand"><span class="dot"></span>QA Playground</div>
  <h1>${esc(seo[id].ogHeadline)}</h1>
  <p>${esc(seo[id].ogSubline)}</p>
  <div class="foot"><span class="url">${esc(host + '/' + pathForId(id))}</span><span class="free">Free, no sign-up</span></div>
</body></html>`;

await mkdir(path.join(dist, 'og'), { recursive: true });
const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const id of ids) {
  await og.setContent(ogHtml(id));
  await og.screenshot({ path: path.join(dist, 'og', `${id}.png`) });
}
console.log(`drew ${ids.length} share images`);
await browser.close();
server.close();

const today = new Date().toISOString().slice(0, 10);
const url = (id) => SITE_URL + pathForId(id);
// The mirror's canonical tags already point at SITE_URL, so only the canonical copy lists a sitemap.
if (!isMirror) await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${ids.map((id) => {
  // Each page lists its own screenshot and share image so both can be found in image search.
  const images = [shots[id] && `${SITE_URL}shots/${shots[id].file}`, `${SITE_URL}og/${id}.png`].filter(Boolean);
  return `  <url><loc>${url(id)}</loc><lastmod>${today}</lastmod>${images.map((i) => `<image:image><image:loc>${i}</image:loc></image:image>`).join('')}</url>`;
}).join('\n')}
  <url><loc>${SITE_URL}docs/</loc><lastmod>${today}</lastmod></url>
</urlset>
`);
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *
Allow: /
${isMirror ? '' : `\nSitemap: ${SITE_URL}sitemap.xml\n`}`);
const line = (id) => `- [${seo[id].title.replace(/ \| QA Playground$/, '')}](${url(id)}): ${seo[id].metaDescription}`;
await writeFile(path.join(dist, 'llms.txt'), `# QA Playground

> ${seo.practice.answer}

QA Playground is free and needs no sign-up. It is part of [Randomly.online](https://randomly.online/), a collection of free browser tools.

## Start here

${line('practice')}
${line('home')}

## Practice pages and tools

${ids.filter((id) => id !== 'home' && id !== 'practice' && !INFO_IDS.includes(id)).map(line).join('\n')}

## About

${INFO_IDS.map(line).join('\n')}
`);
console.log(`wrote 404.html, ${isMirror ? '' : 'sitemap.xml, '}robots.txt, llms.txt${isMirror ? ` (mirror of ${SITE_URL})` : ''}`);
