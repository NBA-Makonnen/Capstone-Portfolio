# CLAUDE.md

Guidance for Claude Code / Cursor / VS Code when working in this repository.

## Project

Capstone Portfolio — an interactive personal site showcasing front-end AI engineering projects and AWS certifications, built during an 8-week AI Fluency track.

## Stack

- Next.js (App Router), TypeScript (strict mode)
- Server Components by default; Client Components only where interactivity requires it (marked `"use client"`)
- Tailwind CSS v4 for styling
- Deployed on Vercel — primarily static, but `/health` is a Server Component doing a live fetch to GitHub's public API, so it runs as a server-rendered route on request rather than pure static HTML. Intent is still to stay within Vercel's free tier; avoid adding further server-side calls without checking that.

## Routes

- `/` — Landing
- `/projects` — Project case studies
- `/certificates` — Certifications
- `/contact` — Bio + contact form + CV download
- `/health` — Health-check endpoint, not in nav

## Conventions

- Commits follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `style:`, `refactor:`)
- Functional components only, no class components
- Components live in `src/components/`, one component per file
- Named exports for regular components. Default exports are required (not optional) for Next.js App Router special files — `page.tsx`, `layout.tsx`, and similar — per framework convention.
- Project summaries are AI-generated once during development and stored as static content in `src/data/` — no live API calls at runtime for these, to keep hosting cost at $0

## Commands

- `npm run dev` — start local dev server
- `npm run build` — production build
- `npm run lint` — run linter

## Notes for AI assistants

- This project has no backend and no API keys in the codebase — keep it that way unless explicitly asked to change the architecture
- Ask before adding new dependencies

## Rules learned from the workflow drill (Week 2)

- Vague prompts to AI agents will silently touch files far outside the requested scope (e.g., asking for a contact form resulted in edits to Header, Footer, Hero, and Projects too). Always state scope boundaries explicitly in prompts.
- Do not let AI wire up third-party services (analytics, form delivery, APIs) without explicit approval — it will pick one on its own if not constrained.
- This project has `verbatimModuleSyntax` enabled in tsconfig — type-only imports must use `import { type X }`, not `import { X }`.
- Always request an explicit verification step (tests, and running them) in the prompt itself. AI assistants do not self-verify unless asked.