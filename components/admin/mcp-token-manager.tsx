"use client";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Copy, Eye, EyeOff, KeyRound, Pencil, Plug, Plus, Trash2 } from "lucide-react";
import { useToast } from "./toast";
import { ConfirmDialog } from "./confirm-dialog";
import { McpConnectDialog } from "./mcp-connect-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type PermissionView = { id: string; name: string; description: string };
type PermissionGroupView = { id: string; name: string; permissions: PermissionView[] };
type McpTokenView = { id: string; name: string; token: string; permissions: string[]; createdAt: string; lastUsedAt: string | null };

function PermissionSelector({
  groups,
  selected,
  onChange,
  disabled = false,
}: {
  groups: PermissionGroupView[];
  selected: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleGroup(group: PermissionGroupView) {
    const ids = group.permissions.map((permission) => permission.id);
    const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id));
    onChange(allSelected ? selected.filter((id) => !ids.includes(id)) : [...new Set([...selected, ...ids])]);
  }

  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const ids = group.permissions.map((permission) => permission.id);
        const selectedCount = ids.filter((id) => selected.includes(id)).length;
        const allSelected = ids.length > 0 && selectedCount === ids.length;
        const isExpanded = expanded.has(group.id);
        return (
          <section key={group.id} className="rounded-md border border-border">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(element) => { if (element) element.indeterminate = selectedCount > 0 && !allSelected; }}
                  onChange={() => toggleGroup(group)}
                  disabled={disabled}
                  className="size-4 accent-primary"
                />
                <span>{group.name}</span>
                <span className="text-xs font-normal text-muted-foreground">{selectedCount}/{ids.length}</span>
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title={isExpanded ? "收起权限组" : "展开权限组"}
                onClick={() => setExpanded((current) => {
                  const next = new Set(current);
                  if (next.has(group.id)) next.delete(group.id);
                  else next.add(group.id);
                  return next;
                })}
                aria-expanded={isExpanded}
              >
                {isExpanded ? "收起" : "展开"}
                <ChevronDown size={14} className={isExpanded ? "rotate-180" : ""} />
              </Button>
            </div>
            {isExpanded && (
              <div className="grid gap-x-5 gap-y-2 border-t border-border bg-secondary/20 px-3 py-3 sm:grid-cols-2">
                {group.permissions.map((permission) => (
                  <label key={permission.id} className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={selected.includes(permission.id)}
                      onChange={() => onChange(selected.includes(permission.id) ? selected.filter((id) => id !== permission.id) : [...selected, permission.id])}
                      disabled={disabled}
                      className="mt-0.5 size-4 shrink-0 accent-primary"
                    />
                    <span className="min-w-0">
                      <span className="block">{permission.name}</span>
                      <span className="block text-xs text-muted-foreground">{permission.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function maskToken(token: string): string {
  return `${token.slice(0, 12)}${"•".repeat(12)}${token.slice(-4)}`;
}

function formatTime(value: string | null): string {
  if (!value) return "从未使用";
  return new Date(value).toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function permissionCount(token: McpTokenView, groups: PermissionGroupView[]): number {
  const permissions = token.permissions.filter((permission) => permission !== "wechat.*");
  if (token.permissions.includes("wechat.*")) {
    permissions.push(...(groups.find((group) => group.id === "wechat")?.permissions.map((permission) => permission.id) ?? []));
  }
  return new Set(permissions).size;
}

export function McpTokenManager() {
  const { showToast } = useToast();
  const [tokens, setTokens] = useState<McpTokenView[] | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroupView[]>([]);
  const [creating, setCreating] = useState(false);
  const [editingToken, setEditingToken] = useState<McpTokenView | null>(null);
  const [editName, setEditName] = useState("");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<McpTokenView | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [connectTarget, setConnectTarget] = useState<McpTokenView | null>(null);
  const [siteUrl, setSiteUrl] = useState(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  const createDialogRef = useRef<HTMLDialogElement>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!siteUrl) setSiteUrl(window.location.origin);
  }, [siteUrl]);

  useEffect(() => {
    const dialog = createDialogRef.current;
    if (!dialog) return;
    if (createDialogOpen && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLInputElement>("input")?.focus();
    }
    if (!createDialogOpen && dialog.open) dialog.close();
  }, [createDialogOpen]);

  useEffect(() => {
    const dialog = editDialogRef.current;
    if (!dialog) return;
    if (editingToken && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLInputElement>("input")?.focus();
    }
    if (!editingToken && dialog.open) dialog.close();
  }, [editingToken]);

  useEffect(() => {
    fetch("/api/admin/mcp-tokens")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        setTokens(data.tokens);
        setPermissionGroups(data.permissionGroups ?? []);
      })
      .catch(() => showToast("error", "加载 Token 列表失败"));
  }, [showToast]);

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
      const response = await fetch("/api/admin/mcp-tokens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, permissions: newPermissions }) });
      if (!response.ok) throw new Error();
      const { token } = (await response.json()) as { token: McpTokenView };
      setTokens((current) => (current ? [token, ...current] : [token]));
      setRevealed((current) => new Set(current).add(token.id));
      setNewName("");
      setNewPermissions([]);
      setCreateDialogOpen(false);
      showToast("success", "Token 已创建");
    } catch {
      showToast("error", "创建失败，请重试");
    } finally {
      setCreating(false);
    }
  }

  function beginEditToken(token: McpTokenView) {
    setEditName(token.name);
    setEditingToken(token);
    const legacyWechatPermissions = token.permissions.includes("wechat.*")
      ? permissionGroups.find((group) => group.id === "wechat")?.permissions.map((permission) => permission.id) ?? []
      : [];
    setEditPermissions([...new Set([...legacyWechatPermissions, ...token.permissions.filter((permission) => permission !== "wechat.*")])]);
  }

  function openCreateDialog() {
    setNewName("");
    setNewPermissions([]);
    setCreateDialogOpen(true);
  }

  async function saveToken() {
    if (!editingToken) return;
    const name = editName.trim();
    if (!name) return;
    setSavingPermissions(true);
    try {
      const permissions = [...new Set(editPermissions)];
      const response = await fetch(`/api/admin/mcp-tokens/${editingToken.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, permissions }),
      });
      if (!response.ok) throw new Error();
      setTokens((current) => current?.map((token) => token.id === editingToken.id ? { ...token, name, permissions } : token) ?? current);
      setEditingToken(null);
      showToast("success", "Token 信息已更新");
    } catch {
      showToast("error", "Token 更新失败，请重试");
    } finally {
      setSavingPermissions(false);
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">MCP Token</h1>
          <p className="mt-1 text-sm text-muted-foreground">Agent 通过 MCP 操作公众号或案例的访问凭证；每个 Token 只能调用勾选授权的工具。</p>
        </div>
        <Button type="button" onClick={openCreateDialog}>
          <Plus size={16} />
          新建 Token
        </Button>
      </div>

      <Card className="mb-5 bg-accent/40 p-4">
        <p className="text-sm font-medium text-foreground">怎么接入</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          新建一个 Token，点右侧的 <Plug size={13} className="inline align-[-2px]" /> 打开接入指南，里面按客户端分好了类（Claude Code、Cursor、Cherry Studio、VS Code、图形界面手填等），地址和凭证都已填好，复制粘贴即可。
        </p>
      </Card>

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
                <div className="mt-0.5 flex min-w-0 items-center gap-1">
                  <p className="min-w-0 truncate font-mono text-xs text-muted-foreground">{revealed.has(item.id) ? item.token : maskToken(item.token)}</p>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={revealed.has(item.id) ? "隐藏 Token" : "显示 Token"}
                    title={revealed.has(item.id) ? "隐藏 Token" : "显示 Token"}
                    onClick={() => toggleReveal(item.id)}
                  >
                    {revealed.has(item.id) ? <EyeOff size={15} /> : <Eye size={15} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="复制 Token"
                    title="复制 Token"
                    onClick={() => copy(item.token, `${item.id}-token`, "Token")}
                  >
                    {copiedId === `${item.id}-token` ? <Check size={15} /> : <Copy size={15} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`编辑${item.name}`}
                    title="编辑 Token"
                    onClick={() => beginEditToken(item)}
                  >
                    <Pencil size={15} />
                  </Button>
                </div>
              </div>

              <div className="text-right text-xs text-muted-foreground">
                <p>创建于 {formatTime(item.createdAt)}</p>
                <p className="mt-0.5">最后使用 {formatTime(item.lastUsedAt)}</p>
                <p className="mt-0.5">已授权 {permissionCount(item, permissionGroups)} 项</p>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" aria-label={`查看${item.name}的接入指南`} title="接入指南" onClick={() => setConnectTarget(item)}>
                  <Plug size={15} />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label={`吊销${item.name}`} title="吊销 Token" onClick={() => setPendingDelete(item)}>
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <dialog
        ref={createDialogRef}
        aria-labelledby="mcp-token-create-title"
        onCancel={(event) => { event.preventDefault(); if (!creating) setCreateDialogOpen(false); }}
        onClose={() => setCreateDialogOpen(false)}
        className="m-auto h-[90dvh] w-[94vw] max-w-2xl overflow-hidden rounded-xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <form onSubmit={handleCreate} className="flex h-full min-h-0 flex-col">
          <div className="border-b border-border px-6 py-4">
            <h2 id="mcp-token-create-title" className="text-base font-semibold text-foreground">新建 MCP Token</h2>
            <p className="mt-1 text-sm text-muted-foreground">设置用途备注，并选择 Agent 可调用的工具</p>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div className="space-y-2">
              <label htmlFor="mcp-token-name" className="text-sm font-medium text-foreground">用途备注</label>
              <Input id="mcp-token-name" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="如：我的笔记本" maxLength={50} />
            </div>
            <Card className="p-4">
              <p className="mb-3 text-sm font-medium text-foreground">Token 权限</p>
              {permissionGroups.length > 0 ? (
                <PermissionSelector groups={permissionGroups} selected={newPermissions} onChange={setNewPermissions} disabled={creating} />
              ) : (
                <p className="text-sm text-muted-foreground">加载权限列表中…</p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">勾选权限组会选中组内全部工具；展开后可单独调整。未勾选的工具不会显示给该 Token 对应的 Agent。</p>
              {newPermissions.length === 0 && <p className="mt-2 text-xs text-muted-foreground">至少选择一项权限才能创建 Token。</p>}
            </Card>
          </div>
          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <Button type="button" variant="secondary" onClick={() => setCreateDialogOpen(false)} disabled={creating}>取消</Button>
            <Button type="submit" disabled={creating || !newName.trim() || newPermissions.length === 0 || permissionGroups.length === 0}>
              {creating ? "创建中…" : "创建 Token"}
            </Button>
          </div>
        </form>
      </dialog>

      <dialog
        ref={editDialogRef}
        aria-labelledby="mcp-token-edit-title"
        onCancel={(event) => { event.preventDefault(); if (!savingPermissions) setEditingToken(null); }}
        onClose={() => setEditingToken(null)}
        className="m-auto h-[90dvh] w-[94vw] max-w-2xl overflow-hidden rounded-xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        {editingToken && (
          <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-border px-6 py-4">
              <h2 id="mcp-token-edit-title" className="text-base font-semibold text-foreground">编辑 MCP Token</h2>
              <p className="mt-1 text-sm text-muted-foreground">可修改用途备注和可调用的工具；保存后权限立即生效。</p>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
              <div className="space-y-2">
                <label htmlFor="mcp-token-edit-name" className="text-sm font-medium text-foreground">用途备注</label>
                <Input id="mcp-token-edit-name" value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="如：我的笔记本" maxLength={50} />
              </div>
              <PermissionSelector groups={permissionGroups} selected={editPermissions} onChange={setEditPermissions} disabled={savingPermissions} />
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <Button type="button" variant="secondary" onClick={() => setEditingToken(null)} disabled={savingPermissions}>取消</Button>
              <Button type="button" onClick={saveToken} disabled={savingPermissions || !editName.trim()}>
                {savingPermissions ? "保存中…" : "保存修改"}
              </Button>
            </div>
          </div>
        )}
      </dialog>

      <McpConnectDialog
        open={connectTarget !== null}
        endpoint={`${siteUrl}/api/mcp`}
        token={connectTarget?.token ?? ""}
        tokenName={connectTarget?.name ?? ""}
        onClose={() => setConnectTarget(null)}
      />

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
