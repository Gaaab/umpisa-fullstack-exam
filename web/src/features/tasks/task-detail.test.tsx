import { useApolloClient } from "@apollo/client/react";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { alice, bob, renderWithApollo } from "@/test/render";
import { AddCommentDocument, TaskDocument, UsersDocument } from "@/gql/graphql";
import { TaskDetail } from "./task-detail";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const comment = (id: string, body: string, author: typeof alice) => ({
  __typename: "Comment" as const,
  id,
  body,
  createdAt: "2026-10-28T09:00:00.000Z",
  author,
});

const task = {
  __typename: "Task",
  id: "t1",
  title: "Write launch copy",
  description: "Hero and pricing sections",
  status: "TODO",
  createdAt: "2026-10-27T09:00:00.000Z",
  updatedAt: "2026-10-28T09:00:00.000Z",
  assignee: bob,
  board: { __typename: "Board", id: "b1", name: "Website relaunch" },
  comments: [comment("c1", "Draft is in the doc", bob)],
};

const taskMock = (data: typeof task) => ({
  request: { query: TaskDocument, variables: { id: "t1" } },
  result: { data: { task: data } },
});

const mocks = [
  taskMock(task),
  { request: { query: UsersDocument }, result: { data: { users: [alice, bob] } } },
  {
    request: {
      query: AddCommentDocument,
      variables: { input: { taskId: "t1", body: "Looks good to me" } },
    },
    result: { data: { addComment: comment("c2", "Looks good to me", alice) } },
  },
];

describe("TaskDetail", () => {
  it("shows the task and posts a comment after the existing ones", async () => {
    const user = userEvent.setup();
    renderWithApollo(<TaskDetail id="t1" />, mocks);

    expect(await screen.findByRole("heading", { name: "Write launch copy" })).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toHaveValue("Hero and pricing sections");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();

    await user.type(screen.getByLabelText("Add a comment"), "Looks good to me");
    await user.click(screen.getByRole("button", { name: "Post comment" }));

    const comments = screen.getByRole("region", { name: /Comments/ });
    await waitFor(() => expect(within(comments).getAllByRole("listitem")).toHaveLength(2));
    const items = within(comments).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining("Draft is in the doc"),
      expect.stringContaining("Looks good to me"),
    ]);
    expect(items[1]).toHaveTextContent("Alice Santos");
    expect(screen.getByLabelText("Add a comment")).toHaveValue("");
  });

  it("keeps unsaved edits when the task changes elsewhere", async () => {
    const user = userEvent.setup();
    function LiveRefetch() {
      const client = useApolloClient();
      return <button onClick={() => client.refetchQueries({ include: ["Task"] })}>Refetch</button>;
    }
    renderWithApollo(
      <>
        <TaskDetail id="t1" />
        <LiveRefetch />
      </>,
      [...mocks, taskMock({ ...task, status: "DONE", updatedAt: "2026-10-29T09:00:00.000Z" })],
    );

    const title = await screen.findByLabelText("Title");
    await user.type(title, " today");
    await user.click(screen.getByRole("button", { name: "Refetch" }));

    // The untouched status follows the server; the edited title is kept.
    await waitFor(() => expect(screen.getByLabelText("Status")).toHaveValue("DONE"));
    expect(title).toHaveValue("Write launch copy today");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
  });
});
