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
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Match my outfit",
  "Find similar watch",
  "Eco-friendly alternatives",
  "Complement this look",
  "What bag goes with this?",
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

function AssistantMessage({
  parts,
  catalog,
  onAddToCart,
  addingHandle,
  onAddAll,
  addingAll,
}: {
  parts: Array<{ type: string; text?: string; mediaType?: string; url?: string }>;
  catalog: Map<string, VisualStylistCatalogProduct>;
  onAddToCart: (product: VisualStylistCatalogProduct) => void;
  addingHandle: string | null;
  onAddAll: (products: VisualStylistCatalogProduct[]) => void;
  addingAll: boolean;
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

  const formatted = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label, url) => {
      const cleanUrl = url.replace(/^https?:\/\/[^/]+/, "");
      return `<a href="${cleanUrl}" class="font-medium text-blue-600 dark:text-blue-400 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-800 hover:decoration-blue-800/50 dark:hover:text-blue-300">${label}</a>`;
    },
  );

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
          dangerouslySetInnerHTML={{ __html: formatted }}
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
          {recommended.length > 1 && (
            <button
              type="button"
              onClick={() => onAddAll(recommended)}
              disabled={addingAll}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:from-blue-500 hover:to-violet-500 disabled:opacity-50"
            >
              {addingAll ? "Adding…" : "Add all to cart"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function UserMessage({
  parts,
}: {
  parts: Array<{ type: string; text?: string; mediaType?: string; url?: string }>;
}) {
  const text = parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("");
  const images = parts.filter(
    (p) =>
      p.type === "file" &&
      p.mediaType?.startsWith("image/") &&
      p.url,
  );

  return (
    <div className="mb-3 flex justify-end">
      <div className="max-w-[85%] space-y-2">
        {images.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- data URLs from chat parts
          <img
            key={i}
            src={p.url}
            alt=""
            className="max-h-56 rounded-2xl border border-neutral-200 object-cover dark:border-neutral-600"
          />
        ))}
        {text ? (
          <div className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm leading-relaxed text-white">
            {text}
          </div>
        ) : null}
      </div>
    </div>
  );
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

export function VisualStylistChat() {
  const [inputValue, setInputValue] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [addingHandle, setAddingHandle] = useState<string | null>(null);
  const [addingAll, setAddingAll] = useState(false);
  const [catalog, setCatalog] = useState<
    Map<string, VisualStylistCatalogProduct>
  >(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const catalogFetched = useRef(false);
  const [, startTransition] = useTransition();

  const { addCartItem } = useCart();

  const { messages, sendMessage, error, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/visual-stylist/chat",
    }),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    if (catalogFetched.current) return;
    catalogFetched.current = true;
    fetch("/api/visual-stylist/catalog")
      .then((r) => r.json())
      .then((products: VisualStylistCatalogProduct[]) => {
        const map = new Map<string, VisualStylistCatalogProduct>();
        for (const p of products) {
          map.set(p.handle, p);
        }
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
      const variant = product.variants[0];
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

      addItem(null, variant.id).finally(() => {
        setAddingHandle(null);
      });
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
            ? "Added all (includes demo preview items)"
            : "Added all to cart",
        );
      } finally {
        setAddingAll(false);
      }
    },
    [addCartItem, buildFullProduct, startTransition],
  );

  const handleSuggestion = (text: string) => {
    if (busy) return;
    void sendMessage({ text });
  };

  const addFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    setPendingFiles((prev) => [...prev, ...list].slice(0, 4));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    if (pendingFiles.length > 0) {
      const dt = new DataTransfer();
      pendingFiles.forEach((f) => dt.items.add(f));
      const text =
        inputValue.trim() ||
        "Analyze this image and recommend matching and complementary products from the catalog.";
      setInputValue("");
      setPendingFiles([]);
      await sendMessage({ text, files: dt.files });
      return;
    }

    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    await sendMessage({ text });
  };

  return (
    <div ref={wrapperRef} className="flex h-[min(720px,calc(100vh-220px))] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
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
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7M2 7v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7M2 7h20M6 21v-6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            Multi-Modal Visual Stylist
          </p>
          <p className="text-xs text-blue-100">
            GPT-4o vision + catalog RAG &middot; Upload a photo to begin
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
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
                <path d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159M6 20.25h12a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 18 4.5H6A2.25 2.25 0 0 0 3.75 6.75v11.25A2.25 2.25 0 0 0 6 20.25Z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Drop a photo or describe your style
            </p>
            <p className="mt-1 max-w-xs text-xs text-neutral-500 dark:text-neutral-400">
              Vision analyzes your image; RAG pulls similar and complementary
              items from the Shopify catalog.
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

        {messages.map((message) =>
          message.role === "user" ? (
            <UserMessage
              key={message.id}
              parts={
                message.parts as Array<{
                  type: string;
                  text?: string;
                  mediaType?: string;
                  url?: string;
                }>
              }
            />
          ) : (
            <AssistantMessage
              key={message.id}
              parts={
                message.parts as Array<{
                  type: string;
                  text?: string;
                  mediaType?: string;
                  url?: string;
                }>
              }
              catalog={catalog}
              onAddToCart={handleAddToCart}
              addingHandle={addingHandle}
              onAddAll={handleAddAll}
              addingAll={addingAll}
            />
          ),
        )}

        {busy && <TypingIndicator />}

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            Something went wrong. Please try again.
          </div>
        )}

        <div />
      </div>

      <div className="border-t border-neutral-200 bg-neutral-50/80 px-4 py-3 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/50">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) {
              addFiles(e.dataTransfer.files);
            }
          }}
          className={`mb-3 rounded-xl border-2 border-dashed px-3 py-4 text-center transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-50/80 dark:bg-blue-900/20"
              : "border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-800/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                addFiles(e.target.files);
                e.target.value = "";
              }
            }}
          />
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Drag &amp; drop an image here, or{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              browse
            </button>
          </p>
          {pendingFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {pendingFiles.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  className="relative h-16 w-16 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-600"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(f)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPendingFiles((prev) => prev.filter((_, j) => j !== i))
                    }
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/60 px-1 text-[10px] text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything, or send a photo above…"
            className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={
              busy || (!inputValue.trim() && pendingFiles.length === 0)
            }
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
