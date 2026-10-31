"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { BoardNameForm } from "./board-name-form";
import { BoardsDocument, CreateBoardDocument } from "@/gql/graphql";

export function BoardsView() {
  const { data, error, refetch } = useQuery(BoardsDocument);
  const [creating, setCreating] = useState(false);
  const [createBoard] = useMutation(CreateBoardDocument, {
    update(cache, { data }) {
      if (!data) return;
      cache.updateQuery({ query: BoardsDocument }, (prev) =>
        prev ? { boards: [data.createBoard, ...prev.boards] } : prev,
      );
    },
  });
  const toast = useToast();

  async function create(name: string) {
    await createBoard({ variables: { input: { name } } });
    setCreating(false);
    toast("Board created");
  }

  const newBoard = <Button onClick={() => setCreating(true)}>New board</Button>;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-title font-bold">Boards</h1>
        {data?.boards.length ? newBoard : null}
      </div>

      {error && !data ? (
        <ErrorState
          message="Couldn't load boards. Check your connection and try again."
          onRetry={() => void refetch()}
        />
      ) : !data ? (
        <LoadingState label="Loading boards…" />
      ) : data.boards.length === 0 ? (
        <EmptyState message="No boards yet. Create one to start planning." action={newBoard} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.boards.map((board) => (
            <li key={board.id}>
              <Link
                href={`/boards/${board.id}`}
                className="flex h-full flex-col gap-4 rounded-card border border-line bg-paper p-5 transition-colors hover:border-cobalt"
              >
                <span className="text-section font-semibold">{board.name}</span>
                <span className="mt-auto flex items-center justify-between gap-3 text-meta text-graphite">
                  <span className="flex min-w-0 items-center gap-2">
                    <Avatar name={board.owner.name} decorative />
                    <span className="truncate">{board.owner.name}</span>
                  </span>
                  <span className="shrink-0">
                    {board.openTaskCount === 0 ? "No open tasks" : `${board.openTaskCount} open`}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="New board">
        <BoardNameForm
          submitLabel="Create board"
          onSubmit={create}
          onCancel={() => setCreating(false)}
        />
      </Modal>
    </>
  );
}
