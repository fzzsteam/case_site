export const AIGC_MEDIA = {
  mainFaviconPath: 'brand/logo_tiny.png',
  heroVideoPath: 'case-site/cases/aigc-media/hero.mp4',
  heroAltVideoPath: 'case-site/cases/aigc-media/hero-alt.mp4',
  heroPosterPath: 'case-site/cases/aigc-media/hero-first-frame.jpg',
  brandMarkPath: 'case-site/cases/aigc-media/brand-mark.webp',
  brandFangzhiPath: 'case-site/cases/aigc-media/brand-fangzhi.webp',
  brandPlaquesPath: 'case-site/cases/aigc-media/brand-plaques.webp',
  brandCertWallPath: 'case-site/cases/aigc-media/brand-cert-wall.webp',
} as const;

export function aigcImageUrl(path: string) {
  if (path.startsWith("/") || path.startsWith("http://") || path.startsWith("https://")) return path;
  return `/api/media/image/${path.split('/').map(encodeURIComponent).join('/')}`;
}

export async function fetchAigcVideoUrl(path: string) {
  const response = await fetch('/api/media/video-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  if (!response.ok) throw new Error('AIGC video unavailable');
  const data = (await response.json()) as { url?: unknown };
  if (typeof data.url !== 'string' || !data.url) throw new Error('AIGC video URL missing');
  return data.url;
}
