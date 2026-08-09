'use client';

import { useEffect, useState } from 'react';
import { NAV_LINKS } from './content';
import { CtaButton } from './LeadProvider';
import { AIGC_MEDIA, aigcImageUrl } from './media';

export function Nav() {
  const [stuck, setStuck] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string>('');

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
          <a className="aigc-nav__brand" href="#top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={aigcImageUrl(AIGC_MEDIA.brandMarkPath)} alt="" width={26} height={26} />
            万象元生
            <span className="sub">AIGC 商业实践实训</span>
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

          <CtaButton source="openclass" size="sm" withArrow={false}>
            预约公开课
          </CtaButton>
        </div>
      </div>
      <i className="aigc-nav__progress" style={{ ['--p' as string]: `${progress}%` }} />
    </header>
  );
}
