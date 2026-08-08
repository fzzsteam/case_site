"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { AigcDetails } from "./AigcDetails";
import { AigcMenu } from "./AigcMenu";
import { AIGC_CHAPTERS, AIGC_SITE, STATE_COLORS } from "./flux-content";
import type { FluxSignals, RendererStatus } from "./flux-types";
import { CtaButton } from "./LeadProvider";

const FluxField = dynamic(() => import("./FluxField"), { ssr: false });

const BOOT: RendererStatus = {
  phase: "idle",
  backend: "WEBGPU",
  particleCount: 0,
  detail: "准备中",
};

const SPAN_PER_CHAPTER = 80;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function quantise(value: number, max: number) {
  const base = Math.floor(value);
  const fraction = value - base;
  if (fraction <= 0.06) return base;
  if (fraction >= 0.94) return Math.min(base + 1, max);
  return value;
}

function useMotionAllowed() {
  const [state, setState] = useState<"unknown" | "no" | "yes">("unknown");

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const navigatorWithConnection = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };
    const sync = () =>
      setState(
        media.matches || navigatorWithConnection.connection?.saveData === true
          ? "no"
          : "yes",
      );
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return state;
}

function useFluxScroll(total: number, paused: boolean) {
  const host = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const velocity = useRef(0);
  const pointer = useRef({ x: 0, y: 0, active: 0 });
  const focus = useRef(-1);
  const previous = useRef(0);
  const timestamp = useRef(0);
  const seenIndex = useRef(0);
  const range = useRef(1);
  const [scrolledIndex, setScrolledIndex] = useState(0);

  const index = paused ? 0 : scrolledIndex;

  const remeasure = useCallback(() => {
    const element = host.current;
    if (element) {
      range.current = Math.max(1, element.scrollHeight - element.clientHeight);
    }
  }, []);

  useEffect(() => {
    if (paused) {
      const element = host.current;
      if (element) {
        element.scrollTop = 0;
        element.style.setProperty("--progress", "0");
        element.removeAttribute("data-moved");
      }
      progress.current = 0;
      velocity.current = 0;
      focus.current = -1;
      previous.current = 0;
      seenIndex.current = 0;
      return;
    }

    let frame = 0;
    let resizeObserver: ResizeObserver | null = null;
    timestamp.current = performance.now();
    remeasure();

    const element = host.current;
    if (element) {
      resizeObserver = new ResizeObserver(remeasure);
      resizeObserver.observe(element);
      window.addEventListener("resize", remeasure, { passive: true });
    }

    const tick = (now: number) => {
      const node = host.current;
      if (node) {
        const segments = total - 1;
        const ratio = clamp(node.scrollTop / range.current, 0, 1);
        const position = quantise(ratio * segments, segments);
        const delta = Math.max((now - timestamp.current) / 1000, 1 / 120);
        const instantVelocity = clamp(
          (position - previous.current) / delta,
          -8,
          8,
        );

        progress.current = position;
        velocity.current += (instantVelocity - velocity.current) * 0.19;
        velocity.current *= 0.9;
        previous.current = position;
        timestamp.current = now;

        node.style.setProperty(
          "--progress",
          (position / Math.max(1, segments)).toFixed(4),
        );
        if (position > 0.2) node.dataset.moved = "true";
        else node.removeAttribute("data-moved");

        const nextIndex = clamp(Math.round(position), 0, total - 1);
        if (nextIndex !== seenIndex.current) {
          seenIndex.current = nextIndex;
          setScrolledIndex(nextIndex);
        }
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", remeasure);
    };
  }, [paused, remeasure, total]);

  useEffect(() => {
    if (paused) {
      pointer.current.active = 0;
      return;
    }

    const move = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2) + 1;
      pointer.current.active = event.pointerType === "touch" ? 0.6 : 1;
    };
    const leave = () => {
      pointer.current.active = 0;
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [paused]);

  const goTo = useCallback(
    (target: number) => {
      const node = host.current;
      if (!node) return;
      remeasure();
      const ratio = clamp(target / Math.max(1, total - 1), 0, 1);
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      node.scrollTo({
        top: range.current * ratio,
        behavior: reduce ? "auto" : "smooth",
      });
    },
    [remeasure, total],
  );

  const signals: FluxSignals = useMemo(
    () => ({ progress, velocity, pointer, focus }),
    [],
  );

  return { host, signals, index, goTo };
}

export function FluxReel() {
  const motion = useMotionAllowed();
  const [rendererFailed, setRendererFailed] = useState(false);
  const [status, setStatus] = useState<RendererStatus>(BOOT);
  const [focusedItem, setFocusedItem] = useState<number | null>(null);

  const plain = motion === "no" || rendererFailed;
  const live = motion === "yes" && !rendererFailed;
  const { host, signals, index, goTo } = useFluxScroll(AIGC_CHAPTERS.length, !live);
  const current = AIGC_CHAPTERS[index];
  const accent = STATE_COLORS[current.state];
  const booting =
    !plain &&
    (motion === "unknown" || status.phase === "idle" || status.phase === "compiling");
  const trackHeight = `${100 + (AIGC_CHAPTERS.length - 1) * SPAN_PER_CHAPTER}dvh`;

  useEffect(() => {
    signals.focus.current = -1;
    setFocusedItem(null);
  }, [index, signals]);

  const handleStatus = useCallback((next: RendererStatus) => {
    if (next.phase === "failed") setRendererFailed(true);
    setStatus(next);
  }, []);

  const focusItem = (value: number | null) => {
    signals.focus.current = value ?? -1;
    setFocusedItem(value);
  };

  return (
    <main
      ref={host}
      id="aigc-flux"
      className={`flux${plain ? " flux--plain" : ""}`}
      style={{ "--accent": accent } as CSSProperties}
      data-state={current.state}
      tabIndex={plain ? undefined : 0}
      aria-label={plain ? undefined : "万象元生 AIGC 实训章节"}
    >
      <AigcMenu chapters={AIGC_CHAPTERS} activeIndex={index} goTo={goTo} />

      <div className="flux__track" style={plain ? undefined : { height: trackHeight }}>
        <div className="flux__snaps" aria-hidden="true">
          {AIGC_CHAPTERS.map((chapter, chapterIndex) => (
            <span
              key={chapter.id}
              style={{ top: `${SPAN_PER_CHAPTER * chapterIndex}dvh` }}
            />
          ))}
        </div>

        <div className="flux__stage">
          <div className="flux__canvas-wrap" aria-hidden="true">
            {live && (
              <FluxField
                signals={signals}
                chapterCount={AIGC_CHAPTERS.length}
                onStatus={handleStatus}
              />
            )}
            <div className="flux__bloom" />
            <div className="flux__scanlines" />
            <div className="flux__edge" />
          </div>

          <div className={`flux__boot${booting ? "" : " flux__boot--done"}`} aria-hidden={!booting}>
            <span className="flux__boot-mark" />
            <span>正在分配粒子场</span>
          </div>

          <header className="flux__topbar">
            <div className="flux__identity">
              <span className="flux__sigil">{AIGC_SITE.initials}</span>
              <span>{AIGC_SITE.name} / {AIGC_SITE.role}</span>
            </div>
            <div className="flux__telemetry-top">
              <span className="flux__pulse" />
              <span>
                {status.backend === "STATIC" ? "静态模式" : `${status.backend} / TSL`}
              </span>
            </div>
          </header>

          <div className="flux__chapters">
            {AIGC_CHAPTERS.map((chapter, chapterIndex) => {
              const active = chapterIndex === index;
              const style = {
                "--chapter-opacity": active ? 1 : 0,
                "--chapter-shift": active
                  ? "0px"
                  : `${chapterIndex < index ? -20 : 20}px`,
                "--chapter-blur": active ? "0px" : "4px",
              } as CSSProperties;

              return (
                <article
                  key={chapter.id}
                  className={`flux__chapter${active ? " flux__chapter--active" : ""}`}
                  style={style}
                  aria-hidden={!active}
                >
                  <div className="flux__chapter-copy">
                    <div className="flux__eyebrow">
                      <span>{chapter.index}</span>
                      <span>{chapter.eyebrow}</span>
                    </div>
                    <h2 className="flux__title">{chapter.title}</h2>
                    <p className="flux__body">{chapter.description}</p>
                    <div className="flux__actions">
                      {chapterIndex < AIGC_CHAPTERS.length - 1 ? (
                        <button
                          className="flux__cta"
                          type="button"
                          tabIndex={active ? 0 : -1}
                          onClick={() => goTo(chapterIndex + 1)}
                        >
                          {chapterIndex === 0 ? "进入实训体系" : "继续向下"}
                          <i aria-hidden="true">↓</i>
                        </button>
                      ) : (
                        <CtaButton
                          source="openclass"
                          tabIndex={active ? 0 : -1}
                          disabled={!active}
                        >
                          预约免费公开课
                        </CtaButton>
                      )}
                    </div>
                  </div>

                  <div className="flux__details" aria-label={`${chapter.title}详情`}>
                    <AigcDetails
                      chapterId={chapter.id}
                      interactive={active}
                      focusIndex={active ? focusedItem : null}
                      onFocusItem={focusItem}
                    />
                  </div>
                </article>
              );
            })}
          </div>

          <nav className="flux__rail" aria-label="章节导航">
            {AIGC_CHAPTERS.map((chapter, chapterIndex) => (
              <button
                key={chapter.id}
                className={`flux__rail-dot${chapterIndex === index ? " flux__rail-dot--current" : ""}${index >= chapterIndex ? " flux__rail-dot--seen" : ""}`}
                type="button"
                onClick={() => goTo(chapterIndex)}
                aria-label={`跳到${chapter.title}`}
                aria-current={chapterIndex === index ? "step" : undefined}
              >
                <span />
              </button>
            ))}
          </nav>

          <div className="flux__telemetry" aria-hidden="true">
            <span>{current.meta}</span>
            <span>
              {status.particleCount > 0
                ? `${status.particleCount.toLocaleString("zh-CN")} 个粒子 · ${status.detail}`
                : status.detail}
            </span>
          </div>

          <div className="flux__progress" aria-hidden="true"><span /></div>
          <div className="flux__hint" aria-hidden="true">
            <span>滚动 · 移动鼠标扰动</span>
            <i />
          </div>
        </div>
      </div>

      <section className="flux__plain-list" aria-label="章节列表">
        <div className="flux__plain-head">
          <span>{AIGC_SITE.role}</span>
          <h1>{AIGC_SITE.name}</h1>
          <p>{AIGC_SITE.description}</p>
        </div>
        {AIGC_CHAPTERS.map((chapter) => (
          <article className="flux__plain-row" key={chapter.id}>
            <div>
              <span>{chapter.index}</span>
              <span>{chapter.meta}</span>
            </div>
            <h2>{chapter.title}</h2>
            <p>{chapter.description}</p>
            <AigcDetails
              chapterId={chapter.id}
              interactive
              focusIndex={null}
              onFocusItem={() => undefined}
            />
          </article>
        ))}
      </section>
    </main>
  );
}
