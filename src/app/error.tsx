"use client";

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
        <button
          type="button"
          onClick={reset}
          className="rounded bg-brand dark:bg-brand-dark text-white px-4 py-2 text-sm font-heading"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded border border-brand/20 dark:border-brand-dark/30 px-4 py-2 text-sm font-heading"
        >
          Go home
        </a>
      </div>
    </section>
  );
}