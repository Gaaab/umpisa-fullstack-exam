"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-pill";
import type { TaskFieldsFragment, TaskStatus } from "@/gql/graphql";
import { STATUSES, statusClasses, statusLabel } from "@/lib/status";

export const TASK_DRAG_TYPE = "application/x-taskboard-task";

type TaskCardProps = {
  task: TaskFieldsFragment;
  onMove: (status: TaskStatus) => void;
};

export function TaskCard({ task, onMove }: TaskCardProps) {
  const [dragging, setDragging] = useState(false);

  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(TASK_DRAG_TYPE, task.id);
        event.dataTransfer.effectAllowed = "move";
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      className={`relative cursor-grab rounded-card border border-t-4 border-line bg-paper p-3 transition-shadow active:cursor-grabbing ${
        statusClasses[task.status].edge
      } ${dragging ? "shadow-lg" : ""}`}
    >
      <Link
        href={`/tasks/${task.id}`}
        draggable={false}
        // Stretches the link over the card; the Move menu sits above it.
        className="block font-semibold break-words after:absolute after:inset-0 after:rounded-card hover:text-cobalt"
      >
        {task.title}
      </Link>
      <div className="mt-3 flex items-center justify-between">
        <Avatar name={task.assignee?.name} />
        <MoveMenu title={task.title} status={task.status} onMove={onMove} />
      </div>
    </article>
  );
}

type MoveMenuProps = { title: string; status: TaskStatus; onMove: (status: TaskStatus) => void };

// Keyboard and touch alternative to dragging.
function MoveMenu({ title, status, onMove }: MoveMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative z-10"
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !open) return;
        setOpen(false);
        buttonRef.current?.focus();
      }}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        aria-label={`Move ${title}`}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(!open)}
      >
        Move
        <svg aria-hidden viewBox="0 0 12 12" className="size-3" fill="currentColor">
          <path d="M2.5 4.5 6 8l3.5-3.5z" />
        </svg>
      </Button>
      {open && (
        <ul
          id={listId}
          className="absolute right-0 top-full mt-1 w-48 rounded-card border border-line bg-paper p-1 shadow-lg"
        >
          {STATUSES.filter((option) => option !== status).map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onMove(option);
                }}
                className="flex w-full items-center gap-2 rounded-field px-2.5 py-2 text-left text-meta font-semibold hover:bg-wall"
              >
                <StatusDot status={option} />
                Move to {statusLabel[option]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
