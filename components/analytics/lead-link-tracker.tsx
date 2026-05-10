"use client";

// Delegated click listener for Lead-intent links. Fires Meta Pixel
// `Lead` whenever the visitor clicks anything carrying the
// `data-pixel-lead` attribute (anchor, button, surrounding parent).
//
// Why event delegation instead of wrapping each anchor:
//   - The site has ~17 Calendly links across the home page, /services,
//     each service detail, each bundle detail, the navbar, the
//     checkout form, and the sales-assistant chat. Half of them live
//     in deeply-nested server-component JSX.
//   - A single document-level listener is cheaper than 17 individual
//     onClick handlers and removes a per-link refactor cost.
//   - Call sites only need one extra attribute (`data-pixel-lead`)
//     to opt in. No imports, no client-component wrapping.
//
// Lead is a coarse-grained "they want to talk" signal — we don't
// attach value/currency, since the call hasn't been booked yet.

import { useEffect } from "react";

import { track } from "lib/pixel/client";

const TRIGGER_ATTR = "data-pixel-lead";

export function LeadLinkTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      // Use the originalTarget's closest match so a click on a
      // child element (icon, span) inside a tagged anchor still
      // fires. `closest` walks up the tree, including the element
      // itself.
      const target = e.target;
      if (!(target instanceof Element)) return;
      const trigger = target.closest(`[${TRIGGER_ATTR}]`);
      if (!trigger) return;
      track("Lead");
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
