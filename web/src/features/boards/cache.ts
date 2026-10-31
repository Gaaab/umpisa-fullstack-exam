import type { ApolloCache } from "@apollo/client";
import { BoardDocument, BoardsDocument, MyTasksDocument } from "@/gql/graphql";

// Filter lists instead of evicting, so a page still showing the entity doesn't refetch it.
export function removeBoardFromCache(cache: ApolloCache, boardId: string) {
  cache.updateQuery({ query: BoardsDocument }, (prev) =>
    prev ? { boards: prev.boards.filter((board) => board.id !== boardId) } : prev,
  );
  cache.updateQuery({ query: MyTasksDocument }, (prev) =>
    prev ? { myTasks: prev.myTasks.filter((task) => task.board.id !== boardId) } : prev,
  );
}

export function removeTaskFromCache(cache: ApolloCache, taskId: string, boardId: string) {
  cache.updateQuery({ query: BoardDocument, variables: { id: boardId } }, (prev) =>
    prev
      ? { board: { ...prev.board, tasks: prev.board.tasks.filter((task) => task.id !== taskId) } }
      : prev,
  );
  cache.updateQuery({ query: MyTasksDocument }, (prev) =>
    prev ? { myTasks: prev.myTasks.filter((task) => task.id !== taskId) } : prev,
  );
}
