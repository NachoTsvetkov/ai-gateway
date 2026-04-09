import { getVisualStylistCatalog } from "lib/visual-stylist-catalog.server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await getVisualStylistCatalog();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
