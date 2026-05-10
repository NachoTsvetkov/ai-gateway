"use client";

// ViewContent emitter. Drop one inside any server component that
// represents a "viewable item" — service detail, bundle detail —
// to fire Meta Pixel `ViewContent` exactly once on mount.
//
// Why a tiny dedicated component instead of a hook: server pages
// are RSC, so we can't call hooks there. The cleanest seam is a
// client child component that owns its own useEffect.

import { useEffect, useRef } from "react";

import type { Currency } from "lib/currency";
import { track } from "lib/pixel/client";
import type { PixelCustomData } from "lib/pixel/types";

type Props = {
  /** Stable id of the viewed item — service id or bundle slug. */
  contentId: string;
  /** Display name (already locale-resolved). */
  contentName: string;
  contentType: "service" | "bundle";
  /** Optional category label — pain-category title for services. */
  contentCategory?: string;
  /** Headline price in EUR (whole units). When set we also forward
   *  the active currency so Meta has the value in the right denom. */
  value?: number;
  currency?: Currency;
};

export function ViewContentTracker({
  contentId,
  contentName,
  contentType,
  contentCategory,
  value,
  currency,
}: Props) {
  // Strict-mode mounts the component twice in dev; the ref guards
  // against double-firing the CAPI mirror so test events don't
  // duplicate in Events Manager.
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const custom: PixelCustomData = {
      content_ids: [contentId],
      content_name: contentName,
      content_type: contentType,
    };
    if (contentCategory) custom.content_category = contentCategory;
    if (typeof value === "number") {
      custom.value = value;
      if (currency) custom.currency = currency;
    }

    track("ViewContent", custom);
  }, [contentId, contentName, contentType, contentCategory, value, currency]);

  return null;
}
