/** Dev-only helpers for digital product checkout / library preview. Never enabled in production. */

export function isDigitalProductDevCheckoutEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.DIGITAL_PRODUCT_DEV_CHECKOUT === "1"
  );
}

export function isDigitalProductLibraryPreviewEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.DIGITAL_PRODUCT_LIBRARY_PREVIEW === "1"
  );
}
