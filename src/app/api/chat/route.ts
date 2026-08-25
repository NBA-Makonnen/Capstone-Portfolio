import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  UIMessage,
} from "ai";
import { z } from "zod";
import { model, systemPrompt } from "@/lib/ai-config";
import { findProject } from "@/lib/project-data";
import { MAX_MESSAGE_CHARS, MAX_MESSAGES } from "@/lib/chat-limits";

// Allow streaming responses up to 30 seconds before Vercel times out the
// function. Plenty for short Q&A-style answers from Gemini Flash.
export const maxDuration = 30;

function totalTextChars(message: UIMessage | undefined): number {
  if (!message) return 0;
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .reduce((total, part) => total + part.text.length, 0);
}

// Surfaces real tool errors in the UI instead of the AI SDK's default
// masked "An error occurred" message, so the designed error state actually
// shows something meaningful.
function errorHandler(error: unknown) {
  if (error == null) return "Unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Defense-in-depth: the UI already prevents both of these cases (see
  // ChatPanel), but the route itself must not trust the client — anyone
  // can call this endpoint directly and run up the shared, credit-limited
  // Gemini API key. These are plain-text responses, not JSON, because the
  // AI SDK's transport throws `new Error(await response.text())` on a
  // non-ok response, so the body becomes the error message shown in the
  // UI verbatim.
  if (messages.length > MAX_MESSAGES) {
    return new Response(
      `This conversation has reached its ${MAX_MESSAGES}-message limit. Refresh the page to start a new one.`,
      { status: 429 }
    );
  }

  if (totalTextChars(messages.at(-1)) > MAX_MESSAGE_CHARS) {
    return new Response(`Messages are limited to ${MAX_MESSAGE_CHARS} characters.`, {
      status: 413,
    });
  }

  const result = streamText({
    model,
    instructions: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      getProjectDetails: {
        description:
          "Look up structured details about one specific project by name, for rendering as a project card. Use this whenever a visitor asks about a specific named project.",
        inputSchema: z.object({
          projectName: z
            .string()
            .describe("The project name to look up, matching one of the known project titles"),
        }),
        execute: async ({ projectName }: { projectName: string }) => {
          const project = findProject(projectName);
          if (!project) {
            throw new Error(
              `I don't have a project called "${projectName}" — take a look at the /projects page for what's actually there, or ask me about one of those by name.`
            );
          }
          return project;
        },
      },
    },
  });

  // Converts the raw model stream into the UI message stream format that
  // useChat expects on the client, preserving message parts (text, tool
  // calls, etc.) rather than just raw text chunks.
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream, onError: errorHandler }),
  });
}