import { NextResponse } from "next/server";
import { changeAdminPassword } from "@/lib/auth/credentials";
import { changePasswordInputSchema } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = changePasswordInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid password data" }, { status: 400 });

  const ok = await changeAdminPassword(parsed.data.currentPassword, parsed.data.newPassword);
  if (!ok) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });

  return NextResponse.json({ ok: true });
}
