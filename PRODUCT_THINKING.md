# Product Thinking — /studio (Thread & Loupe)

## 1. What problem were you solving, and for who?

If you generate a lot of variants in one sitting, you lose track of which
attempt came from which idea. History ends up as one long flat list —
you regenerate, it either overwrites or gets tacked on the bottom, and an
hour later you can't tell what led to what.

I designed for someone already deep into a project, not a first-time
visitor. That's why there's no onboarding or empty state — the workspace
just opens where you left it.

## 2. Three UX decisions that mattered most

1. **Branching tree instead of a flat history.** Regenerating from a
   result makes a child node under it, so you can actually see how one
   idea led to another instead of losing the thread.
2. **Command palette instead of a sidebar full of dropdowns.** Model,
   ratio, strength — all behind Cmd+K instead of permanently on screen.
   Also fixed it so picking a model shows a checkmark and doesn't close
   the palette, so you can flip through options without reopening it
   every time.
3. **One shared theme system, not a hardcoded default per route.** Both
   `/` and `/studio` currently open light until the person makes an
   explicit choice (toggle button, either page). I'd originally scoped
   this as "studio opens dark by default, homepage stays light" — the
   reasoning for that still stands (tools people stare at for hours
   default dark for a reason: less eye strain, and a bright frame around
   a photo messes with how you judge its actual color) — but the
   per-route default never actually got wired up before this pass ended;
   both the SSR init script and the client-side route-transition hook
   fall back to light. What *is* built and working is the one-key,
   one-`useTheme`-system part: toggle it on either page and that choice
   sticks everywhere, no fighting between two competing preferences.
   Making studio's *default* actually dark is a small, well-scoped
   follow-up (flip the fallback in two places), not a redesign — see §5.

## 3. What I left out on purpose

- **Infinite canvas.** Everyone's doing this right now (Krea, Lovart,
  Grok Imagine). Copying the trend isn't the original choice anymore.
- **A permanent sidebar of every control.** Only show what's relevant to
  what you're doing right now, not everything all the time.
- **Standalone Export/Compare buttons.** Export moved into the palette.
  Compare just turns on automatically once you pick a second image to
  compare, and has its own exit button. Fewer permanent buttons, nothing
  you could do before is gone.
- **A templates gallery.** Feels like a first-time-user feature on a page
  built for someone who's already deep in.
- **Steering Model, not just Strength and Ratio.** Strength and Ratio are
  both genuinely dials while you're mid-branch — turn either up, down, or
  sideways and it's still recognizably the same attempt, just reframed or
  intensified. Model is different: swapping it swaps the whole rendering
  pipeline, not a parameter of one. That's a big enough shift in what
  you'd actually get that it should stay a deliberate, request-only
  action — not something you could drag past accidentally while chasing
  the right Strength.

## 4. What inspired it

The tree isn't copied from any specific AI tool — it's closer to how
version history/branching works in general. The big single-image viewer
(the "Loupe") is straight from Lightroom/Capture One's culling workflow —
a large image, a strip of siblings underneath, built for deciding, not
scrolling. Pulling from photo software instead of another AI generator
was deliberate, so it doesn't just end up looking like Krea with new
colors.

What's missing from that reference: photo culling assumes one linear roll
of shots. It has no concept of "these 40 images came from 6 different
ideas." That's the actual gap the tree fills.

## 5. With another month

- **Actually wire up the studio-defaults-dark behavior described in §2.3**
  — right now it's reasoning without an implementation; the fallback in
  both the SSR script and the route-transition hook needs to flip.
- Auto-label branches by what changed in the prompt, not just the full
  prompt truncated — easier to scan the tree at a glance.
- A "merge" action — take two branches' choices and combine them into one
  new attempt instead of only branching one at a time.
- Actual persistence. Right now it's all against a mock API — the autosave
  indicator is honest about it, there's just nothing behind it yet.
- Multiplayer, so someone else's branches show up live in the same tree.

## 6. The one thing that actually makes this different

Live parameter-steering while you're mid-branch. Branching is still a
real decision — it becomes permanent history. But dragging Strength or
Ratio in the Inspector just previews, live, in the Loupe, without writing
anything to the tree until you actually hit Generate. It's debounced and
cancels its own in-flight requests, so if you drag either around a lot,
you never get a slow old request landing late and showing you the wrong
image.

Everything else here — tree, Loupe, palette — is a better way to move
through a request-and-wait loop every other tool already has. This is the
one place the loop itself is different: adjusting something and
committing to something used to be the same action, just with more or
less patience. Now they're actually separate. It also lives inside the
Loupe you already have instead of a new panel — didn't want a second
place that had to explain "is this saved or not."