"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

/**
 * Tiny client wrapper that conditionally renders its children based on
 * the current pathname. Used to hide the global marketing navbar on
 * routes that play the role of a "standalone" sub-experience — e.g.
 * the AI-Powered Shopify Store demo, which has its own `<StoreNav />`
 * at the top and is meant to read like an independent shop on a
 * subdomain rather than a portfolio item under nachotsvetkov.com.
 *
 * Why a wrapper rather than route groups:
 * - The navbar lives in the root layout. Moving it into a route group
 *   would require relocating every other route (homepage, /services,
 *   /projects, etc.) into a sibling group — a much larger refactor.
 * - Server children (`<Navbar />`) are still server-rendered and
 *   passed to this client component as a prop. If the gate hides
 *   them they're skipped from the DOM with no client cost beyond
 *   the React tree decision.
 *
 * Add prefixes to `hideOnPrefix` rather than hard-coding paths here so
 * the rule lives at the call site (root layout) where it's discoverable.
 */
export function NavbarGate({
  children,
  hideOnPrefix,
}: {
  children: ReactNode;
  hideOnPrefix: ReadonlyArray<string>;
}) {
  const pathname = usePathname() ?? "";
  if (hideOnPrefix.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }
  return <>{children}</>;
}
