import { caseStudies } from "@/content/cases";
import { getSignedVideoUrl } from "@/lib/oss/media";

export async function POST(request: Request) {
  try {
    const { path } = await request.json();
    if (typeof path !== "string" || !caseStudies.some((item) => item.episodes.some((episode) => episode.videoPath === path && path !== null))) return Response.json({ error: "Unknown video" }, { status: 400 });
    const url = await getSignedVideoUrl(path);
    return Response.json({ url, expiresAt: Date.now() + 900_000 }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Video unavailable" }, { status: 503 }); }
}
