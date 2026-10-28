"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/modal";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { StatusPill } from "@/components/ui/status-pill";
import { useToast } from "@/components/ui/toast";
import { BoardQuery } from "@/features/boards/graphql";
import type { TaskQuery as TaskData, TaskStatus } from "@/gql/graphql";
import { formatDate } from "@/lib/format";
import { STATUSES, statusLabel } from "@/lib/status";
import { TASK_TITLE_MAX } from "./add-task-modal";
import { Comments } from "./comments";
import {
  DeleteTaskMutation,
  MyTasksQuery,
  TaskQuery,
  UpdateTaskMutation,
  UsersQuery,
} from "./graphql";

export function TaskDetail({ id }: { id: string }) {
  const { data, error, refetch } = useQuery(TaskQuery, { variables: { id } });
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const [deleteTask, { loading: deletePending }] = useMutation(DeleteTaskMutation);

  if (error && !data) {
    return (
      <ErrorState
        message="Couldn't load this task. It may have been deleted, or the connection dropped."
        onRetry={() => void refetch()}
      />
    );
  }
  if (!data) return <LoadingState label="Loading task…" />;

  const { task } = data;

  async function remove() {
    try {
      await deleteTask({
        variables: { id },
        // Drop list entries instead of evicting, so this page doesn't refetch a deleted task.
        update(cache) {
          cache.updateQuery({ query: BoardQuery, variables: { id: task.board.id } }, (prev) =>
            prev
              ? { board: { ...prev.board, tasks: prev.board.tasks.filter((t) => t.id !== id) } }
              : prev,
          );
          cache.updateQuery({ query: MyTasksQuery }, (prev) =>
            prev ? { myTasks: prev.myTasks.filter((t) => t.id !== id) } : prev,
          );
        },
      });
      setDeleting(false);
      toast("Task deleted");
      router.push(`/boards/${task.board.id}`);
    } catch {
      toast("Couldn't delete the task. Try again.", { tone: "error" });
    }
  }

  return (
    <>
      <Link
        href={`/boards/${task.board.id}`}
        className="text-meta font-semibold text-cobalt hover:underline"
      >
        {task.board.name}
      </Link>
      <div className="mt-1 mb-8 flex flex-wrap items-center gap-3">
        <h1 className="text-title font-bold break-words">{task.title}</h1>
        <StatusPill status={task.status} />
      </div>
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_17rem] md:gap-x-12">
        {/* Remount after each save so the form starts from the saved values. */}
        <TaskForm key={task.updatedAt} task={task} onDelete={() => setDeleting(true)} />
        <Comments taskId={task.id} comments={task.comments} />
      </div>
      <ConfirmModal
        open={deleting}
        onClose={() => setDeleting(false)}
        title={`Delete "${task.title}"?`}
        message="The task and its comments are removed for the whole team."
        confirmLabel="Delete task"
        pending={deletePending}
        onConfirm={remove}
      />
    </>
  );
}

type TaskFormProps = { task: TaskData["task"]; onDelete: () => void };

function TaskForm({ task, onDelete }: TaskFormProps) {
  const saved = {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    assigneeId: task.assignee?.id ?? "",
  };
  const [values, setValues] = useState(saved);
  const [titleError, setTitleError] = useState<string>();
  const [error, setError] = useState<string>();
  const { data: users } = useQuery(UsersQuery, { fetchPolicy: "cache-first" });
  const [updateTask, { loading }] = useMutation(UpdateTaskMutation);
  const toast = useToast();
  const dirty = (Object.keys(saved) as (keyof typeof saved)[]).some(
    (key) => values[key] !== saved[key],
  );
  // Until users load, keep the current assignee selectable.
  const people = users?.users ?? (task.assignee ? [task.assignee] : []);

  function set(field: keyof typeof saved) {
    return (event: { target: { value: string } }) =>
      setValues((current) => ({ ...current, [field]: event.target.value }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = values.title.trim();
    setTitleError(title ? undefined : "Task title is required");
    if (!title) return;
    setError(undefined);
    try {
      await updateTask({
        variables: {
          input: {
            id: task.id,
            title,
            description: values.description.trim(),
            status: values.status,
            assigneeId: values.assigneeId || null,
          },
        },
        update(cache) {
          if (values.assigneeId !== saved.assigneeId) {
            cache.evict({ id: "ROOT_QUERY", fieldName: "myTasks" });
          }
        },
      });
      toast("Changes saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the task. Try again.");
    }
  }

  return (
    // `contents` lets the fields and side panel sit in the page grid.
    <form noValidate onSubmit={handleSubmit} className="contents">
      <div className="flex flex-col gap-4">
        <Input
          label="Title"
          value={values.title}
          onChange={set("title")}
          maxLength={TASK_TITLE_MAX}
          error={titleError}
        />
        <Textarea
          label="Description"
          value={values.description}
          onChange={set("description")}
          maxLength={2000}
          rows={6}
          placeholder="Add details, links or acceptance notes"
        />
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!dirty || loading}>
            Save changes
          </Button>
          {dirty && <span className="text-meta text-graphite">Unsaved changes</span>}
        </div>
        {error && (
          <p role="alert" className="text-meta text-brick">
            {error}
          </p>
        )}
      </div>

      <aside className="flex flex-col gap-4 md:row-span-2 md:border-l md:border-line md:pl-8">
        <Select label="Status" value={values.status} onChange={set("status")}>
          {STATUSES.map((status: TaskStatus) => (
            <option key={status} value={status}>
              {statusLabel[status]}
            </option>
          ))}
        </Select>
        <Select label="Assignee" value={values.assigneeId} onChange={set("assigneeId")}>
          <option value="">Unassigned</option>
          {people.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </Select>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-line pt-4 text-meta">
          <dt className="text-graphite">Board</dt>
          <dd>
            <Link href={`/boards/${task.board.id}`} className="text-cobalt hover:underline">
              {task.board.name}
            </Link>
          </dd>
          <dt className="text-graphite">Created</dt>
          <dd>{formatDate(task.createdAt)}</dd>
          <dt className="text-graphite">Updated</dt>
          <dd>{formatDate(task.updatedAt)}</dd>
        </dl>
        <div className="border-t border-line pt-4">
          <Button variant="ghost" size="sm" className="-ml-3" onClick={onDelete}>
            <span className="text-brick">Delete task</span>
          </Button>
        </div>
      </aside>
    </form>
  );
}
