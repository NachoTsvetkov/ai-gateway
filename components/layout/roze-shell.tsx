"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ROZE_INITIAL_CART,
  ROZE_PRODUCTS,
  ROZE_PRODUCT_BY_ID,
  type RozeProduct,
  formatBgn,
} from "lib/roze-data";

/**
 * Chrome for the ROZÉ Bulgarian boutique demo
 * (`/projects/boutique-fashion-brand`).
 *
 * Visual identity is intentionally a luxury/quiet inverse of both the
 * Curated. shop (dark, blue) and KORE (loud, orange):
 *   - Cream / blush page background, generous whitespace.
 *   - Serif wordmark "ROZÉ" — Latin glyphs are common on real
 *     Bulgarian luxury brands while the body copy stays Cyrillic.
 *   - All navigation labels and footer copy are in Bulgarian, since
 *     the demo positions a boutique that ships internationally but
 *     trades on its Sofia atelier story.
 *
 * Why this is a Client Component: the boutique's nav owns three
 * pieces of interactive UI — the search overlay, the cart drawer, and
 * the cart count badge. Those need shared state with the product grid
 * (which lives in the page), so the shell exposes a `RozeCart`
 * context that any descendant can use to open the drawer or push a
 * new product into the cart. The dead "Профил" button has been
 * removed entirely — there's no real auth on a demo site, and a
 * dead button costs more trust than the icon space saves.
 *
 * The route hides the global marketing navbar via NavbarGate so this
 * is the only top bar visitors see.
 */
export function RozeShell({ children }: { children: ReactNode }) {
  return (
    <RozeCartProvider>
      <div className="min-h-screen bg-[#FBF6F1] text-stone-900 antialiased">
        <BoutiqueAnnouncement />
        <BoutiqueNav />
        {children}
        <BoutiqueFooter />
        <RozeOverlays />
      </div>
    </RozeCartProvider>
  );
}

// ---------------------------------------------------------------------
// Cart context
// ---------------------------------------------------------------------

type CartLine = { id: string; qty: number };

type RozeCartContextValue = {
  lines: ReadonlyArray<CartLine>;
  /** Total item count across all lines (drives the badge in the nav). */
  count: number;
  /** Numeric BGN total. */
  totalBgn: number;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  decrement: (productId: string) => void;
  /** Open / close the search overlay. */
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  /** Open / close the cart drawer. */
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  /** Show a small bottom-right toast (used after add-to-cart). */
  pushToast: (message: string) => void;
};

const RozeCartContext = createContext<RozeCartContextValue | null>(null);

export function useRozeCart(): RozeCartContextValue {
  const ctx = useContext(RozeCartContext);
  if (!ctx) {
    throw new Error("useRozeCart must be used inside <RozeShell>");
  }
  return ctx;
}

function RozeCartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() =>
    ROZE_INITIAL_CART.map((line) => ({ ...line })),
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const pushToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  // Tidy up the toast timer on unmount so a fast-navigating SPA
  // doesn't fire a stale setState into a torn-down tree.
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const addToCart = useCallback(
    (productId: string) => {
      const product = ROZE_PRODUCT_BY_ID[productId];
      if (!product) return;
      setLines((prev) => {
        const existing = prev.find((l) => l.id === productId);
        if (existing) {
          return prev.map((l) =>
            l.id === productId ? { ...l, qty: l.qty + 1 } : l,
          );
        }
        return [...prev, { id: productId, qty: 1 }];
      });
      pushToast(`${product.name} · добавено в кошницата`);
    },
    [pushToast],
  );

  const removeFromCart = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.id !== productId));
  }, []);

  const decrement = useCallback((productId: string) => {
    setLines((prev) =>
      prev.flatMap((l) =>
        l.id === productId
          ? l.qty > 1
            ? [{ ...l, qty: l.qty - 1 }]
            : []
          : [l],
      ),
    );
  }, []);

  // Close any overlay on Escape, just like a real e-commerce nav.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setCartOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock background scroll while either overlay is open. Without
  // this, scrolling inside the drawer leaks through to the page.
  useEffect(() => {
    if (searchOpen || cartOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [searchOpen, cartOpen]);

  const { count, totalBgn } = useMemo(() => {
    let n = 0;
    let t = 0;
    for (const line of lines) {
      const product = ROZE_PRODUCT_BY_ID[line.id];
      if (!product) continue;
      n += line.qty;
      t += line.qty * product.priceBgn;
    }
    return { count: n, totalBgn: t };
  }, [lines]);

  const value = useMemo<RozeCartContextValue>(
    () => ({
      lines,
      count,
      totalBgn,
      addToCart,
      removeFromCart,
      decrement,
      searchOpen,
      setSearchOpen,
      cartOpen,
      setCartOpen,
      pushToast,
    }),
    [
      lines,
      count,
      totalBgn,
      addToCart,
      removeFromCart,
      decrement,
      searchOpen,
      cartOpen,
      pushToast,
    ],
  );

  return (
    <RozeCartContext.Provider value={value}>
      {children}
      {toast && <CartToast text={toast} />}
    </RozeCartContext.Provider>
  );
}

// ---------------------------------------------------------------------
// Static / non-stateful chrome
// ---------------------------------------------------------------------

function BoutiqueAnnouncement() {
  return (
    <div className="border-b border-stone-200 bg-stone-950 text-white">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-[11px] font-medium uppercase tracking-[0.22em] lg:px-6">
        Безплатна доставка в България над 350 лв · Пролет 2026
      </p>
    </div>
  );
}

function BoutiqueNav() {
  const { count, setSearchOpen, setCartOpen } = useRozeCart();

  return (
    <nav className="sticky top-0 z-30 border-b border-stone-200 bg-[#FBF6F1]/95 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-4 py-5 lg:px-6">
        {/* Left: nav */}
        <ul className="hidden items-center gap-7 text-xs font-medium uppercase tracking-[0.22em] text-stone-700 md:flex">
          <li>
            <a href="#shop" className="transition-colors hover:text-stone-950">
              Магазин
            </a>
          </li>
          <li>
            <a
              href="#collection"
              className="transition-colors hover:text-stone-950"
            >
              Колекции
            </a>
          </li>
          <li>
            <a
              href="#atelier"
              className="transition-colors hover:text-stone-950"
            >
              Ателие
            </a>
          </li>
        </ul>

        {/* Center: brand */}
        <Link
          href="/projects/boutique-fashion-brand"
          prefetch
          aria-label="ROZÉ — начална страница"
          className="justify-self-center font-serif text-3xl tracking-[0.32em] text-stone-950 transition-opacity hover:opacity-80 md:text-4xl"
        >
          ROZÉ
        </Link>

        {/* Right: utility */}
        <div className="flex items-center justify-end gap-5 text-stone-700">
          <button
            type="button"
            aria-label="Търсене"
            onClick={() => setSearchOpen(true)}
            className="hidden transition-colors hover:text-stone-950 md:inline-flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {/* The Профил button used to live here. We dropped it because
              there's no real auth on the demo and a dead button costs
              more trust than the icon space saves. */}
          <button
            type="button"
            aria-label="Кошница"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] transition-colors hover:text-stone-950"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
              />
            </svg>
            <span className="hidden sm:inline">Кошница</span>
            {count > 0 && (
              <span
                key={count}
                className="absolute -top-1.5 -right-1.5 inline-flex h-4 min-w-4 animate-[boutique-bump_360ms_ease-out] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"
                style={{
                  // Inline keyframe so we don't have to touch
                  // app/globals.css for a one-off scale-pop.
                  animation: "boutique-bump 360ms ease-out",
                }}
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
      {/* Local keyframe — when `count` changes, React swaps the badge's
          key to remount it and replay this animation. */}
      <style>{`
        @keyframes boutique-bump {
          0%   { transform: scale(0.7); }
          60%  { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
      `}</style>
    </nav>
  );
}

function BoutiqueFooter() {
  return (
    <footer className="border-t border-stone-200 bg-[#F4ECE3]">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="font-serif text-3xl tracking-[0.32em] text-stone-950">
              ROZÉ
            </p>
            <p className="mt-4 text-sm leading-relaxed text-stone-600">
              Българско ателие за ръчно изработено облекло. Лимитирани серии,
              натурални материали, бавна мода.
            </p>
          </div>
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-950">
              Магазин
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-stone-600">
              <li>
                <a href="#collection" className="hover:text-stone-950">
                  Нова колекция
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-stone-950">
                  Плетива
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-stone-950">
                  Рокли
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-stone-950">
                  Аксесоари
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-950">
              Грижа за клиента
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-stone-600">
              <li>
                <a href="#stylist" className="hover:text-stone-950">
                  Личен стилист
                </a>
              </li>
              <li>
                <a href="#shipping" className="hover:text-stone-950">
                  Доставка и връщане
                </a>
              </li>
              <li>
                <a href="#care" className="hover:text-stone-950">
                  Грижа за плата
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-stone-950">
                  Контакт
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-950">
              Ателие
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-stone-600">
              <li>ул. Цар Освободител 14</li>
              <li>1000 София, България</li>
              <li>Вт – Сб · 11:00 – 19:00</li>
              <li>
                <a
                  href="mailto:atelier@roze.bg"
                  className="hover:text-stone-950"
                >
                  atelier@roze.bg
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:items-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-stone-400">
            &copy; {new Date().getFullYear()} ROZÉ Atelier · Демонстрационен сайт
          </p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-stone-400">
            Next.js · Shopify · Klaviyo · GPT-4o
          </p>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------
// Overlays (search + cart drawer + toast)
// ---------------------------------------------------------------------

/** Fixed overlays mounted at the end of the shell so they sit above
 *  the rest of the page chrome at z-50 / z-60. */
function RozeOverlays() {
  return (
    <>
      <SearchOverlay />
      <CartDrawer />
    </>
  );
}

function SearchOverlay() {
  const { searchOpen, setSearchOpen, addToCart } = useRozeCart();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus + reset on open.
  useEffect(() => {
    if (searchOpen) {
      setQuery("");
      // Wait for the input to mount before focusing it.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [searchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ROZE_PRODUCTS;
    return ROZE_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [query]);

  if (!searchOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Търсене в каталога"
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-24 sm:pt-32"
    >
      <button
        type="button"
        aria-label="Затвори"
        onClick={() => setSearchOpen(false)}
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-[#FBF6F1] shadow-2xl ring-1 ring-stone-200">
        <div className="flex items-center gap-3 border-b border-stone-200 px-5 py-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 flex-none text-stone-400"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Търси по име или категория…"
            className="flex-1 bg-transparent text-base text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-900"
          >
            Затвори
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-stone-500">
            {results.length === 0
              ? "Няма намерени резултати"
              : `${results.length} резултата`}
          </p>
          <ul className="divide-y divide-stone-200">
            {results.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
              >
                <a
                  href={`#shop`}
                  onClick={() => setSearchOpen(false)}
                  className="flex flex-1 items-center gap-4"
                >
                  <span
                    className={`relative block aspect-square h-14 w-14 flex-none overflow-hidden rounded-xl bg-gradient-to-br ${p.swatch}`}
                    aria-hidden="true"
                  >
                    {p.image && (
                      <Image
                        src={p.image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-stone-500">
                      {p.category}
                    </span>
                    <span className="block truncate font-serif text-base text-stone-950">
                      {p.name}
                    </span>
                  </span>
                  <span className="font-mono text-sm font-semibold text-stone-950">
                    {p.price}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    addToCart(p.id);
                    setSearchOpen(false);
                  }}
                  className="rounded-full bg-stone-950 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-rose-700"
                >
                  Добави
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CartDrawer() {
  const {
    cartOpen,
    setCartOpen,
    lines,
    totalBgn,
    addToCart,
    decrement,
    removeFromCart,
    pushToast,
  } = useRozeCart();

  if (!cartOpen) return null;

  // Stitch cart lines back to product details for rendering.
  const detailedLines = lines
    .map((line) => {
      const product = ROZE_PRODUCT_BY_ID[line.id];
      return product ? { ...line, product } : null;
    })
    .filter((x): x is { id: string; qty: number; product: RozeProduct } => x !== null);

  const empty = detailedLines.length === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Кошница"
      className="fixed inset-0 z-50"
    >
      <button
        type="button"
        aria-label="Затвори кошницата"
        onClick={() => setCartOpen(false)}
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm"
      />
      <aside className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-[#FBF6F1] shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <p className="font-serif text-2xl text-stone-950">Кошница</p>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Затвори"
            className="text-stone-400 transition-colors hover:text-stone-950"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-serif text-xl text-stone-700">
              Кошницата ви е празна.
            </p>
            <p className="text-sm text-stone-500">
              Добавете нещо от колекцията — първите 350 лв са с безплатна
              доставка.
            </p>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="rounded-full bg-stone-950 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-rose-700"
            >
              Към колекцията
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-stone-200 overflow-y-auto px-6">
              {detailedLines.map((line) => (
                <li key={line.id} className="flex gap-4 py-5">
                  <span
                    className={`relative block aspect-[4/5] w-20 flex-none overflow-hidden rounded-lg bg-gradient-to-br ${line.product.swatch}`}
                    aria-hidden="true"
                  >
                    {line.product.image && (
                      <Image
                        src={line.product.image}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <div className="flex flex-1 flex-col">
                    <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-stone-500">
                      {line.product.category}
                    </span>
                    <p className="font-serif text-base leading-tight text-stone-950">
                      {line.product.name}
                    </p>
                    <p className="mt-1 font-mono text-sm font-semibold text-stone-950">
                      {line.product.price}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="inline-flex items-center rounded-full border border-stone-300">
                        <button
                          type="button"
                          onClick={() => decrement(line.id)}
                          aria-label="Намали"
                          className="px-2.5 py-1 text-stone-600 transition-colors hover:text-stone-950"
                        >
                          −
                        </button>
                        <span className="px-2 font-mono text-xs tabular-nums text-stone-950">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(line.id)}
                          aria-label="Увеличи"
                          className="px-2.5 py-1 text-stone-600 transition-colors hover:text-stone-950"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(line.id)}
                        className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-400 transition-colors hover:text-rose-700"
                      >
                        Премахни
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-stone-200 px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Общо
                </span>
                <span className="font-mono text-lg font-semibold text-stone-950">
                  {formatBgn(totalBgn)}
                </span>
              </div>
              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-stone-400">
                {totalBgn >= 350
                  ? "Безплатна доставка приложена"
                  : `Още ${formatBgn(350 - totalBgn)} до безплатна доставка`}
              </p>
              <button
                type="button"
                onClick={() => {
                  pushToast(
                    "Демонстрационен сайт — поръчките не се обработват.",
                  );
                  setCartOpen(false);
                }}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-rose-700"
              >
                Поръчай · {formatBgn(totalBgn)}
              </button>
              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.22em] text-stone-400">
                Демонстрационен сайт · поръчките не се обработват
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function CartToast({ text }: { text: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-5 bottom-5 z-[60] max-w-xs rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-stone-800 shadow-2xl"
    >
      <div className="flex items-start gap-2.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="mt-0.5 h-4 w-4 flex-none text-rose-700"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
            clipRule="evenodd"
          />
        </svg>
        <span>{text}</span>
      </div>
    </div>
  );
}
