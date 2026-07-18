"use client";
import { useEffect, useRef } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({ open, title, description, confirmLabel = "确认", onConfirm, onCancel }: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={onCancel}
      onClose={onCancel}
      className="m-auto w-[90vw] max-w-sm rounded-xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="mb-4 grid size-10 place-items-center rounded-full bg-red-50 text-destructive">
          <TriangleAlert size={19} />
        </div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            取消
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
