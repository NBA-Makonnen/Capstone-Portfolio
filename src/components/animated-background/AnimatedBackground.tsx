"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { StaticGradientFallback } from "./StaticGradientFallback";

interface AnimatedBackgroundProps {
  /** "hero": fills its container at full strength — used inside the
   *  homepage's hero section, which controls its own size via
   *  `relative overflow-hidden`.
   *  "ambient": fixed to the viewport, sits behind every other page's
   *  content, heavily blurred and low-opacity so the motion reads as
   *  atmosphere rather than a second thing competing for attention. */
  variant?: "hero" | "ambient";
}

// Same lazy-loading shape as LazyViewer/ViewerScene: the WebGL setup
// code only exists in the browser, so it's excluded from the server
// bundle and loaded on demand. The loading placeholder is passed dark
// separately below since dynamic()'s `loading` render has no access to
// the outer component's props/state at the time it first paints.
const ShaderCanvas = dynamic(
  () => import("./ShaderCanvas").then((mod) => mod.ShaderCanvas),
  { ssr: false, loading: () => null }
);

const VARIANT_CLASSES: Record<NonNullable<AnimatedBackgroundProps["variant"]>, string> = {
  hero: "absolute inset-0 h-full w-full",
  // fixed + -z-10: sits behind Header/main/ChatWidget (all normal-flow
  // or z-index:auto positioned content) without needing any z-index
  // coordination with them. blur-[80px] + opacity-25: heavy enough that
  // the motion reads as atmosphere, not a second visual element — see
  // the readability requirement this was built against.
  ambient:
    "fixed inset-0 -z-10 h-screen w-screen overflow-hidden blur-[80px] opacity-25 pointer-events-none",
};

export function AnimatedBackground({ variant = "hero" }: AnimatedBackgroundProps) {
  // Default to light/no-motion so server-rendered and first-hydration
  // markup match exactly (matchMedia and the document's class list
  // aren't available during SSR). Both real checks run in an effect
  // right after mount.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluateMotion = () => setPrefersReducedMotion(query.matches);
    evaluateMotion();
    query.addEventListener("change", evaluateMotion);
    return () => query.removeEventListener("change", evaluateMotion);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const evaluateTheme = () => setDark(root.classList.contains("dark"));
    evaluateTheme();

    // ThemeToggle flips the "dark" class directly (no custom event, no
    // React context) — a MutationObserver watching that one attribute is
    // the correct way to react to it live, from anywhere in the tree.
    const observer = new MutationObserver(evaluateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className={VARIANT_CLASSES[variant]}>
      {prefersReducedMotion ? (
        <StaticGradientFallback dark={dark} />
      ) : (
        <ShaderCanvas dark={dark} variant={variant} />
      )}
    </div>
  );
}
