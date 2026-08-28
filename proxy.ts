import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

const PORTFOLIO_SUFFIX = ".edu.fzzsai.com";

export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };

const PUBLIC_PATHS = new Set(["/admin/login", "/api/admin/login", "/api/admin/initial-password"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Prefer the public Host header. A local reverse proxy can inject
  // x-forwarded-host with the upstream hostname and hide the portfolio slug.
  const host = (request.headers.get("host") ?? request.headers.get("x-forwarded-host") ?? request.nextUrl.hostname ?? "")
    .split(":")[0]
    .toLowerCase();
  if (host.endsWith(PORTFOLIO_SUFFIX) && host !== "edu.fzzsai.com") {
    const slug = host.slice(0, -PORTFOLIO_SUFFIX.length);
    if (/^[a-z0-9-]+$/.test(slug)) {
      const url = request.nextUrl.clone();
      url.pathname = `/portfolio-host/${slug}${request.nextUrl.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) return NextResponse.next();
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const secret = process.env.SESSION_SECRET;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isValid = secret ? await verifySessionToken(token, secret) : false;
  if (isValid) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
