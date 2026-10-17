import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { seed, today } from "../src/data.js";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8796";
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
    "C:/Users/Admin/AppData/Local/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe",
});
const errors = [],
  results = [];
await mkdir("test-results/workspace-polish", { recursive: true });
const fixture = seed();
for (const record of fixture) {
  if (record.kind === "leads") record.data.followup = "2026-01-01";
  if (["tasks", "jobs"].includes(record.kind)) record.data.due = today();
}
async function audit(page, label) {
  const problems = await page.evaluate(() => {
    const issues = [];
    if (document.documentElement.scrollWidth > innerWidth + 1)
      issues.push("page overflow");
    for (const el of document.querySelectorAll(
      ".focus-row,.focus-record,.focus-top,.workspace-heading,.stat,.focus-filters",
    )) {
      if (el.scrollWidth > el.clientWidth + 2)
        issues.push("content overflow: " + el.className);
    }
    for (const el of document.querySelectorAll(
      ".focus-row,.focus-filters button,.focus-expand",
    )) {
      if (el.getBoundingClientRect().height < 44)
        issues.push("small touch target");
    }
    return issues;
  });
  results.push({ label, problems });
  assert.deepEqual(problems, [], label);
}
try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript((records) => {
      if (!localStorage.getItem("relaynest-demo-v1"))
        localStorage.setItem("relaynest-demo-v1", JSON.stringify(records));
    }, fixture);
    await page.goto(base + "/demo/overview");
    await page.getByRole("heading", { name: "Your next steps." }).waitFor();
    await audit(page, `overview ${width}`);
    await page.screenshot({
      path: `test-results/workspace-polish/overview-${width}.png`,
      fullPage: true,
    });
    assert.equal(await page.locator(".focus-row").count(), 3);
    await page.locator(".focus-expand").click();
    assert.ok((await page.locator(".focus-row").count()) > 3);
    await page.locator(".focus-expand").click();
    assert.equal(await page.locator(".focus-row").count(), 3);
    for (const [label, kind] of [
      ["Follow-ups", "leads"],
      ["Tasks", "tasks"],
      ["Services", "jobs"],
    ]) {
      const tab = page
        .locator(".focus-filters button")
        .filter({ hasText: label });
      await tab.click();
      assert.equal(await tab.getAttribute("aria-pressed"), "true");
      assert.ok((await page.locator(`.focus-symbol.${kind}`).count()) > 0);
      assert.equal(
        await page.locator(`.focus-symbol:not(.${kind})`).count(),
        0,
      );
      await page.locator(".focus-row").first().focus();
      await page.keyboard.press("Enter");
      await page.getByRole("dialog").waitFor();
      await page.keyboard.press("Escape");
      await page.getByRole("dialog").waitFor({ state: "hidden" });
    }
    if (width <= 760) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page.locator(".sidebar.mobile-open").waitFor();
      await page.locator(".sidebar nav a").filter({ hasText: "Leads" }).click();
      await page.locator(".sidebar.mobile-open").waitFor({ state: "hidden" });
    }
    for (const route of [
      "leads",
      "customers",
      "appointments",
      "jobs",
      "tasks",
      "invoices",
      "reports",
      "settings",
    ]) {
      await page.goto(base + "/demo/" + route);
      await page.locator(".workspace-heading").waitFor();
      await audit(page, `${route} ${width}`);
    }
    await page.evaluate(() => localStorage.setItem("relaynest-demo-v1", "[]"));
    await page.goto(base + "/demo/overview");
    await page.locator(".focus-clear").waitFor();
    assert.equal(await page.locator(".focus-row").count(), 0);
    await audit(page, `empty ${width}`);
    await page.evaluate(
      (date) =>
        localStorage.setItem(
          "relaynest-demo-v1",
          JSON.stringify([
            {
              id: "long-name",
              kind: "tasks",
              data: {
                title:
                  "Prepare the detailed consultation and project handover for Alexandra Montgomery-Wellington",
                status: "Pending",
                due: date,
              },
            },
          ]),
        ),
      today(),
    );
    await page.goto(base + "/demo/overview");
    await page.locator(".focus-row").waitFor();
    await audit(page, `long title ${width}`);
    await page
      .locator(".focus-filters button")
      .filter({ hasText: "Follow-ups" })
      .click();
    await page.getByText("Nothing due in this category.").waitFor();
    await page.close();
    console.log(`Workspace verified at ${width}px`);
  }
  assert.deepEqual(errors, []);
  await writeFile(
    "test-results/workspace-polish/results.json",
    JSON.stringify({ results, errors }, null, 2),
  );
  console.log(
    `${results.length} workspace layout states and queue interactions passed.`,
  );
} finally {
  await browser.close();
}
