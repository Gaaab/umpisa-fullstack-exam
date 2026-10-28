import type { Metadata } from "next";
import { BoardsView } from "@/features/boards/boards-view";

export const metadata: Metadata = { title: "Boards" };

export default function BoardsPage() {
  return <BoardsView />;
}
