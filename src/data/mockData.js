// Deterministic placeholder photo helper.
// picsum.photos supports a "seed" so the same prompt always renders the same set,
// which mimics a real generation feeling reproducible.
export function seededPhoto(seed, width = 600, height = 800) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

export const historyItems = [
  { id: "h1", label: "Reading nook", seed: "reading-nook-1" },
  { id: "h2", label: "Mountain range", seed: "mountain-range-2" },
  { id: "h3", label: "Forest path", seed: "forest-path-3" },
  { id: "h4", label: "Mirror portrait", seed: "mirror-portrait-4" },
  { id: "h5", label: "Crystal figure", seed: "crystal-figure-5" },
  { id: "h6", label: "Frost portrait", seed: "frost-portrait-6" },
  { id: "h7", label: "Studio beauty", seed: "studio-beauty-7" },
  { id: "h8", label: "Floral portrait", seed: "floral-portrait-8" },
  { id: "h9", label: "Eiffel Tower", seed: "eiffel-tower-9" },
  { id: "h10", label: "Golden hour", seed: "golden-hour-10" },
  { id: "h11", label: "Warm glow", seed: "warm-glow-11" },
  { id: "h12", label: "Studio cat", seed: "studio-cat-12" },
  { id: "h13", label: "Neon night", seed: "neon-night-13" },
];

export const initialGenerations = [
  {
    id: "gen-1",
    prompt:
      "A professional portrait photograph of a smiling 31-year-old redheaded woman with warm brown eyes and softly tousled auburn hair framing her face. She is turned slightly towards the viewer, offering a genuine and approachable expression.",
    tag: "Model",
    seed: "redhead-portrait",
    count: 4,
  },
  {
    id: "gen-2",
    prompt:
      "The same subject, reframed as a candid editorial series: warm cashmere knit, soft studio backdrop, natural daylight falling across one side of the face.",
    tag: "Model",
    seed: "redhead-portrait-b",
    count: 4,
  },
  {
    id: "gen-3",
    prompt:
      "The same subject, reframed as a candid editorial series: warm cashmere knit, soft studio backdrop, natural daylight falling across one side of the face.",
    tag: "Model",
    seed: "redhead-portrait-b",
    count: 4,
  },
];

// Model and ratio catalogs for the Generate panel's custom pickers.
// `models` carries an optional `tag` badge; `aspectRatios` carries the raw
// w/h so the picker can draw a proportionally accurate little rectangle
// icon per ratio instead of just a text label.
export const models = [
  { name: "Aurora XL", tag: "Popular" },
  { name: "Aurora Cinema Pro" },
  { name: "Aurora Portrait" },
  { name: "Aurora Realtime", tag: "Fast" },
  { name: "Aurora Turbo", tag: "Fast" },
  { name: "Nova Standard" },
  { name: "Nova Pro" },
  { name: "Nova Fast", tag: "Fast" },
  { name: "Lumen v2 Pro" },
  { name: "Lumen v2 Standard" },
  { name: "Lumen v3", tag: "New" },
  { name: "Prism Fast", tag: "Fast" },
  { name: "Prism Lite" },
  { name: "Halo 2.3" },
  { name: "Halo 2 Pro" },
];

export const aspectRatios = [
  { label: "1:1", w: 1, h: 1 },
  { label: "4:3", w: 4, h: 3 },
  { label: "3:2", w: 3, h: 2 },
  { label: "16:9", w: 16, h: 9 },
  { label: "9:16", w: 9, h: 16 },
  { label: "2:3", w: 2, h: 3 },
  { label: "4:5", w: 4, h: 5 },
  { label: "5:4", w: 5, h: 4 },
  { label: "12:5", w: 12, h: 5 },
  { label: "3:1", w: 3, h: 1 },
  { label: "5:12", w: 5, h: 12 },
];

export const imageCounts = [1, 2, 4, 8];