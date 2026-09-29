import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AggregateShell } from '@/components/aigc/aggregate/shell';
import { AggregateTalentDetail } from '@/components/aigc/aggregate/talent';
import { getTalentProfile } from '@/lib/talent/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ talentId: string }> }): Promise<Metadata> {
  const { talentId } = await params;
  const talent = await getTalentProfile(talentId);
  return talent
    ? {
        title: `${talent.name} · 人才档案 · EDU Aggregate`,
        description: talent.intro,
        robots: { index: false, follow: false },
      }
    : { robots: { index: false, follow: false } };
}

export default async function AggregateTalentDetailPage({ params }: { params: Promise<{ talentId: string }> }) {
  const { talentId } = await params;
  const talent = await getTalentProfile(talentId);
  if (!talent) notFound();

  return (
    <AggregateShell active="talent">
      <AggregateTalentDetail talent={talent} />
    </AggregateShell>
  );
}
