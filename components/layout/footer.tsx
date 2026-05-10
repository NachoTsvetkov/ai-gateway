import Link from "next/link";

import FooterMenu from "components/layout/footer-menu";
import LogoSquare from "components/logo-square";
import { getMenu } from "lib/shopify";
import { Suspense } from "react";

const { COMPANY_NAME, SITE_NAME } = process.env;

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : "");
  const skeleton = "w-full h-6 animate-pulse rounded-sm bg-neutral-300 dark:bg-neutral-700";
  const menu = await getMenu("next-js-frontend-footer-menu");
  const copyrightName = COMPANY_NAME || SITE_NAME || "";

  return (
    <footer className="bg-neutral-50 text-sm text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 border-t border-neutral-200 px-6 py-12 text-sm md:flex-row md:gap-12 md:px-4 min-[1320px]:px-0 dark:border-neutral-800">
        <div>
          <Link
            className="flex items-center gap-2 text-neutral-900 md:pt-1 dark:text-white"
            href="/"
          >
            <LogoSquare size="sm" />
            <span className="uppercase">{SITE_NAME}</span>
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="flex h-[188px] w-[200px] flex-col gap-2">
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
            </div>
          }
        >
          <FooterMenu menu={menu} />
        </Suspense>
        <div className="md:ml-auto">
          <a
            className="flex h-8 w-max flex-none items-center justify-center rounded-md border border-neutral-300 bg-neutral-100 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            aria-label="Deploy on Vercel"
            href="https://vercel.com/templates/next.js/nextjs-commerce"
          >
            <span className="px-3">▲</span>
            <hr className="h-full border-r border-neutral-300 dark:border-neutral-700" />
            <span className="px-3">Deploy</span>
          </a>
        </div>
      </div>

      <div className="border-t border-neutral-200 py-6 dark:border-neutral-800">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2 px-4 md:flex-row md:gap-0 min-[1320px]:px-0">
          <p className="text-neutral-500">
            &copy; {copyrightDate} {copyrightName}
            {copyrightName.length && !copyrightName.endsWith(".")
              ? "."
              : ""}{" "}
            All rights reserved.
          </p>
          <hr className="mx-4 hidden h-4 w-[1px] border-l border-neutral-300 md:inline-block dark:border-neutral-700" />
          <p>
            <a
              href="https://github.com/vercel/commerce"
              className="text-neutral-500 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              View the source
            </a>
          </p>
          <p className="mt-2 text-neutral-500 md:ml-auto md:mt-0">
            Next.js 16 · Shopify · OpenAI · Vercel AI SDK · Tailwind 4
          </p>
        </div>
      </div>

      <div className="border-t border-neutral-200 bg-neutral-100 py-5 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-center">
          <p className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
              <span className="font-semibold text-neutral-900 dark:text-white">
                Fiverr Portfolio Demo
              </span>
            </span>
            <span className="text-neutral-400 dark:text-neutral-600">&mdash;</span>
            <span className="text-neutral-600 dark:text-neutral-400">April 2026</span>
            <span className="hidden text-neutral-400 sm:inline dark:text-neutral-600">|</span>
            <span className="text-neutral-600 dark:text-neutral-400">
              Built by Full-Stack Software Engineer
            </span>
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-600">
            Live at{" "}
            <a
              href="https://ai-gateway-nine-nu.vercel.app"
              className="text-neutral-600 underline decoration-neutral-300 underline-offset-2 transition-colors hover:text-blue-600 dark:text-neutral-500 dark:decoration-neutral-700 dark:hover:text-blue-400"
            >
              ai-gateway-nine-nu.vercel.app
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
