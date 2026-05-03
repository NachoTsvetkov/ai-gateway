/**
 * Shared event constant + payload type for the KORE studio demo.
 *
 * The studio page's schedule slots dispatch a window CustomEvent
 * with the visitor's intended booking; the live AI receptionist
 * widget (`KoreReceptionist`) listens for the same event and
 * auto-sends the prefilled message into the chat.
 *
 * Keeping the constant + type colocated avoids two-file drift.
 */
export const KORE_PREFILL_EVENT = "kore:prefill-chat" as const;

export type KorePrefillDetail = {
  /** Natural-language booking request the receptionist should send. */
  text: string;
};

// Augment the global WindowEventMap so addEventListener / dispatchEvent
// stay type-checked at every call site without `as` casts. We use the
// string literal here (rather than the `[KORE_PREFILL_EVENT]` computed
// form) because not every TypeScript config supports const-named keys
// inside ambient interface declarations.
declare global {
  interface WindowEventMap {
    "kore:prefill-chat": CustomEvent<KorePrefillDetail>;
  }
}
