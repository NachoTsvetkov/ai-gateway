import Link from "next/link";
import type { ScorecardNextStep } from "lib/conversion-scorecard/content";

export function ScorecardNextStepLink({
  step,
  index,
  className = "block rounded-lg border border-neutral-200 bg-white px-4 py-3 transition-colors hover:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-emerald-700",
}: {
  step: ScorecardNextStep;
  index: number;
  className?: string;
}) {
  const body = (
    <>
      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
        {index + 1}. {step.label} →
      </p>
      <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
        {step.why}
      </p>
    </>
  );

  if (step.external) {
    return (
      <a
        href={step.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={step.href} className={className}>
      {body}
    </Link>
  );
}
