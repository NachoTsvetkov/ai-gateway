"use client";

// Default-deny consent banner. Renders only on the first visit (no
// cookie set) and disappears once the visitor clicks either action.
// The choice persists for 365 days; clearing site data resurfaces it.
//
// Visual sits at the bottom of the viewport, max-w-2xl, so it never
// dominates the layout but is impossible to miss. Both buttons are
// real focusable elements (no DIV-with-onClick) so keyboard users
// can navigate Tab → Reject / Accept naturally.

import { useEffect, useState } from "react";

import {
  readConsentClient,
  writeConsentClient,
} from "lib/pixel/consent";

type Props = {
  acceptLabel: string;
  rejectLabel: string;
  message: string;
  /** Localized aria-label for the dialog wrapper. */
  ariaLabel: string;
};

export function ConsentBanner({
  acceptLabel,
  rejectLabel,
  message,
  ariaLabel,
}: Props) {
  // SSR-safe: start hidden, then re-evaluate from the cookie on
  // mount. Showing the banner during SSR would briefly flash for
  // every visitor (including those who already chose) until the
  // hydration check ran.
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(readConsentClient() === null);
  }, []);

  if (!show) return null;

  const dismiss = (value: "accepted" | "rejected") => {
    writeConsentClient(value);
    setShow(false);
  };

  return (
    <div
      role="dialog"
      aria-label={ariaLabel}
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 rounded-2xl border border-neutral-200 bg-white/95 p-4 shadow-xl backdrop-blur-md sm:p-5 dark:border-neutral-700 dark:bg-neutral-900/95"
    >
      <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
        {message}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => dismiss("rejected")}
          className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-600 dark:text-neutral-200 dark:hover:border-neutral-400 dark:hover:text-white"
        >
          {rejectLabel}
        </button>
        <button
          type="button"
          onClick={() => dismiss("accepted")}
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-colors hover:bg-blue-500"
        >
          {acceptLabel}
        </button>
      </div>
    </div>
  );
}
