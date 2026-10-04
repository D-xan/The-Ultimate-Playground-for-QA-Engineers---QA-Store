#!/usr/bin/env node
// Ping IndexNow so Bing, Yandex, Seznam and Naver re-crawl pages on demand.
// Ported from Randomly.online's script; URLs come from the built dist/sitemap.xml.
//
//   node scripts/indexnow-submit.mjs --all              every sitemap URL
//   node scripts/indexnow-submit.mjs <url> [url...]     explicit list
//   node scripts/indexnow-submit.mjs --all --dry-run    print, send nothing
//   node scripts/indexnow-submit.mjs --verify-key       check the deployed key file
//
// IndexNow verifies ownership by fetching the key file, so it must be DEPLOYED
// (public/<key>.txt) before a submission is accepted. Run `npm run build` first for --all.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnv } from 'vite';

const ROOT = join(import.meta.dirname, '..');
const SITE_URL = loadEnv('production', ROOT).VITE_SITE_URL;
const HOST = new URL(SITE_URL).host;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

// The key is whatever 32-hex .txt file sits in public/, so rotating it is a rename.
function findKey() {
  const dir = join(ROOT, 'public');
  const hits = readdirSync(dir).filter((f) => /^[a-f0-9]{32}\.txt$/.test(f));
  if (hits.length !== 1) throw new Error(`Expected exactly one <32-hex>.txt key file in public/, found ${hits.length}`);
  const key = hits[0].replace(/\.txt$/, '');
  if (readFileSync(join(dir, hits[0]), 'utf8').trim() !== key) throw new Error(`${hits[0]} must contain exactly its own key`);
  return key;
}

const sitemapUrls = () =>
  [...readFileSync(join(ROOT, 'dist/sitemap.xml'), 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());

async function verifyKey(key) {
  const url = `${SITE_URL}${key}.txt`;
  const res = await fetch(url);
  const ok = res.ok && (await res.text()).trim() === key;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${url} -> ${res.status}`);
  if (!ok) console.log('     Deploy the key file before submitting; IndexNow rejects unverified hosts.');
  return ok;
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const key = findKey();

if (args.includes('--verify-key')) {
  process.exitCode = (await verifyKey(key)) ? 0 : 1;
} else {
  const urls = args.includes('--all') ? sitemapUrls() : args.filter((a) => a.startsWith('http'));
  if (urls.length === 0) {
    console.error('Nothing to submit. Pass --all or explicit URLs.');
    process.exit(1);
  }
  const off = urls.filter((u) => !u.startsWith(SITE_URL));
  if (off.length) {
    console.error(`Refusing to submit URLs outside ${SITE_URL}:\n  ${off.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`key ${key}  |  ${urls.length} URL(s)`);
  if (dryRun) {
    urls.forEach((u) => console.log(`  ${u}`));
  } else {
    if (!(await verifyKey(key))) process.exit(1);
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE_URL}${key}.txt`, urlList: urls }),
    });
    // 200 accepted, 202 accepted pending the key check. Both are successes.
    console.log(`POST ${urls.length} URLs -> ${res.status} ${res.statusText}`);
    if (![200, 202].includes(res.status)) process.exitCode = 1;
  }
}
