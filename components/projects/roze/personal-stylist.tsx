"use client";

import Image from "next/image";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ROZE_PRODUCT_BY_ID,
  formatBgn,
  type RozeProduct,
} from "lib/roze-data";
import { useRozeCart } from "components/layout/roze-shell";

/**
 * PersonalStylistChat — live AI stylist embedded inside the
 * "Личен AI стилист" section of the ROZÉ boutique demo. Streams from
 * `/api/boutique-stylist/chat` (GPT-4o-mini via Vercel AI Gateway,
 * grounded in the same `ROZE_PRODUCTS` catalogue that drives the
 * product grid and cart drawer).
 *
 * Recommendation handoff: the system prompt instructs the model to
 * end any product recommendation with a bookmark line of the form
 *
 *     [[ROZE_REC:id1,id2,...]]
 *
 * This component parses that line out of the displayed text and
 * renders "Добави в кошницата" buttons under the message that call
 * the shell's `useRozeCart().addToCart`. The bookmark line itself is
 * stripped from the rendered message so visitors only see clean
 * Bulgarian copy + actionable buttons.
 *
 * Visual identity is deliberately ROZÉ — soft cream surface, serif
 * heading, rose accent — so the widget reads as part of the brand
 * page and not "the same chat box as KORE".
 */

const STARTERS = [
  "Имам сватба следващия месец",
  "Търся подарък за приятелка",
  "Какво да облека за работа?",
  "Препоръчайте от новата колекция",
] as const;

// Parse the bookmark line and return both the cleaned text + the
// ordered list of recommended products (de-duplicated, max 3).
const REC_LINE_RE = /\[\[ROZE_REC:([a-z0-9,\-\s]+)\]\]/i;

type ParsedAssistantMessage = {
  text: string;
  recommendations: ReadonlyArray<RozeProduct>;
};

function parseAssistantMessage(rawText: string): ParsedAssistantMessage {
  const match = rawText.match(REC_LINE_RE);
  if (!match) return { text: rawText.trim(), recommendations: [] };

  const ids = match[1]!
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const seen = new Set<string>();
  const products: RozeProduct[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const product = ROZE_PRODUCT_BY_ID[id];
    if (product) products.push(product);
    if (products.length >= 3) break;
  }
  // Strip the entire bookmark line out of the rendered text.
  const cleaned = rawText.replace(REC_LINE_RE, "").trim();
  return { text: cleaned, recommendations: products };
}

function getMessageText(message: UIMessage): string {
  let buf = "";
  for (const part of message.parts) {
    if (part.type === "text") buf += part.text;
  }
  return buf;
}

export function PersonalStylistChat() {
  const transport = useRef(
    new DefaultChatTransport({ api: "/api/boutique-stylist/chat" }),
  ).current;
  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isStreaming = status === "submitted" || status === "streaming";

  // Live HH:MM clock — set after mount to dodge SSR hydration mismatch.
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTimeLabel(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      );
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Auto-scroll to bottom on new tokens / messages.
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, status]);

  const send = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean || isStreaming) return;
      void sendMessage({ text: clean });
      setInput("");
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [sendMessage, isStreaming],
  );

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      send(input);
    },
    [input, send],
  );

  const empty = messages.length === 0;

  return (
    <div className="flex h-[30rem] flex-col rounded-3xl border border-stone-200 bg-white shadow-sm sm:h-[32rem]">
      <div className="flex items-center justify-between border-b border-stone-200 px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600" />
          </span>
          ROZÉ Стилист
        </div>
        <p className="font-mono text-[10px] text-stone-400">{timeLabel}</p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-5 py-4"
      >
        {empty ? (
          <EmptyState onPick={send} />
        ) : (
          <>
            {messages.map((m) => (
              <StylistTurn
                key={m.id}
                role={m.role === "user" ? "customer" : "ai"}
                text={getMessageText(m)}
              />
            ))}
            {isStreaming &&
              messages.at(-1)?.role !== "assistant" && <TypingBubble />}
          </>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-stone-200 px-3 pt-3 pb-3"
      >
        <div className="flex items-end gap-2 rounded-2xl bg-stone-50 px-3 py-2 ring-1 ring-stone-200 focus-within:ring-rose-700/40">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder={
              isStreaming
                ? "ROZÉ Стилист отговаря…"
                : "Кажете за повода или какво ви трябва…"
            }
            disabled={isStreaming}
            className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            aria-label="Изпрати"
            className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-rose-700 text-white shadow-md transition-all hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <p className="mt-2 px-1 text-[10px] uppercase tracking-[0.18em] text-stone-400">
          Демо · GPT-4o · препоръчва само налични продукти
        </p>
      </form>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="max-w-[85%] rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-relaxed text-stone-800 ring-1 ring-rose-200">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-700">
          ROZÉ Стилист
        </p>
        <p>
          Здравейте! Кажете ми за какъв повод сте — ще ви помогна да изберете
          точното от новата колекция.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
          >
            {s}
          </button>
        ))}
      </div>
      <div className="mt-auto pt-6 text-[10px] uppercase tracking-[0.22em] text-stone-400">
        Отговорите се появяват в реално време. Препоръчаните части се добавят с
        един клик.
      </div>
    </div>
  );
}

function StylistTurn({
  role,
  text,
}: {
  role: "customer" | "ai";
  text: string;
}) {
  // Memo so we don't re-parse the bookmark on every parent render.
  const parsed = useMemo(
    () =>
      role === "ai"
        ? parseAssistantMessage(text)
        : { text: text.trim(), recommendations: [] as ReadonlyArray<RozeProduct> },
    [role, text],
  );

  if (role === "customer") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-stone-100 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-stone-800">
          <p>{parsed.text || "\u00A0"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex max-w-[90%] flex-col gap-3">
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-stone-800 ring-1 ring-rose-200">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-700">
            ROZÉ Стилист
          </p>
          <p>{parsed.text || "\u00A0"}</p>
        </div>
        {parsed.recommendations.length > 0 && (
          <RecommendationActions products={parsed.recommendations} />
        )}
      </div>
    </div>
  );
}

function RecommendationActions({
  products,
}: {
  products: ReadonlyArray<RozeProduct>;
}) {
  const { addToCart, setCartOpen } = useRozeCart();

  const totalBgn = useMemo(
    () => products.reduce((acc, p) => acc + p.priceBgn, 0),
    [products],
  );

  const addOne = useCallback(
    (id: string) => {
      addToCart(id);
    },
    [addToCart],
  );

  const addAll = useCallback(() => {
    for (const p of products) addToCart(p.id);
    // Open the drawer so the customer immediately sees what was
    // added — feels like a real "view your suggested look" handoff.
    setCartOpen(true);
  }, [products, addToCart, setCartOpen]);

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-3">
      <ul className="flex flex-col divide-y divide-stone-100">
        {products.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
          >
            <span
              className={`relative block aspect-square h-10 w-10 flex-none overflow-hidden rounded-md bg-gradient-to-br ${p.swatch}`}
              aria-hidden="true"
            >
              {p.image && (
                <Image
                  src={p.image}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-sm leading-tight text-stone-950">
                {p.name}
              </p>
              <p className="font-mono text-[11px] text-stone-500">{p.price}</p>
            </div>
            <button
              type="button"
              onClick={() => addOne(p.id)}
              className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              Добави
            </button>
          </li>
        ))}
      </ul>
      {products.length > 1 && (
        <button
          type="button"
          onClick={addAll}
          className="mt-1 inline-flex items-center justify-center rounded-full bg-rose-700 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-rose-600"
        >
          Добави всичко · {formatBgn(totalBgn)}
        </button>
      )}
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl bg-rose-50 px-4 py-3 ring-1 ring-rose-200">
        <Dot delay="0ms" />
        <Dot delay="150ms" />
        <Dot delay="300ms" />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-rose-400"
      style={{ animationDelay: delay }}
    />
  );
}
