# CLAUDE.md

Guidance for Claude Code / Cursor when working in this repository.

## Project

Capstone Portfolio — an interactive personal site showcasing front-end AI engineering projects and AWS certifications, built during an 8-week AI Fluency track.

## Stack

- React 18 + Vite
- TypeScript (strict mode)
- Tailwind CSS for styling
- Deployed on Vercel (static — no serverless functions, to keep this free)

## Conventions

- Commits follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `style:`, `refactor:`)
- Functional components only, no class components
- Components live in `src/components/`, one component per file
- Prefer named exports over default exports
- Project summaries are AI-generated once during development and stored as static content in `src/data/` — no live API calls at runtime, to keep hosting cost at $0

## Commands

- `npm run dev` — start local dev server
- `npm run build` — production build
- `npm run lint` — run linter

## Notes for AI assistants

- This project has no backend and no API keys in the codebase — keep it that way unless explicitly asked to change the architecture
- Ask before adding new dependencies