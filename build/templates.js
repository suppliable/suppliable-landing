/* =======================================================================
   HTML templates for statically generated category + product pages.
   Each template returns a complete HTML document string.
   ======================================================================= */

const SITE = 'https://suppliable.in';
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
        <a href="/materialcalculator/">Material Calculator</a>
        <a href="/#brands">Brands</a>
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
        <a href="/#brands">Brands</a>
        <a href="/#bulk">Bulk orders</a>
        <a href="https://play.google.com/store/apps/details?id=com.suppliable.customer" target="_blank" rel="noopener">Download app</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="/contact/">Contact</a>
        <a href="/privacypolicy/">Privacy policy</a>
        <a href="/termsofservice/">Terms of service</a>
        <a href="/refundpolicy/">Refund policy</a>
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
.legal-hero h1 { font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 700; line-height: 1.15; margin-bottom: 8px; }
.legal-hero .sub { opacity: .82; font-size: 1rem; max-width: 720px; }
.back-link { display: inline-block; margin-bottom: 8px; color: #fff; opacity: .8; font-weight: 500; text-decoration: none; font-size: .9rem; }
.back-link:hover { opacity: 1; text-decoration: underline; }
${BREADCRUMB_CSS}

/* horizontal category tile rail (in hero, for category switching) */
.cat-chips {
  display: flex; gap: 10px; overflow-x: auto;
  padding: 20px 0 6px; margin: 0 -4px;
  scrollbar-width: none; -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}
.cat-chips::-webkit-scrollbar { display: none; }
.cat-chip {
  flex-shrink: 0; background: rgba(255,255,255,.08); color: #fff;
  border: 1px solid rgba(255,255,255,.14);
  padding: 10px 16px; border-radius: 10px;
  font-weight: 500; font-size: .9rem; text-decoration: none;
  transition: background .15s, border-color .15s, color .15s, transform .15s;
  white-space: nowrap;
  backdrop-filter: blur(8px);
  display: inline-flex; align-items: center; gap: 8px;
}
.cat-chip:hover { background: rgba(255,255,255,.14); border-color: rgba(255,255,255,.32); }
.cat-chip.active { background: #fff; color: var(--purple); border-color: #fff; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,.12); }

.legal-page { background: var(--gray-50, #FAFAFB); padding: 40px 0 80px; min-height: 60vh; }

/* WhatsApp button used on product detail */
.btn-wa { background: #25D366; color: #fff; box-shadow: 0 6px 20px rgba(37,211,102,.25); border: 1px solid transparent; }
.btn-wa:hover { background: #1eb854; transform: translateY(-1px); }

.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
@media (min-width: 700px) { .products-grid { gap: 20px; } }
.product-card { background: #fff; border: 1px solid var(--gray-200, #E7E5EE); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; transition: transform .15s, border-color .15s, box-shadow .15s; text-decoration: none; color: inherit; }
.product-card:hover { transform: translateY(-2px); border-color: var(--purple); box-shadow: 0 6px 18px rgba(20,18,43,.08); }
.product-img { aspect-ratio: 1 / 1; background: var(--gray-100, #F4F4F7); display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; }
.product-img img { width: 100%; height: 100%; object-fit: contain; padding: 12px; }
.product-img .emoji-fallback { font-size: 60px; }
.product-stock-pill { position: absolute; top: 10px; left: 10px; background: #fff; color: var(--red, #DC2626); font-size: .68rem; font-weight: 700; padding: 4px 9px; border-radius: 99px; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.product-stock-pill::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.product-stock-pill.in-stock { color: var(--green, #16A34A); }
.product-body { padding: 14px 14px 16px; display: flex; flex-direction: column; gap: 4px; flex: 1; }
.product-cat { font-size: .7rem; font-weight: 600; color: var(--gray-500, #757285); text-transform: uppercase; letter-spacing: .04em; }
.product-name { font-size: .94rem; font-weight: 600; line-height: 1.35; color: var(--ink); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.5em; }
.product-price { font-size: 1.05rem; font-weight: 700; color: var(--ink); margin-top: 6px; }
.product-price .unit { font-size: .78rem; color: var(--gray-500, #757285); font-weight: 500; }

.app-banner {
  background: var(--purple); color: #fff;
  border-radius: 16px; padding: 22px 26px; margin-bottom: 20px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
  box-shadow: 0 8px 24px rgba(75,34,214,.18);
  position: relative; overflow: hidden;
}
.app-banner::before { content: '📱'; position: absolute; right: -10px; top: 50%; transform: translateY(-50%) rotate(-12deg); font-size: 130px; opacity: .10; pointer-events: none; }
.app-banner-text { flex: 1; min-width: 220px; position: relative; z-index: 1; }
.app-banner-text .eyebrow { display: inline-flex; align-items: center; gap: 4px; background: rgba(255,255,255,.16); color: #fff; font-size: .7rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; padding: 4px 10px; border-radius: 99px; margin-bottom: 8px; backdrop-filter: blur(6px); }
.app-banner-text strong { font-size: 1.1rem; font-weight: 700; display: block; }
.app-banner-text p { opacity: .85; font-size: .9rem; margin-top: 4px; line-height: 1.5; }
.app-banner .btn { white-space: nowrap; position: relative; z-index: 1; }
`;

const PRODUCT_DETAIL_CSS = `
.pdetail { display: grid; grid-template-columns: 1fr; gap: 28px; max-width: 1000px; margin: 0 auto; }
@media (min-width: 760px) { .pdetail { grid-template-columns: 440px 1fr; gap: 40px; } }
.pdetail-img { background: #fff; border: 1px solid var(--gray-200, #E7E5EE); border-radius: 16px; aspect-ratio: 1/1; overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative; }
.pdetail-img img { width: 100%; height: 100%; object-fit: contain; padding: 24px; }
.pdetail-img .emoji-fallback { font-size: 100px; }
.pdetail-info { display: flex; flex-direction: column; gap: 12px; }
.pdetail-cat { font-size: .72rem; font-weight: 600; color: var(--gray-500, #757285); text-transform: uppercase; letter-spacing: .05em; }
.pdetail-cat a { color: inherit; text-decoration: none; }
.pdetail-cat a:hover { color: var(--purple); }
.pdetail-info h1 { font-size: clamp(1.4rem, 3vw, 1.9rem); font-weight: 700; line-height: 1.2; color: var(--ink); letter-spacing: -0.01em; }
.pdetail-brand { font-size: .92rem; color: var(--gray-500, #757285); }
.pdetail-price { font-size: 1.6rem; font-weight: 800; color: var(--ink); margin-top: 4px; letter-spacing: -0.01em; }
.pdetail-price .unit { font-size: .95rem; color: var(--gray-500, #757285); font-weight: 500; margin-left: 4px; }
.pdetail-stock { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 99px; font-size: .82rem; font-weight: 600; }
.pdetail-stock::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.pdetail-stock.in { background: var(--green-50, #ECFDF3); color: var(--green, #16A34A); }
.pdetail-stock.out { background: var(--red-50, #FEF2F2); color: var(--red, #DC2626); }
.pdetail-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1px; background: var(--gray-200, #E7E5EE); border-radius: 10px; overflow: hidden; border: 1px solid var(--gray-200, #E7E5EE); }
.pdetail-meta > div { background: #fff; padding: 12px 14px; }
.pdetail-meta .k { font-size: .7rem; font-weight: 600; color: var(--gray-500, #757285); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 2px; }
.pdetail-meta .v { font-weight: 600; color: var(--ink); font-size: .92rem; }
.pdetail-variants { margin-top: 4px; }
.pdetail-variants h3 { font-size: .95rem; font-weight: 600; margin-bottom: 8px; color: var(--ink); }
.pdetail-variants table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; border: 1px solid var(--gray-200, #E7E5EE); }
.pdetail-variants th, .pdetail-variants td { padding: 11px 14px; text-align: left; border-bottom: 1px solid var(--gray-100, #F4F4F7); font-size: .9rem; }
.pdetail-variants th { background: var(--gray-50, #FAFAFB); font-size: .72rem; text-transform: uppercase; letter-spacing: .05em; color: var(--gray-500, #757285); font-weight: 600; }
.pdetail-variants tr:last-child td { border-bottom: none; }
.pdetail-variants td.price { font-weight: 700; text-align: right; }
.pdetail-variants td.stk.oos { color: var(--red, #DC2626); }
.pdetail-variants td.stk.ok { color: var(--green, #16A34A); }
.related { margin-top: 56px; }
.related h2 { font-size: 1.2rem; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.01em; }
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
      <a href="https://play.google.com/store/apps/details?id=com.suppliable.customer" target="_blank" rel="noopener" class="btn btn-orange">Download app</a>
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
          <a href="https://play.google.com/store/apps/details?id=com.suppliable.customer" target="_blank" rel="noopener" class="btn btn-orange">Order on the app</a>
          <a href="${whatsappLink(`Hi Suppliable, I'd like to buy: ${product.name}\nFrom: ${url}`)}" target="_blank" rel="noopener" class="btn btn-wa">💬 Ask on WhatsApp</a>
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
// Per-category SEO overrides — uses exact-match query phrases from Search Console.
// Keys are the category slug.
const CATEGORY_SEO = {
  hardwares: {
    title: 'Hardware Shop in Chennai — 60-Min Delivery (Tools, Fasteners, Hand Tools) | Suppliable',
    description: 'Your hardware shop near Sholinganallur Chennai — tools, fasteners, hand tools, binding wire, screws, taps, drill bits delivered to site in 60 minutes. {n} products from trusted brands. Order on WhatsApp or the app.'
  },
  cements: {
    title: 'Cement Suppliers in Chennai — UltraTech, Ramco, Zuari PPC (Live Prices) | Suppliable',
    description: 'Cement near you in Chennai — UltraTech, Ramco, Zuari PPC 50 kg bags delivered in 60 minutes from Sholinganallur warehouse. {n} cement products with live dealer pricing. WhatsApp +91 87786 27926.'
  },
  electrical: {
    title: 'Electrical Shop in Chennai — Wires, Switches, MCB, Sockets | Suppliable',
    description: 'Electrical shop near you in Chennai — single-core wires, MCB, switches, sockets, casing, plug tops from Anchor, Polycab, Orbit, Merigold. {n} products, 60-minute site delivery.'
  },
  plumbing: {
    title: 'Plumbing Shop in Chennai — CPVC, UPVC, PVC, Fittings, Taps | Suppliable',
    description: 'Plumbing shop in Chennai — CPVC pipes, UPVC, PVC, taps, fittings, traps, ball valves from Finolex, Ashirvad, Prince. {n} plumbing products, 60-minute delivery.'
  },
  tiling: {
    title: 'Tile Adhesive & Grout Suppliers in Chennai — MYK Laticrete, Roff | Suppliable',
    description: 'Tile adhesive and grout suppliers in Chennai — MYK Laticrete Type-1/Type-3, epoxy grout, spacers, sponges. {n} tiling products, 60-minute delivery from Sholinganallur.'
  },
  painting: {
    title: 'Paint Shop in Chennai — Asian Paints, Birla Opus, Putty, Primers | Suppliable',
    description: 'Paint shop near you in Chennai — Asian Paints Tractor & Ace, Birla Opus, wall putty, primer, rollers and brushes. {n} paint products, 60-minute delivery.'
  },
  bathroom_fittings: {
    title: 'Bathroom Fittings in Chennai — Parryware, Cera, Jaguar | Suppliable',
    description: 'Bathroom fittings shop in Chennai — taps, mixers, showers, sanitaryware from Parryware, Cera, Jaguar. {n} products, 60-minute delivery from Sholinganallur.'
  },
  construction_chemicals: {
    title: 'Construction Chemicals in Chennai — Dr. Fixit, Fosroc, Sika | Suppliable',
    description: 'Construction chemicals supplier in Chennai — Dr. Fixit waterproofing, Fosroc, Sika, adhesives, sealants, integral additives. {n} products, 60-minute delivery.'
  },
  electrical_conduits: {
    title: 'Electrical Conduits in Chennai — PVC Conduit, Casing, Bends | Suppliable',
    description: 'Electrical conduits supplier in Chennai — PVC conduit pipe, casing-capping, bends, junction boxes. {n} products, 60-minute delivery from Sholinganallur.'
  },
  lighting_fans: {
    title: 'Lights & Fans Shop in Chennai — LED Battens, Bulkheads, Floodlights | Suppliable',
    description: 'Lights and fans shop near you in Chennai — LED batten tubes, bulkheads, floodlights, focus lights from Havells, Maze, Veto. {n} products, 60-minute delivery.'
  },
  paints: {
    title: 'Paint Shop in Chennai — Emulsion, Putty, Primer | Suppliable',
    description: 'Paint suppliers in Chennai — emulsion, putty, primer in 1L/4L/10L/20L packs. {n} products, 60-minute delivery from Sholinganallur warehouse.'
  }
};

export function categoryPage({ category, products, allCategories }) {
  const url = `${SITE}/products/${category.slug}/`;
  const seo = CATEGORY_SEO[category.slug];
  const title = seo
    ? seo.title
    : `${category.name} in Chennai — 60-Min Delivery | Suppliable`;
  const description = seo
    ? seo.description.replace('{n}', products.length)
    : `${category.name} in Chennai — ${products.length} products from trusted brands, delivered to your site in 60 minutes. Order on WhatsApp +91 87786 27926 or the Suppliable app.`;

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

  const chipsHTML = `
    <div class="cat-chips" aria-label="Browse categories">
      <a href="/products/" class="cat-chip">All</a>
      ${allCategories.map(c =>
        `<a href="/products/${c.slug}/" class="cat-chip${c.slug === category.slug ? ' active' : ''}">${c.e} ${escapeHTML(c.name)}</a>`
      ).join('')}
    </div>`;

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
    ${chipsHTML}
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
      <a href="https://play.google.com/store/apps/details?id=com.suppliable.customer" target="_blank" rel="noopener" class="btn btn-orange">Download app</a>
    </div>

    <div class="products-grid">
      ${products.map(p => productCard(p, category)).join('')}
    </div>

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

/* ============== PRODUCTS HUB PAGE ==============
   Shows EVERY product on one page with category chips that act as
   client-side filters. Each chip toggles visibility of cards via
   data-cat. URL gets ?category=<slug> for shareability. */
export function productsHubPage({ categories, totalProducts, productsByCategory }) {
  const url = `${SITE}/products/`;
  const title = `Products | Construction materials in Chennai | Suppliable`;
  const description = `Browse ${totalProducts}+ construction materials across ${categories.length} categories — cement, steel, paint, plumbing, electrical, tiling and more. Order online with 60-minute Chennai delivery via the Suppliable app.`;

  const breadcrumbs = [
    { name: 'Home', url: SITE + '/' },
    { name: 'Products', url }
  ];

  /* Flatten all products into a single ordered list, tagged with their category */
  const flatProducts = [];
  for (const cat of categories) {
    for (const p of (productsByCategory[cat.slug] || [])) {
      flatProducts.push({ p, cat });
    }
  }

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

  const chipsHTML = `
    <div class="cat-chips" id="catChips" role="tablist" aria-label="Filter by category">
      <button class="cat-chip active" data-filter="all" role="tab" aria-selected="true">All <span class="chip-count">${totalProducts}</span></button>
      ${categories.map(c =>
        `<button class="cat-chip" data-filter="${escapeHTML(c.slug)}" role="tab" aria-selected="false">${c.e} ${escapeHTML(c.name)} <span class="chip-count">${c.productCount}</span></button>`
      ).join('')}
    </div>`;

  /* Slightly different product card markup: each card carries data-cat so
     the filter JS can show/hide it. We re-use the same .product-card class. */
  const cardsHTML = flatProducts.map(({ p, cat }) => {
    const detailUrl = `/products/${cat.slug}/${p.slug}/`;
    const imgPart = p.imageUrl
      ? `<img src="${escapeHTML(p.imageUrl)}" alt="${escapeHTML(p.name)}" loading="lazy">`
      : `<span class="emoji-fallback">${p.e}</span>`;
    const stockPill = p.stock
      ? '<span class="product-stock-pill in-stock">In stock</span>'
      : '<span class="product-stock-pill">Out of stock</span>';
    const priceHTML = p.hasVariants && p.priceRange
      ? escapeHTML(p.priceRange)
      : `${rupee(p.price)}${p.unit ? ` <span class="unit">/ ${escapeHTML(p.unit)}</span>` : ''}`;
    return `<a href="${detailUrl}" class="product-card" data-cat="${escapeHTML(cat.slug)}">
      <div class="product-img">${imgPart}${stockPill}</div>
      <div class="product-body">
        <div class="product-cat">${escapeHTML(cat.name)}</div>
        <div class="product-name">${escapeHTML(p.name)}</div>
        <div class="product-price">${priceHTML}</div>
      </div>
    </a>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>${commonHead({ title, description, canonical: url })}
  <style>${PAGE_STYLES}
    /* hub-specific: filter chip styling (buttons not anchors) */
    #catChips .cat-chip { font-family: inherit; cursor: pointer; }
    #catChips .chip-count { font-size: .72rem; opacity: .65; margin-left: 4px; font-weight: 500; }
    #catChips .cat-chip.active .chip-count { opacity: .55; }
    .results-meta { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16px; gap: 16px; flex-wrap: wrap; }
    .results-meta .count { font-size: .9rem; color: var(--gray-500, #757285); font-weight: 500; }
    .results-meta .seo-link { font-size: .85rem; color: var(--purple); font-weight: 600; text-decoration: none; }
    .results-meta .seo-link:hover { text-decoration: underline; }
    .results-empty { text-align: center; padding: 60px 20px; color: var(--gray-500, #757285); }
    .results-empty .big-emoji { font-size: 48px; display: block; margin-bottom: 14px; }
  </style>
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
    ${chipsHTML}
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
      <a href="https://play.google.com/store/apps/details?id=com.suppliable.customer" target="_blank" rel="noopener" class="btn btn-orange">Download app</a>
    </div>

    <div class="results-meta">
      <span class="count" id="resultCount">Showing all ${totalProducts} products</span>
      <a href="#" class="seo-link" id="seoLink" hidden>View this category on its own page →</a>
    </div>

    <div class="products-grid" id="productsGrid">
      ${cardsHTML}
    </div>

    <div class="results-empty" id="resultsEmpty" hidden>
      <span class="big-emoji">🔍</span>
      <h2 style="font-size:1.1rem;font-weight:700;color:var(--ink);margin-bottom:6px;">No products in this filter</h2>
      <p>Try another category, or <a href="https://wa.me/918778627926?text=Hi%20Suppliable%2C" target="_blank" rel="noopener" style="color:var(--purple);text-decoration:underline;">message us on WhatsApp</a>.</p>
    </div>

  </div>
</section>
${footer()}

<script>
(function () {
  var chips = document.querySelectorAll('#catChips .cat-chip');
  var cards = document.querySelectorAll('#productsGrid .product-card');
  var countEl = document.getElementById('resultCount');
  var emptyEl = document.getElementById('resultsEmpty');
  var seoEl = document.getElementById('seoLink');
  var totalCount = ${totalProducts};

  /* Map slug -> display name for the count label */
  var catNames = ${JSON.stringify(Object.fromEntries(categories.map(c => [c.slug, c.name])))};

  function applyFilter(slug) {
    var visible = 0;
    cards.forEach(function (card) {
      var show = (slug === 'all' || card.dataset.cat === slug);
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    chips.forEach(function (chip) {
      var on = chip.dataset.filter === slug;
      chip.classList.toggle('active', on);
      chip.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    if (slug === 'all') {
      countEl.textContent = 'Showing all ' + totalCount + ' products';
      seoEl.hidden = true;
    } else {
      var name = catNames[slug] || slug;
      countEl.textContent = 'Showing ' + visible + ' ' + name + ' product' + (visible === 1 ? '' : 's');
      seoEl.hidden = false;
      seoEl.href = '/products/' + slug + '/';
      seoEl.textContent = 'View ' + name + ' on its own page →';
    }

    emptyEl.hidden = visible !== 0;

    /* Update URL without reloading */
    var url = new URL(window.location.href);
    if (slug === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', slug);
    history.replaceState({}, '', url.pathname + (url.search || '') + url.hash);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () { applyFilter(chip.dataset.filter); });
  });

  /* Read ?category= from URL on load */
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('category');
  if (initial && catNames[initial]) applyFilter(initial);
})();
</script>
</body>
</html>`;
}
