import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

// jsdom has no WebGL2 context, so the real ShaderCanvas (raw WebGL calls
// against a <canvas>) can't run here. Mock it and assert on the
// surrounding reduced-motion branching instead — same approach as
// LazyViewer.test.tsx does for its Canvas/R3F tree.
vi.mock("./ShaderCanvas", () => ({
  ShaderCanvas: () => <div data-testid="shader-canvas" />,
}));

import { HeroShader } from "./HeroShader";

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

describe("HeroShader", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the static gradient fallback when prefers-reduced-motion matches", () => {
    mockMatchMedia(true);
    render(<HeroShader />);
    expect(screen.queryByTestId("shader-canvas")).not.toBeInTheDocument();
  });

  it("loads the animated shader canvas when motion is not reduced", async () => {
    mockMatchMedia(false);
    render(<HeroShader />);
    expect(await screen.findByTestId("shader-canvas")).toBeInTheDocument();
  });
});
