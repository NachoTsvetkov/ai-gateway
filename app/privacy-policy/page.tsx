import type { Metadata } from "next";

import {
  PRIVACY_POLICY,
  PRIVACY_POLICY_LAST_UPDATED,
} from "lib/legal/privacy-policy-content";
import { createT, tr } from "lib/i18n/locale";
import { detectLocale } from "lib/i18n/locale.server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLocale();
  return {
    title: tr(PRIVACY_POLICY.metaTitle, locale),
    description: tr(PRIVACY_POLICY.metaDescription, locale),
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPolicyPage() {
  const locale = await detectLocale();
  const t = createT(locale);

  const lastUpdatedLabel =
    locale === "bg"
      ? `Последна актуализация: ${PRIVACY_POLICY_LAST_UPDATED}.`
      : `Last updated: ${PRIVACY_POLICY_LAST_UPDATED}.`;

  return (
    <article>
      <h1 className="mb-6 text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
        {t(PRIVACY_POLICY.title)}
      </h1>
      <p className="mb-10 text-base leading-7 text-neutral-700 dark:text-neutral-300">
        {t(PRIVACY_POLICY.intro)}
      </p>

      <div className="space-y-10">
        {PRIVACY_POLICY.sections.map((section) => (
          <section key={section.id} aria-labelledby={`privacy-${section.id}`}>
            <h2
              id={`privacy-${section.id}`}
              className="mb-3 text-xl font-semibold text-neutral-900 dark:text-white"
            >
              {t(section.title)}
            </h2>
            {section.paragraphs?.map((paragraph, i) => (
              <p
                key={i}
                className="mb-3 text-base leading-7 text-neutral-700 dark:text-neutral-300"
              >
                {t(paragraph)}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-2 list-disc space-y-2 pl-6 text-base leading-7 text-neutral-700 dark:text-neutral-300">
                {section.bullets.map((bullet, i) => (
                  <li key={i}>{t(bullet)}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="mt-12 text-sm italic text-neutral-500 dark:text-neutral-500">
        {lastUpdatedLabel}
      </p>
    </article>
  );
}
