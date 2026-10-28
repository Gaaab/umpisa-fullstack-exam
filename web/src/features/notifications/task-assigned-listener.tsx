"use client";

import { useSubscription } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { TaskAssignedSubscription } from "./graphql";
import { browserNotificationsEnabled } from "./preference";

export function TaskAssignedListener() {
  const toast = useToast();
  const router = useRouter();

  useSubscription(TaskAssignedSubscription, {
    onData: ({ client, data }) => {
      if (!data.data) return;
      const { assignedBy, task } = data.data.taskAssigned;
      const message = `${assignedBy.name} assigned you "${task.title}"`;
      const href = `/tasks/${task.id}`;
      toast(message, { href });
      // Drops the cached list so an open My tasks page refetches.
      client.cache.evict({ id: "ROOT_QUERY", fieldName: "myTasks" });

      if (document.visibilityState === "hidden" && browserNotificationsEnabled()) {
        const notification = new Notification("Taskboard", { body: message, tag: task.id });
        notification.onclick = () => {
          window.focus();
          router.push(href);
        };
      }
    },
  });

  return null;
}
