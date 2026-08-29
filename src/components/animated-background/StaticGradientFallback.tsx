import { AURORA_PALETTE } from "./palette";

interface StaticGradientFallbackProps {
  dark: boolean;
}

// Static stand-in for the animated shader: same palette as the live
// canvas (imported from the same palette.ts, so the two can't drift
// apart), no JS, no canvas, zero animation cost. Used both as the
// permanent view for prefers-reduced-motion and as the next/dynamic
// loading placeholder, so there's no flash/layout shift when the real
// canvas mounts on top of it.
export function StaticGradientFallback({ dark }: StaticGradientFallbackProps) {
  const palette = dark ? AURORA_PALETTE.dark : AURORA_PALETTE.light;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${palette.mid.hex} 0%, ${palette.base.hex} 65%, ${palette.base.hex} 100%)`,
      }}
    />
  );
}
