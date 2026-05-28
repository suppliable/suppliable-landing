#!/usr/bin/env node
/* =======================================================================
   Static page generator for Suppliable.
   - Fetches /home and /products from the construction-api backend
   - Writes /products/<category>/index.html for each category
   - Writes /products/<category>/<product>/index.html for each product
   - Writes /products/index.html (hub) + /sitemap.xml
   Designed to run in GitHub Actions (Node 18+ has built-in fetch).
   ======================================================================= */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  productPage, categoryPage, productsHubPage, escapeHTML, rupee
} from './templates.js';
import { buildBlog } from './blog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.suppliable.in';

const API_BASE = process.env.API_BASE || 'https://construction-api-gznk.onrender.com/api/v1';

/* --- API helpers (mirror js/api.js normalization, server-side) --- */

const CAT_EMOJI = {
  'bathroom fittings': '🚿',
  'construction chemicals': '🧪',
  'electrical': '💡',
  'electrical conduits': '🔌',
  'hardwares': '🔩', 'hardware': '🔩',
  'lighting & fans': '💡',
  'painting': '🎨', 'paints': '🎨',
  'plumbing': '🚰',
  'tiling': '🔳', 'tiles': '🔳',
  'cement': '🧱',
  'steel': '🏗️', 'tmt steel': '🏗️',
  'aac blocks': '🧊', 'blocks': '🧊',
  'aggregates': '⛏️', 'sand & aggregates': '⛏️',
  'waterproofing': '💧',
  'tools': '🛠️'
};
function emoji(name) { return CAT_EMOJI[String(name || '').toLowerCase()] || '📦'; }

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function normalizeCategory(c) {
  return {
    id: c.id,
    slug: c.id.replace(/_/g, '-'),
    name: c.name,
    e: emoji(c.name),
    productCount: c.productCount || 0
  };
}

function normalizeProduct(p) {
  let price, stock, variants, priceRange = null;
  if (p.hasVariants && Array.isArray(p.variants) && p.variants.length) {
    variants = p.variants.map(v => ({
      id: v.id,
      label: v.name,
      price: Number(v.price) || 0,
      stock: (Number(v.available_stock) || Number(v.stock) || 0) > 0
    }));
    price = Math.min(...variants.map(v => v.price));
    const max = Math.max(...variants.map(v => v.price));
    priceRange = price === max ? rupee(price) : `${rupee(price)} – ${rupee(max)}`;
    stock = variants.some(v => v.stock);
  } else {
    price = Number(p.price) || 0;
    stock = (Number(p.available_stock) || Number(p.stock) || 0) > 0;
    variants = null;
  }
  return {
    id: String(p.id),
    slug: slugify(p.name) || String(p.id),
    name: p.name,
    brand: p.brand || null,
    catName: p.category,
    price,
    priceRange,
    unit: p.unit || 'pc',
    stock,
    e: emoji(p.category),
    imageUrl: p.imageUrl || p.image || null,
    variants,
    hasVariants: !!variants,
    gst: p.gst_percentage,
    hsn: p.hsn,
    description: p.description || ''
  };
}

async function fetchJSON(path) {
  const url = API_BASE + path;
  process.stdout.write(`  → GET ${path} ... `);
  const t0 = Date.now();
  const r = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(60000)
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} from ${path}`);
  const json = await r.json();
  console.log(`${r.status} in ${Date.now() - t0}ms`);
  return json;
}

/* --- file helpers --- */

async function writeFile(relPath, content) {
  const abs = path.join(ROOT, relPath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, content, 'utf8');
}

/* delete the generated /products/ subfolders (categories) — index.html
   itself is regenerated each build so we don't need to preserve it. */
async function cleanGenerated() {
  const productsDir = path.join(ROOT, 'products');
  try {
    const entries = await fs.readdir(productsDir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) {
        await fs.rm(path.join(productsDir, e.name), { recursive: true, force: true });
        console.log(`  ✗ removed products/${e.name}/`);
      }
    }
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }

  /* also clean generated blog post folders (preserve blog/posts/ source) */
  const blogDir = path.join(ROOT, 'blog');
  try {
    const entries = await fs.readdir(blogDir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory() && e.name !== 'posts') {
        await fs.rm(path.join(blogDir, e.name), { recursive: true, force: true });
        console.log(`  ✗ removed blog/${e.name}/`);
      }
    }
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
}

/* --- sitemap --- */

function sitemapXML(urls) {
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || today}</lastmod>
    <changefreq>${u.changefreq || 'weekly'}</changefreq>
    <priority>${u.priority || '0.7'}</priority>
  </url>`).join('\n')}
</urlset>
`;
}

/* --- main --- */

async function main() {
  console.log(`\n🔨 Suppliable static page build`);
  console.log(`   API: ${API_BASE}`);
  console.log(`   Output: ${ROOT}\n`);

  console.log('1. Fetching API…');
  const [homeRaw, allRaw] = await Promise.all([
    fetchJSON('/home'),
    fetchJSON('/products')
  ]);

  const allCategories = (homeRaw.data?.categories || [])
    .map(normalizeCategory)
    .filter(c => c.productCount > 0 && c.id !== 'test_cat');

  const allProducts = (allRaw.data || [])
    .map(normalizeProduct)
    .filter(p => slugify(p.catName) !== 'test-cat');

  console.log(`   ✓ ${allCategories.length} categories, ${allProducts.length} products\n`);

  console.log('2. Cleaning old generated pages…');
  await cleanGenerated();

  /* Group products by category slug */
  const productsBySlug = {};
  for (const cat of allCategories) productsBySlug[cat.slug] = [];
  for (const p of allProducts) {
    const cat = allCategories.find(c => c.name === p.catName);
    if (!cat) continue;
    productsBySlug[cat.slug].push(p);
  }

  /* De-dup product slugs within the same category by appending a counter */
  for (const slug of Object.keys(productsBySlug)) {
    const seen = {};
    for (const p of productsBySlug[slug]) {
      let s = p.slug;
      let n = 1;
      while (seen[s]) { s = `${p.slug}-${++n}`; }
      seen[s] = true;
      p.slug = s;
    }
  }

  console.log(`\n3. Writing product detail pages…`);
  let productCount = 0;
  for (const cat of allCategories) {
    const products = productsBySlug[cat.slug] || [];
    for (const p of products) {
      const related = products.filter(o => o.id !== p.id);
      const html = productPage({ product: p, category: cat, related });
      await writeFile(`products/${cat.slug}/${p.slug}/index.html`, html);
      productCount++;
    }
  }
  console.log(`   ✓ ${productCount} product pages\n`);

  console.log(`4. Writing category pages…`);
  for (const cat of allCategories) {
    const products = productsBySlug[cat.slug] || [];
    const html = categoryPage({ category: cat, products, allCategories });
    await writeFile(`products/${cat.slug}/index.html`, html);
    console.log(`   ✓ /products/${cat.slug}/  (${products.length} products)`);
  }

  console.log(`\n5. Writing products hub…`);
  const totalProducts = Object.values(productsBySlug).reduce((n, arr) => n + arr.length, 0);
  await writeFile(
    'products/index.html',
    productsHubPage({ categories: allCategories, totalProducts, productsByCategory: productsBySlug })
  );
  console.log(`   ✓ /products/  (${totalProducts} products)`);

  console.log(`\n6. Building blog…`);
  const { posts, count: blogCount } = await buildBlog(ROOT);
  console.log(`   ✓ ${blogCount} blog post${blogCount === 1 ? '' : 's'}`);

  console.log(`\n7. Writing sitemap.xml…`);
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE}/`, priority: '1.0', changefreq: 'weekly', lastmod: today },
    { loc: `${SITE}/products/`, priority: '0.9', changefreq: 'daily', lastmod: today },
    { loc: `${SITE}/contact/`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${SITE}/privacypolicy/`, priority: '0.4', changefreq: 'yearly' }
  ];
  for (const cat of allCategories) {
    urls.push({
      loc: `${SITE}/products/${cat.slug}/`,
      priority: '0.8', changefreq: 'daily', lastmod: today
    });
    for (const p of productsBySlug[cat.slug] || []) {
      urls.push({
        loc: `${SITE}/products/${cat.slug}/${p.slug}/`,
        priority: '0.7', changefreq: 'weekly', lastmod: today
      });
    }
  }
  /* blog URLs */
  if (posts.length > 0) {
    urls.push({
      loc: `${SITE}/blog/`,
      priority: '0.8', changefreq: 'weekly', lastmod: today
    });
    for (const p of posts) {
      urls.push({
        loc: `${SITE}/blog/${p.slug}/`,
        priority: '0.7', changefreq: 'monthly',
        lastmod: (p.date || today).slice(0, 10)
      });
    }
  }
  await writeFile('sitemap.xml', sitemapXML(urls));
  console.log(`   ✓ sitemap.xml  (${urls.length} URLs)`);

  console.log(`\n✅ Build complete.`);
  console.log(`   Total pages generated: ${productCount + allCategories.length + 1 + blogCount + (blogCount ? 1 : 0)}`);
  console.log(`   Sitemap entries: ${urls.length}\n`);
}

main().catch(err => {
  console.error('\n❌ Build failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
