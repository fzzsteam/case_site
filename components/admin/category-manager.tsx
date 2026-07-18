"use client";
import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import type { Category } from "@/lib/cases/types";
import { useToast } from "./toast";
import { ConfirmDialog } from "./confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryManager() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setCategories(data.categories))
      .catch(() => showToast("error", "加载分类列表失败"));
  }, [showToast]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const response = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (response.status === 409) { showToast("error", "该分类已存在"); return; }
      if (!response.ok) throw new Error();
      const { category } = (await response.json()) as { category: Category };
      setCategories((current) => (current ? [...current, category] : [category]));
      setNewName("");
      showToast("success", "分类已创建");
    } catch {
      showToast("error", "创建失败，请重试");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
  }

  async function handleRename(id: string) {
    const name = editingName.trim();
    if (!name) return;
    setSavingEdit(true);
    try {
      const response = await fetch(`/api/admin/categories/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (response.status === 409) { showToast("error", "该分类名称已存在"); return; }
      if (!response.ok) throw new Error();
      setCategories((current) => (current ? current.map((item) => (item.id === id ? { ...item, name } : item)) : current));
      setEditingId(null);
      showToast("success", "分类已更新");
    } catch {
      showToast("error", "更新失败，请重试");
    } finally {
      setSavingEdit(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/categories/${pendingDelete.id}`, { method: "DELETE" });
      if (response.status === 409) { showToast("error", "该分类下还有案例，无法删除"); return; }
      if (!response.ok) throw new Error();
      setCategories((current) => (current ? current.filter((item) => item.id !== pendingDelete.id) : current));
      showToast("success", "分类已删除");
    } catch {
      showToast("error", "删除失败，请重试");
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">分类管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">维护案例分类，删除前需先清空该分类下的案例</p>
      </div>

      <form onSubmit={handleCreate} className="mb-4 flex gap-2">
        <Input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="新分类名称" className="max-w-xs" maxLength={50} />
        <Button type="submit" disabled={creating || !newName.trim()}>
          <Plus size={16} />
          添加分类
        </Button>
      </form>

      {categories === null && (
        <Card className="divide-y divide-border">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex items-center gap-4 p-4">
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </Card>
      )}

      {categories !== null && categories.length === 0 && (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Tags size={22} />
          </div>
          <p className="text-sm text-muted-foreground">还没有分类，先添加一个吧</p>
        </Card>
      )}

      {categories !== null && categories.length > 0 && (
        <Card className="divide-y divide-border overflow-hidden">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-3 px-4 py-3">
              {editingId === category.id ? (
                <>
                  <Input
                    autoFocus
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    maxLength={50}
                    className="h-9 max-w-xs"
                    onKeyDown={(event) => { if (event.key === "Enter") handleRename(category.id); if (event.key === "Escape") setEditingId(null); }}
                  />
                  <Button variant="ghost" size="icon-sm" aria-label="保存" disabled={savingEdit} onClick={() => handleRename(category.id)}>
                    <Check size={15} />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="取消编辑" onClick={() => setEditingId(null)}>
                    <X size={15} />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-foreground">{category.name}</span>
                  <Button variant="ghost" size="icon-sm" aria-label={`重命名${category.name}`} onClick={() => startEdit(category)}>
                    <Pencil size={15} />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label={`删除${category.name}`} onClick={() => setPendingDelete(category)}>
                    <Trash2 size={15} />
                  </Button>
                </>
              )}
            </div>
          ))}
        </Card>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="删除分类"
        description={pendingDelete ? `确定要删除「${pendingDelete.name}」吗？如果该分类下还有案例将无法删除。` : ""}
        confirmLabel={deleting ? "删除中…" : "删除"}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
