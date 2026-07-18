"use client";
import { useState } from "react";
import { useToast } from "./toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChangePasswordForm() {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!currentPassword) next.currentPassword = "请填写当前密码";
    if (newPassword.length < 8) next.newPassword = "新密码至少 8 位";
    if (confirmPassword !== newPassword) next.confirmPassword = "两次输入的新密码不一致";
    return next;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (response.status === 401) {
        setErrors({ currentPassword: "当前密码不正确" });
        return;
      }
      if (!response.ok) throw new Error();
      showToast("success", "密码已修改");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      showToast("error", "修改失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>修改密码</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">当前密码</Label>
            <Input id="current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} aria-invalid={Boolean(errors.currentPassword)} />
            {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">新密码</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} aria-invalid={Boolean(errors.newPassword)} />
            {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">确认新密码</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} aria-invalid={Boolean(errors.confirmPassword)} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "保存中…" : "保存"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
