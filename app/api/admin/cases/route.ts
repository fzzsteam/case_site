import { NextResponse } from "next/server";
import { categoryNameExists } from "@/lib/cases/categories-queries";
import { createCase, listCases } from "@/lib/cases/queries";
import { assertValidCaseMediaPaths, caseInputSchema } from "@/lib/cases/validation";

export async function GET() {
  return NextResponse.json({ cases: await listCases() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = caseInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid case data" }, { status: 400 });

  try {
    assertValidCaseMediaPaths(parsed.data);
  } catch {
    return NextResponse.json({ error: "Invalid media path" }, { status: 400 });
  }

  if (!(await categoryNameExists(parsed.data.category))) return NextResponse.json({ error: "Unknown category" }, { status: 400 });

  const id = await createCase(parsed.data);
  return NextResponse.json({ id }, { status: 201 });
}
