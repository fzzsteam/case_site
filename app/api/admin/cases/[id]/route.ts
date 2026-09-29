import { NextResponse } from "next/server";
import { categoryNameExists } from "@/lib/cases/categories-queries";
import { deleteCase, getCaseById, updateCase } from "@/lib/cases/queries";
import { assertValidCaseMediaPaths, caseInputSchema, caseUpdateInputSchema } from "@/lib/cases/validation";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getCaseById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await getCaseById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = caseUpdateInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid case data" }, { status: 400 });

  const merged = caseInputSchema.safeParse({
    title: parsed.data.title ?? existing.title,
    category: parsed.data.category ?? existing.category,
    detailIntro: parsed.data.detailIntro ?? existing.detailIntro ?? undefined,
    client: parsed.data.client ?? existing.client ?? undefined,
    region: parsed.data.region ?? existing.region ?? undefined,
    deliverable: parsed.data.deliverable ?? existing.deliverable ?? undefined,
    summary: parsed.data.summary ?? existing.summary,
    detail: parsed.data.detail ?? existing.detail,
    method: parsed.data.method ?? existing.method ?? undefined,
    value: parsed.data.value ?? existing.value ?? undefined,
    faq: parsed.data.faq ?? existing.faq,
    coverPath: parsed.data.coverPath ?? existing.coverPath,
    episodes: parsed.data.episodes ?? existing.episodes.map(({ videoPath, orientation, durationSeconds }) => ({ videoPath, orientation, durationSeconds })),
  });
  if (!merged.success) return NextResponse.json({ error: "Invalid case data" }, { status: 400 });

  try {
    assertValidCaseMediaPaths(merged.data);
  } catch {
    return NextResponse.json({ error: "Invalid media path" }, { status: 400 });
  }

  if (!(await categoryNameExists(merged.data.category))) return NextResponse.json({ error: "Unknown category" }, { status: 400 });

  await updateCase(id, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await getCaseById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await deleteCase(id);
  return NextResponse.json({ ok: true });
}
