import Link from "next/link";

// Single source of truth for the discovery-call URL. Mirrors the value
// in app/page.tsx and components/ai/sales-assistant.tsx.
const CALENDLY_URL = "https://calendly.com/nacho-tsvetkov/30min";

/**
 * Sticky top bar for the sales-focused homepage.
 *
 * Layout (3-column flex, equal-flex sides for true geometric centring):
 *   - Left:   `flex-1` column. Wordmark "Nacho Tsvetkov" links to home.
 *             Sits at the left edge of its column (default alignment).
 *   - Center: content-sized "Money Generator for Small Businesses".
 *             Because the left and right columns are both `flex-1`,
 *             they share the remaining space equally — so this label
 *             sits on the page's geometric centre regardless of how
 *             wide the side clusters are. Hidden below `lg` because at
 *             md (with the Projects + Services + Book Call cluster on
 *             the right) the right side outgrows its flex share and
 *             would overlap the centred label. At lg the cluster fits
 *             cleanly with breathing room either side.
 *   - Right:  `flex-1` column with `justify-end`. Holds the Projects
 *             link, Services link, and primary CTA. Mirror of the
 *             left column so the two side columns frame the centred
 *             label symmetrically when both their contents fit.
 *
 * Responsive notes (the right cluster is the main width driver):
 *   - <sm  (mobile):  hide Projects. iPhone SE (320px) only just fits
 *                     wordmark + Services + Book Call; adding a third
 *                     pill overflows. Projects is still discoverable
 *                     from the homepage and the AI chat.
 *   - sm–lg          : show Projects, hide centre label. Cluster +
 *                     wordmark fit comfortably; adding the centre on
 *                     top would overflow at md / be lopsided at lg.
 *   - lg+            : full nav (wordmark · centre · projects ·
 *                     services · book call). flex-1 sides keep the
 *                     centre on the page's geometric midline.
 */
export async function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-200/60 bg-white/85 backdrop-blur-lg dark:border-neutral-800/60 dark:bg-neutral-900/85">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-3 lg:px-6">
        {/* LEFT: equal-flex column anchoring the wordmark to the
            left edge while contributing the same width as the right
            column to the page's centre-of-mass calculation. */}
        <div className="flex flex-1">
          <Link
            href="/"
            prefetch={true}
            className="text-base font-bold tracking-tight text-neutral-900 transition-colors hover:text-blue-600 sm:text-lg dark:text-white dark:hover:text-blue-400"
          >
            Nacho Tsvetkov
          </Link>
        </div>

        {/* CENTER: content-sized so equal-flex sides frame it on the
            true geometric centre. `whitespace-nowrap` keeps the line
            intact at every breakpoint where the label is shown.
            See the layout comment above for the lg-vs-md trade-off. */}
        <p className="hidden whitespace-nowrap text-sm font-bold tracking-tight text-neutral-900 lg:block dark:text-white">
          Money Generator for{" "}
          <span className="text-blue-600 dark:text-blue-400">
            Small Businesses
          </span>
        </p>

        {/* RIGHT: mirror of the left column. `justify-end` pins its
            children to the right edge of the column, so visually the
            cluster sits at the right edge of the nav. */}
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          {/* Projects link — hidden on phones because at <sm the
              wordmark + 3 pills overflow narrow viewports
              (e.g. iPhone SE at 320px). Same visual treatment as
              Services so they read as a paired secondary nav. */}
          <Link
            href="/projects"
            prefetch={true}
            className="hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:inline-flex sm:px-3 sm:py-2 sm:text-sm dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            Projects
          </Link>

          <Link
            href="/services"
            prefetch={true}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:px-3 sm:py-2 sm:text-sm dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            Services
          </Link>

          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 sm:px-4 sm:py-2 sm:text-sm"
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
      </div>
    </nav>
  );
}
