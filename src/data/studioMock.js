import { seededPhoto } from "@/data/mockData";

// Catalogs reused by the Inspector + Command Palette. Kept separate from
// the homepage's `models`/`aspectRatios` in mockData.js on purpose — the
// studio only needs a focused subset a professional would actually reach
// for mid-project, not the full marketing catalog.
export const studioModels = [
  { id: "aurora-xl", name: "Aurora XL", tag: "Popular" },
  { id: "aurora-portrait", name: "Aurora Portrait" },
  { id: "nova-pro", name: "Nova Pro" },
  { id: "lumen-v3", name: "Lumen v3", tag: "New" },
  { id: "prism-fast", name: "Prism Fast", tag: "Fast" },
];

export const studioRatios = ["1:1", "4:5", "3:2", "16:9", "9:16"];

// Same formula /api/generate/route.js uses for real generations — kept in
// sync deliberately, so a seeded node's images are exactly as "honest"
// about their own ratio as a freshly generated one. Previously every
// seed node's images were a flat 640x800 (a 4:5 shape) regardless of what
// its `ratio` field claimed, so a node declared "16:9" or "3:2" still
// held a 4:5 picture — the Loupe's frame (correctly sized from `ratio`)
// and the actual image (object-contain, never cropped/stretched) then
// visibly disagreed, showing up as background-colored bars around the
// image that scaled with however wrong that particular node's ratio was.
function dimensionsForRatio(ratio, baseWidth = 600) {
  const [w, h] = (ratio || "1:1").split(":").map(Number);
  if (!w || !h) return { width: baseWidth, height: baseWidth };
  return { width: baseWidth, height: Math.round((baseWidth * h) / w) };
}

function node({
  id,
  parentId = null,
  prompt,
  model,
  ratio,
  seed,
  strength,
  favoriteIndex = null,
  count = 4,
  createdAt,
}) {
  return {
    id,
    parentId,
    prompt,
    model,
    ratio,
    seed,
    strength,
    createdAt,
    favoriteImageIndex: favoriteIndex,
    images: Array.from({ length: count }).map((_, i) => {
      const { width, height } = dimensionsForRatio(ratio);
      return {
        id: `${id}-img-${i}`,
        url: seededPhoto(`${seed}-${i}`, width, height),
      };
    }),
  };
}

// A small, realistic branching history for a project that's already hours
// deep — not an empty state. gen-1 is the trunk; gen-3 and gen-5 are forks
// off earlier results (regenerated *from* a specific prior image rather
// than from scratch), which is the whole point of the Threads model.
export const seedThreadNodes = [
  node({
    id: "gen-1",
    prompt: "Editorial portrait, redheaded woman, soft studio backdrop, natural daylight from camera left",
    model: "Aurora XL",
    ratio: "4:5",
    seed: "redhead-studio",
    createdAt: "2026-07-14T09:12:00Z",
  }),
  node({
    id: "gen-2",
    parentId: "gen-1",
    prompt: "Same subject, warm cashmere knit, candid half-turn, softer key light",
    model: "Aurora XL",
    ratio: "4:5",
    seed: "redhead-cashmere",
    favoriteIndex: 1,
    createdAt: "2026-07-14T09:24:00Z",
  }),
  node({
    id: "gen-3",
    parentId: "gen-2",
    prompt: "Same frame, push warmth +2, shallower depth of field, rim light from behind",
    model: "Aurora Portrait",
    ratio: "4:5",
    seed: "redhead-rimlight",
    strength: 0.35,
    createdAt: "2026-07-14T09:41:00Z",
  }),
  node({
    id: "gen-4",
    parentId: "gen-2",
    prompt: "Same frame, cooler grade, overcast daylight look, desaturated wardrobe",
    model: "Aurora Portrait",
    ratio: "4:5",
    seed: "redhead-overcast",
    strength: 0.4,
    favoriteIndex: 2,
    createdAt: "2026-07-14T10:03:00Z",
  }),
  node({
    id: "gen-5",
    parentId: "gen-4",
    prompt: "Tighter crop on gen-4's third frame, add freckles detail, sharpen eyes",
    model: "Nova Pro",
    ratio: "1:1",
    seed: "redhead-tight-crop",
    strength: 0.25,
    createdAt: "2026-07-14T10:22:00Z",
  }),
  node({
    id: "gen-6",
    prompt: "Product still life, ceramic mug on linen, morning window light, 45-degree angle",
    model: "Lumen v3",
    ratio: "3:2",
    seed: "ceramic-mug-linen",
    createdAt: "2026-07-15T14:02:00Z",
  }),
  node({
    id: "gen-7",
    parentId: "gen-6",
    prompt: "Same set, add steam rising from the mug, slightly lower camera angle",
    model: "Lumen v3",
    ratio: "3:2",
    seed: "ceramic-mug-steam",
    strength: 0.3,
    favoriteIndex: 0,
    createdAt: "2026-07-15T14:19:00Z",
  }),
  node({
    id: "gen-8",
    prompt: "Wide mountain range at golden hour, layered ridgelines, thin atmospheric haze",
    model: "Aurora XL",
    ratio: "16:9",
    seed: "golden-ridgelines",
    createdAt: "2026-07-16T08:47:00Z",
  }),
  node({
    id: "gen-9",
    parentId: "gen-8",
    prompt: "Same range, push toward blue hour, add a thin crescent moon top-right",
    model: "Aurora XL",
    ratio: "16:9",
    seed: "blue-hour-ridgelines",
    strength: 0.45,
    createdAt: "2026-07-16T09:05:00Z",
  }),
];

// The node the workspace resumes on when you open the project — the last
// thing that was being reviewed, not a blank canvas.
export const lastViewedNodeId = "gen-9";
export const lastViewedImageIndex = 0;