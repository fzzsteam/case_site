import { NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/auth/credentials";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";

export async function POST(request: Request) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) return NextResponse.json({ error: "Admin login is not configured" }, { status: 503 });

  const body = await request.json().catch(() => null);
  const password = body && typeof body === "object" ? (body as Record<string, unknown>).password : undefined;
  if (typeof password !== "string" || !(await verifyAdminPassword(password))) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

  const token = await createSessionToken(sessionSecret);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  return response;
}
