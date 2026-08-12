import { getSignedVideoUrl } from "@/lib/oss/media";

const HERO_VIDEO_PATH = "case-site/cases/aigc-media/hero.mp4";

export async function GET(request: Request) {
  const signedUrl = await getSignedVideoUrl(HERO_VIDEO_PATH);
  const range = request.headers.get("range");
  const upstream = await fetch(signedUrl, {
    headers: range ? { Range: range } : undefined,
    cache: "no-store",
  });

  if (!upstream.ok && upstream.status !== 206) {
    return new Response("Video unavailable", { status: 502 });
  }

  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    "Content-Disposition": "inline",
    "Content-Type": upstream.headers.get("content-type") || "video/mp4",
  });
  for (const name of ["content-length", "content-range", "etag", "last-modified"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
