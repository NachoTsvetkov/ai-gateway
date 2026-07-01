import Link from "next/link";

type Props = {
  className?: string;
};

/** Shared legal microcopy for digital product purchase surfaces. */
export function DigitalProductLegalNotice({ className = "" }: Props) {
  return (
    <p
      className={`text-xs leading-relaxed text-neutral-500 dark:text-neutral-500 ${className}`}
    >
      By purchasing you agree to the{" "}
      <Link
        href="/conversion-kit-terms"
        className="font-semibold text-neutral-700 underline-offset-2 hover:underline dark:text-neutral-300"
      >
        Conversion Kit Terms
      </Link>
      . 7-day refund if the audit finds fewer than 3 actionable leaks.{" "}
      <Link
        href="/privacy-policy"
        className="font-semibold text-neutral-700 underline-offset-2 hover:underline dark:text-neutral-300"
      >
        Privacy policy
      </Link>
      .
    </p>
  );
}
