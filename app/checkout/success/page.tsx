import Link from "next/link";
import { detectLocale } from "lib/i18n/locale.server";
import { createT } from "lib/i18n/locale";
import { DICT } from "lib/i18n/dict";
import { getDigitalProductByReference } from "lib/digital-products-data";

const CALENDLY_URL = "https://calendly.com/nacho-tsvetkov/30min";

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

type SearchParams = {
  type?: string;
  id?: string;
  ref?: string;
  token?: string;
  PayerID?: string;
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

  const isSubscription =
    typeof sp.subscription_id === "string" || sp.type === "subscription";

  const paypalId = sp.id ?? sp.subscription_id ?? sp.token ?? null;
  const reference = sp.ref ?? null;
  const digitalProduct = getDigitalProductByReference(reference);

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
          {digitalProduct
            ? "Your kit is ready"
            : isSubscription
              ? t(DICT.checkout.successSubscriptionTitle)
              : t(DICT.checkout.successOrderTitle)}
        </h1>
        <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
          {digitalProduct
            ? "Payment confirmed. Download everything below — bookmark this page."
            : t(DICT.checkout.successBody)}
        </p>

        {digitalProduct && (
          <section
            aria-labelledby="downloads-heading"
            className="mx-auto mt-8 max-w-md rounded-xl border border-blue-200 bg-blue-50 p-6 text-left dark:border-blue-500/30 dark:bg-blue-950/20"
          >
            <h2
              id="downloads-heading"
              className="text-lg font-bold text-neutral-900 dark:text-white"
            >
              Download your kit
            </h2>
            <ul className="mt-4 space-y-3">
              {digitalProduct.downloads.map((file) => (
                <li key={file.href}>
                  <a
                    href={file.href}
                    download
                    className="block rounded-lg border border-neutral-200 bg-white px-4 py-3 transition-colors hover:border-blue-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-blue-500/50"
                  >
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {file.label} ↓
                    </span>
                    {file.description && (
                      <span className="mt-0.5 block text-xs text-neutral-600 dark:text-neutral-400">
                        {file.description}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-neutral-600 dark:text-neutral-400">
              Need help? Email{" "}
              <a
                href="mailto:nacho.tsvetkov@gmail.com"
                className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                nacho.tsvetkov@gmail.com
              </a>
            </p>
          </section>
        )}

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
          {!digitalProduct && (
            <a
              href={CALENDLY_URL}
              data-pixel-lead
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-500"
            >
              {t(DICT.checkout.successBookCallLink)}
            </a>
          )}
          <Link
            href={digitalProduct ? "/shopify-conversion-kit" : "/"}
            className="text-sm font-semibold text-neutral-700 underline-offset-2 hover:underline dark:text-neutral-300"
          >
            {digitalProduct ? "Back to product page" : t(DICT.checkout.successHomeLink)}
          </Link>
        </div>
      </div>
    </main>
  );
}
