import type { Metadata } from "next";

import Prose from "components/prose";
import { getPage } from "lib/shopify";
import { notFound } from "next/navigation";

export async function generateMetadata(props: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = await getPage(params.page);

  if (!page) return notFound();

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.bodySummary,
    openGraph: {
      publishedTime: page.createdAt,
      modifiedTime: page.updatedAt,
      type: "article",
    },
  };
}

export default async function Page(props: {
  params: Promise<{ page: string }>;
}) {
  const params = await props.params;
  // Prevent the dynamic marketing [page] route from catching /api/* or other internal paths
  // (ensures API routes like /api/orders take precedence; without this some dev setups with [page] catch-all
  // and experimental features can cause 404 "page not found" for API GETs).
  if (params.page === 'api' || params.page.startsWith('api')) {
    notFound();
  }
  const page = await getPage(params.page);

  if (!page) return notFound();

  return (
    <>
      <h1 className="mb-8 text-5xl font-bold">{page.title}</h1>
      <Prose className="mb-8" html={page.body} />
      <p className="text-sm italic">
        {`This document was last updated on ${new Intl.DateTimeFormat(
          undefined,
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        ).format(new Date(page.updatedAt))}.`}
      </p>
    </>
  );
}
