// Per-service deep-dive content powering /services/[serviceId].
//
// Kept in a separate file from `services-data.ts` because the catalogue
// metadata (id, name, price, pain category) is needed in lots of
// places (homepage teaser, /services list, AI system prompt) but the
// heavy detail copy is only needed on the product page itself. Moving
// it here keeps the listing-only imports small.
//
// To add a new service detail: add a new entry to `SERVICE_DETAILS`
// keyed by ServiceId. The detail page tolerates missing entries (it
// falls back to the catalogue's `pain`/`solution` strings), so you
// can ship a service without a detail page and the listing still
// works — but every service in the catalogue should ideally have one.

import type { ServiceId } from "./services-data";
import type { Locale } from "./i18n/locale";
import { SERVICE_DETAILS_BG } from "./service-details.bg";

export type ServiceDetail = {
  /** Hero subheadline — one-sentence emotional framing. */
  tagline: string;
  /** 3–5 visceral bullet points showing the cost of NOT solving this. */
  painPoints: ReadonlyArray<string>;
  /** What we deliver — concrete, specific, no hand-waving. */
  solutionPoints: ReadonlyArray<string>;
  /** Numbered implementation steps. Each step shows the visitor what
   *  happens at that stage of the engagement. Order matters. */
  implementation: ReadonlyArray<{ title: string; body: string }>;
  /** Plain-English timeline summary, e.g. "5–7 business days". */
  timeline: string;
  /** Concrete artefacts the client walks away with. Used to anchor
   *  the price ("you're paying €X for THIS"). */
  deliverables: ReadonlyArray<string>;
  /** One sentence describing the ideal client for this service. */
  bestFor: string;
  /** 0–3 service-specific FAQs. Optional. */
  faq?: ReadonlyArray<{ q: string; a: string }>;
};

export const SERVICE_DETAILS: Partial<Record<ServiceId, ServiceDetail>> = {
  // ---------------------------------------------------------------- //
  // 1. Custom Responsive Website Build/Redesign                      //
  // ---------------------------------------------------------------- //
  website: {
    tagline:
      "A website that loads fast, looks great, and turns visitors into customers — built in days, not months.",
    painPoints: [
      "You lose 32% of mobile visitors in the first 3 seconds because your site loads slowly.",
      "60% of your traffic is on a phone — and your current site looks broken on one.",
      "Google ranks you on page 5 because Core Web Vitals are red and competitors took the top spots while you waited.",
      "There's no clear path from visitor to lead — no form, no booking, no chat. Visitors leave and never come back.",
    ],
    solutionPoints: [
      "Lightning-fast Next.js or Astro stack — Lighthouse 95+ on first deploy.",
      "Mobile-first responsive layout designed around YOUR business goal (lead, sale, booking).",
      "SEO foundation built in: structured data, sitemap, meta tags, social previews.",
      "Lead-capture form or booking widget connected to your inbox / calendar from day one.",
      "Your copy and photos polished by a designer's eye (or rewritten if you don't have any).",
    ],
    implementation: [
      {
        title: "Day 1 — 1-hour discovery call",
        body: "We map the visitor's journey from Google to conversion, lock the page structure, and pick the look-and-feel.",
      },
      {
        title: "Days 2–4 — Build",
        body: "I assemble the site in a staging environment. You see daily progress. Two rounds of unlimited edits included.",
      },
      {
        title: "Days 5–6 — Polish",
        body: "Performance pass, SEO pass, mobile pass, accessibility pass. Lighthouse > 95 across all categories before launch.",
      },
      {
        title: "Day 7 — Launch",
        body: "Domain pointed, analytics live, you get the keys. 30 days of free post-launch tweaks included.",
      },
    ],
    timeline: "Typically 5–7 business days",
    deliverables: [
      "Live website on your domain (or a subdomain we provision)",
      "Hosting + SSL configured (free tier covers most small businesses)",
      "Google Analytics 4 + Search Console connected",
      "Owner credentials — you own the code, the design files, the data",
      "30 days of free post-launch tweaks",
    ],
    bestFor:
      "New businesses, freelancers, service businesses, and anyone whose current site is older than 3 years.",
    faq: [
      {
        q: "What if I already have a domain?",
        a: "Perfect — I'll connect it. If you don't have one, I'll register one for you (registration cost passed through at cost, no markup).",
      },
      {
        q: "Can I edit the site myself afterward?",
        a: "Yes — I'll show you how in a 30-minute handoff call. For bigger changes the maintenance retainer is the cheapest path.",
      },
    ],
  },

  // ---------------------------------------------------------------- //
  // 2. E-commerce Store Setup & Customization                        //
  // ---------------------------------------------------------------- //
  ecommerce: {
    tagline:
      "Sell online with payments, inventory, and recovery flows that actually work — no plugin chaos, no abandoned-cart blackouts.",
    painPoints: [
      "70% of carts are abandoned and you have no way to recover them — that's revenue evaporating every night.",
      "Inventory lives in three places (spreadsheet, Etsy, Shopify) and ships the wrong thing to the wrong customer once a week.",
      "Every payment failure is a lost sale you'll never hear about — until the chargeback notice arrives.",
      "Your store looks like a free template because it is one. Customers second-guess hitting 'Buy'.",
    ],
    solutionPoints: [
      "Shopify, WooCommerce, or headless Next.js + Stripe — picked to fit your scale and where you sell.",
      "Inventory single-source-of-truth with sync to your fulfilment service.",
      "Automated abandoned-cart recovery (email + SMS) — recovers ~25% of lost carts on average.",
      "Branded, fast, mobile-optimised storefront with payments tested across Apple Pay, Google Pay, and cards.",
      "Tax + shipping zones configured for the markets you actually sell to.",
    ],
    implementation: [
      {
        title: "Days 1–2 — Audit + plan",
        body: "We pick the platform that fits your volume + skill, lock SKU structure, payment flow, and shipping zones.",
      },
      {
        title: "Days 3–6 — Build",
        body: "Theme, product imports, payment + tax setup, abandoned-cart flows. Daily preview links so you watch it come together.",
      },
      {
        title: "Days 7–8 — Launch + test",
        body: "End-to-end test orders (refunds included), live launch, Google Merchant Center listing.",
      },
    ],
    timeline: "Typically 7–10 business days",
    deliverables: [
      "Production store with payments live",
      "Up to 50 products imported (more billable hourly)",
      "Abandoned-cart + welcome series flows live",
      "Shipping + tax rules configured for your markets",
      "Owner training + admin handoff",
    ],
    bestFor:
      "Boutique brands, makers, dropshippers, and service businesses adding digital products.",
    faq: [
      {
        q: "Do I need Shopify, or can you use my existing site?",
        a: "Both work. Shopify is the fastest path for product-heavy stores; if you already have a Next.js or WordPress site I'll layer Stripe + cart on top of it.",
      },
      {
        q: "What about international payments and taxes?",
        a: "Stripe handles the payments natively in 40+ countries. For tax I integrate TaxJar or Stripe Tax — set once, calculated correctly forever.",
      },
    ],
  },

  // ---------------------------------------------------------------- //
  // 3. AI Chatbot & Website Virtual Assistant                        //
  // ---------------------------------------------------------------- //
  chatbot: {
    tagline:
      "A 24/7 sales assistant on your site that answers, qualifies, books, and even sells — for the price of one weekend at the office.",
    painPoints: [
      "Half your inbound leads arrive between 6 PM and 8 AM — exactly when no one's there to answer them.",
      "By the time you reply the next morning, 35% have already booked your competitor.",
      "Your team types the same answers (price, hours, address) 50 times a day — that's 5 hours of evaporated focus.",
      "Visitors who would have bought leave because the contact form felt heavy and the answer wasn't on the page.",
    ],
    solutionPoints: [
      "GPT-powered chatbot trained on your menu / pricing / FAQ / policies — never invents.",
      "Captures email or phone before answering high-intent questions.",
      "Books directly into your calendar via the booking widget.",
      "Hands off to a human (you, on Slack or email) when stakes are high.",
      "Logs every conversation so you see what visitors actually want.",
    ],
    implementation: [
      {
        title: "Day 1 — Knowledge dump",
        body: "We collect your pricing, FAQs, policies, products, and tone-of-voice samples.",
      },
      {
        title: "Days 2–3 — Train + tune",
        body: "I configure the agent, write the system prompt, set lead-capture rules, test edge cases against real customer questions.",
      },
      {
        title: "Day 4 — Embed + go live",
        body: "Drop-in widget on your site, calendar + email connected, lead webhook firing into your inbox.",
      },
    ],
    timeline: "3–5 business days",
    deliverables: [
      "Live chatbot widget on your site",
      "Custom-trained on your business",
      "Lead-capture + calendar booking integrated",
      "Conversation log dashboard",
      "First-month tuning included",
    ],
    bestFor:
      "Service businesses with after-hours leads, e-commerce stores with repetitive product questions, agencies, and clinics.",
    faq: [
      {
        q: "Will it hallucinate and give wrong answers?",
        a: "No — it's grounded in YOUR documents and explicitly told to say 'I'll get a human to follow up' when it doesn't know. We test 50+ edge cases before launch.",
      },
      {
        q: "How much does it cost to run per month?",
        a: "LLM tokens for a typical small-business volume run $10–$40/month. Much less than the calls and emails it deflects.",
      },
    ],
  },

  // ---------------------------------------------------------------- //
  // 4. Marketing Automation                                          //
  // ---------------------------------------------------------------- //
  "marketing-automation": {
    tagline:
      "Email + SMS sequences that recover lost sales and turn one-time buyers into repeat customers — running while you sleep.",
    painPoints: [
      "70% of leads go cold within an hour of signing up because no one followed up.",
      "Every abandoned cart is silent — no welcome email, no recovery, no nudge. That's 25% of revenue burning.",
      "You blast the same newsletter to 5,000 people once a month and wonder why opens are at 12%.",
      "There's no way to tell which leads are hot, warm, or dead — so you treat them all the same and waste both your time and theirs.",
    ],
    solutionPoints: [
      "Welcome series, post-purchase series, abandoned-cart recovery, win-back flows — all automated.",
      "Behaviour-triggered campaigns (browsed product X, bought Y, didn't open Z).",
      "Email + SMS in the same flow — choose by user preference and urgency.",
      "Lead scoring so your hottest prospects get a human touch and the rest get nurtured automatically.",
      "Klaviyo, Mailchimp, ActiveCampaign, or HubSpot — picked based on your stack.",
    ],
    implementation: [
      {
        title: "Days 1–2 — Audit + map",
        body: "We map your customer journey and identify the 3 highest-impact flows to ship first.",
      },
      {
        title: "Days 3–6 — Build",
        body: "Copywriting, segmentation rules, automation setup, A/B tests configured.",
      },
      {
        title: "Day 7 — Launch + monitor",
        body: "Flows go live, dashboard set up so you see open / click / revenue numbers daily.",
      },
    ],
    timeline: "5–7 business days for the first 3 flows",
    deliverables: [
      "3 production flows (welcome, abandoned cart, post-purchase) live",
      "Email + SMS templates branded to you",
      "Segmentation + lead-scoring rules",
      "Dashboard tracking opens, clicks, and revenue",
      "Documentation so your team can launch new flows themselves",
    ],
    bestFor:
      "E-commerce, SaaS with free trials, coaches and consultants, and any business with a leaky lead pipeline.",
    faq: [
      {
        q: "Which email platform should I use?",
        a: "If you're e-commerce, Klaviyo. If you're services or B2B, ActiveCampaign or HubSpot. I'll recommend based on your tools and budget on the discovery call.",
      },
      {
        q: "How long until I see results?",
        a: "Abandoned-cart recovery typically pays for the whole engagement within 30 days. Welcome and post-purchase flows take 60–90 days to mature.",
      },
    ],
  },

  // ---------------------------------------------------------------- //
  // 5. Custom CRM                                                    //
  // ---------------------------------------------------------------- //
  crm: {
    tagline:
      "A CRM that fits how you actually work — not the other way around. Pipelines your team will actually use.",
    painPoints: [
      "Customer info lives in spreadsheets, sticky notes, three inboxes, and your head — and nothing matches.",
      "You forgot to follow up with the lead who emailed two weeks ago. They booked your competitor.",
      "Salesforce and HubSpot are too expensive and too complex for your 3-person team. So you use neither.",
      "Onboarding a new salesperson takes 2 weeks because the playbook lives in someone else's brain.",
    ],
    solutionPoints: [
      "Custom-built lightweight CRM tailored to your sales motion (services, e-commerce, agency, etc).",
      "Pipelines, reminders, lead scoring, and automated follow-ups baked in from day one.",
      "Integrates with your email, calendar, and chat so nothing has to be entered twice.",
      "Reports your team actually understands.",
      "You own the database — no per-seat lock-in, no migration nightmare.",
    ],
    implementation: [
      {
        title: "Week 1 — Mapping",
        body: "I shadow your sales motion, document every touchpoint, and design pipeline stages and fields with you.",
      },
      {
        title: "Weeks 2–3 — Build",
        body: "Schema, UI, integrations (email, calendar, chat), seed data import, role-based access.",
      },
      {
        title: "Week 3 — Train + hand off",
        body: "Team training, playbook documentation, 30-day support.",
      },
    ],
    timeline: "2–3 weeks",
    deliverables: [
      "Production CRM hosted on your domain",
      "Up to 5 user seats configured",
      "Email + calendar + chat integrations",
      "Custom reports for your KPIs",
      "Source code + documentation — you own it",
    ],
    bestFor:
      "Agencies, consultancies, B2B services, and any team of 2–10 outgrowing spreadsheets but choking on Salesforce.",
    faq: [
      {
        q: "Why custom instead of HubSpot or Pipedrive?",
        a: "If you fit out-of-the-box, use them. Custom wins when your sales motion is unusual, you've outgrown free tiers, or per-seat pricing is making the team avoid the tool.",
      },
    ],
  },

  // ---------------------------------------------------------------- //
  // 6. Online Booking                                                //
  // ---------------------------------------------------------------- //
  booking: {
    tagline:
      "Stop chasing emails to schedule a call. Visitors pick a slot, pay a deposit, get a Zoom link — automatically.",
    painPoints: [
      "You spend 4 hours a week emailing back and forth to schedule a 15-minute call.",
      "Half your bookings ghost because there's no deposit and no reminder.",
      "Calendly looks generic and doesn't carry your branding — clients second-guess if it's even you.",
      "You're still typing 'works for me, here's the Zoom link' from your phone in line at the supermarket.",
    ],
    solutionPoints: [
      "Branded booking page that lives on YOUR domain.",
      "Calendar sync (Google, Outlook, iCloud) so double-bookings are impossible.",
      "Optional Stripe deposit at booking — reduces no-shows by ~80%.",
      "Automated email + SMS reminders 24h and 1h before.",
      "Zoom / Google Meet links auto-generated and embedded in the calendar event.",
    ],
    implementation: [
      {
        title: "Day 1 — Setup",
        body: "Calendar connected, services + durations configured, deposit rules set.",
      },
      {
        title: "Day 2 — Branding + embed",
        body: "Branded booking widget embedded on your site, reminder templates customised.",
      },
      {
        title: "Day 3 — Test + launch",
        body: "End-to-end test bookings, calendar invites, SMS, deposits. Go live.",
      },
    ],
    timeline: "2–3 business days",
    deliverables: [
      "Branded booking page on your domain",
      "Calendar + Stripe + Zoom integrations live",
      "Email + SMS reminder templates",
      "Embed snippet for your existing site",
    ],
    bestFor:
      "Coaches, consultants, clinics, hairdressers, fitness studios — any service business that schedules.",
  },

  // ---------------------------------------------------------------- //
  // 7. API Integrations                                              //
  // ---------------------------------------------------------------- //
  integrations: {
    tagline:
      "Stop copy-pasting between Shopify, your accounting tool, and your CRM. Custom integrations that sync everything in real time.",
    painPoints: [
      "Your team spends 8 hours a week moving data between Shopify, QuickBooks, ShipStation, and your CRM.",
      "An order-status mismatch between Shopify and your CRM lost you a customer last Tuesday.",
      "Every Zapier workflow that breaks costs you another 30-minute scramble.",
      "There's no single place where you can see 'this customer, this order, this email, this support ticket'.",
    ],
    solutionPoints: [
      "Direct API integrations between the systems you already use — no middleware lock-in.",
      "Real-time sync (or near-real-time for systems that don't support webhooks).",
      "Error monitoring so you find out about a sync break in 5 minutes, not 5 days.",
      "Source code is yours — no per-task fees, no Zapier task limits.",
      "Common pairs: Shopify ↔ QuickBooks, HubSpot ↔ Stripe, Twilio ↔ your CRM, Mailchimp ↔ anything.",
    ],
    implementation: [
      {
        title: "Days 1–2 — Map",
        body: "We map data flow, edge cases, and failure modes. Spec doc signed off by you.",
      },
      {
        title: "Days 3–7 — Build",
        body: "Custom integration coded, tested, deployed. Monitoring + alerts configured.",
      },
      {
        title: "Day 8 — Cutover + handoff",
        body: "Old workflow archived, new sync running, your team trained on the dashboard.",
      },
    ],
    timeline: "1–2 weeks per integration pair",
    deliverables: [
      "Production integration with monitoring",
      "Alerts to your inbox if anything breaks",
      "Source code + documentation — you own it",
      "30-day post-launch tweaks",
    ],
    bestFor:
      "Multi-tool teams losing hours to data shuffling, agencies stitching together client stacks, e-commerce + back-office.",
  },

  // ---------------------------------------------------------------- //
  // 8. SEO & Conversion Optimization                                 //
  // ---------------------------------------------------------------- //
  seo: {
    tagline:
      "Get found on Google for what your customers are actually typing — and turn that traffic into bookings, not bounces.",
    painPoints: [
      "You're invisible past page 2 for the keywords that would have made you money.",
      "Your Core Web Vitals are red, your H1s are wrong, and your meta descriptions look like 1998.",
      "The few visitors you do get bounce in 3 seconds because the page doesn't tell them what to do.",
      "You've been told 'SEO takes 6 months' so many times you've stopped paying attention.",
    ],
    solutionPoints: [
      "Technical SEO audit + fixes (Core Web Vitals, schema, meta, sitemap, redirects).",
      "Keyword research → content brief → on-page optimisation for the 5–10 highest-intent terms.",
      "Conversion-focused page rewrites (one CTA, clear value prop, social proof above the fold).",
      "A/B testing on the highest-traffic pages.",
      "Monthly reporting on rankings, traffic, conversions.",
    ],
    implementation: [
      {
        title: "Week 1 — Audit",
        body: "Full technical + on-page audit, keyword research, competitor analysis. Plain-English roadmap.",
      },
      {
        title: "Weeks 2–3 — Fix + rewrite",
        body: "Technical fixes shipped, top 3 pages rewritten and re-launched.",
      },
      {
        title: "Week 4+ — Test + iterate",
        body: "A/B tests on hero copy, CTAs, headlines. Monthly reporting.",
      },
    ],
    timeline: "First wins in 2–3 weeks; compounding over months",
    deliverables: [
      "Audit + roadmap document",
      "Technical SEO fixes shipped",
      "Top 3–5 pages rewritten + re-launched",
      "Monthly ranking + conversion report",
    ],
    bestFor:
      "Local businesses, B2B service companies, content-heavy sites, and any business losing to less-good competitors on Google.",
  },

  // ---------------------------------------------------------------- //
  // 9. AI-Powered Personalization                                    //
  // ---------------------------------------------------------------- //
  personalization: {
    tagline:
      "Every visitor sees a different homepage — tailored to who they are and what they're looking for. Conversion lifts of 30–80% are typical.",
    painPoints: [
      "Every visitor sees the same generic homepage, so conversion stays flat at 1–2%.",
      "First-time visitors and returning customers get the same treatment — and both are unimpressed.",
      "Product recommendations are 'most popular', which means everyone sees the same 4 SKUs.",
      "You're spending money on traffic that converts at 1.8% when industry average for personalised sites is 4%+.",
    ],
    solutionPoints: [
      "AI personalises copy, hero images, and product recommendations in real time.",
      "Segments by source (Google, paid ads, email), behaviour (browsed X), and history (returning vs new).",
      "A/B tested against a static control — you see the conversion lift in numbers.",
      "Plays well with your existing stack (Shopify, Webflow, custom Next.js).",
      "Privacy-respecting — no creepy tracking, GDPR-compliant.",
    ],
    implementation: [
      {
        title: "Week 1 — Strategy",
        body: "Define segments, hypotheses, success metrics. Wire up event tracking.",
      },
      {
        title: "Weeks 2–3 — Build",
        body: "Personalisation rules + AI prompts + variant content. Control group set up.",
      },
      {
        title: "Week 4+ — Test + iterate",
        body: "A/B tests run, monthly review meetings, new variants shipped.",
      },
    ],
    timeline: "3–4 weeks for first variants live",
    deliverables: [
      "Personalisation engine wired into your site",
      "First 3–5 segments + variants live",
      "A/B test dashboard tracking conversion lift",
      "Monthly strategy review",
    ],
    bestFor:
      "E-commerce stores, SaaS landing pages, content sites, and any business with > 1,000 monthly visitors.",
  },

  // ---------------------------------------------------------------- //
  // 10. Maintenance & Security Retainer                              //
  // ---------------------------------------------------------------- //
  maintenance: {
    tagline:
      "Keep your site fast, secure, and growing — without adding a developer to payroll. Cancel anytime.",
    painPoints: [
      "Your site went down on Black Friday and you had no one to call.",
      "A WordPress plugin pushed an update that broke checkout. You found out from an angry customer.",
      "Three years of skipped security patches mean your customer data is one bot scan away from disaster.",
      "Every small content change feels like a hostage situation — pay the freelancer or live with the typo.",
    ],
    solutionPoints: [
      "24/7 uptime monitoring + alerting.",
      "Weekly automated backups (3 generations stored offsite).",
      "Security patches applied within 48 hours of release.",
      "Up to 2 hours / month of content changes, copy updates, image swaps — no questions asked.",
      "Priority support: I respond within 4 business hours, faster for outages.",
      "Quarterly performance review (Lighthouse scan, broken links, SEO health).",
    ],
    implementation: [
      {
        title: "Day 1 — Onboarding",
        body: "Backup + monitoring + alerts wired up. I take ownership of your tech-debt list.",
      },
      {
        title: "Ongoing",
        body: "Patches, backups, monitoring 24/7. You email me when you need a change.",
      },
      {
        title: "Quarterly — Review",
        body: "Performance scan, security audit, roadmap discussion.",
      },
    ],
    timeline: "Live within 24 hours of signup",
    deliverables: [
      "Monthly invoice + completed-work report",
      "Up to 2h of content / copy changes per month",
      "All emergency fixes included",
      "Quarterly health-check report",
    ],
    bestFor:
      "Anyone running a site they can't afford to have go down — restaurants, agencies, e-commerce, SaaS landing pages.",
    faq: [
      {
        q: "Can I cancel anytime?",
        a: "Yes — month-to-month, no contract. You keep all access, code, and data.",
      },
      {
        q: "What counts as 'content changes'?",
        a: "Copy edits, image swaps, new pages, plugin updates, minor design tweaks. Anything that takes me up to 2 hours/month is included; bigger projects quoted separately.",
      },
    ],
  },

  // ---------------------------------------------------------------- //
  // 11. AI Agent Development (Autonomous Virtual Employees)          //
  // ---------------------------------------------------------------- //
  "ai-agents": {
    tagline:
      "Custom AI agents that act, not just chat — they do the work of a 20-hour-a-week assistant for less than a coffee a day.",
    painPoints: [
      "You can't afford a full-time assistant or salesperson — but the work keeps piling up and you keep dropping balls.",
      "Hiring took 3 months last time. By the time they were trained, the role had changed.",
      "You spend 2 hours every day on tasks that are 90% the same: research, follow-up emails, CRM updates, lead enrichment.",
      "Generic AI tools (ChatGPT, Claude) require you to copy-paste every input. That's not automation — that's a different kind of typing.",
    ],
    solutionPoints: [
      "Agent designed around ONE specific job (lead research, outbound email, CRM hygiene, content first-drafts).",
      "Connects to your tools via API — not just chat. It actually writes the email, updates the record, files the report.",
      "Has guardrails: approves with you before high-stakes actions; runs autonomously for low-stakes.",
      "Logs every action so you can audit and improve over time.",
      "Costs ~$50–$200 / month in LLM tokens depending on volume.",
    ],
    implementation: [
      {
        title: "Week 1 — Job description",
        body: "We define the agent's role, allowed actions, and success criteria — like hiring.",
      },
      {
        title: "Weeks 2–3 — Build + train",
        body: "Tools integrated, prompts tuned, edge cases tested with you.",
      },
      {
        title: "Week 4 — Soft launch + iterate",
        body: "Agent runs in shadow mode for a week, then takes over with your sign-off.",
      },
    ],
    timeline: "3–4 weeks per agent",
    deliverables: [
      "Production agent doing one specific job",
      "Audit log dashboard",
      "Source code + documentation",
      "30 days of tuning included",
    ],
    bestFor:
      "Solopreneurs, small agencies, sales teams, and any business where '20 hours of repetitive work' could be redirected toward growth.",
  },

  // ---------------------------------------------------------------- //
  // 12. AI Lead Generation & Voice Agents                            //
  // ---------------------------------------------------------------- //
  "voice-agents": {
    tagline:
      "AI that picks up the phone, qualifies leads, books meetings, and answers customer questions — in a voice indistinguishable from a real person.",
    painPoints: [
      "Cold outreach is dead and your team hates the phone — but inbound leads still expect to be called within 5 minutes.",
      "Lead-response time over 5 minutes drops conversion by 80%. Yours is 4 hours on a good day.",
      "You miss 30% of inbound calls because your front desk is dealing with the customer who walked in.",
      "Hiring a call-centre is expensive, slow, and they don't sound like your brand.",
    ],
    solutionPoints: [
      "AI voice agent that calls inbound leads back within 60 seconds.",
      "Qualifies, books meetings, transfers to a human if asked — all in a natural-sounding voice.",
      "Handles inbound FAQ calls so your front desk stays focused on the people in front of them.",
      "Logs and transcribes every call for audit + training.",
      "Speaks English, Spanish, German, French, and more.",
    ],
    implementation: [
      {
        title: "Week 1 — Script + voice",
        body: "We write the call script, pick the voice, configure the qualification flow.",
      },
      {
        title: "Week 2 — Integrate",
        body: "Connects to your phone system (Twilio, RingCentral) and CRM / calendar.",
      },
      {
        title: "Week 3 — Test + launch",
        body: "10+ test calls with you, soft launch, then live.",
      },
    ],
    timeline: "2–3 weeks",
    deliverables: [
      "Production voice agent on your phone number",
      "Call recording + transcription dashboard",
      "CRM + calendar integrations",
      "Monthly tuning + reporting",
    ],
    bestFor:
      "Real estate, home services, automotive, SaaS demo booking, and any business where speed of response = revenue.",
  },
};

export function getServiceDetail(id: ServiceId): ServiceDetail | undefined {
  return SERVICE_DETAILS[id];
}

/**
 * Locale-aware variant: returns the BG translation when locale === "bg"
 * and a translation exists, otherwise falls back to the English source
 * so a partially-translated catalogue still renders.
 */
export function getLocalizedServiceDetail(
  id: ServiceId,
  locale: Locale,
): ServiceDetail | undefined {
  const en = SERVICE_DETAILS[id];
  if (!en) return undefined;
  if (locale === "en") return en;
  const bg = SERVICE_DETAILS_BG[id];
  if (!bg) return en;
  // Field-by-field overlay so a half-translated entry (e.g. only the
  // tagline is BG, the painPoints aren't yet) still gives the visitor
  // BG where it exists and English where it doesn't.
  return {
    tagline: bg.tagline ?? en.tagline,
    painPoints: bg.painPoints ?? en.painPoints,
    solutionPoints: bg.solutionPoints ?? en.solutionPoints,
    implementation: bg.implementation ?? en.implementation,
    timeline: bg.timeline ?? en.timeline,
    deliverables: bg.deliverables ?? en.deliverables,
    bestFor: bg.bestFor ?? en.bestFor,
    faq: bg.faq ?? en.faq,
  };
}
