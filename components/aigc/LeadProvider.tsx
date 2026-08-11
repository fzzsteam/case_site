'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { EDU_ASSETS, LEAD_COPY, type LeadSource } from './content';
import { IconArrow, IconCheck, IconClose } from './icons';

type LeadCtx = { open: (source: LeadSource) => void };

const Ctx = createContext<LeadCtx | null>(null);

export function useLead() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLead 必须在 LeadProvider 内使用');
  return ctx;
}

export function LeadProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<LeadSource | null>(null);
  const open = useCallback((s: LeadSource) => setSource(s), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {source && <LeadModal source={source} onClose={() => setSource(null)} />}
    </Ctx.Provider>
  );
}

/** 全站统一的 CTA 按钮，点击唤起微信二维码弹窗并带上来源。 */
export function CtaButton({
  source,
  variant = 'acid',
  size,
  children,
  withArrow = true,
}: {
  source: LeadSource;
  variant?: 'acid' | 'ghost';
  size?: 'sm';
  children: ReactNode;
  withArrow?: boolean;
}) {
  const { open } = useLead();
  return (
    <button
      type="button"
      className={`aigc-btn aigc-btn--${variant}${size === 'sm' ? ' aigc-btn--sm' : ''}`}
      onClick={() => open(source)}
    >
      {children}
      {withArrow && variant === 'acid' && <IconArrow />}
    </button>
  );
}

/** 移动端吸底转化条：滚过首屏后出现。 */
export function MobileDock() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const onScroll = () => setOn(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`aigc-dock ${on ? 'is-on' : ''}`}>
      <CtaButton source="openclass" withArrow={false}>
        预约公开课
      </CtaButton>
      <CtaButton source="advisor" variant="ghost">
        1v1 咨询
      </CtaButton>
    </div>
  );
}

function LeadModal({ source, onClose }: { source: LeadSource; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const copy = LEAD_COPY[source];

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="aigc-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="aigc-qr-modal-title"
      aria-describedby="aigc-qr-modal-desc"
      onClick={onClose}
    >
      <div className="aigc-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeRef}
          type="button"
          className="aigc-modal__close"
          onClick={onClose}
          aria-label="关闭二维码弹窗"
        >
          <IconClose />
        </button>

        <div className="aigc-modal__header">
          <span className="aigc-modal__eyebrow">
            <span className="aigc-modal__eyebrow-dot" aria-hidden="true" />
            {copy.eyebrow}
          </span>
          <h3 id="aigc-qr-modal-title" className="aigc-modal__title">
            {copy.title}
          </h3>
          <p id="aigc-qr-modal-desc" className="aigc-modal__desc">
            {copy.desc}
          </p>
        </div>

        <div className="aigc-modal__body">
          <div className="aigc-qr-side">
            <span className="aigc-qr-side__label">WECHAT / SCAN TO CONNECT</span>
            <div className="aigc-qr">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="aigc-qr__image"
                src={EDU_ASSETS.wechatQr}
                alt="添加微信二维码"
                width={282}
                height={278}
              />
            </div>
            <p className="aigc-qr__hint">打开微信扫一扫，添加课程顾问</p>
          </div>

          <div className="aigc-modal__aside">
            <div>
              <p className="aigc-modal__aside-kicker">添加后，你将获得</p>
              <ul className="aigc-modal__benefits">
                {copy.benefits.map((benefit) => (
                  <li className="aigc-modal__benefit" key={benefit}>
                    <span className="aigc-modal__benefit-icon" aria-hidden="true">
                      <IconCheck size={13} />
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="aigc-modal__steps">
              <p className="aigc-modal__steps-label">3 步完成添加</p>
              <ol className="aigc-modal__step-list">
                <li className="aigc-modal__step">
                  <span className="aigc-modal__step-number">01</span>
                  <span className="aigc-modal__step-text">打开微信</span>
                </li>
                <li className="aigc-modal__step">
                  <span className="aigc-modal__step-number">02</span>
                  <span className="aigc-modal__step-text">扫一扫二维码</span>
                </li>
                <li className="aigc-modal__step">
                  <span className="aigc-modal__step-number">03</span>
                  <span className="aigc-modal__step-text">发送你的需求</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <p className="aigc-modal__footnote">
          <span className="aigc-modal__footnote-mark" aria-hidden="true">i</span>
          二维码长期有效，可截图保存后扫码
        </p>
      </div>
    </div>
  );
}
