import { Suspense } from "react";
import { LoadingState } from "@/components/ui/states";
import { TaskDetail } from "@/features/tasks/task-detail";

export default function TaskPage({ params }: PageProps<"/tasks/[id]">) {
  return (
    <Suspense fallback={<LoadingState label="Loading task…" />}>
      {params.then(({ id }) => (
        <TaskDetail id={id} />
      ))}
    </Suspense>
  );
}
