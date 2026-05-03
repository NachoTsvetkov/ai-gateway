import Link from "next/link";
import { detectLocale } from "lib/i18n/locale.server";
import { createT } from "lib/i18n/locale";
import { DICT } from "lib/i18n/dict";
import { getLocalizedProjects } from "lib/projects-data";

// Locale-aware metadata. Static `export const metadata` would always
// render in English even for BG visitors, leaking "Projects" into the
// <title> and og tags on a fully-translated page. `generateMetadata`
// runs at request time so the head matches the body.
export async function generateMetadata() {
  const locale = await detectLocale();
  const t = createT(locale);
  return {
    title: t(DICT.projects.metaTitle),
    description: t(DICT.projects.metaDescription),
  };
}

/**
 * Project listing page. Each project card links out to its own
 * standalone demo (KORE warm orange, ROZÉ cream + blush, Curated.
 * blue, etc.) — but the listing here intentionally stays uniform.
 * Mixing nine different brand colours on one grid reads as "templated
 * card collection" rather than "nine distinct sites", which is the
 * opposite of the effect we want; the visual identity each project
 * carries lives behind its own click.
 *
 * Locale model: server component pulls `detectLocale()` and feeds it
 * into `getLocalizedProjects()` (overlays BG copy from
 * `lib/projects-data.bg.ts`) + `createT()` for page chrome strings.
 * Tech-stack chips stay in English on every locale — they're product
 * names that read identically in any language.
 */
export default async function ProjectsPage() {
  const locale = await detectLocale();
  const t = createT(locale);
  const projects = getLocalizedProjects(locale);

  return (
    <>
      <section className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                clipRule="evenodd"
              />
            </svg>
            {t(DICT.projects.backToHome)}
          </Link>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            {t(DICT.projects.pageTitle)}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-neutral-400">
            {t(DICT.projects.intro)}
          </p>
        </div>
      </section>

      <section className="bg-neutral-50 py-16 dark:bg-neutral-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={project.href}
              // Each demo lives behind its own brand chrome (KORE,
              // ROZÉ, Curated.) and the global navbar is hidden on
              // those routes. Opening in a new tab keeps the visitor
              // anchored on the portfolio so they can come back
              // without "where am I?" confusion. The trailing arrow
              // icon is also swapped for an external-link glyph so
              // the affordance matches the behaviour.
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} ${t(
                DICT.projects.cardOpensInNewTab,
              )}`}
              className="group relative flex overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
            >
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {t(DICT.projects.statusLive)}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    className="h-5 w-5 text-neutral-400 transition-transform group-hover:scale-110 group-hover:text-neutral-700 dark:group-hover:text-neutral-300"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {project.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {project.description}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  {project.tech.map((label) => (
                    <span
                      key={label}
                      className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
