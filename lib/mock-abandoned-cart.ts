export type AbandonedCartItem = {
  title: string;
  handle: string;
  variant: string;
  price: number;
  quantity: number;
  imageUrl: string;
  tags: string[];
};

export const ABANDONED_CART: AbandonedCartItem[] = [
  {
    title: "Wireless Noise-Cancelling Headphones",
    handle: "wireless-noise-cancelling-headphones",
    variant: "Matte Black",
    price: 249,
    quantity: 1,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
    tags: ["electronics", "audio", "premium"],
  },
  {
    title: "Classic Leather Backpack",
    handle: "classic-leather-backpack",
    variant: "Cognac",
    price: 189,
    quantity: 1,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop",
    tags: ["bags", "leather", "everyday-carry"],
  },
  {
    title: "Minimalist Watch - Midnight",
    handle: "minimalist-watch-midnight",
    variant: "40mm / Black Mesh",
    price: 159,
    quantity: 1,
    imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200&h=200&fit=crop",
    tags: ["accessories", "watches", "minimalist"],
  },
];

export function getCartTotal(): number {
  return ABANDONED_CART.reduce((s, i) => s + i.price * i.quantity, 0);
}

export function formatAbandonedCartForPrompt(): string {
  const total = getCartTotal();
  const lines = ABANDONED_CART.map(
    (i) =>
      `- ${i.title} (${i.variant}) — $${i.price} x${i.quantity} [tags: ${i.tags.join(", ")}]`,
  );

  return `ABANDONED CART:
${lines.join("\n")}
Cart total: $${total}
Items left: ${ABANDONED_CART.length}
Time since abandonment: 47 minutes
Customer profile: returning visitor, browsed premium + minimalist categories, previous order history $312

AVAILABLE OFFERS:
- 10% off entire cart (code: COMEBACK10)
- Free express shipping on orders over $400
- Buy 2+ items, get 15% off (code: BUNDLE15)
- Limited stock alert: Headphones have only 3 left in Matte Black`;
}
