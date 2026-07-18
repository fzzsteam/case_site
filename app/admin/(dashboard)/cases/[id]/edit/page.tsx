import { EditCaseLoader } from "@/components/admin/edit-case-loader";

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditCaseLoader id={id} />;
}
