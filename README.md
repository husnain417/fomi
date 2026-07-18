# Fomi — /studio

An AI image-generation workspace built around Threads (a branching history
tree) and the Loupe (a full-bleed result viewer), with continuous
Strength-steering layered on top of the usual discrete generate flow. See
[`PRODUCT_THINKING.md`](./PRODUCT_THINKING.md) for the reasoning behind the
major decisions, including the one differentiating feature.

## Running locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

```bash
npm run build && npm run start   # production build
```

**Before your first `npm run build`**, add a `next.config.js` (or edit your
existing one) so `next/image` is allowed to load the mock API's placeholder
images from picsum.photos:

```js
/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
};
```

Without this, `ThreadNode` and `Filmstrip` thumbnails (converted to
`next/image` in this pass — see below) will fail to load.

## Route map

| Route      | What's there                                              |
| ---------- | ----------------------------------------------------------- |
| `/`        | Marketing/landing page for Fomi                             |
| `/studio`  | The workspace — Threads, Loupe, Compare, Composer, Palette  |

## Architecture, one line each

- **Threads** (`useThreadTree`, `ThreadRail`, `ThreadNode`) — an in-memory
  branching tree of generations. Adding a node is a single flat insert;
  children are derived by grouping on `parentId`, not stored as a nested
  structure.
- **Loupe** (`Loupe.jsx`, `Filmstrip.jsx`) — the full-bleed stage for
  reviewing a generation's variants, with crossfade transitions between
  images and (as of this pass) a dashed-border/badge state for live
  previews and a pulse placeholder while a commit is in flight.
- **Compare** (`CompareView.jsx`, `useSyncedZoom`) — up to four panes with
  shared zoom/pan state, entered automatically once a second result joins
  the comparison set (see `PRODUCT_THINKING.md` §2).
- **Command Palette** (`CommandPalette.jsx`, `useCommandPalette`) — the
  single entry point for actions that don't need permanent chrome: new
  thread, branch, compare, export, model/ratio, theme.
- **Composer** (`Composer.jsx`) + the mocked `/api/generate` route — the
  only path that writes to history. Takes a prompt and current
  model/ratio/strength and returns four placeholder images with a
  deterministic seed.
- **Preview Steering** (`usePreviewSteering.js`) — a thin, disposable layer
  on top of all of the above. While branching, dragging Strength fires a
  debounced, abortable, single-image fetch against the same
  `/api/generate` route (`count: 1`) and shows the result in the Loupe.
  Nothing here touches `useThreadTree`; only hitting Generate writes a
  node.

## Known limitations

- **Mock API only.** `/api/generate` doesn't call a real model — it hashes
  the prompt (and parentId, for branches) into a seed and returns
  `picsum.photos` placeholders at the requested aspect ratio, after an
  artificial ~900ms delay.
- **In-memory tree, no persistence.** Refreshing the page resets the
  workspace back to the seed data in `data/studioMock.js`. The "Saved" /
  "Saving…" indicator in the top bar is simulated (`useAutosaveStatus`) —
  nothing is actually written anywhere.
- **No auth.** There's a single implied user (the "M" avatar in the top
  bar); there's no login, no multi-user state, and no server-side
  authorization on the API route.
- **Accessibility.** ARIA roles, labels, and focus-trap logic are in place
  throughout, but this pass did not include a live `axe-core` run or a
  full manual keyboard-only walkthrough against a running instance — both
  are called for in the Part C spec (§5) and are the right next step
  before treating the workspace as verified-accessible, not just
  structurally-correct.
- **Not yet deployed.** This pass focused on the code; standing up a
  public Vercel deployment (Part C §6) is still open.
