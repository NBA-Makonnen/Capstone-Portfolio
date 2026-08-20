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
- 3D viewer powered by React Three Fiber, drei, and leva
- Deployed on Vercel

## Routes

- `/` — Landing
- `/projects` — AWS and front-end project case studies
- `/certificates` — Certifications
- `/contact` — Bio, contact form, CV download, booking link
- `/health` — Health-check endpoint (not in nav)
- `/3d-viewer` — Interactive glTF viewer and material configurator (not in nav)

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

## 3D Viewer

`/3d-viewer` is a drag-and-drop glTF viewer with a live material configurator, built with
[React Three Fiber](https://r3f.docs.pmnd.rs/) + [drei](https://github.com/pmndrs/drei) +
[leva](https://github.com/pmndrs/leva). Ships with one default model preloaded
(`public/models/helmet.glb`) so the page is never empty; drop or browse to a `.glb` of your
own to swap it in.

**What's implemented:**

- **Configurator** (leva panel): base color, metalness, roughness, wireframe toggle,
  environment preset (10 options), auto-rotate speed. Every mesh's material is cloned before
  any control is applied, so the changes never mutate the underlying cached model.
- **Custom models**: drag-and-drop onto the scene, or "browse files" (needed for touch
  devices — dragging a file from an OS file picker onto a mobile browser isn't a reliable
  interaction the way it is on desktop). Validates the extension (`.glb` only) and a 25MB
  size cap before attempting to load; a file that fails to parse as valid glTF is caught by
  an error boundary and reverts to the default model with a message, instead of breaking the
  page.
- **Responsible loading**: the Canvas (and the whole three/R3F/drei/leva bundle) is
  lazy-loaded via `next/dynamic({ ssr: false })`, so it never ships on any page but this one.
  Visitors with `prefers-reduced-motion: reduce` or Data Saver (`navigator.connection.saveData`)
  enabled see a static poster of the default model instead, with an explicit "Load interactive
  3D scene anyway" button rather than a state they can't get out of.

**Perf note:**

- Default model started as Khronos's [DamagedHelmet](https://github.com/KhronosGroup/glTF-Sample-Assets)
  sample (CC BY 4.0), a 3.77MB source file. Ran it through `gltf-transform optimize` (Draco
  geometry compression + WebP textures capped at 1024px) → **442KB, an 88% reduction**.
- Confirmed the lazy-loading actually works by inspecting the production build's
  `react-loadable-manifest.json` rather than assuming `next/dynamic` did what it was supposed
  to: the ~1.2MB three/R3F/drei/leva chunk shows up **only** in `/3d-viewer`'s manifest, and
  every other route's manifest is empty for it. Every page pays ~446KB of shared JS; only
  `/3d-viewer` additionally loads the 1.2MB 3D chunk, and only after hydration.
- **What I'd add with more time:** self-host the DRACO decoder (currently drei's default,
  which fetches it from Google's CDN at runtime) to drop the third-party dependency; KTX2
  texture compression for a smaller GPU memory footprint on lower-end phones; and a real
  on-device frame-rate measurement — touch handling is confirmed correct by reading
  `OrbitControls`' source directly (it sets `touchAction: 'none'` on connect, so drag doesn't
  fight the browser's native scroll), but an actual frames-per-second number on a mid-range
  phone is still outstanding.
