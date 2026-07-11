const ALLOWED_PREFIXES = ["case-site/cases/", "brand/"];

export function validateMediaPath(input: string) {
  let path: string;
  try { path = decodeURIComponent(input); } catch { throw new Error("Invalid media path"); }
  if (!path || path.startsWith("/") || path.includes("..") || path.includes("://") || path.includes("\\") || !ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix))) throw new Error("Invalid media path");
  return path;
}
