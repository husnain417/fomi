# Fomi — AI Content Generation Studio

A production-styled implementation of the Fomi image/video generation
dashboard, built with Next.js (App Router), JavaScript, and Tailwind CSS v4.
Pixel-matched against the provided mockup, then extended with dark mode,
a working mega-menu, and a set of animated marketing sections below the
main console.

**Live demo:** _add your Vercel URL here_
**Repo:** _add your GitHub URL here_

---

## Table of contents

- [Quick start](#quick-start)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Design system](#design-system)
- [Feature tour](#feature-tour)
- [The dummy API](#the-dummy-api)
- [Animations & transitions](#animations--transitions)
- [Dark mode](#dark-mode)
- [Responsiveness](#responsiveness)
- [Accessibility notes](#accessibility-notes)
- [Known trade-offs](#known-trade-offs--what-id-do-next)
- [Deploying](#deploying)

---

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build   # production build
npm run start   # serve the production build locally
```

No environment variables, database, or API keys are required — everything
runs against the bundled dummy API described below.

---

## Tech stack

| Layer       | Choice                                                            |
|-------------|--------------------------------------------------------------------|
| Framework   | Next.js 16 (App Router, JavaScript, Turbopack)                    |
| Styling     | Tailwind CSS v4, design tokens as CSS variables in `globals.css`  |
| Icons       | lucide-react                                                       |
| Font        | Poppins (400), via `next/font/google` — self-hosted at build time |
| Images      | `next/image`, backed by `picsum.photos` as a placeholder source   |
| Animation   | Plain CSS transitions/keyframes + a small `IntersectionObserver`  |
|             | hook — no animation library dependency                             |

---

## Project structure

```
src/
  app/
    api/generate/route.js     # Dummy generation endpoint (images + video)
    layout.js                  # Poppins font, theme-flash prevention script
    page.js                    # Composes the whole page
    globals.css                # Design tokens, keyframes, base styles

  components/
    Header.jsx                 # Logo, animated progress track, icon nav,
                                # mega-menu (Home + per-category), account/
                                # gallery/support hover popovers
    HistoryStrip.jsx           # Horizontally scrollable recent-generation strip
    GeneratePanel.jsx          # Image/Video tabs, prompt box, model/ratio
                                # pickers, Advance & Styles accordions
    ImageGrid.jsx               # Responsive result grid with hover actions
    ResultsFeed.jsx             # Prompt bubble + ImageGrid per generation,
                                # skeleton loading state
    Reveal.jsx                  # Fade + rise-in wrapper for scroll reveals
    FeatureHighlights.jsx       # "What Fomi can do" — 4 staggered cards
    HowItWorks.jsx               # 3-step process with a self-drawing connector line
    ShowcaseMarquee.jsx          # Infinite auto-scrolling thumbnail strip

  data/
    mockData.js                 # Seed history, starter generations, model/
                                # ratio catalogs, seeded-photo helper

  hooks/
    useTheme.js                  # Light/dark state + persistence
    useScrollReveal.js           # IntersectionObserver → { ref, visible }

  lib/
    theme.js                     # Theme constants + the pre-hydration
                                 # inline script that prevents a light-mode
                                 # flash for dark-mode users
```

---

## Design system

Every color in the UI is a CSS variable, defined once in `globals.css` and
exposed to Tailwind via `@theme inline` — so `bg-cream`, `text-ink`,
`bg-accent`, etc. are real utility classes, not one-off hex codes scattered
through components. That's what makes dark mode a ~40-line diff instead of
a rewrite: flip the `dark` class on `<html>`, and every token underneath it
repoints.

| Token                  | Light      | Role                                  |
|-------------------------|-----------|-----------------------------------------|
| `--color-cream`          | `#fcfaf8` | Page background                        |
| `--color-cream-deep` / `--color-panel` | `#f8eee8` | Side panel, subtle section fills |
| `--color-card`           | `#ffffff` | Cards, inputs, popovers                |
| `--color-ink`            | `#2b241d` | Primary text                           |
| `--color-accent`         | `#d98a63` | Generate button, active nav, progress  |
| `--color-border`         | `#ecdfcb` | Hairlines                               |

Typography is a single family — **Poppins, weight 400** — loaded once
through `next/font/google` in `layout.js` and applied globally, so there's
exactly one font request and no layout shift from a fallback swap.

---

## Feature tour

- **Animated nav indicator.** The thin progress line above the icon nav
  isn't a fixed-width bar — `Header.jsx` measures the actual DOM position
  of the first, last, and active icon via `getBoundingClientRect()`, then
  sizes the light track to span exactly first-icon-to-last-icon and the
  dark segment to exactly one icon's width, repositioning it with a CSS
  transition whenever the active tab changes.
- **Mega-menu.** Hovering (or focusing, for keyboard users) a nav icon
  opens a panel below the header. Home gets a 4-column icon/label directory
  (`HOME_MENU`); the other four items (Image/Video/Edit/Assets) render
  photo cards whose thumbnails are fetched from the dummy API on first
  hover and cached, so re-opening the same menu doesn't re-fetch.
- **Hover popovers.** Gallery, Support, and the account avatar each open a
  small popover on hover with a short close-delay (`useHoverIntent`), so
  moving the mouse from the trigger to the popover doesn't cause it to
  snap shut mid-transit.
- **Generate flow.** `GeneratePanel` collects a prompt, mode, model,
  count, and ratio, and calls `POST /api/generate`; `ResultsFeed` prepends
  the new generation (with a skeleton grid while it's in flight) above the
  existing history.

---

## The dummy API

`POST /api/generate` — `src/app/api/generate/route.js`

**Request**
```json
{ "prompt": "a lighthouse at dusk", "mode": "image", "count": 4, "ratio": "1:1" }
```

**Response**
```json
{
  "id": "gen-abc123",
  "prompt": "a lighthouse at dusk",
  "mode": "image",
  "images": [{ "id": "...", "url": "https://picsum.photos/seed/.../600/800" }]
}
```

`mode: "video"` returns a small `videos` array of sample `.mp4`/`.webm`
sources instead. The prompt is hashed into a deterministic seed, so the
same prompt always returns the same image set — close enough to a real
model's reproducibility to demo against, without an actual model behind
it. A short artificial delay (~900ms) stands in for real inference latency
so loading states have something honest to show.

---

## Animations & transitions

Beyond the header's measured nav indicator, three sections sit below the
main console specifically to cover the "smooth transitions" bonus point
with a bit more range than button hover states:

1. **`FeatureHighlights`** — a 4-card grid that fades and rises into place
   as it enters the viewport, staggered ~90ms per card via `Reveal.jsx`.
2. **`HowItWorks`** — a 3-step process row where a connecting line
   scale-draws itself left-to-right (`scaleX(0) → scaleX(1)`) at the same
   moment the three step icons fade in, so the line reads as "connecting"
   the steps rather than animating independently of them.
3. **`ShowcaseMarquee`** — an infinite horizontal strip of thumbnails
   (pure CSS `@keyframes`, translateX loop with the track duplicated once
   for a seamless wrap), which pauses on hover so it's actually readable
   if someone wants to look at a tile.

All of it is built on one small hook, `useScrollReveal` (a thin wrapper
around `IntersectionObserver`), rather than an animation library — it's
maybe 30 lines and covers everything this page needed. Everything respects
`prefers-reduced-motion: reduce` (see the media query in `globals.css` and
the explicit override on `.animate-marquee`), so none of this is forced on
someone who's asked their OS to minimize motion.

---

## Dark mode

Token-driven, not a second stylesheet. `html.dark { ... }` in `globals.css`
redefines the same variable names with dark values; `useTheme.js` toggles
the class and persists the choice to `localStorage`. `lib/theme.js` injects
a tiny inline `<script>` into `<head>` (via `dangerouslySetInnerHTML`) that
runs before React hydrates, so returning dark-mode visitors don't see a
flash of the light theme while JS boots up.

---

## Responsiveness

Verified at:
- **Mobile** (390px) — single column, generate panel stacks above results,
  icon-only nav, feature grid drops to one column.
- **Tablet** (834px) — two-column image grid and feature grid.
- **Desktop** (1440px+) — sticky control panel beside a 4-column result
  grid, 4-column feature grid, full-width marquee.

No horizontal scroll at any breakpoint except the two places it's
intentional: the history strip and the showcase marquee.

---

## Accessibility notes

- All icon-only buttons (nav, theme toggle, favorite/download) carry
  `aria-label`.
- The nav's progress indicator is a real `role="progressbar"` with
  `aria-valuenow/min/max` reflecting the active section.
- The mega-menu opens on `onMouseEnter` **and** `onFocus`, so it's
  reachable by keyboard, not just mouse hover.
- The theme toggle exposes `aria-pressed` reflecting current state.
- Decorative images (marquee tiles, gradient edge-fades) use `alt=""` /
  `aria-hidden="true"` so screen readers skip them instead of reading out
  meaningless filler.
- All animation respects `prefers-reduced-motion`.

---

## Known trade-offs / what I'd do next

- Placeholder photography comes from `picsum.photos`, not real generated
  imagery — swap `seededPhoto()` in `mockData.js` for a real model
  endpoint and the rest of the app (caching, skeleton states, deterministic
  seeding) doesn't need to change.
- "Advance" and "Styles" in `GeneratePanel` are stubbed with descriptive
  copy rather than wired to real generation parameters.
- No auth/persistence — history and generations reset on reload aside from
  the seed data in `mockData.js`.
- The mega-menu's per-category image fetch has no cancellation if the user
  hovers rapidly across items; low-risk in practice (fast local dummy API,
  cached after first hover) but worth an `AbortController` if this were
  hitting a real backend.

---

## Deploying

This is a completely standard Next.js app, including the API route — no
special configuration needed for Vercel:

1. Push this repo to GitHub (private, per the assessment brief).
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Vercel detects Next.js automatically and runs `next build`; the
   `api/generate` route deploys as a serverless function with zero extra
   config. No environment variables required.
4. Done — you'll get a production URL and a preview URL on every push.
