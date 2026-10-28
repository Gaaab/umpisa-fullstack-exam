const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const fullDate = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });
const shortDate = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

const steps: [Intl.RelativeTimeFormatUnit, number][] = [
  ["minute", 60],
  ["hour", 60 * 60],
  ["day", 60 * 60 * 24],
  ["week", 60 * 60 * 24 * 7],
];

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function timeAgo(iso: string, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  if (Math.abs(seconds) < 45) return "just now";
  const [unit, size] =
    steps.findLast(([, size]) => Math.abs(seconds) >= size) ?? steps[0];
  if (unit === "week" && Math.abs(seconds) >= size * 4) return shortDate.format(new Date(iso));
  return relative.format(Math.round(seconds / size), unit);
}

export const formatDate = (iso: string) => fullDate.format(new Date(iso));
