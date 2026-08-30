"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion } from "motion/react";
import { usePressableMotion } from "./usePressableMotion";
import { glassClasses, type GlassVariant } from "./glass";

// Native button events whose signatures collide with Motion's own props
// of the same name (onAnimationStart et al. — Motion's expects an
// AnimationDefinition, the DOM's expects an AnimationEvent). Omitting
// them here is the standard fix for combining native HTML attributes
// with motion.* components; nothing in this codebase currently passes
// any of these anyway.
type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd"
>;

interface GlassButtonProps extends NativeButtonProps {
  variant?: GlassVariant;
}

// forwardRef because ChatPanel needs a ref to its Stop button (to manage
// focus when the busy state changes).
export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  function GlassButton({ variant = "secondary", className = "", children, ...rest }, ref) {
    const pressable = usePressableMotion();
    return (
      <motion.button
        ref={ref}
        {...pressable}
        className={glassClasses(variant) + (className ? " " + className : "")}
        {...rest}
      >
        {children}
      </motion.button>
    );
  }
);
