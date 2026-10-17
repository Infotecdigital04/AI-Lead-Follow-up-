import test from "node:test";
import assert from "node:assert/strict";
import {
  verifyPaddle,
  clientJob,
  canAccessRecord,
} from "../server/security.js";
import { schemas } from "../server/schemas.js";
import { createHmac } from "node:crypto";
test("Paddle signatures reject forged, modified and stale payloads", async () => {
  const body = JSON.stringify({ event_id: "evt_test" }),
    secret = "test-secret",
    now = Date.now(),
    ts = Math.floor(now / 1000);
  const signature = createHmac("sha256", secret)
    .update(`${ts}:${body}`)
    .digest("hex");
  assert.equal(
    await verifyPaddle(body, `ts=${ts};h1=${signature}`, secret, now),
    true,
  );
  assert.equal(
    await verifyPaddle(body + " ", `ts=${ts};h1=${signature}`, secret, now),
    false,
  );
  assert.equal(
    await verifyPaddle(body, `ts=${ts};h1=${signature}`, secret, now + 301000),
    false,
  );
  assert.equal(await verifyPaddle(body, `ts=${ts};h1=bad`, secret, now), false);
  assert.equal(await verifyPaddle(body, null, secret, now), false);
});
test("Client portal never exposes internal notes, email or hidden updates", () => {
  const result = clientJob({
    id: "job1",
    data: {
      title: "Repair",
      customer: "Alex",
      stage: "Booked",
      due: "2026-10-10",
      notes: "SECRET",
      email: "private@example.com",
      updates: [
        { text: "Visible", visible: true, date: "2026-10-01" },
        { text: "SECRET", visible: false, date: "2026-10-01" },
      ],
    },
  });
  assert.equal(JSON.stringify(result).includes("SECRET"), false);
  assert.equal(result.email, undefined);
  assert.equal(result.updates.length, 1);
});
test("Staff can only access their assigned record", () => {
  const r = { data: { assignee: "staff1" } };
  assert.equal(canAccessRecord("staff", "staff2", r), false);
  assert.equal(canAccessRecord("staff", "staff1", r), true);
  assert.equal(canAccessRecord("owner", "owner", r), true);
});
test("Lead validation blocks invalid status and malicious extra fields", () => {
  assert.throws(() =>
    schemas.leads.parse({ name: "Alex", service: "Repair", status: "admin" }),
  );
  const d = schemas.leads.parse({
    name: "Alex",
    service: "Repair",
    business_id: "other-tenant",
  });
  assert.equal(d.business_id, undefined);
});
test("Invoice cannot record more money than the total", () => {
  assert.throws(() =>
    schemas.invoices.parse({
      number: "INV-1",
      customer: "Alex",
      amount: 100,
      paid: 101,
    }),
  );
});
