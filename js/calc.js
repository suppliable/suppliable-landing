/* =======================================================================
   Suppliable calculators — shared utilities.
   - PRICE_CONFIG: single source of truth for unit prices. Edit here to
     update every calculator at once.
   - Calc.rupee(), Calc.round(): formatting helpers
   - Calc.whatsapp(payload): builds + opens a WhatsApp message with the
     calculator's BOM and links to the Suppliable WhatsApp number
   - Calc.openQuoteModal(payload): opens the lead-capture modal,
     submits the form via WhatsApp (we have no backend; matches the rest
     of the site)
   - Calc.PLAY_STORE_URL: Play Store link reused by every "Order on app"
     button across calculator pages
   ======================================================================= */
(function (global) {
  'use strict';

  /* --- Editable price config — all defaults in INR --- */
  const PRICE_CONFIG = {
    paint:        { perLitre: 250 },     // average across the catalogue
    aacBlock:     { perBlock: 65 },      // 6-inch typical
    aacAdhesive:  { perBag40kg: 360 },   // Ramco Block Fix
    cementBag:    { per50kgBag: 410 },   // PPC average
    sand:         { perCft: 70 },        // M-sand
    aggregate:    { perCft: 50 },        // 20mm jelly
    steel:        { perKg: 62 },         // TMT average
    drFixit: {
      newcoat:    { perLitre: 320, coverageSqftPerLitre: 30,  bucketLitres: 20, bucketPrice: 5800 },
      bathseal:   { perKg:    320, coverageSqftPerKg:    12,  packKg: 5,        packPrice: 1500 },
      pidifin2k:  { kitCoverageSqft: 100, kitKg: 15,           kitPrice: 1950 },
      raincoat:   { perLitre: 360, coverageSqftPerLitrePerCoat: 50, bucketLitres: 20, bucketPrice: 6800 },
      lwPlus:     { mlPerBag: 200, pricePerLitre: 165, packSizesLitres: [1, 5, 10, 20] }
    }
  };

  /* --- WhatsApp config (shared with rest of site) --- */
  const WA_NUMBER = '918778627926';
  const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.suppliable.customer';
  const BULK_QUOTE_HASH = '/#bulk';

  /* --- Formatting helpers --- */
  function rupee(n) {
    if (n == null || isNaN(n)) return '—';
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }
  function round(n, dp) {
    dp = dp == null ? 2 : dp;
    if (n == null || isNaN(n)) return 0;
    var m = Math.pow(10, dp);
    return Math.round(n * m) / m;
  }
  function ceil(n, dp) {
    dp = dp == null ? 0 : dp;
    var m = Math.pow(10, dp);
    return Math.ceil(n * m) / m;
  }

  /* --- Pack-size suggestion for paints / waterproofing buckets ---
       Returns the smallest combo of standard pack sizes that >= litres.
       Example: suggestPacks(7, [1,4,10,20]) -> "1 × 10L"
                suggestPacks(13, [1,4,10,20]) -> "1 × 10L + 1 × 4L"
  */
  function suggestPacks(litres, sizes) {
    sizes = (sizes || [1, 4, 10, 20]).slice().sort(function (a, b) { return b - a; });
    var remaining = Math.ceil(litres);
    var picks = {};
    for (var i = 0; i < sizes.length; i++) {
      var s = sizes[i];
      var qty = Math.floor(remaining / s);
      if (qty > 0) {
        picks[s] = qty;
        remaining -= qty * s;
      }
    }
    if (remaining > 0) {
      /* round the leftover up to the smallest size that covers it */
      for (var j = sizes.length - 1; j >= 0; j--) {
        if (sizes[j] >= remaining) {
          picks[sizes[j]] = (picks[sizes[j]] || 0) + 1;
          break;
        }
      }
    }
    return Object.keys(picks)
      .sort(function (a, b) { return b - a; })
      .map(function (s) { return picks[s] + ' × ' + s + 'L'; })
      .join(' + ');
  }

  /* --- WhatsApp message builder ---
       payload = {
         calculator: "Paint",
         inputs:  { 'Wall length': '12 ft', 'Coats': 2, ... },
         results: { 'Paint required': '6.4 L', 'Estimated cost': '₹1,600' },
         note?:   "Optional extra line"
       }
  */
  function buildMessage(payload) {
    var lines = [];
    lines.push('🧮 Estimate from suppliable.in/calculators');
    lines.push('');
    lines.push('Calculator: ' + payload.calculator);
    lines.push('─────────────────');
    if (payload.inputs) {
      lines.push('INPUTS');
      Object.keys(payload.inputs).forEach(function (k) {
        lines.push('• ' + k + ': ' + payload.inputs[k]);
      });
      lines.push('');
    }
    if (payload.results) {
      lines.push('ESTIMATE');
      Object.keys(payload.results).forEach(function (k) {
        lines.push('• ' + k + ': ' + payload.results[k]);
      });
      lines.push('');
    }
    if (payload.note) {
      lines.push(payload.note);
      lines.push('');
    }
    lines.push("I'd like to order these materials / get a quote.");
    return lines.join('\n');
  }

  function whatsapp(payload) {
    var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(buildMessage(payload));
    window.open(url, '_blank', 'noopener');
  }

  /* --- Lead-capture modal ---
       Builds the modal on first call (creates <div> appended to body),
       then re-uses it on subsequent calls. Form data goes to WhatsApp.
  */
  var modalEl = null;
  var modalPayload = null;

  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement('div');
    modalEl.className = 'calc-modal';
    modalEl.innerHTML = [
      '<div class="calc-modal-card">',
      '  <button class="calc-modal-close" aria-label="Close">✕</button>',
      '  <h2>Get a bulk quote</h2>',
      '  <p>Our team will respond with a custom quote within one business hour. Your calculation will be included automatically.</p>',
      '  <form id="calc-quote-form" novalidate>',
      '    <div class="calc-row">',
      '      <div class="calc-field"><label>Name *</label><input class="calc-input" name="name" required></div>',
      '      <div class="calc-field"><label>Phone *</label><input class="calc-input" type="tel" name="phone" inputmode="numeric" required></div>',
      '    </div>',
      '    <div class="calc-field"><label>Email <span class="hint">(optional)</span></label><input class="calc-input" type="email" name="email"></div>',
      '    <div class="calc-row">',
      '      <div class="calc-field"><label>Project location *</label><input class="calc-input" name="location" placeholder="e.g. Sholinganallur, Chennai" required></div>',
      '      <div class="calc-field"><label>Project type</label>',
      '        <select class="calc-select" name="ptype">',
      '          <option value="Residential">Residential</option>',
      '          <option value="Commercial">Commercial</option>',
      '          <option value="Industrial">Industrial</option>',
      '          <option value="Renovation">Renovation</option>',
      '          <option value="Other">Other</option>',
      '        </select>',
      '      </div>',
      '    </div>',
      '    <div class="calc-field"><label>Notes / additional quantity needed</label><textarea class="calc-input" name="notes" rows="2" placeholder="Anything else we should know?"></textarea></div>',
      '    <button type="submit" class="btn btn-orange btn-block btn-lg">Send quote request</button>',
      '  </form>',
      '</div>'
    ].join('');
    document.body.appendChild(modalEl);

    /* close handlers */
    modalEl.addEventListener('click', function (e) {
      if (e.target === modalEl || e.target.classList.contains('calc-modal-close')) {
        closeModal();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalEl.classList.contains('open')) closeModal();
    });

    /* submit -> compose WhatsApp message + open */
    modalEl.querySelector('#calc-quote-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {};
      new FormData(e.target).forEach(function (v, k) { data[k] = String(v).trim(); });
      if (!data.name || !data.phone || !data.location) return;

      var leadPayload = {
        calculator: 'QUOTE REQUEST — ' + (modalPayload ? modalPayload.calculator : 'Calculator'),
        inputs: {
          Name: data.name,
          Phone: data.phone,
          Email: data.email || '—',
          Location: data.location,
          'Project type': data.ptype,
          Notes: data.notes || '—'
        },
        results: modalPayload ? modalPayload.results : null,
        note: 'Original inputs:\n' + (modalPayload && modalPayload.inputs
          ? Object.keys(modalPayload.inputs).map(function (k) { return '• ' + k + ': ' + modalPayload.inputs[k]; }).join('\n')
          : '(none)')
      };
      whatsapp(leadPayload);
      closeModal();
    });

    return modalEl;
  }

  function openQuoteModal(payload) {
    ensureModal();
    modalPayload = payload;
    modalEl.classList.add('open');
    /* focus first input for accessibility */
    setTimeout(function () {
      var first = modalEl.querySelector('input[name="name"]');
      if (first) first.focus();
    }, 50);
  }
  function closeModal() {
    if (modalEl) modalEl.classList.remove('open');
  }

  /* --- Reusable: validate that a numeric input is positive --- */
  function num(value, fallback) {
    var n = parseFloat(value);
    if (isNaN(n) || n < 0) return fallback == null ? 0 : fallback;
    return n;
  }

  /* --- Public API --- */
  global.Calc = {
    PRICES: PRICE_CONFIG,
    PLAY_STORE_URL: PLAY_STORE_URL,
    BULK_QUOTE_HASH: BULK_QUOTE_HASH,
    rupee: rupee,
    round: round,
    ceil: ceil,
    num: num,
    suggestPacks: suggestPacks,
    whatsapp: whatsapp,
    openQuoteModal: openQuoteModal,
    closeQuoteModal: closeModal
  };
})(window);
