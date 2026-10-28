import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { alice, renderWithApollo } from "@/test/render";
import { BoardsView } from "./boards-view";
import { BoardsQuery, CreateBoardMutation } from "./graphql";

const board = (id: string, name: string, openTaskCount: number) => ({
  __typename: "Board" as const,
  id,
  name,
  openTaskCount,
  owner: alice,
});

const boardsMock = (boards: ReturnType<typeof board>[]) => ({
  request: { query: BoardsQuery },
  result: { data: { boards } },
});

describe("BoardsView", () => {
  it("lists boards with owner and open task count", async () => {
    renderWithApollo(<BoardsView />, [
      boardsMock([board("b1", "Website relaunch", 3), board("b2", "Mobile app beta", 0)]),
    ]);

    const tile = await screen.findByRole("link", { name: /Website relaunch/ });
    expect(tile).toHaveAttribute("href", "/boards/b1");
    expect(tile).toHaveTextContent("Alice Santos");
    expect(tile).toHaveTextContent("3 open");
    expect(screen.getByRole("link", { name: /Mobile app beta/ })).toHaveTextContent(
      "No open tasks",
    );
  });

  it("shows an empty state when there are no boards", async () => {
    renderWithApollo(<BoardsView />, [boardsMock([])]);
    expect(
      await screen.findByText("No boards yet. Create one to start planning."),
    ).toBeInTheDocument();
  });

  it("validates the name, then adds the new board to the list", async () => {
    const user = userEvent.setup();
    renderWithApollo(<BoardsView />, [
      boardsMock([board("b1", "Website relaunch", 3)]),
      {
        request: { query: CreateBoardMutation, variables: { input: { name: "Q4 roadmap" } } },
        result: { data: { createBoard: board("b9", "Q4 roadmap", 0) } },
      },
    ]);

    await user.click(await screen.findByRole("button", { name: "New board" }));
    const dialog = screen.getByRole("dialog", { name: "New board" });
    await user.click(screen.getByRole("button", { name: "Create board" }));
    expect(dialog).toHaveTextContent("Board name is required");
    expect(screen.getByLabelText("Board name")).toHaveAttribute("maxlength", "60");

    await user.type(screen.getByLabelText("Board name"), "  Q4 roadmap ");
    await user.click(screen.getByRole("button", { name: "Create board" }));

    expect(await screen.findByRole("link", { name: /Q4 roadmap/ })).toHaveAttribute(
      "href",
      "/boards/b9",
    );
    expect(screen.getByText("Board created")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
