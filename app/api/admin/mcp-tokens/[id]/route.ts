import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteToken, updateToken } from "@/lib/mcp/tokens";
import { validPermissionIds } from "@/lib/mcp/permissions";

export const dynamic = "force-dynamic";

const tokenUpdateSchema = z.object({
  name: z.string().trim().min(1).max(50),
  permissions: z.array(z.string()),
}).superRefine((input, context) => {
  const allowed = validPermissionIds();
  input.permissions.forEach((permission, index) => {
    if (!allowed.has(permission)) context.addIssue({ code: "custom", path: ["permissions", index], message: "Unknown permission" });
  });
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = tokenUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid token data" }, { status: 400 });

  const updated = await updateToken(id, parsed.data.name, [...new Set(parsed.data.permissions)]);
  if (!updated) return NextResponse.json({ error: "Token not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await deleteToken(id))) return NextResponse.json({ error: "Token not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
