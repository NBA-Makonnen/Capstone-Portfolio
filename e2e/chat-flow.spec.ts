import { test, expect } from "@playwright/test";

// Format verified against the actual `ai` package source
// (src/ui-message-stream/*): each event is `data: ${JSON.stringify(chunk)}\n\n`,
// terminated by `data: [DONE]\n\n`. Chunk shapes match the package's own
// `uiMessageChunkSchema`. This is what lets the mocked response flow through
// the real `useChat` + `DefaultChatTransport` parsing path unmodified.
function sseEvent(chunk: unknown) {
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

const MOCK_ANSWER =
  "I've built six AWS projects, including a fully serverless app on S3, Lambda, and DynamoDB.";

const MOCK_STREAM_BODY =
  sseEvent({ type: "start", messageId: "msg-e2e" }) +
  sseEvent({ type: "text-start", id: "t1" }) +
  sseEvent({ type: "text-delta", id: "t1", delta: MOCK_ANSWER }) +
  sseEvent({ type: "text-end", id: "t1" }) +
  sseEvent({ type: "finish" }) +
  "data: [DONE]\n\n";

test("visitor can open the chat, ask a question, and see a streamed answer", async ({ page }) => {
  // Intercept at the network layer so this test never reaches Gemini or
  // spends a real API call, per the "never call the real API" constraint.
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        "content-type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
      },
      body: MOCK_STREAM_BODY,
    });
  });

  await page.goto("/");

  await page.getByRole("button", { name: "Ask about my work" }).click();
  const chat = page.getByRole("region", { name: "Chat" });
  await expect(chat).toBeVisible();

  await page.getByPlaceholder("Ask a question...").fill("What AWS projects have you built?");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(chat.getByText(MOCK_ANSWER)).toBeVisible();
});
