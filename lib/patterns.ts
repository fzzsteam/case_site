/**
 * 把文字和线稿变成粒子目标位置。
 *
 * 思路：用 Canvas 2D 把图案画成黑白图，扫出所有"有墨"的像素，然后按亮度做
 * 面积加权重采样，得到 N 个均匀铺满笔画的点。结果打包成一张 RGBA float 纹理，
 * 着色器里按 instanceIndex 直接 textureLoad 取，零采样开销。
 *
 * 为什么不在 shader 里做拒绝采样：细笔画的命中率极低（一张图可能只有 3% 的
 * 像素有墨），拒绝采样要循环几十次才能命中一个点，而且不同粒子的循环次数
 * 不同，会让 warp 严重分歧。CPU 侧一次算好是更省的做法。
 */

/** 光栅化用的画布分辨率。256 足够表达简笔画和字形，且扫描很快。 */
const GRID = 256;

export interface PatternPoints {
  /** 长度 = count * 2，交错存放 [x, y, x, y, ...]，范围约 -1..1 */
  data: Float32Array;
  count: number;
}

type DrawFn = (ctx: CanvasRenderingContext2D, size: number) => void;

function makeCanvas(size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("拿不到 2D context");
  return { canvas, ctx };
}

/**
 * 画 → 扫墨点 → 重采样成 count 个目标位置。
 *
 * 重采样用的是「累积权重 + 均匀步长」（低差异序列的一维版本）：先把每个墨点
 * 的亮度累加成一个前缀和，然后用固定步长在总权重上等距取样。这样亮的区域
 * 自然分到更多粒子，而且分布比纯随机抽样均匀得多，不会出现斑块。
 */
function rasterise(draw: DrawFn, count: number): PatternPoints {
  const { ctx } = makeCanvas(GRID);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, GRID, GRID);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  draw(ctx, GRID);

  const pixels = ctx.getImageData(0, 0, GRID, GRID).data;

  // 收集墨点及其权重
  const xs: number[] = [];
  const ys: number[] = [];
  const cumulative: number[] = [];
  let total = 0;

  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      // 只看红通道就够，我们画的是纯灰阶
      const lum = pixels[(y * GRID + x) * 4] / 255;
      if (lum <= 0.12) continue;
      total += lum;
      xs.push(x);
      ys.push(y);
      cumulative.push(total);
    }
  }

  const data = new Float32Array(count * 2);

  if (cumulative.length === 0 || total <= 0) {
    // 图案是空的（比如字体缺字被画成了空白）—— 退化成一个小圆环，
    // 至少不会让整屏粒子塌到原点。
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      data[i * 2] = Math.cos(a) * 0.6;
      data[i * 2 + 1] = Math.sin(a) * 0.6;
    }
    return { data, count };
  }

  const step = total / count;
  let cursor = step * 0.5;
  let at = 0;

  for (let i = 0; i < count; i++) {
    while (at < cumulative.length - 1 && cumulative[at] < cursor) at++;
    // 在该像素内部随机抖动，避免所有粒子落在整数网格上形成摩尔纹
    const px = xs[at] + Math.random();
    const py = ys[at] + Math.random();
    // 转到 -1..1，Y 轴翻转（画布 Y 向下，世界 Y 向上）
    data[i * 2] = (px / GRID) * 2 - 1;
    data[i * 2 + 1] = -((py / GRID) * 2 - 1);
    cursor += step;
  }

  return { data, count };
}

/**
 * 检测系统是否有中文字形。缺字时浏览器会画豆腐块或空白，两者的宽度都和
 * 正常字形不同 —— 拿一个几乎不可能存在的私用区码点做基准比对即可。
 */
export function hasCjkGlyphs(): boolean {
  try {
    const { ctx } = makeCanvas(8);
    ctx.font = "100px sans-serif";
    const target = ctx.measureText("万").width;
    const missing = ctx.measureText("").width; // 私用区，必然缺字
    return target > 0 && Math.abs(target - missing) > 1;
  } catch {
    return false;
  }
}

/** 把一行字铺满画布宽度 */
function fitText(
  ctx: CanvasRenderingContext2D,
  size: number,
  text: string,
  weight: string,
  widthRatio: number,
) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 二分逼近出刚好占到 widthRatio 的字号
  let lo = 8;
  let hi = size * 1.6;
  const wanted = size * widthRatio;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    ctx.font = `${weight} ${mid}px sans-serif`;
    if (ctx.measureText(text).width > wanted) hi = mid;
    else lo = mid;
  }
  ctx.font = `${weight} ${lo}px sans-serif`;
  ctx.fillText(text, size / 2, size / 2);
}

/** //00 —— AIGC 四个字母，实心 */
export function aigcPattern(count: number) {
  return rasterise((ctx, size) => {
    fitText(ctx, size, "AIGC", "800", 0.86);
  }, count);
}

/** //05 —— 品牌字。缺中文字形时自动回退英文 */
export function wordmarkPattern(count: number, cjk: string, latin: string) {
  const useCjk = hasCjkGlyphs();
  return rasterise((ctx, size) => {
    if (useCjk) fitText(ctx, size, cjk, "700", 0.9);
    else fitText(ctx, size, latin, "800", 0.88);
  }, count);
}

/**
 * //02 —— 机器人头简笔画。原创图形：方脑袋 + 天线 + 两只圆眼 + 一条嘴缝。
 * 全部用描边而非填充，粒子会沿着线条排布，读起来是"线稿"而不是"色块"。
 */
export function robotPattern(count: number) {
  return rasterise((ctx, size) => {
    const s = size / 100; // 把下面的坐标当成 100×100 的画布来写
    ctx.lineWidth = 3.4 * s;

    // 天线
    ctx.beginPath();
    ctx.moveTo(50 * s, 16 * s);
    ctx.lineTo(50 * s, 26 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(50 * s, 12 * s, 4.2 * s, 0, Math.PI * 2);
    ctx.fill();

    // 头（圆角矩形）
    const x = 22 * s;
    const y = 26 * s;
    const w = 56 * s;
    const h = 48 * s;
    const r = 10 * s;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.stroke();

    // 眼睛（实心，视觉重心）
    ctx.beginPath();
    ctx.arc(38 * s, 45 * s, 5.6 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(62 * s, 45 * s, 5.6 * s, 0, Math.PI * 2);
    ctx.fill();

    // 嘴缝
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.moveTo(40 * s, 62 * s);
    ctx.lineTo(60 * s, 62 * s);
    ctx.stroke();

    // 耳朵
    ctx.beginPath();
    ctx.moveTo(22 * s, 42 * s);
    ctx.lineTo(15 * s, 42 * s);
    ctx.lineTo(15 * s, 55 * s);
    ctx.lineTo(22 * s, 55 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(78 * s, 42 * s);
    ctx.lineTo(85 * s, 42 * s);
    ctx.lineTo(85 * s, 55 * s);
    ctx.lineTo(78 * s, 55 * s);
    ctx.stroke();

    // 脖子与肩，让轮廓不至于飘在空中
    ctx.lineWidth = 3.4 * s;
    ctx.beginPath();
    ctx.moveTo(44 * s, 74 * s);
    ctx.lineTo(44 * s, 80 * s);
    ctx.lineTo(30 * s, 86 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(56 * s, 74 * s);
    ctx.lineTo(56 * s, 80 * s);
    ctx.lineTo(70 * s, 86 * s);
    ctx.stroke();
  }, count);
}

/**
 * 把多个图案打包进一张纹理。
 *
 * 不能用「一行一个图案」的布局：粒子数是 side²（默认 50,176），远超纹理最大
 * 边长 16384。所以按 side × side 的方块排布，第 k 个图案占据第 k 个方块，
 * 查表时 y 再加上 k * side 的偏移。
 *
 * 纹理尺寸 = side × (side * 图案数)，默认 224 × 672，约 2.4MB float32。
 */
export function packPatterns(patterns: PatternPoints[], side: number) {
  const count = side * side;
  const height = side * patterns.length;
  // RGBA float：R=x, G=y，BA 留空备用
  const data = new Float32Array(side * height * 4);

  patterns.forEach((pattern, slot) => {
    const base = slot * count;
    for (let i = 0; i < count; i++) {
      const dst = (base + i) * 4;
      data[dst] = pattern.data[i * 2];
      data[dst + 1] = pattern.data[i * 2 + 1];
    }
  });

  return { data, width: side, height };
}
