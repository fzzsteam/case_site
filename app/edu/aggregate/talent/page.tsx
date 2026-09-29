import type { Metadata } from 'next';
import { AggregateShell } from '@/components/aigc/aggregate/shell';
import { AggregateTalentMarket } from '@/components/aigc/aggregate/talent';
import { listTalentProfiles } from '@/lib/talent/queries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '人才集市 · EDU Aggregate',
  description: '浏览完成 AIGC 实训的创作者，按能力和作品找到下一次合作。',
  robots: { index: false, follow: false },
};

export default async function AggregateTalentPage() {
  const talents = await listTalentProfiles();
  return (
    <AggregateShell active="talent">
      <AggregateTalentMarket talents={talents} />
    </AggregateShell>
  );
}
