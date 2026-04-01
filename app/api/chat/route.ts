import {
  gateway,
  streamText,
  UIMessage,
  convertToModelMessages,
} from "ai";
import { getProducts } from "lib/shopify";
import { Product } from "lib/shopify/types";

function formatProductCatalog(products: Product[]): string {
  return products
    .map(
      (p) =>
        `- "${p.title}" (handle: ${p.handle})` +
        `: ${p.description.slice(0, 150)}` +
        ` | Price: $${parseFloat(p.priceRange.minVariantPrice.amount).toFixed(2)} ${p.priceRange.minVariantPrice.currencyCode}` +
        ` | Available: ${p.availableForSale}` +
        (p.tags.length ? ` | Tags: ${p.tags.join(", ")}` : ""),
    )
    .join("\n");
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  let catalog = "";
  try {
    const products = await getProducts({});
    catalog = formatProductCatalog(products);
  } catch {
    catalog = "(Product catalog unavailable — Shopify not connected)";
  }

  const result = streamText({
    model: gateway("openai/gpt-4o-mini"),
    system: `You are a friendly, expert AI shopping assistant for an online store.
You help customers find products, compare options, and make purchase decisions.

CURRENT PRODUCT CATALOG:
${catalog}

CRITICAL FORMATTING RULES:
- When recommending a product, ALWAYS include a markdown link in this EXACT format: [Product Name](/product/handle-here)
- The link MUST be a relative path starting with /product/ followed by the handle. NEVER use https:// or any domain.
- When recommending multiple products, list each on its own line with its link.
- Always mention the price when recommending products.

BEHAVIOR GUIDELINES:
- Be warm, concise, and helpful. Keep responses under 150 words.
- Recommend 2-3 products when asked for suggestions.
- The user can add recommended products to their cart directly from the chat.
- If asked about products not in the catalog, suggest similar items that ARE available.
- You can help with styling advice, gift ideas, and product comparisons.
- Start conversations warmly: "Great question!" or "I'd love to help with that!"`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
