/* =======================================================================
   Suppliable API client
   -----------------------------------------------------------------------
   Thin fetch wrapper + response normalizer for the construction-api
   backend. Exposes a single global `SuppliableAPI` with promise-based
   methods. All responses are normalized to the internal product shape
   used by the demo app, so call sites stay simple.

   Endpoints used:
     GET /home                     -> categories + per-category preview
     GET /products                 -> all products (277 currently)
     GET /products?category=<name> -> products filtered by display name
     GET /products/:id             -> single product
     GET /search?q=<query>         -> search

   To swap to a different backend, change BASE_URL and the field names
   in normalizeCategory / normalizeProduct. Nothing else should need to
   change.
   ======================================================================= */
(function (global) {
  'use strict';

  var BASE_URL = 'https://construction-api-gznk.onrender.com/api/v1';
  var REQUEST_TIMEOUT_MS = 20000; /* Render free tier has 30-50s cold starts */

  /* --- low-level fetch with timeout & JSON parsing --- */
  function http(path, options) {
    var url = BASE_URL + path;
    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = null;
    var opts = Object.assign({ headers: { 'Accept': 'application/json' } }, options || {});
    if (controller) {
      opts.signal = controller.signal;
      timer = setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS);
    }
    return fetch(url, opts).then(function (r) {
      if (timer) clearTimeout(timer);
      if (!r.ok) throw new Error('HTTP ' + r.status + ' from ' + path);
      return r.json();
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }

  /* --- category name -> emoji fallback (for UI without imageUrl) --- */
  var CAT_EMOJI = {
    'bathroom fittings': '🚿',
    'construction chemicals': '🧪',
    'electrical': '💡',
    'electrical conduits': '🔌',
    'hardwares': '🔩',
    'hardware': '🔩',
    'lighting & fans': '💡',
    'painting': '🎨',
    'paints': '🎨',
    'plumbing': '🚰',
    'tiling': '🔳',
    'tiles': '🔳',
    'cement': '🧱',
    'steel': '🏗️',
    'tmt steel': '🏗️',
    'aac blocks': '🧊',
    'blocks': '🧊',
    'aggregates': '⛏️',
    'sand & aggregates': '⛏️',
    'waterproofing': '💧',
    'tools': '🛠️',
    'test cat': '🧪'
  };
  function categoryEmoji(name) {
    if (!name) return '📦';
    return CAT_EMOJI[String(name).toLowerCase()] || '📦';
  }

  function slug(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }

  /* --- normalizers: API shape -> demo internal shape ---
       Demo expects:
         CATEGORY: { key, name, e }
         PRODUCT:  { id, name, cat, catKey, price, unit, stock, e, imageUrl,
                     variants?: [{id, label, price, stock}], note? }
  */
  function normalizeCategory(c) {
    if (!c) return null;
    return {
      key: c.id,
      name: c.name,
      e: categoryEmoji(c.name),
      productCount: c.productCount || 0,
      imageUrl: c.imageUrl || null
    };
  }

  function normalizeProduct(p) {
    if (!p) return null;
    var price, stock, variants;
    if (p.hasVariants && Array.isArray(p.variants) && p.variants.length) {
      variants = p.variants.map(function (v) {
        return {
          id: v.id,
          label: v.name,
          price: Number(v.price) || 0,
          stock: (Number(v.available_stock) || Number(v.stock) || 0) > 0
        };
      });
      price = variants.reduce(function (m, v) { return Math.min(m, v.price); }, variants[0].price);
      stock = variants.some(function (v) { return v.stock; });
    } else {
      price = Number(p.price) || 0;
      stock = (Number(p.available_stock) || Number(p.stock) || 0) > 0;
      variants = null;
    }
    return {
      id: String(p.id),
      name: p.name,
      brand: p.brand || null,
      cat: p.category,                  /* display name (for chips/labels) */
      catKey: slug(p.category),          /* slug (for filtering) */
      price: price,
      unit: p.unit || 'pc',
      stock: stock,
      e: categoryEmoji(p.category),
      imageUrl: p.imageUrl || p.image || null,
      fallbackImage: p.fallbackImage || null,
      variants: variants,
      hasVariants: !!variants,
      gst: p.gst_percentage,
      hsn: p.hsn,
      description: p.description || ''
    };
  }

  /* --- public API ----------------------------------------------------- */
  var SuppliableAPI = {
    baseURL: BASE_URL,

    /* GET /home — fastest single call: categories + per-category preview */
    getHome: function () {
      return http('/home').then(function (r) {
        var d = (r && r.data) || {};
        var categories = (d.categories || []).map(normalizeCategory).filter(Boolean);
        var featured = (d.featured || []).map(normalizeProduct).filter(Boolean);
        var byCat = {};
        if (d.preview && typeof d.preview === 'object') {
          Object.keys(d.preview).forEach(function (catName) {
            byCat[slug(catName)] = (d.preview[catName] || []).map(normalizeProduct).filter(Boolean);
          });
        }
        return { categories: categories, featured: featured, productsByCategory: byCat };
      });
    },

    /* GET /products — all products. Use sparingly; ~250+ items. */
    getAllProducts: function () {
      return http('/products').then(function (r) {
        return (r.data || []).map(normalizeProduct).filter(Boolean);
      });
    },

    /* GET /products?category=<Display Name> — note: uses display name, not id */
    getProducts: function (categoryDisplayName) {
      var qs = categoryDisplayName ? '?category=' + encodeURIComponent(categoryDisplayName) : '';
      return http('/products' + qs).then(function (r) {
        return (r.data || []).map(normalizeProduct).filter(Boolean);
      });
    },

    /* GET /products/:id */
    getProduct: function (id) {
      return http('/products/' + encodeURIComponent(id)).then(function (r) {
        return r.data ? normalizeProduct(r.data) : null;
      });
    },

    /* GET /search?q=<query> — backend returns bare array, not {success, data} */
    search: function (query) {
      var q = (query || '').trim();
      if (!q) return Promise.resolve([]);
      return http('/search?q=' + encodeURIComponent(q)).then(function (r) {
        var arr = Array.isArray(r) ? r : (r && r.data) || [];
        return arr.map(normalizeProduct).filter(Boolean);
      });
    },

    /* Exposed for callers that build their own queries */
    _http: http,
    _normalizeProduct: normalizeProduct,
    _normalizeCategory: normalizeCategory
  };

  global.SuppliableAPI = SuppliableAPI;
})(typeof window !== 'undefined' ? window : this);
