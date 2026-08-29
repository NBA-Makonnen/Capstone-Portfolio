import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("./AnimatedBackground", () => ({
  AnimatedBackground: ({ variant }: { variant?: string }) => (
    <div data-testid="animated-background" data-variant={variant} />
  ),
}));

const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

import { SiteBackground } from "./SiteBackground";

describe("SiteBackground", () => {
  it("renders nothing on the homepage (which uses its own hero variant)", () => {
    mockUsePathname.mockReturnValue("/");
    render(<SiteBackground />);
    expect(screen.queryByTestId("animated-background")).not.toBeInTheDocument();
  });

  it("renders the ambient variant on every other route", () => {
    mockUsePathname.mockReturnValue("/projects");
    render(<SiteBackground />);
    expect(screen.getByTestId("animated-background")).toHaveAttribute(
      "data-variant",
      "ambient"
    );
  });
});
