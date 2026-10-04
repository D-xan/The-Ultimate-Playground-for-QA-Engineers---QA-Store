// One-off, re-run when a page changes a lot: screenshots every indexed practice page into public/shots/
// as WebP under 90 KB, named after the page's primary keyword so the file name describes the image.
// Writes src/data/screenshots.json, which PageGuide, the JSON-LD and the image sitemap read.
//   npm run build && node scripts/captureScreenshots.mjs
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const out = path.join(root, 'public/shots');
const seo = JSON.parse(await readFile(path.join(root, 'src/data/seo.json'), 'utf8'));

const INFO_IDS = ['about', 'privacy-policy', 'terms-of-service', 'contact']; // keep in step with src/seo/seo.ts
const ids = ['practice', ...Object.keys(seo).filter((id) => id !== 'home' && id !== 'practice' && !INFO_IDS.includes(id)).sort()];
const pagePath = (id) => (id === 'practice' ? 'practice' : `practice/${id}`);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const WIDTH = 1200;
const MAX_BYTES = 90 * 1024;

// Serve dist/ the way GitHub Pages and Cloudflare Pages do: files first, the SPA shell otherwise.
const shell = await readFile(path.join(dist, 'index.html'));
const types = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(dist, rel);
  if (file.startsWith(dist) && (await stat(file).catch(() => null))?.isFile()) {
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  } else {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(shell);
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.route((u) => !u.href.startsWith(origin), (route) => route.abort());
const encoder = await browser.newPage();

await mkdir(out, { recursive: true });
const manifest = {};
for (const id of ids) {
  await page.goto(origin + pagePath(id));
  await page.waitForFunction(() => !document.querySelector('[data-app-loading]') && document.getElementById('root')?.hasChildNodes());
  await page.waitForLoadState('networkidle');
  // Floating helpers and the bottom action bar cover the content; they are chrome, not the subject.
  await page.addStyleTag({ content: 'main > .absolute.bottom-0, .fixed { display: none !important; } *, *::before, *::after { animation: none !important; transition: none !important; }' });
  await page.waitForTimeout(700);
  const box = await page.locator('main').boundingBox();
  const height = Math.round(box.width * 0.625); // 16:10
  const png = await page.screenshot({ clip: { x: box.x, y: box.y, width: box.width, height: Math.min(height, box.height) } });

  // Chromium encodes WebP; step the quality down until the file fits the budget.
  const { data, w, h } = await encoder.evaluate(async ({ b64, width, max }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = width;
    c.height = Math.round((img.height * width) / img.width);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, c.width, c.height);
    let url = '';
    for (let q = 0.86; q >= 0.4; q -= 0.06) {
      url = c.toDataURL('image/webp', q);
      if ((url.length - 23) * 0.75 <= max) break;
    }
    return { data: url.split(',')[1], w: c.width, h: c.height };
  }, { b64: png.toString('base64'), width: WIDTH, max: MAX_BYTES });

  const file = `${slug(seo[id].primaryKeyword)}.webp`;
  const bytes = Buffer.from(data, 'base64');
  await writeFile(path.join(out, file), bytes);
  manifest[id] = { file, width: w, height: h };
  console.log(`${id.padEnd(18)} ${file} ${(bytes.length / 1024).toFixed(0)} KB`);
}

await browser.close();
server.close();
await writeFile(path.join(root, 'src/data/screenshots.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`wrote ${ids.length} screenshots and src/data/screenshots.json`);
