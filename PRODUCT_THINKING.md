# Product thinking — Part C: Continuous Steering & Consolidation

This file covers the reasoning for the Part C pass specifically. Parts A/B
(Threads, Loupe, Compare, Inspector, Composer, Command Palette) have their
own prior decisions baked into the code and comments; this is the
continuation, not a replacement.

## Section 6 — The one differentiating feature

**It shipped.** Live Strength-steering is in: `hooks/usePreviewSteering.js`,
wired through `Inspector`'s Strength slider into the Loupe.

**The answer, and why it's true:**

> Branching is still discrete — it's a deliberate decision that becomes
> part of your history. But refining strength on an attempt you already
> like is continuous — you're steering it in place, and nothing you see
> while doing that costs you a spot in the tree until you decide it's
> worth keeping.

Everything else in this workspace — the tree, the Loupe, the palette — is
a better way to *navigate* a request/response loop that every other tool
in this category also has. Preview steering is the one place the loop
itself changes shape. Before this pass, "adjust a parameter" and "commit a
generation" were the same action wearing two different amounts of
patience. Now they're genuinely two different things: a live, disposable,
abortable fetch that never touches `useThreadTree`, and a separate,
deliberate action (Generate) that's the only thing that writes a node.

**What made the cut, and what didn't:**

- **Strength only.** The spec was explicit that Model and Ratio stay
  request-only for this pass, and implementing it made the reasoning
  concrete rather than just asserted: Strength is a dial on an existing
  result — turning it further toward or away from the source image reads
  as *the same idea, adjusted*. Model and Ratio don't share that property;
  either one produces something closer to *a different idea entirely*,
  which is exactly the kind of change that should cost a spot in the tree,
  not slide past disposably. If Strength earns its keep in practice, Ratio
  is the more plausible next candidate (it's still a continuous
  parameter on the same image) — Model almost certainly should stay
  discrete permanently.
- **Debounce + abort, not just debounce.** The spec called out the race
  condition explicitly (§1.2/§7) — a slow first request landing after a
  faster second one — as "the one place in this entire pass where a bug
  would actually be visible and embarrassing." It's handled with a
  monotonically increasing request token plus an `AbortController` per
  request, checked in both the success and error paths, not just relied
  on debounce timing to make it unlikely.
- **No new surface.** The preview renders inside the existing Loupe using
  the existing crossfade mechanism (same `key={url}` pattern that already
  handled prev/next image swaps), plus one small badge. No new panel,
  modal, or region — that was the explicit guardrail for this whole pass
  (§2.3), and it was easy to hold to here specifically because the Loupe
  already had a slot-shaped hole for "the image that's currently showing"
  to slot a different url into.

**What was weighed and set aside:** an earlier option considered was
surfacing preview state in the Inspector itself (a small thumbnail next to
the slider) in addition to the Loupe. That would have been a second,
smaller surface for the same information the Loupe already shows at full
size, and would have meant explaining *two* places where "is this saved"
needed to be legible instead of one. Cut in favor of the Loupe being the
single source of truth for "what am I looking at right now" — which is
also just... its job already.

## Section 2 — Consolidation notes

Export lost its top-bar button; it's palette-only now (§2.1). Compare lost
its top-bar *toggle*, not the feature — it activates automatically the
moment a second image joins the comparison set, and `CompareView` grew its
own `Exit compare` control in the header row it already had (§2.2). Net
effect: two fewer permanently-rendered buttons in the chrome for actions
that were always reachable another way, without removing anything a
person could previously do.
