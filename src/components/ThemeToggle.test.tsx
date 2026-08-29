import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("defaults to light mode (aria-checked=false) with no stored preference", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("reads a stored dark preference on mount", () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeToggle />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggles theme, class, and localStorage on click, and updates the label", () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch");

    expect(toggle).toHaveAccessibleName("Switch to dark mode");
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(toggle).toHaveAccessibleName("Switch to light mode");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
