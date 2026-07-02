import Link from "next/link";
import { ScorecardLibraryShell } from "components/conversion-scorecard/scorecard-library-shell";
import { LIBRARY_BASE_PATH } from "lib/digital-product-access";
import {
  CONVERSION_KIT_CONTACT_URL,
  LIBRARY_SECTIONS,
  scorecardContactStep,
} from "lib/conversion-scorecard/content";

export const metadata = {
  title: "Your scorecard — start here",
  robots: { index: false, follow: false },
};

export default function ScorecardLibraryHubPage() {
  const contactStep = scorecardContactStep();

  return (
    <ScorecardLibraryShell
      currentPath={LIBRARY_BASE_PATH}
      title="Start here"
      subtitle="30 minutes to baseline, score, and pick your first fix."
    >
      <ol className="space-y-4">
        <li className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Step 0 · 5 min
          </p>
          <h2 className="mt-1 font-bold text-neutral-900 dark:text-white">
            Baseline in Shopify Analytics
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Analytics → Online store conversion. Note last 7 days: sessions,
            add-to-cart rate, checkout reached, purchase rate. Log in the
            tracker CSV.
          </p>
        </li>

        {LIBRARY_SECTIONS.map((section) => (
          <li key={section.slug}>
            <Link
              href={`${LIBRARY_BASE_PATH}/${section.slug}`}
              className={`block rounded-2xl border p-5 transition-colors hover:border-emerald-400 ${
                section.slug === "scorecard"
                  ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20"
                  : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Step {section.step}
              </p>
              <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">
                {section.title}
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {section.description}
              </p>
              <span className="mt-3 inline-block text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                Open →
              </span>
            </Link>
          </li>
        ))}

        <li>
          <a
            href={CONVERSION_KIT_CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-emerald-400 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Need a hand?
            </p>
            <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">
              {contactStep.label}
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {contactStep.why}
            </p>
            <span className="mt-3 inline-block text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              Book a call →
            </span>
          </a>
        </li>
      </ol>
    </ScorecardLibraryShell>
  );
}
