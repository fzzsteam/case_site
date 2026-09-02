import type { ReactNode } from 'react';
import { Atmosphere, SiteFooter } from './sections';
import { LeadProvider, MobileDock } from './LeadProvider';
import { Nav } from './Nav';

/**
 * Edu 对外页面共用的品牌壳层。
 * 实训页与人才集市共用同一套氛围层、顶栏、转化弹窗和页脚，
 * 页面内容只负责自己的主视觉与信息区块。
 */
export function EduShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`aigc-visual-root ${className}`.trim()}>
      <LeadProvider>
        <a className="aigc-skip-link" href="#main-content">
          跳到主要内容
        </a>
        <Atmosphere />
        <Nav />
        {children}
        <SiteFooter />
        <MobileDock />
      </LeadProvider>
    </div>
  );
}
