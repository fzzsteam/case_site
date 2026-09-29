import { NextResponse } from "next/server";
import { z } from "zod";
import { createToken, listTokens } from "@/lib/mcp/tokens";
import { getPermissionGroups, validPermissionIds } from "@/lib/mcp/permissions";

export const dynamic = "force-dynamic";

const tokenInputSchema = z.object({
  name: z.string().trim().min(1).max(50),
  permissions: z.array(z.string()).min(1),
}).superRefine((input, context) => {
  const allowed = validPermissionIds();
  input.permissions.forEach((permission, index) => {
    if (!allowed.has(permission)) context.addIssue({ code: "custom", path: ["permissions", index], message: "Unknown permission" });
  });
});

export async function GET() {
  return NextResponse.json({ tokens: await listTokens(), permissionGroups: getPermissionGroups() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = tokenInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid token data" }, { status: 400 });

  return NextResponse.json({ token: await createToken(parsed.data.name, [...new Set(parsed.data.permissions)]) }, { status: 201 });
}
