"use client";

// Meta Pixel loader. Three jobs:
//
//   1. Inject `fbevents.js` via <Script> (afterInteractive strategy)
//      with `fbq('init', PIXEL_ID)` + the initial PageView in the
//      inline snippet. Standard Meta install.
//
//   2. Watch the consent cookie and only render the <Script> when the
//      visitor has clicked Accept. Default-deny: no script, no
//      cookies, no third-party calls until the banner is acknowledged.
//
//   3. Fire a `PageView` on every App Router client navigation. The
//      App Router doesn't trigger a full reload between routes, so
//      without this hook only the first page would be tracked.
//
// Excluding demo subsites (Curated. shop, KORE, ROZÉ, /product,
// /search) is handled one level up in <AnalyticsRoot> — by the time
// this component renders, we've already passed the path check.

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { readConsentClient, type ConsentValue } from "lib/pixel/consent";
import { ensureFbcCookie } from "lib/pixel/match-data.client";
import { track } from "lib/pixel/client";

type Props = {
  /** When null/empty (env var missing) the loader stays mounted but
   *  renders nothing — same observable behaviour as "consent not
   *  granted". Lets us ship the integration without configuring the
   *  Pixel ID first. */
  pixelId: string | null;
};

export function MetaPixel({ pixelId }: Props) {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentValue | null>(null);

  // The first PageView is fired by the inline init snippet (standard
  // Meta install). Subsequent path changes go through `track()` so
  // the browser pixel + CAPI dedupe correctly. The ref tracks which
  // bucket we're in for any given useEffect run.
  const initialFiredRef = useRef(false);

  // Read the cookie on mount, then keep listening for grant/revoke
  // events from the consent banner so the loader can flip on/off
  // without a page reload.
  useEffect(() => {
    setConsent(readConsentClient());
    if (readConsentClient() === "accepted") {
      ensureFbcCookie();
    }
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ value: ConsentValue }>).detail;
      setConsent(detail.value);
      if (detail.value === "accepted") {
        ensureFbcCookie();
      }
    };
    window.addEventListener("consent-change", handler as EventListener);
    return () =>
      window.removeEventListener(
        "consent-change",
        handler as EventListener,
      );
  }, []);

  // Fire PageView on client navigations after the initial render. The
  // initial PageView is handled by the inline snippet so we don't
  // double-fire the first view. `pathname` includes search params on
  // App Router, so query-only changes also re-fire (which is the
  // behaviour Meta documents).
  useEffect(() => {
    if (!pixelId) return;
    if (consent !== "accepted") return;
    if (!initialFiredRef.current) {
      initialFiredRef.current = true;
      return;
    }
    track("PageView");
  }, [pathname, pixelId, consent]);

  if (!pixelId) return null;
  if (consent !== "accepted") return null;

  // The inline snippet is Meta's canonical install with the only
  // change being the dynamic pixel id. Kept verbatim because the
  // queue + script-loader trick (`!function(f,b,e,v,n,t,s){...}`) is
  // what makes calling `fbq()` safe before fbevents.js finishes
  // loading — the IIFE creates the queue synchronously.
  const snippet = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: snippet }}
      />
      {/* <noscript> img beacon so visitors with JS disabled still
          register a PageView. Same fallback Meta documents. */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
