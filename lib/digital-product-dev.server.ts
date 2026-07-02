import {
  isDigitalProductLibraryPreviewEnabled,
  isProductionDeploy,
} from "./digital-product-auth.server";

/** Dev-only helpers for digital product checkout / library preview. Never enabled in production. */

export function isDigitalProductDevCheckoutEnabled(): boolean {
  if (isProductionDeploy()) return false;
  return process.env.DIGITAL_PRODUCT_DEV_CHECKOUT === "1";
}

export { isDigitalProductLibraryPreviewEnabled, isProductionDeploy };
