import { createHash } from "node:crypto";

/** SHA-256 hex digest for CAPI customer information parameters. */
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Meta: lowercase, trim whitespace. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Meta: digits only, include country code, strip leading 00 international prefix.
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */
export function normalizePhone(phone: string): string | undefined {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("00")) digits = digits.slice(2);
  return digits;
}

/** Meta: lowercase, trim, remove punctuation and whitespace. */
export function normalizeName(name: string): string | undefined {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}]/gu, "");
  return normalized || undefined;
}

/** CAPI expects hashed PII as arrays of SHA-256 strings. */
export function hashedArray(normalized: string | undefined): string[] | undefined {
  if (!normalized) return undefined;
  return [sha256(normalized)];
}
