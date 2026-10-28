// Browser rehearsal of every web workflow, run as Alice and Bob side by side.
// Usage: pnpm rehearse  (WEB_URL defaults to http://localhost:3000; needs Google Chrome)
// Creates its own board and deletes it at the end.
import { chromium } from "playwright-core";

const WEB_URL = process.env.WEB_URL ?? "http://localhost:3000";
const BOARD = `Rehearsal ${Date.now() % 10000}`;
const TASK = "Rehearse the demo";
const results = [];
const consoleErrors = new Set();

const browser = await chromium.launch({ channel: "chrome" });

async function openSession() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await context.newPage();
  page.on("console", (m) => m.type() === "error" && consoleErrors.add(m.text().slice(0, 200)));
  page.on("pageerror", (e) => consoleErrors.add(e.message));
  return page;
}

async function step(label, run) {
  try {
    await run();
    results.push({ label, ok: true });
  } catch (error) {
    results.push({ label, ok: false, detail: error.message.split("\n")[0] });
  }
}

async function signIn(page, email, password = "password123") {
  await page.goto(`${WEB_URL}/login`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

const lane = (page, name) => page.getByRole("region", { name: new RegExp(`^${name}`) });
const waitForText = (page, text) => page.getByText(text).first().waitFor({ timeout: 5000 });
// Next keeps visited pages mounted but hidden, so only count visible matches.
const visibleCount = (locator) => locator.filter({ visible: true }).count();

const alice = await openSession();
const bob = await openSession();

await step("signed-out visit redirects to login", async () => {
  await alice.goto(`${WEB_URL}/boards`);
  await alice.waitForURL("**/login");
});
await step("wrong password shows an error", async () => {
  await signIn(alice, "alice@example.com", "wrong-password");
  await alice.getByRole("alert").filter({ hasText: "Invalid email or password" }).waitFor();
});
await step("Alice signs in and sees the seeded boards", async () => {
  await signIn(alice, "alice@example.com");
  await alice.waitForURL("**/boards");
  await waitForText(alice, "Website relaunch");
  await waitForText(alice, "Mobile app beta");
});
await step("Bob signs in and opens My tasks", async () => {
  await signIn(bob, "bob@example.com");
  await bob.waitForURL("**/boards");
  await bob.getByRole("link", { name: "My tasks" }).click();
  await bob.waitForURL("**/my-tasks");
});
await step("new board validates, then creates", async () => {
  await alice.getByRole("button", { name: "New board" }).click();
  await alice.getByRole("button", { name: "Create board" }).click();
  await alice.getByLabel("Board name").fill(BOARD);
  await alice.getByRole("button", { name: "Create board" }).click();
  await waitForText(alice, "Board created");
});
await step("board shows three lanes and owner actions", async () => {
  await alice.getByRole("link", { name: new RegExp(BOARD) }).first().click();
  await alice.waitForURL("**/boards/*");
  for (const name of ["To do", "In progress", "Done"]) await lane(alice, name).waitFor();
  await alice.getByRole("button", { name: "Rename" }).waitFor();
});
await step("task assigned to Bob lands in To do", async () => {
  await alice.getByRole("button", { name: "+ Add task" }).click();
  await alice.getByLabel("Title").fill(TASK);
  await alice.getByLabel("Assignee").selectOption({ label: "Bob Reyes" });
  await alice.getByRole("dialog").getByRole("button", { name: "Add task" }).click();
  await lane(alice, "To do").getByText(TASK).waitFor();
});
await step("Bob gets the live assignment toast", () =>
  waitForText(bob, `Alice Santos assigned you "${TASK}"`),
);
await step("Bob's My tasks shows the new task", () => waitForText(bob, TASK));
await step("Move menu moves the card to In progress", async () => {
  await alice.getByRole("button", { name: `Move ${TASK}` }).click();
  await alice.getByRole("button", { name: "Move to In progress" }).click();
  await lane(alice, "In progress").getByText(TASK).waitFor();
});
await step("drag and drop moves the card to Done", async () => {
  await lane(alice, "In progress").getByText(TASK).dragTo(lane(alice, "Done"));
  await lane(alice, "Done").getByText(TASK).waitFor();
});
await step("the move is saved (survives a reload)", async () => {
  await alice.reload();
  await lane(alice, "Done").getByText(TASK).waitFor();
});
await step("task detail saves changes", async () => {
  await alice.getByRole("link", { name: TASK }).click();
  await alice.waitForURL("**/tasks/*");
  await alice.getByLabel("Title").fill(`${TASK} today`);
  await alice.getByRole("button", { name: "Save changes" }).click();
  await waitForText(alice, "Changes saved");
});
await step("comment posts", async () => {
  await alice.getByLabel("Add a comment").fill("Ready for the walkthrough.");
  await alice.getByRole("button", { name: "Post comment" }).click();
  await waitForText(alice, "Ready for the walkthrough.");
});
await step("Bob sees no owner actions on Alice's board", async () => {
  await bob.goto(alice.url());
  await bob.getByRole("link", { name: BOARD }).first().click();
  await lane(bob, "Done").waitFor();
  if (await visibleCount(bob.getByRole("button", { name: "Rename" }))) throw new Error("Rename visible");
});
await step("delete task returns to its board", async () => {
  await alice.getByRole("button", { name: "Delete task" }).click();
  await alice.getByRole("dialog").getByRole("button", { name: "Delete task" }).click();
  await alice.waitForURL("**/boards/*");
  await lane(alice, "Done").waitFor();
  if (await visibleCount(alice.getByText(`${TASK} today`))) throw new Error("task still shown");
});
await step("rename board", async () => {
  await alice.getByRole("button", { name: "Rename" }).click();
  await alice.getByLabel("Board name").fill(`${BOARD} v2`);
  await alice.getByRole("button", { name: "Save name" }).click();
  await alice.getByRole("heading", { name: `${BOARD} v2` }).waitFor();
});
await step("delete board returns to the list", async () => {
  await alice.getByRole("button", { name: "Delete board" }).click();
  await alice.getByRole("dialog").getByRole("button", { name: "Delete board" }).click();
  await alice.waitForURL(/\/boards$/);
  await waitForText(alice, "Website relaunch");
  if (await visibleCount(alice.getByText(`${BOARD} v2`))) throw new Error("board still listed");
});
await step("My tasks groups Alice's tasks", async () => {
  await alice.getByRole("link", { name: "My tasks" }).click();
  await waitForText(alice, "Pick a new type scale");
});
await step("sign out protects routes again", async () => {
  await alice.getByRole("button", { name: "Sign out" }).click();
  await alice.waitForURL("**/login");
  await alice.goto(`${WEB_URL}/my-tasks`);
  await alice.waitForURL("**/login");
});
await step("phone width has no horizontal scroll", async () => {
  await bob.setViewportSize({ width: 390, height: 844 });
  await bob.goto(`${WEB_URL}/boards`);
  await waitForText(bob, "Website relaunch");
  const overflow = await bob.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (overflow > 0) throw new Error(`overflows by ${overflow}px`);
});

await browser.close();
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"} ${r.label}${r.ok ? "" : `: ${r.detail}`}`);
console.log(consoleErrors.size ? `\nConsole errors:\n${[...consoleErrors].join("\n")}` : "\nNo console errors");
const failed = results.filter((r) => !r.ok).length + consoleErrors.size;
console.log(failed ? `${failed} problem(s) found` : "All steps passed");
process.exit(failed ? 1 : 0);
