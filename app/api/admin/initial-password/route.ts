import { NextResponse } from "next/server";
import { getInitialPassword } from "@/lib/auth/credentials";

export async function GET() {
  const password = await getInitialPassword();
  return NextResponse.json({ password }, { headers: { "Cache-Control": "no-store" } });
}
