import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8787";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {}),
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 980 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await mkdir("test-results", { recursive: true });
try {
  await page.goto(base + "/demo/overview");
  await page
    .getByRole("heading", { name: "A little follow-up. A lot of possibility." })
    .waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "test-results/workspace-desktop.png",
    fullPage: true,
  });
  await page.screenshot({ path: "test-results/workspace-preview.png" });
  await page.getByRole("button", { name: "New lead", exact: true }).click();
  await page.getByLabel("Name *", { exact: true }).fill("Browser Test Lead");
  await page.getByLabel("Service *", { exact: true }).fill("Test service");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("test@example.com");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page.getByRole("link", { name: /^Leads/ }).click();
  await page
    .getByRole("textbox", { name: "Search records" })
    .fill("Browser Test Lead");
  assert.equal(await page.locator("tbody tr").count(), 1);
  await page
    .getByRole("button", { name: /Browser Test Lead/ })
    .first()
    .click();
  await page.getByRole("button", { name: "Prepare a follow-up" }).click();
  await page.getByRole("heading", { name: "A thoughtful follow-up" }).waitFor();
  await page.getByRole("button", { name: "Approve demo draft" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page.reload();
  await page
    .getByRole("textbox", { name: "Search records" })
    .fill("Browser Test Lead");
  assert.equal(await page.locator("tbody tr").count(), 1);
  await page
    .getByRole("button", { name: /Browser Test Lead/ })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Delete record", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .filter({ has: page.getByRole("heading", { name: "Delete this record?" }) })
    .getByRole("button", { name: "Delete record", exact: true })
    .click();
  await page.getByRole("heading", { name: "Nothing here yet" }).waitFor();
  await page.goto(base + "/portal/demo");
  await page
    .getByRole("heading", { name: "Your service, in the picture." })
    .waitFor();
  assert.equal(
    (await page.locator("body").innerText()).includes("Parts supplier"),
    false,
  );
  assert.equal(
    (await page.locator("body").innerText()).includes("Internal: inspect"),
    false,
  );
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/pricing",
      "/demo/overview",
      "/demo/leads",
      "/demo/appointments",
      "/demo/jobs",
      "/demo/tasks",
      "/demo/reports",
      "/portal/demo",
      "/login",
    ]) {
      await page.goto(base + route);
      await page.locator("h1").first().waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      assert.equal(
        overflow,
        false,
        `Horizontal overflow at ${route}, ${width}`,
      );
      await page.screenshot({
        path: `test-results/${route.replaceAll("/", "-") || "home"}-${width}.png`,
        fullPage: true,
      });
    }
  }
  await page.goto(base + "/demo/overview");
  await page.locator(".topbar-right select").selectOption("ar");
  assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
  assert.equal(await page.locator("html").getAttribute("lang"), "ar");
  await page.screenshot({
    path: "test-results/arabic-mobile.png",
    fullPage: true,
  });
  await page.locator(".topbar-right select").selectOption("en");
  const denied = await page.request.get(base + "/api/workspace/records");
  assert.equal(denied.status(), 401);
  const forged = await page.request.post(base + "/api/billing/webhook", {
    data: { event_id: "forged" },
  });
  assert.equal(forged.status(), 401);
  const crossOrigin = await page.request.post(base + "/api/business", {
    headers: { Origin: "https://evil.example" },
    data: { name: "Test" },
  });
  assert.equal(crossOrigin.status(), 403);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: lead CRUD, draft approval, persistence, portal privacy, 20 responsive routes, RTL, auth protection, webhook rejection, CSRF protection.",
  );
  await writeFile(
    "test-results/browser-results.json",
    JSON.stringify(
      { passed: true, errors, viewports: [1440, 390], testedRoutes: 10 },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
