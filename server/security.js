export const hash = async (value) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
    (n) => n.toString(16).padStart(2, "0"),
  ).join("");
export async function verifyPaddle(body, header, secret, now = Date.now()) {
  if (!header || !secret) return false;
  const parts = header.split(";").map((x) => x.trim().split("="));
  const ts = parts.find((x) => x[0] === "ts")?.[1];
  if (!ts || !/^\d+$/.test(ts) || Math.abs(now / 1000 - Number(ts)) > 300)
    return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  for (const [, value] of parts.filter((x) => x[0] === "h1")) {
    if (!/^[a-f0-9]{64}$/i.test(value)) continue;
    const sig = Uint8Array.from(value.match(/../g), (h) => parseInt(h, 16));
    if (
      await crypto.subtle.verify(
        "HMAC",
        key,
        sig,
        new TextEncoder().encode(`${ts}:${body}`),
      )
    )
      return true;
  }
  return false;
}
export function clientJob(record) {
  const d = record.data;
  return {
    id: record.id,
    title: d.title,
    customer: d.customer,
    stage: d.stage,
    due: d.due,
    updates: d.updates
      .filter((u) => u.visible)
      .map(({ text, date }) => ({ text, date })),
  };
}
export function canAccessRecord(role, userId, record) {
  return role === "owner" || record.data.assignee === userId;
}
