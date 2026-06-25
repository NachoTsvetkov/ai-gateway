"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const GUIDE_PATH = "/guides/stop-losing-leads-while-you-sleep.pdf";
const STORAGE_KEY = "free-guide-exit-offer-dismissed";

type Props = {
  title: string;
  body: string;
  ctaLabel: string;
  giveawayLabel: string;
};

const SHOW_ON_PREFIXES = ["/", "/bundles/", "/free-ai-audits"];

export function FreeGuideExitOffer({
  title,
  body,
  ctaLabel,
  giveawayLabel,
}: Props) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  const shouldOffer =
    SHOW_ON_PREFIXES.some(
      (prefix) =>
        prefix === "/" ? pathname === "/" : pathname.startsWith(prefix),
    ) && pathname !== "/free-ai-audits/win-free-website";

  useEffect(() => {
    if (!shouldOffer) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY > 0) return;
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      setOpen(true);
    };

    document.addEventListener("mouseout", onMouseOut);
    return () => document.removeEventListener("mouseout", onMouseOut);
  }, [shouldOffer]);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-offer-title"
    >
      <div className="relative mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-lg p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
            />
          </svg>
        </button>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Free download
        </p>
        <h2
          id="exit-offer-title"
          className="mt-2 text-lg font-bold text-neutral-900 dark:text-white"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {body}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <a
            href={GUIDE_PATH}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
          >
            {ctaLabel}
          </a>
          <Link
            href="/free-ai-audits/win-free-website"
            onClick={dismiss}
            className="text-center text-sm font-medium text-blue-700 hover:text-blue-600 dark:text-blue-400"
          >
            {giveawayLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
