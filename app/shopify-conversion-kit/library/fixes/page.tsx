import { ScorecardLibraryShell } from "components/conversion-scorecard/scorecard-library-shell";
import { AutoLinkedText } from "components/conversion-scorecard/auto-linked-text";
import { LEAK_FIXES } from "lib/conversion-scorecard/content";
import { LIBRARY_BASE_PATH } from "lib/digital-product-access";

export const metadata = {
  title: "5 Leak Playbooks",
  robots: { index: false, follow: false },
};

export default function FixesPage() {
  return (
    <ScorecardLibraryShell
      currentPath={`${LIBRARY_BASE_PATH}/fixes`}
      title="5 Leak Playbooks"
      subtitle="Fix one leak per session. Re-run the scorecard after each."
    >
      <div className="space-y-6">
        {LEAK_FIXES.map((leak) => (
          <article
            key={leak.id}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-4 dark:border-neutral-800 dark:bg-neutral-950/50">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Leak {leak.id}
              </p>
              <h2 className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                {leak.title}
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Symptom:{" "}
                </span>
                {leak.symptom}
              </p>
            </div>
            <div className="px-5 py-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Fix steps
              </h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
                {leak.steps.map((step) => (
                  <li key={step}>
                    <AutoLinkedText text={step} />
                  </li>
                ))}
              </ol>
              {leak.optional && (
                <p className="mt-4 rounded-lg bg-neutral-50 px-4 py-3 text-sm text-neutral-700 dark:bg-neutral-950 dark:text-neutral-300">
                  {leak.optional}
                </p>
              )}
              {leak.avoid && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">
                    Avoid
                  </h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700 dark:text-neutral-300">
                    {leak.avoid.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
                Success metric: {leak.metric}
              </p>
            </div>
          </article>
        ))}

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-bold text-neutral-900 dark:text-white">
            What to watch in Shopify Analytics
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="py-2 pr-4 font-semibold">Metric</th>
                  <th className="py-2 pr-4 font-semibold">Where</th>
                  <th className="py-2 font-semibold">Target</th>
                </tr>
              </thead>
              <tbody className="text-neutral-700 dark:text-neutral-300">
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="py-2 pr-4">Conversion rate</td>
                  <td className="py-2 pr-4">Analytics → Overview</td>
                  <td className="py-2">↑</td>
                </tr>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="py-2 pr-4">Checkout conversion</td>
                  <td className="py-2 pr-4">Analytics → Behavior</td>
                  <td className="py-2">↑</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Mobile vs desktop gap</td>
                  <td className="py-2 pr-4">Segments</td>
                  <td className="py-2">Gap narrows</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </ScorecardLibraryShell>
  );
}
