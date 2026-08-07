"use client";

// This is the only boundary that catches errors thrown by the root layout
// itself — which includes ChatWidget, since it's rendered directly inside
// layout.tsx. It replaces the ENTIRE page when triggered, so it needs its
// own <html> and <body>, and deliberately avoids depending on the site's
// normal design system (custom Tailwind tokens, Header, etc.) in case
// whatever broke is related to that. Only activates in production builds —
// npm run dev shows Next.js's own error overlay instead.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <section
          style={{
            maxWidth: "28rem",
            margin: "4rem auto",
            padding: "0 1.5rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Something went wrong
          </h1>
          <p style={{ opacity: 0.7, marginBottom: "1.5rem" }}>
            The page hit an unexpected error. It&apos;s been logged &mdash; try
            reloading.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              borderRadius: "0.25rem",
              backgroundColor: "#8670A3",
              color: "white",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </section>
      </body>
    </html>
  );
}