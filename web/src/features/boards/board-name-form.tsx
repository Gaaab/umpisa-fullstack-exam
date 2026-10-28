"use client";

import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const BOARD_NAME_MAX = 60;

type BoardNameFormProps = {
  initialName?: string;
  submitLabel: string;
  onSubmit: (name: string) => Promise<unknown>;
  onCancel: () => void;
};

export function BoardNameForm({ initialName, submitLabel, onSubmit, onCancel }: BoardNameFormProps) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name")).trim();
    if (!name) return setError("Board name is required");
    if (name.length > BOARD_NAME_MAX) return setError(`Use ${BOARD_NAME_MAX} characters or fewer`);
    setPending(true);
    try {
      await onSubmit(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the board. Try again.");
      setPending(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Board name"
        name="name"
        defaultValue={initialName}
        maxLength={BOARD_NAME_MAX}
        autoComplete="off"
        error={error}
      />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
