import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-brand/20">
      <nav className="flex gap-6 font-heading text-lg">
        <Link href="/">Home</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/certificates">Certificates</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <div className="flex items-center gap-4 text-sm">
        <a href="https://www.linkedin.com/in/makonnen-mulima-b9a685231" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="https://github.com/NBA-Makonnen" target="_blank" rel="noopener noreferrer">GitHub</a>
        <ThemeToggle />
      </div>
    </header>
  );
}