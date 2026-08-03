import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  UIMessage,
} from "ai";
import { model, systemPrompt } from "@/lib/ai-config";

// Allow streaming responses up to 30 seconds before Vercel times out the
// function. Plenty for short Q&A-style answers from Gemini Flash.
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model,
    instructions: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  // Converts the raw model stream into the UI message stream format that
  // useChat expects on the client, preserving message parts (text, etc.)
  // rather than just raw text chunks.
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}