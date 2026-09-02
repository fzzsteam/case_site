'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EDU_ASSETS, NAV_LINKS } from './content';
import { CtaButton } from './LeadProvider';
import { IconClose } from './icons';

const MODULE_LINKS = [
  { href: '/edu#modules', label: '实训体系', key: 'training' },
  { href: '/edu/talent', label: '人才集市', key: 'talent' },
] as const;

export function Nav() {
  const pathname = usePathname();
  const isTalentPage = pathname.startsWith('/edu/talent');
  const isTrainingPage = !isTalentPage && (pathname === '/' || pathname === '/edu' || pathname.startsWith('/edu/'));
  const [stuck, setStuck] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const { visible: courseVisible, active: activeCourse } = useCourseDirectory(isTrainingPage);

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

  const activeModule = isTalentPage ? 'talent' : isTrainingPage ? 'training' : '';
  const showCourseDirectory = isTrainingPage && courseVisible;

  return (
    <>
      <header className={`aigc-nav ${stuck ? 'is-stuck' : ''}`}>
        <div className="aigc-shell">
          <div className="aigc-nav__inner">
            <a className="aigc-nav__brand aigc-nav__brand--lockup" href={isTrainingPage ? '#top' : '/edu'}>
              <span className="aigc-nav__brand-main">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="aigc-nav__brand-lockup"
                  src={EDU_ASSETS.fangzhiLockup}
                  alt="方直智胜"
                />
              </span>
              <span className="aigc-nav__brand-separator" aria-hidden="true">×</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="aigc-nav__partner-logo"
                src={EDU_ASSETS.szfsLogo}
                alt="深圳电影制片厂"
              />
            </a>

            <nav className="aigc-nav__links aigc-nav__links--modules" aria-label="全局模块导航">
              {MODULE_LINKS.map((link) => (
                <a
                  key={link.key}
                  className={`aigc-nav__link ${activeModule === link.key ? 'is-active' : ''}`}
                  href={link.href}
                  aria-current={activeModule === link.key ? 'page' : undefined}
                >
                  {link.label}
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
            aria-label="移动端模块导航"
          >
            {showCourseDirectory && (
              <div className="aigc-nav__mobile-course">
                <span>课程目录</span>
                <nav aria-label="移动端实训课程目录">
                  {NAV_LINKS.map((link) => (
                    <a key={link.id} className={activeCourse === link.id ? 'is-active' : ''} href={`#${link.id}`} onClick={() => setMenuOpen(false)}>
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
            )}
            {MODULE_LINKS.map((link) => (
              <a
                key={link.key}
                className={`aigc-nav__mobile-link ${activeModule === link.key ? 'is-active' : ''}`}
                href={link.href}
                aria-current={activeModule === link.key ? 'page' : undefined}
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

    </>
  );
}

/** 实训页专属目录状态：离开 Hero 后在移动端菜单中显示课程索引。 */
function useCourseDirectory(enabled: boolean) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }

    const hero = document.getElementById('top');
    const updateVisibility = () => {
      const threshold = hero ? hero.getBoundingClientRect().bottom <= 0 : window.scrollY > 80;
      setVisible(threshold);
    };
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);
    return () => {
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setActive('');
      return;
    }

    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(
      (element): element is HTMLElement => Boolean(element),
    );
    if (!sections.length || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (intersecting) setActive(intersecting.target.id);
      },
      { rootMargin: '-24% 0px -62% 0px', threshold: [0, 0.2, 0.55] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [enabled]);

  return { visible, active };
}
