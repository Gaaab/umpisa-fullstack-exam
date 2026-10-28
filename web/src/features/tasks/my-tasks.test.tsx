import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TaskStatus } from "@/gql/graphql";
import { renderWithApollo } from "@/test/render";
import { MyTasksQuery } from "./graphql";
import { MyTasks } from "./my-tasks";

const task = (id: string, title: string, status: TaskStatus) => ({
  __typename: "Task" as const,
  id,
  title,
  status,
  board: { __typename: "Board" as const, id: "b1", name: "Website relaunch" },
});

const myTasksMock = (myTasks: ReturnType<typeof task>[]) => ({
  request: { query: MyTasksQuery },
  result: { data: { myTasks } },
});

describe("MyTasks", () => {
  it("groups tasks by status and links each to its detail page", async () => {
    renderWithApollo(<MyTasks />, [
      myTasksMock([
        task("t1", "Write launch copy", "TODO"),
        task("t2", "Ship pricing page", "DONE"),
        task("t3", "Review hero image", "TODO"),
      ]),
    ]);

    const todo = await screen.findByRole("region", { name: /^To do/ });
    expect(within(todo).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Write launch copyWebsite relaunch",
      "Review hero imageWebsite relaunch",
    ]);
    const done = screen.getByRole("region", { name: /^Done/ });
    expect(within(done).getByRole("link")).toHaveAttribute("href", "/tasks/t2");
    expect(screen.queryByRole("region", { name: /^In progress/ })).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing is assigned", async () => {
    renderWithApollo(<MyTasks />, [myTasksMock([])]);
    expect(await screen.findByText("Nothing is assigned to you right now.")).toBeInTheDocument();
  });
});
