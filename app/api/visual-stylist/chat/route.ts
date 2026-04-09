import {
  convertToModelMessages,
  gateway,
  streamText,
  UIMessage,
} from "ai";
import { formatCatalogForPrompt } from "lib/visual-stylist-catalog.shared";
import { getVisualStylistCatalog } from "lib/visual-stylist-catalog.server";

export const maxDuration = 120;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const products = await getVisualStylistCatalog();
  const catalog = formatCatalogForPrompt(products);

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: gateway("openai/gpt-4o"),
    system: `You are the Multi-Modal Visual Stylist — an expert shopping assistant with GPT-4o vision.
You analyze photos the user uploads (outfits, accessories, scenes) and match them to products using RAG over the catalog below.

SHOPIFY CATALOG (RAG — only recommend from these handles):
${catalog}

CRITICAL FORMATTING:
- When recommending a product, ALWAYS include a markdown link in this EXACT format: [Product Name](/product/handle-here)
- The link MUST be a relative path starting with /product/ followed by the handle. NEVER use https:// or any domain.
- Put each product on its own line when listing several.
- Always mention price when recommending.

VISION + STYLE RULES:
- Describe what you see briefly (colors, materials, vibe) when an image is present.
- Recommend 2–5 products: mix visually similar items and complementary pieces (e.g. bag + shoes).
- If the user asks for eco-friendly alternatives, prefer items whose tags mention eco, organic, recycled, or sustainable.
- If the image is unclear, say so politely and still suggest catalog items that fit the user's text request.
- Keep the main reply under 200 words. Be warm and concise.`,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
