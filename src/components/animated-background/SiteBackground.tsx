"use client";

import { usePathname } from "next/navigation";
import { AnimatedBackground } from "./AnimatedBackground";

// Rendered once from the root layout. The homepage renders its own
// AnimatedBackground(variant="hero") directly inside its hero section,
// so this deliberately renders nothing there — otherwise two WebGL
// contexts would run simultaneously on the same page for no visible
// benefit (the hero variant fully covers that viewport already).
export function SiteBackground() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <AnimatedBackground variant="ambient" />;
}
