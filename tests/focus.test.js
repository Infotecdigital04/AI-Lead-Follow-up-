import test from "node:test";
import assert from "node:assert/strict";
import { focusItems } from "../src/focus.js";
const row = (id, kind, data) => ({ id, kind, data });
test("daily focus excludes closed, future and unscheduled records", () => {
  const records = [
    row("closed", "leads", { followup: "2026-10-01", status: "Converted" }),
    row("lost", "leads", { followup: "2026-10-01", status: "Lost" }),
    row("later", "tasks", { due: "2026-10-05", status: "Pending" }),
    row("done", "tasks", { due: "2026-10-03", status: "Completed" }),
    row("job", "jobs", { due: "2026-10-03", stage: "Completed" }),
    row("undated", "leads", { status: "New" }),
    row("invoice", "invoices", { due: "2026-10-01" }),
  ];
  assert.deepEqual(focusItems(records, "2026-10-04"), []);
});
test("daily focus sorts oldest first and does not mutate records", () => {
  const records = [
    row("new", "leads", { followup: "2026-10-04", status: "New" }),
    row("task", "tasks", { due: "2026-10-01", status: "Blocked" }),
    row("job", "jobs", { due: "2026-10-02", stage: "Ready" }),
  ];
  const original = structuredClone(records);
  assert.deepEqual(
    focusItems(records, "2026-10-04").map((item) => item.record.id),
    ["task", "job", "new"],
  );
  assert.deepEqual(records, original);
});
test("completing a task removes it from the dated queue", () => {
  const task = row("task", "tasks", { due: "2026-10-04", status: "Pending" });
  assert.equal(focusItems([task], "2026-10-04").length, 1);
  assert.equal(
    focusItems(
      [{ ...task, data: { ...task.data, status: "Completed" } }],
      "2026-10-04",
    ).length,
    0,
  );
});
