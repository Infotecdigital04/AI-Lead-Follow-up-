// Daily follow-up reminders, triggered by the cron in wrangler.jsonc.
// Emails each active workspace owner a digest of leads due for follow-up today.
// Reminders go to the owner (not to customers), so this stays low-risk.
export async function runReminders(env) {
  const resendKey =
    env.RESEND_API_KEY && typeof env.RESEND_API_KEY.get === "function"
      ? await env.RESEND_API_KEY.get()
      : env.RESEND_API_KEY;
  if (!resendKey || !env.EMAIL_FROM) return;
  const today = new Date().toISOString().slice(0, 10);
  const { results: owners } = await env.DB.prepare(
    "SELECT b.id AS business_id, b.name AS business_name, u.email AS email " +
      "FROM businesses b " +
      "JOIN memberships m ON m.business_id=b.id AND m.role='owner' " +
      "JOIN users u ON u.id=m.user_id " +
      "JOIN subscriptions s ON s.business_id=b.id " +
      "WHERE s.status IN ('active','trialing')",
  ).all();
  for (const o of owners || []) {
    if (!o.email) continue;
    const { results: rows } = await env.DB.prepare(
      "SELECT data FROM records WHERE business_id=? AND kind='leads'",
    )
      .bind(o.business_id)
      .all();
    const due = (rows || [])
      .map((r) => {
        try {
          return JSON.parse(r.data);
        } catch {
          return null;
        }
      })
      .filter(
        (d) =>
          d &&
          d.followup &&
          String(d.followup).slice(0, 10) <= today &&
          !["Converted", "Lost"].includes(d.status),
      );
    if (!due.length) continue;
    const plural = due.length === 1 ? "" : "s";
    const lines = due
      .slice(0, 20)
      .map((d) => `• ${d.name}${d.service ? " — " + d.service : ""}`)
      .join("\n");
    const extra = due.length > 20 ? `\n…and ${due.length - 20} more.` : "";
    const text =
      `Good morning,\n\n` +
      `You have ${due.length} follow-up${plural} due today at ${o.business_name}:\n\n` +
      `${lines}${extra}\n\n` +
      `Open your workspace to follow up: ${env.APP_ORIGIN}/app/leads\n\n` +
      `— Relaynest`;
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: [o.email],
          subject: `${due.length} follow-up${plural} due today`,
          text,
        }),
      });
    } catch (e) {
      // Best-effort: one owner's failure must not stop the rest.
    }
  }
}
