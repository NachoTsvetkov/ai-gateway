import {
  convertToModelMessages,
  gateway,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from "ai";
import { z } from "zod";
import { getProducts, getProduct, getCart, addToCart } from "lib/shopify";
import type { Product } from "lib/shopify/types";

export const maxDuration = 120;

function formatProduct(p: Product) {
  return {
    handle: p.handle,
    title: p.title,
    description: p.description.slice(0, 200),
    price: `$${parseFloat(p.priceRange.minVariantPrice.amount).toFixed(2)}`,
    available: p.availableForSale,
    variantId: p.variants[0]?.id,
    tags: p.tags,
  };
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: gateway("openai/gpt-4o"),
    system: `You are the Autonomous Agentic Commerce Bot — an AI shopping agent that doesn't just talk, it ACTS.
You have real tools to search the Shopify catalog, inspect product details, manage a cart, and initiate checkout.

TOOL-USE RULES:
- ALWAYS use searchProducts when the user asks about products, recommendations, or prices.
- Use getProductDetails for deep info on a specific item.
- Use addToCart to add items — always confirm what you added afterward.
- Use getCart to show the current cart contents.
- Use initiateCheckout when the user wants to check out — reply with the checkout URL.
- Chain multiple tool calls when needed (e.g., search → add the best match → confirm).

FORMATTING:
- When mentioning a product, include a markdown link: [Product Name](/product/handle)
- Always mention prices.
- After adding to cart, summarize what was added and the running total if known.
- Keep responses concise (under 200 words).

SAFETY:
- Before initiateCheckout, confirm the cart contents with the user.
- If asked to do something outside shopping (payments, personal data), politely decline and offer a human handoff.
- Always note: "This is a demo — no real charges will be made."`,
    tools: {
      searchProducts: tool({
        description:
          "Search the Shopify product catalog by keyword. Returns matching products with prices.",
        inputSchema: z.object({
          query: z
            .string()
            .describe(
              "Search query, e.g. 'noise-cancelling headphones under $300'",
            ),
        }),
        execute: async ({ query }) => {
          try {
            const products = await getProducts({ query });
            return {
              results: products.map(formatProduct),
              count: products.length,
            };
          } catch {
            const products = await getProducts({});
            const lower = query.toLowerCase();
            const filtered = products.filter(
              (p) =>
                p.title.toLowerCase().includes(lower) ||
                p.description.toLowerCase().includes(lower) ||
                p.tags.some((t) => t.toLowerCase().includes(lower)),
            );
            return {
              results: (filtered.length > 0 ? filtered : products)
                .slice(0, 8)
                .map(formatProduct),
              count: filtered.length || products.length,
            };
          }
        },
      }),

      getProductDetails: tool({
        description:
          "Get full details for a specific product by its handle (slug).",
        inputSchema: z.object({
          handle: z
            .string()
            .describe("Product handle, e.g. 'classic-leather-backpack'"),
        }),
        execute: async ({ handle }) => {
          try {
            const product = await getProduct(handle);
            if (!product) return { error: "Product not found" };
            return {
              handle: product.handle,
              title: product.title,
              description: product.description,
              price: `$${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}`,
              available: product.availableForSale,
              variants: product.variants.map((v) => ({
                id: v.id,
                title: v.title,
                price: `$${parseFloat(v.price.amount).toFixed(2)}`,
                available: v.availableForSale,
              })),
              tags: product.tags,
              imageUrl: product.featuredImage?.url,
            };
          } catch {
            return { error: "Could not fetch product details" };
          }
        },
      }),

      addToCart: tool({
        description:
          "Add a product variant to the shopping cart. Use the variantId from searchProducts or getProductDetails.",
        inputSchema: z.object({
          variantId: z.string().describe("Shopify variant GID"),
          quantity: z.number().int().min(1).default(1),
        }),
        execute: async ({ variantId, quantity }) => {
          try {
            const cart = await addToCart([
              { merchandiseId: variantId, quantity },
            ]);
            return {
              success: true,
              totalQuantity: cart.totalQuantity,
              total: `$${parseFloat(cart.cost.totalAmount.amount).toFixed(2)}`,
              items: cart.lines.map((l) => ({
                title: l.merchandise.product.title,
                quantity: l.quantity,
                amount: `$${parseFloat(l.cost.totalAmount.amount).toFixed(2)}`,
              })),
            };
          } catch {
            return {
              success: false,
              error:
                "Could not add to cart — this may be a demo environment without an active cart session.",
            };
          }
        },
      }),

      getCart: tool({
        description: "Retrieve the current shopping cart contents and total.",
        inputSchema: z.object({}),
        execute: async () => {
          try {
            const cart = await getCart();
            if (!cart || cart.lines.length === 0) {
              return { empty: true, message: "Cart is empty" };
            }
            return {
              empty: false,
              totalQuantity: cart.totalQuantity,
              total: `$${parseFloat(cart.cost.totalAmount.amount).toFixed(2)}`,
              items: cart.lines.map((l) => ({
                title: l.merchandise.product.title,
                quantity: l.quantity,
                amount: `$${parseFloat(l.cost.totalAmount.amount).toFixed(2)}`,
              })),
              checkoutUrl: cart.checkoutUrl,
            };
          } catch {
            return { empty: true, message: "Could not fetch cart" };
          }
        },
      }),

      initiateCheckout: tool({
        description:
          "Get the Shopify checkout URL so the user can complete their purchase.",
        inputSchema: z.object({}),
        execute: async () => {
          try {
            const cart = await getCart();
            if (!cart || cart.lines.length === 0) {
              return {
                success: false,
                message: "Cart is empty — add items first.",
              };
            }
            return {
              success: true,
              checkoutUrl: cart.checkoutUrl,
              total: `$${parseFloat(cart.cost.totalAmount.amount).toFixed(2)}`,
              disclaimer:
                "This is a demo store — no real charges will be made.",
            };
          } catch {
            return {
              success: false,
              message: "Could not initiate checkout.",
            };
          }
        },
      }),
    },
    stopWhen: stepCountIs(5),
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
