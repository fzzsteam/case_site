import { NextResponse, type NextRequest } from "next/server";
import { z, type ZodError } from "zod";
import { LEAD_SOURCES, createAigcLead } from "@/lib/aigc/lead-service";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  name: z.string().trim().min(2, "请填写你的称呼（至少 2 个字）").max(20, "称呼过长"),
  phone: z
    .string()
    .trim()
    .regex(/^1[3-9]\d{9}$/, "请填写正确的 11 位手机号"),
  source: z.enum(LEAD_SOURCES),
});

// 前端只读 body.error.message，保持这个形状，别改成本站其它接口的 { error: string }
function fail(code: string, message: string, status = 400, cause?: unknown) {
  if (cause !== undefined) console.error(`[API] ${code}:`, cause);
  return NextResponse.json({ error: { code, message } }, { status });
}
function formatZodErrorMessage(error: ZodError, fallback = "请求参数错误") {
  const messages = error.issues.map((issue) => issue.message.trim()).filter(Boolean);
  if (messages.length === 0) return fallback;
  return Array.from(new Set(messages)).join("；");
}

function clientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return fail("INVALID_JSON", "请求格式错误", 400);
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return fail("INVALID_PARAMS", formatZodErrorMessage(parsed.error), 400);
  }

  try {
    // 注意：日志中不得输出手机号等个人信息，只记录来源。
    const result = await createAigcLead({
      ...parsed.data,
      requestIp: clientIp(req),
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({ data: { received: true, duplicated: result.duplicated } });
  } catch (error) {
    return fail("LEAD_CREATE_FAILED", "提交失败，请稍后重试", 500, error);
  }
}
