"use client";

import { useChat } from "@ai-sdk/react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "components/cart/cart-context";
import { addItem } from "components/cart/actions";
import type { Product, ProductVariant } from "lib/shopify/types";

const SUGGESTIONS = [
  "Recommend gifts under $100",
  "What's trending right now?",
  "Compare your headphones vs watch",
  "Show me eco-friendly products",
];

type CatalogProduct = Pick<
  Product,
  | "id"
  | "handle"
  | "title"
  | "description"
  | "availableForSale"
  | "featuredImage"
  | "priceRange"
  | "tags"
> & {
  variants: Pick<
    ProductVariant,
    "id" | "title" | "availableForSale" | "price" | "selectedOptions"
  >[];
};

function ProductCard({
  product,
  onAddToCart,
  adding,
}: {
  product: CatalogProduct;
  onAddToCart: (product: CatalogProduct) => void;
  adding: boolean;
}) {
  return (
    <div className="my-2 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
      <Link
        href={`/product/${product.handle}`}
        className="relative block aspect-[16/9] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-700"
      >
        {product.featuredImage?.url && (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="320px"
          />
        )}
      </Link>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/product/${product.handle}`}
            className="text-sm font-semibold leading-tight text-neutral-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
          >
            {product.title}
          </Link>
          <span className="shrink-0 text-sm font-bold text-blue-600 dark:text-blue-400">
            ${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`h-3.5 w-3.5 ${star <= 4 ? "text-amber-400" : "text-neutral-300 dark:text-neutral-600"}`}
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                clipRule="evenodd"
              />
            </svg>
          ))}
          <span className="ml-1 text-[10px] text-neutral-500 dark:text-neutral-400">
            4.0
          </span>
        </div>
        <button
          onClick={() => onAddToCart(product)}
          disabled={adding || !product.availableForSale}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-50"
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
                className="h-3.5 w-3.5"
              >
                <path d="M10 5a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 10 5Z" />
              </svg>
              {product.availableForSale ? "Add to Cart" : "Out of Stock"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function extractProductHandles(text: string): string[] {
  const matches = text.matchAll(/\[([^\]]+)\]\(\/product\/([^)]+)\)/g);
  return [...matches].map((m) => m[2]!);
}

function ChatMessage({
  role,
  parts,
  catalog,
  onAddToCart,
  addingHandle,
}: {
  role: string;
  parts: Array<{ type: string; text?: string; [key: string]: unknown }>;
  catalog: Map<string, CatalogProduct>;
  onAddToCart: (product: CatalogProduct) => void;
  addingHandle: string | null;
}) {
  const text = parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("");

  if (!text) return null;

  const handles = role === "assistant" ? extractProductHandles(text) : [];
  const recommendedProducts = handles
    .map((h) => catalog.get(h))
    .filter(Boolean) as CatalogProduct[];

  const formatted = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label, url) => {
      const cleanUrl = url.replace(/^https?:\/\/[^/]+/, "");
      return `<a href="${cleanUrl}" class="font-medium text-blue-600 dark:text-blue-400 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-800 hover:decoration-blue-800/50 dark:hover:text-blue-300">${label}</a>`;
    },
  );

  return (
    <div className="mb-3">
      <div
        className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
      >
        {role !== "user" && (
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
        )}
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            role === "user"
              ? "bg-blue-600 text-white"
              : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
          }`}
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      </div>
      {recommendedProducts.length > 0 && (
        <div className="ml-8 mt-1 grid gap-2">
          {recommendedProducts.map((product) => (
            <ProductCard
              key={product.handle}
              product={product}
              onAddToCart={onAddToCart}
              adding={addingHandle === product.handle}
            />
          ))}
        </div>
      )}
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

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [pending, setPending] = useState(false);
  const [addingHandle, setAddingHandle] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<Map<string, CatalogProduct>>(
    new Map(),
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const catalogFetched = useRef(false);
  const [, startTransition] = useTransition();

  const { addCartItem } = useCart();
  const { messages, sendMessage, error } = useChat();

  useEffect(() => {
    if (catalogFetched.current) return;
    catalogFetched.current = true;
    fetch("/api/products")
      .then((r) => r.json())
      .then((products: CatalogProduct[]) => {
        const map = new Map<string, CatalogProduct>();
        for (const p of products) {
          map.set(p.handle, p);
        }
        setCatalog(map);
      })
      .catch(() => {});
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (pending && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last && last.role === "assistant") {
        setPending(false);
      }
    }
  }, [messages, pending]);

  useEffect(() => {
    function handleTrigger(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("[data-chat-trigger]")) {
        setIsOpen(true);
      }
    }
    document.addEventListener("click", handleTrigger);
    return () => document.removeEventListener("click", handleTrigger);
  }, []);

  const handleAddToCart = useCallback(
    (product: CatalogProduct) => {
      const variant = product.variants[0];
      if (!variant) return;

      setAddingHandle(product.handle);

      const fullProduct = {
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

      startTransition(() => {
        addCartItem(variant as ProductVariant, fullProduct);
      });

      addItem(null, variant.id).finally(() => {
        setAddingHandle(null);
      });
    },
    [addCartItem, startTransition],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || pending) return;
    setInputValue("");
    setPending(true);
    try {
      await sendMessage({ text });
    } finally {
      setPending(false);
    }
  };

  const handleSuggestion = async (text: string) => {
    if (pending) return;
    setPending(true);
    try {
      await sendMessage({ text });
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-105 hover:shadow-blue-500/40 active:scale-95"
        aria-label={isOpen ? "Close chat" : "Open AI assistant"}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-6 w-6"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-6 w-6"
          >
            <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
        )}
      </button>

      {!isOpen && (
        <div className="fixed right-20 bottom-8 z-50 hidden animate-pulse rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-md sm:block dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
          Ask our AI shopping assistant
        </div>
      )}

      {isOpen && (
        <div className="fixed right-3 bottom-24 z-50 flex h-[min(580px,calc(100vh-120px))] w-[min(400px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 text-white"
              >
                <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                AI Shopping Assistant
              </p>
              <p className="text-xs text-blue-100">
                Powered by OpenAI &middot; Ask me anything
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
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
                  Hi! I&apos;m your AI shopping assistant.
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  I can recommend products, compare options, and add items
                  directly to your cart.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestion(suggestion)}
                      disabled={pending}
                      className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                parts={
                  message.parts as Array<{
                    type: string;
                    text?: string;
                    [key: string]: unknown;
                  }>
                }
                catalog={catalog}
                onAddToCart={handleAddToCart}
                addingHandle={addingHandle}
              />
            ))}

            {pending && <TypingIndicator />}

            {error && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                Something went wrong. Please try again.
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t border-neutral-200 bg-neutral-50/80 px-4 py-3 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/50"
          >
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about products, styling, gifts..."
              className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
              disabled={pending}
            />
            <button
              type="submit"
              disabled={pending || !inputValue.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white transition-all hover:from-blue-500 hover:to-violet-500 disabled:opacity-50"
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
      )}
    </>
  );
}
