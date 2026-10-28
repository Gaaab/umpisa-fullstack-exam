import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 ${className}`}
      {...props}
    />
  );
}
