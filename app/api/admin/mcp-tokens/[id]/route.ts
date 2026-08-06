import { NextResponse } from "next/server";
import { deleteToken } from "@/lib/mcp/tokens";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await deleteToken(id))) return NextResponse.json({ error: "Token not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
