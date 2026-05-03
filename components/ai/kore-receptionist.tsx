"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { KORE_PREFILL_EVENT } from "lib/kore-events";

/**
 * KoreReceptionist — live AI chat widget embedded inside the
 * AI Receptionist section of the KORE studio demo. Streams from
 * `/api/fitness-studio/chat` (GPT-4o-mini via Vercel AI Gateway,
 * grounded in the studio's published schedule + memberships).
 *
 * Visual identity is intentionally dark-card-on-orange-page so the
 * widget reads as the marquee feature of the section, not just
 * another card. The bubble palette mirrors the static mock the demo
 * shipped with originally; replacing that mock with a real
 * conversation is the whole point of this component.
 */

// Quick-reply chips visitors see before they've sent anything. These
// also seed the most common KORE-specific tasks so visitors don't
// have to figure out what the AI knows about.
const STARTERS = [
  "Book a yoga class tomorrow",
  "What's the schedule this week?",
  "How much is the monthly membership?",
  "I'm new — what should I try first?",
] as const;

// Pull the visible text out of an AI SDK UIMessage. The SDK stores
// streamed content as a list of typed parts; for a plain-text bot we
// only care about the `text` parts and concatenate them.
function getMessageText(message: UIMessage): string {
  let buf = "";
  for (const part of message.parts) {
    if (part.type === "text") {
      buf += part.text;
    }
  }
  return buf;
}

export function KoreReceptionist() {
  const transport = useRef(
    new DefaultChatTransport({ api: "/api/fitness-studio/chat" }),
  ).current;
  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState("");
  // Set after mount so server HTML and client HTML match for SSR
  // hydration; otherwise React would warn about a textContent mismatch
  // since we'd render different "HH:MM" strings on each side.
  const [timeLabel, setTimeLabel] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isStreaming = status === "submitted" || status === "streaming";

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      setTimeLabel(`${h}:${m}`);
    };
    update();
    // Re-tick every minute so a long-lived chat session keeps the
    // header time honest. 60s precision is enough — we don't need a
    // wall clock animation here.
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Auto-scroll to the bottom on new content so the latest reply is
  // always visible. Triggered on message-count changes AND streaming
  // status flips, which together cover both "new message arrived"
  // and "in-flight token appended".
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, status]);

  const send = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean || isStreaming) return;
      void sendMessage({ text: clean });
      setInput("");
      // Refocus so power-users can keep typing without picking the
      // mouse back up.
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

  // The schedule grid above the chat dispatches a `kore:prefill-chat`
  // CustomEvent when a visitor taps a slot — see
  // `components/projects/kore/schedule-slot.tsx`. We auto-send the
  // request here so the booking conversation starts the moment they
  // arrive at the chat. If a stream is already in flight we drop the
  // event rather than queueing — power-users can always retry, and a
  // queue would silently fire stale requests.
  useEffect(() => {
    function onPrefill(e: WindowEventMap[typeof KORE_PREFILL_EVENT]) {
      const text = e.detail?.text?.trim();
      if (!text) return;
      send(text);
    }
    window.addEventListener(KORE_PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(KORE_PREFILL_EVENT, onPrefill);
  }, [send]);

  const empty = messages.length === 0;

  return (
    <div className="flex h-[28rem] flex-col rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl sm:h-[30rem]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Front desk · always on
        </div>
        <p className="font-mono text-[10px] text-neutral-500">{timeLabel}</p>
      </div>

      {/* Conversation pane */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-5 py-4"
      >
        {empty ? (
          <EmptyState onPick={send} />
        ) : (
          <>
            {messages.map((m) => (
              <ChatBubble
                key={m.id}
                from={m.role === "user" ? "visitor" : "ai"}
                text={getMessageText(m)}
              />
            ))}
            {/* Show a typing indicator while the model is thinking but
                hasn't streamed any tokens yet — without this there's a
                visually empty pause between Send and the first token. */}
            {isStreaming &&
              messages.at(-1)?.role !== "assistant" && <TypingBubble />}
          </>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={onSubmit}
        className="border-t border-white/10 px-3 pt-3 pb-3"
      >
        <div className="flex items-end gap-2 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10 focus-within:ring-orange-500/60">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends, Shift+Enter newlines — standard chat ergonomics.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder={
              isStreaming
                ? "KORE Assistant is replying…"
                : "Ask about classes, booking, memberships…"
            }
            disabled={isStreaming}
            className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            aria-label="Send message"
            className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition-all hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-500"
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
        <p className="mt-2 px-1 text-[10px] uppercase tracking-[0.18em] text-neutral-500">
          Live demo · GPT-4o · grounded in the schedule above
        </p>
      </form>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex max-w-[85%] flex-col gap-1 rounded-2xl bg-orange-500/15 px-4 py-3 text-sm leading-relaxed text-orange-50 ring-1 ring-orange-500/30">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300">
          KORE ASSISTANT
        </p>
        <p>
          Hi! I&apos;m the after-hours front desk. I can book classes, check
          the schedule, or walk you through memberships — what do you need?
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-orange-500/60 hover:bg-orange-500/15 hover:text-orange-100"
          >
            {s}
          </button>
        ))}
      </div>
      <div className="mt-auto pt-6 text-[10px] uppercase tracking-[0.18em] text-neutral-500">
        Replies stream in real time. Ask in English or Bulgarian.
      </div>
    </div>
  );
}

function ChatBubble({
  from,
  text,
}: {
  from: "visitor" | "ai";
  text: string;
}) {
  const isAI = from === "ai";
  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isAI
            ? "bg-orange-500/15 text-orange-50 ring-1 ring-orange-500/30"
            : "bg-white/10 text-white"
        }`}
      >
        {isAI && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300">
            KORE ASSISTANT
          </p>
        )}
        <p>{text || "\u00A0"}</p>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl bg-orange-500/15 px-4 py-3 ring-1 ring-orange-500/30">
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
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-orange-300"
      style={{ animationDelay: delay }}
    />
  );
}
