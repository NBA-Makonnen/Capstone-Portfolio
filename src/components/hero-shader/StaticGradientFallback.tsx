// Static stand-in for the animated shader: same palette (black base,
// brand purple, accent pink), no JS, no canvas, zero animation cost.
// Used both as the permanent view for prefers-reduced-motion and as the
// next/dynamic loading placeholder, so there's no flash/layout shift
// when the real canvas mounts on top of it.
export function StaticGradientFallback() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, #816A9F 0%, #2b2338 45%, #000000 80%)",
      }}
    />
  );
}
