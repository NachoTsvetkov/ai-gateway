import type { Image, Money, Product } from "lib/shopify/types";

/** Synthetic variant IDs — cart uses optimistic UI only (no Shopify line item). */
export const DEMO_VARIANT_PREFIX =
  "gid://shopify/ProductVariant/visual-stylist-demo";

export function isDemoVariantId(id: string | undefined): boolean {
  return !!id && id.includes("visual-stylist-demo");
}

export type VisualStylistCatalogProduct = Omit<
  Pick<
    Product,
    | "id"
    | "handle"
    | "title"
    | "description"
    | "availableForSale"
    | "priceRange"
    | "tags"
    | "featuredImage"
  >,
  "featuredImage"
> & {
  featuredImage: Image | null;
  variants: Pick<
    Product["variants"][number],
    "id" | "title" | "availableForSale" | "price" | "selectedOptions"
  >[];
};

const demoMoney = (amount: string): Money => ({
  amount,
  currencyCode: "USD",
});

function demoPriceRange(amount: string) {
  const m = demoMoney(amount);
  return { minVariantPrice: m, maxVariantPrice: m };
}

/**
 * Static catalog for portfolio demos when Shopify is unavailable.
 * Images are from Unsplash (configured in next.config).
 */
export const DUMMY_VISUAL_PRODUCTS: VisualStylistCatalogProduct[] = [
  {
    id: "gid://shopify/Product/visual-dummy-1",
    handle: "atlas-leather-tote",
    title: "Atlas Leather Tote",
    description:
      "Structured Italian leather tote with brass hardware. Minimal silhouette for work and travel.",
    availableForSale: true,
    featuredImage: {
      url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
      altText: "Leather tote bag",
      width: 800,
      height: 1000,
    },
    priceRange: demoPriceRange("189.00"),
    variants: [
      {
        id: `${DEMO_VARIANT_PREFIX}-1`,
        title: "Cognac / Default",
        availableForSale: true,
        price: demoMoney("189.00"),
        selectedOptions: [
          { name: "Color", value: "Cognac" },
          { name: "Size", value: "Medium" },
        ],
      },
    ],
    tags: ["leather", "bag", "work", "minimal", "accessories"],
  },
  {
    id: "gid://shopify/Product/visual-dummy-2",
    handle: "nova-chronograph-watch",
    title: "Nova Chronograph Watch",
    description:
      "Solar-powered chronograph with sapphire glass and recycled steel bracelet.",
    availableForSale: true,
    featuredImage: {
      url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
      altText: "Chronograph watch",
      width: 800,
      height: 1000,
    },
    priceRange: demoPriceRange("329.00"),
    variants: [
      {
        id: `${DEMO_VARIANT_PREFIX}-2`,
        title: "Steel / Black dial",
        availableForSale: true,
        price: demoMoney("329.00"),
        selectedOptions: [
          { name: "Finish", value: "Steel" },
          { name: "Dial", value: "Black" },
        ],
      },
    ],
    tags: ["watch", "chronograph", "steel", "accessories", "gift"],
  },
  {
    id: "gid://shopify/Product/visual-dummy-3",
    handle: "ridge-trail-sneaker",
    title: "Ridge Trail Sneaker",
    description:
      "Breathable knit upper with cork insole and recycled rubber outsole.",
    availableForSale: true,
    featuredImage: {
      url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      altText: "Sneakers",
      width: 800,
      height: 1000,
    },
    priceRange: demoPriceRange("129.00"),
    variants: [
      {
        id: `${DEMO_VARIANT_PREFIX}-3`,
        title: "Ocean / 10",
        availableForSale: true,
        price: demoMoney("129.00"),
        selectedOptions: [
          { name: "Color", value: "Ocean" },
          { name: "Size", value: "10" },
        ],
      },
    ],
    tags: ["sneakers", "eco", "outdoor", "shoes", "sustainable"],
  },
  {
    id: "gid://shopify/Product/visual-dummy-4",
    handle: "ember-wool-coat",
    title: "Ember Wool Coat",
    description:
      "Double-faced merino wool coat with hidden placket and relaxed fit.",
    availableForSale: true,
    featuredImage: {
      url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80",
      altText: "Wool coat",
      width: 800,
      height: 1000,
    },
    priceRange: demoPriceRange("279.00"),
    variants: [
      {
        id: `${DEMO_VARIANT_PREFIX}-4`,
        title: "Camel / M",
        availableForSale: true,
        price: demoMoney("279.00"),
        selectedOptions: [
          { name: "Color", value: "Camel" },
          { name: "Size", value: "M" },
        ],
      },
    ],
    tags: ["coat", "wool", "outerwear", "winter", "neutral"],
  },
  {
    id: "gid://shopify/Product/visual-dummy-5",
    handle: "solstice-sunglasses",
    title: "Solstice Sunglasses",
    description:
      "Polarized bio-acetate frames with gradient lenses and UV400 protection.",
    availableForSale: true,
    featuredImage: {
      url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
      altText: "Sunglasses",
      width: 800,
      height: 1000,
    },
    priceRange: demoPriceRange("98.00"),
    variants: [
      {
        id: `${DEMO_VARIANT_PREFIX}-5`,
        title: "Tortoise / Standard",
        availableForSale: true,
        price: demoMoney("98.00"),
        selectedOptions: [
          { name: "Frame", value: "Tortoise" },
          { name: "Lens", value: "Gradient" },
        ],
      },
    ],
    tags: ["sunglasses", "summer", "accessories", "polarized"],
  },
  {
    id: "gid://shopify/Product/visual-dummy-6",
    handle: "pacific-organic-tee",
    title: "Pacific Organic Tee",
    description:
      "GOTS-certified organic cotton tee with garment-dyed finish and relaxed crew neck.",
    availableForSale: true,
    featuredImage: {
      url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      altText: "Organic t-shirt",
      width: 800,
      height: 1000,
    },
    priceRange: demoPriceRange("42.00"),
    variants: [
      {
        id: `${DEMO_VARIANT_PREFIX}-6`,
        title: "Sage / L",
        availableForSale: true,
        price: demoMoney("42.00"),
        selectedOptions: [
          { name: "Color", value: "Sage" },
          { name: "Size", value: "L" },
        ],
      },
    ],
    tags: ["organic", "tee", "eco-friendly", "basics", "cotton"],
  },
  {
    id: "gid://shopify/Product/visual-dummy-7",
    handle: "vertex-backpack",
    title: "Vertex Roll-Top Backpack",
    description:
      "Water-resistant recycled nylon roll-top backpack with laptop sleeve.",
    availableForSale: true,
    featuredImage: {
      url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      altText: "Backpack",
      width: 800,
      height: 1000,
    },
    priceRange: demoPriceRange("115.00"),
    variants: [
      {
        id: `${DEMO_VARIANT_PREFIX}-7`,
        title: "Black / 22L",
        availableForSale: true,
        price: demoMoney("115.00"),
        selectedOptions: [
          { name: "Color", value: "Black" },
          { name: "Volume", value: "22L" },
        ],
      },
    ],
    tags: ["backpack", "commute", "recycled", "travel", "eco"],
  },
  {
    id: "gid://shopify/Product/visual-dummy-8",
    handle: "linen-wide-pants",
    title: "Drift Linen Wide Pants",
    description:
      "High-rise wide-leg linen blend pants with elastic waist and side pockets.",
    availableForSale: true,
    featuredImage: {
      url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
      altText: "Linen pants",
      width: 800,
      height: 1000,
    },
    priceRange: demoPriceRange("78.00"),
    variants: [
      {
        id: `${DEMO_VARIANT_PREFIX}-8`,
        title: "Sand / M",
        availableForSale: true,
        price: demoMoney("78.00"),
        selectedOptions: [
          { name: "Color", value: "Sand" },
          { name: "Size", value: "M" },
        ],
      },
    ],
    tags: ["linen", "pants", "summer", "neutral", "comfort"],
  },
];

export function formatCatalogForPrompt(
  products: VisualStylistCatalogProduct[],
): string {
  return products
    .map(
      (p) =>
        `- "${p.title}" (handle: ${p.handle})` +
        `: ${p.description.slice(0, 180)}` +
        ` | Price: $${parseFloat(p.priceRange.minVariantPrice.amount).toFixed(2)} ${p.priceRange.minVariantPrice.currencyCode}` +
        ` | Available: ${p.availableForSale}` +
        (p.tags.length ? ` | Tags: ${p.tags.join(", ")}` : ""),
    )
    .join("\n");
}
