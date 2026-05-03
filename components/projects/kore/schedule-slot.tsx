"use client";

import {
  KORE_PREFILL_EVENT,
  type KorePrefillDetail,
} from "lib/kore-events";

/**
 * Single bookable session in the KORE schedule grid.
 *
 * Visually identical to the original static row, but now actually
 * clickable: tapping a slot composes a natural-language booking
 * request, dispatches a `kore:prefill-chat` custom event, and scrolls
 * to the live AI receptionist on the same page. The receptionist
 * (`KoreReceptionist`) listens for the same event and auto-sends the
 * message — turning the schedule into a one-tap booking flow.
 *
 * FULL slots are rendered as a non-interactive `<span>` so the cursor
 * + keyboard focus correctly skip them, and screen readers don't
 * announce them as actionable.
 */
export function ScheduleSlot({
  day,
  date,
  time,
  name,
  coach,
  spots,
}: {
  day: string;
  date: string;
  time: string;
  name: string;
  coach: string;
  spots: number;
}) {
  const full = spots === 0;

  if (full) {
    return (
      <span className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2 text-xs text-neutral-400 line-through">
        <span className="font-mono font-bold">{time}</span>
        <span className="flex-1 truncate font-semibold">{name}</span>
        <span className="font-bold">FULL</span>
      </span>
    );
  }

  function handleClick() {
    // Compose the request the AI receptionist will receive. We keep
    // the format predictable (day · date · time · class · coach) so
    // the model can echo it back verbatim when confirming the
    // booking.
    const text = `Book me into ${day} ${date} · ${time} · ${name} with ${coach}.`;
    const detail: KorePrefillDetail = { text };
    window.dispatchEvent(
      new CustomEvent<KorePrefillDetail>(KORE_PREFILL_EVENT, { detail }),
    );
    // Smooth scroll to the receptionist. `scroll-smooth` is already
    // on the <html> element so an anchor change would also smooth-
    // scroll, but `scrollIntoView` keeps the URL hash clean.
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Book ${day} ${date} at ${time} — ${name} with ${coach}`}
      className="flex w-full items-center justify-between gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-left text-xs text-neutral-900 transition-all hover:-translate-y-0.5 hover:border-orange-500 hover:bg-orange-100 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-orange-500"
    >
      <span className="font-mono font-bold">{time}</span>
      <span className="flex-1 truncate font-semibold">{name}</span>
      <span className="font-bold text-orange-700">{spots} left</span>
    </button>
  );
}
