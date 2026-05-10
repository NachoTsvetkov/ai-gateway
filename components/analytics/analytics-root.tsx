"use client";

// Single mount point for everything tracking-related. Two reasons to
// have this wrapper instead of mounting MetaPixel + ConsentBanner
// directly from the layout:
//
//   1. Path exclusion in one place. The demo subsites (Curated. shop,
//      KORE, ROZÉ, /product, /search) ship their own brand chrome
//      and would feel jarring with a marketing-site consent banner
//      or a Pixel hit attributing demo traffic to the conversion
//      funnel. We bail at the wrapper level so neither the banner
//      nor the loader render.
//
//   2. Future analytics (GA4, Plausible, etc.) plug in here without
//      touching `app/layout.tsx`.

import { usePathname } from "next/navigation";

import { ConsentBanner } from "./consent-banner";
import { LeadLinkTracker } from "./lead-link-tracker";
import { MetaPixel } from "./meta-pixel";

export type AnalyticsRootProps = {
  /** Public Pixel id, forwarded from the server layout reading
   *  `process.env.NEXT_PUBLIC_FB_PIXEL_ID`. Null/empty disables the
   *  pixel cleanly — banner still shows so the consent decision is
   *  recorded for any future tracker we plug in. */
  pixelId: string | null;
  /** Path prefixes where neither the banner nor the pixel should
   *  render. Same shape as `HIDE_NAVBAR_ON` in the root layout. */
  excludePathPrefixes: ReadonlyArray<string>;
  /** Localized banner copy threaded through from the server. */
  consent: {
    accept: string;
    reject: string;
    message: string;
    ariaLabel: string;
  };
};

export function AnalyticsRoot({
  pixelId,
  excludePathPrefixes,
  consent,
}: AnalyticsRootProps) {
  const pathname = usePathname();
  const isExcluded = excludePathPrefixes.some(
    (p) => pathname?.startsWith(p) ?? false,
  );
  if (isExcluded) return null;

  return (
    <>
      <MetaPixel pixelId={pixelId} />
      <LeadLinkTracker />
      <ConsentBanner
        acceptLabel={consent.accept}
        rejectLabel={consent.reject}
        message={consent.message}
        ariaLabel={consent.ariaLabel}
      />
    </>
  );
}
