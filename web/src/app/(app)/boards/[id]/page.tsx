import { Suspense } from "react";
import { LoadingState } from "@/components/ui/states";
import { BoardView } from "@/features/boards/board-view";

export default function BoardPage({ params }: PageProps<"/boards/[id]">) {
  return (
    <Suspense fallback={<LoadingState label="Loading board…" />}>
      {params.then(({ id }) => (
        <BoardView id={id} />
      ))}
    </Suspense>
  );
}
