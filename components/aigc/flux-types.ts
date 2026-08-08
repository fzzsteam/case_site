/** 六种最新粒子形态，同时决定章节的强调色。 */
export type FluxState =
  | "letters"
  | "noise"
  | "emerge"
  | "network"
  | "manifold"
  | "wordmark";

export interface FluxChapter {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
  state: FluxState;
}

export type RendererPhase = "idle" | "compiling" | "running" | "failed";

export type RendererBackend = "WEBGPU" | "WEBGL2" | "STATIC";

export interface RendererStatus {
  phase: RendererPhase;
  backend: RendererBackend;
  particleCount: number;
  detail: string;
}

/** 每帧喂给粒子场的实时信号。 */
export interface FluxSignals {
  progress: { current: number };
  velocity: { current: number };
  pointer: { current: { x: number; y: number; active: number } };
  /** 当前详情项焦点，-1 表示没有局部高亮。 */
  focus: { current: number };
}
