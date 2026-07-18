import { NextResponse } from "next/server";
import { categoryNameExists, createCategory, listCategories } from "@/lib/cases/categories-queries";
import { categoryInputSchema } from "@/lib/cases/validation";

export async function GET() {
  return NextResponse.json({ categories: await listCategories() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = categoryInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid category data" }, { status: 400 });

  if (await categoryNameExists(parsed.data.name)) return NextResponse.json({ error: "Category already exists" }, { status: 409 });

  const category = await createCategory(parsed.data.name);
  return NextResponse.json({ category }, { status: 201 });
}
