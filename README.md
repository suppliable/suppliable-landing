# Suppliable — Landing Page

Marketing landing page for the Suppliable app launch. Single-page site, no build
step, no dependencies. Open `index.html` in a browser to preview.

## Goals it serves
- **Awareness** — bold, public-facing hero + brand strip
- **Trust** — genuine brands, 60-min delivery, transparent steps
- **App installs** — primary Download CTA + sticky header button
- **Bulk enquiries** — working enquiry form in the Bulk Orders section

## Files
| File | Purpose |
|------|---------|
| `index.html` | Landing page structure & content |
| `styles.css` | All landing-page styling |
| `script.js` | Mobile nav, scroll reveals, stat counters, form validation, demo control |
| `app-demo.html` | **Interactive app demo** — a working mini-version of the Suppliable app |
| `js/api.js` | API client for the catalogue backend (fetch + normalize) |
| `privacypolicy/`, `contact/` | Standalone pages (clean URLs) |
| `assets/` | Logo, og-image, favicons, product photos |

## Interactive app demo (`app-demo.html`)
A working prototype of the app — Home, Search, Cart and Track Order screens, all
clickable. **Open `app-demo.html` directly in a browser** to review the app on
its own; it's also embedded live inside the landing page's "How it works" section.

### Data source: live API
The demo fetches its catalogue from the backend at runtime via [`js/api.js`](js/api.js):

| Endpoint | What we use it for |
|---|---|
| `GET /home` | Categories + 5-item preview per category (loaded at startup) |
| `GET /products?category=<DisplayName>` | Full product list when a category is tapped |
| `GET /products/:id` | Single product (currently unused by the demo; available for future detail screen) |
| `GET /search?q=...` | (Available; demo currently filters client-side) |

**Base URL** is hardcoded in `js/api.js` (`BASE_URL` const). To switch backends,
change that and update `_normalizeProduct` / `_normalizeCategory` if the field
names differ.

**API contract — internal product shape** (what `SuppliableAPI._normalizeProduct`
produces, used by the demo UI):
```js
{ id, name, brand, cat, catKey, price, unit, stock, e (emoji),
  imageUrl, fallbackImage, variants?: [{id, label, price, stock}],
  hasVariants, gst, hsn, description }
```

**Fallback:** if the API is unreachable (or `js/api.js` doesn't load),
`FALLBACK_PRODUCTS` / `FALLBACK_CATEGORIES` in `app-demo.html` keep the demo
usable with a tiny offline catalogue. A toast tells the visitor.

**Loading state:** the home category grid shows "Loading catalogue…" while the
first `/home` request is in flight. Render free tier has 30–50s cold starts.

## Product images
Each product can show a real photo. Drop image files into `assets/products/`,
named by product id — e.g. `cem1.jpg`, `stl1.jpg`, `pnt1.jpg`.

- Recommended: square `.jpg`, ~600×600px.
- The full filename list is in `assets/products/_FILENAMES.txt` (63 products).
- **Images are optional** — any product with no image falls back to a clean icon
  tile, so the demo works fully right now. Add the top sellers first.

## Other images
The hero and "How it works" sections run the live interactive demo — **no
screenshot files are needed.** The only optional extra is `assets/og-image.png`
(1200×630) for social link previews.

## Before going live — update these placeholders
- **Google Play link** — `index.html`, the `.store-btn` `href="#"` → real Play Store URL
- **Email** — `hello@suppliable.in` in the footer → your real address
- **Company links** — About / Contact / Privacy / Terms `href="#"` in the footer
- **Bulk form submission** — `script.js` has a `TODO` where the form data is
  collected. POST it to your backend, Supabase, or an email service (e.g. Formspree).
  Right now it validates, logs to console, and shows a success message.

## Deploy
Static site — host anywhere:
- **Netlify / Vercel** — drag the folder in, done
- **GitHub Pages** — push and enable Pages
- **Any web host** — upload the folder

## Customisation quick-reference
Colours live as CSS variables at the top of `styles.css` (`:root`).
Categories and brands are plain HTML in `index.html` — edit the text directly.
