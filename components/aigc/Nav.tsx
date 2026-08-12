'use client';

import { useEffect, useState } from 'react';
import { EDU_ASSETS, NAV_LINKS } from './content';
import { CtaButton } from './LeadProvider';
import { IconClose } from './icons';

export function Nav() {
  const [stuck, setStuck] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setStuck(y > 24);
      setProgress(max > 0 ? (y / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!sections.length || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.6] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <header className={`aigc-nav ${stuck ? 'is-stuck' : ''}`}>
      <div className="aigc-shell">
        <div className="aigc-nav__inner">
          <a className="aigc-nav__brand aigc-nav__brand--lockup" href="#top">
            <span className="aigc-nav__brand-main">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="aigc-nav__brand-logo"
                src="/edu/fangzhi-zhisheng-logo.png"
                alt=""
              />
              <span>方直智胜</span>
            </span>
            <span className="aigc-nav__brand-separator" aria-hidden="true">×</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="aigc-nav__partner-logo"
              src={EDU_ASSETS.szfsLogo}
              alt="深圳电影制片厂"
            />
          </a>

          <nav className="aigc-nav__links">
            {NAV_LINKS.map((l) => (
              <a
                key={l.id}
                className={`aigc-nav__link ${active === l.id ? 'is-active' : ''}`}
                href={`#${l.id}`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="aigc-nav__actions">
            <CtaButton source="openclass" size="sm" withArrow={false}>
              预约公开课
            </CtaButton>
            <button
              type="button"
              className={`aigc-nav__menu-toggle${menuOpen ? ' is-open' : ''}`}
              aria-expanded={menuOpen}
              aria-controls="aigc-mobile-menu"
              aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <IconClose size={19} /> : <span className="aigc-nav__menu-lines" aria-hidden />}
            </button>
          </div>
        </div>

        <nav
          id="aigc-mobile-menu"
          className={`aigc-nav__mobile-menu${menuOpen ? ' is-open' : ''}`}
          aria-label="移动端导航"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              className={`aigc-nav__mobile-link ${active === link.id ? 'is-active' : ''}`}
              href={`#${link.id}`}
              onClick={() => setMenuOpen(false)}
            >
              <span>{link.label}</span>
              <span aria-hidden>↗</span>
            </a>
          ))}
        </nav>
      </div>
      <i className="aigc-nav__progress" style={{ ['--p' as string]: `${progress}%` }} />
    </header>
  );
}
