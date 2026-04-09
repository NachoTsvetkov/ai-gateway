"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";

const SUGGESTIONS = [
  "What's my best-selling item this month?",
  "Why are conversions dropping on watches?",
  "Generate 5 email subject lines for top customers",
  "Compare revenue by customer segment",
  "Show me the last 7 days revenue trend",
];

type ChartData = {
  type: "bar";
  title: string;
  data: Array<{ label: string; value: number }>;
  prefix?: string;
};

function parseCharts(text: string): Array<{ type: "text"; content: string } | { type: "chart"; chart: ChartData }> {
  const parts: Array<{ type: "text"; content: string } | { type: "chart"; chart: ChartData }> = [];
  const regex = /```chart\s*\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    try {
      const chart = JSON.parse(match[1]!) as ChartData;
      if (chart.data && Array.isArray(chart.data)) {
        parts.push({ type: "chart", chart });
      }
    } catch {
      parts.push({ type: "text", content: match[0]! });
    }
    lastIndex = match.index + match[0]!.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return parts;
}

function BarChart({ chart }: { chart: ChartData }) {
  const maxVal = Math.max(...chart.data.map((d) => d.value), 1);
  const prefix = chart.prefix || "";

  return (
    <div className="my-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800/80">
      <p className="mb-3 text-xs font-semibold text-neutral-700 dark:text-neutral-200">
        {chart.title}
      </p>
      <div className="space-y-2">
        {chart.data.map((d) => {
          const pct = Math.max((d.value / maxVal) * 100, 2);
          return (
            <div key={d.label} className="flex items-center gap-2">
              <span className="w-28 shrink-0 truncate text-right text-[11px] text-neutral-600 dark:text-neutral-400">
                {d.label}
              </span>
              <div className="relative flex-1">
                <div
                  className="h-5 rounded bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-20 shrink-0 text-right text-[11px] font-semibold tabular-nums text-neutral-900 dark:text-white">
                {prefix}
                {d.value >= 1000
                  ? d.value.toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : d.value}
              </span>
            </div>
          );
        })}
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
}: {
  parts: Array<{ type: string; text?: string }>;
}) {
  const text = parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("");

  if (!text) return null;

  const segments = parseCharts(text);

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
        <div className="max-w-[90%] space-y-0">
          {segments.map((seg, i) =>
            seg.type === "chart" ? (
              <BarChart key={i} chart={seg.chart} />
            ) : (
              <div
                key={i}
                className="rounded-2xl bg-neutral-100 px-4 py-2.5 text-sm leading-relaxed text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                dangerouslySetInnerHTML={{ __html: formatHtml(seg.content) }}
              />
            ),
          )}
        </div>
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

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
      <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-neutral-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export function AnalyticsInsightsChat() {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, error, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/store-analytics/chat",
    }),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    requestAnimationFrame(() => {
      const el = wrapperRef.current;
      if (!el) return;
      const bottom = el.getBoundingClientRect().bottom + (window.scrollY || window.pageYOffset);
      const target = Math.max(0, bottom - window.innerHeight + 20);
      try { window.scrollTo({ top: target, behavior: "smooth" }); }
      catch { window.scrollTo(0, target); }
    });
  }, []);

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
    <div ref={wrapperRef} className="flex h-[min(780px,calc(100vh-220px))] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
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
            <path d="M3 3v18h18" />
            <path d="m7 16 4-8 4 5 4-9" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            AI Store Analytics &amp; Insights
          </p>
          <p className="text-xs text-blue-100">
            Natural language BI &middot; Ask anything about your store
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
            <div className="mb-3 grid w-full max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
              <KpiCard label="Revenue (30d)" value="$62.4K" />
              <KpiCard label="Orders" value="487" />
              <KpiCard label="AOV" value="$96.32" />
              <KpiCard label="CVR" value="3.6%" />
            </div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-900/30 dark:to-violet-900/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="h-7 w-7 text-blue-600 dark:text-blue-400"
              >
                <path d="M3 3v18h18" />
                <path d="m7 16 4-8 4 5 4-9" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Ask anything about your store
            </p>
            <p className="mt-1 max-w-xs text-xs text-neutral-500 dark:text-neutral-400">
              Sales, orders, products, customers — powered by natural language BI
              over 30 days of store data.
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
              text={
                (message.parts as Array<{ type: string; text?: string }>)
                  .filter((p) => p.type === "text" && p.text)
                  .map((p) => p.text)
                  .join("")
              }
            />
          ) : (
            <AssistantMessage
              key={message.id}
              parts={
                message.parts as Array<{ type: string; text?: string }>
              }
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
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about sales, products, customers, trends…"
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
