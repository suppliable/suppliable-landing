#!/usr/bin/env node
/*
 * IndexNow submitter — pings Bing/Yandex/Seznam/Naver instantly when pages change.
 * Google does NOT support IndexNow yet; for Google, use Search Console manual submission
 * or the Indexing API (only allowed for JobPosting + BroadcastEvent schemas).
 *
 * Usage:
 *   node build/submit-indexnow.js                  # pings priority + new URLs
 *   node build/submit-indexnow.js --all            # pings every URL in sitemap.xml
 *
 * Setup (one-time):
 *   1. Generate a key:  node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
 *   2. Save it to .indexnow-key (gitignored) and to public/<KEY>.txt with the key as the only content
 *   3. Commit + push public/<KEY>.txt so it's reachable at https://suppliable.in/<KEY>.txt
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HOST = 'suppliable.in';
const KEY_FILE = path.join(__dirname, '..', '.indexnow-key');
const SITEMAP_FILE = path.join(__dirname, '..', 'sitemap.xml');

const PRIORITY_URLS = [
  `https://${HOST}/`,
  `https://${HOST}/materialcalculator/`,
  `https://${HOST}/materialcalculator/paint/`,
  `https://${HOST}/materialcalculator/aac-blocks/`,
  `https://${HOST}/materialcalculator/cement/`,
  `https://${HOST}/materialcalculator/steel/`,
  `https://${HOST}/materialcalculator/waterproofing/`,
  `https://${HOST}/materialcalculator/chennai/`,
  `https://${HOST}/materialcalculator/chennai/paint/`,
  `https://${HOST}/materialcalculator/chennai/aac-blocks/`,
  `https://${HOST}/materialcalculator/chennai/cement/`,
  `https://${HOST}/materialcalculator/chennai/steel/`,
  `https://${HOST}/materialcalculator/chennai/waterproofing/`,
  `https://${HOST}/blog/`,
  `https://${HOST}/blog/how-much-paint-for-a-2bhk-in-chennai-a-worked-example-with-live-calculator/`,
  `https://${HOST}/blog/how-many-cement-bags-for-a-1000-sqft-rcc-roof-slab-m20-mix-worked-out/`,
  `https://${HOST}/blog/how-many-aac-blocks-for-a-1500-sqft-chennai-bungalow-worked-example/`,
  `https://${HOST}/blog/tmt-steel-weight-chart-with-worked-examples/`,
  `https://${HOST}/blog/how-much-dr-fixit-newcoat-for-a-1000-sqft-terrace-chennai-monsoon-prep/`
];

function loadKey() {
  // Primary source: local .indexnow-key (gitignored, for dev machines).
  if (fs.existsSync(KEY_FILE)) {
    return fs.readFileSync(KEY_FILE, 'utf8').trim();
  }
  // Fallback: any <hex>.txt at repo root whose contents equal its filename.
  // This is the public verification file — safe to use as the key in CI
  // (the key is public by design; the .txt file must be served at that URL).
  const repoRoot = path.join(__dirname, '..');
  for (const name of fs.readdirSync(repoRoot)) {
    if (!/^[0-9a-f]{8,128}\.txt$/i.test(name)) continue;
    const contents = fs.readFileSync(path.join(repoRoot, name), 'utf8').trim();
    const expected = name.replace(/\.txt$/, '');
    if (contents === expected) return contents;
  }
  console.error(`✗ No IndexNow key found.`);
  console.error(`  Local:  put the key in ${KEY_FILE}`);
  console.error(`  Repo:   put a <key>.txt file at repo root whose contents equal <key>`);
  console.error(`  Generate one:  openssl rand -hex 16 > .indexnow-key`);
  process.exit(1);
}

function parseSitemapUrls() {
  const xml = fs.readFileSync(SITEMAP_FILE, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
}

function postJSON(host, pathname, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      host, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let chunks = '';
      res.on('data', c => chunks += c);
      res.on('end', () => resolve({ status: res.statusCode, body: chunks }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function pingEndpoint(endpoint, payload) {
  try {
    const r = await postJSON(endpoint, '/indexnow', payload);
    console.log(`  ${endpoint}  →  HTTP ${r.status}${r.body ? '  ' + r.body.slice(0, 120) : ''}`);
  } catch (e) {
    console.log(`  ${endpoint}  →  ERROR ${e.message}`);
  }
}

async function main() {
  const key = loadKey();
  const all = process.argv.includes('--all');
  const urls = all ? parseSitemapUrls() : PRIORITY_URLS;

  console.log(`\nIndexNow submission`);
  console.log(`  Host:        ${HOST}`);
  console.log(`  Key suffix:  …${key.slice(-6)}`);
  console.log(`  URLs:        ${urls.length}${all ? ' (full sitemap)' : ' (priority list)'}`);

  const payload = {
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList: urls
  };

  console.log(`\nPinging:`);
  await pingEndpoint('api.indexnow.org', payload);
  await pingEndpoint('www.bing.com', payload);
  await pingEndpoint('yandex.com', payload);

  console.log(`\nDone. Bing/Yandex usually crawl within hours.`);
  console.log(`For Google: open Search Console → URL Inspection → paste a URL → Request Indexing.`);
}

main();
