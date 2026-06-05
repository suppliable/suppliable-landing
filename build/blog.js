/* =======================================================================
   Blog generation: parses blog/posts/*.md → /blog/<slug>/index.html
   + /blog/index.html (list). Adds Article JSON-LD for each post.
   ======================================================================= */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

import { escapeHTML } from './templates.js';

/* Make ~ behave like a literal character. Marked's default GFM strikethrough
   triggers on single tildes too ("~text~"), which turns innocent text like
   "(~5%) vs (~10%)" into a strikethrough span. Override the `del` tokenizer
   to require the proper GFM double-tilde syntax ("~~text~~"). */
marked.use({
  tokenizer: {
    del(src) {
      const match = src.match(/^~~(?=\S)([\s\S]*?\S)~~/);
      if (match) {
        return {
          type: 'del',
          raw: match[0],
          text: match[1],
          tokens: this.lexer.inlineTokens(match[1])
        };
      }
      return false;
    }
  }
});

const SITE = 'https://www.suppliable.in';
const BIZ_NAME = 'Suppliable';
const BIZ_PHONE = '+91-87786-27926';
const BIZ_EMAIL = 'contact@suppliable.in';

/* --- frontmatter parser (no dependency) --- */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, content: raw };

  const data = {};
  m[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx < 1) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    /* strip surrounding quotes */
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    /* arrays like [a, b, c] */
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    data[key] = val;
  });
  return { data, content: m[2] };
}

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function formatDate(d) {
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function readingTime(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 220));
  return `${mins} min read`;
}

/* --- shared HTML chunks (header / footer kept in sync with templates.js) --- */
function commonHead({ title, description, canonical, ogImage, ogType = 'article' }) {
  return `
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHTML(title)}</title>
  <meta name="description" content="${escapeHTML(description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="${escapeHTML(canonical)}" />
  <meta property="og:site_name" content="${BIZ_NAME}" />
  <meta property="og:title" content="${escapeHTML(title)}" />
  <meta property="og:description" content="${escapeHTML(description)}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:url" content="${escapeHTML(canonical)}" />
  <meta property="og:image" content="${escapeHTML(ogImage || `${SITE}/assets/og-image.png`)}" />
  <meta property="og:locale" content="en_IN" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHTML(title)}" />
  <meta name="twitter:description" content="${escapeHTML(description)}" />
  <meta name="twitter:image" content="${escapeHTML(ogImage || `${SITE}/assets/og-image.png`)}" />
  <meta name="theme-color" content="#4B22D6" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16.png" />
  <link rel="apple-touch-icon" sizes="192x192" href="/assets/logo-192.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles.css" />`;
}

function header() {
  return `
  <header class="site-header" id="siteHeader">
    <div class="container header-inner">
      <a href="/" class="logo" aria-label="Suppliable home">Suppliable</a>
      <nav class="nav" id="primaryNav" aria-label="Primary">
        <a href="/#how">How it works</a>
        <a href="/products/">Products</a>
        <a href="/materialcalculator/">Material Calculator</a>
        <a href="/blog/">Blog</a>
        <a href="/#bulk">Bulk orders</a>
      </nav>
      <div class="header-actions">
        <a href="https://play.google.com/store/apps/details?id=com.suppliable.customer" target="_blank" rel="noopener" class="btn btn-orange btn-sm">Download app</a>
      </div>
    </div>
  </header>`;
}

function footer() {
  return `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-col">
        <a href="/" class="logo logo-light">Suppliable</a>
        <p>Construction materials, delivered to your site in 60 minutes.</p>
      </div>
      <div class="footer-col">
        <h4>Explore</h4>
        <a href="/#how">How it works</a>
        <a href="/products/">Products</a>
        <a href="/materialcalculator/">Material Calculator</a>
        <a href="/blog/">Blog</a>
        <a href="/#bulk">Bulk orders</a>
        <a href="https://play.google.com/store/apps/details?id=com.suppliable.customer" target="_blank" rel="noopener">Download app</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="/contact/">Contact</a>
        <a href="/privacypolicy/">Privacy policy</a>
      </div>
      <div class="footer-col">
        <h4>Reach us</h4>
        <address>98 Kalaignar Karunanidhi Salai,<br>Sholinganallur, Chennai,<br>Tamil Nadu — 600119</address>
        <a href="mailto:${BIZ_EMAIL}">${BIZ_EMAIL}</a>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© <span id="year">${new Date().getFullYear()}</span> Suppliable. All rights reserved.</span>
      <span>Made in Chennai 🧡</span>
    </div>
  </footer>`;
}

const BLOG_STYLES = `
.legal-hero { background: var(--purple); color: #fff; padding: 48px 0 32px; }
.legal-hero h1 { font-size: clamp(1.9rem, 4vw, 2.8rem); font-weight: 800; line-height: 1.15; margin-bottom: 10px; }
.legal-hero .meta { font-size: .92rem; opacity: .9; display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
.legal-hero .meta .dot { opacity: .5; }
.back-link { display: inline-block; margin-bottom: 8px; color: #fff; opacity: .85; font-weight: 600; text-decoration: none; font-size: .92rem; }
.back-link:hover { opacity: 1; text-decoration: underline; }

.legal-page { background: #fff; padding: 48px 0 80px; }

/* Blog index */
.post-list { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 4px; }
.post-card { background: #fff; border: 1.5px solid var(--line, #E7E5F1); border-radius: 14px; padding: 24px 26px; text-decoration: none; color: inherit; transition: transform .12s, border-color .12s, box-shadow .12s; display: block; }
.post-card:hover { transform: translateY(-2px); border-color: var(--purple); box-shadow: 0 8px 22px rgba(75,34,214,.08); }
.post-card h2 { font-size: 1.3rem; font-weight: 800; color: var(--ink); line-height: 1.25; margin-bottom: 6px; }
.post-card .desc { color: var(--muted, #6B6880); line-height: 1.55; margin-top: 6px; font-size: .95rem; }
.post-card .meta { font-size: .82rem; color: var(--muted, #6B6880); margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap; }
.post-card .meta .tag { background: var(--mist, #F4F3F9); color: var(--purple); padding: 2px 9px; border-radius: 99px; font-weight: 700; font-size: .72rem; }
.post-empty { text-align: center; padding: 60px 20px; color: var(--muted, #6B6880); }
.post-empty .big-emoji { font-size: 56px; display: block; margin-bottom: 14px; }

/* Single post */
.post-article { max-width: 740px; margin: 0 auto; }
.post-content { font-size: 1.04rem; line-height: 1.75; color: var(--ink); }
.post-content h2 { font-size: 1.55rem; font-weight: 800; margin: 36px 0 14px; color: var(--ink); padding-top: 8px; }
.post-content h3 { font-size: 1.2rem; font-weight: 700; margin: 26px 0 10px; }
.post-content p { margin-bottom: 16px; }
.post-content ul, .post-content ol { margin: 8px 0 18px 24px; }
.post-content li { margin-bottom: 6px; }
.post-content a { color: var(--purple); text-decoration: underline; }
.post-content blockquote { border-left: 4px solid var(--orange); padding: 8px 18px; margin: 22px 0; color: var(--muted, #6B6880); font-style: italic; background: var(--mist, #F4F3F9); border-radius: 0 6px 6px 0; }
.post-content code { background: var(--mist, #F4F3F9); padding: 2px 6px; border-radius: 4px; font-size: .9em; font-family: ui-monospace, monospace; }
.post-content pre { background: #14122B; color: #fff; padding: 14px 18px; border-radius: 8px; overflow-x: auto; }
.post-content pre code { background: transparent; color: inherit; padding: 0; }
.post-content img { max-width: 100%; height: auto; border-radius: 10px; margin: 18px 0; }
.post-content hr { border: 0; border-top: 1px solid var(--line, #E7E5F1); margin: 36px 0; }
.post-content table { width: 100%; border-collapse: collapse; margin: 18px 0; }
.post-content table th, .post-content table td { padding: 9px 12px; border-bottom: 1px solid var(--line, #E7E5F1); text-align: left; }
.post-content table th { background: var(--mist, #F4F3F9); font-weight: 800; }

.post-cta { margin: 48px 0 0; background: var(--purple); color: #fff; border: 2px solid var(--ink); border-radius: 14px; padding: 28px; box-shadow: 6px 6px 0 var(--ink); display: flex; gap: 18px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
.post-cta strong { font-size: 1.1rem; display: block; }
.post-cta p { opacity: .9; font-size: .9rem; margin-top: 4px; }
.post-cta .btn { white-space: nowrap; }

.related-posts { max-width: 760px; margin: 56px auto 0; }
.related-posts h2 { font-size: 1.2rem; font-weight: 800; margin-bottom: 16px; }
`;

/* --- per-post page --- */
export function blogPostPage({ post, related }) {
  const url = `${SITE}/blog/${post.slug}/`;
  const title = `${post.title} | Suppliable Blog`;
  const description = post.description || post.title;

  const articleJSON = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description,
    image: post.hero || `${SITE}/assets/og-image.png`,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: post.author || 'Suppliable' },
    publisher: {
      '@type': 'Organization',
      name: 'Suppliable',
      logo: { '@type': 'ImageObject', url: `${SITE}/assets/logo-512.png` }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }
  };

  const breadcrumbJSON = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE + '/blog/' },
      { '@type': 'ListItem', position: 3, name: post.title, item: url }
    ]
  };

  const tagsHTML = (post.tags && post.tags.length)
    ? post.tags.map(t => `<span class="tag">${escapeHTML(t)}</span>`).join(' ')
    : '';

  const relatedHTML = related && related.length ? `
    <section class="related-posts">
      <h2>More from the Suppliable blog</h2>
      ${related.slice(0, 3).map(p => `
        <a href="/blog/${p.slug}/" class="post-card" style="margin-bottom:10px;">
          <h2 style="font-size:1.1rem;">${escapeHTML(p.title)}</h2>
          ${p.description ? `<p class="desc">${escapeHTML(p.description)}</p>` : ''}
          <div class="meta"><span>${formatDate(p.date)}</span></div>
        </a>`).join('')}
    </section>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>${commonHead({ title, description, canonical: url, ogImage: post.hero })}
  <style>${BLOG_STYLES}</style>
  <script type="application/ld+json">${JSON.stringify(breadcrumbJSON)}</script>
  <script type="application/ld+json">${JSON.stringify(articleJSON)}</script>
</head>
<body>
${header()}

<section class="legal-hero">
  <div class="container">
    <a href="/blog/" class="back-link">← Back to blog</a>
    <h1>${escapeHTML(post.title)}</h1>
    <div class="meta">
      <span>${formatDate(post.date)}</span>
      <span class="dot">·</span>
      <span>${readingTime(post.markdownBody || '')}</span>
      ${post.author ? `<span class="dot">·</span><span>by ${escapeHTML(post.author)}</span>` : ''}
    </div>
  </div>
</section>

<section class="legal-page">
  <div class="container">
    <article class="post-article">
      <div class="post-content">
        ${post.htmlBody}
      </div>

      <div class="post-cta">
        <div>
          <strong>Need construction materials in Chennai?</strong>
          <p>Order on the Suppliable app and get delivery to your site in 60 minutes.</p>
        </div>
        <a href="https://play.google.com/store/apps/details?id=com.suppliable.customer" target="_blank" rel="noopener" class="btn btn-orange">Download app</a>
      </div>

      ${relatedHTML}
    </article>
  </div>
</section>

${footer()}
</body>
</html>`;
}

/* --- blog index page --- */
export function blogIndexPage({ posts }) {
  const url = `${SITE}/blog/`;
  const title = 'Blog | Suppliable';
  const description = 'Construction tips, material guides and industry updates from the Suppliable team in Chennai. Learn about cement curing, AAC blocks, waterproofing, plumbing, electrical and more.';

  const itemListJSON = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Suppliable Blog',
    url,
    description,
    blogPost: posts.map(p => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${SITE}/blog/${p.slug}/`,
      datePublished: p.date,
      description: p.description || p.title,
      author: { '@type': 'Organization', name: p.author || 'Suppliable' }
    }))
  };

  const breadcrumbJSON = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: url }
    ]
  };

  const listHTML = posts.length
    ? posts.map(p => `
        <a href="/blog/${p.slug}/" class="post-card">
          <h2>${escapeHTML(p.title)}</h2>
          ${p.description ? `<p class="desc">${escapeHTML(p.description)}</p>` : ''}
          <div class="meta">
            <span>${formatDate(p.date)}</span>
            ${p.author ? `<span>· by ${escapeHTML(p.author)}</span>` : ''}
            ${(p.tags || []).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join(' ')}
          </div>
        </a>`).join('')
    : `<div class="post-empty">
        <span class="big-emoji">✍️</span>
        <h2 style="font-size:1.2rem;font-weight:800;color:var(--ink);margin-bottom:8px;">No posts yet</h2>
        <p>Check back soon for construction tips and industry updates.</p>
      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>${commonHead({ title, description, canonical: url, ogType: 'website' })}
  <style>${BLOG_STYLES}</style>
  <script type="application/ld+json">${JSON.stringify(breadcrumbJSON)}</script>
  <script type="application/ld+json">${JSON.stringify(itemListJSON)}</script>
</head>
<body>
${header()}

<section class="legal-hero">
  <div class="container">
    <a href="/" class="back-link">← Back to home</a>
    <h1>Blog</h1>
    <p style="opacity:.9;max-width:680px;">Construction tips, material guides and industry updates from the Suppliable team in Chennai.</p>
  </div>
</section>

<section class="legal-page">
  <div class="container">
    <div class="post-list">
      ${listHTML}
    </div>
  </div>
</section>

${footer()}
</body>
</html>`;
}

/* --- main entry: process all posts in blog/posts/ --- */
export async function buildBlog(ROOT) {
  const postsDir = path.join(ROOT, 'blog', 'posts');
  let files = [];
  try {
    files = (await fs.readdir(postsDir)).filter(f => f.endsWith('.md'));
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
    console.log('  (no blog/posts/ directory — skipping blog build)');
    return { posts: [], count: 0 };
  }

  /* parse all posts */
  const posts = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(postsDir, file), 'utf8');
    const { data, content } = parseFrontmatter(raw);
    if (!data.title) {
      console.warn(`  ⚠ skipping ${file}: missing required 'title' in frontmatter`);
      continue;
    }
    if (data.draft === 'true' || data.draft === true) {
      console.log(`  · skipping draft: ${file}`);
      continue;
    }
    const slug = data.slug || slugify(data.title) || path.basename(file, '.md');
    posts.push({
      slug,
      title: data.title,
      description: data.description || '',
      date: data.date || new Date().toISOString().slice(0, 10),
      author: data.author || 'Suppliable',
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
      hero: data.hero || null,
      markdownBody: content,
      htmlBody: marked.parse(content)
    });
  }

  /* sort newest first */
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  /* write individual post pages */
  for (const p of posts) {
    const related = posts.filter(o => o.slug !== p.slug);
    const html = blogPostPage({ post: p, related });
    const dest = path.join(ROOT, 'blog', p.slug, 'index.html');
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, html, 'utf8');
  }

  /* write blog index */
  const indexHTML = blogIndexPage({ posts });
  await fs.writeFile(path.join(ROOT, 'blog', 'index.html'), indexHTML, 'utf8');

  return { posts, count: posts.length };
}
