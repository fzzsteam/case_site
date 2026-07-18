import { NextResponse } from "next/server";
import { reorderCases } from "@/lib/cases/queries";
import { reorderInputSchema } from "@/lib/cases/validation";

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = reorderInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid reorder data" }, { status: 400 });
  await reorderCases(parsed.data.orderedIds);
  return NextResponse.json({ ok: true });
}
