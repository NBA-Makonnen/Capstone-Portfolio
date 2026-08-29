import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";

// jsdom has no WebGL2 context, so the real ShaderCanvas (raw WebGL calls
// against a <canvas>) can't run here. Mock it and assert on the
// surrounding reduced-motion/theme branching instead — same approach as
// LazyViewer.test.tsx does for its Canvas/R3F tree.
vi.mock("./ShaderCanvas", () => ({
  ShaderCanvas: ({ dark }: { dark: boolean }) => (
    <div data-testid="shader-canvas" data-dark={dark} />
  ),
}));

import { AnimatedBackground } from "./AnimatedBackground";

function mockMatchMedia(reduced: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
    matches: reduced && query === "(prefers-reduced-motion: reduce)",
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

describe("AnimatedBackground", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.classList.remove("dark");
  });

  it("shows the static gradient fallback when prefers-reduced-motion matches", () => {
    mockMatchMedia(true);
    render(<AnimatedBackground />);
    expect(screen.queryByTestId("shader-canvas")).not.toBeInTheDocument();
  });

  it("loads the animated shader canvas when motion is not reduced", async () => {
    mockMatchMedia(false);
    render(<AnimatedBackground />);
    expect(await screen.findByTestId("shader-canvas")).toBeInTheDocument();
  });

  it("reads the dark theme from documentElement's class on mount", async () => {
    mockMatchMedia(false);
    document.documentElement.classList.add("dark");
    render(<AnimatedBackground />);
    const canvas = await screen.findByTestId("shader-canvas");
    expect(canvas.dataset.dark).toBe("true");
  });

  it("updates the canvas's dark prop live when the theme class changes", async () => {
    mockMatchMedia(false);
    render(<AnimatedBackground />);
    const canvas = await screen.findByTestId("shader-canvas");
    expect(canvas.dataset.dark).toBe("false");

    await act(async () => {
      document.documentElement.classList.add("dark");
      // Flush a couple of microtask turns: one for the MutationObserver
      // callback itself, one for the React state update it triggers.
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId("shader-canvas")).toHaveAttribute(
        "data-dark",
        "true"
      );
    });
  });
});
