import type { TaskStatus } from "@/gql/graphql";

export const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export const statusLabel: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

// Full class names so Tailwind can see them.
export const statusClasses: Record<TaskStatus, { edge: string; dot: string; pill: string }> = {
  TODO: { edge: "border-t-todo", dot: "bg-todo", pill: "bg-todo-tint text-todo-ink" },
  IN_PROGRESS: {
    edge: "border-t-progress",
    dot: "bg-progress",
    pill: "bg-progress-tint text-progress-ink",
  },
  DONE: { edge: "border-t-done", dot: "bg-done", pill: "bg-done-tint text-done-ink" },
};
