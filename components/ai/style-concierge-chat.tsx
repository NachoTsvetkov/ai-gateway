"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { addItem } from "components/cart/actions";
import { useCart } from "components/cart/cart-context";
import type { Product, ProductVariant } from "lib/shopify/types";
import {
  isDemoVariantId,
  type VisualStylistCatalogProduct,
} from "lib/visual-stylist-catalog.shared";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Style me for a weekend trip",
  "I need a date night outfit",
  "Eco-friendly work look under $300",
  "Build me a minimalist capsule",
  "Gift ideas for a watch lover",
];

function extractProductHandles(text: string): string[] {
  const matches = text.matchAll(/\[([^\]]+)\]\(\/product\/([^)]+)\)/g);
  return [...matches].map((m) => m[2]!);
}

function ProductCard({
  product,
  onAddToCart,
  adding,
}: {
  product: VisualStylistCatalogProduct;
  onAddToCart: (product: VisualStylistCatalogProduct) => void;
  adding: boolean;
}) {
  const img = product.featuredImage;
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
      <Link
        href={`/product/${product.handle}`}
        className="relative block aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-700"
      >
        {img?.url && (
          <Image
            src={img.url}
            alt={img.altText || product.title}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(min-width: 768px) 180px, 45vw"
          />
        )}
      </Link>
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-1">
          <Link
            href={`/product/${product.handle}`}
            className="line-clamp-2 text-xs font-semibold leading-tight text-neutral-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
          >
            {product.title}
          </Link>
          <span className="shrink-0 text-xs font-bold text-blue-600 dark:text-blue-400">
            ${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          disabled={adding || !product.availableForSale}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-blue-600 px-2 py-1.5 text-[11px] font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-50"
        >
          {adding ? (
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:300ms]" />
            </span>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3 w-3"
              >
                <path d="M10 5a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 10 5Z" />
              </svg>
              {product.availableForSale ? "Add" : "Out"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function formatHtml(text: string): string {
  let out = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label, url) => {
      const cleanUrl = url.replace(/^https?:\/\/[^/]+/, "");
      return `<a href="${cleanUrl}" class="font-medium text-blue-600 dark:text-blue-400 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300">${label}</a>`;
    },
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\n/g, "<br/>");
  return out;
}

function AssistantMessage({
  parts,
  catalog,
  onAddToCart,
  addingHandle,
  onAddAll,
  addingAll,
  onSaveLook,
}: {
  parts: Array<{ type: string; text?: string }>;
  catalog: Map<string, VisualStylistCatalogProduct>;
  onAddToCart: (product: VisualStylistCatalogProduct) => void;
  addingHandle: string | null;
  onAddAll: (products: VisualStylistCatalogProduct[]) => void;
  addingAll: boolean;
  onSaveLook: (products: VisualStylistCatalogProduct[]) => void;
}) {
  const text = parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("");

  if (!text) return null;

  const handles = extractProductHandles(text);
  const recommended = handles
    .map((h) => catalog.get(h))
    .filter(Boolean) as VisualStylistCatalogProduct[];

  return (
    <div className="mb-3">
      <div className="flex justify-start">
        <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-3.5 w-3.5 text-white"
          >
            <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
        </div>
        <div
          className="max-w-[85%] rounded-2xl bg-neutral-100 px-4 py-2.5 text-sm leading-relaxed text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
          dangerouslySetInnerHTML={{ __html: formatHtml(text) }}
        />
      </div>
      {recommended.length > 0 && (
        <div className="ml-8 mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {recommended.map((product) => (
              <ProductCard
                key={product.handle}
                product={product}
                onAddToCart={onAddToCart}
                adding={addingHandle === product.handle}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAddAll(recommended)}
              disabled={addingAll}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:from-blue-500 hover:to-violet-500 disabled:opacity-50"
            >
              {addingAll ? "Adding…" : "Add full outfit to cart"}
            </button>
            <button
              type="button"
              onClick={() => onSaveLook(recommended)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-all hover:border-blue-300 hover:text-blue-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
            >
              Save this look
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return text ? (
    <div className="mb-3 flex justify-end">
      <div className="max-w-[85%] rounded-2xl bg-blue-600 px-4 py-2.5 text-sm leading-relaxed text-white">
        {text}
      </div>
    </div>
  ) : null;
}

function TypingIndicator() {
  return (
    <div className="mb-3 flex items-start justify-start">
      <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-3.5 w-3.5 text-white"
        >
          <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
      </div>
      <div className="flex gap-1.5 rounded-2xl bg-neutral-100 px-4 py-3 dark:bg-neutral-800">
        <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function SavedLookCard({
  products,
  index,
  onDismiss,
}: {
  products: VisualStylistCatalogProduct[];
  index: number;
  onDismiss: () => void;
}) {
  const total = products.reduce(
    (s, p) => s + parseFloat(p.priceRange.minVariantPrice.amount),
    0,
  );
  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/80 p-3 dark:border-violet-800/50 dark:bg-violet-900/10">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-violet-700 dark:text-violet-300">
          Saved Look #{index + 1} &middot; {products.length} items &middot; $
          {total.toFixed(2)}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[10px] text-violet-400 hover:text-violet-600 dark:hover:text-violet-300"
        >
          dismiss
        </button>
      </div>
      <div className="mt-2 flex gap-1.5">
        {products.map((p) => (
          <div
            key={p.handle}
            className="relative h-10 w-10 overflow-hidden rounded-lg border border-violet-200 dark:border-violet-700"
          >
            {p.featuredImage?.url && (
              <Image
                src={p.featuredImage.url}
                alt={p.title}
                fill
                className="object-cover"
                sizes="40px"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StyleConciergeChat() {
  const [inputValue, setInputValue] = useState("");
  const [addingHandle, setAddingHandle] = useState<string | null>(null);
  const [addingAll, setAddingAll] = useState(false);
  const [catalog, setCatalog] = useState<
    Map<string, VisualStylistCatalogProduct>
  >(new Map());
  const [savedLooks, setSavedLooks] = useState<
    VisualStylistCatalogProduct[][]
  >([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const catalogFetched = useRef(false);
  const [, startTransition] = useTransition();

  const { addCartItem } = useCart();

  const { messages, sendMessage, error, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/style-concierge/chat",
    }),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (catalogFetched.current) return;
    catalogFetched.current = true;
    fetch("/api/visual-stylist/catalog")
      .then((r) => r.json())
      .then((products: VisualStylistCatalogProduct[]) => {
        const map = new Map<string, VisualStylistCatalogProduct>();
        for (const p of products) map.set(p.handle, p);
        setCatalog(map);
      })
      .catch(() => {});
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom, busy]);

  const buildFullProduct = useCallback(
    (product: VisualStylistCatalogProduct): Product => {
      return {
        ...product,
        descriptionHtml: "",
        options: [],
        images: product.featuredImage ? [product.featuredImage] : [],
        seo: { title: product.title, description: product.description },
        updatedAt: new Date().toISOString(),
        variants: product.variants.map((v) => ({
          ...v,
          availableForSale: v.availableForSale ?? true,
        })),
      } as Product;
    },
    [],
  );

  const handleAddToCart = useCallback(
    (product: VisualStylistCatalogProduct) => {
      const variant = product.variants[0];
      if (!variant) return;
      setAddingHandle(product.handle);
      const fullProduct = buildFullProduct(product);
      startTransition(() => {
        addCartItem(variant as ProductVariant, fullProduct);
      });
      if (isDemoVariantId(variant.id)) {
        toast.success("Added to cart (demo product preview)");
        setAddingHandle(null);
        return;
      }
      addItem(null, variant.id).finally(() => setAddingHandle(null));
    },
    [addCartItem, buildFullProduct, startTransition],
  );

  const handleAddAll = useCallback(
    async (products: VisualStylistCatalogProduct[]) => {
      setAddingAll(true);
      try {
        for (const p of products) {
          const variant = p.variants[0];
          if (!variant) continue;
          const fullProduct = buildFullProduct(p);
          startTransition(() => {
            addCartItem(variant as ProductVariant, fullProduct);
          });
          if (!isDemoVariantId(variant.id)) {
            await addItem(null, variant.id);
          }
        }
        toast.success(
          products.some((p) => isDemoVariantId(p.variants[0]?.id))
            ? "Full outfit added (includes demo items)"
            : "Full outfit added to cart",
        );
      } finally {
        setAddingAll(false);
      }
    },
    [addCartItem, buildFullProduct, startTransition],
  );

  const handleSaveLook = useCallback(
    (products: VisualStylistCatalogProduct[]) => {
      setSavedLooks((prev) => [...prev, products]);
      toast.success("Look saved!");
    },
    [],
  );

  const handleSuggestion = (text: string) => {
    if (busy) return;
    void sendMessage({ text });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || busy) return;
    setInputValue("");
    await sendMessage({ text });
  };

  return (
    <div className="flex h-[min(720px,calc(100vh-220px))] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5 text-white"
          >
            <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l2.3 2.3a2.4 2.4 0 0 0 3.4 0l.3-.3a2.4 2.4 0 0 0 0-3.4L15.7 14H20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4.3l-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            Personalized Style Concierge
          </p>
          <p className="text-xs text-blue-100">
            AI stylist &middot; Quiz, outfits &amp; cart
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {savedLooks.length > 0 && (
          <div className="mb-4 space-y-2">
            {savedLooks.map((look, i) => (
              <SavedLookCard
                key={i}
                products={look}
                index={i}
                onDismiss={() =>
                  setSavedLooks((prev) => prev.filter((_, j) => j !== i))
                }
              />
            ))}
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-900/30 dark:to-violet-900/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="h-7 w-7 text-blue-600 dark:text-blue-400"
              >
                <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Your personal AI shopping stylist
            </p>
            <p className="mt-1 max-w-xs text-xs text-neutral-500 dark:text-neutral-400">
              I&apos;ll learn your style, occasion, and budget — then build complete
              outfits you can add to cart in one tap.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestion(suggestion)}
                  disabled={busy}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const textParts = (
            message.parts as Array<{ type: string; text?: string }>
          ).filter((p) => p.type === "text" && p.text);
          const text = textParts.map((p) => p.text).join("");

          return message.role === "user" ? (
            <UserMessage key={message.id} text={text} />
          ) : (
            <AssistantMessage
              key={message.id}
              parts={message.parts as Array<{ type: string; text?: string }>}
              catalog={catalog}
              onAddToCart={handleAddToCart}
              addingHandle={addingHandle}
              onAddAll={handleAddAll}
              addingAll={addingAll}
              onSaveLook={handleSaveLook}
            />
          );
        })}

        {busy && <TypingIndicator />}

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            Something went wrong. Please try again.
          </div>
        )}

        <div />
      </div>

      <div className="border-t border-neutral-200 bg-neutral-50/80 px-4 py-3 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/50">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tell me about your style, occasion, or budget…"
            className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !inputValue.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white transition-all hover:from-blue-500 hover:to-violet-500 disabled:opacity-50"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
