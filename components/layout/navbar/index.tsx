"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LanguageToggle,
  LanguageToggleMobile,
} from "components/layout/language-toggle";
import {
  ThemeToggle,
  ThemeToggleMobile,
} from "components/layout/theme-toggle";
import { type Locale } from "lib/i18n/locale";
import { type Theme } from "lib/theme/theme";

// Single source of truth for the discovery-call URL. Mirrors the value
// in app/page.tsx and components/ai/sales-assistant.tsx.
const CALENDLY_URL = "https://calendly.com/nacho-tsvetkov/30min";

/**
 * Sticky top bar for the sales-focused homepage. Receives all visible
 * strings from the server layout so the navbar is locale-agnostic —
 * the Server Component upstream resolves the visitor's locale via
 * `detectLocale()` and threads the right copy down.
 *
 * The "Money Generator for Small Businesses" tagline is the brand
 * positioning line and is visible at every breakpoint — this is the
 * one piece of the nav we never hide. The wordmark and secondary
 * nav adapt around it. See the file's previous header for the full
 * breakpoint breakdown.
 *
 * Locale toggle: rendered ONLY when `showLanguageToggle` is true,
 * which the layout sets when the visitor's geo header is `BG`. Outside
 * Bulgaria, the toggle never appears.
 */
export type NavbarLabels = {
  wordmark: string;
  taglineLead: string;
  taglineHighlight: string;
  projects: string;
  services: string;
  bookFull: string;
  bookMid: string;
  bookShort: string;
  homeLabel: string;
  ariaSiteNav: string;
  ariaOpenMenu: string;
  ariaCloseMenu: string;
};

export function Navbar({
  labels,
  locale,
  theme,
  showLanguageToggle,
}: {
  labels: NavbarLabels;
  locale: Locale;
  theme: Theme;
  showLanguageToggle: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close the mobile sheet whenever the visitor navigates.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // While the sheet is open: lock body scroll, listen for Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-neutral-200/60 bg-white/85 backdrop-blur-lg dark:border-neutral-800/60 dark:bg-neutral-900/85">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 lg:px-6">
          <div className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label={labels.ariaOpenMenu}
              aria-expanded={isOpen}
              aria-controls="primary-nav-menu"
              className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:hidden dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <Link
              href="/"
              prefetch={true}
              className="hidden text-base font-bold tracking-tight text-neutral-900 transition-colors hover:text-blue-600 sm:inline-flex sm:text-lg dark:text-white dark:hover:text-blue-400"
            >
              {labels.wordmark}
            </Link>
          </div>

          <p className="flex flex-1 justify-center text-center text-[10px] font-bold leading-tight tracking-tight text-neutral-900 sm:text-sm dark:text-white">
            <span className="sm:whitespace-nowrap">
              {labels.taglineLead}{" "}
              <span className="block sm:inline">
                <span className="text-blue-600 dark:text-blue-400">
                  {labels.taglineHighlight}
                </span>
              </span>
            </span>
          </p>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
            <Link
              href="/projects"
              prefetch={true}
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:inline-flex dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              {labels.projects}
            </Link>

            <Link
              href="/services"
              prefetch={true}
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:inline-flex dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              {labels.services}
            </Link>

            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 sm:px-4 sm:py-2 sm:text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.75A2.75 2.75 0 0 1 18.5 6.75v8.5A2.75 2.75 0 0 1 15.75 18H4.25A2.75 2.75 0 0 1 1.5 15.25v-8.5A2.75 2.75 0 0 1 4.25 4H5V2.75A.75.75 0 0 1 5.75 2ZM3 8.5h14V6.75A1.25 1.25 0 0 0 15.75 5.5H4.25A1.25 1.25 0 0 0 3 6.75V8.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden lg:inline">{labels.bookFull}</span>
              <span className="hidden sm:inline lg:hidden">
                {labels.bookMid}
              </span>
              <span className="sm:hidden">{labels.bookShort}</span>
            </a>
          </div>
        </div>

        {/* Desktop floating-pill rail — pulled out of the inline nav
            row and absolutely positioned to "hang" below the navbar.
            Two reasons:
              1. Keeps the navbar's height fixed regardless of whether
                 a pill is visible (BG visitors got a slightly taller
                 bar than EN visitors before this).
              2. Lets the pills float into the page content with a
                 subtle visual lift, signalling these are one-off
                 affordances rather than primary nav items.
            The outer wrapper mirrors the inner row's max-w-7xl + px
            so the pills align horizontally with the wordmark / CTA
            above them on every viewport width.

            Layout: theme pill anchored LEFT (always visible — every
            visitor can switch theme), language pill anchored RIGHT
            (only mounted for BG traffic). When the language pill is
            absent the theme pill still sits on the left as expected.
            Mobile gets both pills inside the menu sheet instead. */}
        <div className="pointer-events-none absolute inset-x-0 top-full hidden sm:block">
          <div className="mx-auto flex max-w-7xl items-start justify-between gap-3 px-3 sm:px-4 lg:px-6">
            <div className="pointer-events-auto mt-1.5">
              <ThemeToggle currentTheme={theme} />
            </div>
            {showLanguageToggle ? (
              <div className="pointer-events-auto mt-1.5">
                <LanguageToggle currentLocale={locale} />
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      <MobileMenuSheet
        open={isOpen}
        onClose={() => setIsOpen(false)}
        labels={labels}
        locale={locale}
        theme={theme}
        showLanguageToggle={showLanguageToggle}
      />
    </>
  );
}

function MobileMenuSheet({
  open,
  onClose,
  labels,
  locale,
  theme,
  showLanguageToggle,
}: {
  open: boolean;
  onClose: () => void;
  labels: NavbarLabels;
  locale: Locale;
  theme: Theme;
  showLanguageToggle: boolean;
}) {
  return (
    <div
      id="primary-nav-menu"
      role="dialog"
      aria-modal="true"
      aria-label={labels.ariaSiteNav}
      data-open={open || undefined}
      className="pointer-events-none fixed inset-0 top-14 z-30 sm:hidden"
    >
      <button
        type="button"
        aria-label={labels.ariaCloseMenu}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        data-open={open || undefined}
        className="absolute inset-0 cursor-default bg-neutral-950/50 opacity-0 backdrop-blur-sm transition-opacity duration-200 data-[open]:pointer-events-auto data-[open]:opacity-100"
      />

      <div
        data-open={open || undefined}
        className="relative -translate-y-2 opacity-0 transition-[transform,opacity] duration-200 ease-out data-[open]:pointer-events-auto data-[open]:translate-y-0 data-[open]:opacity-100"
      >
        <div className="mx-3 mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/15 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 px-5 pt-5 pb-4 dark:border-neutral-800">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              {labels.wordmark}
            </p>
            <p className="mt-1 text-sm leading-snug text-neutral-600 dark:text-neutral-400">
              {labels.taglineLead}{" "}
              <span className="font-semibold text-neutral-900 dark:text-white">
                {labels.taglineHighlight}
              </span>
            </p>
          </div>

          <ul className="px-2 py-2">
            {[
              { href: "/", label: labels.homeLabel },
              { href: "/projects", label: labels.projects },
              { href: "/services", label: labels.services },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={true}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-base font-semibold text-neutral-800 transition-colors hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  {item.label}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    className="h-4 w-4 text-neutral-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>

          {/* Theme toggle row — always mounted. Sits above the
              language toggle (when present) and above the primary CTA
              so the visitor sees both switches without scrolling. */}
          <div className="border-t border-neutral-100 px-3 pt-3 pb-1 dark:border-neutral-800">
            <ThemeToggleMobile currentTheme={theme} onSwitched={onClose} />
          </div>

          {/* Language toggle row — only mounted for BG visitors. */}
          {showLanguageToggle && (
            <div className="px-3 pt-2 pb-1">
              <LanguageToggleMobile
                currentLocale={locale}
                onSwitched={onClose}
              />
            </div>
          )}

          <div className="border-t border-neutral-100 p-3 dark:border-neutral-800">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.75A2.75 2.75 0 0 1 18.5 6.75v8.5A2.75 2.75 0 0 1 15.75 18H4.25A2.75 2.75 0 0 1 1.5 15.25v-8.5A2.75 2.75 0 0 1 4.25 4H5V2.75A.75.75 0 0 1 5.75 2ZM3 8.5h14V6.75A1.25 1.25 0 0 0 15.75 5.5H4.25A1.25 1.25 0 0 0 3 6.75V8.5Z"
                  clipRule="evenodd"
                />
              </svg>
              {labels.bookFull}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
