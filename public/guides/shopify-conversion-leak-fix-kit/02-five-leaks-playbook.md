# Five Conversion Leaks — Shopify Fix Playbook

Each section maps to the audit checklist. Ship **one leak per session**; re-run the audit after each fix.

---

## Leak 1: Surprise shipping at checkout

**Symptom:** Strong add-to-cart, weak checkout completion. Abandonment spikes on shipping step.

### Fix steps

1. **Settings → Shipping and delivery** — Document your zones and rates. Simplify to 2–3 zones max if possible.
2. **Free-shipping threshold** — Calculate breakeven (AOV + margin). Set threshold 10–15% above current AOV to nudge basket size.
3. **Cart drawer** — Add text: *"Free shipping on orders over $XX"* and dynamic *"$Y away from free shipping"*.
4. **PDP** — Repeat shipping message under Add to Cart (see copy-paste blocks).
5. **Test** — Incognito mobile purchase through checkout. Confirm shipping appears before payment.

### Shopify apps (optional)

- **Free shipping bar** apps — use native theme section if available first.
- Avoid apps that inject popups on checkout (Shopify checkout is limited; cart is where you win).

### Success metric

Checkout reached → purchase rate up **0.3–0.8 pp** within 14 days.

---

## Leak 2: Mobile checkout friction

**Symptom:** High mobile traffic, lower mobile conversion vs desktop.

### Fix steps

1. **Settings → Payments** — Enable Shop Pay, Apple Pay, Google Pay, PayPal Express.
2. **Settings → Checkout** — Allow guest checkout. Disable "require account" unless LTV data proves it's worth it.
3. **Checkout branding** — Upload logo, match brand color (Settings → Checkout → Customize).
4. **Remove optional fields** — Phone only if carrier requires it. No marketing checkboxes pre-checked.
5. **Thumb test** — Complete purchase one-handed. Every failed tap = fix or remove field.

### Theme edits

- Increase Add to Cart button min-height to **48px**.
- Sticky ATC on mobile product templates.

### Success metric

Mobile checkout completion rate improves **5–15% relative** (e.g. 2.1% → 2.4%).

---

## Leak 3: Weak trust on the buy button

**Symptom:** Good time-on-page, low add-to-cart. Bounce from paid traffic.

### Fix steps

1. **Reviews** — Enable Shopify Product Reviews or Judge.me. Show **count + stars** above fold on mobile.
2. **Policy links** — Returns window (e.g. 30-day) in one line under CTA.
3. **Payment icons** — Small row under button (Visa, MC, PayPal, Shop Pay).
4. **Social proof** — One specific testimonial with name + outcome, not generic praise.
5. **Urgency (honest only)** — Low stock from inventory, or delivery cutoff for same-week ship.

### Avoid

- Fake countdown timers
- Stock counters that reset
- Generic "1000+ happy customers" with no proof

### Success metric

Add-to-cart rate up **0.5–1.5 pp** on top traffic source.

---

## Leak 4: Slow mobile product pages

**Symptom:** High bounce from ads, low scroll depth, PageSpeed mobile score under 50.

### Fix steps

1. **PageSpeed Insights** — Test top 3 URLs from Meta Ads Manager (landing page report).
2. **Images** — Convert hero to WebP, max 1200px wide, under 150KB.
3. **Apps audit** — Uninstall unused apps. Each app adds JS.
4. **Theme** — Disable unused sections on product template (related products, Instagram feed) until speed recovers.
5. **Defer** — Use theme setting for lazy-load images; avoid autoplay video above fold.

### Targets

- LCP under 2.5s on mobile
- TTI under 5s on 4G

### Success metric

Bounce rate down **5–10% relative** on paid landing URLs.

---

## Leak 5: Ad ↔ landing message mismatch

**Symptom:** Good CTR, terrible conversion. Comments say "not what I expected."

### Fix steps

1. **Screenshot your top ad** — Note headline, offer, price, hook.
2. **Open landing URL from ad** — First screen must repeat headline + offer within 3 seconds.
3. **Dedicated LP** — For Meta tests, use `/pages/conversion-test` with minimal header nav.
4. **One CTA** — Single Add to Cart or collection, not homepage with 12 paths.
5. **UTM discipline** — Same product in ad creative and landing hero image.

### For Shopify

- Duplicate product template or use **page builder** section with ad-matched hero.
- Hide main menu on paid LPs (theme-specific — often `page.conversion.json` template).

### Success metric

Landing page conversion rate (sessions → purchase) up **20–40% relative** vs sending to homepage.

---

## After fixes: what to watch in Shopify Analytics

| Metric | Where | Target direction |
|--------|-------|------------------|
| Online store conversion rate | Analytics → Overview | ↑ |
| Checkout conversion rate | Analytics → Behavior | ↑ |
| Cart abandonment | Reports or apps | ↓ |
| Mobile vs desktop CVR gap | Segments | Gap narrows |

Log weekly in `04-conversion-tracker.csv`.
