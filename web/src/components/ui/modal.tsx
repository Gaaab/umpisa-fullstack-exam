"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./button";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Cleanup also runs when Next hides this route, so an open modal can't leave the next page inert.
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // A click on the dialog itself (not its content) lands on the backdrop.
      onClick={(event) => event.target === ref.current && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-sheet bg-paper p-0 text-ink shadow-xl backdrop:bg-ink/40 open:animate-arrive"
    >
      {open && (
        <div className="flex flex-col gap-5 p-6">
          <h2 id={titleId} className="text-section font-semibold">
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  );
}

type ConfirmModalProps = Omit<ModalProps, "children"> & {
  message: string;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: () => void;
};

export function ConfirmModal({
  message,
  confirmLabel,
  pending,
  onConfirm,
  ...modal
}: ConfirmModalProps) {
  return (
    <Modal {...modal}>
      <p className="text-graphite">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={modal.onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={pending}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
