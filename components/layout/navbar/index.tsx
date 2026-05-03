"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Single source of truth for the discovery-call URL. Mirrors the value
// in app/page.tsx and components/ai/sales-assistant.tsx.
const CALENDLY_URL = "https://calendly.com/nacho-tsvetkov/30min";

/**
 * Sticky top bar for the sales-focused homepage.
 *
 * The "Money Generator for Small Businesses" tagline is the brand
 * positioning line and is visible at every breakpoint — this is the
 * one piece of the nav we never hide. The wordmark and secondary
 * nav adapt around it:
 *
 *   - <sm  (mobile):  hamburger button replaces the wordmark; nav
 *                     links live inside a slide-down menu sheet. The
 *                     primary "Book Call" CTA stays in the bar so the
 *                     conversion path is one tap from anywhere.
 *   - sm–lg          : wordmark + centre tagline + Projects /
 *                     Services / Book Call cluster (no hamburger).
 *   - lg+            : full-text "Book Discovery Call" CTA.
 *
 * The centre tagline stacks to two lines on mobile (text-[10px],
 * leading-tight) and collapses to one line at sm+ (text-sm
 * whitespace-nowrap). That gives us enough horizontal room for
 * hamburger + tagline + Book CTA on iPhone-SE-class viewports.
 *
 * This component is a Client Component because the hamburger menu
 * needs local state (open/closed), Escape-to-close, and
 * close-on-route-change behaviour.
 */
export function Navbar() {
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
          {/* LEFT: hamburger on mobile, wordmark on sm+. Equal-flex
              column lets the centre tagline sit on the page's true
              geometric midline regardless of the right cluster's
              size. */}
          <div className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Open navigation menu"
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
              Nacho Tsvetkov
            </Link>
          </div>

          {/* CENTER: brand tagline. Visible at every breakpoint — the
              one thing that always stays. Mobile: 2-line stack at
              text-[10px] so it fits next to the hamburger + Book
              CTA on a 320px viewport. Desktop: single line at
              text-sm. */}
          <p className="flex flex-1 justify-center text-center text-[10px] font-bold leading-tight tracking-tight text-neutral-900 sm:text-sm dark:text-white">
            <span className="sm:whitespace-nowrap">
              Money Generator{" "}
              <span className="block sm:inline">
                for{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  Small Businesses
                </span>
              </span>
            </span>
          </p>

          {/* RIGHT: secondary nav (sm+) + primary CTA (always). The
              Projects/Services links live inside the hamburger sheet
              on mobile, so we don't render them here below sm. */}
          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
            <Link
              href="/projects"
              prefetch={true}
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:inline-flex dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              Projects
            </Link>

            <Link
              href="/services"
              prefetch={true}
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:inline-flex dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              Services
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
              <span className="hidden lg:inline">Book Discovery Call</span>
              <span className="hidden sm:inline lg:hidden">Book Call</span>
              <span className="sm:hidden">Book</span>
            </a>
          </div>
        </div>
      </nav>

      <MobileMenuSheet open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

/**
 * Slide-down mobile navigation sheet. Anchors below the sticky nav
 * (top-14 to clear the bar height) and uses CSS-only transitions
 * driven by a `data-open` boolean — no library dependency.
 *
 * Behaviour the parent already wires:
 *   - Auto-closes on route change (parent's pathname effect).
 *   - Closes on Escape (parent's keydown listener).
 *   - Locks body scroll while open (parent's overflow effect).
 *
 * Behaviour this component owns:
 *   - Click on backdrop closes.
 *   - Click on any link closes (so the link's navigation runs while
 *     the sheet is animating out).
 */
function MobileMenuSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // While closed we still render the sheet (with `pointer-events: none`
  // and zero opacity) so its CSS transition runs in both directions.
  return (
    <div
      id="primary-nav-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      data-open={open || undefined}
      className="pointer-events-none fixed inset-0 top-14 z-30 sm:hidden"
    >
      {/* Backdrop — dimmed page underneath. The whole layer is the
          click-to-close target. The parent has pointer-events-none
          so we explicitly opt back in here only when open, which
          means clicks pass through to the page while we're animating
          out / closed. */}
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        data-open={open || undefined}
        className="absolute inset-0 cursor-default bg-neutral-950/50 opacity-0 backdrop-blur-sm transition-opacity duration-200 data-[open]:pointer-events-auto data-[open]:opacity-100"
      />

      {/* Sheet panel */}
      <div
        data-open={open || undefined}
        className="relative -translate-y-2 opacity-0 transition-[transform,opacity] duration-200 ease-out data-[open]:pointer-events-auto data-[open]:translate-y-0 data-[open]:opacity-100"
      >
        <div className="mx-3 mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/15 dark:border-neutral-800 dark:bg-neutral-900">
          {/* Header — brand identity, replaces the desktop wordmark
              that the visitor doesn't see while on mobile. */}
          <div className="border-b border-neutral-100 px-5 pt-5 pb-4 dark:border-neutral-800">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              Nacho Tsvetkov
            </p>
            <p className="mt-1 text-sm leading-snug text-neutral-600 dark:text-neutral-400">
              Money Generator for{" "}
              <span className="font-semibold text-neutral-900 dark:text-white">
                Small Businesses
              </span>
            </p>
          </div>

          {/* Nav links */}
          <ul className="px-2 py-2">
            {[
              { href: "/", label: "Home" },
              { href: "/projects", label: "Projects" },
              { href: "/services", label: "Services" },
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

          {/* Primary CTA — duplicates the bar's Book CTA at full
              width so the menu has a clear conversion call regardless
              of the visitor's position in the bar. */}
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
              Book Discovery Call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
