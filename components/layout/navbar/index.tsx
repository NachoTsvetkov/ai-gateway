import Link from "next/link";

// Single source of truth for the discovery-call URL. Mirrors the value
// in app/page.tsx and components/ai/sales-assistant.tsx.
const CALENDLY_URL = "https://calendly.com/nacho-tsvetkov/30min";

/**
 * Sticky top bar for the sales-focused homepage.
 *
 * Layout (mobile → desktop):
 *   - Left:   "Nacho Tsvetkov" wordmark, links back to home.
 *   - Center: bold framing line — "Money Generator for Small Businesses".
 *             Hidden below md to avoid wrapping; the bar still works
 *             without it.
 *   - Right:  primary CTA → opens Calendly in a new tab.
 *
 * No "Home" / "Projects" links: this is now a single-page sales site
 * and any internal navigation lives in the page itself (anchors).
 */
export async function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-200/60 bg-white/85 backdrop-blur-lg dark:border-neutral-800/60 dark:bg-neutral-900/85">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-3 lg:px-6">
        <Link
          href="/"
          prefetch={true}
          className="text-base font-bold tracking-tight text-neutral-900 transition-colors hover:text-blue-600 sm:text-lg dark:text-white dark:hover:text-blue-400"
        >
          Nacho Tsvetkov
        </Link>

        <p className="hidden flex-1 px-4 text-center text-sm font-bold tracking-tight text-neutral-900 md:block dark:text-white">
          Money Generator for{" "}
          <span className="text-blue-600 dark:text-blue-400">
            Small Businesses
          </span>
        </p>

        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 sm:px-4 sm:py-2 sm:text-sm md:ml-0"
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
          <span className="hidden sm:inline">Book Discovery Call</span>
          <span className="sm:hidden">Book Call</span>
        </a>
      </div>
    </nav>
  );
}
