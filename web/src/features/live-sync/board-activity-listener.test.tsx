import { screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BoardsQuery } from "@/features/boards/graphql";
import { BoardsView } from "@/features/boards/boards-view";
import type { BoardEventType } from "@/gql/graphql";
import { alice, renderWithApollo } from "@/test/render";
import { BoardActivityListener } from "./board-activity-listener";
import { deletingHere } from "./deleting-here";
import { BoardActivitySubscription } from "./graphql";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: vi.fn() }) }));

const board = (id: string, name: string) => ({
  __typename: "Board" as const,
  id,
  name,
  openTaskCount: 0,
  owner: alice,
});

const boardsMock = (...boards: ReturnType<typeof board>[]) => ({
  request: { query: BoardsQuery },
  result: { data: { boards } },
});

// Arrives after the initial queries settle.
const event = (type: BoardEventType, boardId: string, taskId: string | null = null) => ({
  request: { query: BoardActivitySubscription },
  delay: 100,
  result: { data: { boardActivity: { __typename: "BoardEvent", type, boardId, taskId } } },
});

const website = board("b1", "Website relaunch");
const roadmap = board("b2", "Q4 roadmap");

function renderAt(path: string, mocks: Parameters<typeof renderWithApollo>[1]) {
  window.history.replaceState(null, "", path);
  renderWithApollo(
    <>
      <BoardActivityListener />
      <BoardsView />
    </>,
    mocks,
  );
}

afterEach(() => {
  replace.mockClear();
  deletingHere.clear();
});

describe("BoardActivityListener", () => {
  it("refetches the queries on screen when a board changes", async () => {
    renderAt("/boards", [
      boardsMock(website),
      boardsMock(website, roadmap),
      event("BOARD_CREATED", "b2"),
    ]);

    expect(await screen.findByRole("link", { name: /Q4 roadmap/ })).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("leaves the open board when it is deleted", async () => {
    renderAt("/boards/b1", [boardsMock(website), event("BOARD_DELETED", "b1")]);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/boards"));
    expect(screen.getByText("This board was deleted")).toBeInTheDocument();
  });

  it("stays put when a different board is deleted", async () => {
    renderAt("/boards/b1", [
      boardsMock(website, roadmap),
      boardsMock(website),
      event("BOARD_DELETED", "b2"),
    ]);

    await screen.findByRole("link", { name: /Q4 roadmap/ });
    await waitFor(() => expect(screen.queryByRole("link", { name: /Q4 roadmap/ })).toBeNull());
    expect(replace).not.toHaveBeenCalled();
    expect(screen.queryByText("This board was deleted")).not.toBeInTheDocument();
  });

  it("sends the open task back to its board when the task is deleted", async () => {
    renderAt("/tasks/t1", [boardsMock(website), event("TASK_DELETED", "b1", "t1")]);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/boards/b1"));
    expect(screen.getByText("This task was deleted")).toBeInTheDocument();
  });

  it("leaves the person who deleted the board to their own flow", async () => {
    deletingHere.add("b1");
    renderAt("/boards/b1", [boardsMock(website, roadmap), event("BOARD_DELETED", "b1")]);

    await screen.findByRole("link", { name: /Q4 roadmap/ });
    await waitFor(() => expect(screen.queryByRole("link", { name: /Website relaunch/ })).toBeNull());
    expect(replace).not.toHaveBeenCalled();
    expect(screen.queryByText("This board was deleted")).not.toBeInTheDocument();
  });
});
