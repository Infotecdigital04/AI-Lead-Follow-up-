import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { readFile } from "node:fs/promises";
const port = Number(process.env.PORT || 8787);
const origin = `http://127.0.0.1:${port}`;
const mf = new Miniflare(
  convertV4MiniflareOptions({
    host: "127.0.0.1",
    port,
    resourcePersistencePath: "work/local-d1",
    workers: [
      {
        name: "relaynest",
        modules: true,
        scriptPath: "work/worker/worker.js",
        compatibilityDate: "2026-09-01",
        d1Databases: { DB: "relaynest" },
        bindings: {
          APP_ORIGIN: origin,
          PADDLE_ENV: "sandbox",
          EMAIL_FROM: "Relaynest <hello@infotecdigital.com>",
        },
        assets: {
          directory: "dist",
          binding: "ASSETS",
          run_worker_first: ["/api/*"],
          routerConfig: { has_user_worker: true },
          assetConfig: { not_found_handling: "single-page-application" },
        },
      },
    ],
  }),
);
await mf.ready;
const db = await mf.getD1Database("DB");
const exists = await db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
  .first();
if (!exists)
  await db.exec(await readFile("migrations/0001_initial.sql", "utf8"));
console.log(`Relaynest preview ready at ${origin}`);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await mf.dispose();
    process.exit(0);
  });
