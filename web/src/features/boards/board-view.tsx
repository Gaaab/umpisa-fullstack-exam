"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmModal, Modal } from "@/components/ui/modal";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import {
  BoardDocument,
  DeleteBoardDocument,
  MeDocument,
  UpdateBoardDocument,
  type TaskStatus,
} from "@/gql/graphql";
import { deletingHere } from "@/features/live-sync/deleting-here";
import { AddTaskModal } from "@/features/tasks/add-task-modal";
import { TaskCard } from "@/features/tasks/task-card";
import { useMoveTask } from "@/features/tasks/use-move-task";
import { STATUSES } from "@/lib/status";
import { BoardNameForm } from "./board-name-form";
import { removeBoardFromCache } from "./cache";
import { Lane } from "./lane";

type Dialog = "rename" | "delete" | "add-task" | null;

export function BoardView({ id }: { id: string }) {
  const { data, error, refetch } = useQuery(BoardDocument, { variables: { id } });
  const { data: me } = useQuery(MeDocument, { fetchPolicy: "cache-first" });
  const [dialog, setDialog] = useState<Dialog>(null);
  const moveTask = useMoveTask();
  const router = useRouter();
  const toast = useToast();
  const [renameBoard] = useMutation(UpdateBoardDocument);
  const [deleteBoard, { loading: deleting }] = useMutation(DeleteBoardDocument, {
    update: (cache) => removeBoardFromCache(cache, id),
  });

  if (error && !data) {
    return (
      <ErrorState
        message="Couldn't load this board. It may have been deleted, or the connection dropped."
        onRetry={() => void refetch()}
      />
    );
  }
  if (!data) return <LoadingState label="Loading board…" />;

  const { board } = data;
  const isOwner = board.owner.id === me?.me.id;
  const openCount = board.tasks.filter((task) => task.status !== "DONE").length;
  const close = () => setDialog(null);

  async function rename(name: string) {
    await renameBoard({ variables: { input: { id, name } } });
    close();
    toast("Board renamed");
  }

  async function remove() {
    deletingHere.add(id);
    try {
      await deleteBoard({ variables: { id } });
      close();
      toast("Board deleted");
      router.push("/boards");
    } catch {
      deletingHere.delete(id);
      toast("Couldn't delete the board. Try again.", { tone: "error" });
    }
  }

  function drop(taskId: string, status: TaskStatus) {
    const task = board.tasks.find((t) => t.id === taskId);
    if (task) moveTask(task, status);
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-title font-bold break-words">{board.name}</h1>
          <p className="mt-1 text-meta text-graphite">
            Owned by {board.owner.name} · {openCount} open
          </p>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDialog("rename")}>
              Rename
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDialog("delete")}>
              <span className="text-brick">Delete board</span>
            </Button>
          </div>
        )}
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {STATUSES.map((status) => {
          const tasks = board.tasks.filter((task) => task.status === status);
          return (
            <Lane
              key={status}
              status={status}
              count={tasks.length}
              onDropTask={(taskId) => drop(taskId, status)}
            >
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onMove={(to) => moveTask(task, to)} />
              ))}
              {status === "TODO" && (
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => setDialog("add-task")}
                >
                  + Add task
                </Button>
              )}
            </Lane>
          );
        })}
      </div>

      <Modal open={dialog === "rename"} onClose={close} title="Rename board">
        <BoardNameForm
          initialName={board.name}
          submitLabel="Save name"
          onSubmit={rename}
          onCancel={close}
        />
      </Modal>
      <ConfirmModal
        open={dialog === "delete"}
        onClose={close}
        title={`Delete "${board.name}" and its tasks?`}
        message="This removes the board and every task on it for the whole team."
        confirmLabel="Delete board"
        pending={deleting}
        onConfirm={remove}
      />
      <AddTaskModal boardId={board.id} open={dialog === "add-task"} onClose={close} />
    </>
  );
}
