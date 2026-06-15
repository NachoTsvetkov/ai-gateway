// Persist visitor PII for Meta advanced matching (browser pixel + CAPI).
// Stored in sessionStorage after consent — cleared when the tab closes.

import type { PixelUserData } from "./types";
import { normalizePhone } from "./normalize";

const STORAGE_KEY = "meta_pixel_user";

export function getStoredPixelUserData(): PixelUserData {
  if (typeof sessionStorage === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PixelUserData;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/** Merge into session storage when the visitor provides PII (lead form, checkout). */
export function setStoredPixelUserData(partial: PixelUserData): void {
  if (typeof sessionStorage === "undefined") return;
  const merged = mergePixelUserData(getStoredPixelUserData(), partial);
  if (!hasAnyUserField(merged)) return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

export function mergePixelUserData(
  base: PixelUserData,
  override?: PixelUserData,
): PixelUserData {
  if (!override) return { ...base };
  return {
    email: override.email?.trim() || base.email,
    phone: override.phone?.trim() || base.phone,
    firstName: override.firstName?.trim() || base.firstName,
    lastName: override.lastName?.trim() || base.lastName,
  };
}

function hasAnyUserField(user: PixelUserData): boolean {
  return Boolean(
    user.email?.trim() ||
      user.phone?.trim() ||
      user.firstName?.trim() ||
      user.lastName?.trim(),
  );
}

/**
 * Advanced matching for the browser pixel (`fbq`). Meta hashes em/ph/fn/ln
 * automatically; fb_login_id and external_id are sent as-is.
 * @see https://developers.facebook.com/docs/meta-pixel/advanced/advanced-matching
 */
export function buildBrowserAdvancedMatching(
  user: PixelUserData,
  fbLoginId?: string,
  externalId?: string,
): Record<string, string> {
  const out: Record<string, string> = {};

  const email = user.email?.trim().toLowerCase();
  if (email) out.em = email;

  const phone = user.phone ? normalizePhone(user.phone) : undefined;
  if (phone) out.ph = phone;

  const fn = user.firstName?.trim().toLowerCase();
  if (fn) out.fn = fn;

  const ln = user.lastName?.trim().toLowerCase();
  if (ln) out.ln = ln;

  if (fbLoginId) out.fb_login_id = fbLoginId;
  if (externalId) out.external_id = externalId;

  return out;
}
