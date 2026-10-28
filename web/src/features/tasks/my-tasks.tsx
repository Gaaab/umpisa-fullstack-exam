"use client";

import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { StatusDot } from "@/components/ui/status-pill";
import { STATUSES, statusLabel } from "@/lib/status";
import { MyTasksQuery } from "./graphql";

export function MyTasks() {
  const { data, error, refetch } = useQuery(MyTasksQuery);

  if (error && !data) {
    return (
      <ErrorState
        message="Couldn't load your tasks. Check your connection and try again."
        onRetry={() => void refetch()}
      />
    );
  }
  if (!data) return <LoadingState label="Loading your tasks…" />;
  if (data.myTasks.length === 0) {
    return (
      <EmptyState
        message="Nothing is assigned to you right now."
        action={
          <Link href="/boards" className={buttonClasses("secondary", "sm")}>
            Browse boards
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {STATUSES.map((status) => {
        const tasks = data.myTasks.filter((task) => task.status === status);
        if (tasks.length === 0) return null;
        return (
          <section key={status} aria-labelledby={`group-${status}`}>
            <h2 id={`group-${status}`} className="mb-3 flex items-center gap-2 text-section font-semibold">
              <StatusDot status={status} />
              {statusLabel[status]}
              <span className="font-normal text-graphite">{tasks.length}</span>
            </h2>
            <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-paper">
              {tasks.map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/tasks/${task.id}`}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3 transition-colors hover:bg-wall/60"
                  >
                    <span className="font-semibold break-words">{task.title}</span>
                    <span className="text-meta text-graphite">{task.board.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
