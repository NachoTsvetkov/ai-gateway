import Link from "next/link";
import { ReactNode } from "react";

/**
 * Chrome for the KORE fitness studio demo
 * (`/projects/local-fitness-studio`).
 *
 * Visual identity is deliberately the opposite of the Curated. shop:
 * - Warm orange + cream + lime palette (no dark mode — light theme
 *   only, fitness studios usually trade on energy, not minimalism).
 * - Bold uppercase wordmark "KORE" with a minimalist barbell glyph.
 *   The earlier brand was "PULSE" but that name collided with the
 *   site's `animate-pulse` / `sales-launcher-pulse` keyframes, so the
 *   studio now leans on the Greek root for "core" — short, clean,
 *   distinctive in fitness branding.
 * - Footer is brand-shaped (location, classes, hours, social), not
 *   portfolio-shaped. A single quiet line at the bottom discloses
 *   that this is a demo so we don't pretend visitors can actually
 *   walk into a Sofia studio next Monday.
 *
 * Like the Curated shop, this route hides the global marketing navbar
 * via NavbarGate so the StudioNav is the only top bar on the page.
 */
export function KoreShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-orange-50 text-neutral-950 antialiased">
      <StudioNav />
      {children}
      <StudioFooter />
    </div>
  );
}

/**
 * Minimalist barbell glyph — five rounded rectangles forming the
 * silhouette of a loaded barbell. Replaces the previous lightning bolt
 * (which read too "PULSE-coded" — high-energy electric vs. KORE's more
 * grounded strength-coded identity). The glyph is intentionally
 * geometric; it reads at any size from the favicon up to the footer
 * wordmark.
 */
function KoreMark({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="9" width="3" height="6" rx="1" />
      <rect x="6" y="10.5" width="2" height="3" />
      <rect x="9" y="11.25" width="6" height="1.5" rx="0.5" />
      <rect x="16" y="10.5" width="2" height="3" />
      <rect x="19" y="9" width="3" height="6" rx="1" />
    </svg>
  );
}

function StudioNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-orange-200/70 bg-orange-50/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <Link
          href="/projects/local-fitness-studio"
          prefetch
          className="inline-flex items-center gap-2 text-xl font-black uppercase tracking-tight text-neutral-950 transition-opacity hover:opacity-80"
          aria-label="KORE — studio home"
        >
          <KoreMark className="h-5 w-5 text-orange-600" />
          KORE
        </Link>

        <ul className="hidden items-center gap-7 text-sm font-semibold text-neutral-700 md:flex">
          <li>
            <a
              href="#schedule"
              className="transition-colors hover:text-orange-600"
            >
              Schedule
            </a>
          </li>
          <li>
            <a
              href="#classes"
              className="transition-colors hover:text-orange-600"
            >
              Classes
            </a>
          </li>
          <li>
            <a
              href="#memberships"
              className="transition-colors hover:text-orange-600"
            >
              Memberships
            </a>
          </li>
          <li>
            <a
              href="#coaches"
              className="transition-colors hover:text-orange-600"
            >
              Coaches
            </a>
          </li>
        </ul>

        <a
          href="#book"
          className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-orange-600 sm:text-sm"
        >
          Book a class
        </a>
      </div>
    </nav>
  );
}

function StudioFooter() {
  return (
    <footer className="border-t border-orange-200/70 bg-orange-100/60">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link
              href="/projects/local-fitness-studio"
              className="inline-flex items-center gap-2 text-2xl font-black uppercase tracking-tight text-neutral-950"
            >
              <KoreMark className="h-6 w-6 text-orange-600" />
              KORE
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-700">
              Functional training, group classes, and 24/7 access in the heart
              of Sofia. Move better. Live louder.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-950">
              Studio
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-700">
              <li>ул. Граф Игнатиев 56</li>
              <li>1000 София, България</li>
              <li>Mon–Fri · 06:00 – 23:00</li>
              <li>Sat–Sun · 08:00 – 20:00</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-950">
              Visit
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-700">
              <li>
                <a href="#book" className="hover:text-orange-600">
                  Book a free trial
                </a>
              </li>
              <li>
                <a href="#schedule" className="hover:text-orange-600">
                  Class schedule
                </a>
              </li>
              <li>
                <a href="#memberships" className="hover:text-orange-600">
                  Memberships
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-orange-200/70 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} KORE Studio. Demo site —
            illustrative content only.
          </p>
          <p className="text-xs text-neutral-400">
            Built with Next.js · GPT-4o · Stripe · Calendar API
          </p>
        </div>
      </div>
    </footer>
  );
}
