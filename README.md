# Fomi — AI Content Generation Web Page

A pixel-focused implementation of the Fomi image/video generation dashboard
mockup, built with Next.js (App Router), JavaScript, and Tailwind CSS.

## Tech stack

- **Framework:** Next.js 16 (App Router, JavaScript)
- **Styling:** Tailwind CSS v4 (CSS-variable based design tokens in
  `src/app/globals.css`)
- **Icons:** lucide-react
- **Images:** `next/image`, backed by `picsum.photos` as a placeholder image
  source (see `next.config.mjs` -> `images.remotePatterns`)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

Production build:

```bash
npm run build
npm run start
```

## Project structure

```
src/
  app/
    api/generate/route.js   # Dummy generation endpoint (images + video)
    layout.js
    page.js                 # Composes the whole dashboard
    globals.css              # Design tokens (colors, radii, fonts)
  components/
    Header.jsx               # Logo, credit bar, primary icon nav, avatar
    HistoryStrip.jsx          # Horizontally scrollable recent-generation strip
    GeneratePanel.jsx         # Image/Video tabs, prompt box, options, accordions
    ImageGrid.jsx             # Responsive result grid with hover actions
    ResultsFeed.jsx           # Prompt bubble + ImageGrid per generation, loading state
  data/
    mockData.js               # Seed history + starter generations, model/ratio options
```

## Design decisions

- **Palette** pulled directly from the mockup: warm cream background
  (`--color-cream`), a softer peach side panel (`--color-panel`), white cards,
  and a terracotta accent (`--color-accent`) for the Generate button and
  credit bar. All defined once as CSS variables and consumed as Tailwind
  utilities (`bg-cream`, `text-ink`, `bg-accent`, etc.) rather than hard-coded
  hexes, so retheming (e.g. dark mode) only touches `globals.css`.
- **Typography** uses a rounded system-font stack for headings/logo (matching
  the mockup's soft, friendly display type) and a standard sans stack for
  body copy. This avoids any external font fetch, so the page has zero
  render-blocking network dependency for fonts.
- **Layout**: header (logo, credit progress bar, icon nav, avatar) then
  history strip then a two-column generation console (sticky control panel +
  scrolling results feed), collapsing to a single stacked column under `lg`.
- **Dark mode**: token-driven. Flipping the `dark` class on `<html>` swaps
  every color variable (tokens already defined in `globals.css`); wire a
  toggle button to `document.documentElement.classList.toggle('dark')` to
  enable it fully.

## Dummy API

`POST /api/generate` accepts `{ prompt, mode, count, ratio }` and returns a
mock generation after a simulated delay:

```json
{
  "id": "gen-abc123",
  "prompt": "...",
  "mode": "image",
  "images": [{ "id": "...", "url": "https://picsum.photos/seed/.../600/800" }]
}
```

`mode: "video"` returns a small `videos` array with sample `.mp4`/`.webm`
sources instead. The same prompt always returns the same seeded image set
(deterministic hash), which mimics a reproducible generation.

## Responsiveness

Tested at:
- **Mobile** (390px) - single column, panel above results, icon-only nav
- **Tablet** (834px) - two-column image grid, panel stacks above results
- **Desktop** (1440px+) - sticky control panel beside a 4-column result grid

No horizontal scroll at any breakpoint except the intentionally
horizontally-scrollable history strip.

## Known trade-offs / next steps

- Placeholder photography comes from `picsum.photos` rather than the exact
  mockup photography (a real, non-licensed portrait set).
- The "Advance" and "Styles" accordions are stubbed with descriptive copy;
  wiring them to real generation parameters is a natural next step.
- No auth/persistence - history and generations reset on reload aside from
  the seed data.

## Deploying

1. Push this repo to GitHub (private).
2. Import it into Vercel (vercel.com/new) - no environment variables
   required.
3. Vercel builds with `next build` automatically.
