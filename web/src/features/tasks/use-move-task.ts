"use client";

import { useMutation } from "@apollo/client/react";
import { useToast } from "@/components/ui/toast";
import { UpdateTaskDocument, type TaskFieldsFragment, type TaskStatus } from "@/gql/graphql";
import { statusLabel } from "@/lib/status";

// The optimistic write moves the card at once; Apollo rolls it back on error.
export function useMoveTask() {
  const [updateTask] = useMutation(UpdateTaskDocument);
  const toast = useToast();

  return (task: TaskFieldsFragment, status: TaskStatus) => {
    if (task.status === status) return;
    updateTask({
      variables: { input: { id: task.id, status } },
      optimisticResponse: { updateTask: { ...task, status } },
    }).then(
      () => toast(`Moved to ${statusLabel[status]}`),
      () =>
        toast("Couldn't move the task. Check your connection and try again.", { tone: "error" }),
    );
  };
}
