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

// Allow streaming responses up to 30 seconds before Vercel times out the
// function. Plenty for short Q&A-style answers from Gemini Flash.
export const maxDuration = 30;

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
            throw new Error(`No project found matching "${projectName}"`);
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