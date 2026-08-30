"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { GlassButton } from "./ui/GlassButton";

const ChatPanel = dynamic(
  () => import("./ChatPanel").then((mod) => mod.ChatPanel),
  {
    ssr: false,
    loading: () => (
      <div
        role="region"
        aria-label="Chat"
        className="fixed bottom-20 right-4 z-50 w-[90vw] max-w-sm h-[70vh] max-h-[520px] flex items-center justify-center rounded-lg border border-brand/20 dark:border-brand-dark/30 bg-canvas dark:bg-canvas-dark shadow-xl text-sm opacity-70"
      >
        Loading&hellip;
      </div>
    ),
  }
);

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // Speculatively warm the chat panel's module cache during idle time after
  // the page has already become interactive, so opening the widget for the
  // first time feels instant instead of triggering a visible network
  // request. This costs nothing on the critical path — it's scheduled to
  // run only once the browser has spare time, well after first paint.
  useEffect(() => {
    const prefetch = () => {
      import("./ChatPanel");
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(prefetch);
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(prefetch, 2000);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      {/* Toggle button — always present, fixed bottom-right. This is the
          entire cost every page pays; everything else (the AI SDK,
          Streamdown's markdown renderer, ProjectCard) only loads once the
          panel actually opens. */}
      <GlassButton
        type="button"
        variant="primary"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close chat" : "Ask me about my work"}
        className="fixed bottom-4 right-4 z-50 shadow-lg font-heading"
      >
        {isOpen ? "Close" : "Ask me"}
      </GlassButton>

      {isOpen && <ChatPanel />}
    </>
  );
}
