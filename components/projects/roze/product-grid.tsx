"use client";

import Image from "next/image";
import { ROZE_PRODUCTS } from "lib/roze-data";
import { useRozeCart } from "components/layout/roze-shell";

/**
 * Client-side product grid for the ROZÉ boutique. Lives outside the
 * page module so the page itself can stay a Server Component (it
 * exports `metadata`, which Client Components can't).
 *
 * The grid wires each card up to the shell's RozeCart context so:
 *   - Clicking a card adds it to the cart (and pops a toast).
 *   - The cart drawer reflects the new item immediately.
 *   - The nav badge bumps with a small scale-pop animation.
 *
 * Visually the grid still renders the same hover-overlay
 * "Бърз преглед" prompt the demo shipped with — clicking it now
 * actually does something.
 */
export function ProductGrid() {
  const { addToCart } = useRozeCart();

  return (
    <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {ROZE_PRODUCTS.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            onClick={() => addToCart(p.id)}
            className="group block w-full text-left"
            aria-label={`${p.name} · добави в кошницата`}
          >
            <div
              className={`relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br ${p.swatch} transition-transform duration-500 group-hover:scale-[1.02]`}
            >
              {p.image ? (
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              ) : (
                // No photo for this product — fall back to the
                // gradient swatch underneath plus a soft top-light
                // sheen so it still reads as a curated panel.
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.5),_transparent_60%)]"
                />
              )}
              {p.badge && (
                <span className="absolute top-4 left-4 inline-flex items-center rounded-full bg-stone-950/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
                  {p.badge}
                </span>
              )}
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-xl bg-white/90 px-4 py-2.5 text-[11px] uppercase tracking-[0.22em] text-stone-900 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <span>Добави в кошницата</span>
                <span aria-hidden="true">+</span>
              </div>
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-stone-500">
                  {p.category}
                </p>
                <h3 className="mt-1 font-serif text-lg leading-tight text-stone-950">
                  {p.name}
                </h3>
              </div>
              <p className="font-mono text-sm font-semibold text-stone-950">
                {p.price}
              </p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
