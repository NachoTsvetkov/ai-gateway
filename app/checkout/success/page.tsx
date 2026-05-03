// /checkout/success — landing page after PayPal returns the buyer.
//
// PayPal hits this URL in two scenarios:
//   1. After our SDK-driven `onApprove` handler (Smart Buttons popup
//      flow). We redirect here client-side with ?type=order|subscription
//      &id=<paypal id>&ref=<buyable reference>.
//   2. After the buyer approves via PayPal's hosted approval. This is
//      the path PayPal uses on LIVE-on-localhost or whenever the SDK
//      falls back from postMessage to a top-level redirect. The
//      redirect lands here in a new tab with one of these param sets:
//        - Orders        : ?token=<orderId>&PayerID=<…>
//        - Subscriptions : ?subscription_id=I-…&ba_token=BA-…
//      We accept all of them and treat the presence of `subscription_id`
//      as a strong signal we're rendering a subscription confirmation.
//
// To make the redirect-based flow render correctly without a round-trip
// to PayPal's read API, we also include `?type=…&ref=…` in the
// return_url itself when we create the order/subscription server-side
// — PayPal preserves existing query params and appends its own.
//
// The page is intentionally informational, not transactional: the
// money is already captured server-side by the SDK flow before the
// redirect. We simply confirm + show the reference + offer a kickoff
// booking link.

import Link from "next/link";
import { detectLocale } from "lib/i18n/locale.server";
import { createT } from "lib/i18n/locale";
import { DICT } from "lib/i18n/dict";

// Locale-aware so the <title> + <meta description> match the
// body copy (cookie wins over country here, same as the rest of the
// page). Static metadata exports leak English into BG renders.
export async function generateMetadata() {
  const locale = await detectLocale();
  return locale === "bg"
    ? {
        title: "Благодаря — поръчката е получена",
        description: "Плащането мина. Детайлите за старт пристигат скоро.",
      }
    : {
        title: "Thank you — order received",
        description: "Your payment came through. Kickoff details on the way.",
      };
}

const CALENDLY_URL = "https://calendly.com/nacho-tsvetkov/30min";

type SearchParams = {
  // Set explicitly by our SDK-driven onApprove redirect.
  type?: string;
  id?: string;
  ref?: string;
  // PayPal hosted-approval — Orders v2.
  token?: string;
  PayerID?: string;
  // PayPal hosted-approval — Subscriptions v1.
  subscription_id?: string;
  ba_token?: string;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const locale = await detectLocale();
  const t = createT(locale);

  // The presence of `subscription_id` is dispositive: PayPal only
  // adds it on the subscription redirect path. Fall back to the
  // explicit `type` param (set by our SDK onApprove redirect) so
  // both flows resolve to the same UI without a round-trip.
  const isSubscription =
    typeof sp.subscription_id === "string" || sp.type === "subscription";

  // Resolve a single PayPal-side identifier to display, in priority
  // order: our explicit id > subscription_id > order token. We don't
  // surface ba_token / PayerID — they're internal to PayPal's flow
  // and not useful to the buyer.
  const paypalId = sp.id ?? sp.subscription_id ?? sp.token ?? null;
  const reference = sp.ref ?? null;

  return (
    <main className="bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-2xl px-6 py-20 text-center sm:py-28">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
          {isSubscription
            ? t(DICT.checkout.successSubscriptionTitle)
            : t(DICT.checkout.successOrderTitle)}
        </h1>
        <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
          {t(DICT.checkout.successBody)}
        </p>

        {(paypalId || reference) && (
          <dl className="mx-auto mt-8 grid max-w-sm gap-3 rounded-xl border border-neutral-200 bg-white p-5 text-left text-sm dark:border-neutral-800 dark:bg-neutral-900">
            {reference && (
              <div className="flex items-center justify-between gap-3">
                <dt className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {t(DICT.checkout.successOrderRef)}
                </dt>
                <dd className="font-mono text-neutral-900 dark:text-white">
                  {reference}
                </dd>
              </div>
            )}
            {paypalId && (
              <div className="flex items-center justify-between gap-3">
                <dt className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {isSubscription
                    ? t(DICT.checkout.successSubRef)
                    : t(DICT.checkout.successOrderRef)}
                </dt>
                <dd className="break-all font-mono text-xs text-neutral-900 dark:text-white">
                  {paypalId}
                </dd>
              </div>
            )}
          </dl>
        )}

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-500"
          >
            {t(DICT.checkout.successBookCallLink)}
          </a>
          <Link
            href="/"
            className="text-sm font-semibold text-neutral-700 underline-offset-2 hover:underline dark:text-neutral-300"
          >
            {t(DICT.checkout.successHomeLink)}
          </Link>
        </div>
      </div>
    </main>
  );
}
