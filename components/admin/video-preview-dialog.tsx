"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VideoPreviewDialog({ open, url, title, onClose }: {
  open: boolean;
  url: string;
  title: string;
  onClose: () => void;
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
      onCancel={onClose}
      onClose={onClose}
      className="m-auto w-[92vw] max-w-xl rounded-xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm font-medium text-foreground">{title}</p>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="关闭预览" onClick={onClose}>
            <X size={15} />
          </Button>
        </div>
        {open && url ? (
          <video src={url} controls autoPlay className="aspect-video w-full rounded-md bg-black" />
        ) : (
          <div className="grid aspect-video place-items-center rounded-md bg-secondary text-sm text-muted-foreground">加载中…</div>
        )}
      </div>
    </dialog>
  );
}
