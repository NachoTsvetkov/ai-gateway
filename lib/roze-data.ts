/**
 * Static product + cart catalogue for the ROZÉ boutique demo.
 *
 * The demo doesn't talk to a real Shopify backend, so this module is
 * the single source of truth for everything the page, the nav search
 * overlay, and the cart drawer render. Currency is BGN throughout —
 * the demo is positioned as a Bulgarian Sofia-based atelier and we
 * don't apply geo-based currency switching here.
 */

export type RozeProduct = {
  /** Stable, URL-friendly id used as React key + cart-line key. */
  id: string;
  /** Display name (Cyrillic). */
  name: string;
  /** Display category (Cyrillic, used for filter chips and badges). */
  category: string;
  /** Price already formatted in лв (BGN) for in-line rendering. */
  price: string;
  /** Numeric BGN amount used for cart totals. */
  priceBgn: number;
  /** Tailwind gradient classes for the product's visual swatch. Also
   *  serves as the fallback when no image is available — every card
   *  layers `image` over `swatch`, so an unloaded/missing image still
   *  reveals the brand-correct gradient instead of a white box. */
  swatch: string;
  /** Optional path under /public to a real product photo. When set,
   *  the product grid + cart drawer + stylist recommendations will
   *  render the photo. When omitted, the gradient swatch wins. We
   *  only ship images that match palette and have no third-party
   *  branding visible. */
  image?: string;
  /** Optional badge ("Бестселър", "Нова", "Лимитирано"). */
  badge?: string;
};

export const ROZE_PRODUCTS: ReadonlyArray<RozeProduct> = [
  {
    id: "vitosha",
    name: "Кашмирен пуловер «Витоша»",
    category: "Плетиво",
    price: "480 лв",
    priceBgn: 480,
    swatch: "from-stone-200 via-stone-100 to-stone-300",
    image: "/projects/roze/vitosha.jpg",
    badge: "Бестселър",
  },
  {
    id: "orchid",
    name: "Копринена рокля «Орхидея»",
    category: "Рокля",
    price: "720 лв",
    priceBgn: 720,
    swatch: "from-rose-300 via-rose-200 to-[#F4DDD1]",
    image: "/projects/roze/orchid.jpg",
    badge: "Нова",
  },
  {
    id: "sofia",
    name: "Палто «София» от мериносова вълна",
    category: "Палто",
    price: "980 лв",
    priceBgn: 980,
    swatch: "from-stone-700 via-stone-600 to-stone-800",
    image: "/projects/roze/sofia.jpg",
    badge: "Лимитирано",
  },
  {
    id: "rose-valley",
    name: "Кашмирен шал «Розова долина»",
    category: "Аксесоар",
    price: "290 лв",
    priceBgn: 290,
    swatch: "from-rose-200 via-[#F4DDD1] to-stone-100",
    image: "/projects/roze/rose-valley.jpg",
  },
  {
    id: "balchik",
    name: "Ленена риза «Балчик»",
    category: "Риза",
    price: "240 лв",
    priceBgn: 240,
    swatch: "from-emerald-100 via-stone-100 to-stone-200",
    image: "/projects/roze/balchik.jpg",
  },
  {
    id: "nesebar",
    name: "Кожена чанта «Несебър»",
    category: "Аксесоар",
    price: "560 лв",
    priceBgn: 560,
    swatch: "from-amber-200 via-amber-100 to-stone-200",
    image: "/projects/roze/nesebar.jpg",
  },
];

/** A map for O(1) lookups when the cart adds or restores items by id. */
export const ROZE_PRODUCT_BY_ID: Record<string, RozeProduct> = Object.fromEntries(
  ROZE_PRODUCTS.map((p) => [p.id, p]),
);

/**
 * Initial cart contents — the badge in the nav advertises "2" items by
 * default, so this exact pair is what the cart drawer reveals on first
 * open. Keep these two products synced with the badge count below.
 */
export const ROZE_INITIAL_CART: ReadonlyArray<{ id: string; qty: number }> = [
  { id: "vitosha", qty: 1 },
  { id: "rose-valley", qty: 1 },
];

/** Format a numeric BGN amount the same way the price strings do. */
export function formatBgn(amount: number): string {
  // No decimals on BGN — every product is priced in whole leva, and
  // toLocaleString gives us the nice non-breaking thin space at the
  // thousands separator (e.g. "1 570 лв") consistent with the brand
  // body copy elsewhere on the page.
  return `${amount.toLocaleString("bg-BG")} лв`;
}
