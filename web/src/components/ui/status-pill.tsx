import type { TaskStatus } from "@/gql/graphql";
import { statusClasses, statusLabel } from "@/lib/status";

export function StatusPill({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-meta font-semibold ${statusClasses[status].pill}`}
    >
      {statusLabel[status]}
    </span>
  );
}

export function StatusDot({ status }: { status: TaskStatus }) {
  return (
    <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${statusClasses[status].dot}`} />
  );
}
