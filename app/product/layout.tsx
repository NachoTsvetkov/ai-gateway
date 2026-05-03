import { ShopShell } from "components/layout/shop-shell";
import { ReactNode } from "react";

/**
 * `/product/<handle>` lives inside the standalone shop experience.
 * The route hides the global marketing navbar (NavbarGate) and uses
 * the same StoreNav + ShopFooter chrome as `/projects/ai-shopify-store`
 * so visitors clicking through to a product never leave the storefront.
 */
export default function ProductLayout({ children }: { children: ReactNode }) {
  return <ShopShell>{children}</ShopShell>;
}
