/* =======================================================================
   HTML templates for statically generated category + product pages.
   Each template returns a complete HTML document string.
   ======================================================================= */

const SITE = 'https://www.suppliable.in';
const BIZ_NAME = 'Suppliable';
const BIZ_PHONE = '+91-87786-27926';
const BIZ_PHONE_WA = '918778627926';
const BIZ_EMAIL = 'contact@suppliable.in';
const BIZ_ADDRESS = {
  streetAddress: '98 Kalaignar Karunanidhi Salai, Sholinganallur',
  addressLocality: 'Chennai',
  addressRegion: 'Tamil Nadu',
  postalCode: '600119',
  addressCountry: 'IN'
};

export function escapeHTML(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function rupee(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

export function whatsappLink(text) {
  return `https://wa.me/${BIZ_PHONE_WA}?text=${encodeURIComponent(text)}`;
}

/* common <head> partial used by all generated pages */
function commonHead({ title, description, canonical, ogImage }) {
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
  <meta property="og:type" content="website" />
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
        <a href="/#brands">Brands</a>
        <a href="/#bulk">Bulk orders</a>
      </nav>
      <div class="header-actions">
        <a href="/#download" class="btn btn-orange btn-sm">Download app</a>
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
        <a href="/#brands">Brands</a>
        <a href="/#bulk">Bulk orders</a>
        <a href="/#download">Download app</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="/contact/">Contact</a>
        <a href="/privacypolicy/">Privacy policy</a>
      </div>
      <div class="footer-col">
        <h4>Reach us</h4>
        <address>${BIZ_ADDRESS.streetAddress},<br>${BIZ_ADDRESS.addressLocality},<br>${BIZ_ADDRESS.addressRegion} — ${BIZ_ADDRESS.postalCode}</address>
        <a href="mailto:${BIZ_EMAIL}">${BIZ_EMAIL}</a>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© <span id="year">${new Date().getFullYear()}</span> Suppliable. All rights reserved.</span>
      <span>Made in Chennai 🧡</span>
    </div>
  </footer>`;
}

function breadcrumbJSONLD(items) {
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url
    }))
  })}</script>`;
}

function breadcrumbHTML(items) {
  return `<nav class="breadcrumb" aria-label="Breadcrumb">
    ${items.map((it, i) =>
      i === items.length - 1
        ? `<span aria-current="page">${escapeHTML(it.name)}</span>`
        : `<a href="${escapeHTML(it.url.replace(SITE, ''))}">${escapeHTML(it.name)}</a> <span class="sep">›</span>`
    ).join(' ')}
  </nav>`;
}

const BREADCRUMB_CSS = `
.breadcrumb {
  padding: 14px 0 6px;
  font-size: .85rem;
  color: rgba(255,255,255,.85);
}
.breadcrumb a { color: #fff; opacity: .85; text-decoration: none; }
.breadcrumb a:hover { text-decoration: underline; opacity: 1; }
.breadcrumb .sep { opacity: .5; margin: 0 4px; }
.breadcrumb [aria-current] { color: #fff; font-weight: 700; }
`;

/* common product/category styles shared between templates */
const PAGE_STYLES = `
.legal-hero { background: var(--purple); color: #fff; padding: 40px 0 32px; }
.legal-hero h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 800; line-height: 1.15; margin-bottom: 8px; }
.legal-hero .sub { opacity: .9; font-size: 1rem; max-width: 720px; }
.back-link { display: inline-block; margin-bottom: 8px; color: #fff; opacity: .85; font-weight: 600; text-decoration: none; font-size: .92rem; }
.back-link:hover { opacity: 1; text-decoration: underline; }
${BREADCRUMB_CSS}
.legal-page { background: var(--mist, #F4F3F9); padding: 40px 0 80px; min-height: 60vh; }

.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
@media (min-width: 700px) { .products-grid { gap: 20px; } }
.product-card { background: #fff; border: 1.5px solid var(--line, #E7E5F1); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; transition: transform .15s, border-color .15s, box-shadow .15s; text-decoration: none; color: inherit; }
.product-card:hover { transform: translateY(-2px); border-color: var(--purple); box-shadow: 0 8px 22px rgba(75,34,214,.10); }
.product-img { aspect-ratio: 1 / 1; background: #F4F3F9; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; }
.product-img img { width: 100%; height: 100%; object-fit: cover; }
.product-img .emoji-fallback { font-size: 60px; }
.product-stock-pill { position: absolute; top: 8px; left: 8px; background: rgba(255,255,255,.95); color: #d33; font-size: .7rem; font-weight: 800; padding: 3px 8px; border-radius: 99px; text-transform: uppercase; letter-spacing: .02em; }
.product-stock-pill.in-stock { color: var(--green, #1B9E4B); }
.product-body { padding: 14px 14px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.product-cat { font-size: .7rem; font-weight: 800; color: var(--purple); text-transform: uppercase; letter-spacing: .04em; }
.product-name { font-size: .95rem; font-weight: 700; line-height: 1.3; color: var(--ink); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.product-price { font-size: 1.05rem; font-weight: 800; color: var(--ink); margin-top: 4px; }
.product-price .unit { font-size: .8rem; color: var(--muted, #6B6880); font-weight: 600; }

.app-banner { background: var(--purple); color: #fff; border: 2px solid var(--ink); border-radius: 14px; padding: 22px 26px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; box-shadow: 6px 6px 0 var(--ink); position: relative; overflow: hidden; }
.app-banner::before { content: '📱'; position: absolute; right: -10px; top: 50%; transform: translateY(-50%) rotate(-12deg); font-size: 130px; opacity: .12; pointer-events: none; }
.app-banner-text { flex: 1; min-width: 220px; position: relative; z-index: 1; }
.app-banner-text .eyebrow { display: inline-block; background: var(--orange); color: #fff; font-size: .7rem; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; padding: 4px 10px; border-radius: 99px; margin-bottom: 8px; }
.app-banner-text strong { font-size: 1.15rem; display: block; }
.app-banner-text p { opacity: .9; font-size: .9rem; margin-top: 4px; }
.app-banner .btn { white-space: nowrap; position: relative; z-index: 1; }
`;

const CATEGORY_LIST_CSS = `
.cat-list-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.cat-link-card { background: #fff; border: 1.5px solid var(--line, #E7E5F1); border-radius: 12px; padding: 18px 16px; text-decoration: none; color: var(--ink); display: flex; align-items: center; gap: 12px; transition: border-color .15s, transform .15s; }
.cat-link-card:hover { border-color: var(--purple); transform: translateY(-1px); }
.cat-link-card .e { font-size: 26px; }
.cat-link-card .n { font-weight: 700; }
.cat-link-card .c { font-size: .8rem; color: var(--muted, #6B6880); margin-top: 2px; }
`;

const PRODUCT_DETAIL_CSS = `
.pdetail { display: grid; grid-template-columns: 1fr; gap: 28px; max-width: 1000px; margin: 0 auto; }
@media (min-width: 760px) { .pdetail { grid-template-columns: 440px 1fr; gap: 40px; } }
.pdetail-img { background: #fff; border: 1.5px solid var(--line, #E7E5F1); border-radius: 16px; aspect-ratio: 1/1; overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative; }
.pdetail-img img { width: 100%; height: 100%; object-fit: cover; }
.pdetail-img .emoji-fallback { font-size: 100px; }
.pdetail-info { display: flex; flex-direction: column; gap: 14px; }
.pdetail-cat { font-size: .75rem; font-weight: 800; color: var(--purple); text-transform: uppercase; letter-spacing: .04em; }
.pdetail-info h1 { font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 800; line-height: 1.2; color: var(--ink); }
.pdetail-brand { font-size: .95rem; color: var(--muted, #6B6880); }
.pdetail-price { font-size: 1.7rem; font-weight: 800; color: var(--ink); }
.pdetail-price .unit { font-size: 1rem; color: var(--muted, #6B6880); font-weight: 600; margin-left: 4px; }
.pdetail-stock { display: inline-block; padding: 5px 12px; border-radius: 99px; font-size: .85rem; font-weight: 700; }
.pdetail-stock.in { background: #E8F6EE; color: var(--green, #1B9E4B); }
.pdetail-stock.out { background: #FFE7E7; color: #d33; }
.pdetail-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; padding: 14px; background: #fff; border-radius: 10px; border: 1px solid var(--line, #E7E5F1); }
.pdetail-meta .k { font-size: .72rem; font-weight: 700; color: var(--muted, #6B6880); text-transform: uppercase; letter-spacing: .04em; }
.pdetail-meta .v { font-weight: 700; color: var(--ink); }
.pdetail-variants table { width: 100%; border-collapse: collapse; margin-top: 8px; background: #fff; border-radius: 10px; overflow: hidden; border: 1px solid var(--line, #E7E5F1); }
.pdetail-variants th, .pdetail-variants td { padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--line, #E7E5F1); font-size: .92rem; }
.pdetail-variants th { background: var(--mist, #F4F3F9); font-size: .75rem; text-transform: uppercase; letter-spacing: .04em; color: var(--muted, #6B6880); }
.pdetail-variants tr:last-child td { border-bottom: none; }
.pdetail-variants td.price { font-weight: 800; text-align: right; }
.pdetail-variants td.stk.oos { color: #d33; }
.pdetail-variants td.stk.ok { color: var(--green, #1B9E4B); }
.related { margin-top: 56px; }
.related h2 { font-size: 1.3rem; font-weight: 800; margin-bottom: 16px; }
`;

/* ============== PRODUCT DETAIL PAGE ============== */
export function productPage({ product, category, related }) {
  const url = `${SITE}/products/${category.slug}/${product.slug}/`;
  const title = `${product.name} | Buy in Chennai | Suppliable`;
  const description = [
    `Buy ${product.name}`,
    product.brand && product.brand !== product.name ? `(${product.brand})` : '',
    'with 60-minute delivery in Chennai.',
    product.hasVariants && product.priceRange
      ? `${product.priceRange}.`
      : `Price: ${rupee(product.price)}${product.unit ? ' / ' + product.unit : ''}.`,
    `In stock at Suppliable — Chennai's on-demand construction materials supplier.`
  ].filter(Boolean).join(' ');

  const breadcrumbs = [
    { name: 'Home', url: SITE + '/' },
    { name: 'Products', url: SITE + '/products/' },
    { name: category.name, url: `${SITE}/products/${category.slug}/` },
    { name: product.name, url }
  ];

  const offerStock = product.stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  let offerJSON;
  if (product.hasVariants && product.variants && product.variants.length) {
    offerJSON = {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: Math.min(...product.variants.map(v => v.price)),
      highPrice: Math.max(...product.variants.map(v => v.price)),
      offerCount: product.variants.length,
      availability: offerStock,
      seller: { '@type': 'Organization', name: BIZ_NAME }
    };
  } else {
    offerJSON = {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      availability: offerStock,
      seller: { '@type': 'Organization', name: BIZ_NAME }
    };
  }

  const productJSON = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': url + '#product',
    name: product.name,
    description: product.description || description,
    sku: product.id,
    image: product.imageUrl || `${SITE}/assets/og-image.png`,
    brand: { '@type': 'Brand', name: product.brand || product.name },
    category: category.name,
    offers: offerJSON
  };
  if (product.gst) productJSON.gtin = product.hsn || undefined;

  const variantsBlock = (product.hasVariants && product.variants && product.variants.length)
    ? `<div class="pdetail-variants">
        <h3 style="font-size:1rem;font-weight:800;margin-top:8px;">Available variants</h3>
        <table>
          <thead><tr><th>Variant</th><th>Stock</th><th style="text-align:right;">Price</th></tr></thead>
          <tbody>
            ${product.variants.map(v => `<tr>
              <td><strong>${escapeHTML(v.label)}</strong></td>
              <td class="stk ${v.stock ? 'ok' : 'oos'}">${v.stock ? 'In stock' : 'Out of stock'}</td>
              <td class="price">${rupee(v.price)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`
    : '';

  const metaTable = `
    <div class="pdetail-meta">
      ${product.brand && product.brand !== product.name ? `<div><div class="k">Brand</div><div class="v">${escapeHTML(product.brand)}</div></div>` : ''}
      <div><div class="k">Category</div><div class="v">${escapeHTML(category.name)}</div></div>
      ${product.unit ? `<div><div class="k">Unit</div><div class="v">${escapeHTML(product.unit)}</div></div>` : ''}
      ${product.gst ? `<div><div class="k">GST</div><div class="v">${product.gst}%</div></div>` : ''}
      ${product.hsn ? `<div><div class="k">HSN</div><div class="v">${escapeHTML(product.hsn)}</div></div>` : ''}
    </div>`;

  const relatedHTML = related && related.length ? `
    <section class="related">
      <h2>More from ${escapeHTML(category.name)}</h2>
      <div class="products-grid">
        ${related.slice(0, 8).map(p => productCard(p, category)).join('')}
      </div>
      <p style="margin-top:20px;"><a href="/products/${category.slug}/" class="btn btn-ghost-light">View all ${escapeHTML(category.name)} →</a></p>
    </section>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>${commonHead({ title, description, canonical: url, ogImage: product.imageUrl })}
  <style>${PAGE_STYLES}${PRODUCT_DETAIL_CSS}</style>
  ${breadcrumbJSONLD(breadcrumbs)}
  <script type="application/ld+json">${JSON.stringify(productJSON)}</script>
</head>
<body>
${header()}

<section class="legal-hero">
  <div class="container">
    ${breadcrumbHTML(breadcrumbs)}
  </div>
</section>

<section class="legal-page">
  <div class="container">

    <div class="app-banner">
      <div class="app-banner-text">
        <span class="eyebrow">⚡ 60-min delivery</span>
        <strong>Order ${escapeHTML(product.name)} on the Suppliable app</strong>
        <p>Get this product delivered to your construction site in Chennai within 60 minutes.</p>
      </div>
      <a href="/#download" class="btn btn-orange">Download app</a>
    </div>

    <div class="pdetail">
      <div class="pdetail-img">
        ${product.imageUrl
          ? `<img src="${escapeHTML(product.imageUrl)}" alt="${escapeHTML(product.name)}" loading="eager">`
          : `<span class="emoji-fallback">${product.e}</span>`}
        <span class="product-stock-pill ${product.stock ? 'in-stock' : ''}">${product.stock ? 'In stock' : 'Out of stock'}</span>
      </div>
      <div class="pdetail-info">
        <div class="pdetail-cat"><a href="/products/${category.slug}/" style="color:inherit;text-decoration:none;">${escapeHTML(category.name)}</a></div>
        <h1>${escapeHTML(product.name)}</h1>
        ${product.brand && product.brand !== product.name ? `<div class="pdetail-brand">by ${escapeHTML(product.brand)}</div>` : ''}
        <div class="pdetail-price">
          ${product.hasVariants && product.priceRange ? escapeHTML(product.priceRange) : rupee(product.price)}
          ${!product.hasVariants && product.unit ? `<span class="unit">/ ${escapeHTML(product.unit)}</span>` : ''}
        </div>
        <div><span class="pdetail-stock ${product.stock ? 'in' : 'out'}">${product.stock ? '✓ In stock — delivers in 60 min' : '✗ Out of stock'}</span></div>
        ${product.description ? `<p>${escapeHTML(product.description)}</p>` : ''}
        ${metaTable}
        ${variantsBlock}
        <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
          <a href="/#download" class="btn btn-orange">Order on the app</a>
          <a href="${whatsappLink(`Hi Suppliable, I'd like to buy: ${product.name}\nFrom: ${url}`)}" target="_blank" rel="noopener" class="btn btn-ghost-light">💬 Ask on WhatsApp</a>
        </div>
      </div>
    </div>

    ${relatedHTML}

  </div>
</section>
${footer()}
</body>
</html>`;
}

/* ============== CATEGORY LIST PAGE ============== */
export function categoryPage({ category, products, allCategories }) {
  const url = `${SITE}/products/${category.slug}/`;
  const title = `${category.name} | Buy online in Chennai | Suppliable`;
  const description = `Buy ${category.name.toLowerCase()} online in Chennai with 60-minute site delivery. Browse ${products.length} ${category.name.toLowerCase()} product${products.length === 1 ? '' : 's'} from trusted brands — order on the Suppliable app or get a bulk quote.`;

  const breadcrumbs = [
    { name: 'Home', url: SITE + '/' },
    { name: 'Products', url: SITE + '/products/' },
    { name: category.name, url }
  ];

  const itemListJSON = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: category.name,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/products/${category.slug}/${p.slug}/`,
      name: p.name
    }))
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>${commonHead({ title, description, canonical: url })}
  <style>${PAGE_STYLES}</style>
  ${breadcrumbJSONLD(breadcrumbs)}
  <script type="application/ld+json">${JSON.stringify(itemListJSON)}</script>
</head>
<body>
${header()}

<section class="legal-hero">
  <div class="container">
    ${breadcrumbHTML(breadcrumbs)}
    <h1>${escapeHTML(category.name)}</h1>
    <p class="sub">${products.length} ${category.name.toLowerCase()} product${products.length === 1 ? '' : 's'} — delivered to your Chennai site in 60 minutes.</p>
  </div>
</section>

<section class="legal-page">
  <div class="container">

    <div class="app-banner">
      <div class="app-banner-text">
        <span class="eyebrow">⚡ 60-min delivery</span>
        <strong>Download the app to order now</strong>
        <p>Browse the full catalogue, track your order live, and get materials delivered to your site in 60 minutes.</p>
      </div>
      <a href="/#download" class="btn btn-orange">Download app</a>
    </div>

    <div class="products-grid">
      ${products.map(p => productCard(p, category)).join('')}
    </div>

    <section style="margin-top:48px;">
      <h2 style="font-size:1.2rem;font-weight:800;margin-bottom:14px;">Browse other categories</h2>
      <div class="cat-list-grid" style="${CATEGORY_LIST_CSS.match(/\.cat-list-grid {([^}]*)}/)[1]}">
        ${allCategories.filter(c => c.slug !== category.slug).map(c => `
          <a href="/products/${c.slug}/" class="cat-link-card" style="background:#fff;border:1.5px solid #E7E5F1;border-radius:12px;padding:18px 16px;text-decoration:none;color:#14122B;display:flex;align-items:center;gap:12px;">
            <span class="e" style="font-size:26px;">${c.e}</span>
            <span>
              <span class="n" style="font-weight:700;display:block;">${escapeHTML(c.name)}</span>
              <span class="c" style="font-size:.8rem;color:#6B6880;">${c.productCount} product${c.productCount === 1 ? '' : 's'}</span>
            </span>
          </a>`).join('')}
      </div>
    </section>

  </div>
</section>
${footer()}
</body>
</html>`;
}

/* ============== PRODUCT CARD (used in lists) ============== */
function productCard(p, category) {
  const url = `/products/${category.slug}/${p.slug}/`;
  const imgPart = p.imageUrl
    ? `<img src="${escapeHTML(p.imageUrl)}" alt="${escapeHTML(p.name)}" loading="lazy">`
    : `<span class="emoji-fallback">${p.e}</span>`;
  const stockPill = p.stock
    ? '<span class="product-stock-pill in-stock">In stock</span>'
    : '<span class="product-stock-pill">Out of stock</span>';
  const priceHTML = p.hasVariants && p.priceRange
    ? escapeHTML(p.priceRange)
    : `${rupee(p.price)}${p.unit ? ` <span class="unit">/ ${escapeHTML(p.unit)}</span>` : ''}`;
  return `<a href="${url}" class="product-card">
    <div class="product-img">${imgPart}${stockPill}</div>
    <div class="product-body">
      <div class="product-cat">${escapeHTML(category.name)}</div>
      <div class="product-name">${escapeHTML(p.name)}</div>
      <div class="product-price">${priceHTML}</div>
    </div>
  </a>`;
}

/* ============== PRODUCTS HUB PAGE ============== */
export function productsHubPage({ categories, totalProducts }) {
  const url = `${SITE}/products/`;
  const title = `Products | Construction materials in Chennai | Suppliable`;
  const description = `Browse ${totalProducts}+ construction materials across ${categories.length} categories — cement, steel, paint, plumbing, electrical, tiling and more. Order online with 60-minute Chennai delivery via the Suppliable app.`;

  const breadcrumbs = [
    { name: 'Home', url: SITE + '/' },
    { name: 'Products', url }
  ];

  const collectionJSON = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url,
    hasPart: categories.map(c => ({
      '@type': 'ItemList',
      name: c.name,
      numberOfItems: c.productCount,
      url: `${SITE}/products/${c.slug}/`
    }))
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>${commonHead({ title, description, canonical: url })}
  <style>${PAGE_STYLES}</style>
  ${breadcrumbJSONLD(breadcrumbs)}
  <script type="application/ld+json">${JSON.stringify(collectionJSON)}</script>
</head>
<body>
${header()}

<section class="legal-hero">
  <div class="container">
    ${breadcrumbHTML(breadcrumbs)}
    <h1>All products</h1>
    <p class="sub">${totalProducts}+ construction materials across ${categories.length} categories — delivered to your Chennai site in 60 minutes.</p>
  </div>
</section>

<section class="legal-page">
  <div class="container">

    <div class="app-banner">
      <div class="app-banner-text">
        <span class="eyebrow">⚡ 60-min delivery</span>
        <strong>Download the app to order now</strong>
        <p>Browse the full catalogue, track your order live, and get materials delivered to your site in 60 minutes.</p>
      </div>
      <a href="/#download" class="btn btn-orange">Download app</a>
    </div>

    <h2 style="font-size:1.2rem;font-weight:800;margin-bottom:14px;">Browse by category</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
      ${categories.map(c => `
        <a href="/products/${c.slug}/" style="background:#fff;border:1.5px solid #E7E5F1;border-radius:12px;padding:18px 16px;text-decoration:none;color:#14122B;display:flex;align-items:center;gap:12px;transition:border-color .15s,transform .15s;">
          <span style="font-size:26px;">${c.e}</span>
          <span>
            <span style="font-weight:700;display:block;">${escapeHTML(c.name)}</span>
            <span style="font-size:.8rem;color:#6B6880;">${c.productCount} product${c.productCount === 1 ? '' : 's'}</span>
          </span>
        </a>`).join('')}
    </div>

  </div>
</section>
${footer()}
</body>
</html>`;
}
