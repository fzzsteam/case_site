"use client";
import { useEffect, useRef, useState } from "react";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
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
  const [formMode, setFormMode] = useState<{ type: "create" } | { type: "edit"; category: Category } | null>(null);
  const [formName, setFormName] = useState("");
  const [savingForm, setSavingForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setCategories(data.categories))
      .catch(() => showToast("error", "加载分类列表失败"));
  }, [showToast]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (formMode && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLInputElement>("input")?.focus();
    }
    if (!formMode && dialog.open) dialog.close();
  }, [formMode]);

  function openCreateDialog() {
    setFormName("");
    setFormMode({ type: "create" });
  }

  function openEditDialog(category: Category) {
    setFormName(category.name);
    setFormMode({ type: "edit", category });
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!formMode) return;
    const mode = formMode;
    const name = formName.trim();
    if (!name) return;
    setSavingForm(true);
    try {
      if (mode.type === "create") {
        const response = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
        if (response.status === 409) { showToast("error", "该分类已存在"); return; }
        if (!response.ok) throw new Error();
        const { category } = (await response.json()) as { category: Category };
        setCategories((current) => (current ? [...current, category] : [category]));
        showToast("success", "分类已创建");
      } else {
        const { category } = mode;
        const response = await fetch(`/api/admin/categories/${category.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
        if (response.status === 409) { showToast("error", "该分类名称已存在"); return; }
        if (!response.ok) throw new Error();
        setCategories((current) => (current ? current.map((item) => (item.id === category.id ? { ...item, name } : item)) : current));
        showToast("success", "分类已更新");
      }
      setFormMode(null);
    } catch {
      showToast("error", mode.type === "create" ? "创建失败，请重试" : "更新失败，请重试");
    } finally {
      setSavingForm(false);
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

      <div className="mb-4">
        <Button type="button" onClick={openCreateDialog}>
          <Plus size={16} />
          新增分类
        </Button>
      </div>

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
              <span className="flex-1 text-sm font-medium text-foreground">{category.name}</span>
              <Button variant="ghost" size="icon-sm" aria-label={`重命名${category.name}`} onClick={() => openEditDialog(category)}>
                <Pencil size={15} />
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label={`删除${category.name}`} onClick={() => setPendingDelete(category)}>
                <Trash2 size={15} />
              </Button>
            </div>
          ))}
        </Card>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="category-form-dialog-title"
        onCancel={(event) => { event.preventDefault(); if (!savingForm) setFormMode(null); }}
        onClose={() => setFormMode(null)}
        className="m-auto w-[90vw] max-w-md rounded-xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      >
        <form onSubmit={handleSave}>
          <div className="border-b border-border px-6 py-4">
            <h2 id="category-form-dialog-title" className="text-base font-semibold text-foreground">
              {formMode?.type === "edit" ? "重命名分类" : "新增分类"}
            </h2>
          </div>
          <div className="space-y-2 px-6 py-5">
            <label htmlFor="category-name" className="text-sm font-medium text-foreground">分类名称</label>
            <Input id="category-name" value={formName} onChange={(event) => setFormName(event.target.value)} maxLength={50} placeholder="输入分类名称" />
          </div>
          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <Button type="button" variant="secondary" onClick={() => setFormMode(null)} disabled={savingForm}>取消</Button>
            <Button type="submit" disabled={savingForm || !formName.trim()}>
              {savingForm ? "保存中…" : "保存"}
            </Button>
          </div>
        </form>
      </dialog>

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
