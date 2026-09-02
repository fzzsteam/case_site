'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EDU_ASSETS, NAV_LINKS } from './content';
import { CtaButton } from './LeadProvider';
import { IconArrow, IconClose } from './icons';

const HOME_NAV_LINKS = NAV_LINKS.filter((link) => link.id !== 'gains');
const VISUAL_BASE_PATH = '/edu/visual-lab';

export function Nav() {
  const pathname = usePathname();
  const isTrainingPage = pathname === VISUAL_BASE_PATH;
  const isTalentPage = pathname === `${VISUAL_BASE_PATH}/talent`;
  const isTalentDetail = pathname.startsWith(`${VISUAL_BASE_PATH}/talent/`) && !isTalentPage;
  const [stuck, setStuck] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setStuck(window.scrollY > 18);
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setActiveSection('');
  }, [pathname]);

  useEffect(() => {
    if (!isTrainingPage || typeof IntersectionObserver === 'undefined') return;

    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(
      (element): element is HTMLElement => Boolean(element),
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-22% 0px -64% 0px', threshold: [0.05, 0.25, 0.55] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isTrainingPage]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const pageLabel = isTrainingPage
    ? 'TRAINING FIELD / 00'
    : isTalentDetail
      ? 'TALENT ARCHIVE / DETAIL'
      : 'TALENT MARKET / 01';

  return (
    <header className={`aigc-nav${stuck ? ' is-stuck' : ''}`}>
      <div className="aigc-shell">
        <div className="aigc-nav__inner">
          <Link className="aigc-nav__brand" href={VISUAL_BASE_PATH} aria-label="返回方直智胜 EDU 实训首页">
            <span className="aigc-nav__brand-logos" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="aigc-nav__brand-lockup" src={EDU_ASSETS.fangzhiLockup} alt="" />
              <span className="aigc-nav__brand-separator">×</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="aigc-nav__partner-logo" src={EDU_ASSETS.szfsLogo} alt="" />
            </span>
            <span className="aigc-nav__brand-copy">
              <strong>FANGZHI / EDU</strong>
              <small>{pageLabel}</small>
            </span>
          </Link>

          <nav className="aigc-nav__desktop-links" aria-label="主导航">
            {isTrainingPage ? (
              HOME_NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  className={`aigc-nav__link${activeSection === link.id ? ' is-active' : ''}`}
                  href={`#${link.id}`}
                  aria-current={activeSection === link.id ? 'location' : undefined}
                >
                  {link.label}
                </a>
              ))
            ) : (
              <Link className="aigc-nav__link aigc-nav__link--active" href={VISUAL_BASE_PATH}>
                实训现场
              </Link>
            )}
            <Link className={`aigc-nav__link${isTalentPage || isTalentDetail ? ' is-active' : ''}`} href={`${VISUAL_BASE_PATH}/talent`}>
              人才集市
            </Link>
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
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <IconClose size={18} /> : <span className="aigc-nav__menu-lines" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <nav id="aigc-mobile-menu" className={`aigc-nav__mobile-menu${menuOpen ? ' is-open' : ''}`} aria-label="移动端导航">
          <div className="aigc-nav__mobile-label">{pageLabel}</div>
          {isTrainingPage && HOME_NAV_LINKS.map((link, index) => (
            <a
              key={link.id}
              className={`aigc-nav__mobile-link${activeSection === link.id ? ' is-active' : ''}`}
              href={`#${link.id}`}
              onClick={() => setMenuOpen(false)}
            >
              <span><b>{String(index + 1).padStart(2, '0')}</b>{link.label}</span>
              <IconArrow size={16} />
            </a>
          ))}
          {!isTrainingPage && (
            <Link className="aigc-nav__mobile-link" href={VISUAL_BASE_PATH} onClick={() => setMenuOpen(false)}>
              <span><b>00</b>返回实训现场</span>
              <IconArrow size={16} />
            </Link>
          )}
          <Link className={`aigc-nav__mobile-link${isTalentPage || isTalentDetail ? ' is-active' : ''}`} href={`${VISUAL_BASE_PATH}/talent`} onClick={() => setMenuOpen(false)}>
            <span><b>07</b>人才集市</span>
            <IconArrow size={16} />
          </Link>
        </nav>
      </div>
      <i className="aigc-nav__progress" style={{ ['--p' as string]: `${progress}%` }} aria-hidden="true" />
    </header>
  );
}
