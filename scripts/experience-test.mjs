import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {}),
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 980 },
  reducedMotion: "reduce",
});
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8787";
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await mkdir("test-results", { recursive: true });
try {
  await page.goto(base + "/");
  await page.locator(".premium-hero h1").waitFor();
  await page.getByRole("tab", { name: /The follow-up/ }).click();
  await page
    .getByLabel("Reply to Olivia")
    .fill("Thank you Olivia. May we confirm your preferred service date?");
  await page.getByRole("button", { name: "Approve example" }).click();
  assert.match(
    await page.locator(".draft-example-actions").innerText(),
    /Nothing was sent/,
  );
  await page.getByLabel("Reply to Olivia").fill("");
  assert.equal(
    await page.getByRole("button", { name: "Approve example" }).isDisabled(),
    true,
  );
  await page.getByLabel("Reply to Olivia").fill("A new draft");
  await page.getByRole("tab", { name: /The follow-up/ }).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await page
      .getByRole("tab", { name: /The handover/ })
      .getAttribute("aria-selected"),
    "true",
  );
  await page
    .getByRole("link", { name: "Open the client portal", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Your service, in the picture." })
    .waitFor();

  await page.goto(base + "/demo/overview");
  await page
    .getByRole("heading", { name: "A clear place to start." })
    .waitFor();
  if (process.env.CAPTURE_PRODUCT === "1") {
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: "public/workspace-preview.jpg",
      type: "jpeg",
      quality: 85,
    });
    await page.setViewportSize({ width: 390, height: 900 });
    await page.locator(".daily-focus").screenshot({
      path: "public/workspace-mobile.jpg",
      type: "jpeg",
      quality: 85,
    });
    await page.setViewportSize({ width: 1440, height: 980 });
  }
  await page
    .locator(".focus-filters")
    .getByRole("button", { name: /^Tasks/ })
    .click();
  assert.equal(await page.locator(".focus-row").count(), 2);
  const taskTitle = await page.locator(".focus-row strong").first().innerText();
  await page.locator(".focus-row").first().click();
  await page
    .getByRole("dialog")
    .getByRole("heading", { name: taskTitle, exact: true })
    .waitFor();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page
    .locator(".daily-focus")
    .getByRole("link", { name: "All tasks" })
    .click();
  await page
    .getByRole("checkbox", { name: `Complete ${taskTitle}`, exact: true })
    .check();
  await page.goto(base + "/demo/overview");
  await page
    .locator(".focus-filters")
    .getByRole("button", { name: /^Tasks/ })
    .click();
  assert.equal(await page.locator(".focus-row").count(), 1);
  assert.equal(
    await page.locator(".focus-row").filter({ hasText: taskTitle }).count(),
    0,
  );
  await page
    .locator(".focus-filters")
    .getByRole("button", { name: /^Services/ })
    .click();
  await page
    .getByText("Nothing due in this category.", { exact: true })
    .waitFor();
  await page.goto(base + "/demo/settings");
  await page.getByRole("button", { name: "Reset demo workspace" }).click();

  for (const width of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/demo/overview"]) {
      await page.goto(base + route);
      await page.locator("h1").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
        `Overflow on ${route} at ${width}`,
      );
      if (route === "/") {
        const img = page.locator(".hero-photograph img");
        await img.scrollIntoViewIfNeeded();
        assert.equal(
          await img.evaluate((el) => el.complete && el.naturalWidth > 0),
          true,
        );
        for (const label of [/The inquiry/, /The follow-up/, /The handover/]) {
          await page.getByRole("tab", { name: label }).click();
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth + 1,
            ),
            false,
          );
        }
        await page.getByRole("tab", { name: /The inquiry/ }).click();
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: `test-results/experience-${route === "/" ? "home" : "focus"}-${width}.png`,
        fullPage: true,
      });
    }
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: journey editing, approval, empty draft, keyboard tabs, portal navigation, dated focus filters, task completion persistence, sample image, 5 responsive widths, no browser errors.",
  );
} finally {
  await browser.close();
}

