import type { ReactNode } from "react";
import { Button } from "./button";

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-card border border-dashed border-line px-6 py-10">
      <p className="text-graphite">{message}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-4 rounded-card border border-brick/40 bg-paper px-6 py-8"
    >
      <p className="text-ink">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <p role="status" className="py-10 text-graphite">
      {label}
    </p>
  );
}
