// One shared "liquid glass" recipe for every button-like control on the
// site, instead of each component inventing its own border/background
// combination. Three variants cover every case in the codebase:
//
// - "primary": the site's main call-to-action color (brand purple/red),
//   still translucent+blurred so it reads as glass rather than a flat
//   fill, just with less see-through than the other two.
// - "secondary": the general-purpose glass pill — nav/contact/project
//   links, dialog buttons. Uses a black tint in light mode and a white
//   tint in dark mode (not a fixed color) because light mode's canvas is
//   very pale (#E0E8F2) — a white-on-white tint would barely register,
//   while a light darkening tint reads clearly as "frosted panel" in
//   both themes.
// - "icon": same recipe as secondary, sized as a circle for icon-only
//   controls (the mobile menu button).
//
// The shared pieces regardless of variant: backdrop-blur (the actual
// "glass" part), a visible border, and a faint inset top highlight
// (shadow-[inset_0_1px_0...]) simulating a light reflection along the
// upper edge — a standard glassmorphism cue that a plain border+blur
// doesn't give you on its own.
export type GlassVariant = "primary" | "secondary" | "icon";

const SHARED =
  "relative flex items-center justify-center gap-1.5 backdrop-blur-md border " +
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] " +
  "transition-colors " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-brand dark:focus-visible:outline-brand-dark " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export function glassClasses(variant: GlassVariant = "secondary") {
  if (variant === "primary") {
    return (
      SHARED +
      " rounded-full px-6 py-3 text-sm font-medium text-white " +
      "bg-brand/85 dark:bg-brand-dark/85 border-white/30 dark:border-white/10 " +
      "hover:bg-brand/95 dark:hover:bg-brand-dark/95 " +
      "active:bg-brand dark:active:bg-brand-dark"
    );
  }
  if (variant === "icon") {
    return (
      SHARED +
      " rounded-full w-11 h-11 shrink-0 text-ink dark:text-ink-dark " +
      "bg-black/5 dark:bg-white/8 border-brand/30 dark:border-brand-dark/40 " +
      "hover:bg-black/10 dark:hover:bg-white/14 " +
      "active:bg-black/15 dark:active:bg-white/20"
    );
  }
  // secondary
  return (
    SHARED +
    " rounded-full px-4 py-2 text-sm font-medium text-ink dark:text-ink-dark " +
    "bg-black/5 dark:bg-white/8 border-brand/30 dark:border-brand-dark/40 " +
    "hover:bg-black/10 dark:hover:bg-white/14 hover:border-brand/50 dark:hover:border-brand-dark/60 " +
    "active:bg-black/15 dark:active:bg-white/20"
  );
}
