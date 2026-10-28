"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { BoardQuery } from "@/features/boards/graphql";
import { CreateTaskMutation, UsersQuery } from "./graphql";

export const TASK_TITLE_MAX = 120;

type AddTaskModalProps = { boardId: string; open: boolean; onClose: () => void };

export function AddTaskModal({ boardId, open, onClose }: AddTaskModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Add task">
      <AddTaskForm boardId={boardId} onDone={onClose} />
    </Modal>
  );
}

function AddTaskForm({ boardId, onDone }: { boardId: string; onDone: () => void }) {
  const { data: users } = useQuery(UsersQuery, { fetchPolicy: "cache-first" });
  const [error, setError] = useState<string>();
  const toast = useToast();
  const [createTask, { loading }] = useMutation(CreateTaskMutation, {
    update(cache, { data }) {
      if (!data) return;
      cache.updateQuery({ query: BoardQuery, variables: { id: boardId } }, (prev) =>
        prev ? { board: { ...prev.board, tasks: [...prev.board.tasks, data.createTask] } } : prev,
      );
      if (data.createTask.assignee) cache.evict({ id: "ROOT_QUERY", fieldName: "myTasks" });
    },
  });

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title")).trim();
    if (!title) return setError("Task title is required");
    try {
      await createTask({
        variables: {
          input: {
            boardId,
            title,
            description: String(form.get("description")).trim() || null,
            assigneeId: String(form.get("assigneeId")) || null,
          },
        },
      });
      toast("Task added");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add the task. Try again.");
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Title"
        name="title"
        maxLength={TASK_TITLE_MAX}
        autoComplete="off"
        error={error}
      />
      <Textarea label="Description (optional)" name="description" maxLength={2000} rows={3} />
      <Select label="Assignee" name="assigneeId" defaultValue="">
        <option value="">Unassigned</option>
        {users?.users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </Select>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          Add task
        </Button>
      </div>
    </form>
  );
}
