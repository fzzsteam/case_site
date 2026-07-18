"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [initialPassword, setInitialPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/initial-password")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { password: string | null }) => setInitialPassword(data.password))
      .catch(() => setInitialPassword(null));
  }, []);

  async function copyInitialPassword() {
    if (!initialPassword) return;
    try {
      await navigator.clipboard.writeText(initialPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, ignore
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error === "Incorrect password" ? "密码不正确" : "登录暂时不可用，请稍后重试");
        return;
      }
      router.push("/admin/cases");
      router.refresh();
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_50%_0%,#eef2ff_0%,#f8fafc_55%)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Lock size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">管理后台</h1>
            <p className="mt-1 text-sm text-muted-foreground">登录以管理案例内容</p>
          </div>
        </div>

        {initialPassword && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">初始密码</p>
            <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2">
              <code className="text-sm tracking-wide">{initialPassword}</code>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="复制初始密码" onClick={copyInitialPassword}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>
            <p className="mt-2 text-xs text-amber-700">登录后请尽快在「账号设置」中修改密码，修改后这里将不再展示。</p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">密码</Label>
              <Input id="admin-password" type="password" autoFocus value={password} onChange={(event) => setPassword(event.target.value)} required aria-invalid={Boolean(error)} />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "登录中…" : "登录"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
