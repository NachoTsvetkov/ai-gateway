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
 */
export function ShopShell({ children }: { children: ReactNode }) {
  return (
    <>
      <StoreNav />
      {children}
      <ShopFooter />
      <Chatbot />
    </>
  );
}
