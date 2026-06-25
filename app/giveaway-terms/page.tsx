import type { Metadata } from "next";
import Link from "next/link";

import {
  GIVEAWAY_TERMS,
  GIVEAWAY_TERMS_LAST_UPDATED,
} from "lib/legal/giveaway-terms-content";

export const metadata: Metadata = {
  title: GIVEAWAY_TERMS.metaTitle,
  description: GIVEAWAY_TERMS.metaDescription,
  robots: { index: true, follow: true },
};

export default function GiveawayTermsPage() {
  return (
    <article>
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
        {GIVEAWAY_TERMS.title}
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Last updated: {GIVEAWAY_TERMS_LAST_UPDATED}
      </p>

      <div className="mb-10 rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-sm leading-6 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
        <p className="font-semibold text-neutral-900 dark:text-white">
          Organizer: {GIVEAWAY_TERMS.organizer.name}
        </p>
        <p>{GIVEAWAY_TERMS.organizer.role}</p>
        <p>{GIVEAWAY_TERMS.organizer.location}</p>
        <p>
          Email:{" "}
          <a
            href={`mailto:${GIVEAWAY_TERMS.organizer.email}`}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            {GIVEAWAY_TERMS.organizer.email}
          </a>
        </p>
        <p>
          Website:{" "}
          <a
            href={GIVEAWAY_TERMS.organizer.website}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            {GIVEAWAY_TERMS.organizer.website}
          </a>
        </p>
        <p className="mt-3">
          Giveaway page:{" "}
          <Link
            href={GIVEAWAY_TERMS.giveawayPagePath}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            nachotsvetkov.com{GIVEAWAY_TERMS.giveawayPagePath}
          </Link>
        </p>
      </div>

      <div className="space-y-10">
        {GIVEAWAY_TERMS.sections.map((section) => (
          <section key={section.id} aria-labelledby={`giveaway-terms-${section.id}`}>
            <h2
              id={`giveaway-terms-${section.id}`}
              className="mb-3 text-xl font-semibold text-neutral-900 dark:text-white"
            >
              {section.title}
            </h2>
            {section.paragraphs?.map((paragraph, i) => (
              <p
                key={i}
                className="mb-3 text-base leading-7 text-neutral-700 dark:text-neutral-300"
              >
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-2 list-disc space-y-2 pl-6 text-base leading-7 text-neutral-700 dark:text-neutral-300">
                {section.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="mt-10 text-base leading-7 text-neutral-700 dark:text-neutral-300">
        {GIVEAWAY_TERMS.acknowledgment}
      </p>

      <p className="mt-6 text-base leading-7 text-neutral-700 dark:text-neutral-300">
        For full privacy details, see our{" "}
        <Link href="/privacy-policy" className="text-blue-600 hover:underline dark:text-blue-400">
          Privacy Policy
        </Link>
        .
      </p>

      <p className="mt-12 text-sm italic text-neutral-500 dark:text-neutral-500">
        {GIVEAWAY_TERMS.footerNote}
      </p>
    </article>
  );
}
