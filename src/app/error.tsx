"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassAnchor } from "@/components/ui/GlassAnchor";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="px-6 py-16 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
      <p className="opacity-70 mb-6">
        This page hit an error loading. It&apos;s been logged &mdash; try again,
        or head back to the homepage.
      </p>
      <div className="flex gap-3 justify-center">
        <GlassButton type="button" variant="primary" onClick={reset} className="font-heading">
          Try again
        </GlassButton>
        <GlassAnchor href="/" variant="secondary" className="font-heading">
          Go home
        </GlassAnchor>
      </div>
    </section>
  );
}
