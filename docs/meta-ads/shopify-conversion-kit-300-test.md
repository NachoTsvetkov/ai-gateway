# Meta Ads — $300 Smoke Test Playbook

**Product:** Shopify Paid-Traffic Leak Scorecard  
**Price:** $37 USD  
**Landing page:** `https://[YOUR-DOMAIN]/shopify-conversion-kit`  
**Checkout:** `/shopify-conversion-kit/checkout` (PayPal)  
**Library:** `/shopify-conversion-kit/library` (gated — linked from success page)

---

## Economics (kill rules)

| Metric | Target | Kill rule |
|--------|--------|-----------|
| Daily budget | $15–20/day | Stop at **$150 spend with 0 purchases** |
| Max test budget | **$300 total** | Hard stop regardless |
| Target CPA | $15–35 | Scale only if CPA ≤ $35 after 3+ purchases |
| Break-even ROAS | 1.0 at $37 | Need ~8–9 purchases on $300 to break even |
| Margin | ~90% digital | Profitable above 1 purchase if CPA < $37 |

**Decision tree after $150:**
- 0 purchases → kill ad set, revise hook or LP headline, do NOT scale
- 1–2 purchases → iterate creative (new Reels angle), spend remaining $150
- 3+ purchases at CPA ≤ $35 → finish $300 test, prepare $500 scale test

---

## Campaign structure (keep it simple)

**Objective:** Sales (Purchase optimization)  
**Pixel event:** Purchase (already wired on PayPal capture)

```
Campaign: KIT-SMOKE-JUL26
└── Ad set: US + CA + UK + AU — Broad 25–55 — Shopify interests
    ├── Ad 1: Reel — "5 leaks" hook
    ├── Ad 2: Reel — screen record audit
    └── Ad 3: Static — checklist graphic
```

**Ad set settings:**
- Budget: $20/day (CBO off, ad set budget)
- Optimization: Purchase
- Attribution: 7-day click (default)
- Placements: Advantage+ (or manual: Feed + Reels + Stories)
- Interests (optional narrow test): Shopify, E-commerce, Dropshipping, Online store

**Do NOT:**
- Send traffic to homepage
- Run traffic campaigns "to warm up pixel"
- Test more than 3 creatives in first $150

---

## Reels script 1 — "5 leaks" (45 sec)

**Hook (0–3s):** Text on screen: *"Paying for traffic that doesn't buy?"*  
**Body (3–30s):** Face to camera or voiceover over Shopify admin screenshot:

> If you're running Meta ads to your Shopify store and checkout still sucks, you're not crazy — you're leaking in the same five places. Surprise shipping. No Shop Pay on mobile. Zero trust under the buy button. Slow product pages. And your ad promise doesn't match your landing page.

**Demo (30–40s):** Quick phone screen record — scroll PDP → cart → checkout, circle problem areas.

**CTA (40–45s):**  
> I packaged a 15-minute audit plus fix playbook — $37, instant download. Link below.

**Caption:** Use Block 8 from `03-copy-paste-blocks.md`  
**CTA button:** Shop Now → LP URL

---

## Reels script 2 — Live audit (60 sec)

**Hook:** *"15-minute Shopify checkout audit — score your store with me"*

Walk through 3 audit items from `01-15-minute-audit.md`:
1. Shop Pay visible? (score 0–2)
2. Shipping before payment? (score 0–2)
3. Reviews near Add to Cart? (score 0–2)

**Punchline:** *"If you scored under 4 out of 6, you're leaving money on the table. Full checklist + fixes — $37 kit, link in bio."*

**Format:** Screen recording + PiP face optional. No fancy editing needed.

---

## Reels script 3 — Story-style static carousel (3 cards)

**Card 1:** "Your Meta ads aren't the problem."  
**Card 2:** "Your mobile checkout is." + bullet list of 5 leaks  
**Card 3:** "15-min audit + fixes · $37 · [domain]/shopify-conversion-kit"

Export as 1080×1920 slideshow or simple Canva video with 3s per card.

---

## LP ↔ ad alignment checklist

Before launching, verify:

- [ ] Ad headline matches LP hero: *"Why am I paying for traffic that doesn't buy?"*
- [ ] Price in ad = $37 on LP
- [ ] Pixel ViewContent fires on LP load (Events Manager → Test events)
- [ ] InitiateCheckout fires on CTA click
- [ ] Purchase fires on sandbox PayPal test purchase
- [ ] Success page shows download links

---

## Week 1 schedule

| Day | Action | Spend cap |
|-----|--------|-----------|
| Mon | Publish LP, test pixel, upload Reel 1 | $0 |
| Tue | Launch ad set, Reel 1 only | $20 |
| Wed | Check CTR + LP view rate; add Reel 2 if CTR > 1% | $20 |
| Thu | Review CPA; kill if $100 spent / 0 purchases | $20 |
| Fri | Add Reel 3 or swap hook on worst performer | $20 |
| Sat–Sun | Monitor; no changes unless CPA > $50 | $40 |

**Total:** ~$300

---

## Metrics to log daily

| Date | Spend | LP views | InitiateCheckout | Purchases | CPA | Notes |
|------|-------|----------|------------------|-----------|-----|-------|
| | | | | | | |

Export from Meta Ads Manager + Events Manager.

---

## If the test fails ($300, < 3 purchases)

1. **Hook problem** — Try pain angle: *"I spent $2k on ads and made 4 sales"* (story Reel)
2. **Audience problem** — Narrow to "Shopify" + "Store owner" interests only
3. **Price problem** — Last resort: $27 test (change `oneTimeEur` to 25 → ~$28 USD)
4. **Offer problem** — Add 10-min Loom video walkthrough as bonus (no price change)

Do **not** scale failed creative. Kill and iterate.

---

## If the test wins (CPA ≤ $35, 3+ purchases)

1. Duplicate ad set, increase budget to $30/day
2. Create lookalike 1% Purchase (after 50+ purchases — later)
3. Retarget LP ViewContent 7-day, exclude Purchasers
4. Second product test only after 2 weeks of stable CPA

---

## Env vars (optional)

```bash
# Stripe Payment Link fallback on checkout page
NEXT_PUBLIC_STRIPE_CONVERSION_KIT_LINK=https://buy.stripe.com/...

# PayPal (existing)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_ENV=sandbox  # switch to live for real test
```

---

## Support SLA (async)

Reply to buyer emails within 24h on business days. Refund policy on LP: 7 days if fewer than 3 actionable leaks found.
