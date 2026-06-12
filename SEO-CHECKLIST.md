# SEO push — manual actions

Code changes are deployed. The remaining work has to happen in browser dashboards (Google + Bing don't have CLI APIs for ranking work). Do these in order, ~30 min total.

---

## 1. Resubmit the sitemap (5 min)

After this push deploys to GitHub Pages, the sitemap will have 390 URLs including all 6 new Chennai pages and 5 new blog posts.

- Open **Google Search Console** → `suppliable.in` property → Sitemaps
- The existing entry `sitemap.xml` should auto-recrawl, but force it: click the row → **Resubmit**
- Open **Bing Webmaster Tools** → Sitemaps → resubmit `https://suppliable.in/sitemap.xml`

---

## 2. Request indexing for top calculator pages (10 min)

For each URL below, in Google Search Console:
- Paste the URL into the top search bar (URL Inspection)
- Click **Request Indexing** (Google will crawl in ~24-48 hours)

Submit these 13 URLs:

```
https://suppliable.in/materialcalculator/
https://suppliable.in/materialcalculator/paint/
https://suppliable.in/materialcalculator/aac-blocks/
https://suppliable.in/materialcalculator/cement/
https://suppliable.in/materialcalculator/steel/
https://suppliable.in/materialcalculator/waterproofing/
https://suppliable.in/materialcalculator/chennai/
https://suppliable.in/materialcalculator/chennai/paint/
https://suppliable.in/materialcalculator/chennai/aac-blocks/
https://suppliable.in/materialcalculator/chennai/cement/
https://suppliable.in/materialcalculator/chennai/steel/
https://suppliable.in/materialcalculator/chennai/waterproofing/
https://suppliable.in/blog/
```

Search Console has a quota of ~10-12 manual submissions per day. Spread across two days if needed.

---

## 3. Set up IndexNow (Bing + Yandex, one-time) (5 min)

Bing/Yandex/Seznam support the IndexNow protocol — instant indexing.

```bash
# Generate a key once
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))" > .indexnow-key
KEY=$(cat .indexnow-key)

# Make it discoverable at https://suppliable.in/<KEY>.txt
echo $KEY > $KEY.txt
git add $KEY.txt
git commit -m "Add IndexNow verification file"
git push
```

After the push deploys, run the ping:

```bash
node build/submit-indexnow.js          # just the priority list
node build/submit-indexnow.js --all    # everything in sitemap (use on big content drops)
```

Re-run after every content push.

---

## 4. Google Business Profile (15 min, one-time)

Critical for "near me" and Chennai-local queries — this is what makes Suppliable show up in the map pack.

- Go to https://business.google.com → Add your business
- Name: **Suppliable**
- Category: **Construction material wholesaler**, secondary: **Building materials store**
- Address: 98 Kalaignar Karunanidhi Salai, Sholinganallur, Chennai 600119
- Service area: Add OMR, ECR, Velachery, Adyar, Pallavaram, Tambaram, Anna Nagar, T. Nagar
- Phone: +91 87786 27926
- Website: https://suppliable.in
- Hours: Mon-Sat 9 AM – 7 PM IST
- Upload photos: warehouse, delivery truck, products
- Add the calculator URL in your description: *"Free material calculators at suppliable.in/materialcalculator/"*
- Verify via postcard or phone (takes 5-7 days)

Once verified, post weekly Updates referencing the calculators — these show in your map pack listing.

---

## 5. Backlinks for AI/SEO (ongoing)

The two highest-leverage things to do over the next month:

1. **List Suppliable on construction directories**:
   - JustDial (Chennai)
   - Sulekha
   - IndiaMART
   - TradeIndia
   - Architect-focused: Indiantrade.in, Constro.in
   - Each gives you a backlink + appears in AI training data over time

2. **Get a press mention or guest post**:
   - The Hindu's "Property Plus" supplement covers construction tech
   - YourStory has a startup directory + can do a profile
   - Inc42 covers India SaaS / marketplaces
   - One quality backlink from a domain like these moves the needle 10× more than 20 directory listings

---

## 6. Track progress

In Search Console → Performance, filter for:
- Query: `material calculator`
- Query: `cement calculator chennai`
- Query: `paint calculator chennai`
- Query: `tmt calculator chennai`

Today's baseline impressions are ~zero. Watch them climb over 6-8 weeks. If a query starts getting impressions but no clicks, the page title needs sharpening — that's your signal.
