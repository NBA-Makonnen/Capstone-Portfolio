import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// jsdom has no WebGL context, so the real ViewerScene (a Canvas/R3F tree)
// can't mount here. Mock it and assert on the DOM-level contract instead:
// which modelUrl prop it receives, and the surrounding drop-zone logic.
vi.mock("./ViewerScene", () => ({
  ViewerScene: ({ modelUrl }: { modelUrl: string }) => (
    <div data-testid="viewer-scene" data-model-url={modelUrl} />
  ),
}));

// next/dynamic's real ssr:false + Suspense-style loading resolves
// asynchronously, which is awkward to await deterministically in a unit
// test. Since "./ViewerScene" is already mocked above (and that mock is
// what this import resolves to, since vi.mock calls are hoisted before
// this import runs), just render it directly and skip next/dynamic's
// lazy-loading machinery entirely for this test.
import { ViewerScene as MockedViewerScene } from "./ViewerScene";
vi.mock("next/dynamic", () => ({
  default:
    () =>
    (props: { modelUrl: string; onModelError: (message: string) => void }) => (
      <MockedViewerScene {...props} />
    ),
}));

import { LazyViewer } from "./LazyViewer";

function makeFile(name: string, sizeBytes: number) {
  return new File([new Uint8Array(sizeBytes)], name);
}

describe("LazyViewer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads the default model and shows no reset button initially", () => {
    render(<LazyViewer />);
    const scene = screen.getByTestId("viewer-scene");
    expect(scene).toHaveAttribute("data-model-url", "/models/mbm-logo.glb");
    expect(screen.queryByText("Reset to default")).not.toBeInTheDocument();
  });

  // The <input accept=".glb"> already blocks mismatched files at the OS
  // file-picker level in real browsers (and @testing-library/user-event's
  // upload() faithfully simulates that filtering too), so our own JS
  // validation is only reachable — and only matters — via drag-and-drop,
  // which has no equivalent browser-level filtering. Test it there.
  it("rejects a non-.glb file dropped onto the scene with a clear message", () => {
    render(<LazyViewer />);
    const scene = screen.getByTestId("viewer-scene");
    const dropZone = scene.parentElement as HTMLElement;

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [makeFile("model.obj", 1024)] },
    });

    expect(
      screen.getByText("Only .glb files are supported — try exporting as glTF Binary.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Reset to default")).not.toBeInTheDocument();
  });

  it("rejects a .glb file over the 25MB limit", async () => {
    const user = userEvent.setup();
    render(<LazyViewer />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeFile("huge.glb", 26 * 1024 * 1024));

    expect(
      screen.getByText("That file is over 25MB — try a smaller or compressed .glb.")
    ).toBeInTheDocument();
  });

  it("accepts a valid .glb, swaps the model URL, and shows a reset button", async () => {
    const user = userEvent.setup();
    render(<LazyViewer />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeFile("custom.glb", 1024));

    const scene = screen.getByTestId("viewer-scene");
    expect(scene.getAttribute("data-model-url")).toMatch(/^blob:/);
    expect(screen.getByText("Reset to default")).toBeInTheDocument();
    expect(
      screen.queryByText("Only .glb files are supported — try exporting as glTF Binary.")
    ).not.toBeInTheDocument();
  });

  it("returns to the default model when Reset is clicked", async () => {
    const user = userEvent.setup();
    render(<LazyViewer />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeFile("custom.glb", 1024));
    expect(screen.getByText("Reset to default")).toBeInTheDocument();

    await user.click(screen.getByText("Reset to default"));

    const scene = screen.getByTestId("viewer-scene");
    expect(scene).toHaveAttribute("data-model-url", "/models/mbm-logo.glb");
    expect(screen.queryByText("Reset to default")).not.toBeInTheDocument();
  });

  it("loads a file dropped directly onto the scene", async () => {
    render(<LazyViewer />);
    const scene = screen.getByTestId("viewer-scene");
    const dropZone = scene.parentElement as HTMLElement;

    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [makeFile("dropped.glb", 1024)] },
    });

    expect(await screen.findByText("Reset to default")).toBeInTheDocument();
  });

  describe("reduced motion / save-data", () => {
    it("shows the static poster instead of the scene when prefers-reduced-motion matches", async () => {
      vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }));

      render(<LazyViewer />);

      expect(await screen.findByText("Interactive scene paused")).toBeInTheDocument();
      expect(screen.queryByTestId("viewer-scene")).not.toBeInTheDocument();
    });

    it("loads the interactive scene anyway once the user opts in from the fallback", async () => {
      const user = userEvent.setup();
      vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }));

      render(<LazyViewer />);
      await screen.findByText("Interactive scene paused");

      await user.click(screen.getByText("Load interactive 3D scene anyway"));

      expect(await screen.findByTestId("viewer-scene")).toBeInTheDocument();
      expect(screen.queryByText("Interactive scene paused")).not.toBeInTheDocument();
    });

    it("still shows the interactive scene by default when motion is not reduced", () => {
      // Uses the vitest.setup.ts default (matches: false for every query).
      render(<LazyViewer />);
      expect(screen.getByTestId("viewer-scene")).toBeInTheDocument();
      expect(screen.queryByText("Interactive scene paused")).not.toBeInTheDocument();
    });
  });
});
