import { videoPathExists } from "@/lib/cases/queries";
import { getSignedVideoUrl } from "@/lib/oss/media";

export async function POST(request: Request) {
  try {
    const { path } = await request.json();
    const isAigcMedia = typeof path === "string" && path.startsWith("case-site/cases/aigc-");
    if (typeof path !== "string" || (!isAigcMedia && !(await videoPathExists(path)))) return Response.json({ error: "Unknown video" }, { status: 400 });
    const url = await getSignedVideoUrl(path);
    return Response.json({ url, expiresAt: Date.now() + 900_000 }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Video unavailable" }, { status: 503 }); }
}
