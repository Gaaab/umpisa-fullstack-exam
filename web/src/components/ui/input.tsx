import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const fieldClasses =
  "w-full rounded-field border border-line bg-paper px-3 text-body text-ink transition-colors placeholder:text-graphite focus:border-cobalt focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-cobalt/25 aria-invalid:border-brick";

type FieldProps = { label: string; error?: string; hideLabel?: boolean };

// Wires the label and error message to the control for screen readers.
function Field({
  label,
  error,
  hideLabel,
  id,
  children,
}: FieldProps & { id?: string; children: (ids: { id: string; errorId?: string }) => ReactNode }) {
  const fallbackId = useId();
  const controlId = id ?? fallbackId;
  const errorId = error ? `${controlId}-error` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={controlId}
        className={hideLabel ? "sr-only" : "text-meta font-semibold text-ink"}
      >
        {label}
      </label>
      {children({ id: controlId, errorId })}
      {error && (
        <p id={errorId} className="text-meta text-brick">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({
  label,
  error,
  hideLabel,
  id,
  className = "",
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} error={error} hideLabel={hideLabel} id={id}>
      {(ids) => (
        <input
          id={ids.id}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.errorId}
          className={`${fieldClasses} h-10 ${className}`}
          {...props}
        />
      )}
    </Field>
  );
}

export function Textarea({
  label,
  error,
  hideLabel,
  id,
  className = "",
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} error={error} hideLabel={hideLabel} id={id}>
      {(ids) => (
        <textarea
          id={ids.id}
          rows={4}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.errorId}
          className={`${fieldClasses} resize-y py-2 ${className}`}
          {...props}
        />
      )}
    </Field>
  );
}

export function Select({
  label,
  error,
  hideLabel,
  id,
  className = "",
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field label={label} error={error} hideLabel={hideLabel} id={id}>
      {(ids) => (
        <select
          id={ids.id}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.errorId}
          className={`${fieldClasses} h-10 ${className}`}
          {...props}
        />
      )}
    </Field>
  );
}
