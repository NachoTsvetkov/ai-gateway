"use client";

import { type Locale, LOCALE_COOKIE } from "lib/i18n/locale";

/**
 * Language toggle pill rendered inside the marketing navbar.
 *
 * Visibility model — important: the parent (navbar) is responsible for
 * deciding whether to mount this component at all. The product spec is
 * "show the toggle for BG traffic only" — outside Bulgaria, this
 * component never renders, so no stray "EN/BG" pill ever appears for
 * audiences who have nothing to switch.
 *
 * Behaviour:
 *   - Click writes a 1-year cookie (`locale=en` or `locale=bg`) and
 *     reloads the page. The server component (layout / pages) reads
 *     the cookie via `detectLocale()` and the entire tree re-renders
 *     in the new language.
 *   - We don't use a server action because the cookie is fully visible
 *     to the client and the reload approach gives us a clean,
 *     deterministic re-render with the new locale baked into every
 *     server component (including header tags, metadata, etc.).
 */
export function LanguageToggle({ currentLocale }: { currentLocale: Locale }) {
  function pickLocale(locale: Locale) {
    if (locale === currentLocale) return;
    setLocaleCookie(locale);
    // Hard reload so every server component (and the html lang attr)
    // re-renders against the new cookie. router.refresh() would only
    // re-run the dynamic page handlers, leaving the html element's
    // lang attribute stale until the next full navigation.
    window.location.reload();
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className="hidden flex-shrink-0 items-center rounded-full border border-neutral-300 bg-white p-0.5 text-xs font-semibold sm:inline-flex dark:border-neutral-700 dark:bg-neutral-900"
    >
      <LangPill
        active={currentLocale === "en"}
        onClick={() => pickLocale("en")}
        label="EN"
        ariaLabel="Switch to English"
      />
      <LangPill
        active={currentLocale === "bg"}
        onClick={() => pickLocale("bg")}
        label="BG"
        ariaLabel="Превключи на български"
      />
    </div>
  );
}

/**
 * Mobile-sheet variant of the toggle. Same cookie semantics; rendered
 * full-width inside the slide-down menu so BG visitors who didn't
 * notice the desktop toggle can still find the switcher on phone.
 */
export function LanguageToggleMobile({
  currentLocale,
  onSwitched,
}: {
  currentLocale: Locale;
  onSwitched?: () => void;
}) {
  function pickLocale(locale: Locale) {
    if (locale === currentLocale) return;
    setLocaleCookie(locale);
    onSwitched?.();
    window.location.reload();
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-950">
      <LangPill
        active={currentLocale === "en"}
        onClick={() => pickLocale("en")}
        label="English"
        ariaLabel="Switch to English"
        full
      />
      <LangPill
        active={currentLocale === "bg"}
        onClick={() => pickLocale("bg")}
        label="Български"
        ariaLabel="Превключи на български"
        full
      />
    </div>
  );
}

function LangPill({
  active,
  onClick,
  label,
  ariaLabel,
  full,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  ariaLabel: string;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`inline-flex items-center justify-center rounded-full px-3 py-1 transition-colors ${
        full ? "flex-1 py-2 text-sm" : ""
      } ${
        active
          ? "bg-blue-600 text-white"
          : "text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Write the locale cookie. Path `/` so it applies to every route, and
 * 1 year so the visitor's choice survives across visits. Same-site=Lax
 * keeps it stripped from cross-site embeds without breaking normal
 * top-level navigation.
 */
function setLocaleCookie(locale: Locale) {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${oneYear}; SameSite=Lax`;
}
