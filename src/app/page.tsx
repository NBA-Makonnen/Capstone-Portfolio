import { AnimatedBackground } from "@/components/animated-background/AnimatedBackground";
import { GlassLink } from "@/components/ui/GlassLink";

export default function HomePage() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <AnimatedBackground variant="hero" />

      {/* Contrast scrim: a solid-ish backdrop behind the text block,
          independent of whatever colors the shader happens to be
          showing underneath at any given moment/mouse position. This is
          what keeps text contrast a design decision instead of a
          runtime gamble against an animated background. */}
      <div className="relative z-10 flex flex-col items-center gap-6 rounded-2xl bg-black/55 px-8 py-10 backdrop-blur-sm">
        <h1 className="max-w-2xl text-4xl font-bold text-white">
          A front-end AI engineer focused on building things that work.
        </h1>
        <p className="max-w-xl text-lg text-white/85">
          AWS Certified Cloud Practitioner branching into Front-end AI Engineering.
        </p>
        <GlassLink href="/projects" variant="primary">
          See the work
        </GlassLink>
      </div>
    </section>
  );
}
