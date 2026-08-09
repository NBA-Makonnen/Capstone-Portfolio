# Capstone Portfolio

Personal portfolio site — Makonnen B. Mulima. Built with Next.js App Router, TypeScript,
and Tailwind CSS, deployed on Vercel.

Live: [makonnen-mulima-portfolio.vercel.app](https://makonnen-mulima-portfolio.vercel.app)

## Stack

- Next.js (App Router) — Server Components by default, Client Components only where
  interactivity requires it
- TypeScript (strict mode)
- Tailwind CSS v4
- AI chat feature powered by Google Gemini via the Vercel AI SDK
- Deployed on Vercel

## Routes

- `/` — Landing
- `/projects` — AWS and front-end project case studies
- `/certificates` — Certifications
- `/contact` — Bio, contact form, CV download, booking link
- `/health` — Health-check endpoint (not in nav)

## AI Chat Feature

A site-wide chat widget lets visitors ask about projects, certifications, and background.
Streams responses token by token, with a working stop/retry, and calls a real server-side
tool for structured project lookups.

### Tool contract: `getProjectDetails`

Defined in `src/app/api/chat/route.ts`, backed by structured data in `src/lib/project-data.ts`.

**Name:** `getProjectDetails`

**When it's called:** whenever a visitor asks about one specific named project. The model is
instructed to always call this rather than answer from its own context, so uncertain or
unfamiliar project names are handled the same way as real ones — by actually checking, not
guessing.

**Input schema (Zod):**
```ts
z.object({
  projectName: z.string().describe(
    "The project name to look up, matching one of the known project titles"
  ),
})
```

**Return shape (`ProjectRecord`, on success):**
```ts
{
  title: string;
  category: "AWS" | "Front-end";
  summary: string;
  highlights: string[];   // 2-3 short points, kept intentionally brief
  hasLiveDemo: boolean;
}
```

**On failure:** if no project matches the given name, `execute()` throws
`Error("No project found matching "<name>"")`. This is deliberate — it's what lets the UI's
designed error state (a red-bordered card with the real error message, rendered in
`ChatWidget.tsx`) actually get exercised, rather than only ever showing the happy path.

**Rendering:** `ChatWidget.tsx` renders all four tool part states distinctly —
`input-streaming` (a bare pulse placeholder), `input-available` (names the actual project
being looked up), `output-available` (the real `ProjectCard` component), and `output-error`
(the red-bordered failure card). None of these fall back to a raw JSON dump.