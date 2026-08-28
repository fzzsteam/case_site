import { TalentReadonlyList } from "@/components/admin/talent-readonly-list";

export const metadata = { title: "人才集市 · 管理后台" };

export default function TalentAdminPage() {
  return <TalentReadonlyList localStaticPreview={process.env.NODE_ENV !== "production"} />;
}
