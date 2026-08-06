"use client";
import { useEffect, useState } from "react";
import { Check, Copy, Eye, EyeOff, KeyRound, Plus, Terminal, Trash2 } from "lucide-react";
import { useToast } from "./toast";
import { ConfirmDialog } from "./confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type McpTokenView = { id: string; name: string; token: string; createdAt: string; lastUsedAt: string | null };

function maskToken(token: string): string {
  return `${token.slice(0, 12)}${"•".repeat(12)}${token.slice(-4)}`;
}

function formatTime(value: string | null): string {
  if (!value) return "从未使用";
  return new Date(value).toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function McpTokenManager() {
  const { showToast } = useToast();
  const [tokens, setTokens] = useState<McpTokenView[] | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<McpTokenView | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [siteUrl, setSiteUrl] = useState(process.env.NEXT_PUBLIC_SITE_URL ?? "");

  useEffect(() => {
    if (!siteUrl) setSiteUrl(window.location.origin);
  }, [siteUrl]);

  useEffect(() => {
    fetch("/api/admin/mcp-tokens")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setTokens(data.tokens))
      .catch(() => showToast("error", "加载 Token 列表失败"));
  }, [showToast]);

  function buildConnectCommand(token: string): string {
    return `claude mcp add --transport http wechat ${siteUrl}/api/mcp --header "Authorization: Bearer ${token}"`;
  }

  async function copy(text: string, id: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500);
      showToast("success", `${label}已复制`);
    } catch {
      showToast("error", "复制失败，请手动选中复制");
    }
  }

  function toggleReveal(id: string) {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const response = await fetch("/api/admin/mcp-tokens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (!response.ok) throw new Error();
      const { token } = (await response.json()) as { token: McpTokenView };
      setTokens((current) => (current ? [token, ...current] : [token]));
      setRevealed((current) => new Set(current).add(token.id));
      setNewName("");
      showToast("success", "Token 已创建");
    } catch {
      showToast("error", "创建失败，请重试");
    } finally {
      setCreating(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/mcp-tokens/${pendingDelete.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setTokens((current) => (current ? current.filter((item) => item.id !== pendingDelete.id) : current));
      showToast("success", "Token 已吊销");
    } catch {
      showToast("error", "吊销失败，请重试");
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">MCP Token</h1>
        <p className="mt-1 text-sm text-muted-foreground">用于 agent 通过 MCP 发布公众号文章的访问凭证，泄露等同于交出公众号发布权</p>
      </div>

      <Card className="mb-5 bg-accent/40 p-4">
        <p className="text-sm font-medium text-foreground">怎么接入</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          新建一个 Token，点右侧的 <Terminal size={13} className="inline align-[-2px]" /> 复制完整接入命令，粘贴到本地终端执行即可。之后在 Claude Code 里用 <code className="rounded bg-secondary px-1 py-0.5 text-xs">/mcp</code> 确认连接成功。
        </p>
      </Card>

      <form onSubmit={handleCreate} className="mb-4 flex gap-2">
        <Input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="用途备注，如「我的笔记本」" className="max-w-xs" maxLength={50} />
        <Button type="submit" disabled={creating || !newName.trim()}>
          <Plus size={16} />
          新建 Token
        </Button>
      </form>

      {tokens === null && (
        <Card className="divide-y divide-border">
          {[0, 1].map((index) => (
            <div key={index} className="flex items-center gap-4 p-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          ))}
        </Card>
      )}

      {tokens !== null && tokens.length === 0 && (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <KeyRound size={22} />
          </div>
          <p className="text-sm text-muted-foreground">还没有 Token，新建一个才能让 agent 连上来</p>
        </Card>
      )}

      {tokens !== null && tokens.length > 0 && (
        <Card className="divide-y divide-border overflow-hidden">
          {tokens.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{revealed.has(item.id) ? item.token : maskToken(item.token)}</p>
              </div>

              <div className="text-right text-xs text-muted-foreground">
                <p>创建于 {formatTime(item.createdAt)}</p>
                <p className="mt-0.5">最后使用 {formatTime(item.lastUsedAt)}</p>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" aria-label={revealed.has(item.id) ? "隐藏 Token" : "显示 Token"} onClick={() => toggleReveal(item.id)}>
                  {revealed.has(item.id) ? <EyeOff size={15} /> : <Eye size={15} />}
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="复制 Token" onClick={() => copy(item.token, `${item.id}-token`, "Token")}>
                  {copiedId === `${item.id}-token` ? <Check size={15} /> : <Copy size={15} />}
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="复制接入命令" onClick={() => copy(buildConnectCommand(item.token), `${item.id}-cmd`, "接入命令")}>
                  {copiedId === `${item.id}-cmd` ? <Check size={15} /> : <Terminal size={15} />}
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label={`吊销${item.name}`} onClick={() => setPendingDelete(item)}>
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="吊销 Token"
        description={pendingDelete ? `确定要吊销「${pendingDelete.name}」吗？正在使用它的 agent 会立即失去访问权限，且无法恢复。` : ""}
        confirmLabel={deleting ? "吊销中…" : "吊销"}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
