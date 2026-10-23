import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { seed } from "../src/data.js";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8796";
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
    "C:/Users/Admin/AppData/Local/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe",
});
const output = "test-results/platform-ui";
await mkdir(output, { recursive: true });
const results = [],
  errors = [];
async function audit(page, label) {
  const issues = await page.evaluate(() => {
    const issues = [];
    if (document.documentElement.scrollWidth > innerWidth + 1)
      issues.push("page overflow");
    for (const e of document.querySelectorAll(
      ".bk-main,.bk-field,.bk-actions,.inv-editor,.inv-top,.inv-row,.inv-actions,.record-toolbar,.record-result-bar",
    )) {
      if (e.scrollWidth > e.clientWidth + 2)
        issues.push(`overflow: ${e.className}`);
    }
    for (const e of document.querySelectorAll(
      ".bk-page button,.bk-page input,.invoice-editor-dialog button,.invoice-editor-dialog input",
    )) {
      if (e.getClientRects().length && e.getBoundingClientRect().height < 43)
        issues.push(
          `small control: ${e.textContent || e.getAttribute("aria-label")}`,
        );
    }
    return issues;
  });
  results.push({ label, issues });
  assert.deepEqual(issues, [], label);
}
async function bookingToReview(page) {
  await page.getByLabel("Service or enquiry").fill("Initial consultation");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Preferred date").fill("2030-12-20");
  await page.getByLabel("Preferred time (optional)").fill("10:30");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Full name").fill("Jordan Sample");
  await page.getByLabel("Email address").fill("jordan@example.com");
  await page
    .getByLabel("Additional details (optional)")
    .fill("Please call before confirming.");
  await page.getByRole("button", { name: "Review request" }).click();
  await page.getByRole("heading", { name: "Everything look right?" }).waitFor();
}
try {
  for (const width of [1440, 1024, 768, 390]) {
    const page = await browser.newPage({
      viewport: { width, height: 950 },
      reducedMotion: "reduce",
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript((records) => {
      if (!localStorage.getItem("relaynest-demo-v1"))
        localStorage.setItem("relaynest-demo-v1", JSON.stringify(records));
    }, seed());
    await page.goto(base + "/book/demo");
    await page.getByLabel("Service or enquiry").waitFor();
    await audit(page, `booking service ${width}`);
    await page.screenshot({
      path: `${output}/booking-${width}.png`,
      fullPage: true,
    });
    await bookingToReview(page);
    await audit(page, `booking review ${width}`);
    await page.screenshot({
      path: `${output}/booking-review-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Edit contact details" }).click();
    assert.equal(
      await page.getByLabel("Email address").inputValue(),
      "jordan@example.com",
    );
    await page.getByLabel("Email address").fill("");
    await page.getByRole("button", { name: "Review request" }).click();
    await page.getByRole("alert").waitFor();
    await page.getByLabel("Email address").fill("invalid");
    await page.getByRole("button", { name: "Review request" }).click();
    assert.equal(
      await page
        .getByLabel("Email address")
        .evaluate((el) => el.validity.valid),
      false,
    );
    await page.getByLabel("Email address").fill("jordan@example.com");
    await page.getByRole("button", { name: "Review request" }).click();
    await page.getByRole("button", { name: "Save demo request" }).click();
    await page.getByRole("heading", { name: "Demo request saved" }).waitFor();
    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("relaynest-demo-v1")).find(
        (r) => r.data.name === "Jordan Sample",
      ),
    );
    assert.equal(saved.data.source, "Booking");
    assert.match(saved.data.notes, /10:30/);
    await audit(page, `booking success ${width}`);
    await page.goto(base + "/demo/invoices");
    await page
      .getByRole("button", { name: "Create invoice", exact: true })
      .click();
    const editor = page.getByRole("dialog", { name: "New invoice" });
    await editor
      .getByLabel("Customer *", { exact: true })
      .fill("Jordan Sample");
    await editor
      .getByLabel("Description for line 1")
      .fill("Consultation and project planning");
    await editor.getByLabel("Quantity for line 1").fill("2");
    await editor.getByLabel("Rate for line 1").fill("100");
    await editor.getByLabel("Discount (USD)").fill("20");
    await editor.getByLabel("Tax %").fill("10");
    await editor.getByLabel("Paid", { exact: true }).fill("50");
    assert.match(await editor.locator(".inv-total").innerText(), /198/);
    assert.match(await editor.locator(".inv-due").innerText(), /148/);
    await editor.getByRole("button", { name: "Add line item" }).click();
    await editor.getByLabel("Description for line 2").fill("Optional work");
    await editor.getByRole("button", { name: "Remove line 2" }).click();
    await audit(page, `invoice editor ${width}`);
    await page.screenshot({
      path: `${output}/invoice-editor-${width}.png`,
      fullPage: true,
    });
    await editor.getByRole("button", { name: "Preview", exact: true }).click();
    const preview = page.getByRole("dialog", { name: "Invoice preview" });
    await preview.waitFor();
    assert.match(await preview.locator(".inv-doc-balance").innerText(), /148/);
    await audit(page, `invoice preview ${width}`);
    await page.screenshot({
      path: `${output}/invoice-preview-${width}.png`,
      fullPage: true,
    });
    await page.keyboard.press("Escape");
    await preview.waitFor({ state: "hidden" });
    assert.equal(
      await editor.getByLabel("Quantity for line 1").inputValue(),
      "2",
    );
    await editor
      .getByRole("button", { name: "Create invoice", exact: true })
      .click();
    await editor.waitFor({ state: "hidden" });
    const invoice = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("relaynest-demo-v1")).find(
        (r) => r.kind === "invoices" && r.data.customer === "Jordan Sample",
      ),
    );
    assert.equal(invoice.data.amount, 198);
    assert.equal(invoice.data.status, "Partial");
    for (const route of ["leads", "customers", "invoices", "settings"]) {
      await page.goto(base + "/demo/" + route);
      await page.locator(".workspace-content").waitFor();
      await audit(page, `${route} ${width}`);
      await page.screenshot({
        path: `${output}/${route}-${width}.png`,
        fullPage: true,
      });
    }
    await page.goto(base + "/demo/leads");
    await page
      .getByRole("textbox", { name: "Search records" })
      .fill("zznotfound");
    await page.getByRole("button", { name: "Clear filters" }).click();
    assert.equal(
      await page.getByRole("textbox", { name: "Search records" }).inputValue(),
      "",
    );
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  let posts = 0;
  await page.route("**/api/book/test-business", (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { name: "Sample Studio" } });
    posts++;
    assert.equal(
      route.request().postDataJSON().service,
      "Initial consultation",
    );
    return route.fulfill({
      status: posts === 1 ? 503 : 200,
      json:
        posts === 1
          ? { error: "Temporarily unavailable. Please try again." }
          : { ok: true },
    });
  });
  await page.goto(base + "/book/test-business");
  await bookingToReview(page);
  await page.getByRole("button", { name: "Send request" }).click();
  await page.getByRole("alert").waitFor();
  await page.getByRole("button", { name: "Send request" }).click();
  await page.getByRole("heading", { name: "Request received" }).waitFor();
  assert.equal(posts, 2);
  results.push({
    label: "public API error retry with retained data",
    issues: [],
  });
  await page.route("**/api/session", (route) =>
    route.fulfill({
      json: {
        user: { email: "owner@example.com" },
        business: { id: "test-business", name: "Sample Studio", role: "Owner" },
        subscription: { status: "active" },
      },
    }),
  );
  await page.route("**/api/workspace/records", (route) =>
    route.fulfill({ json: seed() }),
  );
  await page.goto(base + "/app/invoices");
  await page
    .getByRole("button", { name: "Create invoice", exact: true })
    .click();
  const signedInEditor = page.getByRole("dialog", { name: "New invoice" });
  await signedInEditor.waitFor();
  assert.match(
    await signedInEditor.locator(".inv-section-heading").innerText(),
    /Sample Studio/,
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: /^Preview INV/ })
    .first()
    .click();
  const signedInPreview = page.getByRole("dialog", { name: "Invoice preview" });
  await signedInPreview.waitFor();
  assert.equal(
    await signedInPreview.locator(".inv-doc-biz").innerText(),
    "Sample Studio",
  );
  await page.keyboard.press("Escape");
  await page.goto(base + "/app/settings");
  assert.equal(
    await page.getByLabel("Your booking link").inputValue(),
    base + "/book/test-business",
  );
  results.push({
    label: "signed-in invoice editor, preview and booking link",
    issues: [],
  });
  await page.close();
  assert.deepEqual(errors, []);
  console.log(
    `Passed ${results.length} layout/flow states, invoice calculations and booking retry.`,
  );
} finally {
  await writeFile(
    `${output}/results.json`,
    JSON.stringify({ results, errors }, null, 2),
  );
  await browser.close();
}
