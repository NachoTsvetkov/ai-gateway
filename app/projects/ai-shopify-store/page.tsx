import { Carousel } from "components/carousel";
import { ThreeItemGrid } from "components/grid/three-items";
import { getMenu } from "lib/shopify";
import { Menu } from "lib/shopify/types";
import Link from "next/link";

export const metadata = {
  title: "Curated. — Hand-picked goods",
  description:
    "Hand-picked apparel, accessories, and tech audio. Shop the catalog with help from an AI shopping assistant.",
};

/**
 * Shop landing — `/projects/ai-shopify-store`.
 *
 * This is intentionally framed as a real DTC storefront, not as a
 * portfolio demo:
 *
 * - The route hides the global marketing navbar (NavbarGate) and uses
 *   ShopShell — StoreNav at top, ShopFooter at bottom — so the URL
 *   is the only hint we're inside nachotsvetkov.com.
 * - No "Built with Next.js + OpenAI", no "Demo for Fiverr" pill, no
 *   AI features deck, no cross-promo grid to other projects, no tech
 *   stack section. All of that broke the standalone-shop illusion.
 * - The Hero is a real merchandising hero (eyebrow + headline + sub
 *   + two CTAs to /search and a category) and matches what a small
 *   DTC brand would put above the fold.
 * - The page sequence reads like an honest store landing:
 *   Hero → Featured (ThreeItemGrid) → Browse by category →
 *   New arrivals (Carousel) → Closing CTA.
 *
 * Visual identity is intentionally **white-based** — no `dark:`
 * variants anywhere. The shop reads as a clean, premium DTC site
 * (Everlane / Maeven feel), regardless of the visitor's system
 * theme. Dark mode would otherwise compete with the colourful
 * category tiles + the AI chatbot panel and feel inconsistent
 * across the standalone-shop experience.
 *
 * The Chatbot is still mounted (via ShopShell) because it's the
 * actual in-store shopping assistant, which a real DTC brand might
 * also offer.
 */
export default async function ShopLandingPage() {
  const menu = await getMenu("next-js-frontend-header-menu");

  return (
    <>
      <ShopHero />
      <FeaturedProducts />
      <CategoryTiles menu={menu} />
      <NewArrivals />
      <ClosingCTA />
    </>
  );
}

function ShopHero() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-200 bg-white">
      {/* Soft decorative blobs — keep the section interesting without
          pretending to be a lifestyle photograph. Lower opacity than
          the previous theme so the white surface stays dominant. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 py-20 text-center sm:py-28 lg:py-32">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          Hand-picked goods
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-balance text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
          Everyday essentials,{" "}
          <span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            curated for you.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
          Apparel, accessories, and tech audio — all in one place. An AI
          shopping assistant helps you find exactly what you&apos;re after.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/search"
            prefetch
            className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-neutral-900/15 transition-all hover:bg-neutral-800 hover:shadow-neutral-900/25"
          >
            Shop everything
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <button
            type="button"
            data-chat-trigger="true"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 transition-all hover:border-neutral-900 hover:bg-neutral-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Ask the assistant
          </button>
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Editor&apos;s picks
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              This week&apos;s favorites
            </h2>
          </div>
          <Link
            href="/search"
            prefetch
            className="hidden whitespace-nowrap text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline sm:inline-flex"
          >
            Shop all →
          </Link>
        </div>
        <ThreeItemGrid />
      </div>
    </section>
  );
}

function CategoryTiles({ menu }: { menu: ReadonlyArray<Menu> }) {
  if (!menu.length) return null;

  /**
   * Each menu entry that the storefront returns becomes a category
   * tile. A static palette gives the tiles individual visual identity
   * without depending on Shopify metadata; the modulo wrap-around
   * keeps it predictable when the menu length changes.
   *
   * Tones are now light-only (50/100 weights) so they sit on the
   * white surface without fighting the rest of the page.
   */
  const palette = [
    "from-rose-100 to-rose-50 text-rose-900",
    "from-amber-100 to-amber-50 text-amber-900",
    "from-emerald-100 to-emerald-50 text-emerald-900",
    "from-sky-100 to-sky-50 text-sky-900",
    "from-violet-100 to-violet-50 text-violet-900",
  ] as const;

  return (
    <section className="border-y border-neutral-200 bg-neutral-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Browse by category
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Find your aisle
          </h2>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menu.map((item, index) => {
            const tone = palette[index % palette.length] ?? palette[0]!;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  prefetch
                  className={`group flex h-32 items-end justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${tone} p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg sm:h-36`}
                >
                  <span className="text-lg font-bold tracking-tight">
                    {item.title}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function NewArrivals() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Fresh in
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              New arrivals
            </h2>
          </div>
        </div>
      </div>
      <Carousel />
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="border-y border-neutral-200 bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 py-16">
      <div className="mx-auto max-w-3xl px-6 text-center text-white">
        <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          Not sure what you&apos;re looking for?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-blue-100">
          Tell our AI assistant what you need — it&apos;ll search the catalog,
          compare options, and add the right pieces to your cart.
        </p>
        <button
          type="button"
          data-chat-trigger="true"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Open the assistant
        </button>
      </div>
    </section>
  );
}
