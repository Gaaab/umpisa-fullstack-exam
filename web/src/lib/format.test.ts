import { describe, expect, it } from "vitest";
import { initials, timeAgo } from "./format";

const now = new Date("2026-10-29T12:00:00.000Z").getTime();
const ago = (seconds: number) => new Date(now - seconds * 1000).toISOString();

describe("format", () => {
  it("builds initials from the first two names", () => {
    expect(initials("Alice Santos")).toBe("AS");
    expect(initials("carol")).toBe("C");
    expect(initials("Ana Maria de la Cruz")).toBe("AM");
  });

  it.each([
    [10, "just now"],
    [5 * 60, "5 minutes ago"],
    [3 * 3600, "3 hours ago"],
    [26 * 3600, "yesterday"],
    [10 * 86400, "last week"],
    [60 * 86400, "Aug 30, 2026"],
  ])("formats %is ago as %s", (seconds, expected) => {
    expect(timeAgo(ago(seconds), now)).toBe(expected);
  });
});
