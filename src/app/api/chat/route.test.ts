import { describe, it, expect, vi, beforeEach } from "vitest";
import type { UIMessage } from "ai";
import { MAX_MESSAGE_CHARS, MAX_MESSAGES } from "@/lib/chat-limits";

// The route's own job here is the validation short-circuit before
// streamText is ever called — not streaming itself, which is the AI SDK's
// concern. Mocking the SDK keeps these tests fast, offline, and focused on
// exactly what this route adds.
const streamTextMock = vi.fn((..._args: unknown[]) => ({ stream: "mock-stream" }));
vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return {
    ...actual,
    streamText: streamTextMock,
    convertToModelMessages: vi.fn(async (messages: unknown) => messages),
    createUIMessageStreamResponse: vi.fn(
      () => new Response("mock-stream-body", { status: 200 })
    ),
    toUIMessageStream: vi.fn(({ stream }: { stream: unknown }) => stream),
  };
});

vi.mock("@/lib/ai-config", () => ({
  model: "mock-model",
  systemPrompt: "mock-system-prompt",
}));

function makeMessage(id: string, text: string): UIMessage {
  return { id, role: "user", parts: [{ type: "text", text }] } as UIMessage;
}

async function callRoute(messages: UIMessage[]) {
  const { POST } = await import("./route");
  const request = new Request("http://localhost/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
  return POST(request);
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    streamTextMock.mockClear();
  });

  it("rejects with 429 once the conversation exceeds the message cap, without calling streamText", async () => {
    const messages = Array.from({ length: MAX_MESSAGES + 1 }, (_, i) =>
      makeMessage(`${i}`, "hi")
    );

    const response = await callRoute(messages);
    const body = await response.text();

    expect(response.status).toBe(429);
    expect(body).toContain(`${MAX_MESSAGES}-message limit`);
    expect(streamTextMock).not.toHaveBeenCalled();
  });

  it("rejects with 413 when the latest message exceeds the character cap, without calling streamText", async () => {
    const messages = [makeMessage("1", "a".repeat(MAX_MESSAGE_CHARS + 1))];

    const response = await callRoute(messages);
    const body = await response.text();

    expect(response.status).toBe(413);
    expect(body).toContain(`${MAX_MESSAGE_CHARS} characters`);
    expect(streamTextMock).not.toHaveBeenCalled();
  });

  it("proceeds to streamText for a normal message within both caps", async () => {
    const messages = [makeMessage("1", "What AWS projects have you built?")];

    const response = await callRoute(messages);

    expect(response.status).toBe(200);
    expect(streamTextMock).toHaveBeenCalledOnce();
  });
});
