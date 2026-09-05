export const LOCAL_SITE_URL = "http://localhost:3000";

/**
 * 统一站点的绝对 URL。
 *
 * SEO 绝对 URL 由 NEXT_PUBLIC_SITE_URL 决定；SAE/ALB 负责不同域名之间的
 * HTTP 重定向，应用本身不再重复处理 Host 跳转。
 */
export function normalizeSiteUrl(value?: string, fallback = LOCAL_SITE_URL): string {
  const candidate = value?.trim() || fallback;

  try {
    const url = new URL(candidate);
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return fallback.replace(/\/$/, "");
  }
}

export function absoluteSiteUrl(pathname: string, siteUrl: string): string {
  if (/^https?:\/\//i.test(pathname)) return pathname;
  return new URL(pathname.startsWith("/") ? pathname : `/${pathname}`, `${siteUrl.replace(/\/$/, "")}/`).toString();
}
