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
import { QRCodeSVG } from 'qrcode.react';
import { LEAD_COPY, type LeadSource } from './content';
import { IconArrow, IconCheck, IconClose } from './icons';

/** 顾问二维码占位值，上线前替换为真实企微/个人号活码。 */
const MOCK_QR_VALUE = 'https://example.com/wxys-advisor-placeholder';

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

/** 全站统一的 CTA 按钮，点击唤起留资弹窗并带上来源。 */
export function CtaButton({
  source,
  variant = 'acid',
  size,
  children,
  withArrow = true,
  tabIndex,
  disabled,
  className = '',
}: {
  source: LeadSource;
  variant?: 'acid' | 'ghost';
  size?: 'sm';
  children: ReactNode;
  withArrow?: boolean;
  tabIndex?: number;
  disabled?: boolean;
  className?: string;
}) {
  const { open } = useLead();
  return (
    <button
      type="button"
      className={`aigc-btn aigc-btn--${variant}${size === 'sm' ? ' aigc-btn--sm' : ''}${className ? ` ${className}` : ''}`}
      onClick={() => open(source)}
      tabIndex={tabIndex}
      disabled={disabled}
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
    const reel = document.getElementById('aigc-flux');
    const sync = () => {
      setOn(
        window.scrollY > window.innerHeight * 0.85 ||
          Boolean(reel && reel.scrollTop > reel.clientHeight * 0.2),
      );
    };
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    reel?.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    return () => {
      window.removeEventListener('scroll', sync);
      reel?.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState('');
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const copy = LEAD_COPY[source];

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');

    if (name.trim().length < 2) return setErr('请填写你的称呼（至少 2 个字）');
    if (!/^1[3-9]\d{9}$/.test(phone.trim())) return setErr('请填写正确的 11 位手机号');
    if (!consent) return setErr('请先阅读并同意隐私政策');

    setPending(true);
    try {
      const res = await fetch('/api/aigc/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), source }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || '提交失败，请稍后重试');
      }
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : '提交失败，请稍后重试');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="aigc-modal" role="dialog" aria-modal="true" aria-label={copy.title} onMouseDown={onClose}>
      <div className="aigc-modal__panel" onMouseDown={(e) => e.stopPropagation()}>
        <button type="button" className="aigc-modal__close" onClick={onClose} aria-label="关闭">
          <IconClose />
        </button>

        {done ? (
          <div className="aigc-modal__ok">
            <div className="aigc-tickpop">
              <IconCheck size={26} />
            </div>
            <h3 className="aigc-modal__title" style={{ marginTop: 16 }}>
              已收到，课程顾问会尽快联系你
            </h3>
            <p className="aigc-modal__desc">扫码添加顾问，可立即获取实训大纲与学习规划。</p>
            <div className="aigc-qr">
              <QRCodeSVG value={MOCK_QR_VALUE} size={166} level="M" marginSize={0} />
            </div>
            <p style={{ marginTop: 12, fontSize: 11.5, color: 'var(--fg-3)' }}>
              示意二维码 · 上线前替换为真实顾问活码
            </p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h3 className="aigc-modal__title">{copy.title}</h3>
            <p className="aigc-modal__desc">{copy.desc}</p>

            <div className="aigc-field">
              <label className="aigc-field__label" htmlFor="aigc-name">
                你的称呼
              </label>
              <input
                id="aigc-name"
                ref={nameRef}
                className="aigc-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入姓名"
                maxLength={20}
                autoComplete="name"
              />
            </div>

            <div className="aigc-field">
              <label className="aigc-field__label" htmlFor="aigc-phone">
                手机号
              </label>
              <input
                id="aigc-phone"
                className="aigc-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="用于课程顾问与你联系"
                inputMode="numeric"
                autoComplete="tel"
              />
            </div>

            <label className="aigc-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                我已阅读并同意
                <a href="/privacy" target="_blank" rel="noreferrer">
                  《隐私政策》
                </a>
                ，同意万象元生课程顾问与我联系。
              </span>
            </label>

            {err && <p className="aigc-modal__err">{err}</p>}

            <button
              type="submit"
              className="aigc-btn aigc-btn--acid"
              style={{ width: '100%', marginTop: 20 }}
              disabled={pending}
            >
              {pending ? '提交中…' : '提交并获取资料'}
              {!pending && <IconArrow />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
