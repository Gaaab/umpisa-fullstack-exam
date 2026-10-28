"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastOptions = { tone?: "error"; href?: string };
type Toast = ToastOptions & { id: number; message: string };
type ShowToast = (message: string, options?: ToastOptions) => void;

const ToastContext = createContext<ShowToast | null>(null);

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used inside ToastProvider");
  return toast;
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback(
    (id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)),
    [],
  );

  const show = useCallback<ShowToast>(
    (message, options) => {
      const id = ++nextId;
      setToasts((current) => [...current.slice(-2), { id, message, ...options }]);
      setTimeout(() => dismiss(id), options?.tone === "error" ? 7000 : 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : undefined}
            className={`pointer-events-auto flex w-full max-w-sm animate-arrive items-start gap-3 rounded-card px-4 py-3 text-paper ${
              toast.tone === "error" ? "bg-brick" : "bg-ink"
            }`}
          >
            {toast.href ? (
              <Link href={toast.href} className="flex-1 underline-offset-2 hover:underline">
                {toast.message}
              </Link>
            ) : (
              <p className="flex-1">{toast.message}</p>
            )}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(toast.id)}
              className="-mr-1 rounded px-1 text-paper/80 hover:text-paper"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
