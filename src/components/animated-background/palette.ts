// Shared between ShaderCanvas (WebGL uniforms, 0-1 float triples) and
// StaticGradientFallback (CSS hex strings), so the animated version and
// the static/reduced-motion version can never visually drift apart —
// one palette definition, two consumers.
//
// Light theme colors are the site's real design tokens (--color-canvas,
// --color-brand, --color-accent from globals.css). Dark theme's base and
// mid are also real tokens (--color-canvas-dark, --color-brand-dark) —
// but there's no --color-accent-dark defined anywhere in the codebase,
// so "high" for dark mode is a new pale-red/coral tone chosen to sit in
// the same relationship to brand-dark that accent does to brand (a
// light, low-saturation tint of the same hue). Worth a second look
// against the rest of the dark palette rather than treating it as
// already-established.
export const AURORA_PALETTE = {
  light: {
    base: { hex: "#E0E8F2", rgb: [0.8784, 0.9098, 0.949] as const },
    mid: { hex: "#816A9F", rgb: [0.5059, 0.4157, 0.6235] as const },
    high: { hex: "#FEDADA", rgb: [0.9961, 0.8549, 0.8549] as const },
  },
  dark: {
    base: { hex: "#000000", rgb: [0, 0, 0] as const },
    mid: { hex: "#8E0000", rgb: [0.5569, 0, 0] as const },
    // New, not an existing token — see file comment above.
    high: { hex: "#FFD1D1", rgb: [1.0, 0.8196, 0.8196] as const },
  },
} as const;
