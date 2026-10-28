import { initials } from "@/lib/format";

// `decorative` skips the spoken name when the name is already shown next to it.
type AvatarProps = { name?: string | null; size?: "sm" | "md"; decorative?: boolean };

export function Avatar({ name, size = "sm", decorative }: AvatarProps) {
  const sizeClasses = size === "sm" ? "size-7 text-[11px]" : "size-8 text-meta";
  if (!name) {
    return (
      <span
        title="Unassigned"
        className={`inline-flex shrink-0 rounded-full border border-dashed border-graphite/60 ${sizeClasses}`}
      >
        <span className="sr-only">Unassigned</span>
      </span>
    );
  }
  return (
    <span
      title={name}
      aria-hidden={decorative}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-ink font-semibold text-paper ${sizeClasses}`}
    >
      <span aria-hidden>{initials(name)}</span>
      {!decorative && <span className="sr-only">{name}</span>}
    </span>
  );
}
