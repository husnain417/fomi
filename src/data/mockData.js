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
      "A professional portrait photograph of a smiling 31-year-old redheaded woman with warm brown eyes and softly tousled auburn hair framing her face. She is turned slightly towards the viewer, offering a genuine and approachable expression. She is wearing a cream-colored cashmere sweater and delicate gold earrings. The background is a softly blurred expanse of muted gray and beige tones, suggesting a modern art gallery. There is subtle directional lighting.",
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
];

export const models = ["Aurora XL", "Aurora Portrait", "Aurora Realtime", "Aurora Cinema"];
export const aspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
export const imageCounts = [1, 2, 4, 8];
