import { getProducts } from "lib/shopify";
import type { Product } from "lib/shopify/types";
import {
  DUMMY_VISUAL_PRODUCTS,
  type VisualStylistCatalogProduct,
} from "lib/visual-stylist-catalog.shared";

function simplifyProduct(p: Product): VisualStylistCatalogProduct {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    availableForSale: p.availableForSale,
    featuredImage: p.featuredImage ?? null,
    priceRange: p.priceRange,
    variants: p.variants.map((v) => ({
      id: v.id,
      title: v.title,
      availableForSale: v.availableForSale,
      price: v.price,
      selectedOptions: v.selectedOptions,
    })),
    tags: p.tags,
  };
}

/**
 * Prefer live Shopify products when the store is connected; otherwise use the static demo catalog.
 */
export async function getVisualStylistCatalog(): Promise<
  VisualStylistCatalogProduct[]
> {
  try {
    const products = await getProducts({});
    if (products.length > 0) {
      return products.map(simplifyProduct);
    }
  } catch {
    /* use dummy */
  }
  return DUMMY_VISUAL_PRODUCTS;
}
