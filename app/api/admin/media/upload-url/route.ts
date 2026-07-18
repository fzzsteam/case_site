import { NextResponse } from "next/server";
import { getSignedUploadUrl, prepareUpload } from "@/lib/oss/upload";
import { uploadUrlInputSchema } from "@/lib/cases/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = uploadUrlInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });

  let objectPath: string;
  let contentType: string;
  try {
    ({ objectPath, contentType } = prepareUpload(parsed.data.kind, parsed.data.fileName));
  } catch {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  try {
    const uploadUrl = await getSignedUploadUrl(objectPath, contentType);
    return NextResponse.json({ uploadUrl, objectPath, contentType });
  } catch {
    return NextResponse.json({ error: "Failed to sign upload" }, { status: 503 });
  }
}
