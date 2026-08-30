"use client";

import { useReducedMotion } from "motion/react";

// Extends SendButton.tsx's established hover/tap convention (scale 1.03
// on hover/focus, 0.97 on tap, 150ms ease-out, collapsing to a near-
// instant 0.01s under prefers-reduced-motion) to every other interactive
// control site-wide, rather than each one re-deriving its own numbers.
// Spread the return value onto any motion.* element:
//   <motion.button {...usePressableMotion()} ... />
export function usePressableMotion() {
  const prefersReducedMotion = useReducedMotion();
  const duration = prefersReducedMotion ? 0.01 : 0.15;
  return {
    whileHover: { scale: 1.03 },
    whileFocus: { scale: 1.03 },
    whileTap: { scale: 0.97 },
    transition: { duration, ease: "easeOut" as const },
  };
}
