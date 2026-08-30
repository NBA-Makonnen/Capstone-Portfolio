// One shared "liquid glass" recipe for every button-like control on the
// site, instead of each component inventing its own border/background
// combination. Three variants cover every case in the codebase:
//
// - "primary": the site's main call-to-action color (brand purple/red),
//   translucent+blurred so it reads as actual glass rather than a flat
//   fill. Light mode uses dark ink text instead of white — see the note
//   below on why white text doesn't survive translucency here.
// - "secondary": the general-purpose glass pill — nav/contact/project
//   links, dialog buttons. Uses a black tint in light mode and a white
//   tint in dark mode (not a fixed color) because light mode's canvas is
//   very pale (#E0E8F2) — a white-on-white tint would barely register,
//   while a light darkening tint reads clearly as "frosted panel" in
//   both themes.
// - "icon": same recipe as secondary, sized as a circle for icon-only
//   controls (the mobile menu button).
//
// The shared pieces regardless of variant: backdrop-blur + backdrop-
// saturate (the actual "glass" part — saturate makes whatever's behind
// the panel pop rather than looking washed out), a visible border, and
// a bright inset top highlight (shadow-[inset_0_1px_0...]) simulating a
// light reflection along the upper edge — a standard glassmorphism cue
// that a plain border+blur doesn't give you on its own.
//
// NOTE ON "relative": deliberately NOT included here even though most
// glass/card recipes default to it. Consumers like ChatWidget need to
// pass `fixed inset-x-0 ...` etc. via className, and Tailwind compiles
// `.fixed` *before* `.relative` in its utilities layer — so if `relative`
// were baked into this shared string, any consumer positioning override
// of that kind would silently lose to it regardless of class order in
// the JSX (this bit us once: the chat toggle rendered in normal flow
// instead of floating fixed bottom-right). Nothing in this codebase
// nests an absolutely-positioned child inside a Glass* button, so there
// is currently no reason to force a stacking context here — if a future
// use case needs one, apply `relative` at that specific call site
// instead of reintroducing it into SHARED.
export type GlassVariant = "primary" | "secondary" | "icon";

const SHARED =
  "flex items-center justify-center gap-1.5 backdrop-blur-md backdrop-saturate-150 border " +
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] " +
  "transition-colors " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-brand dark:focus-visible:outline-brand-dark " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export function glassClasses(variant: GlassVariant = "secondary") {
  if (variant === "primary") {
    // Opacity here is intentionally asymmetric between themes, not a
    // cosmetic choice: --color-brand (#816A9F) was tuned in globals.css
    // to clear WCAG AA (4.5:1) for WHITE text only when fully opaque.
    // Any translucency lets the pale light-mode canvas (#E0E8F2) bleed
    // through and lighten the effective color, which drops white-text
    // contrast well below AA well before it looks meaningfully "glass"
    // (verified: even the old 85%-opaque version only cleared ~3.7:1
    // against the flat canvas). So in light mode this variant switches
    // to dark ink text instead, which stays comfortably above 4.5:1
    // (~4.8–6.4:1) across the 55/65/75% range used below. Dark mode has
    // no such ceiling — --color-brand-dark composited over the near-
    // black canvas keeps white text at 14:1+ even at much lower
    // opacity — so it stays white and gets to be more see-through.
    return (
      SHARED +
      " rounded-full px-6 py-3 text-sm font-medium text-ink dark:text-white " +
      "bg-brand/55 dark:bg-brand-dark/45 border-white/40 dark:border-white/10 " +
      "hover:bg-brand/65 dark:hover:bg-brand-dark/55 " +
      "active:bg-brand/75 dark:active:bg-brand-dark/65"
    );
  }
  if (variant === "icon") {
    return (
      SHARED +
      " rounded-full w-11 h-11 shrink-0 text-ink dark:text-ink-dark " +
      "bg-black/12 dark:bg-white/14 border-brand/30 dark:border-brand-dark/40 " +
      "hover:bg-black/18 dark:hover:bg-white/20 " +
      "active:bg-black/24 dark:active:bg-white/26"
    );
  }
  // secondary
  return (
    SHARED +
    " rounded-full px-4 py-2 text-sm font-medium text-ink dark:text-ink-dark " +
    "bg-black/12 dark:bg-white/14 border-brand/30 dark:border-brand-dark/40 " +
    "hover:bg-black/18 dark:hover:bg-white/20 hover:border-brand/50 dark:hover:border-brand-dark/60 " +
    "active:bg-black/24 dark:active:bg-white/26"
  );
}
