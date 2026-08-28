import type { Metadata } from "next";
import { EduShell } from "@/components/aigc/EduShell";
import { TalentMarket } from "@/components/talent/talent-market";
import { listTalentProfiles } from "@/lib/talent/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "人才集市",
  description: "浏览学员人才与 AIGC 视觉案例，查看作品集站点并连接真实项目合作。",
};

export default async function TalentMarketPage() {
  const talents = await listTalentProfiles();
  return (
    <EduShell className="aigc-talent-root">
      <TalentMarket talents={talents} />
    </EduShell>
  );
}
