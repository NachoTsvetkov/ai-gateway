import type { Metadata } from "next";

import { PROJECTS } from "lib/projects-data";

const CANONICAL = "https://nachotsvetkov.com/demos";
const TITLE = "Demos";
const DESCRIPTION = "Labelled demo pages on this site.";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "website",
    images: [
      {
        url: "https://nachotsvetkov.com/opengraph-image",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function DemosPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
        Demos
      </h1>
      <p className="mt-3 text-base text-neutral-600">
        Labelled demo pages on this site.
      </p>
      <ul className="mt-10 space-y-6">
        {PROJECTS.map((project) => (
          <li
            key={project.id}
            className="border-t border-neutral-200 pt-6 first:border-t-0 first:pt-0"
          >
            <a
              href={project.href}
              className="text-lg font-semibold text-neutral-900 underline-offset-2 hover:underline"
            >
              {project.title}
            </a>
            {project.tech.length > 0 ? (
              <p className="mt-2 text-sm text-neutral-600">
                {project.tech.join(" · ")}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
