import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusPill } from "./status-pill";

describe("StatusPill", () => {
  it.each([
    ["TODO", "To do", "bg-todo-tint"],
    ["IN_PROGRESS", "In progress", "bg-progress-tint"],
    ["DONE", "Done", "bg-done-tint"],
  ] as const)("labels %s as %s with its tint", (status, label, tint) => {
    render(<StatusPill status={status} />);
    expect(screen.getByText(label)).toHaveClass(tint);
  });
});
