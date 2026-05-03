import { Chatbot } from "components/ai/chatbot";
import { ShopFooter } from "components/layout/shop-footer";
import { StoreNav } from "components/layout/store-nav";
import { ReactNode } from "react";

/**
 * Shared chrome for every page in the standalone Shopify-store
 * experience (the landing at `/projects/ai-shopify-store`, every
 * `/product/<handle>`, and `/search/*`).
 *
 * Renders the shop's own top nav (StoreNav) and footer (ShopFooter)
 * around the page content, plus the in-store AI chatbot.
 *
 * What is NOT here:
 * - The global marketing navbar — hidden via NavbarGate in the root
 *   layout for these prefixes.
 * - The DemoLauncher (cross-promo to other AI demos) — that's
 *   portfolio framing and breaks the "standalone shop" feel. It's
 *   still rendered on the other AI demo project pages individually.
 * - The portfolio Footer with the "Fiverr Portfolio Demo" line —
 *   replaced by ShopFooter, which is shop-shaped.
 *
 * The wrapping <div> forces a white background + light color-scheme
 * for the entire shop subtree. The root body has `dark:bg-neutral-900`
 * which would otherwise bleed through any gap between sections when
 * the visitor's OS is in dark mode; this wrapper makes "Curated."
 * read as a single uniform white-based DTC site regardless of system
 * theme. `colorScheme: 'light'` also lines up form controls and
 * scrollbars with the surface.
 */
export function ShopShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="shop-light min-h-screen bg-white text-neutral-900"
      style={{ colorScheme: "light" }}
    >
      <StoreNav />
      {children}
      <ShopFooter />
      <Chatbot />
    </div>
  );
}
