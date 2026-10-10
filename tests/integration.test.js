import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { hash } from "../server/security.js";
import { createHmac } from "node:crypto";
let mf, db;
const origin = "https://relaynest.test";
before(async () => {
  mf = new Miniflare(
    convertV4MiniflareOptions({
      modules: true,
      scriptPath: "work/worker/worker.js",
      compatibilityDate: "2026-09-01",
      d1Databases: { DB: "test-db" },
      bindings: {
        APP_ORIGIN: origin,
        PADDLE_WEBHOOK_SECRET: "test-hook-secret",
      },
    }),
  );
  await mf.ready;
  db = await mf.getD1Database("DB");
  await db.exec(await readFile("migrations/0001_initial.sql", "utf8"));
  for (const [id, email] of [
    ["u1", "one@example.com"],
    ["u2", "two@example.com"],
    ["client", "client@example.com"],
  ]) {
    await db
      .prepare("INSERT INTO users(id,email) VALUES (?,?)")
      .bind(id, email)
      .run();
    await db
      .prepare(
        "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES (?,?,?)",
      )
      .bind(await hash(id), id, Date.now() + 60000)
      .run();
  }
  for (const [id, uid] of [
    ["b1", "u1"],
    ["b2", "u2"],
  ]) {
    await db
      .prepare("INSERT INTO businesses(id,name) VALUES (?,?)")
      .bind(id, id)
      .run();
    await db
      .prepare(
        "INSERT INTO memberships(user_id,business_id,role) VALUES (?,?,'owner')",
      )
      .bind(uid, id)
      .run();
    await db
      .prepare(
        "INSERT INTO subscriptions(business_id,status) VALUES (?,'active')",
      )
      .bind(id)
      .run();
  }
});
after(async () => {
  await mf?.dispose();
});
const request = (
  path,
  { user = "u1", method = "GET", data, headers = {} } = {},
) =>
  mf.dispatchFetch(origin + "/api" + path, {
    method,
    headers: {
      Origin: origin,
      Cookie: `relaynest_session=${user}`,
      "Content-Type": "application/json",
      ...headers,
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
test("D1 API isolates tenants, persists changes, and gates inactive subscriptions", async () => {
  const created = await request("/workspace/records/leads", {
    method: "POST",
    data: { name: "Tenant One", service: "Repair" },
  });
  assert.equal(created.status, 201);
  const record = await created.json();
  const other = await request("/workspace/records", { user: "u2" });
  assert.deepEqual(await other.json(), []);
  const denied = await request("/workspace/records/" + record.id, {
    user: "u2",
    method: "PATCH",
    data: { name: "Stolen" },
  });
  assert.equal(denied.status, 404);
  const allowed = await request("/workspace/records/" + record.id, {
    method: "PATCH",
    data: { status: "Contacted" },
  });
  assert.equal(allowed.status, 200);
  await db
    .prepare(
      "UPDATE subscriptions SET status='past_due' WHERE business_id='b1'",
    )
    .run();
  assert.equal((await request("/workspace/records")).status, 402);
  await db
    .prepare("UPDATE subscriptions SET status='active' WHERE business_id='b1'")
    .run();
});
test("Real portal route requires the exact customer email and strips private data", async () => {
  const created = await request("/workspace/records/jobs", {
    method: "POST",
    data: {
      title: "Repair",
      customer: "Client",
      email: "client@example.com",
      notes: "SECRET NOTE",
      updates: [
        { text: "Public progress", date: "2026-10-01", visible: true },
        { text: "SECRET UPDATE", date: "2026-10-01", visible: false },
      ],
    },
  });
  const r = await created.json();
  assert.equal((await request("/portal/" + r.id, { user: "u2" })).status, 404);
  const portal = await request("/portal/" + r.id, { user: "client" });
  assert.equal(portal.status, 200);
  const body = await portal.text();
  assert.equal(body.includes("SECRET"), false);
  assert.equal(body.includes("Public progress"), true);
});
test("Webhook handles duplicate and out-of-order subscription events without reactivation", async () => {
  async function send(id, status, occurred) {
    const ts = Math.floor(Date.now() / 1000);
    const data = {
      event_id: id,
      event_type: "subscription.updated",
      occurred_at: occurred,
      data: {
        id: "sub_test",
        status,
        custom_data: { business_id: "b2", plan: "starter" },
      },
    };
    const body = JSON.stringify(data);
    const h = createHmac("sha256", "test-hook-secret")
      .update(`${ts}:${body}`)
      .digest("hex");
    return request("/billing/webhook", {
      method: "POST",
      data,
      headers: { "Paddle-Signature": `ts=${ts};h1=${h}` },
    });
  }
  assert.equal(
    (await send("evt-new", "canceled", "2026-10-03T10:00:00Z")).status,
    200,
  );
  assert.equal(
    (await send("evt-new", "canceled", "2026-10-03T10:00:00Z")).status,
    200,
  );
  assert.equal(
    (await send("evt-old", "active", "2026-10-02T10:00:00Z")).status,
    200,
  );
  assert.equal(
    (
      await db
        .prepare("SELECT status FROM subscriptions WHERE business_id='b2'")
        .first()
    ).status,
    "canceled",
  );
});
test("No configured provider means no live signup or payment", async () => {
  assert.equal(
    (
      await request("/auth/request", {
        method: "POST",
        data: { email: "test@example.com" },
      })
    ).status,
    503,
  );
  assert.equal(
    (
      await request("/billing/checkout", {
        method: "POST",
        data: { plan: "starter", interval: "monthly" },
      })
    ).status,
    503,
  );
});
