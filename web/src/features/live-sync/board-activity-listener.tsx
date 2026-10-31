"use client";

import { useSubscription } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { removeBoardFromCache, removeTaskFromCache } from "@/features/boards/cache";
import { BoardActivityDocument, TaskDocument } from "@/gql/graphql";
import { deletingHere } from "./deleting-here";

const LIVE_QUERIES = new Set(["Boards", "Board", "Task", "MyTasks"]);

export function BoardActivityListener() {
  const router = useRouter();
  const toast = useToast();

  useSubscription(BoardActivityDocument, {
    onData: ({ client, data }) => {
      const event = data.data?.boardActivity;
      if (!event) return;
      const { type, boardId, taskId } = event;

      if (type === "BOARD_DELETED") removeBoardFromCache(client.cache, boardId);
      if (type === "TASK_DELETED" && taskId) removeTaskFromCache(client.cache, taskId, boardId);

      // Read the visible URL, so routes Next keeps mounted but hidden never react.
      const [, section, id] = window.location.pathname.split("/");
      const openTask =
        section === "tasks" ? client.cache.readQuery({ query: TaskDocument, variables: { id } }) : null;
      const boardGone =
        type === "BOARD_DELETED" &&
        ((section === "boards" && id === boardId) || openTask?.task.board.id === boardId);
      const taskGone = type === "TASK_DELETED" && section === "tasks" && id === taskId;

      if (boardGone || taskGone) {
        // Skips the refetch too: the open page's entity no longer exists.
        if (deletingHere.has(id)) return;
        toast(boardGone ? "This board was deleted" : "This task was deleted");
        router.replace(boardGone ? "/boards" : `/boards/${boardId}`);
        return;
      }

      // Only queries with mounted, visible observers are active.
      for (const query of client.getObservableQueries()) {
        if (LIVE_QUERIES.has(query.queryName ?? "")) query.refetch().catch(() => {});
      }
    },
  });

  return null;
}
