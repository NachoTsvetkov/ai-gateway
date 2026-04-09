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
  "What's popular right now?",
  "Find me sunglasses under $100",
  "I need a gift for someone who loves watches",
  "Show me eco-friendly options",
  "What goes well with a leather bag?",
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
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

function stripForTTS(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/[#*_~`>]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function AssistantMessage({
  parts,
  catalog,
  onAddToCart,
  addingHandle,
}: {
  parts: Array<{ type: string; text?: string }>;
  catalog: Map<string, VisualStylistCatalogProduct>;
  onAddToCart: (product: VisualStylistCatalogProduct) => void;
  addingHandle: string | null;
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-white">
            <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
        </div>
        <div
          className="max-w-[85%] rounded-2xl bg-neutral-100 px-4 py-2.5 text-sm leading-relaxed text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
          dangerouslySetInnerHTML={{ __html: formatHtml(text) }}
        />
      </div>
      {recommended.length > 0 && (
        <div className="ml-8 mt-3">
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
        </div>
      )}
    </div>
  );
}

function UserMessage({ text, fromVoice }: { text: string; fromVoice: boolean }) {
  return text ? (
    <div className="mb-3 flex justify-end">
      <div className="max-w-[85%] rounded-2xl bg-blue-600 px-4 py-2.5 text-sm leading-relaxed text-white">
        {fromVoice && (
          <span className="mr-1.5 inline-block align-middle opacity-70">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="inline h-3.5 w-3.5">
              <path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z" />
              <path d="M5.5 9.643a.75.75 0 0 0-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.546A6.001 6.001 0 0 0 16 10v-.357a.75.75 0 0 0-1.5 0V10a4.5 4.5 0 0 1-9 0v-.357Z" />
            </svg>
          </span>
        )}
        {text}
      </div>
    </div>
  ) : null;
}

function TypingIndicator() {
  return (
    <div className="mb-3 flex items-start justify-start">
      <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-white">
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

function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SR =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;
    setSupported(!!SR);
    if (SR) {
      const r = new SR();
      r.continuous = false;
      r.interimResults = true;
      r.lang = "en-US";
      r.onresult = (e: SpeechRecognitionEvent) => {
        const t = Array.from(e.results)
          .map((res) => res[0]!.transcript)
          .join("");
        setTranscript(t);
      };
      r.onend = () => setListening(false);
      r.onerror = () => setListening(false);
      recognitionRef.current = r;
    }
  }, []);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setListening(true);
    recognitionRef.current.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, transcript, supported, start, stop };
}

function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || typeof window === "undefined" || !window.speechSynthesis)
        return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.05;
      u.pitch = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      utterRef.current = u;
      window.speechSynthesis.speak(u);
    },
    [enabled],
  );

  const cancel = useCallback(() => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return { speaking, enabled, setEnabled, speak, cancel };
}

export function VoiceShoppingChat() {
  const [inputValue, setInputValue] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const [addingHandle, setAddingHandle] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<Map<string, VisualStylistCatalogProduct>>(new Map());
  const [voiceMessageIds, setVoiceMessageIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const catalogFetched = useRef(false);
  const lastSpokenRef = useRef<string | null>(null);
  const [, startTransition] = useTransition();

  const { addCartItem } = useCart();
  const stt = useSpeechRecognition();
  const tts = useTTS();

  const { messages, sendMessage, error, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/voice-shopping/chat",
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

  useEffect(() => {
    if (!voiceMode || !tts.enabled) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;
    const text = (lastMsg.parts as Array<{ type: string; text?: string }>)
      .filter((p) => p.type === "text" && p.text)
      .map((p) => p.text)
      .join("");
    if (!text || status === "streaming") return;
    const key = `${lastMsg.id}:${text.length}`;
    if (lastSpokenRef.current === key) return;
    lastSpokenRef.current = key;
    tts.speak(stripForTTS(text));
  }, [messages, status, voiceMode, tts]);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom, busy]);

  const buildFullProduct = useCallback(
    (product: VisualStylistCatalogProduct): Product =>
      ({
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
      }) as Product,
    [],
  );

  const handleAddToCart = useCallback(
    (product: VisualStylistCatalogProduct) => {
      const variant = product.variants[0];
      if (!variant) return;
      setAddingHandle(product.handle);
      startTransition(() => {
        addCartItem(variant as ProductVariant, buildFullProduct(product));
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

  const handleSuggestion = (text: string) => {
    if (busy) return;
    void sendMessage({ text });
  };

  useEffect(() => {
    if (!stt.listening && stt.transcript && voiceMode) {
      const text = stt.transcript.trim();
      if (text) {
        const tempId = `voice-${Date.now()}`;
        setVoiceMessageIds((prev) => new Set(prev).add(tempId));
        void sendMessage({ text });
      }
    }
  }, [stt.listening, stt.transcript, voiceMode, sendMessage]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || busy) return;
    setInputValue("");
    await sendMessage({ text });
  };

  const toggleVoice = () => {
    if (stt.listening) {
      stt.stop();
    } else if (voiceMode) {
      setVoiceMode(false);
      tts.cancel();
    } else {
      setVoiceMode(true);
    }
  };

  return (
    <div className="flex h-[min(720px,calc(100vh-220px))] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-white">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            Voice-Enabled Shopping Assistant
          </p>
          <p className="text-xs text-blue-100">
            Speak or type &middot; AI reads responses aloud
          </p>
        </div>
        <div className="flex items-center gap-2">
          {voiceMode && (
            <button
              type="button"
              onClick={() => tts.setEnabled(!tts.enabled)}
              className="rounded-full bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20"
              title={tts.enabled ? "Mute TTS" : "Unmute TTS"}
            >
              {tts.enabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M10.5 3.75a.75.75 0 0 0-1.264-.546L5.203 7H2.667a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 1.5 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h2.535l4.033 3.796A.75.75 0 0 0 10.5 16.25V3.75ZM13.329 6.166a.75.75 0 1 0-.658 1.348c.942.46 1.579 1.42 1.579 2.486s-.637 2.027-1.579 2.486a.75.75 0 1 0 .658 1.348A4.251 4.251 0 0 0 15.75 10a4.251 4.251 0 0 0-2.421-3.834Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 opacity-50">
                  <path d="M10.5 3.75a.75.75 0 0 0-1.264-.546L5.203 7H2.667a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 1.5 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h2.535l4.033 3.796A.75.75 0 0 0 10.5 16.25V3.75Z" />
                  <path d="M14.22 7.22a.75.75 0 0 1 1.06 0L16.5 8.44l1.22-1.22a.75.75 0 1 1 1.06 1.06L17.56 9.5l1.22 1.22a.75.75 0 1 1-1.06 1.06L16.5 10.56l-1.22 1.22a.75.75 0 1 1-1.06-1.06l1.22-1.22-1.22-1.22a.75.75 0 0 1 0-1.06Z" />
                </svg>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={toggleVoice}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
              voiceMode
                ? "bg-white text-blue-600"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {voiceMode ? "Voice ON" : "Voice OFF"}
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-900/30 dark:to-violet-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7 text-blue-600 dark:text-blue-400">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Shop with your voice
            </p>
            <p className="mt-1 max-w-xs text-xs text-neutral-500 dark:text-neutral-400">
              {stt.supported
                ? "Toggle Voice ON, then tap the mic to speak. The AI will respond and read answers aloud."
                : "Voice input requires a supported browser. You can still type below and enable TTS for responses."}
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
            <UserMessage
              key={message.id}
              text={text}
              fromVoice={voiceMessageIds.has(message.id) || voiceMode}
            />
          ) : (
            <AssistantMessage
              key={message.id}
              parts={message.parts as Array<{ type: string; text?: string }>}
              catalog={catalog}
              onAddToCart={handleAddToCart}
              addingHandle={addingHandle}
            />
          );
        })}

        {busy && <TypingIndicator />}

        {tts.speaking && (
          <div className="mb-3 ml-8 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 animate-pulse">
              <path d="M10.5 3.75a.75.75 0 0 0-1.264-.546L5.203 7H2.667a.75.75 0 0 0-.7.48A6.985 6.985 0 0 0 1.5 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h2.535l4.033 3.796A.75.75 0 0 0 10.5 16.25V3.75Z" />
            </svg>
            Speaking…
          </div>
        )}

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            Something went wrong. Please try again.
          </div>
        )}

        <div />
      </div>

      <div className="border-t border-neutral-200 bg-neutral-50/80 px-4 py-3 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/50">
        {stt.listening && (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2 dark:border-red-800/50 dark:bg-red-900/10">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
            <span className="flex-1 text-xs text-red-700 dark:text-red-300">
              {stt.transcript || "Listening…"}
            </span>
            <button
              type="button"
              onClick={stt.stop}
              className="text-[10px] font-semibold text-red-600 hover:text-red-800 dark:text-red-400"
            >
              Stop
            </button>
          </div>
        )}
        <form onSubmit={onSubmit} className="flex gap-2">
          {voiceMode && stt.supported && (
            <button
              type="button"
              onClick={stt.listening ? stt.stop : stt.start}
              disabled={busy}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-50 ${
                stt.listening
                  ? "animate-pulse bg-red-500 text-white"
                  : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
              }`}
              aria-label={stt.listening ? "Stop listening" : "Start voice input"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z" />
                <path d="M5.5 9.643a.75.75 0 0 0-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.546A6.001 6.001 0 0 0 16 10v-.357a.75.75 0 0 0-1.5 0V10a4.5 4.5 0 0 1-9 0v-.357Z" />
              </svg>
            </button>
          )}
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={voiceMode ? "Or type here…" : "Ask me anything about the store…"}
            className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !inputValue.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white transition-all hover:from-blue-500 hover:to-violet-500 disabled:opacity-50"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
