"use client";

import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import { motion } from "motion/react";
import { usePressableMotion } from "./usePressableMotion";
import { glassClasses, type GlassVariant } from "./glass";

// Same native/Motion prop-name collision as GlassButton — see the note
// there. Omitted here for the same reason, not because anything in the
// codebase currently needs them.
type NativeAnchorProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd"
>;

interface GlassAnchorProps extends NativeAnchorProps {
  variant?: GlassVariant;
  children: ReactNode;
}

// For real <a> tags: external links, mailto:, static files under
// /public — anywhere a plain anchor is the right element rather than
// next/link's client-side route transition (see GlassLink for that
// case). Centralizes the glass style + shared hover/tap motion so every
// anchor-based button on the site pulls from the same recipe.
export const GlassAnchor = forwardRef<HTMLAnchorElement, GlassAnchorProps>(
  function GlassAnchor({ variant = "secondary", className = "", children, ...rest }, ref) {
    const pressable = usePressableMotion();
    return (
      <motion.a
        ref={ref}
        {...pressable}
        className={glassClasses(variant) + (className ? " " + className : "")}
        {...rest}
      >
        {children}
      </motion.a>
    );
  }
);
