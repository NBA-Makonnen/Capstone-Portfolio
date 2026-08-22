"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/certificates", label: "Certificates" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative border-b border-brand/20">
      <div className="flex items-center justify-between px-6 py-4">
        <nav aria-label="Primary" className="hidden md:flex gap-6 font-heading text-lg">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4 text-sm">
          <a href="https://www.linkedin.com/in/makonnen-mulima-b9a685231" target="_blank" rel="noopener noreferrer">
            LinkedIn<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a href="https://github.com/NBA-Makonnen" target="_blank" rel="noopener noreferrer">
            GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <ThemeToggle />
        </div>

        <button
          className="md:hidden flex flex-col items-center justify-center gap-1.5 w-11 h-11 -mr-1.5"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
        >
          <span className="block h-0.5 w-6 bg-current" />
          <span className="block h-0.5 w-6 bg-current" />
          <span className="block h-0.5 w-6 bg-current" />
        </button>
      </div>

      {isOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="md:hidden flex flex-col gap-4 px-6 pb-6 font-heading text-lg"
        >
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-4 text-sm pt-2 border-t border-brand/20">
            <a href="https://www.linkedin.com/in/makonnen-mulima-b9a685231" target="_blank" rel="noopener noreferrer">
              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href="https://github.com/NBA-Makonnen" target="_blank" rel="noopener noreferrer">
              GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <ThemeToggle />
          </div>
        </nav>
      )}
    </header>
  );
}
