"use client";

import { useState } from "react";
import { MotionLink } from "./ui/MotionLink";
import { usePressableMotion } from "./ui/usePressableMotion";
import { GlassAnchor } from "./ui/GlassAnchor";
import { GlassButton } from "./ui/GlassButton";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/certificates", label: "Certificates" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  // Primary nav intentionally stays plain text (no glass chrome) — only
  // LinkedIn/GitHub were asked to get borders. A small hover lift is the
  // "motion where appropriate" version of item 3 for these specifically.
  const navHover = usePressableMotion();

  return (
    <header className="relative border-b border-brand/20">
      <div className="flex items-center justify-between px-6 py-4">
        <nav aria-label="Primary" className="hidden md:flex gap-6 font-heading text-lg">
          {navLinks.map((link) => (
            <MotionLink
              key={link.href}
              href={link.href}
              whileHover={{ y: -1, opacity: 0.75 }}
              whileFocus={{ y: -1, opacity: 0.75 }}
              transition={navHover.transition}
            >
              {link.label}
            </MotionLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <GlassAnchor
            href="https://www.linkedin.com/in/makonnen-mulima-b9a685231"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn<span className="sr-only"> (opens in a new tab)</span>
          </GlassAnchor>
          <GlassAnchor href="https://github.com/NBA-Makonnen" target="_blank" rel="noopener noreferrer">
            GitHub<span className="sr-only"> (opens in a new tab)</span>
          </GlassAnchor>
          <ThemeToggle />
        </div>

        <GlassButton
          variant="icon"
          className="md:hidden flex-col -mr-1.5"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
        >
          <span className="block h-0.5 w-6 bg-current" />
          <span className="block h-0.5 w-6 bg-current" />
          <span className="block h-0.5 w-6 bg-current" />
        </GlassButton>
      </div>

      {isOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="md:hidden flex flex-col gap-4 px-6 pb-6 font-heading text-lg"
        >
          {navLinks.map((link) => (
            <MotionLink
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              whileHover={{ y: -1, opacity: 0.75 }}
              whileTap={{ opacity: 0.6 }}
              transition={navHover.transition}
            >
              {link.label}
            </MotionLink>
          ))}
          <div className="flex items-center gap-3 pt-2 border-t border-brand/20">
            <GlassAnchor
              href="https://www.linkedin.com/in/makonnen-mulima-b9a685231"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </GlassAnchor>
            <GlassAnchor href="https://github.com/NBA-Makonnen" target="_blank" rel="noopener noreferrer">
              GitHub<span className="sr-only"> (opens in a new tab)</span>
            </GlassAnchor>
            <ThemeToggle />
          </div>
        </nav>
      )}
    </header>
  );
}
