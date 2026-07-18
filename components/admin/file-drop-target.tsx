"use client";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function FileDropTarget({ accept, onFile, children, disabled, label }: {
  accept: string;
  onFile: (file: File) => void;
  children?: React.ReactNode;
  disabled?: boolean;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      className={cn(
        "relative cursor-pointer rounded-lg border-2 border-dashed border-input bg-secondary/40 p-5 text-center text-sm text-muted-foreground transition-colors",
        "hover:border-ring/60 hover:bg-accent/40",
        dragOver && "border-ring bg-accent/60 text-accent-foreground",
        disabled && "pointer-events-none cursor-not-allowed opacity-60",
      )}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(event) => { if (!disabled && (event.key === "Enter" || event.key === " ")) inputRef.current?.click(); }}
      onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => { event.preventDefault(); setDragOver(false); if (!disabled) handleFiles(event.dataTransfer.files); }}
      role="button"
      tabIndex={0}
      aria-label={label}
    >
      <input ref={inputRef} type="file" accept={accept} hidden onChange={(event) => { handleFiles(event.target.files); event.target.value = ""; }} disabled={disabled} />
      {children ?? label}
    </div>
  );
}
