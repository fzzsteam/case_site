import { getPrivateImage } from "@/lib/oss/media";

export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const image = await getPrivateImage(path.join("/"));
    return new Response(image.body as BodyInit, { headers: { "Content-Type": image.contentType, "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch (error) {
    const status = error instanceof Error && error.message === "Invalid media path" ? 400 : 503;
    return Response.json({ error: status === 400 ? "Invalid media path" : "Media unavailable" }, { status });
  }
}
