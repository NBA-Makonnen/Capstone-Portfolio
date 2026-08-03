"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Streamdown } from "streamdown";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isBusy = status === "submitted" || status === "streaming";

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
    <>
      {/* Toggle button — always present, fixed bottom-right */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close chat" : "Ask about my work"}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-brand text-white px-5 py-3 shadow-lg font-heading"
      >
        {isOpen ? "Close" : "Ask me"}
      </button>

      {isOpen && (
        <div
          role="region"
          aria-label="Chat"
          className="fixed bottom-20 right-4 z-50 w-[90vw] max-w-sm h-[70vh] max-h-[520px] flex flex-col rounded-lg border border-brand/20 bg-white shadow-xl overflow-hidden"
        >
          {/* Message list */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {messages.length === 0 && (
              <p className="opacity-60 text-sm">
                Ask me about my projects, certifications, or background.
              </p>
            )}

            {messages.map((message, idx) => {
              const isLastAssistant =
                message.role === "assistant" && idx === messages.length - 1;
              const textParts = message.parts.filter((p) => p.type === "text");
              const hasText = textParts.some(
                (p) => "text" in p && p.text.length > 0
              );
              const showThinking =
                isLastAssistant && status === "submitted" && !hasText;

              return (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "ml-auto max-w-[85%] rounded-lg bg-brand text-white px-3 py-2 text-sm"
                      : "mr-auto max-w-[85%] rounded-lg bg-gray-100 text-gray-900 px-3 py-2 text-sm transition-opacity duration-200"
                  }
                >
                  {showThinking ? (
                    <span className="inline-flex gap-1" aria-label="Thinking">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 animate-pulse [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 animate-pulse [animation-delay:300ms]" />
                    </span>
                  ) : (
                    textParts.map((part, i) =>
                      "text" in part ? (
                        <Streamdown key={i}>{part.text}</Streamdown>
                      ) : null
                    )
                  )}
                </div>
              );
            })}
          </div>

          {/* Jump to latest — only shown once the user has scrolled away */}
          {!isPinnedToBottom && (
            <button
              type="button"
              onClick={jumpToLatest}
              className="mx-auto mb-2 text-xs bg-brand/90 text-white rounded-full px-3 py-1"
            >
              Jump to latest
            </button>
          )}

          {error && (
            <p className="text-xs text-red-600 px-4 pb-2">
              Something went wrong on that last message. Please try again.
            </p>
          )}

          {/* Input — 16px+ font size prevents iOS Safari auto-zoom on focus */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-brand/20 p-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isBusy}
              placeholder="Ask a question..."
              className="flex-1 rounded border border-brand/20 px-3 py-2 text-base disabled:opacity-50"
              style={{ fontSize: 16 }}
            />
            {isBusy ? (
              <button
                type="button"
                onClick={stop}
                className="rounded bg-gray-200 px-3 py-2 text-sm font-heading"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="rounded bg-brand text-white px-3 py-2 text-sm font-heading disabled:opacity-50"
              >
                Send
              </button>
            )}
          </form>
        </div>
      )}
    </>
  );
}