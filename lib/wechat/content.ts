import "server-only";
import { fetchRemoteImage, uploadContentImage } from "./media";

/** 微信素材接口返回的图片域名。正文里只有这些域名的图片才会被公众号渲染出来。 */
const WECHAT_IMAGE_HOSTS = new Set(["mmbiz.qpic.cn", "mmbiz.qlogo.cn", "mp.weixin.qq.com"]);

const IMG_TAG_PATTERN = /<img\b[^>]*>/gi;
const SRC_ATTR_PATTERN = /(\ssrc\s*=\s*)(["'])(.*?)\2/i;

export function isWechatHostedImage(src: string): boolean {
  try {
    return WECHAT_IMAGE_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

function rejectNonUrlSrc(src: string): never {
  if (src.startsWith("wxmedia:")) {
    throw new Error(`正文图片不能用 wxmedia: 句柄（那是封面专用）。请用 wechat_create_upload_url 时传 purpose="content"，把返回的 url 直接填进 <img src>。`);
  }
  if (src.startsWith("data:")) {
    throw new Error("正文图片不支持 data: 内联 base64。请用 wechat_create_upload_url + curl 上传图片文件，再把返回的 url 填进 <img src>。");
  }
  throw new Error(
    `正文里的图片 "${src}" 不是可访问的网址。如果它是本地文件，请先调用 wechat_create_upload_url（purpose="content"）拿到上传地址，用 Bash 执行 curl 上传，再把返回的 url 填进 <img src>。`,
  );
}

/**
 * 把正文 HTML 里所有非微信域名的图片转投到微信，并回填成微信域名的 URL。
 * 不做这一步的话草稿能建成功，但读者看到的是一片空白——微信对外链图片是静默丢弃的。
 * 除 img 的 src 属性外，HTML 的其余内容一个字节都不改。
 */
export async function rewriteContentImages(html: string): Promise<{ html: string; uploadedCount: number }> {
  const tags = html.match(IMG_TAG_PATTERN) ?? [];
  const pendingSources: string[] = [];

  for (const tag of tags) {
    const src = SRC_ATTR_PATTERN.exec(tag)?.[3]?.trim();
    if (!src || isWechatHostedImage(src)) continue;
    if (!/^https?:\/\//i.test(src)) rejectNonUrlSrc(src);
    if (!pendingSources.includes(src)) pendingSources.push(src);
  }

  // 同一张图在正文里出现多次时只上传一次。
  const replacements = new Map<string, string>();
  for (const src of pendingSources) {
    replacements.set(src, await uploadContentImage(await fetchRemoteImage(src)));
  }

  const rewritten = html.replace(IMG_TAG_PATTERN, (tag) =>
    tag.replace(SRC_ATTR_PATTERN, (attr, prefix: string, quote: string, src: string) => {
      const replacement = replacements.get(src.trim());
      return replacement ? `${prefix}${quote}${replacement}${quote}` : attr;
    }),
  );

  return { html: rewritten, uploadedCount: replacements.size };
}
