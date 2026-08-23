import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useChat, type UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import type { ProjectRecord } from "@/lib/project-data";
import { MAX_MESSAGE_CHARS, MAX_MESSAGES } from "@/lib/chat-limits";
import { ChatPanel } from "./ChatPanel";

// The chat message renderer's job is to turn `messages`/`status`/`error`
// into UI — not to manage streaming itself. Mocking the hook (rather than
// faking the underlying fetch/stream wire format) lets each test drive
// exactly the state we want and guarantees no test ever reaches the
// network or the real API.
vi.mock("@ai-sdk/react", () => ({
  useChat: vi.fn(),
}));

// Streamdown does real markdown parsing/rendering, which is its own
// concern, not ChatPanel's. Rendering the raw string keeps these tests
// focused on ChatPanel's own branching logic.
vi.mock("streamdown", () => ({
  Streamdown: ({ children }: { children: string }) => <>{children}</>,
}));

const mockUseChat = vi.mocked(useChat);

function makeChatHelpers(
  overrides: Partial<UseChatHelpers<UIMessage>>
): UseChatHelpers<UIMessage> {
  return {
    id: "test-chat",
    messages: [],
    status: "ready",
    error: undefined,
    sendMessage: vi.fn(),
    regenerate: vi.fn(),
    stop: vi.fn(),
    setMessages: vi.fn(),
    resumeStream: vi.fn(),
    addToolResult: vi.fn(),
    addToolOutput: vi.fn(),
    addToolApprovalResponse: vi.fn(),
    clearError: vi.fn(),
    ...overrides,
  };
}

const sampleProject: ProjectRecord = {
  title: "Serverless Web Application",
  category: "AWS",
  summary: "A fully serverless app on S3, CloudFront, Lambda, and DynamoDB.",
  highlights: ["Frontend served from S3 via CloudFront"],
  hasLiveDemo: false,
};

describe("ChatPanel", () => {
  beforeEach(() => {
    mockUseChat.mockReset();
  });

  it("renders the chat region", () => {
    mockUseChat.mockReturnValue(makeChatHelpers({}));
    render(<ChatPanel />);

    expect(screen.getByRole("region", { name: "Chat" })).toBeInTheDocument();
  });

  it("shows the empty state and fills the input when the example question is clicked", async () => {
    mockUseChat.mockReturnValue(makeChatHelpers({}));
    const user = userEvent.setup();
    render(<ChatPanel />);

    await user.click(
      screen.getByRole("button", { name: /What AWS projects have you built\?/ })
    );

    expect(screen.getByPlaceholderText("Ask a question...")).toHaveValue(
      "What AWS projects have you built?"
    );
  });

  it("renders text parts for both user and assistant messages", () => {
    mockUseChat.mockReturnValue(
      makeChatHelpers({
        messages: [
          { id: "1", role: "user", parts: [{ type: "text", text: "Hi there" }] },
          { id: "2", role: "assistant", parts: [{ type: "text", text: "Hello! Ask away." }] },
        ] as UIMessage[],
      })
    );
    render(<ChatPanel />);

    expect(screen.getByText("Hi there")).toBeInTheDocument();
    expect(screen.getByText("Hello! Ask away.")).toBeInTheDocument();
  });

  it("shows the thinking indicator only while the last assistant message has no content yet", () => {
    mockUseChat.mockReturnValue(
      makeChatHelpers({
        status: "submitted",
        messages: [
          { id: "1", role: "user", parts: [{ type: "text", text: "Hi" }] },
          { id: "2", role: "assistant", parts: [] },
        ] as UIMessage[],
      })
    );
    render(<ChatPanel />);

    expect(screen.getByLabelText("Thinking")).toBeInTheDocument();
  });

  it("renders the input-available tool state, naming the project being looked up", () => {
    mockUseChat.mockReturnValue(
      makeChatHelpers({
        messages: [
          {
            id: "1",
            role: "assistant",
            parts: [
              {
                type: "tool-getProjectDetails",
                toolCallId: "call-1",
                state: "input-available",
                input: { projectName: "Serverless Web Application" },
              },
            ],
          },
        ] as UIMessage[],
      })
    );
    render(<ChatPanel />);

    expect(screen.getByText(/Looking up "Serverless Web Application"/)).toBeInTheDocument();
  });

  it("renders the output-available tool state as a ProjectCard", () => {
    mockUseChat.mockReturnValue(
      makeChatHelpers({
        messages: [
          {
            id: "1",
            role: "assistant",
            parts: [
              {
                type: "tool-getProjectDetails",
                toolCallId: "call-1",
                state: "output-available",
                input: { projectName: "Serverless Web Application" },
                output: sampleProject,
              },
            ],
          },
        ] as UIMessage[],
      })
    );
    render(<ChatPanel />);

    expect(
      screen.getByRole("heading", { level: 4, name: "Serverless Web Application" })
    ).toBeInTheDocument();
  });

  it("renders the output-error tool state with the real error text", () => {
    mockUseChat.mockReturnValue(
      makeChatHelpers({
        messages: [
          {
            id: "1",
            role: "assistant",
            parts: [
              {
                type: "tool-getProjectDetails",
                toolCallId: "call-1",
                state: "output-error",
                input: { projectName: "Nonexistent Project" },
                errorText: 'No project found matching "Nonexistent Project"',
              },
            ],
          },
        ] as UIMessage[],
      })
    );
    render(<ChatPanel />);

    expect(
      screen.getByText(/Couldn't look that project up: No project found matching/)
    ).toBeInTheDocument();
  });

  it("shows Stop instead of Send while a response is streaming, and calls stop() when clicked", async () => {
    mockUseChat.mockReturnValue(makeChatHelpers({ status: "streaming" }));
    const user = userEvent.setup();
    render(<ChatPanel />);
    const helpers = mockUseChat.mock.results[0].value as UseChatHelpers<UIMessage>;

    expect(screen.queryByRole("button", { name: "Send" })).not.toBeInTheDocument();
    const stopButton = screen.getByRole("button", { name: "Stop" });
    await user.click(stopButton);

    expect(helpers.stop).toHaveBeenCalledOnce();
  });

  it("moves focus to the Stop button once streaming starts", () => {
    mockUseChat.mockReturnValue(makeChatHelpers({ status: "streaming" }));
    render(<ChatPanel />);

    expect(screen.getByRole("button", { name: "Stop" })).toHaveFocus();
  });

  it("shows an error banner with a working retry button when a message fails", async () => {
    mockUseChat.mockReturnValue(
      makeChatHelpers({ status: "ready", error: new Error("network error") })
    );
    const user = userEvent.setup();
    render(<ChatPanel />);
    const helpers = mockUseChat.mock.results[0].value as UseChatHelpers<UIMessage>;

    expect(screen.getByText("That last message didn't go through.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry last message" }));

    expect(helpers.regenerate).toHaveBeenCalledOnce();
  });

  it("sends the trimmed input and clears the field on submit", async () => {
    mockUseChat.mockReturnValue(makeChatHelpers({ status: "ready" }));
    const user = userEvent.setup();
    render(<ChatPanel />);
    const helpers = mockUseChat.mock.results[0].value as UseChatHelpers<UIMessage>;

    const input = screen.getByPlaceholderText("Ask a question...");
    await user.type(input, "  What certifications do you have?  ");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(helpers.sendMessage).toHaveBeenCalledWith({
      text: "What certifications do you have?",
    });
    expect(input).toHaveValue("");
  });

  it("disables Send when the input is empty", () => {
    mockUseChat.mockReturnValue(makeChatHelpers({ status: "ready" }));
    render(<ChatPanel />);

    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("shows a validation error and does not send when the message exceeds the character limit", () => {
    mockUseChat.mockReturnValue(makeChatHelpers({ status: "ready" }));
    render(<ChatPanel />);
    const helpers = mockUseChat.mock.results[0].value as UseChatHelpers<UIMessage>;

    const input = screen.getByPlaceholderText("Ask a question...");
    const tooLong = "a".repeat(MAX_MESSAGE_CHARS + 1);
    fireEvent.change(input, { target: { value: tooLong } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(
      screen.getByText(
        `Messages are limited to ${MAX_MESSAGE_CHARS} characters (this one is ${tooLong.length}).`
      )
    ).toBeInTheDocument();
    expect(helpers.sendMessage).not.toHaveBeenCalled();
  });

  it("clears the validation error once the user edits the message", () => {
    mockUseChat.mockReturnValue(makeChatHelpers({ status: "ready" }));
    render(<ChatPanel />);

    const input = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(input, { target: { value: "a".repeat(MAX_MESSAGE_CHARS + 1) } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByText(/Messages are limited to/)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "a shorter message" } });
    expect(screen.queryByText(/Messages are limited to/)).not.toBeInTheDocument();
  });

  it("replaces the input with a limit-reached message once the conversation hits its message cap", () => {
    const messages = Array.from({ length: MAX_MESSAGES }, (_, i) => ({
      id: `${i}`,
      role: i % 2 === 0 ? "user" : "assistant",
      parts: [{ type: "text", text: "hi" }],
    })) as UIMessage[];
    mockUseChat.mockReturnValue(makeChatHelpers({ status: "ready", messages }));
    render(<ChatPanel />);

    expect(
      screen.getByText(
        "This conversation has reached its message limit. Refresh the page to start a new one."
      )
    ).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Ask a question...")).not.toBeInTheDocument();
  });
});
