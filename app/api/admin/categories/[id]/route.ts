import { NextResponse } from "next/server";
import { CategoryInUseError, categoryNameExists, deleteCategory, renameCategory } from "@/lib/cases/categories-queries";
import { categoryInputSchema } from "@/lib/cases/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = categoryInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid category data" }, { status: 400 });

  if (await categoryNameExists(parsed.data.name, id)) return NextResponse.json({ error: "Category already exists" }, { status: 409 });

  await renameCategory(id, parsed.data.name);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteCategory(id);
  } catch (error) {
    if (error instanceof CategoryInUseError) return NextResponse.json({ error: "Category is in use" }, { status: 409 });
    throw error;
  }
  return NextResponse.json({ ok: true });
}
