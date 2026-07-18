import { ChangePasswordForm } from "@/components/admin/change-password-form";

export default function AdminSettingsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">账号设置</h1>
        <p className="mt-1 text-sm text-muted-foreground">管理登录密码</p>
      </div>
      <ChangePasswordForm />
    </>
  );
}
