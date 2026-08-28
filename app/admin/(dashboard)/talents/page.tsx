import { TalentReadonlyList } from "@/components/admin/talent-readonly-list";
import { listTalentProfiles } from "@/lib/talent/queries";

export const metadata = { title: "人才集市 · 管理后台" };
export const dynamic = "force-dynamic";

export default async function TalentAdminPage() {
  const talents = await listTalentProfiles();
  return <TalentReadonlyList talents={talents} localStaticPreview={process.env.NODE_ENV !== "production"} />;
}
