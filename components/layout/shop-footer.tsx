import Link from "next/link";

import { getMenu } from "lib/shopify";
import { Menu } from "lib/shopify/types";

/**
 * Footer used by the standalone Shopify-store experience
 * (`/projects/ai-shopify-store`, `/product/*`, `/search/*`).
 *
 * Distinct from `components/layout/footer.tsx`:
 * - That footer is the portfolio/demo footer ("Fiverr Portfolio Demo",
 *   "Built by Full-Stack Software Engineer", deploy-on-vercel link).
 * - This one is shop chrome: brand wordmark, category links pulled from
 *   the same Shopify menu the StoreNav uses, and a small honest
 *   "demo store" disclaimer so the visitor knows products aren't real.
 *
 * Visual identity is white-based (no `dark:` variants) to match the
 * rest of the standalone-shop experience — see the comment on the
 * shop landing page for the full reasoning.
 *
 * We keep it lean and don't fabricate "Free shipping / 30-day returns"
 * promises — the underlying data is a generic Shopify storefront and
 * nothing in the catalogue backs those claims.
 */
export async function ShopFooter() {
  const menu = await getMenu("next-js-frontend-header-menu");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link
              href="/projects/ai-shopify-store"
              className="inline-flex items-baseline text-xl font-bold tracking-tight text-neutral-900"
            >
              Curated
              <span className="text-blue-600">.</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-600">
              Hand-picked apparel, accessories, and tech audio in one place.
              An AI shopping assistant helps you find exactly what you need.
            </p>
          </div>

          {/* Shop column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-900">
              Shop
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/search"
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                  prefetch
                >
                  All products
                </Link>
              </li>
              {menu.map((item: Menu) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                    prefetch
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-900">
              Help
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <button
                  type="button"
                  data-chat-trigger="true"
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  Ask the AI assistant
                </button>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  Search the catalog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar — small, honest demo disclosure. We deliberately
            do NOT brand this as a portfolio piece here: the standalone
            shop framing breaks if we crow about being a demo. The
            disclosure is a single quiet line. */}
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-neutral-500">
            &copy; {currentYear} Curated. Demo storefront — products are
            illustrative only.
          </p>
          <p className="text-xs text-neutral-400">
            Powered by Shopify · Next.js · OpenAI
          </p>
        </div>
      </div>
    </footer>
  );
}
