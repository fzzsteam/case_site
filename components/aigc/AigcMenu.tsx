"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { FluxChapter } from "./flux-types";
import { useLead } from "./LeadProvider";

interface AigcMenuProps {
  chapters: FluxChapter[];
  activeIndex: number;
  goTo: (index: number) => void;
}
export function AigcMenu({ chapters, activeIndex, goTo }: AigcMenuProps) {
  const { open: openLead } = useLead();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => firstItemRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href]",
        ),
      );
      if (focusable.length === 0) return;

      const current = focusable.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey
        ? current <= 0
          ? focusable.length - 1
          : current - 1
        : current === focusable.length - 1
          ? 0
          : current + 1;
      event.preventDefault();
      focusable[next].focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [close, open]);

  const chooseChapter = (index: number) => {
    goTo(index);
    close();
  };

  return (
    <div className={`aigc-menu${open ? " aigc-menu--open" : ""}`}>
      <span className="aigc-menu__label" aria-hidden="true">
        {open ? "关闭" : "菜单"}
      </span>
      <button
        ref={triggerRef}
        className="aigc-menu__trigger"
        type="button"
        aria-label={open ? "关闭菜单" : "打开菜单"}
        aria-expanded={open}
        aria-controls="aigc-menu-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="aigc-menu__bars" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>

      <div
        id="aigc-menu-panel"
        className="aigc-menu__overlay"
        aria-hidden={!open}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div ref={panelRef} className="aigc-menu__panel" role="dialog" aria-modal="true" aria-label="万象元生页面菜单">
          <div className="aigc-menu__meta">
            <span>// 页面导航</span>
            <span>万象元生 / 2026</span>
          </div>

          <nav className="aigc-menu__list" aria-label="章节导航">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                ref={index === 0 ? firstItemRef : undefined}
                className={`aigc-menu__item${index === activeIndex ? " is-current" : ""}`}
                type="button"
                tabIndex={open ? 0 : -1}
                onClick={() => chooseChapter(index)}
              >
                <span className="aigc-menu__item-index">{chapter.index}</span>
                <span className="aigc-menu__item-copy">
                  <strong>{chapter.title}</strong>
                  <small>{chapter.eyebrow}</small>
                </span>
                <span className="aigc-menu__item-state" aria-hidden="true">
                  {index === activeIndex ? "当前" : "进入"}
                  <i>↗</i>
                </span>
              </button>
            ))}
          </nav>

          <div className="aigc-menu__actions">
            <button
              type="button"
              className="aigc-menu__lead"
              tabIndex={open ? 0 : -1}
              onClick={() => {
                openLead("advisor");
                close();
              }}
            >
              1v1 咨询顾问 <span>↗</span>
            </button>
            <a href="/privacy" tabIndex={open ? 0 : -1}>
              隐私政策
            </a>
          </div>

          <div className="aigc-menu__footer" aria-hidden="true">
            <span>AIGC 商业实践实训</span>
            <span>深圳 / 在线</span>
          </div>
        </div>
      </div>
    </div>
  );
}
