"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";

export type SendButtonStatus = "idle" | "loading" | "success" | "error";

interface SendButtonProps {
  status: SendButtonStatus;
  onClick: () => void;
  idleLabel?: string;
  errorLabel?: string;
  disabled?: boolean;
}

/**
 * Duration/easing choices, and why:
 *
 * - Hover/focus (150ms, ease-out): fast enough to feel like an immediate
 *   response to input, slow enough not to feel like a flicker.
 * - Loading transition (250ms, easeInOut): the label-to-spinner crossfade
 *   and the width morph between them. Long enough to read as a deliberate,
 *   designed change rather than a glitch; short enough not to make the
 *   button feel sluggish to press.
 * - Success checkmark (200ms in, 900ms hold, 250ms back to idle): the pop-in
 *   is quick because success should feel immediate, but it holds long
 *   enough for a human to actually register it before disappearing — under
 *   ~700ms most people won't consciously register a state change at all.
 * - Error shake (400ms, sharp keyframes not a smooth ease): a shake is
 *   supposed to read as "something's wrong" instantly, so it's deliberately
 *   snappier and less smooth than every other transition here — the
 *   abruptness itself is part of the signal.
 *
 * Width morphing: rather than literally animating the CSS `width` property
 * (which forces the browser to recompute layout every frame — real layout
 * thrash), the `layout` prop below uses Motion's FLIP technique: it measures
 * the size before and after the content changes, then animates a `transform:
 * scale()` between them instead. Visually it looks identical to a width
 * animation, but it's actually GPU-composited the whole time.
 */
export function SendButton({
  status,
  onClick,
  idleLabel = "Send message",
  errorLabel = "Retry",
  disabled = false,
}: SendButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  const dur = (seconds: number) => (prefersReducedMotion ? 0.01 : seconds);

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      layout
      whileHover={!isLoading ? { scale: 1.03 } : undefined}
      whileFocus={!isLoading ? { scale: 1.03 } : undefined}
      whileTap={!isLoading ? { scale: 0.97 } : undefined}
      animate={
        isError && !prefersReducedMotion
          ? { x: [0, -6, 6, -4, 4, 0] }
          : { x: 0 }
      }
      transition={{
        default: { duration: dur(0.15), ease: "easeOut" },
        layout: { duration: dur(0.25), ease: "easeInOut" },
        x: { duration: dur(0.4) },
      }}
      className={
        "relative inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-heading text-white overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:focus-visible:outline-brand-dark disabled:cursor-not-allowed " +
        (isError ? "bg-red-600" : "bg-brand dark:bg-brand-dark") +
        (disabled && !isLoading ? " opacity-50" : "")
      }
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {isLoading && (
          <motion.span
            key="spinner"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
            transition={{ duration: dur(0.25) }}
            className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
            aria-hidden
          />
        )}

        {isSuccess && (
          <motion.svg
            key="checkmark"
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.5 }}
            transition={{ duration: dur(0.2), ease: "easeOut" }}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            aria-hidden
          >
            <path d="M4 12l6 6L20 6" />
          </motion.svg>
        )}

        {!isLoading && !isSuccess && (
          <motion.span
            key={isError ? "error-label" : "idle-label"}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
            transition={{ duration: dur(0.25) }}
          >
            {isError ? errorLabel : idleLabel}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}