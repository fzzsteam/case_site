"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";
import {
  Fn,
  instanceIndex,
  instancedArray,
  uniform,
  float,
  vec3,
  hash,
  PI2,
  sin,
  cos,
  acos,
  abs,
  mix,
  smoothstep,
  pass,
  uv,
  textureLoad,
  ivec2,
  int,
} from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";

import {
  aigcPattern,
  packPatterns,
  robotPattern,
  wordmarkPattern,
} from "@/lib/patterns";
import type { FluxSignals, RendererStatus } from "@/components/aigc/flux-types";

interface FluxFieldProps {
  signals: FluxSignals;
  chapterCount: number;
  onStatus: (status: RendererStatus) => void;
}

/** //05 品牌字。缺中文字形的环境自动回退成拉丁文 */
const WORDMARK_CJK = "万象元生";
const WORDMARK_LATIN = "AIGC LAB";

interface Budget {
  side: number;
  count: number;
  compact: boolean;
  label: string;
}

/**
 * 粒子预算。场是一个 side × side 的网格，桌面端 WebGPU 上到 512² ≈ 26 万。
 * 可用 `?flux=<128..640>` 手动指定，方便在弱显卡上压测。
 */
function resolveBudget(webgpu: boolean): Budget {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const compact =
    window.matchMedia("(max-width: 767px)").matches ||
    (coarse && window.matchMedia("(max-width: 1100px)").matches);
  const memory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

  // WebGL2 后端用的是模拟 compute 的慢路径，且多为集显，起点必须保守。
  // 真 WebGPU 才放开。不够的话下面的自适应控制器会再往上/往下调。
  let side: number;
  if (!webgpu) side = compact ? 160 : 224;
  else if (compact) side = memory <= 4 ? 288 : 352;
  else if (memory <= 6) side = 416;
  else side = 480;

  const override = new URLSearchParams(window.location.search).get("flux");
  const pinned = override ? Number.parseInt(override, 10) : Number.NaN;
  if (Number.isInteger(pinned) && pinned >= 128 && pinned <= 640) side = pinned;

  return {
    side,
    count: side * side,
    compact,
    label: side >= 448 ? "满载" : side >= 288 ? "均衡" : "兼容",
  };
}

export default function FluxField({
  signals,
  chapterCount,
  onStatus,
}: FluxFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      nav.connection?.saveData === true
    ) {
      onStatus({
        phase: "running",
        backend: "STATIC",
        particleCount: 0,
        detail: "已降低动效",
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let renderer: THREE.WebGPURenderer | null = null;
    let post: THREE.PostProcessing | null = null;
    let observer: ResizeObserver | null = null;
    let onVisibility: (() => void) | null = null;

    onStatus({
      phase: "compiling",
      backend: "WEBGPU",
      particleCount: 0,
      detail: "编译着色器",
    });

    (async () => {
      try {
        renderer = new THREE.WebGPURenderer({
          canvas,
          alpha: false,
          antialias: false,
          powerPreference: "high-performance",
        });
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        await renderer.init();

        if (cancelled) {
          renderer.dispose();
          renderer = null;
          return;
        }

        const bail = () => {
          if (cancelled || !renderer) return;
          renderer.setAnimationLoop(null);
          onStatus({
            phase: "failed",
            backend: "STATIC",
            particleCount: 0,
            detail: "渲染器不可用",
          });
        };
        const onLost = renderer.onDeviceLost.bind(renderer);
        renderer.onDeviceLost = (info) => {
          onLost(info);
          bail();
        };

        const backend = renderer.backend as { isWebGPUBackend?: boolean };
        const webgpu = backend?.isWebGPUBackend === true;
        const budget = resolveBudget(webgpu);
        const count = budget.count;
        const side = budget.side;

        // ---- 图案纹理：CPU 侧把三个图案光栅化成粒子目标位置 ------------------
        // side × (side*3) 的 float 纹理，每个 side×side 方块存一个图案
        const packed = packPatterns(
          [
            aigcPattern(count),
            robotPattern(count),
            wordmarkPattern(count, WORDMARK_CJK, WORDMARK_LATIN),
          ],
          side,
        );
        const patternTex = new THREE.DataTexture(
          packed.data,
          packed.width,
          packed.height,
          THREE.RGBAFormat,
          THREE.FloatType,
        );
        patternTex.minFilter = THREE.NearestFilter;
        patternTex.magFilter = THREE.NearestFilter;
        patternTex.needsUpdate = true;
        const lastStage = chapterCount - 1;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#05060a");
        scene.fog = new THREE.FogExp2("#05060a", budget.compact ? 0.03 : 0.048);

        const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 60);
        camera.position.set(0, 0, 9.8);

        // ---- 存储缓冲与 uniform -------------------------------------------
        const position = instancedArray(count, "vec3");
        const velocity = instancedArray(count, "vec3");

        const uStage = uniform(0); // 章节位置，带小数
        const uFlow = uniform(0); // 滚动速度
        const uPointer = uniform(new THREE.Vector3(100, 100, 0));
        const uGrab = uniform(0); // 指针强度 0..1
        const uClock = uniform(0);
        const uStep = uniform(1 / 60);
        const uDot = uniform(budget.compact ? 0.055 : 0.042);
        const uFocus = uniform(-1); // 详情项焦点，-1 表示无焦点

        // ---- 初始化：一团均匀球壳噪声 ------------------------------------
        const seed = Fn(() => {
          const p = position.element(instanceIndex);
          const v = velocity.element(instanceIndex);
          const a = hash(instanceIndex);
          const b = hash(instanceIndex.add(19));
          const c = hash(instanceIndex.add(41));

          const phi = acos(b.mul(2).sub(1));
          const theta = a.mul(PI2);
          p.assign(
            vec3(
              sin(phi).mul(cos(theta)),
              cos(phi),
              sin(phi).mul(sin(theta)),
            ).mul(c.pow(0.5).mul(3.6)),
          );
          v.assign(vec3(0));
        })().compute(count);

        // ---- 模拟 ----------------------------------------------------------
        const simulate = Fn(() => {
          const p = position.element(instanceIndex);
          const v = velocity.element(instanceIndex);

          const i = float(instanceIndex);
          const r0 = hash(instanceIndex);
          const r1 = hash(instanceIndex.add(19));
          const r2 = hash(instanceIndex.add(41));
          const r3 = hash(instanceIndex.add(67));
          const r4 = hash(instanceIndex.add(89));
          const r5 = hash(instanceIndex.add(113));

          // 网格坐标，用来做规则结构
          const gu = float(instanceIndex.mod(side)).div(side - 1);
          const gv = i.div(side).floor().div(side - 1);

          /**
           * 绕 X 轴俯仰。盘状结构自然建在 XZ 平面上，而相机在 +Z 正视原点，
           * 不转的话盘会被压成一条横线。每个盘状形态各给一个倾角，既能看清
           * 结构又保留透视。
           */
          const pitch = (
            src: ReturnType<typeof vec3>,
            angle: number,
          ): ReturnType<typeof vec3> => {
            const ca = Math.cos(angle);
            const sa = Math.sin(angle);
            return vec3(
              src.x,
              src.y.mul(ca).sub(src.z.mul(sa)),
              src.y.mul(sa).add(src.z.mul(ca)),
            );
          };

          /* 图案查表：三个"图案型"形态（AIGC / 机器人头 / 品牌字）的目标
             位置在 CPU 侧已经算好并打包进一张 side × (side*3) 的纹理。
             这里按 instanceIndex 还原出二维坐标，slot 决定取第几个图案。 */
          const gx = instanceIndex.mod(side);
          const gy = instanceIndex.div(side);
          const lookup = (slot: number, spread: number, depth: number) => {
            const texel = textureLoad(
              patternTex,
              ivec2(int(gx), int(gy).add(slot * side)),
            );
            return vec3(
              texel.x.mul(spread),
              texel.y.mul(spread),
              // 微厚度：让平面图案在相机视差下仍有立体感，但不影响可读性
              r3.sub(0.5).mul(depth),
            );
          };

          /* ── 形态 0：AIGC 字母 ───────────────────────────────────────── */
          const letters = lookup(0, 4.35, 0.3);

          /* ── 形态 2：机器人头线稿 ────────────────────────────────────── */
          const robot = lookup(1, 3.5, 0.3);

          /* ── 形态 5：品牌字 ──────────────────────────────────────────── */
          const wordmark = lookup(2, 4.2, 0.3);

          /* ── 形态 1：纯高斯噪声（扩散模型的 t=T 起点）────────────────────
             不是死掉的随机点：整团缓慢翻滚呼吸，并且有 8% 的粒子已经落在
             机器人头的目标位上，形成极微弱的残影 —— 观众会觉得"里面好像
             有东西"，从而有继续往下滚的动机。                        */
          const nPhi = acos(r1.mul(2).sub(1));
          const nTheta = r0.mul(PI2).add(uClock.mul(0.07));
          const nRadius = r2.pow(0.42).mul(4.1);
          const chaos = vec3(
            sin(nPhi).mul(cos(nTheta)),
            cos(nPhi),
            sin(nPhi).mul(sin(nTheta)),
          )
            .mul(nRadius)
            .add(
              // 呼吸：三轴异相正弦，幅度不小，整团看起来在翻滚
              vec3(
                sin(uClock.mul(0.53).add(r3.mul(PI2))),
                sin(uClock.mul(0.47).add(r4.mul(PI2))),
                cos(uClock.mul(0.41).add(r5.mul(PI2))),
              ).mul(0.42),
            );
          // 8% 的粒子提前归位，透出残影
          const noise = r4.lessThan(0.08).select(robot, chaos);

          /* ── 形态 3：神经网络 ────────────────────────────────────────────
             四层节点 + 层间连线。约三分之一的粒子沿连线流动（从左往右），
             其余聚在节点上，整体读起来是一张会"通电"的网络图。      */
          const LAYERS = 4;
          const layer = r0.mul(LAYERS).floor();
          const nodeInLayer = r1.mul(6).floor();
          const layerX = layer.div(LAYERS - 1).sub(0.5).mul(6.2);
          const nodeY = nodeInLayer.div(5).sub(0.5).mul(4.4);
          const nodeBlob = vec3(
            layerX,
            nodeY,
            r2.sub(0.5).mul(0.24),
          ).add(vec3(r3.sub(0.5), r4.sub(0.5), r5.sub(0.5)).mul(0.17));

          // 连线：从本层某节点流向下一层某节点
          const nextNodeY = r2.mul(6).floor().div(5).sub(0.5).mul(4.4);
          const nextX = layer.add(1).min(LAYERS - 1).div(LAYERS - 1).sub(0.5).mul(6.2);
          // 沿线的行进相位，每条线速度略不同
          const travel = r3.add(uClock.mul(r4.mul(0.14).add(0.1))).fract();
          const wire = vec3(
            mix(layerX, nextX, travel),
            mix(nodeY, nextNodeY, travel),
            r5.sub(0.5).mul(0.14),
          );
          const network = r1.greaterThan(0.66).select(wire, nodeBlob);

          /* ── 形态 4：潜空间流形 ──────────────────────────────────────────
             一张被三组低频波扭曲的网格面，斜着摆，读起来像 latent manifold
             的等高面。用网格坐标而非随机数，所以结构是规则的。     */
          const mu = gu.sub(0.5).mul(8.6);
          const mv = gv.sub(0.5).mul(8.6);
          const fold =
            sin(mu.mul(0.62).add(uClock.mul(0.34)))
              .mul(0.72)
              .add(sin(mv.mul(0.78).sub(uClock.mul(0.26))).mul(0.58))
              .add(sin(mu.add(mv).mul(0.44).add(uClock.mul(0.19))).mul(0.4));
          const manifold = pitch(
            vec3(mu, fold.add(r3.sub(0.5).mul(0.07)), mv),
            -0.86,
          );


          // ---- 挑出当前与下一形态并插值 ------------------------------------
          const stage = uStage.floor();
          const frac = uStage.fract();
          // 每个粒子的过渡时机略有错开，形变看起来是"流"而不是"切"
          const blend = smoothstep(0, 1, frac.mul(1.22).sub(r5.mul(0.22)));

          const shapeAt = (offset: number) => {
            const shapes = [letters, noise, robot, network, manifold, wordmark];
            // 从后往前折叠成嵌套 select
            let out = shapes[Math.min(5, 5 + offset)];
            for (let k = 4; k >= 0; k--) {
              const idx = Math.min(5, Math.max(0, k + offset));
              out = stage.lessThan(k + 0.5).select(shapes[idx], out);
            }
            return out;
          };

          const from = shapeAt(0);
          const to = shapeAt(1);
          const target = mix(from, to, blend);

          // 详情项焦点：唤醒对应的一组粒子，让内容与粒子场保持联动。
          const focusBand = r0.mul(7).floor();
          const focusDistance = focusBand.sub(uFocus.mul(7)).abs();
          const focusMask = uFocus
            .greaterThan(-0.5)
            .select(smoothstep(1.1, 0, focusDistance), float(0));
          const focusPhase = uClock.mul(1.6).add(r1.mul(PI2));
          v.addAssign(
            vec3(
              sin(focusPhase),
              cos(focusPhase.mul(0.72)),
              sin(focusPhase.mul(0.48)),
            )
              .mul(focusMask)
              .mul(uStep)
              .mul(1.15),
          );

          // ---- 积分 ----------------------------------------------------------
          const rush = abs(uFlow).min(5);
          // 滚动越快，向目标形态收敛越猛，形变有"被拽过去"的手感
          const pull = rush.mul(0.7).add(7.8);
          v.addAssign(target.sub(p).mul(pull).mul(uStep));

          // 低频湍流，让静止时也有呼吸感
          const drift = vec3(
            sin(p.y.mul(1.6).add(uClock).add(r0.mul(PI2))),
            sin(p.z.mul(1.35).sub(uClock.mul(0.72)).add(r1.mul(PI2))),
            sin(p.x.mul(1.48).add(uClock.mul(0.86)).add(r2.mul(PI2))),
          );
          v.addAssign(drift.mul(uStep).mul(rush.mul(0.13).add(0.075)));

          // 滚动带来的整体涡旋
          v.addAssign(
            vec3(p.y.negate(), p.x, p.z.mul(0.12))
              .add(vec3(1e-4))
              .normalize()
              .mul(uFlow)
              .mul(uStep)
              .mul(0.16),
          );

          // ---- 指针交互 -----------------------------------------------------
          const toP = p.sub(uPointer);
          const dist = toP.length();
          const nearMask = smoothstep(2.1, 0, dist);
          const wideMask = smoothstep(3.4, 0, dist);
          const dir = toP.add(vec3(1e-3)).normalize();

          // 章节权重：只有靠近某章时它的交互才生效
          const w = (k: number) => uStage.sub(k).abs().min(1).oneMinus();

          /* 图案屏（//00 字母、//02 机器人头、//05 品牌字）的扰动压到 30%：
             文字被推散就不可读了。噪声/网络/潜空间三屏保持全强度。 */
          const patternWeight = w(0).add(w(2)).add(w(lastStage)).min(1);
          const PATTERN_DAMP = 0.3;
          const grab = uGrab.mul(
            float(1).sub(patternWeight.mul(1 - PATTERN_DAMP)),
          );

          // //00 //02 //05 图案屏：轻轻推开
          v.addAssign(
            dir.mul(nearMask).mul(grab).mul(uStep).mul(patternWeight.mul(5.2)),
          );
          // //01 噪声：向外炸开，搅动混沌
          v.addAssign(dir.mul(nearMask).mul(uGrab).mul(w(1)).mul(uStep).mul(6.4));
          // //03 神经网络：吸引，把节点拉出来
          v.addAssign(
            dir.negate().mul(wideMask).mul(uGrab).mul(w(3)).mul(uStep).mul(5.0),
          );
          // //04 潜空间：垂直顶起，像手指点在流形上
          v.addAssign(
            vec3(0, 1, 0).mul(nearMask).mul(uGrab).mul(w(4)).mul(uStep).mul(6.6),
          );

          /* 图案屏额外加一道回弹：扰动一撤就立刻归位，保证可读性。
             这是在通用弹簧之上再叠一个只对图案屏生效的强弹簧。      */
          v.addAssign(
            target.sub(p).mul(patternWeight).mul(6.5).mul(uStep),
          );

          // 阻尼与限速
          const damp = float(1)
            .sub(uStep.mul(float(5).sub(rush.min(1).mul(1.9))))
            .max(0.76);
          v.mulAssign(damp);
          const speed = v.length();
          v.assign(
            speed
              .greaterThan(5.2)
              .select(v.add(vec3(1e-4)).normalize().mul(5.2), v),
          );
          p.addAssign(v.mul(uStep));
        })().compute(count);

        // ---- 材质：按章节给粒子上色 -----------------------------------------
        const material = new THREE.SpriteNodeMaterial();
        const t0c = hash(instanceIndex.add(211));
        const t1c = hash(instanceIndex.add(307));
        const t2c = hash(instanceIndex.add(401));

        /* 每种形态一组「暗→亮」渐变，整体从冷到暖推进，对应"混沌 → 秩序"。
           少量高亮粒子当作"星"，制造密度层次。 */

        // //00 AIGC —— 靛蓝，品牌色
        const cLetters = mix(
          vec3(0.1, 0.11, 0.32),
          vec3(0.44, 0.47, 0.95),
          t0c.pow(0.62),
        );
        // //01 噪声 —— 去饱和的灰蓝，刻意显得"还没有信息"
        const cNoise = mix(
          vec3(0.07, 0.08, 0.12),
          vec3(0.42, 0.46, 0.56),
          t1c.pow(0.9),
        );
        // //02 去噪成形 —— 青绿，"信息浮现"
        const cRobotBase = mix(
          vec3(0.02, 0.16, 0.15),
          vec3(0.2, 0.86, 0.72),
          t0c.pow(0.5),
        );
        const cRobot = t2c
          .greaterThan(0.94)
          .select(vec3(0.8, 1, 0.94), cRobotBase);
        // //03 神经网络 —— 天蓝，通电感
        const cNetwork = mix(
          vec3(0.03, 0.14, 0.26),
          vec3(0.22, 0.7, 0.99),
          t1c.pow(0.58),
        );
        // //04 潜空间 —— 琥珀，转暖
        const cManifold = mix(
          vec3(0.17, 0.12, 0.03),
          vec3(0.98, 0.73, 0.2),
          t1c.pow(1.5),
        );
        // //05 品牌字 —— 品红收尾
        const cWordBase = mix(
          vec3(0.19, 0.05, 0.22),
          vec3(0.91, 0.47, 0.98),
          t0c.pow(0.66),
        );
        const cWordmark = t2c
          .greaterThan(0.96)
          .select(vec3(1, 0.88, 1), cWordBase);

        const palette = [
          cLetters,
          cNoise,
          cRobot,
          cNetwork,
          cManifold,
          cWordmark,
        ];
        const cStage = uStage.floor();
        const cBlend = smoothstep(0, 1, uStage.fract());
        const colourAt = (offset: number) => {
          let out = palette[5];
          for (let k = 4; k >= 0; k--) {
            const idx = Math.min(5, Math.max(0, k + offset));
            out = cStage.lessThan(k + 0.5).select(palette[idx], out);
          }
          return out;
        };

        const focusBand = t0c.mul(7).floor();
        const focusDistance = focusBand.sub(uFocus.mul(7)).abs();
        const focusMask = uFocus
          .greaterThan(-0.5)
          .select(smoothstep(1.1, 0, focusDistance), float(0));
        const baseColour = mix(colourAt(0), colourAt(1), cBlend).mul(0.95);

        material.positionNode = position.toAttribute();
        // 少量粒子明显更大，视觉上产生层次
        material.scaleNode = uDot
          .mul(t1c.pow(7).mul(2.1).add(0.55))
          .mul(float(1).add(focusMask.mul(0.75)));
        material.colorNode = mix(
          baseColour,
          vec3(0.78, 0.9, 1.0),
          focusMask.mul(0.55),
        );

        // 圆形柔边，把方形 billboard 变成发光的点
        const falloff = smoothstep(0.5, 0.04, uv().sub(0.5).length());
        material.opacityNode = falloff
          .mul(t2c.mul(0.34).add(0.2))
          .mul(0.9)
          .mul(float(1).add(focusMask.mul(0.4)));
        material.transparent = true;
        // 不要开 alphaToCoverage：加法混合 + depthWrite:false 下它没有任何
        // 视觉收益，却会让 ANGLE/Mesa 走多重采样解析路径。实测在 Intel 集显
        // 上同样的粒子预算会从 60fps 掉到 33fps。
        material.depthWrite = false;
        material.blending = THREE.AdditiveBlending;

        const sprites = new THREE.Sprite(material);
        sprites.count = count;
        sprites.frustumCulled = false;
        scene.add(sprites);

        renderer.compute(seed);

        // ---- 泛光（仅桌面 WebGPU）-------------------------------------------
        if (webgpu && !budget.compact && side >= 448) {
          post = new THREE.PostProcessing(renderer);
          const scenePass = pass(scene, camera).getTextureNode("output");
          const glow = bloom(scenePass, 0.36, 0.3, 0.1);
          // 低分辨率渲染泛光，省一大截填充率
          const GLOW_SCALE = 0.34;
          const baseSetSize = glow.setSize.bind(glow);
          glow.setSize = (w: number, h: number) =>
            baseSetSize(
              Math.max(1, Math.round(w * GLOW_SCALE)),
              Math.max(1, Math.round(h * GLOW_SCALE)),
            );
          post.outputNode = scenePass.add(glow);
        }

        // ---- 尺寸 ------------------------------------------------------------
        // WebGPU 才值得超采样；WebGL2 路径填充率是瓶颈，锁到 1。
        const basePixelRatio = Math.min(
          window.devicePixelRatio,
          !webgpu ? 1 : budget.compact ? 1 : 1.4,
        );
        let resScale = 1;
        const RES_FLOOR = webgpu ? 0.65 : 0.6;

        /* 实际绘制的粒子比例。缓冲区和 compute 始终按满量分配，这里只调
           `sprites.count` —— 少画一部分实例，省下顶点处理和加法混合的
           填充率，这在集显上是最大的一笔开销。 */
        let drawFrac = 1;
        const DRAW_FLOOR = 0.25;
        const applyDrawFraction = () => {
          sprites.count = Math.max(4096, Math.round(count * drawFrac));
          onStatus({
            phase: "running",
            backend: webgpu ? "WEBGPU" : "WEBGL2",
            particleCount: sprites.count,
            detail: drawFrac < 1 ? "已自动降载" : budget.label,
          });
        };

        const resize = () => {
          if (!renderer || cancelled) return;
          const host = canvas.parentElement;
          const w = Math.max(1, host?.clientWidth ?? window.innerWidth);
          const h = Math.max(1, host?.clientHeight ?? window.innerHeight);
          camera.aspect = w / h;
          camera.position.z = Math.max(
            9.8,
            (budget.compact ? 10.4 : 9.2) / camera.aspect,
          );
          camera.updateProjectionMatrix();
          renderer.setPixelRatio(basePixelRatio * resScale);
          renderer.setSize(w, h, false);
        };

        observer = new ResizeObserver(resize);
        if (canvas.parentElement) observer.observe(canvas.parentElement);
        resize();

        // ---- 帧循环 ----------------------------------------------------------
        let clock = 0;
        let last = performance.now();
        let smoothStage = signals.progress.current;
        let smoothFlow = 0;
        let awake = !document.hidden;
        let sampleFrom = performance.now() + 1600;
        let sampleMs = 0;
        let sampleN = 0;
        let goodRuns = 0;
        const world = new THREE.Vector3(100, 100, 0);

        onVisibility = () => {
          awake = !document.hidden;
          last = performance.now();
          sampleFrom = last + 900;
          sampleMs = 0;
          sampleN = 0;
        };
        document.addEventListener("visibilitychange", onVisibility);

        renderer.setAnimationLoop(() => {
          if (!renderer || cancelled) return;
          const now = performance.now();
          if (!awake) {
            last = now;
            return;
          }
          const raw = Math.max(now - last, 1);
          const dt = Math.min(Math.max(raw / 1000, 1 / 240), 1 / 30);
          last = now;
          clock += dt;

          /* 自适应质量。两级手段，按代价从小到大依次动用：
             1. 先降渲染分辨率（画面变软，但结构和密度不变）
             2. 分辨率已到底还是慢，就减少实际绘制的粒子数
             反过来恢复时顺序相反：先补回粒子，再补回分辨率。         */
          if (now >= sampleFrom) {
            sampleMs += raw;
            sampleN += 1;
            if (now - sampleFrom >= 1800 && sampleN > 20) {
              const avg = sampleMs / sampleN;

              if (avg > 20) {
                // 慢：优先砍分辨率，砍不动了再砍粒子
                if (resScale > RES_FLOOR) {
                  resScale = Math.max(RES_FLOOR, resScale - 0.12);
                  resize();
                } else if (drawFrac > DRAW_FLOOR) {
                  drawFrac = Math.max(DRAW_FLOOR, drawFrac - 0.18);
                  applyDrawFraction();
                }
                goodRuns = 0;
              } else if (avg < 15.5) {
                // 快且有余量：先补粒子，再补分辨率
                goodRuns += 1;
                if (goodRuns >= 2) {
                  if (drawFrac < 1) {
                    drawFrac = Math.min(1, drawFrac + 0.12);
                    applyDrawFraction();
                  } else if (resScale < 1) {
                    resScale = Math.min(1, resScale + 0.1);
                    resize();
                  }
                  goodRuns = 0;
                }
              } else {
                goodRuns = 0;
              }

              sampleFrom = now;
              sampleMs = 0;
              sampleN = 0;
            }
          }

          smoothStage = THREE.MathUtils.damp(
            smoothStage,
            signals.progress.current,
            7.8,
            dt,
          );
          smoothFlow = THREE.MathUtils.damp(
            smoothFlow,
            signals.velocity.current,
            5,
            dt,
          );

          const ptr = signals.pointer.current;
          const viewH =
            2 *
            Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) *
            camera.position.z;
          const viewW = viewH * camera.aspect;
          world.set(ptr.x * viewW * 0.5, ptr.y * viewH * 0.5, 0);

          uStage.value = smoothStage;
          uFlow.value = smoothFlow;
          uPointer.value.copy(world);
          uGrab.value = ptr.active;
          uFocus.value = signals.focus.current;
          uClock.value = clock;
          uStep.value = dt;

          // 相机跟着指针轻微视差
          camera.position.x = THREE.MathUtils.damp(
            camera.position.x,
            0.2 * ptr.x,
            3,
            dt,
          );
          camera.position.y = THREE.MathUtils.damp(
            camera.position.y,
            0.12 * ptr.y,
            3,
            dt,
          );
          camera.lookAt(0, 0, 0);

          renderer.compute(simulate);
          if (post) post.render();
          else renderer.render(scene, camera);
        });

        onStatus({
          phase: "running",
          backend: webgpu ? "WEBGPU" : "WEBGL2",
          particleCount: count,
          detail: budget.label,
        });
      } catch (error) {
        console.error("粒子场初始化失败", error);
        post?.dispose();
        post = null;
        if (renderer) {
          renderer.setAnimationLoop(null);
          renderer.dispose();
          renderer = null;
        }
        if (!cancelled) {
          onStatus({
            phase: "failed",
            backend: "STATIC",
            particleCount: 0,
            detail: "渲染器不可用",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (onVisibility) {
        document.removeEventListener("visibilitychange", onVisibility);
      }
      post?.dispose();
      if (renderer) {
        renderer.setAnimationLoop(null);
        renderer.dispose();
      }
    };
  }, [signals, chapterCount, onStatus]);

  return <canvas ref={canvasRef} className="flux__canvas" aria-hidden="true" />;
}
