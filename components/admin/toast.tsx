"use client";
import { createContext, useCallback, useContext } from "react";
import { Toaster, toast as sonnerToast } from "sonner";

type ToastKind = "success" | "error";
type ToastContextValue = { showToast: (kind: ToastKind, message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const showToast = useCallback((kind: ToastKind, message: string) => {
    if (kind === "success") sonnerToast.success(message);
    else sonnerToast.error(message);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        gap={10}
        toastOptions={{
          classNames: {
            toast: "!rounded-xl !border !border-border !shadow-lg !font-sans !text-sm",
          },
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
