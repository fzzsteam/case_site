import type { Metadata } from 'next';
import './aggregate.css';
import './sections.css';
import './talent.css';

export const metadata: Metadata = {
  title: '方直智胜 × 深圳电影制片厂 · AIGC 商业实训',
  description: '方直智胜 × 深圳电影制片厂，31 天线下 AIGC 影视内容商业实训营。',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AggregateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
