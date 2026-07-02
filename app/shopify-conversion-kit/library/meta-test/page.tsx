import { ScorecardLibraryShell } from "components/conversion-scorecard/scorecard-library-shell";
import { META_TEST_PLAN } from "lib/conversion-scorecard/content";
import { LIBRARY_BASE_PATH } from "lib/digital-product-access";

export const metadata = {
  title: "$300 Meta test plan",
  robots: { index: false, follow: false },
};

export default function MetaTestPage() {
  return (
    <ScorecardLibraryShell
      currentPath={`${LIBRARY_BASE_PATH}/meta-test`}
      title={META_TEST_PLAN.title}
      subtitle={META_TEST_PLAN.intro}
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-bold text-neutral-900 dark:text-white">
            Economics &amp; kill rules
          </h2>
          <dl className="mt-4 space-y-3">
            {META_TEST_PLAN.economics.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 border-b border-neutral-100 pb-3 last:border-0 last:pb-0 sm:flex-row sm:justify-between dark:border-neutral-800"
              >
                <dt className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {row.label}
                </dt>
                <dd className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
          <h2 className="font-bold text-neutral-900 dark:text-white">
            After $150 spent
          </h2>
          <ul className="mt-4 space-y-4">
            {META_TEST_PLAN.after150.map((row) => (
              <li
                key={row.purchases}
                className="rounded-xl border border-amber-200/80 bg-white/80 p-4 dark:border-amber-900/30 dark:bg-neutral-900/50"
              >
                <p className="font-mono text-sm font-bold text-amber-900 dark:text-amber-300">
                  {row.purchases} purchases
                </p>
                <p className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">
                  {row.action}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-bold text-neutral-900 dark:text-white">
            Campaign structure
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-700 dark:text-neutral-300">
            {META_TEST_PLAN.structure.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <h2 className="font-bold text-neutral-900 dark:text-white">
            Reels hook to test first
          </h2>
          <p className="mt-3 text-lg font-semibold leading-snug text-neutral-900 dark:text-white">
            &ldquo;{META_TEST_PLAN.reelHook}&rdquo;
          </p>
        </section>
      </div>
    </ScorecardLibraryShell>
  );
}
