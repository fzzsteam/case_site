import { NextResponse } from "next/server";
import { z } from "zod";
import { createToken, listTokens } from "@/lib/mcp/tokens";

export const dynamic = "force-dynamic";

const tokenInputSchema = z.object({ name: z.string().trim().min(1).max(50) });

export async function GET() {
  return NextResponse.json({ tokens: await listTokens() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = tokenInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid token data" }, { status: 400 });

  return NextResponse.json({ token: await createToken(parsed.data.name) }, { status: 201 });
}
