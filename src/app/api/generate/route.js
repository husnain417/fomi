import { NextResponse } from "next/server";

// Simple deterministic hash so the same prompt always "generates" the same
// placeholder set — this stands in for a real model inference call.
function hashSeed(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

const SAMPLE_VIDEOS = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
];

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const {
    prompt = "",
    mode = "image", // "image" | "video"
    count = 4,
    ratio = "1:1",
  } = body;

  if (!prompt || !prompt.trim()) {
    return NextResponse.json(
      { error: "A prompt is required to generate content." },
      { status: 400 }
    );
  }

  // Fake latency so the UI's loading state has something real to show.
  await new Promise((resolve) => setTimeout(resolve, 900));

  const seed = hashSeed(prompt);
  const [w, h] = ratio
    .split(":")
    .map((v) => Math.max(1, parseInt(v, 10) || 1));
  const width = 600;
  const height = Math.round((width * h) / w);

  if (mode === "video") {
    const videos = Array.from({ length: Math.min(count, 2) }).map((_, i) => ({
      id: `${seed}-video-${i}`,
      url: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
      poster: `https://picsum.photos/seed/${seed}-${i}/${width}/${height}`,
    }));
    return NextResponse.json({ id: `gen-${seed}`, prompt, mode, videos });
  }

  const images = Array.from({ length: count }).map((_, i) => ({
    id: `${seed}-image-${i}`,
    url: `https://picsum.photos/seed/${seed}-${i}/${width}/${height}`,
    width,
    height,
  }));

  return NextResponse.json({ id: `gen-${seed}`, prompt, mode, images });
}
