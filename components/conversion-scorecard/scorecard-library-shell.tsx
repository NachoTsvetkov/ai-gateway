import Link from "next/link";
import type { ReactNode } from "react";
import { TrackerDownloadButton } from "components/conversion-scorecard/tracker-download-button";
import {
  LIBRARY_BASE_PATH,
  LIBRARY_LOGOUT_PATH,
} from "lib/digital-product-access";
import { LIBRARY_SECTIONS } from "lib/conversion-scorecard/content";
const NAV = [
  { href: LIBRARY_BASE_PATH, label: "Start Here", exact: true },
  ...LIBRARY_SECTIONS.map((s) => ({
    href: `${LIBRARY_BASE_PATH}/${s.slug}`,
    label: s.title,
    exact: false,
  })),
];

export function ScorecardLibraryShell({
  children,
  currentPath,
  title,
  subtitle,
  showTrackerDownload = true,
}: {
  children: ReactNode;
  currentPath: string;
  title?: string;
  subtitle?: string;
  showTrackerDownload?: boolean;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Shop Fix Scorecard
            </p>
            {title && (
              <h1 className="mt-1 text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            {showTrackerDownload ? (
              <TrackerDownloadButton className="inline-flex min-h-11 items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 transition-colors hover:border-emerald-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100" />
            ) : null}
            <a
              href={LIBRARY_LOGOUT_PATH}
              className="text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-700 hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
            >
              Sign out
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr]">
        <nav
          aria-label="Scorecard sections"
          className="lg:sticky lg:top-6 lg:self-start"
        >
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
            {NAV.map((item) => {
              const active = item.exact
                ? currentPath === item.href
                : currentPath.startsWith(item.href);
              return (
                <li key={item.href} className="shrink-0 lg:shrink">
                  <Link
                    href={item.href}
                    className={`block whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:whitespace-normal ${
                      active
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                        : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
