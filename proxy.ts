import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };

const PUBLIC_PATHS = new Set(["/admin/login", "/api/admin/login", "/api/admin/initial-password"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const secret = process.env.SESSION_SECRET;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isValid = secret ? await verifySessionToken(token, secret) : false;
  if (isValid) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
