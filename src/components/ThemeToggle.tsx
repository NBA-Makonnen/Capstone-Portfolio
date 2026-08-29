"use client";
import { useState, useEffect } from "react";

// Same theme logic as before, byte-for-byte: localStorage key, the class
// toggled on documentElement, defaulting to light. Only the rendered
// control changed, from a text button to a slider-style switch.
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = stored === "dark";
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className="relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border border-brand/30 bg-canvas transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:border-brand-dark/40 dark:bg-black dark:focus-visible:outline-brand-dark"
    >
      {/* Thumb: position is the primary state signal (left = light,
          right = dark); the icon inside it is a second, redundant
          signal so the state doesn't rely on position/color alone. */}
      <span
        aria-hidden="true"
        className={
          "flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white shadow transition-transform duration-200 ease-in-out motion-reduce:transition-none dark:bg-brand-dark " +
          (isDark ? "translate-x-8" : "translate-x-1")
        }
      >
        {isDark ? (
          // Moon
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 1020.354 15.354z" />
          </svg>
        ) : (
          // Sun
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path
              strokeWidth="2"
              stroke="currentColor"
              d="M12 3v1.5M12 19.5V21M4.222 4.222l1.06 1.06M18.718 18.718l1.06 1.06M3 12h1.5M19.5 12H21M4.222 19.778l1.06-1.06M18.718 5.282l1.06-1.06"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
