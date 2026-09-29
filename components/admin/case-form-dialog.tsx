"use client";
import { useEffect, useRef, useState } from "react";
import type { CaseStudy } from "@/lib/cases/types";
import { CaseForm } from "./case-form";

export function CaseFormDialog({ initialCase, onClose, onSaved }: {
  initialCase?: CaseStudy;
  onClose: () => void;
  onSaved: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    setPortalContainer(dialog);
    if (!dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="case-form-dialog-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClose={onClose}
      className="m-auto h-[92dvh] w-[96vw] max-w-5xl overflow-hidden rounded-xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <CaseForm initialCase={initialCase} dialogMode onCancel={onClose} onSaved={onSaved} selectPortalContainer={portalContainer} />
    </dialog>
  );
}
