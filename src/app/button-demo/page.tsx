"use client";

import { useState } from "react";
import { SendButton, SendButtonStatus } from "@/components/SendButton";

export default function ButtonDemoPage() {
  const [status, setStatus] = useState<SendButtonStatus>("idle");

  // Real send: random delay, random 20% failure — matches the brief's
  // example of a genuine async call, not just a manual toggle.
  const handleSend = () => {
    if (status === "loading") return;
    setStatus("loading");
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const failed = Math.random() < 0.2;
      setStatus(failed ? "error" : "success");
      if (!failed) {
        setTimeout(() => setStatus("idle"), 1100);
      }
    }, delay);
  };

  // Force-trigger versions, per the Q&A: reviewers need to see both states
  // on demand, not wait on a 20% chance.
  const forceSuccess = () => {
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => setStatus("idle"), 1100);
    }, 700);
  };

  const forceError = () => {
    setStatus("loading");
    setTimeout(() => setStatus("error"), 700);
  };

  return (
    <section className="px-6 py-16 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Buttons with a Brain</h1>
      <p className="opacity-70 mb-8 text-sm">
        A &quot;Send message&quot; button with full state choreography: idle, hover/focus,
        loading, success, and error, all as transitions rather than snaps. Try the real
        button (20% random failure), or force a specific state to see it on demand.
      </p>

      <div className="flex items-center gap-4 mb-10">
        <SendButton status={status} onClick={handleSend} />
        <span className="text-xs opacity-50">Real send &mdash; 20% chance of failure</span>
      </div>

      <div className="flex gap-3 border-t border-brand/20 dark:border-brand-dark/30 pt-6">
        <button
          type="button"
          onClick={forceSuccess}
          className="text-xs rounded border border-brand/30 dark:border-brand-dark/40 px-3 py-1.5"
        >
          Force success
        </button>
        <button
          type="button"
          onClick={forceError}
          className="text-xs rounded border border-brand/30 dark:border-brand-dark/40 px-3 py-1.5"
        >
          Force error
        </button>
      </div>

      <div className="mt-12 text-xs opacity-60 space-y-2 border-t border-brand/20 dark:border-brand-dark/30 pt-6">
        <p className="font-heading font-bold text-sm opacity-100">
          Duration &amp; easing notes
        </p>
        <p>
          Hover/focus: 150ms ease-out &mdash; fast enough to feel responsive, not a flicker.
        </p>
        <p>
          Loading (label/spinner crossfade + width morph): 250ms ease-in-out. The width
          change uses Motion&apos;s <code>layout</code> prop rather than animating the CSS
          width property directly &mdash; it measures before/after size and animates a
          transform instead, so it stays GPU-composited with no real layout thrash.
        </p>
        <p>
          Success: 200ms pop-in, holds 900ms before reverting &mdash; long enough to
          actually register before disappearing.
        </p>
        <p>
          Error shake: 400ms, deliberately sharper and less smooth than everything else
          &mdash; the abruptness itself is part of the &quot;something went wrong&quot;
          signal. Skipped entirely under <code>prefers-reduced-motion</code>; the red
          color and &quot;Retry&quot; label still change instantly, since motion is what
          gets removed, not feedback.
        </p>
      </div>
    </section>
  );
}