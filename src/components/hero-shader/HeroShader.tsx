"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { StaticGradientFallback } from "./StaticGradientFallback";

// Same lazy-loading shape as LazyViewer/ViewerScene: the WebGL setup
// code only exists in the browser, so it's excluded from the server
// bundle and loaded on demand, with the static gradient as the
// loading placeholder to avoid a flash-of-empty-hero.
const ShaderCanvas = dynamic(
  () => import("./ShaderCanvas").then((mod) => mod.ShaderCanvas),
  { ssr: false, loading: () => <StaticGradientFallback /> }
);

export function HeroShader() {
  // Default to the static fallback so server-rendered and first-hydration
  // markup match exactly (matchMedia isn't available during SSR). The
  // real check runs in an effect right after mount and swaps in the
  // animated canvas before the (small, dependency-free) shader chunk has
  // even finished loading, in practice.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluate = () => setPrefersReducedMotion(query.matches);
    evaluate();
    query.addEventListener("change", evaluate);
    return () => query.removeEventListener("change", evaluate);
  }, []);

  if (prefersReducedMotion) {
    return <StaticGradientFallback />;
  }

  return <ShaderCanvas />;
}
