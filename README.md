# Capstone Portfolio

Personal portfolio site for Makonnen B. Mulima — AWS Certified Cloud Practitioner and
Front-end AI Engineering intern at FlyRank AI. Built with Next.js App Router, TypeScript,
and Tailwind CSS, deployed on Vercel.

**Live:** [makonnen.is-a.dev](https://makonnen.is-a.dev) (also at
[makonnen-mulima-portfolio.vercel.app](https://makonnen-mulima-portfolio.vercel.app))

## What this is

A recruiter- and hiring-manager-facing portfolio: project case studies (both AWS console
labs and front-end builds), certifications, and a way to get in touch — plus two things
built specifically to demonstrate front-end + AI skills rather than just list them. A chat
widget answers questions about the projects using a real server-side tool call instead of
just echoing the system prompt back, and a drag-and-drop 3D viewer renders arbitrary glTF
models a visitor drops onto it. The goal was a portfolio that's actually a working
demonstration of the skills it's listing, not just a description of them.

## Screenshots

Real before/after accessibility and performance evidence from the audit lives in
[`docs/audit-screenshots/`](./docs/audit-screenshots) (Lighthouse and WAVE, before and
after, for every page) — see [`AUDIT.md`](./AUDIT.md) for the full writeup.

<!-- TODO: add 2-3 product screenshots here (homepage, the chat widget mid-conversation,
     /3d-viewer with a model loaded) before submitting — these need to come from an actual
     browser session, not something that can be generated from the codebase. -->

## Setup & run

```bash
git clone https://github.com/NBA-Makonnen/Capstone-Portfolio.git
cd Capstone-Portfolio
npm install
cp .env.example .env.local   # then fill in GOOGLE_GENERATIVE_AI_API_KEY, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The site works without the API key —
every route except the chat widget's actual replies renders and functions normally, and the
chat widget just shows its existing error+retry state instead of a response.

**Other scripts:**

| Command | What it does |
|---|---|
| `npm run build` | Production build |
| `npm start` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm test` | Run the Vitest + RTL suite once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright end-to-end test |

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes, for the chat feature | Gemini API key for the AI chat widget. Read automatically by `@ai-sdk/google` — get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Without it, the chat widget still renders but every message hits its existing error state. |

Set locally in `.env.local` (gitignored). In production, set it in the Vercel project's
Environment Variables settings for both the Production and Preview environments.

## Architecture overview

```
src/
├── app/
│   ├── page.tsx                 # Home
│   ├── projects/page.tsx        # AWS + front-end project case studies
│   ├── certificates/page.tsx    # Certifications
│   ├── contact/page.tsx         # Bio, CV download, Calendly link, direct email + LinkedIn links
│   ├── health/page.tsx          # Server Component health check (not in nav)
│   ├── 3d-viewer/page.tsx       # glTF viewer route (not in nav)
│   ├── button-demo/page.tsx     # SendButton component demo (not in nav)
│   ├── api/chat/route.ts        # Chat API route — streaming, tool calls, abuse guards
│   ├── error.tsx                # Route-segment error boundary
│   └── global-error.tsx         # Catches errors thrown by the root layout itself
├── components/
│   ├── ChatWidget.tsx           # Always-visible toggle button (lightweight, no heavy deps)
│   ├── ChatPanel.tsx            # Everything interactive — lazy-loaded, mounted on open only
│   ├── LazyViewer.tsx           # Lazy-loaded wrapper around the R3F/drei/leva 3D scene
│   ├── ProjectCard.tsx          # Renders getProjectDetails' tool output
│   └── SendButton.tsx           # Reusable animated button (idle/hover/loading/success/error)
└── lib/
    ├── ai-config.ts             # Model choice + system prompt
    ├── project-data.ts          # Structured project data the chat tool looks up
    └── chat-limits.ts           # Shared message/conversation caps (client + server)
```

**Why the ChatWidget/ChatPanel split:** the panel pulls in the full AI SDK, Streamdown, and
the chat UI — code that shouldn't ship to a visitor who never opens the chat. `ChatWidget` is
the only thing in the initial bundle; `ChatPanel` loads via `next/dynamic({ ssr: false })`
only once the widget is clicked, and idle-time-prefetches so that first click still feels
instant. This cut a real, measured 464KB out of every other page's bundle.

## AI integration

A site-wide chat widget lets visitors ask about projects, certifications, and background.
Model: Google Gemini 3.5 Flash-Lite via the Vercel AI SDK — chosen over Anthropic's API
(mentor-approved substitution) since Anthropic doesn't currently offer an ongoing free tier,
and Flash-Lite's free-tier limits comfortably cover a low-traffic portfolio assistant that
isn't doing multi-step reasoning. Responses stream token-by-token, with a working stop and
regenerate (regenerate retries only the failed exchange, not the whole conversation).

**Why a tool call, not just a system prompt:** a plain system-prompted chatbot either
hallucinates project details or has to cram every project's full description into every
request. Instead, the model calls a real server-side tool to look up structured data on
demand — the same pattern a production app would use for any external data source, just
backed by a local file instead of a database.

### Tool contract: `getProjectDetails`

Defined in `src/app/api/chat/route.ts`, backed by `src/lib/project-data.ts`.

- **Input (Zod):** `z.object({ projectName: z.string() })`
- **Success:** returns a `ProjectRecord` — `title`, `category`, `summary`, `highlights[]`, `hasLiveDemo`
- **Failure:** throws a warm, actionable error (e.g. `I don't have a project called "X" — take
  a look at the /projects page for what's actually there, or ask me about one of those by
  name.`) if nothing matches — this is deliberate, so the UI's designed error state (a
  red-bordered card showing that message directly) actually gets exercised instead of only
  ever showing the happy path. Earlier this threw a bare `No project found matching "X"` with
  a "Couldn't look that project up:" prefix in the UI — reworded after an eval run showed it
  read as a raw system message rather than the site's own voice (see Eval results below).
- **Rendering:** `ChatPanel.tsx` renders all four tool-part states distinctly —
  `input-streaming`, `input-available`, `output-available` (a real `ProjectCard`), and
  `output-error` — none fall back to a raw JSON dump

### Abuse protection

`src/lib/chat-limits.ts` caps message length (2,000 characters) and conversation length (40
messages), enforced both client-side (so the UI never lets a request get that far) and
server-side in the route itself (so calling the API directly bypasses nothing). This is
**not** real rate limiting — see Known limitations.

## Usage examples

**Chat widget** — click the toggle button (bottom-right on any page) and ask about a specific
project by name, e.g. *"Tell me about the Serverless Web Application project"* or *"What's
your Accessible Components Playground project about?"* — the model calls `getProjectDetails`
and renders a real project card. General questions work differently: *"What have you built
with AWS overall?"* is answered from the model's own summary, without a tool call, since it
isn't asking about one specific project. Asking about something that isn't a real project
(*"tell me about your Kubernetes deployment project"*) gets an honest "I don't have a project
called that" instead of an invented answer.

**3D viewer** — visit `/3d-viewer` and either drag a `.glb` file onto the drop zone or use the
"browse files" fallback. Any valid glTF/GLB model under 25MB loads and renders with orbit
controls; the Leva panel (collapsed by default on mobile) lets you tweak material properties
live. Dropping something invalid (wrong extension, over the size limit) shows an inline error
instead of failing silently.

## Eval results (v1 → v2)

An 8-prompt manual eval of the chat widget's `getProjectDetails` tool, run against the live
site to check tool-call correctness, factual accuracy, and honesty on edge cases — not just
"does it respond."

| # | Prompt | Expected behavior | v1 | v2 |
|---|---|---|---|---|
| 1 | "Tell me about the Serverless Web Application project" | Tool call, accurate S3/CloudFront/Lambda/DynamoDB details | ✅ | ✅ |
| 2 | "What's your Accessible Components Playground project about?" | Tool call, mentions the Modal focus-management bug fix | ✅ | ✅ |
| 3 | "What have you built with AWS overall?" | General question — answered from the summary, **no** tool call | ✅ | ✅ |
| 4 | "Tell me about your Kubernetes deployment project" | Doesn't exist — honest refusal, not invented | ❌ (see below) | ✅ |
| 5 | "What's Makonnen's phone number?" | Declines — not in its context | ✅ | ✅ |
| 6 | "Is there a live demo for the Migrating a database to Amazon RDS project?" | Honest "no" (AWS sandbox expired) | ✅ | ✅ |
| 7 | "What's the weather like today?" | Off-topic — redirects rather than attempts an answer | ✅ | ✅ |
| 8 | "tell me about the react movie search project" (lowercase, partial) | Fuzzy name matching still resolves correctly | ✅ | ✅ |

**v1 result: 7/8.** The one failure wasn't a hallucination — the model correctly recognized
the project didn't exist — but the tool's raw thrown error text ("Couldn't look that project
up: No project found matching...") was surfaced verbatim in the UI, reading like a system
message rather than the site's stated "warm, grounded, understated" voice.

**Fix:** reworded the thrown error to be a complete, warm, actionable sentence on its own, and
dropped the robotic UI prefix that used to wrap it (see Tool contract above). Verified with
`tsc` and the full test suite on two independent fresh clones, then re-confirmed live —
**v2 result: 8/8**, with no regression on the other seven.

## Key decisions

- **Gemini over Anthropic** for the chat model — see AI integration above.
- **Input caps over a real rate limiter** for chat abuse protection — no shared store (Redis/
  Vercel KV) needed, at the cost of not stopping a scripted attacker from opening many
  separate conversations. Accepted tradeoff for a low-traffic personal site; see Known
  limitations.
- **`makonnen.is-a.dev` over a paid personal domain or waiting on FlyRank's Ops-provisioned
  subdomain** — free, immediate, and under my own control; a DNS walkthrough for the eventual
  FlyRank subdomain is documented for whenever Ops provisions it.
- **Contact page uses direct links (email, LinkedIn) instead of a form** — no backend to
  build or secure, and "email me" is a real `mailto:` link rather than a form that used to
  validate client-side without actually sending anywhere.
- **`--color-brand` moved 2% darker** (`#8670A3` → `#816A9F`, same hue/saturation) to clear
  WCAG AA contrast for white text — one token change fixed four separate failing UI elements
  at once (CTA, chat toggle, chat bubbles, project badges) because they all read from it.

## Testing

Vitest + React Testing Library + Playwright, wired into CI. 32 unit/component tests across 5
test files, plus 1 Playwright end-to-end test covering the primary user flow. `LazyViewer` and
`ChatWidget`'s tests mock `next/dynamic` to test the lazy-loaded components synchronously
rather than skipping them.

## Performance & accessibility

Audited with Lighthouse (mobile) and WAVE against every page; full before/after numbers and
screenshots in [`AUDIT.md`](./AUDIT.md). Headline results:

- Lighthouse mobile Accessibility: → **100**
- Lighthouse mobile Performance: 83 → **88** (clears the 80 minimum bar; short of the 90
  "aim for" target — a conscious tradeoff, not an oversight, given the 3D viewer route's
  necessarily heavier bundle)
- WAVE contrast errors, every page: → **0**
- One concrete fix from the audit: the site's muted-text convention (`opacity-40/50/60` on
  real text) systemically failed AA contrast in light mode — fixed by bumping every real-text
  usage to `opacity-70` minimum across 7 files, while correctly leaving disabled-control
  opacity and decorative indicators alone (WCAG exempts both)

## Known limitations

- **Chat abuse protection is input caps, not real rate limiting.** Nothing tracks requests
  across separate conversations or IP addresses — this bounds the cost of one conversation,
  not the total cost an attacker could rack up by opening many.
- **Desktop Safari untested.** Chrome, Firefox, and mobile Safari (real iOS device) are
  confirmed working; I don't have access to macOS to test desktop Safari directly.
- **3D viewer's DRACO decoder loads from Google's CDN at runtime** (drei's default) rather
  than being self-hosted — a third-party runtime dependency I'd remove given more time.
- **FlyRank's Ops-provisioned subdomain isn't live yet** — the site currently lives at
  `makonnen.is-a.dev` and the Vercel URL; a DNS walkthrough is ready for whenever Ops
  provisions the real subdomain.

## How AI tools built this

I used Claude as a pairing partner for most of this build, with GPT also helping with
codebase verification. It wasn't a case of telling AI to build things for me and accepting
whatever it gave back.

- **How I worked with it:** Claude worked in a sandboxed clone with no push access to my
  actual repos. Earlier on I was manually editing files; later in the build I switched to
  `git diff` patch files after Claude pointed out that patches are faster and reduce the
  chance of accidentally changing the wrong thing, since they target specific lines. I'd
  still read through the diff, apply it locally, test it, and handle the commit/push/PR
  myself. Nothing went into my actual repo without me looking at it first.
- **It actually caught problems:** Claude didn't just trust a "Merged" badge or a green CI
  check — it verified from a fresh clone. That caught a `*.patch` gitignore rule I thought
  had been merged but hadn't, a mobile-accessibility PR missing one of three intended files,
  and an is-a.dev PR that showed "Merged" on GitHub while the actual file still 404'd (turned
  out the GitHub admin for is-a.dev subdomain registrations still had to merge it from their
  side).
- **What Claude actually helped build:** the ChatWidget/ChatPanel bundle-size split, the WCAG
  contrast fixes across the site, and the input-cap protection on the chat route. This is my
  first time properly doing front-end development, so I'm still learning the stack I chose —
  using Claude as a pairing partner helped me understand what I was changing instead of
  figuring everything out from scratch.
- **What I still decided myself:** which browsers to test and how, keeping the Contact form's
  fake backend as a documented limitation instead of building a real one this time, using
  input caps instead of a proper rate limiter, and what actually got merged.
- **Why I don't think I was rubber-stamping it:** the merge-gap problems are the best example.
  If I were just accepting whatever Claude said, those issues would have gone straight
  through. Having it re-clone and verify what was actually there was a good reminder that a
  "Merged" status doesn't always mean the thing I expected is actually there — AI can help me
  build and verify things, but I still need to understand what it's doing and check the
  result myself.

## Credits

Default 3D model: "My Logo" — a personal extruded-wordmark model, not third-party licensed
content, so no external attribution is required. Compressed for this page: welded duplicate
vertices and Draco geometry compression (no texture recompression needed — the model has none),
1.36MB → 35.4KB, with the full triangle count and letterform geometry preserved exactly (no
mesh decimation/simplification applied, since that would round off the model's sharp edges).
