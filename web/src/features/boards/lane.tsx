"use client";

import { useId, useState, type ReactNode } from "react";
import { StatusDot } from "@/components/ui/status-pill";
import type { TaskStatus } from "@/gql/graphql";
import { TASK_DRAG_TYPE } from "@/features/tasks/task-card";
import { statusLabel } from "@/lib/status";

type LaneProps = {
  status: TaskStatus;
  count: number;
  onDropTask: (taskId: string) => void;
  children: ReactNode;
};

export function Lane({ status, count, onDropTask, children }: LaneProps) {
  const [over, setOver] = useState(false);
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes(TASK_DRAG_TYPE)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setOver(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const taskId = event.dataTransfer.getData(TASK_DRAG_TYPE);
        if (taskId) onDropTask(taskId);
      }}
      className={`flex w-[85vw] shrink-0 snap-start flex-col gap-3 rounded-sheet border p-3 transition-colors lg:w-auto ${
        over ? "border-cobalt bg-cobalt/5" : "border-line"
      }`}
    >
      <h2 id={headingId} className="flex items-center gap-2 px-1 pt-1 font-semibold">
        <StatusDot status={status} />
        {statusLabel[status]}
        <span className="font-normal text-graphite">{count}</span>
      </h2>
      {children}
    </section>
  );
}
