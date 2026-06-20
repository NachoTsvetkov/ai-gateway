import type { Currency } from "lib/currency";

/** Display currency resolved server-side from geo headers (`data-currency` on `<html>`). */
export function getClientCurrency(): Currency {
  if (typeof document === "undefined") return "EUR";
  return document.documentElement.dataset.currency === "USD" ? "USD" : "EUR";
}
