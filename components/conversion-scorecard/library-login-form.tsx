"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CONVERSION_KIT_CONTACT_URL,
  CONVERSION_KIT_SUPPORT_EMAIL,
} from "lib/conversion-scorecard/content";
import { LIBRARY_BASE_PATH } from "lib/digital-product-access";

export function LibraryLoginForm({
  redirectTo = LIBRARY_BASE_PATH,
}: {
  redirectTo?: string;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showContactHelp, setShowContactHelp] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/conversion-scorecard/library-login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        window.location.href = redirectTo;
        return;
      }

      if (response.status === 401) {
        setShowContactHelp(true);
        setError(
          "No purchase found for that email. Use the same address you entered at checkout, or contact me to resolve access.",
        );
        return;
      }

      setShowContactHelp(false);
      setError("Something went wrong. Try again in a moment.");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[calc(100dvh-2rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          Private library
        </p>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
          Enter your email
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Use the email from checkout. We&apos;ll unlock the scorecard, fix
          playbooks, copy blocks, and Meta test plan.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="library-email"
              className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200"
            >
              Email
            </label>
            <input
              id="library-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setShowContactHelp(false);
                setError(null);
              }}
              placeholder="you@store.com"
              className="mt-2 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
            >
              <p>{error}</p>
              {showContactHelp ? (
                <div className="mt-3 space-y-2 border-t border-rose-200/80 pt-3 dark:border-rose-900/50">
                  <p className="font-medium text-rose-800 dark:text-rose-200">
                    Need help unlocking access?
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <a
                      href={`mailto:${CONVERSION_KIT_SUPPORT_EMAIL}?subject=Conversion%20scorecard%20library%20access`}
                      className="inline-flex min-h-10 items-center justify-center rounded-lg bg-white px-3 text-sm font-semibold text-rose-800 ring-1 ring-rose-200 transition-colors hover:bg-rose-50 dark:bg-rose-950/40 dark:text-rose-100 dark:ring-rose-800 dark:hover:bg-rose-950/60"
                    >
                      Email me
                    </a>
                    <a
                      href={CONVERSION_KIT_CONTACT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center justify-center rounded-lg bg-white px-3 text-sm font-semibold text-rose-800 ring-1 ring-rose-200 transition-colors hover:bg-rose-50 dark:bg-rose-950/40 dark:text-rose-100 dark:ring-rose-800 dark:hover:bg-rose-950/60"
                    >
                      Book a call
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-500 disabled:opacity-60"
          >
            {loading ? "Checking…" : "Open library →"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
          Haven&apos;t bought yet?{" "}
          <Link
            href="/shopify-conversion-kit"
            className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Get the scorecard
          </Link>
        </p>
      </div>
    </section>
  );
}
