import CartModal from "components/cart/modal";
import { getMenu } from "lib/shopify";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { Suspense } from "react";
import { SearchSkeleton } from "./navbar/search";
import Search from "./navbar/search";

/**
 * Top navigation for the standalone Shopify-store experience.
 *
 * Two-row layout, mimicking real DTC storefronts:
 * - Row 1 (always visible): brand wordmark on the left, search bar in
 *   the middle (md+ only — narrow phones can't fit a useful search
 *   field next to a wordmark and cart), cart on the right.
 * - Row 2 (always visible, scrollable on overflow): category links
 *   from the Shopify menu.
 *
 * Sticks to top-0 because the global marketing navbar is hidden on
 * shop routes (see NavbarGate in the root layout) — this is the only
 * top bar on the page.
 *
 * The brand wordmark links to `/projects/ai-shopify-store` which is
 * the shop's "home". That makes the chrome consistent across
 * `/projects/ai-shopify-store`, `/product/<handle>`, and `/search/*`:
 * clicking the brand always returns the visitor to the storefront
 * landing, never to the marketing site root.
 */
export async function StoreNav() {
  const menu = await getMenu("next-js-frontend-header-menu");

  return (
    <div className="sticky top-0 z-30 border-b border-neutral-200/70 bg-white/95 backdrop-blur-md">
      {/* Row 1: brand · search · cart */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-6">
        <Link
          href="/projects/ai-shopify-store"
          prefetch
          className="inline-flex items-baseline text-lg font-bold tracking-tight text-neutral-900 transition-colors hover:text-blue-600"
          aria-label="Curated. — shop home"
        >
          Curated
          <span className="text-blue-600">.</span>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="w-full max-w-md">
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
          </div>
        </div>

        {/* Spacer pushes cart to the right when search is hidden (mobile). */}
        <div className="ml-auto md:ml-0">
          <CartModal />
        </div>
      </div>

      {/* Row 2: category nav. Horizontally scrollable when the menu is
          wider than the viewport (mobile with many categories). */}
      {menu.length ? (
        <nav
          aria-label="Shop categories"
          className="border-t border-neutral-200/70"
        >
          <ul className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-2 text-xs font-medium lg:px-6">
            {menu.map((item: Menu) => (
              <li key={item.title} className="flex-none">
                <Link
                  href={item.path}
                  prefetch
                  className="whitespace-nowrap text-neutral-600 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
