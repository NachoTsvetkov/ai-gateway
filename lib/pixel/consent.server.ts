import "server-only";

import { cookies } from "next/headers";
import {
  CONSENT_COOKIE,
  isConsentValue,
  type ConsentValue,
} from "./consent";

/**
 * Server-side counterpart to `readConsentClient()`. Same value
 * vocabulary, just sourced from the request's cookie jar so server
 * components / route handlers can decide whether to render
 * tracking-aware UI before the page hydrates.
 */
export async function readConsentServer(): Promise<ConsentValue | null> {
  const value = (await cookies()).get(CONSENT_COOKIE)?.value;
  return isConsentValue(value) ? value : null;
}
