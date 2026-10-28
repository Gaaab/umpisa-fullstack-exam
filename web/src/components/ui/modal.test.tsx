import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmModal, Modal } from "./modal";

describe("Modal", () => {
  it("opens as a labelled dialog and closes when open turns false", () => {
    const { rerender } = render(
      <Modal open title="Rename board" onClose={() => {}}>
        <p>Body</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog", { name: "Rename board" })).toHaveTextContent("Body");

    rerender(
      <Modal open={false} title="Rename board" onClose={() => {}}>
        <p>Body</p>
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("confirms or cancels a destructive action", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmModal
        open
        title={'Delete "Website relaunch" and its tasks?'}
        message="This can't be undone."
        confirmLabel="Delete board"
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete board" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
