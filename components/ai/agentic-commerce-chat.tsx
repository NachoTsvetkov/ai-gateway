"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const SUGGESTIONS = [
  "Find me a gift under $100",
  "Compare watches",
  "Add the best headphones to my cart",
  "What's in my cart?",
  "Checkout with my cart",
];

function ToolCallBadge({ name, state }: { name: string; state: string }) {
  const labels: Record<string, string> = {
    searchProducts: "Searching catalog…",
    getProductDetails: "Fetching details…",
    addToCart: "Adding to cart…",
    getCart: "Checking cart…",
    initiateCheckout: "Preparing checkout…",
  };
  const doneLabels: Record<string, string> = {
    searchProducts: "Searched catalog",
    getProductDetails: "Got product details",
    addToCart: "Added to cart",
    getCart: "Retrieved cart",
    initiateCheckout: "Checkout ready",
  };
  const done = state === "result";
  const label = done
    ? doneLabels[name] || name
    : labels[name] || name;

  return (
    <div className="mb-2 ml-8 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
      {done ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5 text-green-600 dark:text-green-400"
        >
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className="h-3 w-3 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {label}
    </div>
  );
}

function ChatMessage({
  role,
  parts,
}: {
  role: string;
  parts: Array<{
    type: string;
    text?: string;
    toolInvocation?: { toolName: string; state: string };
    [key: string]: unknown;
  }>;
}) {
  const textParts = parts.filter((p) => p.type === "text" && p.text);
  const toolParts = parts.filter(
    (p) => p.type === "tool-invocation" && p.toolInvocation,
  );
  const text = textParts.map((p) => p.text).join("");

  const formatted = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label, url) => {
      const cleanUrl = url.replace(/^https?:\/\/[^/]+/, "");
      return `<a href="${cleanUrl}" class="font-medium text-blue-600 dark:text-blue-400 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-800 hover:decoration-blue-800/50 dark:hover:text-blue-300">${label}</a>`;
    },
  );

  if (role === "user") {
    return text ? (
      <div className="mb-3 flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-blue-600 px-4 py-2.5 text-sm leading-relaxed text-white">
          {text}
        </div>
      </div>
    ) : null;
  }

  return (
    <>
      {toolParts.map((p, i) => (
        <ToolCallBadge
          key={i}
          name={p.toolInvocation!.toolName}
          state={p.toolInvocation!.state}
        />
      ))}
      {text && (
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
        </div>
      )}
    </>
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

export function AgenticCommerceChat() {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, error, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/agentic-commerce/chat",
    }),
  });

  const busy = status === "submitted" || status === "streaming";

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
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            Autonomous Agentic Commerce Bot
          </p>
          <p className="text-xs text-blue-100">
            Tool-calling AI &middot; Search, compare, cart &amp; checkout
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
                <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              I don&apos;t just talk — I act.
            </p>
            <p className="mt-1 max-w-xs text-xs text-neutral-500 dark:text-neutral-400">
              Tell me what you need and I&apos;ll search, compare, add to cart, and
              checkout — all autonomously.
            </p>
            <p className="mt-3 max-w-xs text-[10px] text-neutral-400 dark:text-neutral-500">
              Demo store — no real charges will be made.
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

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            parts={
              message.parts as Array<{
                type: string;
                text?: string;
                toolInvocation?: { toolName: string; state: string };
                [key: string]: unknown;
              }>
            }
          />
        ))}

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
            placeholder="Tell me what to do — search, compare, add to cart…"
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
