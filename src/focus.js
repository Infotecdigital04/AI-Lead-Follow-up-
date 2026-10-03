// A dated queue, not a lead score: every priority has a visible reason.
export function focusItems(records, date) {
  return records
    .flatMap((record) => {
      const d = record.data;
      let due, action;
      if (
        record.kind === "leads" &&
        !["Converted", "Lost"].includes(d.status)
      ) {
        due = d.followup;
        action = "Review follow-up";
      } else if (record.kind === "tasks" && d.status !== "Completed") {
        due = d.due;
        action = "Review task";
      } else if (record.kind === "jobs" && d.stage !== "Completed") {
        due = d.due;
        action = "Review service";
      }
      if (!due || due.slice(0, 10) > date) return [];
      return [{ record, due: due.slice(0, 10), action }];
    })
    .sort(
      (a, b) =>
        a.due.localeCompare(b.due) || a.record.id.localeCompare(b.record.id),
    );
}
