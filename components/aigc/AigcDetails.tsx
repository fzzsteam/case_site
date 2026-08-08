"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  CASES,
  CASE_STATS,
  ENDORSE_ADVANTAGES,
  ENDORSE_BADGES,
  GAINS,
  JOBS,
  MENTORS,
  MODULES,
  PERSONAS,
  WORKS,
} from "./content";
import { CtaButton } from "./LeadProvider";

interface AigcDetailsProps {
  chapterId: string;
  interactive: boolean;
  focusIndex: number | null;
  onFocusItem: (index: number | null) => void;
}
interface FocusButtonProps {
  index: number;
  interactive: boolean;
  focusIndex: number | null;
  onFocusItem: (index: number | null) => void;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}

function FocusButton({
  index,
  interactive,
  focusIndex,
  onFocusItem,
  className = "",
  children,
  onClick,
  ariaLabel,
}: FocusButtonProps) {
  const setFocus = (value: number | null) => {
    if (interactive) onFocusItem(value);
  };

  return (
    <button
      type="button"
      className={`${className}${focusIndex === index ? " is-focused" : ""}`}
      disabled={!interactive}
      tabIndex={interactive ? 0 : -1}
      aria-label={ariaLabel}
      aria-pressed={interactive ? focusIndex === index : undefined}
      onClick={onClick}
      onPointerEnter={() => setFocus(index)}
      onPointerLeave={() => setFocus(null)}
      onFocus={() => setFocus(index)}
      onBlur={() => setFocus(null)}
    >
      {children}
    </button>
  );
}

function DetailHeader({ label, count }: { label: string; count: string }) {
  return (
    <div className="aigc-detail__header">
      <span>{label}</span>
      <span>{count}</span>
    </div>
  );
}

function TrainingDetails({
  interactive,
  focusIndex,
  onFocusItem,
}: Omit<AigcDetailsProps, "chapterId">) {
  return (
    <div className="aigc-detail aigc-detail--training">
      <DetailHeader label="七大实践模块 / 逐章交付" count="01 / 07" />
      <div className="aigc-module-list">
        {MODULES.map((module, index) => (
          <FocusButton
            key={module.no}
            index={index}
            interactive={interactive}
            focusIndex={focusIndex}
            onFocusItem={onFocusItem}
            className="aigc-module-row"
          >
            <span className="aigc-module-row__no">{module.no}</span>
            <span className="aigc-module-row__copy">
              <strong>{module.title}</strong>
              <small>{module.desc}</small>
            </span>
            <i aria-hidden="true">↗</i>
          </FocusButton>
        ))}
      </div>
    </div>
  );
}

function PathDetails({
  interactive,
  focusIndex,
  onFocusItem,
}: Omit<AigcDetailsProps, "chapterId">) {
  return (
    <div className="aigc-detail aigc-detail--path">
      <DetailHeader label="谁适合 / 完成后带走什么" count="02 / 02" />
      <div className="aigc-persona-grid">
        {PERSONAS.map((persona, index) => (
          <FocusButton
            key={persona.title}
            index={index}
            interactive={interactive}
            focusIndex={focusIndex}
            onFocusItem={onFocusItem}
            className="aigc-persona-card"
          >
            <span className="aigc-card-index">0{index + 1}</span>
            <strong>{persona.title}</strong>
            <small>{persona.desc}</small>
          </FocusButton>
        ))}
      </div>
      <div className="aigc-gain-list">
        {GAINS.map((gain, index) => (
          <FocusButton
            key={gain}
            index={index + PERSONAS.length}
            interactive={interactive}
            focusIndex={focusIndex}
            onFocusItem={onFocusItem}
            className="aigc-gain-row"
          >
            <span>✦</span>
            <span>{gain}</span>
          </FocusButton>
        ))}
      </div>
    </div>
  );
}

function MentorDetails({
  interactive,
  focusIndex,
  onFocusItem,
}: Omit<AigcDetailsProps, "chapterId">) {
  return (
    <div className="aigc-detail aigc-detail--mentors">
      <DetailHeader label="导师阵容 / 实战反馈" count="03 / 03" />
      <div className="aigc-mentor-grid">
        {MENTORS.map((mentor, index) => (
          <FocusButton
            key={mentor.name}
            index={index}
            interactive={interactive}
            focusIndex={focusIndex}
            onFocusItem={onFocusItem}
            className="aigc-mentor-card"
          >
            <span className="aigc-mentor-card__initial">{mentor.initial}</span>
            <span className="aigc-mentor-card__body">
              <strong>{mentor.name}</strong>
              <small>{mentor.role}</small>
              <em>“{mentor.quote}”</em>
            </span>
            <i aria-hidden="true">↗</i>
          </FocusButton>
        ))}
      </div>
      <div className="aigc-detail-note">
        <span>导师标准</span>
        <p>带正在做的项目，不讲脱离商业现场的工具清单。</p>
      </div>
    </div>
  );
}

function WorksDetails({
  interactive,
  focusIndex,
  onFocusItem,
}: Omit<AigcDetailsProps, "chapterId">) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const current = openIndex === null ? null : WORKS[openIndex];

  useEffect(() => {
    if (openIndex === null) return;
    const reel = document.getElementById("aigc-flux");
    const previousOverflow = reel?.style.overflowY;
    if (reel) reel.style.overflowY = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenIndex(null);
      if (event.key === "ArrowRight") {
        setOpenIndex((value) => (value === null ? value : (value + 1) % WORKS.length));
      }
      if (event.key === "ArrowLeft") {
        setOpenIndex((value) =>
          value === null ? value : (value - 1 + WORKS.length) % WORKS.length,
        );
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (reel) reel.style.overflowY = previousOverflow ?? "auto";
    };
  }, [openIndex]);

  return (
    <div className="aigc-detail aigc-detail--works">
      <DetailHeader label="商业命题 / 学员作品" count="04 / 06" />
      <div className="aigc-work-grid">
        {WORKS.map((work, index) => (
          <FocusButton
            key={work.src}
            index={index}
            interactive={interactive}
            focusIndex={focusIndex}
            onFocusItem={onFocusItem}
            className="aigc-work-card"
            onClick={() => setOpenIndex(index)}
            ariaLabel={`放大查看：${work.cat}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={work.src} alt={work.cat} loading="lazy" decoding="async" />
            <span className="aigc-work-card__veil" />
            <span className="aigc-work-card__copy">
              <strong>{work.cat}</strong>
              <small>{work.by}</small>
            </span>
            <span className="aigc-work-card__zoom" aria-hidden="true">+</span>
          </FocusButton>
        ))}
      </div>

      {current && (
        <div className="aigc-lightbox" role="dialog" aria-modal="true" aria-label={`查看作品：${current.cat}`} onClick={() => setOpenIndex(null)}>
          <button type="button" className="aigc-lightbox__close" onClick={() => setOpenIndex(null)} aria-label="关闭作品预览">
            ×
          </button>
          <div className="aigc-lightbox__content" onClick={(event) => event.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.src} alt={current.cat} />
            <p>{current.cat} · {current.by}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function BusinessDetails({
  interactive,
  focusIndex,
  onFocusItem,
}: Omit<AigcDetailsProps, "chapterId">) {
  return (
    <div className="aigc-detail aigc-detail--business">
      <DetailHeader label="就业案例 / 岗位图谱" count="05 / 08" />
      <div className="aigc-stats-row">
        {CASE_STATS.map((stat, index) => (
          <FocusButton
            key={stat.label}
            index={index}
            interactive={interactive}
            focusIndex={focusIndex}
            onFocusItem={onFocusItem}
            className="aigc-stat-card"
          >
            <strong>{stat.to}{stat.suffix}</strong>
            <small>{stat.label}</small>
          </FocusButton>
        ))}
      </div>
      <div className="aigc-case-grid">
        {CASES.map((item, index) => (
          <FocusButton
            key={item.dest}
            index={index + CASE_STATS.length}
            interactive={interactive}
            focusIndex={focusIndex}
            onFocusItem={onFocusItem}
            className="aigc-case-card"
          >
            <span className="aigc-case-card__tags">{item.tags.join(" / ")}</span>
            <strong>{item.dest}</strong>
            <small>“{item.quote}”</small>
          </FocusButton>
        ))}
      </div>
      <div className="aigc-job-list">
        {JOBS.map((job, index) => (
          <FocusButton
            key={job.name}
            index={index + CASE_STATS.length + CASES.length}
            interactive={interactive}
            focusIndex={focusIndex}
            onFocusItem={onFocusItem}
            className="aigc-job-row"
          >
            <span>
              <strong>{job.name}</strong>
              <small>{job.pay} · {job.payLabel}</small>
            </span>
            <i><b style={{ width: job.width }} /></i>
          </FocusButton>
        ))}
      </div>
    </div>
  );
}

function TrustDetails({
  interactive,
  focusIndex,
  onFocusItem,
}: Omit<AigcDetailsProps, "chapterId">) {
  return (
    <div className="aigc-detail aigc-detail--trust">
      <DetailHeader label="品牌背书 / 长期实践" count="06 / 06" />
      <div className="aigc-trust-intro">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/aigc/brand/fangzhi.webp" alt="方直科技" />
        <div>
          <strong>方直科技 300235</strong>
          <span>万象元生 AIGC 商业人才培育项目</span>
        </div>
      </div>
      <div className="aigc-advantage-list">
        {ENDORSE_ADVANTAGES.map((advantage, index) => (
          <FocusButton
            key={advantage}
            index={index}
            interactive={interactive}
            focusIndex={focusIndex}
            onFocusItem={onFocusItem}
            className="aigc-advantage-row"
          >
            <span>✦</span>
            <small>{advantage}</small>
          </FocusButton>
        ))}
      </div>
      <div className="aigc-badge-row">
        {ENDORSE_BADGES.map((badge, index) => (
          <FocusButton
            key={badge.label}
            index={index + ENDORSE_ADVANTAGES.length}
            interactive={interactive}
            focusIndex={focusIndex}
            onFocusItem={onFocusItem}
            className="aigc-badge-chip"
          >
            {badge.label}
          </FocusButton>
        ))}
      </div>
      <div className="aigc-detail__cta-row">
        <CtaButton source="kit" size="sm">免费领取资料</CtaButton>
        <CtaButton source="advisor" variant="ghost" size="sm">1v1 咨询顾问</CtaButton>
      </div>
    </div>
  );
}

export function AigcDetails(props: AigcDetailsProps) {
  switch (props.chapterId) {
    case "training":
      return <TrainingDetails {...props} />;
    case "path":
      return <PathDetails {...props} />;
    case "mentors":
      return <MentorDetails {...props} />;
    case "works":
      return <WorksDetails {...props} />;
    case "business":
      return <BusinessDetails {...props} />;
    case "trust":
      return <TrustDetails {...props} />;
    default:
      return null;
  }
}
