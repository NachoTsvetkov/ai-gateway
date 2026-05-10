"use client";

import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatPrice, type Currency } from "lib/currency";
import { type Locale } from "lib/i18n/locale";

// Keep these in sync with app/page.tsx and the system prompt in
// app/api/sales-assistant/chat/route.ts.
const CALENDLY_URL = "https://calendly.com/nacho-tsvetkov/30min";
const EMAIL = "nacho.tsvetkov@gmail.com";
const PHONE_E164 = "+359882700002";

// Quick-reply prompts for the empty-state suggestion column. Order is
// intentional: the first option is the strongest revenue framing
// ("grow my sales") because it doubles as the visitor's most likely
// goal. Translated per locale so the BG visitor never sees a chip in
// English next to the rest of their localised UI.
const SUGGESTIONS: Record<Locale, ReadonlyArray<string>> = {
  en: [
    "I want to grow my sales",
    "I want to set up initial cashflow / get online fast",
    "I'm losing leads and need automation",
    "I already have a website but it's not converting",
    "Help me pick the right bundle",
    "Book a discovery call",
  ],
  bg: [
    "Искам да увелича продажбите си",
    "Искам бързо да съм онлайн и да започнат да идват пари",
    "Губя контакти и ми трябва автоматизация",
    "Имам сайт, но не конвертира",
    "Помогни ми да избера правилния пакет",
    "Запази безплатен разговор",
  ],
};

// Localised UI chrome for the chat widget itself. Kept inline (rather
// than in `lib/i18n/dict.ts`) because none of these strings are
// reused outside the assistant — keeping them next to the component
// avoids the round-trip through the dict file when reading the
// assistant in isolation.
const ASSISTANT_UI = {
  launcherFull: { en: "Chat · Book a Call", bg: "Чат · Запази разговор" },
  launcherShort: { en: "Chat · Book", bg: "Чат · Запази" },
  launcherAria: {
    en: "Chat with Nacho's assistant or book a discovery call",
    bg: "Разговаряй с асистента на Начо или запази безплатен разговор",
  },
  headerTitle: {
    en: "Nacho's Assistant",
    bg: "Асистентът на Начо",
  },
  headerSub: {
    en: "Build a Money Generator · Book in 15 min",
    bg: "Изгради машина за пари · Запази за 15 минути",
  },
  closeAria: { en: "Close chat", bg: "Затвори чата" },
  bookCallShort: { en: "Book a Call", bg: "Запази разговор" },
  callAria: { en: "Call Nacho", bg: "Обади се на Начо" },
  emptyHello: {
    en: "Hey — I'm Nacho's Assistant.",
    bg: "Здрасти — аз съм асистентът на Начо.",
  },
  emptyBodyBefore: {
    en: "I help small business owners turn their business into a ",
    bg: "Помагам на малки бизнеси да се превърнат в ",
  },
  emptyBodyEmphasis: {
    en: "Money Generator",
    bg: "машина за пари",
  },
  emptyBodyAfter: {
    en: ". Tell me your goal in one sentence and I'll point you to the right bundle — or book the call straight away.",
    bg: ". Кажи ми целта си с едно изречение и ще те насоча към правилния пакет — или направо запиши разговор.",
  },
  inputPlaceholder: {
    en: "Tell me what you need…",
    bg: "Кажи ми от какво имаш нужда…",
  },
  sendAria: { en: "Send message", bg: "Изпрати съобщение" },
  errorPrefix: {
    en: "Something went wrong. Try again or ",
    bg: "Нещо се обърка. Опитай пак или ",
  },
  errorBookLink: {
    en: "book a call directly",
    bg: "запиши разговор директно",
  },
  errorSuffix: { en: ".", bg: "." },
  footer: {
    en: "Powered by OpenAI · Replies may be wrong — book a call to confirm.",
    bg: "Powered by OpenAI · Отговорите може да грешат — запиши разговор за потвърждение.",
  },
  // BundleCard chrome
  recommendedKicker: {
    en: "Recommended bundle",
    bg: "Препоръчан пакет",
  },
  seeWhatsIncluded: {
    en: "See what's included →",
    bg: "Виж какво включва →",
  },
} as const;

type BundleId = "startup" | "scaleup" | "enterprise";

type BundleInfo = {
  name: string;
  tagline: string;
  price: string;
  sub: string;
  cta: string;
};

// Bundle info is computed per-currency AND per-locale. The numeric
// source-of-truth EUR amounts MUST match `app/page.tsx` and the system
// prompt in `app/api/sales-assistant/chat/route.ts`. The text chrome
// is locale-aware so a Bulgarian visitor sees Bulgarian bundle names,
// taglines, sub-text, and CTA verbs in chat cards.
function getBundleInfo(
  currency: Currency,
  locale: Locale,
): Record<BundleId, BundleInfo> {
  const retainer = formatPrice(97, currency);
  if (locale === "bg") {
    return {
      startup: {
        name: "Startup пакет",
        tagline: "Стартирай бързо и евтино",
        price: formatPrice(173, currency),
        sub: "еднократно",
        cta: "Вземи Startup",
      },
      scaleup: {
        name: "Scale-Up пакет",
        tagline: "Надстрой и автоматизирай",
        price: formatPrice(354, currency),
        sub: `еднократно + ${retainer}/м.`,
        cta: "Започни Scale-Up",
      },
      enterprise: {
        name: "Enterprise пакет",
        tagline: "Пълна AI трансформация",
        price: formatPrice(971, currency),
        sub: `еднократно + ${retainer}/м.`,
        cta: "Купи Enterprise",
      },
    };
  }
  return {
    startup: {
      name: "Startup Bundle",
      tagline: "Launch Fast & Cheap",
      price: formatPrice(173, currency),
      sub: "one-time",
      cta: "Get Startup",
    },
    scaleup: {
      name: "Scale-Up Bundle",
      tagline: "Upgrade & Automate",
      price: formatPrice(354, currency),
      sub: `one-time + ${retainer}/mo`,
      cta: "Start Scale-Up",
    },
    enterprise: {
      name: "Enterprise Bundle",
      tagline: "Full AI Transformation",
      price: formatPrice(971, currency),
      sub: `one-time + ${retainer}/mo`,
      cta: "Buy Enterprise",
    },
  };
}

// Bundle link format emitted by the assistant. The optional `?note=...`
// segment carries a URL-encoded conversation summary that we surface to
// Calendly via `?a1=` on the rendered card's CTA — so the booking lands
// on Nacho's calendar with full context attached as a note.
const BUNDLE_LINK_RE =
  /\[([^\]]+)\]\(#bundle:(startup|scaleup|enterprise)(?:\?note=([^)]+))?\)/g;
const MD_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const BOLD_RE = /\*\*([^*]+)\*\*/g;
const PLACEHOLDER_RE = /\u0000LINK(\d+)\u0000/g;

// Calendly URLs in chat replies arrive as regular markdown links from
// the system prompt (e.g. "Book a free 15-min call") and are rendered
// through the standard `MD_LINK_RE` pipeline below. The bundle card
// now forwards to `/bundles/<id>` instead of Calendly, so we no
// longer need a `buildCalendlyUrl` helper here — the conversation
// note is preserved on the bundle URL and surfaced to Nacho via the
// checkout email.

const LINK_CLASS =
  "font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-800 hover:decoration-blue-800/50 dark:text-blue-400 dark:hover:text-blue-300";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Extracts the hostname from a hyperlink so we can decide whether to
// tag it `data-pixel-lead`. Wrapped in try/catch because URL() throws
// on relative paths or anything that isn't a valid URL — those just
// don't match calendly.com and that's the correct outcome.
function safeHostFromHref(href: string): string {
  try {
    return new URL(href).hostname;
  } catch {
    return "";
  }
}

type BundleRec = { id: BundleId; note?: string };

// Detect every bundle anchor link emitted by the assistant and pair it
// with the optional URL-encoded conversation note. Cards render once
// per unique bundle id; if the AI emits the same bundle twice in one
// message, the FIRST occurrence's note wins (the model usually puts
// the most context-rich one first).
function extractBundleRecs(text: string): BundleRec[] {
  const recs: BundleRec[] = [];
  const seen = new Set<BundleId>();
  for (const m of text.matchAll(BUNDLE_LINK_RE)) {
    const id = m[2] as BundleId;
    if (seen.has(id)) continue;
    seen.add(id);
    let note: string | undefined;
    if (m[3]) {
      try {
        note = decodeURIComponent(m[3].replace(/\+/g, "%20"));
      } catch {
        note = undefined;
      }
    }
    recs.push({ id, note });
  }
  return recs;
}

// Convert assistant markdown to safe HTML. Steps:
//   1. Strip bundle-anchor links (rendered as cards instead)
//   2. Replace remaining markdown links with placeholders
//   3. HTML-escape everything
//   4. Re-inject links as anchor tags
//   5. **bold** → <strong>
//   6. Newlines → <br>
function renderMessageHtml(text: string): string {
  const withoutBundleLinks = text.replace(BUNDLE_LINK_RE, "$1");

  const placeholders: Array<{ label: string; href: string }> = [];
  const withPlaceholders = withoutBundleLinks.replace(
    MD_LINK_RE,
    (_m, label: string, href: string) => {
      const idx = placeholders.length;
      placeholders.push({ label, href });
      return `\u0000LINK${idx}\u0000`;
    },
  );

  let html = escapeHtml(withPlaceholders);

  html = html.replace(PLACEHOLDER_RE, (_m, idx: string) => {
    const p = placeholders[Number(idx)];
    if (!p) return "";
    const safeHref = escapeHtml(p.href);
    const safeLabel = escapeHtml(p.label);
    const isExternal = /^https?:\/\//.test(p.href);
    const target = isExternal
      ? ` target="_blank" rel="noopener noreferrer"`
      : "";
    // Tag Calendly anchors so <LeadLinkTracker> fires a Lead event
    // when the visitor clicks. Detected by hostname (not literal
    // "calendly.com" substring) so a path like "/calendly-tips" on
    // our own domain wouldn't get mis-tagged.
    const lead = /(^|\.)calendly\.com$/i.test(safeHostFromHref(p.href))
      ? ` data-pixel-lead`
      : "";
    return `<a href="${safeHref}" class="${LINK_CLASS}"${target}${lead}>${safeLabel}</a>`;
  });

  html = html.replace(BOLD_RE, "<strong>$1</strong>");
  html = html.replace(/\n/g, "<br>");
  return html;
}

function BundleCard({
  bundleId,
  info,
  note,
  locale,
}: {
  bundleId: BundleId;
  info: BundleInfo;
  note?: string;
  locale: Locale;
}) {
  const b = info;
  // Bundle cards used to forward to Calendly with the note as the
  // `?a1=` param. Now that the site has a real `/bundles/[slug]`
  // detail + checkout flow, the card forwards there instead — the
  // visitor lands on the page, can read what's included, pick upsells,
  // and continue to checkout. The Calendly link is still in the
  // assistant's reply as a separate "let's just talk" path. The note
  // is preserved on the URL so it could later be used to prefill the
  // checkout form's "Anything I should know" textarea.
  const href = `/bundles/${bundleId}${note ? `?note=${encodeURIComponent(note)}` : ""}`;
  return (
    <Link
      href={href}
      prefetch={true}
      className="my-2 block overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-violet-50 p-4 transition-all hover:border-blue-400 hover:shadow-md hover:shadow-blue-600/10 dark:border-blue-500/30 dark:from-blue-950/40 dark:to-violet-950/40 dark:hover:border-blue-400/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            {ASSISTANT_UI.recommendedKicker[locale]}
          </p>
          <p className="mt-1 truncate text-sm font-bold text-neutral-900 dark:text-white">
            {b.name}
          </p>
          <p className="truncate text-xs text-neutral-600 dark:text-neutral-400">
            {b.tagline}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {b.price}
          </p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
            {b.sub}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
          {ASSISTANT_UI.seeWhatsIncluded[locale]}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
          {b.cta}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="h-3 w-3"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}

function ChatMessage({
  role,
  parts,
  bundleInfo,
  locale,
}: {
  role: string;
  parts: Array<{ type: string; text?: string; [key: string]: unknown }>;
  bundleInfo: Record<BundleId, BundleInfo>;
  locale: Locale;
}) {
  const text = parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("");

  if (!text) return null;

  const bundleRecs = role === "assistant" ? extractBundleRecs(text) : [];
  const html = renderMessageHtml(text);
  const isUser = role === "user";

  return (
    <div className="mb-3">
      <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="h-3.5 w-3.5 text-white"
            >
              <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
          </div>
        )}
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
          }`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      {bundleRecs.length > 0 && (
        <div className="ml-8 mt-1 grid gap-2">
          {bundleRecs.map((r) => (
            <BundleCard
              key={r.id}
              bundleId={r.id}
              info={bundleInfo[r.id]}
              note={r.note}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="mb-3 flex items-start justify-start">
      <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="h-3.5 w-3.5 text-white"
        >
          <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
      </div>
      <div className="flex gap-1.5 rounded-2xl bg-neutral-100 px-4 py-3 dark:bg-neutral-800">
        <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export function SalesAssistant({
  currency,
  locale = "en",
}: {
  currency: Currency;
  locale?: Locale;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Bundle prices on rendered cards must match the displayed currency.
  // Memoised so we don't rebuild the formatter map on every render.
  const bundleInfo = useMemo(
    () => getBundleInfo(currency, locale),
    [currency, locale],
  );

  // Currency + locale are sent on every chat request so the API can
  // build a price-correct AND language-correct system prompt — the AI
  // must never reply in English while the visitor sees Bulgarian
  // surrounding chrome (or vice versa), and must never quote EUR while
  // the visitor sees USD on the page.
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/sales-assistant/chat",
        body: { currency, locale },
      }),
    [currency, locale],
  );

  const { messages, sendMessage, error, status } = useChat({ transport });

  const pending = status === "submitted" || status === "streaming";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Other components on the page can drop `data-sales-trigger` on any
  // clickable element to open the assistant programmatically.
  useEffect(() => {
    function handle(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (t.closest("[data-sales-trigger]")) setIsOpen(true);
    }
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, []);

  // Close the panel when the user clicks an in-page anchor link inside
  // the conversation, otherwise the smooth-scroll target is hidden under
  // our fixed panel.
  const handleMessagesClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const link = (e.target as HTMLElement).closest("a");
      if (link?.getAttribute("href")?.startsWith("#")) {
        setIsOpen(false);
      }
    },
    [],
  );

  const submit = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || pending) return;
      setInputValue("");
      await sendMessage({ text: trimmed });
    },
    [pending, sendMessage],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit(inputValue);
  };

  const handleSuggestion = (text: string) => {
    void submit(text);
  };

  return (
    <>
      {/* Floating launcher — replaces the old static "Book Discovery Call"
          button. The label text matches the user's intent so people who
          just want to book can still recognize it.

          Wrapped in a positioned container so we can render a halo
          <span> behind it for the gentle "I'm here when you're ready"
          pulse. The halo lives on a sibling, NOT the button itself, so
          the existing hover:scale-105 / active:scale-95 transitions
          aren't fighting an `animation: transform` on the same element.

          The `bottom-[calc(...)]` keeps it clear of the iPhone home
          indicator (env(safe-area-inset-bottom) is 0 on every other
          device, so nothing changes there). */}
      <div
        className={`fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-50 sm:right-8 sm:bottom-[calc(2rem+env(safe-area-inset-bottom))] ${
          isOpen ? "pointer-events-none opacity-0" : ""
        }`}
      >
        {/* Halo: same gradient as the button, scaled up + faded out on
            a 2.6s loop. `pointer-events-none` so it never intercepts the
            click. Sits BEHIND the button via DOM order — no z-index
            wrangling needed because the button repaints fully opaque
            over it at scale(1). */}
        <span
          aria-hidden="true"
          className="sales-launcher-pulse pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-violet-600"
        />
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-600/30 transition-all hover:scale-105 hover:shadow-blue-500/40 active:scale-95 sm:px-6 sm:py-3.5"
          aria-label={ASSISTANT_UI.launcherAria[locale]}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
          <span className="hidden sm:inline">
            {ASSISTANT_UI.launcherFull[locale]}
          </span>
          <span className="sm:hidden">
            {ASSISTANT_UI.launcherShort[locale]}
          </span>
        </button>
      </div>

      {/* Slide-up chat panel — height accounts for safe-area-inset on
          notched iPhones so the input row never hides behind the home
          indicator. Same calc trick as the launcher above. */}
      {isOpen && (
        <div className="fixed right-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 flex h-[min(620px,calc(100dvh-24px-env(safe-area-inset-bottom)))] w-[min(400px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl sm:right-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] dark:border-neutral-700 dark:bg-neutral-900">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="h-5 w-5 text-white"
              >
                <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {ASSISTANT_UI.headerTitle[locale]}
              </p>
              <p className="truncate text-xs text-blue-100">
                {ASSISTANT_UI.headerSub[locale]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={ASSISTANT_UI.closeAria[locale]}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>

          {/* Persistent quick-actions bar — book / email / call without typing a word */}
          <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900/80">
            <a
              href={CALENDLY_URL}
              data-pixel-lead
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-3.5 w-3.5"
              >
                <path
                  fillRule="evenodd"
                  d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.75A2.75 2.75 0 0 1 18.5 6.75v8.5A2.75 2.75 0 0 1 15.75 18H4.25A2.75 2.75 0 0 1 1.5 15.25v-8.5A2.75 2.75 0 0 1 4.25 4H5V2.75A.75.75 0 0 1 5.75 2ZM3 8.5h14V6.75A1.25 1.25 0 0 0 15.75 5.5H4.25A1.25 1.25 0 0 0 3 6.75V8.5Z"
                  clipRule="evenodd"
                />
              </svg>
              {ASSISTANT_UI.bookCallShort[locale]}
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white"
              aria-label={`Email Nacho at ${EMAIL}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-3.5 w-3.5"
              >
                <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
              </svg>
            </a>
            <a
              href={`tel:${PHONE_E164}`}
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white"
              aria-label={ASSISTANT_UI.callAria[locale]}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-3.5 w-3.5"
              >
                <path
                  fillRule="evenodd"
                  d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4"
            onClick={handleMessagesClick}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center pt-4 pb-2 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-900/30 dark:to-violet-900/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="h-7 w-7 text-blue-600 dark:text-blue-400"
                  >
                    <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {ASSISTANT_UI.emptyHello[locale]}
                </p>
                <p className="mt-1 max-w-[300px] text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {ASSISTANT_UI.emptyBodyBefore[locale]}
                  <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                    {ASSISTANT_UI.emptyBodyEmphasis[locale]}
                  </span>
                  {ASSISTANT_UI.emptyBodyAfter[locale]}
                </p>

                <div className="mt-5 flex w-full max-w-[300px] flex-col gap-2">
                  {SUGGESTIONS[locale].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSuggestion(s)}
                      disabled={pending}
                      className="flex items-center justify-between gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-left text-xs font-medium text-neutral-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                    >
                      <span className="leading-snug">{s}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                        className="h-3 w-3 shrink-0 opacity-60"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                parts={
                  message.parts as Array<{
                    type: string;
                    text?: string;
                    [key: string]: unknown;
                  }>
                }
                bundleInfo={bundleInfo}
                locale={locale}
              />
            ))}

            {pending && messages[messages.length - 1]?.role !== "assistant" && (
              <TypingIndicator />
            )}

            {error && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {ASSISTANT_UI.errorPrefix[locale]}
                <a
                  href={CALENDLY_URL}
                  data-pixel-lead
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  {ASSISTANT_UI.errorBookLink[locale]}
                </a>
                {ASSISTANT_UI.errorSuffix[locale]}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-neutral-200 bg-neutral-50/80 px-4 py-3 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/50"
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={ASSISTANT_UI.inputPlaceholder[locale]}
                className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
                disabled={pending}
              />
              <button
                type="submit"
                disabled={pending || !inputValue.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white transition-all hover:from-blue-500 hover:to-violet-500 disabled:opacity-50"
                aria-label={ASSISTANT_UI.sendAria[locale]}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-neutral-400 dark:text-neutral-500">
              {ASSISTANT_UI.footer[locale]}
            </p>
          </form>
        </div>
      )}
    </>
  );
}
