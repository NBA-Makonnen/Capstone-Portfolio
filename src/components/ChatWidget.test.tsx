import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useChat, type UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import type { ProjectRecord } from "@/lib/project-data";
import { ChatWidget } from "./ChatWidget";

// The chat message renderer's job is to turn `messages`/`status`/`error`
// into UI — not to manage streaming itself. Mocking the hook (rather than
// faking the underlying fetch/stream wire format) lets each test drive
// exactly the state we want and guarantees no test ever reaches the
// network or the real API.
vi.mock("@ai-sdk/react", () => ({
  useChat: vi.fn(),
}));

// Streamdown does real markdown parsing/rendering, which is its own
// concern, not ChatWidget's. Rendering the raw string keeps these tests
// focused on ChatWidget's own branching logic.
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

async function openWidget() {
  const user = userEvent.setup();
  render(<ChatWidget />);
  await user.click(screen.getByRole("button", { name: "Ask about my work" }));
  return user;
}

describe("ChatWidget", () => {
  beforeEach(() => {
    mockUseChat.mockReset();
  });

  it("is closed by default and opens the chat region on toggle", async () => {
    mockUseChat.mockReturnValue(makeChatHelpers({}));
    const user = await openWidget();

    expect(screen.getByRole("region", { name: "Chat" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close chat" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close chat" }));
    expect(screen.queryByRole("region", { name: "Chat" })).not.toBeInTheDocument();
  });

  it("shows the empty state and fills the input when the example question is clicked", async () => {
    mockUseChat.mockReturnValue(makeChatHelpers({}));
    const user = await openWidget();

    await user.click(
      screen.getByRole("button", { name: /What AWS projects have you built\?/ })
    );

    expect(screen.getByPlaceholderText("Ask a question...")).toHaveValue(
      "What AWS projects have you built?"
    );
  });

  it("renders text parts for both user and assistant messages", async () => {
    mockUseChat.mockReturnValue(
      makeChatHelpers({
        messages: [
          { id: "1", role: "user", parts: [{ type: "text", text: "Hi there" }] },
          { id: "2", role: "assistant", parts: [{ type: "text", text: "Hello! Ask away." }] },
        ] as UIMessage[],
      })
    );
    await openWidget();

    expect(screen.getByText("Hi there")).toBeInTheDocument();
    expect(screen.getByText("Hello! Ask away.")).toBeInTheDocument();
  });

  it("shows the thinking indicator only while the last assistant message has no content yet", async () => {
    mockUseChat.mockReturnValue(
      makeChatHelpers({
        status: "submitted",
        messages: [
          { id: "1", role: "user", parts: [{ type: "text", text: "Hi" }] },
          { id: "2", role: "assistant", parts: [] },
        ] as UIMessage[],
      })
    );
    await openWidget();

    expect(screen.getByLabelText("Thinking")).toBeInTheDocument();
  });

  it("renders the input-available tool state, naming the project being looked up", async () => {
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
    await openWidget();

    expect(screen.getByText(/Looking up "Serverless Web Application"/)).toBeInTheDocument();
  });

  it("renders the output-available tool state as a ProjectCard", async () => {
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
    await openWidget();

    expect(
      screen.getByRole("heading", { level: 4, name: "Serverless Web Application" })
    ).toBeInTheDocument();
  });

  it("renders the output-error tool state with the real error text", async () => {
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
    await openWidget();

    expect(
      screen.getByText(/Couldn't look that project up: No project found matching/)
    ).toBeInTheDocument();
  });

  it("shows Stop instead of Send while a response is streaming, and calls stop() when clicked", async () => {
    mockUseChat.mockReturnValue(makeChatHelpers({ status: "streaming" }));
    const user = await openWidget();
    const helpers = mockUseChat.mock.results[0].value as UseChatHelpers<UIMessage>;

    expect(screen.queryByRole("button", { name: "Send" })).not.toBeInTheDocument();
    const stopButton = screen.getByRole("button", { name: "Stop" });
    await user.click(stopButton);

    expect(helpers.stop).toHaveBeenCalledOnce();
  });

  it("shows an error banner with a working retry button when a message fails", async () => {
    mockUseChat.mockReturnValue(
      makeChatHelpers({ status: "ready", error: new Error("network error") })
    );
    const user = await openWidget();
    const helpers = mockUseChat.mock.results[0].value as UseChatHelpers<UIMessage>;

    expect(screen.getByText("That last message didn't go through.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry last message" }));

    expect(helpers.regenerate).toHaveBeenCalledOnce();
  });

  it("sends the trimmed input and clears the field on submit", async () => {
    mockUseChat.mockReturnValue(makeChatHelpers({ status: "ready" }));
    const user = await openWidget();
    const helpers = mockUseChat.mock.results[0].value as UseChatHelpers<UIMessage>;

    const input = screen.getByPlaceholderText("Ask a question...");
    await user.type(input, "  What certifications do you have?  ");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(helpers.sendMessage).toHaveBeenCalledWith({
      text: "What certifications do you have?",
    });
    expect(input).toHaveValue("");
  });

  it("disables Send when the input is empty", async () => {
    mockUseChat.mockReturnValue(makeChatHelpers({ status: "ready" }));
    await openWidget();

    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });
});
