import { serveStaticPortfolio } from "@/lib/portfolio/static-site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; path?: string[] }> },
) {
  const { slug, path = [] } = await params;
  return serveStaticPortfolio(slug, path, true, request);
}
