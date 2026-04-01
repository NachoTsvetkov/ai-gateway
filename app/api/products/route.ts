import { getProducts } from "lib/shopify";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await getProducts({});
    const simplified = products.map((p) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      description: p.description.slice(0, 200),
      availableForSale: p.availableForSale,
      featuredImage: p.featuredImage,
      priceRange: p.priceRange,
      variants: p.variants.map((v) => ({
        id: v.id,
        title: v.title,
        availableForSale: v.availableForSale,
        price: v.price,
        selectedOptions: v.selectedOptions,
      })),
      tags: p.tags,
    }));
    return NextResponse.json(simplified);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
