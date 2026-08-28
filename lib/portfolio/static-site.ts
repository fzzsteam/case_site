import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getOssClient } from "@/lib/oss/client";

const PUBLIC_ROOT = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "portfolio");

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function useOssStorage() {
  return process.env.PORTFOLIO_STORAGE?.toLowerCase() === "oss";
}

function ossPrefix() {
  return (process.env.PORTFOLIO_OSS_PREFIX || "portfolio-sites").replace(/^\/+|\/+$/g, "");
}

function isSafeSegment(segment: string) {
  return Boolean(segment) && segment !== "." && segment !== ".." && !segment.includes("/") && !segment.includes("\\") && !segment.includes("\0");
}

function isSafeSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug);
}

function siteRoot(slug: string) {
  if (!isSafeSlug(slug)) return null;
  return path.join(/*turbopackIgnore: true*/ PUBLIC_ROOT, slug);
}

function contentType(filePath: string) {
  return CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

function shouldRewriteAssetReferences(filePath: string) {
  return [".css", ".html", ".js"].includes(path.extname(filePath).toLowerCase());
}

function previewRewrite(content: string, slug: string) {
  const prefix = `/portfolio-preview/${slug}`;
  return content
    // HTML attributes and JS strings/template literals such as "/assets/..."
    .replace(/(["'`(])\/(assets|favicon\.svg)/g, `$1${prefix}/$2`)
    // CSS url(/assets/...) references without quotes.
    .replace(/url\(\s*\/(assets)\//g, `url(${prefix}/$1/`);
}

function cacheControl(filePath: string) {
  return path.extname(filePath).toLowerCase() === ".html" ? "no-cache" : "public, max-age=31536000, immutable";
}

function responseHeaders(filePath: string, extra?: HeadersInit) {
  const headers = new Headers(extra);
  headers.set("Cache-Control", cacheControl(filePath));
  headers.set("Content-Type", contentType(filePath));
  headers.set("X-Content-Type-Options", "nosniff");
  return headers;
}

async function serveLocalPortfolio(slug: string, segments: string[], preview: boolean) {
  const root = siteRoot(slug);
  if (!root) return new Response("Not found", { status: 404 });

  const resolvedRoot = path.resolve(root);
  let filePath = path.resolve(/*turbopackIgnore: true*/ root, ...(segments.length ? segments : ["index.html"]));
  if (!filePath.startsWith(`${resolvedRoot}${path.sep}`) && filePath !== resolvedRoot) return new Response("Not found", { status: 404 });

  try {
    const info = await fs.stat(/*turbopackIgnore: true*/ filePath);
    if (info.isDirectory()) filePath = path.join(filePath, "index.html");
  } catch {
    if (!segments.length || segments.some((segment) => segment.includes("."))) return new Response("Not found", { status: 404 });
    filePath = path.join(resolvedRoot, "index.html");
  }

  try {
    const info = await fs.stat(/*turbopackIgnore: true*/ filePath);
    if (!info.isFile()) return new Response("Not found", { status: 404 });
    const file = await fs.readFile(/*turbopackIgnore: true*/ filePath);
    const body = preview && shouldRewriteAssetReferences(filePath)
      ? Buffer.from(previewRewrite(file.toString("utf8"), slug))
      : new Uint8Array(file);
    return new Response(body, { headers: responseHeaders(filePath) });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

function portfolioObjectPath(slug: string, segments: string[]) {
  return `${ossPrefix()}/${slug}/${segments.length ? segments.join("/") : "index.html"}`;
}

async function fetchOssObject(objectPath: string, request?: Request) {
  const signedUrl = getOssClient().signatureUrl(objectPath, { expires: 300 });
  const range = request?.headers.get("range");
  return fetch(signedUrl, {
    headers: range ? { Range: range } : undefined,
    cache: "no-store",
  });
}

async function serveOssPortfolio(slug: string, segments: string[], preview: boolean, request?: Request) {
  let objectPath = portfolioObjectPath(slug, segments);
  let upstream = await fetchOssObject(objectPath, request);

  // Treat extensionless paths as SPA routes and fall back to the deployed root.
  if (!upstream.ok && upstream.status === 404 && (!segments.length || segments.every((segment) => !segment.includes(".")))) {
    objectPath = portfolioObjectPath(slug, []);
    upstream = await fetchOssObject(objectPath, request);
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new Response(upstream.status === 404 ? "Not found" : "Portfolio unavailable", { status: upstream.status === 404 ? 404 : 503 });
  }

  const filePath = objectPath;
  const headers = responseHeaders(filePath, {
    "Accept-Ranges": "bytes",
    "Content-Type": upstream.headers.get("content-type") || contentType(filePath),
  });
  for (const name of ["content-length", "content-range", "etag", "last-modified"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  if (preview && shouldRewriteAssetReferences(filePath)) {
    const body = previewRewrite(await upstream.text(), slug);
    return new Response(body, { status: upstream.status, headers });
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}

export async function serveStaticPortfolio(slug: string, segments: string[] = [], preview = false, request?: Request) {
  if (!isSafeSlug(slug) || segments.some((segment) => !isSafeSegment(segment))) return new Response("Not found", { status: 404 });
  if (useOssStorage()) {
    try {
      return await serveOssPortfolio(slug, segments, preview, request);
    } catch (error) {
      console.error("[portfolio] OSS static site unavailable", error);
      return new Response("Portfolio unavailable", { status: 503 });
    }
  }
  return serveLocalPortfolio(slug, segments, preview);
}
