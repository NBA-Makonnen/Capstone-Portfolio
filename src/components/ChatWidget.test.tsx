import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ChatWidget's own job is just the toggle button and open/closed state —
// the actual chat UI lives in ChatPanel (tested separately in
// ChatPanel.test.tsx) and is lazy-loaded via next/dynamic. Mock ChatPanel
// to a lightweight stub and mock next/dynamic to render it directly,
// skipping next/dynamic's real async resolution so these tests can stay
// synchronous and focused on ChatWidget's own toggle logic.
vi.mock("./ChatPanel", () => ({
  ChatPanel: () => (
    <div role="region" aria-label="Chat">
      Mock chat panel
    </div>
  ),
}));

import { ChatPanel as MockedChatPanel } from "./ChatPanel";
vi.mock("next/dynamic", () => ({
  default: () => () => <MockedChatPanel />,
}));

import { ChatWidget } from "./ChatWidget";

describe("ChatWidget", () => {
  it("is closed by default and opens the chat region on toggle", async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);

    expect(screen.queryByRole("region", { name: "Chat" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ask me about my work" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );

    await user.click(screen.getByRole("button", { name: "Ask me about my work" }));

    expect(screen.getByRole("region", { name: "Chat" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close chat" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );

    await user.click(screen.getByRole("button", { name: "Close chat" }));
    expect(screen.queryByRole("region", { name: "Chat" })).not.toBeInTheDocument();
  });
});
