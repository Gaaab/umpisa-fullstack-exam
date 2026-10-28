import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MeQuery } from "@/features/auth/graphql";
import { UpdateTaskMutation } from "@/features/tasks/graphql";
import { TASK_DRAG_TYPE } from "@/features/tasks/task-card";
import type { TaskStatus } from "@/gql/graphql";
import { alice, bob, renderWithApollo } from "@/test/render";
import { BoardView } from "./board-view";
import { BoardQuery } from "./graphql";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const task = (status: TaskStatus) => ({
  __typename: "Task" as const,
  id: "t1",
  title: "Write launch copy",
  description: null,
  status,
  updatedAt: "2026-10-28T10:00:00.000Z",
  assignee: bob,
});

const baseMocks = [
  {
    request: { query: MeQuery },
    result: { data: { me: { ...alice, email: "alice@example.com" } } },
  },
  {
    request: { query: BoardQuery, variables: { id: "b1" } },
    result: {
      data: {
        board: {
          __typename: "Board",
          id: "b1",
          name: "Website relaunch",
          owner: alice,
          tasks: [task("TODO")],
        },
      },
    },
  },
];

const moveRequest = {
  query: UpdateTaskMutation,
  variables: { input: { id: "t1", status: "IN_PROGRESS" } },
};

const lane = (name: string) => screen.getByRole("region", { name: new RegExp(`^${name}`) });

async function moveWithMenu() {
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "Move Write launch copy" }));
  await user.click(screen.getByRole("button", { name: "Move to In progress" }));
}

describe("BoardView", () => {
  it("shows tasks in status lanes with owner actions", async () => {
    renderWithApollo(<BoardView id="b1" />, baseMocks);

    expect(await screen.findByRole("heading", { name: "Website relaunch" })).toBeInTheDocument();
    expect(within(lane("To do")).getByText("Write launch copy")).toBeInTheDocument();
    expect(screen.getByText(/1 open/)).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Rename" })).toBeInTheDocument();
  });

  it("moves a task to the new lane before the server answers", async () => {
    renderWithApollo(<BoardView id="b1" />, [
      ...baseMocks,
      // Never resolves, so only the optimistic write can move the card.
      { request: moveRequest, delay: Infinity, result: { data: { updateTask: task("IN_PROGRESS") } } },
    ]);

    await moveWithMenu();

    expect(within(lane("In progress")).getByText("Write launch copy")).toBeInTheDocument();
    expect(within(lane("To do")).queryByText("Write launch copy")).not.toBeInTheDocument();
  });

  it("returns the task to its lane when the server rejects the move", async () => {
    renderWithApollo(<BoardView id="b1" />, [
      ...baseMocks,
      { request: moveRequest, delay: 20, error: new Error("Network down") },
    ]);

    await moveWithMenu();

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't move the task");
    expect(within(lane("To do")).getByText("Write launch copy")).toBeInTheDocument();
  });

  it("moves a task dropped on another lane", async () => {
    renderWithApollo(<BoardView id="b1" />, [
      ...baseMocks,
      { request: moveRequest, result: { data: { updateTask: task("IN_PROGRESS") } } },
    ]);
    await screen.findByText("Write launch copy");

    fireEvent.drop(lane("In progress"), {
      dataTransfer: { types: [TASK_DRAG_TYPE], getData: () => "t1" },
    });

    expect(await within(lane("In progress")).findByText("Write launch copy")).toBeInTheDocument();
    expect(await screen.findByText("Moved to In progress")).toBeInTheDocument();
  });
});
