# How to write a blog post

This folder holds the source for every post on https://suppliable.in/blog/.
Each post is a single Markdown file. The build script reads them on every push
and generates the HTML pages automatically.

## Quick start

1. **Create a new file** in this folder. Naming convention:
   `YYYY-MM-DD-short-title.md`
   Example: `2026-06-15-monsoon-waterproofing-tips.md`

2. **Paste this template** and fill in the placeholders:

   ```markdown
   ---
   title: Your post title here
   date: 2026-06-15
   author: Suppliable team
   description: A 1-2 sentence summary that shows up in Google search results and on social-link previews.
   tags: [waterproofing, monsoon, construction-guide]
   ---

   Your opening paragraph here. Write like you'd explain it to a contractor over chai.

   ## Section heading

   Regular text. **Bold** and _italic_ work as expected. [Links](https://example.com) too.

   ### Sub-section

   - Bullet point one
   - Bullet point two

   | Column A | Column B |
   |---|---|
   | Row 1 | Value |

   > Quotes look like this — great for tips or call-outs.

   ![Optional image](/assets/products/cem1.jpg)

   Link to your products: [browse cement →](/products/) or to a specific product
   like [UltraTech PPC →](/products/cement/ultratech-ppc-cement-50kg/).
   ```

3. **Save, commit, push.** That's it. The GitHub Action runs the build script,
   generates `/blog/<your-slug>/index.html` plus updates `/blog/` and the
   `sitemap.xml`, then commits the result back to the repo. New post is live
   in ~2 minutes.

## Frontmatter reference

Everything between the two `---` lines at the top of the file:

| Field | Required? | What it does |
|---|---|---|
| `title` | **yes** | Post headline. Shows in `<title>` tag, hero, blog index |
| `date` | **yes** | Publish date `YYYY-MM-DD`. Used for sorting + structured data |
| `description` | recommended | 1-2 sentence summary. SEO meta description + social-link preview |
| `author` | optional | Defaults to "Suppliable" if omitted |
| `tags` | optional | List of category tags, shown as pills on the blog index |
| `hero` | optional | URL or path to a featured image (used as social-link preview image) |
| `slug` | optional | Custom URL slug. Defaults to a slug derived from the title |
| `draft` | optional | Set to `true` to keep a post out of the build until you're ready |

## Markdown tips

- **Internal links to products work great for SEO.** Inside a post, link to relevant categories and individual products:
  - `[All electrical →](/products/electrical/)`
  - `[Orbit conduit pipe →](/products/electrical-conduits/orbit-electrical-conduit-pipe-light/)`
- **Use H2 (`##`) for section headings** — H1 is reserved for the post title.
- **Keep paragraphs short.** 2-3 sentences. Mobile readers bounce on walls of text.
- **Add a TL;DR table at the top** for guide-style posts (see the AAC vs bricks post).
- **End with a soft CTA** — link to WhatsApp, an app download, or a related product page.

## Post ideas that rank well for Chennai construction

- "Best [material] brands in Chennai 2026"
- "How much [material] do I need for a 1500 sqft house?"
- "[Material A] vs [Material B] — which to use for [use case]"
- "Monsoon prep: 5 waterproofing products every Chennai builder needs"
- "Cement curing in 40°C summer — what actually works"
- "How to read a TMT steel grade chart"
- "Stocking your construction site: a checklist by phase"

Each of these is a long-tail search query — people typing it into Google. A
clear, helpful post on the topic ranks for the search and brings buyers to
your site.

## Preview locally before pushing

```bash
node build/generate.js          # regenerate everything
python3 -m http.server 8000      # serve
# then open http://localhost:8000/blog/
```

Or skip the local preview and just push to a draft branch first if you want a
real-environment test before publishing.
