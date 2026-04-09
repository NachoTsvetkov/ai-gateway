"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ABANDONED_CART,
  getCartTotal,
  type AbandonedCartItem,
} from "lib/mock-abandoned-cart";

const SUGGESTIONS = [
  "Why should I complete this order?",
  "Any discounts available?",
  "I'm not sure about the headphones",
  "What if I just want the watch?",
  "Connect me with your team",
];

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

function CartItemRow({ item }: { item: AbandonedCartItem }) {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.imageUrl}
        alt={item.title}
        className="h-12 w-12 rounded-lg border border-neutral-200 object-cover dark:border-neutral-700"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-neutral-900 dark:text-white">
          {item.title}
        </p>
        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
          {item.variant} &middot; Qty {item.quantity}
        </p>
      </div>
      <p className="shrink-0 text-xs font-bold text-neutral-900 dark:text-white">
        ${item.price}
      </p>
    </div>
  );
}

function AbandonedCartCard() {
  const total = getCartTotal();
  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-800/50 dark:bg-amber-900/10">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3 w-3 text-amber-600 dark:text-amber-400"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
          Abandoned cart &middot; 47 min ago
        </p>
      </div>
      <div className="space-y-2">
        {ABANDONED_CART.map((item) => (
          <CartItemRow key={item.handle} item={item} />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-amber-200/60 pt-2 dark:border-amber-800/30">
        <span className="text-[11px] text-amber-600 dark:text-amber-400">
          {ABANDONED_CART.length} items
        </span>
        <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
          ${total}
        </span>
      </div>
    </div>
  );
}

function AssistantMessage({
  parts,
}: {
  parts: Array<{ type: string; text?: string }>;
}) {
  const text = parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("");

  if (!text) return null;

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

export function SmartCartRecoveryChat() {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const proactiveSent = useRef(false);

  const { messages, sendMessage, error, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/cart-recovery/chat",
    }),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    if (proactiveSent.current) return;
    proactiveSent.current = true;
    const timer = setTimeout(() => {
      void sendMessage({
        text: "[System: The customer has an abandoned cart with 3 items totaling $597. They left 47 minutes ago. Send your proactive recovery opening message now.]",
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [sendMessage]);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom, busy]);

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

  const hasProactiveOnly =
    messages.length <= 2 &&
    messages.every(
      (m) =>
        m.role === "assistant" ||
        (m.role === "user" &&
          (m.parts as Array<{ type: string; text?: string }>)
            .filter((p) => p.type === "text")
            .some((p) => p.text?.startsWith("[System:"))),
    );

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
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            Smart Cart Recovery Agent
          </p>
          <p className="text-xs text-blue-100">
            Proactive AI &middot; Personalized offers &amp; recovery
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <AbandonedCartCard />

        {messages.map((message) => {
          const textParts = (
            message.parts as Array<{ type: string; text?: string }>
          ).filter((p) => p.type === "text" && p.text);
          const text = textParts.map((p) => p.text).join("");
          const isSystemTrigger =
            message.role === "user" && text.startsWith("[System:");

          if (isSystemTrigger) return null;

          return message.role === "user" ? (
            <UserMessage key={message.id} text={text} />
          ) : (
            <AssistantMessage
              key={message.id}
              parts={
                message.parts as Array<{ type: string; text?: string }>
              }
            />
          );
        })}

        {busy && <TypingIndicator />}

        {hasProactiveOnly && !busy && messages.some((m) => m.role === "assistant") && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
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
        )}

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
            placeholder="Reply to the recovery agent…"
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
