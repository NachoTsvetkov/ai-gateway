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
        `- "${p.title}" (${p.handle}): ${p.description.slice(0, 200)}` +
        ` | Price: ${p.priceRange.minVariantPrice.amount} ${p.priceRange.minVariantPrice.currencyCode}` +
        ` | Available: ${p.availableForSale}` +
        (p.tags.length ? ` | Tags: ${p.tags.join(", ")}` : "")
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
    system: `You are a friendly, knowledgeable shopping assistant for an online store.
You help customers find products, compare options, and make purchase decisions.

CURRENT PRODUCT CATALOG:
${catalog}

GUIDELINES:
- Recommend products from the catalog above based on the customer's needs.
- When recommending a product, always include its name and a link formatted as [Product Name](/product/{handle}).
- Be concise but helpful. Keep responses under 150 words.
- If asked about products not in the catalog, let the customer know and suggest similar items that ARE available.
- You can help with sizing, styling advice, and product comparisons.
- Be warm and conversational, not robotic.`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
