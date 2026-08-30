"use client";

import type { ReactNode } from "react";
import { MotionLink } from "./MotionLink";
import { usePressableMotion } from "./usePressableMotion";
import { glassClasses, type GlassVariant } from "./glass";

interface GlassLinkProps {
  href: string;
  variant?: GlassVariant;
  className?: string;
  children: ReactNode;
}

// For internal app navigation (next/link) — see GlassAnchor for plain
// external/static <a> tags. Same shared glass style + motion underneath.
export function GlassLink({
  href,
  variant = "secondary",
  className = "",
  children,
}: GlassLinkProps) {
  const pressable = usePressableMotion();
  return (
    <MotionLink
      href={href}
      {...pressable}
      className={glassClasses(variant) + (className ? " " + className : "")}
    >
      {children}
    </MotionLink>
  );
}
