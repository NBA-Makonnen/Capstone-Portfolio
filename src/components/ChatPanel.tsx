"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Streamdown } from "streamdown";
import { ProjectCard } from "@/components/ProjectCard";

export function ChatPanel() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isBusy = status === "submitted" || status === "streaming";

  // The text input becomes `disabled` while busy (see below), which — if the
  // user was focused there, which they almost always are right after
  // submitting — silently drops keyboard focus to <body> with no
  // indication of where it went. Redirect it to the Stop button instead,
  // which is also the single most useful control at that exact moment.
  const stopButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isBusy) {
      stopButtonRef.current?.focus();
    }
  }, [isBusy]);

  // --- Auto-scroll that respects the user scrolling up ---
  // Pin to bottom only while the user is already there. The moment they
  // scroll up (even slightly), release the pin so new tokens don't yank
  // them back down mid-read. Offer a "Jump to latest" button instead.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsPinnedToBottom(distanceFromBottom < 40);
  };

  useEffect(() => {
    if (isPinnedToBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPinnedToBottom]);

  const jumpToLatest = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setIsPinnedToBottom(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ text: trimmed });
    setInput("");
    setIsPinnedToBottom(true);
  };

  return (
    <div
      role="region"
      aria-label="Chat"
      className="fixed bottom-20 right-4 z-50 w-[90vw] max-w-sm h-[70vh] max-h-[520px] flex flex-col rounded-lg border border-brand/20 dark:border-brand-dark/30 bg-canvas dark:bg-canvas-dark shadow-xl overflow-hidden"
    >
      {/* Message list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 && (
          <div className="text-sm opacity-70">
            <p className="mb-2">Ask me about my projects, certifications, or background.</p>
            <button
              type="button"
              onClick={() => setInput("What AWS projects have you built?")}
              className="underline text-left"
            >
              Try: &quot;What AWS projects have you built?&quot;
            </button>
          </div>
        )}

        {messages.map((message, idx) => {
          const isLastAssistant =
            message.role === "assistant" && idx === messages.length - 1;
          const textParts = message.parts.filter((p) => p.type === "text");
          const hasText = textParts.some(
            (p) => "text" in p && p.text.length > 0
          );
          const hasToolPart = message.parts.some((p) =>
            p.type.startsWith("tool-")
          );
          const showThinking =
            isLastAssistant && status === "submitted" && !hasText && !hasToolPart;

          return (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-auto max-w-[85%] rounded-lg bg-brand dark:bg-brand-dark text-white px-3 py-2 text-sm"
                  : "mr-auto max-w-[85%] rounded-lg bg-black/5 dark:bg-white/10 text-ink dark:text-ink-dark px-3 py-2 text-sm transition-opacity duration-200 space-y-2"
              }
            >
              {showThinking && (
                <span className="inline-flex gap-1" aria-label="Thinking">
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 animate-pulse [animation-delay:300ms]" />
                </span>
              )}

              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return part.text ? <Streamdown key={i}>{part.text}</Streamdown> : null;
                }

                if (part.type === "tool-getProjectDetails") {
                  const callId = part.toolCallId;
                  // TypeScript can't automatically link the tool's types
                  // defined in route.ts to their usage here, so we assert
                  // them explicitly rather than build extra cross-file
                  // type wiring just for this.
                  const input = part.input as { projectName: string } | undefined;
                  switch (part.state) {
                    // Input still being generated — the lightest possible
                    // placeholder, since we don't know what's being looked
                    // up yet.
                    case "input-streaming":
                      return (
                        <div
                          key={callId}
                          className="h-4 w-32 rounded bg-current/10 animate-pulse"
                        />
                      );
                    // Input is known — name the actual project being
                    // looked up, not a generic spinner.
                    case "input-available":
                      return (
                        <div
                          key={callId}
                          className="text-xs italic opacity-70 flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          Looking up &quot;{input?.projectName}&quot;...
                        </div>
                      );
                    // Success — the real designed component, not JSON.
                    case "output-available":
                      return (
                        <ProjectCard
                          key={callId}
                          project={part.output as import("@/lib/project-data").ProjectRecord}
                        />
                      );
                    // Failure — visually distinct from success (warning
                    // border, not brand styling), designed on purpose
                    // rather than left to crash or show raw text.
                    case "output-error":
                      return (
                        <div
                          key={callId}
                          className="rounded-lg border border-red-400/50 dark:border-red-500/40 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-xs text-red-700 dark:text-red-400"
                        >
                          Couldn&apos;t look that project up: {part.errorText}
                        </div>
                      );
                    default:
                      return null;
                  }
                }

                return null;
              })}
            </div>
          );
        })}
      </div>

      {/* Jump to latest — only shown once the user has scrolled away */}
      {!isPinnedToBottom && (
        <button
          type="button"
          onClick={jumpToLatest}
          className="mx-auto mb-2 text-xs bg-brand/90 dark:bg-brand-dark/90 text-white rounded-full px-3 py-1"
        >
          Jump to latest
        </button>
      )}

      {error && !isBusy && (
        <div className="px-4 pb-2 flex items-center justify-between gap-2">
          <p className="text-xs text-red-700 dark:text-red-400">
            That last message didn&apos;t go through.
          </p>
          <button
            type="button"
            onClick={() => regenerate()}
            className="text-xs underline text-red-700 dark:text-red-400 whitespace-nowrap"
          >
            Retry last message
          </button>
        </div>
      )}

      {/* Input — 16px+ font size prevents iOS Safari auto-zoom on focus */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-brand/20 dark:border-brand-dark/30 p-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isBusy}
          placeholder="Ask a question..."
          className="flex-1 rounded border border-brand/20 dark:border-brand-dark/30 bg-canvas dark:bg-canvas-dark text-ink dark:text-ink-dark px-3 py-2 text-base disabled:opacity-50"
          style={{ fontSize: 16 }}
        />
        {isBusy ? (
          <button
            ref={stopButtonRef}
            type="button"
            onClick={stop}
            className="rounded bg-black/10 dark:bg-white/10 text-ink dark:text-ink-dark px-3 py-2 text-sm font-heading"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded bg-brand dark:bg-brand-dark text-white px-3 py-2 text-sm font-heading disabled:opacity-50"
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
}
